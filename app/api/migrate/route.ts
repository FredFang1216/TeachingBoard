import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma')
    
    // 创建表结构（使用原始SQL）
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "name" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'TEACHER',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      )
    `
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "groups" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "teacherId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "students" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "height" REAL,
        "weight" REAL,
        "heartRate" INTEGER,
        "totalScore" INTEGER NOT NULL DEFAULT 0,
        "groupId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE,
        UNIQUE("name", "groupId")
      )
    `
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "score_records" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "studentId" TEXT NOT NULL,
        "points" INTEGER NOT NULL,
        "reason" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE
      )
    `
    
    return NextResponse.json({
      message: '数据库表创建成功',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      message: '创建表失败',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
