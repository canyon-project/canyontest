import React, { createContext, useContext, useEffect, useState } from 'react';
import { ConfigProvider, theme } from 'antd';
import { useAuth } from './AuthContext';

interface ThemeContextType {
  isDark: boolean;
  themeColor: string;
  toggleTheme: () => void;
  setThemeColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [themeColor, setThemeColorState] = useState('#1890ff');

  useEffect(() => {
    if (user?.settings) {
      setIsDark(user.settings.theme === 'dark');
      setThemeColorState(user.settings.theme_color || '#1890ff');
    }
  }, [user]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const setThemeColor = (color: string) => {
    setThemeColorState(color);
  };

  const value = {
    isDark,
    themeColor,
    toggleTheme,
    setThemeColor,
  };

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider
        theme={{
          algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: themeColor,
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};