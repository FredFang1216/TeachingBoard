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
  heartRate?: number
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

  const handleLogout = () => {
    // 清除本地存储的用户信息
    localStorage.removeItem('user')
    sessionStorage.clear()
    
    // 显示退出成功消息
    toast.success('已成功退出登录')
    
    // 跳转到登录页面
    router.push('/login')
  }

  // 模拟数据加载
  useEffect(() => {
    // 模拟从API加载数据
    setTimeout(() => {
      setGroups([
        {
          id: '1',
          name: '三年级一班',
          students: [
            {
              id: '1',
              name: '小明',
              height: 120,
              weight: 25,
              heartRate: 80,
              totalScore: 150,
              scoreRecords: []
            },
            {
              id: '2',
              name: '小红',
              height: 118,
              weight: 23,
              heartRate: 85,
              totalScore: 200,
              scoreRecords: []
            },
            {
              id: '3',
              name: '小刚',
              height: 125,
              weight: 28,
              heartRate: 75,
              totalScore: 120,
              scoreRecords: []
            }
          ]
        }
      ])
      setSelectedGroup({
        id: '1',
        name: '三年级一班',
        students: [
          {
            id: '1',
            name: '小明',
            height: 120,
            weight: 25,
            heartRate: 80,
            totalScore: 150,
            scoreRecords: []
          },
          {
            id: '2',
            name: '小红',
            height: 118,
            weight: 23,
            heartRate: 85,
            totalScore: 200,
            scoreRecords: []
          },
          {
            id: '3',
            name: '小刚',
            height: 125,
            weight: 28,
            heartRate: 75,
            totalScore: 120,
            scoreRecords: []
          }
        ]
      })
      setLoading(false)
    }, 1000)
  }, [])

  const handleAddScore = (student: Student, points: number) => {
    setSelectedStudent(student)
    setScorePoints(Math.abs(points))
    setScoreReason('')
    setShowScoreModal(true)
  }

  const confirmScore = async () => {
    if (!selectedStudent || !scoreReason.trim()) {
      toast.error('请输入备注原因')
      return
    }

    // 这里应该调用API更新分数
    toast.success(`已为 ${selectedStudent.name} ${scorePoints > 0 ? '加分' : '减分'} ${Math.abs(scorePoints)} 分`)
    setShowScoreModal(false)
    setSelectedStudent(null)
    setScoreReason('')
  }

  const sortedStudents = selectedGroup?.students.sort((a, b) => {
    if (sortBy === 'score') {
      return b.totalScore - a.totalScore
    }
    return a.name.localeCompare(b.name)
  }) || []

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
            <button className="px-6 py-3 rounded-xl font-semibold bg-white text-gray-500 border-2 border-dashed border-gray-300 hover:border-pink-300 hover:text-pink-600 transition-all duration-200">
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
                onClick={() => setShowAddStudent(true)}
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
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {student.height && <span>身高: {student.height}cm</span>}
                          {student.weight && <span>体重: {student.weight}kg</span>}
                          {student.heartRate && <span>心率: {student.heartRate}bpm</span>}
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
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAddScore(student, 1)}
                          className="btn-success"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => handleAddScore(student, 5)}
                          className="btn-success"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => handleAddScore(student, 10)}
                          className="btn-success"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => handleAddScore(student, -1)}
                          className="btn-danger"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handleAddScore(student, -5)}
                          className="btn-danger"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => handleAddScore(student, -10)}
                          className="btn-danger"
                        >
                          -10
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
                为 {selectedStudent.name} {scorePoints > 0 ? '加分' : '减分'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    分数
                  </label>
                  <input
                    type="number"
                    value={scorePoints}
                    onChange={(e) => setScorePoints(parseInt(e.target.value) || 0)}
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
      </div>
    </div>
  )
}
