import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma')
    
    const timestamp = Date.now()
    console.log(`[${timestamp}] 开始测试跨账户同步...`)
    
    // 强制刷新连接
    await prisma.$disconnect()
    await prisma.$connect()
    console.log(`[${timestamp}] 数据库连接已刷新`)
    
    // 查询金富欣的详细信息
    const jinFuxin = await prisma.student.findFirst({
      where: { name: '金富欣' },
      select: {
        id: true,
        name: true,
        totalScore: true,
        updatedAt: true,
        groupId: true,
        group: {
          select: {
            name: true,
            teacher: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        scoreRecords: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            points: true,
            reason: true,
            createdAt: true
          }
        }
      }
    })
    
    console.log(`[${timestamp}] 金富欣详细信息:`, jinFuxin)
    
    // 查询所有学生的分数变化
    const allStudents = await prisma.student.findMany({
      select: {
        id: true,
        name: true,
        totalScore: true,
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' }
    })
    
    console.log(`[${timestamp}] 所有学生分数:`, allStudents)
    
    return NextResponse.json({
      timestamp,
      jinFuxin,
      allStudents,
      message: '跨账户同步测试完成'
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Test cross sync error:', error)
    return NextResponse.json(
      { message: '跨账户同步测试失败', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
