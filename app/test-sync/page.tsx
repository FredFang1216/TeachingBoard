'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function TestSyncPage() {
  const router = useRouter()
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [refreshing, setRefreshing] = useState(false)
  const [lastDataHash, setLastDataHash] = useState('')
  const [testResults, setTestResults] = useState<string[]>([])

  const addTestResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setTestResults(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)])
  }

  const refreshData = async () => {
    if (refreshing) return
    
    setRefreshing(true)
    addTestResult('开始刷新数据...')
    
    try {
      const timestamp = Date.now()
      const response = await fetch(`/api/admin/groups-with-students?t=${timestamp}`)
      if (response.ok) {
        const data = await response.json()
        const students: any[] = []
        data.groups.forEach((group: any) => {
          group.students.forEach((student: any) => {
            students.push({
              ...student,
              groupName: group.name,
              teacherName: group.teacher.name
            })
          })
        })
        
        setAllStudents(students)
        setLastRefresh(new Date())
        
        // 计算数据哈希值
        const dataHash = JSON.stringify(students.map(s => ({ 
          id: s.id, 
          totalScore: s.totalScore, 
          name: s.name,
          groupId: s.groupId 
        })))
        
        const hashChanged = dataHash !== lastDataHash
        setLastDataHash(dataHash)
        
        addTestResult(`刷新完成 - 学生数: ${students.length}, 哈希变化: ${hashChanged}`)
        toast.success('数据已刷新')
      }
    } catch (error) {
      addTestResult(`刷新失败: ${error}`)
      toast.error('刷新数据失败')
    } finally {
      setRefreshing(false)
    }
  }

  const testDataChange = async () => {
    addTestResult('开始测试数据变化检测...')
    
    try {
      const timestamp = Date.now()
      const response = await fetch(`/api/admin/groups-with-students?t=${timestamp}`)
      if (response.ok) {
        const data = await response.json()
        const students: any[] = []
        data.groups.forEach((group: any) => {
          group.students.forEach((student: any) => {
            students.push({
              ...student,
              groupName: group.name,
              teacherName: group.teacher.name
            })
          })
        })
        
        // 计算当前数据哈希值
        const currentDataHash = JSON.stringify(students.map(s => ({ 
          id: s.id, 
          totalScore: s.totalScore, 
          name: s.name,
          groupId: s.groupId 
        })))
        
        const hasChanged = currentDataHash !== lastDataHash && lastDataHash !== ''
        addTestResult(`数据变化检测 - 当前哈希: ${currentDataHash.substring(0, 30)}..., 有变化: ${hasChanged}`)
        
        if (hasChanged) {
          addTestResult('检测到数据变化，触发刷新')
          await refreshData()
        }
      }
    } catch (error) {
      addTestResult(`数据变化检测失败: ${error}`)
    }
  }

  useEffect(() => {
    refreshData()
  }, [])

  // 自动测试数据变化
  useEffect(() => {
    const interval = setInterval(() => {
      testDataChange()
    }, 5000) // 每5秒测试一次

    return () => clearInterval(interval)
  }, [lastDataHash])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">数据同步测试页面</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 控制面板 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">控制面板</h2>
            
            <div className="space-y-4">
              <button
                onClick={refreshData}
                disabled={refreshing}
                className={`w-full px-4 py-2 rounded-lg transition-colors ${
                  refreshing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
              >
                {refreshing ? '刷新中...' : '手动刷新'}
              </button>
              
              <button
                onClick={testDataChange}
                className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                测试数据变化检测
              </button>
              
              <button
                onClick={() => setTestResults([])}
                className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                清空测试日志
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">当前状态</h3>
              <p className="text-sm text-gray-600">学生总数: {allStudents.length}</p>
              <p className="text-sm text-gray-600">最后更新: {lastRefresh.toLocaleTimeString()}</p>
              <p className="text-sm text-gray-600">数据哈希: {lastDataHash.substring(0, 50)}...</p>
            </div>
          </div>
          
          {/* 测试日志 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">测试日志</h2>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <div className="text-gray-500">暂无测试日志</div>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="mb-1">{result}</div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* 学生数据 */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">学生数据 ({allStudents.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allStudents.map((student) => (
              <div key={student.id} className="border rounded-lg p-4">
                <h3 className="font-semibold">{student.name}</h3>
                <p className="text-sm text-gray-600">班级: {student.groupName}</p>
                <p className="text-sm text-gray-600">教师: {student.teacherName}</p>
                <p className="text-lg font-bold text-blue-600">积分: {student.totalScore}</p>
              </div>
            ))}
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
