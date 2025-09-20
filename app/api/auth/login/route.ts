import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: '邮箱和密码不能为空' },
        { status: 400 }
      )
    }

    // 动态导入以避免构建时错误
    const { authenticateUser } = await import('@/lib/auth')
    const user = await authenticateUser(email, password)

    if (!user) {
      return NextResponse.json(
        { message: '邮箱或密码错误' },
        { status: 401 }
      )
    }

    // 这里应该设置JWT token或session
    // 为了简化，我们直接返回用户信息
    return NextResponse.json({
      message: '登录成功',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        groups: user.groups
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    )
  }
}
