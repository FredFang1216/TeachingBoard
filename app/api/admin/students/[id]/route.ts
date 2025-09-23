import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

export async function DELETE(_request: NextRequest, context: { params: { id: string } }) {
  try {
    const { prisma } = await import('@/lib/prisma')
    const studentId = context.params.id

    if (!studentId) {
      return NextResponse.json({ message: '缺少学生ID' }, { status: 400 })
    }

    // 先删除关联的积分记录，避免外键问题
    const deletedRecords = await prisma.scoreRecord.deleteMany({ where: { studentId } })
    const deletedStudent = await prisma.student.delete({ where: { id: studentId } })

    return NextResponse.json({
      message: '删除学生成功',
      deletedStudent,
      deletedScoreRecords: deletedRecords.count
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Admin delete student error:', error)
    return NextResponse.json({
      message: '删除学生失败',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { prisma } = await import('@/lib/prisma')
    const studentId = context.params.id
    const body = await request.json()

    if (!studentId) {
      return NextResponse.json({ message: '缺少学生ID' }, { status: 400 })
    }

    const data: any = {}
    if (body.name !== undefined) data.name = body.name
    if (body.groupId !== undefined) data.groupId = body.groupId
    if (body.height !== undefined) data.height = body.height === null ? null : parseFloat(body.height)
    if (body.weight !== undefined) data.weight = body.weight === null ? null : parseFloat(body.weight)
    if (body.vitalCapacity !== undefined) data.vitalCapacity = body.vitalCapacity === null ? null : parseFloat(body.vitalCapacity)
    if (body.sitAndReach !== undefined) data.sitAndReach = body.sitAndReach === null ? null : parseFloat(body.sitAndReach)
    if (body.run50m !== undefined) data.run50m = body.run50m === null ? null : parseFloat(body.run50m)
    if (body.ropeSkipping !== undefined) data.ropeSkipping = body.ropeSkipping === null ? null : parseInt(body.ropeSkipping)
    if (body.heartRate !== undefined) data.heartRate = body.heartRate === null ? null : parseInt(body.heartRate)
    if (body.singleLegStand !== undefined) data.singleLegStand = body.singleLegStand === null ? null : parseFloat(body.singleLegStand)

    const updated = await prisma.student.update({ where: { id: studentId }, data })
    return NextResponse.json({ message: '更新学生成功', student: updated }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Admin update student error:', error)
    return NextResponse.json({
      message: '更新学生失败',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}


