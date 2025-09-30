# Supabase Database Setup

## Quick Setup Instructions

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to your project**: `jdyitghmfzioatrqinqy`
3. **Go to SQL Editor** (in the left sidebar)
4. **Copy and paste the contents of `nextauth-schema.sql`** into the SQL editor
5. **Click "Run"** to execute the schema

## What This Schema Includes

### NextAuth.js Tables
- `users` - Core user data from GitHub OAuth
- `accounts` - OAuth provider accounts (stores GitHub tokens)
- `sessions` - User session management
- `verification_tokens` - For email verification (if needed)

### DocuGit Custom Tables
- `user_profiles` - Extended user profile data (GitHub username, subscription tier, usage stats)
- `projects` - User's documentation projects
- `analytics` - Usage tracking and analytics
- `repository_favorites` - User's favorite repositories

### Security Features
- Row Level Security (RLS) enabled on all tables
- Proper policies to ensure users can only access their own data
- Indexes for optimal performance
- Automatic `updated_at` triggers

## After Running the Schema

1. The app will automatically create user profiles when users sign in with GitHub
2. All GitHub tokens are securely stored and used for API calls
3. Users can access private repositories (if they have permission)
4. Enhanced rate limits through authenticated API calls

## Test the Integration

1. Sign in with GitHub on http://localhost:3000
2. Try analyzing a repository
3. Check the Supabase dashboard to see the user data being created

The integration is now complete and ready for testing!