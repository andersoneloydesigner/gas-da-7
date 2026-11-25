/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "motion/react";
import {
  Menu,
  X,
  Target,
  Eye,
  Heart,
  Check,
  Phone,
  MapPin,
  Clock,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import {
  APP_DETAILS,
  IMAGES,
  DIFFERENTIALS,
  SAFETY_TIPS,
} from "./constants";

// Subcomponents & Pages
import Mascot3DHero from "./components/Mascot3DHero";
import HeroGeoPattern from "./components/HeroGeoPattern";
import TeleportSmokePuff from "./components/TeleportSmokePuff";
import ServicesShowcase from "./components/ServicesShowcase";
import ContactForm from "./components/ContactForm";
import OfficialPagesModal from "./components/OfficialPagesModal";
import WhatsAppIcon from "./components/WhatsAppIcon";
import Section3DWrapper from "./components/Section3DWrapper";
import LocationMap from "./components/LocationMap";
import PedidoPage from "./pages/PedidoPage";
import AdminPage from "./pages/AdminPage";
import { PRODUCT_OPTIONS, resolveProductFromKey } from "./utils/orders";

const PIKA_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const headerRevealProps = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2, margin: "0px 0px -40px 0px" },
  transition: { duration: 0.72, ease: PIKA_EASE },
};

function getLagesOpenStatus(): { isOpen: boolean; label: string } {
  try {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Sao_Paulo",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(now);

    const weekday = parts.find((p) => p.type === "weekday")?.value || "Mon";
    const hour = Number(parts.find((p) => p.type === "hour")?.value || "0");
    const minute = Number(parts.find((p) => p.type === "minute")?.value || "0");
    const totalMinutes = hour * 60 + minute;

    const isSunday = weekday === "Sun";
    const openStart = 8 * 60;
    const openEnd = isSunday ? 12 * 60 : 20 * 60;
    const isOpen = totalMinutes >= openStart && totalMinutes < openEnd;

    if (isOpen) {
      return {
        isOpen: true,
        label: isSunday ? "Aberto agora · Até 12h" : "Aberto agora · Até 20h",
      };
    }
    return {
      isOpen: false,
      label: "Fechado agora · Abre às 08h",
    };
  } catch {
    return { isOpen: true, label: "Seg a Sáb 08h–20h · Dom 08h–12h" };
  }
}

function normalizeRoutePath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, "") || "/";
  return trimmed.toLowerCase();
}

export default function App() {
  const [routePath, setRoutePath] = useState(() => normalizeRoutePath(window.location.pathname));
  const [searchQuery, setSearchQuery] = useState(() => window.location.search);

  useEffect(() => {
    const handlePopState = () => {
      setRoutePath(normalizeRoutePath(window.location.pathname));
      setSearchQuery(window.location.search);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback((targetPath: string) => {
    const url = new URL(targetPath, window.location.origin);
    window.history.pushState({}, "", url.pathname + url.search);
    setRoutePath(normalizeRoutePath(url.pathname));
    setSearchQuery(url.search);
  }, []);

  if (routePath === "/adm") {
    return <AdminPage onNavigate={navigate} />;
  }

  if (routePath === "/pedido") {
    const params = new URLSearchParams(searchQuery);
    const produtoParam = params.get("produto");
    return <PedidoPage onNavigate={navigate} initialProductKey={produtoParam} />;
  }

  return <HomeLanding />;
}

function HomeLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("#inicio");
  const [isScrolled, setIsScrolled] = useState(false);
  const [openStatus, setOpenStatus] = useState(() => getLagesOpenStatus());
  const [selectedFormProduct, setSelectedFormProduct] = useState<string>(PRODUCT_OPTIONS[0]);
  const [selectionNonce, setSelectionNonce] = useState(0);

  // Official Pages Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"abnt" | "terms" | "privacy" | null>(null);
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setGmpQuotaExceeded(true);
    window.addEventListener("gmp-quota-exceeded", handleQuotaExceeded);
    return () => window.removeEventListener("gmp-quota-exceeded", handleQuotaExceeded);
  }, []);

  useEffect(() => {
    const handleScrollGlass = () => {
      setIsScrolled(window.scrollY > 24);
    };
    handleScrollGlass();
    window.addEventListener("scroll", handleScrollGlass, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollGlass);
  }, []);

  useEffect(() => {
    const canonicalUrl = window.location.origin + window.location.pathname;
    let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonicalUrl);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setOpenStatus(getLagesOpenStatus());
    }, 60000);
    return () => window.clearInterval(interval);
  }, []);

  // Smooth scroll controller
  const smoothScrollRef = useRef<{
    targetY: number;
    currentY: number;
    rafId: number | null;
    isAnimating: boolean;
    lastTime: number;
    startSmoothLoop: () => void;
  }>({
    targetY: 0,
    currentY: 0,
    rafId: null,
    isAnimating: false,
    lastTime: 0,
    startSmoothLoop: () => {},
  });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const state = smoothScrollRef.current;
    state.targetY = window.scrollY;
    state.currentY = window.scrollY;

    const updateScroll = (now: number) => {
      const dt = Math.min((now - state.lastTime) / 1000, 0.05);
      state.lastTime = now;
      const diff = state.targetY - state.currentY;

      if (Math.abs(diff) > 0.2) {
        const alpha = 1 - Math.exp(-10.5 * dt);
        state.currentY += diff * alpha;
        window.scrollTo(0, state.currentY);
        state.rafId = requestAnimationFrame(updateScroll);
      } else {
        state.currentY = state.targetY;
        window.scrollTo(0, state.targetY);
        state.isAnimating = false;
        state.rafId = null;
      }
    };

    state.startSmoothLoop = () => {
      state.isAnimating = true;
      if (!state.rafId) {
        state.lastTime = performance.now();
        state.rafId = requestAnimationFrame(updateScroll);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (isModalOpen) return;
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      const target = e.target as HTMLElement | null;
      if (target && target.closest("textarea, [data-allow-wheel]")) return;

      e.preventDefault();
      if (!state.isAnimating) {
        state.targetY = window.scrollY;
        state.currentY = window.scrollY;
      }

      const rawDelta =
        e.deltaMode === 1
          ? e.deltaY * 38
          : e.deltaMode === 2
          ? e.deltaY * window.innerHeight * 0.85
          : e.deltaY;

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      state.targetY = Math.max(0, Math.min(maxScroll, state.targetY + rawDelta));
      state.startSmoothLoop();
    };

    const handleNativeScroll = () => {
      if (!state.isAnimating) {
        state.targetY = window.scrollY;
        state.currentY = window.scrollY;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", handleNativeScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", handleNativeScroll);
      if (state.rafId) cancelAnimationFrame(state.rafId);
    };
  }, [isModalOpen]);

  const scrollToElementId = useCallback((id: string) => {
    setActiveTab(id);
    const targetEl = document.querySelector(id);
    if (!targetEl) return;

    const headerOffset = 88;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const endY = Math.max(
      0,
      Math.min(maxScroll, targetEl.getBoundingClientRect().top + window.scrollY - headerOffset)
    );

    const state = smoothScrollRef.current;
    if (!state.isAnimating) {
      state.currentY = window.scrollY;
    }
    state.targetY = endY;
    state.startSmoothLoop();
  }, []);

  const scrollToSection = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      scrollToElementId(id);
    },
    [scrollToElementId]
  );

  const handleGoToOrderForm = useCallback(
    (serviceId?: string) => {
      if (serviceId) {
        const resolved = resolveProductFromKey(serviceId);
        if (resolved) {
          setSelectedFormProduct(resolved);
          setSelectionNonce((n) => n + 1);
        }
      }
      setMobileMenuOpen(false);
      scrollToElementId("#contato");
    },
    [scrollToElementId]
  );

  // ScrollSpy for active nav highlight
  useEffect(() => {
    const sectionIds = ["#inicio", "#sobre", "#servicos", "#diferenciais", "#contato", "#localizacao"];
    const handleScrollSpy = () => {
      const scrollPosition = window.scrollY + 180;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.querySelector(sectionIds[i]);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (scrollPosition >= top) {
            setActiveTab(sectionIds[i]);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScrollSpy, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollSpy);
  }, []);

  const openOfficialPage = (type: "abnt" | "terms" | "privacy") => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleWhatsAppDirect = () => {
    const textMsg = encodeURIComponent(
      "Olá Gás da 7! Gostaria de pedir um botijão de gás para entrega em Lages/SC."
    );
    window.open(
      `https://api.whatsapp.com/send?phone=${APP_DETAILS.phoneWhatsappRaw}&text=${textMsg}`,
      "_blank"
    );
  };

  const navLinks = [
    { id: "#inicio", label: "Início" },
    { id: "#sobre", label: "Sobre Nós" },
    { id: "#servicos", label: "Produtos" },
    { id: "#diferenciais", label: "Diferenciais" },
    { id: "#contato", label: "Contato" },
    { id: "#localizacao", label: "Localização" },
  ];

  return (
    <div className="min-h-screen bg-white text-[#121521] flex flex-col overflow-x-clip selection:bg-[#F26513] selection:text-white">
      {/* Google Maps Platform Demo Key Quota Banner */}
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{" "}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{" "}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* 1. Header / TopNavBar - Floating Bar with Dark Blue Glass Effect on Scroll */}
      <nav
        aria-label="Navegação Principal"
        className={`text-white fixed ${
          gmpQuotaExceeded ? "top-14" : "top-3"
        } inset-x-0 mx-auto w-[calc(100%-2rem)] lg:w-max max-w-[calc(100%-2rem)] z-40 rounded-2xl border transition-all duration-300 ${
          isScrolled
            ? "bg-[#121521]/78 backdrop-blur-xl backdrop-saturate-150 border-[#00B8F4]/35 ring-1 ring-inset ring-white/15"
            : "bg-[#F26513] border-[#d95308]"
        }`}
      >
        <div className="flex justify-between items-center h-14 md:h-15 px-4 md:px-6 w-full gap-5 xl:gap-7">
          {/* Zone 1: Brand Logo */}
          <a
            href="#inicio"
            onClick={(e) => scrollToSection(e, "#inicio")}
            className="flex items-center group shrink-0 whitespace-nowrap"
            aria-label="Gás da 7 Início"
          >
            <img
              alt="Gás da 7 Logo"
              className="h-7 md:h-8 w-auto object-contain transition-transform duration-150 group-hover:scale-[1.03]"
              src={IMAGES.logoWhite}
              referrerPolicy="no-referrer"
            />
          </a>

          {/* Zone 2: Desktop Navigation Links (6 concise single-line links) */}
          <div className="hidden lg:flex items-center justify-center gap-1 xl:gap-1.5 text-xs uppercase tracking-wider font-bold">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.id}
                onClick={(e) => scrollToSection(e, link.id)}
                className={`transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 px-2.5 xl:px-3 py-1.5 rounded-lg ${
                  activeTab === link.id
                    ? isScrolled
                      ? "bg-[#00B8F4]/20 text-[#00B8F4] font-extrabold"
                      : "bg-white/25 text-white font-extrabold"
                    : isScrolled
                    ? "text-white hover:bg-white/10 hover:text-[#00B8F4]"
                    : "text-white hover:bg-white/15"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Zone 3: Single Primary CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleGoToOrderForm()}
              className="hidden md:inline-flex items-center justify-center bg-[#00B8F4] text-[#121521] px-4 py-2 rounded-xl text-xs tracking-wider uppercase font-extrabold hover:bg-white hover:text-[#121521] transition-all duration-150 active:translate-y-px whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Pedir Gás</span>
            </button>

            {/* Mobile Hamburger Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Alternar Menu"
              className="lg:hidden text-white hover:bg-white/15 rounded-lg cursor-pointer transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className={`lg:hidden border-t border-white/20 rounded-b-2xl text-xs uppercase tracking-wider font-bold divide-y divide-white/15 py-3 px-5 transition-colors duration-300 ${
              isScrolled ? "bg-[#121521]/90 backdrop-blur-xl" : "bg-[#F26513]"
            }`}
          >
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.id}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  scrollToSection(e, link.id);
                }}
                className={`block py-3 px-3 rounded-lg transition-colors ${
                  activeTab === link.id ? "bg-white/20 text-white font-extrabold" : "text-white hover:bg-white/15"
                }`}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 pb-2 w-full">
              <button
                type="button"
                onClick={() => handleGoToOrderForm()}
                className="w-full bg-[#00B8F4] text-[#121521] py-4 px-5 min-h-[52px] rounded-xl font-extrabold flex items-center justify-center hover:bg-white hover:text-[#121521] transition-all text-sm uppercase tracking-wider cursor-pointer"
              >
                <span>Pedir Gás Agora</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Container */}
      <main className="flex-1 overflow-x-clip">
        {/* 2. Hero Section - Dark Navy Blue (#121521) | Left: Lages/SC Gas Delivery Copy | Right: 3D Mascot + Animated "OH O GÁS!" */}
        <Section3DWrapper sectionId="inicio" sectionColor="#121521" isHero className="z-30">
        <section
          id="inicio"
          className="bg-[#121521] border-b-4 border-[#00B8F4] rounded-b-[2.5rem] md:rounded-b-[4rem] relative z-30 min-h-[680px] md:min-h-[740px] pt-24 md:pt-28 pb-10 flex items-center"
        >
          <HeroGeoPattern />
          <div className="max-w-7xl mx-auto px-6 py-4 md:py-8 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 items-center">
            {/* LEFT COLUMN: Gas Delivery in Lages/SC */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.72, ease: PIKA_EASE }}
              className="lg:col-span-5 text-left space-y-6 relative z-10"
            >
              <p className="text-xs uppercase tracking-widest text-[#00B8F4] font-extrabold">
                Disk Gás em Lages · Atendimento em Toda a Cidade
              </p>

              <h1 className="text-[2.25rem] sm:text-5xl lg:text-[3.2rem] font-extrabold tracking-tight text-white leading-[1.08] [text-wrap:balance]">
                Disk Gás com Entrega Rápida em{" "}
                <span className="text-[#F26513]">Lages/SC</span>
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-white/85 max-w-xl leading-relaxed font-medium">
                Na <strong className="text-[#00B8F4]">Gás da 7</strong>, o seu Disk Gás chega rápido em toda a cidade de Lages e região. Entregamos botijões P13 e cilindros P45 lacrados e com conferência segura de segunda a domingo — peça pelo site, WhatsApp ou telefone fixo.
              </p>

              {/* Action CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3.5 items-stretch sm:items-center">
                <button
                  onClick={handleWhatsAppDirect}
                  className="bg-[#F26513] text-white px-7 py-4 min-h-[54px] rounded-xl hover:bg-white hover:text-[#F26513] transition-all flex items-center justify-center gap-2.5 active:translate-y-px cursor-pointer font-extrabold text-sm whitespace-nowrap"
                >
                  <WhatsAppIcon className="w-5 h-5 fill-current shrink-0" />
                  <span>Pedir Gás pelo WhatsApp</span>
                </button>
                <a
                  href="#servicos"
                  onClick={(e) => scrollToSection(e, "#servicos")}
                  className="bg-[#00B8F4] text-[#121521] px-7 py-4 min-h-[54px] rounded-xl hover:bg-white hover:text-[#121521] transition-all flex items-center justify-center cursor-pointer font-extrabold text-sm whitespace-nowrap"
                >
                  Ver Botijões e Serviços
                </a>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: 3D Mascot + Animated "OH O GÁS!" (In front of everything, descending from top) */}
            <motion.div
              initial={{ opacity: 0, y: -340, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-7 w-full flex items-center justify-center relative z-50"
            >
              <Mascot3DHero />
            </motion.div>
          </div>
        </section>
        </Section3DWrapper>

        {/* 3. Faixa de Informações Rápidas (Fundo Branco) */}
        <Section3DWrapper sectionId="info-rapida" sectionColor="#FFFFFF">
        <section aria-label="Informações Rápidas" className="py-10 md:py-12 bg-white border-b border-[#FFE1CC]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="w-full max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 justify-center">
              {[
                { value: "P13 · P45", label: "Botijões e Cilindros GLP" },
                {
                  value: "08h às 20h",
                  label: openStatus.label,
                  statusDot: openStatus.isOpen ? "open" : "closed",
                },
                { value: "Toda Lages/SC", label: "Atendimento em Toda a Cidade" },
                {
                  value: APP_DETAILS.phoneWhatsapp,
                  label: "Disk Gás pelo WhatsApp",
                  href: `https://api.whatsapp.com/send?phone=${APP_DETAILS.phoneWhatsappRaw}&text=${encodeURIComponent("Olá Gás da 7! Gostaria de pedir um botijão de gás em Lages/SC.")}`,
                },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.value}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.72, delay: idx * 0.08, ease: PIKA_EASE }}
                  className="text-center will-change-transform"
                >
                  {stat.href ? (
                    <a
                      href={stat.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-block"
                    >
                      <span className="block text-xl sm:text-2xl md:text-[1.65rem] font-extrabold text-[#121521] group-hover:text-[#F26513] tracking-tight tabular-nums transition-colors">
                        {stat.value}
                      </span>
                      <span className="block text-xs text-[#F26513] font-bold mt-1 group-hover:underline">
                        {stat.label}
                      </span>
                    </a>
                  ) : (
                    <>
                      <span className="block text-xl sm:text-2xl md:text-[1.65rem] font-extrabold text-[#121521] tracking-tight tabular-nums">
                        {stat.value}
                      </span>
                      <span className="inline-flex items-center justify-center gap-1.5 text-xs text-[#F26513] font-bold mt-1">
                        {stat.statusDot && (
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              stat.statusDot === "open" ? "bg-[#25D366]" : "bg-[#33394D]/40"
                            }`}
                          />
                        )}
                        <span>{stat.label}</span>
                      </span>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        </Section3DWrapper>

        {/* 4. Quem Somos & Dados Oficiais Section (Fundo Laranja) */}
        <Section3DWrapper sectionId="sobre" sectionColor="#F26513">
        <section id="sobre" className="py-20 bg-[#F26513] border-b border-[#d95308]">
          <div className="max-w-7xl mx-auto px-6 space-y-12">
            <motion.div {...headerRevealProps} className="max-w-3xl mx-auto text-center space-y-3">
              <p className="text-xs uppercase tracking-widest text-white/90 font-extrabold">
                Quem Somos · {APP_DETAILS.name}
              </p>
              <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight [text-wrap:balance]">
                Sua Revenda de Confiança no Coração de <span className="text-white underline">Lages</span>
              </h2>
            </motion.div>

            {/* History & Mission/Vision/Values */}
            <div className="max-w-4xl mx-auto space-y-10">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.75, delay: 0.06, ease: PIKA_EASE }}
                className="text-sm md:text-base text-white/95 font-medium leading-relaxed text-center"
              >
                {APP_DETAILS.history}
              </motion.p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.7, delay: 0.05, ease: PIKA_EASE }}
                  className="bg-white border-2 border-[#121521]/10 rounded-2xl p-6 space-y-2.5 will-change-transform"
                >
                  <div className="flex items-center gap-2 text-[#F26513] text-xs font-extrabold uppercase tracking-wider">
                    <Target className="w-4 h-4" />
                    Missão
                  </div>
                  <p className="text-xs sm:text-sm text-[#121521] leading-relaxed font-medium">
                    {APP_DETAILS.mission}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.7, delay: 0.14, ease: PIKA_EASE }}
                  className="bg-white border-2 border-[#121521]/10 rounded-2xl p-6 space-y-2.5 will-change-transform"
                >
                  <div className="flex items-center gap-2 text-[#F26513] text-xs font-extrabold uppercase tracking-wider">
                    <Eye className="w-4 h-4" />
                    Visão
                  </div>
                  <p className="text-xs sm:text-sm text-[#121521] leading-relaxed font-medium">
                    {APP_DETAILS.vision}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.7, delay: 0.23, ease: PIKA_EASE }}
                  className="bg-white border-2 border-[#121521]/10 rounded-2xl p-6 space-y-2.5 will-change-transform"
                >
                  <div className="flex items-center gap-2 text-[#F26513] text-xs font-extrabold uppercase tracking-wider">
                    <Heart className="w-4 h-4" />
                    Valores
                  </div>
                  <div className="text-xs sm:text-sm text-[#121521] leading-relaxed font-semibold">
                    {APP_DETAILS.values.join(" · ")}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
        </Section3DWrapper>

        {/* 4. Produtos & Serviços Section */}
        <Section3DWrapper sectionId="servicos" sectionColor="#FFF9F5">
        <section id="servicos" className="py-20 bg-[#FFF9F5] border-b border-[#FFE1CC]">
          <div className="max-w-7xl mx-auto px-6 space-y-12">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 md:gap-8">
              {/* Left-side landing dock for the Hero 3D botijão teleport */}
              <div
                id="mascot-servicos-anchor"
                aria-hidden="true"
                className="relative w-[150px] h-[175px] sm:w-[170px] sm:h-[195px] md:w-[205px] md:h-[230px] shrink-0 flex items-end justify-center"
              >
                <TeleportSmokePuff zone="servicos" />
                <div
                  id="mascot-servicos-shadow"
                  className="w-[62%] h-5 rounded-full bg-[#121521]/20 blur-md mb-2 transition-opacity duration-200"
                  style={{ opacity: 0 }}
                />
              </div>

              <motion.div
                {...headerRevealProps}
                className="text-center md:text-left max-w-2xl space-y-3"
              >
                <p className="text-xs uppercase tracking-widest text-[#F26513] font-extrabold">
                  Disk Gás · Botijões & Tele-Entrega em Lages
                </p>
                <h2 className="text-2xl md:text-4xl font-extrabold text-[#121521] tracking-tight [text-wrap:balance]">
                  Soluções em Gás para Sua <span className="text-[#F26513]">Casa ou Empresa</span>
                </h2>
                <p className="text-xs md:text-sm text-[#33394D] leading-relaxed font-medium">
                  Confira nossos produtos com entrega rápida em toda a cidade de Lages/SC: botijão P13 residencial e cilindro P45 comercial, com opção de recarga ou completo sem casco.
                </p>
              </motion.div>
            </div>

            <ServicesShowcase onSelectService={(serviceId) => handleGoToOrderForm(serviceId)} />
          </div>
        </section>
        </Section3DWrapper>

        {/* 5. Diferenciais Section - Vibrant Orange Cards */}
        <Section3DWrapper sectionId="diferenciais" sectionColor="#FFFFFF">
        <section id="diferenciais" className="py-20 bg-white border-b border-[#FFE1CC] relative overflow-hidden">
          <HeroGeoPattern variant="light" />
          <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-12">
            <motion.div {...headerRevealProps} className="text-center max-w-3xl mx-auto space-y-3">
              <p className="text-xs uppercase tracking-widest text-[#F26513] font-extrabold">
                Por Que Pedir com a Gás da 7
              </p>
              <h2 className="text-2xl md:text-4xl font-extrabold text-[#121521] tracking-tight [text-wrap:balance]">
                Diferenciais do Nosso <span className="text-[#F26513]">Disk Gás em Lages</span>
              </h2>
            </motion.div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
              {DIFFERENTIALS.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.14, margin: "0px 0px -40px 0px" }}
                  transition={{ duration: 0.72, delay: (idx % 3) * 0.08, ease: PIKA_EASE }}
                  className="rounded-2xl p-7 text-left space-y-4 flex flex-col justify-between h-full bg-[#F26513] text-white border-2 border-[#d95308]"
                >
                  <div className="space-y-3.5">
                    <div className="inline-flex items-center justify-center px-3.5 py-2 rounded-xl font-extrabold bg-[#121521] text-[#00B8F4] border border-[#00B8F4]/40">
                      <Check className="w-5 h-5 stroke-[3]" />
                    </div>
                    <h3 className="text-base font-extrabold tracking-tight text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-white/95 font-medium">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        </Section3DWrapper>

        {/* 6. Segurança & Dicas GLP - Vibrant Orange Band */}
        <Section3DWrapper sectionId="seguranca" sectionColor="#F26513">
        <section className="py-20 bg-[#F26513] border-b border-[#d95308] overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 space-y-12">
            <motion.div {...headerRevealProps} className="text-center max-w-3xl mx-auto space-y-3">
              <p className="text-xs uppercase tracking-widest text-white/90 font-extrabold">
                Cuidados no Dia a Dia
              </p>
              <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight [text-wrap:balance]">
                Segurança em Primeiro Lugar na <span className="text-white underline">Sua Cozinha</span>
              </h2>
              <p className="text-xs md:text-sm text-white/95 leading-relaxed font-medium max-w-2xl mx-auto">
                Confira quatro cuidados essenciais ao receber e instalar o seu botijão de gás GLP em casa ou no comércio.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {SAFETY_TIPS.map((tip, idx) => (
                <motion.div
                  key={tip.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.7, delay: idx * 0.08, ease: PIKA_EASE }}
                  className="bg-white rounded-2xl p-6 space-y-3 border-2 border-[#121521]/10 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-[#121521] text-[#00B8F4] text-lg font-extrabold tabular-nums">
                        {tip.step}
                      </span>
                      <ShieldCheck className="w-5 h-5 text-[#F26513]" />
                    </div>
                    <h3 className="text-base font-extrabold text-[#121521] leading-snug">
                      {tip.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#33394D] leading-relaxed">
                      {tip.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        </Section3DWrapper>

        {/* 7. Contato & Pedido via WhatsApp Section */}
        <Section3DWrapper sectionId="contato" sectionColor="#FFFFFF">
        <section id="contato" className="py-20 bg-white border-b border-[#FFE1CC]">
          <div className="max-w-7xl mx-auto px-6 space-y-10">
            {/* Centered Header Above Form */}
            <motion.div {...headerRevealProps} className="text-center max-w-3xl mx-auto space-y-3">
              <p className="text-xs uppercase tracking-widest text-[#F26513] font-extrabold">
                Disk Gás em Lages · Atendimento em Toda a Cidade
              </p>
              <h2 className="text-2xl md:text-4xl font-extrabold text-[#121521] tracking-tight leading-tight [text-wrap:balance]">
                Peça Seu Gás em Lages Sem <span className="text-[#F26513]">Sair de Casa</span>
              </h2>
              <p className="text-xs md:text-sm text-[#33394D] leading-relaxed font-medium max-w-2xl mx-auto">
                Preencha os dados abaixo para solicitar o Disk Gás em qualquer bairro de Lages diretamente pelo nosso WhatsApp, ou ligue para nossa central no telefone fixo.
              </p>
            </motion.div>

            {/* Expanded Full-Width Order Form */}
            <div className="w-full max-w-6xl mx-auto">
              <ContactForm
                selectedProduct={selectedFormProduct}
                selectionNonce={selectionNonce}
              />
            </div>
          </div>
        </section>
        </Section3DWrapper>

        {/* 8. Localização, Mapa Interativo & Bairros Atendidos (Última Seção Antes do Rodapé) */}
        <Section3DWrapper sectionId="localizacao" sectionColor="#FFF9F5">
        <section id="localizacao" className="py-20 bg-[#FFF9F5] border-b border-[#FFE1CC]">
          <div className="max-w-7xl mx-auto px-6 space-y-10">
            <motion.div {...headerRevealProps} className="text-center max-w-3xl mx-auto space-y-3">
              <p className="text-xs uppercase tracking-widest text-[#F26513] font-extrabold">
                Disk Gás na Região de Lages/SC
              </p>
              <h2 className="text-2xl md:text-4xl font-extrabold text-[#121521] tracking-tight [text-wrap:balance]">
                Depósito em Lages com Entrega em <span className="text-[#F26513]">Toda a Cidade</span>
              </h2>
              <p className="text-xs md:text-sm text-[#33394D] leading-relaxed font-medium max-w-2xl mx-auto">
                Retire no balcão na Rua Sete de Setembro, 1749 (Bairro Santa Helena) ou peça pelo Disk Gás com tele-entrega rápida em toda a cidade de Lages e região.
              </p>
            </motion.div>

            {/* Depot Details + Interactive Google Map */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.75, ease: PIKA_EASE }}
                className="lg:col-span-5 bg-white border-2 border-[#FFE1CC] rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6"
              >
                <div className="space-y-5">
                  <div className="space-y-1 border-b border-[#FFE1CC] pb-4">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#F26513]">
                      Depósito Oficial · {APP_DETAILS.name}
                    </span>
                    <h3 className="text-xl font-extrabold text-[#121521]">
                      Atendimento Presencial & Disk Gás
                    </h3>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#F26513] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-extrabold text-[#121521]">{APP_DETAILS.address}</p>
                      <p className="text-xs text-[#33394D] mt-0.5 font-medium">{APP_DETAILS.cep}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-4 border-t border-[#FFE1CC]/70">
                    <Clock className="w-5 h-5 text-[#0095D1] shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm text-[#121521] space-y-1 font-semibold">
                      <div className="inline-flex items-center gap-1.5 text-xs font-extrabold mb-0.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            openStatus.isOpen ? "bg-[#25D366]" : "bg-[#33394D]/45"
                          }`}
                        />
                        <span className={openStatus.isOpen ? "text-[#15803D]" : "text-[#33394D]"}>
                          {openStatus.label}
                        </span>
                      </div>
                      <p>{APP_DETAILS.hoursWeekdays}</p>
                      <p>{APP_DETAILS.hoursSunday}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-4 border-t border-[#FFE1CC]/70">
                    <Phone className="w-5 h-5 text-[#F26513] shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm text-[#121521] space-y-1 font-semibold tabular-nums">
                      <p>
                        WhatsApp:{" "}
                        <a
                          href={`https://api.whatsapp.com/send?phone=${APP_DETAILS.phoneWhatsappRaw}&text=${encodeURIComponent("Olá Gás da 7! Gostaria de pedir um botijão de gás em Lages/SC.")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#121521] hover:text-[#F26513] underline decoration-[#FFE1CC] hover:decoration-[#F26513] transition-colors"
                        >
                          {APP_DETAILS.phoneWhatsapp}
                        </a>
                      </p>
                      <p>
                        Telefone Fixo:{" "}
                        <a
                          href={`tel:+${APP_DETAILS.phoneFixedRaw}`}
                          className="text-[#121521] hover:text-[#F26513] underline decoration-[#FFE1CC] hover:decoration-[#F26513] transition-colors"
                        >
                          {APP_DETAILS.phoneFixed}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 pt-2">
                  <a
                    href={APP_DETAILS.googleShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-[#00B8F4] text-[#121521] border-2 border-transparent hover:bg-white hover:text-[#121521] hover:border-[#121521] px-5 py-3.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap"
                  >
                    <span>Abrir no Google Maps</span>
                    <ExternalLink className="w-4 h-4 shrink-0" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleGoToOrderForm()}
                    className="inline-flex items-center justify-center gap-2 bg-[#F26513] text-white border-2 border-transparent hover:bg-white hover:text-[#F26513] hover:border-[#F26513] px-5 py-3.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap"
                  >
                    <span>Pedir Tele-Entrega</span>
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.75, ease: PIKA_EASE }}
                className="lg:col-span-7 w-full"
              >
                <LocationMap />
              </motion.div>
            </div>
          </div>
        </section>
        </Section3DWrapper>
      </main>

      {/* 9. Footer Section - Deep Brand Navy (#121521) */}
      <Section3DWrapper sectionId="rodape" sectionColor="#121521">
      <footer className="bg-[#121521] text-white pt-12 pb-24 md:py-12 font-sans text-xs overflow-hidden border-t-4 border-[#00B8F4]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.72, ease: PIKA_EASE }}
          className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-8"
        >
          <div className="space-y-4">
            <div className="flex items-center w-fit">
              <img
                alt="Gás da 7 Logo"
                className="h-10 md:h-12 w-auto object-contain"
                src={IMAGES.logoWhite}
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="text-white/85 max-w-md leading-relaxed space-y-1.5">
              <p>
                <strong className="text-[#00B8F4]">Endereço:</strong> {APP_DETAILS.address} · {APP_DETAILS.cep}
              </p>
              <p>
                <strong className="text-[#00B8F4]">Horário:</strong> {APP_DETAILS.hoursWeekdays} · {APP_DETAILS.hoursSunday}
              </p>
              <p className="tabular-nums">
                <strong className="text-[#00B8F4]">WhatsApp:</strong>{" "}
                <a
                  href={`https://api.whatsapp.com/send?phone=${APP_DETAILS.phoneWhatsappRaw}&text=${encodeURIComponent("Olá Gás da 7! Quero pedir um gás em Lages/SC.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#00B8F4] hover:underline transition-colors"
                >
                  {APP_DETAILS.phoneWhatsapp}
                </a>{" "}
                · <strong className="text-[#00B8F4]">Fixo:</strong>{" "}
                <a
                  href={`tel:+${APP_DETAILS.phoneFixedRaw}`}
                  className="hover:text-[#00B8F4] hover:underline transition-colors"
                >
                  {APP_DETAILS.phoneFixed}
                </a>
              </p>
              <p className="tabular-nums">
                <strong className="text-[#00B8F4]">CNPJ:</strong> {APP_DETAILS.cnpj}
              </p>

              <div className="flex items-center gap-3 pt-2">
                <a
                  href={`https://api.whatsapp.com/send?phone=${APP_DETAILS.phoneWhatsappRaw}&text=${encodeURIComponent("Olá Gás da 7! Quero pedir um gás em Lages/SC.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp Gás da 7"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#F26513] text-white hover:bg-white hover:text-[#F26513] transition-all font-extrabold"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={APP_DETAILS.googleShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Localização Gás da 7 no Google"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#00B8F4] text-[#121521] hover:bg-white hover:text-[#121521] transition-all font-extrabold"
                >
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>Ver no Mapa</span>
                </a>
              </div>
            </div>

            <p className="text-[11px] text-white/60 pt-2">
              © {new Date().getFullYear()} {APP_DETAILS.name}. Todos os direitos reservados.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 md:gap-12 text-white text-xs">
            <div className="space-y-2.5">
              <h5 className="font-extrabold text-[#00B8F4] border-b-2 border-[#00B8F4] pb-1 inline-block uppercase tracking-wider text-[11px]">
                Produtos & Serviços
              </h5>
              <a
                href="#contato"
                onClick={(e) => {
                  e.preventDefault();
                  handleGoToOrderForm("p13");
                }}
                className="block text-white/80 hover:text-[#00B8F4] hover:underline transition-colors"
              >
                Botijão P13 Residencial
              </a>
              <a
                href="#contato"
                onClick={(e) => {
                  e.preventDefault();
                  handleGoToOrderForm("p45");
                }}
                className="block text-white/80 hover:text-[#00B8F4] hover:underline transition-colors"
              >
                Cilindro P45 Comercial
              </a>
              <a
                href="#localizacao"
                onClick={(e) => scrollToSection(e, "#localizacao")}
                className="block text-white/80 hover:text-[#00B8F4] hover:underline transition-colors"
              >
                Localização & Mapa
              </a>
            </div>

            <div className="space-y-2.5 text-left">
              <h5 className="font-extrabold text-[#00B8F4] border-b-2 border-[#00B8F4] pb-1 inline-block uppercase tracking-wider text-[11px]">
                Informações
              </h5>
              <button
                onClick={() => openOfficialPage("abnt")}
                className="block text-left text-white/80 hover:text-[#00B8F4] hover:underline transition-colors cursor-pointer w-full"
              >
                Segurança & Normas ANP
              </button>
              <button
                onClick={() => openOfficialPage("terms")}
                className="block text-left text-white/80 hover:text-[#00B8F4] hover:underline transition-colors cursor-pointer w-full"
              >
                Política de Entrega
              </button>
              <button
                onClick={() => openOfficialPage("privacy")}
                className="block text-left text-white/80 hover:text-[#00B8F4] hover:underline transition-colors cursor-pointer w-full"
              >
                Privacidade (LGPD)
              </button>
            </div>
          </div>
        </motion.div>
      </footer>
      </Section3DWrapper>

      {/* Official Pages Modal Portal */}
      <OfficialPagesModal
        isOpen={isModalOpen}
        initialType={modalType}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Floating WhatsApp Action Button */}
      <a
        href={`https://api.whatsapp.com/send?phone=${APP_DETAILS.phoneWhatsappRaw}&text=${encodeURIComponent("Olá Gás da 7! Gostaria de pedir um botijão de gás em Lages/SC.")}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Pedir Gás via WhatsApp"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#1ebe5d] text-white p-4 rounded-full shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center border-2 border-white"
      >
        <WhatsAppIcon className="w-7 h-7 md:w-8 md:h-8 fill-white" />
      </a>
    </div>
  );
}
