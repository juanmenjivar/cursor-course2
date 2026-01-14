# Supabase Setup Guide

Follow these steps to connect your API Keys dashboard to Supabase:

## 1. Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create an account or sign in
2. Create a new project (or use an existing one)
3. Go to **Settings** → **API**
4. Copy your:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (under "Project API keys")

## 2. Set Up Environment Variables

Add these to your `.env.local` file in the root of your project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** 
- Use `NEXT_PUBLIC_` prefix so these variables are available in the browser
- Never commit `.env.local` to git (it should already be in `.gitignore`)

## 3. Create the Database Table

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-schema.sql`
4. Click **Run** to execute the SQL

This will create:
- The `api_keys` table with all necessary columns
- Indexes for better performance
- Row Level Security (RLS) policies
- A trigger to update the `updated_at` timestamp

## 4. Verify the Setup

1. Restart your Next.js development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/dashboards` in your app

3. Try creating an API key - it should now be saved to Supabase!

## 5. View Your Data

You can view your API keys in Supabase:
- Go to **Table Editor** in your Supabase dashboard
- Select the `api_keys` table
- You should see all your API keys stored there

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Make sure your `.env.local` file has both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart your development server after adding environment variables

### Error: "relation 'api_keys' does not exist"
- Make sure you've run the SQL script from `supabase-schema.sql` in the Supabase SQL Editor

### Error: "new row violates row-level security policy"
- Check that the RLS policy in `supabase-schema.sql` was created correctly
- The policy should allow all operations (you can restrict this later for production)

### Data not showing up
- Check the browser console for errors
- Verify your Supabase URL and anon key are correct
- Check the Supabase logs in your project dashboard
