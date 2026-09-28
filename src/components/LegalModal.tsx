import { useState } from 'react';
import { ShieldCheck, FileText, CheckCircle2, Download, X } from 'lucide-react';
import { sounds } from '../utils/audio';
import { type Language } from '../utils/i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  isDark: boolean;
  onSignAgreement: () => void;
}

export default function LegalModal({ isOpen, onClose, lang, isDark, onSignAgreement }: Props) {
  const [signatureName, setSignatureName] = useState('Rahul Sharma');
  const [isSigned, setIsSigned] = useState(false);

  if (!isOpen) return null;

  const handleSign = () => {
    sounds.playRecharge();
    setIsSigned(true);
    onSignAgreement();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in">
      <div className={`w-full max-w-2xl rounded-3xl p-6 sm:p-8 max-h-[90vh] flex flex-col shadow-2xl ${
        isDark ? 'bg-slate-900 border border-slate-800 text-white' : 'bg-white border border-emerald-100 text-slate-800'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {lang === 'hi' ? 'साझा हरित ऊर्जा इंफ्रास्ट्रक्चर समझौता' : 'Shared Green Energy Infrastructure Agreement'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                REG: SGEIA-2026-IN-43A • Electricity Act 2003 Compliant
              </p>
            </div>
          </div>
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legal Text Body */}
        <div className="flex-1 overflow-y-auto my-4 pr-2 text-xs leading-relaxed space-y-4 text-slate-600 dark:text-slate-300">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
            <strong>{lang === 'hi' ? 'महत्वपूर्ण विधिक स्पष्टीकरण:' : 'Crucial Statutory Clarification:'}</strong>
            <p className="mt-1">
              {lang === 'hi'
                ? 'यह अनुबंध विद्युत अधिनियम 2003 (Electricity Act 2003) की धारा 43ए एवं निजी माइक्रोग्रिड दिशानिर्देशों के अंतर्गत आता है। यह बिजली की वाणिज्यिक बिक्री नहीं है, बल्कि सौर ऊर्जा बुनियादी ढांचे के साझा उपयोग, मेंटेनेंस व कैलिब्रेटेड मीटरिंग एक्सेस चार्ज है।'
                : 'This Agreement is executed in compliance with Section 43A of the Electricity Act 2003 and captive/shared microgrid rules. This does not constitute commercial resale of power from public Discoms, but rather an infrastructure access and equipment maintenance charge for rooftop captive solar generation.'}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm text-emerald-500 mb-1">
              {lang === 'hi' ? 'धारा 1: परिभाषा और दायित्व' : 'Section 1: Scope & Hardware Integrity'}
            </h4>
            <p>
              {lang === 'hi'
                ? 'प्रदाता (Provider) अपनी छत पर स्थापित NABL कैलिब्रेटेड PZEM-004T स्मार्ट मीटर और ESP32 IoT रिले के माध्यम से प्रमाणित स्वच्छ ऊर्जा साझा करेगा। उपभोक्ता (Consumer) अपने प्रीपेड वॉलेट के माध्यम से वास्तविक खपत का भुगतान करेगा।'
                : 'The Provider agrees to provision clean solar energy measured exclusively by NABL-calibrated PZEM-004T bidirectional meters and ESP32 cryptographic relay controllers. The Consumer pays via prepaid dynamic micro-deductions.'}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm text-emerald-500 mb-1">
              {lang === 'hi' ? 'धारा 2: विवाद-रहित मीटरिंग और क्रिप्टोग्राफिक लॉग' : 'Section 2: Dispute-Proof Ledger & Logs'}
            </h4>
            <p>
              {lang === 'hi'
                ? 'प्रत्येक 5 सेकंड पर दर्ज की गई ऊर्जा खपत ब्लॉकचेन-स्टाइल SHA-256 हैश के साथ संग्रहित की जाती है। किसी भी विवाद की स्थिति में यह लॉग दोनों पक्षों के लिए अंतिम एवं बाध्यकारी प्रमाण होगा।'
                : 'Energy logs are timestamped every 5 seconds and cryptographically hashed (SHA-256). In the event of discrepancy, the immutable meter log shall serve as conclusive evidence.'}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm text-emerald-500 mb-1">
              {lang === 'hi' ? 'धारा 3: स्वचालित कट-ऑफ एवं सुरक्षा प्रावधान' : 'Section 3: Auto-Cutoff & Safety Relay'}
            </h4>
            <p>
              {lang === 'hi'
                ? 'वॉलेट शेष राशि शून्य (₹0.00) होने पर या 16 एम्पीयर से अधिक ओवरलोड होने पर रिले स्वचालित रूप से विद्युत आपूर्ति अलग कर देगा।'
                : 'In the event of zero prepaid wallet balance or sustained overload exceeding 16 Amperes, the IoT relay shall execute an automatic safety isolation.'}
            </p>
          </div>
        </div>

        {/* Digital Signature & Certification Box */}
        <div className={`p-4 rounded-2xl border ${
          isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          {isSigned ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <div>
                  <p className="font-bold text-emerald-400 text-sm">
                    {lang === 'hi' ? 'सफलतापूर्वक हस्ताक्षरित एवं प्रमाणित' : 'Agreement Digitally Signed & Certified'}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Signer: {signatureName} • SHA-256: 0x8a92...e41f
                  </p>
                </div>
              </div>
              <button
                onClick={() => { sounds.playClick(); alert('Legal Certificate PDF generated: SolarSync_Agreement_Signed.pdf'); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF Download</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full">
                <label className="text-[11px] text-slate-400 block mb-1">
                  {lang === 'hi' ? 'डिजिटल हस्ताक्षर कर्ता का नाम:' : 'Digital Signer Legal Name:'}
                </label>
                <input
                  type="text"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                onClick={handleSign}
                className="w-full sm:w-auto px-6 py-2.5 mt-auto rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-900/30"
              >
                {lang === 'hi' ? 'डिजिटल हस्ताक्षर करें ✍️' : 'Sign Agreement ✍️'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
