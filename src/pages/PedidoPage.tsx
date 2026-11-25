/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ArrowLeft, Flame, Building2, Factory, ShieldCheck, Phone, Clock } from "lucide-react";
import { APP_DETAILS, IMAGES } from "../constants";
import ContactForm from "../components/ContactForm";
import WhatsAppIcon from "../components/WhatsAppIcon";
import { PRODUCT_OPTIONS, resolveProductFromKey } from "../utils/orders";

interface PedidoPageProps {
  onNavigate: (path: string) => void;
  initialProductKey?: string | null;
}

const QUICK_PRODUCTS = [
  {
    key: "p13",
    title: "Botijão P13",
    subtitle: "13 kg · Residencial",
    productValue: PRODUCT_OPTIONS[0],
    icon: Flame,
  },
  {
    key: "p20",
    title: "Gás P20",
    subtitle: "20 kg · Empilhadeira",
    productValue: PRODUCT_OPTIONS[1],
    icon: Factory,
  },
  {
    key: "p45",
    title: "Cilindro P45",
    subtitle: "45 kg · Comercial",
    productValue: PRODUCT_OPTIONS[2],
    icon: Building2,
  },
  {
    key: "seguranca",
    title: "Instalação",
    subtitle: "Conferência Segura",
    productValue: PRODUCT_OPTIONS[3],
    icon: ShieldCheck,
  },
];

export default function PedidoPage({ onNavigate, initialProductKey }: PedidoPageProps) {
  const [selectedProduct, setSelectedProduct] = useState<string>(
    resolveProductFromKey(initialProductKey) || PRODUCT_OPTIONS[0]
  );
  const [selectionNonce, setSelectionNonce] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const resolved = resolveProductFromKey(initialProductKey);
    if (resolved) {
      setSelectedProduct(resolved);
      setSelectionNonce((n) => n + 1);
    }
  }, [initialProductKey]);

  const handleQuickSelect = (productValue: string) => {
    setSelectedProduct(productValue);
    setSelectionNonce((n) => n + 1);
  };

  return (
    <div className="min-h-screen bg-[#FFF9F5] text-[#121521] flex flex-col font-sans selection:bg-[#F26513] selection:text-white">
      {/* Top Bar */}
      <header className="bg-[#121521] text-white border-b-4 border-[#00B8F4] sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onNavigate("/")}
            className="flex items-center gap-3 cursor-pointer group"
            aria-label="Voltar para o site da Gás da 7"
          >
            <img
              src={IMAGES.logoWhite}
              alt="Gás da 7 Logo"
              className="h-8 w-auto object-contain transition-transform group-hover:scale-[1.03]"
              referrerPolicy="no-referrer"
            />
          </button>

          <button
            type="button"
            onClick={() => onNavigate("/")}
            className="inline-flex items-center gap-2 bg-[#00B8F4] text-[#121521] hover:bg-white hover:text-[#121521] px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Voltar ao Site</span>
          </button>
        </div>
      </header>

      {/* Focused Order Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
        <div className="text-center space-y-2.5 max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-[#F26513] font-extrabold">
            Disk Gás em Toda a Cidade de Lages/SC
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#121521] tracking-tight">
            Faça Seu Pedido de Gás <span className="text-[#F26513]">Online</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#33394D] font-medium">
            Escolha o botijão abaixo, informe seu endereço de entrega e confirme em segundos.
          </p>
        </div>

        {/* Quick Product Pre-Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_PRODUCTS.map((item) => {
            const Icon = item.icon;
            const isActive = selectedProduct === item.productValue;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleQuickSelect(item.productValue)}
                className={`rounded-2xl p-3.5 text-left border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isActive
                    ? "bg-[#121521] text-white border-[#00B8F4]"
                    : "bg-white text-[#121521] border-[#FFE1CC] hover:border-[#F26513]"
                }`}
              >
                <span
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isActive ? "bg-[#00B8F4]/20 text-[#00B8F4]" : "bg-[#FFF5EE] text-[#F26513]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <div>
                  <span className="block text-sm font-extrabold leading-tight">{item.title}</span>
                  <span
                    className={`block text-[11px] font-semibold mt-0.5 ${
                      isActive ? "text-[#00B8F4]" : "text-[#33394D]"
                    }`}
                  >
                    {item.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Order Form */}
        <ContactForm selectedProduct={selectedProduct} selectionNonce={selectionNonce} />

        {/* Quick Support Bar */}
        <div className="bg-white border-2 border-[#FFE1CC] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 text-[#121521]">
            <Clock className="w-5 h-5 text-[#F26513] shrink-0" />
            <div>
              <p className="font-extrabold">{APP_DETAILS.hoursWeekdays}</p>
              <p className="text-[#33394D] font-medium">{APP_DETAILS.hoursSunday}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
            <a
              href={`tel:+${APP_DETAILS.phoneFixedRaw}`}
              className="inline-flex items-center justify-center gap-2 bg-[#00B8F4] text-[#121521] border-2 border-transparent hover:bg-white hover:border-[#121521] px-4 py-2.5 rounded-xl font-extrabold transition-all whitespace-nowrap"
            >
              <Phone className="w-4 h-4 shrink-0" />
              <span>Ligar Disk Gás</span>
            </a>
            <a
              href={`https://api.whatsapp.com/send?phone=${APP_DETAILS.phoneWhatsappRaw}&text=${encodeURIComponent(
                "Olá Gás da 7! Gostaria de pedir um botijão de gás em Lages/SC."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#F26513] text-white border-2 border-transparent hover:bg-white hover:text-[#F26513] hover:border-[#F26513] px-4 py-2.5 rounded-xl font-extrabold transition-all whitespace-nowrap"
            >
              <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </main>

      <footer className="bg-[#121521] text-white/75 py-6 px-4 text-center text-xs border-t-4 border-[#00B8F4]">
        <p>
          © {new Date().getFullYear()} {APP_DETAILS.name} · {APP_DETAILS.address}
        </p>
      </footer>
    </div>
  );
}
