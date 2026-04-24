import React from 'react';
import Container from '@/components/Container';

import {
  Typography,
  Box,
  Link
} from '@mui/material';

const Footer = (): JSX.Element => {
  return (
    <Box paddingY={2} bgcolor="alternate.dark">
      <Container sx={{ py: { xs: 0, sm: 0, md: 0 } }}>
        <Box
          display="flex"
          rowGap={2}
          flexDirection={{ xs: 'column-reverse', md: 'row' }}
          justifyContent="space-between"
        >
          <Box justifyContent="flex-start">
            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              textAlign={{ xs: 'center', md: 'left' }}
            >
              &copy; Passdropit. 2023, All rights reserved
            </Typography>
          </Box>
          <Box justifyContent="flex-end">
            <Box
              display="flex"
              flexDirection={{ xs: 'column', md: 'row' }}
              justifyContent="flex-end"
              columnGap={2}
              rowGap={1}
            >
              <Link
                href="/about-us"
                sx={{
                  textDecoration: 'none'
                }}
              >
                <Typography
                  align="center"
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  About Us
                </Typography>
              </Link>
              <Link
                href="/privacy-policy"
                sx={{
                  textDecoration: 'none'
                }}
              >
                <Typography
                  align="center"
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Privacy Policy
                </Typography>
              </Link>
              <Link
                href="/terms-of-service"
                sx={{
                  textDecoration: 'none'
                }}
              >
                <Typography
                  align="center"
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Terms of service
                </Typography>
              </Link>
            </Box>            
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;