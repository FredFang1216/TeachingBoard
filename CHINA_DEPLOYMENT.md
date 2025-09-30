# 中国大陆云服务器部署指南

## 国内云服务商推荐

### 1. 阿里云（推荐）
- **ECS**: 云服务器
- **RDS**: MySQL/PostgreSQL 数据库
- **OSS**: 对象存储
- **CDN**: 内容分发网络
- **价格**: 新用户有优惠，学生认证更便宜

### 2. 腾讯云
- **CVM**: 云服务器
- **TencentDB**: 数据库服务
- **COS**: 对象存储
- **CDN**: 内容分发
- **价格**: 性价比高，经常有活动

### 3. 华为云
- **ECS**: 弹性云服务器
- **RDS**: 关系型数据库
- **OBS**: 对象存储
- **CDN**: 内容分发
- **特点**: 企业级服务，稳定性好

### 4. 百度云
- **BCC**: 百度云服务器
- **RDS**: 关系型数据库
- **BOS**: 对象存储
- **CDN**: 内容分发
- **价格**: 相对便宜

## 快速部署方案

### 方案一：阿里云 ECS + RDS（推荐）

#### 1. 购买服务器
```bash
# 阿里云 ECS 配置建议：
- 实例规格：ecs.t6-c1m1.large (1核2G)
- 操作系统：Ubuntu 20.04 LTS
- 带宽：3Mbps
- 存储：40GB SSD
- 价格：约 50-80元/月
```

#### 2. 购买数据库
```bash
# 阿里云 RDS MySQL 配置：
- 实例规格：rds.mysql.s1.small (1核1G)
- 存储：20GB
- 备份：7天
- 价格：约 30-50元/月
```

#### 3. 服务器配置
```bash
# 连接服务器
ssh root@your-server-ip

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
npm install -g pm2

# 安装 Nginx
sudo apt update
sudo apt install nginx
```

#### 4. 部署应用
```bash
# 克隆项目
git clone https://github.com/FredFang1216/TeachingBoard.git
cd TeachingBoard

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，添加数据库连接

# 构建项目
npm run build

# 启动应用
pm2 start npm --name "classroom-app" -- start
pm2 save
pm2 startup
```

### 方案二：腾讯云 CVM + TencentDB

#### 1. 服务器配置
```bash
# 腾讯云 CVM 配置：
- 实例规格：S5.SMALL2 (1核2G)
- 操作系统：Ubuntu 20.04 LTS
- 带宽：3Mbps
- 存储：50GB SSD
- 价格：约 60-90元/月
```

#### 2. 数据库配置
```bash
# 腾讯云 TencentDB MySQL：
- 实例规格：1核1G
- 存储：20GB
- 备份：7天
- 价格：约 40-60元/月
```

### 方案三：华为云 ECS + RDS

#### 1. 服务器配置
```bash
# 华为云 ECS 配置：
- 实例规格：s6.small.1 (1核2G)
- 操作系统：Ubuntu 20.04 LTS
- 带宽：3Mbps
- 存储：40GB SSD
- 价格：约 70-100元/月
```

## 详细部署步骤

### 1. 阿里云 ECS 部署

#### 购买 ECS 实例
```bash
# 在阿里云控制台：
1. 进入 ECS 控制台
2. 点击 "创建实例"
3. 选择配置：
   - 地域：华东1（杭州）
   - 实例规格：ecs.t6-c1m1.large
   - 镜像：Ubuntu 20.04 LTS
   - 存储：40GB SSD
   - 网络：专有网络
   - 安全组：开放 80, 443, 22 端口
4. 设置密码
5. 确认订单并支付
```

#### 配置服务器
```bash
# 连接服务器
ssh root@your-server-ip

# 更新系统
apt update && apt upgrade -y

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version

# 安装 PM2
npm install -g pm2

# 安装 Nginx
sudo apt install nginx -y

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 部署应用
```bash
# 克隆项目
git clone https://github.com/FredFang1216/TeachingBoard.git
cd TeachingBoard

# 安装依赖
npm install

# 配置环境变量
cat > .env.local << EOF
DATABASE_URL="mysql://username:password@your-rds-host:3306/classroom_db"
NEXTAUTH_SECRET="your-random-secret-key"
NEXTAUTH_URL="http://your-server-ip"
OPENAI_API_KEY="your-openai-key"
EOF

# 构建项目
npm run build

# 启动应用
pm2 start npm --name "classroom-app" -- start
pm2 save
pm2 startup
```

#### 配置 Nginx
```bash
# 创建 Nginx 配置
sudo cat > /etc/nginx/sites-available/classroom << EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# 启用配置
sudo ln -s /etc/nginx/sites-available/classroom /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 2. 阿里云 RDS 配置

#### 购买 RDS 实例
```bash
# 在阿里云控制台：
1. 进入 RDS 控制台
2. 点击 "创建实例"
3. 选择配置：
   - 地域：华东1（杭州）
   - 数据库类型：MySQL 8.0
   - 实例规格：rds.mysql.s1.small
   - 存储：20GB
   - 备份：7天
4. 设置密码
5. 确认订单并支付
```

#### 配置数据库
```bash
# 在 RDS 控制台：
1. 进入实例详情
2. 点击 "账号管理"
3. 创建数据库账号
4. 点击 "数据库管理"
5. 创建数据库：classroom_db
6. 授权账号访问数据库
```

#### 连接测试
```bash
# 在服务器上测试连接
mysql -h your-rds-host -u username -p classroom_db

# 运行 Prisma 迁移
npx prisma db push
```

## 成本估算

### 阿里云方案
- **ECS**: 50-80元/月
- **RDS**: 30-50元/月
- **总成本**: 80-130元/月

### 腾讯云方案
- **CVM**: 60-90元/月
- **TencentDB**: 40-60元/月
- **总成本**: 100-150元/月

### 华为云方案
- **ECS**: 70-100元/月
- **RDS**: 50-80元/月
- **总成本**: 120-180元/月

## 优势对比

### 国内云服务商优势
- ✅ **访问速度快**: 国内用户访问延迟低
- ✅ **技术支持**: 中文客服，响应快
- ✅ **合规性**: 符合国内法规要求
- ✅ **价格透明**: 明码标价，无隐藏费用
- ✅ **稳定性**: 国内网络环境优化

### 预期效果
部署到国内云服务器后：
- 数据同步延迟 < 50ms
- 管理员界面实时更新
- 跨账户操作即时同步
- 多用户并发无冲突

## 下一步

1. ✅ 选择云服务商（推荐阿里云）
2. ✅ 购买 ECS 和 RDS 实例
3. ✅ 配置服务器环境
4. ✅ 部署应用
5. ✅ 测试数据同步
6. ✅ 享受快速同步体验！

## 支持

- 阿里云文档: https://help.aliyun.com
- 腾讯云文档: https://cloud.tencent.com/document
- 华为云文档: https://support.huaweicloud.com
- 项目 Issues: 在 GitHub 仓库中创建 Issue
