# Security Specification — Gás da 7 Firestore Rules

## 1. Data Invariants
1. **Default-Deny Baseline**: Every path not explicitly matched is denied (`match /{document=**} { allow read, write: if false; }`).
2. **PII Isolation on `/orders/{orderId}`**: Orders contain customer PII (`clientName`, `clientPhone`, `address`). Public/unauthenticated users and non-admin authenticated users can NEVER `get`, `list`, `update`, or `delete` any order. Only verified administrators (`isAdmin()`) may read, update status, or delete orders.
3. **Validated Public Order Submission**: Customers placing orders on `/` or `/pedido` may only `create` a document in `/orders/{orderId}` if:
   - `orderId` passes `isValidId(orderId)` (`^[a-zA-Z0-9_\-]+$`, <= 128 chars).
   - Exact schema keys match (`hasAll` and `hasOnly` the 15 defined fields — zero shadow fields).
   - All strings have explicit minimum and maximum lengths; `orderNumber` matches `^#G7-[0-9]{4}-[0-9]{4}$`; `orderDate` matches `^[0-9]{4}-[0-9]{2}-[0-9]{2}$`.
   - `quantity` is an integer between `1` and `20`.
   - `status` MUST be `'novo'` on creation.
   - `createdAt == request.time` and `updatedAt == request.time`.
4. **Immutable Order Details & Action-Based Status Updates**: Admins updating an order can ONLY update `['status', 'updatedAt']` with `updatedAt == request.time` and valid status enum (`novo`, `em_rota`, `entregue`, `cancelado`), preserving all original customer/order fields immutably.
5. **Admin RBAC Integrity on `/admins/{adminId}`**:
   - Only verified admins (bootstrapped owner `andeloy@gmail.com` with `email_verified == true`, or an existing `/admins/{uid}` document for a verified user) can list, create, or delete admin records.
   - Self-assignment of admin privileges is strictly impossible.
   - Users may only `get` their own `/admins/{uid}` document to verify their own authorization state.

## 2. The "Dirty Dozen" Adversarial Payloads (All Must Return PERMISSION_DENIED)
1. **Unauthenticated Order Read (`get`)**: Public visitor tries to read `/orders/order-123`.
2. **Unauthenticated Order List (`list`)**: Public visitor tries to scrape `/orders`.
3. **Non-Admin Authenticated Order List**: Signed-in Google user (`attacker@gmail.com`) tries to list `/orders`.
4. **Unverified Admin Email Spoof**: User with email `andeloy@gmail.com` and `email_verified: false` tries to list `/orders`.
5. **Shadow Field Injection on Create**: Public customer creates `/orders/ord-1` with extra ghost field `isAdmin: true` or `discount: 99`.
6. **Status Shortcutting on Create**: Public customer creates `/orders/ord-2` with `status: "entregue"` instead of `"novo"`.
7. **Timestamp Forgery on Create**: Public customer creates `/orders/ord-3` with client-supplied past timestamp instead of `request.time`.
8. **ID Poisoning on Create**: Attacker tries to create `/orders/` with a 200-char or symbol-injected document ID (`ord$%../hack`).
9. **Resource Exhaustion / Oversized String**: Attacker submits a 2,000-character `clientName` or `notes` payload.
10. **Quantity Out-of-Bounds / Type Poisoning**: Attacker submits `quantity: 9999` or `quantity: "1"` (string instead of int).
11. **Self-Assigned Admin Escalation**: Non-admin user writes `/admins/{theirUid}` to grant themselves admin role.
12. **Immutable Order Field Tampering**: Admin attempts to modify `clientPhone` or `createdAt` during an order update, or passes an invalid status value `"hacked"`.
