import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { name, height, weight, heartRate, groupId } = await request.json()

    if (!name || !groupId) {
      return NextResponse.json(
        { message: '姓名和班级ID不能为空' },
        { status: 400 }
      )
    }

    const student = await prisma.student.create({
      data: {
        name,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        heartRate: heartRate ? parseInt(heartRate) : null,
        groupId,
      },
    })

    return NextResponse.json({
      message: '学生添加成功',
      student,
    })
  } catch (error) {
    console.error('Add student error:', error)
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')

    if (!groupId) {
      return NextResponse.json(
        { message: '班级ID不能为空' },
        { status: 400 }
      )
    }

    const students = await prisma.student.findMany({
      where: { groupId },
      include: {
        scoreRecords: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { totalScore: 'desc' }
    })

    return NextResponse.json({ students })
  } catch (error) {
    console.error('Get students error:', error)
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    )
  }
}
