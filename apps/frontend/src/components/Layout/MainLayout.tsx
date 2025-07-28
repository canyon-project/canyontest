import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Space } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import UserSettings from '../UserSettings/UserSettings';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { isDark } = useTheme();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: t('menu.dashboard'),
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: t('menu.users'),
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: t('menu.settings'),
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('common.profile'),
      onClick: () => setSettingsVisible(true),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('common.settings'),
      onClick: () => setSettingsVisible(true),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('common.logout'),
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: isDark ? '#001529' : '#fff',
          borderRight: isDark ? 'none' : '1px solid #f0f0f0',
        }}
      >
        <div
          style={{
            height: 32,
            margin: 16,
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isDark ? '#fff' : '#1890ff',
            fontWeight: 'bold',
          }}
        >
          {collapsed ? 'C' : 'CanyonTest'}
        </div>
        
        <Menu
          theme={isDark ? 'dark' : 'light'}
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
        
        {/* 用户头像区域 - 固定在左下角 */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: collapsed ? 16 : 24,
            right: collapsed ? 16 : 24,
          }}
        >
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="topRight"
            trigger={['click']}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: collapsed ? 8 : '8px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s',
              }}
            >
              <Avatar
                size={collapsed ? 32 : 40}
                src={user?.avatar}
                icon={<UserOutlined />}
              />
              {!collapsed && (
                <div style={{ marginLeft: 12, color: isDark ? '#fff' : '#000' }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    {user?.username}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    {user?.email}
                  </div>
                </div>
              )}
            </div>
          </Dropdown>
        </div>
      </Sider>
      
      <Layout>
        <Header
          style={{
            padding: 0,
            background: isDark ? '#001529' : '#fff',
            borderBottom: isDark ? 'none' : '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
              color: isDark ? '#fff' : '#000',
            }}
          />
          
          <Space style={{ marginRight: 24 }}>
            {/* 这里可以添加其他头部操作按钮 */}
          </Space>
        </Header>
        
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: isDark ? '#141414' : '#fff',
            borderRadius: 6,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
      
      <UserSettings
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </Layout>
  );
};

export default MainLayout;