import { useEffect } from 'react';

export default function AuthStart() {
  useEffect(() => {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/start`;
  }, []);

  return <p>Redirecting to sign in...</p>;
}