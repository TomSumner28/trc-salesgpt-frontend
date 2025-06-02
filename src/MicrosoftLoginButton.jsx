
import React from "react";

const MicrosoftLoginButton = () => {
  const clientId = "ec78220d-e785-45bb-84ed-0e89a6c33e81";
  const tenant = "common";  // or use your specific tenant ID if needed
  const redirectUri = "https://trc-salesgpt-backend.onrender.com/callback";

  const authUrl = \`https://login.microsoftonline.com/\${tenant}/oauth2/v2.0/authorize?client_id=\${clientId}&response_type=code&redirect_uri=\${redirectUri}&response_mode=query&scope=offline_access%20https://graph.microsoft.com/Mail.ReadWrite%20https://graph.microsoft.com/Mail.Send%20https://graph.microsoft.com/User.Read\`;

  return (
    <div className="flex justify-center mt-12">
      <a
        href={authUrl}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
      >
        Sign in with Microsoft
      </a>
    </div>
  );
};

export default MicrosoftLoginButton;
