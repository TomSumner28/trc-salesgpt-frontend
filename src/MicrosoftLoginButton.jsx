import React from 'react';

export const MicrosoftLoginButton = () => {
  const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_MICROSOFT_REDIRECT_URI;
  const tenant = import.meta.env.VITE_MICROSOFT_TENANT_ID;

  const authUrl = \`https://login.microsoftonline.com/\${tenant}/oauth2/v2.0/authorize?client_id=\${clientId}&response_type=code&redirect_uri=\${redirectUri}&response_mode=query&scope=offline_access%20https://graph.microsoft.com/Mail.ReadWrite%20https://graph.microsoft.com/Mail.Send%20https://graph.microsoft.com/User.Read\`;

  return (
    <a
      href={authUrl}
      className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700"
    >
      Sign in with Microsoft
    </a>
  );
};
