import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  List, 
  Avatar, 
  Space, 
  Tag, 
  message, 
  Modal, 
  Alert,
  Spin,
  Empty
} from 'antd';
import { 
  GithubOutlined, 
  EyeOutlined, 
  StarOutlined, 
  ForkOutlined,
  LinkOutlined,
  DisconnectOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { giteaAPI, Repository, GiteaStatus } from '../../services/gitea';
import CodeViewer from '../../components/CodeViewer/CodeViewer';

const CodeBrowser: React.FC = () => {
  const [giteaStatus, setGiteaStatus] = useState<GiteaStatus | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const { t } = useTranslation();

  // 检查Gitea授权状态
  const checkGiteaStatus = async () => {
    try {
      const response = await giteaAPI.getStatus();
      setGiteaStatus(response.data);
      
      if (response.data.authorized) {
        loadRepositories();
      }
    } catch (error) {
      console.error('Failed to check Gitea status:', error);
    }
  };

  // 开始Gitea授权
  const startGiteaAuth = async () => {
    setAuthLoading(true);
    try {
      const response = await giteaAPI.getAuthURL();
      const authUrl = response.data.auth_url;
      
      // 打开新窗口进行授权
      const authWindow = window.open(
        authUrl,
        'gitea-auth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );
      
      // 监听授权完成
      const checkClosed = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkClosed);
          setAuthLoading(false);
          // 重新检查状态
          setTimeout(() => {
            checkGiteaStatus();
          }, 1000);
        }
      }, 1000);
      
      // 监听消息
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'GITEA_AUTH_SUCCESS') {
          authWindow?.close();
          clearInterval(checkClosed);
          setAuthLoading(false);
          message.success('Gitea authorization successful');
          checkGiteaStatus();
          window.removeEventListener('message', handleMessage);
        } else if (event.data.type === 'GITEA_AUTH_ERROR') {
          authWindow?.close();
          clearInterval(checkClosed);
          setAuthLoading(false);
          message.error('Gitea authorization failed');
          window.removeEventListener('message', handleMessage);
        }
      };
      
      window.addEventListener('message', handleMessage);
      
    } catch (error) {
      setAuthLoading(false);
      message.error('Failed to start authorization');
    }
  };

  // 撤销Gitea授权
  const revokeGiteaAuth = async () => {
    Modal.confirm({
      title: 'Revoke Gitea Authorization',
      content: 'Are you sure you want to revoke Gitea authorization?',
      onOk: async () => {
        try {
          await giteaAPI.revokeAuth();
          message.success('Authorization revoked');
          setGiteaStatus({ authorized: false });
          setRepositories([]);
          setSelectedRepo(null);
        } catch (error) {
          message.error('Failed to revoke authorization');
        }
      },
    });
  };

  // 加载仓库列表
  const loadRepositories = async () => {
    setLoading(true);
    try {
      const response = await giteaAPI.getRepositories();
      setRepositories(response.data);
    } catch (error) {
      message.error('Failed to load repositories');
    } finally {
      setLoading(false);
    }
  };

  // 选择仓库
  const selectRepository = (repo: Repository) => {
    setSelectedRepo(repo);
  };

  // 返回仓库列表
  const backToRepoList = () => {
    setSelectedRepo(null);
  };

  useEffect(() => {
    checkGiteaStatus();
  }, []);

  // 如果选择了仓库，显示代码查看器
  if (selectedRepo) {
    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <Button onClick={backToRepoList}>
            ← Back to Repositories
          </Button>
        </div>
        <CodeViewer repository={selectedRepo} />
      </div>
    );
  }

  return (
    <div>
      <h1>Code Browser</h1>
      
      {/* Gitea授权状态 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>Gitea Integration</h3>
            {giteaStatus?.authorized ? (
              <div>
                <Alert
                  message={`Connected as ${giteaStatus.gitea_user?.name || giteaStatus.gitea_user?.login}`}
                  type="success"
                  showIcon
                  style={{ marginBottom: 8 }}
                />
                <Space>
                  <Avatar src={giteaStatus.gitea_user?.avatar} size="small" />
                  <span>{giteaStatus.gitea_user?.name}</span>
                  <span style={{ color: '#999' }}>({giteaStatus.gitea_user?.login})</span>
                </Space>
              </div>
            ) : (
              <Alert
                message="Not connected to Gitea"
                description="Connect your Gitea account to browse repositories and view code"
                type="info"
                showIcon
              />
            )}
          </div>
          
          <div>
            {giteaStatus?.authorized ? (
              <Space>
                <Button onClick={loadRepositories} loading={loading}>
                  Refresh Repositories
                </Button>
                <Button 
                  icon={<DisconnectOutlined />}
                  onClick={revokeGiteaAuth}
                  danger
                >
                  Disconnect
                </Button>
              </Space>
            ) : (
              <Button
                type="primary"
                icon={<GithubOutlined />}
                onClick={startGiteaAuth}
                loading={authLoading}
              >
                Connect to Gitea
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 仓库列表 */}
      {giteaStatus?.authorized && (
        <Card title="Repositories">
          <Spin spinning={loading}>
            {repositories.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={repositories}
                renderItem={(repo) => (
                  <List.Item
                    actions={[
                      <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => selectRepository(repo)}
                      >
                        View Code
                      </Button>,
                      <Button
                        icon={<LinkOutlined />}
                        href={repo.html_url}
                        target="_blank"
                      >
                        Open in Gitea
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar src={repo.owner.avatar_url} />}
                      title={
                        <Space>
                          <span>{repo.full_name}</span>
                          {repo.private && <Tag color="orange">Private</Tag>}
                          {repo.fork && <Tag color="blue">Fork</Tag>}
                          {repo.language && <Tag>{repo.language}</Tag>}
                        </Space>
                      }
                      description={
                        <div>
                          <p>{repo.description || 'No description'}</p>
                          <Space>
                            <span>Updated: {new Date(repo.updated_at).toLocaleDateString()}</span>
                            <span>Size: {(repo.size / 1024).toFixed(1)} KB</span>
                          </Space>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No repositories found" />
            )}
          </Spin>
        </Card>
      )}
    </div>
  );
};

export default CodeBrowser;