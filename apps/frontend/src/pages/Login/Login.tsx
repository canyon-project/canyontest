import React, { useState } from 'react';
import { Form, Input, Button, Card, Tabs, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login, register } = useAuth();

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success(t('auth.loginSuccess'));
      navigate('/dashboard');
    } catch (error) {
      message.error(t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: { username: string; email: string; password: string }) => {
    setLoading(true);
    try {
      await register(values.username, values.email, values.password);
      message.success(t('auth.registerSuccess'));
      navigate('/dashboard');
    } catch (error) {
      message.error(t('auth.registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  const loginForm = (
    <Form
      name="login"
      onFinish={handleLogin}
      autoComplete="off"
      size="large"
    >
      <Form.Item
        name="username"
        rules={[{ required: true, message: t('auth.usernameRequired') }]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder={t('common.username')}
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: t('auth.passwordRequired') }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder={t('common.password')}
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
        >
          {t('common.login')}
        </Button>
      </Form.Item>
    </Form>
  );

  const registerForm = (
    <Form
      name="register"
      onFinish={handleRegister}
      autoComplete="off"
      size="large"
    >
      <Form.Item
        name="username"
        rules={[
          { required: true, message: t('auth.usernameRequired') },
          { min: 3, max: 20, message: 'Username must be 3-20 characters' },
        ]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder={t('common.username')}
        />
      </Form.Item>

      <Form.Item
        name="email"
        rules={[
          { required: true, message: t('auth.emailRequired') },
          { type: 'email', message: 'Please enter a valid email' },
        ]}
      >
        <Input
          prefix={<MailOutlined />}
          placeholder={t('common.email')}
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[
          { required: true, message: t('auth.passwordRequired') },
          { min: 6, message: 'Password must be at least 6 characters' },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder={t('common.password')}
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
        >
          {t('common.register')}
        </Button>
      </Form.Item>
    </Form>
  );

  const tabItems = [
    {
      key: 'login',
      label: t('common.login'),
      children: loginForm,
    },
    {
      key: 'register',
      label: t('common.register'),
      children: registerForm,
    },
  ];

  return (
    <div className="login-container">
      <Card className="login-card" title="CanyonTest">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          centered
        />
      </Card>
    </div>
  );
};

export default Login;