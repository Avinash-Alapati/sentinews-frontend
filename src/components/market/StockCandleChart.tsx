import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CandleData, StockQuote } from '@/types/market.types';
import { marketApi } from '@/services/api/market.api';
import {
  TIMEFRAMES,
  TimeframeRange,
  ChartInterval,
  ChartType,
  TimeframeConfig,
  SENTINEWS_THEME_COLORS,
} from '@/config/chart.config';
import { formatISTTimestamp } from '@/utils/marketHours';
import {
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  LineChart,
  BarChart2,
  ChevronDown,
} from 'lucide-react';

interface StockCandleChartProps {
  symbol: string;
  currentPrice?: number;
  previousClose?: number | null;
  quote?: StockQuote | null;
}

interface ProcessedCandle extends CandleData {
  parsedDate: Date;
  x: number;
  yOpen: number;
  yHigh: number;
  yLow: number;
  yClose: number;
}

export const StockCandleChart: React.FC<StockCandleChartProps> = ({
  symbol,
  currentPrice,
  previousClose,
  quote,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Timeframe and Interval State
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeConfig>(TIMEFRAMES[0]); // Default 1D
  const [selectedInterval, setSelectedInterval] = useState<ChartInterval>(TIMEFRAMES[0].defaultInterval);
  const [chartType, setChartType] = useState<ChartType>('line');

  // Chart Data State
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hover / Interaction State
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Container dimensions
  const [chartWidth, setChartWidth] = useState<number>(800);
  const chartHeight = 340;
  const padding = { top: 25, right: 65, bottom: 35, left: 15 };

  // Sync supported interval when timeframe changes
  useEffect(() => {
    setSelectedInterval(selectedTimeframe.defaultInterval);
  }, [selectedTimeframe]);

  // Responsive width observer
  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setChartWidth(containerRef.current.clientWidth || 800);
      }
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Fetch chart history with race-condition handling
  useEffect(() => {
    let isCancelled = false;

    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await marketApi.getHistory(
          symbol,
          selectedInterval,
          selectedTimeframe.range
        );

        if (isCancelled) return;

        if (data && Array.isArray(data.candles) && data.candles.length > 0) {
          // Clean, validate, and sort candles chronologically
          const validCandles = data.candles
            .filter(
              (c) =>
                c &&
                c.timestamp &&
                typeof c.close === 'number' &&
                !isNaN(c.close) &&
                c.close > 0
            )
            .sort(
              (a, b) =>
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );

          // Remove duplicate timestamps
          const uniqueMap = new Map<string, CandleData>();
          validCandles.forEach((c) => {
            uniqueMap.set(c.timestamp, c);
          });

          setCandles(Array.from(uniqueMap.values()));
        } else {
          setCandles([]);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Failed to load chart history from backend:', err);
          setError('Unable to retrieve historical chart data for this symbol.');
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    fetchHistory();
    return () => {
      isCancelled = true;
    };
  }, [symbol, selectedTimeframe, selectedInterval]);

  // Merge live price update into 1D intraday chart without re-fetching full history
  useEffect(() => {
    if (selectedTimeframe.label !== '1D' || !currentPrice || currentPrice <= 0) return;

    setCandles((prev) => {
      if (prev.length === 0) return prev;
      const lastIndex = prev.length - 1;
      const lastCandle = prev[lastIndex];

      const updatedLast: CandleData = {
        ...lastCandle,
        close: currentPrice,
        high: Math.max(lastCandle.high, currentPrice),
        low: Math.min(lastCandle.low, currentPrice),
      };

      const copy = [...prev];
      copy[lastIndex] = updatedLast;
      return copy;
    });
  }, [currentPrice, selectedTimeframe]);

  // Calculate 1D vs Multi-day Performance & Colors according to SentiNews Design Guidelines (Section 12)
  const prevClose = previousClose ?? quote?.previous_close ?? null;
  const firstPrice = candles.length > 0 ? candles[0].close : currentPrice || 0;
  const lastPrice = currentPrice || (candles.length > 0 ? candles[candles.length - 1].close : 0);

  // SECTION 12 CRITICAL RULE: For 1D, compare latest price vs PREVIOUS CLOSE
  const is1D = selectedTimeframe.label === '1D';
  const isPositive = is1D
    ? prevClose !== null
      ? lastPrice >= prevClose
      : lastPrice >= firstPrice
    : lastPrice >= firstPrice;

  const isNegative = is1D
    ? prevClose !== null
      ? lastPrice < prevClose
      : lastPrice < firstPrice
    : lastPrice < firstPrice;

  const themeColor = isPositive
    ? SENTINEWS_THEME_COLORS.positiveGain // #2563EB (SentiNews Gain Accent)
    : isNegative
    ? SENTINEWS_THEME_COLORS.negativeLoss // #F59E0B (SentiNews Loss Accent)
    : SENTINEWS_THEME_COLORS.neutral;

  // Scale math calculations for SVG canvas
  const innerWidth = Math.max(100, chartWidth - padding.left - padding.right);
  const innerHeight = Math.max(100, chartHeight - padding.top - padding.bottom);

  const priceStats = useMemo(() => {
    if (candles.length === 0) {
      return { min: 0, max: 100, range: 100 };
    }
    let min = Infinity;
    let max = -Infinity;
    candles.forEach((c) => {
      const lowVal = c.low ?? c.close;
      const highVal = c.high ?? c.close;
      if (lowVal < min) min = lowVal;
      if (highVal > max) max = highVal;
    });
    if (prevClose !== null && is1D) {
      if (prevClose < min) min = prevClose;
      if (prevClose > max) max = prevClose;
    }
    const buffer = (max - min) * 0.05 || 1;
    min = Math.floor(min - buffer);
    max = Math.ceil(max + buffer);
    return { min, max, range: max - min || 1 };
  }, [candles, prevClose, is1D]);

  // Process coordinates for all points
  const processedCandles: ProcessedCandle[] = useMemo(() => {
    if (candles.length === 0) return [];
    return candles.map((c, i) => {
      const x = padding.left + (i / Math.max(1, candles.length - 1)) * innerWidth;
      const yClose =
        padding.top + innerHeight - ((c.close - priceStats.min) / priceStats.range) * innerHeight;
      const yOpen =
        padding.top + innerHeight - ((c.open - priceStats.min) / priceStats.range) * innerHeight;
      const yHigh =
        padding.top + innerHeight - ((c.high - priceStats.min) / priceStats.range) * innerHeight;
      const yLow =
        padding.top + innerHeight - ((c.low - priceStats.min) / priceStats.range) * innerHeight;

      return {
        ...c,
        parsedDate: new Date(c.timestamp),
        x,
        yOpen,
        yHigh,
        yLow,
        yClose,
      };
    });
  }, [candles, priceStats, innerWidth, innerHeight]);

  // SVG Paths
  const linePathD = useMemo(() => {
    if (processedCandles.length === 0) return '';
    return processedCandles.reduce(
      (acc, p, i) => (i === 0 ? `M ${p.x} ${p.yClose}` : `${acc} L ${p.x} ${p.yClose}`),
      ''
    );
  }, [processedCandles]);

  const areaPathD = useMemo(() => {
    if (processedCandles.length === 0 || !linePathD) return '';
    const firstX = processedCandles[0].x;
    const lastX = processedCandles[processedCandles.length - 1].x;
    const bottomY = padding.top + innerHeight;
    return `${linePathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [processedCandles, linePathD, innerHeight]);

  // Previous Close Reference Line Y Coordinate
  const prevCloseY = useMemo(() => {
    if (prevClose === null || !is1D) return null;
    return padding.top + innerHeight - ((prevClose - priceStats.min) / priceStats.range) * innerHeight;
  }, [prevClose, is1D, priceStats, innerHeight]);

  // Y-Axis Ticks (5 Price Levels)
  const yTicks = useMemo(() => {
    const count = 5;
    const ticks = [];
    for (let i = 0; i < count; i++) {
      const val = priceStats.min + (i / (count - 1)) * priceStats.range;
      const y = padding.top + innerHeight - (i / (count - 1)) * innerHeight;
      ticks.push({ val, y });
    }
    return ticks;
  }, [priceStats, innerHeight]);

  // X-Axis Time Ticks
  const xTicks = useMemo(() => {
    if (processedCandles.length === 0) return [];
    const maxTicks = Math.min(6, processedCandles.length);
    const step = Math.floor(processedCandles.length / maxTicks) || 1;
    const ticks = [];
    for (let i = 0; i < processedCandles.length; i += step) {
      ticks.push(processedCandles[i]);
    }
    if (ticks[ticks.length - 1] !== processedCandles[processedCandles.length - 1]) {
      ticks.push(processedCandles[processedCandles.length - 1]);
    }
    return ticks;
  }, [processedCandles]);

  // Active Candle for Display
  const activeCandle = hoverIndex !== null && processedCandles[hoverIndex]
    ? processedCandles[hoverIndex]
    : processedCandles[processedCandles.length - 1] || null;

  // Active Candle Price Change calculation
  const activePrice = activeCandle ? activeCandle.close : lastPrice;
  const referencePrice = is1D && prevClose ? prevClose : firstPrice;
  const activeChange = activePrice - referencePrice;
  const activeChangePct = referencePrice ? (activeChange / referencePrice) * 100 : 0;

  // Handle Canvas Mouse Movement for Hover Interaction
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (processedCandles.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    let closestIndex = 0;
    let minDistance = Infinity;

    processedCandles.forEach((p, i) => {
      const dist = Math.abs(p.x - mouseX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }
    });

    setHoverIndex(closestIndex);
    setHoveredCandle(processedCandles[closestIndex]);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    setHoveredCandle(null);
  };

  const gradientId = `sentinews-chart-grad-${symbol}`;

  return (
    <div
      ref={containerRef}
      className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-2xs space-y-4 font-sans"
    >
      {/* Top Controls Bar: Info Bar + Timeframe Pills & View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#F1F1EF]">
        {/* Left: Active Hover Stats Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368]">
              {selectedTimeframe.label} Price Chart
            </span>
            <span className="text-[10px] text-[#888888]">
              ({selectedTimeframe.description})
            </span>
          </div>

          {activeCandle ? (
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#5F6368] pt-0.5">
              <span className="font-semibold text-[#111111]">
                {formatISTTimestamp(activeCandle.timestamp, selectedTimeframe.label !== '1D')}
              </span>
              <span className="font-bold text-[#111111] text-sm">
                ₹{activePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span
                className={`font-semibold text-xs flex items-center gap-0.5 ${
                  activeChange >= 0 ? 'text-[#00B386]' : 'text-[#E53935]'
                }`}
              >
                {activeChange >= 0 ? '+' : ''}₹{activeChange.toFixed(2)} ({activeChange >= 0 ? '+' : ''}{activeChangePct.toFixed(2)}%)
              </span>
              <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-[#888888] pl-2 border-l border-[#E5E5E5]">
                <span>O: ₹{activeCandle.open?.toFixed(2)}</span>
                <span>H: ₹{activeCandle.high?.toFixed(2)}</span>
                <span>L: ₹{activeCandle.low?.toFixed(2)}</span>
                <span>Vol: {activeCandle.volume ? activeCandle.volume.toLocaleString('en-IN') : '—'}</span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Right: Timeframe Selectors & Chart Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Chart Type Toggle (Line vs Candlestick) */}
          <div className="flex items-center bg-[#F5F5F3] p-0.5 rounded-lg border border-[#E5E5E5]">
            <button
              type="button"
              onClick={() => setChartType('line')}
              title="Line Chart"
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                chartType === 'line'
                  ? 'bg-white text-[#0A1D37] shadow-2xs font-bold'
                  : 'text-[#5F6368] hover:text-[#0A1D37]'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setChartType('candlestick')}
              title="Candlestick Chart"
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                chartType === 'candlestick'
                  ? 'bg-white text-[#0A1D37] shadow-2xs font-bold'
                  : 'text-[#5F6368] hover:text-[#0A1D37]'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Timeframe Selector Pills */}
          <div className="flex items-center gap-1 bg-[#F5F5F3] p-1 rounded-lg border border-[#E5E5E5]">
            {TIMEFRAMES.map((tf) => {
              const isSelected = selectedTimeframe.label === tf.label;
              return (
                <button
                  key={tf.label}
                  type="button"
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold font-mono transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0A1D37] text-white shadow-2xs'
                      : 'text-[#5F6368] hover:text-[#111111]'
                  }`}
                >
                  {tf.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Interactive Chart Canvas Area */}
      <div className="relative w-full h-[340px] select-none">
        {isLoading ? (
          <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-xs text-[#5F6368] bg-[#FAFAF8] rounded-lg border border-dashed border-[#E5E5E5]">
            <Loader2 className="w-7 h-7 animate-spin text-[#0A1D37]" />
            <span className="font-semibold text-[#111111]">Loading real-time price history...</span>
            <span className="text-[11px] text-[#888888]">
              Fetching {selectedTimeframe.label} candles for {symbol} from SentiNews Backend
            </span>
          </div>
        ) : error ? (
          <div className="h-full w-full flex flex-col items-center justify-center gap-3 text-xs text-red-600 bg-white border border-red-200 rounded-lg p-6">
            <AlertCircle className="w-7 h-7 text-red-500" />
            <p className="font-semibold text-[#111111]">{error}</p>
            <button
              onClick={() => {
                const currentTf = selectedTimeframe;
                setSelectedTimeframe({ ...currentTf });
              }}
              className="px-3.5 py-1.5 bg-[#0A1D37] text-white text-xs font-semibold rounded-md hover:bg-[#071426] transition-colors cursor-pointer"
            >
              Retry Loading Chart
            </button>
          </div>
        ) : processedCandles.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center gap-1.5 text-xs text-[#5F6368] bg-[#FAFAF8] rounded-lg border border-[#E5E5E5]">
            <p className="font-semibold text-[#111111]">No market chart data available for timeframe {selectedTimeframe.label}</p>
            <p className="text-[11px] text-[#888888]">
              Market may be closed or provider data feed for {symbol} is empty.
            </p>
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-full overflow-visible"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={themeColor} stopOpacity="0.22" />
                <stop offset="100%" stopColor={themeColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Subtle Horizontal Grid & Y-Axis Price Labels */}
            {yTicks.map((tick, idx) => (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={tick.y}
                  x2={chartWidth - padding.right}
                  y2={tick.y}
                  stroke="#F1F1EF"
                  strokeDasharray="3 3"
                />
                <text
                  x={chartWidth - padding.right + 8}
                  y={tick.y + 4}
                  fill="#888888"
                  fontSize="10"
                  fontFamily="sans-serif"
                >
                  ₹{tick.val.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                </text>
              </g>
            ))}

            {/* 1D Intraday Previous Close Dashed Reference Line */}
            {is1D && prevCloseY !== null && (
              <g>
                <line
                  x1={padding.left}
                  y1={prevCloseY}
                  x2={chartWidth - padding.right}
                  y2={prevCloseY}
                  stroke="#888888"
                  strokeDasharray="4 4"
                  strokeWidth="1.2"
                />
                <text
                  x={padding.left + 6}
                  y={prevCloseY - 4}
                  fill="#888888"
                  fontSize="9"
                  fontWeight="bold"
                >
                  Prev Close: ₹{prevClose?.toFixed(2)}
                </text>
              </g>
            )}

            {/* LINE CHART MODE */}
            {chartType === 'line' && (
              <>
                {/* Area Fill */}
                <path d={areaPathD} fill={`url(#${gradientId})`} />

                {/* Primary Trend Line */}
                <path
                  d={linePathD}
                  fill="none"
                  stroke={themeColor}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}

            {/* CANDLESTICK CHART MODE */}
            {chartType === 'candlestick' &&
              processedCandles.map((c, i) => {
                const isCandlePositive = c.close >= c.open;
                const candleColor = isCandlePositive
                  ? SENTINEWS_THEME_COLORS.positiveGain
                  : SENTINEWS_THEME_COLORS.negativeLoss;
                const barWidth = Math.max(2, Math.min(8, (innerWidth / processedCandles.length) * 0.7));
                const topY = Math.min(c.yOpen, c.yClose);
                const candleHeight = Math.max(1.5, Math.abs(c.yOpen - c.yClose));

                return (
                  <g key={i}>
                    {/* Wick Line */}
                    <line
                      x1={c.x}
                      y1={c.yHigh}
                      x2={c.x}
                      y2={c.yLow}
                      stroke={candleColor}
                      strokeWidth="1.2"
                    />
                    {/* Candle Body */}
                    <rect
                      x={c.x - barWidth / 2}
                      y={topY}
                      width={barWidth}
                      height={candleHeight}
                      fill={candleColor}
                      rx="1"
                    />
                  </g>
                );
              })}

            {/* X-Axis Time Labels */}
            {xTicks.map((t, idx) => (
              <text
                key={idx}
                x={t.x}
                y={chartHeight - 8}
                fill="#888888"
                fontSize="10"
                textAnchor="middle"
              >
                {formatISTTimestamp(t.timestamp, selectedTimeframe.label !== '1D')}
              </text>
            ))}

            {/* Interactive Crosshair Line & Active Pointer */}
            {hoverIndex !== null && processedCandles[hoverIndex] && (
              <g>
                {/* Vertical Crosshair */}
                <line
                  x1={processedCandles[hoverIndex].x}
                  y1={padding.top}
                  x2={processedCandles[hoverIndex].x}
                  y2={chartHeight - padding.bottom}
                  stroke="#0A1D37"
                  strokeDasharray="2 2"
                  strokeWidth="1.2"
                />

                {/* Point Highlight Circle */}
                <circle
                  cx={processedCandles[hoverIndex].x}
                  cy={processedCandles[hoverIndex].yClose}
                  r="5"
                  fill={themeColor}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              </g>
            )}

            {/* Current Price Marker (Last point dot) */}
            {processedCandles.length > 0 && hoverIndex === null && (
              <g>
                <circle
                  cx={processedCandles[processedCandles.length - 1].x}
                  cy={processedCandles[processedCandles.length - 1].yClose}
                  r="4"
                  fill={themeColor}
                  className="animate-ping opacity-75"
                />
                <circle
                  cx={processedCandles[processedCandles.length - 1].x}
                  cy={processedCandles[processedCandles.length - 1].yClose}
                  r="4"
                  fill={themeColor}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
              </g>
            )}
          </svg>
        )}
      </div>

      {/* Chart Footer Information */}
      <div className="flex items-center justify-between text-[11px] text-[#5F6368] pt-2 border-t border-[#F1F1EF]">
        <div className="flex items-center gap-3 font-mono">
          <span>Range Low: ₹{priceStats.min.toLocaleString('en-IN')}</span>
          <span>Range High: ₹{priceStats.max.toLocaleString('en-IN')}</span>
        </div>
        <div className="text-[10px] text-[#888888]">
          Real-Time Data Feed • NSE / BSE • SentiNews Market Intelligence
        </div>
      </div>
    </div>
  );
};

export default StockCandleChart;
