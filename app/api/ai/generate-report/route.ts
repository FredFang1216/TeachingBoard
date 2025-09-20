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
      aiResponse = await callOpenAI(prompt, openaiApiKey)
    } else if (claudeApiKey) {
      aiResponse = await callClaude(prompt, claudeApiKey)
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
