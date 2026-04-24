'use client';

import React, { useState, useCallback } from 'react';
import CommonLayout from '@/views/shared/layouts/CommonLayout';
import GenerateUrlPwd from '@/views/create-new-link/blocks/GenerateUrlPwd';
import ChooseResult from '@/views/create-new-link/blocks/ChooseResult';
import ChooseFolder from '@/views/create-new-link/blocks/ChooseFolder';

import {
  Box,
  Typography
} from '@mui/material';
import { IChooseLink } from '@/types';


const ChooseDropboxFolder = (): JSX.Element => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [chooseLink, setChooseLink] = useState<IChooseLink>();

  const handleChooseFolder = useCallback((chooseLink: IChooseLink): void => {
    setChooseLink(chooseLink);
    setCurrentStep(2);
  }, []);

  const handleSaveLink = useCallback((link: string, password: string): void => {
    const data = { ...chooseLink, link: link, password: password };
    setChooseLink(data as IChooseLink);
    setCurrentStep(3);
  }, []);

  return (
    <CommonLayout title="Create New Link">
      <Box maxWidth={900} mt="1rem" mx="auto">
        {currentStep !== 3&&
          <Typography variant="h5" textAlign="center">
            Password Protect a Dropbox or Google Drive file
          </Typography>
        }
        {currentStep === 1&&
          <ChooseFolder onChooseFolder={handleChooseFolder} />
        }
        {(currentStep === 2 && chooseLink)&&
          <GenerateUrlPwd linkInfo={chooseLink} onSave={handleSaveLink} />
        }
        {(currentStep === 3 && chooseLink)&&
          <ChooseResult linkInfo={chooseLink}/>
        }
      </Box>
    </CommonLayout>
  );
};

export default ChooseDropboxFolder;