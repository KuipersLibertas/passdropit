'use client';

import React, { useState, useEffect } from 'react';
import * as yup from 'yup';
import Container from '@/components/Container';

import { useFormik } from 'formik';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Divider,
  Link,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useTheme } from '@mui/material/styles';
import { FacebookIcon } from '@/utils/icons';
import { signUp } from '@/api';
import { toast } from 'react-toastify';
import { CustomToastOptions } from '@/utils/constants';
import { signIn } from 'next-auth/react';

interface ISignUpFormFields {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const validationSchema = yup.object({
  firstName: yup
    .string()
    .trim()
    .min(2, 'Please enter a valid name')
    .max(50, 'Please enter a valid name')
    .required('Please enter your first name'),
  lastName: yup
    .string()
    .trim()
    .min(2, 'Please enter a valid name')
    .max(50, 'Please enter a valid name')
    .required('Please enter your last name'),
  email: yup
    .string()
    .trim()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .required('Please enter your password')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .min(8, 'Password must be at least 8 characters')
});

const SignUp = (): JSX.Element => {
  const theme = useTheme();
  const [isSignUpProcessing, setIsSignUpProcessing] = useState<boolean>(false);
  const [isFbLoginProcessing, setIsFbLoginProcessing] = useState<boolean>(false);
  const [fbReady, setFbReady] = useState<boolean>(false);

  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID;
    if (!appId) return;

    const initFB = () => {
      window.FB.init({ appId, cookie: true, xfbml: false, version: 'v21.0' });
      setFbReady(true);
    };

    if (window.FB) { initFB(); return; }

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

  const initialValues: ISignUpFormFields = {    
    firstName: '', 
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  const onSubmit = async(values: ISignUpFormFields): Promise<void> => {
    if (isSignUpProcessing) return;

    if (values.password !== values.confirmPassword) {
      formik.touched.confirmPassword = true;
      formik.errors.confirmPassword = 'The confirm password doesn\'t match new password';
      return;
    }

    setIsSignUpProcessing(true);
    signUp({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: values.password,
    })
      .then((response) => {
        setIsSignUpProcessing(false);

        if (response.success) {
          toast.success('Successfully registered', CustomToastOptions);
          window.location.href = '/signin';
        } else {
          const { message } = response;
          toast.error(message, CustomToastOptions);
        }        
      })
      .catch(error => {
        setIsSignUpProcessing(false);

        toast.error(error.message, CustomToastOptions);
      });
  };

  const formik = useFormik({
    initialValues,
    validationSchema: validationSchema,
    onSubmit,
  });

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
          location.href = '/';
        } else {
          toast.error('You are failed to login', CustomToastOptions);
        }
      });
  };


  return (
    <Container sx={{ maxWidth: '40rem' }}>
      <Box marginBottom={4}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
          }}
        >
          Sign Up
        </Typography>
        <Typography color="text.secondary">
          Fill out the form to get started.
        </Typography>
      </Box>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="First name *"
              variant="outlined"
              name={'firstName'}
              fullWidth
              value={formik.values.firstName}
              onChange={formik.handleChange}
              error={
                formik.touched.firstName && Boolean(formik.errors.firstName)
              }
              // @ts-ignore
              helperText={formik.touched.firstName && formik.errors.firstName}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Last name *"
              variant="outlined"
              name={'lastName'}
              fullWidth
              value={formik.values.lastName}
              onChange={formik.handleChange}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              // @ts-ignore
              helperText={formik.touched.lastName && formik.errors.lastName}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Email *"
              variant="outlined"
              name={'email'}
              fullWidth
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              // @ts-ignore
              helperText={formik.touched.email && formik.errors.email}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Password *"
              variant="outlined"
              name={'password'}
              type={'password'}
              fullWidth
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              // @ts-ignore
              helperText={formik.touched.password && formik.errors.password}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Confirm Password *"
              variant="outlined"
              name={'confirmPassword'}
              type={'password'}
              fullWidth
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              // @ts-ignore
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
            />
          </Grid>
          <Grid item container xs={12}>
            <Box
              display="flex"
              flexDirection={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'stretched', sm: 'center' }}
              justifyContent={'space-between'}
              width={1}
              maxWidth={600}
              margin={'0 auto'}
            >
              <Box marginBottom={{ xs: 1, sm: 0 }}>
                <Typography variant={'subtitle2'}>
                  Already have an account?{' '}
                  <Link className="link" href="/signin">
                    Login.
                  </Link>
                </Typography>
              </Box>
              <LoadingButton
                size="large"
                variant="contained"
                type="submit"
                loading={isSignUpProcessing}
              >
                Sign Up
              </LoadingButton>
            </Box>
          </Grid>
          <Grid
            item
            container
            xs={12}
            justifyContent="center"
            alignItems="center"
          >
            <Typography
              variant="subtitle2"
              color="text.secondary"
              align="center"
            >
              By clicking &quot;Sign up&quot; button you agree with our{' '}
              <Link className="link" href="/company-terms"
              >
                company terms and conditions.
              </Link>
            </Typography>
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
            <FacebookIcon width={18} height={18} color={theme.palette.common.white} />
          </Box>
          &nbsp;|&nbsp;Sign in With Facebook
        </LoadingButton>
      </Box>  
    </Container>
  );
};

export default SignUp;