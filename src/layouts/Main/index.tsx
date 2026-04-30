'use client';

import React, { useState, useRef, useEffect } from 'react';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Cookies from 'js-cookie';
import Container from '@/components/Container';
import Topbar from '@/layouts/Main/Topbar';
import Sidebar from '@/layouts/Main/Sidebar';
import Footer from '@/layouts/Main/Footer';
import SignIn from '@/modals/auth/SignIn';
import ForgotPassword from '@/modals/auth/ForgotPassword';
import UpgradePlan from '@/modals/UpgradePlan';

import {
  AppBar,
  Box,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigationMenu } from '@/layouts/Main/navigation';
import { ApplicationProvider } from '@/contexts/ApplicationContext';
import { SessionProvider } from 'next-auth/react';
import { UserLevel, ThemeMode } from '@/utils/constants';
import { useSession } from 'next-auth/react';
import Script from 'next/script';


type MainLayoutProps = {
  children: React.ReactNode,
  mode?: number,
}
const MainLayout = ({
  mode = 1,
  children,
}: MainLayoutProps): JSX.Element => {
  const { data: session } = useSession();
  const theme = useTheme();
  const isLight = theme.palette.mode === ThemeMode.light;

  const [openSidebar, setOpenSidebar] = useState<boolean>(false);
  const [showSignIn, setShowSignIn] = useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [showUpgradePlan, setShowUpgradePlan] = useState<boolean>(false);
  
  const authenticatedRef = useRef<boolean>(false);
  
  const menus = useNavigationMenu(!!session, session?.user.level?? UserLevel.Normal);

  const [appState, setAppState] = useState({
    setShowSignIn,
    setShowForgotPassword,
    setShowUpgradePlan,
    authenticated: authenticatedRef.current,
    lang: 'en',
  });

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 38,
  });

  useEffect(() => {
    if (!session?.user) return;
    if (mode === 1) {
      const flag = Cookies.get('__ignore_upgrade_pro');
      if (session?.user.level === UserLevel.Normal && !flag) {
        setShowUpgradePlan(true);
      }
    }
  }, [session?.user]);

  useEffect(() => {
    if (session?.user.id) {
      authenticatedRef.current = true;
    } else {
      authenticatedRef.current = false;
    }

    setAppState({
      ...appState,
      authenticated: authenticatedRef.current
    });
  }, [session?.user]);

  const handleSidebarOpen = (): void => {
    setOpenSidebar(true);
  };

  const handleSidebarClose = (): void => {
    setOpenSidebar(false);
  };

  return (
    <Box>
      
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-6ZR1JRBKNW" async />
      <Script 
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-6ZR1JRBKNW');
          `
        }}
      />
      <SessionProvider>
        <ApplicationProvider value={appState}>
          {mode === 1&&
            <>
              <AppBar
                position={'sticky'}
                sx={{
                  top: 0,
                  backgroundColor: isLight
                    ? (trigger ? 'rgba(255,255,255,0.92)' : '#ffffff')
                    : (trigger ? 'rgba(15,23,42,0.92)' : '#0f172a'),
                  backdropFilter: trigger ? 'blur(20px)' : 'none',
                  WebkitBackdropFilter: trigger ? 'blur(20px)' : 'none',
                  borderBottom: isLight
                    ? '1px solid rgba(15,23,42,0.07)'
                    : '1px solid rgba(241,245,249,0.07)',
                  transition: 'background-color 0.3s ease',
                  ...(isLight && {
                    '& .MuiTypography-root': { color: '#0f172a' },
                    '& .MuiSvgIcon-root': { color: '#475569' },
                    '& .MuiIconButton-root': { color: '#475569' },
                    '& a.nav-link span': { color: '#0f172a' },
                  }),
                  ...(!isLight && {
                    '& .MuiTypography-root': { color: '#f1f5f9' },
                    '& .MuiSvgIcon-root': { color: '#94a3b8' },
                    '& .MuiIconButton-root': { color: '#94a3b8' },
                    '& a.nav-link span': { color: '#f1f5f9' },
                  }),
                }}
                elevation={0}
              >
                <Container paddingY={0} sx={{ display: 'flex', alignItems: 'center', height: '96px' }}>
                  <Topbar
                    onSidebarOpen={handleSidebarOpen}
                    menus={menus}
                  />
                </Container> 
              </AppBar>
              <Sidebar
                onClose={handleSidebarClose}
                open={openSidebar}
                variant="temporary"
                menus={menus}
              />
              <Box
                component="main"
              >
                {children}
                {showSignIn&& <SignIn opened={showSignIn} />}
                {showForgotPassword&& <ForgotPassword opened={showForgotPassword} />} 
                {showUpgradePlan&& <UpgradePlan opened={showUpgradePlan} />}         
              </Box>
              <Footer />
            </>
          }
          {mode === 2&&
            <Box>
              {children}
              {showSignIn&& <SignIn opened={showSignIn} />}
              {showForgotPassword&& <ForgotPassword opened={showForgotPassword} />} 
              {showUpgradePlan&& <UpgradePlan opened={showUpgradePlan} />}    
            </Box>
          } 
        </ApplicationProvider>
      </SessionProvider>
      <Script
        dangerouslySetInnerHTML={{
          __html: `
          (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
        
            ga('create', 'UA-41608328-1', 'passdropit.com');
            ga('send', 'pageview');
          `
        }}
      />
    </Box>
  );
};

export default MainLayout;