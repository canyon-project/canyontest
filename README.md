# CanyonTest - 全栈应用

一个基于 React + Go + PostgreSQL 的现代化全栈应用，支持用户认证、多语言、主题切换等功能。

## 功能特性

### 前端功能
- ✅ React 19 + TypeScript + Vite
- ✅ Ant Design 5 UI 组件库
- ✅ 左侧固定导航，右侧自适应布局
- ✅ 用户头像显示在左下角
- ✅ 多语言支持（中文/英文）
- ✅ 主题切换（浅色/深色）
- ✅ 主题色自定义
- ✅ 用户设置持久化到数据库
- ✅ JWT Token 本地存储
- ✅ Bearer Token 请求认证
- ✅ Gitea OAuth 集成
- ✅ 仓库浏览和选择
- ✅ Monaco Editor 代码查看
- ✅ 文件树导航
- ✅ 语法高亮支持

### 后端功能
- ✅ Go + Gin 框架
- ✅ PostgreSQL 数据库
- ✅ GORM ORM
- ✅ JWT 用户认证
- ✅ 密码加密存储
- ✅ 用户注册/登录
- ✅ 用户设置管理
- ✅ 静态文件服务
- ✅ Gitea OAuth 2.0 集成
- ✅ 仓库 API 代理
- ✅ 文件内容获取
- ✅ 目录结构遍历

## 快速开始

### 使用 Docker Compose（推荐）

```bash
# 克隆项目
git clone <your-repo-url>
cd canyontest

# 启动服务
docker-compose up -d

# 访问应用
open http://localhost:8080
```

### 本地开发

#### 前端开发
```bash
cd apps/frontend
pnpm install
pnpm dev
```

#### 后端开发
```bash
# 启动 PostgreSQL
docker run -d --name postgres \
  -e POSTGRES_DB=canyontest \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine

# 启动后端
cd apps/backend
go mod tidy
go run main.go
```

## 项目结构

```
├── apps/
│   ├── frontend/          # React 前端应用
│   │   ├── src/
│   │   │   ├── components/    # 组件
│   │   │   ├── contexts/      # React Context
│   │   │   ├── i18n/          # 多语言配置
│   │   │   ├── pages/         # 页面组件
│   │   │   └── services/      # API 服务
│   │   └── package.json
│   └── backend/           # Go 后端应用
│       ├── config/            # 数据库配置
│       ├── handlers/          # 路由处理器
│       ├── middleware/        # 中间件
│       ├── models/            # 数据模型
│       └── main.go
├── .github/workflows/     # GitHub Actions
├── docker-compose.yml     # Docker Compose 配置
├── Dockerfile            # Docker 构建文件
└── README.md
```

## API 接口

### 认证接口
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录

### 用户接口（需要认证）
- `GET /api/v1/profile` - 获取用户信息
- `PUT /api/v1/settings` - 更新用户设置
- `GET /api/v1/users` - 获取用户列表

## 环境变量

### 后端环境变量
```bash
# 数据库配置
DB_HOST=localhost          # 数据库主机
DB_PORT=5432              # 数据库端口
DB_USER=postgres          # 数据库用户名
DB_PASSWORD=postgres      # 数据库密码
DB_NAME=canyontest        # 数据库名称
DB_SSLMODE=disable        # SSL 模式

# JWT配置
JWT_SECRET=your-secret    # JWT 密钥

# Gitea OAuth配置
GITEA_BASE_URL=https://gitea.com                    # Gitea服务器地址
GITEA_CLIENT_ID=your-gitea-client-id               # Gitea OAuth应用ID
GITEA_CLIENT_SECRET=your-gitea-client-secret       # Gitea OAuth应用密钥
GITEA_REDIRECT_URL=http://localhost:8080/oauth/callback  # OAuth回调地址
```

## Docker 部署

### 单容器部署
```bash
# 构建镜像
docker build -t zhangtao25/canyontest .

# 运行容器
docker run -p 8080:8080 zhangtao25/canyontest
```

### GitHub Actions 自动部署

项目配置了 GitHub Actions，会在每次 push 到 main/master 分支时自动构建并推送 Docker 镜像到 DockerHub。

#### 配置 DockerHub Secrets

在 GitHub 仓库的 Settings > Secrets and variables > Actions 中添加以下 secrets：

1. `DOCKERHUB_USERNAME`: zhangtao25
2. `DOCKERHUB_TOKEN`: 你的 DockerHub 访问令牌

#### 镜像标签说明

- `zhangtao25/canyontest:latest` - 最新版本
- `zhangtao25/canyontest:main-<commit-sha>` - 带提交SHA的版本

## Gitea OAuth 配置

### 1. 创建 Gitea OAuth 应用

1. 登录你的 Gitea 实例
2. 进入 `Settings` > `Applications`
3. 点击 `Create a new OAuth2 Application`
4. 填写应用信息：
   - **Application Name**: CanyonTest
   - **Redirect URI**: `http://localhost:8080/oauth/callback`
   - **Scopes**: `read:repository`, `read:user`
5. 保存后获得 `Client ID` 和 `Client Secret`

### 2. 配置环境变量

将获得的 Client ID 和 Client Secret 配置到环境变量中：

```bash
GITEA_BASE_URL=https://your-gitea-instance.com
GITEA_CLIENT_ID=your-client-id
GITEA_CLIENT_SECRET=your-client-secret
GITEA_REDIRECT_URL=http://localhost:8080/oauth/callback
```

## 使用说明

1. **注册/登录**: 访问 `/login` 页面进行用户注册或登录
2. **导航**: 使用左侧菜单进行页面导航
3. **Gitea 集成**: 在代码浏览页面连接你的 Gitea 账户
4. **仓库浏览**: 选择仓库后可以浏览代码文件
5. **代码查看**: 使用 Monaco Editor 查看代码，支持语法高亮
6. **用户设置**: 点击左下角用户头像打开设置面板
7. **主题切换**: 在设置中可以切换浅色/深色主题
8. **语言切换**: 支持中文和英文切换
9. **主题色**: 可以自定义主题色

## 技术栈

### 前端
- React 19 + TypeScript
- Ant Design 5
- React Router 6
- React i18next
- Axios

### 后端
- Go 1.22
- Gin Web Framework
- GORM
- PostgreSQL
- JWT-Go
- Bcrypt

### 部署
- Docker + Docker Compose
- GitHub Actions
- DockerHub
