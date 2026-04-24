import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { login, facebookLogin } from '@/lib/db/auth';
import { checkAndSyncProStatus } from '@/lib/db/user';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { type: 'text' },
        password: { type: 'password' },
        name: { type: 'text' },
        type: { type: 'text' },
      },
      async authorize(credentials): Promise<any> {
        // Facebook OAuth login path
        if (credentials?.type === 'facebook') {
          if (!credentials?.email || !credentials?.name) return null;
          try {
            const response = await facebookLogin(credentials.name, credentials.email);
            if (!response.success) return null;
            return response.user;
          } catch (error: any) {
            console.log(error.message);
            return null;
          }
        }

        // Email/password login path
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const response = await login(credentials.email, credentials.password);
          if (!response.success) {
            console.log(response.message);
            return null;
          }

          const user = response.user;

          // Verify Stripe subscription is still active at login time
          if (user.stripe_id && user.subscription_id) {
            user.level = await checkAndSyncProStatus(
              user.id,
              user.stripe_id,
              user.subscription_id,
              user.level,
            );
          }

          return user;
        } catch (error: any) {
          console.log(error.message);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    session: async ({ session, token }: any) => {
      if (token.sign_out) {
        return {};
      } else {
        return { ...session, user: token.user };
      }
    },
    jwt: async ({ token, trigger, session, user }: any) => {
      if (user) {
        token.sign_out = false;
        token.user = user;
        return token;
      }

      // Client-triggered update — only allow logo URL changes from client side.
      // SECURITY: never accept level, balance, stripe_id, etc. from client.
      if (trigger === 'update') {
        if (session?.sign_out) {
          token.sign_out = true;
        } else {
          token.sign_out = false;
          if (session?.user?.logo !== undefined) {
            token.user = { ...token.user, logo: session.user.logo };
          }
        }
      }

      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
