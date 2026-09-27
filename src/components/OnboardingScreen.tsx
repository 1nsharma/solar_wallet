import { useState } from 'react';
import type { Role } from '../App';

interface Props {
  onConsent: (role: Role) => void;
}

export default function OnboardingScreen({ onConsent }: Props) {
  const [agreed, setAgreed] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>('consumer');

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Logo */}
        <div className="w-20 h-20 bg-green-700 rounded-full flex items-center justify-center mb-4 shadow-lg">
          <span className="text-4xl">☀️</span>
        </div>
        <h1 className="text-3xl font-bold text-green-800 mb-1">SolarSync</h1>
        <p className="text-green-600 text-center text-sm mb-8">
          स्वच्छ ऊर्जा, पारदर्शी साझाकरण
        </p>

        {/* Steps */}
        <div className="w-full max-w-sm space-y-4 mb-8">
          <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-green-100">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-xl">💰</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">1. वॉलेट रिचार्ज करें</p>
              <p className="text-xs text-gray-500">UPI से आसान रिचार्ज</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-green-100">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-xl">💡</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">2. वास्तविक समय में ऊर्जा उपयोग करें</p>
              <p className="text-xs text-gray-500">लाइव खपत और बचत देखें</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-green-100">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-xl">🛡️</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">3. 100% सुरक्षित और प्रमाणित मीटरिंग</p>
              <p className="text-xs text-gray-500">NABL-कैलिब्रेटेड सेंसर</p>
            </div>
          </div>
        </div>

        {/* Role Selection */}
        <div className="w-full max-w-sm mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">आपकी भूमिका चुनें:</p>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedRole('consumer')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium border-2 transition-all ${
                selectedRole === 'consumer'
                  ? 'border-green-700 bg-green-50 text-green-800'
                  : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              🔌 उपभोक्ता
            </button>
            <button
              onClick={() => setSelectedRole('provider')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium border-2 transition-all ${
                selectedRole === 'provider'
                  ? 'border-green-700 bg-green-50 text-green-800'
                  : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              ☀️ प्रदाता
            </button>
          </div>
        </div>

        {/* Agreement Checkbox */}
        <div className="w-full max-w-sm bg-white rounded-xl p-4 shadow-sm border border-green-100 mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-green-300 text-green-700 focus:ring-green-500"
            />
            <span className="text-xs text-gray-600 leading-relaxed">
              मैं <strong>'साझा हरित ऊर्जा इंफ्रास्ट्रक्चर समझौते'</strong> (Shared Green Energy Infrastructure Agreement) की शर्तों से सहमत हूँ। मैं समझता हूँ कि यह मेंटेनेंस एवं एक्सेस चार्ज है, न कि पारंपरिक बिजली बिक्री।
            </span>
          </label>
          <button className="text-xs text-green-700 underline mt-2 ml-8">
            पूरा समझौता पढ़ें →
          </button>
        </div>
      </div>

      {/* Footer Button */}
      <div className="px-6 pb-8">
        <button
          onClick={() => onConsent(selectedRole)}
          disabled={!agreed}
          className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all ${
            agreed
              ? 'bg-green-700 hover:bg-green-800 active:scale-[0.98]'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {agreed ? 'सहमत हूँ और आगे बढ़ें →' : 'कृपया समझौते से सहमत हों'}
        </button>
      </div>
    </div>
  );
}
