/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ExternalLink, MapPin, Navigation } from "lucide-react";
import { APP_DETAILS } from "../constants";
import mapaLagesOsm from "../assets/images/mapa_lages_osm.png";

const LocationMap: React.FC = React.memo(() => {
  return (
    <div
      data-map-container="true"
      className="relative w-full h-[380px] sm:h-[420px] lg:h-[460px] rounded-2xl overflow-hidden border-2 border-[#FFE1CC] bg-[#f4efe6] group"
    >
      {/* Static high-definition street map print of Santa Helena, Lages/SC */}
      <a
        href={APP_DETAILS.googleShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Abrir localização da ${APP_DETAILS.name} no Google Maps`}
        className="block w-full h-full relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F26513]"
      >
        <img
          src={mapaLagesOsm}
          alt={`Mapa de localização do depósito ${APP_DETAILS.name} na ${APP_DETAILS.address}`}
          className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          loading="lazy"
        />

        {/* Subtle warm vignette for crisp card & pin contrast */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#121521]/30 via-transparent to-transparent"
        />

        {/* Floating Info Card directly above the depot pin */}
        <div
          style={{ left: "50%", top: "58%" }}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-[calc(100%+52px)] w-[250px] sm:w-[290px] bg-white rounded-xl border border-[#FFE1CC] shadow-[0_10px_28px_rgba(18,21,33,0.18)] p-3.5 text-left"
        >
          <p className="text-sm font-extrabold text-[#121521] leading-tight">
            {APP_DETAILS.name}
          </p>
          <p className="text-xs text-[#33394D] leading-snug mt-0.5">
            {APP_DETAILS.address} · {APP_DETAILS.cep}
          </p>
          <div className="mt-2 pt-2 border-t border-[#FFE1CC] flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-[#F26513]">
              {APP_DETAILS.hoursShort}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#121521] shrink-0">
              <span>Rotas</span>
              <ExternalLink className="w-3 h-3" />
            </span>
          </div>
          {/* Small downward pointer triangle */}
          <span
            aria-hidden="true"
            className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-[#FFE1CC] rotate-45"
          />
        </div>

        {/* Exact Depot Map Pin on Rua Sete de Setembro, 1749 */}
        <div
          style={{ left: "50%", top: "58%" }}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full flex flex-col items-center"
        >
          <span className="relative flex items-center justify-center">
            <span className="absolute -inset-2 rounded-full bg-[#F26513]/30 animate-ping" />
            <span className="relative w-10 h-10 rounded-full bg-[#F26513] border-[3px] border-white shadow-[0_6px_16px_rgba(18,21,33,0.35)] flex items-center justify-center text-white">
              <MapPin className="w-5 h-5 fill-white/20" />
            </span>
          </span>
          <span className="w-3 h-1.5 rounded-full bg-[#121521]/35 blur-[1px] -mt-0.5" />
        </div>
      </a>

      {/* Prominent CTA Button to Open Google Maps */}
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 pointer-events-none">
        <a
          href={APP_DETAILS.googleShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto inline-flex items-center gap-2 bg-[#121521] hover:bg-[#F26513] text-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl text-xs font-extrabold shadow-[0_8px_22px_rgba(18,21,33,0.32)] border border-white/15 transition-all active:translate-y-px"
        >
          <Navigation className="w-4 h-4 text-[#00B8F4] shrink-0" />
          <span>Ir para o Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
        </a>

        <span className="bg-white/90 backdrop-blur-sm text-[#33394D] text-[10px] font-semibold px-2 py-1 rounded-md border border-[#121521]/10">
          © OpenStreetMap
        </span>
      </div>
    </div>
  );
});

LocationMap.displayName = "LocationMap";

export default LocationMap;
