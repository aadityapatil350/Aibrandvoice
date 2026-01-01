# Authentication System Overview

BrandVoice AI uses **Supabase Auth** with **Google OAuth** for secure user authentication, synced with a **Prisma-managed PostgreSQL database**.

## Architecture

```
┌─────────────────┐
│  User clicks    │
│ "Google Sign In"│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Supabase Auth  │◄──── Google OAuth 2.0
│   OAuth Flow    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ /auth/callback  │──── Exchanges code for session
│   Route Handler │──── Syncs user to Prisma DB
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Dashboard     │
│  (Protected)    │
└─────────────────┘
```

## Key Components

### 1. Supabase Client Setup

**Client-side** (`lib/supabase.ts`):
- Used in client components
- Browser-based auth operations

**Server-side** (`lib/supabase-server.ts`):
- Used in server components and API routes
- Cookie-based session management

### 2. Auth Pages

- `/app/auth/login/page.tsx` - Login page with Google OAuth
- `/app/auth/signup/page.tsx` - Signup page with Google OAuth
- `/app/auth/auth-code-error/page.tsx` - Error handling page

### 3. OAuth Callback

**`/app/auth/callback/route.ts`**:
1. Receives OAuth code from Supabase
2. Exchanges code for session
3. Syncs user data to Prisma database via `upsert`:
   - Creates new user if doesn't exist
   - Updates existing user info

### 4. Database Schema

**User Model** (`prisma/schema.prisma`):
```prisma
model User {
  id                    String   @id @default(uuid())
  supabaseId            String   @unique  // Links to Supabase Auth
  email                 String   @unique
  fullName              String?
  avatarUrl             String?
  provider              String?  // "google", "email", etc.
  onboardingCompleted   Boolean  @default(false)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  // ... relations
}
```

### 5. Google Sign-In Component

**`components/auth/GoogleSignInButton.tsx`**:
- Handles Google OAuth flow initiation
- Shows loading state
- Error handling

## User Flow

### First-Time User (Google Sign-In)
1. User clicks "Continue with Google"
2. Redirected to Google OAuth consent screen
3. User authorizes BrandVoice AI
4. Google redirects to Supabase callback
5. Supabase redirects to `/auth/callback`
6. Callback route:
   - Creates session in Supabase
   - Creates user in Prisma DB
7. User redirected to `/dashboard`

### Returning User
1. User clicks "Continue with Google"
2. Google recognizes user (no consent needed)
3. Redirected through Supabase
4. Callback route:
   - Updates user info in Prisma DB
5. User redirected to `/dashboard`

## Protected Routes

Use middleware or server-side checks to protect routes:

```typescript
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch user from Prisma
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id }
  })

  return <div>Protected content for {dbUser?.fullName}</div>
}
```

## Environment Variables

Required in `.env`:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://azqtqwfqdxzjiwmkxwfo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database
DATABASE_URL=your_postgres_url

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Seeding

The project includes a comprehensive seed script with demo data:

```bash
npm run prisma:seed
```

This creates:
- 1 demo user (demo@brandvoice.ai)
- 8 platforms (YouTube, Instagram, TikTok, etc.)
- 1 brand profile with sample data
- Sample content optimizations
- Sample saved generations

## Testing

### Manual Testing
1. Start dev server: `npm run dev`
2. Navigate to: http://localhost:3000/auth/login
3. Click "Continue with Google"
4. Complete OAuth flow
5. Verify redirect to dashboard
6. Check Prisma Studio: `npm run prisma:studio`
   - Confirm user exists in `users` table

### Test with Demo Data
The seeded demo user can be used for testing without Google OAuth:
- Email: `demo@brandvoice.ai`
- Supabase ID: `demo-user-supabase-id`

## Common Tasks

### Get Current User (Server)
```typescript
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

const dbUser = await prisma.user.findUnique({
  where: { supabaseId: user.id }
})
```

### Get Current User (Client)
```typescript
'use client'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

const [user, setUser] = useState(null)

useEffect(() => {
  supabase.auth.getUser().then(({ data: { user } }) => {
    setUser(user)
  })
}, [])
```

### Sign Out
```typescript
await supabase.auth.signOut()
// Redirect to login page
```

## Security Considerations

1. **Row Level Security (RLS)**: Consider enabling RLS in Supabase
2. **API Route Protection**: Always verify auth in API routes
3. **Client vs Server**: Use server components for sensitive data
4. **Token Refresh**: Handled automatically by Supabase
5. **CSRF Protection**: Built into Supabase Auth

## Troubleshooting

### User not appearing in database
- Check callback route logs
- Verify `DATABASE_URL` is correct
- Run `npm run prisma:generate`

### OAuth redirect errors
- Check Google Cloud Console redirect URIs
- Verify Supabase URL configuration
- Check browser console for errors

### Session not persisting
- Clear browser cookies
- Check Supabase Auth settings
- Verify middleware is configured

## Next Steps

1. **Setup Google OAuth** - Follow `SUPABASE_AUTH_SETUP.md`
2. **Add Email Auth** - Implement magic link or password auth
3. **Onboarding Flow** - Guide new users through setup
4. **Profile Management** - Allow users to update their profile
5. **Role-Based Access** - Add admin/user roles

## Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [Prisma Documentation](https://www.prisma.io/docs)
