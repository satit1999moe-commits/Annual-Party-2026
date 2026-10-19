import React, { useState, useRef, useEffect } from 'react';
import { Role, StaffUser } from '../types';
import { translations, Language } from '../i18n';
import {
  Globe,
  RefreshCw,
  FileSpreadsheet,
  LogIn,
  LogOut,
  MessageCircle,
  Phone,
  Menu,
  X,
  Users,
  LayoutGrid,
  Ticket,
  CreditCard,
  BarChart3,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Shield,
  UserCheck,
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentRole: Role;
  currentStaffUser: StaffUser | null;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  activeEventName: string;
  lang: Language;
  onToggleLang: () => void;
  onOpenSheetsSync: () => void;
  isSyncingSheets?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  currentRole,
  currentStaffUser,
  onOpenLoginModal,
  onLogout,
  activeEventName,
  lang,
  onToggleLang,
  onOpenSheetsSync,
  isSyncingSheets = false,
}) => {
  const t = translations[lang];
  const isParent = currentRole === 'Parent' || !currentStaffUser;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Filter allowed navigation items by role (Gate check-in menu completely removed)
  const getNavItems = () => {
    const items = [
      { id: 'map', label: t.navSeatingMap, icon: LayoutGrid },
    ];

    if (isParent) {
      return items;
    }

    if (currentRole === 'Super Admin' || currentRole === 'Event Admin') {
      items.push(
        { id: 'bookings', label: t.navBookings, icon: Ticket },
        { id: 'payments', label: t.navPayments, icon: CreditCard },
        { id: 'users', label: lang === 'th' ? 'ผู้ใช้งาน & แอดมิน' : 'Users & Admins', icon: Users },
        { id: 'dashboard', label: t.navDashboard, icon: BarChart3 }
      );
    } else if (currentRole === 'Ticket Staff') {
      items.push({ id: 'bookings', label: t.navBookings, icon: Ticket });
    } else if (currentRole === 'Finance') {
      items.push(
        { id: 'payments', label: t.navPayments, icon: CreditCard },
        { id: 'dashboard', label: t.navDashboard, icon: BarChart3 }
      );
    }

    return items;
  };

  const navItems = getNavItems();

  const handleSelectTabAndClose = (tabId: string) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0a192f] text-white border-b border-[#172b4d] shadow-md w-full transition-all">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 flex items-center justify-between gap-1.5 sm:gap-3 h-14 sm:h-16 w-full">
        {/* Brand Area: Responsive Wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleSelectTabAndClose('map')}
            className="flex items-center gap-2 sm:gap-2.5 text-left focus:outline-none cursor-pointer group"
            title={activeEventName}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white font-bold font-mono text-xs sm:text-sm shadow-xs shrink-0 group-hover:bg-white/20 transition-all">
              <span className="text-amber-400">S</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-xs sm:text-sm text-white tracking-tight truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none">
                {lang === 'th' ? 'ระบบจองโต๊ะและที่นั่ง' : 'Table Booking System'}
              </span>
              <span className="text-[9px] sm:text-[11px] text-slate-300 font-normal truncate max-w-[120px] xs:max-w-[170px] sm:max-w-none">
                {lang === 'th' ? 'สาธิตอุดมศึกษา' : 'Satit Udomseuksa'}
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links (>= 1024px) */}
        {!isParent ? (
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-xs font-semibold">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTabAndClose(item.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white/15 text-white font-bold border border-white/20 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        ) : (
          <div className="hidden xl:flex items-center text-xs text-slate-300 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 truncate max-w-sm">
            <span className="truncate">{t.parentGuestNotice}</span>
          </div>
        )}

        {/* Primary Utility Actions: Highly Adaptive on Resize */}
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
          {/* Direct LINE & Phone Booking (Only for Parents/Guests) */}
          {isParent && (
            <>
              <a
                href="https://lin.ee/qunLKq0"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold text-white bg-[#06C755] hover:bg-[#05b34c] rounded-xl transition-all whitespace-nowrap shadow-xs cursor-pointer active:scale-95"
                title={lang === 'th' ? 'จองโต๊ะและแนบสลิปผ่าน LINE: https://lin.ee/qunLKq0' : 'Book table & submit slip via LINE: https://lin.ee/qunLKq0'}
              >
                <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline">{lang === 'th' ? 'จองโต๊ะผ่าน LINE' : 'Book via LINE'}</span>
                <span className="md:hidden">LINE</span>
              </a>

              <a
                href="tel:0863167655"
                className="hidden sm:inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl transition-all whitespace-nowrap cursor-pointer active:scale-95"
                title={lang === 'th' ? 'โทรจองโต๊ะและที่นั่ง: 086-316-7655' : 'Call to book table: 086-316-7655'}
              >
                <Phone className="w-3.5 h-3.5 shrink-0 text-slate-300" />
                <span className="hidden xl:inline">086-316-7655</span>
                <span className="xl:hidden">{lang === 'th' ? 'โทร' : 'Call'}</span>
              </a>
            </>
          )}

          {/* Google Sheets Sync Button (Staff only, visible on lg screens) */}
          {!isParent && (currentRole === 'Super Admin' || currentRole === 'Event Admin' || currentRole === 'Finance') && (
            <button
              onClick={onOpenSheetsSync}
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 text-xs font-bold text-emerald-300 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl transition-all whitespace-nowrap cursor-pointer active:scale-95"
              title="Google Sheets Database Integration"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden xl:inline">Sheets</span>
              {isSyncingSheets && <RefreshCw className="w-3 h-3 animate-spin text-emerald-300" />}
            </button>
          )}

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-bold text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl transition-all whitespace-nowrap cursor-pointer active:scale-95"
            title="Switch Language (TH / EN)"
          >
            <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-slate-300" />
            <span className="font-mono uppercase text-[10px] sm:text-[11px]">{lang === 'th' ? 'TH' : 'EN'}</span>
          </button>

          {/* Auth State: Combined User Profile Dropdown (Logout is integrated inside user name) */}
          {!isParent && currentStaffUser ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 group focus:outline-none"
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
                title={lang === 'th' ? `คลิกที่ชื่อ ${currentStaffUser.display_name} เพื่อเปิดแถบเมนูและออกจากระบบ` : `Click ${currentStaffUser.display_name} to view menu and log out`}
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-xs shrink-0">
                  {currentStaffUser.display_name.charAt(0)}
                </div>
                <div className="text-left leading-none">
                  <div className="text-[10px] sm:text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate max-w-[70px] sm:max-w-[110px] md:max-w-[140px]">
                    {currentStaffUser.display_name}
                  </div>
                  <div className="text-[8px] sm:text-[9px] text-slate-300 font-semibold truncate max-w-[70px] sm:max-w-[100px] mt-0.5">
                    {currentStaffUser.role}
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-200 shrink-0 ${userDropdownOpen ? 'rotate-180 text-white' : ''}`} />
              </button>

              {/* User Dropdown Menu Popover */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#0a192f] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                        {currentStaffUser.display_name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {currentStaffUser.display_name}
                        </div>
                        <div className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 mt-0.5 truncate">
                          <Shield className="w-3 h-3 shrink-0" />
                          <span>{currentStaffUser.role}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                          {currentStaffUser.phone || currentStaffUser.username}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 text-[10px] bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg flex items-center justify-between border border-slate-100">
                      <span>{lang === 'th' ? 'สถานะเซสชัน' : 'Session Status'}</span>
                      <span className="font-semibold text-emerald-600 flex items-center gap-1">
                        <UserCheck className="w-3 h-3" />
                        {lang === 'th' ? 'กำลังเชื่อมต่อ' : 'Active'}
                      </span>
                    </div>
                  </div>

                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <LogOut className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
                        <span>{t.logout}</span>
                      </div>
                      <span className="text-[10px] text-rose-400 font-normal">
                        {lang === 'th' ? 'ออกจากระบบ' : 'Sign out'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all whitespace-nowrap shadow-sm cursor-pointer active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline">{t.staffLogin}</span>
              <span className="xs:hidden">{lang === 'th' ? 'แอดมิน' : 'Login'}</span>
            </button>
          )}

          {/* Unified Hamburger / Drawer Menu Button (Visible on screens < 1024px) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/15 transition-all cursor-pointer active:scale-95"
            aria-label="Toggle Navigation Menu"
            title={lang === 'th' ? 'เปิดเมนูการใช้งาน' : 'Toggle Navigation Menu'}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* iPad / Medium Screen Horizontal Scrollable Secondary Bar (768px - 1023px) */}
      {!isParent && (
        <div className="hidden md:flex lg:hidden border-t border-[#172b4d] bg-[#071324] px-3 py-1.5 w-full overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 text-xs w-full">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTabAndClose(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap text-xs ${
                    isActive
                      ? 'bg-white/20 text-white border border-white/25 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Responsive Drawer for Mobile / Small Screens (< 1024px when clicked) */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex flex-col justify-start overflow-y-auto lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="bg-[#0a192f] text-white border-b border-[#172b4d] shadow-2xl p-4 sm:p-5 w-full max-w-lg mx-auto rounded-b-3xl transition-transform animate-in slide-in-from-top-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center font-bold text-amber-400 text-sm">
                  S
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{activeEventName}</h3>
                  <p className="text-[10px] text-slate-300">
                    {currentStaffUser
                      ? `${currentStaffUser.display_name} (${currentStaffUser.role})`
                      : (lang === 'th' ? 'โหมดผู้ปกครอง / บุคคลทั่วไป' : 'Guest / Parent Mode')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/15 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Options for Staff */}
            {!isParent ? (
              <div className="py-3 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1 mb-1">
                  {lang === 'th' ? 'เมนูระบบงาน' : 'System Menus'}
                </span>
                {navItems.map((item) => {
                  const isActive = currentTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTabAndClose(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 opacity-80" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-3 px-1">
                <div className="bg-white/10 p-3 rounded-xl border border-white/10 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400 text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{lang === 'th' ? 'โหมดผู้ปกครอง' : 'Parent Mode'}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {t.parentGuestNotice}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Actions & Contact Links (Parents only) */}
            {isParent && (
              <div className="pt-3 border-t border-white/10 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                  {lang === 'th' ? 'ช่องทางติดต่อและจองโต๊ะ' : 'Contact & Bookings'}
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <a
                    href="https://lin.ee/qunLKq0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2 px-3 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold rounded-xl transition-all shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    <span>LINE Official</span>
                  </a>

                  <a
                    href="tel:0863167655"
                    className="flex items-center justify-center gap-2 py-2 px-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/15 transition-all"
                  >
                    <Phone className="w-4 h-4 shrink-0 text-slate-300" />
                    <span>086-316-7655</span>
                  </a>
                </div>
              </div>
            )}

              {/* Google Sheets for Staff */}
              {!isParent && (currentRole === 'Super Admin' || currentRole === 'Event Admin' || currentRole === 'Finance') && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenSheetsSync();
                  }}
                  className="w-full flex items-center justify-between py-2 px-3 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-200 font-bold rounded-xl text-xs transition-colors cursor-pointer mt-1"
                >
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Google Sheets Database Sync</span>
                  </div>
                  {isSyncingSheets && <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />}
                </button>
              )}

              {/* User Profile / Logout in Drawer */}
              <div className="pt-2">
                {!isParent && currentStaffUser ? (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-500 text-white font-bold flex items-center justify-center text-xs">
                          {currentStaffUser.display_name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">
                            {currentStaffUser.display_name}
                          </div>
                          <div className="text-[10px] text-slate-300">
                            {currentStaffUser.role}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-950/60 hover:bg-rose-900 text-rose-200 border border-rose-800/60 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenLoginModal();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{t.staffLogin}</span>
                  </button>
                )}
              </div>
          </div>
        </div>
      )}
    </header>
  );
};
