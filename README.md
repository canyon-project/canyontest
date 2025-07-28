# 项目说明

## Docker 部署

本项目使用多阶段构建的 Dockerfile，同时构建前端和后端应用。

### 本地构建和运行

```bash
# 构建镜像
docker build -t your-app .

# 运行容器
docker run -p 80:80 your-app
```

### GitHub Actions 自动部署

项目配置了 GitHub Actions，会在每次 push 到 main/master 分支时自动构建并推送 Docker 镜像到 DockerHub。

#### 配置 DockerHub Secrets

在 GitHub 仓库的 Settings > Secrets and variables > Actions 中添加以下 secrets：

1. `DOCKERHUB_USERNAME`: 你的 DockerHub 用户名
2. `DOCKERHUB_TOKEN`: 你的 DockerHub 访问令牌

#### 获取 DockerHub 访问令牌

1. 登录 [DockerHub](https://hub.docker.com/)
2. 点击右上角头像 > Account Settings
3. 选择 Security 标签页
4. 点击 "New Access Token"
5. 输入令牌描述，选择权限（建议选择 Read, Write, Delete）
6. 复制生成的令牌并添加到 GitHub Secrets

#### 镜像标签说明

- `latest`: 最新的 main/master 分支构建
- `main-<commit-sha>`: 带有提交 SHA 的分支标签
- `<branch-name>`: 分支名称标签

## 开发环境

TODO：用x 来做本地环境变量的检验
