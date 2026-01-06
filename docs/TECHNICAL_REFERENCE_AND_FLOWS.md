# ShopMarkets Technical Reference & Critical Flows

**Status:** Live Working State (as of Jan 2026)
**Purpose:** Reference for critical system flows to prevent regression bugs.

---

## 1. Authentication Flow (Critical)

The authentication system uses a 2-step process (2FA) and JWT tokens.

### Step 1: Credentials
- **Frontend:** `authService.loginStep1(email, password, fingerprint)`
- **Backend:** `/api/auth/login`
- **Logic:** Checks credentials. Returns `{ userId, requires2FA: true }` or `{ token, ... }` if device trusted.

### Step 2: Verification (2FA)
- **Frontend:** `authService.loginStep2(userId, code, trustDevice, fingerprint)`
- **Backend:** `/api/auth/verify-2fa`
- **Payload:** `{ userId, code, trustDevice, deviceFingerprint }`
- **Logic:** Verifies code from `verification_codes` table.
- **Return:** `{ token, user, session }`
- **Important:** This function MUST handle the token setting in local storage or state.

### User Object Structure
The Frontend expects the User object to look like this (defined in `types/auth.ts`):
```typescript
interface User {
    id: string;
    email: string;
    fullName?: string;
    isVerified?: boolean;
    is_avv_signed?: boolean; // Critical for AVV Modal logic
}
```

### Logout
- **Frontend:** `authService.logout()`
- **Mechanism:**
    1. `removeToken()` (clears localStorage 'auth_token').
    2. Try clearing Zudstand store (`useAuthStore`).
    3. `finally { window.location.href = '/login' }` (Force Redirect).

---

## 2. API Endpoints (Service: API)

Backend: `services/api`
Port: `4000`
Middleware: `authenticateToken` (Checks JWT Secret)

| Context | Endpoint Path | Frontend Service | Notes |
| :--- | :--- | :--- | :--- |
| **Sync** | `/api/sync/logs` | `syncService.getLogs()` | Returns array of sync logs |
| **Billing** | `/api/billing/credits/:userId` | `billingService.getCredits()` | Returns credits & plan |
| **Dashboard** | `/api/dashboard/stats` | `dashboardService.getStats()` | Returns stats (products/connections) |

**Important:** All these endpoints require the `Authorization: Bearer <token>` header in axios.

---

## 3. Frontend Architecture

### State Management (Zustand)
- **Store:** `services/dashboard/store/authStore.ts`
- **Persist:** Uses `persist` middleware to `localStorage`.
- **Note:** Avoid circular dependencies! Do not import `authService` into `authStore` just for types. Use `types/auth.ts`.

---

## 4. Current Configuration Secrets (Hardcoded Fallbacks)
*Used to resolve ENV mismatches in Coolify*

- **JWT Secret:** Matches `ShopMarkets_JWT_Secret_2026_...` (Safe to use in API middleware if ENV fails).

---

## 5. Known Pitfalls (Do Not Repeat)
1. **Circular Dependencies:** Never import `User` type from `authService.ts` into `authStore.ts`.
2. **Missing Functions:** Do not use bulk delete/replace on `authService.ts` without checking for `loginStep2`.
3. **API Paths:** Ensure Frontend path matches `server.js` route definition exactly (e.g., `/api/sync/logs` vs `/api/sync-logs`).
