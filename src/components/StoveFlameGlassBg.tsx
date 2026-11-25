/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from "react";
import stoveBurnerImg from "../assets/images/fogao_queimador_bg_1795649774389.jpg";

/**
 * Animated Gas Stove Ignition Backdrop + Frosted Glass Overlay for #servicos.
 * Renders a photorealistic gas burner with a live 60fps bluish stove-flame ignition loop
 * (piezo spark -> 360° circular ring ignition -> dancing cobalt/cyan-blue flames + glass reflection),
 * viewed behind a frosted glassmorphism blur pane.
 */
export default function StoveFlameGlassBg() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let isDisposed = false;
    let isVisible = true;
    let rafId = 0;
    let width = container.clientWidth || 1280;
    let height = container.clientHeight || 780;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const img = new Image();
    img.src = stoveBurnerImg;
    let imgReady = img.complete && img.naturalWidth > 0;
    img.onload = () => {
      imgReady = true;
      if (prefersReducedMotion) drawFrame(2.8);
    };

    const resize = () => {
      if (!container || !canvas) return;
      width = Math.max(320, container.clientWidth);
      height = Math.max(320, container.clientHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.02 }
    );
    io.observe(container);

    // Precompute burner jet port configs (38 outer crown jets + 18 inner crown jets)
    const OUTER_PORTS = 38;
    const INNER_PORTS = 18;
    const outerSeeds = Array.from({ length: OUTER_PORTS }, (_, i) => ({
      phase: i * 1.37 + (i % 3) * 0.7,
      speed: 7.5 + (i % 5) * 1.35,
      heightMul: 0.88 + ((i * 7) % 11) * 0.024,
      amberHint: i % 9 === 0,
    }));
    const innerSeeds = Array.from({ length: INNER_PORTS }, (_, i) => ({
      phase: i * 1.91,
      speed: 8.2 + (i % 4) * 1.1,
      heightMul: 0.85 + ((i * 5) % 9) * 0.028,
    }));

    const CYCLE_SECONDS = 7.4;

    const shortestAngleDiff = (a: number, b: number) => {
      let d = ((a - b + Math.PI) % (Math.PI * 2)) - Math.PI;
      if (d < -Math.PI) d += Math.PI * 2;
      return Math.abs(d);
    };

    const drawJet = (
      x: number,
      y: number,
      angle: number,
      flameLen: number,
      flameWidth: number,
      alpha: number,
      flicker: number,
      amberHint: boolean
    ) => {
      if (alpha <= 0.02 || flameLen <= 2) return;

      // Tilt jet outward radially and slightly upward like real gas burner ports
      const outX = Math.cos(angle);
      const outY = Math.sin(angle) * 0.55 - 0.82;
      const lenNorm = Math.hypot(outX, outY) || 1;
      const dirX = outX / lenNorm;
      const dirY = outY / lenNorm;
      const tipX = x + dirX * flameLen + flicker * flameWidth * 0.35;
      const tipY = y + dirY * flameLen;

      // Outer cobalt/royal-blue gas glow envelope
      const outerGrad = ctx.createRadialGradient(
        x + dirX * flameLen * 0.32,
        y + dirY * flameLen * 0.32,
        flameWidth * 0.15,
        x + dirX * flameLen * 0.45,
        y + dirY * flameLen * 0.45,
        flameLen * 0.95
      );
      outerGrad.addColorStop(0, `rgba(0, 175, 255, ${0.46 * alpha})`);
      outerGrad.addColorStop(0.45, `rgba(18, 98, 255, ${0.28 * alpha})`);
      outerGrad.addColorStop(1, "rgba(8, 42, 160, 0)");

      ctx.fillStyle = outerGrad;
      ctx.beginPath();
      ctx.arc(
        x + dirX * flameLen * 0.42,
        y + dirY * flameLen * 0.42,
        flameLen * 0.92,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Main crisp teardrop stove flame tongue (cyan-blue -> cobalt -> pale ice-blue core)
      const perpX = -dirY;
      const perpY = dirX;
      const bodyGrad = ctx.createLinearGradient(x, y, tipX, tipY);
      bodyGrad.addColorStop(0, `rgba(215, 248, 255, ${0.95 * alpha})`);
      bodyGrad.addColorStop(0.28, `rgba(38, 212, 255, ${0.88 * alpha})`);
      bodyGrad.addColorStop(0.72, `rgba(14, 118, 255, ${0.62 * alpha})`);
      bodyGrad.addColorStop(
        1,
        amberHint
          ? `rgba(255, 168, 88, ${0.22 * alpha})`
          : `rgba(28, 92, 255, 0)`
      );

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(x - perpX * flameWidth * 0.52, y - perpY * flameWidth * 0.52);
      ctx.quadraticCurveTo(
        x + dirX * flameLen * 0.48 - perpX * flameWidth * 0.72,
        y + dirY * flameLen * 0.48 - perpY * flameWidth * 0.72,
        tipX,
        tipY
      );
      ctx.quadraticCurveTo(
        x + dirX * flameLen * 0.48 + perpX * flameWidth * 0.72,
        y + dirY * flameLen * 0.48 + perpY * flameWidth * 0.72,
        x + perpX * flameWidth * 0.52,
        y + perpY * flameWidth * 0.52
      );
      ctx.closePath();
      ctx.fill();
    };

    const drawFrame = (tSec: number) => {
      ctx.save();
      ctx.scale(dpr, dpr);

      // Base dark cooktop fallback fill
      ctx.fillStyle = "#070b14";
      ctx.fillRect(0, 0, width, height);

      // Compute object-cover placement of 16:9 stove photograph + subtle breathing zoom
      const cycleT = tSec % CYCLE_SECONDS;
      const zoomBreath = 1.03 + Math.sin((tSec / CYCLE_SECONDS) * Math.PI * 2) * 0.015;

      let drawX = 0;
      let drawY = 0;
      let drawW = width;
      let drawH = height;

      if (imgReady) {
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const viewAspect = width / height;
        if (viewAspect > imgAspect) {
          drawW = width * zoomBreath;
          drawH = drawW / imgAspect;
        } else {
          drawH = height * zoomBreath;
          drawW = drawH * imgAspect;
        }
        drawX = (width - drawW) * 0.5;
        drawY = (height - drawH) * 0.44;

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      }

      // Burner geometric alignment matching fogao_queimador_bg_1795649774389.jpg
      const cx = drawX + drawW * 0.498;
      const outerCy = drawY + drawH * 0.494;
      const outerRx = drawW * 0.129;
      const outerRy = drawH * 0.073;

      const innerCy = drawY + drawH * 0.436;
      const innerRx = drawW * 0.050;
      const innerRy = drawH * 0.029;

      // Ignition sequence envelope over the 7.4s loop:
      // 0.00 - 0.52s: Piezo spark flashes
      // 0.36 - 1.48s: Circular 360° blue flame ignition wave
      // 1.48 - 6.10s: Steady vibrant bluish stove flame
      // 6.10 - 7.05s: Smooth throttle down to re-ignite
      // 7.05 - 7.40s: Unlit pause before next spark
      let flameMaster = 0;
      let ignitionSweep = 1; // 0 -> 1 around ring
      let igniteBoost = 0;

      if (cycleT < 0.36) {
        flameMaster = 0;
        ignitionSweep = 0;
      } else if (cycleT < 1.48) {
        const p = (cycleT - 0.36) / (1.48 - 0.36);
        ignitionSweep = Math.min(1, p);
        flameMaster = Math.min(1, p * 1.45);
        // Subtle "whoosh" bloom right as the flame closes the circle
        igniteBoost = Math.sin(p * Math.PI) * 0.28;
      } else if (cycleT < 6.10) {
        flameMaster = 1;
        ignitionSweep = 1;
      } else if (cycleT < 7.05) {
        const p = (cycleT - 6.10) / (7.05 - 6.10);
        flameMaster = Math.max(0, 1 - p * p);
        ignitionSweep = 1;
      } else {
        flameMaster = 0;
        ignitionSweep = 0;
      }

      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      // Piezo spark flash at right-front electrode (angle ~ 0.38 rad)
      const sparkAngle = 0.38;
      const spark1 = cycleT >= 0.08 && cycleT < 0.22 ? Math.sin(((cycleT - 0.08) / 0.14) * Math.PI) : 0;
      const spark2 = cycleT >= 0.28 && cycleT < 0.44 ? Math.sin(((cycleT - 0.28) / 0.16) * Math.PI) : 0;
      const sparkIntensity = Math.max(spark1, spark2);

      if (sparkIntensity > 0.01) {
        const sx = cx + Math.cos(sparkAngle) * (outerRx * 0.88);
        const sy = outerCy + Math.sin(sparkAngle) * (outerRy * 0.88) - drawH * 0.014;
        const sGrad = ctx.createRadialGradient(sx, sy, 1, sx, sy, outerRx * 0.72);
        sGrad.addColorStop(0, `rgba(235, 252, 255, ${0.95 * sparkIntensity})`);
        sGrad.addColorStop(0.28, `rgba(75, 222, 255, ${0.75 * sparkIntensity})`);
        sGrad.addColorStop(1, "rgba(15, 110, 255, 0)");
        ctx.fillStyle = sGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, outerRx * 0.72, 0, Math.PI * 2);
        ctx.fill();
      }

      if (flameMaster > 0.01) {
        const power = flameMaster * (1 + igniteBoost);

        // 1. Ambient blue gas-flame light bounce on the dark glass cooktop & grates
        const ambientGrad = ctx.createRadialGradient(
          cx,
          outerCy,
          outerRx * 0.2,
          cx,
          outerCy + outerRy * 0.35,
          outerRx * 3.4
        );
        ambientGrad.addColorStop(0, `rgba(0, 198, 255, ${0.52 * flameMaster})`);
        ambientGrad.addColorStop(0.38, `rgba(24, 122, 255, ${0.34 * flameMaster})`);
        ambientGrad.addColorStop(0.75, `rgba(12, 68, 200, ${0.14 * flameMaster})`);
        ambientGrad.addColorStop(1, "rgba(8, 25, 90, 0)");
        ctx.fillStyle = ambientGrad;
        ctx.beginPath();
        ctx.ellipse(cx, outerCy + outerRy * 0.2, outerRx * 3.4, outerRy * 2.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Specular blue reflection cast onto the glossy black tempered glass in front of the burner
        const reflGrad = ctx.createRadialGradient(
          cx,
          outerCy + outerRy * 1.45,
          outerRx * 0.15,
          cx,
          outerCy + outerRy * 1.55,
          outerRx * 1.9
        );
        reflGrad.addColorStop(0, `rgba(38, 212, 255, ${0.38 * flameMaster})`);
        reflGrad.addColorStop(0.55, `rgba(18, 112, 255, ${0.20 * flameMaster})`);
        reflGrad.addColorStop(1, "rgba(10, 42, 130, 0)");
        ctx.fillStyle = reflGrad;
        ctx.beginPath();
        ctx.ellipse(cx, outerCy + outerRy * 1.5, outerRx * 1.9, outerRy * 0.95, 0, 0, Math.PI * 2);
        ctx.fill();

        // Continuous glowing blue base ring along the burner crown
        ctx.save();
        ctx.strokeStyle = `rgba(56, 217, 255, ${0.55 * flameMaster * ignitionSweep})`;
        ctx.lineWidth = Math.max(4, drawW * 0.008);
        ctx.shadowColor = "rgba(0, 184, 244, 0.95)";
        ctx.shadowBlur = Math.max(12, drawW * 0.018);
        ctx.beginPath();
        ctx.ellipse(cx, outerCy, outerRx, outerRy, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 3. Outer perforated burner ring jets
        const baseJetLen = Math.max(28, drawW * 0.048);
        const baseJetW = Math.max(10, drawW * 0.0175);

        for (let i = 0; i < OUTER_PORTS; i++) {
          const angle = (i / OUTER_PORTS) * Math.PI * 2;
          const distFromSpark = shortestAngleDiff(angle, sparkAngle) / Math.PI; // 0..1
          const portOn =
            ignitionSweep >= 1
              ? 1
              : Math.max(0, Math.min(1, (ignitionSweep * 1.18 - distFromSpark) * 4.5));

          if (portOn <= 0.02) continue;

          const seed = outerSeeds[i];
          const wave =
            Math.sin(tSec * seed.speed + seed.phase) * 0.55 +
            Math.sin(tSec * (seed.speed * 1.63) + seed.phase * 1.9) * 0.45;
          const depthScale = 0.88 + Math.sin(angle) * 0.14; // slightly taller in foreground
          const px = cx + Math.cos(angle) * outerRx;
          const py = outerCy + Math.sin(angle) * outerRy;
          const jetLen = baseJetLen * seed.heightMul * depthScale * (0.92 + wave * 0.18) * (0.65 + 0.35 * power);

          drawJet(
            px,
            py,
            angle,
            jetLen,
            baseJetW * depthScale,
            flameMaster * portOn,
            wave,
            seed.amberHint
          );
        }

        // 4. Inner crown burner jets (smaller intense cyan-blue ring)
        for (let i = 0; i < INNER_PORTS; i++) {
          const angle = (i / INNER_PORTS) * Math.PI * 2;
          const distFromSpark = shortestAngleDiff(angle, sparkAngle) / Math.PI;
          const portOn =
            ignitionSweep >= 1
              ? 1
              : Math.max(0, Math.min(1, (ignitionSweep * 1.25 - distFromSpark * 0.85) * 4.5));

          if (portOn <= 0.02) continue;

          const seed = innerSeeds[i];
          const wave = Math.sin(tSec * seed.speed + seed.phase);
          const px = cx + Math.cos(angle) * innerRx;
          const py = innerCy + Math.sin(angle) * innerRy;
          const jetLen = baseJetLen * 0.62 * seed.heightMul * (0.9 + wave * 0.14) * (0.65 + 0.35 * power);

          drawJet(
            px,
            py,
            angle,
            jetLen,
            baseJetW * 0.78,
            flameMaster * portOn * 0.85,
            wave,
            false
          );
        }
      }

      ctx.restore();
      ctx.restore();
    };

    if (prefersReducedMotion) {
      drawFrame(2.8);
    } else {
      const start = performance.now();
      const loop = (now: number) => {
        if (isDisposed) return;
        if (isVisible) {
          drawFrame((now - start) / 1000);
        }
        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);
    }

    return () => {
      isDisposed = true;
      cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
    >
      {/* Layer 1: Static fallback photograph + Live 60fps Igniting Blue Stove Flame Canvas */}
      <img
        src={stoveBurnerImg}
        alt=""
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover object-center scale-[1.03]"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />

      {/* Layer 2: Light atmospheric edge vignette keeping center stove flames crisp & bright */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(8,14,28,0.38) 0%, rgba(10,18,36,0.08) 48%, rgba(8,14,28,0.42) 100%)",
        }}
      />

      {/* Layer 3: Frosted Glass Pane (7px blur with low tint so glowing blue stove flames stay vivid) */}
      <div
        className="absolute inset-0 bg-[#0B1326]/8 backdrop-blur-[7px] backdrop-saturate-150 ring-1 ring-inset ring-white/15"
        style={{
          backgroundImage:
            "linear-gradient(132deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 34%, rgba(0,184,244,0.08) 68%, rgba(18,98,255,0.06) 100%)",
        }}
      />

      {/* Diagonal specular glass reflection band */}
      <div
        className="absolute -inset-y-12 left-[16%] w-[36%] -skew-x-12 opacity-18"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(210,242,255,0.20) 50%, rgba(255,255,255,0) 100%)",
        }}
      />
    </div>
  );
}
