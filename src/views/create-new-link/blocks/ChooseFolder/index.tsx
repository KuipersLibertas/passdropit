import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { IChooseLink, IValidationError } from '@/types';
import { KeyboardDoubleArrowRight } from '@mui/icons-material';
import { generateLink, generatePassword } from '@/utils/functions';
import { LinkType, ServiceType } from '@/utils/constants';

type ChooseFolderProps = {
  onChooseFolder: (data: IChooseLink) => void,
}

const ChooseFolder = ({ onChooseFolder }: ChooseFolderProps): JSX.Element => {
  const [link, setLink] = useState<string>('');
  const [error, setError] = useState<IValidationError|null>(null);

  const handleChooseFolder = () => {
    if (link.trim() === '') {
      setError({
        link: {
          message: 'Please enter a valid link'
        }
      });
      return;
    }

    if (link.substring(0,34) !== 'https://dl.dropboxusercontent.com/' && link.substring(0,24) !== 'https://www.dropbox.com/') {
      setError({
        link: {
          message: 'Please enter a valid link'
        }
      });
      return;
    }

    setError(null);

    const data: IChooseLink = {
      link: generateLink(),
      password: generatePassword(),
      service: ServiceType.DropBox,
      linkType: LinkType.Folder,
      files: [
        {
          url: link,
        }
      ]
    };

    onChooseFolder(data);
  };

  return (
    <Box>
      <Box py={2}>
        <Typography variant="subtitle1" color="text.secondary" textAlign="center">
          Past a Dropbox Folder link to share it&apos;s content
        </Typography>
      </Box>
      <Box
        maxWidth={600}
        mx="auto"
        mt={2}
      >
        <TextField
          variant="standard"
          label="Dropbox folder link"
          fullWidth
          onChange={(e) => setLink(e.target.value)}
          value={link}
          error={!!error?.link}
          helperText={error?.link?.message}
        />
      </Box>
      <Box
        display="flex"
        justifyContent="flex-end"
        mt={4}
        mx="auto"
        maxWidth={600}
      >
        <LoadingButton
          variant="contained"
          onClick={handleChooseFolder}
          sx={{ px: 4 }}
        >
          Next
          <KeyboardDoubleArrowRight fontSize="medium" />
        </LoadingButton>
      </Box>
    </Box>
  );
};

export default ChooseFolder;