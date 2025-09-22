'use client'

import { useState } from 'react'

export default function TestLoginPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testDatabaseConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/migrate-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()
      setTestResult({ type: 'database', data })
    } catch (error) {
      setTestResult({ 
        type: 'database', 
        error: error instanceof Error ? error.message : String(error) 
      })
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'admin123'
        })
      })
      const data = await response.json()
      setTestResult({ type: 'login', data, status: response.status })
    } catch (error) {
      setTestResult({ 
        type: 'login', 
        error: error instanceof Error ? error.message : String(error) 
      })
    } finally {
      setLoading(false)
    }
  }

  const testInitDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()
      setTestResult({ type: 'init', data, status: response.status })
    } catch (error) {
      setTestResult({ 
        type: 'init', 
        error: error instanceof Error ? error.message : String(error) 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>登录问题诊断页面</h1>
      <p>这个页面用于诊断登录时的服务器错误。</p>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testDatabaseConnection}
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
          {loading ? '测试中...' : '测试数据库连接和迁移'}
        </button>

        <button 
          onClick={testInitDatabase}
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
          {loading ? '测试中...' : '初始化数据库'}
        </button>

        <button 
          onClick={testLogin}
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
          {loading ? '测试中...' : '测试登录'}
        </button>
      </div>

      {testResult && (
        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6',
          borderRadius: '5px'
        }}>
          <h3>测试结果 ({testResult.type})</h3>
          <pre style={{ 
            backgroundColor: '#fff', 
            padding: '15px', 
            borderRadius: '5px',
            overflow: 'auto',
            whiteSpace: 'pre-wrap'
          }}>
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
