import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma')
    
    const timestamp = Date.now()
    console.log(`[${timestamp}] 开始测试数据同步...`)
    
    // 强制刷新连接
    await prisma.$disconnect()
    await prisma.$connect()
    console.log(`[${timestamp}] 数据库连接已刷新`)
    
    // 查询所有学生的分数
    const students = await prisma.student.findMany({
      select: {
        id: true,
        name: true,
        totalScore: true,
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' }
    })
    
    console.log(`[${timestamp}] 查询到 ${students.length} 个学生`)
    
    // 特别查询金富欣
    const jinFuxin = students.find(s => s.name === '金富欣')
    if (jinFuxin) {
      console.log(`[${timestamp}] 金富欣当前分数: ${jinFuxin.totalScore}, 更新时间: ${jinFuxin.updatedAt}`)
    }
    
    return NextResponse.json({
      timestamp,
      students: students.map(s => ({
        id: s.id,
        name: s.name,
        totalScore: s.totalScore,
        updatedAt: s.updatedAt
      })),
      jinFuxin: jinFuxin || null
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Test sync error:', error)
    return NextResponse.json(
      { message: '测试同步失败', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
