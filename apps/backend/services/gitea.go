package services

import (
	"backend/models"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"golang.org/x/oauth2"
)

type GiteaService struct {
	config   *oauth2.Config
	baseURL  string
	client   *http.Client
}

func NewGiteaService() *GiteaService {
	baseURL := getEnv("GITEA_BASE_URL", "https://gitea.com")

	config := &oauth2.Config{
		ClientID:     getEnv("GITEA_CLIENT_ID", ""),
		ClientSecret: getEnv("GITEA_CLIENT_SECRET", ""),
		RedirectURL:  getEnv("GITEA_REDIRECT_URL", "http://localhost:5173/oauth/callback"),
		Scopes:       []string{"read:repository", "read:user"},
		Endpoint: oauth2.Endpoint{
			AuthURL:  fmt.Sprintf("%s/login/oauth/authorize", baseURL),
			TokenURL: fmt.Sprintf("%s/login/oauth/access_token", baseURL),
		},
	}

	return &GiteaService{
		config:  config,
		baseURL: baseURL,
		client:  &http.Client{},
	}
}

func (g *GiteaService) GetAuthURL(state string) string {
	return g.config.AuthCodeURL(state)
}

func (g *GiteaService) ExchangeCode(code string) (*oauth2.Token, error) {
	return g.config.Exchange(context.Background(), code)
}

func (g *GiteaService) GetUser(token *oauth2.Token) (*models.GiteaToken, error) {
	req, err := http.NewRequest("GET", fmt.Sprintf("%s/api/v1/user", g.baseURL), nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token.AccessToken))

	resp, err := g.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to get user info: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var user struct {
		ID       int64  `json:"id"`
		Login    string `json:"login"`
		FullName string `json:"full_name"`
		Email    string `json:"email"`
		Avatar   string `json:"avatar_url"`
	}

	if err := json.Unmarshal(body, &user); err != nil {
		return nil, err
	}

	giteaToken := &models.GiteaToken{
		AccessToken:  token.AccessToken,
		RefreshToken: token.RefreshToken,
		TokenType:    token.TokenType,
		GiteaUserID:  user.ID,
		GiteaLogin:   user.Login,
		GiteaName:    user.FullName,
		GiteaEmail:   user.Email,
		GiteaAvatar:  user.Avatar,
	}

	if !token.Expiry.IsZero() {
		giteaToken.ExpiresAt = &token.Expiry
	}

	return giteaToken, nil
}

func (g *GiteaService) GetRepositories(token string) ([]models.Repository, error) {
	req, err := http.NewRequest("GET", fmt.Sprintf("%s/api/v1/user/repos", g.baseURL), nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

	resp, err := g.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to get repositories: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var repos []models.Repository
	if err := json.Unmarshal(body, &repos); err != nil {
		return nil, err
	}

	return repos, nil
}

func (g *GiteaService) GetFileContent(token, owner, repo, path string) (*models.FileContent, error) {
	url := fmt.Sprintf("%s/api/v1/repos/%s/%s/contents/%s", g.baseURL, owner, repo, path)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

	resp, err := g.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to get file content: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var content models.FileContent
	if err := json.Unmarshal(body, &content); err != nil {
		return nil, err
	}

	// 解码base64内容
	if content.Encoding == "base64" && content.Content != "" {
		decoded, err := base64.StdEncoding.DecodeString(content.Content)
		if err != nil {
			return nil, err
		}
		content.Content = string(decoded)
		content.Encoding = "utf-8"
	}

	return &content, nil
}

func (g *GiteaService) GetDirectoryContents(token, owner, repo, path string) ([]models.FileContent, error) {
	url := fmt.Sprintf("%s/api/v1/repos/%s/%s/contents/%s", g.baseURL, owner, repo, path)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

	resp, err := g.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to get directory contents: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var contents []models.FileContent
	if err := json.Unmarshal(body, &contents); err != nil {
		return nil, err
	}

	return contents, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
