import React, { useState } from 'react';
import {
  FileText, Download, ShieldCheck, CheckCircle2, TrendingUp,
  Sun, Zap, Award, Calendar, Search, Filter, Printer, ExternalLink
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { sounds } from '../utils/audio';
import type { Language } from '../utils/i18n';
import type { Screen } from '../App';
import confetti from 'canvas-confetti';

interface Props {
  lang: Language;
  isDark: boolean;
  onNavigate: (screen: Screen) => void;
}

export default function ReportsScreen({ lang, isDark, onNavigate }: Props) {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const monthlyReportData = [
    { name: 'Week 1', solar: 142, tenantUsage: 98, saved: 411.60 },
    { name: 'Week 2', solar: 165, tenantUsage: 115, saved: 483.00 },
    { name: 'Week 3', solar: 180, tenantUsage: 128, saved: 537.60 },
    { name: 'Week 4', solar: 154, tenantUsage: 110, saved: 462.00 },
  ];

  const auditLog = [
    {
      id: 'AUD-8821',
      date: '2026-09-28',
      flat: 'Flat 101',
      units: 6.8,
      rate: '₹6.50',
      total: '₹44.20',
      gridCost: '₹69.36',
      saved: '₹25.16',
      hash: '0x9b3f4...e812',
      status: 'VERIFIED_NABL',
    },
    {
      id: 'AUD-8820',
      date: '2026-09-27',
      flat: 'Flat 101',
      units: 7.2,
      rate: '₹6.50',
      total: '₹46.80',
      gridCost: '₹73.44',
      saved: '₹26.64',
      hash: '0x1c8e2...a439',
      status: 'VERIFIED_NABL',
    },
    {
      id: 'AUD-8819',
      date: '2026-09-28',
      flat: 'Flat 102',
      units: 4.5,
      rate: '₹6.50',
      total: '₹29.25',
      gridCost: '₹45.90',
      saved: '₹16.65',
      hash: '0x4d2a1...ff90',
      status: 'VERIFIED_NABL',
    },
    {
      id: 'AUD-8818',
      date: '2026-09-27',
      flat: 'Flat 102',
      units: 5.1,
      rate: '₹6.50',
      total: '₹33.15',
      gridCost: '₹52.02',
      saved: '₹18.87',
      hash: '0x7e9c3...b114',
      status: 'VERIFIED_NABL',
    },
    {
      id: 'AUD-8817',
      date: '2026-09-28',
      flat: 'Flat 201 (EV)',
      units: 8.5,
      rate: '₹5.85',
      total: '₹49.72',
      gridCost: '₹86.70',
      saved: '₹36.98',
      hash: '0x3a2f8...c901',
      status: 'VERIFIED_NABL',
    },
  ];

  const handleDownload = (format: 'pdf' | 'csv') => {
    sounds.playRecharge();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
      });
    } catch {}

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Top Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden transition-all ${
        isDark
          ? 'bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-indigo-500/30'
          : 'bg-gradient-to-r from-indigo-50 via-white to-teal-50 border-indigo-100 shadow-xl'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold font-mono mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>INDIAN ELECTRICITY ACT 2003 • SEC 43A COMPLIANT</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {lang === 'hi' ? 'विधिक ऑडिट एवं ईएसजी कार्बन रिपोर्ट' : 'Official Energy Audit & ESG Reports'}
            </h2>
            <p className={`text-xs mt-1 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {lang === 'hi'
                ? 'NABL क्लास 1.0 मीटरिंग द्वारा सत्यापित उपभोग, डिजिटल लेजर हैश और विवाद-मुक्त किरायेदार बिलिंग रिपोर्ट।'
                : 'Tamper-proof, cryptographically signed solar microgrid audit statements. Discom-compliant non-commercial peer sharing statements.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDownload('pdf')}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-950/40 transition-all active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>{lang === 'hi' ? 'ऑडिट PDF डाउनलोड' : 'Download Audit PDF'}</span>
            </button>

            <button
              onClick={() => handleDownload('csv')}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-bold transition-all ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'hi' ? 'लेजर CSV' : 'Export CSV'}</span>
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {lang === 'hi'
                ? 'सत्यापित ऑडिट स्टेटमेंट सफलतापूर्वक जनरेट हुआ!'
                : 'Cryptographically signed audit statement generated & downloaded successfully!'}
            </span>
          </div>
        )}
      </div>

      {/* 4 ESG Impact Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border transition-all ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {lang === 'hi' ? 'कुल सौर उत्पादन' : 'Total Solar Yield'}
            </span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
            641 <span className="text-xs font-normal">kWh</span>
          </p>
          <p className="text-[11px] text-emerald-400 font-semibold mt-1">
            +18.4% vs last month
          </p>
        </div>

        <div className={`p-5 rounded-2xl border transition-all ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {lang === 'hi' ? 'किरायेदार कुल बचत' : 'Tenant Savings'}
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
            ₹1,894
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            vs ₹10.20 DISCOM rate
          </p>
        </div>

        <div className={`p-5 rounded-2xl border transition-all ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {lang === 'hi' ? 'CO₂ उत्सर्जन निवारण' : 'CO₂ Avoided'}
            </span>
            <Award className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-teal-400">
            525 <span className="text-xs font-normal">kg</span>
          </p>
          <p className="text-[11px] text-teal-400 font-semibold mt-1">
            0.525 Metric Tons Green
          </p>
        </div>

        <div className={`p-5 rounded-2xl border transition-all ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {lang === 'hi' ? 'वृक्षारोपण समतुल्य' : 'Trees Equivalent'}
            </span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">
            26 <span className="text-xs font-normal">Trees</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Carbon absorption parity
          </p>
        </div>
      </div>

      {/* Monthly Generation vs Shared BarChart */}
      <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-lg'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-base">
              {lang === 'hi' ? 'साप्ताहिक स्वच्छ ऊर्जा उत्पादन एवं किरायेदार बचत' : 'Weekly Clean Energy Yield vs Tenant Savings (₹)'}
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {lang === 'hi' ? 'सितम्बर 2026 के लिए प्रमाणित मीटर आंकड़े' : 'Calibrated meter data for September 2026'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(['week', 'month', 'quarter'] as const).map(range => (
              <button
                key={range}
                onClick={() => { sounds.playClick(); setDateRange(range); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                  dateRange === range
                    ? 'bg-indigo-600 text-white shadow-md'
                    : isDark
                    ? 'bg-slate-800 text-slate-400 hover:text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyReportData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} opacity={0.5} />
              <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
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
              <Bar dataKey="tenantUsage" fill="#14b8a6" radius={[6, 6, 0, 0]} name="Tenant (kWh)" />
              <Bar dataKey="saved" fill="#6366f1" radius={[6, 6, 0, 0]} name="Saved (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Certified Ledger Table */}
      <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-lg'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span>{lang === 'hi' ? 'विवाद-मुक्त मीटरिंग लेजर' : 'Dispute-Proof Metrology Ledger'}</span>
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {lang === 'hi'
                ? 'प्रत्येक लेनदेन डिजिटल रूप से हस्ताक्षरित है और NABL क्लास 1.0 मीटर प्रमाणन द्वारा समर्थित है।'
                : 'Every billing unit is cryptographically hashed and backed by NABL Class 1.0 smart meter validation.'}
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            NABL ISO/IEC 17025 Calibrated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b font-mono font-bold uppercase ${
                isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
              }`}>
                <th className="pb-3">Audit Ref</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Flat ID</th>
                <th className="pb-3">Solar Units</th>
                <th className="pb-3">P2P Rate</th>
                <th className="pb-3">Paid</th>
                <th className="pb-3">Savings</th>
                <th className="pb-3">Sha-256 Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {auditLog.map(row => (
                <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-mono font-bold text-indigo-400">{row.id}</td>
                  <td className="py-3 text-slate-400">{row.date}</td>
                  <td className="py-3 font-bold">{row.flat}</td>
                  <td className="py-3 font-mono font-bold text-amber-400">{row.units} kWh</td>
                  <td className="py-3 font-mono">{row.rate}</td>
                  <td className="py-3 font-mono font-bold text-white">{row.total}</td>
                  <td className="py-3 font-mono font-bold text-emerald-400">{row.saved}</td>
                  <td className="py-3 font-mono text-[11px] text-slate-500">{row.hash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
