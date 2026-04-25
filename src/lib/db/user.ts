import { supabase } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';
import { formatUser } from '@/lib/db/auth';

const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID ?? '';
const SITE_URL = process.env.NEXT_PUBLIC_PASSDROPIT_SITE_URL ?? 'https://passdropit.com';

function isSubscriptionActive(sub: { status: string; cancel_at_period_end: boolean }): boolean {
  return ['active', 'trialing'].includes(sub.status) && !sub.cancel_at_period_end;
}

export async function checkAndSyncProStatus(userId: number, stripeId: string | null, subscriptionId: string | null, currentIsPro: number): Promise<number> {
  if (!stripeId || !subscriptionId) return currentIsPro;

  try {
    const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
    const active = isSubscriptionActive(subscription);

    if (!active && currentIsPro === 1) {
      await supabase.from('users').update({ is_pro: 0 }).eq('id', userId);
      return 0;
    }
  } catch (err: any) {
    console.error(`checkAndSyncProStatus Stripe error userId=${userId}:`, err.message);
  }

  return currentIsPro;
}

export async function getSubscription(userId: number) {
  const { data: user } = await supabase
    .from('users')
    .select('stripe_id')
    .eq('id', userId)
    .single();

  if (!user?.stripe_id) {
    return { success: false as const, message: 'No active subscription found' };
  }

  try {
    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: user.stripe_id,
      return_url: `${SITE_URL}/api/auth/session-refresh?sync=1&callbackUrl=/user/plan`,
    });
    return { success: true as const, url: portalSession.url };
  } catch (error: any) {
    if (error?.statusCode === 404 || error?.code === 'resource_missing') {
      await supabase.from('users').update({ stripe_id: null, subscription_id: null }).eq('id', userId);
      return { success: false as const, message: 'Subscription record not found in Stripe. Please subscribe again.' };
    }
    throw error;
  }
}

export async function upgradePro(userId: number) {
  const { data: user } = await supabase
    .from('users')
    .select('stripe_id')
    .eq('id', userId)
    .single();

  const checkoutParams: Record<string, any> = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${SITE_URL}/api/auth/session-refresh?callbackUrl=/user/upgrade-pro/success`,
    cancel_url: `${SITE_URL}/prosignup`,
    subscription_data: {
      trial_period_days: 15,
      metadata: { user_id: String(userId) },
    },
    metadata: { user_id: String(userId) },
  };

  const stripeId = user?.stripe_id && user.stripe_id !== 'null' ? user.stripe_id : null;
  if (stripeId) {
    checkoutParams.customer = stripeId;
  }

  const session = await getStripe().checkout.sessions.create(checkoutParams as any);
  return { success: true as const, url: session.url };
}

export async function syncSubscription(userId: number) {
  const { data: dbUser } = await supabase
    .from('users')
    .select('stripe_id, subscription_id, is_pro')
    .eq('id', userId)
    .single();

  if (dbUser?.stripe_id) {
    try {
      const subscriptions = await getStripe().subscriptions.list({
        customer: dbUser.stripe_id,
        limit: 10,
      });

      const hasActive = subscriptions.data.some(isSubscriptionActive);

      if (!hasActive) {
        await supabase.from('users').update({ is_pro: 0 }).eq('id', userId);
        await supabase
          .from('file_list_user')
          .update({ email_notify: false, track_ip: false, is_paid: null, expires_on: null, expire_count: 0 })
          .eq('user_id', userId);
      }
    } catch (err: any) {
      console.error(`syncSubscription Stripe error userId=${userId}:`, err.message);
    }
  }

  const { data: fresh } = await supabase.from('users').select('*').eq('id', userId).single();
  return fresh ? formatUser(fresh) : null;
}

export async function cancelPro(userId: number) {
  const { data: dbUser } = await supabase
    .from('users')
    .select('subscription_id')
    .eq('id', userId)
    .single();

  if (dbUser?.subscription_id) {
    try {
      await getStripe().subscriptions.update(dbUser.subscription_id, { cancel_at_period_end: true });
    } catch (err: any) {
      console.error(`cancelPro Stripe error userId=${userId}:`, err.message);
    }
  }

  await supabase.from('users').update({ is_pro: 0 }).eq('id', userId);
  await supabase
    .from('file_list_user')
    .update({ email_notify: false, track_ip: false, is_paid: null, expires_on: null, expire_count: 0 })
    .eq('user_id', userId);

  const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
  return { success: true as const, user: user ? formatUser(user) : null };
}

export async function uploadLogo(userId: number, fileBuffer: Buffer, mimeType: string) {
  const ext = mimeType.split('/')[1] ?? 'png';
  const storagePath = `${userId}/logo.${ext}`;

  const { error } = await supabase.storage
    .from('logos')
    .upload(storagePath, fileBuffer, { contentType: mimeType, upsert: true });

  if (error) return { success: false as const, message: error.message };

  const { data: urlData } = supabase.storage.from('logos').getPublicUrl(storagePath);
  const publicUrl = urlData.publicUrl;

  await supabase.from('users').update({ logo: publicUrl }).eq('id', userId);
  return { success: true as const, file: publicUrl };
}

export async function deleteLogo(userId: number) {
  const { data: user } = await supabase.from('users').select('logo').eq('id', userId).single();

  if (user?.logo) {
    const match = user.logo.match(/logos\/(.+)$/);
    if (match) {
      await supabase.storage.from('logos').remove([match[1]]);
    }
  }

  await supabase.from('users').update({ logo: null }).eq('id', userId);
  return { success: true as const };
}

export async function activatePro(userId: number, stripeId: string, subscriptionId: string) {
  await supabase
    .from('users')
    .update({ is_pro: 1, stripe_id: stripeId, subscription_id: subscriptionId })
    .eq('id', userId);

  await supabase.from('paid_membership').insert({
    user_id: userId,
    type: 2,
    amount: 5,
    status: 1,
  });
}

export async function deactivatePro(stripeCustomerId: string) {
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_id', stripeCustomerId)
    .maybeSingle();

  if (!user) return;

  await supabase.from('users').update({ is_pro: 0 }).eq('id', user.id);
  await supabase
    .from('file_list_user')
    .update({ email_notify: false, track_ip: false, is_paid: null, expires_on: null, expire_count: 0 })
    .eq('user_id', user.id);
}
