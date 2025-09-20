'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  Trophy, 
  Heart,
  Sparkles,
  Download,
  RefreshCw
} from 'lucide-react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import toast from 'react-hot-toast'
import Navigation from '@/components/Navigation'
import { useRouter } from 'next/navigation'

// 注册Chart.js组件
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

interface Student {
  id: string
  name: string
  totalScore: number
  height?: number
  weight?: number
  heartRate?: number
}

interface Group {
  id: string
  name: string
  students: Student[]
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [aiReport, setAiReport] = useState('')
  const [generatingReport, setGeneratingReport] = useState(false)
  const [activeTab, setActiveTab] = useState<'charts' | 'ai-report'>('charts')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const handleLogout = () => {
    localStorage.removeItem('user')
    sessionStorage.clear()
    toast.success('已成功退出登录')
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

  const generateAIReport = async () => {
    if (!selectedGroup) return
    
    setGeneratingReport(true)
    
    try {
      // 模拟AI报告生成（实际项目中可以调用真实的AI API）
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const students = selectedGroup.students
      const totalStudents = students.length
      const totalScore = students.reduce((sum, s) => sum + s.totalScore, 0)
      const averageScore = Math.round(totalScore / totalStudents)
      const maxScore = Math.max(...students.map(s => s.totalScore))
      const minScore = Math.min(...students.map(s => s.totalScore))
      
      // 计算表现等级分布
      const excellent = students.filter(s => s.totalScore >= 180).length
      const good = students.filter(s => s.totalScore >= 120 && s.totalScore < 180).length
      const average = students.filter(s => s.totalScore >= 80 && s.totalScore < 120).length
      const needsImprovement = students.filter(s => s.totalScore < 80).length
      
      // 计算身体指标统计
      const heights = students.filter(s => s.height).map(s => s.height!)
      const weights = students.filter(s => s.weight).map(s => s.weight!)
      const heartRates = students.filter(s => s.heartRate).map(s => s.heartRate!)
      
      const avgHeight = heights.length > 0 ? Math.round(heights.reduce((sum, h) => sum + h, 0) / heights.length) : 0
      const avgWeight = weights.length > 0 ? Math.round(weights.reduce((sum, w) => sum + w, 0) / weights.length) : 0
      const avgHeartRate = heartRates.length > 0 ? Math.round(heartRates.reduce((sum, h) => sum + h, 0) / heartRates.length) : 0
      
      const report = `
# ${selectedGroup.name} 班级分析报告

## 📊 整体表现概览
- **班级总人数**: ${totalStudents}人
- **平均积分**: ${averageScore}分
- **最高积分**: ${maxScore}分
- **最低积分**: ${minScore}分
- **积分范围**: ${maxScore - minScore}分

## 🏆 表现等级分布
- **优秀 (180分以上)**: ${excellent}人 (${Math.round(excellent/totalStudents*100)}%)
- **良好 (120-179分)**: ${good}人 (${Math.round(good/totalStudents*100)}%)
- **一般 (80-119分)**: ${average}人 (${Math.round(average/totalStudents*100)}%)
- **待提升 (80分以下)**: ${needsImprovement}人 (${Math.round(needsImprovement/totalStudents*100)}%)

## 📏 身体指标统计
- **平均身高**: ${avgHeight}cm
- **平均体重**: ${avgWeight}kg
- **平均心率**: ${avgHeartRate}bpm

## 🎯 重点关注学生
${students.filter(s => s.totalScore < 100).map(s => `- **${s.name}**: ${s.totalScore}分 (需要更多鼓励和支持)`).join('\n') || '- 所有学生表现良好！'}

## 💡 建议与改进
${needsImprovement > 0 ? 
  `- 建议为表现较差的学生提供额外的学习支持和鼓励
- 可以设置小组学习，让优秀学生帮助需要提升的学生
- 定期进行一对一沟通，了解学生困难` :
  `- 班级整体表现优秀，继续保持！
- 可以设置更高难度的挑战来激励学生
- 鼓励学生之间互相学习，共同进步`}

## 📈 下阶段目标
- 提高班级平均分至 ${averageScore + 20} 分
- 减少待提升学生数量至 ${Math.max(0, needsImprovement - 1)} 人
- 保持优秀学生比例在 ${Math.round(excellent/totalStudents*100)}% 以上

---
*报告生成时间: ${new Date().toLocaleString('zh-CN')}*
*数据来源: 教学管理系统*
      `
      
      setAiReport(report)
      toast.success('AI报告生成完成！')
    } catch (error) {
      toast.error('报告生成失败，请重试')
    } finally {
      setGeneratingReport(false)
    }
  }

  const chartData = selectedGroup ? {
    labels: selectedGroup.students.map(s => s.name),
    datasets: [
      {
        label: '积分',
        data: selectedGroup.students.map(s => s.totalScore),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 2,
        borderRadius: 8,
      }
    ]
  } : null

  const pieData = selectedGroup ? {
    labels: ['优秀(150分以上)', '良好(100-150分)', '待提高(100分以下)'],
    datasets: [
      {
        data: [
          selectedGroup.students.filter(s => s.totalScore >= 150).length,
          selectedGroup.students.filter(s => s.totalScore >= 100 && s.totalScore < 150).length,
          selectedGroup.students.filter(s => s.totalScore < 100).length,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      }
    ]
  } : null

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '学生积分分布图',
        font: {
          size: 16,
          weight: 'bold' as const,
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    }
  }

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: '学生表现等级分布',
        font: {
          size: 16,
          weight: 'bold' as const,
        }
      },
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
          </div>
        </div>

        {selectedGroup && (
          <>
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card text-center"
              >
                <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-800">{selectedGroup.students.length}</h3>
                <p className="text-gray-600">总人数</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card text-center"
              >
                <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-800">
                  {Math.round(selectedGroup.students.reduce((sum, s) => sum + s.totalScore, 0) / selectedGroup.students.length)}
                </h3>
                <p className="text-gray-600">平均积分</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card text-center"
              >
                <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-800">
                  {Math.max(...selectedGroup.students.map(s => s.totalScore))}
                </h3>
                <p className="text-gray-600">最高积分</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card text-center"
              >
                <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-800">
                  {selectedGroup.students.filter(s => s.totalScore >= 150).length}
                </h3>
                <p className="text-gray-600">优秀学生</p>
              </motion.div>
            </div>

            {/* 标签页 */}
            <div className="mb-6">
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setActiveTab('charts')}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                    activeTab === 'charts' 
                      ? 'bg-white text-pink-600 shadow-sm' 
                      : 'text-gray-600 hover:text-pink-600'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-2 inline" />
                  图表分析
                </button>
                <button
                  onClick={() => setActiveTab('ai-report')}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                    activeTab === 'ai-report' 
                      ? 'bg-white text-pink-600 shadow-sm' 
                      : 'text-gray-600 hover:text-pink-600'
                  }`}
                >
                  <Sparkles className="w-4 h-4 mr-2 inline" />
                  AI智能报告
                </button>
              </div>
            </div>

            {/* 图表分析 */}
            {activeTab === 'charts' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="card"
                >
                  <h3 className="text-lg font-bold text-gray-800 mb-4">学生积分柱状图</h3>
                  {chartData && <Bar data={chartData} options={chartOptions} />}
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="card"
                >
                  <h3 className="text-lg font-bold text-gray-800 mb-4">学生表现等级分布</h3>
                  {pieData && <Pie data={pieData} options={pieOptions} />}
                </motion.div>
              </div>
            )}

            {/* AI智能报告 */}
            {activeTab === 'ai-report' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-800">AI智能分析报告</h3>
                  <div className="flex space-x-3">
                    {aiReport && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(aiReport)
                          toast.success('报告已复制到剪贴板')
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        复制报告
                      </button>
                    )}
                    <button
                      onClick={generateAIReport}
                      disabled={generatingReport}
                      className="btn-primary"
                    >
                      {generatingReport ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          生成报告
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {aiReport && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                  >
                    <div className="prose max-w-none prose-headings:text-gray-800 prose-headings:font-bold prose-p:text-gray-700 prose-ul:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-800 prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {aiReport}
                      </ReactMarkdown>
                    </div>
                  </motion.div>
                )}

                {!aiReport && !generatingReport && (
                  <div className="card text-center py-12">
                    <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">AI智能报告</h3>
                    <p className="text-gray-500 mb-6">
                      点击上方按钮生成基于班级数据的AI分析报告
                    </p>
                    <button
                      onClick={generateAIReport}
                      className="btn-primary"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      开始生成
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
