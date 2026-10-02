export type NotificationType = 'watchlist' | 'interest' | 'market' | 'report' | 'alert';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  timestamp: number;
  unread: boolean;
  type: NotificationType;
  category: string;
  symbol?: string;
  targetUrl: string;
}
