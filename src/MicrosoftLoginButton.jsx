import React from "react";

const MicrosoftLoginButton = () => {
  const clientId = "ec78220d-e785-45bb-84ed-0e89a6c33e81";
  const tenant = "758fd55f-1ab3-4b33-b131-bcd948281ff0";
  const redirectUri = "https://trc-salesgpt-backend.onrender.com/callback";

  const authUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&response_mode=query&scope=offline_access%20https://graph.microsoft.com/Mail.ReadWrite%20https://graph.microsoft.com/Mail.Send%20https://graph.microsoft.com/User.Read`;

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <a
        href={authUrl}
        className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700 transition"
      >
        Sign in with Microsoft
      </a>
    </div>
  );
};

export default MicrosoftLoginButton;
