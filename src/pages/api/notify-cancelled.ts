import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabase';
import { sendEmail } from '../../lib/email';

export const POST: APIRoute = async ({ request }) => {
  if (!supabaseAdmin) {
    return new Response(JSON.stringify({ ok: false }), { status: 500 });
  }

  try {
    const { bookingId } = await request.json();
    if (!bookingId) {
      return new Response(JSON.stringify({ ok: false }), { status: 400 });
    }

    const { data: booking } = await supabaseAdmin
      .from('bookings')
      .select('*, properties(name)')
      .eq('id', bookingId)
      .single();

    if (!booking) {
      return new Response(JSON.stringify({ ok: false }), { status: 404 });
    }

    const adminEmail = import.meta.env.ADMIN_EMAIL || '';
    if (!adminEmail) {
      return new Response(JSON.stringify({ ok: false, reason: 'no admin email' }), { status: 200 });
    }

    const propertyName = (booking.properties as any)?.name || '—';
    const checkIn = new Date(booking.check_in).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const checkOut = new Date(booking.check_out).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const siteUrl = import.meta.env.SITE_URL || '';

    await sendEmail({
      to: adminEmail,
      subject: `Paiement abandonné — ${propertyName} — ${booking.guest_name}`,
      html: `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:20px">
        <h2 style="color:#8b6f4e">Paiement non finalisé</h2>
        <p>Un client a créé une réservation mais n'a pas finalisé le paiement.</p>
        <table style="border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:6px 16px 6px 0;color:#777">Client</td><td><strong>${booking.guest_name}</strong> (${booking.guest_email})</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#777">Hébergement</td><td>${propertyName}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#777">Dates</td><td>${checkIn} → ${checkOut}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#777">Total</td><td><strong>${(booking.total_cents / 100).toFixed(0)} €</strong></td></tr>
        </table>
        <p><a href="${siteUrl}/admin/bookings/${bookingId}" style="color:#8b6f4e">Voir dans l'admin</a></p>
      </body></html>`,
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ ok: false }), { status: 500 });
  }
};
