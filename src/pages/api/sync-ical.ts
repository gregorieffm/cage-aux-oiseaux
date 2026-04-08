import type { APIRoute } from 'astro';
import { syncAllFeeds, syncPropertyFeeds } from '../../lib/ical-sync';

export const GET: APIRoute = async ({ url, request }) => {
  const queryKey = url.searchParams.get('key');
  const cronSecret = request.headers.get('authorization')?.replace('Bearer ', '');
  const expectedKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  const vercelCronSecret = import.meta.env.CRON_SECRET;

  const isAuthorized =
    (queryKey && queryKey === expectedKey) ||
    (cronSecret && vercelCronSecret && cronSecret === vercelCronSecret);

  if (!isAuthorized) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const propertyId = url.searchParams.get('property');

  try {
    const results = propertyId
      ? await syncPropertyFeeds(propertyId)
      : await syncAllFeeds();

    const summary = {
      synced: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      totalDatesAdded: results.reduce((sum, r) => sum + r.datesAdded, 0),
      totalDatesRemoved: results.reduce((sum, r) => sum + r.datesRemoved, 0),
      results,
    };

    return new Response(JSON.stringify(summary, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Sync failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
