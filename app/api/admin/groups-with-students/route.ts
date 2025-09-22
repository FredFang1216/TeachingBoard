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
    
    // 先直接查询金富欣的当前状态
    const jinFuxinDirect = await prisma.student.findFirst({
      where: { name: '金富欣' },
      select: { id: true, name: true, totalScore: true, updatedAt: true }
    })
    console.log(`[${timestamp}] 直接查询金富欣状态:`, jinFuxinDirect)
    
    // 获取所有班级及其学生和教师信息
    const groups = await prisma.group.findMany({
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        students: {
          orderBy: { totalScore: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`[${timestamp}] 查询完成，班级数: ${groups.length}`)
    
    // 格式化数据
    const formattedGroups = groups.map(group => ({
      id: group.id,
      name: group.name,
      description: group.description,
      createdAt: group.createdAt.toISOString(),
      teacher: {
        id: group.teacher.id,
        name: group.teacher.name,
        email: group.teacher.email
      },
      students: group.students.map(student => ({
        id: student.id,
        name: student.name,
        totalScore: student.totalScore,
        height: student.height,
        weight: student.weight,
        heartRate: student.heartRate,
        groupId: student.groupId,
        createdAt: student.createdAt.toISOString()
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
      jinFuxinDirect: jinFuxinDirect
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
