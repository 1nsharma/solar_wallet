import { useState, useEffect } from 'react';
import type { Screen } from '../App';

interface Props {
  walletBalance: number;
  isSupplyActive: boolean;
  onToggleSupply: () => void;
  onNavigate: (screen: Screen) => void;
  onRoleSwitch: () => void;
}

export default function ConsumerDashboard({ walletBalance, isSupplyActive, onToggleSupply, onNavigate, onRoleSwitch }: Props) {
  const [currentLoad, setCurrentLoad] = useState(450);
  const [currentRate, setCurrentRate] = useState(6.50);
  const [showAlert, setShowAlert] = useState(true);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => t + 1);
      // Simulate load fluctuation
      setCurrentLoad(400 + Math.floor(Math.random() * 100));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const deductionPerSecond = (currentLoad / 1000) * (currentRate / 3600);
  const remainingMinutes = walletBalance > 0 ? Math.floor(walletBalance / (deductionPerSecond * 60)) : 0;
  const remainingHours = Math.floor(remainingMinutes / 60);
  const remainingMins = remainingMinutes % 60;
  const progressPercent = Math.min((remainingMinutes / 300) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Navigation */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-lg">👤</span>
          </div>
          <div>
            <p className="text-xs text-gray-500">उपभोक्ता डैशबोर्ड</p>
            <p className="text-sm font-medium text-gray-800">राहुल शर्मा</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
            <p className="text-xs text-green-600">वॉलेट</p>
            <p className="text-sm font-bold text-green-800 font-mono">₹ {walletBalance.toFixed(2)}</p>
          </div>
          <button
            onClick={() => onNavigate('wallet')}
            className="w-9 h-9 bg-green-700 rounded-full flex items-center justify-center text-white text-lg shadow"
          >
            +
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Live Status Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${isSupplyActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className={`text-sm font-semibold ${isSupplyActive ? 'text-green-700' : 'text-red-700'}`}>
              {isSupplyActive ? '🟢 सक्रिय आपूर्ति (Active Supply)' : '🔴 आपूर्ति बंद (Disconnected)'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">वर्तमान लोड</p>
              <p className="text-2xl font-bold text-gray-800 font-mono">{currentLoad} <span className="text-sm font-normal text-gray-500">W</span></p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">वर्तमान दर</p>
              <p className="text-2xl font-bold text-gray-800 font-mono">₹{currentRate.toFixed(2)} <span className="text-sm font-normal text-gray-500">/Unit</span></p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 mb-4">
            <p className="text-xs text-gray-500 mb-1">कटौती दर</p>
            <p className="text-lg font-bold text-red-600 font-mono">-₹ {deductionPerSecond.toFixed(4)} / सेकंड</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs text-gray-500">वॉलेट शेष अनुमान</p>
              <p className="text-xs font-medium text-gray-700">
                {remainingHours > 0 ? `${remainingHours} घं ${remainingMins} मि` : `${remainingMins} मिनट`}
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-1000 ${
                  progressPercent > 50 ? 'bg-green-500' : progressPercent > 20 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              वर्तमान खपत पर वॉलेट {remainingHours > 0 ? `${remainingHours} घंटे ${remainingMins} मिनट` : `${remainingMins} मिनट`} में समाप्त होगा।
            </p>
          </div>
        </div>

        {/* Dynamic Pricing Alert */}
        {showAlert && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">डायनामिक प्राइसिंग सूचना</p>
              <p className="text-xs text-amber-700 mt-1">
                अगले 30 मिनट में नेटवर्क लोड अधिक होने के कारण दर ₹8.00/Unit हो जाएगी।
              </p>
            </div>
            <button onClick={() => setShowAlert(false)} className="text-amber-600 text-lg">×</button>
          </div>
        )}

        {/* Supply Pause Button */}
        <button
          onClick={onToggleSupply}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] ${
            isSupplyActive
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200'
              : 'bg-green-700 hover:bg-green-800 text-white shadow-lg shadow-green-200'
          }`}
        >
          {isSupplyActive ? '⏸ आपूर्ति अस्थायी रूप से रोकें' : '▶ आपूर्ति पुनः प्रारंभ करें'}
        </button>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">आज का सारांश</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-lg font-bold text-green-700 font-mono">4.2</p>
              <p className="text-xs text-gray-500">Units उपभोग</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-700 font-mono">₹27.30</p>
              <p className="text-xs text-gray-500">आज का खर्च</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-purple-700 font-mono">6.5</p>
              <p className="text-xs text-gray-500">औसत दर</p>
            </div>
          </div>
        </div>

        {/* Role Switch */}
        <button
          onClick={onRoleSwitch}
          className="w-full py-3 rounded-xl border-2 border-green-200 text-green-700 font-medium text-sm hover:bg-green-50 transition-all"
        >
          🔄 प्रदाता डैशबोर्ड देखें
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 flex justify-around">
        <button className="flex flex-col items-center py-1 text-green-700">
          <span className="text-xl">🏠</span>
          <span className="text-xs font-medium">होम</span>
        </button>
        <button onClick={() => onNavigate('wallet')} className="flex flex-col items-center py-1 text-gray-400 hover:text-green-700">
          <span className="text-xl">📊</span>
          <span className="text-xs">इतिहास</span>
        </button>
        <button className="flex flex-col items-center py-1 text-gray-400 hover:text-green-700">
          <span className="text-xl">🎧</span>
          <span className="text-xs">सहायता</span>
        </button>
      </div>
    </div>
  );
}
