export default function DebugPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔍 调试页面</h1>
      <p>这个页面用于调试Vercel部署问题</p>
      
      <h2>环境变量状态</h2>
      <div style={{ background: '#f5f5f5', padding: '10px', margin: '10px 0' }}>
        <p><strong>DATABASE_URL:</strong> {process.env.DATABASE_URL ? '✅ 已设置' : '❌ 未设置'}</p>
        <p><strong>NEXTAUTH_URL:</strong> {process.env.NEXTAUTH_URL || '❌ 未设置'}</p>
        <p><strong>NEXTAUTH_SECRET:</strong> {process.env.NEXTAUTH_SECRET ? '✅ 已设置' : '❌ 未设置'}</p>
      </div>
      
      <h2>API测试链接</h2>
      <ul>
        <li><a href="/api/init" target="_blank">初始化数据库</a></li>
        <li><a href="/api/auth/login" target="_blank">登录API</a></li>
        <li><a href="/login" target="_blank">登录页面</a></li>
      </ul>
      
      <h2>手动测试步骤</h2>
      <ol>
        <li>点击"初始化数据库"链接</li>
        <li>如果成功，会看到JSON响应</li>
        <li>然后访问登录页面测试登录</li>
      </ol>
      
      <h2>常见问题</h2>
      <ul>
        <li><strong>数据库连接错误:</strong> 检查DATABASE_URL格式</li>
        <li><strong>环境变量未设置:</strong> 在Vercel中设置环境变量</li>
        <li><strong>构建失败:</strong> 检查Vercel部署日志</li>
      </ul>
    </div>
  )
}
