/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { Flame, Building2, Factory, ShieldCheck } from "lucide-react";
import { SERVICES, APP_DETAILS } from "../constants";

const SMOOTH_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface ServicesShowcaseProps {
  onSelectService: (serviceId: string) => void;
}

export default function ServicesShowcase({ onSelectService }: ServicesShowcaseProps) {
  const serviceIcons = [Flame, Building2, Factory, ShieldCheck];

  const handleWhatsAppDirect = () => {
    const msg = "Olá Gás da 7! Gostaria de pedir um botijão de gás para entrega em Lages/SC.";
    const link = document.createElement("a");
    link.href = `https://api.whatsapp.com/send?phone=${APP_DETAILS.phoneWhatsappRaw}&text=${encodeURIComponent(
      msg
    )}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {SERVICES.map((service, idx) => {
          const IconComponent = serviceIcons[idx % serviceIcons.length];

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
              onClick={() => onSelectService(service.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectService(service.id);
                }
              }}
              className="group rounded-2xl p-6 flex flex-col justify-between transition-colors duration-200 bg-white text-[#121521] border-2 border-[#FFE1CC] hover:border-[#F26513] cursor-pointer text-left"
            >
              <div>
                {/* Image Box */}
                <div className="relative aspect-[16/10] shrink-0 overflow-hidden rounded-xl mb-5 border border-[#FFE1CC] bg-[#FFF5EE]">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FFF5EE] to-[#FFE1CC]/60 text-[#F26513] gap-2">
                      <IconComponent className="w-10 h-10" />
                      <span className="text-xs font-bold">{service.name}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
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
                    {service.detailedDesc || service.description}
                  </p>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-[#FFE1CC]/70 flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-[#121521]/70">
                  Entrega em Lages · SC
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectService(service.id);
                  }}
                  className="bg-[#00B8F4] text-[#121521] border-2 border-transparent hover:bg-white hover:text-[#121521] hover:border-[#121521] px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  Pedir Agora
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Primary Section CTA */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.72, delay: 0.12, ease: SMOOTH_EASE }}
        className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2 w-full"
      >
        <button
          type="button"
          onClick={handleWhatsAppDirect}
          className="w-full sm:w-auto bg-[#F26513] text-white border-2 border-transparent px-8 py-4 min-h-[54px] rounded-xl hover:bg-white hover:text-[#F26513] hover:border-[#F26513] transition-all flex items-center justify-center active:translate-y-px cursor-pointer text-sm font-extrabold whitespace-nowrap"
        >
          <span>Pedir pelo WhatsApp</span>
        </button>
        <a
          href={`tel:+${APP_DETAILS.phoneFixedRaw}`}
          className="w-full sm:w-auto bg-[#00B8F4] text-[#121521] border-2 border-transparent px-7 py-4 min-h-[54px] rounded-xl hover:bg-white hover:text-[#121521] hover:border-[#121521] transition-all flex items-center justify-center cursor-pointer text-sm font-extrabold whitespace-nowrap"
        >
          <span>Ligar Disk Gás</span>
        </a>
      </motion.div>
    </div>
  );
}
