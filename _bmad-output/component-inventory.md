# Component Inventory - Villa first v2

**Generated:** 2026-01-28

## Component Organization

Components are organized by feature area under `src/components/`:

```
components/
├── ui/              # Base UI components (shadcn/ui)
├── features/        # Feature-specific components
├── navigation/      # Navigation components
├── providers/       # Context providers
└── admin/          # Admin-specific components
```

## Base UI Components (`components/ui/`)

These are shadcn/ui components based on Radix UI primitives:

| Component | Purpose | Source |
|-----------|---------|--------|
| `alert.tsx` | Alert/notification component | shadcn/ui |
| `badge.tsx` | Badge component | shadcn/ui |
| `button.tsx` | Button component | shadcn/ui |
| `card.tsx` | Card container | shadcn/ui |
| `checkbox.tsx` | Checkbox input | shadcn/ui |
| `dialog.tsx` | Modal dialog | shadcn/ui |
| `input.tsx` | Text input | shadcn/ui |
| `label.tsx` | Form label | shadcn/ui |
| `offline-indicator.tsx` | Offline status indicator | Custom |
| `progress.tsx` | Progress bar | shadcn/ui |
| `select.tsx` | Select dropdown | shadcn/ui |
| `slider.tsx` | Range slider | shadcn/ui |
| `tabs.tsx` | Tab navigation | shadcn/ui |
| `textarea.tsx` | Textarea input | shadcn/ui |

## Feature Components (`components/features/`)

### Booking Components

| Component | Purpose | Location |
|-----------|---------|----------|
| `BookingForm.tsx` | Booking creation form | `features/booking/` |
| `BookingRequestCard.tsx` | Booking request card | `features/booking/` |
| `BookingRequestsList.tsx` | List of booking requests | `features/booking/` |
| `BookingsList.tsx` | User bookings list | `features/booking/` |
| `HostBookingsList.tsx` | Host bookings list | `features/booking/` |
| `PaymentFlow.tsx` | Payment/preauthorization flow | `features/booking/` |

### Chat Components

| Component | Purpose | Location |
|-----------|---------|----------|
| `ChatButton.tsx` | Chat trigger button | `features/chat/` |
| `MaskedChat.tsx` | Masked chat interface | `features/chat/` |

### Check-in Components

| Component | Purpose | Location |
|-----------|---------|----------|
| `CheckInForm.tsx` | Check-in form with photo/GPS | `features/checkin/` |
| `CheckInInstructions.tsx` | Display check-in instructions | `features/checkin/` |
| `CheckInInstructionsEditor.tsx` | Edit check-in instructions | `features/checkin/` |
| `IncidentReportForm.tsx` | Report incident form | `features/checkin/` |

### KYC Components

| Component | Purpose | Location |
|-----------|---------|----------|
| `DocumentUpload.tsx` | KYC document upload | `features/kyc/` |

### Listing Components

| Component | Purpose | Location |
|-----------|---------|----------|
| `ComparisonView.tsx` | Listing comparison view | `features/listings/` |
| `ListingCalendarSection.tsx` | Calendar availability section | `features/listings/` |
| `ListingCard.tsx` | Listing card display | `features/listings/` |
| `ListingCompletenessIndicator.tsx` | Completeness score indicator | `features/listings/` |
| `ListingForm.tsx` | Create/edit listing form | `features/listings/` |
| `ListingList.tsx` | Listings list view | `features/listings/` |
| `ListingPhotosSection.tsx` | Photo management section | `features/listings/` |
| `ListingPriceSection.tsx` | Price management section | `features/listings/` |
| `ListingPublishButton.tsx` | Publish listing button | `features/listings/` |
| `ListingRulesSection.tsx` | Rules/charter section | `features/listings/` |
| `ListingVideoSection.tsx` | Video upload section | `features/listings/` |
| `ValidationRulesSection.tsx` | Validation rules section | `features/listings/` |

### Notification Components

| Component | Purpose | Location |
|-----------|---------|----------|
| `NotificationPreferences.tsx` | Notification settings | `features/notifications/` |

### Onboarding Components

| Component | Purpose | Location |
|-----------|---------|----------|
| `VibesQuestionnaire.tsx` | Vibes preferences questionnaire | `features/onboarding/` |

### Profile Components

| Component | Purpose | Location |
|-----------|---------|----------|
| `ImageUpload.tsx` | Profile image upload | `features/profile/` |

### Search Components

| Component | Purpose | Location |
|-----------|---------|----------|
| `BudgetFilter.tsx` | Budget range filter | `features/search/` |
| `ComparisonBadge.tsx` | Comparison badge indicator | `features/search/` |
| `MapView.tsx` | Map view wrapper | `features/search/` |
| `MapViewContent.tsx` | Map content component | `features/search/` |
| `SearchBar.tsx` | Search input bar | `features/search/` |
| `VibesFilter.tsx` | Vibes filter component | `features/search/` |
| `ViewToggle.tsx` | Toggle between list/map view | `features/search/` |

### Verification Components

| Component | Purpose | Location |
|-----------|---------|----------|
| `VerificationUploadForm.tsx` | Verification document upload | `features/verification/` |
| `VerifiedBadge.tsx` | Verified badge display | `features/verification/` |

### Vibes Components

| Component | Purpose | Location |
|-----------|---------|----------|
| `VibeTag.tsx` | Vibe tag display | `features/vibes/` |

## Navigation Components (`components/navigation/`)

| Component | Purpose |
|-----------|---------|
| `MainNavigation.tsx` | Main navigation bar with role-based menu |

## Provider Components (`components/providers/`)

| Component | Purpose |
|-----------|---------|
| `SessionProvider.tsx` | NextAuth session provider wrapper |

## Admin Components (`components/admin/`)

| Component | Purpose |
|-----------|---------|
| `AdminNavigation.tsx` | Admin navigation bar |
| `AuditLogsList.tsx` | Audit logs list |
| `DashboardStats.tsx` | Admin dashboard statistics |
| `IncidentDetail.tsx` | Incident detail view |
| `IncidentsList.tsx` | Incidents list |

## Component Patterns

### Server vs Client Components

- **Server Components:** Default in Next.js App Router, used for data fetching
- **Client Components:** Marked with `'use client'`, used for interactivity

### State Management

- **Server Components:** Direct data fetching, no state
- **Client Components:** React hooks (`useState`, `useEffect`)
- **Global State:** React Context when needed (e.g., SessionProvider)

### Form Handling

- **Validation:** Zod schemas (`lib/validations/`)
- **Form State:** React hooks or form libraries
- **API Calls:** Server Actions or API routes

### Styling

- **Framework:** Tailwind CSS utility classes
- **Components:** Radix UI primitives styled with Tailwind
- **Design System:** Consistent spacing, colors, typography via Tailwind config

## Reusable Patterns

1. **Card Components:** Consistent card layout for listings, bookings, etc.
2. **Form Components:** Standardized form inputs with validation
3. **Loading States:** Skeleton loaders and loading indicators
4. **Error States:** Error message displays
5. **Empty States:** Empty state messages for lists
6. **Offline Support:** Offline indicators and cached data display
