import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { newsApi } from '@/services/api/news.api';
import { NewsArticle } from '@/types/news.types';
import {
  ArrowLeft,
  Globe,
  Calendar,
  Clock,
  TrendingUp,
  FileText,
  Building2,
  ExternalLink,
  Layers,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { formatExactTime, getRelativeTime } from '@/utils/date';
import { generateDetailedNewsAnalysis, cleanText } from '@/utils/newsAnalysis';

export const NewsDetailPage: React.FC = () => {
  const { newsId } = useParams<{ newsId: string }>();
  const navigate = useNavigate();

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchArticleDetail = async () => {
      if (!newsId) return;
      try {
        setIsLoading(true);
        const data = await newsApi.getNewsById(newsId);
        if (!isMounted) return;
        setArticle(data);
      } catch (err) {
        console.error('Failed to fetch news article details:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchArticleDetail();
    return () => {
      isMounted = false;
    };
  }, [newsId]);

  const analysis = useMemo(() => {
    if (!article) return null;
    return generateDetailedNewsAnalysis(article);
  }, [article]);

  const handleSymbolClick = (symbol: string) => {
    const cleanSym = symbol.trim().toUpperCase().replace('.NS', '').replace('.BO', '');
    navigate(`/stock/${encodeURIComponent(cleanSym)}`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-[900px] mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        {/* Navigation Back */}
        <div>
          <button
            type="button"
            onClick={() => navigate('/news')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5F6368] hover:text-[#0A1D37] mb-4 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Market News</span>
          </button>
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 space-y-6 animate-pulse">
            <div className="h-6 bg-[#F5F5F3] rounded w-1/4" />
            <div className="h-10 bg-[#F5F5F3] rounded w-5/6" />
            <div className="h-32 bg-[#F5F5F3] rounded w-full" />
          </div>
        ) : !article ? (
          /* Article Not Found */
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-12 text-center space-y-4">
            <Building2 className="w-10 h-10 mx-auto text-[#888888]" />
            <h2 className="text-xl font-bold text-[#111111]">News Article Not Found</h2>
            <p className="text-xs text-[#5F6368] max-w-sm mx-auto">
              The requested news story could not be retrieved or has expired.
            </p>
            <button
              type="button"
              onClick={() => navigate('/news')}
              className="px-5 py-2.5 bg-[#0A1D37] text-white font-bold text-xs rounded-xl cursor-pointer shadow-2xs inline-block"
            >
              Browse All News Stories
            </button>
          </div>
        ) : (
          /* Detailed News Explanation Article */
          <article className="space-y-6">
            {/* Main Header Card */}
            <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 shadow-2xs space-y-4">
              {/* Category & Publisher Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#F1F1EF] pb-4">
                <div className="flex items-center gap-2">
                  <span className="bg-[#F5F5F3] text-[#5F6368] px-2.5 py-1 rounded-md text-[11px] font-bold">
                    {article.category}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#5F6368]">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-[#0A1D37]" />
                    Source: {article.source}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatExactTime(article.publishedAt, true)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[#0A1D37] font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    {getRelativeTime(article.publishedAt)}
                  </span>
                </div>
              </div>

              {/* Main Headline in NAVY BLUE (#0A1D37) */}
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1D37] leading-tight tracking-tight">
                {cleanText(article.title)}
              </h1>
            </div>

            {/* Comprehensive Market Overview & Analysis Box */}
            <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
              {/* Box Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F1EF]">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#0A1D37]" />
                  <h2 className="text-base sm:text-lg font-bold text-[#0A1D37]">
                    Market Overview & Strategic Analysis
                  </h2>
                </div>
                <span className="text-xs text-[#5F6368] hidden sm:inline-block">
                  Institutional Research Synthesis
                </span>
              </div>

              {/* Comprehensive Executive Overview */}
              {analysis && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0A1D37]" />
                    <h3 className="text-sm font-bold text-[#0A1D37]">
                      Executive Overview & Synthesis
                    </h3>
                  </div>
                  <div className="bg-[#FAFAF8] border border-[#E5E5E5] p-5 rounded-xl space-y-3 text-sm sm:text-[15px] text-[#111111] leading-relaxed font-sans font-normal">
                    {analysis.executiveOverview.map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Catalysts & Core Drivers */}
              {analysis && analysis.catalysts.length > 0 && (
                <div className="space-y-3 pt-5 border-t border-[#F1F1EF]">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#0A1D37]" />
                    <h3 className="text-sm font-bold text-[#0A1D37]">
                      Key Catalysts & Drivers
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {analysis.catalysts.map((cat, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-[#E5E5E5] p-4 rounded-xl shadow-2xs space-y-1.5"
                      >
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <h4 className="text-xs sm:text-sm font-bold text-[#0A1D37]">{cat.heading}</h4>
                        </div>
                        <p className="text-xs sm:text-[13px] text-[#5F6368] leading-relaxed">{cat.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sector & Industry Implications */}
              {analysis && (
                <div className="space-y-3 pt-5 border-t border-[#F1F1EF]">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#0A1D37]" />
                    <h3 className="text-sm font-bold text-[#0A1D37]">
                      Sector & Industry Implications ({article.category})
                    </h3>
                  </div>
                  <div className="bg-[#FAFAF8] border border-[#E5E5E5] p-4 sm:p-5 rounded-xl text-xs sm:text-sm text-[#111111] leading-relaxed">
                    <p>{analysis.sectorImpact}</p>
                  </div>
                </div>
              )}

              {/* Market Dynamics & Institutional Context */}
              {analysis && (
                <div className="space-y-3 pt-5 border-t border-[#F1F1EF]">
                  <h3 className="text-sm font-bold text-[#0A1D37]">
                    Market Dynamics & Key Takeaways
                  </h3>
                  <div className="bg-white border border-[#E5E5E5] p-5 rounded-xl space-y-3">
                    <ul className="space-y-2.5 text-xs sm:text-sm text-[#111111] leading-relaxed">
                      {analysis.marketDynamics.map((item, idx) => {
                        const parts = item.split(': ');
                        const label = parts[0];
                        const text = parts.slice(1).join(': ');
                        return (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0A1D37] mt-2 shrink-0" />
                            <span>
                              <strong className="text-[#0A1D37] font-semibold">{label}:</strong> {text}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}

              {/* Impacted Tickers & Stock Navigation */}
              {article.relatedSymbols && article.relatedSymbols.length > 0 && (
                <div className="space-y-3 pt-5 border-t border-[#F1F1EF]">
                  <h3 className="text-sm font-bold text-[#0A1D37]">
                    Impacted Stocks & Indices
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {article.relatedSymbols.map((sym) => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => handleSymbolClick(sym)}
                        className="px-3.5 py-1.5 bg-[#FAFAF8] hover:bg-[#0A1D37] hover:text-white border border-[#0A1D37]/30 rounded-lg text-xs font-bold text-[#0A1D37] transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{sym}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Publisher Source Attribution & External Link */}
              <div className="pt-6 border-t border-[#F1F1EF] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[#5F6368]">
                  Originally reported by <span className="font-semibold text-[#111111]">{article.source}</span>.
                </div>

                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0A1D37] hover:bg-[#0A1D37]/90 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
                >
                  <span>Visit Full Original Article</span>
                  <ExternalLink className="w-4 h-4 text-white" />
                </a>
              </div>
            </div>
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default NewsDetailPage;
