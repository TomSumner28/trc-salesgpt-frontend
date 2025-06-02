import React from "react";

const MicrosoftLoginButton = () => {
  const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;
  const tenant = import.meta.env.VITE_MICROSOFT_TENANT_ID;
  const redirectUri = import.meta.env.VITE_MICROSOFT_REDIRECT_URI;

  const authUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&response_mode=query&scope=offline_access%20https://graph.microsoft.com/Mail.ReadWrite%20https://graph.microsoft.com/Mail.Send%20https://graph.microsoft.com/User.Read`;

  return (
    <a href={authUrl}>
      <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Sign in with Microsoft
      </button>
    </a>
  );
};

export default MicrosoftLoginButton;