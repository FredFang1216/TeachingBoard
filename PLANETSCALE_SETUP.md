# PlanetScale 数据库设置指南

## 什么是 PlanetScale？

PlanetScale 是一个基于 Vitess 的 MySQL 数据库服务，提供：
- 🌿 **数据库分支**: 像 Git 一样管理数据库
- ⚡ **无服务器**: 自动扩缩容
- 🔒 **安全**: 内置加密和访问控制
- 🚀 **高性能**: 基于 Google 的 Vitess 技术

## 创建 PlanetScale 数据库

### 1. 注册 PlanetScale 账户
- 访问 [planetscale.com](https://planetscale.com)
- 点击 "Sign up" 注册（推荐使用 GitHub 登录）
- 选择免费计划（Free Plan）

### 2. 创建新数据库
```bash
# 在 PlanetScale Dashboard 中：
1. 点击 "Create database"
2. 输入数据库名称：classroom_db
3. 选择区域：Asia Pacific (Tokyo) 或 US East
4. 选择计划：Free Plan
5. 点击 "Create database"
```

### 3. 获取连接信息
```bash
# 在数据库页面：
1. 点击 "Connect"
2. 选择 "General purpose"
3. 复制连接字符串
# 格式：mysql://username:password@host:port/database?sslaccept=strict
```

### 4. 创建分支（可选但推荐）
```bash
# 在数据库页面：
1. 点击 "Branches"
2. 点击 "Create branch"
3. 输入分支名：main
4. 选择 "Production" 类型
5. 点击 "Create branch"
```

## 配置 Vercel 环境变量

### 1. 在 Vercel 项目设置中
```bash
# 进入你的 Vercel 项目
1. 打开 Vercel Dashboard
2. 选择你的项目
3. 点击 "Settings" → "Environment Variables"
4. 添加以下变量：
```

### 2. 环境变量配置
```env
# 必需的环境变量
DATABASE_URL=mysql://username:password@host:port/database?sslaccept=strict
NEXTAUTH_SECRET=your-random-secret-key-here
NEXTAUTH_URL=https://your-app.vercel.app
OPENAI_API_KEY=your-openai-api-key

# 可选的环境变量
NODE_ENV=production
```

### 3. 部署应用
```bash
# 在本地项目目录
vercel --prod

# 或者推送代码到 GitHub，Vercel 会自动部署
git push origin main
```

## 数据库迁移

### 1. 本地测试连接
```bash
# 在项目根目录
npx prisma generate
npx prisma db push
```

### 2. 验证数据
```bash
# 检查数据库连接
npx prisma studio
```

## PlanetScale 的优势

### 1. 性能优势
- **连接池**: 自动管理数据库连接
- **缓存**: 内置查询缓存
- **CDN**: 全球边缘节点

### 2. 开发体验
- **分支管理**: 像 Git 一样管理数据库
- **Schema 变更**: 安全的数据库迁移
- **回滚**: 一键回滚到之前版本

### 3. 监控和调试
- **查询分析**: 详细的查询性能报告
- **慢查询**: 自动检测慢查询
- **连接监控**: 实时连接状态

## 成本说明

### Free Plan 限制
- 数据库大小：1GB
- 连接数：1000
- 查询数：10亿/月
- 分支数：5个

### 对于你的项目
- 学生数据：< 1MB
- 积分记录：< 10MB
- 总数据量：< 50MB
- **结论**: Free Plan 完全够用

## 故障排除

### 1. 连接失败
```bash
# 检查连接字符串格式
# 确保 SSL 参数正确
# 验证用户名密码
```

### 2. 迁移失败
```bash
# 检查 Prisma schema
# 确保字段类型匹配
# 查看 PlanetScale 日志
```

### 3. 性能问题
```bash
# 使用 PlanetScale 查询分析
# 优化慢查询
# 添加必要索引
```

## 下一步

1. ✅ 创建 PlanetScale 数据库
2. ✅ 配置 Vercel 环境变量
3. ✅ 部署应用
4. ✅ 测试数据同步
5. ✅ 享受快速同步体验！

## 支持

- PlanetScale 文档: https://planetscale.com/docs
- Vercel 文档: https://vercel.com/docs
- 项目 Issues: 在 GitHub 仓库中创建 Issue
