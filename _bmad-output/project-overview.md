# Villa first v2 - Project Overview

**Generated:** 2026-01-28  
**Project Type:** Web Application (Next.js Full-Stack)  
**Architecture:** Monolith  
**Status:** Active Development

## Executive Summary

Villa first v2 est une plateforme de mise en relation pour des colocations, permettant aux hôtes de créer et gérer des annonces de colocation et aux locataires de rechercher, réserver et gérer leurs séjours. La plateforme inclut des fonctionnalités avancées de vérification, de paiement, de communication en temps réel et de gestion de check-in.

## Technology Stack Summary

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | Next.js | 16.1.4 | Full-stack React framework with App Router |
| **Language** | TypeScript | 5.x | Type-safe development |
| **Database** | PostgreSQL | 18.1 | Primary database |
| **ORM** | Prisma | 7.3.0 | Database access and migrations |
| **Authentication** | NextAuth.js | 4.24.13 | Authentication and session management |
| **Payments** | Stripe | 20.2.0 | Payment processing |
| **Real-time** | Socket.IO | 4.8.3 | Real-time chat communication |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS framework |
| **UI Components** | Radix UI (via shadcn/ui) | Latest | Accessible component primitives |
| **PWA** | Serwist | 9.5.0 | Progressive Web App support |
| **Maps** | Leaflet | 1.9.4 | Interactive maps |
| **Validation** | Zod | 4.3.5 | Runtime schema validation |

## Architecture Type

**Pattern:** Layered Architecture with Feature-Based Organization

- **Frontend Layer:** Next.js App Router with Server and Client Components
- **API Layer:** RESTful API routes under `app/api/`
- **Service Layer:** Business logic in `server/services/`
- **Data Layer:** Prisma ORM with PostgreSQL

## Repository Structure

**Type:** Monolith  
**Organization:** Feature-based with clear separation of concerns

```
villa-first-v2/
├── src/
│   ├── app/              # Next.js App Router (routes + API)
│   ├── components/       # React components (UI + features)
│   ├── lib/             # Utilities, validations, middleware
│   ├── server/          # Server-side services
│   ├── hooks/           # Custom React hooks
│   └── types/           # TypeScript type definitions
├── prisma/              # Database schema and migrations
├── public/              # Static assets and PWA files
└── scripts/             # Utility scripts
```

## Key Features

1. **User Management & Authentication**
   - Multi-role system (tenant/host/support)
   - Progressive KYC verification
   - Profile management

2. **Host Verification & Trust**
   - Document upload (title deeds, mandates)
   - Manual verification workflow
   - Verified badge system

3. **Listing Management**
   - CRUD operations for listings
   - Photo/video upload by category
   - Completeness scoring
   - Calendar management with sync
   - Pricing management

4. **Search & Discovery**
   - Location-based search
   - Budget and vibes filtering
   - Trust map with geolocation
   - Comparison features

5. **Booking & Payment**
   - Reservation flow
   - Price validation
   - Stripe payment processing (25€ + preauthorization)
   - Offline payment support

6. **Communication**
   - Masked chat system
   - Push/email/SMS notifications
   - Notification preferences

7. **Check-in & Verification**
   - GPS + photo check-in
   - Offline access to instructions
   - Incident reporting

8. **Support & Operations**
   - Admin dashboard
   - Incident management (urgent <30min)
   - Fraud handling
   - Complete audit trails

## Entry Points

- **Web Application:** `http://localhost:3000` (development)
- **API Base:** `/api/*`
- **Main Layout:** `src/app/layout.tsx`
- **Home Page:** `src/app/page.tsx`

## Links to Detailed Documentation

- [Architecture Documentation](./architecture.md)
- [API Contracts](./api-contracts.md)
- [Data Models](./data-models.md)
- [Component Inventory](./component-inventory.md)
- [Development Guide](./development-guide.md)
- [Source Tree Analysis](./source-tree-analysis.md)
