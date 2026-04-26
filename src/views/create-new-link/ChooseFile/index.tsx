'use client';

import React, { useState, useCallback } from 'react';
import CommonLayout from '@/views/shared/layouts/CommonLayout';
import ChooseLinkType from '@/views/create-new-link/blocks/ChooseLink';
import GenerateUrlPwd from '@/views/create-new-link/blocks/GenerateUrlPwd';
import ChooseResult from '@/views/create-new-link/blocks/ChooseResult';

import {
  Box, Typography, Tabs, Tab
} from '@mui/material';
import { IChooseLink } from '@/types';

const CreateNewLink = (): JSX.Element => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [chooseLink, setChooseLink] = useState<IChooseLink>();
  
  const handleChooseLink = useCallback((data: IChooseLink): void => {
    if (data.files.length === 0) return;
    
    setCurrentStep(2);
    setChooseLink(data);
  }, []);  

  const handleSaveLink = useCallback((link: string, password: string): void => {
    const data = { ...chooseLink, link: link, password: password };
    setChooseLink(data as IChooseLink);
    setCurrentStep(3);
  }, []);

  return (
    <CommonLayout title='Create New Link'>
      <Box maxWidth={900} mt='1rem' mx='auto'>
        <Tabs value={0} sx={{ mb: 2 }}>
          <Tab label="Choose File" href="/create-new-link/file" component="a" />
          <Tab label="Dropbox Folder Link" href="/create-new-link/dropbox-folder" component="a" />
        </Tabs>
        {currentStep !== 3&&
          <Typography variant='h5' textAlign='center'>
            Password Protect a Dropbox or Google Drive file
          </Typography>
        }
        {currentStep === 1&&
          <ChooseLinkType onChooseLink={handleChooseLink} />
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

export default CreateNewLink;