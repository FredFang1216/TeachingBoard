import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma')
    
    // 测试数据库连接
    await prisma.$connect()
    
    // 检查用户表是否存在数据
    const userCount = await prisma.user.count()
    
    // 如果有用户，显示第一个用户的信息
    let firstUser = null
    if (userCount > 0) {
      firstUser = await prisma.user.findFirst({
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      })
    }
    
    return NextResponse.json({
      message: '数据库连接成功',
      userCount: userCount,
      firstUser: firstUser,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      message: '数据库连接失败',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma')
    const bcrypt = require('bcryptjs')
    
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
    
    return NextResponse.json({
      message: '管理员用户创建成功',
      admin: {
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    })
  } catch (error) {
    return NextResponse.json({
      message: '创建用户失败',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
