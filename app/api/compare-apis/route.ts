import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

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
    const directQueryAll = await prisma.student.findMany({
      where: { name: '金富欣' },
      select: { id: true, name: true, totalScore: true, updatedAt: true, groupId: true }
    })
    
    console.log(`[${timestamp}] 直接查询结果(所有同名):`, directQueryAll)
    
    // 2. 通过groups-with-students API查询
    const groupsResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/groups-with-students?t=${timestamp}&force=${Math.random()}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
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
    let groupsApiJinFuxinList: any[] = []
    console.log(`[${timestamp}] Groups API数据结构:`, {
      hasGroups: !!groupsApiData?.groups,
      groupsLength: groupsApiData?.groups?.length || 0,
      groupsData: groupsApiData?.groups?.map((g: any) => ({
        name: g.name,
        studentsCount: g.students?.length || 0,
        students: g.students?.map((s: any) => ({ name: s.name, totalScore: s.totalScore })) || []
      }))
    })
    
    if (groupsApiData?.groups) {
      for (const group of groupsApiData.groups) {
        console.log(`[${timestamp}] 检查班级 ${group.name}，学生数: ${group.students?.length || 0}`)
        const matched = (group.students || []).filter((s: any) => s.name === '金富欣')
        if (matched.length) {
          console.log(`[${timestamp}] 在班级 ${group.name} 中找到金富欣(共${matched.length}条):`, matched)
          groupsApiJinFuxinList.push(...matched.map((m: any) => ({ ...m, groupName: group.name, groupId: group.id })))
        }
      }
    }
    
    console.log(`[${timestamp}] Groups API中的金富欣(全部):`, groupsApiJinFuxinList)
    
    // 4. 对比数据
    // 优先按ID对比，否则按最高updatedAt条目对比
    let finalConsistency = false
    let chosenDirect: any = null
    let chosenApi: any = null
    if (directQueryAll.length && groupsApiJinFuxinList.length) {
      // 尝试按ID匹配
      for (const d of directQueryAll) {
        const apiMatch = groupsApiJinFuxinList.find(a => a.id === d.id)
        if (apiMatch) { chosenDirect = d; chosenApi = apiMatch; break }
      }
      // 如果没有按ID匹配，选择最近更新时间的记录对比
      if (!chosenDirect) {
        chosenDirect = directQueryAll.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))[0]
        chosenApi = groupsApiJinFuxinList.sort((a, b) => +new Date(b.updatedAt || 0) - +new Date(a.updatedAt || 0))[0]
      }
      finalConsistency = chosenDirect && chosenApi && chosenDirect.totalScore === chosenApi.totalScore
    }
    
    return NextResponse.json({
      timestamp,
      directQueryAll,
      groupsApiJinFuxinList,
      chosenDirect,
      chosenApi,
      isDataConsistent: finalConsistency,
      groupsApiTimestamp: groupsApiData?.timestamp,
      timeDiff: groupsApiData?.timestamp ? timestamp - groupsApiData.timestamp : null,
      message: finalConsistency ? 'API数据一致' : 'API数据不一致'
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
