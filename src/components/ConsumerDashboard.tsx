import { useState, useEffect } from 'react';
import {
  Zap, Sun, Shield, Wallet, ArrowRight, AlertTriangle, Play, Pause,
  TrendingDown, TrendingUp, Sparkles, Sliders, Clock, Activity, ShieldCheck,
  CheckCircle2, Plus, QrCode, CreditCard, Award, Leaf
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import type { Screen } from '../App';
import { sounds } from '../utils/audio';
import { translations, type Language } from '../utils/i18n';
import InteractiveGridFlow from './InteractiveGridFlow';
import confetti from 'canvas-confetti';

interface Props {
  walletBalance: number;
  isSupplyActive: boolean;
  onToggleSupply: () => void;
  onNavigate: (screen: Screen) => void;
  lang: Language;
  isDark: boolean;
  currentRate: number;
  solarProduction: number;
  setSolarProduction: (watts: number) => void;
  consumerLoad: number;
  setConsumerLoad: (watts: number) => void;
  batterySOC: number;
  setBatterySOC: (soc: number | ((prev: number) => number)) => void;
  voltage: number;
  current: number;
  onQuickRecharge?: (amount: number) => void;
}

export default function ConsumerDashboard({
  walletBalance,
  isSupplyActive,
  onToggleSupply,
  onNavigate,
  lang,
  isDark,
  currentRate,
  solarProduction,
  setSolarProduction,
  consumerLoad,
  setConsumerLoad,
  batterySOC,
  setBatterySOC,
  voltage,
  current,
  onQuickRecharge,
}: Props) {
  const t = translations[lang];
  const [showAlert, setShowAlert] = useState(true);
  const [showQuickRechargeModal, setShowQuickRechargeModal] = useState(false);
  const [selectedQuickAmount, setSelectedQuickAmount] = useState(250);
  const [isRecharging, setIsRecharging] = useState(false);

  // Per second burn rate calculation
  const deductionPerSecond = isSupplyActive ? (consumerLoad / 1000) * (currentRate / 3600) : 0;
  const remainingMinutes = deductionPerSecond > 0 && walletBalance > 0
    ? Math.floor(walletBalance / (deductionPerSecond * 60))
    : 0;
  const remainingHours = Math.floor(remainingMinutes / 60);
  const remainingMins = remainingMinutes % 60;
  const progressPercent = Math.min((remainingMinutes / 360) * 100, 100);

  // 24h Hourly telemetry curve mock data
  const hourlyData = [
    { time: '06:00', solar: 100, load: 250, rate: 5.5 },
    { time: '08:00', solar: 650, load: 400, rate: 6.0 },
    { time: '10:00', solar: 1450, load: 550, rate: 6.5 },
    { time: '12:00', solar: 1950, load: 850, rate: 6.5 },
    { time: '14:00', solar: 1800, load: 700, rate: 6.5 },
    { time: '16:00', solar: 950, load: 600, rate: 6.5 },
    { time: '18:00', solar: 250, load: 950, rate: 7.5 },
    { time: '20:00', solar: 0, load: 1100, rate: 8.0 },
    { time: '22:00', solar: 0, load: 650, rate: 8.0 },
  ];

  const handleRelayToggle = () => {
    sounds.playRelay(!isSupplyActive);
    onToggleSupply();
  };

  const handleExecuteQuickRecharge = (amt: number) => {
    sounds.playClick();
    setIsRecharging(true);

    setTimeout(() => {
      setIsRecharging(false);
      setShowQuickRechargeModal(false);
      onQuickRecharge?.(amt);
      sounds.playRecharge();

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#14b8a6', '#f59e0b', '#3b82f6'],
        });
      } catch {}
    }, 700);
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Live Microgrid Ticker Tape */}
      <div className={`py-2 px-4 rounded-2xl border flex items-center justify-between gap-4 overflow-hidden text-[11px] font-mono ${
        isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
      }`}>
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-emerald-400 uppercase">IoT Live</span>
        </div>

        <div className="overflow-hidden whitespace-nowrap flex-1">
          <div className="inline-flex gap-8 ticker-tape">
            <span>📡 ESP32_PZEM_FLAT101 • MQTT 1883 • 14ms Latency</span>
            <span>⚡ Grid Freq: 50.02 Hz • PF: 0.98 • NABL Class 1.0</span>
            <span>☀️ Solar Tariff: ₹{currentRate.toFixed(2)}/kWh (36% vs DISCOM ₹10.20)</span>
            <span>🌱 Today's Carbon Offset: +2.4 kg CO₂ Avoided</span>
            <span>🔒 Cryptographic Ledger SHA-256 Validated</span>
          </div>
        </div>

        <button
          onClick={() => { sounds.playClick(); onNavigate('telemetry'); }}
          className="text-emerald-400 hover:text-emerald-300 font-bold shrink-0 flex items-center gap-1"
        >
          <span>Raw Packets</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Low Balance Warning Banner (if balance < 100) */}
      {walletBalance < 100 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-between gap-3 shadow-lg shadow-rose-950/20">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-rose-500/20">
              <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce" />
            </span>
            <div>
              <p className="font-bold text-xs">
                {lang === 'hi' ? 'कम प्रीपेड बैलेंस चेतावनी (Low Balance Alert)' : 'Low Prepaid Wallet Balance Warning'}
              </p>
              <p className="text-[11px] opacity-90 mt-0.5">
                {lang === 'hi'
                  ? `केवल ₹${walletBalance.toFixed(2)} शेष हैं। शून्य होते ही रिले ऑटो-कटऑफ हो जाएगा।`
                  : `Remaining balance is ₹${walletBalance.toFixed(2)}. Supply will auto-suspend upon depletion.`}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowQuickRechargeModal(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98]"
          >
            + {lang === 'hi' ? 'तुरंत ₹250 जोड़ें' : 'Instant Top-up'}
          </button>
        </div>
      )}

      {/* Top Banner: Dynamic Solar Pricing Alert */}
      {showAlert && (
        <div className={`p-4 rounded-2xl border flex items-start justify-between gap-3 shadow-sm transition-all ${
          isDark
            ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-start gap-3">
            <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 mt-0.5">
              <Sun className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <p className="font-bold text-xs">
                {lang === 'hi' ? 'सौर पीक डिस्काउंट सक्रिय (Daytime Solar Discount)' : 'Peak Solar Discount Active (10:00 - 16:00)'}
              </p>
              <p className="text-[11px] opacity-90 mt-0.5">
                {lang === 'hi'
                  ? `वर्तमान दर केवल ₹${currentRate.toFixed(2)}/kWh है (सरकारी ग्रिड दर ₹10.20 से 36% सस्ती!)।`
                  : `Active tariff is locked at ₹${currentRate.toFixed(2)}/kWh (36% cheaper than DISCOM grid tariff of ₹10.20)!`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAlert(false)}
            className="text-xs text-amber-400 hover:text-white p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Hero Stats Card */}
      <div className={`rounded-3xl p-6 sm:p-8 transition-all relative overflow-hidden ${
        isDark
          ? 'bg-slate-900/80 border border-slate-800 shadow-2xl'
          : 'bg-white border border-emerald-100 shadow-xl'
      }`}>
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-3 h-3 rounded-full ${isSupplyActive ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
              <span className={`text-xs font-mono font-bold uppercase tracking-wider ${
                isSupplyActive ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {isSupplyActive ? t.activeSupply : t.supplyPaused}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {lang === 'hi' ? 'उपभोक्ता ऊर्जा नियंत्रण कक्ष' : 'Consumer Energy Command Center'}
            </h2>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Rahul Sharma • Flat 101 • Smart Meter #ESP32-PZEM-01 • NABL Class 1.0
            </p>
          </div>

          {/* Big Relay Switch Button & Quick Recharge */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleRelayToggle}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg active:scale-[0.98] ${
                isSupplyActive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
              }`}
            >
              {isSupplyActive ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>{lang === 'hi' ? 'आपूर्ति अस्थायी रोकें' : 'Suspend Solar Supply'}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>{lang === 'hi' ? 'आपूर्ति पुनः चालू करें' : 'Restore Solar Supply'}</span>
                </>
              )}
            </button>

            <button
              onClick={() => { sounds.playClick(); setShowQuickRechargeModal(true); }}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 transition-all hover:brightness-110 active:scale-[0.98]"
            >
              <Wallet className="w-4 h-4" />
              <span>{lang === 'hi' ? 'त्वरित टॉप-अप' : 'Quick Top-Up'}</span>
            </button>
          </div>
        </div>

        {/* 6 Core Telemetry & Billing Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-6">
          <div className={`p-4 rounded-2xl border transition-all card-hover ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              {t.currentLoad}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-400">
                {isSupplyActive ? consumerLoad : 0}
              </span>
              <span className="text-xs font-bold text-cyan-500/80">W</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {voltage.toFixed(1)}V • {isSupplyActive ? current.toFixed(2) : '0.00'}A
            </p>
          </div>

          <div className={`p-4 rounded-2xl border transition-all card-hover ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              {t.currentRate}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400">
                ₹{currentRate.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-amber-500/80">/kWh</span>
            </div>
            <p className="text-[11px] text-emerald-400 font-semibold mt-1">
              36% {lang === 'hi' ? 'ग्रिड से बचत' : 'vs DISCOM'}
            </p>
          </div>

          <div className={`p-4 rounded-2xl border transition-all card-hover ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              {t.deductionRate}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-400">
                ₹{deductionPerSecond.toFixed(4)}
              </span>
              <span className="text-xs font-bold text-rose-500/80">/s</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              ₹{(deductionPerSecond * 3600).toFixed(2)} / hr
            </p>
          </div>

          <div className={`p-4 rounded-2xl border transition-all card-hover ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              {t.walletEst}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
                {remainingHours}h {remainingMins}m
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progressPercent > 50 ? 'bg-emerald-500' : progressPercent > 20 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className={`p-4 rounded-2xl border transition-all card-hover ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              {lang === 'hi' ? 'वॉलेट बैलेंस' : 'Wallet Balance'}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                ₹{walletBalance.toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Prepaid Meter Balance</p>
          </div>

          <div className={`p-4 rounded-2xl border transition-all card-hover ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              {lang === 'hi' ? 'कार्बन बचत' : 'CO₂ Offset'}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-teal-400">
                2.4 <span className="text-xs">kg</span>
              </span>
            </div>
            <p className="text-[11px] text-teal-400 font-semibold mt-1">1 Tree Equivalent</p>
          </div>
        </div>
      </div>

      {/* Interactive Microgrid Flow Visualizer */}
      <InteractiveGridFlow
        solarProduction={solarProduction}
        setSolarProduction={setSolarProduction}
        consumerLoad={consumerLoad}
        setConsumerLoad={setConsumerLoad}
        batterySOC={batterySOC}
        setBatterySOC={setBatterySOC}
        isSupplyActive={isSupplyActive}
        onToggleSupply={onToggleSupply}
        lang={lang}
        isDark={isDark}
        voltage={voltage}
        current={current}
      />

      {/* 24-Hour Solar Yield vs Demand Chart */}
      <div className={`rounded-3xl p-6 sm:p-8 transition-all ${
        isDark ? 'bg-slate-900/80 border border-slate-800' : 'bg-white border border-emerald-100 shadow-lg'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold">
              {t.generationChartTitle}
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {lang === 'hi'
                ? 'सौर ऊर्जा उत्पादन (अंबर) बनाम आपके फ्लैट की ऊर्जा खपत (टील)'
                : 'Solar Generation Profile (Amber) vs Flat 101 Electricity Consumption (Teal)'}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              {lang === 'hi' ? 'सौर उत्पादन (W)' : 'Solar Yield (W)'}
            </span>
            <span className="flex items-center gap-1.5 text-teal-400">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block" />
              {lang === 'hi' ? 'खपत (W)' : 'Flat Load (W)'}
            </span>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} opacity={0.5} />
              <XAxis dataKey="time" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
              <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  borderColor: isDark ? '#334155' : '#e2e8f0',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Area type="monotone" dataKey="solar" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#solarGrad)" name="Solar (W)" />
              <Area type="monotone" dataKey="load" stroke="#14b8a6" strokeWidth={2.5} fillOpacity={1} fill="url(#loadGrad)" name="Load (W)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Recharge Modal */}
      {showQuickRechargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in">
          <div className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl ${
            isDark ? 'bg-slate-900 border-emerald-500/40 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base">
                  {lang === 'hi' ? 'त्वरित UPI वॉलेट टॉप-अप' : 'Quick UPI Wallet Top-up'}
                </h3>
              </div>
              <button
                onClick={() => setShowQuickRechargeModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              {lang === 'hi'
                ? 'रिचार्ज करते ही राशि तुरंत आपके प्रीपेड मीटर से जुड़ जाएगी।'
                : 'Select an instant amount to credit directly to your flat meter wallet:'}
            </p>

            <div className="grid grid-cols-2 gap-2 mb-5">
              {[100, 250, 500, 1000].map(amt => (
                <button
                  key={amt}
                  onClick={() => { sounds.playClick(); setSelectedQuickAmount(amt); }}
                  className={`py-3 rounded-2xl font-mono text-sm font-bold border transition-all ${
                    selectedQuickAmount === amt
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg'
                      : isDark
                      ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExecuteQuickRecharge(selectedQuickAmount)}
                disabled={isRecharging}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                {isRecharging ? (
                  <span>{lang === 'hi' ? 'प्रक्रिया जारी...' : 'Processing...'}</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>{lang === 'hi' ? `₹${selectedQuickAmount} तुरंत रिचार्ज करें` : `Recharge ₹${selectedQuickAmount} Now`}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => { setShowQuickRechargeModal(false); onNavigate('wallet'); }}
                className={`px-3 py-3.5 rounded-2xl border text-xs font-bold transition-all ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
                title="Full Wallet Screen"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
