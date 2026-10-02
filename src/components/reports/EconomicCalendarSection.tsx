import React from 'react';
import { EconomicEventItem } from '@/types/reports.types';
import { CalendarDays, AlertCircle } from 'lucide-react';

interface EconomicCalendarSectionProps {
  events?: EconomicEventItem[];
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
}

export const EconomicCalendarSection: React.FC<EconomicCalendarSectionProps> = ({
  events = [],
  title = 'Economic Calendar & Key Macro Releases',
  subtitle = 'Central Bank Announcements & Economic Data',
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg p-5 shadow-sm space-y-4">
        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
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
          <CalendarDays className="w-4 h-4 text-[#0A1D37]" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#0A1D37]">
            {title}
          </h2>
        </div>
        <span className="text-[11px] font-medium text-[#6B7280]">{subtitle}</span>
      </div>

      <div className="divide-y divide-[#F0F0F0]">
        {events.map((item, idx) => {
          const impactColor =
            item.impact === 'high'
              ? 'bg-red-50 text-red-700 border-red-200'
              : item.impact === 'medium'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-blue-50 text-blue-700 border-blue-200';

          return (
            <div key={idx} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0F172A]">{item.event}</span>
                  <span className="text-[11px] font-semibold text-[#64748B] uppercase px-1.5 py-0.5 rounded bg-[#F1F5F9]">
                    {item.country}
                  </span>
                  {item.impact && (
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${impactColor}`}>
                      {item.impact} Impact
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#64748B] flex items-center gap-3 pt-0.5">
                  {item.estimate && <span>Est: <strong className="text-[#1E293B]">{item.estimate}</strong></span>}
                  {item.actual && <span>Act: <strong className="text-[#1E293B]">{item.actual}</strong></span>}
                  {item.previous && <span>Prev: <strong className="text-[#1E293B]">{item.previous}</strong></span>}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-medium text-[#64748B] shrink-0">
                <AlertCircle className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span>{item.date_time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
