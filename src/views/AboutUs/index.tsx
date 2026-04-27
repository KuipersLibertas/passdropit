'use client';

import React from 'react';
import HelpLayout from '@/views/shared/layouts/HelpLayout';
import Image from 'next/image';

import { Box, IconButton, Link, Typography } from '@mui/material';
import { Images } from '@/utils/assets';
import { LinkedIn } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { ThemeMode } from '@/utils/constants';


const AboutUs = (): JSX.Element => {
  const theme = useTheme();

  return (
    <HelpLayout title="About Us">
      <Box>
        <p>Hello and thank you for visiting Passdropit! Whether you use Dropbox or Google Drive, Passdropit is the go-to solution to password protect your links. </p>
        <p>Passdropit was launched almost a decade ago (2014 to be exact) by an independent developer from Canada. He noticed that Dropbox and Google lacked the basic functionality of adding a password to your links and decided to build this feature himself. Passdropit soon became very popular amongst photographers around the world who share their digital presets securely with their own community. Meanwhile, over 35.000 users have created an account on Passdropit, securing well over 150.000 links!</p>
        <p>In 2022 Passdropit was acquired by Robin Kuipers, an internet entrepreneur from The Netherlands. He is since managing Passdropit with a small team of freelance developers. This acquisition resulted in the launch of a Passdropit spin-off called Notions11.com ; a tool to secure Notion links with a password, and with similar features as Passdropit.</p>
        <p><br /></p>
        <p>If you are one of the millions of people who use Dropbox or Google Drive to share your files, Passdropit is a very relevant solution. The power lies in it&apos;s simplicity. With a few clicks you have secured your link and you&apos;ll be able to gain insights on who has opened your links.  We are constantly working on improving Passdropit and introducing new features. </p>
        <p><br /></p>
        <p></p>If you like to reach out to us, or in need of technical support, you can contact us via support@passdropit.com or through our socials. We try to respond as quickly as possible.
        <p><br /></p>
      </Box>
      <Box display="flex" alignItems="center" columnGap={1}>
        <Typography variant="subtitle1">Mail: </Typography>
        <Link href="mailto:support@passdropit.com">support@passdropit.com</Link>
      </Box>
      <Box mt={2}>
        <Image
          src={Images.OwnerPhoto}
          alt="Robin Kuipers, founder of Passdropit"
          width={250}
          height={250}
          style={{ borderRadius: '100%' }}
        />
      </Box>
      <Box mt={1}>
        <Typography variant="h6" component="p" fontWeight={500}>Robin Kuipers</Typography>
      </Box>
      <Box mt={2}>
        <Typography variant="subtitle1">Linkedin </Typography>
        <IconButton
          href=" https://www.linkedin.com/in/robin-kuipers/"
          sx={{ ml: '-14px' }}
          target="_blank"
        >
          <LinkedIn
            sx={{
              width: 50,
              height: 50,
              color: theme.palette.mode === ThemeMode.light ? '#000' : '#fff'
            }}
          />
        </IconButton>
      </Box>
    </HelpLayout>
  );
};

export default AboutUs;