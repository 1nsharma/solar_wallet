import { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Wallet, ArrowLeft, ArrowDownLeft, ArrowUpRight, QrCode, ShieldCheck,
  CheckCircle2, Sparkles, Download, Copy, Check, CreditCard, Zap
} from 'lucide-react';
import type { Screen } from '../App';
import { sounds } from '../utils/audio';
import { translations, type Language } from '../utils/i18n';

interface Props {
  walletBalance: number;
  onRecharge: (amount: number) => void;
  onNavigate: (screen: Screen) => void;
  lang: Language;
  isDark: boolean;
}

export interface Transaction {
  id: string;
  time: string;
  amount: number;
  type: 'debit' | 'credit';
  description: string;
  balance: number;
  hash: string;
}

export default function WalletScreen({
  walletBalance,
  onRecharge,
  onNavigate,
  lang,
  isDark,
}: Props) {
  const t = translations[lang];

  const [showRecharge, setShowRecharge] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('250');
  const [selectedUPIApp, setSelectedUPIApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim'>('gpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx-1',
      time: '14:30 Today',
      amount: 2.15,
      type: 'debit',
      description: '0.33 kWh Solar Usage @ ₹6.50/kWh',
      balance: walletBalance,
      hash: '0x8f2a9e...c410',
    },
    {
      id: 'tx-2',
      time: '14:00 Today',
      amount: 1.95,
      type: 'debit',
      description: '0.30 kWh Solar Usage @ ₹6.50/kWh',
      balance: walletBalance + 2.15,
      hash: '0x3d7b1a...99e2',
    },
    {
      id: 'tx-3',
      time: '13:30 Today',
      amount: 2.60,
      type: 'debit',
      description: '0.40 kWh Solar Usage @ ₹6.50/kWh',
      balance: walletBalance + 4.10,
      hash: '0x1b4c8f...a7d3',
    },
    {
      id: 'tx-4',
      time: '10:00 Today',
      amount: 500.00,
      type: 'credit',
      description: 'UPI Top-up (GPay ref #881923)',
      balance: walletBalance + 6.70,
      hash: '0x99e4f2...331b',
    },
    {
      id: 'tx-5',
      time: 'Yesterday 17:15',
      amount: 3.25,
      type: 'debit',
      description: '0.50 kWh Solar Usage @ ₹6.50/kWh',
      balance: walletBalance - 493.30,
      hash: '0x6e5a42...770f',
    },
  ]);

  const quickAmounts = [100, 250, 500, 1000];

  const handleExecuteRecharge = () => {
    const val = parseFloat(rechargeAmount);
    if (!val || val <= 0) return;

    sounds.playClick();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      onRecharge(val);
      sounds.playRecharge();

      // Boom! sound and visual explosion
      try {
        // Play a sharp alarm sound
        sounds.playAlarm();
        // Larger, more vibrant confetti burst
        confetti({
          particleCount: 180,
          spread: 120,
          startVelocity: 45,
          decay: 0.9,
          origin: { y: 0.6 },
          colors: ['#ff595e', '#ffca3a', '#8ac926', '#1982c4'],
        });
      } catch {}

      // Add to transactions
      const newTx: Transaction = {
        id: 'tx-' + Date.now(),
        time: 'Just now',
        amount: val,
        type: 'credit',
        description: `Instant UPI Top-up (${selectedUPIApp.toUpperCase()} #${Math.floor(100000 + Math.random() * 900000)})`,
        balance: walletBalance + val,
        hash: '0x' + Math.random().toString(16).substring(2, 8) + '...' + Math.random().toString(16).substring(2, 6),
      };

      setTransactions(prev => [newTx, ...prev]);
      setShowRecharge(false);
    }, 1200);
  };

  const copyHash = (hash: string) => {
    sounds.playClick();
    navigator.clipboard?.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { sounds.playClick(); onNavigate('consumer'); }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            isDark
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
              : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'hi' ? 'डैशबोर्ड पर वापस' : 'Back to Dashboard'}</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>NABL METER ACCREDITED</span>
        </div>
      </div>

      {/* Holographic High-Tech Prepaid Card */}
      <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-2xl transition-all ${
        isDark
          ? 'bg-gradient-to-tr from-slate-950 via-emerald-950 to-slate-900 border border-emerald-500/40 glow-emerald'
          : 'bg-gradient-to-tr from-emerald-800 via-teal-700 to-emerald-900 border border-emerald-400/50 shadow-emerald-900/30'
      }`}>
        {/* Shimmer overlay */}
        <div className="absolute inset-0 laser-shimmer opacity-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-48 sm:h-56">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 rounded-md bg-amber-400/30 border border-amber-300/50 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <p className="text-xs uppercase font-mono tracking-widest text-emerald-200 font-bold">
                  SolarSync Smart Prepaid
                </p>
                <p className="text-[10px] text-emerald-300/70 font-mono">
                  AC-43A • METER ID: ESP32-PZEM-01
                </p>
              </div>
            </div>

            <span className="text-xl sm:text-2xl font-extrabold tracking-tighter bg-gradient-to-r from-amber-300 to-emerald-300 bg-clip-text text-transparent">
              SOLAR•SYNC
            </span>
          </div>

          <div>
            <p className="text-xs text-emerald-200 uppercase font-medium">
              {lang === 'hi' ? 'वर्तमान प्रीपेड शेष राशि' : 'Available Prepaid Balance'}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                ₹{walletBalance.toFixed(2)}
              </span>
              <span className="text-xs font-mono text-emerald-300 font-semibold">INR</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
            <div className="font-mono text-[11px] text-emerald-200/90 tracking-widest">
              •••• •••• •••• 9812
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-semibold text-emerald-200">
                {lang === 'hi' ? 'सक्रिय मीटर सिंक्रनाइज़' : 'IoT Live Synced'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => { sounds.playClick(); setShowRecharge(!showRecharge); }}
          className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 transition-all active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{lang === 'hi' ? '+ तुरंत UPI से वॉलेट रिचार्ज करें' : '+ Instant UPI Top-up'}</span>
        </button>

        <button
          onClick={() => { sounds.playClick(); alert('Official Tax-Compliant Dispute-Proof Statement downloaded.'); }}
          className={`flex items-center justify-center gap-2 py-4 px-6 rounded-2xl border font-bold text-sm transition-all ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Download className="w-4 h-4 text-teal-500" />
          <span>{lang === 'hi' ? 'ऑडिट स्टेटमेंट डाउनलोड (PDF)' : 'Download Audit Statement (PDF)'}</span>
        </button>
      </div>

      {/* UPI Recharge Modal / Panel */}
      {showRecharge && (
        <div className={`rounded-3xl p-6 sm:p-7 border shadow-xl animate-in ${
          isDark ? 'bg-slate-900/90 border-emerald-500/30' : 'bg-white border-emerald-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-base">
                {lang === 'hi' ? 'त्वरित UPI भुगतान' : 'Instant UPI Gateway'}
              </h3>
            </div>
            <button
              onClick={() => setShowRecharge(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕ {lang === 'hi' ? 'बंद करें' : 'Close'}
            </button>
          </div>

          {/* Quick Amounts */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {quickAmounts.map(amount => (
              <button
                key={amount}
                onClick={() => { sounds.playClick(); setRechargeAmount(amount.toString()); }}
                className={`py-2.5 rounded-xl font-mono text-sm font-bold border transition-all ${
                  rechargeAmount === amount.toString()
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                    : isDark
                    ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                ₹{amount}
              </button>
            ))}
          </div>

          {/* Amount input */}
          <div className="relative mb-5">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400 text-lg">
              ₹
            </span>
            <input
              type="number"
              value={rechargeAmount}
              onChange={(e) => setRechargeAmount(e.target.value)}
              placeholder="Enter custom amount"
              className={`w-full pl-9 pr-4 py-3 rounded-xl font-mono text-lg font-bold border focus:outline-none transition-all ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-600'
              }`}
            />
          </div>

          {/* UPI App Selection */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-slate-400 mb-2">
              {lang === 'hi' ? 'UPI ऐप चुनें:' : 'Select UPI App:'}
            </p>
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
              {[
                { id: 'gpay', name: 'Google Pay', color: 'text-blue-400' },
                { id: 'phonepe', name: 'PhonePe', color: 'text-purple-400' },
                { id: 'paytm', name: 'Paytm UPI', color: 'text-cyan-400' },
                { id: 'bhim', name: 'BHIM UPI', color: 'text-emerald-400' },
              ].map(app => (
                <button
                  key={app.id}
                  onClick={() => { sounds.playClick(); setSelectedUPIApp(app.id as any); }}
                  className={`p-2.5 rounded-xl border transition-all ${
                    selectedUPIApp === app.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-white font-extrabold shadow-sm'
                      : isDark ? 'border-slate-800 bg-slate-950 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  <p className={app.color}>{app.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Execute Recharge Button */}
          <button
            onClick={handleExecuteRecharge}
            disabled={isProcessing}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-base shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <span>{lang === 'hi' ? 'UPI अनुरोध सत्यापित हो रहा है...' : 'Verifying UPI Gateway...'}</span>
            ) : (
              <>
                <span>{lang === 'hi' ? `₹${rechargeAmount} का भुगतान करें →` : `Authorize ₹${rechargeAmount} Payment →`}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Transaction History & Dispute-Proof Audit Log */}
      <div className={`rounded-3xl p-6 border shadow-xl ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold">
              {lang === 'hi' ? 'विवाद-रहित लेन-देन लॉग (Dispute-Proof Ledger)' : 'Dispute-Proof Meter Audit Trail'}
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {lang === 'hi'
                ? 'प्रत्येक यूनिट कटौती NABL कैलिब्रेटेड PZEM मीटर और टाइमस्टैम्प्ड क्रिप्टोग्राफिक हैश से सुरक्षित है'
                : 'Every fractional kilowatt deduction is backed by calibrated PZEM meter readings and SHA-256 hashes'}
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            {transactions.length} Records
          </span>
        </div>

        <div className="space-y-3">
          {transactions.map(tx => (
            <div
              key={tx.id}
              className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                isDark ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  tx.type === 'credit'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>

                <div>
                  <p className="text-xs font-bold">{tx.description}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                    <span>{tx.time}</span>
                    <span>•</span>
                    <button
                      onClick={() => copyHash(tx.hash)}
                      className="hover:text-emerald-400 flex items-center gap-1"
                      title="Copy cryptographic proof hash"
                    >
                      <span>HASH: {tx.hash}</span>
                      {copiedHash === tx.hash ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-right sm:self-center">
                <p className={`font-mono font-extrabold text-sm ${
                  tx.type === 'credit' ? 'text-emerald-400' : 'text-slate-300'
                }`}>
                  {tx.type === 'credit' ? `+₹${tx.amount.toFixed(2)}` : `-₹${tx.amount.toFixed(2)}`}
                </p>
                <p className="text-[10px] font-mono text-slate-400">
                  Bal: ₹{tx.balance.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
