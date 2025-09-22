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
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 先直接查询金富欣的当前状态
    const jinFuxinData = await prisma.student.findFirst({
      where: { name: '金富欣' },
      select: { id: true, name: true, totalScore: true, updatedAt: true }
    })
    console.log(`[${timestamp}] 直接查询金富欣状态:`, jinFuxinData)
    
    // 获取所有班级及其学生和教师信息，使用原始查询避免缓存
    const groups = await prisma.$queryRaw`
      SELECT 
        g.id,
        g.name,
        g."createdAt",
        g."teacherId",
        t.name as teacher_name,
        t.email as teacher_email,
        t.id as teacher_id
      FROM "Group" g
      LEFT JOIN "User" t ON g."teacherId" = t.id
      ORDER BY g."createdAt" DESC
    `
    
    console.log(`[${timestamp}] 原始查询班级数据:`, groups)
    
    // 为每个班级查询学生数据
    const groupsWithStudents = await Promise.all(
      (groups as any[]).map(async (group) => {
        const students = await prisma.$queryRaw`
          SELECT 
            s.id,
            s.name,
            s."totalScore",
            s."updatedAt",
            s."groupId"
          FROM "Student" s
          WHERE s."groupId" = ${group.id}
          ORDER BY s."totalScore" DESC
        `
        
        console.log(`[${timestamp}] 班级 ${group.name} 的学生数据:`, students)
        
        return {
          id: group.id,
          name: group.name,
          createdAt: group.createdAt,
          teacherId: group.teacherId,
          teacher: {
            id: group.teacher_id,
            name: group.teacher_name,
            email: group.teacher_email
          },
          students: students
        }
      })
    )
    
    console.log(`[${timestamp}] 处理后的班级数据:`, groupsWithStudents)
    
    console.log(`[${timestamp}] 查询完成，班级数: ${groupsWithStudents.length}`)
    
    // 格式化数据
    const formattedGroups = groupsWithStudents.map(group => ({
      id: group.id,
      name: group.name,
      description: '', // 原始查询中没有description字段
      createdAt: new Date(group.createdAt).toISOString(),
      teacher: {
        id: group.teacher.id,
        name: group.teacher.name,
        email: group.teacher.email
      },
      students: (group.students as any[]).map(student => ({
        id: student.id,
        name: student.name,
        totalScore: student.totalScore,
        height: null, // 原始查询中没有这些字段
        weight: null,
        heartRate: null,
        groupId: student.groupId,
        createdAt: new Date(student.updatedAt).toISOString()
      }))
    }))
    
    // 添加调试日志
    console.log('API返回的学生数据:', formattedGroups.map(g => ({
      groupName: g.name,
      students: g.students.map(s => ({ id: s.id, name: s.name, totalScore: s.totalScore }))
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
