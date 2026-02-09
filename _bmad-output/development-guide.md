# Development Guide - Villa first v2

**Generated:** 2026-01-28

## Prerequisites

- **Node.js:** 20.x or later
- **npm:** Latest version
- **PostgreSQL:** 18.1 or later
- **Git:** Latest version

## Environment Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd villa-first-v2
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create `.env.local` file in project root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/villa_first"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# KYC Provider (optional)
KYC_PROVIDER_API_KEY="your-kyc-api-key"

# Socket.IO Server (if separate)
SOCKET_IO_SERVER_URL="http://localhost:3001"

# Cron Jobs
CRON_SECRET="your-cron-secret"

# Optional: Email/SMS services
EMAIL_SERVICE_API_KEY="..."
SMS_SERVICE_API_KEY="..."
```

### 4. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

## Development Commands

### Start Development Server

```bash
npm run dev
```

Opens at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npx tsc --noEmit
```

## Project Structure

```
villa-first-v2/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (protected)/       # Protected routes
│   │   ├── (public)/          # Public routes
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/               # Base UI components
│   │   ├── features/         # Feature components
│   │   └── navigation/       # Navigation
│   ├── lib/                  # Utilities
│   │   ├── validations/     # Zod schemas
│   │   └── middleware/      # Auth guards
│   ├── server/              # Server-side services
│   ├── hooks/               # Custom hooks
│   └── types/               # TypeScript types
├── prisma/
│   └── schema.prisma        # Database schema
├── public/                  # Static assets
└── scripts/                 # Utility scripts
```

## Development Workflow

### 1. Database Changes

```bash
# Edit prisma/schema.prisma
# Generate migration
npx prisma migrate dev --name migration_name
# Prisma Client auto-regenerates
```

### 2. API Route Development

1. Create route file: `src/app/api/[feature]/route.ts`
2. Add authentication: `getServerSession(authOptions)`
3. Add validation: Zod schemas from `lib/validations/`
4. Call service: `server/services/[feature]/[feature].service.ts`
5. Return JSON: Standardized response format

### 3. Component Development

1. Create component: `src/components/features/[feature]/[Component].tsx`
2. Mark client component: `'use client'` if needed
3. Use UI components: From `components/ui/`
4. Add types: TypeScript interfaces
5. Handle loading/error states

### 4. Service Development

1. Create service: `src/server/services/[feature]/[feature].service.ts`
2. Use Prisma: `import { prisma } from '@/lib/prisma'`
3. Add error handling: Throw specific error messages
4. Add validation: Use Zod schemas

## Testing Strategy

### Unit Tests (To be implemented)

```bash
# Run tests
npm test

# Watch mode
npm test -- --watch
```

### Integration Tests (To be implemented)

```bash
# Run integration tests
npm run test:integration
```

### E2E Tests (To be implemented)

```bash
# Run E2E tests
npm run test:e2e
```

## Code Style

### TypeScript

- **Strict mode:** Enabled
- **No `any`:** Use proper types
- **Interfaces:** Prefer interfaces over types for objects
- **Enums:** Use enums for constants

### React

- **Server Components:** Default, use for data fetching
- **Client Components:** Only when needed (`'use client'`)
- **Hooks:** Use custom hooks for reusable logic
- **Props:** Define prop types with TypeScript

### File Naming

- **Components:** PascalCase (`ListingCard.tsx`)
- **Utilities:** camelCase (`utils.ts`)
- **Services:** camelCase (`listing.service.ts`)
- **Types:** camelCase (`listing.types.ts`)

## Common Development Tasks

### Add New API Endpoint

1. Create route: `src/app/api/[feature]/route.ts`
2. Export handler: `export async function GET/POST/PUT/DELETE`
3. Add authentication
4. Add validation
5. Call service
6. Return response

### Add New Database Model

1. Edit `prisma/schema.prisma`
2. Add model definition
3. Run migration: `npx prisma migrate dev`
4. Generate client: `npx prisma generate`

### Add New Component

1. Create file: `src/components/features/[feature]/[Component].tsx`
2. Import UI components: From `components/ui/`
3. Add types: TypeScript interfaces
4. Export component: `export function ComponentName`

### Add New Service

1. Create file: `src/server/services/[feature]/[feature].service.ts`
2. Import Prisma: `import { prisma } from '@/lib/prisma'`
3. Export service object: `export const featureService = { ... }`
4. Add error handling

## Debugging

### Database

```bash
# Open Prisma Studio
npx prisma studio

# View database schema
npx prisma db pull
```

### API Routes

- Check browser Network tab
- Check server logs in terminal
- Use Postman/Insomnia for testing

### Components

- React DevTools extension
- Next.js DevTools
- Browser console for errors

## Deployment

### Vercel (Recommended)

1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically on push

### Manual Deployment

```bash
# Build
npm run build

# Start
npm start
```

### Database Migrations in Production

```bash
# Run migrations
npx prisma migrate deploy
```

## Troubleshooting

### Prisma Client Not Found

```bash
npx prisma generate
```

### Type Errors

```bash
# Regenerate types
npx tsc --noEmit
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Database Connection Issues

- Check `DATABASE_URL` in `.env.local`
- Verify PostgreSQL is running
- Check connection string format

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)
- [Zod Documentation](https://zod.dev/)
