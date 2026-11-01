'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Container from '@/components/Container';
import { Box, Typography, CircularProgress, Link } from '@mui/material';

const VerifyEmail = (): JSX.Element => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found. Please check the link in your email.');
      return;
    }

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStatus('success');
        } else {
          setStatus('error');
          setMessage(data.message ?? 'Verification failed.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      });
  }, [token]);

  return (
    <Container sx={{ maxWidth: '40rem' }}>
      <Box marginBottom={4} textAlign="center">
        {status === 'loading' && (
          <>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h5">Verifying your email…</Typography>
          </>
        )}
        {status === 'success' && (
          <>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Email verified!
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              Your email address has been confirmed.
            </Typography>
            <Typography mt={2}>
              <Link className="link" href="/signin">
                Sign in to your account
              </Link>
            </Typography>
          </>
        )}
        {status === 'error' && (
          <>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Verification failed
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              {message}
            </Typography>
            <Typography mt={2}>
              <Link className="link" href="/signin">
                Back to sign in
              </Link>
            </Typography>
          </>
        )}
      </Box>
    </Container>
  );
};

export default VerifyEmail;
