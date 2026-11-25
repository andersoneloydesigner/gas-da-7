/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useAdvancedMarkerRef,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { MapPin, ExternalLink, Loader2, Navigation } from "lucide-react";
import { APP_DETAILS } from "../constants";

interface ResolvedPlace {
  position: google.maps.LatLngLiteral;
  displayName: string;
  formattedAddress: string;
  googleMapsURI: string;
}

const DEPOT_QUERIES = [
  "Gás da 7, Rua Sete de Setembro, 1749, Santa Helena, Lages - SC, Brasil",
  "Rua Sete de Setembro, 1749, Santa Helena, Lages - SC, 88504-453, Brasil",
];

function isQuotaError(error: unknown): boolean {
  if (!error) return false;
  const text =
    error instanceof Error
      ? `${error.name} ${error.message}`
      : typeof error === "object"
      ? JSON.stringify(error)
      : String(error);
  return (
    text.includes("RESOURCE_EXHAUSTED") ||
    text.includes("OVER_QUERY_LIMIT") ||
    text.includes("OverQuotaMapError") ||
    text.includes("QuotaExceededError") ||
    text.includes("429")
  );
}

const DepotMapInner: React.FC = () => {
  const placesLib = useMapsLibrary("places");
  const [markerRef, marker] = useAdvancedMarkerRef();

  const [placeData, setPlaceData] = useState<ResolvedPlace | null>(null);
  const [infoOpen, setInfoOpen] = useState(true);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!placesLib) return;

    let cancelled = false;

    const resolveDepotLocation = async () => {
      setStatus("loading");
      try {
        // Resolve coordinates dynamically via Places API (New) Text Search
        // Ref: https://developers.google.com/maps/documentation/javascript/place-search?utm_campaign=gmp_mcp_codeassist_v1_aistudio
        let matchedPlace: google.maps.places.Place | undefined;

        for (const textQuery of DEPOT_QUERIES) {
          const response = await placesLib.Place.searchByText({
            textQuery,
            fields: ["displayName", "formattedAddress", "location", "googleMapsURI"],
            language: "pt-BR",
            region: "br",
            maxResultCount: 1,
          });

          const firstMatch = response?.places?.[0];
          if (firstMatch?.location) {
            matchedPlace = firstMatch;
            break;
          }
        }

        if (cancelled) return;

        if (matchedPlace?.location) {
          const position: google.maps.LatLngLiteral = {
            lat: matchedPlace.location.lat(),
            lng: matchedPlace.location.lng(),
          };
          setPlaceData({
            position,
            displayName: matchedPlace.displayName || APP_DETAILS.name,
            formattedAddress: matchedPlace.formattedAddress || APP_DETAILS.address,
            googleMapsURI: matchedPlace.googleMapsURI || APP_DETAILS.googleShareUrl,
          });
          setStatus("ready");
        } else {
          setStatus("error");
        }
      } catch (err) {
        if (cancelled) return;
        if (isQuotaError(err)) {
          window.dispatchEvent(new CustomEvent("gmp-quota-exceeded"));
        }
        setStatus("error");
      }
    };

    void resolveDepotLocation();

    return () => {
      cancelled = true;
    };
  }, [placesLib]);

  if (status === "loading") {
    return (
      <div className="w-full h-[380px] sm:h-[420px] lg:h-[460px] bg-[#121521] flex flex-col items-center justify-center gap-3 p-6 text-center text-white">
        <Loader2 className="w-7 h-7 text-[#00B8F4] animate-spin" />
        <p className="text-sm font-bold tracking-tight">
          Carregando mapa da <span className="text-[#00B8F4]">Gás da 7</span> em Lages/SC...
        </p>
        <p className="text-xs text-white/70 max-w-xs">
          {APP_DETAILS.address}
        </p>
      </div>
    );
  }

  if (status === "error" || !placeData) {
    return (
      <div className="w-full h-[380px] sm:h-[420px] lg:h-[460px] bg-[#121521] flex flex-col items-center justify-center gap-4 p-8 text-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-[#00B8F4]/15 border-2 border-[#00B8F4] flex items-center justify-center">
          <MapPin className="w-6 h-6 text-[#00B8F4]" />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h3 className="text-base font-extrabold">{APP_DETAILS.name} · Depósito</h3>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            {APP_DETAILS.address} · {APP_DETAILS.cep}
          </p>
        </div>
        <a
          href={APP_DETAILS.googleShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#00B8F4] text-[#121521] hover:bg-white hover:text-[#121521] px-5 py-3 rounded-xl text-xs font-extrabold transition-all"
        >
          <Navigation className="w-4 h-4" />
          <span>Abrir no Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  return (
    <div className="w-full h-[380px] sm:h-[420px] lg:h-[460px] relative">
      <GoogleMap
        defaultCenter={placeData.position}
        defaultZoom={16}
        mapId="DEMO_MAP_ID"
        internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
        gestureHandling="cooperative"
        mapTypeControl={false}
        streetViewControl={true}
        fullscreenControl={true}
        className="w-full h-full"
      >
        <AdvancedMarker
          ref={markerRef}
          position={placeData.position}
          title={placeData.displayName}
          onClick={() => setInfoOpen((prev) => !prev)}
        >
          <Pin
            background="#F26513"
            borderColor="#121521"
            glyphColor="#FFFFFF"
            scale={1.15}
          />
        </AdvancedMarker>

        {infoOpen && marker && (
          <InfoWindow
            anchor={marker}
            onCloseClick={() => setInfoOpen(false)}
            maxWidth={280}
          >
            <div className="p-1 space-y-2 text-[#121521] font-sans">
              <div className="space-y-0.5">
                <p className="text-sm font-extrabold text-[#121521] leading-tight">
                  {APP_DETAILS.name}
                </p>
                <p className="text-xs text-[#33394D] leading-snug">
                  {placeData.formattedAddress}
                </p>
              </div>
              <div className="pt-1.5 border-t border-[#FFE1CC] flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-[#F26513]">
                  {APP_DETAILS.hoursShort}
                </span>
                <a
                  href={placeData.googleMapsURI}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#121521] hover:text-[#F26513] transition-colors shrink-0"
                >
                  <span>Rotas</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

const LocationMap: React.FC = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  if (!apiKey) {
    return (
      <div className="w-full h-[380px] sm:h-[420px] lg:h-[460px] bg-[#121521] rounded-2xl border-2 border-[#00B8F4] flex flex-col items-center justify-center gap-4 p-8 text-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-[#00B8F4]/15 border-2 border-[#00B8F4] flex items-center justify-center">
          <MapPin className="w-6 h-6 text-[#00B8F4]" />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h3 className="text-base font-extrabold">{APP_DETAILS.name} · Depósito</h3>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            {APP_DETAILS.address} · {APP_DETAILS.cep}
          </p>
        </div>
        <a
          href={APP_DETAILS.googleShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#00B8F4] text-[#121521] hover:bg-white hover:text-[#121521] px-5 py-3 rounded-xl text-xs font-extrabold transition-all"
        >
          <Navigation className="w-4 h-4" />
          <span>Ver no Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  return (
    <div
      data-map-container="true"
      className="w-full h-[380px] sm:h-[420px] lg:h-[460px] rounded-2xl overflow-hidden border-2 border-[#FFE1CC] bg-white"
    >
      <APIProvider
        apiKey={apiKey}
        language="pt-BR"
        region="BR"
        libraries={["places", "marker"]}
      >
        <DepotMapInner />
      </APIProvider>
    </div>
  );
};

export default LocationMap;
