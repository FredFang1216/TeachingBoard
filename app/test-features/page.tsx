'use client'

export default function TestFeaturesPage() {
  const testCreateGroup = async () => {
    try {
      // 首先获取一个真实的教师ID
      const usersResponse = await fetch('/api/users')
      const usersData = await usersResponse.json()
      
      let teacherId = null
      if (usersData.users && usersData.users.length > 0) {
        // 查找教师用户
        const teacher = usersData.users.find((user: any) => user.role === 'TEACHER')
        if (teacher) {
          teacherId = teacher.id
        } else {
          // 如果没有教师，使用第一个用户
          teacherId = usersData.users[0].id
        }
      }
      
      if (!teacherId) {
        alert('没有找到可用的教师用户，请先初始化数据库')
        return
      }
      
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '测试班级',
          description: '这是一个测试班级',
          teacherId: teacherId
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
      // 首先获取一个真实的班级ID
      const usersResponse = await fetch('/api/users')
      const usersData = await usersResponse.json()
      
      let teacherId = null
      if (usersData.users && usersData.users.length > 0) {
        // 查找教师用户
        const teacher = usersData.users.find((user: any) => user.role === 'TEACHER')
        if (teacher) {
          teacherId = teacher.id
        } else {
          // 如果没有教师，使用第一个用户
          teacherId = usersData.users[0].id
        }
      }
      
      if (!teacherId) {
        alert('没有找到可用的教师用户，请先初始化数据库')
        return
      }
      
      // 获取该教师的班级
      const groupsResponse = await fetch(`/api/groups?teacherId=${teacherId}`)
      const groupsData = await groupsResponse.json()
      
      if (!groupsData.groups || groupsData.groups.length === 0) {
        alert('没有找到班级，请先创建班级')
        return
      }
      
      const groupId = groupsData.groups[0].id
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '测试学生',
          height: 120,
          weight: 25,
          heartRate: 80,
          groupId: groupId
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
      // 首先获取一个真实的教师ID
      const usersResponse = await fetch('/api/users')
      const usersData = await usersResponse.json()
      
      let teacherId = null
      if (usersData.users && usersData.users.length > 0) {
        // 查找教师用户
        const teacher = usersData.users.find((user: any) => user.role === 'TEACHER')
        if (teacher) {
          teacherId = teacher.id
        } else {
          // 如果没有教师，使用第一个用户
          teacherId = usersData.users[0].id
        }
      }
      
      if (!teacherId) {
        alert('没有找到可用的教师用户，请先初始化数据库')
        return
      }
      
      const response = await fetch(`/api/groups?teacherId=${teacherId}`)
      const data = await response.json()
      alert(JSON.stringify(data, null, 2))
    } catch (error) {
      alert('获取班级失败: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  const testGetStudents = async () => {
    try {
      // 首先获取一个真实的班级ID
      const usersResponse = await fetch('/api/users')
      const usersData = await usersResponse.json()
      
      let teacherId = null
      if (usersData.users && usersData.users.length > 0) {
        // 查找教师用户
        const teacher = usersData.users.find((user: any) => user.role === 'TEACHER')
        if (teacher) {
          teacherId = teacher.id
        } else {
          // 如果没有教师，使用第一个用户
          teacherId = usersData.users[0].id
        }
      }
      
      if (!teacherId) {
        alert('没有找到可用的教师用户，请先初始化数据库')
        return
      }
      
      // 获取该教师的班级
      const groupsResponse = await fetch(`/api/groups?teacherId=${teacherId}`)
      const groupsData = await groupsResponse.json()
      
      if (!groupsData.groups || groupsData.groups.length === 0) {
        alert('没有找到班级，请先创建班级')
        return
      }
      
      const groupId = groupsData.groups[0].id
      const response = await fetch(`/api/students?groupId=${groupId}`)
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
