/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useId } from "react";

interface HeroGeoPatternProps {
  variant?: "dark" | "light";
}

/**
 * Service-themed geometric backdrop texture for Gás da 7 sections.
 * - "dark" (Hero #inicio on #121521): Renders glowing geometric GLP motifs behind a
 *   frosted smoked-glass pane (backdrop-blur + specular glass sheen) so the shapes
 *   appear softly diffused through the glass behind the Hero copy and 3D mascot.
 * - "light" (#diferenciais on #FFFFFF): Clean crisp geometric pattern at subtle opacity.
 */
export default function HeroGeoPattern({ variant = "dark" }: HeroGeoPatternProps) {
  const uid = useId().replace(/:/g, "");
  const isLight = variant === "light";

  const hexId = `gas7-hex-grid-${uid}`;
  const diagId = `gas7-diag-lines-${uid}`;
  const maskGradId = `gas7-stage-mask-grad-${uid}`;
  const maskId = `gas7-hex-mask-${uid}`;
  const orangeGradId = `gas7-orange-grad-${uid}`;
  const cyanGradId = `gas7-cyan-grad-${uid}`;

  const neutralStroke = isLight ? "#121521" : "#FFFFFF";
  const hexStrokeOpacity = isLight ? 0.24 : 0.22;
  const diagStrokeOpacity = isLight ? 0.06 : 0.055;

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 ${
        isLight ? "" : "rounded-b-[2.5rem] md:rounded-b-[4rem]"
      }`}
    >
      {/* Layer 1: Geometric shapes & brand color glows positioned behind the glass */}
      <div className="absolute inset-0 opacity-95">
        {/* Atmospheric color glows refracting through the frosted glass */}
        <div
          className={`absolute -top-24 -left-24 w-[520px] h-[520px] rounded-full ${
            isLight ? "opacity-45" : "opacity-55"
          }`}
          style={{
            background: isLight
              ? "radial-gradient(circle, rgba(242,101,19,0.34) 0%, rgba(242,101,19,0.12) 45%, rgba(255,255,255,0) 74%)"
              : "radial-gradient(circle, rgba(242,101,19,0.52) 0%, rgba(242,101,19,0.16) 45%, rgba(18,21,33,0) 74%)",
          }}
        />
        <div
          className={`absolute top-1/2 right-[6%] -translate-y-1/2 w-[680px] h-[680px] rounded-full ${
            isLight ? "opacity-50" : "opacity-60"
          }`}
          style={{
            background: isLight
              ? "radial-gradient(circle, rgba(0,184,244,0.32) 0%, rgba(0,184,244,0.10) 48%, rgba(255,255,255,0) 74%)"
              : "radial-gradient(circle, rgba(0,184,244,0.46) 0%, rgba(0,184,244,0.14) 48%, rgba(18,21,33,0) 74%)",
          }}
        />
        <div
          className={`absolute -bottom-28 left-[34%] w-[460px] h-[460px] rounded-full ${
            isLight ? "opacity-35" : "opacity-40"
          }`}
          style={{
            background: isLight
              ? "radial-gradient(circle, rgba(0,184,244,0.26) 0%, rgba(242,101,19,0.12) 48%, rgba(255,255,255,0) 75%)"
              : "radial-gradient(circle, rgba(0,184,244,0.34) 0%, rgba(242,101,19,0.14) 48%, rgba(18,21,33,0) 75%)",
          }}
        />

        {/* Full-bleed procedural geometric SVG texture */}
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 1440 760"
        >
          <defs>
            {/* 1. GLP Hexagonal Molecular / Technical Grid Pattern */}
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
                strokeOpacity={hexStrokeOpacity}
                strokeWidth={isLight ? "1" : "1.35"}
              />
              <circle
                cx="32"
                cy="36.95"
                r={isLight ? "1.6" : "2.1"}
                fill="#00B8F4"
                fillOpacity={isLight ? 0.22 : 0.34}
              />
              <circle
                cx="0"
                cy="92.375"
                r={isLight ? "1.4" : "1.9"}
                fill="#F26513"
                fillOpacity={isLight ? 0.22 : 0.34}
              />
              <circle
                cx="64"
                cy="92.375"
                r={isLight ? "1.4" : "1.9"}
                fill="#F26513"
                fillOpacity={isLight ? 0.22 : 0.34}
              />
            </pattern>

            {/* 2. Fine Diagonal Technical Hatching */}
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
                stroke={neutralStroke}
                strokeOpacity={diagStrokeOpacity}
                strokeWidth="1"
              />
            </pattern>

            {/* Radial mask to balance visual weight */}
            <radialGradient
              id={maskGradId}
              cx={isLight ? "50%" : "65%"}
              cy="52%"
              r="72%"
            >
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity={isLight ? "0.75" : "1"} />
              <stop offset="60%" stopColor="#FFFFFF" stopOpacity={isLight ? "0.62" : "0.82"} />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity={isLight ? "0.45" : "0.42"} />
            </radialGradient>

            <linearGradient id={orangeGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F26513" stopOpacity={isLight ? "0.34" : "0.48"} />
              <stop offset="100%" stopColor="#F26513" stopOpacity={isLight ? "0.06" : "0.1"} />
            </linearGradient>

            <linearGradient id={cyanGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00B8F4" stopOpacity={isLight ? "0.32" : "0.42"} />
              <stop offset="100%" stopColor="#00B8F4" stopOpacity={isLight ? "0.05" : "0.08"} />
            </linearGradient>

            <mask id={maskId}>
              <rect width="1440" height="760" fill={`url(#${maskGradId})`} />
            </mask>
          </defs>

          {/* Base Hexagonal GLP Grid */}
          <rect
            width="1440"
            height="760"
            fill={`url(#${hexId})`}
            mask={`url(#${maskId})`}
          />
          <rect width="1440" height="760" fill={`url(#${diagId})`} />

          {/* Right-side Concentric Delivery Zone Radar */}
          <g transform="translate(1030, 395)">
            <circle
              r="345"
              fill="none"
              stroke="#00B8F4"
              strokeOpacity={isLight ? 0.16 : 0.28}
              strokeWidth={isLight ? "1.25" : "2"}
              strokeDasharray="10 10"
            />
            <circle
              r="275"
              fill="none"
              stroke="#00B8F4"
              strokeOpacity={isLight ? 0.2 : 0.34}
              strokeWidth={isLight ? "1" : "1.75"}
            />
            <circle
              r="205"
              fill="none"
              stroke="#F26513"
              strokeOpacity={isLight ? 0.22 : 0.42}
              strokeWidth={isLight ? "1.5" : "2.5"}
              strokeDasharray="24 12"
            />
            <circle
              r="142"
              fill={`url(#${cyanGradId})`}
              stroke="#00B8F4"
              strokeOpacity={isLight ? 0.25 : 0.44}
              strokeWidth={isLight ? "1" : "1.75"}
            />

            {/* Compass / Delivery Route Axis Crosshairs */}
            <line
              x1="-380"
              y1="0"
              x2="380"
              y2="0"
              stroke="#00B8F4"
              strokeOpacity={isLight ? 0.08 : 0.16}
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="-370"
              x2="0"
              y2="370"
              stroke="#00B8F4"
              strokeOpacity={isLight ? 0.08 : 0.16}
              strokeWidth="1"
            />

            {/* Outer Octagonal Pressure Gauge Ring */}
            <polygon
              points="0,-312 220,-220 312,0 220,220 0,312 -220,220 -312,0 -220,-220"
              fill="none"
              stroke={neutralStroke}
              strokeOpacity={isLight ? 0.08 : 0.14}
              strokeWidth="1.25"
            />

            {/* Waypoint Diamond Nodes on Delivery Radar */}
            <rect
              x="270"
              y="-5"
              width="12"
              height="12"
              transform="rotate(45 276 1)"
              fill="#F26513"
              fillOpacity={isLight ? 0.45 : 0.72}
            />
            <rect
              x="-282"
              y="-5"
              width="12"
              height="12"
              transform="rotate(45 -276 1)"
              fill="#00B8F4"
              fillOpacity={isLight ? 0.45 : 0.72}
            />
            <rect
              x="-6"
              y="-282"
              width="12"
              height="12"
              transform="rotate(45 0 -276)"
              fill="#00B8F4"
              fillOpacity={isLight ? 0.4 : 0.68}
            />
          </g>

          {/* Faceted Geometric Gas Flame Motifs (Brand GLP Identity) */}
          <g transform="translate(88, 128)" opacity="0.95">
            <polygon
              points="36,0 64,44 54,84 36,98 18,84 8,44"
              fill={`url(#${orangeGradId})`}
              stroke="#F26513"
              strokeOpacity={isLight ? 0.32 : 0.55}
              strokeWidth={isLight ? "1.25" : "2"}
            />
            <polygon
              points="36,34 50,60 44,82 36,90 28,82 22,60"
              fill={`url(#${cyanGradId})`}
              stroke="#00B8F4"
              strokeOpacity={isLight ? 0.4 : 0.65}
              strokeWidth={isLight ? "1" : "1.5"}
            />
          </g>

          {/* Stylized Geometric Cylinder Silhouette Wireframe */}
          <g transform="translate(565, 560)" opacity={isLight ? "0.65" : "0.85"}>
            <rect
              x="18"
              y="0"
              width="44"
              height="16"
              rx="5"
              fill="none"
              stroke="#00B8F4"
              strokeOpacity={isLight ? 0.22 : 0.45}
              strokeWidth={isLight ? "1.2" : "1.8"}
            />
            <path
              d="M12,34 Q40,14 68,34 L72,118 Q40,132 8,118 Z"
              fill={`url(#${cyanGradId})`}
              stroke="#00B8F4"
              strokeOpacity={isLight ? 0.22 : 0.45}
              strokeWidth={isLight ? "1.25" : "1.8"}
            />
            <line
              x1="10"
              y1="74"
              x2="70"
              y2="74"
              stroke="#F26513"
              strokeOpacity={isLight ? 0.3 : 0.55}
              strokeWidth="2"
              strokeDasharray="6 4"
            />
          </g>

          {/* Express Delivery Speed Chevrons (Top Right & Bottom Left) */}
          <g strokeLinecap="square" fill="none">
            <path
              d="M -20 620 L 65 535 L 150 620"
              stroke="#F26513"
              strokeOpacity={isLight ? 0.24 : 0.48}
              strokeWidth={isLight ? "3" : "4.5"}
            />
            <path
              d="M -20 660 L 65 575 L 150 660"
              stroke="#00B8F4"
              strokeOpacity={isLight ? 0.22 : 0.44}
              strokeWidth={isLight ? "2" : "3.5"}
            />
            <path
              d="M -20 700 L 65 615 L 150 700"
              stroke={neutralStroke}
              strokeOpacity={isLight ? 0.08 : 0.16}
              strokeWidth="2"
            />

            <path
              d="M 1190 48 L 1385 48 L 1285 235"
              stroke="#F26513"
              strokeOpacity={isLight ? 0.22 : 0.48}
              strokeWidth={isLight ? "4" : "6"}
            />
            <path
              d="M 1212 70 L 1358 70 L 1272 228"
              stroke="#00B8F4"
              strokeOpacity={isLight ? 0.18 : 0.38}
              strokeWidth={isLight ? "1.5" : "2.5"}
            />
          </g>

          {/* Angular Delivery Route Path */}
          <path
            d="M 120 695 L 430 695 L 515 610 L 690 610 L 765 535"
            fill="none"
            stroke="#00B8F4"
            strokeOpacity={isLight ? 0.2 : 0.38}
            strokeWidth={isLight ? "1.5" : "2.2"}
            strokeDasharray="8 8"
          />
          <polygon
            points="515,602 523,610 515,618 507,610"
            fill="#F26513"
            fillOpacity={isLight ? 0.5 : 0.78}
          />
          <polygon
            points="690,603 697,610 690,617 683,610"
            fill="#00B8F4"
            fillOpacity={isLight ? 0.5 : 0.78}
          />

          {/* Floating Subtle Geometric Hexagons */}
          <polygon
            points="615,120 645,137 645,172 615,189 585,172 585,137"
            fill={`url(#${orangeGradId})`}
            stroke="#F26513"
            strokeOpacity={isLight ? 0.24 : 0.48}
            strokeWidth={isLight ? "1.2" : "1.8"}
          />
          <polygon
            points="688,162 710,175 710,200 688,213 666,200 666,175"
            fill="none"
            stroke="#00B8F4"
            strokeOpacity={isLight ? 0.22 : 0.42}
            strokeWidth={isLight ? "1.2" : "1.6"}
          />
          <polygon
            points="1352,555 1392,578 1392,624 1352,647 1312,624 1312,578"
            fill={`url(#${cyanGradId})`}
            stroke="#00B8F4"
            strokeOpacity={isLight ? 0.24 : 0.46}
            strokeWidth={isLight ? "1.2" : "1.8"}
          />
        </svg>
      </div>

      {/* Layer 2: Frosted Glass Pane diffusing the geometric shapes */}
      {isLight ? (
        <>
          <div
            className="absolute inset-0 bg-white/48 backdrop-blur-[8px] backdrop-saturate-150 ring-1 ring-inset ring-white/70"
            style={{
              backgroundImage:
                "linear-gradient(130deg, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.22) 38%, rgba(0,184,244,0.06) 70%, rgba(242,101,19,0.06) 100%)",
            }}
          />

          {/* Subtle diagonal specular glass sheen reflection */}
          <div
            className="absolute -inset-y-12 left-[18%] w-[36%] -skew-x-12 opacity-45"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.65) 50%, rgba(255,255,255,0) 100%)",
            }}
          />
        </>
      ) : (
        <>
          <div
            className="absolute inset-0 bg-[#121521]/42 backdrop-blur-[8px] backdrop-saturate-150 ring-1 ring-inset ring-white/12 rounded-b-[2.5rem] md:rounded-b-[4rem]"
            style={{
              backgroundImage:
                "linear-gradient(130deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 34%, rgba(0,184,244,0.06) 68%, rgba(242,101,19,0.05) 100%)",
            }}
          />

          {/* Subtle diagonal specular glass sheen reflection */}
          <div
            className="absolute -inset-y-12 left-[18%] w-[36%] -skew-x-12 opacity-20"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0) 100%)",
            }}
          />

          {/* Soft readability vignette behind left copy column */}
          <div
            className="absolute inset-y-0 left-0 w-full lg:w-[52%] opacity-65"
            style={{
              background:
                "radial-gradient(ellipse at 25% 48%, rgba(18,21,33,0.68) 0%, rgba(18,21,33,0.28) 60%, rgba(18,21,33,0) 100%)",
            }}
          />
        </>
      )}
    </div>
  );
}
