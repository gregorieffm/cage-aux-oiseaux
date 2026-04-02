import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabase';
import { calculateBookingPrice, getBlockedDates, getBookedDates } from '../../lib/availability';
import { createCheckoutSession } from '../../lib/checkout';
import { sendBookingPending, sendAdminNotification } from '../../lib/email';

export const POST: APIRoute = async ({ request }) => {
  if (!supabaseAdmin) {
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    const { propertyId, checkIn, checkOut, guestName, guestEmail, guestPhone, guestMessage } = body;

    if (!propertyId || !checkIn || !checkOut || !guestName || !guestEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (checkOutDate <= checkInDate) {
      return new Response(
        JSON.stringify({ error: 'Check-out must be after check-in' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check property exists
    const { data: property, error: propError } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .eq('active', true)
      .single();

    if (propError || !property) {
      return new Response(
        JSON.stringify({ error: 'Property not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check availability (no blocked or booked dates in range)
    const [blockedDates, bookedDates] = await Promise.all([
      getBlockedDates(propertyId, checkIn, checkOut),
      getBookedDates(propertyId, checkIn, checkOut),
    ]);

    for (let d = new Date(checkInDate); d < checkOutDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      if (blockedDates.has(dateStr) || bookedDates.has(dateStr)) {
        return new Response(
          JSON.stringify({ error: `La date ${dateStr} n'est plus disponible` }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Calculate price
    const pricing = await calculateBookingPrice(
      propertyId,
      checkIn,
      checkOut,
      property.base_price_cents
    );

    // Create booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        property_id: propertyId,
        status: 'pending',
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone || null,
        check_in: checkIn,
        check_out: checkOut,
        price_per_night_cents: pricing.avgPricePerNightCents,
        total_cents: pricing.totalCents,
        extras_cents: 0,
        extras: [],
        guest_message: guestMessage || null,
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    const emailData = {
      guestName,
      guestEmail,
      propertyName: property.name,
      checkIn,
      checkOut,
      nights: pricing.nights,
      totalCents: pricing.totalCents,
      bookingId: booking.id,
    };

    sendBookingPending(emailData).catch(console.error);

    const adminEmail = import.meta.env.ADMIN_EMAIL || '';
    if (adminEmail) {
      sendAdminNotification(emailData, adminEmail).catch(console.error);
    }

    const checkoutUrl = await createCheckoutSession({
      bookingId: booking.id,
      propertyName: property.name,
      checkIn,
      checkOut,
      nights: pricing.nights,
      totalCents: pricing.totalCents,
      guestEmail,
    });

    return new Response(
      JSON.stringify({
        bookingId: booking.id,
        totalCents: pricing.totalCents,
        nights: pricing.nights,
        checkoutUrl,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Booking error:', err);
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    return new Response(
      JSON.stringify({ error: message, detail: stack }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
