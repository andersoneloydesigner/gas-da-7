/**
 * Phase 0 Security Test Specification for Gás da 7 Firestore Rules.
 * Verifies that all 12 "Dirty Dozen" adversarial payloads are rejected with PERMISSION_DENIED.
 */

export interface AdversarialTestCase {
  id: number;
  name: string;
  operation: "get" | "list" | "create" | "update" | "delete";
  path: string;
  auth: { uid: string; email?: string; email_verified?: boolean } | null;
  payload?: Record<string, unknown>;
  expected: "PERMISSION_DENIED";
}

const VALID_BASE_ORDER = {
  orderNumber: "#G7-1020-4512",
  orderDate: "2026-11-25",
  clientName: "Maria Oliveira",
  clientPhone: "(49) 99999-8888",
  neighborhood: "Santa Helena",
  city: "Lages - SC",
  address: "Rua Sete de Setembro, nº 1749 - Bairro Santa Helena, Lages - SC",
  isOtherCity: false,
  productType: "Botijão P13 (13 kg - Residencial)",
  quantity: 1,
  paymentMethod: "Pix na Entrega",
  notes: "Casa de esquina",
  status: "novo",
  createdAt: "SERVER_TIMESTAMP",
  updatedAt: "SERVER_TIMESTAMP",
};

export const DIRTY_DOZEN_PAYLOADS: AdversarialTestCase[] = [
  {
    id: 1,
    name: "Unauthenticated Order Read (PII Leak)",
    operation: "get",
    path: "/orders/ord_001",
    auth: null,
    expected: "PERMISSION_DENIED",
  },
  {
    id: 2,
    name: "Unauthenticated Order List Scraping",
    operation: "list",
    path: "/orders",
    auth: null,
    expected: "PERMISSION_DENIED",
  },
  {
    id: 3,
    name: "Non-Admin Authenticated Order List",
    operation: "list",
    path: "/orders",
    auth: { uid: "random_user_1", email: "cliente@example.com", email_verified: true },
    expected: "PERMISSION_DENIED",
  },
  {
    id: 4,
    name: "Unverified Admin Email Spoof",
    operation: "list",
    path: "/orders",
    auth: { uid: "spoof_uid", email: "andeloy@gmail.com", email_verified: false },
    expected: "PERMISSION_DENIED",
  },
  {
    id: 5,
    name: "Shadow Field Injection on Create",
    operation: "create",
    path: "/orders/ord_shadow_1",
    auth: null,
    payload: { ...VALID_BASE_ORDER, isVerified: true, ghostField: "injected" },
    expected: "PERMISSION_DENIED",
  },
  {
    id: 6,
    name: "Status Shortcutting on Create",
    operation: "create",
    path: "/orders/ord_status_1",
    auth: null,
    payload: { ...VALID_BASE_ORDER, status: "entregue" },
    expected: "PERMISSION_DENIED",
  },
  {
    id: 7,
    name: "Timestamp Forgery on Create",
    operation: "create",
    path: "/orders/ord_time_1",
    auth: null,
    payload: { ...VALID_BASE_ORDER, createdAt: "2020-01-01T00:00:00Z" },
    expected: "PERMISSION_DENIED",
  },
  {
    id: 8,
    name: "ID Poisoning on Create",
    operation: "create",
    path: "/orders/" + "a".repeat(200),
    auth: null,
    payload: VALID_BASE_ORDER,
    expected: "PERMISSION_DENIED",
  },
  {
    id: 9,
    name: "Oversized String Payload (Denial of Wallet)",
    operation: "create",
    path: "/orders/ord_big_1",
    auth: null,
    payload: { ...VALID_BASE_ORDER, notes: "X".repeat(2000) },
    expected: "PERMISSION_DENIED",
  },
  {
    id: 10,
    name: "Quantity Out-of-Bounds & Type Poisoning",
    operation: "create",
    path: "/orders/ord_qty_1",
    auth: null,
    payload: { ...VALID_BASE_ORDER, quantity: 999 },
    expected: "PERMISSION_DENIED",
  },
  {
    id: 11,
    name: "Self-Assigned Admin Escalation",
    operation: "create",
    path: "/admins/attacker_uid_1",
    auth: { uid: "attacker_uid_1", email: "attacker@example.com", email_verified: true },
    payload: {
      uid: "attacker_uid_1",
      name: "Attacker",
      email: "attacker@example.com",
      addedBy: "attacker_uid_1",
      createdAt: "SERVER_TIMESTAMP",
    },
    expected: "PERMISSION_DENIED",
  },
  {
    id: 12,
    name: "Immutable Field Tampering & Invalid Status Value",
    operation: "update",
    path: "/orders/ord_001",
    auth: { uid: "owner_uid", email: "andeloy@gmail.com", email_verified: true },
    payload: { ...VALID_BASE_ORDER, clientPhone: "(49) 00000-0000", status: "hacked" },
    expected: "PERMISSION_DENIED",
  },
];
