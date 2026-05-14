# Vercel Environment Variables Setup

To make the Supabase integration work on Vercel, you need to add environment variables manually through the Vercel dashboard.

## Steps:

1. Go to https://vercel.com/dashboard
2. Click on your **site-check-one** project
3. Go to **Settings** tab
4. Click **Environment Variables** in the left menu
5. Add these three variables:

### Variable 1: SUPABASE_URL
- **Name:** `SUPABASE_URL`
- **Value:** `https://kzshaomrffkttwkwniaq.supabase.co`
- **Environments:** Select all (Production, Preview, Development)

### Variable 2: SUPABASE_ANON_KEY
- **Name:** `SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6c2hhb21yZmZrdHR3a3duaWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NzIzMTcsImV4cCI6MjA5NDM0ODMxN30.lM7Rq4A0yn5kKH6kzSV-M8DgHWr4FWrnATG4noQaOI8`
- **Environments:** Select all

### Variable 3: SUPABASE_SERVICE_ROLE_KEY
- **Name:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6c2hhb21yZmZrdHR3a3duaWFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc3MjMxNywiZXhwIjoyMDk0MzQ4MzE3fQ.K_DbAYVWxOb9T-S0vgaSQYV7pGxCqO0fQWB4nfDyBQk`
- **Environments:** Select all

6. Click **Save** after adding each variable
7. Go to **Deployments** and click **Redeploy** on the latest deployment

## Why Service Role Key?

The service role key bypasses Supabase's Row-Level Security (RLS) restrictions, allowing credentials to be saved even if RLS is enabled on the credentials table. This is the recommended approach for server-side operations.

## Testing

After setting the variables and redeploying:
1. Visit https://site-check-one.vercel.app/health
2. You should see `"supabase_configured":true` and `"supabase_service_configured":true`
3. Try submitting the login form - credentials should now be saved to Supabase
