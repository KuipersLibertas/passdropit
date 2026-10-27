'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, LinearProgress, Button } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { LockOpenOutlined } from '@mui/icons-material';
import AdSlot from '@/components/AdSlot';
import { ThemeMode } from '@/utils/constants';

interface Props {
  onComplete: () => void;
  onUpgrade: () => void;
}

const COUNTDOWN_SECONDS = 5;

export default function DownloadGateway({ onComplete, onUpgrade }: Props) {
  const theme = useTheme();
  const isLight = theme.palette.mode === ThemeMode.light;
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);

  const handleComplete = useCallback(() => onComplete(), [onComplete]);

  useEffect(() => {
    if (seconds <= 0) {
      handleComplete();
      return;
    }
    const timer = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, handleComplete]);

  const progress = ((COUNTDOWN_SECONDS - seconds) / COUNTDOWN_SECONDS) * 100;

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1400,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        backgroundColor: isLight
          ? 'rgba(255,255,255,0.97)'
          : 'rgba(15,23,42,0.97)',
        backdropFilter: 'blur(12px)',
        px: 2,
      }}
    >
      {/* Ad unit */}
      <Box sx={{ textAlign: 'center', minHeight: 90 }}>
        {/* TODO: Request a Setupad interstitial/leaderboard tag ID for higher eCPM here.
            Currently reuses the side-rail tag as a placeholder. */}
        <AdSlot
          tagId="4218"
          slotId="gateway-center"
          style={{ display: 'block', margin: '0 auto' }}
        />
      </Box>

      {/* Icon + copy */}
      <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LockOpenOutlined sx={{ color: '#fff', fontSize: 22 }} />
        </Box>
        <Typography variant="subtitle1" fontWeight={700} textAlign="center">
          Your download is ready
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Continuing in <strong>{seconds}</strong>s…
        </Typography>
      </Box>

      {/* Progress bar */}
      <Box sx={{ width: '100%', maxWidth: 300 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 5,
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.primary.main, 0.15),
            '& .MuiLinearProgress-bar': { borderRadius: 3 },
          }}
        />
      </Box>

      {/* Actions */}
      <Box display="flex" alignItems="center" gap={2}>
        <Button
          size="small"
          variant="text"
          color="inherit"
          onClick={handleComplete}
          sx={{ color: 'text.secondary', fontSize: '0.8rem' }}
        >
          Skip
        </Button>
        <Typography variant="caption" color="text.disabled">·</Typography>
        <Button
          size="small"
          variant="text"
          color="primary"
          onClick={onUpgrade}
          sx={{ fontSize: '0.8rem', fontWeight: 600 }}
        >
          Upgrade to Pro — skip ads forever
        </Button>
      </Box>
    </Box>
  );
}
