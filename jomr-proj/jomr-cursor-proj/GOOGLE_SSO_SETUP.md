# Google SSO Setup Guide

Follow these steps to enable "Sign in with Google" on your app.

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure the **OAuth consent screen**:
   - Choose **External** (for any Google account) or **Internal** (workspace only)
   - Fill in App name, User support email, Developer contact
   - Add your email to Test users if in Testing mode
6. For **Application type**, select **Web application**
7. Add **Authorized redirect URIs**:
   - Local (Docker): `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.com/api/auth/callback/google`
8. Click **Create** and copy the **Client ID** and **Client Secret**

## Step 2: Add Environment Variables

Add these to `.env.local` in the project root:

```env
# Google OAuth (from Step 1)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-random-secret-at-least-32-chars

# Required for Docker/callback URLs (use the URL users see in browser)
NEXTAUTH_URL=http://localhost:3000
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

## Step 3: Rebuild and Run Docker

Since your project runs only in Docker:

```bash
docker compose build --no-cache
docker compose up -d
```

Or for development:
```bash
docker compose -f docker-compose.dev.yml build --no-cache
docker compose -f docker-compose.dev.yml up
```

## Step 4: Test the Flow

1. Open `http://localhost:3000` in your browser
2. Click **Sign in with Google**
3. Choose your Google account
4. You should be redirected back and see your email + a **Sign out** button

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Configuration" error | Ensure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `NEXTAUTH_SECRET` are set in your env file |
| Redirect URI mismatch | Add `http://localhost:3000/api/auth/callback/google` exactly in Google Console |
| OAuth consent screen | If app is in Testing, add your email under Test users |
| Docker can't read env | Ensure `.env.local` exists in project root (compose uses `env_file: .env.local`) |
