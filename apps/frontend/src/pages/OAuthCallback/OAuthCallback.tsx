import React, { useEffect } from 'react';
import { Spin } from 'antd';
import { giteaAPI } from '../../services/gitea';

const OAuthCallback: React.FC = () => {
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      if (error) {
        // 通知父窗口授权失败
        if (window.opener) {
          window.opener.postMessage({
            type: 'GITEA_AUTH_ERROR',
            error: error
          }, '*');
        }
        window.close();
        return;
      }

      if (code) {
        try {
          await giteaAPI.callback(code, state || undefined);
          
          // 通知父窗口授权成功
          if (window.opener) {
            window.opener.postMessage({
              type: 'GITEA_AUTH_SUCCESS'
            }, '*');
          }
          window.close();
        } catch (error) {
          // 通知父窗口授权失败
          if (window.opener) {
            window.opener.postMessage({
              type: 'GITEA_AUTH_ERROR',
              error: 'Failed to exchange code'
            }, '*');
          }
          window.close();
        }
      }
    };

    handleCallback();
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <Spin size="large" />
      <span style={{ marginLeft: 16 }}>Processing authorization...</span>
    </div>
  );
};

export default OAuthCallback;