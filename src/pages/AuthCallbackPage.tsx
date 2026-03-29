import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styles from './SignInPage.module.css';

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
            setTimeout(() => navigate('/home'), 2000);
          }
        });
    } else {
      setError('Invalid confirmation link.');
      setStatus('error');
    }
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {status === 'verifying' && (
          <>
            <h1 className={styles.title}>Verifying…</h1>
            <p style={{ color: 'var(--muted)', margin: 0 }}>Please wait while we confirm your email.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <h1 className={styles.title}>Email confirmed!</h1>
            <p style={{ color: 'var(--muted)', margin: 0 }}>Your email has been verified. Redirecting you now…</p>
          </>
        )}
        {status === 'error' && (
          <>
            <h1 className={styles.title}>Verification failed</h1>
            <p className={styles.error}>{error}</p>
          </>
        )}
      </div>
    </div>
  );
}
