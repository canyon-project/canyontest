# 多阶段构建 Dockerfile - 同时构建前端和后端

# 前端构建阶段
FROM node:24-alpine AS frontend-builder

WORKDIR /app


# 复制前端相关文件
COPY apps/frontend/package.json apps/frontend/package-lock.json* ./apps/frontend/
COPY package.json pnpm-workspace.yaml ./

# 安装 pnpm 并设置镜像源
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install

# 复制前端源代码
COPY apps/frontend ./apps/frontend

# 构建前端
WORKDIR /app/apps/frontend
RUN pnpm build

# 后端构建阶段
FROM golang:1.22-alpine AS backend-builder

# 更新包索引并安装必要的构建工具
RUN apk update && apk add --no-cache ca-certificates tzdata

# 设置工作目录
WORKDIR /app

# 复制后端 go mod 文件
COPY apps/backend/go.mod apps/backend/go.sum ./

# 下载依赖
RUN go mod download

# 复制后端源代码
COPY apps/backend .

# 构建二进制文件
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o main .

# 最终运行阶段
FROM nginx:alpine

# 安装 supervisor 来管理多个进程
RUN apk add --no-cache supervisor

# 复制前端构建产物到 nginx
COPY --from=frontend-builder /app/apps/frontend/dist /usr/share/nginx/html

# 复制后端二进制文件
COPY --from=backend-builder /app/main /app/main
COPY --from=backend-builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# 创建 supervisor 配置
RUN mkdir -p /etc/supervisor/conf.d
COPY <<EOF /etc/supervisor/conf.d/supervisord.conf
[supervisord]
nodaemon=true
user=root

[program:nginx]
command=nginx -g "daemon off;"
autostart=true
autorestart=true
stdout_logfile=/var/log/nginx.log
stderr_logfile=/var/log/nginx.log

[program:backend]
command=/app/main
autostart=true
autorestart=true
stdout_logfile=/var/log/backend.log
stderr_logfile=/var/log/backend.log
EOF

# 创建 nginx 配置，代理后端 API
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;

    # 前端静态文件
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }

    # 后端 API 代理
    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# 暴露端口
EXPOSE 80

# 使用 supervisor 启动服务
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
