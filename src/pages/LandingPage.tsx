import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { MarketPerspectiveIntro } from '@/components/landing/MarketPerspectiveIntro';
import { MarketSection } from '@/components/landing/MarketSection';
import { MarketMotionSection } from '@/components/landing/MarketMotionSection';
import { NewsSection } from '@/components/landing/NewsSection';
import { ReportsSection } from '@/components/landing/ReportsSection';
import { PortfolioSection } from '@/components/landing/PortfolioSection';
import { PlatformPerspectives } from '@/components/landing/PlatformPerspectives';
import { AboutSection } from '@/components/landing/AboutSection';
import { LandingCTA } from '@/components/landing/LandingCTA';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] flex flex-col font-sans selection:bg-[#111111] selection:text-[#FAFAF8]">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Landing Page Scroll Story matching Navbar Order: Market -> News -> Reports -> Portfolio -> About */}
      <main className="flex-1">
        {/* 1. Hero Section with Canvas Background, Word Cycling & Single CTA */}
        <HeroSection />

        {/* Narrative Intro: How SentiNews sees the market */}
        <MarketPerspectiveIntro />

        {/* 2. Market Section (#market) & Market in Motion */}
        <MarketSection />
        <MarketMotionSection />

        {/* 3. News Section (#news) */}
        <NewsSection />

        {/* 4. Reports Section (#reports) */}
        <ReportsSection />

        {/* 5. Portfolio Section (#portfolio) */}
        <PortfolioSection />

        {/* 7. Platform Perspectives (Platform Architecture Summary) */}
        <PlatformPerspectives />

        {/* 8. About Section (#about) */}
        <AboutSection />

        {/* 9. Final Single CTA Banner ("Explore SentiNews") */}
        <LandingCTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
