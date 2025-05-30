import { useEffect } from 'react';

export default function Home() {
  const handleConnectOutlook = () => {
    const clientId = process.env.NEXT_PUBLIC_OUTLOOK_CLIENT_ID;
    const tenant = process.env.NEXT_PUBLIC_OUTLOOK_TENANT_ID || 'common';
    const redirectUri = process.env.NEXT_PUBLIC_OUTLOOK_REDIRECT_URI;

    const authUrl = \`https://login.microsoftonline.com/\${tenant}/oauth2/v2.0/authorize?client_id=\${clientId}&response_type=code&redirect_uri=\${encodeURIComponent(redirectUri)}&response_mode=query&scope=Mail.ReadWrite Mail.Send offline_access User.Read\`;

    window.location.href = authUrl;
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>TRC SalesGPT</h1>
      <p>Link your Outlook to get started</p>
      <button onClick={handleConnectOutlook} style={{ padding: '1rem', fontSize: '1.1rem' }}>
        Link Outlook
      </button>
    </div>
  );
}