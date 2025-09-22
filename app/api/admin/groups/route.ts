import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma')
    
    // 获取所有班级及其教师信息
    const groups = await prisma.group.findMany({
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: { students: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // 格式化数据
    const formattedGroups = groups.map(group => ({
      id: group.id,
      name: group.name,
      description: group.description,
      studentCount: group._count.students,
      createdAt: group.createdAt.toISOString(),
      teacher: {
        id: group.teacher.id,
        name: group.teacher.name,
        email: group.teacher.email
      }
    }))
    
    return NextResponse.json({ groups: formattedGroups })
  } catch (error) {
    console.error('Get all groups error:', error)
    return NextResponse.json(
      { 
        message: '获取班级列表失败', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}
