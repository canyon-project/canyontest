package main

import (
	"backend/config"
	"backend/handlers"
	"backend/middleware"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
)

// StaticFileHandler 处理静态文件服务，支持 SPA 路由
func StaticFileHandler(staticPath string) gin.HandlerFunc {
	fileServer := http.FileServer(http.Dir(staticPath))
	
	return func(c *gin.Context) {
		path := c.Request.URL.Path
		
		// 如果是 API 请求，跳过静态文件处理
		if strings.HasPrefix(path, "/api/") || strings.HasPrefix(path, "/health") {
			c.Next()
			return
		}
		
		// 检查文件是否存在
		fullPath := filepath.Join(staticPath, path)
		if _, err := os.Stat(fullPath); os.IsNotExist(err) {
			// 如果文件不存在，返回 index.html（支持 SPA 路由）
			c.Request.URL.Path = "/"
		}
		
		fileServer.ServeHTTP(c.Writer, c.Request)
		c.Abort()
	}
}

func main() {
	// 初始化数据库
	config.InitDatabase()

	// 创建 Gin 路由器
	r := gin.Default()

	// 添加 CORS 中间件
	r.Use(middleware.CORS())

	// 健康检查端点
	r.GET("/health", handlers.HealthCheck)

	// API 路由组
	api := r.Group("/api/v1")
	{
		api.GET("/ping", handlers.Ping)
		
		// 认证相关路由（无需认证）
		api.POST("/auth/register", handlers.Register)
		api.POST("/auth/login", handlers.Login)
		
		// 需要认证的路由
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			// 用户相关路由
			protected.GET("/users", handlers.GetUsers)
			protected.GET("/users/:id", handlers.GetUser)
			protected.POST("/users", handlers.CreateUser)
			
			// 用户个人信息和设置
			protected.GET("/profile", handlers.GetProfile)
			protected.PUT("/settings", handlers.UpdateSettings)
		}
	}

	// 静态文件服务（放在最后，作为 fallback）
	r.Use(StaticFileHandler("/static"))

	// 启动服务器，默认端口 8080
	r.Run(":8080")
}