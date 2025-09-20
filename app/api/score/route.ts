import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { studentId, points, reason } = await request.json()

    if (!studentId || !reason) {
      return NextResponse.json(
        { message: '学生ID和备注不能为空' },
        { status: 400 }
      )
    }

    // 动态导入以避免构建时错误
    const { prisma } = await import('@/lib/prisma')

    // 创建积分记录
    const scoreRecord = await prisma.scoreRecord.create({
      data: {
        studentId,
        points: parseInt(points),
        reason,
      },
    })

    // 更新学生总积分
    await prisma.student.update({
      where: { id: studentId },
      data: {
        totalScore: {
          increment: parseInt(points)
        }
      }
    })

    return NextResponse.json({
      message: '积分更新成功',
      scoreRecord,
    })
  } catch (error) {
    console.error('Update score error:', error)
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    )
  }
}
