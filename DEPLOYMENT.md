# 部署指南

## 🚀 本地开发

### 快速开始
```bash
# 1. 安装依赖
npm install

# 2. 初始化数据库
npm run setup

# 3. 启动开发服务器
npm run dev
```

### 访问应用
- 主页: http://localhost:3000
- 登录页: http://localhost:3000/login
- 仪表板: http://localhost:3000/dashboard
- 数据分析: http://localhost:3000/analytics
- 设置: http://localhost:3000/settings

### 测试账户
- 管理员: admin@example.com / admin123
- 教师: teacher@example.com / teacher123

## 🌐 部署到Vercel

### 方法一：通过Vercel CLI
```bash
# 1. 安装Vercel CLI
npm i -g vercel

# 2. 登录Vercel
vercel login

# 3. 部署
vercel

# 4. 配置环境变量
vercel env add DATABASE_URL
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
```

### 方法二：通过GitHub + Vercel网站
1. 将代码推送到GitHub仓库
2. 在Vercel网站导入项目
3. 配置环境变量
4. 部署

### 环境变量配置
在Vercel项目设置中配置以下环境变量：

```env
# 数据库配置（推荐使用PlanetScale或Supabase）
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth配置
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-secret-key-here"

# OpenAI API配置（可选，用于AI报告生成）
OPENAI_API_KEY="your-openai-api-key-here"
```

## 🗄️ 数据库配置

### 本地开发
使用SQLite数据库，数据存储在 `prisma/dev.db` 文件中。

### 生产环境
推荐使用以下数据库服务：

#### PlanetScale (推荐)
1. 注册PlanetScale账户
2. 创建新数据库
3. 获取连接字符串
4. 更新 `DATABASE_URL` 环境变量

#### Supabase
1. 注册Supabase账户
2. 创建新项目
3. 获取PostgreSQL连接字符串
4. 更新 `DATABASE_URL` 环境变量

#### Railway
1. 注册Railway账户
2. 创建PostgreSQL服务
3. 获取连接字符串
4. 更新 `DATABASE_URL` 环境变量

### 数据库迁移
```bash
# 生成Prisma客户端
npx prisma generate

# 推送数据库模式
npx prisma db push

# 查看数据库
npx prisma studio
```

## 🔧 故障排除

### 常见问题

1. **Node.js版本问题**
   - 确保使用Node.js 18.14.0或更高版本
   - 如果版本过低，可以降级Next.js版本

2. **数据库连接问题**
   - 检查 `DATABASE_URL` 环境变量
   - 确保数据库服务正在运行
   - 检查网络连接

3. **构建错误**
   - 清除 `.next` 文件夹
   - 重新安装依赖
   - 检查TypeScript错误

4. **样式问题**
   - 确保Tailwind CSS正确配置
   - 检查 `globals.css` 文件
   - 验证PostCSS配置

### 调试命令
```bash
# 检查依赖
npm list

# 检查TypeScript错误
npx tsc --noEmit

# 检查ESLint错误
npm run lint

# 查看数据库
npx prisma studio

# 重置数据库
npx prisma db push --force-reset
```

## 📱 移动端支持

应用已配置响应式设计，支持：
- 桌面端 (1024px+)
- 平板端 (768px - 1023px)
- 移动端 (< 768px)

## 🔒 安全配置

### 生产环境安全检查清单
- [ ] 更改默认密码
- [ ] 配置HTTPS
- [ ] 设置强密码策略
- [ ] 配置CORS
- [ ] 启用CSRF保护
- [ ] 配置安全头
- [ ] 定期更新依赖

### 环境变量安全
- 不要在代码中硬编码敏感信息
- 使用环境变量存储配置
- 定期轮换密钥
- 限制环境变量访问权限

## 📊 性能优化

### 生产环境优化
- 启用Next.js生产模式
- 配置CDN
- 优化图片
- 启用压缩
- 配置缓存策略

### 监控和日志
- 配置错误监控
- 设置性能监控
- 启用访问日志
- 配置告警

## 🆘 获取帮助

如果遇到问题：
1. 查看控制台错误信息
2. 检查网络连接
3. 验证环境变量配置
4. 查看Vercel部署日志
5. 联系技术支持

---

🎉 恭喜！您的AI课堂互动小工具已成功部署！
