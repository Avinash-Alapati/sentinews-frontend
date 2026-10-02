import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Building2,
  BarChart3,
  Layers,
  Newspaper,
  FileText,
  PieChart,
  Activity,
  Radio,
} from 'lucide-react';
import { HeroProductShowcase } from './HeroProductShowcase';

export const HeroSection: React.FC = () => {
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Section-wide subtle ambient background canvas (lowered visual prominence, faint depth)
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    resizeCanvas();

    const resizeObserver = new ResizeObserver(() => resizeCanvas());
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // 10 subtle, very low opacity geometric data threads
    const threadCount = 10;
    const threads = Array.from({ length: threadCount }, () => ({
      x: Math.random() * (canvas.width || 1200),
      y: Math.random() * (canvas.height || 800),
      length: 60 + Math.random() * 140,
      angle: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() * 0.001 + 0.0005) * (Math.random() > 0.5 ? 1 : -1),
      vx: Math.random() * 0.14 - 0.07,
      vy: Math.random() * 0.14 - 0.07,
      lineWidth: 0.5,
      opacity: 0.012 + Math.random() * 0.012,
    }));

    // 5 very faint drifting circles
    const circleCount = 5;
    const circles = Array.from({ length: circleCount }, () => ({
      x: Math.random() * (canvas.width || 1200),
      y: Math.random() * (canvas.height || 800),
      radius: 30 + Math.random() * 55,
      vx: Math.random() * 0.1 - 0.05,
      vy: Math.random() * 0.1 - 0.05,
      lineWidth: 0.5,
      opacity: 0.01 + Math.random() * 0.01,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render faint circles
      circles.forEach((c) => {
        if (!prefersReducedMotion) {
          c.x += c.vx;
          c.y += c.vy;
          if (c.x < -c.radius) c.x = canvas.width + c.radius;
          if (c.x > canvas.width + c.radius) c.x = -c.radius;
          if (c.y < -c.radius) c.y = canvas.height + c.radius;
          if (c.y > canvas.height + c.radius) c.y = -c.radius;
        }

        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(10, 29, 55, ${c.opacity})`;
        ctx.lineWidth = c.lineWidth;
        ctx.stroke();
      });

      // Render faint geometric lines
      threads.forEach((t) => {
        if (!prefersReducedMotion) {
          t.x += t.vx;
          t.y += t.vy;
          t.angle += t.rotSpeed;
          if (t.x < -t.length) t.x = canvas.width + t.length;
          if (t.x > canvas.width + t.length) t.x = -t.length;
          if (t.y < -t.length) t.y = canvas.height + t.length;
          if (t.y > canvas.height + t.length) t.y = -t.length;
        }

        const half = t.length / 2;
        const cos = Math.cos(t.angle);
        const sin = Math.sin(t.angle);

        ctx.beginPath();
        ctx.moveTo(t.x - half * cos, t.y - half * sin);
        ctx.lineTo(t.x + half * cos, t.y + half * sin);
        ctx.strokeStyle = `rgba(10, 29, 55, ${t.opacity})`;
        ctx.lineWidth = t.lineWidth;
        ctx.stroke();
      });

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
    };
  }, []);


  // 5 Source Flow Nodes (NSE/BSE to News)
  const sourceNodes = [
    { label: 'NSE / BSE', icon: Building2 },
    { label: 'Indices', icon: BarChart3 },
    { label: 'Stocks', icon: Activity },
    { label: 'Sectors', icon: Layers },
    { label: 'News & Events', icon: Newspaper },
  ];

  return (
    <section className="relative min-h-[calc(100vh-64px)] pt-20 pb-12 bg-[#FAFAF8] flex flex-col justify-center overflow-hidden">
      {/* Background Ambient Canvas (Subtle Depth) */}
      <canvas
        ref={bgCanvasRef}
        className="absolute inset-0 z-0 pointer-events-none w-full h-full"
      />


      <div className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 w-full space-y-10 lg:space-y-12">
        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.18fr] gap-10 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Clean Editorial Headline, Feature Strip, Two CTAs */}
          <div className="flex flex-col justify-center text-left">
            
            {/* Minimal Brand Label above Headline */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-3.5"
            >
              <div className="inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                <span className="text-[11px] font-semibold tracking-[0.12em] text-[#5F6368] uppercase">
                  SENTINEWS INTELLIGENCE
                </span>
              </div>
            </motion.div>

            {/* Headline Block: Understand Indian Markets. */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-[clamp(44px,5.2vw,72px)] font-[750] text-[#111111] leading-[1.02] tracking-[-0.03em] select-none">
                Understand<br />
                <span className="text-[#0A1D37]">Indian Markets.</span>
              </h1>
            </motion.div>

            {/* Sub-headline: 18-20px, line-height 1.5-1.65, max width ~520px */}
            <motion.p
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-[18px] sm:text-[19px] font-normal text-[#5F6368] leading-[1.58] max-w-[500px] mt-5"
            >
              Real-time market data, stock movements, market reports and portfolio intelligence — all in one unified ecosystem.
            </motion.p>

            {/* Feature Icon Row (4 items with clean #2563EB icons and #5F6368 labels) */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-wrap items-center gap-6 sm:gap-7 mt-8 pt-1"
            >
              <div className="flex flex-col items-center gap-1.5 text-center group cursor-default">
                <Radio className="w-5 h-5 text-[#2563EB] stroke-[1.8]" />
                <span className="text-[11px] font-medium text-[#5F6368]">Live Market Data</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 text-center group cursor-default">
                <FileText className="w-5 h-5 text-[#2563EB] stroke-[1.8]" />
                <span className="text-[11px] font-medium text-[#5F6368]">Market Reports</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 text-center group cursor-default">
                <PieChart className="w-5 h-5 text-[#2563EB] stroke-[1.8]" />
                <span className="text-[11px] font-medium text-[#5F6368]">Portfolio Tracking</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 text-center group cursor-default">
                <Newspaper className="w-5 h-5 text-[#2563EB] stroke-[1.8]" />
                <span className="text-[11px] font-medium text-[#5F6368]">News & Events</span>
              </div>
            </motion.div>

            {/* CTA Row (Two Buttons side by side with subtle lift on hover) */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.4 }}
              className="mt-8 flex items-center gap-4 flex-wrap"
            >
              <Link
                to="/market"
                className="inline-flex items-center justify-center h-12 px-6 bg-[#0A1D37] text-white text-[15px] font-semibold rounded-[6px] hover:bg-[#0A1D37]/90 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-180 select-none cursor-pointer"
              >
                Explore Market
              </Link>
              <Link
                to="/reports"
                className="inline-flex items-center justify-center h-12 px-6 bg-transparent border-[1.5px] border-[#0A1D37] text-[#0A1D37] text-[15px] font-semibold rounded-[6px] hover:bg-[#0A1D37]/5 hover:-translate-y-0.5 hover:shadow-xs transition-all duration-180 select-none cursor-pointer"
              >
                View Reports
              </Link>
            </motion.div>

          </div>

          {/* RIGHT COLUMN: Platform Preview Showcase (Browser Mockups) */}
          <div className="relative w-full flex items-center justify-center">
            <HeroProductShowcase />
          </div>

        </div>

        {/* BOTTOM ROW: Source Node Flow ("NSE/BSE → Indices → Stocks → Sectors → News & Events") */}
        <div className="pt-2 border-t border-[#E5E5E5]/60">
          <div className="overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex items-center justify-center min-w-max mx-auto gap-3 sm:gap-4">
              {sourceNodes.map((node, index) => {
                const Icon = node.icon;
                return (
                  <React.Fragment key={node.label}>
                    {/* Node Card */}
                    <motion.div
                      initial={
                        shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.8 + index * 0.08,
                        ease: 'easeOut',
                      }}
                      className="w-[72px] h-[72px] bg-[#FFFFFF] border border-[#E5E5E5] rounded-[12px] shadow-[0_2px_8px_rgba(10,29,55,0.05)] p-2.5 flex flex-col items-center justify-center gap-1.5 shrink-0"
                    >
                      <Icon className="w-6 h-6 text-[#0A1D37] stroke-[1.7]" />
                      <span className="text-[10px] font-medium text-[#5F6368] text-center leading-tight truncate w-full">
                        {node.label}
                      </span>
                    </motion.div>

                    {/* Arrow Connector (Between Nodes) */}
                    {index < sourceNodes.length - 1 && (
                      <motion.div
                        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.85 + index * 0.08 }}
                        className="shrink-0"
                      >
                        <svg
                          width="32"
                          height="12"
                          viewBox="0 0 32 12"
                          className="block text-[#CBD5E1]"
                        >
                          <line
                            x1="0"
                            y1="6"
                            x2="24"
                            y2="6"
                            stroke="#CBD5E1"
                            strokeWidth="1.2"
                          />
                          <polygon points="24,3 32,6 24,9" fill="#CBD5E1" />
                        </svg>
                      </motion.div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
