import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { GlobalSearchModal } from '@/components/market/GlobalSearchModal';

interface NavbarSearchProps {
  autoFocus?: boolean;
  isFullWidth?: boolean;
}

export const NavbarSearch: React.FC<NavbarSearchProps> = ({
  isFullWidth = false,
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Navbar Search Trigger Bar */}
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={`${
          isFullWidth ? 'w-full' : 'w-[180px] sm:w-[220px] lg:w-[260px]'
        } h-9 px-3.5 rounded-full bg-white border border-[#E5E5E5] flex items-center justify-between text-xs text-[#666666] hover:border-[#0A1D37]/60 hover:bg-[#FAFAF8] transition-all duration-150 shadow-2xs cursor-pointer text-left`}
      >
        <div className="flex items-center gap-2 truncate">
          <Search className="w-3.5 h-3.5 text-[#888888] shrink-0" />
          <span className="text-xs text-[#888888] truncate font-normal">
            Search stocks, indices, ETF...
          </span>
        </div>
        <kbd className="hidden lg:inline-block text-[10px] font-mono text-[#888888] bg-[#F5F5F3] px-1.5 py-0.5 rounded border border-[#E5E5E5]">
          ⌘K
        </kbd>
      </button>

      {/* Global Search Popup Modal */}
      <GlobalSearchModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default NavbarSearch;
