import { useState } from 'react';
import { Sliders, TrendingUp, ShieldCheck, Zap, Award, Users, Check, FileCheck, ArrowUpRight } from 'lucide-react';
import { sounds } from '../utils/audio';
import { translations, type Language } from '../utils/i18n';
import LegalModal from './LegalModal';

interface Props {
  lang: Language;
  isDark: boolean;
  currentRate: number;
  onSetRate: (rate: number) => void;
  solarProduction: number;
}

export default function P2PMarketplace({
  lang,
  isDark,
  currentRate,
  onSetRate,
  solarProduction,
}: Props) {
  const t = translations[lang];
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'tariffs' | 'tenants' | 'carbon'>('tariffs');

  // Rate simulator state
  const [simRate, setSimRate] = useState(currentRate);

  const gridRate = 10.20; // Grid Discom baseline tariff
  const savingsPercent = Math.round(((gridRate - simRate) / gridRate) * 100);

  const tenants = [
    { id: '1', name: 'Rahul Sharma', flat: 'Flat 101', priority: 'High (Home Office)', allocation: '45%', rate: `₹${simRate.toFixed(2)}`, status: 'Active' },
    { id: '2', name: 'Priya Verma', flat: 'Flat 102', priority: 'Standard', allocation: '30%', rate: `₹${simRate.toFixed(2)}`, status: 'Active' },
    { id: '3', name: 'Amit Patel', flat: 'Flat 201', priority: 'EV Flex Surplus Only', allocation: '25%', rate: `₹${(simRate * 0.9).toFixed(2)}`, status: 'Standby' },
  ];

  const handleApplyRate = () => {
    sounds.playRecharge();
    onSetRate(simRate);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className={`rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-all ${
        isDark
          ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 shadow-2xl'
          : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl'
      }`}>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            {lang === 'hi' ? 'पीयर-टू-पीयर स्वच्छ ऊर्जा बाज़ार' : 'P2P Clean Energy Marketplace'}
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            {lang === 'hi' ? 'स्थानीय सौर ऊर्जा साझा करें एवं 36% तक बचत करें' : 'Share Rooftop Solar & Save up to 36%'}
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            {lang === 'hi'
              ? 'मकान मालिक और किरायेदारों के बीच बिना किसी बिचौलिये के सीधे हरित ऊर्जा का पारदर्शी आदान-प्रदान।'
              : 'Direct peer-to-peer microgrid trading between rooftop owners and tenants with dynamic tariffs and zero middlemen.'}
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => { sounds.playClick(); setLegalModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold shadow-lg transition-all active:scale-[0.98]"
            >
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'hi' ? 'विधिक अनुबंध देखें (Section 43A)' : 'Legal Agreement (Sec 43A)'}</span>
            </button>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'hi' ? 'NABL प्रमाणित मीटरिंग' : 'NABL Certified Meters'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: 'tariffs', label: lang === 'hi' ? 'डायनामिक टैरिफ नियंत्रक' : 'Dynamic Tariff Controls' },
          { id: 'tenants', label: lang === 'hi' ? 'किरायेदार आवंटन सूची' : 'Tenant Allocation Pool' },
          { id: 'carbon', label: lang === 'hi' ? 'कार्बन क्रेडिट व प्रभाव' : 'ESG & Carbon Credits' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { sounds.playClick(); setActiveTab(tab.id as any); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? isDark
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-600 text-white shadow-md'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Dynamic Tariffs */}
      {activeTab === 'tariffs' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Rate Adjuster Card */}
          <div className={`md:col-span-2 rounded-3xl p-6 transition-all ${
            isDark ? 'bg-slate-900/80 border border-slate-800' : 'bg-white border border-emerald-100 shadow-lg'
          }`}>
            <h3 className="text-base font-bold mb-1">
              {lang === 'hi' ? 'लाइव सोलर यूनिट दर समायोजन' : 'Active Solar Unit Tariff Adjustment'}
            </h3>
            <p className={`text-xs mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {lang === 'hi'
                ? 'ग्रिड दर (₹10.20) से कम रखकर किरायेदारों को आकर्षित करें एवं अधिकतम राजस्व कमाएं।'
                : 'Offer tenants a discount versus the standard discom tariff (₹10.20/kWh) while optimizing roof ROI.'}
            </p>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-400">
                    {lang === 'hi' ? 'सौर दर (₹ / kWh):' : 'Proposed Solar Tariff (₹ / kWh):'}
                  </span>
                  <span className="text-2xl font-extrabold font-mono text-emerald-400">
                    ₹ {simRate.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="4.50"
                  max="9.00"
                  step="0.25"
                  value={simRate}
                  onChange={(e) => setSimRate(parseFloat(e.target.value))}
                  className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>₹4.50 (Ultra-Low)</span>
                  <span>₹6.50 (Recommended)</span>
                  <span>₹9.00 (Near Grid)</span>
                </div>
              </div>

              {/* Tariff Comparison Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">
                    {lang === 'hi' ? 'सरकारी ग्रिड दर' : 'Grid Baseline'}
                  </p>
                  <p className="text-xl font-bold font-mono text-rose-400 mt-1">₹ {gridRate.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{lang === 'hi' ? 'प्रति यूनिट DISCOM दर' : 'Per kWh Discom'}</p>
                </div>

                <div className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <p className="text-[10px] text-emerald-400 uppercase font-semibold">
                    {lang === 'hi' ? 'किरायेदार की बचत' : 'Tenant Savings'}
                  </p>
                  <p className="text-xl font-bold font-mono text-emerald-400 mt-1">{savingsPercent}% OFF</p>
                  <p className="text-[10px] text-emerald-500/80 mt-1">
                    ₹{(gridRate - simRate).toFixed(2)} {lang === 'hi' ? 'बचत प्रति यूनिट' : 'saved / kWh'}
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-amber-950/40 border-amber-500/40' : 'bg-amber-50 border-amber-200'
                }`}>
                  <p className="text-[10px] text-amber-400 uppercase font-semibold">
                    {lang === 'hi' ? 'मासिक अनुमानित आय' : 'Est. Provider Yield'}
                  </p>
                  <p className="text-xl font-bold font-mono text-amber-400 mt-1">
                    ₹ {Math.round(simRate * 380).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-amber-500/80 mt-1">380 kWh {lang === 'hi' ? 'साझा होने पर' : 'shared'}</p>
                </div>
              </div>

              <button
                onClick={handleApplyRate}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 transition-all active:scale-[0.98]"
              >
                {lang === 'hi' ? `दर अपडेट करें: ₹${simRate.toFixed(2)}/kWh →` : `Publish New Rate: ₹${simRate.toFixed(2)}/kWh →`}
              </button>
            </div>
          </div>

          {/* Quick FAQ / Section 43A Info */}
          <div className={`rounded-3xl p-6 flex flex-col justify-between ${
            isDark ? 'bg-slate-900/80 border border-slate-800' : 'bg-white border border-emerald-100 shadow-lg'
          }`}>
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base mb-2">
                {lang === 'hi' ? 'विधिक एवं नियामक सुरक्षा' : 'Regulatory Safe Harbor'}
              </h4>
              <p className={`text-xs leading-relaxed space-y-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {lang === 'hi' ? (
                  <>
                    • विद्युत अधिनियम 2003 की धारा 43A के अनुरूप कैप्टिव माइक्रोग्रिड साझाकरण पूर्णतः मान्य है।
                    <br /><br />
                    • सभी किरायेदार डिजिटल समझौते पर हस्ताक्षर करते हैं जिससे किसी भी डिस्कॉम विवाद से 100% सुरक्षा मिलती है।
                  </>
                ) : (
                  <>
                    • Captive microgrid energy sharing is fully recognized under Section 43A of the Indian Electricity Act 2003.
                    <br /><br />
                    • Every tenant signs a digital infrastructure access agreement preventing commercial resale disputes.
                  </>
                )}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> 100% DISCOM COMPLIANT
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tenant Pool */}
      {activeTab === 'tenants' && (
        <div className={`rounded-3xl p-6 ${
          isDark ? 'bg-slate-900/80 border border-slate-800' : 'bg-white border border-emerald-100 shadow-lg'
        }`}>
          <h3 className="text-base font-bold mb-4">
            {lang === 'hi' ? 'संबद्ध किरायेदार एवं प्राथमिकता आवंटन' : 'Connected Tenants & Priority Load Queues'}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className={`uppercase text-[10px] tracking-wider border-b ${
                isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
              }`}>
                <tr>
                  <th className="py-3 px-3">Flat / Tenant</th>
                  <th className="py-3 px-3">Priority Class</th>
                  <th className="py-3 px-3">Solar Quota</th>
                  <th className="py-3 px-3">Current Tariff</th>
                  <th className="py-3 px-3">Relay Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-slate-800/20">
                    <td className="py-3 px-3 font-semibold">
                      <p>{tenant.name}</p>
                      <span className="text-[10px] text-slate-400">{tenant.flat}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-teal-400">{tenant.priority}</td>
                    <td className="py-3 px-3 font-mono">{tenant.allocation}</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">{tenant.rate}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                        {tenant.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Carbon & ESG */}
      {activeTab === 'carbon' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className={`p-6 rounded-3xl border text-center ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <Award className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="text-3xl font-extrabold font-mono text-emerald-400">482 kg</p>
            <p className="text-xs font-semibold text-slate-400 mt-1">CO₂ Emissions Avoided</p>
            <p className="text-[11px] text-slate-500 mt-2">Verified against CEA carbon grid factor</p>
          </div>

          <div className={`p-6 rounded-3xl border text-center ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <Award className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <p className="text-3xl font-extrabold font-mono text-amber-400">22 Trees</p>
            <p className="text-xs font-semibold text-slate-400 mt-1">Carbon Offset Equivalent</p>
            <p className="text-[11px] text-slate-500 mt-2">Annualized forest absorption metric</p>
          </div>

          <div className={`p-6 rounded-3xl border text-center ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <Award className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
            <p className="text-3xl font-extrabold font-mono text-cyan-400">1,420 kWh</p>
            <p className="text-xs font-semibold text-slate-400 mt-1">Clean Solar Energy Shared</p>
            <p className="text-[11px] text-slate-500 mt-2">100% captive rooftop generation</p>
          </div>
        </div>
      )}

      {/* Legal Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        lang={lang}
        isDark={isDark}
        onSignAgreement={() => setLegalModalOpen(false)}
      />
    </div>
  );
}
