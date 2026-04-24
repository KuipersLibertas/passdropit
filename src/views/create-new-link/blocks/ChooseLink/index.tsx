import React from 'react';
import {
  Box,
  Button,
  Card,
  Grid,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Images } from '@/utils/assets';
import { DropboxIcon } from '@/utils/icons';
import { CustomToastOptions, ServiceType } from '@/utils/constants';
import { IChooseLink } from '@/types';
import { chooseDropBoxLink, chooseGoogleDriveLink } from '@/utils/functions';
import { toast } from 'react-toastify';

declare global {
  interface Window {
    Dropbox:any;
    gapi: any;
    google: any;
  }
}

type ChooseLinkTypeProps = {
  onChooseLink: (data: IChooseLink) => void,
}

const ChooseLinkType = ({ onChooseLink }: ChooseLinkTypeProps): JSX.Element => {
  const theme = useTheme();
  
  const handleChooseLinkType = (type: number) => {
    if (type === ServiceType.DropBox) {
      chooseDropBoxLink(onChooseLink);
    } else {
      // google drive
      chooseGoogleDriveLink((chooseLink: IChooseLink) => {
        checkGoogleDrivePublic(chooseLink);
      });
    }    
  };

  const checkGoogleDrivePublic = async (linkData: IChooseLink) => {
    try {
      const response = await fetch(
        '/api/gateway/check-google-link',
        {
          method: 'POST',
          body: JSON.stringify({ url: linkData.files[0].url })
        }
      );

      const data = await response.json();      
      if (data.success) {
        onChooseLink(linkData);
      }
    } catch (error: any) {
      toast.error(error.message, CustomToastOptions);
    }
  };

  return (
    <Box>
      <Box py={2}>
        <Typography variant="subtitle1" color="text.secondary" textAlign="center">
          Please choose best one of the options below to create new link...
        </Typography>
      </Box>
      <Box>
        <Grid container spacing={4} sx={{ p: '3rem' }}>
          <Grid item xs={12} sm={6}>
            <Box
              component={Card}
              display="block"
              width={1}
              height={1}
              sx={{
                textDecoration: 'none',
                transition: 'all .2s ease-in-out',
                '&:hover': {
                  transform: `translateY(-${theme.spacing(1 / 2)})`,
                },
              }}
            >
              <Button
                variant="outlined"
                sx={{
                  width: '100%',
                  height: '100%',
                  borderWidth: 3,
                  fontWeight: 700,
                  fontSize: 20,
                  columnGap: 1,
                  '&:hover': {
                    borderWidth: 3
                  }
                }}
                onClick={() => handleChooseLinkType(ServiceType.DropBox)}
              >
                <DropboxIcon width={30} height={30} color={theme.palette.primary.main} />
                DropBox
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box
              component={Card}
              display="block"
              width={1}
              height={1}
              sx={{
                textDecoration: 'none',
                transition: 'all .2s ease-in-out',
                '&:hover': {
                  transform: `translateY(-${theme.spacing(1 / 2)})`,
                },
              }}
            >
              <Button
                variant="outlined"
                color="error"
                sx={{
                  width: '100%',
                  height: '100%',
                  borderWidth: 3,
                  fontWeight: 700,
                  fontSize: 20,
                  columnGap: 1,

                  '&:hover': {
                    borderWidth: 3
                  }
                }}
                onClick={() => handleChooseLinkType(ServiceType.GoogleDrive)}
              >
                <Box
                  component="img"
                  src={Images.GoogleDrive}
                  width={40}
                  height={40}
                  alt=""
                />
                Google Drive
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ChooseLinkType;