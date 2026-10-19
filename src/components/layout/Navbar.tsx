import React, { useState, useRef, useEffect } from 'react';
import {
  Gem,
  Search,
  Maximize2,
  Minimize2,
  FolderTree,
  ChevronDown,
  LogOut,
  UserCheck,
  Plus,
  PanelLeft,
  ChevronLeft,
  ChevronRight,
  Smartphone,
} from 'lucide-react';
import { User, AppSettings } from '../../types';

interface NavbarProps {
  currentUser: User;
  settings: AppSettings;
  activePage?: string;
  onNavigate?: (page: string) => void;
  onLogout: () => void;
  onOpenBarcodeScanner?: () => void;
  onNavigateToInvoice?: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onOpenSwitchUserModal?: () => void;
  onOpenCategoriesModal?: () => void;
  onOpenMultiDevice?: () => void;
  lowStockCount?: number;
  pendingWorkshopCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  settings,
  activePage = 'dashboard',
  onNavigate,
  onLogout,
  onOpenBarcodeScanner,
  onNavigateToInvoice,
  onToggleSidebar,
  isSidebarOpen = false,
  onOpenSwitchUserModal,
  onOpenCategoriesModal,
  onOpenMultiDevice,
  lowStockCount = 0,
  pendingWorkshopCount = 0,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  const handleNav = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    } else if (page === 'invoice' && onNavigateToInvoice) {
      onNavigateToInvoice();
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full max-w-full bg-[#0d111a] border-b border-[#1f2635] shadow-lg">
      {/* Primary Top Bar (Single streamlined line - all tools and navigation unified) */}
      <div className="w-full px-3 sm:px-5 lg:px-6 h-15 flex items-center justify-between gap-3">
        {/* Left: System Overview Button & Brand Identity */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
          {/* System Overview Button */}
          <button
            onClick={onToggleSidebar}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shrink-0 cursor-pointer ${
              isSidebarOpen
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-800 hover:border-slate-700'
            }`}
            title={isSidebarOpen ? 'Close System Overview' : 'Open System Overview'}
            aria-label="System Overview"
          >
            <PanelLeft className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold whitespace-nowrap">System Overview</span>
            {pendingWorkshopCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 font-mono">
                {pendingWorkshopCount}
              </span>
            )}
            {isSidebarOpen ? (
              <ChevronLeft className="hidden sm:inline w-3 h-3 text-amber-400/80" />
            ) : (
              <ChevronRight className="hidden sm:inline w-3 h-3 text-slate-400" />
            )}
          </button>

          {/* Diamond Logo Icon or Custom Company Logo */}
          <div
            onClick={() => handleNav('dashboard')}
            className="cursor-pointer w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#1c1810] to-[#121620] border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-md shadow-amber-950/40 hover:border-amber-400 transition-colors overflow-hidden shrink-0"
          >
            {settings.logoJpgUrl ? (
              <img
                src={settings.logoJpgUrl}
                alt="Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain p-1 bg-white/10"
              />
            ) : (
              <Gem className="w-5 h-5 text-amber-400 fill-amber-400/20" />
            )}
          </div>

          {/* Company Name & Version */}
          <div className="cursor-pointer min-w-0" onClick={() => handleNav('dashboard')}>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm md:text-[15px] font-extrabold text-amber-300 tracking-wide font-serif uppercase truncate">
                {settings.companyName || 'Jewelry & Gemstone Stock Inventory'}
              </h1>
              <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono tracking-wider">
                POS v4.2
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-400 font-normal truncate max-w-xs md:max-w-md">
              {settings.companyTagline || 'Authentic Ceylon Gemstones & Masterpiece Fine Jewelry Trading System'}
            </p>
          </div>
        </div>

        {/* Right Actions: POS Invoice, Multi-Device, Categories, Search, Fullscreen, User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* + POS Invoice Button (Vibrant & Always Visible) */}
          <button
            onClick={() => handleNav('invoice')}
            className="px-3 py-1.5 rounded-lg bg-[#e5a828] hover:bg-[#f5b338] text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/30 transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="font-bold whitespace-nowrap">POS Invoice</span>
          </button>

          {/* Gems Panel Button */}
          <button
            onClick={() => handleNav('gems_panel')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              activePage === 'gems_panel'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                : 'bg-[#141824] hover:bg-slate-800 text-amber-300 border-[#232a3b] hover:border-amber-500/40'
            }`}
            title="Open Gems Panel - Add and manage Ceylon gemstones with photos"
          >
            <Gem className="w-3.5 h-3.5 text-amber-400" />
            <span className="whitespace-nowrap">Gems Panel</span>
          </button>

          {/* Multi-Device Button */}
          {onOpenMultiDevice && (
            <button
              onClick={onOpenMultiDevice}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#141824] hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-colors shrink-0 cursor-pointer"
              title="Operate on multiple devices (Mobile, Tablet, Counter PC) with real-time sync"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-200 font-semibold text-[11px] whitespace-nowrap">Multi-Device</span>
            </button>
          )}

          {/* Categories Button */}
          <button
            onClick={() => {
              if (onOpenCategoriesModal) onOpenCategoriesModal();
              else handleNav('inventory');
            }}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#141824] hover:bg-slate-800 text-slate-200 border border-[#232a3b] text-xs font-medium transition-colors shrink-0 cursor-pointer"
            title="Filter and browse categories"
          >
            <FolderTree className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] whitespace-nowrap">Categories</span>
          </button>

          {/* Search / Scan Icon */}
          <button
            onClick={onOpenBarcodeScanner}
            className="p-2 rounded-lg bg-[#141824] hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-[#232a3b] transition-colors shrink-0 cursor-pointer"
            title="Search Products or Scan Barcode"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Fullscreen Icon */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-[#141824] hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-[#232a3b] transition-colors shrink-0 cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* User Profile Pill & Dropdown */}
          <div className="relative shrink-0" ref={userRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-[#141824] border border-[#232a3b] hover:border-amber-500/40 transition-colors cursor-pointer"
            >
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border border-amber-500/50"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-100 leading-tight">
                  {currentUser.name.split(' ')[0]}
                </div>
                <div className="text-[10px] font-mono font-bold text-amber-400/90 uppercase leading-none">
                  {currentUser.role}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-[#121622] border border-[#232a3b] rounded-xl shadow-2xl p-2 space-y-1 z-50">
                <div className="px-2.5 py-1.5 border-b border-slate-800">
                  <div className="text-xs font-bold text-slate-200">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-400 capitalize">{currentUser.role} Role</div>
                </div>
                {onOpenSwitchUserModal && (
                  <button
                    onClick={() => {
                      onOpenSwitchUserModal();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Switch Operator</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onLogout();
                    setUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
