import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma')
    
    // 添加时间戳和强制刷新
    const timestamp = Date.now()
    console.log(`[${timestamp}] 开始查询学生数据...`)
    
    // 强制刷新Prisma客户端连接
    await prisma.$connect()
    console.log(`[${timestamp}] Prisma客户端已连接`)
    
    // 强制断开并重新连接，确保获取最新数据
    await prisma.$disconnect()
    await prisma.$connect()
    console.log(`[${timestamp}] Prisma客户端重新连接完成`)
    
    // 等待一小段时间确保连接稳定
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // 强制刷新数据库连接池
    await prisma.$executeRaw`SELECT 1`
    console.log(`[${timestamp}] 数据库连接池已刷新`)
    
    // 先直接查询金富欣的当前状态
    const jinFuxinData = await prisma.student.findFirst({
      where: { name: '金富欣' },
      select: { id: true, name: true, totalScore: true, updatedAt: true }
    })
    console.log(`[${timestamp}] 直接查询金富欣状态:`, jinFuxinData)
    
    // 分离查询，避免 include 带来的潜在缓存与延迟
    const groups = await prisma.group.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        teacher: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const students = await prisma.student.findMany({
      select: {
        id: true,
        name: true,
        totalScore: true,
        height: true,
        weight: true,
        vitalCapacity: true,
        sitAndReach: true,
        run50m: true,
        ropeSkipping: true,
        heartRate: true,
        singleLegStand: true,
        groupId: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { totalScore: 'desc' }
    })

    const groupsWithStudents = groups.map(g => ({
      ...g,
      students: students.filter(s => s.groupId === g.id)
    }))

    console.log(`[${timestamp}] Prisma查询完成，班级数: ${groupsWithStudents.length}，学生数: ${students.length}`)
    
    // 特别检查金富欣的数据
    const jinFuxinInGroups = groupsWithStudents.flatMap(g => g.students).find((s: any) => s.name === '金富欣')
    if (jinFuxinInGroups) {
      console.log(`[${timestamp}] Prisma查询中的金富欣:`, {
        name: jinFuxinInGroups.name,
        totalScore: jinFuxinInGroups.totalScore,
        updatedAt: jinFuxinInGroups.updatedAt
      })
    } else {
      console.log(`[${timestamp}] Prisma查询中未找到金富欣`)
    }
    
    // 添加调试日志
    console.log(`[${timestamp}] 查询到的班级数: ${groupsWithStudents.length}`)
    groupsWithStudents.forEach(group => {
      console.log(`[${timestamp}] 班级 ${group.name} 有 ${group.students.length} 个学生`)
      group.students.forEach((student: any) => {
        console.log(`[${timestamp}] 学生 ${student.name} 分数: ${student.totalScore}`)
      })
    })
    
    console.log(`[${timestamp}] 查询完成，班级数: ${groups.length}`)
    
    // 格式化数据
    const formattedGroups = groupsWithStudents.map(group => ({
      id: group.id,
      name: group.name,
      description: group.description || '',
      createdAt: group.createdAt.toISOString(),
      teacher: {
        id: group.teacher.id,
        name: group.teacher.name,
        email: group.teacher.email
      },
      students: group.students.map((student: any) => ({
        id: student.id,
        name: student.name,
        totalScore: typeof student.totalScore === 'number' ? student.totalScore : Number(student.totalScore ?? 0),
        height: student.height,
        weight: student.weight,
        vitalCapacity: student.vitalCapacity,
        sitAndReach: student.sitAndReach,
        run50m: student.run50m,
        ropeSkipping: student.ropeSkipping,
        heartRate: student.heartRate,
        singleLegStand: student.singleLegStand,
        groupId: student.groupId,
        createdAt: student.createdAt.toISOString()
      }))
    }))
    
    // 特别检查金富欣在格式化数据中的状态
    const jinFuxinFormatted = formattedGroups.flatMap(g => g.students).find(s => s.name === '金富欣')
    if (jinFuxinFormatted) {
      console.log(`[${timestamp}] 格式化数据中的金富欣:`, {
        name: jinFuxinFormatted.name,
        totalScore: jinFuxinFormatted.totalScore
      })
    } else {
      console.log(`[${timestamp}] 格式化数据中未找到金富欣`)
    }
    
    // 添加调试日志
    console.log('API返回的学生数据:', formattedGroups.map(g => ({
      groupName: g.name,
      students: g.students.map((s: any) => ({ id: s.id, name: s.name, totalScore: typeof s.totalScore === 'number' ? s.totalScore : Number(s.totalScore ?? 0) }))
    })))
    
    // 特别检查金富欣的数据
    const jinFuxin = formattedGroups.flatMap(g => g.students).find(s => s.name === '金富欣')
    if (jinFuxin) {
      console.log('金富欣在API返回数据中:', jinFuxin)
    } else {
      console.log('金富欣未在API返回数据中找到')
    }
    
    return NextResponse.json({ 
      groups: formattedGroups,
      timestamp: timestamp,
      jinFuxinDirect: jinFuxinData
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Get groups with students error:', error)
    return NextResponse.json(
      { 
        message: '获取班级和学生数据失败', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}
