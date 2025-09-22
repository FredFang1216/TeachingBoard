import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma')
    
    const timestamp = Date.now()
    console.log(`[${timestamp}] 开始对比API数据...`)
    
    // 强制刷新连接
    await prisma.$disconnect()
    await prisma.$connect()
    console.log(`[${timestamp}] 数据库连接已刷新`)
    
    // 等待连接稳定
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // 1. 直接查询数据库
    const directQuery = await prisma.student.findFirst({
      where: { name: '金富欣' },
      select: {
        id: true,
        name: true,
        totalScore: true,
        updatedAt: true
      }
    })
    
    console.log(`[${timestamp}] 直接查询结果:`, directQuery)
    
    // 2. 通过groups-with-students API查询
    const groupsResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/groups-with-students?t=${timestamp}&force=${Math.random()}`, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
    
    let groupsApiData = null
    if (groupsResponse.ok) {
      groupsApiData = await groupsResponse.json()
      console.log(`[${timestamp}] Groups API响应:`, groupsApiData)
    } else {
      console.error(`[${timestamp}] Groups API失败:`, groupsResponse.status)
    }
    
    // 3. 从groups API中提取金富欣数据
    let groupsApiJinFuxin = null
    if (groupsApiData?.groups) {
      for (const group of groupsApiData.groups) {
        const student = group.students?.find((s: any) => s.name === '金富欣')
        if (student) {
          groupsApiJinFuxin = student
          break
        }
      }
    }
    
    console.log(`[${timestamp}] Groups API中的金富欣:`, groupsApiJinFuxin)
    
    // 4. 对比数据
    const isDataConsistent = directQuery && groupsApiJinFuxin && 
      directQuery.totalScore === groupsApiJinFuxin.totalScore
    
    return NextResponse.json({
      timestamp,
      directQuery,
      groupsApiJinFuxin,
      isDataConsistent,
      groupsApiTimestamp: groupsApiData?.timestamp,
      timeDiff: groupsApiData?.timestamp ? timestamp - groupsApiData.timestamp : null,
      message: isDataConsistent ? 'API数据一致' : 'API数据不一致'
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Compare APIs error:', error)
    return NextResponse.json(
      { message: 'API对比失败', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
