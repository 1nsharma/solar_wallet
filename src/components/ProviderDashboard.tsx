import { useState, useEffect } from 'react';
import {
  Sun, Zap, Battery, Sliders, TrendingUp, Users, ArrowRight,
  ShieldCheck, AlertCircle, RefreshCw, Radio, Check, Power,
  DollarSign, CheckCircle2, Award, Calendar, Download, Sparkles
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area
} from 'recharts';
import type { Screen } from '../App';
import { sounds } from '../utils/audio';
import { translations, type Language } from '../utils/i18n';
import confetti from 'canvas-confetti';

interface Props {
  onNavigate: (screen: Screen) => void;
  lang: Language;
  isDark: boolean;
  solarProduction: number;
  setSolarProduction: (w: number) => void;
  batterySOC: number;
  currentRate: number;
}

interface Tenant {
  id: string;
  name: string;
  flat: string;
  active: boolean;
  load: number;
  todayUnits: number;
  todayEarning: number;
  balance: number;
  priority: 'High' | 'Standard' | 'EV Flex';
}

export default function ProviderDashboard({
  onNavigate,
  lang,
  isDark,
  solarProduction,
  setSolarProduction,
  batterySOC,
  currentRate,
}: Props) {
  const t = translations[lang];
  const [homeUsage, setHomeUsage] = useState(380);
  const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'array' | 'settlement'>('overview');
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  const [tenants, setTenants] = useState<Tenant[]>([
    {
      id: '1',
      name: 'Rahul Sharma',
      flat: 'Flat 101',
      active: true,
      load: 450,
      todayUnits: 6.8,
      todayEarning: 44.20,
      balance: 345.50,
      priority: 'High',
    },
    {
      id: '2',
      name: 'Priya Verma',
      flat: 'Flat 102',
      active: true,
      load: 320,
      todayUnits: 4.5,
      todayEarning: 29.25,
      balance: 180.00,
      priority: 'Standard',
    },
    {
      id: '3',
      name: 'Amit Patel',
      flat: 'Flat 201',
      active: false,
      load: 0,
      todayUnits: 1.2,
      todayEarning: 7.80,
      balance: 42.00,
      priority: 'EV Flex',
    },
  ]);

  const totalTenantLoad = tenants.filter(t => t.active).reduce((sum, t) => sum + t.load, 0);
  const exportAvailable = Math.max(0, solarProduction - homeUsage);
  const netSurplusToGrid = Math.max(0, exportAvailable - totalTenantLoad);
  const totalTodayRevenue = tenants.reduce((sum, t) => sum + t.todayEarning, 0);

  // Weekly Revenue & Generation Data
  const weeklyData = [
    { day: 'Mon', solar: 18.2, shared: 12.4, earned: 80.60 },
    { day: 'Tue', solar: 21.0, shared: 15.1, earned: 98.15 },
    { day: 'Wed', solar: 16.5, shared: 11.8, earned: 76.70 },
    { day: 'Thu', solar: 22.4, shared: 16.2, earned: 105.30 },
    { day: 'Fri', solar: 24.1, shared: 18.0, earned: 117.00 },
    { day: 'Sat', solar: 20.8, shared: 14.5, earned: 94.25 },
    { day: 'Sun', solar: 23.5, shared: 17.2, earned: 111.80 },
  ];

  const toggleTenantRelay = (id: string) => {
    setTenants(prev => prev.map(item => {
      if (item.id === id) {
        sounds.playRelay(!item.active);
        return {
          ...item,
          active: !item.active,
          load: item.active ? 0 : 380,
        };
      }
      return item;
    }));
  };

  const handleInstantPayout = () => {
    sounds.playRecharge();
    try {
      confetti({
        particleCount: 140,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#6366f1'],
      });
    } catch {}

    setPayoutSuccess(true);
    setTimeout(() => setPayoutSuccess(false), 3500);
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Hero Solar Microgrid Provider Status Card */}
      <div className={`rounded-3xl p-6 sm:p-8 transition-all relative overflow-hidden ${
        isDark
          ? 'bg-slate-900/80 border border-slate-800 shadow-2xl'
          : 'bg-white border border-emerald-100 shadow-xl'
      }`}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-md bg-amber-500/20 text-amber-400">
                <Sun className="w-4 h-4 animate-spin" style={{ animationDuration: '30s' }} />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                {lang === 'hi' ? 'प्रदाता रूफटॉप सोलर हब' : 'Provider Solar Microgrid Hub'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {lang === 'hi' ? 'सूरज गुप्ता • 5kW रूफटॉप सिस्टम' : 'Suraj Gupta • 5kW Solar Array'}
            </h2>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Inverter Model: Growatt SPF 5000ES • NABL Class 1.0 IoT Bi-directional Meter
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('marketplace')}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-950/30 transition-all active:scale-[0.98]"
            >
              <Sliders className="w-4 h-4" />
              <span>{lang === 'hi' ? 'टैरिफ समायोजित करें' : 'P2P Tariff Rates'}</span>
            </button>

            <button
              onClick={() => onNavigate('telemetry')}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-bold transition-all ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>{lang === 'hi' ? 'IoT टेलीमेट्री' : 'Live IoT Stream'}</span>
            </button>

            <button
              onClick={() => onNavigate('reports')}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-bold transition-all ${
                isDark
                  ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/50'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>{lang === 'hi' ? 'ऑडिट रिपोर्ट्स' : 'Audit Reports'}</span>
            </button>
          </div>
        </div>

        {/* 4 Generation Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className={`p-4 rounded-2xl border transition-all card-hover ${
            isDark ? 'bg-amber-950/30 border-amber-500/30' : 'bg-amber-50 border-amber-200'
          }`}>
            <span className="text-[10px] uppercase font-semibold text-amber-500 tracking-wider">
              {t.generation}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-extrabold font-mono text-amber-400">
                {solarProduction}
              </span>
              <span className="text-xs font-bold text-amber-500/80">W</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">3.2 kWp Monocrystalline</p>
          </div>

          <div className={`p-4 rounded-2xl border transition-all card-hover ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              {t.homeUsage}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-extrabold font-mono text-cyan-400">
                {homeUsage}
              </span>
              <span className="text-xs font-bold text-cyan-500/80">W</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Owner self-consumption</p>
          </div>

          <div className={`p-4 rounded-2xl border transition-all card-hover ${
            isDark ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
          }`}>
            <span className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">
              {t.exportAvailable}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-extrabold font-mono text-emerald-400">
                {exportAvailable}
              </span>
              <span className="text-xs font-bold text-emerald-500/80">W</span>
            </div>
            <p className="text-[11px] text-emerald-400 font-semibold mt-1">
              {totalTenantLoad}W {lang === 'hi' ? 'किरायेदारों द्वारा प्रयुक्त' : 'consumed by tenants'}
            </p>
          </div>

          <div className={`p-4 rounded-2xl border transition-all card-hover ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              {t.thisMonthEarned}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-extrabold font-mono text-amber-400">
                ₹3,840
              </span>
            </div>
            <p className="text-[11px] text-emerald-400 font-semibold mt-1">
              +₹{totalTodayRevenue.toFixed(2)} {lang === 'hi' ? 'आज अर्जित' : 'today'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: 'overview', label: lang === 'hi' ? 'संबद्ध किरायेदार व रिले' : 'Connected Tenants & Relays' },
          { id: 'settlement', label: lang === 'hi' ? 'राजस्व एवं तत्काल निपटान' : 'Settlement & Bank Payouts' },
          { id: 'array', label: lang === 'hi' ? 'सोलर इन्वर्टर स्वास्थ्य' : 'Inverter & Battery Diagnostics' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { sounds.playClick(); setActiveTab(tab.id as any); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-amber-600 text-white shadow-md'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Connected Tenants Multi-Channel Relay Matrix */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className={`rounded-3xl p-6 sm:p-8 transition-all ${
            isDark ? 'bg-slate-900/80 border border-slate-800' : 'bg-white border border-emerald-100 shadow-lg'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span>{lang === 'hi' ? 'संबद्ध किरायेदार मीटर एवं रिमोट रिले स्विच' : 'Connected Tenant Meters & Remote Relay Cutoffs'}</span>
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {lang === 'hi'
                    ? 'प्रत्येक किरायेदार के पास समर्पित PZEM-004T स्मार्ट मीटर और स्वतंत्र रिले नियंत्रण है'
                    : 'Each flat has an isolated calibrated PZEM-004T meter with real-time remote cutoff capabilities'}
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                {tenants.filter(t => t.active).length} / {tenants.length} Active Loads
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tenants.map(tenant => (
                <div
                  key={tenant.id}
                  className={`p-5 rounded-2xl border transition-all card-hover ${
                    tenant.active
                      ? isDark
                        ? 'bg-slate-950/70 border-emerald-500/30'
                        : 'bg-emerald-50/50 border-emerald-200'
                      : isDark
                      ? 'bg-slate-950/40 border-slate-800 opacity-70'
                      : 'bg-slate-50 border-slate-200 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm">{tenant.name}</h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {tenant.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">{tenant.flat}</p>
                    </div>
                    <button
                      onClick={() => toggleTenantRelay(tenant.id)}
                      title={tenant.active ? 'Cutoff Tenant Relay' : 'Restore Tenant Relay'}
                      className={`p-2.5 rounded-xl transition-all shadow-md active:scale-95 ${
                        tenant.active
                          ? 'bg-emerald-500/20 text-emerald-400 hover:bg-rose-500/20 hover:text-rose-400'
                          : 'bg-slate-800 text-slate-500 hover:bg-emerald-500/20 hover:text-emerald-400'
                      }`}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Load:</span>
                      <span className="font-mono font-bold text-cyan-400">{tenant.active ? `${tenant.load} W` : '0 W'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Today's Units:</span>
                      <span className="font-mono font-bold text-emerald-400">{tenant.todayUnits} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Earned Today:</span>
                      <span className="font-mono font-bold text-amber-400">₹{tenant.todayEarning.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-800/40">
                      <span className="text-slate-400">Prepaid Balance:</span>
                      <span className="font-mono font-bold text-white">₹{tenant.balance.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Revenue & Yield Recharts Chart */}
          <div className={`rounded-3xl p-6 sm:p-8 transition-all ${
            isDark ? 'bg-slate-900/80 border border-slate-800' : 'bg-white border border-emerald-100 shadow-lg'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold">
                  {lang === 'hi' ? 'साप्ताहिक सौर उत्पादन बनाम दैनिक राजस्व (₹)' : 'Weekly Solar Generation vs Daily Revenue (₹)'}
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {lang === 'hi' ? 'पिछले 7 दिनों में सौर उत्पादन (kWh) और किरायेदार राजस्व (₹)' : 'Past 7 days energy production (kWh) and daily rental yields (₹)'}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                  {lang === 'hi' ? 'सोलर kWh' : 'Solar Yield (kWh)'}
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                  {lang === 'hi' ? 'कमाई (₹)' : 'Revenue (₹)'}
                </span>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} opacity={0.5} />
                  <XAxis dataKey="day" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
                  <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="solar" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Solar (kWh)" />
                  <Bar dataKey="earned" fill="#10b981" radius={[6, 6, 0, 0]} name="Revenue (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Settlement & Payouts */}
      {activeTab === 'settlement' && (
        <div className="space-y-6">
          <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-lg'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs uppercase font-mono font-bold text-amber-400 tracking-wider">
                  INSTANT SETTLEMENT
                </span>
                <h3 className="text-2xl font-black mt-1">
                  {lang === 'hi' ? 'कुल अर्जित शेष राशि' : 'Available Settlement Balance'}
                </h3>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-extrabold font-mono text-emerald-400">
                    ₹3,840.00
                  </span>
                  <span className="text-xs text-slate-400 font-mono">INR Ready for Transfer</span>
                </div>
              </div>

              <button
                onClick={handleInstantPayout}
                className="px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/40 flex items-center gap-2 transition-all active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{lang === 'hi' ? 'बैंक खाते में ट्रांसफर करें' : 'Instant UPI Bank Transfer'}</span>
              </button>
            </div>

            {payoutSuccess && (
              <div className="mt-4 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>
                  {lang === 'hi'
                    ? '₹3,840.00 का भुगतान HDFC बैंक खाता ****9012 में सफलतापूर्वक जमा किया गया!'
                    : 'Payout of ₹3,840.00 credited to verified HDFC Bank Account ****9012 successfully!'}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Linked UPI ID</span>
                <p className="font-mono font-bold text-sm text-white mt-1">suraj.gupta@okhdfcbank</p>
                <p className="text-[11px] text-emerald-400 mt-1">Primary Auto-Settle</p>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">TDS & Platform Fee</span>
                <p className="font-mono font-bold text-sm text-white mt-1">0.0% (Zero Fee)</p>
                <p className="text-[11px] text-slate-400 mt-1">Peer-to-Peer Non-Commercial</p>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Next Auto-Payout</span>
                <p className="font-mono font-bold text-sm text-white mt-1">Every Sunday 23:59</p>
                <p className="text-[11px] text-cyan-400 mt-1">Auto-Settled via IMPS</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Solar Array & Battery Diagnostics */}
      {activeTab === 'array' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-5 rounded-3xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] uppercase font-mono font-bold text-amber-400">INVERTER EFFICIENCY</span>
              <p className="text-3xl font-black font-mono mt-1 text-white">97.8%</p>
              <p className="text-xs text-slate-400 mt-1">Growatt SPF 5000ES MPPT</p>
            </div>

            <div className={`p-5 rounded-3xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] uppercase font-mono font-bold text-emerald-400">BATTERY HEALTH</span>
              <p className="text-3xl font-black font-mono mt-1 text-emerald-400">{batterySOC}% SOC</p>
              <p className="text-xs text-slate-400 mt-1">LiFePO4 48V 100Ah (5.1kWh)</p>
            </div>

            <div className={`p-5 rounded-3xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] uppercase font-mono font-bold text-cyan-400">ROOFTOP TEMPERATURE</span>
              <p className="text-3xl font-black font-mono mt-1 text-cyan-400">38.4°C</p>
              <p className="text-xs text-slate-400 mt-1">Irradiance: 840 W/m² (Peak Noon)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
