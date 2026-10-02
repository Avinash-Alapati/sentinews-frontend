import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import {
  Home,
  Search,
  ArrowRight,
  TrendingUp,
  Newspaper,
  Bookmark,
  FileText,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { ProfileMenu } from './ProfileMenu';
import { NavbarSearch } from './NavbarSearch';
import { NotificationMenu } from './NotificationMenu';
import { MarketTickerBar } from './MarketTickerBar';

interface NavItem {
  label: string;
  id: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const Navbar: React.FC = () => {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const location = useLocation();

  const { isAuthenticated } = useAuthStore();

  // Scroll spy effect to highlight navbar items based on visible Landing Page sections
  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection(null);
      return;
    }

    const sectionIds = ['market', 'news', 'reports', 'portfolio', 'about'];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120; // 120px offset for sticky header

      let currentSection: string | null = null;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            currentSection = id;
            break;
          }
        }
      }

      // Default to last section if near bottom of page
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 60) {
        currentSection = sectionIds[sectionIds.length - 1];
      }

      setActiveSection(currentSection);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: NavItem) => {
    if (location.pathname === '/') {
      const element = document.getElementById(item.id);
      if (element) {
        e.preventDefault();
        const yOffset = -72; // header height
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  // DESKTOP: Text-only navigation links in requested order: Market -> News -> Watchlist -> Reports -> Portfolio
  const desktopAuthenticatedNavItems: NavItem[] = [
    { label: 'Market', id: 'market', path: '/market' },
    { label: 'News', id: 'news', path: '/news' },
    { label: 'Watchlist', id: 'watchlist', path: '/watchlist' },
    { label: 'Reports', id: 'reports', path: '/reports' },
    { label: 'Portfolio', id: 'portfolio', path: '/portfolio' },
  ];

  const guestNavItems: NavItem[] = [
    { label: 'Market', id: 'market', path: '/market' },
    { label: 'News', id: 'news', path: '/news' },
    { label: 'Reports', id: 'reports', path: '/reports' },
    { label: 'Portfolio', id: 'portfolio', path: '/portfolio' },
    { label: 'About', id: 'about', path: '/about' },
  ];

  // MOBILE: Bottom navigation bar items aligned with requested order
  const mobileNavItems: NavItem[] = [
    { label: 'Market', id: 'market', path: '/market', icon: TrendingUp },
    { label: 'News', id: 'news', path: '/news', icon: Newspaper },
    { label: 'Watchlist', id: 'watchlist', path: '/watchlist', icon: Bookmark },
    { label: 'Reports', id: 'reports', path: '/reports', icon: FileText },
    { label: 'Profile', id: 'profile', path: '/profile', icon: UserIcon },
  ];

  const desktopNavItems = isAuthenticated ? desktopAuthenticatedNavItems : guestNavItems;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E5E5E5] transition-colors duration-150">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">
          {mobileSearchOpen ? (
            /* Inline expanded search bar directly inside the 72px Navbar header container */
            <div className="w-full flex items-center gap-2 animate-in fade-in duration-150">
              <div className="flex-1">
                <NavbarSearch autoFocus isFullWidth />
              </div>
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="p-1.5 text-[#666666] hover:text-[#0A1D37] hover:bg-[#F5F5F3] rounded-full transition-colors shrink-0"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            /* Normal Navbar Header Row */
            <>
              {/* LEFT: Original SentiNews Logo */}
              <Logo />

              {/* CENTER: Navigation Links (Desktop) — Scroll-aware section highlighting */}
              <nav className="hidden md:flex items-center space-x-5 lg:space-x-7" aria-label="Main Navigation">
                {desktopNavItems.map((item) => {
                  const isItemActive = location.pathname === '/'
                    ? (activeSection ? item.id === activeSection : false)
                    : location.pathname === item.path;

                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={(e) => handleNavClick(e, item)}
                      className={`text-sm tracking-wide transition-colors duration-150 relative py-1.5 ${
                        isItemActive
                          ? 'text-[#0A1D37] font-semibold'
                          : 'text-[#5F6368] hover:text-[#0A1D37] font-medium'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isItemActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0A1D37]" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* RIGHT: Utility Controls Group (Desktop) */}
              <div className="hidden md:flex items-center">
                {isAuthenticated ? (
                  <div className="flex items-center">
                    <div className="mr-3 lg:mr-3.5">
                      <NavbarSearch />
                    </div>
                    <div className="mr-3 lg:mr-3.5">
                      <NotificationMenu />
                    </div>
                    <ProfileMenu />
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center text-sm font-medium text-white bg-[#0A1D37] hover:bg-[#071426] px-5 py-2.5 rounded-[4px] transition-all duration-150 shadow-xs active:scale-[0.98] select-none"
                    >
                      <span>Get Started</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* MOBILE CONTROLS (Top Right) */}
              <div className="flex md:hidden items-center gap-1">
                <button
                  type="button"
                  onClick={() => setMobileSearchOpen(true)}
                  aria-label="Search SentiNews"
                  className="p-2 text-[#0A1D37] hover:bg-[#F5F5F3] rounded-full transition-colors focus:outline-none cursor-pointer"
                >
                  <Search className="w-5 h-5 text-[#0A1D37]" />
                </button>

                <NotificationMenu />
              </div>
            </>
          )}
        </div>
      </header>

      {/* Global Market Ticker Line below Navbar */}
      <MarketTickerBar />

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      {isAuthenticated && (
        <nav
          aria-label="Mobile Bottom Navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E5E5] px-2 py-2 shadow-lg flex items-center justify-around safe-bottom"
        >
          {mobileNavItems.map((item) => {
            const isItemActive = location.pathname === item.path;
            const Icon = item.icon || TrendingUp;

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex flex-col items-center justify-center py-1 px-1.5 min-w-[56px] rounded-sm transition-colors relative ${
                  isItemActive
                    ? 'text-[#0A1D37] font-semibold'
                    : 'text-[#666666] hover:text-[#0A1D37]'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isItemActive ? 'stroke-[2.2]' : 'stroke-[1.7]'}`} />
                <span className="text-[10px] tracking-tight leading-none text-center">
                  {item.label}
                </span>
                {isItemActive && (
                  <span className="w-1 h-1 rounded-full bg-[#0A1D37] mt-1" />
                )}
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
};

export default Navbar;
