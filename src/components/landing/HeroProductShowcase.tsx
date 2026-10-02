import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ShowcaseSlide {
  id: string;
  title: string;
  url: string;
  src: string;
  alt: string;
}

const SHOWCASE_SLIDES: ShowcaseSlide[] = [
  {
    id: 'market',
    title: 'Market Overview & Stock Intelligence',
    url: 'sentinews.in/market',
    src: '/screenshots/market-overview.png',
    alt: 'Market Overview & Stock Intelligence dashboard preview',
  },
  {
    id: 'chart',
    title: 'Live Intraday Chart & Price Analytics',
    url: 'sentinews.in/market/stock/CENTEXT-RE',
    src: '/screenshots/stock-chart.png',
    alt: 'Live Intraday Stock Chart and Price Analytics dashboard preview',
  },
  {
    id: 'news',
    title: 'Indian Market News & Analysis',
    url: 'sentinews.in/news',
    src: '/screenshots/news-analysis.png',
    alt: 'Indian Market News & Analysis dashboard preview',
  },
  {
    id: 'portfolio',
    title: 'Investment Portfolio & Holdings',
    url: 'sentinews.in/portfolio',
    src: '/screenshots/portfolio.png',
    alt: 'Investment Portfolio & Holdings dashboard preview',
  },
  {
    id: 'reports',
    title: 'Daily Market Intelligence Reports',
    url: 'sentinews.in/reports',
    src: '/screenshots/reports.png',
    alt: 'Daily Market Intelligence Reports preview',
  },
  {
    id: 'watchlist',
    title: 'Custom Stock Watchlists',
    url: 'sentinews.in/watchlist',
    src: '/screenshots/watchlists.png',
    alt: 'Custom Stock Watchlists preview',
  },
];

export const HeroProductShowcase: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(580);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const slides = SHOWCASE_SLIDES;
  const total = slides.length;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      setContainerWidth(container.clientWidth);
    };
    update();

    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay timer: auto-advance every 3.2 seconds
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (isPaused || shouldReduceMotion) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 3200);
  }, [isPaused, shouldReduceMotion, nextSlide]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const handleManualNext = () => {
    nextSlide();
    resetTimer();
  };

  const handleManualPrev = () => {
    prevSlide();
    resetTimer();
  };

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
    resetTimer();
  };

  // Helper to calculate circular distance offset
  const getOffset = (idx: number) => {
    let diff = (idx - activeIndex) % total;
    if (diff > Math.floor(total / 2)) diff -= total;
    if (diff < -Math.floor(total / 2)) diff += total;
    return diff;
  };

  // Dynamic responsive sizing for Hero right-column integration
  const isMobile = containerWidth < 480;
  const isTablet = containerWidth >= 480 && containerWidth < 768;

  const cardWidth = isMobile
    ? Math.min(containerWidth - 28, 340)
    : isTablet
    ? Math.min(containerWidth * 0.72, 420)
    : Math.min(containerWidth * 0.74, 460);

  const sideScale = isMobile ? 0.85 : isTablet ? 0.84 : 0.82;
  const shiftX = isMobile
    ? cardWidth * 0.28
    : isTablet
    ? cardWidth * 0.35
    : cardWidth * 0.40;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full flex flex-col items-center justify-center select-none"
    >
      {/* Visual Perspective Stage */}
      <div className="relative w-full h-[280px] sm:h-[340px] md:h-[380px] lg:h-[410px] flex items-center justify-center overflow-hidden">
        {slides.map((slide, idx) => {
          const offset = getOffset(idx);
          const isCenter = offset === 0;
          const isLeft = offset === -1;
          const isRight = offset === 1;
          const isVisible = Math.abs(offset) <= 1;

          const xOffset = isCenter
            ? 0
            : isLeft
            ? -shiftX
            : isRight
            ? shiftX
            : offset < 0
            ? -(shiftX + 20)
            : shiftX + 20;

          return (
            <motion.div
              key={slide.id}
              className="absolute top-1/2 left-1/2 origin-center"
              style={{
                width: `${cardWidth}px`,
                pointerEvents: isVisible ? 'auto' : 'none',
              }}
              initial={false}
              animate={{
                x: `calc(-50% + ${xOffset}px)`,
                y: '-50%',
                scale: isCenter ? 1 : isVisible ? sideScale : 0.68,
                opacity: isCenter ? 1 : isVisible ? 0.75 : 0,
                zIndex: isCenter ? 30 : isVisible ? 20 : 0,
              }}
              transition={{
                duration: shouldReduceMotion ? 0.05 : 0.52,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              onClick={() => {
                if (isLeft) handleManualPrev();
                if (isRight) handleManualNext();
              }}
              drag={isCenter ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={(_e, { offset: dragOffset, velocity }) => {
                if (dragOffset.x < -35 || velocity.x < -180) {
                  handleManualNext();
                } else if (dragOffset.x > 35 || velocity.x > 180) {
                  handleManualPrev();
                }
              }}
            >
              {/* Browser Card Frame */}
              <div
                className={`w-full rounded-[14px] sm:rounded-[16px] border border-[#E5E5E5] bg-[#FFFFFF] overflow-hidden transition-all duration-300 ${
                  isCenter
                    ? 'shadow-[0_22px_50px_-12px_rgba(10,29,55,0.18),0_8px_20px_-6px_rgba(10,29,55,0.08)] ring-1 ring-black/[0.04]'
                    : 'shadow-[0_12px_28px_-8px_rgba(10,29,55,0.10)] ring-1 ring-black/[0.02] cursor-pointer hover:opacity-90'
                }`}
              >
                {/* Browser Chrome Window Header */}
                <div className="h-7 sm:h-8 bg-[#F8F9FA] border-b border-[#E5E5E5] px-3 flex items-center justify-between shrink-0">
                  {/* Window Control Traffic Light Dots */}
                  <div className="flex items-center gap-1.5 w-12 sm:w-14">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]/40" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]/40" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]/40" />
                  </div>

                  {/* Centered URL Badge Pill */}
                  <div className="w-[140px] sm:w-[180px] md:w-[210px] h-[19px] bg-[#FFFFFF] border border-[#E5E5E5] rounded-[5px] px-2 flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <span className="text-[9.5px] sm:text-[10.5px] text-[#5F6368] font-mono tracking-tight truncate">
                      {slide.url}
                    </span>
                  </div>

                  {/* Right Spacer */}
                  <div className="w-12 sm:w-14" />
                </div>

                {/* Screenshot Viewport */}
                <div className="w-full h-[180px] sm:h-[225px] md:h-[255px] lg:h-[275px] bg-[#FAFAF8] relative overflow-hidden flex items-center justify-center">
                  <img
                    src={slide.src}
                    alt={slide.alt}
                    draggable={false}
                    className="w-full h-full object-cover object-top select-none pointer-events-none"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Compact Navigation Chevron Arrows */}
        <button
          type="button"
          onClick={handleManualPrev}
          aria-label="Previous platform slide"
          className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-40 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] border border-[#E5E5E5] shadow-xs flex items-center justify-center text-[#111111] hover:scale-105 active:scale-95 transition-all cursor-pointer backdrop-blur-xs"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2]" />
        </button>

        <button
          type="button"
          onClick={handleManualNext}
          aria-label="Next platform slide"
          className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-40 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] border border-[#E5E5E5] shadow-xs flex items-center justify-center text-[#111111] hover:scale-105 active:scale-95 transition-all cursor-pointer backdrop-blur-xs"
        >
          <ChevronRight className="w-4 h-4 stroke-[2]" />
        </button>
      </div>

      {/* Slide Title Label & Pagination Dots */}
      <div className="flex flex-col items-center gap-2 mt-2">
        <span className="text-[12px] sm:text-[13px] font-medium text-[#5F6368] transition-all">
          {slides[activeIndex].title}
        </span>

        <div className="flex items-center justify-center gap-1.5">
          {slides.map((slide, dotIdx) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => handleDotClick(dotIdx)}
              aria-label={`Go to slide ${dotIdx + 1}: ${slide.title}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === dotIdx
                  ? 'w-6 bg-[#0066FF] shadow-xs'
                  : 'w-1.5 bg-[#CBD5E1] hover:bg-[#94A3B8]'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroProductShowcase;
