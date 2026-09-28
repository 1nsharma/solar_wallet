// src/components/AdminDashboard.tsx
import { useEffect, useState, useCallback } from 'react';
import {
  Sun, Zap, Users, DollarSign, Battery, Wifi, WifiOff,
  AlertTriangle, RefreshCw, Sliders,
  ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle, Radio,
  BarChart3, Cpu, Globe, Bell, FlameKindling, Leaf, Gauge, ChevronRight
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { type Language } from '../utils/i18n';
import type { User } from '../types/auth';

interface Tenant {
  id: string;
  name: string;
  flat: string;
  load: number;
  todayUnits: number;
  todayEarning: number;
  balance: number;
  relayOn: boolean;
  mqttPing: number;
  lastSeen: string;
}

interface GridAlarm {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  time: string;
}

interface Props {
  currentUser: User;
  onNavigate: (screen: string) => void;
  lang: Language;
  isDark: boolean;
}

const MOCK_TENANTS: Tenant[] = [
  { id: 'c1', name: 'Rahul Sharma', flat: 'Flat 101', load: 450, todayUnits: 6.8, todayEarning: 44.2, balance: 345.5, relayOn: true, mqttPing: 28, lastSeen: 'Now' },
  { id: 'c2', name: 'Priya Verma', flat: 'Flat 102', load: 320, todayUnits: 4.5, todayEarning: 29.25, balance: 180.0, relayOn: true, mqttPing: 41, lastSeen: '2m ago' },
  { id: 'c3', name: 'Amit Patel', flat: 'Flat 201', load: 0, todayUnits: 1.2, todayEarning: 7.8, balance: 42.0, relayOn: false, mqttPing: 0, lastSeen: '18m ago' },
  { id: 'c4', name: 'Sneha Joshi', flat: 'Flat 202', load: 680, todayUnits: 9.1, todayEarning: 59.15, balance: 820.75, relayOn: true, mqttPing: 19, lastSeen: 'Now' },
];

const WEEKLY_REVENUE = [
  { day: 'Mon', revenue: 812, units: 124 },
  { day: 'Tue', revenue: 940, units: 145 },
  { day: 'Wed', revenue: 765, units: 118 },
  { day: 'Thu', revenue: 1102, units: 170 },
  { day: 'Fri', revenue: 984, units: 152 },
  { day: 'Sat', revenue: 1240, units: 191 },
  { day: 'Sun', revenue: 1050, units: 162 },
];

const PIE_DATA = [
  { name: 'Flat 101', value: 28 },
  { name: 'Flat 102', value: 19 },
  { name: 'Flat 201', value: 5 },
  { name: 'Flat 202', value: 35 },
  { name: 'Internal', value: 13 },
];
const PIE_COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#64748b'];

const ALARMS: GridAlarm[] = [
  { id: 'a1', severity: 'warning', message: 'Flat 201 balance critically low (₹42)', time: '5m ago' },
  { id: 'a2', severity: 'info', message: 'Battery SOC > 95% — export mode activated', time: '12m ago' },
  { id: 'a3', severity: 'critical', message: 'MQTT timeout: Flat 201 ESP32_PZEM_FLAT201', time: '18m ago' },
];

const SOLAR_24H = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, '0')}:00`,
  kw: i >= 6 && i <= 18
    ? parseFloat((Math.sin(((i - 6) / 12) * Math.PI) * 4.8 + Math.random() * 0.3).toFixed(2))
    : 0,
}));

export default function AdminDashboard({ currentUser, onNavigate, lang, isDark }: Props) {
  const [price, setPrice] = useState(6.5);
  const [pendingPrice, setPendingPrice] = useState(6.5);
  const [tenants, setTenants] = useState<Tenant[]>(MOCK_TENANTS);
  const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'pricing' | 'grid'>('overview');
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [priceApplied, setPriceApplied] = useState(false);
  const [alarms] = useState<GridAlarm[]>(ALARMS);

  const fetchPrice = useCallback(async () => {
    setIsFetchingPrice(true);
    try {
      const res = await fetch('http://localhost:5000/price', { signal: AbortSignal.timeout(3000) });
      const data = await res.json();
      setPrice(data.price ?? 6.5);
      setPendingPrice(data.price ?? 6.5);
    } catch {
      // Backend offline — use mock value silently
    } finally {
      setIsFetchingPrice(false);
    }
  }, []);

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 10_000);
    return () => clearInterval(interval);
  }, [fetchPrice]);

  const handleApplyPrice = async () => {
    sounds.playRecharge();
    setPrice(pendingPrice);
    setPriceApplied(true);
    confetti({ particleCount: 100, spread: 90, origin: { y: 0.6 }, colors: ['#10b981', '#f59e0b', '#06b6d4'] });
    try {
      await fetch('http://localhost:5000/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: pendingPrice }),
        signal: AbortSignal.timeout(3000),
      });
    } catch { /* backend offline, UI still updates */ }
    setTimeout(() => setPriceApplied(false), 2500);
  };

  const toggleRelay = (id: string) => {
    sounds.playRelay(true);
    setTenants(prev => prev.map(t => t.id === id ? { ...t, relayOn: !t.relayOn, load: t.relayOn ? 0 : 350 } : t));
  };

  const totalLoad = tenants.reduce((s, t) => s + t.load, 0);
  const totalTodayRevenue = tenants.reduce((s, t) => s + t.todayEarning, 0);
  const totalTodayUnits = tenants.reduce((s, t) => s + t.todayUnits, 0);
  const activeTenants = tenants.filter(t => t.relayOn).length;
  const weeklyRevenue = WEEKLY_REVENUE.reduce((s, d) => s + d.revenue, 0);

  const kpis = [
    {
      label: lang === 'hi' ? 'आज की कमाई' : "Today's Revenue",
      value: `₹${totalTodayRevenue.toFixed(0)}`,
      sub: `₹${weeklyRevenue.toLocaleString()} this week`,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'from-emerald-600 to-teal-600',
      glow: 'shadow-emerald-900/40',
      trend: '+12%',
      up: true,
    },
    {
      label: lang === 'hi' ? 'सक्रिय किरायेदार' : 'Active Tenants',
      value: `${activeTenants} / ${tenants.length}`,
      sub: `${tenants.filter(t => !t.relayOn).length} relays offline`,
      icon: <Users className="w-5 h-5" />,
      color: 'from-cyan-600 to-blue-600',
      glow: 'shadow-cyan-900/40',
      trend: 'Stable',
      up: true,
    },
    {
      label: lang === 'hi' ? 'कुल यूनिट आज' : 'Units Delivered Today',
      value: `${totalTodayUnits.toFixed(1)} kWh`,
      sub: `${totalLoad} W active load`,
      icon: <Zap className="w-5 h-5" />,
      color: 'from-amber-600 to-orange-600',
      glow: 'shadow-amber-900/40',
      trend: '+8%',
      up: true,
    },
    {
      label: lang === 'hi' ? 'वर्तमान टैरिफ' : 'Active Tariff',
      value: `₹${price.toFixed(2)}/kWh`,
      sub: '36% below DISCOM grid rate',
      icon: <Sliders className="w-5 h-5" />,
      color: 'from-purple-600 to-violet-600',
      glow: 'shadow-purple-900/40',
      trend: 'Live',
      up: true,
    },
  ];

  const panel = isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200';
  const card = isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200';

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
              {lang === 'hi' ? 'लाइव ग्रिड — प्रशासक' : 'LIVE GRID — ADMIN CONSOLE'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {lang === 'hi' ? 'सोलर माइक्रोग्रिड कंट्रोल पैनल' : 'Solar Microgrid Command Centre'}
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {currentUser.name} · {currentUser.flatNumber} · {currentUser.deviceId}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
            <Bell className="w-3.5 h-3.5" />
            <span>{alarms.filter(a => a.severity === 'critical').length} Critical</span>
          </div>
          <button
            onClick={() => onNavigate('provider')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            {lang === 'hi' ? 'प्रदाता हब' : 'Provider Hub'}
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className={`relative overflow-hidden rounded-2xl p-5 border shadow-lg ${panel} ${kpi.glow}`}>
            <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${kpi.color} opacity-10 rounded-full blur-2xl pointer-events-none`} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center text-white shadow-md`}>
                  {kpi.icon}
                </div>
                <span className={`flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  kpi.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {kpi.up ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                  {kpi.trend}
                </span>
              </div>
              <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">{kpi.label}</p>
              <p className="text-xl sm:text-2xl font-black font-mono mt-0.5">{kpi.value}</p>
              <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Active Alarms */}
      {alarms.length > 0 && (
        <div className={`rounded-2xl border p-4 space-y-2 ${panel}`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold">{lang === 'hi' ? 'सक्रिय ग्रिड अलर्ट' : 'Active Grid Alerts'}</h3>
          </div>
          {alarms.map(alarm => (
            <div key={alarm.id} className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs border ${
              alarm.severity === 'critical' ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' :
              alarm.severity === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' :
              'bg-sky-500/10 border-sky-500/20 text-sky-300'
            }`}>
              <span className="flex items-center gap-2">
                {alarm.severity === 'critical' ? <XCircle className="w-3.5 h-3.5 shrink-0" /> :
                 alarm.severity === 'warning' ? <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> :
                 <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                {alarm.message}
              </span>
              <span className={`font-mono shrink-0 ml-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{alarm.time}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tab Bar */}
      <div className={`flex gap-1.5 p-1.5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
        {[
          { id: 'overview', icon: <BarChart3 className="w-3.5 h-3.5" />, label: lang === 'hi' ? 'अवलोकन' : 'Overview' },
          { id: 'tenants', icon: <Users className="w-3.5 h-3.5" />, label: lang === 'hi' ? 'किरायेदार' : 'Tenants' },
          { id: 'pricing', icon: <Sliders className="w-3.5 h-3.5" />, label: lang === 'hi' ? 'मूल्य निर्धारण' : 'Pricing' },
          { id: 'grid', icon: <Cpu className="w-3.5 h-3.5" />, label: lang === 'hi' ? 'ग्रिड / IoT' : 'Grid / IoT' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { sounds.playClick(); setActiveTab(tab.id as typeof activeTab); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className={`lg:col-span-3 rounded-2xl border p-5 ${panel}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold">{lang === 'hi' ? 'साप्ताहिक राजस्व (₹)' : 'Weekly Revenue (₹)'}</h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {lang === 'hi' ? 'प्रत्येक दिन की कमाई' : 'Daily earnings from solar deliveries'}
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                ₹{weeklyRevenue.toLocaleString()} / wk
              </span>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={WEEKLY_REVENUE} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} />
                  <XAxis dataKey="day" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} />
                  <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: '12px', fontSize: '12px' }}
                    formatter={(v: number) => [`₹${v}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="url(#revGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`lg:col-span-2 rounded-2xl border p-5 ${panel}`}>
            <h3 className="text-sm font-bold mb-1">{lang === 'hi' ? 'ऊर्जा वितरण' : 'Energy Distribution'}</h3>
            <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{lang === 'hi' ? 'आज के उत्पादन का प्रसार' : "Today's solar yield breakdown"}</p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {PIE_DATA.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', borderRadius: '10px', fontSize: '12px' }} formatter={(v: number) => [`${v}%`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {PIE_DATA.map((d, idx) => (
                <div key={d.name} className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx] }} />
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{d.name}</span>
                  <span className="font-mono font-bold ml-auto">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`lg:col-span-5 rounded-2xl border p-5 ${panel}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">{lang === 'hi' ? '24-घंटे सौर उत्पादन (kW)' : '24-Hour Solar Generation (kW)'}</h3>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <span className="text-amber-400">{lang === 'hi' ? 'सौर उत्पादन' : 'Solar Yield'}</span>
              </div>
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SOLAR_24H} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="solarFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} />
                  <XAxis dataKey="hour" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={10} interval={3} />
                  <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', borderRadius: '12px', fontSize: '12px' }} formatter={(v: number) => [`${v} kW`, 'Solar']} />
                  <Area type="monotone" dataKey="kw" stroke="#f59e0b" strokeWidth={2.5} fill="url(#solarFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── TENANTS ── */}
      {activeTab === 'tenants' && (
        <div className={`rounded-2xl border overflow-hidden ${panel}`}>
          <div className="p-5 border-b border-slate-800/60">
            <h3 className="text-sm font-bold">{lang === 'hi' ? 'किरायेदार प्रबंधन एवं रिले नियंत्रण' : 'Tenant Management & Relay Control'}</h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {lang === 'hi' ? 'प्रत्येक फ्लैट का लाइव डेटा, वॉलेट शेष और रिले स्विच' : 'Real-time per-flat load, wallet balance, and relay control'}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className={`border-b text-left font-bold uppercase tracking-wider text-[10px] ${isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                  {['Tenant / Flat', 'Load (W)', 'Today (kWh)', 'Today (₹)', 'Balance', 'MQTT', 'Last Seen', 'Relay'].map(h => (
                    <th key={h} className="px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {tenants.map(t => (
                  <tr key={t.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                    <td className="px-4 py-3.5">
                      <div className="font-bold">{t.name}</div>
                      <div className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.flat}</div>
                    </td>
                    <td className={`px-4 py-3.5 font-mono font-bold ${t.load > 0 ? 'text-cyan-400' : 'text-slate-500'}`}>{t.load}</td>
                    <td className="px-4 py-3.5 font-mono">{t.todayUnits.toFixed(1)}</td>
                    <td className="px-4 py-3.5 font-mono text-emerald-400 font-bold">₹{t.todayEarning.toFixed(2)}</td>
                    <td className={`px-4 py-3.5 font-mono font-bold ${t.balance < 50 ? 'text-rose-400' : t.balance < 150 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      ₹{t.balance.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5">
                      {t.mqttPing > 0 ? (
                        <span className="flex items-center gap-1 text-emerald-400"><Wifi className="w-3 h-3" />{t.mqttPing}ms</span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-500"><WifiOff className="w-3 h-3" />Offline</span>
                      )}
                    </td>
                    <td className={`px-4 py-3.5 font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.lastSeen}</td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => toggleRelay(t.id)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                          t.relayOn
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400'
                        }`}
                      >
                        {t.relayOn ? '⏸ Cut' : '▶ Restore'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className={`border-t font-bold ${isDark ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-700'}`}>
                  <td className="px-4 py-3">TOTAL</td>
                  <td className="px-4 py-3 font-mono text-cyan-400">{totalLoad}</td>
                  <td className="px-4 py-3 font-mono">{totalTodayUnits.toFixed(1)}</td>
                  <td className="px-4 py-3 font-mono text-emerald-400">₹{totalTodayRevenue.toFixed(2)}</td>
                  <td colSpan={4} />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ── PRICING ── */}
      {activeTab === 'pricing' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`rounded-2xl border p-6 ${panel}`}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center shadow-md">
                <Sliders className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold">{lang === 'hi' ? 'डायनामिक टैरिफ नियंत्रक' : 'Dynamic Tariff Controller'}</h3>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {lang === 'hi' ? 'MQTT + Pricing Agent के माध्यम से' : 'Via Pricing Agent (Flask) + MQTT broadcast'}
                </p>
              </div>
            </div>
            <div className={`flex items-center justify-between p-4 rounded-2xl mb-5 border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{lang === 'hi' ? 'लाइव टैरिफ' : 'Current Live Tariff'}</p>
                <p className="text-3xl font-black font-mono text-emerald-400 mt-0.5">₹{price.toFixed(2)}/kWh</p>
              </div>
              <button onClick={fetchPrice} className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                <RefreshCw className={`w-4 h-4 ${isFetchingPrice ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
              </button>
            </div>
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-400">{lang === 'hi' ? 'नई दर निर्धारित करें' : 'Set New Rate'}</label>
                <span className="text-base font-black font-mono text-purple-400">₹{pendingPrice.toFixed(2)}</span>
              </div>
              <input type="range" min={3} max={12} step={0.25} value={pendingPrice} onChange={e => setPendingPrice(parseFloat(e.target.value))} className="w-full accent-purple-500" />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>₹3.00 (Min)</span><span>₹12.00 (Max Grid)</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-5">
              {[5.0, 6.5, 7.5, 10.20].map(r => (
                <button key={r} onClick={() => { sounds.playClick(); setPendingPrice(r); }}
                  className={`py-2 rounded-xl text-xs font-bold font-mono border transition-all ${
                    pendingPrice === r ? 'bg-purple-600 text-white border-purple-500 shadow-md' : isDark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >₹{r.toFixed(2)}</button>
              ))}
            </div>
            <div className={`flex items-center gap-3 p-3 rounded-xl border mb-4 ${isDark ? 'bg-emerald-950/30 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'}`}>
              <Leaf className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-emerald-400">{Math.round(((10.20 - pendingPrice) / 10.20) * 100)}% savings</span>
                <span className={` ml-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>vs DISCOM ₹10.20/kWh grid tariff</span>
              </div>
            </div>
            <button onClick={handleApplyPrice} disabled={pendingPrice === price}
              className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                pendingPrice === price ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-violet-600 hover:brightness-110 text-white shadow-purple-900/30 active:scale-[0.98]'
              }`}
            >
              {priceApplied ? (
                <><CheckCircle2 className="w-4 h-4 text-emerald-400" />{lang === 'hi' ? 'लागू किया गया! MQTT ब्रॉडकास्ट' : 'Applied! MQTT Broadcast Sent'}</>
              ) : (
                <>{lang === 'hi' ? `₹${pendingPrice.toFixed(2)} टैरिफ लागू करें →` : `Apply ₹${pendingPrice.toFixed(2)} Tariff →`}</>
              )}
            </button>
          </div>

          <div className={`rounded-2xl border p-6 ${panel}`}>
            <h3 className="text-sm font-bold mb-4">{lang === 'hi' ? 'टैरिफ प्रभाव पूर्वावलोकन' : 'Tariff Impact Preview'}</h3>
            <div className="space-y-3">
              {tenants.map(t => {
                const hourly = (t.load / 1000) * pendingPrice;
                const daily = hourly * t.todayUnits;
                return (
                  <div key={t.id} className={`flex items-center justify-between p-3.5 rounded-xl border ${card}`}>
                    <div>
                      <p className="text-xs font-bold">{t.name}</p>
                      <p className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.flat} · {t.load} W</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black font-mono text-emerald-400">₹{hourly.toFixed(3)}/hr</p>
                      <p className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>~₹{daily.toFixed(2)}/day</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={`mt-4 p-4 rounded-xl border flex items-center gap-3 ${isDark ? 'bg-teal-950/30 border-teal-500/20' : 'bg-teal-50 border-teal-200'}`}>
              <FlameKindling className="w-5 h-5 text-teal-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-teal-400">{lang === 'hi' ? 'आज की CO₂ बचत' : "Today's CO₂ Avoided"}</p>
                <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                  {(totalTodayUnits * 0.82).toFixed(2)} kg CO₂ · {lang === 'hi' ? 'NABL प्रमाणित मीटर डेटा से' : 'Based on NABL certified meter readings'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── GRID / IoT ── */}
      {activeTab === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className={`rounded-2xl border p-5 ${panel}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
                <Sun className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold">Master Hub</p>
                <p className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ESP32_MASTER_HUB</p>
              </div>
              <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />ONLINE
              </span>
            </div>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Solar Array', value: '5 kW', color: 'text-amber-400' },
                { label: 'Battery SOC', value: '82%', color: 'text-teal-400' },
                { label: 'MQTT Broker', value: 'Connected', color: 'text-emerald-400' },
                { label: 'Firmware', value: 'v2.3.1', color: 'text-slate-400' },
                { label: 'Uptime', value: '7d 14h 22m', color: 'text-slate-400' },
              ].map(row => (
                <div key={row.label} className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{row.label}</span>
                  <span className={`font-mono font-bold ${row.color}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {tenants.map(t => (
            <div key={t.id} className={`rounded-2xl border p-5 ${panel}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-md ${t.relayOn ? 'bg-gradient-to-br from-teal-600 to-emerald-600' : 'bg-slate-700'}`}>
                  <Cpu className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold">{t.flat}</p>
                  <p className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ESP32_PZEM_{t.flat.replace(' ', '').toUpperCase()}</p>
                </div>
                <span className={`ml-auto flex items-center gap-1 text-[10px] font-mono font-bold ${t.mqttPing > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {t.mqttPing > 0 ? <><span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />LIVE</> : <><span className="w-2 h-2 rounded-full bg-rose-500" />TIMEOUT</>}
                </span>
              </div>
              <div className="space-y-2 text-xs">
                {[
                  { label: 'Load', value: `${t.load} W`, color: t.load > 0 ? 'text-cyan-400' : 'text-slate-500' },
                  { label: 'Relay', value: t.relayOn ? 'ON ✓' : 'OFF ✗', color: t.relayOn ? 'text-emerald-400' : 'text-rose-400' },
                  { label: 'MQTT Ping', value: t.mqttPing > 0 ? `${t.mqttPing} ms` : '—', color: 'text-slate-400' },
                  { label: 'Balance', value: `₹${t.balance.toFixed(2)}`, color: t.balance < 50 ? 'text-rose-400' : 'text-emerald-400' },
                  { label: 'Last Seen', value: t.lastSeen, color: 'text-slate-400' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{row.label}</span>
                    <span className={`font-mono font-bold ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => toggleRelay(t.id)}
                className={`mt-3 w-full py-2 rounded-xl text-[11px] font-bold border transition-all ${
                  t.relayOn ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                }`}
              >
                {t.relayOn ? '⏸ Cut Relay' : '▶ Restore Relay'}
              </button>
            </div>
          ))}

          <div className={`rounded-2xl border p-5 sm:col-span-2 lg:col-span-3 ${panel}`}>
            <h3 className="text-sm font-bold mb-3">{lang === 'hi' ? 'सिस्टम स्वास्थ्य संकेतक' : 'System Health Indicators'}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'MQTT Broker', icon: <Radio className="w-4 h-4" />, status: 'Healthy', ok: true },
                { label: 'Pricing Agent', icon: <Gauge className="w-4 h-4" />, status: 'Running', ok: true },
                { label: 'Notification Svc', icon: <Bell className="w-4 h-4" />, status: 'Running', ok: true },
                { label: 'Backend API', icon: <Globe className="w-4 h-4" />, status: 'Healthy', ok: true },
              ].map(s => (
                <div key={s.label} className={`p-3 rounded-xl border flex items-center gap-2 ${card}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.ok ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold">{s.label}</p>
                    <p className={`text-[10px] font-mono ${s.ok ? 'text-emerald-400' : 'text-rose-400'}`}>{s.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
