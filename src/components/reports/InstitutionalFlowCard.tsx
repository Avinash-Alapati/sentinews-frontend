import React from 'react';
import { FIIDIIData } from '@/types/reports.types';
import { Landmark, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

interface InstitutionalFlowCardProps {
  fiiDiiData?: FIIDIIData | null;
  isLoading?: boolean;
}

export const InstitutionalFlowCard: React.FC<InstitutionalFlowCardProps> = ({
  fiiDiiData,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg p-5 shadow-sm space-y-4 animate-pulse">
        <div className="h-5 w-48 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-24 bg-[#F8F9FA] rounded" />
          <div className="h-24 bg-[#F8F9FA] rounded" />
        </div>
      </div>
    );
  }

  if (!fiiDiiData) {
    return null;
  }

  const { fii_buy, fii_sell, fii_net, dii_buy, dii_sell, dii_net, date, source_note } = fiiDiiData;

  const isFiiPositive = fii_net >= 0;
  const isDiiPositive = dii_net >= 0;
  const combinedNet = (fii_net || 0) + (dii_net || 0);
  const isCombinedPositive = combinedNet >= 0;

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg p-5 shadow-sm space-y-5">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0F0F0]">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4 text-[#0A1D37]" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#0A1D37]">
            Institutional Investor Activity (FII / DII)
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
            Provisional NSE/BSE Data
          </span>
          {date && <span className="text-xs font-medium text-[#6B7280]">Date: {date}</span>}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* FII / FPI Activity */}
        <div className="bg-[#F8F9FA] border border-[#E2E8F0] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0A1D37]">
              FII / FPI Activity
            </span>
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${
                isFiiPositive
                  ? 'bg-emerald-50 text-[#00B386] border border-emerald-200'
                  : 'bg-red-50 text-[#E53935] border border-red-200'
              }`}
            >
              {isFiiPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {isFiiPositive ? 'Net Buyer' : 'Net Seller'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-[#E5E7EB] py-2">
            <div>
              <span className="text-[#64748B] block text-[11px]">Buy Value</span>
              <span className="font-semibold text-[#1E293B]">₹{fii_buy?.toLocaleString('en-IN')} Cr</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[11px]">Sell Value</span>
              <span className="font-semibold text-[#1E293B]">₹{fii_sell?.toLocaleString('en-IN')} Cr</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-medium text-[#475569]">Net Inflow / Outflow:</span>
            <span
              className={`text-sm font-bold ${
                isFiiPositive ? 'text-[#00B386]' : 'text-[#E53935]'
              }`}
            >
              {isFiiPositive ? '+' : ''}₹{fii_net?.toLocaleString('en-IN')} Cr
            </span>
          </div>
        </div>

        {/* DII Activity */}
        <div className="bg-[#F8F9FA] border border-[#E2E8F0] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0A1D37]">
              DII Activity
            </span>
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${
                isDiiPositive
                  ? 'bg-emerald-50 text-[#00B386] border border-emerald-200'
                  : 'bg-red-50 text-[#E53935] border border-red-200'
              }`}
            >
              {isDiiPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {isDiiPositive ? 'Net Buyer' : 'Net Seller'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-[#E5E7EB] py-2">
            <div>
              <span className="text-[#64748B] block text-[11px]">Buy Value</span>
              <span className="font-semibold text-[#1E293B]">₹{dii_buy?.toLocaleString('en-IN')} Cr</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[11px]">Sell Value</span>
              <span className="font-semibold text-[#1E293B]">₹{dii_sell?.toLocaleString('en-IN')} Cr</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-medium text-[#475569]">Net Inflow / Outflow:</span>
            <span
              className={`text-sm font-bold ${
                isDiiPositive ? 'text-[#00B386]' : 'text-[#E53935]'
              }`}
            >
              {isDiiPositive ? '+' : ''}₹{dii_net?.toLocaleString('en-IN')} Cr
            </span>
          </div>
        </div>

        {/* Combined Net Summary */}
        <div className="bg-[#0A1D37] text-white rounded-lg p-4 flex flex-col justify-between space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Combined Net Institutional
            </span>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-200 font-mono">
              ₹ CRORES
            </span>
          </div>

          <div className="space-y-1 my-auto">
            <span className="text-[11px] text-slate-400 uppercase tracking-wide block">
              FII + DII Total Balance
            </span>
            <div
              className={`text-2xl font-extrabold ${
                isCombinedPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isCombinedPositive ? '+' : ''}₹{combinedNet.toLocaleString('en-IN')} Cr
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-700/60 pt-2 flex items-center gap-1">
            <Info className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{source_note || 'NSE/BSE Official Disclosures'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
