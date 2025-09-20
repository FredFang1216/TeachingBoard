'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  Download,
  Upload,
  Save
} from 'lucide-react'
import Navigation from '@/components/Navigation'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { exportStudentsToExcel, importStudentsFromExcel, exportScoreRecordsToExcel } from '@/lib/excel'

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [settings, setSettings] = useState({
    profile: {
      name: '张老师',
      email: 'teacher@example.com',
      role: '教师'
    },
    notifications: {
      scoreUpdates: true,
      newStudents: true,
      weeklyReport: false,
      emailNotifications: true
    },
    appearance: {
      theme: 'light',
      language: 'zh-CN',
      fontSize: 'medium'
    }
  })

  const handleLogout = () => {
    localStorage.removeItem('user')
    sessionStorage.clear()
    toast.success('已成功退出登录')
    router.push('/login')
  }

  const handleSave = () => {
    toast.success('设置已保存！')
  }

  const handleExport = async () => {
    try {
      // 模拟获取数据 - 在实际应用中，这里应该从API获取真实数据
      const mockGroups = [
        {
          id: '1',
          name: '三年级一班',
          description: '示例班级',
          teacherId: 'teacher1',
          students: [
            {
              id: '1',
              name: '小明',
              height: 120,
              weight: 25,
              heartRate: 80,
              totalScore: 150,
              groupId: '1',
              groupName: '三年级一班',
              scoreRecords: [
                { points: 10, reason: '课堂表现优秀', createdAt: new Date().toISOString() },
                { points: -5, reason: '作业未完成', createdAt: new Date().toISOString() }
              ]
            },
            {
              id: '2',
              name: '小红',
              height: 118,
              weight: 23,
              heartRate: 85,
              totalScore: 200,
              groupId: '1',
              groupName: '三年级一班',
              scoreRecords: [
                { points: 15, reason: '帮助同学', createdAt: new Date().toISOString() },
                { points: 10, reason: '回答问题积极', createdAt: new Date().toISOString() }
              ]
            }
          ]
        }
      ]
      
      const success = exportStudentsToExcel(mockGroups)
      if (success) {
        toast.success('学生数据导出成功！')
      } else {
        toast.error('导出失败，请重试')
      }
    } catch (error) {
      toast.error('导出失败，请重试')
    }
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.xlsx,.xls'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          const students = await importStudentsFromExcel(file)
          console.log('导入的学生数据:', students)
          toast.success(`成功导入 ${students.length} 名学生数据！`)
        } catch (error) {
          toast.error('导入失败，请检查文件格式')
        }
      }
    }
    input.click()
  }

  const handleExportScoreRecords = async () => {
    try {
      // 模拟获取数据
      const mockGroups = [
        {
          id: '1',
          name: '三年级一班',
          description: '示例班级',
          teacherId: 'teacher1',
          students: [
            {
              id: '1',
              name: '小明',
              height: 120,
              weight: 25,
              heartRate: 80,
              totalScore: 150,
              groupId: '1',
              groupName: '三年级一班',
              scoreRecords: [
                { points: 10, reason: '课堂表现优秀', createdAt: new Date().toISOString() },
                { points: -5, reason: '作业未完成', createdAt: new Date().toISOString() }
              ]
            }
          ]
        }
      ]
      
      const success = exportScoreRecordsToExcel(mockGroups)
      if (success) {
        toast.success('积分记录导出成功！')
      } else {
        toast.error('导出失败，请重试')
      }
    } catch (error) {
      toast.error('导出失败，请重试')
    }
  }

  const handleResetData = async () => {
    if (confirm('确定要重置所有数据吗？此操作不可恢复！')) {
      try {
        const response = await fetch('/api/data/reset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const data = await response.json()

        if (response.ok) {
          toast.success('数据重置成功！已恢复默认数据')
          console.log('重置后的账户信息:', data)
        } else {
          toast.error(data.message || '重置失败')
        }
      } catch (error) {
        toast.error('重置失败，请重试')
      }
    }
  }

  const tabs = [
    { id: 'profile', label: '个人资料', icon: User },
    { id: 'notifications', label: '通知设置', icon: Bell },
    { id: 'appearance', label: '外观设置', icon: Palette },
    { id: 'data', label: '数据管理', icon: Database },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50">
      <Navigation onLogout={handleLogout} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">设置</h1>
          <p className="text-gray-600">管理您的账户和应用程序设置</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 侧边栏 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                          : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* 主内容区 */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              {/* 个人资料 */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">个人资料</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        姓名
                      </label>
                      <input
                        type="text"
                        value={settings.profile.name}
                        onChange={(e) => setSettings({
                          ...settings,
                          profile: { ...settings.profile, name: e.target.value }
                        })}
                        className="input-field"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        邮箱
                      </label>
                      <input
                        type="email"
                        value={settings.profile.email}
                        onChange={(e) => setSettings({
                          ...settings,
                          profile: { ...settings.profile, email: e.target.value }
                        })}
                        className="input-field"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        角色
                      </label>
                      <input
                        type="text"
                        value={settings.profile.role}
                        disabled
                        className="input-field bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 通知设置 */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">通知设置</h2>
                  
                  <div className="space-y-4">
                    {Object.entries(settings.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {key === 'scoreUpdates' && '积分更新通知'}
                            {key === 'newStudents' && '新学生加入通知'}
                            {key === 'weeklyReport' && '周报通知'}
                            {key === 'emailNotifications' && '邮件通知'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {key === 'scoreUpdates' && '当学生积分发生变化时通知'}
                            {key === 'newStudents' && '当有新学生加入班级时通知'}
                            {key === 'weeklyReport' && '每周发送班级报告'}
                            {key === 'emailNotifications' && '通过邮件接收重要通知'}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setSettings({
                              ...settings,
                              notifications: { ...settings.notifications, [key]: e.target.checked }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 外观设置 */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">外观设置</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        主题
                      </label>
                      <div className="flex space-x-4">
                        {['light', 'dark', 'auto'].map((theme) => (
                          <button
                            key={theme}
                            onClick={() => setSettings({
                              ...settings,
                              appearance: { ...settings.appearance, theme }
                            })}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                              settings.appearance.theme === theme
                                ? 'bg-pink-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {theme === 'light' && '浅色'}
                            {theme === 'dark' && '深色'}
                            {theme === 'auto' && '自动'}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        语言
                      </label>
                      <select
                        value={settings.appearance.language}
                        onChange={(e) => setSettings({
                          ...settings,
                          appearance: { ...settings.appearance, language: e.target.value }
                        })}
                        className="input-field"
                      >
                        <option value="zh-CN">简体中文</option>
                        <option value="en-US">English</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        字体大小
                      </label>
                      <div className="flex space-x-4">
                        {['small', 'medium', 'large'].map((size) => (
                          <button
                            key={size}
                            onClick={() => setSettings({
                              ...settings,
                              appearance: { ...settings.appearance, fontSize: size }
                            })}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                              settings.appearance.fontSize === size
                                ? 'bg-pink-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {size === 'small' && '小'}
                            {size === 'medium' && '中'}
                            {size === 'large' && '大'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 数据管理 */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">数据管理</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-blue-50 rounded-xl">
                      <Download className="w-8 h-8 text-blue-500 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">导出学生数据</h3>
                      <p className="text-gray-600 mb-4">导出所有学生基本信息和积分数据</p>
                      <button
                        onClick={handleExport}
                        className="btn-primary"
                      >
                        导出学生数据
                      </button>
                    </div>
                    
                    <div className="p-6 bg-purple-50 rounded-xl">
                      <Download className="w-8 h-8 text-purple-500 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">导出积分记录</h3>
                      <p className="text-gray-600 mb-4">导出详细的积分变化记录</p>
                      <button
                        onClick={handleExportScoreRecords}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        导出积分记录
                      </button>
                    </div>
                    
                    <div className="p-6 bg-green-50 rounded-xl">
                      <Upload className="w-8 h-8 text-green-500 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">导入学生数据</h3>
                      <p className="text-gray-600 mb-4">从Excel文件导入学生数据</p>
                      <button
                        onClick={handleImport}
                        className="btn-secondary"
                      >
                        导入学生数据
                      </button>
                    </div>
                    
                    <div className="p-6 bg-yellow-50 rounded-xl">
                      <Database className="w-8 h-8 text-yellow-500 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">数据备份</h3>
                      <p className="text-gray-600 mb-4">创建完整的数据备份</p>
                      <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                      >
                        创建备份
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-red-50 rounded-xl">
                    <Shield className="w-8 h-8 text-red-500 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">重置数据</h3>
                    <p className="text-gray-600 mb-4">清空所有数据，此操作不可恢复</p>
                    <button 
                      onClick={handleResetData}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      重置数据
                    </button>
                  </div>
                  
                  {/* Excel模板下载 */}
                  <div className="p-6 bg-gray-50 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Excel模板</h3>
                    <p className="text-gray-600 mb-4">
                      下载Excel模板文件，按照模板格式填写学生数据后导入
                    </p>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => {
                          // 创建模板文件
                          const templateData = [
                            ['姓名', '身高(cm)', '体重(kg)', '心率(bpm)', '总积分', '积分记录'],
                            ['示例学生1', 120, 25, 80, 100, ''],
                            ['示例学生2', 118, 23, 85, 150, '']
                          ]
                          
                          const workbook = XLSX.utils.book_new()
                          const worksheet = XLSX.utils.aoa_to_sheet(templateData)
                          XLSX.utils.book_append_sheet(workbook, worksheet, '学生数据模板')
                          
                          const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
                          const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
                          
                          const link = document.createElement('a')
                          link.href = URL.createObjectURL(data)
                          link.download = '学生数据导入模板.xlsx'
                          link.click()
                        }}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        下载模板
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 保存按钮 */}
              <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  className="btn-primary"
                >
                  <Save className="w-4 h-4 mr-2" />
                  保存设置
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
