import api from './api';

export interface GiteaUser {
  login: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  fork: boolean;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  language: string;
  size: number;
  updated_at: string;
  owner: {
    id: number;
    login: string;
    full_name: string;
    email: string;
    avatar_url: string;
  };
}

export interface FileContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string; // 'file' | 'dir'
  content?: string;
  encoding?: string;
}

export interface GiteaStatus {
  authorized: boolean;
  gitea_user?: GiteaUser;
}

// Gitea相关API
export const giteaAPI = {
  // 获取授权URL
  getAuthURL: (state?: string) => 
    api.get<{ auth_url: string }>(`/gitea/auth-url${state ? `?state=${state}` : ''}`),
  
  // OAuth回调
  callback: (code: string, state?: string) => 
    api.post('/gitea/callback', { code, state }),
  
  // 获取授权状态
  getStatus: () => 
    api.get<GiteaStatus>('/gitea/status'),
  
  // 撤销授权
  revokeAuth: () => 
    api.delete('/gitea/auth'),
  
  // 获取仓库列表
  getRepositories: () => 
    api.get<Repository[]>('/gitea/repositories'),
  
  // 获取目录内容
  getDirectoryContents: (owner: string, repo: string, path?: string) => 
    api.get<FileContent[]>(`/gitea/repos/${owner}/${repo}/contents${path ? `?path=${encodeURIComponent(path)}` : ''}`),
  
  // 获取文件内容
  getFileContent: (owner: string, repo: string, path: string) => 
    api.get<FileContent>(`/gitea/repos/${owner}/${repo}/file?path=${encodeURIComponent(path)}`),
};

export default giteaAPI;