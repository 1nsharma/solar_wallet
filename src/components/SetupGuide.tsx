import { useState } from 'react';
import type { Screen } from '../App';

interface Props {
  onNavigate: (screen: Screen) => void;
}

interface SoftwareItem {
  id: number;
  name: string;
  purpose: string;
  link: string;
  icon: string;
  color: string;
  steps: { platform: string; commands: string[] }[];
}

const softwareList: SoftwareItem[] = [
  {
    id: 1,
    name: 'VS Code',
    purpose: 'कोड एडिटर',
    link: 'https://code.visualstudio.com/',
    icon: '💻',
    color: 'bg-blue-50 border-blue-200',
    steps: [
      {
        platform: 'Windows',
        commands: [
          'https://code.visualstudio.com/ → "Download for Windows"',
          'इंस्टॉलर चलाएं → सभी डिफ़ॉल्ट सेटिंग्स स्वीकार करें',
          'वेरिफिकेशन: code --version'
        ]
      },
      {
        platform: 'Mac',
        commands: [
          'brew install --cask visual-studio-code',
          'वेरिफिकेशन: code --version'
        ]
      },
      {
        platform: 'Linux',
        commands: [
          'sudo snap install code --classic',
          'वेरिफिकेशन: code --version'
        ]
      }
    ]
  },
  {
    id: 2,
    name: 'Git',
    purpose: 'वर्जन कंट्रोल',
    link: 'https://git-scm.com/',
    icon: '🔀',
    color: 'bg-orange-50 border-orange-200',
    steps: [
      {
        platform: 'Windows',
        commands: [
          'https://git-scm.com/download/win → डाउनलोड करें',
          '"Use Git from Git Bash only" चुनें',
          '"Checkout as-is, commit as-is" चुनें',
          'वेरिफिकेशन: git --version'
        ]
      },
      {
        platform: 'Mac',
        commands: [
          'brew install git',
          'वेरिफिकेशन: git --version'
        ]
      },
      {
        platform: 'Linux',
        commands: [
          'sudo apt update && sudo apt install git -y',
          'वेरिफिकेशन: git --version'
        ]
      }
    ]
  },
  {
    id: 3,
    name: 'Node.js (LTS)',
    purpose: 'बैकएंड सर्वर',
    link: 'https://nodejs.org/',
    icon: '🟢',
    color: 'bg-green-50 border-green-200',
    steps: [
      {
        platform: 'सभी प्लेटफॉर्म',
        commands: [
          'https://nodejs.org/ → "LTS" बटन क्लिक करें',
          'इंस्टॉलर चलाएं → सभी डिफ़ॉल्ट सेटिंग्स स्वीकार करें',
          'वेरिफिकेशन: node --version',
          'वेरिफिकेशन: npm --version'
        ]
      }
    ]
  },
  {
    id: 4,
    name: 'Flutter SDK',
    purpose: 'मोबाइल ऐप',
    link: 'https://flutter.dev/docs/get-started/install',
    icon: '📱',
    color: 'bg-cyan-50 border-cyan-200',
    steps: [
      {
        platform: 'Windows',
        commands: [
          'SDK डाउनलोड करें → ZIP को C:\\src\\flutter में एक्सट्रैक्ट करें',
          'Environment Variables → Path में "C:\\src\\flutter\\bin" जोड़ें',
          'Android Studio इंस्टॉल करें → SDK Manager → Android SDK',
          'वेरिफिकेशन: flutter doctor'
        ]
      },
      {
        platform: 'Mac',
        commands: [
          'SDK डाउनलोड करें → ~/development/flutter में एक्सट्रैक्ट करें',
          'PATH में जोड़ें: export PATH="$PATH:~/development/flutter/bin"',
          'Xcode इंस्टॉल करें (App Store से)',
          'वेरिफिकेशन: flutter doctor'
        ]
      }
    ]
  },
  {
    id: 5,
    name: 'Arduino IDE',
    purpose: 'ESP32 प्रोग्रामिंग',
    link: 'https://www.arduino.cc/en/software',
    icon: '🔌',
    color: 'bg-teal-50 border-teal-200',
    steps: [
      {
        platform: 'सभी प्लेटफॉर्म',
        commands: [
          'Arduino IDE 2.x डाउनलोड और इंस्टॉल करें',
          'File → Preferences → Additional Board Manager URLs:',
          '  https://dl.espressif.com/dl/package_esp32_index.json',
          'Tools → Board → Boards Manager → "ESP32" इंस्टॉल करें',
          'CP210x USB ड्राइवर इंस्टॉल करें',
          'Tools → Board → ESP32 Dev Module चुनें'
        ]
      }
    ]
  },
  {
    id: 6,
    name: 'PostgreSQL',
    purpose: 'मुख्य डेटाबेस',
    link: 'https://www.postgresql.org/download/',
    icon: '🐘',
    color: 'bg-indigo-50 border-indigo-200',
    steps: [
      {
        platform: 'Windows',
        commands: [
          'EDB Installer डाउनलोड करें',
          'Superuser password सेट करें (याद रखें!)',
          'Port: 5432 (डिफ़ॉल्ट)',
          'वेरिफिकेशन: psql --version',
          'डेटाबेस बनाएं: psql -U postgres → CREATE DATABASE solarsync;'
        ]
      },
      {
        platform: 'Mac',
        commands: [
          'brew install postgresql@16',
          'brew services start postgresql@16',
          'वेरिफिकेशन: psql --version',
          'createdb solarsync'
        ]
      },
      {
        platform: 'Linux',
        commands: [
          'sudo apt install postgresql postgresql-contrib -y',
          'sudo systemctl start postgresql',
          'sudo -u postgres psql → CREATE DATABASE solarsync;'
        ]
      }
    ]
  },
  {
    id: 7,
    name: 'InfluxDB',
    purpose: 'टाइम-सीरीज़ डेटा',
    link: 'https://portal.influxdata.com/downloads/',
    icon: '📈',
    color: 'bg-purple-50 border-purple-200',
    steps: [
      {
        platform: 'Windows',
        commands: [
          'InfluxDB OSS 2.x → Windows ZIP डाउनलोड करें',
          'ZIP को C:\\influxdb में एक्सट्रैक्ट करें',
          'cd C:\\influxdb && .\\influxd.exe',
          'नया Terminal: .\\influx.exe'
        ]
      },
      {
        platform: 'Mac',
        commands: [
          'brew install influxdb',
          'brew services start influxdb',
          'वेरिफिकेशन: influx'
        ]
      },
      {
        platform: 'Linux',
        commands: [
          'sudo apt install influxdb2 -y',
          'sudo systemctl start influxdb',
          'वेरिफिकेशन: influx'
        ]
      }
    ]
  },
  {
    id: 8,
    name: 'Mosquitto (MQTT)',
    purpose: 'IoT कम्युनिकेशन',
    link: 'https://mosquitto.org/download/',
    icon: '📡',
    color: 'bg-amber-50 border-amber-200',
    steps: [
      {
        platform: 'Windows',
        commands: [
          'Windows 64-bit Installer डाउनलोड करें',
          '"Install as a Windows Service" चुनें',
          'वेरिफिकेशन: mosquitto -v'
        ]
      },
      {
        platform: 'Mac',
        commands: [
          'brew install mosquitto',
          'brew services start mosquitto',
          'वेरिफिकेशन: mosquitto -v'
        ]
      },
      {
        platform: 'Linux',
        commands: [
          'sudo apt install mosquitto mosquitto-clients -y',
          'sudo systemctl start mosquitto',
          'वेरिफिकेशन: mosquitto -v'
        ]
      }
    ]
  },
  {
    id: 9,
    name: 'Postman',
    purpose: 'API टेस्टिंग',
    link: 'https://www.postman.com/downloads/',
    icon: '🧪',
    color: 'bg-rose-50 border-rose-200',
    steps: [
      {
        platform: 'सभी प्लेटफॉर्म',
        commands: [
          'https://www.postman.com/downloads/ → डाउनलोड करें',
          'इंस्टॉलर चलाएं → खाता बनाएं (निःशुल्क)',
          'New → HTTP Request → URL: http://localhost:3000/api/wallet/flat_101',
          '"Send" क्लिक करें → रिस्पॉन्स देखें'
        ]
      }
    ]
  }
];

const vsCodeExtensions = [
  { name: 'Flutter (Dart Code)', purpose: 'मोबाइल ऐप कोडिंग' },
  { name: 'PlatformIO IDE', purpose: 'ESP32/Arduino हार्डवेयर' },
  { name: 'Python', purpose: 'ML/Pricing Engine' },
  { name: 'PostgreSQL', purpose: 'डेटाबेस प्रबंधन' },
  { name: 'Thunder Client', purpose: 'API टेस्टिंग (Postman विकल्प)' },
  { name: 'GitLens', purpose: 'Git इतिहास देखना' },
  { name: 'Prettier', purpose: 'कोड फॉर्मेटिंग' },
  { name: 'ESLint', purpose: 'JavaScript लिनटिंग' },
];

export default function SetupGuide({ onNavigate }: Props) {
  const [expandedSoftware, setExpandedSoftware] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'software' | 'project' | 'extensions' | 'checklist'>('software');
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const toggleSoftware = (id: number) => {
    setExpandedSoftware(expandedSoftware === id ? null : id);
  };

  const toggleCheck = (id: number) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const checklistItems = [
    'VS Code इंस्टॉल और चल रहा है',
    'Git इंस्टॉल और कॉन्फ़िगर है',
    'Node.js और npm इंस्टॉल हैं',
    'Flutter SDK इंस्टॉल और flutter doctor सफल है',
    'Arduino IDE इंस्टॉल और ESP32 बोर्ड जोड़ा गया है',
    'PostgreSQL चल रहा है और solarsync डेटाबेस बना है',
    'InfluxDB चल रहा है',
    'Mosquitto MQTT Broker चल रहा है',
    'Postman इंस्टॉल है',
    'GitHub रिपॉजिटरी बनाई गई है',
    'सभी VS Code एक्सटेंशन इंस्टॉल हैं',
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => onNavigate('consumer')} className="text-white/70 hover:text-white">
            <span className="text-xl">←</span>
          </button>
          <div>
            <h1 className="text-lg font-bold">🛠️ Development Setup Guide</h1>
            <p className="text-xs text-gray-300">SolarSync प्रोजेक्ट सेटअप - संपूर्ण इंस्टॉलेशन गाइड</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/10 rounded-xl p-1">
          {[
            { id: 'software' as const, label: '📦 सॉफ्टवेयर', },
            { id: 'project' as const, label: '📁 प्रोजेक्ट' },
            { id: 'extensions' as const, label: '🧩 एक्सटेंशन' },
            { id: 'checklist' as const, label: '✅ चेकलिस्ट' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-gray-800 shadow'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Software Tab */}
        {activeTab === 'software' && (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-blue-800 font-medium">💡 संक्षेप में कार्यप्रवाह:</p>
              <p className="text-xs text-blue-600 mt-1 font-mono">VS Code (लिखो) → Git (ट्रैक करो) → GitHub (सुरक्षित करो)</p>
            </div>

            {softwareList.map(sw => (
              <div key={sw.id} className={`rounded-xl border overflow-hidden transition-all ${sw.color}`}>
                <button
                  onClick={() => toggleSoftware(sw.id)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{sw.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{sw.name}</p>
                      <p className="text-xs text-gray-500">{sw.purpose}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-mono">#{sw.id}</span>
                    <span className={`transition-transform ${expandedSoftware === sw.id ? 'rotate-180' : ''}`}>▼</span>
                  </div>
                </button>

                {expandedSoftware === sw.id && (
                  <div className="px-4 pb-4 space-y-3 animate-in">
                    <a
                      href={sw.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-3 py-1 rounded-full hover:bg-green-200"
                    >
                      🔗 डाउनलोड लिंक
                    </a>

                    {sw.steps.map((step, idx) => (
                      <div key={idx} className="bg-white/80 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-600 mb-2">
                          🖥️ {step.platform}:
                        </p>
                        <div className="space-y-1">
                          {step.commands.map((cmd, cmdIdx) => (
                            <div key={cmdIdx} className="flex items-start gap-2">
                              <span className="text-xs text-gray-400 mt-0.5">{cmdIdx + 1}.</span>
                              <code className="text-xs bg-gray-900 text-green-400 px-2 py-0.5 rounded font-mono break-all">
                                {cmd}
                              </code>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Project Setup Tab */}
        {activeTab === 'project' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-4">📁 प्रोजेक्ट सेटअप चरण</h3>
              
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: 'GitHub रिपॉजिटरी बनाएं',
                    commands: [
                      'https://github.com/new → "SolarSync" → Private',
                    ]
                  },
                  {
                    step: 2,
                    title: 'लोकल मशीन पर क्लोन करें',
                    commands: [
                      'git clone https://github.com/YOUR_USERNAME/SolarSync.git',
                      'cd SolarSync',
                    ]
                  },
                  {
                    step: 3,
                    title: 'फ़ोल्डर संरचना बनाएं',
                    commands: [
                      'mkdir hardware backend mobile_app database legal',
                    ]
                  },
                  {
                    step: 4,
                    title: 'VS Code खोलें',
                    commands: [
                      'code .',
                    ]
                  },
                  {
                    step: 5,
                    title: 'बैकएंड dependencies इंस्टॉल करें',
                    commands: [
                      'cd backend',
                      'npm install',
                    ]
                  },
                  {
                    step: 6,
                    title: 'मोबाइल ऐप dependencies',
                    commands: [
                      'cd ../mobile_app',
                      'flutter create .',
                      'flutter pub get',
                    ]
                  },
                  {
                    step: 7,
                    title: 'डेटाबेस स्कीमा चलाएं',
                    commands: [
                      'cd ../database',
                      'psql -U postgres -d solarsync -f schema.sql',
                    ]
                  },
                ].map(item => (
                  <div key={item.step} className="flex gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-green-700">{item.step}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 mb-1">{item.title}</p>
                      <div className="space-y-1">
                        {item.commands.map((cmd, idx) => (
                          <code key={idx} className="block text-xs bg-gray-900 text-green-400 px-3 py-1.5 rounded font-mono">
                            {cmd}
                          </code>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Folder Structure */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-3">📂 फ़ोल्डर संरचना</h3>
              <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-green-400 overflow-x-auto">
                <pre>{`SolarSync/
├── .git/                    ← Git (स्पर्श न करें)
├── .gitignore               ← Ignored files
├── README.md                ← प्रोजेक्ट विवरण
│
├── hardware/                ← ESP32 और सेंसर
│   ├── esp32_mqtt.ino       ← Arduino/C++ कोड
│   └── wiring_diagram.png
│
├── backend/                 ← सर्वर-साइड
│   ├── server.js            ← Node.js/Express
│   ├── pricing_engine.py    ← ML/Dynamic Pricing
│   └── package.json
│
├── mobile_app/              ← Flutter ऐप
│   ├── lib/
│   │   ├── main.dart
│   │   ├── screens/
│   │   │   ├── onboarding.dart
│   │   │   ├── consumer_dashboard.dart
│   │   │   ├── provider_dashboard.dart
│   │   │   └── wallet.dart
│   │   └── services/
│   │       └── mqtt_service.dart
│   └── pubspec.yaml
│
├── database/                ← डेटाबेस स्कीमा
│   ├── schema.sql
│   └── influxdb_setup.sh
│
└── legal/                   ← कानूनी दस्तावेज़
    └── shared_energy_agreement.pdf`}</pre>
              </div>
            </div>

            {/* Daily Workflow */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-3">🔄 दैनिक कार्यप्रवाह</h3>
              <div className="space-y-3">
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <p className="text-xs font-semibold text-blue-800 mb-1">🌅 सुबह:</p>
                  <code className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded font-mono">git pull origin main</code>
                  <p className="text-xs text-blue-600 mt-1">टीम के कल के बदलाव लाएँ</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                  <p className="text-xs font-semibold text-amber-800 mb-1">☀️ दिन भर:</p>
                  <p className="text-xs text-amber-700">VS Code में कोड लिखें → Test करें → Bug Fix करें</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                  <p className="text-xs font-semibold text-green-800 mb-1">🌆 शाम:</p>
                  <div className="space-y-1">
                    <code className="block text-xs bg-green-900 text-green-200 px-2 py-1 rounded font-mono">git add .</code>
                    <code className="block text-xs bg-green-900 text-green-200 px-2 py-1 rounded font-mono">git commit -m "Feature X done"</code>
                    <code className="block text-xs bg-green-900 text-green-200 px-2 py-1 rounded font-mono">git push origin main</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Extensions Tab */}
        {activeTab === 'extensions' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-1">🧩 VS Code एक्सटेंशन</h3>
              <p className="text-xs text-gray-500 mb-4">Ctrl+Shift+X दबाएं → खोजें → Install करें</p>

              <div className="space-y-2">
                {vsCodeExtensions.map((ext, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-purple-700">{idx + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{ext.name}</p>
                        <p className="text-xs text-gray-500">{ext.purpose}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Install</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Best Practices */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-3">🔒 सुरक्षा सर्वोत्तम प्रक्रियाएँ</h3>
              <div className="space-y-3">
                <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                  <p className="text-xs font-semibold text-red-800 mb-1">⚠️ .gitignore फ़ाइल</p>
                  <p className="text-xs text-red-600">कभी भी पासवर्ड, API Keys, या .env फ़ाइलें GitHub पर Push न करें।</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <p className="text-xs font-semibold text-blue-800 mb-1">🌿 Branching Strategy</p>
                  <code className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded font-mono">git checkout -b feature/wallet-recharge</code>
                  <p className="text-xs text-blue-600 mt-1">main ब्रांच पर सीधे कोड न करें। Pull Request (PR) बनाएँ।</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                  <p className="text-xs font-semibold text-green-800 mb-1">🔐 Private Repository</p>
                  <p className="text-xs text-green-600">व्यावसायिक कोड सदैव Private रिपॉजिटरी में रखें।</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <div className="space-y-4">
            {/* Progress */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-800">✅ सेटअप प्रगति</h3>
                <span className="text-sm font-bold text-green-700 font-mono">
                  {checkedItems.size}/{checklistItems.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-green-500 to-green-700 transition-all duration-500"
                  style={{ width: `${(checkedItems.size / checklistItems.length) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {checkedItems.size === 0 && 'शुरू करने के लिए नीचे आइटम चेक करें'}
                {checkedItems.size > 0 && checkedItems.size < checklistItems.length && 'बहुत बढ़िया! जारी रखें...'}
                {checkedItems.size === checklistItems.length && '🎉 बधाई हो! सेटअप पूर्ण!'}
              </p>
            </div>

            {/* Checklist Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="space-y-2">
                {checklistItems.map((item, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      checkedItems.has(idx)
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50 border border-gray-100 hover:border-green-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checkedItems.has(idx)}
                      onChange={() => toggleCheck(idx)}
                      className="w-5 h-5 rounded border-gray-300 text-green-700 focus:ring-green-500"
                    />
                    <span className={`text-sm ${
                      checkedItems.has(idx) ? 'text-green-700 line-through' : 'text-gray-700'
                    }`}>
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Final Verification */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-3">🔍 अंतिम वेरिफिकेशन</h3>
              <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-green-400 space-y-1">
                <p className="text-gray-500"># सभी वर्जन जांचें:</p>
                <p>git --version</p>
                <p>node --version</p>
                <p>npm --version</p>
                <p>flutter --version</p>
                <p>psql --version</p>
                <p>influx --version</p>
                <p>mosquitto -v</p>
                <p className="text-gray-500 mt-2"># Flutter doctor:</p>
                <p>flutter doctor</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
