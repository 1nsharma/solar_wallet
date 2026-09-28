import { useState } from 'react';
import {
  Sun, Zap, Lock, Mail, Phone, ArrowRight, ShieldCheck,
  CheckCircle2, Key, Globe, Eye, EyeOff, Sparkles, UserCheck
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { translations, type Language } from '../utils/i18n';
import { DEMO_CONSUMER, DEMO_PROVIDER, DEMO_ADMIN, type User } from '../types/auth';

interface Props {
  onLogin: (user: User) => void;
  lang: Language;
  onToggleLang: () => void;
  isDark: boolean;
}

export default function LoginScreen({ onLogin, lang, onToggleLang, isDark }: Props) {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'consumer' | 'provider' | 'admin'>('consumer');
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [identifier, setIdentifier] = useState('rahul.tenant@solarsync.in');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTabSwitch = (tab: 'consumer' | 'provider' | 'admin') => {
    sounds.playClick();
    setActiveTab(tab);
    setErrorMsg(null);
    if (tab === 'consumer') {
      setIdentifier(DEMO_CONSUMER.email);
    } else if (tab === 'provider') {
      setIdentifier(DEMO_PROVIDER.email);
    } else {
      setIdentifier(DEMO_ADMIN.email);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    setLoading(true);
    setErrorMsg(null);

    setTimeout(() => {
      setLoading(false);
      sounds.playRecharge();
      if (activeTab === 'consumer') {
        onLogin(DEMO_CONSUMER);
      } else if (activeTab === 'provider') {
        onLogin(DEMO_PROVIDER);
      } else {
        onLogin(DEMO_ADMIN);
      }
    }, 800);
  };

  const handleQuickDemoLogin = (user: User) => {
    sounds.playRecharge();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin(user);
    }, 400);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between p-4 sm:p-8 transition-colors ${
      isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Sun className="w-6 h-6 text-white animate-spin" style={{ animationDuration: '24s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                SolarSync
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                SECURE AUTH
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              ROLE-BASED ACCESS CONTROL (RBAC) v2.4
            </p>
          </div>
        </div>

        <button
          onClick={() => { sounds.playClick(); onToggleLang(); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-amber-500" />
          <span>{lang === 'hi' ? 'English' : 'हिंदी'}</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-xl mx-auto w-full my-auto py-6 space-y-5">
        {/* Role Badge and Welcome */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'प्रमाणीकरण एवं भूमिका सत्यापन' : 'Role-Based Authentication'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {lang === 'hi' ? 'सोलर-सिंक में साइन इन करें' : 'Sign in to SolarSync'}
          </h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {lang === 'hi'
              ? 'उपभोक्ता अपने फ्लैट का डेटा देखते हैं, प्रदाता सोलर ग्रिड और एडमिन सम्पूर्ण संचालन संभालते हैं।'
              : 'Strict RBAC: Consumers access tenant meters; Providers share solar; Admins oversee the grid.'}
          </p>
        </div>

        {/* 1-Click Instant Demo Profiles */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            ⚡ {lang === 'hi' ? '1-क्लिक त्वरित डेमो लॉगिन (भूमिका परीक्षण):' : 'Instant 1-Click Demo Logins:'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin(DEMO_CONSUMER)}
              className={`p-3 rounded-2xl border-2 text-left transition-all group card-hover ${
                isDark
                  ? 'bg-slate-900 border-teal-500/40 hover:border-teal-400 hover:bg-teal-950/30'
                  : 'bg-white border-teal-300 hover:border-teal-500 hover:bg-teal-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-xs text-teal-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  {lang === 'hi' ? 'उपभोक्ता' : 'Consumer'}
                </span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono font-bold">
                  Flat 101
                </span>
              </div>
              <p className="text-xs font-bold truncate">राहुल शर्मा (Rahul)</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {lang === 'hi' ? 'फ्लैट 101 मीटर व वॉलेट' : 'Tenant Prepaid Meter'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin(DEMO_PROVIDER)}
              className={`p-3 rounded-2xl border-2 text-left transition-all group card-hover ${
                isDark
                  ? 'bg-slate-900 border-amber-500/40 hover:border-amber-400 hover:bg-amber-950/30'
                  : 'bg-white border-amber-300 hover:border-amber-500 hover:bg-amber-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-xs text-amber-400 flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5" />
                  {lang === 'hi' ? 'प्रदाता' : 'Provider'}
                </span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                  5kW Array
                </span>
              </div>
              <p className="text-xs font-bold truncate">सूरज गुप्ता (Suraj)</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {lang === 'hi' ? 'सोलर हब व किरायेदार फ्लीट' : 'Solar Hub & Multi-Tenant'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin(DEMO_ADMIN)}
              className={`p-3 rounded-2xl border-2 text-left transition-all group card-hover ${
                isDark
                  ? 'bg-slate-900 border-indigo-500/40 hover:border-indigo-400 hover:bg-indigo-950/30'
                  : 'bg-white border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-xs text-indigo-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {lang === 'hi' ? 'ग्रिड एडमिन' : 'Admin'}
                </span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                  Control Rm
                </span>
              </div>
              <p className="text-xs font-bold truncate">कंट्रोल रूम (Ops)</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {lang === 'hi' ? 'ग्रिड टेलीमेट्री, टैरिफ व रिले' : 'Full Grid Operations'}
              </p>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-slate-700/60 w-full" />
          <span className={`px-3 text-[11px] font-mono uppercase font-bold shrink-0 ${isDark ? 'bg-slate-950 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
            {lang === 'hi' ? 'या क्रेडेंशियल्स दर्ज करें' : 'Or Enter Credentials'}
          </span>
          <div className="border-t border-slate-700/60 w-full" />
        </div>

        {/* Role Toggle Tabs */}
        <div className={`p-1 rounded-2xl flex border gap-1 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-200 border-slate-300'
        }`}>
          <button
            type="button"
            onClick={() => handleTabSwitch('consumer')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'consumer'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'उपभोक्ता' : 'Consumer'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('provider')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'provider'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'प्रदाता' : 'Provider'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('admin')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'admin'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'एडमिन' : 'Admin'}</span>
          </button>
        </div>

        {/* Form Card */}
        <form onSubmit={handleLoginSubmit} className={`p-6 rounded-3xl border shadow-xl space-y-4 ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {/* Active Role Explainer Banner */}
          <div className={`p-3 rounded-xl text-[11px] flex items-center gap-2 ${
            activeTab === 'consumer'
              ? 'bg-teal-500/10 border border-teal-500/30 text-teal-300'
              : 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
          }`}>
            <UserCheck className="w-4 h-4 shrink-0" />
            <span>
              {activeTab === 'consumer'
                ? (lang === 'hi' ? 'आप फ्लैट 101 के किरायेदार खाते में लॉगिन कर रहे हैं।' : 'Logging into Tenant Flat 101 isolated prepaid account.')
                : (lang === 'hi' ? 'आप रूफटॉप सोलर प्रदाता प्रशासनिक खाते में लॉगिन कर रहे हैं।' : 'Logging into Rooftop Solar Provider master admin account.')
              }
            </span>
          </div>

          {/* Identifier Input */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              {lang === 'hi' ? 'ईमेल या रजिस्टर्ड मोबाइल नंबर:' : 'Email or Registered Mobile:'}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-mono border focus:outline-none transition-all ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-600'
                }`}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-slate-400">
                {lang === 'hi' ? 'पासवर्ड / सुरक्षा पिन:' : 'Password / Security PIN:'}
              </label>
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'password' ? 'otp' : 'password')}
                className="text-[10px] text-emerald-400 hover:underline"
              >
                {authMode === 'password' ? 'OTP से लॉगिन करें' : 'पासवर्ड से लॉगिन करें'}
              </button>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-mono border focus:outline-none transition-all ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me and Forgot */}
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-700 text-emerald-600 bg-slate-800"
              />
              <span className="text-slate-400 text-[11px]">
                {lang === 'hi' ? 'मुझे याद रखें' : 'Remember Session'}
              </span>
            </label>
            <button
              type="button"
              onClick={() => alert('Demo Reset: Password is pre-filled. Click Login.')}
              className="text-[11px] text-slate-400 hover:text-emerald-400"
            >
              {lang === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot PIN?'}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 text-white shadow-lg transition-all active:scale-[0.98] ${
              activeTab === 'consumer'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-teal-950/40'
                : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-950/40'
            }`}
          >
            {loading ? (
              <span>{lang === 'hi' ? 'सत्यापित हो रहा है...' : 'Authenticating...'}</span>
            ) : (
              <>
                <span>
                  {activeTab === 'consumer'
                    ? (lang === 'hi' ? 'उपभोक्ता के रूप में साइन इन करें →' : 'Sign In as Consumer →')
                    : (lang === 'hi' ? 'प्रदाता के रूप में साइन इन करें →' : 'Sign In as Provider →')
                  }
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Disclaimers */}
        <div className="text-center text-[10px] text-slate-500 space-y-1">
          <p>🔒 256-bit TLS Encrypted • SHA-256 Dispute-Proof Logs</p>
          <p>Compliant with Indian Electricity Act 2003 (Section 43A)</p>
        </div>
      </div>
    </div>
  );
}
