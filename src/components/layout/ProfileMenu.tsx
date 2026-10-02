import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { User as UserIcon, Settings, LogOut, CheckCircle2 } from 'lucide-react';

interface ProfileMenuProps {
  className?: string;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/login');
  };

  const displayName = user?.full_name?.trim() || user?.email?.split('@')[0] || '';
  const initial = displayName ? displayName.charAt(0).toUpperCase() : '';
  const profileImage = user?.avatar_url || user?.profile_image;

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* PERFECT CIRCULAR PROFILE AVATAR (Desktop) */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open profile menu"
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="w-9 h-9 rounded-full bg-[#0A1D37] hover:bg-[#071426] text-white flex items-center justify-center font-semibold text-sm transition-all duration-150 shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A1D37] focus-visible:ring-offset-2 active:scale-95 shrink-0 border border-black/10 overflow-hidden cursor-pointer"
      >
        {profileImage ? (
          <img
            src={profileImage}
            alt={displayName || 'User Profile'}
            className="w-full h-full object-cover rounded-full"
          />
        ) : initial ? (
          <span className="leading-none select-none tracking-tight">{initial}</span>
        ) : (
          <UserIcon className="w-5 h-5 text-white/90" />
        )}
      </button>

      {/* DROPDOWN POPOVER MENU */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="profile-menu-button"
          className="absolute right-0 top-full mt-2 w-64 bg-white border border-[#E5E5E5] rounded-sm shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden"
        >
          {/* USER INFO HEADER */}
          <div className="px-4 py-3 border-b border-[#E5E5E5] bg-[#FAFAF8]/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0A1D37] text-white flex items-center justify-center font-semibold text-sm shrink-0 overflow-hidden">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={displayName || 'User Profile'}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : initial ? (
                <span>{initial}</span>
              ) : (
                <UserIcon className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-[#111111] truncate">
                  {displayName || 'Investor'}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              </div>
              <span className="text-xs text-[#666666] truncate">{user?.email || '—'}</span>
            </div>
          </div>

          {/* MENU ACTIONS */}
          <div className="py-1">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#333333] hover:text-[#0A1D37] hover:bg-[#F5F5F3] transition-colors"
              role="menuitem"
            >
              <UserIcon className="w-4 h-4 text-[#666666]" />
              <span>View Profile</span>
            </Link>

            <Link
              to="/profile?edit=true"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#333333] hover:text-[#0A1D37] hover:bg-[#F5F5F3] transition-colors"
              role="menuitem"
            >
              <Settings className="w-4 h-4 text-[#666666]" />
              <span>Edit Profile & Settings</span>
            </Link>
          </div>

          {/* DIVIDER */}
          <div className="border-t border-[#E5E5E5] my-1" />

          {/* LOGOUT ACTION */}
          <div className="py-0.5">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50/80 transition-colors text-left"
              role="menuitem"
            >
              <LogOut className="w-4 h-4 text-red-600" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
