import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  TrendingUp,
  FileText,
  AlertCircle,
  Bookmark,
  Sparkles,
  Loader2,
  Newspaper,
  ChevronRight,
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem, NotificationType } from '@/types/notification.types';

type FilterTab = 'all' | 'watchlist' | 'interest' | 'market';

export const NotificationMenu: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Filtered notifications list
  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notifications;
    if (activeTab === 'watchlist') {
      return notifications.filter((n) => n.type === 'watchlist' || n.type === 'alert');
    }
    if (activeTab === 'interest') {
      return notifications.filter((n) => n.type === 'interest');
    }
    if (activeTab === 'market') {
      return notifications.filter((n) => n.type === 'market' || n.type === 'report');
    }
    return notifications;
  }, [notifications, activeTab]);

  const handleNotificationClick = (item: NotificationItem) => {
    markAsRead(item.id);
    setIsOpen(false);
    if (item.targetUrl) {
      navigate(item.targetUrl);
    }
  };

  const renderIcon = (type: NotificationType) => {
    switch (type) {
      case 'watchlist':
        return <Bookmark className="w-4 h-4 text-[#0A1D37]" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'interest':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'market':
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'report':
        return <FileText className="w-4 h-4 text-[#0A1D37]" />;
      default:
        return <Bell className="w-4 h-4 text-[#0A1D37]" />;
    }
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      {/* Circular Bell Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="w-9 h-9 rounded-full border border-[#E5E5E5] bg-white hover:bg-[#F5F5F3] text-[#0A1D37] flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A1D37] relative shrink-0 cursor-pointer"
      >
        <Bell className="w-4 h-4 text-[#0A1D37]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0169FE] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0169FE] border border-white" />
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-88 sm:w-96 bg-white border border-[#E5E5E5] rounded-xl shadow-2xl z-50 py-2 animate-in fade-in duration-150 overflow-hidden font-sans">
          {/* Header Bar */}
          <div className="px-4 py-2.5 border-b border-[#F1F1EF] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#0A1D37] text-white rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-[#0A1D37] hover:underline flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* Filter Sub-Tabs */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-[#F1F1EF] bg-[#FAFAF8] overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer shrink-0 ${
                activeTab === 'all'
                  ? 'bg-[#0A1D37] text-white shadow-2xs'
                  : 'text-[#5F6368] hover:bg-white hover:text-[#0A1D37]'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('watchlist')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer shrink-0 ${
                activeTab === 'watchlist'
                  ? 'bg-[#0A1D37] text-white shadow-2xs'
                  : 'text-[#5F6368] hover:bg-white hover:text-[#0A1D37]'
              }`}
            >
              Watchlist
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('interest')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer shrink-0 ${
                activeTab === 'interest'
                  ? 'bg-[#0A1D37] text-white shadow-2xs'
                  : 'text-[#5F6368] hover:bg-white hover:text-[#0A1D37]'
              }`}
            >
              Interests & News
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('market')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer shrink-0 ${
                activeTab === 'market'
                  ? 'bg-[#0A1D37] text-white shadow-2xs'
                  : 'text-[#5F6368] hover:bg-white hover:text-[#0A1D37]'
              }`}
            >
              Market
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#F1F1EF]">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-[#888888] flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#0A1D37]" />
                <span>Syncing live watchlist & market notifications...</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-8 px-4 text-center text-xs text-[#888888] space-y-1">
                <Bell className="w-6 h-6 mx-auto text-[#CCCCCC]" />
                <p className="font-semibold text-[#111111]">No notifications found</p>
                <p className="text-[11px] text-[#888888]">
                  {activeTab === 'watchlist'
                    ? 'No price alerts or updates for your watchlist stocks right now.'
                    : activeTab === 'interest'
                    ? 'No interest news articles match your recent searches.'
                    : 'You are all caught up with market updates!'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3 text-left flex gap-3 hover:bg-[#FAFAF8] transition-colors cursor-pointer group relative ${
                    n.unread ? 'bg-[#0A1D37]/[0.03]' : ''
                  }`}
                >
                  {/* Left Icon Badge */}
                  <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-[#F5F5F3] group-hover:bg-[#0A1D37] group-hover:text-white flex items-center justify-center transition-colors">
                    {renderIcon(n.type)}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center justify-between mb-0.5 gap-2">
                      <span className="text-xs font-bold text-[#111111] group-hover:text-[#0A1D37] transition-colors truncate">
                        {n.title}
                      </span>
                      <span className="text-[10px] font-semibold text-[#888888] shrink-0">
                        {n.time}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#5F6368] leading-snug line-clamp-2 mb-1">
                      {n.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-[#0A1D37]/70 uppercase tracking-wider bg-[#F5F5F3] px-1.5 py-0.5 rounded">
                        {n.category}
                      </span>

                      {n.unread && (
                        <span className="w-2 h-2 rounded-full bg-[#0169FE] shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Navigation Link */}
          <div className="pt-2.5 pb-1 px-4 border-t border-[#F1F1EF] text-center bg-[#FAFAF8]">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/watchlist');
              }}
              className="text-[11px] font-bold text-[#0A1D37] hover:underline inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Manage Watchlist & Alerts</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationMenu;
