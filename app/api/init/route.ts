import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // 动态导入以避免构建时错误
    const { prisma } = await import('@/lib/prisma')
    const bcrypt = require('bcryptjs')

    // 检查是否已有数据
    const existingUsers = await prisma.user.count()
    
    if (existingUsers > 0) {
      return NextResponse.json({
        message: '数据库已初始化',
        users: existingUsers
      })
    }

    // 创建管理员用户
    const adminPassword = await bcrypt.hash('admin123', 12)
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: '管理员',
        password: adminPassword,
        role: 'ADMIN',
      },
    })

    // 创建教师用户
    const teacherPassword = await bcrypt.hash('teacher123', 12)
    const teacher = await prisma.user.create({
      data: {
        email: 'teacher@example.com',
        name: '张老师',
        password: teacherPassword,
        role: 'TEACHER',
      },
    })

    // 创建示例班级
    const group = await prisma.group.create({
      data: {
        id: 'demo-group-1',
        name: '三年级一班',
        description: '这是一个示例班级',
        teacherId: teacher.id,
      },
    })

    // 创建示例学生
    const students = [
      {
        name: '小明',
        height: 120,
        weight: 25,
        heartRate: 80,
        totalScore: 150,
      },
      {
        name: '小红',
        height: 118,
        weight: 23,
        heartRate: 85,
        totalScore: 200,
      },
      {
        name: '小刚',
        height: 125,
        weight: 28,
        heartRate: 75,
        totalScore: 120,
      },
      {
        name: '小丽',
        height: 115,
        weight: 22,
        heartRate: 90,
        totalScore: 180,
      },
      {
        name: '小强',
        height: 130,
        weight: 30,
        heartRate: 70,
        totalScore: 95,
      },
    ]

    for (const studentData of students) {
      await prisma.student.create({
        data: {
          ...studentData,
          groupId: group.id,
        },
      })
    }

    return NextResponse.json({
      message: '数据库初始化成功',
      admin: {
        email: admin.email,
        password: 'admin123'
      },
      teacher: {
        email: teacher.email,
        password: 'teacher123'
      }
    })
  } catch (error) {
    console.error('Init database error:', error)
    return NextResponse.json(
      { 
        message: '数据库初始化失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
