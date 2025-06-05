import { useEffect } from "react";

export default function AuthStart() {
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_CLIENT_ID || process.env.NEXT_PUBLIC_AZURE_CLIENT_ID;
    const redirectUri = "https://trc-salesgpt-backend.onrender.com/callback";
    const scopes = [
      "openid",
      "profile",
      "email",
      "offline_access",
      "User.Read",
      "Mail.Read",
      "Mail.ReadWrite",
      "Mail.Send"
    ];

    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_mode=query&scope=${encodeURIComponent(scopes.join(" "))}`;

    window.location.href = authUrl;
  }, []);

  return <p>Redirecting to Microsoft login...</p>;
}
