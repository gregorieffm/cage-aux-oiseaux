import { supabase } from './supabase';
import type { SeasonalPricing } from './database.types';

export interface DateAvailability {
  date: string;
  available: boolean;
  pricePerNightCents: number;
  minNights: number;
}

/**
 * Get blocked dates for a property within a date range
 */
export async function getBlockedDates(
  propertyId: string,
  from: string,
  to: string
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('blocked_dates')
    .select('date')
    .eq('property_id', propertyId)
    .gte('date', from)
    .lte('date', to);

  if (error) throw error;
  return new Set(data.map(d => d.date));
}

/**
 * Get confirmed/paid booking dates for a property within a range
 */
export async function getBookedDates(
  propertyId: string,
  from: string,
  to: string
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('bookings')
    .select('check_in, check_out')
    .eq('property_id', propertyId)
    .in('status', ['confirmed', 'paid'])
    .lte('check_in', to)
    .gte('check_out', from);

  if (error) throw error;

  const dates = new Set<string>();
  for (const booking of data) {
    const start = new Date(booking.check_in);
    const end = new Date(booking.check_out);
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      dates.add(d.toISOString().split('T')[0]);
    }
  }
  return dates;
}

/**
 * Get seasonal pricing for a property
 */
export async function getSeasonalPricing(
  propertyId: string
): Promise<SeasonalPricing[]> {
  const { data, error } = await supabase
    .from('seasonal_pricing')
    .select('*')
    .eq('property_id', propertyId);

  if (error) throw error;
  return data;
}

/**
 * Get price for a specific date based on seasonal pricing
 */
export function getPriceForDate(
  date: Date,
  seasonalPricing: SeasonalPricing[],
  basePriceCents: number
): { pricePerNightCents: number; minNights: number } {
  const month = date.getMonth() + 1;

  for (const season of seasonalPricing) {
    const inSeason = season.start_month <= season.end_month
      ? month >= season.start_month && month <= season.end_month
      : month >= season.start_month || month <= season.end_month;

    if (inSeason) {
      return {
        pricePerNightCents: season.price_per_night_cents,
        minNights: season.min_nights,
      };
    }
  }

  return { pricePerNightCents: basePriceCents, minNights: 1 };
}

/**
 * Get full availability calendar for a property
 */
export async function getAvailability(
  propertyId: string,
  from: string,
  to: string,
  basePriceCents: number
): Promise<DateAvailability[]> {
  const [blockedDates, bookedDates, seasonalPricing] = await Promise.all([
    getBlockedDates(propertyId, from, to),
    getBookedDates(propertyId, from, to),
    getSeasonalPricing(propertyId),
  ]);

  const result: DateAvailability[] = [];
  const start = new Date(from);
  const end = new Date(to);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const isBlocked = blockedDates.has(dateStr);
    const isBooked = bookedDates.has(dateStr);
    const { pricePerNightCents, minNights } = getPriceForDate(d, seasonalPricing, basePriceCents);

    result.push({
      date: dateStr,
      available: !isBlocked && !isBooked,
      pricePerNightCents,
      minNights,
    });
  }

  return result;
}

/**
 * Calculate total price for a date range
 */
export async function calculateBookingPrice(
  propertyId: string,
  checkIn: string,
  checkOut: string,
  basePriceCents: number
): Promise<{ totalCents: number; nights: number; avgPricePerNightCents: number }> {
  const seasonalPricing = await getSeasonalPricing(propertyId);

  let totalCents = 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  let nights = 0;

  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    const { pricePerNightCents } = getPriceForDate(d, seasonalPricing, basePriceCents);
    totalCents += pricePerNightCents;
    nights++;
  }

  return {
    totalCents,
    nights,
    avgPricePerNightCents: Math.round(totalCents / nights),
  };
}
