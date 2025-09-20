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

  const handleLogout = () => {
    localStorage.removeItem('user')
    sessionStorage.clear()
    toast.success('已成功退出登录')
    router.push('/login')
  }

  // 模拟数据加载
  useEffect(() => {
    setTimeout(() => {
      setGroups([
        {
          id: '1',
          name: '三年级一班',
          students: [
            { id: '1', name: '小明', totalScore: 150, height: 120, weight: 25, heartRate: 80 },
            { id: '2', name: '小红', totalScore: 200, height: 118, weight: 23, heartRate: 85 },
            { id: '3', name: '小刚', totalScore: 120, height: 125, weight: 28, heartRate: 75 },
            { id: '4', name: '小丽', totalScore: 180, height: 115, weight: 22, heartRate: 90 },
            { id: '5', name: '小强', totalScore: 95, height: 130, weight: 30, heartRate: 70 }
          ]
        }
      ])
      setSelectedGroup({
        id: '1',
        name: '三年级一班',
        students: [
          { id: '1', name: '小明', totalScore: 150, height: 120, weight: 25, heartRate: 80 },
          { id: '2', name: '小红', totalScore: 200, height: 118, weight: 23, heartRate: 85 },
          { id: '3', name: '小刚', totalScore: 120, height: 125, weight: 28, heartRate: 75 },
          { id: '4', name: '小丽', totalScore: 180, height: 115, weight: 22, heartRate: 90 },
          { id: '5', name: '小强', totalScore: 95, height: 130, weight: 30, heartRate: 70 }
        ]
      })
    }, 1000)
  }, [])

  const generateAIReport = async () => {
    if (!selectedGroup) return
    
    setGeneratingReport(true)
    
    try {
      // 模拟AI报告生成
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const report = `
# ${selectedGroup.name} 班级分析报告

## 📊 整体表现概览
- **班级总人数**: ${selectedGroup.students.length}人
- **平均积分**: ${Math.round(selectedGroup.students.reduce((sum, s) => sum + s.totalScore, 0) / selectedGroup.students.length)}分
- **最高积分**: ${Math.max(...selectedGroup.students.map(s => s.totalScore))}分
- **最低积分**: ${Math.min(...selectedGroup.students.map(s => s.totalScore))}分

## 🏆 表现优秀学生
${selectedGroup.students
  .sort((a, b) => b.totalScore - a.totalScore)
  .slice(0, 3)
  .map((student, index) => `${index + 1}. ${student.name} - ${student.totalScore}分`)
  .join('\n')}

## 📈 学习建议
1. **积分管理**: 建议为积分较低的学生提供更多鼓励和帮助
2. **团队协作**: 可以组织小组活动，让高分学生帮助低分学生
3. **个性化关注**: 根据每个学生的特点制定不同的激励策略

## 💡 改进措施
- 增加课堂互动环节，提高学生参与度
- 建立积分兑换机制，增强学生积极性
- 定期组织班级活动，促进同学间的交流合作

---
*本报告由AI智能分析生成，仅供参考*
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

                {aiReport && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                  >
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                        {aiReport}
                      </pre>
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
