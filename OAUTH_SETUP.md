# OAuth Setup Guide for Minimal Shop

## Overview
This app uses Supabase Authentication with OAuth providers (Google, Facebook, Apple). Follow these steps to enable sign-in functionality.

## Step 1: Go to Supabase Dashboard

1. Visit [https://supabase.com](https://supabase.com)
2. Sign in to your project
3. Go to **Authentication** → **Providers**

## Step 2: Enable Google OAuth

1. Click on **Google** provider
2. Toggle it **ON**
3. You'll see a "Redirect URL" - copy it (looks like: `https://your-project.supabase.co/auth/v1/callback?provider=google`)
4. Go to [Google Cloud Console](https://console.cloud.google.com/)
5. Create a new project or select existing one
6. Enable "Google+ API"
7. Go to **Credentials** → **Create OAuth 2.0 Client ID**
8. Choose **Web application**
9. Add your app URL to "Authorized JavaScript origins" (e.g., `http://localhost:3000`, `https://yourdomain.com`)
10. Add the Supabase redirect URL to "Authorized redirect URIs"
11. Copy the **Client ID** and **Client Secret**
12. Paste them in Supabase Google provider settings
13. Click **Save**

## Step 3: Enable Facebook OAuth

1. Click on **Facebook** provider in Supabase
2. Toggle it **ON**
3. Copy the Redirect URL
4. Go to [Facebook Developers](https://developers.facebook.com/)
5. Create a new app or select existing one
6. Go to **Settings** → **Basic** and copy App ID and App Secret
7. Go to **Facebook Login** → **Settings**
8. Add your app URL to "Valid OAuth Redirect URIs" (paste the Supabase redirect URL)
9. Paste App ID and App Secret in Supabase Facebook provider settings
10. Click **Save**

## Step 4: Enable Apple OAuth

1. Click on **Apple** provider in Supabase
2. Toggle it **ON**
3. Go to [Apple Developer](https://developer.apple.com/)
4. Create a new "Service ID" for your app
5. Configure "Sign in with Apple"
6. Add your app domain to the allowed domains
7. Create a private key for the Service ID
8. Paste the required credentials in Supabase Apple provider settings
9. Click **Save**

## Step 5: Test the Sign-In

1. Click the **Login** icon (👤) in the top bar
2. Click on any provider (Google, Facebook, or Apple)
3. You should be redirected to the provider's login page
4. After successful login, you'll be redirected back to the app

## Troubleshooting

- **"Provider not configured" error**: Make sure you've enabled the provider in Supabase and added the credentials
- **Redirect URL mismatch**: Ensure the redirect URLs match exactly in both Supabase and the provider's dashboard
- **CORS errors**: Check that your app domain is added to the provider's allowed domains
- **Check browser console**: Open DevTools (F12) and check the Console tab for detailed error messages

## Environment Variables

Make sure these are set in your Vercel project:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

These should already be configured if you connected Supabase integration.
