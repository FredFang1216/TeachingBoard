export default function SimpleTestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🧪 简单测试页面</h1>
      <p>如果你能看到这个页面，说明Vercel部署成功了！</p>
      
      <h2>环境变量检查</h2>
      <ul>
        <li>DATABASE_URL: {process.env.DATABASE_URL ? '✅ 已设置' : '❌ 未设置'}</li>
        <li>NEXTAUTH_URL: {process.env.NEXTAUTH_URL || '❌ 未设置'}</li>
        <li>NEXTAUTH_SECRET: {process.env.NEXTAUTH_SECRET ? '✅ 已设置' : '❌ 未设置'}</li>
      </ul>
      
      <h2>下一步</h2>
      <p>请访问 <a href="/api/init">/api/init</a> 来初始化数据库</p>
      <p>然后访问 <a href="/login">/login</a> 来测试登录功能</p>
    </div>
  )
}
