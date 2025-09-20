import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY
    const claudeApiKey = process.env.CLAUDE_API_KEY
    
    return NextResponse.json({
      message: 'AI API测试',
      environment: {
        OPENAI_API_KEY: openaiApiKey ? '已设置' : '未设置',
        CLAUDE_API_KEY: claudeApiKey ? '已设置' : '未设置',
        hasOpenAI: !!openaiApiKey,
        hasClaude: !!claudeApiKey,
        hasAnyKey: !!(openaiApiKey || claudeApiKey)
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { 
        message: '测试失败', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { testData } = await request.json()
    
    // 检查环境变量
    const openaiApiKey = process.env.OPENAI_API_KEY
    const claudeApiKey = process.env.CLAUDE_API_KEY
    
    if (!openaiApiKey && !claudeApiKey) {
      return NextResponse.json({
        success: false,
        message: 'AI API密钥未配置',
        environment: {
          OPENAI_API_KEY: '未设置',
          CLAUDE_API_KEY: '未设置'
        }
      })
    }
    
    // 构建简单测试提示词
    const prompt = `请简单回复"测试成功"，不要包含其他内容。`
    
    let aiResponse = ''
    let usedService = ''
    
    try {
      if (openaiApiKey) {
        aiResponse = await callOpenAI(prompt, openaiApiKey)
        usedService = 'OpenAI'
      } else if (claudeApiKey) {
        aiResponse = await callClaude(prompt, claudeApiKey)
        usedService = 'Claude'
      }
      
      return NextResponse.json({
        success: true,
        message: 'AI API测试成功',
        usedService,
        response: aiResponse,
        environment: {
          OPENAI_API_KEY: openaiApiKey ? '已设置' : '未设置',
          CLAUDE_API_KEY: claudeApiKey ? '已设置' : '未设置'
        }
      })
    } catch (apiError) {
      return NextResponse.json({
        success: false,
        message: 'AI API调用失败',
        error: apiError instanceof Error ? apiError.message : String(apiError),
        usedService: openaiApiKey ? 'OpenAI' : 'Claude',
        environment: {
          OPENAI_API_KEY: openaiApiKey ? '已设置' : '未设置',
          CLAUDE_API_KEY: claudeApiKey ? '已设置' : '未设置'
        }
      })
    }
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        message: '测试失败', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
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
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 100,
      temperature: 0.1,
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
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Claude API error: ${response.status} - ${errorData.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return data.content[0].text
}
