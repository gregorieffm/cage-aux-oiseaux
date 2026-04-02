import { stripe, isStripeEnabled } from './stripe';
import { supabaseAdmin } from './supabase';

interface CreateCheckoutParams {
  bookingId: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalCents: number;
  guestEmail: string;
}

export async function createCheckoutSession(params: CreateCheckoutParams): Promise<string | null> {
  if (!isStripeEnabled() || !stripe) return null;

  const siteUrl = import.meta.env.SITE_URL || 'http://localhost:4321';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: params.guestEmail,
    metadata: {
      booking_id: params.bookingId,
    },
    line_items: [
      {
        price_data: {
          currency: 'eur',
          unit_amount: params.totalCents,
          product_data: {
            name: params.propertyName,
            description: `${params.nights} nuit${params.nights > 1 ? 's' : ''} — du ${formatDateFR(params.checkIn)} au ${formatDateFR(params.checkOut)}`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${siteUrl}/booking/confirmation?id=${params.bookingId}&payment=success`,
    cancel_url: `${siteUrl}/booking/confirmation?id=${params.bookingId}&payment=cancelled`,
  });

  if (supabaseAdmin && session.id) {
    await supabaseAdmin
      .from('bookings')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', params.bookingId);
  }

  return session.url;
}

function formatDateFR(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
