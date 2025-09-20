export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🧪 部署测试页面</h1>
      <p>如果你能看到这个页面，说明Vercel部署成功了！</p>
      
      <h2>环境变量检查</h2>
      <ul>
        <li>DATABASE_URL: {process.env.DATABASE_URL ? '✅ 已设置' : '❌ 未设置'}</li>
        <li>NEXTAUTH_URL: {process.env.NEXTAUTH_URL || '❌ 未设置'}</li>
        <li>NEXTAUTH_SECRET: {process.env.NEXTAUTH_SECRET ? '✅ 已设置' : '❌ 未设置'}</li>
      </ul>
      
      <h2>API测试</h2>
      <button 
        onClick={async () => {
          try {
            const response = await fetch('/api/init', { method: 'POST' })
            const data = await response.json()
            alert(JSON.stringify(data, null, 2))
          } catch (error) {
            alert('API调用失败: ' + error.message)
          }
        }}
        style={{ padding: '10px 20px', margin: '10px' }}
      >
        初始化数据库
      </button>
      
      <button 
        onClick={async () => {
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
            alert(JSON.stringify(data, null, 2))
          } catch (error) {
            alert('登录测试失败: ' + error.message)
          }
        }}
        style={{ padding: '10px 20px', margin: '10px' }}
      >
        测试管理员登录
      </button>
    </div>
  )
}
