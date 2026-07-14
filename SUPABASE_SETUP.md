# Supabase Configuration Guide

Your Supabase project credentials are configured, but you need to set up users and data. Here's the complete step-by-step guide.

## Current Status

- ✅ Supabase project created: `vkyqeukzdltxzzybpusz.supabase.co`
- ✅ Environment variables added to your `.env.local`
- ✅ Database schema created (tables: assets, issues, maintenance_records, history, profiles)
- ✅ Seed assets inserted (5 demo assets)
- ❌ **profiles table is empty** - No auth users created yet

## Why Profiles Table is Empty

The `profiles` table references `auth.users` (Supabase's built-in authentication table). Until you create auth users, no profile records can exist. This is intentional for security - profiles can only be created when a user signs up or is added to the auth system.

## Step 1: Run Schema SQL (If Not Done)

Go to your Supabase dashboard → SQL Editor → Create new query and paste the entire contents of `supabase/schema.sql`.

Click "Run" to execute. This creates:
- Tables: profiles, assets, issues, maintenance_records, history
- Row Level Security policies
- Seed data (5 demo assets)

## Step 2: Create Auth Users

You have two options:

### Option A: Create Users via Supabase Dashboard (Easiest)

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add user"** button
3. Create admin account:
   - Email: `hassandeveloper341@gmail.com`
   - Password: `admin123` (or your choice)
   - Check "Auto confirm user"
   - Click **"Create user"**

4. Create technician account:
   - Email: `tech@maintainiq.app`
   - Password: `tech123`
   - Check "Auto confirm user"
   - Click **"Create user"**

### Option B: Use Auth Signup Flow in App

1. Navigate to your app login page: `http://localhost:5175`
2. Click "Don't have an account? Sign up"
3. Enter email and password
4. Account automatically created in `auth.users` and `profiles` table

## Step 3: Create Profile Records

Once auth users exist, you need to populate the `profiles` table. Run this SQL in Supabase SQL Editor:

```sql
-- Get the UUID of your created users first by checking auth.users
-- Then insert profile records

-- Replace the UUIDs below with actual values from auth.users
insert into profiles (id, full_name, role, created_at)
values
  ('YOUR_ADMIN_UUID_HERE', 'Hassan (Admin)', 'admin', now()),
  ('YOUR_TECH_UUID_HERE', 'Bilal (Technician)', 'technician', now())
on conflict (id) do nothing;
```

**How to get UUIDs:**
1. In Supabase Dashboard → **Authentication** → **Users**
2. Click on each user
3. Copy the UUID from their details

## Step 4: Verify Setup

Run this query in Supabase SQL Editor to check everything is set up:

```sql
-- Check profiles
select * from profiles;

-- Check assets
select * from assets;

-- Check auth users
select id, email from auth.users;
```

You should see:
- ✅ 2+ profile records with your users
- ✅ 5 asset records (classroom projector, AC unit, etc.)
- ✅ Auth users matching your profile records

## Step 5: Test Login in App

1. Go to `http://localhost:5175/login`
2. Login with your created email and password
3. Click "Dashboard" - you should see all 5 assets
4. You now have full admin access

## Troubleshooting

### Issue: "profiles table is empty"
**Solution:** You haven't created auth users yet. Follow **Step 2** above.

### Issue: Login fails with "Invalid credentials"
**Solution:** Check that:
- User was created in Supabase Authentication
- User email matches exactly (case-sensitive in some cases)
- Password matches what you set

### Issue: Can see assets but can't create issues
**Solution:** This is likely RLS (Row Level Security) restrictions. Check:
- User is authenticated (logged in)
- Their role in profiles table is 'admin' or 'technician'
- Check RLS policies in Supabase → Authentication → Policies

### Issue: See "Demo Mode" message in app
**Solution:** Supabase credentials are not loaded. Check:
- `.env.local` has both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server: `npm run dev`
- Check browser console for errors

## Quick Reference: Default Demo Credentials

If you want to match the demo app credentials:

**Admin:**
- Email: `hassandeveloper341@gmail.com` (your email)
- Password: `admin123`
- Role: admin

**Technician:**
- Email: `tech@maintainiq.app`
- Password: `tech123`
- Role: technician

## Next Steps

1. Create the 2 auth users above
2. Insert profile records with their UUIDs
3. Test login in the app
4. Create issues/report problems
5. Assign to technicians
6. Record maintenance work

Your Supabase setup is now ready to track real assets and issues!

---

**Last Updated:** July 14, 2026
**For Help:** Check SETUP_GUIDE.md for app-level configuration
