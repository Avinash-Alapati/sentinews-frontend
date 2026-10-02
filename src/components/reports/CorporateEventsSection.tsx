import React from 'react';
import { CorporateEventItem } from '@/types/reports.types';
import { Calendar, FileBadge, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CorporateEventsSectionProps {
  events?: CorporateEventItem[];
  title?: string;
  isLoading?: boolean;
}

export const CorporateEventsSection: React.FC<CorporateEventsSectionProps> = ({
  events = [],
  title = 'Corporate Actions & Key Events Calendar',
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg p-5 shadow-sm space-y-4">
        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[#F8F9FA] rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F0]">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#0A1D37]" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#0A1D37]">
            {title}
          </h2>
        </div>
        <span className="text-[11px] font-medium text-[#6B7280]">NSE / BSE Announcements</span>
      </div>

      <div className="divide-y divide-[#F0F0F0]">
        {events.map((event, idx) => (
          <div key={event.symbol + idx} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Link
                  to={`/stock/${event.symbol}`}
                  className="text-sm font-bold text-[#0A1D37] hover:text-[#2563EB] transition-colors"
                >
                  {event.company_name || event.symbol}
                </Link>
                <span className="text-xs px-2 py-0.5 rounded bg-[#F1F5F9] text-[#475569] font-mono">
                  {event.symbol}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200">
                  <FileBadge className="w-3 h-3 text-amber-600" />
                  {event.event_type}
                </span>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed">
                {event.details}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#64748B] shrink-0 font-medium">
              <Info className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span>Date: {event.announcement_date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
