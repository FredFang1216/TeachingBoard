'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen,
  Target,
  Award,
  Activity,
  Heart,
  Ruler,
  Weight
} from 'lucide-react'
import toast from 'react-hot-toast'
import Navigation from '@/components/Navigation'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const [allGroups, setAllGroups] = useState<Group[]>([])
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [generatingReport, setGeneratingReport] = useState(false)
  const [aiReport, setAiReport] = useState('')
  const [showReport, setShowReport] = useState(false)

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

  // 生成AI报告
  const generateAIReport = async () => {
    if (allStudents.length === 0) {
      toast.error('没有学生数据，无法生成报告')
      return
    }
    
    setGeneratingReport(true)
    
    try {
      // 准备数据 - 包含所有班级的学生
      const data = {
        className: '全校学生',
        studentCount: allStudents.length,
        students: allStudents.map(s => ({
          name: s.name,
          score: s.totalScore,
          height: s.height,
          weight: s.weight,
          heartRate: s.heartRate,
          groupName: s.groupName,
          teacherName: s.teacherName
        }))
      }
      
      // 调用AI API
      const response = await fetch('/api/ai/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      })
      
      if (response.ok) {
        const result = await response.json()
        setAiReport(result.report)
        setShowReport(true)
        toast.success('AI报告生成成功')
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'AI报告生成失败')
      }
    } catch (error) {
      console.error('AI报告生成失败:', error)
      toast.error('AI报告生成失败')
    } finally {
      setGeneratingReport(false)
    }
  }

  // 复制报告
  const copyReport = () => {
    navigator.clipboard.writeText(aiReport)
    toast.success('报告已复制到剪贴板')
  }

  // 计算统计数据
  const totalStudents = allStudents.length
  const totalGroups = allGroups.length
  const averageScore = totalStudents > 0 
    ? Math.round(allStudents.reduce((sum, s) => sum + s.totalScore, 0) / totalStudents)
    : 0
  const maxScore = totalStudents > 0 ? Math.max(...allStudents.map(s => s.totalScore)) : 0
  const minScore = totalStudents > 0 ? Math.min(...allStudents.map(s => s.totalScore)) : 0

  // 按积分等级分类
  const excellent = allStudents.filter(s => s.totalScore >= 180).length
  const good = allStudents.filter(s => s.totalScore >= 120 && s.totalScore < 180).length
  const average = allStudents.filter(s => s.totalScore >= 80 && s.totalScore < 120).length
  const needsImprovement = allStudents.filter(s => s.totalScore < 80).length

  // 身体指标统计
  const studentsWithHeight = allStudents.filter(s => s.height).length
  const studentsWithWeight = allStudents.filter(s => s.weight).length
  const studentsWithHeartRate = allStudents.filter(s => s.heartRate).length

  const avgHeight = studentsWithHeight > 0 
    ? Math.round(allStudents.filter(s => s.height).reduce((sum, s) => sum + (s.height || 0), 0) / studentsWithHeight)
    : 0

  const avgWeight = studentsWithWeight > 0 
    ? Math.round(allStudents.filter(s => s.weight).reduce((sum, s) => sum + (s.weight || 0), 0) / studentsWithWeight)
    : 0

  const avgHeartRate = studentsWithHeartRate > 0 
    ? Math.round(allStudents.filter(s => s.heartRate).reduce((sum, s) => sum + (s.heartRate || 0), 0) / studentsWithHeartRate)
    : 0

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">数据分析 - 管理员视图</h1>
          <p className="text-gray-600">全校学生数据分析和AI智能报告</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <p className="text-2xl font-bold text-gray-900">{totalGroups}</p>
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
                <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
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
                <p className="text-2xl font-bold text-gray-900">{averageScore}</p>
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
                <Award className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">最高积分</p>
                <p className="text-2xl font-bold text-gray-900">{maxScore}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 详细统计 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 积分分布 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">积分分布</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">优秀 (180分以上)</span>
                <span className="font-semibold text-green-600">{excellent}人 ({Math.round(excellent/totalStudents*100)}%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">良好 (120-179分)</span>
                <span className="font-semibold text-blue-600">{good}人 ({Math.round(good/totalStudents*100)}%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">一般 (80-119分)</span>
                <span className="font-semibold text-yellow-600">{average}人 ({Math.round(average/totalStudents*100)}%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">待提升 (80分以下)</span>
                <span className="font-semibold text-red-600">{needsImprovement}人 ({Math.round(needsImprovement/totalStudents*100)}%)</span>
              </div>
            </div>
          </motion.div>

          {/* 身体指标 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">身体指标统计</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">平均身高</span>
                <span className="font-semibold text-gray-800">{avgHeight}cm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">平均体重</span>
                <span className="font-semibold text-gray-800">{avgWeight}kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">平均心率</span>
                <span className="font-semibold text-gray-800">{avgHeartRate}bpm</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 班级统计 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-sm mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">各班级统计</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">班级名称</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">教师</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">学生数</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">平均积分</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">最高积分</th>
                </tr>
              </thead>
              <tbody>
                {allGroups.map((group) => {
                  const groupStudents = allStudents.filter(s => s.groupId === group.id)
                  const groupAvgScore = groupStudents.length > 0 
                    ? Math.round(groupStudents.reduce((sum, s) => sum + s.totalScore, 0) / groupStudents.length)
                    : 0
                  const groupMaxScore = groupStudents.length > 0 
                    ? Math.max(...groupStudents.map(s => s.totalScore))
                    : 0
                  
                  return (
                    <tr key={group.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">{group.name}</td>
                      <td className="py-3 px-4 text-gray-600">{group.teacher.name}</td>
                      <td className="py-3 px-4 text-gray-600">{groupStudents.length}</td>
                      <td className="py-3 px-4 text-gray-600">{groupAvgScore}</td>
                      <td className="py-3 px-4 text-gray-600">{groupMaxScore}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* AI报告生成 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">AI智能分析报告</h3>
            <div className="flex space-x-2">
              <button
                onClick={generateAIReport}
                disabled={generatingReport || totalStudents === 0}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingReport ? '生成中...' : '生成AI报告'}
              </button>
              {aiReport && (
                <button
                  onClick={copyReport}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  复制报告
                </button>
              )}
            </div>
          </div>

          {aiReport ? (
            <div className="prose max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {aiReport}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>点击上方按钮生成全校学生AI分析报告</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
