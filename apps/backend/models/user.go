package models

import (
	"time"
	"gorm.io/gorm"
)

type User struct {
	ID        uint           `json:"id" gorm:"primarykey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
	
	Username string `json:"username" gorm:"uniqueIndex;not null"`
	Email    string `json:"email" gorm:"uniqueIndex;not null"`
	Password string `json:"-" gorm:"not null"`
	Avatar   string `json:"avatar"`
	
	// 用户设置
	Settings UserSettings `json:"settings" gorm:"embedded"`
}

type UserSettings struct {
	Language  string `json:"language" gorm:"default:'zh-CN'"`
	Theme     string `json:"theme" gorm:"default:'light'"`
	ThemeColor string `json:"theme_color" gorm:"default:'#1890ff'"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=20"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type UpdateSettingsRequest struct {
	Language   string `json:"language"`
	Theme      string `json:"theme"`
	ThemeColor string `json:"theme_color"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}