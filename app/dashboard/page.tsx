'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Plus, 
  BarChart3, 
  Settings, 
  LogOut, 
  Heart, 
  Trophy,
  Sparkles,
  UserPlus,
  BookOpen
} from 'lucide-react'
import toast from 'react-hot-toast'
import Navigation from '@/components/Navigation'
import { useRouter } from 'next/navigation'

interface Student {
  id: string
  name: string
  height?: number
  weight?: number
  vitalCapacity?: number
  sitAndReach?: number
  run50m?: number
  ropeSkipping?: number
  heartRate?: number
  singleLegStand?: number
  totalScore: number
  scoreRecords: ScoreRecord[]
}

interface ScoreRecord {
  id: string
  points: number
  reason: string
  createdAt: string
}

interface Group {
  id: string
  name: string
  students: Student[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showScoreModal, setShowScoreModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [scorePoints, setScorePoints] = useState(1)
  const [scoreReason, setScoreReason] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'score'>('score')
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showAddGroup, setShowAddGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDescription, setNewGroupDescription] = useState('')
  const [showAddStudentForm, setShowAddStudentForm] = useState(false)
  const [newStudent, setNewStudent] = useState({
    name: '',
    height: '',
    weight: '',
    vitalCapacity: '',
    sitAndReach: '',
    run50m: '',
    ropeSkipping: '',
    heartRate: '',
    singleLegStand: ''
  })

  const handleLogout = () => {
    // 清除本地存储的用户信息
    localStorage.removeItem('user')
    sessionStorage.clear()
    
    // 显示退出成功消息
    toast.success('已成功退出登录')
    
    // 跳转到登录页面
    router.push('/login')
  }

  // 加载用户信息和数据
  useEffect(() => {
    const loadUserAndData = async () => {
      try {
        // 从localStorage获取用户信息
        const userData = localStorage.getItem('user')
        if (!userData) {
          router.push('/login')
          return
        }
        
        const user = JSON.parse(userData)
        setCurrentUser(user)
        
        // 加载班级数据
        const groupsResponse = await fetch(`/api/groups?teacherId=${user.id}`)
        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json()
          setGroups(groupsData.groups || [])
          
          // 如果有班级，选择第一个
          if (groupsData.groups && groupsData.groups.length > 0) {
            setSelectedGroup(groupsData.groups[0])
          }
        }
      } catch (error) {
        console.error('加载数据失败:', error)
        toast.error('加载数据失败')
      } finally {
        setLoading(false)
      }
    }
    
    loadUserAndData()
  }, [router])

  const handleAddScore = async (student: Student, points: number, reason?: string) => {
    if (reason) {
      // 直接加分，不需要弹窗
      try {
        const response = await fetch('/api/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: student.id,
            points: points,
            reason: reason
          })
        })

        if (response.ok) {
          toast.success(`已为 ${student.name} 加分 ${points} 分`)
          // 重新加载数据
          if (currentUser) {
            const groupsResponse = await fetch(`/api/groups?teacherId=${currentUser.id}`)
            if (groupsResponse.ok) {
              const groupsData = await groupsResponse.json()
              const updatedGroups = groupsData.groups || []
              console.log('Updated groups:', updatedGroups)
              setGroups(updatedGroups)
              
              // 更新选中的班级
              if (selectedGroup) {
                const updatedGroup = updatedGroups.find((g: Group) => g.id === selectedGroup.id)
                if (updatedGroup) {
                  console.log('Updated selected group:', updatedGroup)
                  setSelectedGroup(updatedGroup)
                }
              }
            }
          }
        } else {
          const errorData = await response.json()
          toast.error(errorData.message || '加分失败')
        }
      } catch (error) {
        toast.error('网络错误，请重试')
      }
    } else {
      // 自定义加分，需要弹窗
      setSelectedStudent(student)
      setScorePoints(Math.abs(points))
      setScoreReason('')
      setShowScoreModal(true)
    }
  }

  const confirmScore = async () => {
    if (!selectedStudent || !scoreReason.trim()) {
      toast.error('请输入备注原因')
      return
    }

    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          points: scorePoints,
          reason: scoreReason
        })
      })

      if (response.ok) {
        toast.success(`已为 ${selectedStudent.name} ${scorePoints > 0 ? '加分' : '减分'} ${Math.abs(scorePoints)} 分`)
        // 重新加载数据
        if (currentUser) {
          const groupsResponse = await fetch(`/api/groups?teacherId=${currentUser.id}`)
          if (groupsResponse.ok) {
            const groupsData = await groupsResponse.json()
            const updatedGroups = groupsData.groups || []
            setGroups(updatedGroups)
            
            // 更新选中的班级
            if (selectedGroup) {
              const updatedGroup = updatedGroups.find((g: Group) => g.id === selectedGroup.id)
              if (updatedGroup) {
                setSelectedGroup(updatedGroup)
              }
            }
          }
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || '更新分数失败')
      }
    } catch (error) {
      toast.error('网络错误，请重试')
    }

    setShowScoreModal(false)
    setSelectedStudent(null)
    setScoreReason('')
  }

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error('请输入班级名称')
      return
    }

    if (!currentUser) {
      toast.error('用户信息错误')
      return
    }

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDescription,
          teacherId: currentUser.id
        })
      })

      if (response.ok) {
        toast.success('班级创建成功')
        setNewGroupName('')
        setNewGroupDescription('')
        setShowAddGroup(false)
        
        // 重新加载班级数据
        const groupsResponse = await fetch(`/api/groups?teacherId=${currentUser.id}`)
        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json()
          setGroups(groupsData.groups || [])
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || '创建班级失败')
      }
    } catch (error) {
      toast.error('网络错误，请重试')
    }
  }

  const handleAddStudent = async () => {
    if (!newStudent.name.trim()) {
      toast.error('请输入学生姓名')
      return
    }

    if (!selectedGroup) {
      toast.error('请先选择班级')
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
          groupId: selectedGroup.id
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
          singleLegStand: ''
        })
        setShowAddStudentForm(false)
        
        // 重新加载班级数据
        if (currentUser) {
          const groupsResponse = await fetch(`/api/groups?teacherId=${currentUser.id}`)
          if (groupsResponse.ok) {
            const groupsData = await groupsResponse.json()
            setGroups(groupsData.groups || [])
            const updatedGroup = groupsData.groups.find((g: Group) => g.id === selectedGroup.id)
            if (updatedGroup) {
              setSelectedGroup(updatedGroup)
            }
          }
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || '添加学生失败')
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

  const sortedStudents = selectedGroup?.students.sort((a, b) => {
    if (sortBy === 'score') {
      return b.totalScore - a.totalScore
    }
    return a.name.localeCompare(b.name)
  }) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50">
      {/* 头部导航 */}
      <Navigation onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 小组选择 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">选择班级</h2>
          <div className="flex flex-wrap gap-4">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  selectedGroup?.id === group.id
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-pink-50 border-2 border-transparent hover:border-pink-200'
                }`}
              >
                {group.name}
                <span className="ml-2 text-sm opacity-80">
                  ({group.students.length}人)
                </span>
              </button>
            ))}
            <button 
              onClick={() => setShowAddGroup(true)}
              className="px-6 py-3 rounded-xl font-semibold bg-white text-gray-500 border-2 border-dashed border-gray-300 hover:border-pink-300 hover:text-pink-600 transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2 inline" />
              新建班级
            </button>
          </div>
        </div>

        {selectedGroup && (
          <>
            {/* 工具栏 */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {selectedGroup.name} - 学生管理
                </h3>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">排序:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'score')}
                    className="px-3 py-1 rounded-lg border border-gray-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                  >
                    <option value="score">按积分</option>
                    <option value="name">按姓名</option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => setShowAddStudentForm(true)}
                className="btn-primary"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                添加学生
              </button>
            </div>

            {/* 学生列表 */}
            <div className="space-y-4">
              {sortedStudents.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="student-card"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-800">{student.name}</h4>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
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
                      <div className="text-center">
                        <div className={`score-badge ${
                          student.totalScore > 0 ? 'score-positive' : 
                          student.totalScore < 0 ? 'score-negative' : 'score-neutral'
                        }`}>
                          <Trophy className="w-4 h-4 mr-1" />
                          {student.totalScore}分
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleAddScore(student, 3, '屈膝缓冲 降低重心')}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                        >
                          屈膝缓冲 +3
                        </button>
                        <button
                          onClick={() => handleAddScore(student, 2, '合作互助')}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                        >
                          合作互助 +2
                        </button>
                        <button
                          onClick={() => handleAddScore(student, 1, '认真学练')}
                          className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
                        >
                          认真学练 +1
                        </button>
                        <button
                          onClick={() => handleAddScore(student, 1, '大胆尝试')}
                          className="px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                        >
                          大胆尝试 +1
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(student)
                            setScorePoints(1)
                            setShowScoreModal(true)
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
          </>
        )}

        {/* 积分操作模态框 */}
        {showScoreModal && selectedStudent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                为 {selectedStudent.name} 加分
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    分数
                  </label>
                  <input
                    type="number"
                    value={scorePoints}
                    onChange={(e) => setScorePoints(Math.max(1, parseInt(e.target.value) || 1))}
                    className="input-field"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    备注原因
                  </label>
                  <textarea
                    value={scoreReason}
                    onChange={(e) => setScoreReason(e.target.value)}
                    className="input-field h-24 resize-none"
                    placeholder="请输入加分/减分的原因..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowScoreModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={confirmScore}
                  className="btn-primary"
                >
                  确定
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 创建班级模态框 */}
        {showAddGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">创建新班级</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    班级名称 *
                  </label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="input-field"
                    placeholder="请输入班级名称"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    班级描述
                  </label>
                  <textarea
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    className="input-field h-20 resize-none"
                    placeholder="请输入班级描述（可选）"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddGroup(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateGroup}
                  className="btn-primary"
                >
                  创建班级
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 添加学生模态框 */}
        {showAddStudentForm && (
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
                  onClick={() => setShowAddStudentForm(false)}
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
