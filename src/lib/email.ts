const RESEND_API_KEY = import.meta.env.RESEND_API_KEY || '';
const EMAIL_FROM = import.meta.env.EMAIL_FROM || 'La Cage aux Oiseaux <noreply@lacageauxoiseaux.fr>';
const SITE_URL = import.meta.env.SITE_URL || 'http://localhost:4321';

export function isEmailEnabled(): boolean {
  return !!RESEND_API_KEY;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  if (!isEmailEnabled()) {
    console.warn('Email not sent — RESEND_API_KEY not configured');
    return false;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Email send failed:', err);
    return false;
  }
}

function formatDateFR(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f8f6f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px">
    <div style="text-align:center;margin-bottom:32px">
      <h1 style="font-size:20px;font-weight:400;color:#8b6f4e;margin:0;font-family:Georgia,serif">La Cage aux Oiseaux</h1>
    </div>
    <div style="background:#ffffff;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.06)">
      ${content}
    </div>
    <div style="text-align:center;margin-top:24px;font-size:12px;color:#9a958e">
      <p>La Cage aux Oiseaux — Chambres d'hôtes & hébergements insolites</p>
      <p><a href="${SITE_URL}" style="color:#8b6f4e">lacageauxoiseaux.fr</a></p>
    </div>
  </div>
</body>
</html>`;
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;color:#7a756e;font-size:14px">${label}</td>
    <td style="padding:8px 0;text-align:right;font-weight:500;font-size:14px">${value}</td>
  </tr>`;
}

interface BookingEmailData {
  guestName: string;
  guestEmail: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalCents: number;
  bookingId: string;
}

export async function sendBookingConfirmation(data: BookingEmailData): Promise<boolean> {
  const html = emailLayout(`
    <h2 style="font-size:22px;font-weight:400;margin:0 0 8px;font-family:Georgia,serif;color:#3a3632">Réservation confirmée</h2>
    <p style="color:#7a756e;margin:0 0 24px;font-size:14px">Bonjour ${data.guestName}, votre réservation est confirmée et payée.</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      ${row('Hébergement', data.propertyName)}
      ${row('Arrivée', formatDateFR(data.checkIn))}
      ${row('Départ', formatDateFR(data.checkOut))}
      ${row('Nuits', String(data.nights))}
      <tr><td colspan="2" style="border-top:1px solid #ece6db;padding:0"></td></tr>
      ${row('Total payé', `${(data.totalCents / 100).toFixed(0)} €`)}
    </table>
    <p style="font-size:13px;color:#7a756e;margin:0 0 24px">
      Arrivée à partir de 16h00 — Départ avant 11h00.<br/>
      Pour toute question, n'hésitez pas à nous contacter.
    </p>
    <div style="text-align:center">
      <a href="${SITE_URL}/booking/confirmation?id=${data.bookingId}" style="display:inline-block;background:#8b6f4e;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500">Voir ma réservation</a>
    </div>
  `);

  return sendEmail({
    to: data.guestEmail,
    subject: `Réservation confirmée — ${data.propertyName}`,
    html,
  });
}

export async function sendBookingPending(data: BookingEmailData): Promise<boolean> {
  const html = emailLayout(`
    <h2 style="font-size:22px;font-weight:400;margin:0 0 8px;font-family:Georgia,serif;color:#3a3632">Demande de réservation reçue</h2>
    <p style="color:#7a756e;margin:0 0 24px;font-size:14px">Bonjour ${data.guestName}, nous avons bien reçu votre demande.</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      ${row('Hébergement', data.propertyName)}
      ${row('Arrivée', formatDateFR(data.checkIn))}
      ${row('Départ', formatDateFR(data.checkOut))}
      ${row('Nuits', String(data.nights))}
      <tr><td colspan="2" style="border-top:1px solid #ece6db;padding:0"></td></tr>
      ${row('Total', `${(data.totalCents / 100).toFixed(0)} €`)}
    </table>
    <p style="font-size:13px;color:#7a756e;margin:0 0 24px">
      Le paiement est en attente de confirmation. Vous recevrez un email dès que celui-ci sera validé.
    </p>
  `);

  return sendEmail({
    to: data.guestEmail,
    subject: `Demande de réservation — ${data.propertyName}`,
    html,
  });
}

export async function sendBookingCancellation(data: BookingEmailData): Promise<boolean> {
  const html = emailLayout(`
    <h2 style="font-size:22px;font-weight:400;margin:0 0 8px;font-family:Georgia,serif;color:#3a3632">Réservation annulée</h2>
    <p style="color:#7a756e;margin:0 0 24px;font-size:14px">Bonjour ${data.guestName}, votre réservation a été annulée.</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      ${row('Hébergement', data.propertyName)}
      ${row('Arrivée', formatDateFR(data.checkIn))}
      ${row('Départ', formatDateFR(data.checkOut))}
    </table>
    <p style="font-size:13px;color:#7a756e;margin:0 0 24px">
      Si vous avez des questions ou souhaitez effectuer une nouvelle réservation, n'hésitez pas à nous contacter.
    </p>
    <div style="text-align:center">
      <a href="${SITE_URL}" style="display:inline-block;background:#8b6f4e;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500">Retour au site</a>
    </div>
  `);

  return sendEmail({
    to: data.guestEmail,
    subject: `Réservation annulée — ${data.propertyName}`,
    html,
  });
}

export async function sendAdminNotification(data: BookingEmailData, adminEmail: string): Promise<boolean> {
  const html = emailLayout(`
    <h2 style="font-size:22px;font-weight:400;margin:0 0 8px;font-family:Georgia,serif;color:#3a3632">Nouvelle réservation</h2>
    <p style="color:#7a756e;margin:0 0 24px;font-size:14px">Une nouvelle réservation vient d'être effectuée.</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      ${row('Client', `${data.guestName} (${data.guestEmail})`)}
      ${row('Hébergement', data.propertyName)}
      ${row('Arrivée', formatDateFR(data.checkIn))}
      ${row('Départ', formatDateFR(data.checkOut))}
      ${row('Nuits', String(data.nights))}
      <tr><td colspan="2" style="border-top:1px solid #ece6db;padding:0"></td></tr>
      ${row('Total', `${(data.totalCents / 100).toFixed(0)} €`)}
    </table>
    <div style="text-align:center">
      <a href="${SITE_URL}/admin/bookings/${data.bookingId}" style="display:inline-block;background:#8b6f4e;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500">Voir dans l'admin</a>
    </div>
  `);

  return sendEmail({
    to: adminEmail,
    subject: `Nouvelle réservation — ${data.propertyName} — ${data.guestName}`,
    html,
  });
}

export async function sendContactNotification(
  contact: { name: string; email: string; phone?: string; dates?: string; property?: string; message?: string },
  adminEmail: string
): Promise<boolean> {
  const html = emailLayout(`
    <h2 style="font-size:22px;font-weight:400;margin:0 0 8px;font-family:Georgia,serif;color:#3a3632">Nouveau message</h2>
    <p style="color:#7a756e;margin:0 0 24px;font-size:14px">Un visiteur a envoyé un message via le formulaire de contact.</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      ${row('Nom', contact.name)}
      ${row('Email', contact.email)}
      ${contact.phone ? row('Téléphone', contact.phone) : ''}
      ${contact.dates ? row('Dates souhaitées', contact.dates) : ''}
      ${contact.property ? row('Hébergement', contact.property) : ''}
    </table>
    ${contact.message ? `<div style="background:#f8f6f2;border-radius:8px;padding:16px;font-size:14px;color:#3a3632;margin-bottom:16px">${contact.message}</div>` : ''}
    <div style="text-align:center">
      <a href="mailto:${contact.email}" style="display:inline-block;background:#8b6f4e;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500">Répondre</a>
    </div>
  `);

  return sendEmail({
    to: adminEmail,
    subject: `Message de ${contact.name}`,
    html,
  });
}
