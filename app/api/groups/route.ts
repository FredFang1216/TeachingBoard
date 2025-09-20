import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name, description, teacherId } = await request.json()

    if (!name || !teacherId) {
      return NextResponse.json(
        { message: '班级名称和教师ID不能为空' },
        { status: 400 }
      )
    }

    // 动态导入以避免构建时错误
    const { prisma } = await import('@/lib/prisma')

    const group = await prisma.group.create({
      data: {
        name,
        description,
        teacherId,
      },
      include: {
        students: {
          include: {
            scoreRecords: {
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    })

    return NextResponse.json({
      message: '班级创建成功',
      group,
    })
  } catch (error) {
    console.error('Create group error:', error)
    return NextResponse.json(
      { 
        message: '创建班级失败', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')

    if (!teacherId) {
      return NextResponse.json(
        { message: '教师ID不能为空' },
        { status: 400 }
      )
    }

    // 动态导入以避免构建时错误
    const { prisma } = await import('@/lib/prisma')

    const groups = await prisma.group.findMany({
      where: { teacherId },
      include: {
        students: {
          include: {
            scoreRecords: {
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ groups })
  } catch (error) {
    console.error('Get groups error:', error)
    return NextResponse.json(
      { 
        message: '获取班级失败', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}
