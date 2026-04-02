import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../../lib/supabase';

export const GET: APIRoute = async ({ params }) => {
  if (!supabaseAdmin) {
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { id } = params;
  if (!id) {
    return new Response(
      JSON.stringify({ error: 'Missing booking ID' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        id,
        check_in,
        check_out,
        guest_name,
        guest_email,
        total_cents,
        price_per_night_cents,
        extras_cents,
        extras,
        status,
        created_at,
        properties ( name )
      `)
      .eq('id', id)
      .single();

    if (error || !booking) {
      return new Response(
        JSON.stringify({ error: 'Booking not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        ...booking,
        property_name: (booking.properties as any)?.name || null,
        properties: undefined,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
