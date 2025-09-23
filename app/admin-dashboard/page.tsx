'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  BarChart3,
  BookOpen,
  TrendingUp,
  Search,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react'
import toast from 'react-hot-toast'
import Navigation from '@/components/Navigation'
import { useRouter } from 'next/navigation'

interface Group {
  id: string
  name: string
  description: string
  teacher: {
    id: string
    name: string
    email: string
  }
  students: Student[]
  createdAt: string
}

interface Student {
  id: string
  name: string
  totalScore: number
  height?: number
  weight?: number
  vitalCapacity?: number
  sitAndReach?: number
  run50m?: number
  ropeSkipping?: number
  heartRate?: number
  singleLegStand?: number
  groupId: string
  groupName: string
  teacherName: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [allGroups, setAllGroups] = useState<Group[]>([])
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'group'>('score')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [refreshing, setRefreshing] = useState(false)
  const [lastDataHash, setLastDataHash] = useState('')
  const [lastScoreUpdate, setLastScoreUpdate] = useState<number>(0)
  const [newStudent, setNewStudent] = useState({
    name: '',
    height: '',
    weight: '',
    vitalCapacity: '',
    sitAndReach: '',
    run50m: '',
    ropeSkipping: '',
    heartRate: '',
    singleLegStand: '',
    groupId: ''
  })

  const handleLogout = () => {
    localStorage.removeItem('user')
    sessionStorage.clear()
    toast.success('已成功退出登录')
    router.push('/login')
  }

  // 刷新数据函数
  const refreshData = async () => {
    if (refreshing) return // 防止重复刷新
    
    console.log('开始刷新数据...')
    setRefreshing(true)
    try {
      // 添加时间戳防止缓存
      const timestamp = Date.now()
      
      // 加载所有班级及其学生
      const groupsResponse = await fetch(`/api/admin/groups-with-students?t=${timestamp}`)
      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json()
        console.log('API响应数据:', groupsData)
        
        setAllGroups(groupsData.groups || [])
        
        // 展平所有学生数据，添加班级和教师信息
        const students: Student[] = []
        groupsData.groups.forEach((group: Group) => {
          group.students.forEach((student: any) => {
            students.push({
              ...student,
              groupName: group.name,
              teacherName: group.teacher.name
            })
          })
        })
        
        console.log('处理后的学生数据:', students.map(s => ({ id: s.id, name: s.name, totalScore: s.totalScore })))
        
        // 检查是否有本地加分未同步到服务器
        const now = Date.now()
        const timeSinceLastScoreUpdate = now - lastScoreUpdate
        const hasRecentLocalUpdate = timeSinceLastScoreUpdate < 10000 // 10秒内有本地更新
        
        if (hasRecentLocalUpdate) {
          console.log(`⚠️ 检测到最近有本地加分操作（${Math.round(timeSinceLastScoreUpdate/1000)}秒前），跳过服务器数据覆盖`)
          console.log('保持本地状态，避免覆盖加分结果')
          return
        }
        
        setAllStudents(students)
        setLastRefresh(new Date())
        
        // 计算数据哈希值，用于检测变化（包含更多字段）
        const dataHash = JSON.stringify(students.map(s => ({ 
          id: s.id, 
          totalScore: s.totalScore, 
          name: s.name,
          groupId: s.groupId 
        })))
        setLastDataHash(dataHash)
        
        console.log('数据刷新完成，学生总数:', students.length)
        
        // 强制触发重新渲染
        setAllStudents([...students])
        
        toast.success('数据已刷新')
      } else {
        console.error('API请求失败:', groupsResponse.status)
      }
    } catch (error) {
      console.error('刷新数据失败:', error)
      toast.error('刷新数据失败')
    } finally {
      setRefreshing(false)
    }
  }

  // 加载所有数据
  useEffect(() => {
    const loadData = async () => {
      try {
        // 检查用户权限
        const userData = localStorage.getItem('user')
        if (!userData) {
          router.push('/login')
          return
        }
        
        const user = JSON.parse(userData)
        if (user.role !== 'ADMIN') {
          toast.error('权限不足，只有管理员可以访问此页面')
          router.push('/dashboard')
          return
        }
        
        setCurrentUser(user)
        
        // 检查URL参数中是否有指定的班级ID
        const urlParams = new URLSearchParams(window.location.search)
        const groupId = urlParams.get('groupId')
        
        // 使用统一的刷新函数
        await refreshData()
        
        // 如果URL中指定了班级ID，则设置筛选
        if (groupId) {
          setSelectedGroup(groupId)
        }
      } catch (error) {
        console.error('加载数据失败:', error)
        toast.error('加载数据失败')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [router])

  // 禁用自动刷新，保留所有调试日志
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     console.log('定时刷新触发')
  //     refreshData()
  //   }, 5000) // 每5秒刷新一次，更频繁

  //   return () => clearInterval(interval)
  // }, [])

  // 禁用自动同步，保留所有调试日志
  // useEffect(() => {
  //   const syncData = async () => {
  //     if (refreshing) return
      
  //     const now = Date.now()
  //     const timeSinceLastScoreUpdate = now - lastScoreUpdate
      
  //     // 如果距离上次加分不到5秒，跳过同步
  //     if (timeSinceLastScoreUpdate < 5000) {
  //       console.log(`跳过数据同步，距离上次加分仅 ${Math.round(timeSinceLastScoreUpdate/1000)} 秒`)
  //       return
  //     }
      
  //     try {
  //       const timestamp = Date.now()
  //       const response = await fetch(`/api/admin/groups-with-students?t=${timestamp}`)
  //       if (response.ok) {
  //         const data = await response.json()
  //         const students: Student[] = []
  //         data.groups.forEach((group: Group) => {
  //           group.students.forEach((student: any) => {
  //             students.push({
  //               ...student,
  //               groupName: group.name,
  //               teacherName: group.teacher.name
  //             })
  //           })
  //         })
          
  //         // 检查是否有本地加分未同步到服务器
  //         const now = Date.now()
  //         const timeSinceLastScoreUpdate = now - lastScoreUpdate
  //         const hasRecentLocalUpdate = timeSinceLastScoreUpdate < 10000 // 10秒内有本地更新
          
  //         if (hasRecentLocalUpdate) {
  //           console.log(`⚠️ 检测到最近有本地加分操作（${Math.round(timeSinceLastScoreUpdate/1000)}秒前），跳过服务器数据覆盖`)
  //           console.log('保持本地状态，避免覆盖加分结果')
  //           return
  //         }
          
  //         // 直接更新状态
  //         setAllGroups(data.groups || [])
  //         setAllStudents(students)
  //         setLastRefresh(new Date())
          
  //         console.log('数据同步完成，学生总数:', students.length)
  //       }
  //     } catch (error) {
  //       console.error('数据同步失败:', error)
  //     }
  //   }

  //   const interval = setInterval(syncData, 3000) // 每3秒同步一次
  //   return () => clearInterval(interval)
  // }, [refreshing, lastScoreUpdate])

  // 禁用页面获得焦点时自动刷新
  // useEffect(() => {
  //   const handleFocus = () => {
  //     refreshData()
  //   }

  //   window.addEventListener('focus', handleFocus)
  //   return () => window.removeEventListener('focus', handleFocus)
  // }, [])

  // 过滤和排序学生
  const filteredStudents = allStudents
    .filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesGroup = selectedGroup === 'all' || student.groupId === selectedGroup
      
      return matchesSearch && matchesGroup
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'score':
          comparison = a.totalScore - b.totalScore
          break
        case 'group':
          comparison = a.groupName.localeCompare(b.groupName)
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.groupId) {
      toast.error('请填写学生姓名和选择班级')
      return
    }

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStudent.name,
          height: newStudent.height ? parseFloat(newStudent.height) : null,
          weight: newStudent.weight ? parseFloat(newStudent.weight) : null,
          vitalCapacity: newStudent.vitalCapacity ? parseFloat(newStudent.vitalCapacity) : null,
          sitAndReach: newStudent.sitAndReach ? parseFloat(newStudent.sitAndReach) : null,
          run50m: newStudent.run50m ? parseFloat(newStudent.run50m) : null,
          ropeSkipping: newStudent.ropeSkipping ? parseInt(newStudent.ropeSkipping) : null,
          heartRate: newStudent.heartRate ? parseInt(newStudent.heartRate) : null,
          singleLegStand: newStudent.singleLegStand ? parseFloat(newStudent.singleLegStand) : null,
          groupId: newStudent.groupId
        })
      })

      if (response.ok) {
        toast.success('学生添加成功')
        setNewStudent({ 
          name: '', 
          height: '', 
          weight: '', 
          vitalCapacity: '',
          sitAndReach: '',
          run50m: '',
          ropeSkipping: '',
          heartRate: '',
          singleLegStand: '',
          groupId: ''
        })
        setShowAddStudent(false)
        
        // 立即刷新数据
        await refreshData()
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || '添加学生失败')
      }
    } catch (error) {
      toast.error('网络错误，请重试')
    }
  }

  const handleUpdateScore = async (studentId: string, points: number, reason: string) => {
    try {
      console.log('开始加分操作:', { studentId, points, reason })
      
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, points, reason })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('加分成功:', result)
        
        // 验证数据库更新
        if (result.studentBefore && result.studentAfter) {
          const expectedScore = result.studentBefore.totalScore + points
          const actualScore = result.studentAfter.totalScore
          console.log(`数据库验证: 期望分数 ${expectedScore}, 实际分数 ${actualScore}`)
          
          if (expectedScore !== actualScore) {
            console.error(`⚠️ 数据库更新异常！期望 ${expectedScore}，实际 ${actualScore}`)
            toast.error('数据库更新异常，请重试')
            return
          } else {
            console.log(`✅ 数据库更新正确`)
          }
        }
        
        toast.success(`已加分 ${points} 分`)
        
        // 记录加分时间，防止自动刷新覆盖
        setLastScoreUpdate(Date.now())
        
        // 立即更新本地状态
        setAllStudents(prevStudents => 
          prevStudents.map(student => 
            student.id === studentId 
              ? { ...student, totalScore: student.totalScore + points }
              : student
          )
        )
        
        // 不进行延迟刷新，避免覆盖本地状态
        // setTimeout(async () => {
        //   console.log('延迟刷新数据...')
        //   await refreshData()
        //   console.log('数据刷新完成')
        // }, 2000) // 延迟2秒刷新
      } else {
        const errorData = await response.json()
        console.error('加分失败:', errorData)
        toast.error(errorData.message || '积分更新失败')
      }
    } catch (error) {
      console.error('加分网络错误:', error)
      toast.error('网络错误，请重试')
    }
  }

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50">
      {/* 头部导航 */}
      <Navigation onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">学生管理 - 管理员视图</h1>
              <p className="text-gray-600">查看和管理所有班级的学生数据</p>
            </div>
            <div className="text-right">
              <div className="flex space-x-2 mb-2">
                <button
                  onClick={() => refreshData()}
                  disabled={refreshing}
                  className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                    refreshing 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  {refreshing ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1 inline"></div>
                      刷新中...
                    </>
                  ) : (
                    '手动刷新'
                  )}
                </button>
                <button
                  onClick={() => {
                    console.log('强制刷新触发')
                    setLastDataHash('') // 清空哈希值，强制检测变化
                    refreshData()
                  }}
                  disabled={refreshing}
                  className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                    refreshing 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-red-500 hover:bg-red-600'
                  } text-white`}
                >
                  强制刷新
                </button>
                <button
                  onClick={() => {
                    console.log('强制同步服务器数据...')
                    setLastScoreUpdate(0) // 重置加分时间，强制同步
                    refreshData()
                  }}
                  disabled={refreshing}
                  className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                    refreshing 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-purple-500 hover:bg-purple-600'
                  } text-white`}
                >
                  强制同步
                </button>
                <button
                  onClick={async () => {
                    console.log('测试数据同步...')
                    try {
                      const response = await fetch('/api/test-sync')
                      if (response.ok) {
                        const data = await response.json()
                        console.log('测试同步结果:', data)
                        alert(`测试同步完成！\n时间戳: ${data.timestamp}\n学生数: ${data.students.length}\n金富欣分数: ${data.jinFuxin?.totalScore || '未找到'}`)
                      }
                    } catch (error) {
                      console.error('测试同步失败:', error)
                      alert('测试同步失败')
                    }
                  }}
                  className="px-3 py-2 rounded-lg transition-colors text-sm bg-blue-500 hover:bg-blue-600 text-white"
                >
                  测试同步
                </button>
                <button
                  onClick={async () => {
                    console.log('测试跨账户同步...')
                    try {
                      const response = await fetch('/api/test-cross-sync')
                      if (response.ok) {
                        const data = await response.json()
                        console.log('跨账户同步结果:', data)
                        const jinFuxin = data.jinFuxin
                        if (jinFuxin) {
                          const recentRecords = jinFuxin.scoreRecords.slice(0, 3)
                          const recordsText = recentRecords.map((r: any) => 
                            `${r.points > 0 ? '+' : ''}${r.points}分 (${r.reason}) - ${new Date(r.createdAt).toLocaleTimeString()}`
                          ).join('\n')
                          
                          alert(`跨账户同步测试完成！\n\n金富欣信息:\n分数: ${jinFuxin.totalScore}\n班级: ${jinFuxin.group?.name}\n教师: ${jinFuxin.group?.teacher?.name}\n更新时间: ${new Date(jinFuxin.updatedAt).toLocaleString()}\n\n最近加分记录:\n${recordsText}`)
                        } else {
                          alert('未找到金富欣学生信息')
                        }
                      }
                    } catch (error) {
                      console.error('跨账户同步测试失败:', error)
                      alert('跨账户同步测试失败')
                    }
                  }}
                  className="px-3 py-2 rounded-lg transition-colors text-sm bg-orange-500 hover:bg-orange-600 text-white"
                >
                  跨账户测试
                </button>
                <button
                  onClick={async () => {
                    console.log('测试数据库同步...')
                    try {
                      const response = await fetch('/api/test-db-sync')
                      if (response.ok) {
                        const data = await response.json()
                        console.log('数据库同步结果:', data)
                        alert(`数据库同步测试完成！\n\n加分前: ${data.before?.totalScore}分\n加分后: ${data.after?.totalScore}分\n同步状态: ${data.isSynced ? '正常' : '异常'}\n\n${data.message}`)
                      }
                    } catch (error) {
                      console.error('数据库同步测试失败:', error)
                      alert('数据库同步测试失败')
                    }
                  }}
                  className="px-3 py-2 rounded-lg transition-colors text-sm bg-pink-500 hover:bg-pink-600 text-white"
                >
                  数据库测试
                </button>
                <button
                  onClick={async () => {
                    console.log('对比API数据...')
                    try {
                      const response = await fetch('/api/compare-apis')
                      if (response.ok) {
                        const data = await response.json()
                        console.log('API对比结果:', data)
                        alert(`API对比测试完成！\n\n直接查询: ${data.directQuery?.totalScore}分\nGroups API: ${data.groupsApiJinFuxin?.totalScore}分\n数据一致性: ${data.isDataConsistent ? '一致' : '不一致'}\n\n时间差: ${data.timeDiff ? data.timeDiff + 'ms' : '未知'}\n\n${data.message}`)
                      }
                    } catch (error) {
                      console.error('API对比测试失败:', error)
                      alert('API对比测试失败')
                    }
                  }}
                  className="px-3 py-2 rounded-lg transition-colors text-sm bg-indigo-500 hover:bg-indigo-600 text-white"
                >
                  API对比
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${refreshing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
                <p className="text-sm text-gray-500">
                  {refreshing ? '同步中...' : '实时同步'} • 最后更新: {lastRefresh.toLocaleTimeString()}
                </p>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                学生总数: {allStudents.length} • 数据哈希: {lastDataHash.substring(0, 20)}...
              </div>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">班级总数</p>
                <p className="text-2xl font-bold text-gray-900">{allGroups.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">学生总数</p>
                <p className="text-2xl font-bold text-gray-900">{allStudents.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">平均积分</p>
                <p className="text-2xl font-bold text-gray-900">
                  {allStudents.length > 0 
                    ? Math.round(allStudents.reduce((sum, s) => sum + s.totalScore, 0) / allStudents.length)
                    : 0
                  }
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">最高积分</p>
                <p className="text-2xl font-bold text-gray-900">
                  {allStudents.length > 0 
                    ? Math.max(...allStudents.map(s => s.totalScore))
                    : 0
                  }
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="搜索学生姓名、班级或教师..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="all">所有班级</option>
                {allGroups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'score' | 'group')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="score">按积分排序</option>
                <option value="name">按姓名排序</option>
                <option value="group">按班级排序</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* 学生列表 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                学生列表 ({filteredStudents.length}人)
              </h2>
              <button
                onClick={() => setShowAddStudent(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                添加学生
              </button>
            </div>
          </div>

          {filteredStudents.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-pink-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{student.name}</h3>
                        <p className="text-gray-600">{student.groupName} • {student.teacherName}</p>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                          {student.height && <span>身高: {student.height}cm</span>}
                          {student.weight && <span>体重: {student.weight}kg</span>}
                          {student.vitalCapacity && <span>肺活量: {student.vitalCapacity}ml</span>}
                          {student.sitAndReach && <span>坐位体前屈: {student.sitAndReach}cm</span>}
                          {student.run50m && <span>50米跑: {student.run50m}秒</span>}
                          {student.ropeSkipping && <span>跳绳: {student.ropeSkipping}次</span>}
                          {student.heartRate && <span>心率: {student.heartRate}bpm</span>}
                          {student.singleLegStand && <span>单脚站立: {student.singleLegStand}秒</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-pink-600">{student.totalScore}</p>
                        <p className="text-sm text-gray-500">积分</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleUpdateScore(student.id, 3, '屈膝缓冲 降低重心')}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                        >
                          屈膝缓冲 +3
                        </button>
                        <button
                          onClick={() => handleUpdateScore(student.id, 2, '合作互助')}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                        >
                          合作互助 +2
                        </button>
                        <button
                          onClick={() => handleUpdateScore(student.id, 1, '认真学练')}
                          className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
                        >
                          认真学练 +1
                        </button>
                        <button
                          onClick={() => handleUpdateScore(student.id, 1, '大胆尝试')}
                          className="px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                        >
                          大胆尝试 +1
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`确认删除学生 ${student.name} 吗？该操作不可恢复。`)) return
                            try {
                              const res = await fetch(`/api/admin/students/${student.id}`, { method: 'DELETE', headers: { 'Cache-Control': 'no-store' } })
                              if (res.ok) {
                                toast.success('学生已删除')
                                // 立即从前端移除，保证快速反馈
                                setAllStudents(prev => prev.filter(s => s.id !== student.id))
                                // 同步刷新，确保后台一致
                                await refreshData()
                              } else {
                                const err = await res.json()
                                toast.error(err.message || '删除失败')
                              }
                            } catch (e) {
                              toast.error('网络错误，删除失败')
                            }
                          }}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                        >
                          删除
                        </button>
                        <button
                          onClick={() => {
                            const points = prompt('请输入要增加的积分:')
                            const reason = prompt('请输入加分原因:')
                            if (points && reason) {
                              handleUpdateScore(student.id, parseInt(points), reason)
                            }
                          }}
                          className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                        >
                          自定义
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">暂无学生</h3>
              <p className="text-gray-500">点击上方按钮添加第一个学生</p>
            </div>
          )}
        </div>

        {/* 添加学生模态框 */}
        {showAddStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">添加新学生</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    学生姓名 *
                  </label>
                  <input
                    type="text"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                    className="input-field"
                    placeholder="请输入学生姓名"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    选择班级 *
                  </label>
                  <select
                    value={newStudent.groupId}
                    onChange={(e) => setNewStudent({...newStudent, groupId: e.target.value})}
                    className="input-field"
                  >
                    <option value="">请选择班级</option>
                    {allGroups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name} ({group.teacher.name})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      身高 (cm)
                    </label>
                    <input
                      type="number"
                      value={newStudent.height}
                      onChange={(e) => setNewStudent({...newStudent, height: e.target.value})}
                      className="input-field"
                      placeholder="120"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      体重 (kg)
                    </label>
                    <input
                      type="number"
                      value={newStudent.weight}
                      onChange={(e) => setNewStudent({...newStudent, weight: e.target.value})}
                      className="input-field"
                      placeholder="25"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      肺活量 (ml)
                    </label>
                    <input
                      type="number"
                      value={newStudent.vitalCapacity}
                      onChange={(e) => setNewStudent({...newStudent, vitalCapacity: e.target.value})}
                      className="input-field"
                      placeholder="2000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      坐位体前屈 (cm)
                    </label>
                    <input
                      type="number"
                      value={newStudent.sitAndReach}
                      onChange={(e) => setNewStudent({...newStudent, sitAndReach: e.target.value})}
                      className="input-field"
                      placeholder="15"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      50米跑 (秒)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newStudent.run50m}
                      onChange={(e) => setNewStudent({...newStudent, run50m: e.target.value})}
                      className="input-field"
                      placeholder="8.5"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      跳绳 (次)
                    </label>
                    <input
                      type="number"
                      value={newStudent.ropeSkipping}
                      onChange={(e) => setNewStudent({...newStudent, ropeSkipping: e.target.value})}
                      className="input-field"
                      placeholder="100"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      心率 (bpm)
                    </label>
                    <input
                      type="number"
                      value={newStudent.heartRate}
                      onChange={(e) => setNewStudent({...newStudent, heartRate: e.target.value})}
                      className="input-field"
                      placeholder="80"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      单脚站立时间 (秒)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newStudent.singleLegStand}
                      onChange={(e) => setNewStudent({...newStudent, singleLegStand: e.target.value})}
                      className="input-field"
                      placeholder="30"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddStudent(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddStudent}
                  className="btn-primary"
                >
                  添加学生
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
