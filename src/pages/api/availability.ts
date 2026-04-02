import type { APIRoute } from 'astro';
import { getAvailability } from '../../lib/availability';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async ({ url }) => {
  const propertyId = url.searchParams.get('property');
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');

  if (!propertyId || !from || !to) {
    return new Response(
      JSON.stringify({ error: 'Missing required params: property, from, to' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { data: property, error } = await supabase
      .from('properties')
      .select('base_price_cents')
      .eq('id', propertyId)
      .single();

    if (error || !property) {
      return new Response(
        JSON.stringify({ error: 'Property not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const availability = await getAvailability(
      propertyId,
      from,
      to,
      property.base_price_cents
    );

    return new Response(JSON.stringify({ property: propertyId, from, to, dates: availability }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Failed to fetch availability' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
