'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function UpgradeProSuccess() {
  const router = useRouter();

  useEffect(() => {
    // Session is refreshed server-side via /api/auth/session-refresh
    // This page is shown momentarily before redirect
    const timer = setTimeout(() => {
      router.push('/user/plan');
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 3,
      }}
    >
      <CircularProgress size={48} />
      <Typography variant="h5" fontWeight={600}>
        Activating your Pro account…
      </Typography>
      <Typography color="text.secondary">
        You will be redirected shortly.
      </Typography>
    </Box>
  );
}
