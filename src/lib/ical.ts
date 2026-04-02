/**
 * iCal sync engine
 * Fetches iCal feeds from Airbnb, Booking.com, Gîtes de France, etc.
 * Parses VEVENT blocks and extracts blocked date ranges.
 */

export interface IcalEvent {
  uid: string;
  summary: string;
  dtstart: string;
  dtend: string;
}

/**
 * Parse an iCal feed string into a list of events
 */
export function parseIcal(icalText: string): IcalEvent[] {
  const events: IcalEvent[] = [];
  const lines = icalText.replace(/\r\n /g, '').split(/\r?\n/);

  let inEvent = false;
  let current: Partial<IcalEvent> = {};

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      current = {};
      continue;
    }
    if (line === 'END:VEVENT') {
      inEvent = false;
      if (current.uid && current.dtstart && current.dtend) {
        events.push({
          uid: current.uid,
          summary: current.summary || '',
          dtstart: current.dtstart,
          dtend: current.dtend,
        });
      }
      continue;
    }

    if (!inEvent) continue;

    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const key = line.substring(0, colonIdx).split(';')[0].toUpperCase();
    const value = line.substring(colonIdx + 1).trim();

    switch (key) {
      case 'UID':
        current.uid = value;
        break;
      case 'SUMMARY':
        current.summary = value;
        break;
      case 'DTSTART':
        current.dtstart = parseIcalDate(value);
        break;
      case 'DTEND':
        current.dtend = parseIcalDate(value);
        break;
    }
  }

  return events;
}

/**
 * Convert iCal date format (20260715 or 20260715T140000Z) to YYYY-MM-DD
 */
function parseIcalDate(value: string): string {
  const clean = value.replace(/[TZ]/g, '').substring(0, 8);
  if (clean.length !== 8) return value;
  return `${clean.substring(0, 4)}-${clean.substring(4, 6)}-${clean.substring(6, 8)}`;
}

/**
 * Expand an event's date range into individual dates
 */
export function expandEventDates(event: IcalEvent): string[] {
  const dates: string[] = [];
  const start = new Date(event.dtstart);
  const end = new Date(event.dtend);

  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0]);
  }

  return dates;
}

/**
 * Fetch and parse an iCal feed from a URL
 */
export async function fetchIcalFeed(url: string): Promise<IcalEvent[]> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'CageAuxOiseaux-BookingSync/1.0' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch iCal feed: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  return parseIcal(text);
}

/**
 * Get all blocked dates from an iCal feed URL
 */
export async function getBlockedDatesFromFeed(url: string): Promise<{ uid: string; date: string }[]> {
  const events = await fetchIcalFeed(url);
  const blockedDates: { uid: string; date: string }[] = [];

  for (const event of events) {
    const start = new Date(event.dtstart);
    const end = new Date(event.dtend);

    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      blockedDates.push({
        uid: event.uid,
        date: d.toISOString().split('T')[0],
      });
    }
  }

  return blockedDates;
}
