/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useId } from "react";
import heroDepotBg from "../assets/images/deposito_botijoes_hero_1795641108578.jpg";

interface HeroGeoPatternProps {
  variant?: "dark" | "light";
}

/**
 * Brand backdrop layer for Gás da 7 sections.
 * - "dark" (Hero #inicio): Full-bleed gas cylinder depot photograph seen through a
 *   frosted glass pane with a warm brand orange-to-navy gradient and specular sheen.
 * - "light" (#diferenciais on #FFFFFF): Service-themed geometric GLP pattern behind
 *   a light frosted glass pane.
 */
export default function HeroGeoPattern({ variant = "dark" }: HeroGeoPatternProps) {
  const uid = useId().replace(/:/g, "");
  const isLight = variant === "light";

  // Hero Dark Variant: Gas Depot Photo + Orange Gradient + Frosted Glass Effect
  if (!isLight) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 rounded-b-[2.5rem] md:rounded-b-[4rem]"
      >
        {/* Layer 1: Full-bleed photograph of a gas cylinder depot */}
        <img
          src={heroDepotBg}
          alt=""
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center scale-[1.03]"
        />

        {/* Layer 2: Warm orange brand gradient & ambient color glows */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(122deg, rgba(18,21,33,0.78) 0%, rgba(18,21,33,0.52) 44%, rgba(242,101,19,0.34) 76%, rgba(242,101,19,0.56) 100%)",
          }}
        />
        <div
          className="absolute -top-24 -left-24 w-[560px] h-[560px] rounded-full opacity-60"
          style={{
            background:
              "radial-gradient(circle, rgba(242,101,19,0.55) 0%, rgba(242,101,19,0.18) 46%, rgba(18,21,33,0) 74%)",
          }}
        />
        <div
          className="absolute -bottom-28 right-[8%] w-[580px] h-[580px] rounded-full opacity-45"
          style={{
            background:
              "radial-gradient(circle, rgba(242,101,19,0.48) 0%, rgba(0,184,244,0.18) 52%, rgba(18,21,33,0) 76%)",
          }}
        />

        {/* Layer 3: Frosted Glass Pane (keeps depot cylinders recognizable through the glass) */}
        <div
          className="absolute inset-0 bg-[#121521]/28 backdrop-blur-[5px] backdrop-saturate-125 ring-1 ring-inset ring-white/15 rounded-b-[2.5rem] md:rounded-b-[4rem]"
          style={{
            backgroundImage:
              "linear-gradient(132deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 34%, rgba(242,101,19,0.08) 72%, rgba(0,184,244,0.06) 100%)",
          }}
        />

        {/* Diagonal specular glass reflection band */}
        <div
          className="absolute -inset-y-12 left-[18%] w-[36%] -skew-x-12 opacity-22"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.24) 50%, rgba(255,255,255,0) 100%)",
          }}
        />

        {/* Soft readability vignette behind Hero left copy column */}
        <div
          className="absolute inset-y-0 left-0 w-full lg:w-[54%] opacity-75"
          style={{
            background:
              "radial-gradient(ellipse at 24% 48%, rgba(18,21,33,0.72) 0%, rgba(18,21,33,0.34) 58%, rgba(18,21,33,0) 100%)",
          }}
        />
      </div>
    );
  }

  // Light Variant (#diferenciais): Geometric GLP Pattern + Frosted White Glass
  const hexId = `gas7-hex-grid-${uid}`;
  const diagId = `gas7-diag-lines-${uid}`;
  const maskGradId = `gas7-stage-mask-grad-${uid}`;
  const maskId = `gas7-hex-mask-${uid}`;
  const orangeGradId = `gas7-orange-grad-${uid}`;
  const cyanGradId = `gas7-cyan-grad-${uid}`;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
    >
      {/* Layer 1: Geometric shapes & brand color glows positioned behind the glass */}
      <div className="absolute inset-0 opacity-95">
        <div
          className="absolute -top-24 -left-24 w-[520px] h-[520px] rounded-full opacity-45"
          style={{
            background:
              "radial-gradient(circle, rgba(242,101,19,0.34) 0%, rgba(242,101,19,0.12) 45%, rgba(255,255,255,0) 74%)",
          }}
        />
        <div
          className="absolute top-1/2 right-[6%] -translate-y-1/2 w-[680px] h-[680px] rounded-full opacity-50"
          style={{
            background:
              "radial-gradient(circle, rgba(0,184,244,0.32) 0%, rgba(0,184,244,0.10) 48%, rgba(255,255,255,0) 74%)",
          }}
        />
        <div
          className="absolute -bottom-28 left-[34%] w-[460px] h-[460px] rounded-full opacity-35"
          style={{
            background:
              "radial-gradient(circle, rgba(0,184,244,0.26) 0%, rgba(242,101,19,0.12) 48%, rgba(255,255,255,0) 75%)",
          }}
        />

        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 1440 760"
        >
          <defs>
            <pattern
              id={hexId}
              width="64"
              height="110.85"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M32 0 L64 18.475 L64 55.425 L32 73.9 L0 55.425 L0 18.475 Z M32 73.9 L32 110.85 M0 55.425 L-32 73.9 M64 55.425 L96 73.9"
                fill="none"
                stroke="#00B8F4"
                strokeOpacity={0.24}
                strokeWidth="1"
              />
              <circle cx="32" cy="36.95" r="1.6" fill="#00B8F4" fillOpacity={0.22} />
              <circle cx="0" cy="92.375" r="1.4" fill="#F26513" fillOpacity={0.22} />
              <circle cx="64" cy="92.375" r="1.4" fill="#F26513" fillOpacity={0.22} />
            </pattern>

            <pattern
              id={diagId}
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(32)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="28"
                stroke="#121521"
                strokeOpacity={0.06}
                strokeWidth="1"
              />
            </pattern>

            <radialGradient id={maskGradId} cx="50%" cy="52%" r="72%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
              <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.62" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.45" />
            </radialGradient>

            <linearGradient id={orangeGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F26513" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#F26513" stopOpacity="0.06" />
            </linearGradient>

            <linearGradient id={cyanGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00B8F4" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#00B8F4" stopOpacity="0.05" />
            </linearGradient>

            <mask id={maskId}>
              <rect width="1440" height="760" fill={`url(#${maskGradId})`} />
            </mask>
          </defs>

          <rect
            width="1440"
            height="760"
            fill={`url(#${hexId})`}
            mask={`url(#${maskId})`}
          />
          <rect width="1440" height="760" fill={`url(#${diagId})`} />

          <g transform="translate(1030, 395)">
            <circle
              r="345"
              fill="none"
              stroke="#00B8F4"
              strokeOpacity={0.16}
              strokeWidth="1.25"
              strokeDasharray="10 10"
            />
            <circle
              r="275"
              fill="none"
              stroke="#00B8F4"
              strokeOpacity={0.2}
              strokeWidth="1"
            />
            <circle
              r="205"
              fill="none"
              stroke="#F26513"
              strokeOpacity={0.22}
              strokeWidth="1.5"
              strokeDasharray="24 12"
            />
            <circle
              r="142"
              fill={`url(#${cyanGradId})`}
              stroke="#00B8F4"
              strokeOpacity={0.25}
              strokeWidth="1"
            />
            <line
              x1="-380"
              y1="0"
              x2="380"
              y2="0"
              stroke="#00B8F4"
              strokeOpacity={0.08}
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="-370"
              x2="0"
              y2="370"
              stroke="#00B8F4"
              strokeOpacity={0.08}
              strokeWidth="1"
            />
            <polygon
              points="0,-312 220,-220 312,0 220,220 0,312 -220,220 -312,0 -220,-220"
              fill="none"
              stroke="#121521"
              strokeOpacity={0.08}
              strokeWidth="1.25"
            />
            <rect
              x="270"
              y="-5"
              width="12"
              height="12"
              transform="rotate(45 276 1)"
              fill="#F26513"
              fillOpacity={0.45}
            />
            <rect
              x="-282"
              y="-5"
              width="12"
              height="12"
              transform="rotate(45 -276 1)"
              fill="#00B8F4"
              fillOpacity={0.45}
            />
            <rect
              x="-6"
              y="-282"
              width="12"
              height="12"
              transform="rotate(45 0 -276)"
              fill="#00B8F4"
              fillOpacity={0.4}
            />
          </g>

          <g transform="translate(88, 128)" opacity="0.95">
            <polygon
              points="36,0 64,44 54,84 36,98 18,84 8,44"
              fill={`url(#${orangeGradId})`}
              stroke="#F26513"
              strokeOpacity={0.32}
              strokeWidth="1.25"
            />
            <polygon
              points="36,34 50,60 44,82 36,90 28,82 22,60"
              fill={`url(#${cyanGradId})`}
              stroke="#00B8F4"
              strokeOpacity={0.4}
              strokeWidth="1"
            />
          </g>

          <g transform="translate(565, 560)" opacity="0.65">
            <rect
              x="18"
              y="0"
              width="44"
              height="16"
              rx="5"
              fill="none"
              stroke="#00B8F4"
              strokeOpacity={0.22}
              strokeWidth="1.2"
            />
            <path
              d="M12,34 Q40,14 68,34 L72,118 Q40,132 8,118 Z"
              fill={`url(#${cyanGradId})`}
              stroke="#00B8F4"
              strokeOpacity={0.22}
              strokeWidth="1.25"
            />
            <line
              x1="10"
              y1="74"
              x2="70"
              y2="74"
              stroke="#F26513"
              strokeOpacity={0.3}
              strokeWidth="2"
              strokeDasharray="6 4"
            />
          </g>

          <g strokeLinecap="square" fill="none">
            <path
              d="M -20 620 L 65 535 L 150 620"
              stroke="#F26513"
              strokeOpacity={0.24}
              strokeWidth="3"
            />
            <path
              d="M -20 660 L 65 575 L 150 660"
              stroke="#00B8F4"
              strokeOpacity={0.22}
              strokeWidth="2"
            />
            <path
              d="M -20 700 L 65 615 L 150 700"
              stroke="#121521"
              strokeOpacity={0.08}
              strokeWidth="2"
            />
            <path
              d="M 1190 48 L 1385 48 L 1285 235"
              stroke="#F26513"
              strokeOpacity={0.22}
              strokeWidth="4"
            />
            <path
              d="M 1212 70 L 1358 70 L 1272 228"
              stroke="#00B8F4"
              strokeOpacity={0.18}
              strokeWidth="1.5"
            />
          </g>

          <path
            d="M 120 695 L 430 695 L 515 610 L 690 610 L 765 535"
            fill="none"
            stroke="#00B8F4"
            strokeOpacity={0.2}
            strokeWidth="1.5"
            strokeDasharray="8 8"
          />
          <polygon
            points="515,602 523,610 515,618 507,610"
            fill="#F26513"
            fillOpacity={0.5}
          />
          <polygon
            points="690,603 697,610 690,617 683,610"
            fill="#00B8F4"
            fillOpacity={0.5}
          />

          <polygon
            points="615,120 645,137 645,172 615,189 585,172 585,137"
            fill={`url(#${orangeGradId})`}
            stroke="#F26513"
            strokeOpacity={0.24}
            strokeWidth="1.2"
          />
          <polygon
            points="688,162 710,175 710,200 688,213 666,200 666,175"
            fill="none"
            stroke="#00B8F4"
            strokeOpacity={0.22}
            strokeWidth="1.2"
          />
          <polygon
            points="1352,555 1392,578 1392,624 1352,647 1312,624 1312,578"
            fill={`url(#${cyanGradId})`}
            stroke="#00B8F4"
            strokeOpacity={0.24}
            strokeWidth="1.2"
          />
        </svg>
      </div>

      {/* Layer 2: Frosted White Glass Pane */}
      <div
        className="absolute inset-0 bg-white/48 backdrop-blur-[8px] backdrop-saturate-150 ring-1 ring-inset ring-white/70"
        style={{
          backgroundImage:
            "linear-gradient(130deg, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.22) 38%, rgba(0,184,244,0.06) 70%, rgba(242,101,19,0.06) 100%)",
        }}
      />
      <div
        className="absolute -inset-y-12 left-[18%] w-[36%] -skew-x-12 opacity-45"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.65) 50%, rgba(255,255,255,0) 100%)",
        }}
      />
    </div>
  );
}
