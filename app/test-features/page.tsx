'use client'

export default function TestFeaturesPage() {
  const testCreateGroup = async () => {
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '测试班级',
          description: '这是一个测试班级',
          teacherId: 'test-teacher-id'
        })
      })
      const data = await response.json()
      alert(JSON.stringify(data, null, 2))
    } catch (error) {
      alert('创建班级失败: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  const testCreateStudent = async () => {
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '测试学生',
          height: 120,
          weight: 25,
          heartRate: 80,
          groupId: 'demo-group-1'
        })
      })
      const data = await response.json()
      alert(JSON.stringify(data, null, 2))
    } catch (error) {
      alert('添加学生失败: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  const testRegister = async () => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          name: '测试用户',
          password: 'test123'
        })
      })
      const data = await response.json()
      alert(JSON.stringify(data, null, 2))
    } catch (error) {
      alert('注册失败: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  const testGetGroups = async () => {
    try {
      const response = await fetch('/api/groups?teacherId=test-teacher-id')
      const data = await response.json()
      alert(JSON.stringify(data, null, 2))
    } catch (error) {
      alert('获取班级失败: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  const testGetStudents = async () => {
    try {
      const response = await fetch('/api/students?groupId=demo-group-1')
      const data = await response.json()
      alert(JSON.stringify(data, null, 2))
    } catch (error) {
      alert('获取学生失败: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🧪 功能测试页面</h1>
      <p>这个页面用于测试各种功能是否正常工作。</p>
      
      <div style={{ margin: '20px 0' }}>
        <h3>班级管理</h3>
        <button 
          onClick={testCreateGroup}
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
          创建班级
        </button>
        
        <button 
          onClick={testGetGroups}
          style={{ 
            padding: '10px 20px', 
            margin: '10px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          获取班级列表
        </button>
      </div>

      <div style={{ margin: '20px 0' }}>
        <h3>学生管理</h3>
        <button 
          onClick={testCreateStudent}
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
          添加学生
        </button>
        
        <button 
          onClick={testGetStudents}
          style={{ 
            padding: '10px 20px', 
            margin: '10px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          获取学生列表
        </button>
      </div>

      <div style={{ margin: '20px 0' }}>
        <h3>用户管理</h3>
        <button 
          onClick={testRegister}
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
          注册新用户
        </button>
      </div>
      
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <h3>测试说明：</h3>
        <ul>
          <li><strong>创建班级</strong> - 测试班级创建功能</li>
          <li><strong>获取班级列表</strong> - 测试班级查询功能</li>
          <li><strong>添加学生</strong> - 测试学生添加功能</li>
          <li><strong>获取学生列表</strong> - 测试学生查询功能</li>
          <li><strong>注册新用户</strong> - 测试用户注册功能</li>
        </ul>
        <p>如果某个功能失败，会显示具体的错误信息。</p>
      </div>
    </div>
  )
}
