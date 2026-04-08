import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../../lib/supabase';

export const GET: APIRoute = async ({ params }) => {
  const { propertyId } = params;

  if (!supabaseAdmin || !propertyId) {
    return new Response('Not found', { status: 404 });
  }

  const { data: property } = await supabaseAdmin
    .from('properties')
    .select('name')
    .eq('id', propertyId)
    .single();

  if (!property) {
    return new Response('Not found', { status: 404 });
  }

  const { data: bookings } = await supabaseAdmin
    .from('bookings')
    .select('id, check_in, check_out, guest_name, status')
    .eq('property_id', propertyId)
    .in('status', ['confirmed', 'paid', 'completed']);

  const { data: blocked } = await supabaseAdmin
    .from('blocked_dates')
    .select('date, source')
    .eq('property_id', propertyId);

  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//La Cage aux Oiseaux//Booking//FR
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${property.name} — La Cage aux Oiseaux
X-WR-TIMEZONE:Europe/Paris
`;

  if (bookings) {
    for (const b of bookings) {
      const uid = `booking-${b.id}@cage-aux-oiseaux.vercel.app`;
      const dtstart = b.check_in.replace(/-/g, '');
      const dtend = b.check_out.replace(/-/g, '');
      ical += `BEGIN:VEVENT
UID:${uid}
DTSTART;VALUE=DATE:${dtstart}
DTEND;VALUE=DATE:${dtend}
DTSTAMP:${now}
SUMMARY:Réservé — ${b.guest_name}
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT
`;
    }
  }

  if (blocked) {
    const manualDates = blocked.filter(d => d.source === 'manual');
    for (const d of manualDates) {
      const dt = d.date.replace(/-/g, '');
      const nextDay = new Date(d.date);
      nextDay.setDate(nextDay.getDate() + 1);
      const dtEnd = nextDay.toISOString().split('T')[0].replace(/-/g, '');
      ical += `BEGIN:VEVENT
UID:blocked-${dt}-${propertyId}@cage-aux-oiseaux.vercel.app
DTSTART;VALUE=DATE:${dt}
DTEND;VALUE=DATE:${dtEnd}
DTSTAMP:${now}
SUMMARY:Bloqué
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT
`;
    }
  }

  ical += 'END:VCALENDAR';

  return new Response(ical, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${propertyId}.ics"`,
      'Cache-Control': 'public, max-age=900',
    },
  });
};
