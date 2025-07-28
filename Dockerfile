# 多服务 Dockerfile - 包含前端、后端和PostgreSQL

# 前端构建阶段
FROM node:24-alpine AS frontend-builder
WORKDIR /app
COPY apps/frontend/package.json ./apps/frontend/
COPY package.json pnpm-workspace.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install
COPY apps/frontend ./apps/frontend
WORKDIR /app/apps/frontend
RUN pnpm build

# 后端构建阶段
FROM golang:1.22-alpine AS backend-builder
RUN apk add --no-cache ca-certificates tzdata git
WORKDIR /app
COPY apps/backend/go.mod apps/backend/go.sum ./
RUN go mod download
COPY apps/backend .
RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-w -s -extldflags '-static'" \
    -a -installsuffix cgo \
    -o main .

# 最终运行阶段
FROM alpine:3.19

# 安装必要的运行时依赖
RUN apk add --no-cache \
    postgresql \
    postgresql-contrib \
    supervisor \
    ca-certificates \
    tzdata \
    && rm -rf /var/cache/apk/*

# 创建postgres用户和数据目录
RUN adduser -D -s /bin/sh postgres && \
    mkdir -p /var/lib/postgresql/data && \
    chown -R postgres:postgres /var/lib/postgresql

# 初始化PostgreSQL数据库
USER postgres
RUN initdb -D /var/lib/postgresql/data
USER root

# 复制应用文件
COPY --from=frontend-builder /app/apps/frontend/dist /static
COPY --from=backend-builder /app/main /app/main

# 创建supervisor配置
RUN mkdir -p /etc/supervisor/conf.d
COPY <<EOF /etc/supervisor/conf.d/supervisord.conf
[supervisord]
nodaemon=true
user=root

[program:postgresql]
command=su postgres -c "postgres -D /var/lib/postgresql/data"
autostart=true
autorestart=true
stdout_logfile=/var/log/postgresql.log
stderr_logfile=/var/log/postgresql.log

[program:backend]
command=/app/main
autostart=true
autorestart=true
stdout_logfile=/var/log/backend.log
stderr_logfile=/var/log/backend.log
environment=DB_HOST=localhost,DB_PORT=5432,DB_USER=postgres,DB_PASSWORD=postgres,DB_NAME=canyontest,DB_SSLMODE=disable
EOF

# 设置PostgreSQL配置
RUN echo "host all all 0.0.0.0/0 trust" >> /var/lib/postgresql/data/pg_hba.conf && \
    echo "listen_addresses = '*'" >> /var/lib/postgresql/data/postgresql.conf

# 暴露端口
EXPOSE 8080 5432

# 启动脚本
COPY <<EOF /start.sh
#!/bin/sh
# 启动PostgreSQL
su postgres -c "postgres -D /var/lib/postgresql/data" &
sleep 5

# 创建数据库
su postgres -c "createdb canyontest" 2>/dev/null || true

# 启动supervisor
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
EOF

RUN chmod +x /start.sh

CMD ["/start.sh"]