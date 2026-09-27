import { useState, useEffect } from 'react';
import type { Screen } from '../App';

interface Props {
  onNavigate: (screen: Screen) => void;
  onRoleSwitch: () => void;
}

interface Consumer {
  id: string;
  name: string;
  flat: string;
  active: boolean;
  load: number;
  todayEarning: number;
}

export default function ProviderDashboard({ onNavigate, onRoleSwitch }: Props) {
  const [solarProduction, setSolarProduction] = useState(1200);
  const [homeUsage, setHomeUsage] = useState(400);
  const [totalEarned] = useState(2150);
  const [consumers, setConsumers] = useState<Consumer[]>([
    { id: '1', name: 'उपयोगकर्ता A', flat: 'Flat 101', active: true, load: 450, todayEarning: 45 },
    { id: '2', name: 'उपयोगकर्ता B', flat: 'Flat 102', active: false, load: 0, todayEarning: 12 },
    { id: '3', name: 'उपयोगकर्ता C', flat: 'Flat 201', active: true, load: 320, todayEarning: 28 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSolarProduction(1100 + Math.floor(Math.random() * 200));
      setHomeUsage(350 + Math.floor(Math.random() * 100));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const exportAvailable = solarProduction - homeUsage;
  const activeConsumers = consumers.filter(c => c.active).length;

  const toggleConsumer = (id: string) => {
    setConsumers(prev => prev.map(c =>
      c.id === id ? { ...c, active: !c.active, load: c.active ? 0 : 300 + Math.floor(Math.random() * 200) } : c
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Navigation */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center">
            <span className="text-lg">☀️</span>
          </div>
          <div>
            <p className="text-xs text-gray-500">प्रदाता डैशबोर्ड</p>
            <p className="text-sm font-medium text-gray-800">सूरज गुप्ता</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
          <p className="text-xs text-amber-600">इस माह की कमाई</p>
          <p className="text-sm font-bold text-amber-800 font-mono">₹ {totalEarned.toLocaleString()}</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Solar Status Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-sm border border-amber-100 p-5">
          <h3 className="text-sm font-semibold text-amber-800 mb-4 flex items-center gap-2">
            <span>☀️</span> सोलर स्थिति
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/80 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">उत्पादन</p>
              <p className="text-xl font-bold text-amber-700 font-mono">{solarProduction}</p>
              <p className="text-xs text-gray-400">Watts</p>
            </div>
            <div className="bg-white/80 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">घरेलू उपयोग</p>
              <p className="text-xl font-bold text-blue-700 font-mono">{homeUsage}</p>
              <p className="text-xs text-gray-400">Watts</p>
            </div>
            <div className="bg-white/80 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">निर्यात उपलब्ध</p>
              <p className="text-xl font-bold text-green-700 font-mono">{exportAvailable}</p>
              <p className="text-xs text-gray-400">Watts</p>
            </div>
          </div>

          {/* Visual Energy Flow */}
          <div className="mt-4 bg-white/60 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
              <span>☀️ सोलर पैनल</span>
              <span>→</span>
              <span>🏠 घर</span>
              <span>→</span>
              <span>🔌 उपभोक्ता</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div className="h-full flex">
                <div className="bg-blue-400" style={{ width: `${(homeUsage / solarProduction) * 100}%` }}></div>
                <div className="bg-green-500" style={{ width: `${(exportAvailable / solarProduction) * 100}%` }}></div>
              </div>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-blue-600">घरेलू ({Math.round((homeUsage / solarProduction) * 100)}%)</span>
              <span className="text-green-600">निर्यात ({Math.round((exportAvailable / solarProduction) * 100)}%)</span>
            </div>
          </div>
        </div>

        {/* Connected Consumers */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-between">
            <span>सक्रिय कनेक्शन ({activeConsumers}/{consumers.length})</span>
            <span className="text-xs font-normal text-gray-400">आज की कुल कमाई: ₹{consumers.reduce((a, c) => a + c.todayEarning, 0)}</span>
          </h3>

          <div className="space-y-3">
            {consumers.map((consumer) => (
              <div key={consumer.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👤</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{consumer.name}</p>
                      <p className="text-xs text-gray-500">{consumer.flat}</p>
                    </div>
                  </div>
                  {/* Toggle Switch */}
                  <button
                    onClick={() => toggleConsumer(consumer.id)}
                    className={`relative w-12 h-6 rounded-full transition-all ${
                      consumer.active ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                      consumer.active ? 'left-6' : 'left-0.5'
                    }`}></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                      consumer.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${consumer.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {consumer.active ? 'सक्रिय' : 'रोका गया'}
                    </span>
                    <span className="text-xs text-gray-500">लोड: {consumer.load}W</span>
                  </div>
                  <p className="text-sm font-bold text-green-700 font-mono">₹{consumer.todayEarning}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">आज का प्रदर्शन</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-green-700 font-mono">12.5</p>
              <p className="text-xs text-gray-500">कुल Units निर्यात</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-amber-700 font-mono">₹85</p>
              <p className="text-xs text-gray-500">आज की कमाई</p>
            </div>
          </div>
        </div>

        {/* Role Switch & Setup Guide */}
        <div className="flex gap-2">
          <button
            onClick={onRoleSwitch}
            className="flex-1 py-3 rounded-xl border-2 border-green-200 text-green-700 font-medium text-sm hover:bg-green-50 transition-all"
          >
            🔄 उपभोक्ता डैशबोर्ड
          </button>
          <button
            onClick={() => onNavigate('setup')}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-all"
          >
            🛠️ Dev Guide
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 flex justify-around">
        <button className="flex flex-col items-center py-1 text-green-700">
          <span className="text-xl">🏠</span>
          <span className="text-xs font-medium">होम</span>
        </button>
        <button className="flex flex-col items-center py-1 text-gray-400 hover:text-green-700">
          <span className="text-xl">📊</span>
          <span className="text-xs">रिपोर्ट</span>
        </button>
        <button className="flex flex-col items-center py-1 text-gray-400 hover:text-green-700">
          <span className="text-xl">⚙️</span>
          <span className="text-xs">सेटिंग्स</span>
        </button>
      </div>
    </div>
  );
}
