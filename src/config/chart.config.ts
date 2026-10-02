export type TimeframeRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y' | 'ALL';
export type ChartInterval = '1m' | '5m' | '15m' | '30m' | '1h' | '1d' | '1wk' | '1mo';
export type ChartType = 'line' | 'candlestick';

export interface TimeframeConfig {
  label: TimeframeRange;
  range: string;
  defaultInterval: ChartInterval;
  description: string;
}

export const TIMEFRAMES: TimeframeConfig[] = [
  {
    label: '1D',
    range: '1d',
    defaultInterval: '1m', // 1-min data by default
    description: '1-minute intraday trading session',
  },
  {
    label: '1W',
    range: '5d',
    defaultInterval: '1d', // Days
    description: 'Daily candles (5 trading days)',
  },
  {
    label: '1M',
    range: '1mo',
    defaultInterval: '1d', // Days
    description: 'Daily candles (Past 1 month)',
  },
  {
    label: '3M',
    range: '3mo',
    defaultInterval: '1d', // Days
    description: 'Daily candles (Past 3 months)',
  },
  {
    label: '6M',
    range: '6mo',
    defaultInterval: '1d', // Days
    description: 'Daily candles (Past 6 months)',
  },
  {
    label: '1Y',
    range: '1y',
    defaultInterval: '1wk',
    description: 'Weekly candles (Past 1 year)',
  },
  {
    label: '3Y',
    range: '3y',
    defaultInterval: '1wk',
    description: 'Weekly candles (Past 3 years)',
  },
  {
    label: '5Y',
    range: '5y',
    defaultInterval: '1mo',
    description: 'Monthly candles (Past 5 years)',
  },
  {
    label: 'ALL',
    range: 'max',
    defaultInterval: '1mo',
    description: 'Full history available',
  },
];

export const SENTINEWS_THEME_COLORS = {
  navyPrimary: '#0A1D37',
  positiveGain: '#00B386', // Green color for growth
  negativeLoss: '#E53935', // Red color for down
  neutral: '#5F6368',
  bgLight: '#FAFAF8',
  borderLight: '#E5E5E5',
};
