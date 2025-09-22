import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    
    if (!studentId) {
      return NextResponse.json(
        { message: '学生ID不能为空' },
        { status: 400 }
      )
    }

    const { prisma } = await import('@/lib/prisma')
    
    // 获取学生当前信息
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { 
        id: true, 
        name: true, 
        totalScore: true,
        groupId: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    if (!student) {
      return NextResponse.json(
        { message: '学生不存在' },
        { status: 404 }
      )
    }
    
    // 获取该学生的所有积分记录
    const scoreRecords = await prisma.scoreRecord.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      take: 10 // 最近10条记录
    })
    
    // 计算积分记录的总和
    const calculatedTotal = scoreRecords.reduce((sum, record) => sum + record.points, 0)
    
    return NextResponse.json({
      student,
      scoreRecords,
      calculatedTotal,
      isConsistent: student.totalScore === calculatedTotal,
      difference: student.totalScore - calculatedTotal
    })
  } catch (error) {
    console.error('Verify score error:', error)
    return NextResponse.json(
      { 
        message: '验证失败', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}
