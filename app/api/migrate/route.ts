import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma')
    
    // 使用Prisma的push命令来创建表结构
    // 这会根据schema.prisma文件自动创建表
    await prisma.$executeRaw`SELECT 1` // 测试连接
    
    // 尝试创建用户表
    try {
      await prisma.user.create({
        data: {
          id: 'test-migration',
          email: 'test@migration.com',
          name: 'Migration Test',
          password: 'test',
          role: 'ADMIN'
        }
      })
      
      // 删除测试用户
      await prisma.user.delete({
        where: { id: 'test-migration' }
      })
      
      return NextResponse.json({
        message: '数据库表已存在，可以正常使用',
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      // 如果表不存在，尝试使用原始SQL创建
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'TEACHER',
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
      
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS groups (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          "teacherId" TEXT NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("teacherId") REFERENCES users(id) ON DELETE CASCADE
        )
      `
      
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS students (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          height REAL,
          weight REAL,
          "heartRate" INTEGER,
          "totalScore" INTEGER DEFAULT 0,
          "groupId" TEXT NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("groupId") REFERENCES groups(id) ON DELETE CASCADE,
          UNIQUE(name, "groupId")
        )
      `
      
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS score_records (
          id TEXT PRIMARY KEY,
          "studentId" TEXT NOT NULL,
          points INTEGER NOT NULL,
          reason TEXT NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("studentId") REFERENCES students(id) ON DELETE CASCADE
        )
      `
      
      return NextResponse.json({
        message: '数据库表创建成功',
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    return NextResponse.json({
      message: '创建表失败',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
