/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { Flame, Building2, Check } from "lucide-react";
import { SERVICES } from "../constants";
import { formatBRL } from "../utils/orders";

const SMOOTH_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

type ShellMode = "com-casco" | "sem-casco";

interface ServicesShowcaseProps {
  onSelectService: (serviceId: string) => void;
}

export default function ServicesShowcase({ onSelectService }: ServicesShowcaseProps) {
  const serviceIcons = [Flame, Building2];
  const [selectedModeByService, setSelectedModeByService] = useState<Record<string, ShellMode>>({
    p13: "com-casco",
    p45: "com-casco",
  });

  const handleSelectMode = (serviceId: string, mode: ShellMode) => {
    setSelectedModeByService((prev) => ({ ...prev, [serviceId]: mode }));
  };

  return (
    <div className="w-full max-w-5xl mx-auto font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {SERVICES.map((service, idx) => {
          const IconComponent = serviceIcons[idx % serviceIcons.length];
          const activeMode: ShellMode = selectedModeByService[service.id] || "com-casco";
          const isRefillSelected = activeMode === "com-casco";
          const isWithoutShellSelected = activeMode === "sem-casco";

          return (
            <motion.div
              key={service.id}
              id={`service-card-${service.id}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.14, margin: "0px 0px -40px 0px" }}
              transition={{
                duration: 0.72,
                delay: (idx % 2) * 0.08,
                ease: SMOOTH_EASE,
              }}
              className="group rounded-2xl p-6 flex flex-col justify-between transition-colors duration-200 bg-white text-[#121521] border-2 border-[#FFE1CC] hover:border-[#F26513] text-left"
            >
              <div>
                {/* Product-Only Studio Image */}
                <div className="relative aspect-[4/3] shrink-0 overflow-hidden rounded-xl mb-5 border border-[#FFE1CC] bg-[#F5EFE6]">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-contain object-center transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#F26513] gap-2">
                      <IconComponent className="w-10 h-10" />
                      <span className="text-xs font-bold">{service.name}</span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-3">
                  {service.badge && (
                    <p className="text-xs font-semibold text-[#F26513] tracking-wide">
                      {service.badge}
                    </p>
                  )}

                  <div className="flex items-center gap-3">
                    <span className="p-2.5 rounded-xl shrink-0 bg-[#FFF5EE] text-[#F26513] border border-[#FFE1CC]">
                      <IconComponent className="w-5 h-5" />
                    </span>
                    <h3 className="font-extrabold text-lg md:text-xl tracking-tight leading-snug text-[#121521]">
                      {service.name}
                    </h3>
                  </div>

                  <p className="text-sm leading-relaxed text-[#33394D]">
                    {service.description}
                  </p>
                </div>

                {/* Interactive Selection: Com Casco vs Sem Casco */}
                <div className="mt-5 space-y-2.5">
                  <span className="block text-[11px] font-extrabold uppercase tracking-wider text-[#33394D]">
                    Selecione a opção desejada:
                  </span>
                  <div
                    role="radiogroup"
                    aria-label={`Opções para ${service.name}`}
                    className="grid grid-cols-2 gap-3"
                  >
                    <button
                      type="button"
                      role="radio"
                      aria-checked={isRefillSelected}
                      onClick={() => handleSelectMode(service.id, "com-casco")}
                      className={`rounded-xl p-3 text-left border-2 transition-all cursor-pointer ${
                        isRefillSelected
                          ? "bg-[#121521] text-white border-[#00B8F4]"
                          : "bg-[#FFF5EE] text-[#121521] border-[#FFE1CC] hover:border-[#F26513]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span
                          className={`text-[11px] font-extrabold uppercase tracking-wider ${
                            isRefillSelected ? "text-[#00B8F4]" : "text-[#F26513]"
                          }`}
                        >
                          Com Casco
                        </span>
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                            isRefillSelected
                              ? "bg-[#00B8F4] text-[#121521]"
                              : "border border-[#33394D]/35 bg-white"
                          }`}
                        >
                          {isRefillSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </span>
                      </div>
                      <span
                        className={`block text-[11px] font-medium mt-0.5 ${
                          isRefillSelected ? "text-white/75" : "text-[#33394D]"
                        }`}
                      >
                        Troca / Recarga
                      </span>
                      <span
                        className={`block text-base sm:text-lg font-extrabold tabular-nums mt-1 leading-tight ${
                          isRefillSelected ? "text-white" : "text-[#121521]"
                        }`}
                      >
                        {formatBRL(service.priceRefill)}{" "}
                        <span
                          className={`text-[11px] font-bold ${
                            isRefillSelected ? "text-[#00B8F4]" : "text-[#F26513]"
                          }`}
                        >
                          + frete
                        </span>
                      </span>
                    </button>

                    <button
                      type="button"
                      role="radio"
                      aria-checked={isWithoutShellSelected}
                      onClick={() => handleSelectMode(service.id, "sem-casco")}
                      className={`rounded-xl p-3 text-left border-2 transition-all cursor-pointer ${
                        isWithoutShellSelected
                          ? "bg-[#121521] text-white border-[#00B8F4]"
                          : "bg-[#FFF5EE] text-[#121521] border-[#FFE1CC] hover:border-[#F26513]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span
                          className={`text-[11px] font-extrabold uppercase tracking-wider ${
                            isWithoutShellSelected ? "text-[#00B8F4]" : "text-[#F26513]"
                          }`}
                        >
                          Sem Casco
                        </span>
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                            isWithoutShellSelected
                              ? "bg-[#00B8F4] text-[#121521]"
                              : "border border-[#33394D]/35 bg-white"
                          }`}
                        >
                          {isWithoutShellSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </span>
                      </div>
                      <span
                        className={`block text-[11px] font-medium mt-0.5 ${
                          isWithoutShellSelected ? "text-white/75" : "text-[#33394D]"
                        }`}
                      >
                        Botijão Completo
                      </span>
                      <span
                        className={`block text-base sm:text-lg font-extrabold tabular-nums mt-1 leading-tight ${
                          isWithoutShellSelected ? "text-white" : "text-[#121521]"
                        }`}
                      >
                        {formatBRL(service.priceWithoutShell)}{" "}
                        <span
                          className={`text-[11px] font-bold ${
                            isWithoutShellSelected ? "text-[#00B8F4]" : "text-[#F26513]"
                          }`}
                        >
                          + frete
                        </span>
                      </span>
                    </button>
                  </div>
                  <p className="text-[11px] font-medium text-[#33394D]">
                    * O valor do frete é informado pelo WhatsApp após o envio do pedido.
                  </p>
                </div>
              </div>

              {/* Single Order Button */}
              <div className="pt-5 mt-5 border-t border-[#FFE1CC]/70">
                <button
                  type="button"
                  onClick={() =>
                    onSelectService(isWithoutShellSelected ? service.semCascoId : service.id)
                  }
                  className="w-full bg-[#00B8F4] text-[#121521] border-2 border-transparent hover:bg-white hover:text-[#121521] hover:border-[#121521] px-4 py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap"
                >
                  Pedir Agora
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
