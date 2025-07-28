import React, { useState, useEffect } from 'react';
import { Card, Tree, Spin, message, Button, Space, Breadcrumb } from 'antd';
import { FileOutlined, FolderOutlined, ReloadOutlined } from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { useTheme } from '../../contexts/ThemeContext';
import { giteaAPI, FileContent, Repository } from '../../services/gitea';
import './CodeViewer.css';

interface CodeViewerProps {
  repository: Repository;
}

interface TreeNode {
  title: string;
  key: string;
  icon: React.ReactNode;
  isLeaf: boolean;
  path: string;
  type: 'file' | 'dir';
  children?: TreeNode[];
}

const CodeViewer: React.FC<CodeViewerProps> = ({ repository }) => {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileContent, setFileContent] = useState<string>('');
  const [currentFile, setCurrentFile] = useState<string>('');
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [language, setLanguage] = useState<string>('text');
  const { isDark } = useTheme();

  // 根据文件扩展名确定语言
  const getLanguageFromPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'go': 'go',
      'rs': 'rust',
      'cpp': 'cpp',
      'c': 'c',
      'h': 'c',
      'hpp': 'cpp',
      'css': 'css',
      'scss': 'scss',
      'less': 'less',
      'html': 'html',
      'xml': 'xml',
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'sql': 'sql',
      'sh': 'shell',
      'bash': 'shell',
      'dockerfile': 'dockerfile',
      'vue': 'html',
      'php': 'php',
      'rb': 'ruby',
    };
    return languageMap[ext || ''] || 'text';
  };

  // 加载目录内容
  const loadDirectoryContents = async (path: string = '') => {
    setLoading(true);
    try {
      const response = await giteaAPI.getDirectoryContents(
        repository.owner.login,
        repository.name,
        path
      );
      
      const nodes: TreeNode[] = response.data.map((item: FileContent) => ({
        title: item.name,
        key: item.path,
        icon: item.type === 'dir' ? <FolderOutlined /> : <FileOutlined />,
        isLeaf: item.type === 'file',
        path: item.path,
        type: item.type as 'file' | 'dir',
      }));
      
      if (path === '') {
        setTreeData(nodes);
      } else {
        // 更新树节点的子节点
        updateTreeData(treeData, path, nodes);
      }
    } catch (error) {
      message.error('Failed to load directory contents');
    } finally {
      setLoading(false);
    }
  };

  // 更新树数据
  const updateTreeData = (list: TreeNode[], key: string, children: TreeNode[]): TreeNode[] => {
    return list.map((node) => {
      if (node.key === key) {
        return { ...node, children };
      }
      if (node.children) {
        return { ...node, children: updateTreeData(node.children, key, children) };
      }
      return node;
    });
  };

  // 加载文件内容
  const loadFileContent = async (path: string) => {
    setLoading(true);
    try {
      const response = await giteaAPI.getFileContent(
        repository.owner.login,
        repository.name,
        path
      );
      
      setFileContent(response.data.content || '');
      setCurrentFile(path);
      setLanguage(getLanguageFromPath(path));
      
      // 更新面包屑
      const pathParts = path.split('/').filter(Boolean);
      setCurrentPath(pathParts);
    } catch (error) {
      message.error('Failed to load file content');
    } finally {
      setLoading(false);
    }
  };

  // 处理树节点选择
  const onSelect = (selectedKeys: React.Key[], info: any) => {
    if (selectedKeys.length > 0) {
      const node = info.node;
      if (node.type === 'file') {
        loadFileContent(node.path);
      }
    }
  };

  // 处理树节点展开
  const onLoadData = ({ key, children }: any) => {
    return new Promise<void>((resolve) => {
      if (children) {
        resolve();
        return;
      }
      loadDirectoryContents(key).then(() => resolve());
    });
  };

  // 初始化加载
  useEffect(() => {
    loadDirectoryContents();
  }, [repository]);

  return (
    <div className="code-viewer">
      <div className="code-viewer-header">
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => loadDirectoryContents()}
            loading={loading}
          >
            Refresh
          </Button>
        </Space>
      </div>
      
      <div className="code-viewer-content">
        <div className="file-tree">
          <Card title="Files" size="small">
            <Spin spinning={loading}>
              <Tree
                showIcon
                loadData={onLoadData}
                treeData={treeData}
                onSelect={onSelect}
              />
            </Spin>
          </Card>
        </div>
        
        <div className="code-editor">
          <Card 
            title={
              currentFile ? (
                <Breadcrumb>
                  <Breadcrumb.Item>{repository.name}</Breadcrumb.Item>
                  {currentPath.map((part, index) => (
                    <Breadcrumb.Item key={index}>{part}</Breadcrumb.Item>
                  ))}
                </Breadcrumb>
              ) : 'Select a file to view'
            }
            size="small"
          >
            {currentFile ? (
              <Editor
                height="600px"
                language={language}
                value={fileContent}
                theme={isDark ? 'vs-dark' : 'light'}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  lineNumbers: 'on',
                  wordWrap: 'on',
                }}
              />
            ) : (
              <div style={{ 
                height: '600px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#999'
              }}>
                Select a file from the tree to view its content
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CodeViewer;