import { useState } from 'react';
import { Sun, Zap, Shield, Wallet, ArrowRight, CheckCircle2, FileText, Sparkles, Globe } from 'lucide-react';
import type { UserRole as Role } from '../types/auth';
import { sounds } from '../utils/audio';
import { translations, type Language } from '../utils/i18n';
import LegalModal from './LegalModal';

interface Props {
  onConsent: (role: Role) => void;
  lang: Language;
  onToggleLang: () => void;
  isDark: boolean;
}

export default function OnboardingScreen({ onConsent, lang, onToggleLang, isDark }: Props) {
  const t = translations[lang];
  const [agreed, setAgreed] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>('consumer');
  const [legalModalOpen, setLegalModalOpen] = useState(false);

  const handleRoleSelect = (role: Role) => {
    sounds.playClick();
    setSelectedRole(role);
  };

  const handleProceed = () => {
    if (!agreed) return;
    sounds.playRecharge();
    onConsent(selectedRole);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between p-4 sm:p-8 transition-colors ${
      isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Top Header with Language & App Badge */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Sun className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '24s' }} />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              {t.appName}
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">
              P2P SOLAR ENERGY SHARING
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

      {/* Main Center Content */}
      <div className="max-w-xl mx-auto w-full my-auto py-6 space-y-6">
        {/* Hero Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>NABL CALIBRATED • SECTION 43A COMPLIANT</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {lang === 'hi' ? (
              <>
                स्वच्छ ऊर्जा, <br />
                <span className="bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  पारदर्शी साझाकरण
                </span>
              </>
            ) : (
              <>
                Clean Solar Energy, <br />
                <span className="bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Zero Middlemen
                </span>
              </>
            )}
          </h2>

          <p className={`text-xs sm:text-sm max-w-md mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {lang === 'hi'
              ? 'मकान मालिक की छत से अतिरिक्त सौर ऊर्जा सीधे किरायेदार तक। प्रति-सेकंड पारदर्शी मीटरिंग और ऑटो-कटऑफ सुरक्षा।'
              : 'Direct peer-to-peer clean solar microgrid for landlords & tenants. Micro-prepaid wallet, real-time IoT relay, and certified dispute-proof ledger.'}
          </p>
        </div>

        {/* 3 Value Pillars */}
        <div className="space-y-2.5">
          {[
            {
              icon: <Wallet className="w-5 h-5 text-emerald-400" />,
              title: lang === 'hi' ? '1. आसान UPI प्रीपेड वॉलेट' : '1. Instant UPI Prepaid Wallet',
              desc: lang === 'hi' ? 'शून्य बिल विवाद। जितना इस्तेमाल करें केवल उतना ही भुगतान।' : 'Zero monthly surprises. Per-second micro-deductions with auto-cutoff at ₹0.',
            },
            {
              icon: <Zap className="w-5 h-5 text-amber-400" />,
              title: lang === 'hi' ? '2. लाइव ऊर्जा ट्रैकिंग एवं बचत' : '2. Real-time Energy Monitoring',
              desc: lang === 'hi' ? 'सरकारी ग्रिड दर (₹10.20) से 36% तक की सीधी मासिक बचत।' : 'Save up to 36% compared to standard discom tariffs.',
            },
            {
              icon: <Shield className="w-5 h-5 text-teal-400" />,
              title: lang === 'hi' ? '3. 100% विधिक एवं सुरक्षित हार्डवेयर' : '3. 100% Certified Hardware & Legal Safe Harbor',
              desc: lang === 'hi' ? 'विद्युत अधिनियम 2003 (धारा 43A) व NABL-कैलिब्रेटेड PZEM मीटर।' : 'Section 43A compliant captive microgrid with SHA-256 dispute-proof hashes.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-3.5 sm:p-4 rounded-2xl border flex items-center gap-3.5 transition-all ${
                isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-slate-800/80 shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold">{item.title}</p>
                <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Role Selection */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {lang === 'hi' ? 'आपकी भूमिका चुनें:' : 'Select Your Operating Role:'}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleRoleSelect('consumer')}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                selectedRole === 'consumer'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-950/40'
                  : isDark ? 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700' : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-sm flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  {t.consumer}
                </span>
                {selectedRole === 'consumer' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-[11px] opacity-80">
                {lang === 'hi' ? 'फ्लैट किरायेदार • सौर बिजली उपभोग' : 'Tenant Flat • Consume Solar Power'}
              </p>
            </button>

            <button
              onClick={() => handleRoleSelect('provider')}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                selectedRole === 'provider'
                  ? 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-lg shadow-amber-950/40'
                  : isDark ? 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700' : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-sm flex items-center gap-1.5">
                  <Sun className="w-4 h-4" />
                  {t.provider}
                </span>
                {selectedRole === 'provider' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
              </div>
              <p className="text-[11px] opacity-80">
                {lang === 'hi' ? 'मकान मालिक • अतिरिक्त सौर साझाकरण' : 'Rooftop Owner • Share Excess Solar'}
              </p>
            </button>
          </div>
        </div>

        {/* Legal Consent Checkbox Card */}
        <div className={`p-4 rounded-2xl border space-y-2 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => { sounds.playClick(); setAgreed(e.target.checked); }}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-700 bg-slate-800"
            />
            <span className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {lang === 'hi' ? (
                <>
                  मैं <strong>'साझा हरित ऊर्जा इंफ्रास्ट्रक्चर समझौते'</strong> (Shared Green Energy Infrastructure Agreement) की शर्तों से सहमत हूँ। मैं समझता हूँ कि यह मेंटेनेंस एवं एक्सेस चार्ज है (विद्युत अधिनियम 2003, धारा 43A)।
                </>
              ) : (
                <>
                  I consent to the <strong>'Shared Green Energy Infrastructure Agreement'</strong> under Section 43A of the Indian Electricity Act 2003 as an equipment access & maintenance agreement.
                </>
              )}
            </span>
          </label>

          <button
            onClick={() => { sounds.playClick(); setLegalModalOpen(true); }}
            className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 ml-7"
          >
            <FileText className="w-3 h-3" />
            <span>{lang === 'hi' ? 'पूरा कानूनी अनुबंध पढ़ें एवं हस्ताक्षर करें →' : 'Review & Sign Legal Agreement →'}</span>
          </button>
        </div>

        {/* Enter App Button */}
        <button
          onClick={handleProceed}
          disabled={!agreed}
          className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all active:scale-[0.98] ${
            agreed
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:brightness-110 text-white shadow-emerald-950/50 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
          }`}
        >
          <span>
            {agreed
              ? lang === 'hi' ? `आगे बढ़ें (${selectedRole === 'consumer' ? 'उपभोक्ता' : 'प्रदाता'}) →` : `Launch Workspace (${selectedRole === 'consumer' ? 'Consumer' : 'Provider'}) →`
              : lang === 'hi' ? 'कृपया नियम व शर्तों से सहमत हों' : 'Please Agree to Terms to Continue'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto w-full pt-6 border-t border-slate-200 dark:border-slate-800/80 text-center">
        <p className="text-[11px] text-slate-400">
          SolarSync • Built with ☀️ for a Sustainable Decentralized Future • Indian Microgrid Protocol v2.4
        </p>
      </div>

      {/* Legal Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        lang={lang}
        isDark={isDark}
        onSignAgreement={() => {
          setAgreed(true);
          setLegalModalOpen(false);
        }}
      />
    </div>
  );
}
