import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    if (tokenHash && type) {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as any })
        .then(({ error }) => {
          if (error) {
            setError(error.message);
          } else {
            navigate('/home');
          }
        });
    } else {
      setError('Invalid confirmation link.');
    }
  }, []);

  if (error) return <p>Error: {error}</p>;
  return <p>Confirming your email...</p>;
}
