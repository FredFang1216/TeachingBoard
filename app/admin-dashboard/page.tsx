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
  heartRate?: number
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
  const [newStudent, setNewStudent] = useState({
    name: '',
    height: '',
    weight: '',
    heartRate: '',
    groupId: ''
  })

  const handleLogout = () => {
    localStorage.removeItem('user')
    sessionStorage.clear()
    toast.success('已成功退出登录')
    router.push('/login')
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
        
        // 加载所有班级及其学生
        const groupsResponse = await fetch('/api/admin/groups-with-students')
        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json()
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
          setAllStudents(students)
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
          heartRate: newStudent.heartRate ? parseInt(newStudent.heartRate) : null,
          groupId: newStudent.groupId
        })
      })

      if (response.ok) {
        toast.success('学生添加成功')
        setNewStudent({ name: '', height: '', weight: '', heartRate: '', groupId: '' })
        setShowAddStudent(false)
        
        // 重新加载数据
        const groupsResponse = await fetch('/api/admin/groups-with-students')
        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json()
          setAllGroups(groupsData.groups || [])
          
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
          setAllStudents(students)
        }
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
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, points, reason })
      })

      if (response.ok) {
        toast.success(`已加分 ${points} 分`)
        
        // 重新加载数据
        const groupsResponse = await fetch('/api/admin/groups-with-students')
        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json()
          setAllGroups(groupsData.groups || [])
          
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
          setAllStudents(students)
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || '积分更新失败')
      }
    } catch (error) {
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">学生管理 - 管理员视图</h1>
          <p className="text-gray-600">查看和管理所有班级的学生数据</p>
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
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {student.height && <span>身高: {student.height}cm</span>}
                          {student.weight && <span>体重: {student.weight}kg</span>}
                          {student.heartRate && <span>心率: {student.heartRate}bpm</span>}
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
                      placeholder="身高"
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
                      placeholder="体重"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    心率 (bpm)
                  </label>
                  <input
                    type="number"
                    value={newStudent.heartRate}
                    onChange={(e) => setNewStudent({...newStudent, heartRate: e.target.value})}
                    className="input-field"
                    placeholder="心率"
                  />
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
