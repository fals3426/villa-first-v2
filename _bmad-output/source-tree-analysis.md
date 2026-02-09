# Source Tree Analysis - Villa first v2

**Generated:** 2026-01-28

## Project Root Structure

```
villa-first-v2/
├── .gitignore                 # Git ignore rules
├── components.json            # shadcn/ui configuration
├── eslint.config.mjs          # ESLint configuration
├── middleware.ts              # Next.js middleware (auth)
├── next.config.ts             # Next.js configuration
├── package.json               # Dependencies and scripts
├── package-lock.json          # Locked dependencies
├── postcss.config.mjs         # PostCSS configuration
├── prisma.config.ts           # Prisma configuration
├── README.md                  # Project README
├── tsconfig.json              # TypeScript configuration
│
├── prisma/                    # Database schema and migrations
│   └── schema.prisma          # Prisma schema definition
│
├── public/                    # Static assets
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker (generated)
│   └── icons/                 # PWA icons
│
├── scripts/                    # Utility scripts
│   └── seed-test-data.sql     # Database seed script
│
└── src/                       # Source code
    ├── app/                   # Next.js App Router
    ├── components/           # React components
    ├── hooks/                # Custom React hooks
    ├── lib/                  # Utilities and helpers
    ├── server/               # Server-side services
    └── types/                # TypeScript type definitions
```

## Source Code Structure (`src/`)

### App Router (`src/app/`)

```
app/
├── layout.tsx                 # Root layout
├── page.tsx                   # Home page
├── globals.css                # Global styles
├── favicon.ico                # Favicon
├── sw.ts                      # Service worker source
│
├── (protected)/               # Protected route group
│   ├── dashboard/            # User dashboard
│   ├── host/                 # Host-specific routes
│   │   ├── dashboard/       # Host dashboard
│   │   ├── listings/        # Host listings management
│   │   └── bookings/        # Host bookings
│   ├── bookings/            # Tenant bookings
│   ├── chat/                 # Chat interface
│   ├── settings/             # User settings
│   └── ui-showcase/          # UI component showcase
│
└── api/                      # API routes
    ├── auth/                 # Authentication
    ├── profile/              # User profile
    ├── onboarding/          # Onboarding flow
    ├── kyc/                 # KYC verification
    ├── listings/            # Listing management
    ├── bookings/            # Booking management
    ├── host/                # Host-specific APIs
    ├── chat/                # Chat APIs
    ├── notifications/       # Notifications
    ├── verifications/       # Verification requests
    ├── watchlist/           # Watchlist
    ├── admin/               # Admin APIs
    ├── cron/                # Cron jobs
    └── webhooks/            # Webhook handlers
```

### Components (`src/components/`)

```
components/
├── ui/                       # Base UI components (shadcn/ui)
│   ├── alert.tsx
│   ├── badge.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── checkbox.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── offline-indicator.tsx
│   ├── progress.tsx
│   ├── select.tsx
│   ├── slider.tsx
│   ├── tabs.tsx
│   └── textarea.tsx
│
├── features/                  # Feature-specific components
│   ├── booking/             # Booking components
│   ├── chat/                # Chat components
│   ├── checkin/             # Check-in components
│   ├── kyc/                 # KYC components
│   ├── listings/            # Listing components
│   ├── notifications/       # Notification components
│   ├── onboarding/          # Onboarding components
│   ├── profile/             # Profile components
│   ├── search/              # Search components
│   ├── verification/        # Verification components
│   └── vibes/               # Vibes components
│
├── navigation/               # Navigation components
│   └── MainNavigation.tsx
│
├── providers/                # Context providers
│   └── SessionProvider.tsx
│
└── admin/                    # Admin components
    ├── AdminNavigation.tsx
    ├── AuditLogsList.tsx
    ├── DashboardStats.tsx
    ├── IncidentDetail.tsx
    └── IncidentsList.tsx
```

### Libraries (`src/lib/`)

```
lib/
├── auth.ts                   # NextAuth configuration
├── prisma.ts                 # Prisma client singleton
├── stripe.ts                 # Stripe client
├── socket.ts                 # Socket.IO client
├── utils.ts                  # Utility functions
├── constants.ts              # App constants
│
├── validations/              # Zod validation schemas
│   ├── auth.schema.ts
│   ├── booking.schema.ts
│   ├── calendar.schema.ts
│   ├── chat.schema.ts
│   ├── checkin.schema.ts
│   ├── compare.schema.ts
│   ├── incident.schema.ts
│   ├── kyc.schema.ts
│   ├── listing.schema.ts
│   ├── notification.schema.ts
│   ├── payment.schema.ts
│   ├── photo.schema.ts
│   ├── price.schema.ts
│   ├── profile.schema.ts
│   ├── rules.schema.ts
│   ├── search.schema.ts
│   ├── validation.schema.ts
│   └── vibes.schema.ts
│
├── middleware/               # Middleware functions
│   ├── kyc-guard.ts         # KYC verification guard
│   └── support-guard.ts     # Support role guard
│
├── kyc/                      # KYC provider integration
│   └── provider.ts
│
└── verification/             # Verification utilities
    └── listing-verification.ts
```

### Server Services (`src/server/services/`)

```
server/services/
├── auth/                     # Authentication services
│   └── user.service.ts
│
├── bookings/                 # Booking services
│   └── booking.service.ts
│
├── chat/                     # Chat services
│   └── chat.service.ts
│
├── checkin/                  # Check-in services
│   └── checkin.service.ts
│
├── kyc/                      # KYC services
│   ├── kyc.service.ts
│   └── kyc-deletion.service.ts
│
├── listings/                 # Listing services
│   ├── listing.service.ts
│   └── calendarSync.service.ts
│
├── notifications/            # Notification services
│   └── notification.service.ts
│
├── payments/                 # Payment services
│   └── payment.service.ts
│
├── support/                  # Support/admin services
│   ├── calendar-alert.service.ts
│   ├── relocation.service.ts
│   └── support.service.ts
│
├── user/                     # User services
│   ├── onboarding.service.ts
│   └── profile.service.ts
│
└── verification/              # Verification services
    └── verification.service.ts
```

### Hooks (`src/hooks/`)

```
hooks/
├── useComparison.ts          # Listing comparison hook
└── useOffline.ts             # Offline detection hook
```

### Types (`src/types/`)

```
types/
├── kyc.types.ts             # KYC type definitions
├── listing.types.ts          # Listing type definitions
├── next-auth.d.ts            # NextAuth type extensions
└── vibes.types.ts            # Vibes type definitions
```

## Critical Directories

### Entry Points

- **Main Layout:** `src/app/layout.tsx` - Root layout with providers
- **Home Page:** `src/app/page.tsx` - Landing page
- **Middleware:** `middleware.ts` - Authentication middleware
- **API Base:** `src/app/api/` - All API routes

### Key Directories

1. **`src/app/api/`** - All REST API endpoints
2. **`src/server/services/`** - Business logic layer
3. **`src/components/features/`** - Feature components
4. **`src/lib/validations/`** - Input validation schemas
5. **`prisma/schema.prisma`** - Database schema

### Integration Points

- **Authentication:** `src/lib/auth.ts` + `middleware.ts`
- **Database:** `src/lib/prisma.ts` + `prisma/schema.prisma`
- **Payments:** `src/lib/stripe.ts` + `src/server/services/payments/`
- **Real-time:** `src/lib/socket.ts` + Socket.IO server
- **PWA:** `src/app/sw.ts` + `public/sw.js`

## File Patterns

- **API Routes:** `src/app/api/[feature]/route.ts` or `src/app/api/[feature]/[id]/route.ts`
- **Components:** `src/components/features/[feature]/[Component].tsx`
- **Services:** `src/server/services/[feature]/[feature].service.ts`
- **Validations:** `src/lib/validations/[feature].schema.ts`
- **Types:** `src/types/[feature].types.ts`

## Build Output

- **`.next/`** - Next.js build output (gitignored)
- **`public/sw.js`** - Generated service worker
- **`node_modules/`** - Dependencies (gitignored)
