# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**BrandVoice AI** is a micro-SaaS platform that learns a personal brand's unique voice from user content, then generates, edits, schedules, and analyzes multi-channel posts. Built with Next.js 14, Prisma, and Supabase.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TailwindCSS
- **Backend**: Next.js API routes, Supabase (Auth + PostgreSQL)
- **Database**: PostgreSQL via Supabase with Prisma ORM
- **Auth**: Supabase Auth with @supabase/ssr
- **AI**: OpenAI (GPT-4o, text-embedding-3-large for vector-based voice modeling)
- **Deployment**: Vercel

## Common Commands

```bash
# Development
npm run dev                 # Start dev server (default port 3000)
npm run build              # Build for production
npm run start              # Start production server
npm run lint               # Run ESLint

# Database
npm run prisma:generate    # Generate Prisma Client
npm run prisma:push        # Push schema to database
npm run prisma:studio      # Open Prisma Studio GUI
```

## Architecture & Key Patterns

### Authentication Flow
- Supabase Auth handles all authentication
- Server-side auth uses `lib/supabase-server.ts` with cookie-based sessions
- Client-side auth uses `lib/supabase.ts`
- Middleware (`middleware.ts`) refreshes auth state on every request
- Protected routes redirect to `/auth/login` if unauthenticated

### Auth Callback
- OAuth flow completes at `app/auth/callback/route.ts`
- Exchanges code for session and redirects to dashboard

### Database Schema
- Managed via Prisma (`prisma/schema.prisma`)
- Currently minimal with User model
- Designed to scale with: BrandProfile, VoiceSample, Draft, ScheduledPost, Analytics, Feedback models

### Path Aliases
- `@/*` resolves to project root (configured in `tsconfig.json`)
- Use `@/lib/prisma` not `../../../lib/prisma`

### Styling & Theme
- **Claude-inspired design system** with warm neutrals and amber accents
- Colors defined in `tailwind.config.js` under `claude.*` namespace:
  - Backgrounds: `claude-bg`, `claude-bg-secondary`, `claude-bg-tertiary`
  - Text: `claude-text`, `claude-text-secondary`, `claude-text-tertiary`
  - Accent: `claude-accent`, `claude-accent-hover`
  - Borders: `claude-border`, `claude-border-hover`
- Global styles in `app/globals.css`

## AI Integration Strategy (Planned)

### Voice Training & Personalization
- **Model**: `text-embedding-3-large` for creating user voice vectors
- **Storage**: PostgreSQL with pgvector extension in Supabase
- **Logic**: `lib/ai/voiceVector.ts` (to be created)
  - Extract text from PDF/DOCX uploads
  - Generate embeddings from user's past content
  - Store in VoiceSample table with vector similarity search
  - Retrieve top 3 similar posts for few-shot prompting

### Content Generation
- **Model**: `gpt-4o` (Pro tier) or `gpt-4o-mini` (Free/Starter)
- **Logic**: `lib/ai/promptAssembler.ts` + `api/ai/generate/route.ts`
  - Combine user brand profile + voice vector + request parameters
  - Generate multi-platform variants (LinkedIn, Twitter, Instagram) in single request
  - Return structured JSON with platform-specific formatting

### Inline Editing & Suggestions
- **Model**: `gpt-4o-mini` for low-latency edits
- **Logic**: `api/ai/refine/route.ts`
  - Real-time rewrites (rephrase, shorten, expand, tone adjust)
  - Maintain brand context in system prompt

### Analytics Insights
- **Model**: `gpt-4o-mini`
- **Logic**: `lib/analytics/insights.ts`
  - Generate plain-English insights from engagement metrics
  - Suggest content optimizations based on performance patterns

### Feedback Loop
- 👍/👎 on every draft updates voice vector and style prompt
- Approved content added to training set
- Nightly re-averaging of embeddings for continuous personalization

## Environment Variables

Required in `.env`:
```
DATABASE_URL=                      # Supabase PostgreSQL connection
NEXT_PUBLIC_SUPABASE_URL=         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=        # Supabase service role key (server-side only)
NEXT_PUBLIC_APP_URL=              # App URL (default: http://localhost:3000)
```

## Current Project State

This is a **fresh reset** starting from scratch:
- ✅ Auth system with Supabase (login/signup/callback/signout)
- ✅ Claude-inspired theme implemented
- ✅ Basic routing: landing (`/`), auth pages (`/auth/*`), dashboard (`/dashboard`)
- ✅ Prisma setup with minimal User model
- ⏳ AI features not yet implemented
- ⏳ Onboarding wizard not yet built
- ⏳ Content generation not yet built
- ⏳ Scheduler not yet built

## Development Notes

- Always run `prisma:generate` after schema changes
- Use `prisma:push` for development (migrations disabled in `.gitignore`)
- Supabase client initialization differs for server vs client components
- Server components: use `await createClient()` from `lib/supabase-server.ts`
- Client components: use `supabase` from `lib/supabase.ts`
