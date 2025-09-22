import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { studentId, points, reason } = await request.json()
    
    console.log('加分API请求:', { studentId, points, reason })

    if (!studentId || !reason) {
      return NextResponse.json(
        { message: '学生ID和备注不能为空' },
        { status: 400 }
      )
    }

    // 动态导入以避免构建时错误
    const { prisma } = await import('@/lib/prisma')

    // 先获取学生当前分数
    const studentBefore = await prisma.student.findUnique({
      where: { id: studentId },
      select: { totalScore: true, name: true }
    })
    
    console.log('加分前学生信息:', studentBefore)

    // 创建积分记录
    const scoreRecord = await prisma.scoreRecord.create({
      data: {
        studentId,
        points: parseInt(points),
        reason,
      },
    })
    
    console.log('积分记录创建成功:', scoreRecord)

    // 更新学生总积分
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        totalScore: {
          increment: parseInt(points)
        }
      },
      select: { totalScore: true, name: true }
    })
    
    console.log('学生分数更新成功:', updatedStudent)

    return NextResponse.json({
      message: '积分更新成功',
      scoreRecord,
      studentBefore,
      studentAfter: updatedStudent,
    })
  } catch (error) {
    console.error('Update score error:', error)
    return NextResponse.json(
      { message: '服务器错误', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
