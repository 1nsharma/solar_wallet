import { useState, useEffect } from 'react';
import { Sun, Zap, Battery, ShieldAlert, CheckCircle2, Flame, Sliders, AlertTriangle, Cpu, Radio } from 'lucide-react';
import { sounds } from '../utils/audio';
import { translations, type Language } from '../utils/i18n';

interface Props {
  solarProduction: number;
  setSolarProduction: (watts: number) => void;
  consumerLoad: number;
  setConsumerLoad: (watts: number) => void;
  batterySOC: number;
  setBatterySOC: (soc: number | ((prev: number) => number)) => void;
  isSupplyActive: boolean;
  onToggleSupply: () => void;
  lang: Language;
  isDark: boolean;
  voltage: number;
  current: number;
}

export default function InteractiveGridFlow({
  solarProduction,
  setSolarProduction,
  consumerLoad,
  setConsumerLoad,
  batterySOC,
  setBatterySOC,
  isSupplyActive,
  onToggleSupply,
  lang,
  isDark,
  voltage,
  current,
}: Props) {
  const t = translations[lang];

  // Appliance state toggles
  const [appliances, setAppliances] = useState({
    ac: true, // 1200W
    induction: false, // 800W
    geyser: false, // 1500W
    evCharger: false, // 750W
    baseLights: true, // 200W
  });

  const [sunMode, setSunMode] = useState<'noon' | 'morning' | 'overcast' | 'night'>('noon');
  const [isOverloadTripped, setIsOverloadTripped] = useState(false);
  const [tripCountdown, setTripCountdown] = useState(0);

  // Recalculate load when appliances toggle
  useEffect(() => {
    let load = 0;
    if (appliances.baseLights) load += 150;
    if (appliances.ac) load += 1200;
    if (appliances.induction) load += 800;
    if (appliances.geyser) load += 1500;
    if (appliances.evCharger) load += 750;
    setConsumerLoad(load);

    // Overload safety check (> 3200W limit)
    if (load > 3200 && isSupplyActive && !isOverloadTripped) {
      triggerTrip('OVERLOAD_CURRENT_EXCEEDED');
    }
  }, [appliances]);

  const toggleAppliance = (key: keyof typeof appliances) => {
    sounds.playClick();
    setAppliances(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSunMode = (mode: 'noon' | 'morning' | 'overcast' | 'night') => {
    sounds.playClick();
    setSunMode(mode);
    if (mode === 'noon') setSolarProduction(1850);
    if (mode === 'morning') setSolarProduction(950);
    if (mode === 'overcast') setSolarProduction(380);
    if (mode === 'night') setSolarProduction(0);
  };

  const triggerTrip = (reason: string) => {
    sounds.playAlarm();
    setIsOverloadTripped(true);
    setTripCountdown(6);
    if (isSupplyActive) {
      onToggleSupply();
    }
  };

  // Auto-recovery timer after trip
  useEffect(() => {
    if (tripCountdown > 0) {
      const timer = setTimeout(() => setTripCountdown(tripCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isOverloadTripped && tripCountdown === 0) {
      setIsOverloadTripped(false);
      // Turn off heavy appliances to prevent re-trip
      setAppliances(prev => ({ ...prev, geyser: false, evCharger: false }));
      if (!isSupplyActive) {
        onToggleSupply();
      }
    }
  }, [tripCountdown, isOverloadTripped]);

  const surplusOrDeficit = solarProduction - consumerLoad;
  const isCharging = surplusOrDeficit > 0;
  const gridExport = Math.max(0, surplusOrDeficit - 200);

  return (
    <div className={`rounded-3xl p-5 sm:p-7 transition-all ${
      isDark ? 'bg-slate-900/80 border border-slate-800 shadow-2xl' : 'bg-white/90 border border-emerald-100 shadow-xl'
    }`}>
      {/* Title & Live IoT Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Sun className="w-5 h-5 animate-pulse" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">
              {lang === 'hi' ? 'स्मार्ट माइक्रोग्रिड लाइव एनर्जी फ्लो' : 'Smart Microgrid Real-time Energy Flow'}
            </h2>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {lang === 'hi'
              ? 'ESP32 + PZEM-004T स्मार्ट मीटर और रिले द्वारा वास्तविक समय में सिंक्रनाइज़'
              : 'Real-time telemetry stream synchronized via ESP32 + PZEM-004T bi-directional meter'}
          </p>
        </div>

        {/* Live Safety Badge & Cutoff Indicator */}
        <div className="flex items-center gap-2 flex-wrap">
          {isOverloadTripped ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold animate-pulse">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>{lang === 'hi' ? `सुरक्षा ट्रिप सक्रिय! रीसेट: ${tripCountdown}s` : `SAFETY TRIP! Auto-reset: ${tripCountdown}s`}</span>
            </div>
          ) : isSupplyActive ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-ping" />
              <span>{lang === 'hi' ? 'रिले चालू (सक्रिय आपूर्ति)' : 'Relay CLOSED (Power Active)'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'hi' ? 'रिले बंद (कट-ऑफ)' : 'Relay OPEN (Isolated)'}</span>
            </div>
          )}

          <button
            onClick={() => triggerTrip('MANUAL_TEST_TRIP')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isDark
                ? 'bg-slate-800 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            }`}
          >
            ⚡ {lang === 'hi' ? 'ओवरलोड टेस्ट' : 'Test Trip'}
          </button>
        </div>
      </div>

      {/* SVG Interactive Microgrid Flow Schematic */}
      <div className={`relative rounded-2xl p-4 sm:p-6 overflow-hidden ${
        isDark ? 'bg-slate-950/70 border border-slate-800/80' : 'bg-slate-50/80 border border-slate-200/80'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 relative z-10">
          
          {/* Node 1: Rooftop Solar PV */}
          <div className={`rounded-2xl p-4 transition-all relative overflow-hidden ${
            solarProduction > 0
              ? isDark
                ? 'bg-amber-950/30 border border-amber-500/40 shadow-lg shadow-amber-500/10'
                : 'bg-amber-50/90 border border-amber-300 shadow-md'
              : isDark ? 'bg-slate-900 border border-slate-800 opacity-60' : 'bg-gray-100 border border-gray-200 opacity-60'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                {lang === 'hi' ? 'रूफटॉप सोलर 3.2kW' : 'Rooftop Solar 3.2kW'}
              </span>
              <Sun className={`w-5 h-5 text-amber-400 ${solarProduction > 0 ? 'animate-spin' : ''}`} style={{ animationDuration: '16s' }} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold font-mono text-amber-400">
                {solarProduction}
              </span>
              <span className="text-xs font-bold text-amber-500/80">W</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {sunMode === 'noon' && (lang === 'hi' ? 'शिखर धूप (Peak 1000 W/m²)' : 'Peak Sun (1000 W/m²)')}
              {sunMode === 'morning' && (lang === 'hi' ? 'सुबह की धूप (Morning Sun)' : 'Morning Sun')}
              {sunMode === 'overcast' && (lang === 'hi' ? 'बादल (Overcast Diffuse)' : 'Overcast Diffuse')}
              {sunMode === 'night' && (lang === 'hi' ? 'रात (Zero Solar)' : 'Night (Zero Solar)')}
            </p>

            {/* Sun mode fast selector */}
            <div className="flex gap-1 mt-3">
              {(['noon', 'morning', 'overcast', 'night'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => handleSunMode(m)}
                  className={`text-[10px] px-2 py-1 rounded-md capitalize font-semibold transition-all ${
                    sunMode === m
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-white text-slate-600 border'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Node 2: Hybrid Inverter & MPPT */}
          <div className={`rounded-2xl p-4 transition-all ${
            isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                {lang === 'hi' ? 'हाइब्रिड इन्वर्टर MPPT' : 'Hybrid Inverter MPPT'}
              </span>
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold font-mono text-cyan-400">
                98.2
              </span>
              <span className="text-xs font-bold text-cyan-500/80">% {lang === 'hi' ? 'दक्षता' : 'Eff'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/40 text-[11px]">
              <div>
                <span className="text-slate-400">{lang === 'hi' ? 'वोल्टेज' : 'Voltage'}</span>
                <p className="font-mono font-bold text-emerald-400">{voltage.toFixed(1)} V</p>
              </div>
              <div>
                <span className="text-slate-400">{lang === 'hi' ? 'आवृत्ति' : 'Freq'}</span>
                <p className="font-mono font-bold text-emerald-400">50.02 Hz</p>
              </div>
            </div>
          </div>

          {/* Node 3: 5.2 kWh LFP Battery Reserve */}
          <div className={`rounded-2xl p-4 transition-all ${
            isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                {lang === 'hi' ? 'LFP बैटरी बैंक' : 'LFP Battery Reserve'}
              </span>
              <Battery className={`w-5 h-5 ${isCharging ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-emerald-400">
                {batterySOC}%
              </span>
              <span className="text-xs font-semibold text-emerald-500/90">
                {isCharging ? (lang === 'hi' ? 'चार्जिंग (+420W)' : 'Charging (+420W)') : (lang === 'hi' ? 'स्टैंडबाय' : 'Standby')}
              </span>
            </div>
            {/* Battery bar */}
            <div className="w-full bg-slate-800/80 rounded-full h-2 mt-3 overflow-hidden border border-slate-700/50">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${batterySOC}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              5.2 kWh LiFePO4 • 48V 100Ah
            </p>
          </div>

          {/* Node 4: Tenant Load & IoT Relay Cutoff */}
          <div className={`rounded-2xl p-4 transition-all relative overflow-hidden ${
            isSupplyActive
              ? isDark
                ? 'bg-teal-950/30 border border-teal-500/40 shadow-lg shadow-teal-500/10'
                : 'bg-teal-50/90 border border-teal-300'
              : isDark ? 'bg-rose-950/20 border border-rose-500/30' : 'bg-rose-50 border border-rose-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${isSupplyActive ? 'text-teal-400' : 'text-rose-400'}`}>
                {lang === 'hi' ? 'उपभोक्ता लोड (फ्लैट 101)' : 'Tenant Load (Flat 101)'}
              </span>
              <Zap className={`w-5 h-5 ${isSupplyActive ? 'text-teal-400 animate-bounce' : 'text-rose-400'}`} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-extrabold font-mono ${isSupplyActive ? 'text-teal-400' : 'text-rose-400'}`}>
                {isSupplyActive ? consumerLoad : 0}
              </span>
              <span className="text-xs font-bold text-teal-500/80">W</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/40 text-[11px]">
              <div>
                <span className="text-slate-400">{lang === 'hi' ? 'करंट (Current)' : 'Current'}</span>
                <p className="font-mono font-bold text-teal-400">{isSupplyActive ? current.toFixed(2) : '0.00'} A</p>
              </div>
              <div>
                <span className="text-slate-400">{lang === 'hi' ? 'पावर फैक्टर' : 'Power Factor'}</span>
                <p className="font-mono font-bold text-teal-400">0.98 PF</p>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Connecting SVG Flow Lines */}
        <div className="mt-6 pt-4 border-t border-slate-800/40">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-2 mb-2">
            <span>☀️ {lang === 'hi' ? 'सौर इनपुट' : 'Solar Yield'}</span>
            <span className="hidden sm:inline">⚡ {lang === 'hi' ? 'इन्वर्टर रूपांतरण' : 'Inversion'}</span>
            <span className="hidden sm:inline">🔋 {lang === 'hi' ? 'बैटरी बफर' : 'Battery Buffer'}</span>
            <span>🔌 {lang === 'hi' ? 'किरायेदार खपत' : 'Tenant Load'}</span>
            <span>🌐 {lang === 'hi' ? 'ग्रिड एक्सपोर्ट' : 'Surplus Grid'}</span>
          </div>

          <div className="relative h-6 w-full flex items-center">
            {/* Background Track */}
            <div className="w-full h-2 rounded-full bg-slate-800 relative overflow-hidden">
              {/* Animated Glowing Laser Stream */}
              {isSupplyActive && solarProduction > 0 && (
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 animate-pulse opacity-80" />
              )}
            </div>
          </div>
        </div>

        {/* Interactive Appliance Load Matrix */}
        <div className="mt-5 pt-5 border-t border-slate-800/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-teal-400" />
              {lang === 'hi' ? 'इंटरएक्टिव उपकरण लोड सिम्युलेटर (क्लिक करके लोड बदलें)' : 'Interactive Appliance Load Simulator (Click to toggle load)'}
            </span>
            <span className="text-xs font-mono font-bold text-teal-400">
              {lang === 'hi' ? `कुल लोड: ${consumerLoad} W` : `Total Active Load: ${consumerLoad} W`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[
              { key: 'baseLights', label: lang === 'hi' ? '💡 लाइट/पंखे' : '💡 Basic Lighting', watts: 150 },
              { key: 'ac', label: lang === 'hi' ? '❄️ इन्वर्टर AC' : '❄️ Inverter AC', watts: 1200 },
              { key: 'induction', label: lang === 'hi' ? '🍲 इंडक्शन चूल्हा' : '🍲 Induction Cooker', watts: 800 },
              { key: 'geyser', label: lang === 'hi' ? '🚿 वॉटर गीज़र' : '🚿 Water Geyser', watts: 1500 },
              { key: 'evCharger', label: lang === 'hi' ? '🚗 EV चार्जर' : '🚗 EV 2W Charger', watts: 750 },
            ].map(item => {
              const active = appliances[item.key as keyof typeof appliances];
              return (
                <button
                  key={item.key}
                  onClick={() => toggleAppliance(item.key as keyof typeof appliances)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    active
                      ? isDark
                        ? 'bg-teal-950/60 border-teal-500/50 text-teal-300 shadow-md shadow-teal-950'
                        : 'bg-teal-50 border-teal-400 text-teal-900 shadow-sm'
                      : isDark
                      ? 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-300'
                      : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <p className="text-xs font-bold truncate">{item.label}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] font-mono opacity-80">+{item.watts}W</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      active ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {active ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
