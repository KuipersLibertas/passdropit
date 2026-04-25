'use client';

import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';

export default function UpgradeProSuccess() {
  useEffect(() => {
    // Sync Stripe status and re-encode the session JWT, then land on plan page
    const timer = setTimeout(() => {
      window.location.href = '/api/auth/session-refresh?sync=1&callbackUrl=/user/plan';
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

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
      <CheckCircleOutline sx={{ fontSize: 64, color: 'success.main' }} />
      <Typography variant="h5" fontWeight={600}>
        Payment successful!
      </Typography>
      <CircularProgress size={28} />
      <Typography color="text.secondary">
        Activating your Pro account…
      </Typography>
    </Box>
  );
}
