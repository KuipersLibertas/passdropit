/* eslint-disable */
import NextAuth from 'next-auth';
/* eslint-enable */

declare module 'next-auth' {
  interface Session {
    user: {
      id: number;
      user_name: string;
      user_email: string;
      level: number;
      balance: number;
      stripe_id: string;
      paypal_id: string;
      subscription_id: string;
      logo: string;
    }
  }
}
