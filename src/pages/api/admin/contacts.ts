import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../../lib/supabase';

export const PATCH: APIRoute = async ({ request }) => {
  if (!supabaseAdmin) {
    return new Response(JSON.stringify({ error: 'Not configured' }), { status: 500 });
  }

  try {
    const body = await request.json();
    const { id, read } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('contact_submissions')
      .update({ read: !!read })
      .eq('id', id);

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Update failed' }),
      { status: 500 }
    );
  }
};
