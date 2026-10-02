/**
 * Utility functions for Indian Stock Market (NSE / BSE) Timing & Status.
 * Always evaluated in Asia/Kolkata (IST) timezone.
 */

export interface MarketStatusDetails {
  status: 'OPEN' | 'CLOSED' | 'PRE_MARKET';
  label: string;
  isLive: boolean;
  message: string;
}

/**
 * Gets the current time in IST (Asia/Kolkata).
 */
export const getISTDate = (inputDate: Date = new Date()): Date => {
  const istString = inputDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  return new Date(istString);
};

/**
 * Determines whether the Indian Equity Market is currently open for normal trading (09:15 - 15:30 IST Mon-Fri).
 */
export const isIndianMarketOpen = (now: Date = new Date()): boolean => {
  const ist = getISTDate(now);
  const day = ist.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  if (day === 0 || day === 6) return false;

  const minutesFromMidnight = ist.getHours() * 60 + ist.getMinutes();
  const openTime = 9 * 60 + 15; // 09:15 IST (555 mins)
  const closeTime = 15 * 60 + 30; // 15:30 IST (930 mins)

  return minutesFromMidnight >= openTime && minutesFromMidnight <= closeTime;
};

/**
 * Returns complete market status details in Asia/Kolkata time.
 */
export const getMarketStatusDetails = (now: Date = new Date()): MarketStatusDetails => {
  const ist = getISTDate(now);
  const day = ist.getDay();
  const minutesFromMidnight = ist.getHours() * 60 + ist.getMinutes();

  if (day === 0 || day === 6) {
    return {
      status: 'CLOSED',
      label: 'Market Closed',
      isLive: false,
      message: 'Market closed for Weekend (NSE/BSE)',
    };
  }

  const preMarketStart = 9 * 60; // 09:00 IST
  const openTime = 9 * 60 + 15; // 09:15 IST
  const closeTime = 15 * 60 + 30; // 15:30 IST

  if (minutesFromMidnight >= preMarketStart && minutesFromMidnight < openTime) {
    return {
      status: 'PRE_MARKET',
      label: 'Pre-Market',
      isLive: true,
      message: 'Pre-Market Session (09:00 - 09:15 IST)',
    };
  }

  if (minutesFromMidnight >= openTime && minutesFromMidnight <= closeTime) {
    return {
      status: 'OPEN',
      label: 'Market Open',
      isLive: true,
      message: 'NSE/BSE Live Trading Session (09:15 - 15:30 IST)',
    };
  }

  return {
    status: 'CLOSED',
    label: 'Market Closed',
    isLive: false,
    message: 'Market closed (Trading hours: 09:15 - 15:30 IST)',
  };
};

/**
 * Formats a Date or timestamp string in IST (Asia/Kolkata) format.
 * Example: "09:15 AM IST" or "25 Sep 2026, 03:30 PM IST"
 */
export const formatISTTimestamp = (
  dateOrStr?: string | Date | null,
  includeDate = true,
  includeSeconds = false
): string => {
  if (!dateOrStr) return '';
  try {
    const d = typeof dateOrStr === 'string' ? new Date(dateOrStr) : dateOrStr;
    if (isNaN(d.getTime())) return String(dateOrStr);

    const timeOptions: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: includeSeconds ? '2-digit' : undefined,
      hour12: true,
    };

    const timeStr = d.toLocaleTimeString('en-IN', timeOptions);
    if (!includeDate) return timeStr;

    const dateStr = d.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return `${dateStr}, ${timeStr}`;
  } catch {
    return String(dateOrStr);
  }
};
