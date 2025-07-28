# 极简版 Dockerfile - 最小镜像体积（约15-20MB）

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
RUN apk add --no-cache ca-certificates tzdata upx
WORKDIR /app
COPY apps/backend/go.mod apps/backend/go.sum ./
RUN go mod download
COPY apps/backend .
RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-w -s -extldflags '-static'" \
    -a -installsuffix cgo \
    -o main .
RUN upx --best --lzma main

# 最终运行阶段 - 使用 scratch 基础镜像（最小）
FROM scratch

# 复制必要的系统文件
COPY --from=backend-builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=backend-builder /usr/share/zoneinfo /usr/share/zoneinfo

# 复制应用文件
COPY --from=frontend-builder /app/apps/frontend/dist /static
COPY --from=backend-builder /app/main /main

# 暴露端口
EXPOSE 8080

# 运行后端（需要修改后端代码来同时服务静态文件）
CMD ["/main"]
