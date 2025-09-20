import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { apiKey, service } = await request.json()
    
    if (!apiKey || !service) {
      return NextResponse.json({
        success: false,
        message: '缺少API密钥或服务类型'
      })
    }
    
    let isValid = false
    let errorMessage = ''
    
    if (service === 'openai') {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          isValid = true
        } else {
          const errorData = await response.json().catch(() => ({}))
          errorMessage = errorData.error?.message || `HTTP ${response.status}`
        }
      } catch (error) {
        errorMessage = error instanceof Error ? error.message : String(error)
      }
    } else if (service === 'claude') {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 10,
            messages: [
              {
                role: 'user',
                content: 'test'
              }
            ],
          }),
        })
        
        if (response.ok) {
          isValid = true
        } else {
          const errorData = await response.json().catch(() => ({}))
          errorMessage = errorData.error?.message || `HTTP ${response.status}`
        }
      } catch (error) {
        errorMessage = error instanceof Error ? error.message : String(error)
      }
    }
    
    return NextResponse.json({
      success: isValid,
      message: isValid ? 'API密钥有效' : 'API密钥无效',
      error: errorMessage,
      service,
      keyPrefix: apiKey.substring(0, 10) + '...'
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        message: '验证失败', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}
