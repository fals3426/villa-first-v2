---
project_name: 'Villa first v2'
user_name: 'Falsone'
date: '2026-01-20'
sections_completed:
  ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'anti_patterns']
status: 'complete'
rule_count: 50+
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

**Frontend Framework:**
- Next.js 15+ (App Router)
- React 18+
- TypeScript (strict mode enabled)

**Styling:**
- Tailwind CSS (JIT compilation)
- Radix UI via shadcn/ui
- Custom design tokens

**Backend:**
- Next.js API Routes (REST)
- PostgreSQL 18.1
- Prisma ORM v6.16.2 (or v7 if needed)

**Authentication:**
- NextAuth.js v4.24.13
- JWT with database sessions

**Real-time Communication:**
- Socket.IO v4.8.3 (separate Node.js server)
- Redis adapter for scaling

**Payment Processing:**
- Stripe API (version: 2025-12-15.clover)

**PWA Support:**
- @ducanh2912/next-pwa
- Service workers for offline support
- IndexedDB for offline data

**Development Tools:**
- ESLint (Next.js rules)
- Prettier
- TypeScript strict mode

**Testing:**
- Jest + React Testing Library (to be added)
- Unit tests co-located with `*.test.ts`
- Integration tests in `__tests__/` directory

---

## Critical Implementation Rules

### TypeScript Configuration

**CRITICAL:** TypeScript strict mode is enabled. All code must:
- Avoid `any` types (use `unknown` if needed)
- Use Prisma generated types where applicable
- Define types in `types/` directory
- Never use `@ts-ignore` or `@ts-nocheck` without justification

**Type Safety Rules:**
```typescript
// ✅ Good: Explicit types
const userId: string = user.id;
const listings: Listing[] = await prisma.listing.findMany();

// ❌ Bad: Using any
const data: any = await fetchData();
```

### Naming Conventions (STRICT)

**Database (Prisma):**
- Models: `camelCase` (e.g., `User`, `Listing`, `Booking`)
- Fields: `camelCase` (e.g., `userId`, `createdAt`, `isVerified`)
- Relations: Explicit names (e.g., `tenant`, `host`, `listing`)

**API Routes:**
- Endpoints: Plural nouns (`/api/listings`, `/api/bookings`)
- Route parameters: `[id]` format (`/api/listings/[id]`)
- Query parameters: `camelCase` (`?minPrice=700&maxPrice=1000`)

**React Components:**
- Files: `PascalCase.tsx` (e.g., `ListingCard.tsx`, `VerifiedBadge.tsx`)
- Components: `PascalCase` function names
- Props: `camelCase` (e.g., `{ listing, isVerified }`)

**Functions & Variables:**
- Functions: `camelCase` (e.g., `getUserData`, `createListing`)
- Variables: `camelCase` (e.g., `userId`, `isLoading`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_LISTING_PRICE`)

**CRITICAL:** Never mix naming conventions. Consistency is mandatory.

### Project Structure (MANDATORY)

**File Organization:**
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes ONLY
│   ├── (auth)/            # Auth routes group
│   └── (public)/          # Public routes group
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── features/         # Feature-specific components
│   └── layout/           # Layout components
├── lib/                   # Utilities and helpers
│   ├── prisma.ts         # Prisma client singleton (CRITICAL)
│   ├── auth.ts           # NextAuth config
│   └── utils.ts          # Shared utilities
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript types
└── server/                # Server-only code
    ├── actions/          # Server actions
    └── services/         # Business logic (NEVER call Prisma directly from API routes)
```

**CRITICAL Rules:**
- API routes (`app/api/*`) MUST call services, never Prisma directly
- Services (`server/services/*`) handle all Prisma queries
- Components NEVER import Prisma client
- Use Prisma client singleton from `lib/prisma.ts`

### API Response Format (STANDARDIZED)

**Success Response:**
```typescript
{
  data: T,
  meta?: {
    pagination?: {
      page: number,
      limit: number,
      total: number
    },
    timestamp: string
  }
}
```

**Error Response:**
```typescript
{
  error: {
    code: string,        // e.g., "VALIDATION_ERROR", "NOT_FOUND"
    message: string,     // User-friendly message (French)
    details?: unknown    // Additional error context
  }
}
```

**HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (not authorized)
- `404`: Not Found
- `500`: Internal Server Error

**CRITICAL:** Always use this format. Never expose technical errors to users.

### Error Handling (MANDATORY PATTERNS)

**API Routes:**
```typescript
// app/api/listings/route.ts
export async function GET(request: Request) {
  try {
    const listings = await listingService.getAll();
    return NextResponse.json({
      data: listings,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    // Log complete error server-side
    console.error('Error fetching listings:', error);
    
    // Return user-friendly error
    return NextResponse.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur est survenue lors de la récupération des annonces'
      }
    }, { status: 500 });
  }
}
```

**React Components:**
- Use Error Boundaries for UI errors
- Never expose technical errors to users
- Show user-friendly messages only

**CRITICAL:** Never expose Prisma errors, database errors, or stack traces to users.

### Data Validation (Zod Required)

**Client-side & Server-side:**
```typescript
import { z } from 'zod';

const listingSchema = z.object({
  title: z.string().min(10, 'Le titre doit contenir au moins 10 caractères'),
  price: z.number().positive('Le prix doit être positif')
});

// In API route
const result = listingSchema.safeParse(requestBody);
if (!result.success) {
  return NextResponse.json({
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Données invalides',
      details: result.error.errors
    }
  }, { status: 400 });
}
```

**CRITICAL:** Always validate input data with Zod before processing.

### State Management (React Patterns)

**Server Components:**
- Fetch data directly in Server Components
- Pass data as props to Client Components

**Client Components:**
- Use `useState` for local state
- Use `useContext` for shared state (if needed)
- Always use immutable updates

```typescript
// ✅ Good: Immutable update
setListings(prev => [...prev, newListing]);

// ❌ Bad: Direct mutation
listings.push(newListing);
```

**CRITICAL:** No Redux/Zustand for MVP. Use React built-in state management.

### Prisma Client Usage (CRITICAL)

**Singleton Pattern (MANDATORY):**
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**Usage Rules:**
- Import from `lib/prisma.ts` only
- Never create new PrismaClient instances
- Use in services only, never in API routes directly
- Always handle Prisma errors gracefully

### Socket.IO Patterns

**Event Naming:**
- Format: `namespace:action` (e.g., `chat:message`, `chat:typing`)
- Payload: `{ type: string, data: T, timestamp: string }`

**CRITICAL:** Socket.IO server runs separately. Client connects from `lib/socket.ts`.

### Authentication (NextAuth.js)

**Session Access:**
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const session = await getServerSession(authOptions);
if (!session) {
  return NextResponse.json({
    error: { code: 'UNAUTHORIZED', message: 'Non authentifié' }
  }, { status: 401 });
}
```

**CRITICAL:** Always check authentication in API routes and protected pages.

### PWA & Offline Support

**Service Worker:**
- Generated automatically by `@ducanh2912/next-pwa`
- Configured in `next.config.js`

**Offline Data:**
- Use IndexedDB for critical data (check-in info, last chat messages)
- Never store sensitive data offline

**CRITICAL:** Test offline functionality during development.

### Testing Requirements

**Test Organization:**
- Unit tests: Co-located with `*.test.ts` suffix
- Integration tests: `__tests__/` directory
- E2E tests: `tests/e2e/` directory (if using Playwright)

**Test Patterns:**
- Mock Prisma client in tests
- Use React Testing Library for component tests
- Test error handling paths

### Code Quality Rules

**ESLint:**
- Next.js ESLint config enabled
- Follow all linting rules

**Prettier:**
- Format all code before committing
- Consistent code style mandatory

**TypeScript:**
- Strict mode enabled
- No `any` types without justification
- Use Prisma generated types

---

## Anti-Patterns to Avoid

**❌ NEVER:**
1. Call Prisma directly from API routes (use services)
2. Mix naming conventions (snake_case vs camelCase)
3. Expose technical errors to users
4. Mutate state directly (always immutable)
5. Use `any` types without justification
6. Create new PrismaClient instances
7. Skip data validation with Zod
8. Hardcode API endpoints (use constants)
9. Store sensitive data in localStorage
10. Ignore TypeScript errors with `@ts-ignore`

**✅ ALWAYS:**
1. Use services for business logic
2. Follow naming conventions strictly
3. Return standardized error formats
4. Use immutable state updates
5. Define explicit types
6. Use Prisma singleton from `lib/prisma.ts`
7. Validate all input data
8. Use environment variables for config
9. Use secure storage for sensitive data
10. Fix TypeScript errors properly

---

## Common Implementation Patterns

### Creating a New API Route

```typescript
// app/api/listings/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listingService } from '@/server/services/listings/listing.service';
import { listingSchema } from '@/lib/validations';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({
        error: { code: 'UNAUTHORIZED', message: 'Non authentifié' }
      }, { status: 401 });
    }

    const listings = await listingService.getAll();
    return NextResponse.json({
      data: listings,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur est survenue'
      }
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({
        error: { code: 'UNAUTHORIZED', message: 'Non authentifié' }
      }, { status: 401 });
    }

    const body = await request.json();
    const validation = listingSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Données invalides',
          details: validation.error.errors
        }
      }, { status: 400 });
    }

    const listing = await listingService.create(validation.data, session.user.id);
    return NextResponse.json({
      data: listing
    }, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur est survenue'
      }
    }, { status: 500 });
  }
}
```

### Creating a Service

```typescript
// server/services/listings/listing.service.ts
import { prisma } from '@/lib/prisma';
import type { Listing, Prisma } from '@prisma/client';

export const listingService = {
  async getAll(): Promise<Listing[]> {
    return prisma.listing.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' }
    });
  },

  async create(data: Prisma.ListingCreateInput, userId: string): Promise<Listing> {
    return prisma.listing.create({
      data: {
        ...data,
        hostId: userId
      }
    });
  }
};
```

### Creating a React Component

```typescript
// components/features/listings/ListingCard.tsx
'use client';

import type { Listing } from '@prisma/client';
import { VerifiedBadge } from '@/components/features/verification/VerifiedBadge';

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <article className="rounded-lg border p-4">
      <VerifiedBadge isVerified={listing.isVerified} />
      <h2>{listing.title}</h2>
      {/* ... */}
    </article>
  );
}
```

---

## Environment Variables

**Required Variables:**
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: NextAuth secret key
- `NEXTAUTH_URL`: Application URL
- `STRIPE_SECRET_KEY`: Stripe API secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret
- `REDIS_URL`: Redis connection string (optional)

**CRITICAL:** Never commit `.env.local` or `.env.production` files.

---

## Quick Reference

**Import Paths:**
- Components: `@/components/...`
- Utilities: `@/lib/...`
- Types: `@/types/...`
- Services: `@/server/services/...`
- Prisma: `@/lib/prisma`

**Common Commands:**
- `npm run dev`: Start development server
- `npx prisma generate`: Generate Prisma Client
- `npx prisma migrate dev`: Run migrations
- `npx prisma studio`: Open Prisma Studio

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Reference the architecture document (`_bmad-output/planning-artifacts/architecture.md`) for detailed architectural decisions
- Update this file if new patterns emerge during implementation

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time
- Maintain consistency with architecture document

**Priority Rules (Must Follow):**

1. **TypeScript strict mode** - No `any` types without justification
2. **Naming conventions** - Strict consistency (camelCase for DB/API, PascalCase for components)
3. **Prisma singleton** - Always use `lib/prisma.ts`, never create new instances
4. **API response format** - Always use standardized format (`{ data, meta? }` or `{ error }`)
5. **Error handling** - Never expose technical errors to users
6. **Service layer** - API routes call services, services call Prisma
7. **Data validation** - Always validate with Zod before processing
8. **Copywriting validation** - All UI text must be validated by UX Designer before code review (see `_bmad-output/planning-artifacts/copywriting-process.md`)

---

**Last Updated:** 2026-01-23
**Architecture Document:** `_bmad-output/planning-artifacts/architecture.md`
**Copywriting Process:** `_bmad-output/planning-artifacts/copywriting-process.md`
**Messaging Strategy:** `_bmad-output/planning-artifacts/messaging-strategy.md` ⚠️ CRITICAL - Message principal: "Trouve une villa qui correspond à tes vibes"
**Messaging Migration Guide:** `_bmad-output/planning-artifacts/messaging-migration-guide.md` ⚠️ ACTION REQUIRED - Guide pour mettre à jour le code existant
**Status:** ✅ Complete and optimized for LLM consumption
