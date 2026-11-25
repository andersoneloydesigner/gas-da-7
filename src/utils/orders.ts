/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, runTransaction, serverTimestamp, Timestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";

export interface ProductCatalogItem {
  key: string;
  label: string;
  shortTitle: string;
  subtitle: string;
  price: number;
}

export const PRODUCT_CATALOG: readonly ProductCatalogItem[] = [
  {
    key: "p13",
    label: "Botijão P13 (Com Casco / Recarga) — R$ 125,00 + frete",
    shortTitle: "Botijão P13",
    subtitle: "Com Casco (Recarga)",
    price: 125,
  },
  {
    key: "p13-sem-casco",
    label: "Botijão P13 (Sem Casco / Completo) — R$ 350,00 + frete",
    shortTitle: "Botijão P13",
    subtitle: "Sem Casco (Completo)",
    price: 350,
  },
  {
    key: "p45",
    label: "Cilindro P45 (Com Casco / Recarga) — R$ 450,00 + frete",
    shortTitle: "Cilindro P45",
    subtitle: "Com Casco (Recarga)",
    price: 450,
  },
  {
    key: "p45-sem-casco",
    label: "Cilindro P45 (Sem Casco / Completo) — R$ 1.250,00 + frete",
    shortTitle: "Cilindro P45",
    subtitle: "Sem Casco (Completo)",
    price: 1250,
  },
] as const;

export const PRODUCT_OPTIONS = PRODUCT_CATALOG.map((item) => item.label);

export const PAYMENT_OPTIONS = [
  "Pix na Entrega",
  "Cartão de Débito",
  "Cartão de Crédito",
  "Dinheiro",
] as const;

export const SERVICE_TO_PRODUCT_MAP: Record<string, string> = {
  p13: PRODUCT_CATALOG[0].label,
  "p13-recarga": PRODUCT_CATALOG[0].label,
  "p13-sem-casco": PRODUCT_CATALOG[1].label,
  p45: PRODUCT_CATALOG[2].label,
  "p45-recarga": PRODUCT_CATALOG[2].label,
  "p45-sem-casco": PRODUCT_CATALOG[3].label,
};

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function getUnitPriceForProduct(productLabel: string): number {
  const found = PRODUCT_CATALOG.find((item) => item.label === productLabel);
  return found ? found.price : 0;
}

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

/**
 * Formats order code as #G7-HHMM-DDMMNNN (e.g. #G7-1355-2511001).
 * The ending combines DDMM (day+month in Lages/SC) + 3-digit daily sequential order number.
 */
export function formatDailyOrderNumber(
  orderDate: string,
  seqNumber: number,
  now: Date = new Date()
): string {
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

  const [, month = "01", day = "01"] = orderDate.split("-");
  const ddmm = `${day.padStart(2, "0").slice(0, 2)}${month.padStart(2, "0").slice(0, 2)}`;
  const safeSeq = Math.max(1, Math.min(9999, Math.floor(seqNumber)));
  const seqStr = String(safeSeq).padStart(3, "0");

  return `#G7-${hh}${mm}-${ddmm}${seqStr}`;
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
 * Atomically increments /dailyCounters/{orderDate} and persists the order in /orders/{docId}
 * inside a single Firestore transaction so every customer receives a unique sequential number
 * (#G7-HHMM-DDMM001, #G7-HHMM-DDMM002...) that resets daily at 00:00 Lages/SC time.
 */
export async function createSequentialOrderInFirestore(
  input: CreateOrderInput
): Promise<{ docId: string; orderNumber: string }> {
  const safeOrderDate = clampString(input.orderDate, 10);
  const safeQuantity = Math.max(1, Math.min(20, Math.round(Number(input.quantity) || 1)));
  const counterRef = doc(db, "dailyCounters", safeOrderDate);

  try {
    const result = await runTransaction(db, async (transaction) => {
      const counterSnap = await transaction.get(counterRef);
      const nextSeq = counterSnap.exists()
        ? Math.min(9999, Number(counterSnap.data().count || 0) + 1)
        : 1;

      const orderNumber = formatDailyOrderNumber(safeOrderDate, nextSeq);
      const docId = createSafeOrderDocId(safeOrderDate, orderNumber);
      const orderRef = doc(db, "orders", docId);

      if (counterSnap.exists()) {
        transaction.update(counterRef, {
          count: nextSeq,
          updatedAt: serverTimestamp(),
        });
      } else {
        transaction.set(counterRef, {
          orderDate: safeOrderDate,
          count: 1,
          updatedAt: serverTimestamp(),
        });
      }

      transaction.set(orderRef, {
        orderNumber: clampString(orderNumber, 32),
        orderDate: safeOrderDate,
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
      });

      return { docId, orderNumber };
    });

    return result;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `orders (dailyCounters/${safeOrderDate})`);
  }
}
