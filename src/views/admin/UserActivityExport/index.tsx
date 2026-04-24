'use client';

import React, {useState} from 'react';
import AdminLayout from '@/views/shared/layouts/AdminLayout';

import {
  Box,
  Typography,
  Divider,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { FileDownload as FileDownloadIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { CustomToastOptions } from '@/utils/constants';

const UserActivityExport = (): JSX.Element => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleExport = async (): Promise<void> => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/gateway/export-activity');
      const json = await response.json();
      if (json.success) {
        window.open(`${process.env.NEXT_PUBLIC_BACKEND_SITE_URL}${json.path}`, '_self');
      }
    } catch (error: any) {
      toast.error(error.message, CustomToastOptions);
    } finally {
      setIsProcessing(false);
    }
    
  };

  return (
    <AdminLayout>
      <Box mb="2rem">
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
          }}
        >
          User Activity Export
        </Typography>
      </Box>
      <Divider />
      <Box display="flex" justifyContent="center" py="2rem">
        <LoadingButton
          variant="contained"
          color="success"
          sx={{ alignItems: 'center' }}
          loading={isProcessing}
          onClick={handleExport}
        >
          <FileDownloadIcon />
          Export User Data
        </LoadingButton>
      </Box>
    </AdminLayout>
  );
};

export default UserActivityExport;