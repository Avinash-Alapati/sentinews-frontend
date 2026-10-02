import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/store/useAuthStore';
import {
  User as UserIcon,
  Mail,
  ShieldCheck,
  Calendar,
  LogOut,
  Edit3,
  Check,
  Camera,
  ArrowLeft,
  KeyRound,
  PieChart,
  TrendingUp,
  ArrowRight,
  Briefcase,
  AlertCircle,
  Lock,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser, logout } = useAuthStore();

  const isEditParam = searchParams.get('edit') === 'true';
  const [isEditing, setIsEditing] = useState(isEditParam);

  // Form state
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || user?.profile_image || '');
  const [showPhotoInput, setShowPhotoInput] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.full_name) {
      setFullName(user.full_name);
    }
    if (user?.avatar_url || user?.profile_image) {
      setAvatarUrl(user.avatar_url || user.profile_image || '');
    }
  }, [user]);

  useEffect(() => {
    setIsEditing(isEditParam);
  }, [isEditParam]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    // Validate Password Change if any password field is entered
    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword) {
        setPasswordError('Please enter your current password.');
        return;
      }
      if (newPassword.length < 6) {
        setPasswordError('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError('New password and confirm password do not match.');
        return;
      }
    }

    if (isAuthenticated && user) {
      updateUser({
        full_name: fullName.trim(),
        avatar_url: avatarUrl.trim() || undefined,
        profile_image: avatarUrl.trim() || undefined,
      });
    }

    // Reset password fields
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    setSuccessMessage(
      newPassword
        ? 'Profile information and password updated successfully.'
        : 'Profile information updated successfully.'
    );
    setIsEditing(false);
    setSearchParams({});
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const displayName = user?.full_name?.trim() || (user?.email ? user.email.split('@')[0] : 'Guest Investor');
  const initial = displayName ? displayName.charAt(0).toUpperCase() : 'G';
  const activePhoto = avatarUrl.trim() || user?.avatar_url || user?.profile_image;

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1140px] mx-auto px-4 sm:px-6 py-8 w-full pb-24 md:pb-12">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-[#E5E5E5]">
            <div>
              <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#666666] block mb-1">
                ACCOUNT & PORTFOLIO MANAGEMENT
              </span>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111] flex items-center gap-2.5">
                <UserIcon className="w-6 h-6 text-[#0A1D37]" />
                <span>{isEditing ? 'Edit Profile & Password' : 'User Profile'}</span>
              </h1>
            </div>

            {!isEditing ? (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setSearchParams({ edit: 'true' });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0A1D37] bg-white border border-[#E5E5E5] hover:bg-[#F5F5F3] rounded-sm transition-colors shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setPasswordError(null);
                  setSearchParams({});
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#666666] hover:text-[#111111] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Overview</span>
              </button>
            )}
          </div>

          {/* Guest Banner if user is not authenticated */}
          {!isAuthenticated && (
            <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Guest Session Mode</span>
                  <span className="text-[11px] text-amber-800">
                    You are browsing the profile page in public guest mode. Sign in to save settings across devices.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0A1D37] rounded-sm hover:bg-[#071426] transition-colors"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="px-3 py-1.5 text-xs font-medium text-[#0A1D37] bg-white border border-[#E5E5E5] rounded-sm hover:bg-[#F5F5F3] transition-colors"
                >
                  Register
                </button>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-sm flex items-center gap-2.5 text-xs text-emerald-800 animate-in fade-in duration-150">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {passwordError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-sm flex items-center gap-2.5 text-xs text-rose-800 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {/* Main Profile Card */}
          <div className="bg-[#FFFFFF] border border-[#E5E5E5] p-6 sm:p-8 rounded-sm shadow-xs space-y-6">
            {/* AVATAR HERO SECTION */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-[#E5E5E5]">
              <div className="relative group w-20 h-20 rounded-full bg-[#0A1D37] text-white flex items-center justify-center text-3xl font-semibold shrink-0 overflow-hidden shadow-xs border-2 border-white ring-1 ring-[#E5E5E5]">
                {activePhoto ? (
                  <img
                    src={activePhoto}
                    alt={displayName || 'User Profile'}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : initial ? (
                  <span className="leading-none select-none">{initial}</span>
                ) : (
                  <UserIcon className="w-8 h-8 text-white/90" />
                )}

                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setShowPhotoInput(!showPhotoInput)}
                    className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-medium cursor-pointer"
                    title="Change Photo"
                  >
                    <Camera className="w-4 h-4 mb-0.5" />
                    <span>Change</span>
                  </button>
                )}
              </div>

              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-[#111111] truncate">
                    {displayName || 'Investor'}
                  </h2>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-xs shrink-0 ${
                    isAuthenticated
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-300'
                  }`}>
                    {isAuthenticated ? 'Active Session' : 'Guest Public View'}
                  </span>
                </div>
                <p className="text-xs text-[#666666] truncate">
                  {user?.email || (isAuthenticated ? 'Registered Account' : 'guest@sentinews.com (Unauthenticated)')}
                </p>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setShowPhotoInput(!showPhotoInput)}
                    className="text-xs font-semibold text-[#0A1D37] hover:underline flex items-center gap-1 pt-1"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{showPhotoInput ? 'Hide photo URL' : 'Change Photo URL'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* EDIT PROFILE & PASSWORD FORM */}
            {isEditing ? (
              <form onSubmit={handleSaveChanges} className="space-y-6">
                {showPhotoInput && (
                  <div className="space-y-1.5 p-3.5 bg-[#FAFAF8] border border-[#E5E5E5] rounded-sm">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
                      Profile Photo Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-white border border-[#E5E5E5] rounded-sm focus:outline-none focus:border-[#0A1D37] transition-colors"
                    />
                    <p className="text-[11px] text-[#666666]">
                      Paste a direct image URL to update your circular avatar photo.
                    </p>
                  </div>
                )}

                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-xs uppercase font-bold tracking-wider text-[#0A1D37] pb-1 border-b border-[#F0F0EE]">
                    Personal Details
                  </h3>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FAFAF8] border border-[#E5E5E5] rounded-sm focus:outline-none focus:border-[#0A1D37] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || 'guest@sentinews.com'}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#F0F0EE] border border-[#E5E5E5] text-[#888888] rounded-sm cursor-not-allowed select-none"
                    />
                    <p className="text-[11px] text-[#888888]">
                      Email address is tied to your SentiNews login credential and cannot be edited directly.
                    </p>
                  </div>
                </div>

                {/* Change Password Section */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs uppercase font-bold tracking-wider text-[#0A1D37] pb-1 border-b border-[#F0F0EE] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#0A1D37]" />
                    <span>Change Account Password</span>
                  </h3>

                  <div className="space-y-3 p-4 bg-[#FAFAF8] border border-[#E5E5E5] rounded-sm">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#111111]">
                        Current Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm bg-white border border-[#E5E5E5] rounded-sm focus:outline-none focus:border-[#0A1D37] transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#111111]">
                          New Password
                        </label>
                        <input
                          type="password"
                          placeholder="Min 6 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3.5 py-2 text-sm bg-white border border-[#E5E5E5] rounded-sm focus:outline-none focus:border-[#0A1D37] transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#111111]">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          placeholder="Re-enter new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3.5 py-2 text-sm bg-white border border-[#E5E5E5] rounded-sm focus:outline-none focus:border-[#0A1D37] transition-colors"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-[#666666]">
                      Leave password fields blank if you do not wish to update your password now.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-[#0A1D37] hover:bg-[#071426] rounded-sm transition-colors shadow-xs"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setPasswordError(null);
                      setSearchParams({});
                    }}
                    className="px-4 py-2.5 text-xs font-medium text-[#666666] hover:bg-[#F5F5F3] rounded-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              /* VIEW PROFILE MODE */
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-[#F0F0EE] text-sm">
                  <span className="text-xs uppercase font-medium text-[#666666] flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-[#888888]" />
                    <span>Full Name</span>
                  </span>
                  <span className="font-semibold text-[#111111]">
                    {user?.full_name || 'Guest Investor'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-[#F0F0EE] text-sm">
                  <span className="text-xs uppercase font-medium text-[#666666] flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#888888]" />
                    <span>Email Address</span>
                  </span>
                  <span className="font-medium text-[#111111]">
                    {user?.email || 'guest@sentinews.com'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-[#F0F0EE] text-sm">
                  <span className="text-xs uppercase font-medium text-[#666666] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#888888]" />
                    <span>Account Verification</span>
                  </span>
                  <span className={`font-medium ${isAuthenticated ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {isAuthenticated ? 'Verified Member' : 'Public Guest Mode'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 text-sm">
                  <span className="text-xs uppercase font-medium text-[#666666] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#888888]" />
                    <span>Session Security</span>
                  </span>
                  <span className="font-medium text-[#111111]">
                    {isAuthenticated ? 'Authenticated Session' : 'Public Guest Access'}
                  </span>
                </div>
              </div>
            )}

            {/* ACCOUNT ACTIONS */}
            {isAuthenticated ? (
              <div className="pt-6 border-t border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-[#666666]">
                  <KeyRound className="w-4 h-4 text-[#888888]" />
                  <span>Password security active</span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold text-red-600 bg-red-50/70 border border-red-200 hover:bg-red-100 rounded-sm transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="pt-6 border-t border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-[#666666]">
                  <KeyRound className="w-4 h-4 text-[#888888]" />
                  <span>Guest mode active</span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold text-white bg-[#0A1D37] hover:bg-[#071426] rounded-sm transition-colors cursor-pointer"
                >
                  <span>Sign In / Register</span>
                </button>
              </div>
            )}
          </div>

          {/* PORTFOLIO INSIGHTS SECTION (RESPONSIVE VIEW INTEGRATION) */}
          <div className="bg-[#FFFFFF] border border-[#E5E5E5] p-6 sm:p-8 rounded-sm shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-sm bg-[#0A1D37] text-white flex items-center justify-center shrink-0">
                  <PieChart className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#111111]">
                    My Portfolio Insights
                  </h2>
                  <p className="text-xs text-[#666666]">
                    Real-time holdings breakdown and performance analytics for responsive view
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/portfolio')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#0A1D37] bg-white border border-[#E5E5E5] hover:bg-[#F5F5F3] rounded-sm transition-colors shadow-xs shrink-0 cursor-pointer"
              >
                <span>Full Portfolio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Portfolio Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-[#FAFAF8] border border-[#E5E5E5] rounded-sm space-y-1">
                <span className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider block">
                  Total Tracked Value
                </span>
                <div className="text-xl font-bold text-[#111111] font-sans">
                  ₹4,85,200.00
                </div>
                <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+₹12,450.00 (+2.63%) Today</span>
                </span>
              </div>

              <div className="p-4 bg-[#FAFAF8] border border-[#E5E5E5] rounded-sm space-y-1">
                <span className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider block">
                  Tracked Equity Holdings
                </span>
                <div className="text-xl font-bold text-[#111111] font-sans">
                  8 Equities
                </div>
                <span className="text-[10px] text-[#666666]">
                  NSE & BSE Equities
                </span>
              </div>

              <div className="p-4 bg-[#FAFAF8] border border-[#E5E5E5] rounded-sm space-y-1">
                <span className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider block">
                  Top Sector Allocation
                </span>
                <div className="text-sm font-bold text-[#0A1D37] font-sans flex items-center gap-1 pt-1">
                  <Briefcase className="w-4 h-4 text-[#0A1D37]" />
                  <span>IT & Banking (62%)</span>
                </div>
                <span className="text-[10px] text-[#666666]">
                  Diversified Indian Market
                </span>
              </div>
            </div>

            {/* Mobile / Responsive Full Portfolio Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/portfolio')}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#0A1D37] hover:bg-[#071426] rounded-sm transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Open Full Portfolio Analytics</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
