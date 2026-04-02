import type { APIRoute } from 'astro';
import { stripe, STRIPE_WEBHOOK_SECRET } from '../../lib/stripe';
import { supabaseAdmin } from '../../lib/supabase';
import { sendBookingConfirmation, sendBookingCancellation } from '../../lib/email';

export const POST: APIRoute = async ({ request }) => {
  if (!stripe || !supabaseAdmin) {
    return new Response('Webhook not configured', { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const bookingId = session.metadata?.booking_id;

      if (!bookingId) {
        console.error('No booking_id in session metadata');
        break;
      }

      const paymentIntentId =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id ?? null;

      await supabaseAdmin
        .from('bookings')
        .update({
          status: 'paid',
          stripe_payment_intent_id: paymentIntentId,
          paid_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      const { data: paidBooking } = await supabaseAdmin
        .from('bookings')
        .select('*, properties(name)')
        .eq('id', bookingId)
        .single();

      if (paidBooking) {
        const nights = Math.round(
          (new Date(paidBooking.check_out).getTime() - new Date(paidBooking.check_in).getTime()) / 86400000
        );
        sendBookingConfirmation({
          guestName: paidBooking.guest_name,
          guestEmail: paidBooking.guest_email,
          propertyName: (paidBooking.properties as any)?.name || '',
          checkIn: paidBooking.check_in,
          checkOut: paidBooking.check_out,
          nights,
          totalCents: paidBooking.total_cents,
          bookingId,
        }).catch(console.error);
      }

      console.log(`Booking ${bookingId} marked as paid`);
      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object;
      const bookingId = session.metadata?.booking_id;

      if (bookingId) {
        const { data: booking } = await supabaseAdmin
          .from('bookings')
          .select('*, properties(name)')
          .eq('id', bookingId)
          .single();

        if (booking?.status === 'pending') {
          await supabaseAdmin
            .from('bookings')
            .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
            .eq('id', bookingId);

          const nights = Math.round(
            (new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / 86400000
          );
          sendBookingCancellation({
            guestName: booking.guest_name,
            guestEmail: booking.guest_email,
            propertyName: (booking.properties as any)?.name || '',
            checkIn: booking.check_in,
            checkOut: booking.check_out,
            nights,
            totalCents: booking.total_cents,
            bookingId,
          }).catch(console.error);

          console.log(`Booking ${bookingId} cancelled (session expired)`);
        }
      }
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object;
      const paymentIntentId =
        typeof charge.payment_intent === 'string'
          ? charge.payment_intent
          : charge.payment_intent?.id ?? null;

      if (paymentIntentId) {
        await supabaseAdmin
          .from('bookings')
          .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
          .eq('stripe_payment_intent_id', paymentIntentId);

        console.log(`Booking refunded via payment intent ${paymentIntentId}`);
      }
      break;
    }

    default:
      break;
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
