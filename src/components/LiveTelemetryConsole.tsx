import { useState, useEffect } from 'react';
import { Cpu, Terminal, Radio, ShieldCheck, RefreshCw, Send, CheckCircle2, AlertOctagon } from 'lucide-react';
import { sounds } from '../utils/audio';
import { translations, type Language } from '../utils/i18n';

interface Props {
  lang: Language;
  isDark: boolean;
  solarProduction: number;
  consumerLoad: number;
  voltage: number;
  current: number;
  isSupplyActive: boolean;
  onToggleSupply: () => void;
}

interface LogEntry {
  id: string;
  timestamp: string;
  topic: string;
  payload: string;
  type: 'data' | 'cmd' | 'alert' | 'status';
}

export default function LiveTelemetryConsole({
  lang,
  isDark,
  solarProduction,
  consumerLoad,
  voltage,
  current,
  isSupplyActive,
  onToggleSupply,
}: Props) {
  const t = translations[lang];
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [pingLatency, setPingLatency] = useState(14);
  const [customCmd, setCustomCmd] = useState('STATUS');

  // Stream simulated MQTT packets
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString() + '.' + String(now.getMilliseconds()).padStart(3, '0');
      
      const payloadObj = {
        dev: 'ESP32_PZEM_01',
        v: Number(voltage.toFixed(1)),
        i: Number(current.toFixed(2)),
        p: isSupplyActive ? consumerLoad : 0,
        f: 50.02,
        pf: 0.98,
        relay: isSupplyActive ? 1 : 0,
        solar_in: solarProduction,
        ts: Date.now(),
        hash: '0x' + Math.random().toString(16).substring(2, 10),
      };

      const newEntry: LogEntry = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: timeStr,
        topic: 'solarsync/ESP32_01/data',
        payload: JSON.stringify(payloadObj),
        type: 'data',
      };

      setLogs(prev => [newEntry, ...prev.slice(0, 49)]);
    }, 2500);

    return () => clearInterval(interval);
  }, [isStreaming, voltage, current, consumerLoad, solarProduction, isSupplyActive]);

  const sendCommand = (cmd: string) => {
    sounds.playClick();
    const now = new Date();
    const timeStr = now.toLocaleTimeString() + '.' + String(now.getMilliseconds()).padStart(3, '0');

    if (cmd === 'CUTOFF' && isSupplyActive) {
      onToggleSupply();
    } else if (cmd === 'RESTORE' && !isSupplyActive) {
      onToggleSupply();
    }

    const cmdEntry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: timeStr,
      topic: 'solarsync/ESP32_01/command',
      payload: JSON.stringify({ cmd, auth_token: 'JWT_VERIFIED_SIGNATURE', nonce: Math.floor(Math.random() * 10000) }),
      type: 'cmd',
    };

    setLogs(prev => [cmdEntry, ...prev]);

    // Simulated ack
    setTimeout(() => {
      const ackEntry: LogEntry = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        topic: 'solarsync/ESP32_01/status',
        payload: JSON.stringify({ status: 'ACK_SUCCESS', exec_cmd: cmd, relay_state: isSupplyActive ? 0 : 1 }),
        type: 'status',
      };
      setLogs(prev => [ackEntry, ...prev]);
    }, 300);
  };

  const handlePing = () => {
    sounds.playClick();
    const newPing = Math.floor(12 + Math.random() * 10);
    setPingLatency(newPing);
  };

  return (
    <div className={`rounded-3xl p-5 sm:p-7 transition-all ${
      isDark ? 'bg-slate-900/80 border border-slate-800 shadow-2xl' : 'bg-white/90 border border-emerald-100 shadow-xl'
    }`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Terminal className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">
              {lang === 'hi' ? 'ESP32 + PZEM-004T लाइव MQTT टेलीमेट्री कंसोल' : 'ESP32 + PZEM-004T Live MQTT Telemetry Console'}
            </h2>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {lang === 'hi'
              ? 'NABL-प्रमाणित कैलिब्रेटेड सेंसर और क्रिप्टोग्राफिक हैश ऑडिट ट्रेल'
              : 'Direct bidirectional MQTT command bus with dispute-proof cryptographic verification'}
          </p>
        </div>

        {/* Telemetry Status Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>PING: {pingLatency} ms</span>
          </div>

          <button
            onClick={handlePing}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isDark
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
            }`}
          >
            Ping Device
          </button>

          <button
            onClick={() => { sounds.playClick(); setIsStreaming(!isStreaming); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isStreaming
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
          >
            {isStreaming ? (lang === 'hi' ? 'स्ट्रीमिंग चालू' : 'Stream Active') : (lang === 'hi' ? 'रोका गया' : 'Paused')}
          </button>
        </div>
      </div>

      {/* Hardware Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-6">
        {[
          { label: lang === 'hi' ? 'वोल्टेज' : 'Voltage', val: `${voltage.toFixed(1)} V`, sub: '230V Nominal' },
          { label: lang === 'hi' ? 'करंट' : 'Current', val: `${isSupplyActive ? current.toFixed(2) : '0.00'} A`, sub: 'Max 16A' },
          { label: lang === 'hi' ? 'लोड पावर' : 'Active Power', val: `${isSupplyActive ? consumerLoad : 0} W`, sub: 'RMS True Power' },
          { label: lang === 'hi' ? 'आवृत्ति' : 'Grid Freq', val: '50.02 Hz', sub: 'Standard 50Hz' },
          { label: lang === 'hi' ? 'पावर फैक्टर' : 'Power Factor', val: '0.98 PF', sub: 'Pure Sinewave' },
          { label: lang === 'hi' ? 'मीटर स्थिति' : 'Relay State', val: isSupplyActive ? 'CLOSED' : 'OPEN', sub: isSupplyActive ? 'Normal' : 'Cutoff' },
        ].map((item, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-2xl border text-center ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <p className="text-[10px] text-slate-400 uppercase font-semibold">{item.label}</p>
            <p className="text-base font-extrabold font-mono text-cyan-400 mt-0.5">{item.val}</p>
            <p className="text-[9px] text-slate-500 mt-0.5">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Terminal View */}
      <div className="rounded-2xl bg-black border border-slate-800 p-4 font-mono text-xs overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="ml-2 text-slate-300 font-bold">broker.solarsync.net:8883 (TLS 1.3)</span>
          </div>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> NABL-CALIBRATED
          </span>
        </div>

        {/* Console Log Feed */}
        <div className="h-64 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 pr-1">
          {logs.map((log) => (
            <div key={log.id} className="leading-relaxed hover:bg-slate-900/60 px-1 rounded flex items-start gap-2">
              <span className="text-slate-500 select-none text-[10px]">{log.timestamp}</span>
              <span className={`text-[10px] px-1 py-0.2 rounded font-bold uppercase ${
                log.type === 'cmd'
                  ? 'bg-amber-500/20 text-amber-400'
                  : log.type === 'status'
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-cyan-500/20 text-cyan-400'
              }`}>
                {log.type}
              </span>
              <span className="text-slate-400 font-semibold">{log.topic}</span>
              <span className="text-slate-300 break-all">{log.payload}</span>
            </div>
          ))}

          {logs.length === 0 && (
            <div className="text-slate-500 text-center py-10">
              {lang === 'hi' ? 'MQTT पैकेट स्ट्रीम शुरू हो रहा है...' : 'Initializing MQTT packet listener...'}
            </div>
          )}
        </div>

        {/* Command Injection Tool */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 text-xs font-semibold">
              {lang === 'hi' ? 'त्वरित कमांड्स:' : 'Publish Command:'}
            </span>
            <button
              onClick={() => sendCommand('RESTORE')}
              className="px-2.5 py-1 rounded bg-emerald-600/30 text-emerald-400 hover:bg-emerald-600/50 border border-emerald-500/40 text-[11px] font-bold"
            >
              RESTORE (Relay ON)
            </button>
            <button
              onClick={() => sendCommand('CUTOFF')}
              className="px-2.5 py-1 rounded bg-rose-600/30 text-rose-400 hover:bg-rose-600/50 border border-rose-500/40 text-[11px] font-bold"
            >
              CUTOFF (Relay OFF)
            </button>
            <button
              onClick={() => sendCommand('CALIBRATE')}
              className="px-2.5 py-1 rounded bg-cyan-600/30 text-cyan-400 hover:bg-cyan-600/50 border border-cyan-500/40 text-[11px] font-bold"
            >
              CALIBRATE_PZEM
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customCmd}
              onChange={(e) => setCustomCmd(e.target.value)}
              placeholder="e.g. GET_DIAGNOSTICS"
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => sendCommand(customCmd)}
              className="p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-all"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
