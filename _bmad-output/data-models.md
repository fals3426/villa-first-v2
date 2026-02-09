# Data Models - Villa first v2

**Generated:** 2026-01-28  
**Database:** PostgreSQL 18.1  
**ORM:** Prisma 7.3.0

## Schema Overview

The database schema consists of 20+ models organized around core entities: Users, Listings, Bookings, Chat, Payments, and Support operations.

## Core Models

### User

**Table:** `users`

Primary user entity supporting multiple roles (tenant, host, support).

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `email` | String (unique) | User email |
| `password` | String (hashed) | Bcrypt hashed password |
| `userType` | Enum | `tenant`, `host`, `support` |
| `firstName` | String? | Optional first name |
| `lastName` | String? | Optional last name |
| `phone` | String? | Optional phone number |
| `profilePictureUrl` | String? | Profile picture URL |
| `vibesPreferences` | Json? | User vibes preferences |
| `onboardingCompleted` | Boolean | Onboarding completion status |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relationships:**
- One-to-many: `bookings`, `listings`, `chatsAsHost`, `chatsAsTenant`, `messages`
- One-to-one: `kycVerification`, `notificationPreferences`
- One-to-many: `verificationRequests`, `watchedListings`, `pushSubscriptions`

### Listing

**Table:** `listings`

Colocation listing created by hosts.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `hostId` | String | Foreign key to User |
| `title` | String | Listing title |
| `description` | String | Full description |
| `address` | String | Physical address |
| `location` | String? | Location name |
| `latitude` | Float? | GPS latitude |
| `longitude` | Float? | GPS longitude |
| `capacity` | Int | Maximum capacity |
| `listingType` | Enum | `VILLA`, `ROOM`, `SHARED_ROOM` |
| `status` | Enum | `draft`, `published`, `suspended` |
| `pricePerPlace` | Float? | Price per place |
| `rules` | Json? | House rules |
| `charter` | String? | Colocation charter |
| `completenessScore` | Int | Completeness score (0-100) |
| `videoUrl` | String? | Video URL |
| `validationRule` | Enum? | `FULL_ONLY`, `PARTIAL`, `MANUAL` |
| `validationThreshold` | Int? | Validation threshold |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relationships:**
- Many-to-one: `host` (User)
- One-to-many: `bookings`, `chats`, `photos`, `availabilitySlots`, `verificationRequests`, `watchedBy`
- One-to-one: `checkInInstruction`

### Booking

**Table:** `bookings`

Reservation made by tenants.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `listingId` | String | Foreign key to Listing |
| `tenantId` | String | Foreign key to User |
| `checkIn` | DateTime | Check-in date/time |
| `checkOut` | DateTime | Check-out date/time |
| `status` | Enum | `pending`, `confirmed`, `expired`, `cancelled`, `price_changed`, `accepted`, `rejected`, `incident_reported` |
| `currentListingPrice` | Int? | Current listing price at booking |
| `priceAtBooking` | Int? | Price at time of booking |
| `rejectionReason` | String? | Rejection reason if rejected |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relationships:**
- Many-to-one: `listing` (Listing), `tenant` (User)
- One-to-many: `checkIns`, `incidents`, `payments`

### Payment

**Table:** `payments`

Payment/preauthorization for bookings.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `bookingId` | String | Foreign key to Booking |
| `amount` | Int | Amount in cents |
| `stripePaymentIntentId` | String (unique) | Stripe payment intent ID |
| `status` | Enum | `pending`, `captured`, `expired`, `cancelled`, `failed`, `refunded` |
| `expiresAt` | DateTime? | Expiration timestamp |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relationships:**
- Many-to-one: `booking` (Booking)

### Chat

**Table:** `chats`

Masked chat between tenant and host.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `listingId` | String | Foreign key to Listing |
| `tenantId` | String | Foreign key to User |
| `hostId` | String | Foreign key to User |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relationships:**
- Many-to-one: `listing` (Listing), `tenant` (User), `host` (User)
- One-to-many: `messages`
- Unique constraint: `(listingId, tenantId, hostId)`

### Message

**Table:** `messages`

Message in a chat.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `chatId` | String | Foreign key to Chat |
| `senderId` | String | Foreign key to User |
| `content` | String | Message content |
| `createdAt` | DateTime | Creation timestamp |

**Relationships:**
- Many-to-one: `chat` (Chat), `sender` (User)

### VerificationRequest

**Table:** `verification_requests`

Host verification request for listing.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `hostId` | String | Foreign key to User |
| `listingId` | String | Foreign key to Listing |
| `status` | Enum | `pending`, `in_review`, `approved`, `rejected`, `suspended`, `revoked` |
| `reason` | String? | Rejection/suspension reason |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relationships:**
- Many-to-one: `host` (User), `listing` (Listing)
- One-to-many: `documents`

### VerificationDocument

**Table:** `verification_documents`

Documents uploaded for verification.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `verificationRequestId` | String | Foreign key to VerificationRequest |
| `storageUrl` | String | Document storage URL |
| `fileType` | String | File MIME type |
| `fileSize` | Int | File size in bytes |
| `originalFileName` | String | Original filename |
| `createdAt` | DateTime | Creation timestamp |

**Relationships:**
- Many-to-one: `verificationRequest` (VerificationRequest)

### KycVerification

**Table:** `kyc_verifications`

KYC verification status for users.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `userId` | String (unique) | Foreign key to User |
| `documentUrl` | String | KYC document URL |
| `status` | Enum | `pending`, `verified`, `rejected` |
| `provider` | String | KYC provider name |
| `providerId` | String? | Provider verification ID |
| `verifiedName` | String? | Verified name |
| `verifiedDateOfBirth` | DateTime? | Verified DOB |
| `verifiedNationality` | String? | Verified nationality |
| `retentionUntil` | DateTime? | Data retention deadline |
| `verifiedAt` | DateTime? | Verification timestamp |
| `rejectedAt` | DateTime? | Rejection timestamp |
| `rejectionReason` | String? | Rejection reason |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relationships:**
- One-to-one: `user` (User)

### CheckIn

**Table:** `check_ins`

Check-in proof with photo and GPS.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `bookingId` | String | Foreign key to Booking |
| `photoUrl` | String | Check-in photo URL |
| `latitude` | Float? | GPS latitude |
| `longitude` | Float? | GPS longitude |
| `distanceFromListing` | Float? | Distance from listing in meters |
| `createdAt` | DateTime | Creation timestamp |

**Relationships:**
- Many-to-one: `booking` (Booking)

### Incident

**Table:** `incidents`

Incident reported during check-in.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `bookingId` | String | Foreign key to Booking |
| `type` | Enum | `CODE_NOT_WORKING`, `PLACE_DIFFERENT`, `ACCESS_ISSUE`, `OTHER` |
| `description` | String | Incident description |
| `photos` | Json? | Incident photos |
| `status` | Enum | `reported`, `in_progress`, `resolved`, `closed` |
| `isUrgent` | Boolean | Urgent flag (<30min SLA) |
| `acknowledgedAt` | DateTime? | Acknowledgment timestamp |
| `acknowledgedBy` | String? | User ID who acknowledged |
| `resolvedAt` | DateTime? | Resolution timestamp |
| `resolvedBy` | String? | User ID who resolved |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relationships:**
- Many-to-one: `booking` (Booking)

### Additional Models

- **ListingPhoto:** Photos by category (KITCHEN, BEDROOM, BATHROOM, OUTDOOR, OTHER)
- **AvailabilitySlot:** Calendar availability slots
- **CheckInInstruction:** Check-in instructions for listings
- **NotificationPreferences:** User notification preferences
- **PushSubscription:** Push notification subscriptions
- **WatchedListing:** User watchlist
- **AuditLog:** Audit trail for all actions

## Indexes

Key indexes for performance:
- User: `email` (unique), `userType`
- Listing: `hostId`, `status`, `location`, `pricePerPlace`, `(latitude, longitude)`
- Booking: `listingId`, `tenantId`, `status`, `(checkIn, checkOut)`
- Chat: `listingId`, `tenantId`, `hostId`, `updatedAt`
- Payment: `bookingId`, `status`, `stripePaymentIntentId`, `expiresAt`
- Incident: `bookingId`, `status`, `(isUrgent, createdAt)`

## Enums

- **UserType:** `tenant`, `host`, `support`
- **KycStatus:** `pending`, `verified`, `rejected`
- **VerificationStatus:** `pending`, `in_review`, `approved`, `rejected`, `suspended`, `revoked`
- **ListingStatus:** `draft`, `published`, `suspended`
- **ListingType:** `VILLA`, `ROOM`, `SHARED_ROOM`
- **PhotoCategory:** `KITCHEN`, `BEDROOM`, `BATHROOM`, `OUTDOOR`, `OTHER`
- **BookingStatus:** `pending`, `confirmed`, `expired`, `cancelled`, `price_changed`, `accepted`, `rejected`, `incident_reported`
- **PaymentStatus:** `pending`, `captured`, `expired`, `cancelled`, `failed`, `refunded`
- **ValidationRule:** `FULL_ONLY`, `PARTIAL`, `MANUAL`
- **IncidentType:** `CODE_NOT_WORKING`, `PLACE_DIFFERENT`, `ACCESS_ISSUE`, `OTHER`
- **IncidentStatus:** `reported`, `in_progress`, `resolved`, `closed`
