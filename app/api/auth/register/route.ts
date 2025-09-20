import { NextRequest, NextResponse } from 'next/server'
import { createUser, findUserByEmail } from '@/lib/auth'

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

    // 检查用户是否已存在
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { message: '该邮箱已被注册' },
        { status: 400 }
      )
    }

    const user = await createUser(email, name, password)

    return NextResponse.json({
      message: '注册成功',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    )
  }
}
