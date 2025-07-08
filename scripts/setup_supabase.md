# Supabase Database Setup Guide

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Sign in to your account
3. Click "New Project"
4. Choose organization and provide project details:
   - Name: `pragmateches-cmms-mock`
   - Database Password: Generate a strong password
   - Region: Choose closest to your location
5. Wait for project creation (takes ~2 minutes)

## Step 2: Get Project Credentials

1. Go to Project Settings > API
2. Copy the following values:
   - Project URL
   - Project API Key (anon/public)

## Step 3: Configure Environment Variables

Create or update `.env.local` with:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Existing OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
```

## Step 4: Create Database Schema

1. Go to Supabase Dashboard > SQL Editor
2. Copy and paste the content from `supabase/migrations/20250704051934_create_cmms_schema.sql`
3. Run the query to create all tables

## Step 5: Seed Sample Data

1. In Supabase SQL Editor, create a new query
2. Copy and paste the content from `supabase/migrations/20250704052046_seed_sample_data.sql`
3. Run the query to insert all sample data

## Step 6: Verify Database

Check that the following tables were created:
- equipment_type_master (8 rows)
- work_type_master (10 rows)
- staff_master (10 rows)
- contractor_master (8 rows)
- inspection_cycle_master (10 rows)
- equipment (20 rows)
- work_order (15 rows)
- maintenance_history (15 rows)
- inspection_plan (20 rows)
- anomaly_report (15 rows)

## Step 7: Link to Your Application

Once you've added the environment variables, your Next.js application will automatically connect to Supabase using the client configuration in `lib/supabase.ts`.

## Alternative: Using Supabase CLI (Requires Docker)

If you have Docker installed, you can also use:

```bash
# Link to your project
supabase link --project-ref your_project_id

# Push migrations
supabase db push

# Or reset and push all migrations
supabase db reset
```

## Database Features Enabled

- ✅ Row Level Security (RLS) with public access policies
- ✅ Automatic timestamps (created_at, updated_at)
- ✅ Foreign key constraints
- ✅ Performance indexes
- ✅ Japanese column names and data
- ✅ Realistic sample data for testing

## Next Steps

After setup, you can:
1. Test the AI features with real database data
2. Build new features that query Supabase
3. Add real-time subscriptions
4. Implement user authentication
5. Add file storage for maintenance photos/documents