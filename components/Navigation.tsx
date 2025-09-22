'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Home, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut,
  Heart,
  Shield
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface NavigationProps {
  onLogout?: () => void
}

export default function Navigation({ onLogout }: NavigationProps) {
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setCurrentUser(JSON.parse(userData))
    }
  }, [])

  const navItems = [
    { href: '/dashboard', label: '学生管理', icon: Users },
    { href: '/analytics', label: '数据分析', icon: BarChart3 },
    { href: '/settings', label: '设置', icon: Settings },
  ]

  // 如果是管理员，替换为管理员专用页面
  if (currentUser?.role === 'ADMIN') {
    navItems[0] = { href: '/admin-dashboard', label: '学生管理', icon: Users }
    navItems[1] = { href: '/admin-analytics', label: '数据分析', icon: BarChart3 }
    navItems.push({ href: '/admin', label: '管理控制台', icon: Shield })
  }

  return (
    <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3">
            <Heart className="w-8 h-8 text-pink-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              AI课堂小工具
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>退出</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
