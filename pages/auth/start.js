import { useEffect } from 'react';

export default function AuthStart() {
  useEffect(() => {
    window.location.href = 'https://trc-salesgpt-backend.onrender.com/auth/start';
  }, []);

  return <p>Redirecting to Microsoft login...</p>;
}