# Technology Stack - Villa first v2

**Generated:** 2026-01-28

## Technology Table

| Category | Technology | Version | Justification |
|----------|-----------|---------|---------------|
| **Runtime** | Node.js | 20.x | JavaScript runtime (via Next.js) |
| **Framework** | Next.js | 16.1.4 | Full-stack React framework with App Router, Server Components, API Routes |
| **Language** | TypeScript | 5.x | Type safety, better DX, strict mode enabled |
| **UI Library** | React | 19.2.3 | Component-based UI library |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS, rapid UI development |
| **UI Components** | Radix UI | Latest | Accessible, unstyled component primitives |
| **Component Library** | shadcn/ui | Latest | Pre-built components based on Radix UI + Tailwind |
| **Database** | PostgreSQL | 18.1 | Relational database for complex data relationships |
| **ORM** | Prisma | 7.3.0 | Type-safe database access, migrations, schema management |
| **Authentication** | NextAuth.js | 4.24.13 | Production-ready authentication with session management |
| **Password Hashing** | bcryptjs | 3.0.3 | Secure password hashing |
| **Payments** | Stripe | 20.2.0 | Payment processing, PCI-DSS compliant |
| **Real-time** | Socket.IO | 4.8.3 | WebSocket-based real-time communication for chat |
| **PWA** | Serwist | 9.5.0 | Service worker management, offline support |
| **Maps** | Leaflet | 1.9.4 | Interactive maps for location features |
| **Date Handling** | date-fns | 4.1.0 | Date manipulation and formatting |
| **Validation** | Zod | 4.3.5 | Runtime schema validation for API and forms |
| **Icons** | Lucide React | 0.562.0 | Icon library |
| **Build Tool** | Next.js (Webpack) | 16.1.4 | Bundling and optimization (Turbopack not yet supported) |
| **Package Manager** | npm | Latest | Dependency management |

## Architecture Pattern

**Layered Architecture with Feature-Based Organization**

- **Presentation Layer:** Next.js App Router (Server + Client Components)
- **API Layer:** Next.js API Routes (RESTful)
- **Service Layer:** Business logic services (`server/services/`)
- **Data Access Layer:** Prisma ORM
- **Data Storage:** PostgreSQL

## Development Dependencies

| Tool | Purpose |
|------|---------|
| ESLint | Code linting with Next.js rules |
| TypeScript | Type checking |
| Prisma CLI | Database migrations and schema management |
| Serwist CLI | Service worker generation |

## External Services & Integrations

| Service | Purpose | Status |
|---------|---------|--------|
| Stripe | Payment processing | Integrated |
| KYC Provider | Identity verification | To be integrated |
| Push Notification Service | Browser push notifications | PWA API |
| Email Service | Email notifications | To be configured |
| SMS Service | SMS notifications | Optional, to be configured |
| Geolocation API | Browser Geolocation API | Native browser API |

## Performance & Optimization

- **Code Splitting:** Automatic with Next.js
- **Image Optimization:** Next.js Image component
- **Bundle Optimization:** Tree-shaking, minification
- **Caching:** Service worker caching (Serwist)
- **Database:** Connection pooling (Prisma)

## Security

- **Encryption:** TLS 1.3 (in transit), AES-256 (at rest)
- **Password Hashing:** bcryptjs
- **Authentication:** NextAuth.js with JWT sessions
- **API Security:** Rate limiting, CORS, input validation (Zod)
- **Payment Security:** PCI-DSS compliant via Stripe
