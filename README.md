# AI课堂互动小工具

一个基于Next.js开发的AI赋能教学课堂互动小工具，支持学生管理、积分系统、数据分析和AI智能报告生成。

## ✨ 功能特色

- 🎓 **学生管理**: 支持添加、编辑学生信息（身高、体重、心率等）
- 🏆 **积分系统**: 灵活的加分减分机制，支持备注记录
- 📊 **数据分析**: 可视化图表展示班级和学生表现
- 🤖 **AI报告**: 智能生成个人和班级分析报告
- 👥 **多用户支持**: 教师和管理员账户管理
- 📱 **响应式设计**: 支持各种设备访问
- 🎨 **可爱UI**: 圆角设计，色彩丰富，用户体验友好

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- npm 或 yarn
- SQLite数据库

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <your-repo-url>
   cd ai-classroom-tool
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   ```bash
   cp env.example .env.local
   ```
   
   编辑 `.env.local` 文件，配置必要的环境变量：
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   OPENAI_API_KEY="your-openai-api-key-here"
   ```

4. **初始化数据库**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **启动开发服务器**
   ```bash
   npm run dev
   ```

6. **访问应用**
   打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 📦 部署到Vercel

### 方法一：通过Vercel CLI

1. **安装Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   vercel
   ```

### 方法二：通过Vercel网站

1. 将代码推送到GitHub仓库
2. 在Vercel网站导入项目
3. 配置环境变量
4. 部署

### 环境变量配置

在Vercel项目设置中配置以下环境变量：

- `DATABASE_URL`: 数据库连接字符串（建议使用PlanetScale或Supabase）
- `NEXTAUTH_URL`: 你的域名
- `NEXTAUTH_SECRET`: 随机生成的密钥
- `OPENAI_API_KEY`: OpenAI API密钥（用于AI报告生成）

## 🗄️ 数据库配置

### 本地开发
使用SQLite数据库，数据存储在 `prisma/dev.db` 文件中。

### 生产环境
建议使用以下数据库服务：
- **PlanetScale** (推荐)
- **Supabase**
- **Railway**
- **Neon**

## 🎯 使用指南

### 教师账户
1. 注册教师账户
2. 创建班级
3. 添加学生信息
4. 管理学生积分
5. 查看数据分析

### 管理员账户
1. 拥有所有教师权限
2. 访问数据分析中心
3. 生成AI智能报告
4. 导出数据报告

## 🛠️ 技术栈

- **前端**: Next.js 14, React 18, TypeScript
- **样式**: Tailwind CSS, Framer Motion
- **数据库**: Prisma ORM, SQLite
- **认证**: NextAuth.js
- **图表**: Chart.js, React-Chartjs-2
- **AI**: OpenAI API
- **部署**: Vercel

## 📁 项目结构

```
ai-classroom-tool/
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   ├── analytics/         # 数据分析页面
│   ├── dashboard/         # 仪表板页面
│   ├── login/            # 登录页面
│   └── globals.css       # 全局样式
├── components/            # React组件
├── lib/                  # 工具函数
│   ├── auth.ts          # 认证相关
│   └── prisma.ts        # 数据库连接
├── prisma/              # 数据库模式
│   └── schema.prisma    # Prisma模式文件
└── public/              # 静态资源
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🆘 支持

如果你遇到任何问题或有任何建议，请：

1. 查看 [Issues](https://github.com/your-repo/issues) 页面
2. 创建新的 Issue
3. 联系开发团队

## 🔮 未来计划

- [ ] 移动端App
- [ ] 更多AI功能
- [ ] 实时通知系统
- [ ] 多语言支持
- [ ] 高级数据分析
- [ ] 家长端查看功能

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
