import React, { useMemo } from 'react';
import { PortfolioHolding, PortfolioAllocation } from '@/types/portfolio.types';
import { ShieldAlert, AlertTriangle, ShieldCheck, Info, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RiskTabProps {
  holdings: PortfolioHolding[];
  allocation: PortfolioAllocation | null;
  totalValue: number;
}

export const RiskTab: React.FC<RiskTabProps> = ({ holdings, allocation, totalValue }) => {
  const navigate = useNavigate();

  // Largest holding analysis
  const largestHolding = useMemo(() => {
    if (holdings.length === 0) return null;
    const sorted = [...holdings].sort((a, b) => (b.current_value || 0) - (a.current_value || 0));
    const item = sorted[0];
    const weight = totalValue > 0 ? (item.current_value / totalValue) * 100 : 0;
    return { ...item, weight };
  }, [holdings, totalValue]);

  // Largest sector analysis
  const largestSector = useMemo(() => {
    const sectors = allocation?.sectors || [];
    if (sectors.length === 0) return null;
    const sorted = [...sectors].sort((a, b) => (b.weight_percent || 0) - (a.weight_percent || 0));
    return sorted[0];
  }, [allocation]);

  // Top 5 Concentration Weight
  const top5ConcentrationPct = useMemo(() => {
    if (holdings.length === 0 || totalValue <= 0) return 0;
    const sorted = [...holdings].sort((a, b) => (b.current_value || 0) - (a.current_value || 0));
    const sum = sorted.slice(0, 5).reduce((acc, h) => acc + (h.current_value || 0), 0);
    return (sum / totalValue) * 100;
  }, [holdings, totalValue]);

  // Risk Score (0 - 100)
  const riskAssessment = useMemo(() => {
    let score = 85;
    const warnings: string[] = [];

    if (largestHolding && largestHolding.weight > 20) {
      score -= 20;
      warnings.push(`Single stock ${largestHolding.symbol} accounts for ${largestHolding.weight.toFixed(1)}% of total portfolio (recommended max: 15%).`);
    }

    if (largestSector && largestSector.weight_percent > 35) {
      score -= 20;
      warnings.push(`Sector '${largestSector.sector}' accounts for ${largestSector.weight_percent.toFixed(1)}% of total allocation (recommended max: 30%).`);
    }

    if (holdings.length < 5 && holdings.length > 0) {
      score -= 15;
      warnings.push(`Portfolio has only ${holdings.length} holding(s). Diversifying across 10-15 stocks reduces idiosyncratic volatility.`);
    }

    let level: 'Low Risk (Healthy)' | 'Moderate Risk' | 'High Concentration Risk' = 'Low Risk (Healthy)';
    if (score < 60) level = 'High Concentration Risk';
    else if (score < 80) level = 'Moderate Risk';

    return { score, level, warnings };
  }, [largestHolding, largestSector, holdings]);

  return (
    <div className="space-y-6 font-sans">
      {/* Risk Header Score Banner */}
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F1F1EF]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0A1D37] text-white flex items-center justify-center font-bold text-lg shrink-0">
              <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#111111]">Portfolio Concentration &amp; Health Analysis</h3>
              <p className="text-xs text-[#5F6368]">
                Prudent risk metrics and single-asset exposure monitoring
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#5F6368] uppercase font-bold">Health Score:</span>
            <span
              className={`px-3 py-1 text-xs font-bold font-mono rounded-full border ${
                riskAssessment.score >= 80
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : riskAssessment.score >= 60
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {riskAssessment.score}/100 • {riskAssessment.level}
            </span>
          </div>
        </div>

        {/* Warnings & Risk Alerts */}
        {riskAssessment.warnings.length > 0 ? (
          <div className="space-y-2">
            {riskAssessment.warnings.map((warn, i) => (
              <div
                key={i}
                className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{warn}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">
              Excellent diversification! Your portfolio maintains balanced weight distribution across single stocks and sectors.
            </span>
          </div>
        )}
      </div>

      {/* Grid: 3 Exposure Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Single Stock Exposure */}
        <div className="p-5 bg-white border border-[#E5E5E5] rounded-2xl shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368]">
              LARGEST STOCK EXPOSURE
            </span>
            {largestHolding && largestHolding.weight > 15 && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                High
              </span>
            )}
          </div>

          {largestHolding ? (
            <div className="space-y-1">
              <span className="text-base font-bold text-[#0A1D37] block">{largestHolding.symbol}</span>
              <div className="text-xl font-bold font-mono text-[#111111]">
                {largestHolding.weight.toFixed(1)}% Weight
              </div>
              <span className="text-[11px] text-[#888888] block">
                ₹{largestHolding.current_value?.toLocaleString('en-IN')} total value
              </span>
            </div>
          ) : (
            <span className="text-xs text-[#888888]">No holdings</span>
          )}
        </div>

        {/* Card 2: Sector Exposure */}
        <div className="p-5 bg-white border border-[#E5E5E5] rounded-2xl shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368]">
              DOMINANT SECTOR EXPOSURE
            </span>
            {largestSector && largestSector.weight_percent > 30 && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                Concentrated
              </span>
            )}
          </div>

          {largestSector ? (
            <div className="space-y-1">
              <span className="text-base font-bold text-[#0A1D37] block">{largestSector.sector}</span>
              <div className="text-xl font-bold font-mono text-[#111111]">
                {largestSector.weight_percent?.toFixed(1)}% Weight
              </div>
              <span className="text-[11px] text-[#888888] block">
                ₹{largestSector.current_value?.toLocaleString('en-IN')} total value
              </span>
            </div>
          ) : (
            <span className="text-xs text-[#888888]">No sectors</span>
          )}
        </div>

        {/* Card 3: Top 5 Assets Concentration */}
        <div className="p-5 bg-white border border-[#E5E5E5] rounded-2xl shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368]">
              TOP 5 ASSETS WEIGHT
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-base font-bold text-[#0A1D37] block">Concentration Ratio</span>
            <div className="text-xl font-bold font-mono text-[#111111]">
              {top5ConcentrationPct.toFixed(1)}%
            </div>
            <span className="text-[11px] text-[#888888] block">
              Percentage of capital in top 5 holdings
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
