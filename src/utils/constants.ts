import { ToastOptions } from 'react-toastify';

export const ThemeMode = {
  light: 'light',
  dark: 'dark'
};

export const UserLevel = {
  Normal: 0,
  Pro: 1,
  Admin: 2,
};

export const ServiceType = {
  DropBox: 1,
  GoogleDrive: 2,
};

export const LinkType = {
  Single: 1,
  Multiple: 2,
  Folder: 3,
};

export const PricePlan = {
  Pro: 5,
};

export const SpinnerSize = {
  Normal: 25,
  Big: 60,
};

export const CustomToastOptions: ToastOptions = {
  position: 'top-right'
};

export const PaymentMode = {
  Balance: 1,
  Stripe: 2,
};

export const PaymentStatus = {
  Process: 0,
  Done: 1,
};