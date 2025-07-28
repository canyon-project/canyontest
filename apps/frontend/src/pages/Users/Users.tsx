import React from 'react';
import { Table, Button, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const Users: React.FC = () => {
  const { t } = useTranslation();

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('common.username'),
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: t('common.email'),
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button icon={<EditOutlined />} size="small" />
          <Button icon={<DeleteOutlined />} size="small" danger />
        </Space>
      ),
    },
  ];

  const data = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
    },
    {
      id: 2,
      username: 'user1',
      email: 'user1@example.com',
    },
  ];

  return (
    <div>
      <h1>{t('menu.users')}</h1>
      <Table columns={columns} dataSource={data} rowKey="id" />
    </div>
  );
};

export default Users;