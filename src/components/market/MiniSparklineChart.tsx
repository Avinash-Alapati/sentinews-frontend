import React, { useState, useEffect } from 'react';
import { marketApi } from '@/services/api/market.api';
import { SENTINEWS_THEME_COLORS } from '@/config/chart.config';

interface MiniSparklineChartProps {
  symbol: string;
  isPositive: boolean;
}

const sparklineCache = new Map<string, number[]>();

export const MiniSparklineChart: React.FC<MiniSparklineChartProps> = ({
  symbol,
  isPositive,
}) => {
  const [closes, setCloses] = useState<number[]>([]);
  const strokeColor = isPositive
    ? SENTINEWS_THEME_COLORS.positiveGain // #2563EB
    : SENTINEWS_THEME_COLORS.negativeLoss; // #F59E0B

  useEffect(() => {
    let isMounted = true;
    const cleanSym = symbol.trim().toUpperCase();

    if (sparklineCache.has(cleanSym)) {
      setCloses(sparklineCache.get(cleanSym)!);
      return;
    }

    const loadSparkline = async () => {
      try {
        const res = await marketApi.getHistory(cleanSym, '15m', '1d');
        if (isMounted && res && res.candles && res.candles.length > 0) {
          const prices = res.candles.map((c) => c.close).filter((p) => typeof p === 'number' && p > 0);
          if (prices.length > 0) {
            sparklineCache.set(cleanSym, prices);
            setCloses(prices);
          }
        }
      } catch {
        // Fallback gracefully
      }
    };

    loadSparkline();
    return () => {
      isMounted = false;
    };
  }, [symbol]);

  const width = 100;
  const height = 24;

  const pathD = React.useMemo(() => {
    if (closes.length < 2) {
      return isPositive
        ? 'M 0 18 L 30 14 L 60 10 L 100 4'
        : 'M 0 4 L 30 10 L 60 14 L 100 18';
    }

    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const range = max - min || 1;

    return closes.reduce((acc, val, idx) => {
      const x = (idx / (closes.length - 1)) * width;
      const y = height - 4 - ((val - min) / range) * (height - 8);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [closes, isPositive]);

  return (
    <div className="w-24 h-6 mx-auto flex items-center justify-center">
      <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default MiniSparklineChart;
