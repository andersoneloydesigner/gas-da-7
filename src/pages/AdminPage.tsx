/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import {
  ShieldCheck,
  LogOut,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Search,
  MapPin,
  Phone,
  Trash2,
  Users,
  Plus,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  auth,
  db,
  googleProvider,
  BOOTSTRAPPED_ADMIN_EMAIL,
  handleFirestoreError,
  OperationType,
} from "../firebase";
import { APP_DETAILS, IMAGES } from "../constants";
import WhatsAppIcon from "../components/WhatsAppIcon";
import {
  OrderRecord,
  OrderStatus,
  getLagesDateKey,
  formatLagesDateBR,
  getMsUntilLagesMidnight,
} from "../utils/orders";

interface AdminPageProps {
  onNavigate: (path: string) => void;
}

interface AdminDirectoryItem {
  id: string;
  uid: string;
  name: string;
  email: string;
}

const STATUS_META: Record<
  OrderStatus,
  { label: string; badgeClass: string; activeBtnClass: string }
> = {
  novo: {
    label: "Novo",
    badgeClass: "bg-[#00B8F4]/15 text-[#0077A8] border border-[#00B8F4]/40",
    activeBtnClass: "bg-[#00B8F4] text-[#121521]",
  },
  em_rota: {
    label: "Em Rota",
    badgeClass: "bg-[#FFF5EE] text-[#F26513] border border-[#F26513]/40",
    activeBtnClass: "bg-[#F26513] text-white",
  },
  entregue: {
    label: "Entregue",
    badgeClass: "bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]",
    activeBtnClass: "bg-[#15803D] text-white",
  },
  cancelado: {
    label: "Cancelado",
    badgeClass: "bg-slate-100 text-slate-600 border border-slate-300",
    activeBtnClass: "bg-slate-700 text-white",
  },
};

function formatOrderTime(order: OrderRecord): string {
  if (!order.createdAt) return "--:--";
  try {
    const date = order.createdAt.toDate();
    return new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "--:--";
  }
}

export default function AdminPage({ onNavigate }: AdminPageProps) {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingRole, setCheckingRole] = useState(false);
  const [authError, setAuthError] = useState("");
  const [quotaWarning, setQuotaWarning] = useState(false);

  // Daily date key in America/Sao_Paulo (auto-resets at 00:00)
  const [todayDateKey, setTodayDateKey] = useState(() => getLagesDateKey());
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"todos" | OrderStatus>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Owners management drawer
  const [showOwnersPanel, setShowOwnersPanel] = useState(false);
  const [adminsList, setAdminsList] = useState<AdminDirectoryItem[]>([]);
  const [newAdminUid, setNewAdminUid] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [adminFormMsg, setAdminFormMsg] = useState("");
  const [copiedUid, setCopiedUid] = useState(false);
  const [copiedPedidoLink, setCopiedPedidoLink] = useState(false);

  // Schedule automatic daily reset at 00:00:00 Lages/SC time
  useEffect(() => {
    let timeoutId: number;
    const scheduleNextMidnight = () => {
      const ms = getMsUntilLagesMidnight();
      timeoutId = window.setTimeout(() => {
        setTodayDateKey(getLagesDateKey());
        scheduleNextMidnight();
      }, ms);
    };
    scheduleNextMidnight();

    // Also verify date on tab visibility regain (e.g. phone/PC woken up next morning)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        const currentKey = getLagesDateKey();
        setTodayDateKey((prev) => (prev !== currentKey ? currentKey : prev));
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Auth listener + RBAC verification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthError("");

      if (!firebaseUser) {
        setIsAuthorized(false);
        setAuthReady(true);
        return;
      }

      setCheckingRole(true);
      try {
        const isBootstrapped =
          Boolean(firebaseUser.emailVerified) &&
          firebaseUser.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();

        if (isBootstrapped) {
          setIsAuthorized(true);
        } else if (firebaseUser.emailVerified) {
          const adminDocPath = `admins/${firebaseUser.uid}`;
          try {
            const snap = await getDoc(doc(db, "admins", firebaseUser.uid));
            setIsAuthorized(snap.exists());
          } catch (err) {
            handleFirestoreError(err, OperationType.GET, adminDocPath);
          }
        } else {
          setIsAuthorized(false);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("Quota exceeded")) setQuotaWarning(true);
        setIsAuthorized(false);
      } finally {
        setCheckingRole(false);
        setAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to today's orders + silently clean up expired prior-day orders
  useEffect(() => {
    if (!authReady || !user || !isAuthorized) {
      setOrders([]);
      return;
    }

    setLoadingOrders(true);
    const ordersRef = collection(db, "orders");
    const todayQuery = query(ordersRef, where("orderDate", "==", todayDateKey));

    const unsubscribe = onSnapshot(
      todayQuery,
      (snapshot) => {
        const list: OrderRecord[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            orderNumber: String(data.orderNumber || ""),
            orderDate: String(data.orderDate || todayDateKey),
            clientName: String(data.clientName || ""),
            clientPhone: String(data.clientPhone || ""),
            neighborhood: String(data.neighborhood || ""),
            city: String(data.city || ""),
            address: String(data.address || ""),
            isOtherCity: Boolean(data.isOtherCity),
            productType: String(data.productType || ""),
            quantity: Number(data.quantity || 1),
            paymentMethod: String(data.paymentMethod || ""),
            notes: String(data.notes || ""),
            status: (data.status as OrderStatus) || "novo",
            createdAt: data.createdAt || null,
            updatedAt: data.updatedAt || null,
          };
        });

        // Sort newest first client-side (avoids Firestore composite index requirement)
        list.sort((a, b) => {
          const msA = a.createdAt?.toMillis?.() ?? 0;
          const msB = b.createdAt?.toMillis?.() ?? 0;
          return msB - msA;
        });

        setOrders(list);
        setLoadingOrders(false);
      },
      (error) => {
        setLoadingOrders(false);
        if (error.message.includes("Quota exceeded")) {
          setQuotaWarning(true);
          return;
        }
        handleFirestoreError(error, OperationType.LIST, "orders");
      }
    );

    // Clean up any leftover orders from previous days (enforcing daily 00:00 reset in DB too)
    const cleanupPreviousDays = async () => {
      try {
        const oldQuery = query(ordersRef, where("orderDate", "<", todayDateKey));
        const oldSnap = await getDocs(oldQuery);
        if (!oldSnap.empty) {
          await Promise.all(oldSnap.docs.map((oldDoc) => deleteDoc(oldDoc.ref)));
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("Quota exceeded")) {
          setQuotaWarning(true);
        }
      }
    };
    cleanupPreviousDays();

    return () => unsubscribe();
  }, [authReady, user, isAuthorized, todayDateKey]);

  // Subscribe to authorized admins directory when Owners Panel is open
  useEffect(() => {
    if (!authReady || !user || !isAuthorized || !showOwnersPanel) return;

    const unsubscribe = onSnapshot(
      collection(db, "admins"),
      (snapshot) => {
        setAdminsList(
          snapshot.docs.map((d) => ({
            id: d.id,
            uid: String(d.data().uid || d.id),
            name: String(d.data().name || ""),
            email: String(d.data().email || ""),
          }))
        );
      },
      (error) => {
        if (error.message.includes("Quota exceeded")) {
          setQuotaWarning(true);
          return;
        }
        handleFirestoreError(error, OperationType.LIST, "admins");
      }
    );

    return () => unsubscribe();
  }, [authReady, user, isAuthorized, showOwnersPanel]);

  const handleGoogleSignIn = async () => {
    setAuthError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("popup-closed-by-user")) {
        setAuthError("Não foi possível concluir o login com Google. Tente novamente.");
      }
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setOrders([]);
    setIsAuthorized(false);
  };

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    setUpdatingId(orderId);
    const path = `orders/${orderId}`;
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setUpdatingId(orderId);
    const path = `orders/${orderId}`;
    try {
      await deleteDoc(doc(db, "orders", orderId));
      setConfirmDeleteId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setAdminFormMsg("");

    const cleanUid = newAdminUid.trim();
    const cleanName = newAdminName.trim();
    const cleanEmail = newAdminEmail.trim().toLowerCase();

    if (!/^[a-zA-Z0-9_-]{6,128}$/.test(cleanUid)) {
      setAdminFormMsg("UID inválido. Peça ao sócio para copiar o UID exibido na tela de login.");
      return;
    }
    if (cleanName.length < 2 || cleanEmail.length < 5 || !cleanEmail.includes("@")) {
      setAdminFormMsg("Preencha nome e e-mail Google válidos.");
      return;
    }

    const path = `admins/${cleanUid}`;
    try {
      await setDoc(doc(db, "admins", cleanUid), {
        uid: cleanUid,
        name: cleanName.slice(0, 120),
        email: cleanEmail.slice(0, 160),
        addedBy: user.uid,
        createdAt: serverTimestamp(),
      });
      setNewAdminUid("");
      setNewAdminName("");
      setNewAdminEmail("");
      setAdminFormMsg("Administrador adicionado com sucesso!");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const handleRemoveOwner = async (uid: string) => {
    const path = `admins/${uid}`;
    try {
      await deleteDoc(doc(db, "admins", uid));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const handleCopyUid = () => {
    if (!user?.uid) return;
    navigator.clipboard?.writeText(user.uid);
    setCopiedUid(true);
    window.setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleCopyPedidoUrl = () => {
    const url = `${window.location.origin}/pedido`;
    navigator.clipboard?.writeText(url);
    setCopiedPedidoLink(true);
    window.setTimeout(() => setCopiedPedidoLink(false), 2000);
  };

  // Real-time KPI metrics computed strictly from today's Firestore records
  const stats = useMemo(() => {
    let totalUnits = 0;
    let pendingCount = 0;
    let deliveredCount = 0;
    for (const o of orders) {
      totalUnits += o.quantity;
      if (o.status === "novo" || o.status === "em_rota") pendingCount += 1;
      if (o.status === "entregue") deliveredCount += 1;
    }
    return {
      totalOrders: orders.length,
      totalUnits,
      pendingCount,
      deliveredCount,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "todos" && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.clientName.toLowerCase().includes(q) ||
        o.clientPhone.toLowerCase().includes(q) ||
        o.neighborhood.toLowerCase().includes(q) ||
        o.address.toLowerCase().includes(q) ||
        o.productType.toLowerCase().includes(q)
      );
    });
  }, [orders, statusFilter, searchTerm]);

  if (!authReady || checkingRole) {
    return (
      <div className="min-h-screen bg-[#121521] text-white flex flex-col items-center justify-center p-6 gap-4 font-sans">
        <Loader2 className="w-8 h-8 text-[#00B8F4] animate-spin" />
        <p className="text-sm font-bold text-white/80">Verificando acesso administrativo...</p>
      </div>
    );
  }

  // Login Gate
  if (!user) {
    return (
      <div className="min-h-screen bg-[#121521] text-white flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white text-[#121521] rounded-2xl p-7 sm:p-8 border-2 border-[#00B8F4] space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="bg-[#121521] px-5 py-3 rounded-2xl">
              <img
                src={IMAGES.logoWhite}
                alt="Gás da 7"
                className="h-9 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#F26513]">
                Painel Restrito · Gás da 7
              </p>
              <h1 className="text-2xl font-extrabold text-[#121521]">Acesso dos Donos</h1>
              <p className="text-xs sm:text-sm text-[#33394D]">
                Entre com sua conta Google autorizada para acompanhar os pedidos diários em tempo real.
              </p>
            </div>
          </div>

          {authError && (
            <div className="rounded-xl bg-[#FFF5EE] border border-[#F26513] px-4 py-3 text-xs font-bold text-[#F26513] text-center">
              {authError}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full bg-[#F26513] text-white border-2 border-transparent hover:bg-white hover:text-[#F26513] hover:border-[#F26513] py-3.5 px-5 rounded-xl font-extrabold text-sm transition-all cursor-pointer flex items-center justify-center gap-2.5"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Entrar com Google</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate("/")}
            className="w-full text-xs font-bold text-[#33394D] hover:text-[#121521] py-2 cursor-pointer"
          >
            Voltar para o site público
          </button>
        </div>
      </div>
    );
  }

  // Authenticated but Not Authorized as Company Owner
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#121521] text-white flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white text-[#121521] rounded-2xl p-7 sm:p-8 border-2 border-[#F26513] space-y-5 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-[#FFF5EE] text-[#F26513] flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-extrabold">Acesso Restrito aos Donos</h1>
            <p className="text-xs sm:text-sm text-[#33394D]">
              A conta <strong>{user.email}</strong> ainda não está autorizada no painel administrativo da Gás da 7.
            </p>
          </div>

          <div className="bg-[#FFF9F5] border border-[#FFE1CC] rounded-xl p-4 text-left space-y-2">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#F26513]">
              É um dos donos da empresa?
            </p>
            <p className="text-xs text-[#33394D]">
              Copie seu código UID abaixo e envie ao administrador principal para liberar seu acesso:
            </p>
            <div className="flex items-center gap-2 pt-1">
              <code className="flex-1 bg-white border border-[#FFE1CC] rounded-lg px-2.5 py-2 text-[11px] font-mono text-[#121521] truncate">
                {user.uid}
              </code>
              <button
                type="button"
                onClick={handleCopyUid}
                className="bg-[#121521] text-[#00B8F4] px-3 py-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {copiedUid ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUid ? "Copiado" : "Copiar"}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex-1 bg-[#00B8F4] text-[#121521] border-2 border-transparent hover:bg-white hover:border-[#121521] py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
            >
              Trocar Conta
            </button>
            <button
              type="button"
              onClick={() => onNavigate("/")}
              className="flex-1 bg-[#F26513] text-white border-2 border-transparent hover:bg-white hover:text-[#F26513] hover:border-[#F26513] py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
            >
              Ir para o Site
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authorized Admin Dashboard
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#121521] flex flex-col font-sans">
      {/* Admin Header */}
      <header className="bg-[#121521] text-white border-b-4 border-[#00B8F4] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={IMAGES.logoWhite}
              alt="Gás da 7"
              className="h-7 sm:h-8 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="hidden sm:block h-6 w-px bg-white/20" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#00B8F4] font-extrabold">
                Painel Administrativo
              </p>
              <p className="text-xs sm:text-sm font-extrabold text-white">
                Pedidos do Dia · {formatLagesDateBR(todayDateKey)}
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopyPedidoUrl}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              {copiedPedidoLink ? (
                <Check className="w-3.5 h-3.5 text-[#00B8F4]" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-[#00B8F4]" />
              )}
              <span>{copiedPedidoLink ? "Link /pedido Copiado" : "Copiar Link /pedido"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowOwnersPanel((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                showOwnersPanel
                  ? "bg-[#00B8F4] text-[#121521]"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Donos</span>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 bg-[#F26513] text-white hover:bg-white hover:text-[#F26513] px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {quotaWarning && (
          <div className="bg-amber-50 border-2 border-amber-300 text-amber-900 rounded-2xl p-4 text-xs sm:text-sm font-semibold flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              Cota gratuita diária do Firestore atingida. A cota é redefinida automaticamente amanhã.
            </div>
          </div>
        )}

        {/* Daily Reset Banner */}
        <div className="bg-[#121521] text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#00B8F4]/30">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#00B8F4]/15 text-[#00B8F4] flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </span>
            <div>
              <p className="text-sm font-extrabold">
                Controle Diário Ativo ({formatLagesDateBR(todayDateKey)})
              </p>
              <p className="text-xs text-white/75">
                Todos os pedidos feitos hoje ficam registrados aqui e a lista zera automaticamente às{" "}
                <strong className="text-[#00B8F4]">00:00</strong> (horário de Lages/SC).
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-xs font-bold text-[#00B8F4] shrink-0 w-fit">
            <Clock className="w-3.5 h-3.5" />
            <span>Tempo Real</span>
          </span>
        </div>

        {/* Multi-Owner Management Panel */}
        {showOwnersPanel && (
          <div className="bg-white border-2 border-[#00B8F4] rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-[#121521]">
                  Donos / Administradores Autorizados
                </h2>
                <p className="text-xs text-[#33394D]">
                  Adicione outros sócios da {APP_DETAILS.name} para acessarem esta página /adm.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowOwnersPanel(false)}
                className="text-xs font-extrabold text-[#33394D] hover:text-[#121521] cursor-pointer"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleAddOwner} className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <input
                type="text"
                value={newAdminUid}
                onChange={(e) => setNewAdminUid(e.target.value)}
                placeholder="UID Google do sócio"
                required
                className="md:col-span-4 bg-[#F8FAFC] border border-slate-200 focus:border-[#F26513] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs font-medium"
              />
              <input
                type="text"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                placeholder="Nome (ex: João Sócio)"
                required
                className="md:col-span-3 bg-[#F8FAFC] border border-slate-200 focus:border-[#F26513] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs font-medium"
              />
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="E-mail Google"
                required
                className="md:col-span-3 bg-[#F8FAFC] border border-slate-200 focus:border-[#F26513] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs font-medium"
              />
              <button
                type="submit"
                className="md:col-span-2 bg-[#00B8F4] text-[#121521] border-2 border-transparent hover:bg-white hover:border-[#121521] rounded-xl px-4 py-2.5 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Autorizar</span>
              </button>
            </form>

            {adminFormMsg && (
              <p className="text-xs font-bold text-[#F26513]">{adminFormMsg}</p>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between bg-[#FFF9F5] border border-[#FFE1CC] rounded-xl px-4 py-2.5 text-xs">
                <div>
                  <span className="font-extrabold text-[#121521]">Administrador Principal</span>
                  <span className="text-[#33394D] ml-2">{BOOTSTRAPPED_ADMIN_EMAIL}</span>
                </div>
                <span className="text-[11px] font-extrabold text-[#F26513] uppercase">Dono Master</span>
              </div>

              {adminsList.map((adm) => (
                <div
                  key={adm.id}
                  className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs gap-3"
                >
                  <div className="min-w-0">
                    <span className="font-extrabold text-[#121521]">{adm.name}</span>
                    <span className="text-[#33394D] ml-2">{adm.email}</span>
                    <span className="block text-[10px] font-mono text-slate-400 truncate">
                      UID: {adm.uid}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveOwner(adm.id)}
                    className="text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer shrink-0"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KPI Cards (Strictly calculated from today's live Firestore orders) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-[#33394D]">
              <span>Pedidos Hoje</span>
              <Package className="w-4 h-4 text-[#0095D1]" />
            </div>
            <p className="text-3xl font-extrabold text-[#121521] tabular-nums">
              {stats.totalOrders}
            </p>
          </div>

          <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-[#33394D]">
              <span>Unidades / Botijões</span>
              <Truck className="w-4 h-4 text-[#F26513]" />
            </div>
            <p className="text-3xl font-extrabold text-[#121521] tabular-nums">
              {stats.totalUnits}
            </p>
          </div>

          <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-[#33394D]">
              <span>Em Atendimento</span>
              <Clock className="w-4 h-4 text-[#F26513]" />
            </div>
            <p className="text-3xl font-extrabold text-[#F26513] tabular-nums">
              {stats.pendingCount}
            </p>
          </div>

          <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-[#33394D]">
              <span>Entregues Hoje</span>
              <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
            </div>
            <p className="text-3xl font-extrabold text-[#15803D] tabular-nums">
              {stats.deliveredCount}
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center flex-wrap gap-2">
            {(["todos", "novo", "em_rota", "entregue", "cancelado"] as const).map((statusKey) => {
              const active = statusFilter === statusKey;
              const label =
                statusKey === "todos" ? `Todos (${orders.length})` : STATUS_META[statusKey].label;
              return (
                <button
                  key={statusKey}
                  type="button"
                  onClick={() => setStatusFilter(statusKey)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                    active
                      ? "bg-[#121521] text-[#00B8F4]"
                      : "bg-slate-100 text-[#33394D] hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar pedido, cliente ou bairro..."
              className="w-full bg-[#F8FAFC] border border-slate-200 focus:border-[#00B8F4] focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-[#121521]"
            />
          </div>
        </div>

        {/* Orders List */}
        {loadingOrders ? (
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <Loader2 className="w-7 h-7 text-[#00B8F4] animate-spin mx-auto" />
            <p className="text-sm font-bold text-[#33394D]">Carregando pedidos de hoje...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[#FFF5EE] text-[#F26513] flex items-center justify-center">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-extrabold text-[#121521]">
              {orders.length === 0
                ? "Nenhum pedido registrado hoje ainda"
                : "Nenhum pedido corresponde ao filtro"}
            </h3>
            <p className="text-xs sm:text-sm text-[#33394D] max-w-md mx-auto">
              Assim que um cliente finalizar um pedido pelo site ou pela página /pedido, ele aparecerá aqui instantaneamente.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate("/pedido")}
                className="inline-flex items-center gap-2 bg-[#00B8F4] text-[#121521] border-2 border-transparent hover:bg-white hover:border-[#121521] px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
              >
                <span>Abrir Página /pedido</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const meta = STATUS_META[order.status] || STATUS_META.novo;
              const digitsOnly = order.clientPhone.replace(/\D/g, "");
              const clientWaPhone = digitsOnly.startsWith("55") ? digitsOnly : `55${digitsOnly}`;
              const replyText = encodeURIComponent(
                `Olá ${order.clientName}! Aqui é da Gás da 7 confirmando o seu pedido ${order.orderNumber} (${order.quantity}x ${order.productType}).`
              );

              return (
                <div
                  key={order.id}
                  className="bg-white border-2 border-slate-200 hover:border-[#00B8F4] rounded-2xl p-5 sm:p-6 transition-colors space-y-4"
                >
                  {/* Top Row: Code, Time, Product, Status */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                    <div className="flex items-center flex-wrap gap-2.5">
                      <span className="px-3 py-1 rounded-lg bg-[#121521] text-[#00B8F4] text-xs font-extrabold tabular-nums">
                        {order.orderNumber}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#33394D] tabular-nums">
                        <Clock className="w-3.5 h-3.5 text-[#F26513]" />
                        {formatOrderTime(order)}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold ${meta.badgeClass}`}>
                        {meta.label}
                      </span>
                      {order.isOtherCity && (
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-amber-100 text-amber-900">
                          Outro Município
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-lg bg-[#FFF5EE] text-[#F26513] border border-[#FFE1CC] text-xs font-extrabold">
                        {order.quantity}x {order.productType}
                      </span>
                    </div>
                  </div>

                  {/* Middle Row: Client, Address, Payment, Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs sm:text-sm">
                    <div className="md:col-span-4 space-y-1">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                        Cliente
                      </p>
                      <p className="font-extrabold text-[#121521]">{order.clientName}</p>
                      <a
                        href={`tel:+${clientWaPhone}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0095D1] hover:underline tabular-nums"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{order.clientPhone}</span>
                      </a>
                    </div>

                    <div className="md:col-span-5 space-y-1">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                        Endereço de Entrega
                      </p>
                      <div className="flex items-start gap-1.5 text-[#121521] font-semibold">
                        <MapPin className="w-4 h-4 text-[#F26513] shrink-0 mt-0.5" />
                        <span>{order.address}</span>
                      </div>
                      {order.notes && (
                        <p className="text-xs text-[#33394D] bg-[#FFF9F5] border border-[#FFE1CC] rounded-lg px-2.5 py-1.5 mt-1.5">
                          <strong>Obs:</strong> {order.notes}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-3 space-y-1">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                        Pagamento
                      </p>
                      <p className="font-extrabold text-[#121521]">{order.paymentMethod}</p>
                      <p className="text-xs text-[#33394D] font-medium">
                        {order.neighborhood} · {order.city}
                      </p>
                    </div>
                  </div>

                  {/* Action Bar: Status Controls + WhatsApp + Delete */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center flex-wrap gap-1.5">
                      {(["novo", "em_rota", "entregue", "cancelado"] as OrderStatus[]).map((st) => {
                        const isCurrent = order.status === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            disabled={updatingId === order.id}
                            onClick={() => handleUpdateStatus(order.id, st)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer disabled:opacity-50 ${
                              isCurrent
                                ? STATUS_META[st].activeBtnClass
                                : "bg-slate-100 text-[#33394D] hover:bg-slate-200"
                            }`}
                          >
                            {STATUS_META[st].label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://api.whatsapp.com/send?phone=${clientWaPhone}&text=${replyText}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white px-3.5 py-2 rounded-xl text-xs font-extrabold transition-colors"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                        <span>Falar com Cliente</span>
                      </a>

                      {confirmDeleteId === order.id ? (
                        <div className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-xl">
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(order.id)}
                            className="text-xs font-extrabold text-red-700 hover:underline cursor-pointer"
                          >
                            Confirmar
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(order.id)}
                          aria-label="Excluir pedido"
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
