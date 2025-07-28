package handlers

import (
	"backend/config"
	"backend/models"
	"backend/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

var giteaService = services.NewGiteaService()

// GetGiteaAuthURL 获取Gitea OAuth授权URL
func GetGiteaAuthURL(c *gin.Context) {
	state := c.Query("state")
	if state == "" {
		state = "default"
	}
	
	authURL := giteaService.GetAuthURL(state)
	
	c.JSON(http.StatusOK, gin.H{
		"auth_url": authURL,
	})
}

// GiteaCallback 处理Gitea OAuth回调
func GiteaCallback(c *gin.Context) {
	var req models.GiteaOAuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// 获取当前用户
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}
	currentUser := user.(models.User)
	
	// 交换授权码获取token
	token, err := giteaService.ExchangeCode(req.Code)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to exchange code: " + err.Error()})
		return
	}
	
	// 获取Gitea用户信息
	giteaToken, err := giteaService.GetUser(token)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get user info: " + err.Error()})
		return
	}
	
	// 设置用户ID
	giteaToken.UserID = currentUser.ID
	
	// 检查是否已存在该用户的Gitea token
	var existingToken models.GiteaToken
	if err := config.DB.Where("user_id = ?", currentUser.ID).First(&existingToken).Error; err == nil {
		// 更新现有token
		giteaToken.ID = existingToken.ID
		if err := config.DB.Save(giteaToken).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update token"})
			return
		}
	} else {
		// 创建新token
		if err := config.DB.Create(giteaToken).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save token"})
			return
		}
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Gitea authorization successful",
		"gitea_user": gin.H{
			"login":  giteaToken.GiteaLogin,
			"name":   giteaToken.GiteaName,
			"email":  giteaToken.GiteaEmail,
			"avatar": giteaToken.GiteaAvatar,
		},
	})
}

// GetGiteaStatus 获取Gitea授权状态
func GetGiteaStatus(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}
	currentUser := user.(models.User)
	
	var giteaToken models.GiteaToken
	if err := config.DB.Where("user_id = ?", currentUser.ID).First(&giteaToken).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{
			"authorized": false,
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"authorized": true,
		"gitea_user": gin.H{
			"login":  giteaToken.GiteaLogin,
			"name":   giteaToken.GiteaName,
			"email":  giteaToken.GiteaEmail,
			"avatar": giteaToken.GiteaAvatar,
		},
	})
}

// GetRepositories 获取用户的仓库列表
func GetRepositories(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}
	currentUser := user.(models.User)
	
	var giteaToken models.GiteaToken
	if err := config.DB.Where("user_id = ?", currentUser.ID).First(&giteaToken).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Gitea not authorized"})
		return
	}
	
	repos, err := giteaService.GetRepositories(giteaToken.AccessToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get repositories: " + err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, repos)
}

// GetFileContent 获取文件内容
func GetFileContent(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}
	currentUser := user.(models.User)
	
	var giteaToken models.GiteaToken
	if err := config.DB.Where("user_id = ?", currentUser.ID).First(&giteaToken).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Gitea not authorized"})
		return
	}
	
	owner := c.Param("owner")
	repo := c.Param("repo")
	path := c.Param("path")
	
	// 处理路径中的斜杠
	if path == "" {
		path = c.Query("path")
	}
	
	content, err := giteaService.GetFileContent(giteaToken.AccessToken, owner, repo, path)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get file content: " + err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, content)
}

// GetDirectoryContents 获取目录内容
func GetDirectoryContents(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}
	currentUser := user.(models.User)
	
	var giteaToken models.GiteaToken
	if err := config.DB.Where("user_id = ?", currentUser.ID).First(&giteaToken).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Gitea not authorized"})
		return
	}
	
	owner := c.Param("owner")
	repo := c.Param("repo")
	path := c.Query("path")
	if path == "" {
		path = ""
	}
	
	contents, err := giteaService.GetDirectoryContents(giteaToken.AccessToken, owner, repo, path)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get directory contents: " + err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, contents)
}

// RevokeGiteaAuth 撤销Gitea授权
func RevokeGiteaAuth(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}
	currentUser := user.(models.User)
	
	if err := config.DB.Where("user_id = ?", currentUser.ID).Delete(&models.GiteaToken{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to revoke authorization"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Gitea authorization revoked",
	})
}