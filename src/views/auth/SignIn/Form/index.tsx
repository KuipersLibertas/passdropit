'use client';

import React, { useState, useEffect } from 'react';
import * as yup from 'yup';
import Link from 'next/link';

import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { FacebookIcon } from '@/utils/icons';
import { signIn } from 'next-auth/react';
import { CustomToastOptions } from '@/utils/constants';

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: any;
  }
}

const validationSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email('Please enter a valid email address')
    .required('Email is required.'),
  password: yup
    .string()
    .required('Please enter your password')
    .min(8, 'The password should have at minimum length of 8'),
});

interface ILoginFormFields {
  email: string;
  password: string;
}

type SignFormProps = {
  onShowForgotPassword: () => void,
  onCallback: () => void,
}

const SignInForm = ({ onShowForgotPassword, onCallback }: SignFormProps): JSX.Element => {
  const theme = useTheme();

  const [isGenLoginProcessing, setIsGenLoginProcessing] = useState<boolean>(false);
  const [isFbLoginProcessing, setIsFbLoginProcessing] = useState<boolean>(false);
  const [fbReady, setFbReady] = useState<boolean>(false);

  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID;
    if (!appId) return;

    const initFB = () => {
      window.FB.init({
        appId,
        cookie: true,
        xfbml: false,
        version: 'v19.0',
      });
      setFbReady(true);
    };

    if (window.FB) {
      initFB();
      return;
    }

    window.fbAsyncInit = initFB;

    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  const initialValues: ILoginFormFields = {
    email: '',
    password: '',
  };

  const onSubmit = async (values: ILoginFormFields): Promise<void> => {
    if (isGenLoginProcessing) return;

    setIsGenLoginProcessing(true);

    signIn('credentials', {
      redirect: false,
      email: values.email,
      password: values.password,
      type: 'normal',
    })
      .then((res) => {
        setIsGenLoginProcessing(false);

        if (res?.ok) {
          onCallback();
        } else {
          toast.error('You are failed to login', CustomToastOptions);
        }
      });
  };

  const formik = useFormik({
    initialValues,
    validationSchema: validationSchema,
    onSubmit,
  });

  const handleForgotPassword = (): void => {
    onShowForgotPassword();
  };

  const handleFacebookLogin = async (name?: string, email?: string, accessToken?: string): Promise<void> => {
    if (!name || !email || !accessToken) return;
    if (isFbLoginProcessing) return;

    setIsFbLoginProcessing(true);

    signIn('credentials', {
      redirect: false,
      name,
      email,
      accessToken,
      type: 'facebook',
    })
      .then((res) => {
        setIsFbLoginProcessing(false);

        if (res?.ok) {
          onCallback();
        } else {
          toast.error('You are failed to login', CustomToastOptions);
        }
      });
  };

  const handleFacebookButtonClick = (): void => {
    if (!fbReady || isFbLoginProcessing) return;

    window.FB.login((response: any) => {
      if (response.authResponse) {
        const accessToken = response.authResponse.accessToken;
        window.FB.api('/me', { fields: 'name,email' }, (profile: any) => {
          handleFacebookLogin(profile.name, profile.email, accessToken);
        });
      }
    }, { scope: 'public_profile,email' });
  };

  return (
    <>
      <Box marginBottom={4}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
          }}
        >
          Sign In
        </Typography>
        <Typography color="text.secondary" mt={1}>
          Login to Passdropit.
        </Typography>
      </Box>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Email *"
              variant="outlined"
              name="email"
              fullWidth
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              // @ts-ignore
              helperText={formik.touched.email && formik.errors.email}
            />
          </Grid>
          <Grid item xs={12}>
            <Box
              display="flex"
              flexDirection={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'stretched', sm: 'center' }}
              justifyContent={'flex-end'}
              width={1}
              marginBottom={2}
            >
              <Typography variant="subtitle2">
                <Button
                  component="a"
                  color="primary"
                  onClick={handleForgotPassword}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'transparent',
                    }
                  }}
                >
                  Forgot your password?
                </Button>
              </Typography>
            </Box>
            <TextField
              label="Password *"
              variant="outlined"
              name="password"
              type="password"
              fullWidth
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              // @ts-ignore
              helperText={formik.touched.password && formik.errors.password}
            />
          </Grid>
          <Grid item container xs={12}>
            <Box
              display="flex"
              flexDirection={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'stretched', sm: 'center' }}
              justifyContent="space-between"
              width={1}
              maxWidth={600}
              margin="0 auto"
            >
              <Box marginBottom={{ xs: 1, sm: 0 }}>
                <Typography variant="subtitle2">
                  Don&apos;t have an account yet?{' '}
                  <Link href="/signup" className="link">
                    Sign up here.
                  </Link>
                </Typography>
              </Box>
              <LoadingButton
                size="large"
                variant="contained"
                type="submit"
                loading={isGenLoginProcessing}
              >
                Login
              </LoadingButton>
            </Box>
          </Grid>
        </Grid>
      </form>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Box py="3rem" width={1}>
          <Divider sx={{ color: '#aaa' }}>Or</Divider>
        </Box>
        <LoadingButton
          type="button"
          size="large"
          variant="contained"
          color="error"
          disabled={!fbReady}
          sx={{ alignItems: 'center' }}
          onClick={handleFacebookButtonClick}
          loading={isFbLoginProcessing}
        >
          <Box component="span" mt={1}>
            <FacebookIcon
              width={18}
              height={18}
              color={theme.palette.common.white}
            />
          </Box>
          &nbsp;|&nbsp;Sign in With Facebook
        </LoadingButton>
      </Box>
    </>
  );
};

export default SignInForm;
