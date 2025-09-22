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
  UserPlus,
  BookOpen,
  TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'
import Navigation from '@/components/Navigation'
import { useRouter } from 'next/navigation'

interface Teacher {
  id: string
  email: string
  name: string
  role: string
  createdAt: string
  groups: Group[]
}

interface Group {
  id: string
  name: string
  description: string
  studentCount: number
  createdAt: string
}

interface Student {
  id: string
  name: string
  totalScore: number
  height?: number
  weight?: number
  heartRate?: number
}

export default function AdminPage() {
  const router = useRouter()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [allGroups, setAllGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showAddTeacher, setShowAddTeacher] = useState(false)
  const [newTeacher, setNewTeacher] = useState({
    email: '',
    name: '',
    password: ''
  })
  const [activeTab, setActiveTab] = useState<'teachers' | 'groups' | 'overview'>('overview')

  const handleLogout = () => {
    localStorage.removeItem('user')
    sessionStorage.clear()
    toast.success('已成功退出登录')
    router.push('/login')
  }

  // 加载数据
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
        
        // 加载所有教师
        const teachersResponse = await fetch('/api/admin/teachers')
        if (teachersResponse.ok) {
          const teachersData = await teachersResponse.json()
          setTeachers(teachersData.teachers || [])
        }
        
        // 加载所有班级
        const groupsResponse = await fetch('/api/admin/groups')
        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json()
          setAllGroups(groupsData.groups || [])
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

  const handleAddTeacher = async () => {
    if (!newTeacher.email || !newTeacher.name || !newTeacher.password) {
      toast.error('请填写所有字段')
      return
    }

    if (newTeacher.password.length < 6) {
      toast.error('密码长度至少6位')
      return
    }

    try {
      const response = await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeacher)
      })

      if (response.ok) {
        toast.success('教师账户创建成功')
        setNewTeacher({ email: '', name: '', password: '' })
        setShowAddTeacher(false)
        
        // 重新加载教师列表
        const teachersResponse = await fetch('/api/admin/teachers')
        if (teachersResponse.ok) {
          const teachersData = await teachersResponse.json()
          setTeachers(teachersData.teachers || [])
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || '创建教师账户失败')
      }
    } catch (error) {
      toast.error('网络错误，请重试')
    }
  }

  const handleDeleteTeacher = async (teacherId: string) => {
    if (!confirm('确定要删除这个教师账户吗？这将同时删除该教师的所有班级和学生数据。')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/teachers/${teacherId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('教师账户删除成功')
        // 重新加载数据
        const teachersResponse = await fetch('/api/admin/teachers')
        if (teachersResponse.ok) {
          const teachersData = await teachersResponse.json()
          setTeachers(teachersData.teachers || [])
        }
        
        const groupsResponse = await fetch('/api/admin/groups')
        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json()
          setAllGroups(groupsData.groups || [])
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || '删除教师账户失败')
      }
    } catch (error) {
      toast.error('网络错误，请重试')
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('确定要删除这个班级吗？这将同时删除该班级的所有学生数据。')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/groups/${groupId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('班级删除成功')
        // 重新加载数据
        const groupsResponse = await fetch('/api/admin/groups')
        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json()
          setAllGroups(groupsData.groups || [])
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || '删除班级失败')
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">管理员控制台</h1>
          <p className="text-gray-600">管理教师账户和查看所有班级数据</p>
        </div>

        {/* 标签页 */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <TrendingUp className="w-4 h-4 mr-2 inline" />
              总览
            </button>
            <button
              onClick={() => setActiveTab('teachers')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'teachers'
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Users className="w-4 h-4 mr-2 inline" />
              教师管理
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'groups'
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <BookOpen className="w-4 h-4 mr-2 inline" />
              班级管理
            </button>
          </div>
        </div>

        {/* 总览标签页 */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">教师总数</p>
                    <p className="text-2xl font-bold text-gray-900">{teachers.length}</p>
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
                    <BookOpen className="w-6 h-6 text-green-600" />
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
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">学生总数</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {allGroups.reduce((sum, group) => sum + group.studentCount, 0)}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* 最近创建的班级 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">最近创建的班级</h3>
              {allGroups.length > 0 ? (
                <div className="space-y-3">
                  {allGroups.slice(0, 5).map((group) => (
                    <div key={group.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{group.name}</p>
                        <p className="text-sm text-gray-600">{group.studentCount}名学生</p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(group.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">暂无班级数据</p>
              )}
            </motion.div>
          </div>
        )}

        {/* 教师管理标签页 */}
        {activeTab === 'teachers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">教师管理</h2>
              <button
                onClick={() => setShowAddTeacher(true)}
                className="btn-primary"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                添加教师
              </button>
            </div>

            {/* 教师列表 */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {teachers.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {teachers.map((teacher) => (
                    <div key={teacher.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-pink-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{teacher.name}</h3>
                            <p className="text-gray-600">{teacher.email}</p>
                            <p className="text-sm text-gray-500">
                              创建时间: {new Date(teacher.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {teacher.groups?.length || 0}个班级
                          </span>
                          <button
                            onClick={() => handleDeleteTeacher(teacher.id)}
                            className="text-red-500 hover:text-red-700 p-2"
                            title="删除教师"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">暂无教师</h3>
                  <p className="text-gray-500 mb-4">点击上方按钮添加第一个教师</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 班级管理标签页 */}
        {activeTab === 'groups' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">所有班级</h2>
            
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {allGroups.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {allGroups.map((group) => (
                    <div key={group.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{group.name}</h3>
                          <p className="text-gray-600">{group.description}</p>
                          <p className="text-sm text-gray-500">
                            {group.studentCount}名学生 • 创建于 {new Date(group.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => router.push(`/admin-dashboard?groupId=${group.id}`)}
                            className="btn-primary"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            查看详情
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">暂无班级</h3>
                  <p className="text-gray-500">教师创建班级后，这里将显示所有班级</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 添加教师模态框 */}
        {showAddTeacher && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">添加新教师</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    教师姓名 *
                  </label>
                  <input
                    type="text"
                    value={newTeacher.name}
                    onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                    className="input-field"
                    placeholder="请输入教师姓名"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    邮箱地址 *
                  </label>
                  <input
                    type="email"
                    value={newTeacher.email}
                    onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                    className="input-field"
                    placeholder="请输入邮箱地址"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    密码 *
                  </label>
                  <input
                    type="password"
                    value={newTeacher.password}
                    onChange={(e) => setNewTeacher({...newTeacher, password: e.target.value})}
                    className="input-field"
                    placeholder="请输入密码（至少6位）"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddTeacher(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddTeacher}
                  className="btn-primary"
                >
                  创建教师
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
