export type BookingStatus = 'pending' | 'confirmed' | 'paid' | 'cancelled' | 'completed';

export interface Property {
  id: string;
  name: string;
  slug: string;
  capacity: number;
  base_price_cents: number;
  min_nights: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SeasonalPricing {
  id: string;
  property_id: string;
  label: string;
  start_month: number;
  end_month: number;
  price_per_night_cents: number;
  min_nights: number;
  created_at: string;
}

export interface BlockedDate {
  id: string;
  property_id: string;
  date: string;
  source: string;
  external_uid: string | null;
  created_at: string;
}

export interface IcalFeed {
  id: string;
  property_id: string;
  platform: string;
  url: string;
  last_synced_at: string | null;
  last_error: string | null;
  active: boolean;
  created_at: string;
}

export interface BookingExtra {
  name: string;
  price_cents: number;
  quantity: number;
}

export interface Booking {
  id: string;
  property_id: string;
  status: BookingStatus;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  check_in: string;
  check_out: string;
  nights: number;
  price_per_night_cents: number;
  total_cents: number;
  extras_cents: number;
  extras: BookingExtra[];
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  paid_at: string | null;
  guest_message: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  cancelled_at: string | null;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  dates: string | null;
  property_slug: string | null;
  message: string | null;
  read: boolean;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: Property;
        Insert: Omit<Property, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Property, 'id' | 'created_at'>>;
      };
      seasonal_pricing: {
        Row: SeasonalPricing;
        Insert: Omit<SeasonalPricing, 'id' | 'created_at'>;
        Update: Partial<Omit<SeasonalPricing, 'id' | 'created_at'>>;
      };
      blocked_dates: {
        Row: BlockedDate;
        Insert: Omit<BlockedDate, 'id' | 'created_at'>;
        Update: Partial<Omit<BlockedDate, 'id' | 'created_at'>>;
      };
      ical_feeds: {
        Row: IcalFeed;
        Insert: Omit<IcalFeed, 'id' | 'created_at'>;
        Update: Partial<Omit<IcalFeed, 'id' | 'created_at'>>;
      };
      bookings: {
        Row: Booking;
        Insert: Omit<Booking, 'id' | 'nights' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Booking, 'id' | 'nights' | 'created_at'>>;
      };
      contact_submissions: {
        Row: ContactSubmission;
        Insert: Omit<ContactSubmission, 'id' | 'created_at' | 'read'>;
        Update: Partial<Omit<ContactSubmission, 'id' | 'created_at'>>;
      };
    };
  };
}
