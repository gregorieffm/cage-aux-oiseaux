/**
 * iCal sync orchestrator
 * Syncs all active iCal feeds and updates blocked_dates in Supabase.
 */

import { supabaseAdmin } from './supabase';
import { getBlockedDatesFromFeed } from './ical';
import type { IcalFeed } from './database.types';

export interface SyncResult {
  feedId: string;
  propertyId: string;
  platform: string;
  success: boolean;
  datesAdded: number;
  datesRemoved: number;
  error?: string;
}

/**
 * Sync a single iCal feed: fetch events, diff with existing blocked dates, update DB
 */
async function syncFeed(feed: IcalFeed): Promise<SyncResult> {
  const result: SyncResult = {
    feedId: feed.id,
    propertyId: feed.property_id,
    platform: feed.platform,
    success: false,
    datesAdded: 0,
    datesRemoved: 0,
  };

  if (!supabaseAdmin) {
    result.error = 'Service role client not available';
    return result;
  }

  try {
    const newBlockedDates = await getBlockedDatesFromFeed(feed.url);

    const { data: existingDates, error: fetchError } = await supabaseAdmin
      .from('blocked_dates')
      .select('id, date, external_uid')
      .eq('property_id', feed.property_id)
      .eq('source', feed.platform);

    if (fetchError) throw fetchError;

    const existingSet = new Map(
      (existingDates || []).map(d => [`${d.date}:${d.external_uid}`, d.id])
    );
    const newSet = new Set(
      newBlockedDates.map(d => `${d.date}:${d.uid}`)
    );

    // Dates to add (in new feed but not in DB)
    const toAdd = newBlockedDates.filter(
      d => !existingSet.has(`${d.date}:${d.uid}`)
    );

    // Dates to remove (in DB but not in new feed)
    const toRemoveIds = [...existingSet.entries()]
      .filter(([key]) => !newSet.has(key))
      .map(([, id]) => id);

    if (toAdd.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('blocked_dates')
        .upsert(
          toAdd.map(d => ({
            property_id: feed.property_id,
            date: d.date,
            source: feed.platform,
            external_uid: d.uid,
          })),
          { onConflict: 'property_id,date,source' }
        );
      if (insertError) throw insertError;
      result.datesAdded = toAdd.length;
    }

    if (toRemoveIds.length > 0) {
      const { error: deleteError } = await supabaseAdmin
        .from('blocked_dates')
        .delete()
        .in('id', toRemoveIds);
      if (deleteError) throw deleteError;
      result.datesRemoved = toRemoveIds.length;
    }

    // Update last_synced_at
    await supabaseAdmin
      .from('ical_feeds')
      .update({ last_synced_at: new Date().toISOString(), last_error: null })
      .eq('id', feed.id);

    result.success = true;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : JSON.stringify(err);
    result.error = errorMsg;

    if (supabaseAdmin) {
      await supabaseAdmin
        .from('ical_feeds')
        .update({ last_error: errorMsg })
        .eq('id', feed.id);
    }
  }

  return result;
}

/**
 * Sync all active iCal feeds
 */
export async function syncAllFeeds(): Promise<SyncResult[]> {
  if (!supabaseAdmin) {
    throw new Error('Service role client not available');
  }

  const { data: feeds, error } = await supabaseAdmin
    .from('ical_feeds')
    .select('*')
    .eq('active', true);

  if (error) throw error;
  if (!feeds || feeds.length === 0) return [];

  const results = await Promise.allSettled(
    feeds.map(feed => syncFeed(feed as IcalFeed))
  );

  return results.map(r =>
    r.status === 'fulfilled'
      ? r.value
      : {
          feedId: 'unknown',
          propertyId: 'unknown',
          platform: 'unknown',
          success: false,
          datesAdded: 0,
          datesRemoved: 0,
          error: r.reason?.message || 'Unknown error',
        }
  );
}

/**
 * Sync feeds for a specific property
 */
export async function syncPropertyFeeds(propertyId: string): Promise<SyncResult[]> {
  if (!supabaseAdmin) {
    throw new Error('Service role client not available');
  }

  const { data: feeds, error } = await supabaseAdmin
    .from('ical_feeds')
    .select('*')
    .eq('property_id', propertyId)
    .eq('active', true);

  if (error) throw error;
  if (!feeds || feeds.length === 0) return [];

  const results = await Promise.allSettled(
    feeds.map(feed => syncFeed(feed as IcalFeed))
  );

  return results.map(r =>
    r.status === 'fulfilled'
      ? r.value
      : {
          feedId: 'unknown',
          propertyId,
          platform: 'unknown',
          success: false,
          datesAdded: 0,
          datesRemoved: 0,
          error: r.reason?.message || 'Unknown error',
        }
  );
}
