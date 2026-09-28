import {
  Sun, Zap, Shield, Wallet, Cpu, Sliders, Volume2, VolumeX, Moon,
  SunMedium, Globe, LogOut, FileText, CheckCircle2, User as UserIcon, Bell
} from 'lucide-react';
import type { Screen } from '../App';
import { sounds } from '../utils/audio';
import { translations, type Language } from '../utils/i18n';
import type { User } from '../types/auth';

interface Props {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  currentUser: User;
  onLogout: () => void;
  walletBalance: number;
  lang: Language;
  onToggleLang: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isSupplyActive: boolean;
  onOpenNotifications?: () => void;
}

export default function Navbar({
  currentScreen,
  onNavigate,
  currentUser,
  onLogout,
  walletBalance,
  lang,
  onToggleLang,
  isDark,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  isSupplyActive,
  onOpenNotifications,
}: Props) {
  const t = translations[lang];

  const handleNav = (screen: Screen) => {
    sounds.playClick();
    onNavigate(screen);
  };

  const handleLogoutClick = () => {
    sounds.playClick();
    onLogout();
  };

  // Strictly define available navigation items based on User Role (RBAC)
  const isConsumer = currentUser.role === 'consumer';
  const isAdmin = currentUser.role === 'admin';

  const consumerNavItems: { screen: Screen; label: string; icon: React.ReactNode }[] = [
    { screen: 'consumer', label: lang === 'hi' ? 'मेरा डैशबोर्ड' : 'My Dashboard', icon: <Zap className="w-4 h-4" /> },
    { screen: 'wallet', label: t.wallet, icon: <Wallet className="w-4 h-4" /> },
    { screen: 'telemetry', label: lang === 'hi' ? 'मेरा लाइव मीटर' : 'My Live Meter', icon: <Cpu className="w-4 h-4" /> },
    { screen: 'reports', label: lang === 'hi' ? 'ऑडिट स्टेटमेंट' : 'Audit Reports', icon: <FileText className="w-4 h-4" /> },
  ];

  const providerNavItems: { screen: Screen; label: string; icon: React.ReactNode }[] = [
    { screen: 'provider', label: lang === 'hi' ? 'सोलर हब (मालिक)' : 'Solar Hub', icon: <Sun className="w-4 h-4" /> },
    { screen: 'marketplace', label: lang === 'hi' ? 'टैरिफ व किरायेदार बाज़ार' : 'P2P Tariffs & Market', icon: <Sliders className="w-4 h-4" /> },
    { screen: 'admin', label: lang === 'hi' ? 'एडमिन कंसोल' : 'Admin Console', icon: <Shield className="w-4 h-4" /> },
    { screen: 'telemetry', label: lang === 'hi' ? 'मास्टर IoT कंसोल' : 'Master IoT Console', icon: <Cpu className="w-4 h-4" /> },
    { screen: 'reports', label: lang === 'hi' ? 'ऑडिट रिपोर्ट्स' : 'Audit Reports', icon: <FileText className="w-4 h-4" /> },
    { screen: 'setup', label: t.setup, icon: <FileText className="w-4 h-4" /> },
  ];

  const adminNavItems: { screen: Screen; label: string; icon: React.ReactNode }[] = [
    { screen: 'admin', label: lang === 'hi' ? 'एडमिन कंसोल' : 'Admin Console', icon: <Shield className="w-4 h-4" /> },
    { screen: 'provider', label: lang === 'hi' ? 'सोलर हब' : 'Solar Hub', icon: <Sun className="w-4 h-4" /> },
    { screen: 'marketplace', label: lang === 'hi' ? 'टैरिफ बाज़ार' : 'P2P Tariffs', icon: <Sliders className="w-4 h-4" /> },
    { screen: 'telemetry', label: lang === 'hi' ? 'मास्टर IoT' : 'Master IoT', icon: <Cpu className="w-4 h-4" /> },
    { screen: 'reports', label: lang === 'hi' ? 'ईएसजी व ऑडिट' : 'ESG & Audit', icon: <FileText className="w-4 h-4" /> },
    { screen: 'consumer', label: lang === 'hi' ? 'उपभोक्ता दृश्य' : 'Consumer View', icon: <Zap className="w-4 h-4" /> },
    { screen: 'setup', label: t.setup, icon: <FileText className="w-4 h-4" /> },
  ];

  const navItems = isConsumer ? consumerNavItems : isAdmin ? adminNavItems : providerNavItems;

  return (
    <header className={`sticky top-0 z-50 transition-colors duration-200 ${
      isDark ? 'bg-slate-900/90 border-b border-slate-800 text-white' : 'bg-white/90 border-b border-emerald-100 text-slate-800'
    } backdrop-blur-md shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Live IoT Pulse */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleNav(isConsumer ? 'consumer' : isAdmin ? 'admin' : 'provider')}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Sun className="w-6 h-6 text-white animate-spin" style={{ animationDuration: '24s' }} />
              </div>
              <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 ${
                isDark ? 'border-slate-900' : 'border-white'
              } ${isSupplyActive ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`} />
              <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 ${
                isDark ? 'border-slate-900' : 'border-white'
              } ${isSupplyActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  SolarSync
                </span>
                {/* Strict Role Pill */}
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                  currentUser.role === 'consumer'
                    ? 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                    : currentUser.role === 'admin'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {currentUser.role === 'consumer' ? 'TENANT (FLAT 101)' : currentUser.role === 'admin' ? 'SUPER ADMIN' : 'SOLAR PROVIDER'}
                </span>
              </div>
              <p className={`text-[11px] leading-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Navigation Items (Strictly RBAC filtered) */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
            {navItems.map((item) => {
              const active = currentScreen === item.screen;
              return (
                <button
                  key={item.screen}
                  onClick={() => handleNav(item.screen)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? isDark
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/30'
                        : 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                      : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-200/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Consumer Wallet Quick Pill */}
            {isConsumer && (
              <button
                onClick={() => handleNav('wallet')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                  isDark
                    ? 'bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/50 shadow-inner'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-500" />
                <span>₹{walletBalance.toFixed(2)}</span>
                <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full font-sans font-bold">
                  +
                </span>
              </button>
            )}

            {/* Notification Bell Button */}
            <button
              onClick={() => { sounds.playClick(); onOpenNotifications?.(); }}
              title="Notifications & Grid Alerts"
              className={`p-2 rounded-xl text-xs font-bold relative transition-all ${
                isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                2
              </span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => { sounds.playClick(); onToggleLang(); }}
              title="Toggle Language"
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline font-mono">{lang === 'hi' ? 'EN' : 'हिं'}</span>
            </button>

            {/* Sound FX Toggle */}
            <button
              onClick={() => { onToggleSound(); }}
              title={soundEnabled ? t.soundOn : t.soundOff}
              className={`p-2 rounded-xl text-xs transition-all ${
                isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-teal-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => { sounds.playClick(); onToggleTheme(); }}
              title={isDark ? t.themeLight : t.themeDark}
              className={`p-2 rounded-xl text-xs transition-all ${
                isDark
                  ? 'bg-slate-800 text-amber-400 hover:bg-slate-700 border border-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {isDark ? <SunMedium className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* User Profile Badge */}
            <div className={`hidden sm:flex items-center gap-2 pl-2 border-l ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm border border-slate-700">
                {currentUser.avatar}
              </div>
              <div className="text-left text-xs leading-tight">
                <p className="font-bold truncate max-w-[120px]">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 font-mono">{currentUser.flatNumber}</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogoutClick}
              title={lang === 'hi' ? 'लॉग आउट' : 'Sign Out'}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all active:scale-[0.98]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'hi' ? 'लॉग आउट' : 'Logout'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row (Filtered by Role) */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-200/50 dark:border-slate-800/80 overflow-x-auto gap-2 scrollbar-none">
          {navItems.map((item) => {
            const active = currentScreen === item.screen;
            return (
              <button
                key={item.screen}
                onClick={() => handleNav(item.screen)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  active
                    ? 'bg-emerald-600 text-white'
                    : isDark
                    ? 'text-slate-400 bg-slate-800/60'
                    : 'text-slate-600 bg-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
