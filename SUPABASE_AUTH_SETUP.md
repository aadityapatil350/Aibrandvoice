# Supabase Google OAuth Setup Guide

This guide walks you through setting up Google OAuth authentication for BrandVoice AI.

## Prerequisites

- A Supabase project (already created at: https://azqtqwfqdxzjiwmkxwfo.supabase.co)
- A Google Cloud Platform account

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services > Credentials**
4. Click **+ CREATE CREDENTIALS** and select **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - User Type: External
   - App name: BrandVoice AI
   - User support email: your email
   - Developer contact: your email
   - Scopes: Add email, profile, openid
   - Test users: Add your email for testing

6. Create OAuth client ID:
   - Application type: **Web application**
   - Name: BrandVoice AI Production
   - Authorized JavaScript origins:
     ```
     http://localhost:3000
     https://azqtqwfqdxzjiwmkxwfo.supabase.co
     https://yourdomain.com (if you have a custom domain)
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:3000/auth/callback
     https://azqtqwfqdxzjiwmkxwfo.supabase.co/auth/v1/callback
     https://yourdomain.com/auth/callback (if you have a custom domain)
     ```

7. Click **CREATE** and save your:
   - Client ID
   - Client Secret

## Step 2: Configure Supabase Authentication

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/azqtqwfqdxzjiwmkxwfo
2. Navigate to **Authentication > Providers**
3. Find **Google** in the list and click to expand
4. Enable Google provider
5. Enter your credentials:
   - **Client ID**: (from Google Cloud Console)
   - **Client Secret**: (from Google Cloud Console)
6. Click **Save**

## Step 3: Configure URL Settings

1. In Supabase Dashboard, go to **Authentication > URL Configuration**
2. Set the following URLs:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add these URLs (one per line):
     ```
     http://localhost:3000/auth/callback
     http://localhost:3000/**
     ```

## Step 4: Test Authentication

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to: http://localhost:3000/auth/login

3. Click "Continue with Google"

4. Complete the Google sign-in flow

5. You should be redirected to `/dashboard` after successful authentication

## Step 5: Verify Database Sync

After signing in with Google, check that your user was synced to the database:

```bash
npm run prisma:studio
```

Look for your user in the `users` table with:
- `supabaseId`: Your Supabase auth ID
- `email`: Your Google email
- `fullName`: Your Google display name
- `avatarUrl`: Your Google profile picture
- `provider`: "google"

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Verify that the redirect URI in Google Cloud Console exactly matches: `https://azqtqwfqdxzjiwmkxwfo.supabase.co/auth/v1/callback`
- Make sure there are no trailing slashes

### User not synced to database
- Check the server logs for errors in `/app/auth/callback/route.ts`
- Verify that `DATABASE_URL` is correctly set in `.env`
- Run `npm run prisma:generate` to ensure Prisma Client is up to date

### "Authentication failed" error
- Check Supabase logs in Dashboard > Logs > Auth
- Verify Google OAuth credentials are correct
- Ensure the Google OAuth consent screen is configured properly

## Production Deployment

When deploying to production:

1. Update Google OAuth redirect URIs to include your production domain
2. Update Supabase URL configuration with production URLs
3. Set environment variables on your hosting platform (Vercel, etc.)
4. Update `NEXT_PUBLIC_APP_URL` in production environment

## Security Notes

- Never commit your `.env` file to version control
- Rotate your Google OAuth credentials periodically
- Use Supabase RLS (Row Level Security) policies for additional security
- Consider implementing rate limiting for authentication endpoints

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Authentication Patterns](https://nextjs.org/docs/authentication)
