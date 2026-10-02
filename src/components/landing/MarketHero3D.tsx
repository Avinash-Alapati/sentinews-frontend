import React, { useEffect, useRef } from 'react';
import {
  isoProject,
  drawIsoBox,
  TILE_W_HALF,
  TILE_H_HALF,
} from '@/utils/isoProjection';

interface MarketHero3DProps {
  width?: number;
  height?: number;
  className?: string;
}

interface BarData {
  x: number;
  z: number;
  targetH: number;
  w: number;
  d: number;
}

// 8 deliberate market bars representing natural market movement:
// Base Entry -> Volatility Push -> Pullback -> Breakout Surge -> High Plateau -> Dip -> Bull Continuation -> Strong Close
const BARS_CONFIG: BarData[] = [
  { x: 1.5, z: 2.7, targetH: 1.8, w: 0.38, d: 0.65 },
  { x: 2.15, z: 2.7, targetH: 2.7, w: 0.42, d: 0.68 },
  { x: 2.85, z: 2.7, targetH: 2.1, w: 0.40, d: 0.66 },
  { x: 3.55, z: 2.7, targetH: 4.8, w: 0.46, d: 0.74 }, // Dominant breakout peak
  { x: 4.3, z: 2.7, targetH: 4.2, w: 0.41, d: 0.70 },
  { x: 4.95, z: 2.7, targetH: 3.1, w: 0.39, d: 0.67 },
  { x: 5.65, z: 2.7, targetH: 4.5, w: 0.44, d: 0.71 },
  { x: 6.35, z: 2.7, targetH: 3.9, w: 0.42, d: 0.68 },
];

export const MarketHero3D: React.FC<MarketHero3DProps> = ({
  width,
  height,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosRef = useRef<{ x: number; y: number; normX: number; normY: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let startTime: number | null = null;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // Platform dimensions in 3D isometric space
    const platX = 0.85;
    const platW = 6.6;
    const platZ = 0.85;
    const platD = 4.4;

    // Interactive mouse tilt interpolation values
    let currentTiltX = 0;
    let currentTiltY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      const normX = Math.max(-1, Math.min(1, (clientX - rect.width / 2) / (rect.width / 2)));
      const normY = Math.max(-1, Math.min(1, (clientY - rect.height / 2) / (rect.height / 2)));
      mousePosRef.current = { x: clientX, y: clientY, normX, normY };
    };

    const handleMouseLeave = () => {
      mousePosRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = width || container.clientWidth || 580;
      const h = height || container.clientHeight || 520;

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(container);

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);

    const render = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      const w = width || container.clientWidth || 580;
      const h = height || container.clientHeight || 520;

      // Smoothly interpolate subtle interactive tilt (2-3 degrees max)
      const targetTiltX = mousePosRef.current && !prefersReducedMotion ? mousePosRef.current.normX * 2.2 : 0;
      const targetTiltY = mousePosRef.current && !prefersReducedMotion ? mousePosRef.current.normY * 1.8 : 0;
      currentTiltX += (targetTiltX - currentTiltX) * 0.06;
      currentTiltY += (targetTiltY - currentTiltY) * 0.06;

      // Base isometric origin with interactive camera parallax
      const originX = Math.round(w * 0.46) + currentTiltX * 4;
      const baseYOffset = Math.round(h * 0.54 - (platX + platW / 2 + platZ + platD / 2) * TILE_H_HALF + 55);

      // 3D idle floating motion: 2-3px over 5.5s
      const floatOffsetY = prefersReducedMotion
        ? 0
        : Math.sin((elapsed / 5500) * Math.PI * 2) * 3;

      const currentOriginY = baseYOffset + floatOffsetY + currentTiltY * 3;

      ctx.clearRect(0, 0, w, h);

      // -------------------------------------------------------------
      // 1. SOFT STUDIO LIGHTING & AMBIENT DEPTH
      // -------------------------------------------------------------
      const centerIso = isoProject(
        platX + platW / 2,
        0,
        platZ + platD / 2,
        originX,
        currentOriginY
      );

      ctx.save();
      // Apply very subtle scene rotation around platform center (1.5 degrees max)
      if (!prefersReducedMotion && Math.abs(currentTiltX) > 0.01) {
        ctx.translate(centerIso.screenX, centerIso.screenY);
        ctx.rotate((currentTiltX * Math.PI) / 180 * 0.6);
        ctx.translate(-centerIso.screenX, -centerIso.screenY);
      }

      const glowGrad = ctx.createRadialGradient(
        centerIso.screenX,
        centerIso.screenY - 35,
        0,
        centerIso.screenX,
        centerIso.screenY - 35,
        280
      );
      glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      glowGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.45)');
      glowGrad.addColorStop(1, 'rgba(250, 250, 248, 0)');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerIso.screenX, centerIso.screenY - 35, 280, 0, Math.PI * 2);
      ctx.fill();

      // -------------------------------------------------------------
      // 2. SOFT REALISTIC GROUND CONTACT SHADOWS
      // -------------------------------------------------------------
      const shadowY = -1.35;
      const s0 = isoProject(platX - 0.25, shadowY, platZ - 0.25, originX, currentOriginY);
      const s1 = isoProject(platX + platW + 0.35, shadowY, platZ - 0.25, originX, currentOriginY);
      const s2 = isoProject(platX + platW + 0.35, shadowY, platZ + platD + 0.35, originX, currentOriginY);
      const s3 = isoProject(platX - 0.25, shadowY, platZ + platD + 0.35, originX, currentOriginY);

      ctx.beginPath();
      ctx.moveTo(s0.screenX, s0.screenY);
      ctx.lineTo(s1.screenX, s1.screenY);
      ctx.lineTo(s2.screenX, s2.screenY);
      ctx.lineTo(s3.screenX, s3.screenY);
      ctx.closePath();
      ctx.fillStyle = 'rgba(10, 29, 55, 0.055)';
      ctx.fill();

      // Tight inner shadow layer for physical contact realism
      const ss0 = isoProject(platX + 0.25, shadowY + 0.15, platZ + 0.25, originX, currentOriginY);
      const ss1 = isoProject(platX + platW - 0.15, shadowY + 0.15, platZ + 0.25, originX, currentOriginY);
      const ss2 = isoProject(platX + platW - 0.15, shadowY + 0.15, platZ + platD - 0.15, originX, currentOriginY);
      const ss3 = isoProject(platX + 0.25, shadowY + 0.15, platZ + platD - 0.15, originX, currentOriginY);

      ctx.beginPath();
      ctx.moveTo(ss0.screenX, ss0.screenY);
      ctx.lineTo(ss1.screenX, ss1.screenY);
      ctx.lineTo(ss2.screenX, ss2.screenY);
      ctx.lineTo(ss3.screenX, ss3.screenY);
      ctx.closePath();
      ctx.fillStyle = 'rgba(10, 29, 55, 0.04)';
      ctx.fill();

      // -------------------------------------------------------------
      // 3. THIN #2563EB CONNECTION LINES TO NIFTY 50 & SENSEX CARDS
      // -------------------------------------------------------------
      // Connection path to NIFTY 50 (Top-Right):
      // NIFTY 50 │ ─── market platform
      const niftyAnchor = isoProject(platX + platW * 0.88, 0, platZ + 0.2, originX, currentOriginY);
      ctx.beginPath();
      ctx.moveTo(niftyAnchor.screenX, niftyAnchor.screenY);
      ctx.lineTo(niftyAnchor.screenX + 32, niftyAnchor.screenY - 18);
      ctx.lineTo(niftyAnchor.screenX + 32, niftyAnchor.screenY - 85);
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.35)'; // Thin #2563EB connection line
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(niftyAnchor.screenX, niftyAnchor.screenY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#2563EB';
      ctx.fill();

      // Connection path to SENSEX (Mid-Left):
      const sensexAnchor = isoProject(platX, 0, platZ + platD * 0.65, originX, currentOriginY);
      ctx.beginPath();
      ctx.moveTo(sensexAnchor.screenX, sensexAnchor.screenY);
      ctx.lineTo(sensexAnchor.screenX - 35, sensexAnchor.screenY - 10);
      ctx.lineTo(sensexAnchor.screenX - 65, sensexAnchor.screenY - 10);
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.35)'; // Thin #2563EB line
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(sensexAnchor.screenX, sensexAnchor.screenY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#2563EB';
      ctx.fill();

      // Connection path to Supporting Cards Dock (Bottom-Right):
      const dockAnchor = isoProject(platX + platW, 0, platZ + platD * 0.85, originX, currentOriginY);
      ctx.beginPath();
      ctx.moveTo(dockAnchor.screenX, dockAnchor.screenY);
      ctx.lineTo(dockAnchor.screenX + 40, dockAnchor.screenY + 22);
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(dockAnchor.screenX, dockAnchor.screenY, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#2563EB';
      ctx.fill();

      // -------------------------------------------------------------
      // 4. DEEP NAVY CHASSIS & SUBTLE UNDERSIDE (#0A1D37)
      // -------------------------------------------------------------
      const baseInset = 0.14;
      const baseX = platX + baseInset;
      const baseW = platW - baseInset * 2;
      const baseZ = platZ + baseInset;
      const baseD = platD - baseInset * 2;
      const baseY = -0.95;
      const baseH = 0.6;

      // Base: Front-Right Face
      const bfr0 = isoProject(baseX + baseW, baseY, baseZ, originX, currentOriginY);
      const bfr1 = isoProject(baseX + baseW, baseY, baseZ + baseD, originX, currentOriginY);
      const bfr2 = isoProject(baseX + baseW, baseY + baseH, baseZ + baseD, originX, currentOriginY);
      const bfr3 = isoProject(baseX + baseW, baseY + baseH, baseZ, originX, currentOriginY);

      ctx.beginPath();
      ctx.moveTo(bfr0.screenX, bfr0.screenY);
      ctx.lineTo(bfr1.screenX, bfr1.screenY);
      ctx.lineTo(bfr2.screenX, bfr2.screenY);
      ctx.lineTo(bfr3.screenX, bfr3.screenY);
      ctx.closePath();
      ctx.fillStyle = '#061224'; // Deep navy shadow
      ctx.fill();
      ctx.strokeStyle = '#0A1D37';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Base: Front-Left Face (Signature Deep Navy #0A1D37)
      const bfl0 = isoProject(baseX, baseY, baseZ + baseD, originX, currentOriginY);
      const bfl1 = isoProject(baseX + baseW, baseY, baseZ + baseD, originX, currentOriginY);
      const bfl2 = isoProject(baseX + baseW, baseY + baseH, baseZ + baseD, originX, currentOriginY);
      const bfl3 = isoProject(baseX, baseY + baseH, baseZ + baseD, originX, currentOriginY);

      ctx.beginPath();
      ctx.moveTo(bfl0.screenX, bfl0.screenY);
      ctx.lineTo(bfl1.screenX, bfl1.screenY);
      ctx.lineTo(bfl2.screenX, bfl2.screenY);
      ctx.lineTo(bfl3.screenX, bfl3.screenY);
      ctx.closePath();
      ctx.fillStyle = '#0A1D37';
      ctx.fill();
      ctx.strokeStyle = '#122B4D';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Subtle #2563EB accent line at bottom joint
      ctx.beginPath();
      ctx.moveTo(bfl3.screenX, bfl3.screenY);
      ctx.lineTo(bfl2.screenX, bfl2.screenY);
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.45)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // -------------------------------------------------------------
      // 5. UPPER WHITE PLATFORM DECK & TINTED BEVELS
      // -------------------------------------------------------------
      const deckY = -0.35;

      // Deck: Front-Right Face (light navy/blue tint)
      const dfr0 = isoProject(platX + platW, deckY, platZ, originX, currentOriginY);
      const dfr1 = isoProject(platX + platW, deckY, platZ + platD, originX, currentOriginY);
      const dfr2 = isoProject(platX + platW, 0, platZ + platD, originX, currentOriginY);
      const dfr3 = isoProject(platX + platW, 0, platZ, originX, currentOriginY);

      const dfrGrad = ctx.createLinearGradient(0, dfr3.screenY, 0, dfr0.screenY);
      dfrGrad.addColorStop(0, '#E2E8F0');
      dfrGrad.addColorStop(1, '#D0D9E5');

      ctx.beginPath();
      ctx.moveTo(dfr0.screenX, dfr0.screenY);
      ctx.lineTo(dfr1.screenX, dfr1.screenY);
      ctx.lineTo(dfr2.screenX, dfr2.screenY);
      ctx.lineTo(dfr3.screenX, dfr3.screenY);
      ctx.closePath();
      ctx.fillStyle = dfrGrad;
      ctx.fill();
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // Deck: Front-Left Face (very light navy/blue tint)
      const dfl0 = isoProject(platX, deckY, platZ + platD, originX, currentOriginY);
      const dfl1 = isoProject(platX + platW, deckY, platZ + platD, originX, currentOriginY);
      const dfl2 = isoProject(platX + platW, 0, platZ + platD, originX, currentOriginY);
      const dfl3 = isoProject(platX, 0, platZ + platD, originX, currentOriginY);

      const dflGrad = ctx.createLinearGradient(0, dfl3.screenY, 0, dfl0.screenY);
      dflGrad.addColorStop(0, '#F8FAFC');
      dflGrad.addColorStop(1, '#EBF1F7');

      ctx.beginPath();
      ctx.moveTo(dfl0.screenX, dfl0.screenY);
      ctx.lineTo(dfl1.screenX, dfl1.screenY);
      ctx.lineTo(dfl2.screenX, dfl2.screenY);
      ctx.lineTo(dfl3.screenX, dfl3.screenY);
      ctx.closePath();
      ctx.fillStyle = dflGrad;
      ctx.fill();
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // Front Facade SentiNews Label: "SENTINEWS | INTELLIGENCE ENGINE"
      ctx.save();
      const faceCenter = isoProject(
        platX + platW * 0.5,
        deckY * 0.45,
        platZ + platD,
        originX,
        currentOriginY
      );
      const isoAngle = Math.atan2(TILE_H_HALF, TILE_W_HALF);
      ctx.translate(faceCenter.screenX, faceCenter.screenY);
      ctx.rotate(isoAngle);

      // Status indicator dot (#2563EB active signal)
      ctx.beginPath();
      ctx.arc(-74, 0, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = '#2563EB';
      ctx.fill();

      // SentiNews Brand Text
      ctx.font = '700 10.5px Inter, sans-serif';
      ctx.fillStyle = '#0A1D37';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('SENTINEWS', -64, 0);

      // Divider & Subtitle
      ctx.font = '500 9.5px Inter, sans-serif';
      ctx.fillStyle = '#5F6368';
      ctx.fillText('|  INTELLIGENCE ENGINE', 10, 0);
      ctx.restore();

      // Deck: Top Face (Pure White #FFFFFF)
      const pt0 = isoProject(platX, 0, platZ, originX, currentOriginY);
      const pt1 = isoProject(platX + platW, 0, platZ, originX, currentOriginY);
      const pt2 = isoProject(platX + platW, 0, platZ + platD, originX, currentOriginY);
      const pt3 = isoProject(platX, 0, platZ + platD, originX, currentOriginY);

      ctx.beginPath();
      ctx.moveTo(pt0.screenX, pt0.screenY);
      ctx.lineTo(pt1.screenX, pt1.screenY);
      ctx.lineTo(pt2.screenX, pt2.screenY);
      ctx.lineTo(pt3.screenX, pt3.screenY);
      ctx.closePath();
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1.1;
      ctx.stroke();

      // Subtle Inner Inset Border on Top Face
      const inset = 0.2;
      const ipt0 = isoProject(platX + inset, 0, platZ + inset, originX, currentOriginY);
      const ipt1 = isoProject(platX + platW - inset, 0, platZ + inset, originX, currentOriginY);
      const ipt2 = isoProject(platX + platW - inset, 0, platZ + platD - inset, originX, currentOriginY);
      const ipt3 = isoProject(platX + inset, 0, platZ + platD - inset, originX, currentOriginY);

      ctx.beginPath();
      ctx.moveTo(ipt0.screenX, ipt0.screenY);
      ctx.lineTo(ipt1.screenX, ipt1.screenY);
      ctx.lineTo(ipt2.screenX, ipt2.screenY);
      ctx.lineTo(ipt3.screenX, ipt3.screenY);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.08)'; // Subtle #2563EB deck inset
      ctx.lineWidth = 0.75;
      ctx.stroke();

      // -------------------------------------------------------------
      // 6. PRECISION ISOMETRIC MARKET DATA GRID
      // -------------------------------------------------------------
      ctx.strokeStyle = 'rgba(10, 29, 55, 0.035)';
      ctx.lineWidth = 0.6;

      for (let zLine = platZ + 1; zLine < platZ + platD; zLine += 0.8) {
        const start = isoProject(platX + inset, 0, zLine, originX, currentOriginY);
        const end = isoProject(platX + platW - inset, 0, zLine, originX, currentOriginY);
        ctx.beginPath();
        ctx.moveTo(start.screenX, start.screenY);
        ctx.lineTo(end.screenX, end.screenY);
        ctx.stroke();
      }

      for (let xLine = platX + 1; xLine < platX + platW; xLine += 0.8) {
        const start = isoProject(xLine, 0, platZ + inset, originX, currentOriginY);
        const end = isoProject(xLine, 0, platZ + platD - inset, originX, currentOriginY);
        ctx.beginPath();
        ctx.moveTo(start.screenX, start.screenY);
        ctx.lineTo(end.screenX, end.screenY);
        ctx.stroke();
      }

      // Small crosshairs at perimeter coordinates
      const crossCoords = [
        { x: platX + 1.1, z: platZ + 1.1 },
        { x: platX + platW - 1.1, z: platZ + 1.1 },
        { x: platX + 1.1, z: platZ + platD - 1.1 },
        { x: platX + platW - 1.1, z: platZ + platD - 1.1 },
      ];
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.2)';
      ctx.lineWidth = 0.9;
      crossCoords.forEach((coord) => {
        const cp = isoProject(coord.x, 0, coord.z, originX, currentOriginY);
        ctx.beginPath();
        ctx.moveTo(cp.screenX - 3, cp.screenY);
        ctx.lineTo(cp.screenX + 3, cp.screenY);
        ctx.moveTo(cp.screenX, cp.screenY - 2);
        ctx.lineTo(cp.screenX, cp.screenY + 2);
        ctx.stroke();
      });

      // -------------------------------------------------------------
      // 7. MARKET BARS (#2563EB WITH TONAL DEPTH & SOFT SHADOWS)
      // -------------------------------------------------------------
      const sortedBars = [...BARS_CONFIG].sort((a, b) => a.x + a.z - (b.x + b.z));
      const trendPoints: { x: number; y: number; barX: number; barZ: number; h: number; index: number }[] = [];

      sortedBars.forEach((bar, index) => {
        const barDelay = index * 75;
        const barProgress = prefersReducedMotion
          ? 1
          : easeOutCubic((elapsed - barDelay) / 850);
        const currentH = bar.targetH * barProgress;

        // Subtle soft shadow cast by each bar on the platform deck
        if (currentH > 0.1) {
          const bs0 = isoProject(bar.x + 0.04, 0, bar.z + bar.d, originX, currentOriginY);
          const bs1 = isoProject(bar.x + bar.w + 0.18, 0, bar.z + bar.d, originX, currentOriginY);
          const bs2 = isoProject(bar.x + bar.w + 0.18, 0, bar.z + bar.d + 0.22, originX, currentOriginY);
          const bs3 = isoProject(bar.x + 0.04, 0, bar.z + bar.d + 0.22, originX, currentOriginY);

          ctx.beginPath();
          ctx.moveTo(bs0.screenX, bs0.screenY);
          ctx.lineTo(bs1.screenX, bs1.screenY);
          ctx.lineTo(bs2.screenX, bs2.screenY);
          ctx.lineTo(bs3.screenX, bs3.screenY);
          ctx.closePath();
          ctx.fillStyle = 'rgba(10, 29, 55, 0.055)';
          ctx.fill();
        }

        // Tonal blue depth palette derived from #2563EB:
        // Top: lighter blue highlight (#3B82F6 / #60A5FA)
        // Left: primary stock blue (#2563EB)
        // Right: deeper blue shadow (#1D4ED8)
        drawIsoBox(
          ctx,
          bar.x,
          bar.z,
          0,
          bar.w,
          bar.d,
          currentH,
          {
            top: '#3B82F6',
            left: '#2563EB',
            right: '#1D4ED8',
            strokeTop: '#60A5FA',
            strokeLeft: '#1E40AF',
            strokeRight: '#172554',
            lineWidth: 0.6,
          },
          originX,
          currentOriginY
        );

        // Center of bar top face in screen coordinates
        const barTopCenter = isoProject(
          bar.x + bar.w / 2,
          currentH,
          bar.z + bar.d / 2,
          originX,
          currentOriginY
        );

        // Trend line node sits slightly elevated above the bar top
        const trendElevation = 0.38;
        const trendPointCenter = isoProject(
          bar.x + bar.w / 2,
          currentH + trendElevation,
          bar.z + bar.d / 2,
          originX,
          currentOriginY
        );

        trendPoints.push({
          x: trendPointCenter.screenX,
          y: trendPointCenter.screenY,
          barX: barTopCenter.screenX,
          barZ: barTopCenter.screenY,
          h: currentH,
          index,
        });

        // Vertical connector stems (│ │ │ │ │) linking bar top to trend node
        if (currentH > 0.05) {
          ctx.beginPath();
          ctx.setLineDash([2, 2]);
          ctx.moveTo(barTopCenter.screenX, barTopCenter.screenY);
          ctx.lineTo(trendPointCenter.screenX, trendPointCenter.screenY);
          ctx.strokeStyle = 'rgba(37, 99, 235, 0.35)'; // SentiNews blue connector
          ctx.lineWidth = 1;
          ctx.stroke();

          // Small anchor tick at top of bar
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.arc(barTopCenter.screenX, barTopCenter.screenY, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
          ctx.strokeStyle = '#2563EB';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // -------------------------------------------------------------
      // 8. MARKET LINE (#2563EB) & MARKET DATA NODES
      // -------------------------------------------------------------
      if (trendPoints.length > 1) {
        // Calculate smooth curve path through data points
        const curvePath = new Path2D();
        curvePath.moveTo(trendPoints[0].x, trendPoints[0].y);

        for (let i = 0; i < trendPoints.length - 1; i++) {
          const current = trendPoints[i];
          const next = trendPoints[i + 1];
          const midX = (current.x + next.x) / 2;
          const midY = (current.y + next.y) / 2;
          curvePath.quadraticCurveTo(current.x, current.y, midX, midY);
        }
        const lastPt = trendPoints[trendPoints.length - 1];
        curvePath.lineTo(lastPt.x, lastPt.y);

        let approxLength = 0;
        for (let i = 0; i < trendPoints.length - 1; i++) {
          const dx = trendPoints[i + 1].x - trendPoints[i].x;
          const dy = trendPoints[i + 1].y - trendPoints[i].y;
          approxLength += Math.hypot(dx, dy);
        }

        const curveStart = 600;
        const curveDuration = 950;
        const curveProgress = prefersReducedMotion
          ? 1
          : easeOutCubic((elapsed - curveStart) / curveDuration);

        if (curveProgress > 0) {
          // Soft volume gradient wash under the line in #2563EB tint
          const areaPath = new Path2D();
          areaPath.moveTo(trendPoints[0].x, trendPoints[0].y);
          for (let i = 0; i < trendPoints.length - 1; i++) {
            const current = trendPoints[i];
            const next = trendPoints[i + 1];
            const midX = (current.x + next.x) / 2;
            const midY = (current.y + next.y) / 2;
            areaPath.quadraticCurveTo(current.x, current.y, midX, midY);
          }
          areaPath.lineTo(lastPt.x, lastPt.y);
          areaPath.lineTo(lastPt.barX, lastPt.barZ);
          for (let i = trendPoints.length - 1; i >= 0; i--) {
            areaPath.lineTo(trendPoints[i].barX, trendPoints[i].barZ);
          }
          areaPath.closePath();

          const areaGrad = ctx.createLinearGradient(
            0,
            trendPoints[3].y,
            0,
            trendPoints[0].barZ
          );
          areaGrad.addColorStop(0, 'rgba(37, 99, 235, 0.08)');
          areaGrad.addColorStop(1, 'rgba(37, 99, 235, 0.0)');
          ctx.fillStyle = areaGrad;
          ctx.fill(areaPath);

          // Draw the smooth market movement line in #2563EB
          ctx.setLineDash([approxLength, approxLength]);
          ctx.lineDashOffset = approxLength * (1 - curveProgress);
          ctx.strokeStyle = '#2563EB'; // Primary SentiNews Stock Blue
          ctx.lineWidth = 2.6;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke(curvePath);

          // Render Market Data Nodes
          const visibleDotsCount = Math.floor(curveProgress * trendPoints.length);
          const mousePos = mousePosRef.current;

          for (let i = 0; i <= visibleDotsCount && i < trendPoints.length; i++) {
            const pt = trendPoints[i];
            ctx.setLineDash([]);

            // Check if hovered
            let isHovered = false;
            if (mousePos) {
              const dist = Math.hypot(mousePos.x - pt.x, mousePos.y - pt.y);
              if (dist < 18) isHovered = true;
            }

            const outerRadius = isHovered ? 5.5 : 4.2;
            const centerRadius = isHovered ? 2.2 : 1.6;

            // Subtle drop shadow under node
            ctx.beginPath();
            ctx.arc(pt.x, pt.y + 1, outerRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(10, 29, 55, 0.12)';
            ctx.fill();

            // Outer white ring
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, outerRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
            ctx.strokeStyle = '#2563EB'; // #2563EB boundary
            ctx.lineWidth = 1.8;
            ctx.stroke();

            // Small #2563EB center
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, centerRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#2563EB';
            ctx.fill();

            // Hover tooltip value badge
            if (isHovered) {
              ctx.save();
              const tagX = pt.x;
              const tagY = pt.y - 18;
              ctx.fillStyle = '#0A1D37';
              ctx.beginPath();
              ctx.roundRect(tagX - 26, tagY - 9, 52, 18, 4);
              ctx.fill();

              ctx.font = '600 9px Inter, sans-serif';
              ctx.fillStyle = '#FFFFFF';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(`+${(pt.h * 0.72).toFixed(2)}%`, tagX, tagY);
              ctx.restore();
            }
          }

          // Compact "+2.84% HIGH" chart annotation badge on the peak breakout (Index 3)
          if (visibleDotsCount >= 3) {
            const peakPt = trendPoints[3];
            ctx.save();
            const tagX = peakPt.x;
            const tagY = peakPt.y - 18;

            ctx.fillStyle = '#0A1D37'; // Institutional Deep Navy Badge
            ctx.beginPath();
            ctx.roundRect(tagX - 34, tagY - 9, 68, 18, 4);
            ctx.fill();

            ctx.font = '700 9.5px Inter, sans-serif';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('+2.84% HIGH', tagX, tagY);

            // Tiny stem connecting badge directly to data point
            ctx.beginPath();
            ctx.moveTo(tagX - 3, tagY + 9);
            ctx.lineTo(tagX + 3, tagY + 9);
            ctx.lineTo(tagX, tagY + 12);
            ctx.closePath();
            ctx.fillStyle = '#0A1D37';
            ctx.fill();
            ctx.restore();
          }
        }
      }

      ctx.restore();
      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
    };
  }, [width, height]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[490px] sm:h-[510px] lg:h-[530px] flex items-center justify-center select-none ${className}`}
    >
      <canvas ref={canvasRef} className="block w-full h-full cursor-crosshair" />
    </div>
  );
};

export default MarketHero3D;
