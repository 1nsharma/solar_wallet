import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { sounds } from '../utils/audio';
import { type Language } from '../utils/i18n';
import type { User } from '../types/auth';

interface Props {
  user: User;
  onBack: () => void;
  lang: Language;
  isDark: boolean;
}

export default function AccessDenied({ user, onBack, lang, isDark }: Props) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className={`max-w-md w-full rounded-3xl p-8 text-center border shadow-2xl animate-in ${
        isDark ? 'bg-slate-900 border-rose-500/30' : 'bg-white border-rose-200'
      }`}>
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
          403 FORBIDDEN • RBAC ENFORCED
        </span>

        <h2 className="text-2xl font-black mt-3">
          {lang === 'hi' ? 'पहुंच अस्वीकृत (Access Denied)' : 'Unauthorized Access'}
        </h2>

        <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {lang === 'hi'
            ? `आप "${user.name}" (${user.role === 'consumer' ? 'उपभोक्ता' : 'प्रदाता'}) के रूप में लॉग इन हैं। आपके खाते के पास इस सेक्शन का प्रशासनिक अधिकार नहीं है।`
            : `You are logged in as "${user.name}" with the role of "${user.role.toUpperCase()}". Your account does not possess provider administrative privileges.`}
        </p>

        <div className={`my-5 p-3 rounded-xl text-left text-xs border ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-bold">Security Policy:</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Consumers are strictly isolated to their own flat meter & prepaid wallet. Provider controls are restricted to verified rooftop solar system owners.
          </p>
        </div>

        <button
          onClick={() => { sounds.playClick(); onBack(); }}
          className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'hi' ? 'अपने अधिकृत डैशबोर्ड पर वापस जाएं' : 'Return to Authorized Dashboard'}</span>
        </button>
      </div>
    </div>
  );
}
