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
import { useNavigationMenu } from '@/layouts/Main/navigation';
import { ApplicationProvider } from '@/contexts/ApplicationContext';
import { SessionProvider } from 'next-auth/react';
import { UserLevel } from '@/utils/constants';
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
      
      <Script src="https://cmp.setupcmp.com/cmp/cmp/cmp-stub.js" data-prop-id="6396" />
      <Script src="https://cmp.setupcmp.com/cmp/cmp/cmp-v1.js" data-prop-stpd-cmp-id="6396" async />
      <Script src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" async />
      <Script 
        dangerouslySetInnerHTML={{
          __html: `
          window.googletag = window.googletag || {cmd: []};
          googletag.cmd.push (function () {
              if(window.innerWidth > 1000) {
                  googletag.defineSlot('/147246189,22860018223/passdropit.com_1000x100_sticky_anchorad_desktop', [[1000,100],[970,90],[728,90],[990,90],[970,50],[960,90],[950,90],[980,90]], 'passdropit_com_1000x100_sticky_anchorad_responsive').addService(googletag.pubads());
                  googletag.defineSlot('/147246189,22860018223/passdropit.com_1140x280_in_article_desktop_1', [[970,250],[728,90],[970,90],[1140,280],[1100,200],[1000,200],[1000,250],[980,240],[980,120],[970,200],[970,120],[950,90],[728,100],[728,250]], 'passdropit_com_1140x280_in_article_responsive_1').addService(googletag.pubads());
              } else {
                  googletag.defineSlot('/147246189,22860018223/passdropit.com_320x100_sticky_anchorad_mobile', [[320,100],[300,100],[320,50],[300,50]], 'passdropit_com_1000x100_sticky_anchorad_responsive').addService(googletag.pubads());
                  googletag.defineSlot('/147246189,22860018223/passdropit.com_336x336_in_article_mobile_1', [[300,250],[336,336],[336,320],[320,320],[300,300],[336,280],[320,250],[320,336]], 'passdropit_com_1140x280_in_article_responsive_1').addService(googletag.pubads());
              }    
                  var interstitialSlot = googletag.defineOutOfPageSlot('/147246189,22860018223/passdropit.com_interstitial', googletag.enums.OutOfPageFormat.INTERSTITIAL);
                  if (interstitialSlot) interstitialSlot.addService(googletag.pubads());
              

              googletag.pubads().enableSingleRequest();
              googletag.pubads().disableInitialLoad();
              googletag.enableServices();
              googletag.pubads().collapseEmptyDivs();
              googletag.display(interstitialSlot);
          });
          `
        }}
      />
      
      <Script src="https://stpd.cloud/saas/4179" async />
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
                  backgroundColor: 'background.paper',
                }}
                elevation={trigger ? 1 : 0}
              >
                <Container paddingY={0} sx={{ display: 'flex', alignItems: 'center', height: '76px' }}>
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
      <Box id="passdropit_com_1000x100_sticky_anchorad_responsive">
        <Script 
          dangerouslySetInnerHTML={{
            __html: `
            googletag.cmd.push(function() { googletag.display('passdropit_com_1000x100_sticky_anchorad_responsive'); });
            `
          }}
        />
      </Box>
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