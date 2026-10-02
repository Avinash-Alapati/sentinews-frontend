import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ScreenshotItem {
  id: string;
  title: string;
  url: string;
  src: string;
  alt: string;
}

interface ProductScreenshotsSectionProps {
  items?: ScreenshotItem[];
}

export const SCREENSHOT_ITEMS: ScreenshotItem[] = [
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
    id: 'portfolio',
    title: 'My Investment Portfolio',
    url: 'sentinews.in/portfolio',
    src: '/screenshots/portfolio.png',
    alt: 'My Investment Portfolio dashboard preview',
  },
  {
    id: 'watchlist',
    title: 'My Watchlists',
    url: 'sentinews.in/watchlist',
    src: '/screenshots/watchlists.png',
    alt: 'My Watchlists dashboard preview',
  },
  {
    id: 'movers',
    title: 'Top Movers & Live Tracking',
    url: 'sentinews.in/market',
    src: '/screenshots/market-overview.png',
    alt: 'Top Movers and Analytics dashboard preview',
  },
  {
    id: 'news',
    title: 'Indian Market News & Analysis',
    url: 'sentinews.in/news',
    src: '/screenshots/news-analysis.png',
    alt: 'Indian Market News & Analysis dashboard preview',
  },
];

export const ProductScreenshotsSection: React.FC<ProductScreenshotsSectionProps> = ({
  items = SCREENSHOT_ITEMS,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1140);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const slides = items && items.length > 0 ? items : SCREENSHOT_ITEMS;
  const total = slides.length;

  // Track responsive container width strictly aligned with Navbar's max-w-[1140px]
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

  // Autoplay timer: auto-scroll every 2.5 seconds (2500ms)
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (isPaused || shouldReduceMotion) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 2500);
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

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleManualPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleManualNext();
    }
  };

  // Helper to calculate circular relative offset (-floor(total/2) to floor((total-1)/2))
  const getOffset = (index: number) => {
    let diff = (index - activeIndex) % total;
    if (diff > Math.floor(total / 2)) {
      diff -= total;
    } else if (diff < -Math.floor((total - 1) / 2)) {
      diff += total;
    }
    return diff;
  };

  // Precise geometry to guarantee all cards remain strictly within the SentiNews Logo (left) & Get Started button (right)
  const sideScale = 0.84;
  const isDesktop = containerWidth >= 1024;
  const isTablet = containerWidth >= 768 && containerWidth < 1024;

  const cardWidth = isDesktop
    ? Math.min(620, Math.floor(containerWidth * 0.56))
    : isTablet
    ? Math.floor(containerWidth * 0.65)
    : Math.floor(containerWidth * 0.86);

  // Maximum shift allowed so the flanking card's outer edge + shadow never passes the container boundary
  const gutter = isDesktop ? 16 : 8;
  const maxAllowedShift = Math.max(0, (containerWidth - cardWidth * sideScale) / 2 - gutter);
  const idealShift = isDesktop ? 260 : isTablet ? 180 : 100;
  const shiftX = Math.min(maxAllowedShift, idealShift);

  return (
    <section
      className="py-16 sm:py-20 bg-[#FAFAF8] select-none"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Product Showcase Carousel"
    >
      {/* Strict container matching Navbar's max-w-[1140px] px-4 sm:px-6 (Logo on left, Get Started on right) */}
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6">
        
        {/* Section Header: Aligned with SentiNews Logo (left) and Get Started (right) */}
        <div className="flex flex-row items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <h2 className="text-[32px] sm:text-[36px] font-bold text-[#111111] tracking-[-0.02em] leading-tight">
              See it in action
            </h2>
            <p className="text-[15px] sm:text-[16px] font-normal text-[#5F6368] mt-1.5">
              A look inside the platform.
            </p>
          </div>

          {/* Clean Rounded Arrow Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleManualPrev}
              aria-label="Previous platform preview"
              className="w-9 h-9 sm:w-10 sm:h-10 border border-[#E5E5E5] rounded-[8px] bg-[#FFFFFF] flex items-center justify-center text-[#111111] hover:bg-[#F5F5F5] hover:border-[#D4D4D4] active:scale-95 transition-all shadow-[0_1px_3px_rgba(10,29,55,0.04)] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
            </button>
            <button
              type="button"
              onClick={handleManualNext}
              aria-label="Next platform preview"
              className="w-9 h-9 sm:w-10 sm:h-10 border border-[#E5E5E5] rounded-[8px] bg-[#FFFFFF] flex items-center justify-center text-[#111111] hover:bg-[#F5F5F5] hover:border-[#D4D4D4] active:scale-95 transition-all shadow-[0_1px_3px_rgba(10,29,55,0.04)] cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* 3D Perspective Stage: Contained strictly within the 1140px width with overflow-hidden */}
        <div
          ref={containerRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative w-full h-[300px] sm:h-[400px] md:h-[460px] lg:h-[490px] flex items-center justify-center overflow-hidden"
        >
          {slides.map((slide, idx) => {
            const offset = getOffset(idx);
            const isCenter = offset === 0;
            const isLeft = offset === -1;
            const isRight = offset === 1;
            const isVisible = Math.abs(offset) <= 1;

            // Hidden cards stay tucked right behind the flank cards so they never peek outside the container boundaries
            const xOffset = isCenter
              ? 0
              : isLeft
              ? -shiftX
              : isRight
              ? shiftX
              : offset < 0
              ? -(shiftX + 24)
              : shiftX + 24;

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
                  scale: isCenter ? 1 : isVisible ? sideScale : 0.72,
                  opacity: isCenter ? 1 : isVisible ? 0.78 : 0,
                  zIndex: isCenter ? 30 : isVisible ? 20 : 0,
                }}
                transition={{
                  duration: shouldReduceMotion ? 0.05 : 0.58,
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
                  if (dragOffset.x < -40 || velocity.x < -200) {
                    handleManualNext();
                  } else if (dragOffset.x > 40 || velocity.x > 200) {
                    handleManualPrev();
                  }
                }}
              >
                {/* Browser Card Frame */}
                <div
                  className={`w-full rounded-[14px] sm:rounded-[18px] border border-[#E5E5E5] bg-[#FFFFFF] overflow-hidden transition-shadow duration-300 ${
                    isCenter
                      ? 'shadow-[0_20px_50px_-15px_rgba(10,29,55,0.18),0_10px_20px_-10px_rgba(10,29,55,0.08)] ring-1 ring-black/[0.04]'
                      : 'shadow-[0_12px_30px_-10px_rgba(10,29,55,0.10)] ring-1 ring-black/[0.02] cursor-pointer'
                  }`}
                >
                  {/* Browser Chrome Window Header */}
                  <div className="h-8 sm:h-9 bg-[#F8F9FA] border-b border-[#E5E5E5] px-3 sm:px-4 flex items-center justify-between shrink-0">
                    {/* Window Controls Dots */}
                    <div className="flex items-center gap-1.5 w-14 sm:w-16">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]/40" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]/40" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]/40" />
                    </div>

                    {/* Centered URL Badge Pill */}
                    <div className="w-[160px] sm:w-[220px] md:w-[260px] h-[20px] bg-[#FFFFFF] border border-[#E5E5E5] rounded-[5px] px-2.5 flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                      <span className="text-[10px] sm:text-[11px] text-[#5F6368] font-mono tracking-tight truncate">
                        {slide.url}
                      </span>
                    </div>

                    {/* Right Optical Spacer */}
                    <div className="w-14 sm:w-16" />
                  </div>

                  {/* Screenshot Viewport */}
                  <div className="w-full h-[200px] sm:h-[280px] md:h-[340px] lg:h-[370px] bg-[#FAFAF8] relative overflow-hidden flex items-center justify-center">
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
        </div>

        {/* 5 Pagination Dots matching design */}
        <div className="flex items-center justify-center gap-2 mt-8 sm:mt-10">
          {slides.map((slide, dotIdx) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => handleDotClick(dotIdx)}
              aria-label={`Go to slide ${dotIdx + 1}: ${slide.title}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === dotIdx
                  ? 'w-7 bg-[#0066FF] shadow-xs'
                  : 'w-2 bg-[#CBD5E1] hover:bg-[#94A3B8]'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductScreenshotsSection;
