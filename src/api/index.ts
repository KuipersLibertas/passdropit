import * as RequestParams from '@/types/request';
import { createRequest } from '@/api/client';
import { IChooseLink } from '@/types';

export const mock = (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
};

export const signIn = async (params: RequestParams.SignIn): Promise<any> => {
  return createRequest(
    {
      endpoint: '/auth/login',
      method: 'POST',
      body: params
    }    
  );
};

export const facebookLogin = async (name: string, email: string): Promise<any> => {
  return createRequest(
    {
      endpoint: '/auth/fb-login',
      method: 'POST',
      body: {
        name,
        email
      }
    }    
  );
};


export const getSession = async () => {
  const res = await fetch('/api/session');
  const data = await res.json();

  return data;
};

export const signUp = async (params: RequestParams.SignUp): Promise<any> => {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return res.json();
};

export const checkGoogleLink = async (url: string): Promise<any> => {
  return createRequest({
    endpoint: '/link/check-google-link',
    method: 'POST',
    body: { url }
  });
};

export const saveLink = async (params: IChooseLink): Promise<any> => {
  return createRequest({
    endpoint: '/link/save-link',
    method: 'POST',
    body: params
  });
};

export const getLinkList = async (): Promise<any> => {
  return createRequest({
    endpoint: '/link/get-list',
    method: 'GET',
  });
};

export const updateLink = async (params: IChooseLink): Promise<any> => {
  return createRequest({
    endpoint: '/link/update-link',
    method: 'POST',
    body: params
  });
};

export const deleteLink = async (id: number): Promise<any> => {
  return createRequest({
    endpoint: `/link/delete-link/${id}`,
    method: 'DELETE'
  });
};

export const getAnalytics = async (id: number): Promise<any> => {
  return createRequest({
    endpoint: '/link/analytics',
    method: 'POST',
    body: {
      linkId: id
    }
  });
};

export const getSubscription = async (): Promise<any> => {
  return createRequest({
    endpoint: '/user/subscription',
    method: 'GET',
  });
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<any> => {
  return createRequest({
    endpoint: '/auth/change-password',
    method: 'POST',
    body: {
      currentPassword,
      newPassword
    }
  });
};

export const forgotPassword = async (email: string): Promise<any> => {
  return createRequest({
    endpoint: '/auth/forgot-password',
    method: 'POST',
    body: {
      email
    }
  });
};

export const resetPassword = async (token: string, newPassword: string): Promise<any> => {
  return createRequest({
    endpoint: '/auth/reset-password',
    method: 'POST',
    body: {
      token,
      newPassword
    }
  });
};

export const cancelPro = async (): Promise<any> => {
  return createRequest({
    endpoint: '/user/cancel-pro',
    method: 'GET',
  });
};

export const upgradePro = async (paymentMode: number): Promise<any> => {
  return createRequest({
    endpoint: '/user/upgrade-pro',
    method: 'POST',
    body: {
      paymentMode
    }
  });
};

export const captureHook = async (stripeId: string, type: string): Promise<any> => {
  return createRequest({
    endpoint: '/user/capture-hook',
    method: 'POST',
    body: {
      stripeId,
      type,
    }
  });
};

export const commitPro = async (stripeId: string, subscriptionId: string, userId: number): Promise<any> => {
  return createRequest({
    endpoint: '/user/commit-pro',
    method: 'POST',
    body: {
      stripeId,
      subscriptionId,
      userId
    }
  });
};

export const uploadLogo = async(form: FormData) => {
  // Auth is handled via session cookie by the gateway — no bearer token needed
  const res = await fetch('/api/gateway/upload-logo', { method: 'POST', body: form });
  return res.json();
};

export const deleteLogo = async() => {
  const res = await fetch('/api/gateway/delete-logo', { method: 'POST' });
  return res.json();
};

export const updatePaypal = async (paypalEmail: string): Promise<any> => {
  return createRequest({
    endpoint: '/admin/update-paypal',
    method: 'POST',
    body: {
      paypalEmail
    }
  });
};

export const getEarningLinkList = async (userId: number, period: string): Promise<any> => {
  return createRequest({
    endpoint: '/admin/get-earning-link-list',
    method: 'POST',
    body: {
      userId,
      period
    }
  });
};

export const getUserList = async (): Promise<any> => {
  return createRequest({
    endpoint: '/admin/get-user-list',
    method: 'GET',
  });
};

export const exportActivity = async (): Promise<any> => {
  return createRequest({
    endpoint: '/admin/export-activity',
    method: 'GET',
  });
};

export const getLinkReportList = async (period: string, userName: string, url: string): Promise<any> => {
  return createRequest({
    endpoint: '/admin/link-report',
    method: 'POST',
    body: {
      period,
      userName,
      url
    }
  });
};

export const getUserAnalyticsList = async (userName: string, page: number, rowPerPage: number): Promise<any> => {
  return createRequest({
    endpoint: '/admin/user-analytics',
    method: 'POST',
    body: {
      userName,
      page,
      rowPerPage
    }
  });
};

export const getLinkDetailInfo = async (url: string): Promise<any> => {
  return createRequest({
    endpoint: '/link/get-link-detail',
    method: 'POST',
    body: {
      url,
    }
  });
};

export const buyLink = async (linkId: number): Promise<any> => {
  return createRequest({
    endpoint: '/link/buy-link',
    method: 'POST',
    body: {
      linkId,
    }
  });
};

export const validateLink = async (linkId: number, password: string): Promise<any> => {
  return createRequest({
    endpoint: '/link/validate-link',
    method: 'POST',
    body: {
      linkId,
      password
    }
  });
};

export const logout = async (): Promise<any> => {
  return createRequest({
    endpoint: '/auth/logout',
    method: 'GET',
  });
};
