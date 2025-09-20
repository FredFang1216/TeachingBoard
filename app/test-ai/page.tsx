'use client'

import { useState } from 'react'

export default function TestAIPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testEnvironment = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/test')
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({
        error: '测试失败: ' + (error instanceof Error ? error.message : String(error))
      })
    } finally {
      setLoading(false)
    }
  }

  const testAICall = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testData: 'test' })
      })
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({
        error: 'AI调用测试失败: ' + (error instanceof Error ? error.message : String(error))
      })
    } finally {
      setLoading(false)
    }
  }

  const testFullReport = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            className: '测试班级',
            studentCount: 3,
            students: [
              { name: '小明', score: 150, height: 120, weight: 25, heartRate: 80 },
              { name: '小红', score: 200, height: 118, weight: 23, heartRate: 85 },
              { name: '小刚', score: 120, height: 125, weight: 28, heartRate: 75 }
            ]
          }
        })
      })
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({
        error: '完整报告测试失败: ' + (error instanceof Error ? error.message : String(error))
      })
    } finally {
      setLoading(false)
    }
  }

  const validateApiKey = async () => {
    const apiKey = prompt('请输入你的OpenAI API密钥进行验证:')
    if (!apiKey) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/ai/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey,
          service: 'openai'
        })
      })
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({
        error: 'API密钥验证失败: ' + (error instanceof Error ? error.message : String(error))
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🤖 AI API 测试页面</h1>
      <p>这个页面用于测试AI API的配置和连接。</p>
      
      <div style={{ margin: '20px 0' }}>
        <button 
          onClick={testEnvironment}
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            margin: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '测试中...' : '测试环境变量'}
        </button>
        
        <button 
          onClick={testAICall}
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            margin: '10px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '测试中...' : '测试AI调用'}
        </button>
        
        <button 
          onClick={testFullReport}
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            margin: '10px',
            backgroundColor: '#ffc107',
            color: 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '测试中...' : '测试完整报告'}
        </button>
        
        <button 
          onClick={validateApiKey}
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            margin: '10px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '验证中...' : '验证API密钥'}
        </button>
      </div>
      
      {testResult && (
        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '5px',
          border: '1px solid #dee2e6'
        }}>
          <h3>测试结果：</h3>
          <pre style={{ 
            backgroundColor: '#fff',
            padding: '15px',
            borderRadius: '5px',
            border: '1px solid #ddd',
            overflow: 'auto',
            whiteSpace: 'pre-wrap'
          }}>
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
      
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
        <h3>🔧 故障排除指南：</h3>
        <ol>
          <li><strong>环境变量检查</strong> - 点击"测试环境变量"查看API密钥是否设置</li>
          <li><strong>API连接测试</strong> - 点击"测试AI调用"验证API是否可用</li>
          <li><strong>完整功能测试</strong> - 点击"测试完整报告"测试报告生成</li>
        </ol>
        
        <h4>常见问题：</h4>
        <ul>
          <li>如果显示"AI API密钥未配置"，需要在Vercel中设置环境变量</li>
          <li>如果显示"API调用失败"，检查API密钥是否正确且有额度</li>
          <li>如果显示网络错误，检查网络连接</li>
        </ul>
      </div>
    </div>
  )
}
