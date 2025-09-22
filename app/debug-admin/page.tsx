'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Student {
  id: string
  name: string
  totalScore: number
  groupId: string
  groupName: string
  teacherName: string
}

export default function DebugAdminPage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [debugLog, setDebugLog] = useState<string[]>([])
  const [lastScoreUpdate, setLastScoreUpdate] = useState<number>(0)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setDebugLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)])
  }

  const loadStudents = async () => {
    addLog('开始加载学生数据...')
    setRefreshing(true)
    
    try {
      const timestamp = Date.now()
      const response = await fetch(`/api/admin/groups-with-students?t=${timestamp}`)
      
      if (response.ok) {
        const data = await response.json()
        addLog(`API响应成功，班级数: ${data.groups?.length || 0}`)
        
        const allStudents: Student[] = []
        data.groups?.forEach((group: any) => {
          addLog(`处理班级: ${group.name}, 学生数: ${group.students?.length || 0}`)
          group.students?.forEach((student: any) => {
            allStudents.push({
              id: student.id,
              name: student.name,
              totalScore: student.totalScore || 0,
              groupId: student.groupId,
              groupName: group.name,
              teacherName: group.teacher?.name || '未知'
            })
          })
        })
        
        addLog(`总共处理学生: ${allStudents.length}`)
        console.log('所有学生数据:', allStudents)
        
        setStudents(allStudents)
        addLog('学生数据设置完成')
      } else {
        addLog(`API请求失败: ${response.status}`)
      }
    } catch (error) {
      addLog(`加载失败: ${error}`)
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  const handleAddScore = async (studentId: string, points: number, reason: string) => {
    addLog(`开始加分: ${studentId}, ${points}分, ${reason}`)
    
    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, points, reason })
      })

      if (response.ok) {
        const result = await response.json()
        addLog(`加分成功: ${JSON.stringify(result)}`)
        
        // 记录加分时间，防止自动刷新覆盖
        setLastScoreUpdate(Date.now())
        
        // 立即更新本地状态
        setStudents(prevStudents => {
          const updated = prevStudents.map(student => 
            student.id === studentId 
              ? { ...student, totalScore: student.totalScore + points }
              : student
          )
          addLog(`本地状态更新: ${studentId} 新分数: ${updated.find(s => s.id === studentId)?.totalScore}`)
          return updated
        })
        
        toast.success(`已加分 ${points} 分`)
        
        // 延迟刷新服务器数据，但等待更长时间
        setTimeout(() => {
          addLog('延迟刷新服务器数据...')
          loadStudents()
        }, 3000) // 改为3秒，给服务器更多时间
        
      } else {
        const errorData = await response.json()
        addLog(`加分失败: ${JSON.stringify(errorData)}`)
        toast.error(errorData.message || '积分更新失败')
      }
    } catch (error) {
      addLog(`加分网络错误: ${error}`)
      toast.error('网络错误，请重试')
    }
  }

  useEffect(() => {
    loadStudents()
  }, [])

  // 自动刷新 - 但避免在加分后立即刷新
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const timeSinceLastScoreUpdate = now - lastScoreUpdate
      
      // 如果距离上次加分不到5秒，跳过自动刷新
      if (timeSinceLastScoreUpdate < 5000) {
        addLog(`跳过自动刷新，距离上次加分仅 ${Math.round(timeSinceLastScoreUpdate/1000)} 秒`)
        return
      }
      
      addLog('自动刷新触发')
      loadStudents()
    }, 10000)

    return () => clearInterval(interval)
  }, [lastScoreUpdate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">管理员调试页面</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 学生列表 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">学生列表 ({students.length})</h2>
              <button
                onClick={loadStudents}
                disabled={refreshing}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  refreshing ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
              >
                {refreshing ? '刷新中...' : '手动刷新'}
              </button>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {students.map((student) => (
                <div key={student.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.groupName} - {student.teacherName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-pink-600">{student.totalScore}</p>
                      <p className="text-sm text-gray-500">积分</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleAddScore(student.id, 1, '测试加分')}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => handleAddScore(student.id, 3, '测试加分')}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                    >
                      +3
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 调试日志 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">调试日志</h2>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
              {debugLog.length === 0 ? (
                <div className="text-gray-500">暂无日志</div>
              ) : (
                debugLog.map((log, index) => (
                  <div key={index} className="mb-1">{log}</div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            返回
          </button>
        </div>
      </div>
    </div>
  )
}
