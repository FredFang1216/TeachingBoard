import { NextRequest, NextResponse } from 'next/server'

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
    
    // 使用原始SQL查询绕过Prisma缓存，确保获取最新数据
    const groupsRaw = await prisma.$queryRaw`
      SELECT 
        g.id as group_id,
        g.name as group_name,
        g.description as group_description,
        g."createdAt" as group_created_at,
        u.id as teacher_id,
        u.name as teacher_name,
        u.email as teacher_email,
        s.id as student_id,
        s.name as student_name,
        s."totalScore" as student_total_score,
        s.height as student_height,
        s.weight as student_weight,
        s."vitalCapacity" as student_vital_capacity,
        s."sitAndReach" as student_sit_and_reach,
        s."run50m" as student_run_50m,
        s."ropeSkipping" as student_rope_skipping,
        s."heartRate" as student_heart_rate,
        s."singleLegStand" as student_single_leg_stand,
        s."groupId" as student_group_id,
        s."createdAt" as student_created_at,
        s."updatedAt" as student_updated_at
      FROM "Group" g
      LEFT JOIN "User" u ON g."teacherId" = u.id
      LEFT JOIN "Student" s ON g.id = s."groupId"
      ORDER BY g."createdAt" DESC, s."totalScore" DESC
    ` as any[]
    
    console.log(`[${timestamp}] 原始SQL查询完成，记录数: ${groupsRaw.length}`)
    
    // 将原始SQL结果转换为结构化数据
    const groupsMap = new Map()
    
    for (const row of groupsRaw) {
      const groupId = row.group_id
      
      if (!groupsMap.has(groupId)) {
        groupsMap.set(groupId, {
          id: groupId,
          name: row.group_name,
          description: row.group_description || '',
          createdAt: new Date(row.group_created_at),
          teacher: {
            id: row.teacher_id,
            name: row.teacher_name,
            email: row.teacher_email
          },
          students: []
        })
      }
      
      if (row.student_id) {
        groupsMap.get(groupId).students.push({
          id: row.student_id,
          name: row.student_name,
          totalScore: Number(row.student_total_score) || 0,
          height: row.student_height,
          weight: row.student_weight,
          vitalCapacity: row.student_vital_capacity,
          sitAndReach: row.student_sit_and_reach,
          run50m: row.student_run_50m,
          ropeSkipping: row.student_rope_skipping,
          heartRate: row.student_heart_rate,
          singleLegStand: row.student_single_leg_stand,
          groupId: row.student_group_id,
          createdAt: new Date(row.student_created_at),
          updatedAt: new Date(row.student_updated_at)
        })
      }
    }
    
    const groups = Array.from(groupsMap.values())
    
    // 特别检查金富欣的数据
    const jinFuxinInGroups = groups.flatMap(g => g.students).find(s => s.name === '金富欣')
    if (jinFuxinInGroups) {
      console.log(`[${timestamp}] 原始SQL查询中的金富欣:`, {
        name: jinFuxinInGroups.name,
        totalScore: jinFuxinInGroups.totalScore,
        updatedAt: jinFuxinInGroups.updatedAt
      })
    } else {
      console.log(`[${timestamp}] 原始SQL查询中未找到金富欣`)
    }
    
    // 添加调试日志
    console.log(`[${timestamp}] 查询到的班级数: ${groups.length}`)
    groups.forEach(group => {
      console.log(`[${timestamp}] 班级 ${group.name} 有 ${group.students.length} 个学生`)
      group.students.forEach((student: any) => {
        console.log(`[${timestamp}] 学生 ${student.name} 分数: ${student.totalScore}`)
      })
    })
    
    console.log(`[${timestamp}] 查询完成，班级数: ${groups.length}`)
    
    // 格式化数据
    const formattedGroups = groups.map(group => ({
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
        totalScore: student.totalScore,
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
      students: g.students.map((s: any) => ({ id: s.id, name: s.name, totalScore: s.totalScore }))
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
