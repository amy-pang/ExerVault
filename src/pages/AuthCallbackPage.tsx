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
    const code = searchParams.get('code');

    if (tokenHash && type) {
      // Email verification flow
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
    } else if (code) {
      // Google OAuth PKCE flow
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          setError(error.message);
          setStatus('error');
        } else {
          navigate('/home');
        }
      });
    } else {
      // Fallback — listen for auth state change
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          navigate('/home');
        } else {
          setError('Authentication failed.');
          setStatus('error');
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  return (
    <>
      {status === 'verifying' && (
        <p style={{ padding: '2rem', textAlign: 'center' }}>Signing you in…</p>
      )}
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
