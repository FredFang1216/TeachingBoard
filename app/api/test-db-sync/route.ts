import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma')
    
    const timestamp = Date.now()
    console.log(`[${timestamp}] 开始测试数据库同步...`)
    
    // 查询金富欣的当前状态
    const before = await prisma.student.findFirst({
      where: { name: '金富欣' },
      select: { id: true, name: true, totalScore: true, updatedAt: true }
    })
    
    console.log(`[${timestamp}] 查询前状态:`, before)
    
    // 执行加分操作
    const addResult = await prisma.$transaction(async (tx) => {
      // 创建积分记录
      const scoreRecord = await tx.scoreRecord.create({
        data: {
          studentId: before?.id || '',
          points: 1,
          reason: '数据库同步测试'
        }
      })
      
      // 更新学生总积分
      const updatedStudent = await tx.student.update({
        where: { id: before?.id || '' },
        data: {
          totalScore: {
            increment: 1
          }
        },
        select: { totalScore: true, name: true, updatedAt: true }
      })
      
      return { scoreRecord, updatedStudent }
    })
    
    console.log(`[${timestamp}] 加分操作完成:`, addResult)
    
    // 立即查询更新后的状态
    const after = await prisma.student.findFirst({
      where: { name: '金富欣' },
      select: { id: true, name: true, totalScore: true, updatedAt: true }
    })
    
    console.log(`[${timestamp}] 查询后状态:`, after)
    
    // 验证数据是否立即同步
    const isSynced = before && after && after.totalScore === before.totalScore + 1
    
    return NextResponse.json({
      timestamp,
      before,
      after,
      addResult,
      isSynced,
      message: isSynced ? '数据库同步正常' : '数据库同步异常'
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Test db sync error:', error)
    return NextResponse.json(
      { message: '数据库同步测试失败', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
