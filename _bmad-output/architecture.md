# Architecture Documentation - Villa first v2

**Generated:** 2026-01-28  
**Architecture Pattern:** Layered Architecture with Feature-Based Organization

## Executive Summary

Villa first v2 is a full-stack Next.js application following a layered architecture pattern. The application is organized by features with clear separation between presentation, API, service, and data layers.

## Technology Stack

See [Technology Stack](./technology-stack.md) for detailed information.

**Core Technologies:**
- **Framework:** Next.js 16.1.4 (App Router)
- **Language:** TypeScript 5.x (strict mode)
- **Database:** PostgreSQL 18.1
- **ORM:** Prisma 7.3.0
- **Authentication:** NextAuth.js 4.24.13
- **Payments:** Stripe 20.2.0
- **Real-time:** Socket.IO 4.8.3
- **Styling:** Tailwind CSS 4.x + Radix UI

## Architecture Pattern

### Layered Architecture

```
┌─────────────────────────────────────┐
│   Presentation Layer                │
│   (Next.js App Router)              │
│   - Server Components               │
│   - Client Components                │
│   - Pages & Layouts                 │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   API Layer                        │
│   (Next.js API Routes)             │
│   - RESTful endpoints              │
│   - Authentication                  │
│   - Input validation                │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Service Layer                     │
│   (Business Logic)                  │
│   - Feature services                │
│   - Domain logic                    │
│   - External integrations            │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Data Access Layer                 │
│   (Prisma ORM)                      │
│   - Database queries                │
│   - Migrations                      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Data Storage                      │
│   (PostgreSQL)                     │
└─────────────────────────────────────┘
```

## Component Overview

### Frontend Architecture

**Next.js App Router:**
- **Server Components:** Default, used for data fetching and rendering
- **Client Components:** Marked with `'use client'`, used for interactivity
- **Route Groups:** `(protected)` and `(public)` for route organization
- **Dynamic Routes:** `[id]` for dynamic segments

**Component Organization:**
- **Base UI:** `components/ui/` - shadcn/ui components
- **Features:** `components/features/` - Feature-specific components
- **Navigation:** `components/navigation/` - Navigation components
- **Providers:** `components/providers/` - Context providers

**State Management:**
- **Server State:** Direct data fetching in Server Components
- **Client State:** React hooks (`useState`, `useEffect`)
- **Global State:** React Context when needed (e.g., SessionProvider)

### API Architecture

**RESTful API Design:**
- **Base Path:** `/api`
- **Organization:** Feature-based (`/api/listings`, `/api/bookings`, etc.)
- **Authentication:** NextAuth.js session-based
- **Authorization:** Role-based (tenant/host/support)
- **Validation:** Zod schemas for input validation
- **Error Handling:** Standardized error format

**API Route Structure:**
```
/api/
├── auth/              # Authentication
├── profile/           # User profile
├── listings/         # Listing management
├── bookings/         # Booking management
├── chat/             # Chat APIs
├── admin/            # Admin APIs
└── cron/             # Cron jobs
```

### Service Layer

**Service Organization:**
- **Feature-based:** Each feature has its own service directory
- **Service Pattern:** Exported service object with methods
- **Error Handling:** Throws specific error messages
- **Validation:** Uses Zod schemas

**Service Structure:**
```
server/services/
├── listings/
│   ├── listing.service.ts
│   └── calendarSync.service.ts
├── bookings/
│   └── booking.service.ts
└── ...
```

### Data Architecture

**Database Schema:**
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Models:** 20+ models organized by domain
- **Relationships:** Well-defined foreign keys and indexes
- **Migrations:** Prisma Migrate for schema versioning

**Key Models:**
- `User` - User accounts with roles
- `Listing` - Colocation listings
- `Booking` - Reservations
- `Payment` - Payment/preauthorizations
- `Chat` - Masked chat conversations
- `VerificationRequest` - Host verification
- `KycVerification` - KYC status
- `CheckIn` - Check-in proofs
- `Incident` - Incident reports

See [Data Models](./data-models.md) for detailed schema.

## Data Flow

### Request Flow

1. **User Request** → Next.js App Router
2. **Authentication** → Middleware checks session
3. **Route Handler** → API route or page component
4. **Validation** → Zod schema validation
5. **Service Call** → Business logic service
6. **Database Query** → Prisma ORM
7. **Response** → JSON or rendered page

### Real-time Communication

- **Socket.IO:** Separate server for WebSocket connections
- **Use Case:** Masked chat between tenants and hosts
- **Connection:** WebSocket with HTTP polling fallback
- **Scaling:** Redis adapter for multi-server instances

## Security Architecture

### Authentication & Authorization

- **Authentication:** NextAuth.js with JWT sessions
- **Password Hashing:** bcryptjs
- **Session Management:** Database-backed sessions
- **Authorization:** Role-based access control (RBAC)
- **Guards:** Middleware and API route guards

### Data Security

- **Encryption:** TLS 1.3 (in transit), AES-256 (at rest)
- **Payment Security:** PCI-DSS compliant via Stripe
- **KYC Data:** Secure storage with retention policies
- **Audit Logs:** Complete traceability for all actions

### API Security

- **Rate Limiting:** Per-user and per-endpoint limits
- **CORS:** Configured for allowed origins
- **Input Validation:** Zod schemas for all inputs
- **Error Handling:** No sensitive data in error messages

## Performance Optimization

### Frontend

- **Code Splitting:** Automatic with Next.js
- **Image Optimization:** Next.js Image component
- **Lazy Loading:** Dynamic imports for heavy components
- **Bundle Optimization:** Tree-shaking, minification

### Backend

- **Database Indexing:** Strategic indexes on frequently queried fields
- **Connection Pooling:** Prisma connection pooling
- **Caching:** Service worker caching (PWA)
- **Query Optimization:** Efficient Prisma queries

### PWA

- **Service Worker:** Serwist for offline support
- **Caching Strategy:** Cache-first for static assets
- **Offline Support:** IndexedDB for critical data
- **Background Sync:** For offline actions

## Deployment Architecture

### Hosting

- **Frontend:** Vercel (native Next.js integration)
- **Socket.IO Server:** Separate server (Railway/Fly.io/VPS)
- **Database:** PostgreSQL hosted (Supabase/Railway/VPS)
- **Cache:** Redis (Upstash serverless or Redis Cloud)

### CI/CD

- **Vercel:** Automatic deployment from Git
- **GitHub Actions:** Pre-deployment checks (linting, type-checking)
- **Environment Management:** Vercel environment variables

### Monitoring

- **Performance:** Vercel Analytics
- **Errors:** Sentry for error tracking
- **Logging:** Vercel Logs + structured logging
- **Uptime:** External monitoring service

## Integration Points

### External Services

- **Stripe:** Payment processing
- **KYC Provider:** Identity verification (to be integrated)
- **Push Notifications:** Browser Push API
- **Email Service:** To be configured
- **SMS Service:** Optional, to be configured

### Internal Integrations

- **Socket.IO Server:** Real-time chat
- **Cron Jobs:** Scheduled tasks (calendar sync, expiration checks)
- **Webhooks:** Stripe webhooks, KYC provider webhooks

## Scalability Considerations

### Horizontal Scaling

- **Frontend:** Vercel auto-scaling
- **API:** Next.js API routes scale automatically
- **Socket.IO:** Redis adapter for multi-server
- **Database:** Connection pooling, read replicas (post-MVP)

### Performance Targets

- **FCP:** <2s
- **TTI:** <3.5s
- **Lighthouse:** ≥90/80
- **Search:** <1s
- **Payment:** <5s

## Development Workflow

See [Development Guide](./development-guide.md) for detailed instructions.

**Key Workflows:**
1. Database changes → Prisma migrations
2. API development → Route handlers + services
3. Component development → Feature components
4. Testing → Unit/integration/E2E (to be implemented)

## Future Considerations

### Post-MVP Enhancements

- **Advanced Analytics:** Analytics platform integration
- **Multi-region:** Multi-region deployment
- **Advanced Caching:** Redis caching strategies
- **Testing:** Comprehensive test suite
- **Monitoring:** Advanced monitoring and alerting
