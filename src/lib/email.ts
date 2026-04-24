import { Resend } from 'resend';

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}
const FROM = () => process.env.EMAIL_FROM ?? 'noreply@passdropit.com';

export async function sendPasswordResetEmail(
  toEmail: string,
  toName: string,
  resetUrl: string
): Promise<void> {
  await getResend().emails.send({
    from: FROM(),
    to: toEmail,
    subject: 'Passdropit Password Recovery',
    html: `
      <p>Hi ${toName},</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in 1 hour. If you did not request this, you can safely ignore this email.</p>
    `,
  });
}

export async function sendLinkDownloadNotification(
  ownerEmail: string,
  ownerName: string,
  city: string,
  country: string
): Promise<void> {
  const location = city ? `from ${city}${country ? `, ${country}` : ''}` : '';
  await getResend().emails.send({
    from: FROM(),
    to: ownerEmail,
    subject: 'Your Passdropit link was accessed',
    html: `
      <p>Hi ${ownerName},</p>
      <p>Your password-protected Passdropit link was accessed${location ? ` ${location}` : ''}.</p>
    `,
  });
}
