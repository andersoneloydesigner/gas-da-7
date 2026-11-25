/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";

interface TeleportSmokePuffProps {
  zone: "hero" | "servicos";
}

interface PuffConfig {
  id: number;
  x: number;
  y: number;
  size: number;
  rot: number;
  delay: number;
  dur: number;
  tint: "white" | "cyan" | "warm";
}

const SMOKE_PUFFS: PuffConfig[] = [
  { id: 1, x: -64, y: -42, size: 58, rot: -18, delay: 0, dur: 780, tint: "white" },
  { id: 2, x: 66, y: -38, size: 54, rot: 22, delay: 20, dur: 760, tint: "cyan" },
  { id: 3, x: -72, y: 18, size: 62, rot: -26, delay: 30, dur: 820, tint: "cyan" },
  { id: 4, x: 70, y: 24, size: 56, rot: 16, delay: 15, dur: 800, tint: "white" },
  { id: 5, x: 0, y: -74, size: 64, rot: 12, delay: 10, dur: 820, tint: "white" },
  { id: 6, x: -34, y: -64, size: 46, rot: -14, delay: 45, dur: 740, tint: "cyan" },
  { id: 7, x: 38, y: -60, size: 48, rot: 20, delay: 35, dur: 760, tint: "warm" },
  { id: 8, x: -42, y: 58, size: 52, rot: -20, delay: 25, dur: 780, tint: "white" },
  { id: 9, x: 44, y: 56, size: 50, rot: 24, delay: 40, dur: 780, tint: "cyan" },
  { id: 10, x: 0, y: 42, size: 60, rot: -10, delay: 0, dur: 740, tint: "white" },
  { id: 11, x: 4, y: -6, size: 78, rot: 8, delay: 0, dur: 640, tint: "white" },
];

const SPARKS = [
  { id: 1, x: -86, y: -62, delay: 30, color: "#00B8F4" },
  { id: 2, x: 88, y: -54, delay: 55, color: "#F26513" },
  { id: 3, x: -78, y: 56, delay: 75, color: "#F26513" },
  { id: 4, x: 82, y: 58, delay: 45, color: "#00B8F4" },
];

/**
 * Cartoon comic-style smoke cloud burst ("fumacinha") rendered right at the
 * mascot landing dock whenever the 3D botijão teleports into view.
 */
export default function TeleportSmokePuff({ zone }: TeleportSmokePuffProps) {
  const [burstId, setBurstId] = useState(0);

  useEffect(() => {
    const handleTeleport = (e: Event) => {
      const custom = e as CustomEvent<{ target?: string }>;
      if (custom.detail?.target === zone) {
        setBurstId((prev) => prev + 1);
      }
    };
    window.addEventListener("gas7-mascot-teleport", handleTeleport);
    return () => window.removeEventListener("gas7-mascot-teleport", handleTeleport);
  }, [zone]);

  if (burstId === 0) return null;

  return (
    <div
      key={burstId}
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 overflow-visible"
    >
      {/* Quick expanding cyan teleport ring */}
      <div className="animate-gas-ring absolute w-28 h-28 rounded-full border-[3px] border-[#00B8F4]/75 bg-[#00B8F4]/10" />

      {/* Layered fluffy comic smoke puffs */}
      {SMOKE_PUFFS.map((p) => {
        const bgClass =
          p.tint === "cyan"
            ? "bg-[#DFF7FF] border-[#00B8F4]/45"
            : p.tint === "warm"
            ? "bg-[#FFF3E8] border-[#F26513]/35"
            : "bg-white border-[#121521]/18";

        return (
          <div
            key={p.id}
            className={`animate-gas-smoke absolute rounded-full border-2 shadow-sm ${bgClass}`}
            style={
              {
                width: `${p.size}px`,
                height: `${p.size}px`,
                "--puff-x": `${p.x}px`,
                "--puff-y": `${p.y}px`,
                "--puff-rot": `${p.rot}deg`,
                "--puff-delay": `${p.delay}ms`,
                "--puff-dur": `${p.dur}ms`,
              } as React.CSSProperties
            }
          />
        );
      })}

      {/* 4-point cartoon sparkles popping out of the smoke */}
      {SPARKS.map((s) => (
        <svg
          key={s.id}
          viewBox="0 0 24 24"
          className="animate-gas-spark absolute w-5 h-5"
          style={
            {
              "--spark-x": `${s.x}px`,
              "--spark-y": `${s.y}px`,
              "--spark-delay": `${s.delay}ms`,
            } as React.CSSProperties
          }
        >
          <path
            d="M12 1 L14.8 9.2 L23 12 L14.8 14.8 L12 23 L9.2 14.8 L1 12 L9.2 9.2 Z"
            fill={s.color}
          />
        </svg>
      ))}
    </div>
  );
}
