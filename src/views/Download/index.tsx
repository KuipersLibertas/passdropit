'use client';
import Script from 'next/script';

import React, { useState, useCallback } from 'react';
import Container from '@/components/Container';
import ValidationCheckForm from '@/views/Download/blocks/ValidationCheckForm';
import SharedFiles from '@/views/Download/blocks/SharedFiles';

import {
  Box,
  Link,
  Typography,
} from '@mui/material';


import { IServerLinkDetail } from '@/types';
import { Face5 } from '@mui/icons-material';

const Download = ({ linkInfo }: { linkInfo: IServerLinkDetail }): JSX.Element => {
  const [isValidated, setIsValidated] = useState<boolean>(linkInfo.ignoreValidate);

  const handleValidationResult = useCallback((result: boolean): void => {
    setIsValidated(result);
  }, []);

  return (
    <Container maxWidth={800}>
      <Script src="https://stpd.cloud/assets/stpdwrapper.js" async />
      <Box
        display="flex"
        justifyContent="center"
      >
        {linkInfo.ownerLogo
          ?
          <Box
            component="img"
            src={`${process.env.NEXT_PUBLIC_BACKEND_SITE_URL}/storage/${linkInfo.ownerLogo}`}
            width={256}
            alt=""
          />
          :
          // <Image
          //   src={theme.palette.mode === ThemeMode.dark ? Images.LightLogo : Images.DarkLogo}
          //   width={345}
          //   height={45}
          //   alt=""
          // />
          <Face5
            sx={{
              width: '256px',
              height: '256px',
              opacity: '.5',
            }}
          />
        }
        
      </Box>
      <Box
        component="main"
      >
        <Box px="5rem" py="3rem">
          {(!isValidated && !linkInfo.requirePaid) ? (
            <ValidationCheckForm
              linkInfo={linkInfo}
              onValidationResult={handleValidationResult}              
            />
          ) : (
            <SharedFiles linkInfo={linkInfo} />
          )}
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography variant="subtitle1" color="text.secondary">
          Use&nbsp;
          <Link href={process.env.NEXT_PUBLIC_PASSDROPIT_SITE_URL}>
            Passdropit
          </Link>
          &nbsp;to password protect your Dropbox and Google Drive links and folders.
          
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" mt={2}>
          Or use&nbsp;
          <Link href="https://www.notions11.com">Notions11</Link>
          &nbsp;to password protect your <strong>Notion</strong> links.
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" mt={1}>
          Looking for a free storage alternative to Dropbox?
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Check out&nbsp;
          <Link href="https://www.filestreams.com">Filestreams.com</Link>
          &nbsp;Easily share your files. Free plan up to 5 GB.
        </Typography>
      </Box>
      <ins 
        className="stpdwrapper"
        style={{
          display: 'inline-block',
          position: 'fixed',
          left: 0,
          top:70
        }}
        data-tag-id="4218"></ins>
      <Script 
        dangerouslySetInnerHTML={{
          __html: `
          (stpdwrapper = window.stpdwrapper || []).push({});
          `
        }}
      />
      <ins 
        className="stpdwrapper"
        style={{
          display: 'inline-block',
          position: 'fixed',
          right: 0,
          top:70
        }}
        data-tag-id="4219"></ins>
      <Script 
        dangerouslySetInnerHTML={{
          __html: `
          (stpdwrapper = window.stpdwrapper || []).push({});
          `
        }}
      />
    </Container>
    
  );
};

export default Download;