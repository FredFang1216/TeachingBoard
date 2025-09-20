import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json()
    
    // 检查环境变量
    const openaiApiKey = process.env.OPENAI_API_KEY
    const claudeApiKey = process.env.CLAUDE_API_KEY
    
    if (!openaiApiKey && !claudeApiKey) {
      return NextResponse.json(
        { message: 'AI API密钥未配置' },
        { status: 500 }
      )
    }
    
    // 构建提示词
    const prompt = buildPrompt(data)
    
    let aiResponse = ''
    
    // 优先使用OpenAI，如果没有则使用Claude
    if (openaiApiKey) {
      try {
        aiResponse = await callOpenAI(prompt, openaiApiKey)
      } catch (openaiError) {
        console.error('OpenAI API failed, trying Claude:', openaiError)
        if (claudeApiKey) {
          try {
            aiResponse = await callClaude(prompt, claudeApiKey)
          } catch (claudeError) {
            console.error('Claude API also failed, using fallback:', claudeError)
            // 使用备用模板生成
            aiResponse = generateTemplateReport(data)
          }
        } else {
          // 使用备用模板生成
          aiResponse = generateTemplateReport(data)
        }
      }
    } else if (claudeApiKey) {
      try {
        aiResponse = await callClaude(prompt, claudeApiKey)
      } catch (claudeError) {
        console.error('Claude API failed, using fallback:', claudeError)
        // 使用备用模板生成
        aiResponse = generateTemplateReport(data)
      }
    } else {
      // 使用备用模板生成
      aiResponse = generateTemplateReport(data)
    }
    
    return NextResponse.json({ report: aiResponse })
  } catch (error) {
    console.error('AI API error:', error)
    return NextResponse.json(
      { message: 'AI报告生成失败', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

function buildPrompt(data: any) {
  const { className, studentCount, students } = data
  
  return `你是一位专业的教学分析师，请为"${className}"班级生成一份详细的分析报告。

班级数据：
- 班级名称：${className}
- 学生总数：${studentCount}人
- 学生详细信息：
${students.map((s: any, index: number) => 
  `${index + 1}. ${s.name} - 积分：${s.totalScore}分${s.height ? `，身高：${s.height}cm` : ''}${s.weight ? `，体重：${s.weight}kg` : ''}${s.heartRate ? `，心率：${s.heartRate}bpm` : ''}`
).join('\n')}

请生成一份专业的Markdown格式分析报告，包含以下部分：

1. **班级整体表现概览** - 包含总人数、平均分、最高分、最低分等统计信息
2. **学生表现等级分布** - 按积分区间分类（优秀、良好、一般、待提升）
3. **身体指标分析** - 身高、体重、心率的统计分析
4. **重点关注学生** - 表现较差需要关注的学生
5. **教学建议与改进措施** - 基于数据分析的具体建议
6. **下阶段目标设定** - 可量化的改进目标

要求：
- 使用Markdown格式
- 语言专业但易懂
- 数据准确，分析深入
- 建议具体可操作
- 体现教育专业性
- 包含emoji图标使报告更生动

请直接返回报告内容，不要包含其他说明文字。`
}

async function callOpenAI(prompt: string, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一位专业的教学分析师，擅长生成详细的教育数据分析报告。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function callClaude(prompt: string, apiKey: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.content[0].text
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
