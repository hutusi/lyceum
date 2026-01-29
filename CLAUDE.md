# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Coding Lyceum is a Next.js-based community website for AI coding education with four main sections:
- **Know**: News, articles, videos, and live streams about AI tools
- **Learn**: Structured courses, workshops, and prompt engineering techniques
- **Practice**: Coding tasks, discussions, and Q&A
- **Create**: Project showcase, API playground, and AI Nexus Weekly publication

## Commands

```bash
# Development
bun run dev              # Start dev server with Turbopack (http://localhost:3000)
bun run build            # Build for production
bun run start            # Start production server
bun run lint             # Run ESLint

# Database
bun run db:push          # Push schema to database (development)
bun run db:generate      # Generate migrations
bun run db:migrate       # Run migrations
bun run db:studio        # Open Drizzle Studio
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime/Package Manager**: Bun
- **Styling**: TailwindCSS v4 + shadcn/ui
- **Database**: SQLite with Drizzle ORM (`lyceum.db`)
- **Authentication**: Auth.js v5 (NextAuth) with GitHub/Google providers
- **State**: Zustand for client state, React Server Components for server state

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Auth route group (login, register)
│   ├── (main)/           # Main site route group with header/footer
│   │   ├── know/         # News & articles section
│   │   ├── learn/        # Courses & workshops section
│   │   ├── practice/     # Discussions & coding tasks section
│   │   ├── create/       # Project showcase & API playground
│   │   └── profile/      # User profile (protected)
│   ├── admin/            # Admin dashboard (role-protected)
│   └── api/
│       └── auth/         # Auth.js API routes
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Header, Footer
│   └── providers/        # SessionProvider
└── lib/
    ├── auth/             # Auth.js configuration
    ├── db/               # Drizzle ORM schema & client
    └── utils.ts          # cn() utility
```

## Architecture Patterns

### Route Groups
- `(main)` group wraps pages with Header/Footer layout
- `(auth)` group uses minimal centered layout for auth pages
- `admin` is a separate route with sidebar navigation and role protection

### Server vs Client Components
- Pages are Server Components by default
- Interactive components (forms, navigation) use `"use client"`
- Auth-dependent UI uses `useSession` hook in client components or `auth()` in server components

### Database Schema
Key tables in `src/lib/db/schema.ts`:
- Users & Auth: `users`, `accounts`, `sessions`, `verificationTokens`
- Know Section: `articles`, `tags`, `articleTags`
- Learn Section: `courses`, `lessons`, `enrollments`, `lessonProgress`
- Practice Section: `practiceTopics`, `discussions`, `comments`
- Create Section: `projects`, `nexusWeeklyIssues`

### Authentication
- Configured in `src/lib/auth/auth.ts`
- Uses JWT strategy with custom callbacks for role management
- Admin routes protected via layout-level checks
- Middleware handles route authorization

## Environment Variables

Copy `.env.local.example` to `.env.local` and configure:
- `AUTH_SECRET`: Generate with `openssl rand -base64 32`
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`: GitHub OAuth app credentials
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: Google OAuth app credentials
