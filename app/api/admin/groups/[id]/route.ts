import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { prisma } = await import('@/lib/prisma')
    const groupId = params.id
    
    // 检查班级是否存在
    const group = await prisma.group.findUnique({
      where: { id: groupId }
    })
    
    if (!group) {
      return NextResponse.json(
        { message: '班级不存在' },
        { status: 404 }
      )
    }
    
    // 删除班级及其所有相关数据（级联删除）
    await prisma.group.delete({
      where: { id: groupId }
    })
    
    return NextResponse.json({
      message: '班级删除成功'
    })
  } catch (error) {
    console.error('Delete group error:', error)
    return NextResponse.json(
      { 
        message: '删除班级失败', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}
