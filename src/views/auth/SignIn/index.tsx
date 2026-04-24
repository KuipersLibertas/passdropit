'use client';

import ApplicationContext from '@/contexts/ApplicationContext';

import React, { useCallback, useContext } from 'react';
import Container from '@/components/Container';
import SignInForm from '@/views/auth/SignIn/Form';

// import { useRouter } from 'next/navigation';

const SignIn = (): JSX.Element => {
  // const router = useRouter();

  const { setShowForgotPassword } = useContext(ApplicationContext);
  
  const handleForgotPassword = useCallback((): void => {
    setShowForgotPassword(true);
  }, []);

  const handleLogin = useCallback((): void => {
    location.href = '/';
  }, []);

  return (
    <Container sx={{
      maxWidth: '40rem',
      minHeight: 'calc(100vh - 137px)'
    }}>
      <SignInForm onShowForgotPassword={handleForgotPassword} onCallback={handleLogin} />
    </Container>
  );
};

export default SignIn;