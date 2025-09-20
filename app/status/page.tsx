export default function StatusPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>✅ 部署成功！</h1>
      <p>如果你能看到这个页面，说明Vercel部署成功了！</p>
      
      <h2>当前时间</h2>
      <p>{new Date().toLocaleString()}</p>
      
      <h2>环境变量状态</h2>
      <ul>
        <li>DATABASE_URL: {process.env.DATABASE_URL ? '✅ 已设置' : '❌ 未设置'}</li>
        <li>NEXTAUTH_URL: {process.env.NEXTAUTH_URL || '❌ 未设置'}</li>
        <li>NEXTAUTH_SECRET: {process.env.NEXTAUTH_SECRET ? '✅ 已设置' : '❌ 未设置'}</li>
      </ul>
      
      <h2>下一步</h2>
      <p>如果环境变量都显示"✅ 已设置"，请访问：</p>
      <ul>
        <li><a href="/api/init">初始化数据库</a></li>
        <li><a href="/login">登录页面</a></li>
      </ul>
    </div>
  )
}
