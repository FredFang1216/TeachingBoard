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
    
    // 直接查询学生数据
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { 
        id: true, 
        name: true, 
        totalScore: true,
        groupId: true,
        updatedAt: true
      }
    })
    
    if (!student) {
      return NextResponse.json(
        { message: '学生不存在' },
        { status: 404 }
      )
    }
    
    // 查询该学生的积分记录
    const scoreRecords = await prisma.scoreRecord.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
    
    return NextResponse.json({
      student,
      recentScoreRecords: scoreRecords,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Test student error:', error)
    return NextResponse.json(
      { 
        message: '查询失败', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}
