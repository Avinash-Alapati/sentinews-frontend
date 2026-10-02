/**
 * Utility functions for parsing, formatting, and live-updating news timestamps.
 */

/**
 * Safely parses any ISO timestamp string into a Date object, ensuring UTC interpretation.
 * If the string does not specify a timezone offset (+/-HH:mm) or trailing 'Z',
 * 'Z' is appended so standard browsers treat it as UTC rather than machine-local time.
 */
export const parseUtcDate = (dateStr?: string | null): Date => {
  if (!dateStr) return new Date();
  
  let cleanStr = String(dateStr).trim();
  if (!cleanStr) return new Date();

  // If format is "YYYY-MM-DD HH:mm:ss", replace space with 'T'
  if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}/.test(cleanStr)) {
    cleanStr = cleanStr.replace(' ', 'T');
  }

  // If no timezone offset (Z, +05:30, -04:00, etc.), append Z for UTC
  if (!cleanStr.endsWith('Z') && !/[+-]\d{2}(:\d{2})?$/.test(cleanStr)) {
    cleanStr += 'Z';
  }

  const parsed = new Date(cleanStr);
  return isNaN(parsed.getTime()) ? new Date(dateStr) : parsed;
};

/**
 * Formats an ISO timestamp into a human-friendly relative time string.
 * Examples: "Just now", "5m ago", "2h ago", "1d ago"
 */
export const getRelativeTime = (isoString?: string | null, now: Date = new Date()): string => {
  if (!isoString) return 'Recently';

  try {
    const date = parseUtcDate(isoString);
    const diffMs = now.getTime() - date.getTime();
    
    // In case of slight future skew due to clock differences
    if (diffMs < 45 * 1000) {
      return 'Just now';
    }

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${Math.max(1, diffMins)}m ago`;
    }
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }

    // Older than a week, display formatted date
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return 'Recently';
  }
};

/**
 * Formats an ISO timestamp into an exact local time string.
 * Example: "1:45 PM" or "1:45 PM, 25 Sep"
 */
export const formatExactTime = (isoString?: string | null, includeDate: boolean = true): string => {
  if (!isoString) return '';
  try {
    const date = parseUtcDate(isoString);
    const timePart = date.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (!includeDate) return timePart;

    const datePart = date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });

    return `${timePart}, ${datePart}`;
  } catch {
    return '';
  }
};
