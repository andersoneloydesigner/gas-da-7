/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  CheckCircle2,
  MapPin,
  ChevronDown,
  Search,
  Loader2,
  ExternalLink,
  RotateCcw,
  Minus,
  Plus,
  AlertCircle,
} from "lucide-react";
import { APP_DETAILS, NEIGHBORHOODS_LAGES } from "../constants";
import {
  PRODUCT_OPTIONS,
  PAYMENT_OPTIONS,
  formatDailyOrderNumber,
  getLagesDateKey,
  createSequentialOrderInFirestore,
} from "../utils/orders";

const SMOOTH_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const OTHER_CITY_VALUE = "__OUTRO_MUNICIPIO__";

interface ContactFormProps {
  selectedProduct?: string;
  selectionNonce?: number;
}

export default function ContactForm({ selectedProduct, selectionNonce }: ContactFormProps) {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  // Interactive Address Flow
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [neighborhoodSearch, setNeighborhoodSearch] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>("");
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [complement, setComplement] = useState("");

  // Manual Other Municipality Fields
  const [otherCity, setOtherCity] = useState("");
  const [otherManualAddress, setOtherManualAddress] = useState("");

  const [productType, setProductType] = useState<string>(
    selectedProduct && (PRODUCT_OPTIONS as readonly string[]).includes(selectedProduct)
      ? selectedProduct
      : PRODUCT_OPTIONS[0]
  );
  const [productHighlight, setProductHighlight] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_OPTIONS[0]);
  const [notes, setNotes] = useState("");
  const [addressError, setAddressError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Confirmation & 2-second redirect flow
  const [orderStatus, setOrderStatus] = useState<"idle" | "confirming" | "redirected">("idle");
  const [orderNumber, setOrderNumber] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const timerRef = useRef<number | null>(null);
  const highlightTimerRef = useRef<number | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      if (highlightTimerRef.current !== null) window.clearTimeout(highlightTimerRef.current);
    };
  }, []);

  // Pre-fill product whenever a solution card or quick-select button is clicked
  useEffect(() => {
    if (!selectedProduct) return;
    if ((PRODUCT_OPTIONS as readonly string[]).includes(selectedProduct)) {
      setProductType(selectedProduct);
      if (orderStatus !== "idle") {
        if (timerRef.current !== null) {
          window.clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        setOrderStatus("idle");
      }
      setProductHighlight(true);
      if (highlightTimerRef.current !== null) {
        window.clearTimeout(highlightTimerRef.current);
      }
      highlightTimerRef.current = window.setTimeout(() => {
        setProductHighlight(false);
      }, 2600);
    }
  }, [selectedProduct, selectionNonce]);

  const isOtherCity = selectedNeighborhood === OTHER_CITY_VALUE;

  const filteredNeighborhoods = NEIGHBORHOODS_LAGES.filter((b) =>
    b.toLowerCase().includes(neighborhoodSearch.trim().toLowerCase())
  );

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    if (digits.length === 0) {
      setClientPhone("");
    } else if (digits.length <= 2) {
      setClientPhone(`(${digits}`);
    } else if (digits.length <= 6) {
      setClientPhone(`(${digits.slice(0, 2)}) ${digits.slice(2)}`);
    } else if (digits.length <= 10) {
      setClientPhone(`(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`);
    } else {
      setClientPhone(`(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`);
    }
  };

  const handleSelectNeighborhood = (value: string) => {
    setSelectedNeighborhood(value);
    setIsAddressOpen(false);
    setNeighborhoodSearch("");
    setAddressError("");
  };

  const handleSubmitWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setSubmitError("");

    if (clientName.trim().length < 2) {
      setSubmitError("Informe seu nome completo (mínimo 2 letras).");
      nameInputRef.current?.focus();
      return;
    }

    if (clientPhone.replace(/\D/g, "").length < 8) {
      setSubmitError("Informe um telefone ou WhatsApp válido com DDD.");
      return;
    }

    if (!selectedNeighborhood) {
      setAddressError("Clique em Endereço para selecionar o bairro da entrega.");
      setIsAddressOpen(true);
      return;
    }

    if (isOtherCity) {
      if (otherCity.trim().length < 2 || otherManualAddress.trim().length < 4) {
        setAddressError("Preencha o município e o endereço completo para continuar.");
        return;
      }
    } else {
      if (street.trim().length < 2 || houseNumber.trim().length < 1) {
        setAddressError("Preencha a rua e o número para a entrega.");
        return;
      }
    }

    setAddressError("");
    setIsSaving(true);

    const orderDate = getLagesDateKey();

    const formattedAddress = isOtherCity
      ? `${otherManualAddress.trim()} - Município: ${otherCity.trim()}`
      : `${street.trim()}, nº ${houseNumber.trim()}${
          complement.trim() ? ` (${complement.trim()})` : ""
        } - Bairro ${selectedNeighborhood}, Lages - SC`;

    let newOrderCode = formatDailyOrderNumber(orderDate, 1);

    try {
      const saved = await createSequentialOrderInFirestore({
        orderDate,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        neighborhood: isOtherCity ? "Outro Município" : selectedNeighborhood,
        city: isOtherCity ? otherCity.trim() : "Lages - SC",
        address: formattedAddress,
        isOtherCity,
        productType,
        quantity,
        paymentMethod,
        notes: notes.trim(),
      });
      newOrderCode = saved.orderNumber;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes("Quota exceeded")) {
        setIsSaving(false);
        setSubmitError(
          "Limite diário do sistema atingido no momento. Você ainda pode pedir diretamente pelo botão de WhatsApp."
        );
        return;
      }
      // Continue to WhatsApp so customer is never blocked from ordering gas even if offline
      console.error("Order save fallback notice:", errMsg);
    }

    const lines = [
      "Olá Gás da 7! Acabei de realizar um pedido pelo site:",
      "",
      `*Número do Pedido:* ${newOrderCode}`,
      `*Nome:* ${clientName.trim()}`,
      `*Telefone / WhatsApp:* ${clientPhone.trim()}`,
      `*Endereço de Entrega:* ${formattedAddress}`,
      `*Produto:* ${productType}`,
      `*Quantidade:* ${quantity} unidade${quantity > 1 ? "s" : ""}`,
      `*Pagamento na Entrega:* ${paymentMethod}`,
      notes.trim() ? `*Observações / Referência:* ${notes.trim()}` : "",
    ].filter(Boolean);

    const message = lines.join("\n");
    const url = `https://api.whatsapp.com/send?phone=${APP_DETAILS.phoneWhatsappRaw}&text=${encodeURIComponent(
      message
    )}`;

    setIsSaving(false);
    setOrderNumber(newOrderCode);
    setWhatsappUrl(url);
    setOrderStatus("confirming");

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      setOrderStatus("redirected");
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 2000);
  };

  const handleResetOrder = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setOrderStatus("idle");
    setOrderNumber("");
    setWhatsappUrl("");
  };

  return (
    <motion.div
      id="contato-oficial-dados"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.72, delay: 0.08, ease: SMOOTH_EASE }}
      className="w-full border-2 border-[#FFE1CC] bg-[#FFF5EE] rounded-2xl p-5 sm:p-7 md:p-8 lg:p-10"
    >
      {orderStatus !== "idle" ? (
        <div className="py-8 sm:py-10 px-4 text-center space-y-6 font-sans">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[#121521] flex items-center justify-center">
            {orderStatus === "confirming" ? (
              <Loader2 className="w-8 h-8 text-[#00B8F4] animate-spin" />
            ) : (
              <CheckCircle2 className="w-8 h-8 text-[#00B8F4]" />
            )}
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <span className="inline-block px-3.5 py-1 rounded-lg bg-[#121521] text-[#00B8F4] text-xs font-extrabold tracking-wider uppercase tabular-nums">
              Pedido {orderNumber}
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#121521] tracking-tight">
              Pedido confirmado!
            </h3>
            <p className="text-sm text-[#33394D] font-semibold">
              {orderStatus === "confirming"
                ? "Encaminhando para o WhatsApp da Gás da 7..."
                : "Seu pedido foi registrado e encaminhado para o WhatsApp da Gás da 7."}
            </p>
          </div>

          {/* 2-second loading bar */}
          {orderStatus === "confirming" && (
            <div className="max-w-xs mx-auto space-y-2">
              <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-[#FFE1CC]">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "linear" }}
                  className="h-full bg-[#F26513]"
                />
              </div>
              <p className="text-xs text-[#33394D] font-medium">
                Aguarde um instante, abrindo atendimento...
              </p>
            </div>
          )}

          {orderStatus === "redirected" && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#F26513] text-white border-2 border-transparent hover:bg-white hover:text-[#F26513] hover:border-[#F26513] px-6 py-3.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap"
              >
                <span>Abrir WhatsApp Agora</span>
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>
              <button
                type="button"
                onClick={handleResetOrder}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#00B8F4] text-[#121521] border-2 border-transparent hover:bg-white hover:text-[#121521] hover:border-[#121521] px-6 py-3.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span>Fazer Novo Pedido</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmitWhatsApp} className="space-y-5 font-sans">
          <div className="space-y-1 border-b border-[#FFE1CC] pb-4">
            <span className="text-xs uppercase tracking-wider text-[#F26513] font-extrabold">
              Pedido Rápido via Site & WhatsApp
            </span>
            <h3 className="font-extrabold text-xl md:text-2xl text-[#121521]">
              Peça Seu Gás em Lages Agora
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="clientName"
                className="block text-xs font-extrabold uppercase tracking-wider text-[#121521]"
              >
                Seu Nome *
              </label>
              <input
                ref={nameInputRef}
                id="clientName"
                type="text"
                required
                minLength={2}
                maxLength={120}
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: Maria Oliveira"
                className="w-full bg-white border border-[#FFE1CC] focus:border-[#F26513] focus:outline-none rounded-xl px-4 py-3 text-sm text-[#121521] placeholder:text-[#33394D]/45 font-medium transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="clientPhone"
                className="block text-xs font-extrabold uppercase tracking-wider text-[#121521]"
              >
                Telefone / WhatsApp *
              </label>
              <input
                id="clientPhone"
                type="tel"
                required
                minLength={14}
                maxLength={25}
                value={clientPhone}
                onChange={handlePhoneChange}
                placeholder="Ex: (49) 99999-9999"
                className="w-full bg-white border border-[#FFE1CC] focus:border-[#F26513] focus:outline-none rounded-xl px-4 py-3 text-sm text-[#121521] placeholder:text-[#33394D]/45 font-medium transition-colors"
              />
            </div>
          </div>

          {/* Interactive Address Selector -> Neighborhood -> Street & Number (or Other Municipality) */}
          <div className="space-y-2.5">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#121521]">
              Endereço de Entrega *
            </label>

            <button
              type="button"
              onClick={() => {
                setIsAddressOpen((prev) => !prev);
                setAddressError("");
              }}
              aria-expanded={isAddressOpen}
              className={`w-full bg-white border ${
                isAddressOpen || addressError ? "border-[#F26513]" : "border-[#FFE1CC]"
              } hover:border-[#F26513] rounded-xl px-4 py-3 text-sm text-left flex items-center justify-between gap-3 transition-colors cursor-pointer`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <MapPin className="w-4 h-4 text-[#F26513] shrink-0" />
                {selectedNeighborhood ? (
                  <span className="font-bold text-[#121521] truncate">
                    {isOtherCity
                      ? "Outro município (preenchimento manual)"
                      : `Bairro: ${selectedNeighborhood} — Lages/SC`}
                  </span>
                ) : (
                  <span className="text-[#33394D]/60 font-medium truncate">
                    Clique para escolher o bairro da entrega
                  </span>
                )}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#33394D] shrink-0 transition-transform duration-200 ${
                  isAddressOpen ? "rotate-180 text-[#F26513]" : ""
                }`}
              />
            </button>

            {/* Dropdown Panel: Neighborhood List + "A entrega é em outro município?" */}
            {isAddressOpen && (
              <div className="bg-white border-2 border-[#FFE1CC] rounded-xl p-3 space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#33394D]/60 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={neighborhoodSearch}
                    onChange={(e) => setNeighborhoodSearch(e.target.value)}
                    placeholder="Buscar bairro em Lages..."
                    className="w-full bg-[#FFF9F5] border border-[#FFE1CC] focus:border-[#F26513] focus:outline-none rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-[#121521] font-medium"
                  />
                </div>

                <div
                  data-allow-wheel="true"
                  className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-44 overflow-y-auto pr-1"
                >
                  {filteredNeighborhoods.map((bairro) => {
                    const active = selectedNeighborhood === bairro;
                    return (
                      <button
                        key={bairro}
                        type="button"
                        onClick={() => handleSelectNeighborhood(bairro)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold text-left transition-colors cursor-pointer truncate ${
                          active
                            ? "bg-[#121521] text-[#00B8F4]"
                            : "bg-[#FFF9F5] text-[#121521] hover:bg-[#F26513] hover:text-white"
                        }`}
                      >
                        {bairro}
                      </button>
                    );
                  })}
                  {filteredNeighborhoods.length === 0 && (
                    <p className="col-span-full text-xs text-[#33394D] py-2 text-center">
                      Nenhum bairro encontrado para "{neighborhoodSearch}".
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-[#FFE1CC]">
                  <button
                    type="button"
                    onClick={() => handleSelectNeighborhood(OTHER_CITY_VALUE)}
                    className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-extrabold flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isOtherCity
                        ? "bg-[#121521] text-[#00B8F4]"
                        : "bg-[#121521] text-white hover:text-[#00B8F4]"
                    }`}
                  >
                    <span>A entrega é em outro município?</span>
                    <span className="text-[11px] uppercase tracking-wider text-[#00B8F4]">
                      Preencher manual
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2A: Selected Lages Neighborhood -> Street & Number */}
            {selectedNeighborhood && !isOtherCity && (
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                <div className="sm:col-span-6 space-y-1">
                  <label
                    htmlFor="street"
                    className="block text-[11px] font-extrabold uppercase tracking-wider text-[#121521]"
                  >
                    Rua / Avenida *
                  </label>
                  <input
                    id="street"
                    type="text"
                    required
                    maxLength={150}
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Ex: Rua Sete de Setembro"
                    className="w-full bg-white border border-[#FFE1CC] focus:border-[#F26513] focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-[#121521] placeholder:text-[#33394D]/45 font-medium transition-colors"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label
                    htmlFor="houseNumber"
                    className="block text-[11px] font-extrabold uppercase tracking-wider text-[#121521]"
                  >
                    Número *
                  </label>
                  <input
                    id="houseNumber"
                    type="text"
                    required
                    maxLength={20}
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    placeholder="Ex: 1749"
                    className="w-full bg-white border border-[#FFE1CC] focus:border-[#F26513] focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-[#121521] placeholder:text-[#33394D]/45 font-medium transition-colors"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label
                    htmlFor="complement"
                    className="block text-[11px] font-extrabold uppercase tracking-wider text-[#121521]"
                  >
                    Compl.
                  </label>
                  <input
                    id="complement"
                    type="text"
                    maxLength={50}
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    placeholder="Apto / Casa"
                    className="w-full bg-white border border-[#FFE1CC] focus:border-[#F26513] focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-[#121521] placeholder:text-[#33394D]/45 font-medium transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Step 2B: Other Municipality -> Manual Fill */}
            {isOtherCity && (
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                <div className="sm:col-span-5 space-y-1">
                  <label
                    htmlFor="otherCity"
                    className="block text-[11px] font-extrabold uppercase tracking-wider text-[#121521]"
                  >
                    Município / Cidade *
                  </label>
                  <input
                    id="otherCity"
                    type="text"
                    required
                    maxLength={100}
                    value={otherCity}
                    onChange={(e) => setOtherCity(e.target.value)}
                    placeholder="Ex: Correia Pinto - SC"
                    className="w-full bg-white border border-[#FFE1CC] focus:border-[#F26513] focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-[#121521] placeholder:text-[#33394D]/45 font-medium transition-colors"
                  />
                </div>

                <div className="sm:col-span-7 space-y-1">
                  <label
                    htmlFor="otherManualAddress"
                    className="block text-[11px] font-extrabold uppercase tracking-wider text-[#121521]"
                  >
                    Endereço Completo (Bairro, Rua e Número) *
                  </label>
                  <input
                    id="otherManualAddress"
                    type="text"
                    required
                    maxLength={160}
                    value={otherManualAddress}
                    onChange={(e) => setOtherManualAddress(e.target.value)}
                    placeholder="Ex: Centro, Av. Principal, nº 120"
                    className="w-full bg-white border border-[#FFE1CC] focus:border-[#F26513] focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-[#121521] placeholder:text-[#33394D]/45 font-medium transition-colors"
                  />
                </div>
              </div>
            )}

            {addressError && (
              <p className="text-xs font-bold text-[#F26513]">{addressError}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-5 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="productType"
                  className="block text-xs font-extrabold uppercase tracking-wider text-[#121521]"
                >
                  Produto / Solução *
                </label>
                {productHighlight && (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0095D1]">
                    Pré-selecionado
                  </span>
                )}
              </div>
              <select
                id="productType"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className={`w-full bg-white rounded-xl px-3.5 py-3 text-sm text-[#121521] font-medium transition-all cursor-pointer focus:outline-none ${
                  productHighlight
                    ? "border-2 border-[#00B8F4] ring-2 ring-[#00B8F4]/30"
                    : "border border-[#FFE1CC] focus:border-[#F26513]"
                }`}
              >
                {PRODUCT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3 space-y-1.5">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#121521]">
                Quantidade *
              </label>
              <div className="flex items-center justify-between bg-white border border-[#FFE1CC] rounded-xl px-2 py-1.5 h-[46px]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Diminuir quantidade"
                  className="w-8 h-8 rounded-lg bg-[#FFF5EE] hover:bg-[#121521] text-[#121521] hover:text-[#00B8F4] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-extrabold text-[#121521] tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                  aria-label="Aumentar quantidade"
                  className="w-8 h-8 rounded-lg bg-[#FFF5EE] hover:bg-[#121521] text-[#121521] hover:text-[#00B8F4] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="sm:col-span-4 space-y-1.5">
              <label
                htmlFor="paymentMethod"
                className="block text-xs font-extrabold uppercase tracking-wider text-[#121521]"
              >
                Pagamento *
              </label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-white border border-[#FFE1CC] focus:border-[#F26513] focus:outline-none rounded-xl px-3.5 py-3 text-sm text-[#121521] font-medium transition-colors cursor-pointer"
              >
                {PAYMENT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="notes"
              className="block text-xs font-extrabold uppercase tracking-wider text-[#121521]"
            >
              Ponto de Referência ou Observações
            </label>
            <textarea
              id="notes"
              rows={2}
              maxLength={500}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Casa de esquina, precisa de troco para R$ 100, ou bloco/apartamento..."
              className="w-full bg-white border border-[#FFE1CC] focus:border-[#F26513] focus:outline-none rounded-xl px-4 py-3 text-sm text-[#121521] placeholder:text-[#33394D]/45 font-medium transition-colors resize-y"
            />
          </div>

          {submitError && (
            <div className="flex items-start gap-2.5 rounded-xl bg-white border border-[#F26513] px-4 py-3 text-xs font-bold text-[#F26513]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="pt-2 flex flex-col items-center w-full">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-[#00B8F4] text-[#121521] border-2 border-transparent py-4 px-6 min-h-[54px] rounded-xl hover:bg-white hover:text-[#121521] hover:border-[#121521] transition-all flex items-center justify-center gap-2 font-extrabold cursor-pointer text-sm active:translate-y-px whitespace-nowrap disabled:opacity-70"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isSaving ? "Registrando Pedido..." : "Enviar Pedido pelo WhatsApp"}</span>
            </button>
            <span className="text-xs text-[#121521]/75 font-medium mt-2.5 text-center">
              {APP_DETAILS.hoursShort} · Lages - SC
            </span>
          </div>
        </form>
      )}
    </motion.div>
  );
}
