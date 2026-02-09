# Villa first v2 - Project Documentation Index

**Generated:** 2026-01-28  
**Project Type:** Web Application (Next.js Full-Stack)  
**Architecture:** Monolith  
**Status:** Active Development

## Project Overview

Villa first v2 est une plateforme de mise en relation pour des colocations, permettant aux hôtes de créer et gérer des annonces de colocation et aux locataires de rechercher, réserver et gérer leurs séjours.

**Quick Reference:**

- **Type:** Monolith Web Application
- **Primary Language:** TypeScript
- **Architecture:** Layered Architecture with Feature-Based Organization
- **Framework:** Next.js 16.1.4 (App Router)
- **Database:** PostgreSQL 18.1 + Prisma 7.3.0
- **Entry Point:** `src/app/layout.tsx`
- **API Base:** `/api/*`

## Generated Documentation

### Core Documentation

- [Project Overview](./project-overview.md) - Executive summary and project context
- [Architecture](./architecture.md) - Complete architecture documentation
- [Technology Stack](./technology-stack.md) - Detailed technology breakdown
- [Source Tree Analysis](./source-tree-analysis.md) - Directory structure and organization

### Technical Documentation

- [API Contracts](./api-contracts.md) - Complete API endpoint documentation
- [Data Models](./data-models.md) - Database schema and models
- [Component Inventory](./component-inventory.md) - React component catalog
- [Development Guide](./development-guide.md) - Setup and development instructions

## Existing Documentation

### Planning Artifacts

Located in `_bmad-output/planning-artifacts/`:

- `prd.md` - Product Requirements Document
- `architecture.md` - Architecture decision document (planning phase)
- `ux-design-specification.md` - UX design specifications
- `epics.md` - Epic and story breakdown
- `implementation-readiness-report-2026-01-20.md` - Implementation readiness

### Implementation Artifacts

Located in `_bmad-output/implementation-artifacts/`:

- Multiple story implementation documents
- Test reports and guides
- Migration guides
- Progress reports

## Getting Started

### For Developers

1. **Setup:** Follow [Development Guide](./development-guide.md)
2. **Architecture:** Review [Architecture](./architecture.md)
3. **API:** Check [API Contracts](./api-contracts.md)
4. **Database:** See [Data Models](./data-models.md)

### For AI-Assisted Development

This documentation serves as the primary context for AI-assisted development:

- **Architecture decisions:** See [Architecture](./architecture.md)
- **API endpoints:** See [API Contracts](./api-contracts.md)
- **Database schema:** See [Data Models](./data-models.md)
- **Component structure:** See [Component Inventory](./component-inventory.md)
- **Code organization:** See [Source Tree Analysis](./source-tree-analysis.md)

## Project Structure Summary

```
villa-first-v2/
├── src/
│   ├── app/              # Next.js App Router (routes + API)
│   ├── components/       # React components
│   ├── lib/             # Utilities, validations, middleware
│   ├── server/          # Server-side services
│   ├── hooks/           # Custom React hooks
│   └── types/           # TypeScript types
├── prisma/              # Database schema
├── public/              # Static assets
└── scripts/             # Utility scripts
```

## Key Features

1. **User Management & Authentication** - Multi-role system with progressive KYC
2. **Host Verification & Trust** - Document upload and verification workflow
3. **Listing Management** - CRUD operations with photos, calendar, pricing
4. **Search & Discovery** - Location-based search with filters
5. **Booking & Payment** - Reservation flow with Stripe integration
6. **Communication** - Masked chat system with notifications
7. **Check-in & Verification** - GPS + photo check-in with incident reporting
8. **Support & Operations** - Admin dashboard with incident management

## Technology Highlights

- **Frontend:** Next.js 16.1.4, React 19.2.3, Tailwind CSS 4.x
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL 18.1
- **Authentication:** NextAuth.js 4.24.13
- **Payments:** Stripe 20.2.0
- **Real-time:** Socket.IO 4.8.3
- **PWA:** Serwist 9.5.0

## Quick Links

- **API Documentation:** [API Contracts](./api-contracts.md)
- **Database Schema:** [Data Models](./data-models.md)
- **Component Library:** [Component Inventory](./component-inventory.md)
- **Development Setup:** [Development Guide](./development-guide.md)
- **Architecture Details:** [Architecture](./architecture.md)

---

**Note:** This documentation is generated from codebase analysis. For planning artifacts and implementation stories, see `_bmad-output/planning-artifacts/` and `_bmad-output/implementation-artifacts/`.
