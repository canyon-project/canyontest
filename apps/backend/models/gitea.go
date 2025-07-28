package models

import (
	"time"
	"gorm.io/gorm"
)

// GiteaToken 存储用户的Gitea访问令牌
type GiteaToken struct {
	ID           uint           `json:"id" gorm:"primarykey"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
	
	UserID       uint   `json:"user_id" gorm:"not null"`
	User         User   `json:"user" gorm:"foreignKey:UserID"`
	AccessToken  string `json:"-" gorm:"not null"` // 不返回给前端
	RefreshToken string `json:"-"`
	TokenType    string `json:"token_type" gorm:"default:'Bearer'"`
	ExpiresAt    *time.Time `json:"expires_at"`
	Scope        string `json:"scope"`
	
	// Gitea用户信息
	GiteaUserID  int64  `json:"gitea_user_id"`
	GiteaLogin   string `json:"gitea_login"`
	GiteaName    string `json:"gitea_name"`
	GiteaEmail   string `json:"gitea_email"`
	GiteaAvatar  string `json:"gitea_avatar"`
}

// Repository 仓库信息
type Repository struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	FullName    string `json:"full_name"`
	Description string `json:"description"`
	Private     bool   `json:"private"`
	Fork        bool   `json:"fork"`
	HTMLURL     string `json:"html_url"`
	CloneURL    string `json:"clone_url"`
	SSHURL      string `json:"ssh_url"`
	Language    string `json:"language"`
	Size        int64  `json:"size"`
	UpdatedAt   string `json:"updated_at"`
	Owner       struct {
		ID        int64  `json:"id"`
		Login     string `json:"login"`
		FullName  string `json:"full_name"`
		Email     string `json:"email"`
		AvatarURL string `json:"avatar_url"`
	} `json:"owner"`
}

// FileContent 文件内容
type FileContent struct {
	Name        string `json:"name"`
	Path        string `json:"path"`
	SHA         string `json:"sha"`
	Size        int64  `json:"size"`
	URL         string `json:"url"`
	HTMLURL     string `json:"html_url"`
	GitURL      string `json:"git_url"`
	DownloadURL string `json:"download_url"`
	Type        string `json:"type"` // file, dir
	Content     string `json:"content,omitempty"` // base64 encoded
	Encoding    string `json:"encoding,omitempty"`
}

// TreeEntry 目录树条目
type TreeEntry struct {
	Path string `json:"path"`
	Mode string `json:"mode"`
	Type string `json:"type"` // blob, tree
	Size int64  `json:"size"`
	SHA  string `json:"sha"`
	URL  string `json:"url"`
}

// GiteaOAuthRequest OAuth请求
type GiteaOAuthRequest struct {
	Code  string `json:"code" binding:"required"`
	State string `json:"state"`
}