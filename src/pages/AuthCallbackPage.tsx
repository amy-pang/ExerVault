import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import bannerStyles from './AuthCallbackPage.module.css';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    if (tokenHash && type) {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as any })
        .then(({ error }) => {
          if (error) {
            setError(error.message);
            setStatus('error');
          } else {
            setStatus('success');
            setTimeout(() => navigate('/home'), 2500);
          }
        });
    } else {
      setError('Invalid confirmation link.');
      setStatus('error');
    }
  }, []);

  return (
    <>
      {status === 'success' && (
        <div className={`${bannerStyles.banner} ${bannerStyles.bannerSuccess}`}>
          Email successfully verified!
        </div>
      )}
      {status === 'error' && (
        <div className={`${bannerStyles.banner} ${bannerStyles.bannerError}`}>
          Verification failed: {error}
        </div>
      )}
    </>
  );
}
