
import React from 'react';

const MicrosoftLoginButton = () => {
  const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;
  const tenant = import.meta.env.VITE_MICROSOFT_TENANT_ID;
  const redirectUri = import.meta.env.VITE_MICROSOFT_REDIRECT_URI;

  const authUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&response_mode=query&scope=offline_access https://graph.microsoft.com/Mail.ReadWrite https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/User.Read`;

  return (
    <button
      onClick={() => window.location.href = authUrl}
      style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
    >
      Sign in with Microsoft
    </button>
  );
};

export default MicrosoftLoginButton;
