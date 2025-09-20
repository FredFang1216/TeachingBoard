import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 动态导入以避免构建时错误
    const { prisma } = await import('@/lib/prisma')

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { 
        message: '获取用户失败', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}
