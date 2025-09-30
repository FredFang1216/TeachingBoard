# 云服务器部署指南

## 快速部署到Railway（推荐）

### 1. 准备Railway账户
- 访问 [railway.app](https://railway.app)
- 使用GitHub登录
- 连接你的仓库

### 2. 创建新项目
```bash
# Railway会自动检测Next.js项目
# 选择你的GitHub仓库
# 自动配置PostgreSQL数据库
```

### 3. 环境变量配置
在Railway项目设置中添加：
```
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_SECRET=your-random-secret-key
NEXTAUTH_URL=https://your-app.railway.app
OPENAI_API_KEY=your-openai-key
```

### 4. 数据库迁移
Railway会自动运行 `npx prisma db push`

## 部署到Vercel + PlanetScale

### 1. 创建PlanetScale数据库
- 访问 [planetscale.com](https://planetscale.com)
- 创建新数据库
- 获取连接字符串

### 2. 更新环境变量
```bash
DATABASE_URL="mysql://username:password@host:port/database?sslaccept=strict"
```

### 3. 部署到Vercel
```bash
vercel --prod
```

## 自建云服务器部署

### 1. 服务器配置
```bash
# Ubuntu 20.04+
sudo apt update
sudo apt install nodejs npm postgresql nginx

# 安装PM2
npm install -g pm2
```

### 2. 数据库设置
```bash
# 创建PostgreSQL数据库
sudo -u postgres createdb classroom_db
sudo -u postgres createuser classroom_user
sudo -u postgres psql -c "ALTER USER classroom_user PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE classroom_db TO classroom_user;"
```

### 3. 应用部署
```bash
# 克隆项目
git clone your-repo-url
cd test_web

# 安装依赖
npm install

# 构建项目
npm run build

# 使用PM2启动
pm2 start npm --name "classroom-app" -- start
pm2 save
pm2 startup
```

### 4. Nginx配置
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 性能优化建议

### 1. 数据库优化
- 使用连接池
- 添加索引
- 定期清理日志

### 2. 缓存策略
- Redis缓存热点数据
- CDN静态资源
- 浏览器缓存优化

### 3. 监控告警
- 设置性能监控
- 数据库连接监控
- 错误日志收集

## 预期效果

部署到云服务器后，你应该能看到：
- ✅ 数据同步延迟 < 100ms
- ✅ 多用户并发无冲突
- ✅ 管理员界面实时更新
- ✅ 跨账户操作即时同步