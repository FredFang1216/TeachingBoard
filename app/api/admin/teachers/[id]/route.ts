import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { prisma } = await import('@/lib/prisma')
    const teacherId = params.id
    
    // 检查教师是否存在
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId, role: 'TEACHER' }
    })
    
    if (!teacher) {
      return NextResponse.json(
        { message: '教师不存在' },
        { status: 404 }
      )
    }
    
    // 删除教师及其所有相关数据（级联删除）
    await prisma.user.delete({
      where: { id: teacherId }
    })
    
    return NextResponse.json({
      message: '教师账户删除成功'
    })
  } catch (error) {
    console.error('Delete teacher error:', error)
    return NextResponse.json(
      { 
        message: '删除教师账户失败', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}
