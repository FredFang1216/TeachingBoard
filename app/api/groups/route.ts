import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { name, description, teacherId } = await request.json()

    if (!name || !teacherId) {
      return NextResponse.json(
        { message: '班级名称和教师ID不能为空' },
        { status: 400 }
      )
    }

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
      { message: '服务器错误' },
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
      { message: '服务器错误' },
      { status: 500 }
    )
  }
}
