import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json()
    
    // 如果AI API失败，使用模板生成报告
    const report = generateTemplateReport(data)
    
    return NextResponse.json({ 
      report,
      source: 'template',
      message: '使用模板生成报告（AI API不可用）'
    })
  } catch (error) {
    return NextResponse.json(
      { 
        message: '报告生成失败', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}

function generateTemplateReport(data: any) {
  const { className, studentCount, students } = data
  
  // 计算统计数据
  const totalScore = students.reduce((sum: number, s: any) => sum + s.score, 0)
  const averageScore = Math.round(totalScore / studentCount)
  const maxScore = Math.max(...students.map((s: any) => s.score))
  const minScore = Math.min(...students.map((s: any) => s.score))
  
  // 计算表现等级分布
  const excellent = students.filter((s: any) => s.score >= 180).length
  const good = students.filter((s: any) => s.score >= 120 && s.score < 180).length
  const average = students.filter((s: any) => s.score >= 80 && s.score < 120).length
  const needsImprovement = students.filter((s: any) => s.score < 80).length
  
  // 计算身体指标统计
  const heights = students.filter((s: any) => s.height).map((s: any) => s.height)
  const weights = students.filter((s: any) => s.weight).map((s: any) => s.weight)
  const heartRates = students.filter((s: any) => s.heartRate).map((s: any) => s.heartRate)
  
  const avgHeight = heights.length > 0 ? Math.round(heights.reduce((sum: number, h: number) => sum + h, 0) / heights.length) : 0
  const avgWeight = weights.length > 0 ? Math.round(weights.reduce((sum: number, w: number) => sum + w, 0) / weights.length) : 0
  const avgHeartRate = heartRates.length > 0 ? Math.round(heartRates.reduce((sum: number, h: number) => sum + h, 0) / heartRates.length) : 0
  
  return `# ${className} 班级分析报告

## 📊 整体表现概览
- **班级总人数**: ${studentCount}人
- **平均积分**: ${averageScore}分
- **最高积分**: ${maxScore}分
- **最低积分**: ${minScore}分
- **积分范围**: ${maxScore - minScore}分

## 🏆 表现等级分布
- **优秀 (180分以上)**: ${excellent}人 (${Math.round(excellent/studentCount*100)}%)
- **良好 (120-179分)**: ${good}人 (${Math.round(good/studentCount*100)}%)
- **一般 (80-119分)**: ${average}人 (${Math.round(average/studentCount*100)}%)
- **待提升 (80分以下)**: ${needsImprovement}人 (${Math.round(needsImprovement/studentCount*100)}%)

## 📏 身体指标统计
- **平均身高**: ${avgHeight}cm
- **平均体重**: ${avgWeight}kg
- **平均心率**: ${avgHeartRate}bpm

## 🎯 重点关注学生
${students.filter((s: any) => s.score < 100).map((s: any) => `- **${s.name}**: ${s.score}分 (需要更多鼓励和支持)`).join('\n') || '- 所有学生表现良好！'}

## 💡 建议与改进
${needsImprovement > 0 ? 
  `- 建议为表现较差的学生提供额外的学习支持和鼓励
- 可以设置小组学习，让优秀学生帮助需要提升的学生
- 定期进行一对一沟通，了解学生困难` :
  `- 班级整体表现优秀，继续保持！
- 可以设置更高难度的挑战来激励学生
- 鼓励学生之间互相学习，共同进步`}

## 📈 下阶段目标
- 提高班级平均分至 ${averageScore + 20} 分
- 减少待提升学生数量至 ${Math.max(0, needsImprovement - 1)} 人
- 保持优秀学生比例在 ${Math.round(excellent/studentCount*100)}% 以上

## 🔧 技术说明
*此报告由系统模板生成，AI API暂时不可用。如需AI分析，请检查API配置。*

---
*报告生成时间: ${new Date().toLocaleString('zh-CN')}*
*数据来源: 教学管理系统*`
}
