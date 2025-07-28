import React from 'react';
import { Card } from 'antd';
import { useTranslation } from 'react-i18next';

const Settings: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('menu.settings')}</h1>
      <Card>
        <p>System settings will be implemented here.</p>
      </Card>
    </div>
  );
};

export default Settings;