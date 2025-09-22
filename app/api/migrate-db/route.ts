import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma')
    
    // 检查并添加新的学生字段
    try {
      // 添加肺活量字段
      await prisma.$executeRaw`
        ALTER TABLE students ADD COLUMN IF NOT EXISTS "vitalCapacity" REAL
      `
      
      // 添加坐位体前屈字段
      await prisma.$executeRaw`
        ALTER TABLE students ADD COLUMN IF NOT EXISTS "sitAndReach" REAL
      `
      
      // 添加50米跑字段
      await prisma.$executeRaw`
        ALTER TABLE students ADD COLUMN IF NOT EXISTS "run50m" REAL
      `
      
      // 添加跳绳字段
      await prisma.$executeRaw`
        ALTER TABLE students ADD COLUMN IF NOT EXISTS "ropeSkipping" INTEGER
      `
      
      // 添加单脚站立时间字段
      await prisma.$executeRaw`
        ALTER TABLE students ADD COLUMN IF NOT EXISTS "singleLegStand" REAL
      `
      
      console.log('数据库字段添加成功')
      
      return NextResponse.json({
        message: '数据库迁移成功',
        success: true
      })
    } catch (error) {
      console.error('数据库迁移错误:', error)
      return NextResponse.json(
        { 
          message: '数据库迁移失败', 
          error: error instanceof Error ? error.message : String(error),
          success: false
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { 
        message: '数据库连接失败', 
        error: error instanceof Error ? error.message : String(error),
        success: false
      },
      { status: 500 }
    )
  }
}
