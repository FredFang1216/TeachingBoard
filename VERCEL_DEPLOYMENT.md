# Vercel 部署指南

## 🚀 快速部署步骤

### 1. 准备数据库
由于Vercel不支持SQLite，你需要使用PostgreSQL数据库：

**推荐选项：**
- **Neon** (免费): https://neon.tech
- **PlanetScale** (免费): https://planetscale.com
- **Supabase** (免费): https://supabase.com

### 2. 获取数据库连接字符串
以Neon为例：
1. 注册Neon账户
2. 创建新项目
3. 复制PostgreSQL连接字符串
4. 格式：`postgresql://username:password@host:port/database`

### 3. 更新Prisma配置
在Vercel部署前，需要更新Prisma配置以支持PostgreSQL：

```bash
# 1. 安装PostgreSQL依赖
npm install pg @types/pg

# 2. 更新prisma/schema.prisma
# 将 provider 从 "sqlite" 改为 "postgresql"
```

### 4. 在Vercel中设置环境变量

在Vercel项目设置中添加以下环境变量：

```env
# 数据库配置
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth配置
NEXTAUTH_URL="https://your-app-name.vercel.app"
NEXTAUTH_SECRET="your-random-secret-key-here"

# OpenAI API配置（可选）
OPENAI_API_KEY="your-openai-api-key-here"
```

### 5. 部署命令
```bash
# 推送代码到GitHub
git add .
git commit -m "Fix Vercel deployment configuration"
git push origin main

# 或者使用Vercel CLI
vercel --prod
```

## 🔧 常见问题解决

### 问题1: 函数运行时错误
**错误**: `Function Runtimes must have a valid version`

**解决**: 删除或简化 `vercel.json` 文件中的 `functions` 配置

### 问题2: 数据库连接失败
**错误**: `Can't reach database server`

**解决**: 
1. 检查 `DATABASE_URL` 环境变量是否正确
2. 确保数据库服务器允许外部连接
3. 检查防火墙设置

### 问题3: Prisma客户端错误
**错误**: `PrismaClientInitializationError`

**解决**:
1. 确保在Vercel中设置了正确的 `DATABASE_URL`
2. 运行 `npx prisma generate` 生成客户端
3. 确保数据库模式已推送

### 问题4: 构建失败
**错误**: `Build failed`

**解决**:
1. 检查 `package.json` 中的依赖版本
2. 确保所有必需的依赖都已安装
3. 检查TypeScript错误

## 📝 生产环境配置

### 1. 数据库迁移
```bash
# 生成Prisma客户端
npx prisma generate

# 推送数据库模式到生产环境
npx prisma db push

# 或者运行迁移
npx prisma migrate deploy
```

### 2. 环境变量检查
确保以下环境变量已正确设置：
- ✅ `DATABASE_URL`
- ✅ `NEXTAUTH_URL`
- ✅ `NEXTAUTH_SECRET`

### 3. 域名配置
1. 在Vercel项目设置中添加自定义域名
2. 更新 `NEXTAUTH_URL` 为你的域名
3. 配置SSL证书

## 🎯 部署后测试

1. **访问主页**: 检查是否正常加载
2. **测试登录**: 使用测试账户登录
3. **测试功能**: 验证所有功能是否正常工作
4. **检查数据库**: 确保数据正确保存

## 📞 获取帮助

如果遇到问题：
1. 查看Vercel部署日志
2. 检查环境变量配置
3. 验证数据库连接
4. 查看控制台错误信息

---

🎉 部署成功后，你的AI课堂互动小工具就可以在公网上使用了！
