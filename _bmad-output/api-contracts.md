# API Contracts - Villa first v2

**Generated:** 2026-01-28  
**Base URL:** `/api`  
**Authentication:** NextAuth.js session (JWT)

## Overview

The API follows RESTful conventions with Next.js API Routes. All endpoints return JSON responses with standardized error formats.

### Response Format

**Success Response:**
```json
{
  "data": {...},
  "meta": {
    "timestamp": "2026-01-28T00:00:00.000Z",
    "count": 10
  }
}
```

**Error Response:**
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [...]
  }
}
```

## Authentication & Authorization

- **Session-based:** NextAuth.js JWT sessions
- **Middleware:** `getServerSession(authOptions)` for authentication
- **Role-based:** `tenant`, `host`, `support` roles
- **Guards:** `requireSupport()` for admin endpoints

## API Endpoints by Feature

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | User registration | No |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth.js handlers | No |

### User Profile (`/api/profile`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/profile` | Get current user profile | Yes |
| PUT | `/api/profile` | Update user profile | Yes |
| PUT | `/api/profile/vibes` | Update vibes preferences | Yes |

### Onboarding (`/api/onboarding`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/onboarding/status` | Get onboarding status | Yes |
| POST | `/api/onboarding/complete` | Complete onboarding | Yes |

### KYC (`/api/kyc`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/kyc/verify` | Initiate KYC verification | Yes |
| GET | `/api/kyc/status` | Get KYC status | Yes |
| GET | `/api/kyc/data` | Get KYC data | Yes |
| GET | `/api/kyc/verified-data` | Get verified KYC data | Yes |
| POST | `/api/webhooks/kyc` | KYC provider webhook | No (signed) |

### Listings (`/api/listings`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/listings` | List listings | Optional | - |
| POST | `/api/listings` | Create listing | Yes | host |
| GET | `/api/listings/[id]` | Get listing details | Optional | - |
| PUT | `/api/listings/[id]` | Update listing | Yes | host |
| DELETE | `/api/listings/[id]` | Delete listing | Yes | host |
| POST | `/api/listings/[id]/publish` | Publish listing | Yes | host |
| POST | `/api/listings/[id]/photos` | Upload photos | Yes | host |
| DELETE | `/api/listings/[id]/photos/[photoId]` | Delete photo | Yes | host |
| POST | `/api/listings/[id]/photos/reorder` | Reorder photos | Yes | host |
| POST | `/api/listings/[id]/video` | Upload video | Yes | host |
| PUT | `/api/listings/[id]/price` | Update price | Yes | host |
| PUT | `/api/listings/[id]/rules` | Update rules/charter | Yes | host |
| GET | `/api/listings/[id]/calendar` | Get availability calendar | Optional | - |
| POST | `/api/listings/[id]/calendar` | Create availability slot | Yes | host |
| DELETE | `/api/listings/[id]/calendar/[slotId]` | Delete availability slot | Yes | host |
| POST | `/api/listings/[id]/calendar/sync` | Sync external calendar | Yes | host |
| GET | `/api/listings/[id]/checkin-instructions` | Get check-in instructions | Yes | - |
| POST | `/api/listings/[id]/validate` | Validate listing | Yes | host |
| GET | `/api/listings/[id]/validation-rules` | Get validation rules | Yes | host |
| GET | `/api/listings/search` | Search listings | Optional | - |
| GET | `/api/listings/map` | Get listings for map view | Optional | - |
| POST | `/api/listings/compare` | Compare listings | Optional | - |

### Bookings (`/api/bookings`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/bookings` | Get user bookings | Yes | tenant |
| POST | `/api/bookings` | Create booking | Yes | tenant |
| GET | `/api/bookings/[id]` | Get booking details | Yes | - |
| POST | `/api/bookings/[id]/cancel` | Cancel booking | Yes | tenant |
| POST | `/api/bookings/[id]/checkin` | Perform check-in | Yes | tenant |
| GET | `/api/bookings/[id]/checkin-instructions` | Get check-in instructions | Yes | tenant |
| POST | `/api/bookings/[id]/incident` | Report incident | Yes | tenant |
| POST | `/api/bookings/[id]/payment/preauthorize` | Create payment preauthorization | Yes | tenant |
| GET | `/api/bookings/[id]/payment/status` | Get payment status | Yes | tenant |

### Host Bookings (`/api/host/bookings`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/host/bookings` | Get host bookings | Yes | host |
| GET | `/api/host/bookings/requests` | Get booking requests | Yes | host |
| POST | `/api/host/bookings/[id]/accept` | Accept booking request | Yes | host |
| POST | `/api/host/bookings/[id]/reject` | Reject booking request | Yes | host |

### Chat (`/api/chat`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/chat` | Get user chats | Yes |
| POST | `/api/chat/create` | Create chat | Yes |
| GET | `/api/chat/[chatId]` | Get chat details | Yes |
| GET | `/api/chat/[chatId]/message` | Get messages | Yes |
| POST | `/api/chat/[chatId]/message` | Send message | Yes |
| GET | `/api/chat/booking/[bookingId]` | Get chat for booking | Yes |

### Notifications (`/api/notifications`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/notifications/preferences` | Get notification preferences | Yes |
| PUT | `/api/notifications/preferences` | Update preferences | Yes |
| POST | `/api/notifications/push/subscribe` | Subscribe to push notifications | Yes |

### Verifications (`/api/verifications`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/api/verifications` | Submit verification request | Yes | host |
| GET | `/api/verifications/[listingId]/status` | Get verification status | Optional | - |

### Watchlist (`/api/watchlist`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/watchlist` | Get watched listings | Yes |
| POST | `/api/watchlist` | Add to watchlist | Yes |
| DELETE | `/api/watchlist` | Remove from watchlist | Yes |

### Admin (`/api/admin`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/admin/dashboard` | Admin dashboard stats | Yes | support |
| GET | `/api/admin/audit-logs` | Get audit logs | Yes | support |
| GET | `/api/admin/incidents` | List incidents | Yes | support |
| GET | `/api/admin/incidents/urgent` | Get urgent incidents | Yes | support |
| GET | `/api/admin/incidents/[id]` | Get incident details | Yes | support |
| POST | `/api/admin/incidents/[id]/acknowledge` | Acknowledge incident | Yes | support |
| POST | `/api/admin/incidents/[id]/resolve` | Resolve incident | Yes | support |
| POST | `/api/admin/incidents/[id]/close` | Close incident | Yes | support |
| GET | `/api/admin/verifications` | List verification requests | Yes | support |
| GET | `/api/admin/verifications/[id]` | Get verification details | Yes | support |
| POST | `/api/admin/verifications/[id]/approve` | Approve verification | Yes | support |
| POST | `/api/admin/verifications/[id]/reject` | Reject verification | Yes | support |
| POST | `/api/admin/verifications/[id]/suspend` | Suspend verification | Yes | support |
| POST | `/api/admin/verifications/[id]/revoke` | Revoke verification | Yes | support |
| POST | `/api/admin/listings/[id]/suspend` | Suspend listing | Yes | support |
| POST | `/api/admin/users/[id]/suspend` | Suspend user | Yes | support |
| POST | `/api/admin/bookings/[id]/refund` | Refund booking | Yes | support |
| POST | `/api/admin/bookings/[id]/relocate` | Relocate tenant | Yes | support |
| GET | `/api/admin/calendar-alerts` | Get calendar sync alerts | Yes | support |

### Cron Jobs (`/api/cron`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/cron/sync-calendars` | Sync all calendars (30min) | Bearer token |
| GET | `/api/cron/expire-preauthorizations` | Expire old preauthorizations | Bearer token |
| GET | `/api/cron/notify-matching-listings` | Notify matching listings | Bearer token |
| GET | `/api/cron/notify-available-places` | Notify available places | Bearer token |
| GET | `/api/cron/check-urgent-incidents` | Check urgent incidents | Bearer token |

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `NOT_FOUND` | 404 | Resource not found |
| `INTERNAL_ERROR` | 500 | Server error |
| `HOST_KYC_NOT_VERIFIED` | 403 | Host KYC not verified |
| `TENANT_KYC_NOT_VERIFIED` | 403 | Tenant KYC not verified |
| `DATES_NOT_AVAILABLE` | 400 | Requested dates unavailable |
| `LISTING_NOT_PUBLISHED` | 400 | Listing not published |
