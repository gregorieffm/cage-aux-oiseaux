import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabase';
import { isStripeEnabled } from '../../lib/stripe';
import { isEmailEnabled } from '../../lib/email';

export const GET: APIRoute = async () => {
  const checks = {
    supabaseAdmin: !!supabaseAdmin,
    stripe: isStripeEnabled(),
    email: isEmailEnabled(),
    envVars: {
      SUPABASE_URL: !!import.meta.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: !!import.meta.env.SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
      STRIPE_SECRET_KEY: !!import.meta.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: !!import.meta.env.STRIPE_WEBHOOK_SECRET,
      RESEND_API_KEY: !!import.meta.env.RESEND_API_KEY,
      ADMIN_EMAIL: !!import.meta.env.ADMIN_EMAIL,
      SITE_URL: !!import.meta.env.SITE_URL,
    },
  };

  return new Response(JSON.stringify(checks, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
};
