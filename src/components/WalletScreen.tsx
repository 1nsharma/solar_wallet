import { useState } from 'react';
import type { Screen } from '../App';

interface Props {
  walletBalance: number;
  onNavigate: (screen: Screen) => void;
}

interface Transaction {
  id: string;
  time: string;
  amount: number;
  type: 'debit' | 'credit';
  description: string;
  balance: number;
}

export default function WalletScreen({ walletBalance, onNavigate }: Props) {
  const [showRecharge, setShowRecharge] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');

  const transactions: Transaction[] = [
    { id: '1', time: '14:30', amount: 2.15, type: 'debit', description: '0.33 Units @ ₹6.50', balance: 345.50 },
    { id: '2', time: '14:00', amount: 1.95, type: 'debit', description: '0.30 Units @ ₹6.50', balance: 347.65 },
    { id: '3', time: '13:30', amount: 2.60, type: 'debit', description: '0.40 Units @ ₹6.50', balance: 349.60 },
    { id: '4', time: '13:00', amount: 1.63, type: 'debit', description: '0.25 Units @ ₹6.50', balance: 352.20 },
    { id: '5', time: '12:30', amount: 3.25, type: 'debit', description: '0.50 Units @ ₹6.50', balance: 353.83 },
    { id: '6', time: '10:00', amount: 500.00, type: 'credit', description: 'UPI रिचार्ज (सफल)', balance: 500.00 },
    { id: '7', time: '09:15', amount: 2.15, type: 'debit', description: '0.33 Units @ ₹6.50', balance: 0.00 },
  ];

  const quickAmounts = [100, 200, 500, 1000];

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Top Navigation */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => onNavigate('consumer')} className="text-gray-600 hover:text-gray-800">
          <span className="text-xl">←</span>
        </button>
        <h1 className="text-lg font-bold text-gray-800">लेन-देन और पारदर्शिता</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Wallet Summary Card */}
        <div className="bg-gradient-to-br from-green-700 to-green-900 rounded-2xl shadow-lg p-6 text-white">
          <p className="text-sm text-green-200 mb-1">वर्तमान शेष राशि</p>
          <p className="text-4xl font-bold font-mono mb-4">₹ {walletBalance.toFixed(2)}</p>
          <button
            onClick={() => setShowRecharge(!showRecharge)}
            className="w-full bg-white text-green-800 font-bold py-3 rounded-xl hover:bg-green-50 transition-all active:scale-[0.98]"
          >
            + वॉलेट में धन जोड़ें (UPI)
          </button>
        </div>

        {/* Recharge Modal */}
        {showRecharge && (
          <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-5 animate-in">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">UPI रिचार्ज</h3>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {quickAmounts.map(amount => (
                <button
                  key={amount}
                  onClick={() => setRechargeAmount(amount.toString())}
                  className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                    rechargeAmount === amount.toString()
                      ? 'border-green-700 bg-green-50 text-green-800'
                      : 'border-gray-200 text-gray-600 hover:border-green-300'
                  }`}
                >
                  ₹{amount}
                </button>
              ))}
            </div>
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
              <input
                type="number"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(e.target.value)}
                placeholder="राशि दर्ज करें"
                className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-lg font-mono focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>
            <button className="w-full bg-green-700 text-white font-bold py-3 rounded-xl hover:bg-green-800 transition-all">
              UPI से भुगतान करें →
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">
              GPay | PhonePe | Paytm | किसी भी UPI ऐप से
            </p>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center justify-between">
            <span>पिछले 24 घंटे</span>
            <span className="text-xs font-normal text-gray-400">{transactions.length} लेन-देन</span>
          </h3>

          <div className="space-y-0">
            {transactions.map((tx, index) => (
              <div key={tx.id}>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'credit' ? 'bg-green-100' : 'bg-red-50'
                    }`}>
                      <span className={`text-sm font-bold ${
                        tx.type === 'credit' ? 'text-green-700' : 'text-red-600'
                      }`}>
                        {tx.type === 'credit' ? '+' : '-'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">{tx.description}</p>
                      <p className="text-xs text-gray-400">{tx.time} बजे</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold font-mono ${
                      tx.type === 'credit' ? 'text-green-700' : 'text-red-600'
                    }`}>
                      {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">शेष: ₹{tx.balance.toFixed(2)}</p>
                  </div>
                </div>
                {index < transactions.length - 1 && <div className="border-b border-gray-100"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Trust & Compliance */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">🛡️ विश्वास और अनुपालन</h3>
          
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between bg-blue-50 rounded-xl p-4 border border-blue-100 hover:bg-blue-100 transition-all">
              <div className="flex items-center gap-3">
                <span className="text-xl">📋</span>
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-800">NABL प्रमाणित मीटर सटीकता</p>
                  <p className="text-xs text-blue-600">प्रमाणपत्र देखें (PDF)</p>
                </div>
              </div>
              <span className="text-blue-400">→</span>
            </button>

            <button className="w-full flex items-center justify-between bg-purple-50 rounded-xl p-4 border border-purple-100 hover:bg-purple-100 transition-all">
              <div className="flex items-center gap-3">
                <span className="text-xl">📊</span>
                <div className="text-left">
                  <p className="text-sm font-medium text-purple-800">IoT सेंसर कैलिब्रेशन रिपोर्ट</p>
                  <p className="text-xs text-purple-600">अंतिम अंशांकन: 15 जनवरी 2025</p>
                </div>
              </div>
              <span className="text-purple-400">→</span>
            </button>

            <button className="w-full flex items-center justify-between bg-green-50 rounded-xl p-4 border border-green-100 hover:bg-green-100 transition-all">
              <div className="flex items-center gap-3">
                <span className="text-xl">📜</span>
                <div className="text-left">
                  <p className="text-sm font-medium text-green-800">साझा ऊर्जा समझौता</p>
                  <p className="text-xs text-green-600">आपके द्वारा स्वीकृत शर्तें</p>
                </div>
              </div>
              <span className="text-green-400">→</span>
            </button>
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">🎧 सहायता</h3>
          <button className="w-full bg-red-50 border border-red-200 text-red-700 font-medium py-3 rounded-xl hover:bg-red-100 transition-all">
            ⚠️ कोई विसंगति? यहाँ टिकट दर्ज करें
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">
            24 घंटे के डेटा लॉग के साथ स्वचालित टिकट बनेगा
          </p>
        </div>

        {/* System Info */}
        <div className="bg-gray-100 rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-500">
            SolarSync v1.0 (MVP) | IoT प्रोटोकॉल: MQTT | डेटाबेस: InfluxDB + PostgreSQL
          </p>
          <p className="text-xs text-gray-400 mt-1">
            सेंसर: PZEM-004T (NABL कैलिब्रेटेड) | माइक्रोकंट्रोलर: ESP32
          </p>
        </div>
      </div>
    </div>
  );
}
