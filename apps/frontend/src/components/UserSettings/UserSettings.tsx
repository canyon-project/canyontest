import React, { useState } from 'react';
import {
  Modal,
  Form,
  Select,
  ColorPicker,
  Button,
  message,
  Space,
  Divider,
} from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { authAPI } from '../../services/api';

interface UserSettingsProps {
  visible: boolean;
  onClose: () => void;
}

const UserSettings: React.FC<UserSettingsProps> = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const { user, updateUser } = useAuth();
  const { isDark, themeColor, toggleTheme, setThemeColor } = useTheme();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const response = await authAPI.updateSettings({
        language: values.language,
        theme: values.theme,
        theme_color: values.themeColor,
      });
      
      updateUser(response.data);
      
      // 更新i18n语言
      if (values.language !== i18n.language) {
        i18n.changeLanguage(values.language);
        localStorage.setItem('language', values.language);
      }
      
      // 更新主题
      if (values.theme !== (isDark ? 'dark' : 'light')) {
        toggleTheme();
      }
      
      // 更新主题色
      if (values.themeColor !== themeColor) {
        setThemeColor(values.themeColor);
      }
      
      message.success(t('settings.updateSuccess'));
      onClose();
    } catch (error) {
      message.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const initialValues = {
    language: user?.settings.language || 'zh-CN',
    theme: user?.settings.theme || 'light',
    themeColor: user?.settings.theme_color || '#1890ff',
  };

  return (
    <Modal
      title={t('common.settings')}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleSubmit}
      >
        <Form.Item
          name="language"
          label={t('settings.language')}
        >
          <Select>
            <Select.Option value="zh-CN">中文</Select.Option>
            <Select.Option value="en-US">English</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="theme"
          label={t('settings.theme')}
        >
          <Select>
            <Select.Option value="light">{t('settings.light')}</Select.Option>
            <Select.Option value="dark">{t('settings.dark')}</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="themeColor"
          label={t('settings.themeColor')}
        >
          <ColorPicker
            showText
            presets={[
              {
                label: 'Recommended',
                colors: [
                  '#1890ff',
                  '#722ed1',
                  '#13c2c2',
                  '#52c41a',
                  '#faad14',
                  '#f5222d',
                ],
              },
            ]}
          />
        </Form.Item>

        <Divider />

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {t('common.save')}
            </Button>
            <Button onClick={onClose}>
              {t('common.cancel')}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserSettings;