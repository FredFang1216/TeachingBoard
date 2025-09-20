import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json()
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: '未提供API密钥'
      })
    }
    
    // 分析API密钥格式
    const keyAnalysis = {
      length: apiKey.length,
      startsWith: apiKey.substring(0, 10),
      endsWith: apiKey.substring(apiKey.length - 10),
      hasSpaces: apiKey.includes(' '),
      hasNewlines: apiKey.includes('\n'),
      hasTabs: apiKey.includes('\t'),
      characterCount: {
        total: apiKey.length,
        alphanumeric: (apiKey.match(/[a-zA-Z0-9]/g) || []).length,
        special: (apiKey.match(/[^a-zA-Z0-9]/g) || []).length
      }
    }
    
    // 尝试不同的API调用方式
    const testResults = []
    
    // 测试1: 基本模型列表调用
    try {
      const response1 = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
        },
      })
      
      testResults.push({
        test: '模型列表调用',
        status: response1.status,
        success: response1.ok,
        error: response1.ok ? null : await response1.text().catch(() => '无法读取错误信息')
      })
    } catch (error) {
      testResults.push({
        test: '模型列表调用',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      })
    }
    
    // 测试2: 简单聊天调用
    try {
      const response2 = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 5
        }),
      })
      
      const response2Data = await response2.json().catch(() => ({}))
      testResults.push({
        test: '简单聊天调用',
        status: response2.status,
        success: response2.ok,
        error: response2.ok ? null : response2Data.error?.message || '未知错误'
      })
    } catch (error) {
      testResults.push({
        test: '简单聊天调用',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      })
    }
    
    // 测试3: 使用不同的模型
    try {
      const response3 = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 5
        }),
      })
      
      const response3Data = await response3.json().catch(() => ({}))
      testResults.push({
        test: 'GPT-4调用',
        status: response3.status,
        success: response3.ok,
        error: response3.ok ? null : response3Data.error?.message || '未知错误'
      })
    } catch (error) {
      testResults.push({
        test: 'GPT-4调用',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'API密钥调试完成',
      keyAnalysis,
      testResults,
      recommendations: generateRecommendations(keyAnalysis, testResults)
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        message: '调试失败', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}

function generateRecommendations(keyAnalysis: any, testResults: any[]) {
  const recommendations = []
  
  // 检查密钥格式
  if (keyAnalysis.hasSpaces || keyAnalysis.hasNewlines || keyAnalysis.hasTabs) {
    recommendations.push('⚠️ API密钥包含空格、换行符或制表符，请确保密钥是连续的字符串')
  }
  
  if (keyAnalysis.length < 50) {
    recommendations.push('⚠️ API密钥长度可能不足，请检查是否完整复制')
  }
  
  if (!keyAnalysis.startsWith.startsWith('sk-')) {
    recommendations.push('❌ API密钥格式不正确，应该以"sk-"开头')
  }
  
  // 检查测试结果
  const hasAnySuccess = testResults.some(r => r.success)
  if (!hasAnySuccess) {
    recommendations.push('❌ 所有API调用都失败，请检查：')
    recommendations.push('  1. API密钥是否正确且完整')
    recommendations.push('  2. OpenAI账户是否有足够余额')
    recommendations.push('  3. API密钥是否有正确的权限')
    recommendations.push('  4. 网络连接是否正常')
  }
  
  const modelListSuccess = testResults.find(r => r.test === '模型列表调用')?.success
  if (!modelListSuccess) {
    recommendations.push('❌ 无法获取模型列表，可能是API密钥权限问题')
  }
  
  const gpt35Success = testResults.find(r => r.test === '简单聊天调用')?.success
  const gpt4Success = testResults.find(r => r.test === 'GPT-4调用')?.success
  
  if (!gpt35Success && !gpt4Success) {
    recommendations.push('❌ 无法调用聊天模型，请检查模型权限')
  } else if (gpt35Success && !gpt4Success) {
    recommendations.push('✅ GPT-3.5-turbo可用，但GPT-4不可用（可能是权限或余额问题）')
  }
  
  return recommendations
}
