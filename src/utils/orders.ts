/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";

export const PRODUCT_OPTIONS = [
  "Botijão P13 (13 kg - Residencial)",
  "Gás P20 (20 kg - Empilhadeira)",
  "Cilindro P45 (45 kg - Comercial)",
  "Instalação & Conferência de Segurança",
  "Dúvida / Outro Pedido",
] as const;

export const PAYMENT_OPTIONS = [
  "Pix na Entrega",
  "Cartão de Débito",
  "Cartão de Crédito",
  "Dinheiro",
] as const;

export const SERVICE_TO_PRODUCT_MAP: Record<string, string> = {
  p13: PRODUCT_OPTIONS[0],
  p20: PRODUCT_OPTIONS[1],
  p45: PRODUCT_OPTIONS[2],
  seguranca: PRODUCT_OPTIONS[3],
  instalacao: PRODUCT_OPTIONS[3],
  outro: PRODUCT_OPTIONS[4],
};

export type OrderStatus = "novo" | "em_rota" | "entregue" | "cancelado";

export interface OrderRecord {
  id: string;
  orderNumber: string;
  orderDate: string;
  clientName: string;
  clientPhone: string;
  neighborhood: string;
  city: string;
  address: string;
  isOtherCity: boolean;
  productType: string;
  quantity: number;
  paymentMethod: string;
  notes: string;
  status: OrderStatus;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface CreateOrderInput {
  orderNumber: string;
  orderDate: string;
  clientName: string;
  clientPhone: string;
  neighborhood: string;
  city: string;
  address: string;
  isOtherCity: boolean;
  productType: string;
  quantity: number;
  paymentMethod: string;
  notes: string;
}

export function resolveProductFromKey(key?: string | null): string | undefined {
  if (!key) return undefined;
  const normalized = key.trim().toLowerCase();
  if (SERVICE_TO_PRODUCT_MAP[normalized]) {
    return SERVICE_TO_PRODUCT_MAP[normalized];
  }
  const directMatch = PRODUCT_OPTIONS.find(
    (opt) => opt.toLowerCase() === normalized || opt.toLowerCase().includes(normalized)
  );
  return directMatch;
}

/**
 * Returns YYYY-MM-DD in Lages/SC timezone (America/Sao_Paulo).
 * Rolls over automatically at 00:00:00 every day.
 */
export function getLagesDateKey(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((p) => p.type === "year")?.value || "2026";
  const month = parts.find((p) => p.type === "month")?.value || "01";
  const day = parts.find((p) => p.type === "day")?.value || "01";
  return `${year}-${month}-${day}`;
}

export function formatLagesDateBR(dateKey: string): string {
  const [year, month, day] = dateKey.split("-");
  if (!year || !month || !day) return dateKey;
  return `${day}/${month}/${year}`;
}

export function getMsUntilLagesMidnight(): number {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const h = Number(parts.find((p) => p.type === "hour")?.value || "0") % 24;
  const m = Number(parts.find((p) => p.type === "minute")?.value || "0");
  const s = Number(parts.find((p) => p.type === "second")?.value || "0");

  const elapsedSec = h * 3600 + m * 60 + s;
  const remainingSec = Math.max(1, 24 * 3600 - elapsedSec);
  return remainingSec * 1000 + 500;
}

export function generateOrderNumber(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const hourNum = Number(parts.find((p) => p.type === "hour")?.value || "0") % 24;
  const minNum = Number(parts.find((p) => p.type === "minute")?.value || "0") % 60;
  const hh = String(hourNum).padStart(2, "0");
  const mm = String(minNum).padStart(2, "0");
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `#G7-${hh}${mm}-${rand}`;
}

function createSafeOrderDocId(orderDate: string, orderNumber: string): string {
  const cleanDate = orderDate.replace(/[^0-9]/g, "");
  const cleanCode = orderNumber.replace(/[^a-zA-Z0-9]/g, "");
  const suffix = Math.random().toString(36).slice(2, 8);
  return `ord_${cleanDate}_${cleanCode}_${suffix}`.slice(0, 120);
}

function clampString(val: string, maxLen: number): string {
  return val.trim().slice(0, maxLen);
}

/**
 * Persists a customer order into Firestore adhering strictly to firebase-blueprint.json schema.
 */
export async function saveOrderToFirestore(input: CreateOrderInput): Promise<string> {
  const docId = createSafeOrderDocId(input.orderDate, input.orderNumber);
  const docPath = `orders/${docId}`;

  const safeQuantity = Math.max(1, Math.min(20, Math.round(Number(input.quantity) || 1)));

  const payload = {
    orderNumber: clampString(input.orderNumber, 32),
    orderDate: clampString(input.orderDate, 10),
    clientName: clampString(input.clientName, 120),
    clientPhone: clampString(input.clientPhone, 25),
    neighborhood: clampString(input.neighborhood, 100),
    city: clampString(input.city, 100),
    address: clampString(input.address, 280),
    isOtherCity: Boolean(input.isOtherCity),
    productType: clampString(input.productType, 100),
    quantity: safeQuantity,
    paymentMethod: clampString(input.paymentMethod, 60),
    notes: clampString(input.notes, 500),
    status: "novo" as const,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, "orders", docId), payload);
    return docId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}
