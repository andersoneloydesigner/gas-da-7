/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { IMAGES } from "../constants";
import TeleportSmokePuff from "./TeleportSmokePuff";

const R = 1.06; // Main cylinder radius

/**
 * Projects an (x, y) coordinate onto the front curved surface (+Z) of the cylinder.
 */
function projectOnCylinder(x: number, y: number, offsetOut = 0, radius = R): THREE.Vector3 {
  const clampedX = Math.max(-radius * 0.96, Math.min(radius * 0.96, x));
  const z = Math.sqrt(Math.max(0.001, radius * radius - clampedX * clampedX)) + offsetOut;
  return new THREE.Vector3(clampedX, y, z);
}

/**
 * Builds a curved 2D shape mapped onto the front cylinder surface so the
 * mouth cavity, upper teeth, and bilobed coral tongue hug the cylinder curvature seamlessly.
 */
function createCurvedShapeGeometry(
  xMin: number,
  xMax: number,
  yTopFn: (x: number) => number,
  yBotFn: (x: number) => number,
  offsetOut: number,
  segX = 40,
  segY = 14
): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let ix = 0; ix <= segX; ix++) {
    const u = ix / segX;
    const x = xMin + (xMax - xMin) * u;
    const yTop = yTopFn(x);
    const yBot = Math.min(yTop, yBotFn(x));

    for (let iy = 0; iy <= segY; iy++) {
      const v = iy / segY;
      const y = yBot + (yTop - yBot) * v;
      const pt = projectOnCylinder(x, y, offsetOut);
      positions.push(pt.x, pt.y, pt.z);
      uvs.push(u, v);
    }
  }

  for (let ix = 0; ix < segX; ix++) {
    for (let iy = 0; iy < segY; iy++) {
      const a = ix * (segY + 1) + iy;
      const b = (ix + 1) * (segY + 1) + iy;
      const c = (ix + 1) * (segY + 1) + (iy + 1);
      const d = ix * (segY + 1) + (iy + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Generates a vibrant glossy cyan painted-steel texture matching the illustration palette.
 */
function createCylinderPaintTexture(maxAnisotropy: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0.0, "#1cd6ff");
  grad.addColorStop(0.3, "#00c8ff");
  grad.addColorStop(0.7, "#00b9f4");
  grad.addColorStop(1.0, "#00a7e4");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle metallic micro-fleck grain
  for (let i = 0; i < 480; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 0.6 + Math.random() * 1.2;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,95,155,0.04)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Generates a deep black mouth interior texture with a warm dark-crimson throat gradient
 * just above the tongue, faithful to the comic illustration.
 */
function createMouthCavityTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#080a11";
  ctx.fillRect(0, 0, 256, 256);

  const throatGrad = ctx.createRadialGradient(128, 218, 12, 128, 210, 125);
  throatGrad.addColorStop(0.0, "#7c1d24");
  throatGrad.addColorStop(0.45, "#421118");
  throatGrad.addColorStop(1.0, "rgba(8, 10, 17, 0)");
  ctx.fillStyle = throatGrad;
  ctx.fillRect(0, 0, 256, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function Mascot3DHero() {
  const heroStageRef = useRef<HTMLDivElement>(null);
  const mascotStageRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const calloutRef = useRef<HTMLButtonElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  const jumpVelocityRef = useRef(0);
  const jumpHeightRef = useRef(0);

  const triggerHeroSmoke = () => {
    window.dispatchEvent(
      new CustomEvent("gas7-mascot-teleport", { detail: { target: "hero" } })
    );
  };

  const triggerCheerHop = () => {
    jumpVelocityRef.current = 2.65;
  };

  useEffect(() => {
    const container = mountRef.current;
    const heroStage = heroStageRef.current;
    if (!container || !heroStage) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement("canvas").getContext("webgl2");
        if (!gl) return true;
        const ext = gl.getExtension("WEBGL_debug_renderer_info");
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    const initialStageW = heroStage.offsetWidth || 520;
    const initialStageH = Math.max(320, heroStage.offsetHeight || 560);
    const width = initialStageW;
    const height = initialStageH;
    const dpr = isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.touchAction = "pan-y";

    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglFailed(true);
    };
    const handleContextRestored = () => {
      setWebglFailed(false);
    };
    renderer.domElement.addEventListener("webglcontextlost", handleContextLost);
    renderer.domElement.addEventListener("webglcontextrestored", handleContextRestored);

    // Offscreen RenderTarget + Fullscreen Double-Outline Post-Pass (Crisp Black + White Border)
    const rtWidth = Math.max(1, Math.floor(width * dpr));
    const rtHeight = Math.max(1, Math.floor(height * dpr));
    const rtSamples =
      !isSoftwareGl && renderer.capabilities.isWebGL2
        ? Math.min(4, renderer.capabilities.maxSamples || 0)
        : 0;

    const renderTarget = new THREE.WebGLRenderTarget(rtWidth, rtHeight, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      samples: rtSamples,
    });

    const postScene = new THREE.Scene();
    const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const postUniforms = {
      tDiffuse: { value: renderTarget.texture },
      uTexelSize: { value: new THREE.Vector2(1 / rtWidth, 1 / rtHeight) },
      uDpr: { value: dpr },
    };

    const postMat = new THREE.ShaderMaterial({
      uniforms: postUniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D tDiffuse;
        uniform vec2 uTexelSize;
        uniform float uDpr;
        varying vec2 vUv;

        vec3 linearToSRGB(vec3 c) {
          vec3 lo = c * 12.92;
          vec3 hi = 1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055;
          return mix(lo, hi, step(vec3(0.0031308), c));
        }

        float sampleRing(vec2 uv, float radiusPx) {
          float maxA = 0.0;
          vec2 stepUv = uTexelSize * radiusPx;
          // 16 uniform radial angles
          for (int i = 0; i < 16; i++) {
            float angle = float(i) * 0.3926990817; // PI / 8
            vec2 offset = vec2(cos(angle), sin(angle)) * stepUv;
            maxA = max(maxA, texture2D(tDiffuse, uv + offset).a);
          }
          return maxA;
        }

        void main() {
          vec4 texel = texture2D(tDiffuse, vUv);
          float centerA = texel.a;

          // Un-premultiply linear RGB before converting to sRGB
          vec3 mascotLinear = texel.rgb / max(centerA, 0.001);
          vec3 mascotSRGB = linearToSRGB(clamp(mascotLinear, 0.0, 1.0));

          // Crisp black comic outline (~3.4 CSS px)
          float rBlack = 3.4 * uDpr;
          float blackAlpha = max(centerA, max(sampleRing(vUv, rBlack * 0.55), sampleRing(vUv, rBlack)));
          float blackMask = smoothstep(0.15, 0.85, blackAlpha);

          // Crisp outer white sticker border (~8.6 CSS px) -> "traço branco ao redor"
          float rWhite = 8.6 * uDpr;
          float whiteAlpha = max(
            blackAlpha,
            max(
              sampleRing(vUv, rWhite * 0.58),
              max(sampleRing(vUv, rWhite * 0.80), sampleRing(vUv, rWhite))
            )
          );
          float whiteMask = smoothstep(0.15, 0.85, whiteAlpha);

          vec3 whiteCol = vec3(1.0, 1.0, 1.0);
          vec3 blackCol = vec3(0.035, 0.043, 0.071); // #090b12

          float mascotMix = smoothstep(0.20, 0.85, centerA);
          vec3 outlineCol = mix(whiteCol, blackCol, blackMask);
          vec3 finalRGB = mix(outlineCol, mascotSRGB, mascotMix);
          float finalAlpha = max(whiteMask, mascotMix);

          if (finalAlpha < 0.01) discard;
          gl_FragColor = vec4(finalRGB, finalAlpha);
        }
      `,
    });

    const postQuadGeo = new THREE.PlaneGeometry(2, 2);
    const postQuad = new THREE.Mesh(postQuadGeo, postMat);
    postScene.add(postQuad);

    const scene = new THREE.Scene();

    // Studio Reflection Map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    const getCameraLayout = (aspect: number) => {
      const isMobilePortrait = aspect < 0.85;
      const camX = isMobilePortrait ? 0.22 : 0.38;
      const camY = isMobilePortrait ? 0.36 : 0.21;
      const frontH = isMobilePortrait ? 3.85 : 3.55; // breathing room at top on mobile for "OH O GÁS!"
      const frontLeftMargin = 1.32; // cylinder silhouette + tilt + white outline
      const tanHalfV = Math.tan(THREE.MathUtils.degToRad(34) / 2);
      const distH = 0.55 + (frontH / 2) / tanHalfV;
      const distW = 0.25 + (camX + frontLeftMargin) / (tanHalfV * Math.max(0.55, aspect));
      const camZ = Math.max(distH, distW);
      return { camX, camY, camZ };
    };

    const initialAspect = width / height;
    const initialCam = getCameraLayout(initialAspect);
    const camera = new THREE.PerspectiveCamera(34, initialAspect, 0.1, 50);
    camera.position.set(initialCam.camX, initialCam.camY, initialCam.camZ);
    camera.lookAt(initialCam.camX, initialCam.camY, 0);

    const updateShadowPos = (camX: number, camZ: number, aspect: number) => {
      if (!shadowRef.current) return;
      const tanHalfV = Math.tan(THREE.MathUtils.degToRad(34) / 2);
      const halfVisW = camZ * tanHalfV * aspect;
      const pct = 50 - (camX / (2 * halfVisW)) * 100;
      shadowRef.current.style.left = `${pct.toFixed(1)}%`;
    };
    updateShadowPos(initialCam.camX, initialCam.camZ, initialAspect);

    // 3-Point Clean Studio Lighting Rig (no orange tint)
    const hemiLight = new THREE.HemisphereLight(0xf6fcff, 0x0b3a5c, 0.88);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.65);
    keyLight.position.set(4.5, 6.2, 5.8);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x88e6ff, 0.95);
    fillLight.position.set(-5.0, 2.0, 4.0);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xdff7ff, 0.72);
    rimLight.position.set(2.8, 3.0, -4.8);
    scene.add(rimLight);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const paintTex = createCylinderPaintTexture(maxAnisotropy);
    const cavityTex = createMouthCavityTexture();

    const disposables: Array<{ dispose: () => void }> = [
      renderTarget,
      postQuadGeo,
      postMat,
      paintTex,
      cavityTex,
      envTarget,
    ];

    // =========================================================================
    // MASCOT 3D ASSEMBLY (Exact Characteristics of Gás da 7 Illustration)
    // =========================================================================
    const mascotRoot = new THREE.Group();
    scene.add(mascotRoot);

    const mascotBody = new THREE.Group();
    mascotBody.rotation.z = 0.085; // Signature joyful tilt from illustration
    mascotRoot.add(mascotBody);

    // Primary Materials
    const cyanPaintMat = new THREE.MeshPhysicalMaterial({
      color: 0x00c8ff,
      map: paintTex,
      roughness: 0.25,
      metalness: 0.05,
      clearcoat: 0.78,
      clearcoatRoughness: 0.14,
      envMapIntensity: 1.15,
    });
    const cyanShadowMat = new THREE.MeshPhysicalMaterial({
      color: 0x0096d6,
      roughness: 0.38,
      metalness: 0.05,
      clearcoat: 0.42,
      clearcoatRoughness: 0.22,
    });
    const darkInkMat = new THREE.MeshStandardMaterial({
      color: 0x090b12,
      roughness: 0.45,
      metalness: 0.02,
    });
    const cavityMat = new THREE.MeshBasicMaterial({
      map: cavityTex,
    });
    const glossyEyeMat = new THREE.MeshPhysicalMaterial({
      color: 0x080a11,
      roughness: 0.06,
      metalness: 0.02,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });
    const pureWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.15,
      metalness: 0.0,
      emissive: 0xffffff,
      emissiveIntensity: 0.18,
    });
    const tongueMat = new THREE.MeshStandardMaterial({
      color: 0xf45d5d,
      roughness: 0.42,
      metalness: 0.0,
      emissive: 0xd93d3d,
      emissiveIntensity: 0.1,
    });
    const valveBlueMat = new THREE.MeshStandardMaterial({
      color: 0x0a7ce0,
      roughness: 0.32,
      metalness: 0.42,
    });
    disposables.push(
      cyanPaintMat,
      cyanShadowMat,
      darkInkMat,
      cavityMat,
      glossyEyeMat,
      pureWhiteMat,
      tongueMat,
      valveBlueMat
    );

    // 1. Main Gas Cylinder Shell (LatheGeometry with smooth welded seam & bottom dome)
    const lathePts: THREE.Vector2[] = [
      new THREE.Vector2(0.0, -1.04),
      new THREE.Vector2(0.45, -1.03),
      new THREE.Vector2(0.76, -0.96),
      new THREE.Vector2(0.92, -0.84),
      new THREE.Vector2(R - 0.04, -0.7),
      new THREE.Vector2(R, -0.58),
      new THREE.Vector2(R, 0.56),
      new THREE.Vector2(R - 0.02, 0.67),
      new THREE.Vector2(R - 0.08, 0.78),
      new THREE.Vector2(0.9, 0.88),
      new THREE.Vector2(0.74, 0.96),
      new THREE.Vector2(0.52, 1.02),
      new THREE.Vector2(0.28, 1.055),
      new THREE.Vector2(0.2, 1.075),
      new THREE.Vector2(0.18, 1.095),
      new THREE.Vector2(0.0, 1.095),
    ];
    const cylinderGeo = new THREE.LatheGeometry(lathePts, 72);
    cylinderGeo.computeVertexNormals();
    const cylinderMesh = new THREE.Mesh(cylinderGeo, cyanPaintMat);
    cylinderMesh.castShadow = !isSoftwareGl;
    cylinderMesh.receiveShadow = !isSoftwareGl;
    mascotBody.add(cylinderMesh);
    disposables.push(cylinderGeo);

    // Waist weld seam line matching illustration: exits cleanly from the cheek dimple corners
    // around both sides and the back (never crossing inside or awkwardly beneath the mouth)
    [-1, 1].forEach((side) => {
      const sideSeamPts: THREE.Vector3[] = [];
      const startAngle = side * Math.asin(Math.min(0.96, 0.565 / R));
      const endAngle = side * Math.PI;
      const steps = 28;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const angle = startAngle + (endAngle - startAngle) * t;
        // Curves gently downward from the cheek dimple (y = -0.025) to side waist (y = -0.105)
        const y = -0.025 - 0.08 * Math.sin((t * Math.PI) / 2);
        sideSeamPts.push(new THREE.Vector3(Math.sin(angle) * (R + 0.004), y, Math.cos(angle) * (R + 0.004)));
      }
      const sideSeamCurve = new THREE.CatmullRomCurve3(sideSeamPts, false);
      const sideSeamGeo = new THREE.TubeGeometry(sideSeamCurve, 36, 0.0085, 8, false);
      const sideSeamMesh = new THREE.Mesh(sideSeamGeo, darkInkMat);
      mascotBody.add(sideSeamMesh);
      disposables.push(sideSeamGeo);
    });

    // 2. Bottom Foot Ring Skirt with Scalloped Cutouts (4 arched segments like the illustration)
    const footGroup = new THREE.Group();
    mascotBody.add(footGroup);

    const footInnerGeo = new THREE.CylinderGeometry(0.84, 0.86, 0.24, 48);
    const footInnerMesh = new THREE.Mesh(footInnerGeo, cyanShadowMat);
    footInnerMesh.position.y = -1.1;
    footGroup.add(footInnerMesh);
    disposables.push(footInnerGeo);

    const footArcCount = 4;
    for (let i = 0; i < footArcCount; i++) {
      const arcAngle = (Math.PI * 2) / footArcCount;
      const startAngle = i * arcAngle + 0.14;
      const spanAngle = arcAngle - 0.28;

      const skirtPts = [
        new THREE.Vector2(0.84, -1.24),
        new THREE.Vector2(0.95, -1.24),
        new THREE.Vector2(0.96, -1.16),
        new THREE.Vector2(0.92, -1.04),
        new THREE.Vector2(0.87, -0.94),
        new THREE.Vector2(0.83, -0.94),
      ];
      const padGeo = new THREE.LatheGeometry(skirtPts, 20, startAngle, spanAngle);
      padGeo.computeVertexNormals();
      const padMesh = new THREE.Mesh(padGeo, cyanPaintMat);
      padMesh.castShadow = !isSoftwareGl;
      footGroup.add(padMesh);
      disposables.push(padGeo);
    }

    // Subtle scalloped ink line along the front foot skirt seam matching illustration
    const skirtLinePts: THREE.Vector3[] = [];
    for (let i = 0; i <= 36; i++) {
      const a = -0.95 + (1.9 * i) / 36;
      const wave = -Math.cos(a * 4.0) * 0.038;
      skirtLinePts.push(new THREE.Vector3(Math.sin(a) * 0.91, -0.98 + wave, Math.cos(a) * 0.91));
    }
    const skirtLineCurve = new THREE.CatmullRomCurve3(skirtLinePts, false);
    const skirtLineGeo = new THREE.TubeGeometry(skirtLineCurve, 44, 0.008, 8, false);
    const skirtLineMesh = new THREE.Mesh(skirtLineGeo, darkInkMat);
    footGroup.add(skirtLineMesh);
    disposables.push(skirtLineGeo);

    // Smooth continuous bottom lip torus rim for a clean, sturdy finish
    const bottomLipGeo = new THREE.TorusGeometry(0.91, 0.055, 14, 56);
    bottomLipGeo.rotateX(Math.PI / 2);
    const bottomLipMesh = new THREE.Mesh(bottomLipGeo, cyanPaintMat);
    bottomLipMesh.position.y = -1.22;
    footGroup.add(bottomLipMesh);
    disposables.push(bottomLipGeo);

    // 3. Top Carry Handle (Rounded arched collar with cutout & top finger-grip dip)
    const handleShape = new THREE.Shape();
    handleShape.moveTo(-0.68, 0.82);
    handleShape.lineTo(-0.74, 1.18);
    handleShape.quadraticCurveTo(-0.78, 1.56, -0.7, 1.68);
    handleShape.quadraticCurveTo(-0.64, 1.76, -0.5, 1.76);
    handleShape.lineTo(0.5, 1.76);
    handleShape.quadraticCurveTo(0.64, 1.76, 0.7, 1.68);
    handleShape.quadraticCurveTo(0.78, 1.56, 0.74, 1.18);
    handleShape.lineTo(0.68, 0.82);
    handleShape.lineTo(0.46, 0.86);
    handleShape.lineTo(0.49, 1.42);
    handleShape.quadraticCurveTo(0.49, 1.5, 0.41, 1.5);
    handleShape.lineTo(0.14, 1.5);
    handleShape.quadraticCurveTo(0.0, 1.44, -0.14, 1.5);
    handleShape.lineTo(-0.41, 1.5);
    handleShape.quadraticCurveTo(-0.49, 1.5, -0.49, 1.42);
    handleShape.lineTo(-0.46, 0.86);
    handleShape.closePath();

    const handleGeo = new THREE.ExtrudeGeometry(handleShape, {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.055,
      bevelSize: 0.045,
      bevelSegments: 5,
      curveSegments: 20,
    });
    handleGeo.translate(0, 0, -0.11);
    handleGeo.computeVertexNormals();
    const handleMesh = new THREE.Mesh(handleGeo, cyanPaintMat);
    handleMesh.castShadow = !isSoftwareGl;
    mascotBody.add(handleMesh);
    disposables.push(handleGeo);

    // Handle base welding collars where legs meet the dome
    [-0.57, 0.57].forEach((hx) => {
      const collarGeo = new THREE.CylinderGeometry(0.15, 0.19, 0.16, 20);
      const collarMesh = new THREE.Mesh(collarGeo, cyanPaintMat);
      collarMesh.position.set(hx, 0.88, 0);
      mascotBody.add(collarMesh);
      disposables.push(collarGeo);
    });

    // 4. Top Gas Valve Assembly (centered neatly under the handle arch)
    const valveGroup = new THREE.Group();
    valveGroup.position.set(0, 1.1, 0);
    mascotBody.add(valveGroup);

    const valveBaseGeo = new THREE.CylinderGeometry(0.13, 0.16, 0.08, 24);
    const valveBaseMesh = new THREE.Mesh(valveBaseGeo, cyanShadowMat);
    valveBaseMesh.position.y = 0.03;
    valveGroup.add(valveBaseMesh);

    const valveCollarLineGeo = new THREE.TorusGeometry(0.155, 0.008, 8, 28);
    valveCollarLineGeo.rotateX(Math.PI / 2);
    const valveCollarLine = new THREE.Mesh(valveCollarLineGeo, darkInkMat);
    valveCollarLine.position.y = 0.0;
    valveGroup.add(valveCollarLine);

    const valveBodyGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.18, 24);
    const valveBodyMesh = new THREE.Mesh(valveBodyGeo, valveBlueMat);
    valveBodyMesh.position.y = 0.14;
    valveGroup.add(valveBodyMesh);

    const valveCapGeo = new THREE.CylinderGeometry(0.115, 0.115, 0.045, 24);
    const valveCapMesh = new THREE.Mesh(valveCapGeo, valveBlueMat);
    valveCapMesh.position.y = 0.24;
    valveGroup.add(valveCapMesh);

    const nozzleGeo = new THREE.CylinderGeometry(0.038, 0.046, 0.16, 16);
    const nozzleMesh = new THREE.Mesh(nozzleGeo, valveBlueMat);
    nozzleMesh.position.set(-0.12, 0.16, 0);
    nozzleMesh.rotation.z = 0.85;
    valveGroup.add(nozzleMesh);

    const nozzleTipGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.03, 16);
    const nozzleTipMesh = new THREE.Mesh(nozzleTipGeo, cyanPaintMat);
    nozzleTipMesh.position.set(-0.18, 0.21, 0);
    nozzleTipMesh.rotation.z = 0.85;
    valveGroup.add(nozzleTipMesh);

    disposables.push(
      valveBaseGeo,
      valveCollarLineGeo,
      valveBodyGeo,
      valveCapGeo,
      nozzleGeo,
      nozzleTipGeo
    );

    // 5. Iconic Facial Features (Eyes with Dual Catchlights, Clean Smile, Teeth, Tongue, Dimples)
    const faceGroup = new THREE.Group();
    mascotBody.add(faceGroup);

    // 5A. Glossy Black Vertical Pill Eyes with Dual White Catchlights
    const eyeGeo = new THREE.SphereGeometry(1, 24, 20);
    eyeGeo.scale(0.115, 0.205, 0.075);

    const bigHighlightGeo = new THREE.SphereGeometry(0.048, 16, 12);
    bigHighlightGeo.scale(1.0, 1.0, 0.55);

    const smallHighlightGeo = new THREE.SphereGeometry(0.022, 12, 10);
    smallHighlightGeo.scale(1.0, 1.0, 0.55);

    disposables.push(eyeGeo, bigHighlightGeo, smallHighlightGeo);

    [-0.255, 0.255].forEach((ex) => {
      const eyeHolder = new THREE.Group();
      const surfPos = projectOnCylinder(ex, 0.365, 0.012);
      eyeHolder.position.copy(surfPos);
      eyeHolder.rotation.y = Math.atan2(ex, surfPos.z);

      const eyeMesh = new THREE.Mesh(eyeGeo, glossyEyeMat);
      eyeHolder.add(eyeMesh);

      const bigDot = new THREE.Mesh(bigHighlightGeo, pureWhiteMat);
      bigDot.position.set(-0.025, 0.095, 0.056);
      eyeHolder.add(bigDot);

      const smallDot = new THREE.Mesh(smallHighlightGeo, pureWhiteMat);
      smallDot.position.set(0.036, 0.024, 0.068);
      eyeHolder.add(smallDot);

      faceGroup.add(eyeHolder);
    });

    // 5B. Cheerful Open Smile (Clean separate top & bottom lip curves — ZERO corner spline kinks!)
    const smileHalfW = 0.545;
    const yCorner = 0.03;

    const yTopLip = (x: number) => {
      const nx = x / smileHalfW;
      return -0.045 + 0.075 * nx * nx; // Center -0.045, corners +0.030
    };
    const yBotLip = (x: number) => {
      const nx = x / smileHalfW;
      return -0.51 + 0.54 * nx * nx; // Center -0.510, corners +0.030
    };
    const yTeethBot = (x: number) => {
      const nx = x / smileHalfW;
      return -0.175 + 0.115 * nx * nx;
    };

    // Dark mouth cavity background with warm crimson throat gradient
    const cavityGeo = createCurvedShapeGeometry(
      -smileHalfW + 0.005,
      smileHalfW - 0.005,
      yTopLip,
      yBotLip,
      0.007,
      44,
      16
    );
    const cavityMesh = new THREE.Mesh(cavityGeo, cavityMat);
    faceGroup.add(cavityMesh);
    disposables.push(cavityGeo);

    // Crisp white upper teeth band inside the smile
    const teethGeo = createCurvedShapeGeometry(
      -smileHalfW + 0.03,
      smileHalfW - 0.03,
      yTopLip,
      (x) => Math.max(yBotLip(x), yTeethBot(x)),
      0.015,
      40,
      10
    );
    const teethMesh = new THREE.Mesh(teethGeo, pureWhiteMat);
    faceGroup.add(teethMesh);
    disposables.push(teethGeo);

    // Thin crisp black separator line along the bottom edge of the upper teeth
    const teethLinePts: THREE.Vector3[] = [];
    for (let i = 0; i <= 26; i++) {
      const x = -0.515 + (1.03 * i) / 26;
      const y = Math.max(yBotLip(x) + 0.003, yTeethBot(x));
      teethLinePts.push(projectOnCylinder(x, y, 0.0185));
    }
    const teethLineCurve = new THREE.CatmullRomCurve3(teethLinePts, false);
    const teethLineGeo = new THREE.TubeGeometry(teethLineCurve, 40, 0.0085, 8, false);
    const teethLineMesh = new THREE.Mesh(teethLineGeo, darkInkMat);
    faceGroup.add(teethLineMesh);
    disposables.push(teethLineGeo);

    // Coral-pink bilobed tongue strictly bounded inside yBotLip(x)
    const tongueHalfW = 0.34;
    const yTongueBot = (x: number) => yBotLip(x) + 0.003;
    const yTongueTop = (x: number) => {
      const nx = x / tongueHalfW;
      const dome = Math.max(0, 1 - nx * nx);
      const centerDip = Math.exp(-Math.pow(x / 0.075, 2)) * 0.034;
      return Math.max(yTongueBot(x), yBotLip(x) + 0.195 * Math.sqrt(dome) - centerDip);
    };

    const tongueGeo = createCurvedShapeGeometry(
      -tongueHalfW,
      tongueHalfW,
      yTongueTop,
      yTongueBot,
      0.016,
      32,
      10
    );
    const tongueMesh = new THREE.Mesh(tongueGeo, tongueMat);
    faceGroup.add(tongueMesh);
    disposables.push(tongueGeo);

    // Separate crisp top-lip and bottom-lip black outline tubes meeting cleanly at corners
    const topLipPts: THREE.Vector3[] = [];
    const botLipPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 28; i++) {
      const x = -smileHalfW + (2 * smileHalfW * i) / 28;
      topLipPts.push(projectOnCylinder(x, yTopLip(x), 0.02));
      botLipPts.push(projectOnCylinder(x, yBotLip(x), 0.02));
    }

    const topLipCurve = new THREE.CatmullRomCurve3(topLipPts, false);
    const topLipGeo = new THREE.TubeGeometry(topLipCurve, 48, 0.013, 10, false);
    const topLipMesh = new THREE.Mesh(topLipGeo, darkInkMat);
    faceGroup.add(topLipMesh);

    const botLipCurve = new THREE.CatmullRomCurve3(botLipPts, false);
    const botLipGeo = new THREE.TubeGeometry(botLipCurve, 48, 0.013, 10, false);
    const botLipMesh = new THREE.Mesh(botLipGeo, darkInkMat);
    faceGroup.add(botLipMesh);
    disposables.push(topLipGeo, botLipGeo);

    // Rounded corner joint spheres + smooth cheek dimple smile brackets (exact match to illustration)
    const cornerCapGeo = new THREE.SphereGeometry(0.013, 10, 10);
    const dimpleCapGeo = new THREE.SphereGeometry(0.0105, 10, 10);
    disposables.push(cornerCapGeo, dimpleCapGeo);

    [-1, 1].forEach((side) => {
      // Exact corner joint sphere where top lip & bottom lip meet cleanly
      const cornerCap = new THREE.Mesh(cornerCapGeo, darkInkMat);
      cornerCap.position.copy(projectOnCylinder(side * smileHalfW, yCorner, 0.02));
      faceGroup.add(cornerCap);

      // Smooth C-shaped cheek dimple bracket wrapping cleanly outside the mouth corner
      const dimplePts: THREE.Vector3[] = [];
      const arcSteps = 8;
      for (let i = 0; i <= arcSteps; i++) {
        const t = i / arcSteps; // 0 (top) -> 1 (bottom)
        const angle = -1.05 + t * 2.1; // symmetric C arc around corner
        const px = side * (smileHalfW - 0.022 + 0.052 * Math.cos(angle));
        const py = yCorner + 0.008 - 0.062 * Math.sin(angle);
        dimplePts.push(projectOnCylinder(px, py, 0.019));
      }
      const dimpleCurve = new THREE.CatmullRomCurve3(dimplePts, false);
      const dimpleGeo = new THREE.TubeGeometry(dimpleCurve, 20, 0.0105, 8, false);
      const dimpleMesh = new THREE.Mesh(dimpleGeo, darkInkMat);
      faceGroup.add(dimpleMesh);
      disposables.push(dimpleGeo);

      // Hemisphere caps on dimple ends for clean cartoon ink finish
      const capStart = new THREE.Mesh(dimpleCapGeo, darkInkMat);
      capStart.position.copy(dimplePts[0]);
      faceGroup.add(capStart);

      const capEnd = new THREE.Mesh(dimpleCapGeo, darkInkMat);
      capEnd.position.copy(dimplePts[dimplePts.length - 1]);
      faceGroup.add(capEnd);

      // Soft darker-cyan upper cheek puff arc above corner
      const cheekArcPts = [
        projectOnCylinder(side * 0.45, 0.145, 0.01),
        projectOnCylinder(side * 0.56, 0.18, 0.01),
        projectOnCylinder(side * 0.65, 0.115, 0.01),
      ];
      const cheekCurve = new THREE.CatmullRomCurve3(cheekArcPts);
      const cheekGeo = new THREE.TubeGeometry(cheekCurve, 16, 0.016, 8, false);
      const cheekMesh = new THREE.Mesh(cheekGeo, cyanShadowMat);
      faceGroup.add(cheekMesh);
      disposables.push(cheekGeo);
    });

    // Subtle chin crease below bottom lip
    const chinPts = [
      projectOnCylinder(-0.14, -0.585, 0.01),
      projectOnCylinder(0.0, -0.61, 0.01),
      projectOnCylinder(0.14, -0.585, 0.01),
    ];
    const chinCurve = new THREE.CatmullRomCurve3(chinPts);
    const chinGeo = new THREE.TubeGeometry(chinCurve, 16, 0.012, 8, false);
    const chinMesh = new THREE.Mesh(chinGeo, cyanShadowMat);
    faceGroup.add(chinMesh);
    disposables.push(chinGeo);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
      renderer.compile(postScene, postCamera);
    }

    let currentBaseCamX = initialCam.camX;
    let currentBaseCamY = initialCam.camY;
    let currentBaseCamZ = initialCam.camZ;

    // Resize Handler
    const handleResize = () => {
      if (!container || !heroStage) return;
      const w = heroStage.offsetWidth || 520;
      const h = Math.max(320, heroStage.offsetHeight || 560);

      const nextDpr = isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2);
      const nextRtW = Math.max(1, Math.floor(w * nextDpr));
      const nextRtH = Math.max(1, Math.floor(h * nextDpr));

      const aspect = w / h;
      const cam = getCameraLayout(aspect);
      currentBaseCamX = cam.camX;
      currentBaseCamY = cam.camY;
      currentBaseCamZ = cam.camZ;
      camera.aspect = aspect;
      camera.position.set(cam.camX, cam.camY, cam.camZ);
      camera.lookAt(cam.camX, cam.camY, 0);
      camera.updateProjectionMatrix();
      updateShadowPos(cam.camX, cam.camZ, aspect);

      renderer.setPixelRatio(nextDpr);
      renderer.setSize(w, h);
      renderTarget.setSize(nextRtW, nextRtH);
      postUniforms.uTexelSize.value.set(1 / nextRtW, 1 / nextRtH);
      postUniforms.uDpr.value = nextDpr;
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop (Hero Pop-in with Smoke Puff, Single 360° Spin, Repetitive Motion & Occasional Hops)
    let frameId = 0;
    let isDisposed = false;
    let lastTime = performance.now();
    const startTime = lastTime;
    let popProgress = prefersReducedMotion ? 1 : 0; // elastic pop-in out of smoke puff
    let heroHopCooldown = 2.4; // seconds until next occasional hop in Hero
    let hasTriggeredEntrySmoke = false;

    const easeOutBack = (t: number) => {
      const c1 = 1.95;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    };

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (isDisposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (isDisposed) return;
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const elapsed = (now - startTime) / 1000;

      const vh = window.innerHeight || 800;
      const heroRect = heroStage.getBoundingClientRect();
      const isOffscreen = heroRect.bottom < -30 || heroRect.top > vh + 30;

      // Trigger entrance comic smoke puff once Hero is visible
      if (!hasTriggeredEntrySmoke && !isOffscreen && !prefersReducedMotion) {
        hasTriggeredEntrySmoke = true;
        triggerHeroSmoke();
      }

      // Advance elastic pop-in timer (0 -> 1 over ~0.52s)
      if (popProgress < 1) {
        popProgress = Math.min(1, popProgress + dt / 0.52);
      }
      const popScaleMul =
        popProgress >= 1
          ? 1
          : Math.max(0.08, THREE.MathUtils.lerp(0.14, 1, easeOutBack(popProgress)));
      const popOpacity =
        popProgress >= 1 ? 1 : THREE.MathUtils.clamp((popProgress - 0.08) * 3.2, 0, 1);

      if (mascotStageRef.current) {
        mascotStageRef.current.style.transform = `scale(${popScaleMul.toFixed(4)})`;
        mascotStageRef.current.style.opacity = popOpacity.toFixed(3);
      }
      if (shadowRef.current) {
        shadowRef.current.style.opacity = popOpacity.toFixed(3);
      }

      camera.position.set(currentBaseCamX, currentBaseCamY, currentBaseCamZ);
      camera.lookAt(currentBaseCamX, currentBaseCamY, 0);

      // 1. Cheer Hop Physics
      if (jumpHeightRef.current > 0 || jumpVelocityRef.current !== 0) {
        jumpVelocityRef.current -= 12.5 * dt;
        jumpHeightRef.current += jumpVelocityRef.current * dt;
        if (jumpHeightRef.current <= 0) {
          jumpHeightRef.current = 0;
          jumpVelocityRef.current = 0;
        }
      }

      // 2. Single 360° Intro Spin -> Lively Repetitive Motion & Occasional Playful Hops + Smoke Puff
      if (!prefersReducedMotion) {
        const spinDuration = 0.95;
        const spinT = Math.min(1, elapsed / spinDuration);
        const easedSpin = 1 - Math.pow(1 - spinT, 3);
        const singleIntroSpin = easedSpin * Math.PI * 2;
        const settledBlend = spinT >= 1 ? 1 : Math.pow(spinT, 2);

        // Occasional playful hop when settled and visible in Hero
        if (!isOffscreen && spinT >= 1) {
          heroHopCooldown -= dt;
          if (
            heroHopCooldown <= 0 &&
            jumpHeightRef.current === 0 &&
            jumpVelocityRef.current === 0
          ) {
            jumpVelocityRef.current = 2.65;
            heroHopCooldown = 2.9 + Math.random() * 1.4;
          }
        }

        const heroBob = Math.sin(elapsed * 2.85) * 0.075 * settledBlend;
        const heroFloatX = Math.sin(elapsed * 1.85) * 0.055 * settledBlend;
        const heroSway = Math.sin(elapsed * 1.85) * 0.065 * settledBlend;
        const heroYaw = Math.sin(elapsed * 1.45) * 0.12 * settledBlend;

        mascotRoot.position.x = heroFloatX;
        mascotRoot.position.y = heroBob + jumpHeightRef.current;

        const stretch =
          1 + jumpVelocityRef.current * 0.015 + Math.cos(elapsed * 2.85) * 0.016 * settledBlend;
        const squash = 1 / Math.sqrt(Math.max(0.86, stretch));
        mascotRoot.scale.set(squash, stretch, squash);

        mascotRoot.rotation.y = singleIntroSpin + heroYaw;
        mascotBody.rotation.z = 0.075 + heroSway;
      }

      // Skip GPU render passes when completely offscreen
      if (!isOffscreen) {
        // Pass 1: Render 3D mascot into offscreen renderTarget
        renderer.setRenderTarget(renderTarget);
        renderer.clear();
        renderer.render(scene, camera);

        // Pass 2: Composite 3D mascot with crisp black comic outline + outer white sticker border
        renderer.setRenderTarget(null);
        renderer.clear();
        renderer.render(postScene, postCamera);
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    frameId = requestAnimationFrame(tick);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
      renderer.domElement.removeEventListener("webglcontextrestored", handleContextRestored);

      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full flex items-center justify-center select-none">
      {/* Hero Stage Anchor (holds 3D mascot, smoke puff, shadow & "OH O GÁS!" callout) */}
      <div
        ref={heroStageRef}
        className="relative w-full max-w-[820px] h-[510px] sm:h-[640px] md:h-[750px] md:-my-16 flex items-center justify-center"
      >
        {/* Cartoon smoke puff burst on Hero arrival and playful hops */}
        <TeleportSmokePuff zone="hero" />

        {/* Clean dark contact shadow dynamically aligned right under the mascot */}
        <div
          ref={shadowRef}
          aria-hidden="true"
          className="absolute bottom-4 -translate-x-1/2 w-[52%] h-8 rounded-full bg-black/45 blur-md pointer-events-none z-10 transition-opacity duration-150"
        />

        {/* Animated 3D Mascot Canvas Container */}
        <div
          ref={mascotStageRef}
          className="relative w-full h-full z-20 will-change-transform origin-center"
        >
          <div ref={mountRef} className="relative w-full h-full">
            {webglFailed && (
              <img
                src={IMAGES.mascotRef}
                alt="Mascote 3D Gás da 7"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            )}
          </div>

          {/* Tight clickable hit target over the mascot body */}
          <button
            type="button"
            onClick={triggerCheerHop}
            aria-label="Interagir com o Mascote 3D Gás da 7"
            className="absolute left-[26%] top-[12%] w-[48%] h-[76%] z-10 cursor-pointer bg-transparent border-0 focus-visible:outline-none"
          />

          {/* Animated "OH O GÁS!" Comic Callout rendered ABOVE the 3D mascot canvas */}
          <button
            ref={calloutRef}
            type="button"
            onClick={triggerCheerHop}
            aria-label="Oh o Gás!"
            className="animate-oh-gas absolute right-[6%] sm:right-[8%] md:right-[5%] top-[13%] sm:top-[17%] md:top-[18%] z-30 flex flex-col items-center cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26513] rounded-xl p-1 transition-opacity duration-200"
          >
            <div className="flex flex-col items-center leading-[0.88] font-black tracking-tight uppercase text-center">
              <span
                className="-ml-[22px] -mb-[8px] sm:-ml-[44px] sm:-mb-[14px] md:-ml-[56px] md:-mb-[18px] text-[1.85rem] sm:text-[2.75rem] md:text-[3.25rem] text-[#F26513] transition-transform duration-150 group-hover:scale-105"
                style={{
                  textShadow:
                    "3px 3px 0px #070910, -1.5px -1.5px 0px #ffffff, 1.5px -1.5px 0px #ffffff, -1.5px 1.5px 0px #ffffff, 1.5px 1.5px 0px #ffffff",
                }}
              >
                OH
              </span>
              <span
                className="ml-0 mt-[12px] sm:mt-[20px] md:mt-[25px] text-[1.85rem] sm:text-[2.75rem] md:text-[3.25rem] text-[#F26513] transition-transform duration-150 group-hover:scale-105"
                style={{
                  textShadow:
                    "3px 3px 0px #070910, -1.5px -1.5px 0px #ffffff, 1.5px -1.5px 0px #ffffff, -1.5px 1.5px 0px #ffffff, 1.5px 1.5px 0px #ffffff",
                }}
              >
                O GÁS!
              </span>
            </div>

            {/* Curved Speech Pointer Tail Matching Illustration (White on Dark Blue) */}
            <svg
              viewBox="0 0 80 42"
              fill="none"
              aria-hidden="true"
              className="w-11 sm:w-16 h-6 sm:h-9 -ml-12 sm:-ml-16 -mt-0.5 text-white"
            >
              <path
                d="M66 5C56 26 32 34 8 33"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
