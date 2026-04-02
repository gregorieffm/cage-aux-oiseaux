import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../../lib/supabase';
import { sendBookingConfirmation, sendBookingCancellation } from '../../../lib/email';

export const PATCH: APIRoute = async ({ request }) => {
  if (!supabaseAdmin) {
    return new Response(JSON.stringify({ error: 'Not configured' }), { status: 500 });
  }

  try {
    const body = await request.json();
    const { bookingId, status, adminNotes } = body;

    if (!bookingId) {
      return new Response(JSON.stringify({ error: 'Missing bookingId' }), { status: 400 });
    }

    const update: Record<string, any> = {};

    if (status) {
      const validStatuses = ['pending', 'confirmed', 'paid', 'cancelled', 'completed'];
      if (!validStatuses.includes(status)) {
        return new Response(JSON.stringify({ error: 'Invalid status' }), { status: 400 });
      }
      update.status = status;
      if (status === 'cancelled') {
        update.cancelled_at = new Date().toISOString();
      }
      if (status === 'paid') {
        update.paid_at = new Date().toISOString();
      }
    }

    if (adminNotes !== undefined) {
      update.admin_notes = adminNotes;
    }

    if (Object.keys(update).length === 0) {
      return new Response(JSON.stringify({ error: 'Nothing to update' }), { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('bookings')
      .update(update)
      .eq('id', bookingId);

    if (error) throw error;

    if (status === 'paid' || status === 'cancelled') {
      const { data: booking } = await supabaseAdmin
        .from('bookings')
        .select('*, properties(name)')
        .eq('id', bookingId)
        .single();

      if (booking) {
        const nights = Math.round(
          (new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / 86400000
        );
        const emailData = {
          guestName: booking.guest_name,
          guestEmail: booking.guest_email,
          propertyName: (booking.properties as any)?.name || '',
          checkIn: booking.check_in,
          checkOut: booking.check_out,
          nights,
          totalCents: booking.total_cents,
          bookingId,
        };

        if (status === 'paid') {
          sendBookingConfirmation(emailData).catch(console.error);
        } else {
          sendBookingCancellation(emailData).catch(console.error);
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Update failed' }),
      { status: 500 }
    );
  }
};
