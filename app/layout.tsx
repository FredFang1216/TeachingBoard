import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI课堂互动小工具',
  description: 'AI赋能教学的课堂互动小工具，支持学生管理和积分系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#333',
              borderRadius: '12px',
              border: '2px solid #f3f4f6',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            },
          }}
        />
      </body>
    </html>
  )
}
