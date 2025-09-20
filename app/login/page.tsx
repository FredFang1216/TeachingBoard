'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart, Users, Trophy, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!isLogin && formData.password !== formData.confirmPassword) {
        toast.error('密码不匹配')
        return
      }

      const url = isLogin ? '/api/auth/login' : '/api/auth/register'
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(isLogin ? '登录成功！' : '注册成功！')
        
        // 保存用户信息到localStorage
        if (isLogin && data.user) {
          localStorage.setItem('user', JSON.stringify(data.user))
        }
        
        router.push('/dashboard')
      } else {
        toast.error(data.message || '操作失败')
      }
    } catch (error) {
      toast.error('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 头部装饰 */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center items-center space-x-2 mb-4">
            <Heart className="w-8 h-8 text-pink-500 animate-pulse" />
            <Sparkles className="w-6 h-6 text-purple-500 animate-bounce" />
            <Users className="w-8 h-8 text-blue-500 animate-pulse" />
            <Trophy className="w-6 h-6 text-yellow-500 animate-bounce" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
            AI课堂小工具
          </h1>
          <p className="text-gray-600 text-lg">
            让教学更智能，让互动更有趣 ✨
          </p>
        </motion.div>

        {/* 登录/注册卡片 */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card"
        >
          {/* 切换按钮 */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                isLogin 
                  ? 'bg-white text-pink-600 shadow-sm' 
                  : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                !isLogin 
                  ? 'bg-white text-pink-600 shadow-sm' 
                  : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              注册
            </button>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  姓名
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="请输入您的姓名"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                邮箱
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input-field"
                placeholder="请输入邮箱地址"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                密码
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="input-field"
                placeholder="请输入密码"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  确认密码
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="请再次输入密码"
                  required={!isLogin}
                />
              </div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full ${isLogin ? 'btn-primary' : 'btn-secondary'} ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  处理中...
                </div>
              ) : (
                isLogin ? '登录' : '注册'
              )}
            </motion.button>
          </form>

          {/* 底部提示 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {isLogin ? '还没有账号？' : '已有账号？'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 text-pink-600 hover:text-pink-700 font-semibold"
              >
                {isLogin ? '立即注册' : '立即登录'}
              </button>
            </p>
          </div>
        </motion.div>

        {/* 功能特色 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-2 gap-4"
        >
          <div className="text-center p-4 bg-white/50 rounded-xl backdrop-blur-sm">
            <Heart className="w-6 h-6 text-pink-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">学生管理</p>
          </div>
          <div className="text-center p-4 bg-white/50 rounded-xl backdrop-blur-sm">
            <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">积分系统</p>
          </div>
          <div className="text-center p-4 bg-white/50 rounded-xl backdrop-blur-sm">
            <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">小组协作</p>
          </div>
          <div className="text-center p-4 bg-white/50 rounded-xl backdrop-blur-sm">
            <Sparkles className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">AI报告</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
