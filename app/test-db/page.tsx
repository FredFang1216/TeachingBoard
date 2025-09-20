'use client'

export default function TestDbPage() {
  const testConnection = async () => {
    try {
      const response = await fetch('/api/db-test')
      const data = await response.json()
      alert(JSON.stringify(data, null, 2))
    } catch (error) {
      alert('连接失败: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  const testInit = async () => {
    try {
      const response = await fetch('/api/init', { method: 'POST' })
      const data = await response.json()
      alert(JSON.stringify(data, null, 2))
    } catch (error) {
      alert('初始化失败: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  const testMigrate = async () => {
    try {
      const response = await fetch('/api/migrate', { method: 'POST' })
      const data = await response.json()
      alert(JSON.stringify(data, null, 2))
    } catch (error) {
      alert('迁移失败: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔧 数据库测试页面</h1>
      <p>这个页面用于测试数据库连接和表创建。</p>
      
      <div style={{ margin: '20px 0' }}>
        <button 
          onClick={testConnection}
          style={{ 
            padding: '10px 20px', 
            margin: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          测试数据库连接
        </button>
        
        <button 
          onClick={testMigrate}
          style={{ 
            padding: '10px 20px', 
            margin: '10px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          创建数据库表
        </button>
        
        <button 
          onClick={testInit}
          style={{ 
            padding: '10px 20px', 
            margin: '10px',
            backgroundColor: '#ffc107',
            color: 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          初始化数据库
        </button>
      </div>
      
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <h3>测试步骤：</h3>
        <ol>
          <li>点击"测试数据库连接" - 检查是否能连接到数据库</li>
          <li>点击"创建数据库表" - 创建必要的表结构</li>
          <li>点击"初始化数据库" - 创建示例用户和数据</li>
          <li>如果都成功，就可以尝试登录了</li>
        </ol>
      </div>
    </div>
  )
}
