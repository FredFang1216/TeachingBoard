import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json()
    
    // 分析传入的数据
    const analysis: any = {
      receivedData: data,
      studentCount: data?.studentCount || 0,
      students: data?.students || [],
      studentScores: data?.students?.map((s: any) => ({
        name: s.name,
        score: s.score,
        hasScore: s.score !== undefined && s.score !== null,
        scoreType: typeof s.score
      })) || [],
      dataIntegrity: {
        hasClassName: !!data?.className,
        hasStudentCount: !!data?.studentCount,
        hasStudents: !!data?.students,
        studentsLength: data?.students?.length || 0,
        allStudentsHaveScores: data?.students?.every((s: any) => s.score !== undefined && s.score !== null) || false
      }
    }
    
    // 计算统计数据
    if (data?.students && data.students.length > 0) {
      const scores = data.students.map((s: any) => s.score).filter((score: any) => score !== undefined && score !== null)
      analysis.statistics = {
        totalScore: scores.reduce((sum: number, score: number) => sum + score, 0),
        averageScore: scores.length > 0 ? Math.round(scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length) : 0,
        maxScore: scores.length > 0 ? Math.max(...scores) : 0,
        minScore: scores.length > 0 ? Math.min(...scores) : 0,
        validScores: scores.length,
        invalidScores: data.students.length - scores.length
      }
    }
    
    return NextResponse.json({
      success: true,
      message: '数据传递测试完成',
      analysis,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        message: '数据测试失败', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}
