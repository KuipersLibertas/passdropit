const BREVO_API_KEY = process.env.BREVO_API_KEY;
const WELCOME_LIST_ID = 12; // "New Signups - Welcome Flow" list in Brevo

export async function addContactToBrevo(email: string, name?: string): Promise<void> {
  if (!BREVO_API_KEY) return;

  try {
    await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email,
        ...(name ? { attributes: { FIRSTNAME: name.split(' ')[0] } } : {}),
        listIds: [WELCOME_LIST_ID],
        updateEnabled: false,
      }),
    });
  } catch {
    // Non-blocking — don't let Brevo failures break signup
  }
}
