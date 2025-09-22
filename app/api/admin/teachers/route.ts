import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma')
    
    // 获取所有教师及其班级信息
    const teachers = await prisma.user.findMany({
      where: { role: 'TEACHER' },
      include: {
        groups: {
          include: {
            _count: {
              select: { students: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // 格式化数据
    const formattedTeachers = teachers.map(teacher => ({
      id: teacher.id,
      email: teacher.email,
      name: teacher.name,
      role: teacher.role,
      createdAt: teacher.createdAt.toISOString(),
      groups: teacher.groups.map(group => ({
        id: group.id,
        name: group.name,
        description: group.description,
        studentCount: group._count.students,
        createdAt: group.createdAt.toISOString()
      }))
    }))
    
    return NextResponse.json({ teachers: formattedTeachers })
  } catch (error) {
    console.error('Get teachers error:', error)
    return NextResponse.json(
      { 
        message: '获取教师列表失败', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json()
    
    if (!email || !name || !password) {
      return NextResponse.json(
        { message: '所有字段都不能为空' },
        { status: 400 }
      )
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { message: '密码长度至少6位' },
        { status: 400 }
      )
    }
    
    const { prisma } = await import('@/lib/prisma')
    const { hashPassword } = await import('@/lib/auth')
    
    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { message: '该邮箱已被注册' },
        { status: 400 }
      )
    }
    
    // 创建教师账户
    const hashedPassword = await hashPassword(password)
    const teacher = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'TEACHER'
      }
    })
    
    return NextResponse.json({
      message: '教师账户创建成功',
      teacher: {
        id: teacher.id,
        email: teacher.email,
        name: teacher.name,
        role: teacher.role
      }
    })
  } catch (error) {
    console.error('Create teacher error:', error)
    return NextResponse.json(
      { 
        message: '创建教师账户失败', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}
