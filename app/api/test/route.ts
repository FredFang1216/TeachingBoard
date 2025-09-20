import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      message: 'API工作正常',
      timestamp: new Date().toISOString(),
      environment: {
        DATABASE_URL: process.env.DATABASE_URL ? '已设置' : '未设置',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || '未设置',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '已设置' : '未设置'
      }
    })
  } catch (error) {
    return NextResponse.json({
      message: 'API错误',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // 测试数据库连接
    const { prisma } = await import('@/lib/prisma')
    
    // 简单的数据库查询测试
    const result = await prisma.$queryRaw`SELECT 1 as test`
    
    return NextResponse.json({
      message: '数据库连接成功',
      result: result,
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
