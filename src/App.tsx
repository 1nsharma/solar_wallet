import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Navbar from './components/Navbar';
import LoginScreen from './components/LoginScreen';
import AccessDenied from './components/AccessDenied';
import ConsumerDashboard from './components/ConsumerDashboard';
import ProviderDashboard from './components/ProviderDashboard';
import WalletScreen from './components/WalletScreen';
import P2PMarketplace from './components/P2PMarketplace';
import LiveTelemetryConsole from './components/LiveTelemetryConsole';
import SetupGuide from './components/SetupGuide';
import AdminDashboard from './components/AdminDashboard';
import ReportsScreen from './components/ReportsScreen';
import NotificationCenter from './components/NotificationCenter';
import { sounds } from './utils/audio';
import { type Language } from './utils/i18n';
import type { User } from './types/auth';

export type Screen = 'login' | 'consumer' | 'provider' | 'wallet' | 'marketplace' | 'telemetry' | 'setup' | 'admin' | 'reports';

export default function App() {
  // Session Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('solarsync_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    try {
      const saved = localStorage.getItem('solarsync_session');
      if (saved) {
        const u = JSON.parse(saved) as User;
        return u.role === 'consumer' ? 'consumer' : 'provider';
      }
    } catch {}
    return 'login';
  });

  const [walletBalance, setWalletBalance] = useState(345.50);
  const [isSupplyActive, setIsSupplyActive] = useState(true);
  const [currentRate, setCurrentRate] = useState(6.50);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Localization & Theme
  const [lang, setLang] = useState<Language>('hi');
  const [isDark, setIsDark] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Live Microgrid IoT Telemetry state
  const [solarProduction, setSolarProduction] = useState(1650);
  const [consumerLoad, setConsumerLoad] = useState(450);
  const [batterySOC, setBatterySOC] = useState(82);
  const [voltage, setVoltage] = useState(230.4);
  const [current, setCurrent] = useState(1.95);

  // Sync theme to DOM
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Sync sound setting
  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  // Real-time ticking simulation: updates voltage, current & wallet balance per second
  useEffect(() => {
    const interval = setInterval(() => {
      // Voltage fluctuation (229.5V - 231.5V)
      const nextV = 230.0 + (Math.random() * 2 - 1);
      setVoltage(nextV);

      if (isSupplyActive) {
        // Calculate true current: P / (V * PF) with PF = 0.98
        const nextA = consumerLoad / (nextV * 0.98);
        setCurrent(nextA);

        // Deduct from wallet per second
        const burnRate = (consumerLoad / 1000) * (currentRate / 3600);
        setWalletBalance((prev) => {
          const nextBal = prev - burnRate;
          if (nextBal <= 0) {
            // Auto Cutoff Relay when balance reaches 0!
            sounds.playAlarm();
            // Boom visual feedback
            try {
              confetti({
                particleCount: 150,
                spread: 110,
                startVelocity: 40,
                decay: 0.9,
                origin: { y: 0.5 },
                colors: ['#ff6b6b', '#ffd93d', '#6bcB77', '#4d96ff'],
              });
            } catch {}
            setIsSupplyActive(false);
            return 0;
          }
          return nextBal;
        });
      } else {
        setCurrent(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isSupplyActive, consumerLoad, currentRate]);

  // Authentication Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('solarsync_session', JSON.stringify(user));
    } catch {}
    setWalletBalance(user.walletBalance);
    setCurrentScreen(user.role === 'consumer' ? 'consumer' : user.role === 'admin' ? 'admin' : 'provider');
  };

  const handleLogout = () => {
    sounds.playClick();
    setCurrentUser(null);
    try {
      localStorage.removeItem('solarsync_session');
    } catch {}
    setCurrentScreen('login');
  };

  const handleRecharge = (amount: number) => {
    setWalletBalance((prev) => prev + amount);
    if (!isSupplyActive && amount > 0) {
      // Auto-restore relay upon wallet recharge if previously isolated
      setIsSupplyActive(true);
      sounds.playRelay(true);
    }
  };

  // If user is not authenticated, render Login Screen
  if (!currentUser || currentScreen === 'login') {
    return (
      <LoginScreen
        onLogin={handleLogin}
        lang={lang}
        onToggleLang={() => setLang(lang === 'hi' ? 'en' : 'hi')}
        isDark={isDark}
      />
    );
  }

  // Strict Role-Based Access Control (RBAC) validation
  const isConsumer = currentUser.role === 'consumer';
  const isAdmin = currentUser.role === 'admin';
  const consumerAllowedScreens: Screen[] = ['consumer', 'wallet', 'telemetry', 'reports'];
  const providerAllowedScreens: Screen[] = ['provider', 'marketplace', 'telemetry', 'setup', 'admin', 'reports'];
  const adminAllowedScreens: Screen[] = ['admin', 'provider', 'marketplace', 'telemetry', 'setup', 'consumer', 'wallet', 'reports'];

  const isScreenAllowed = isConsumer
    ? consumerAllowedScreens.includes(currentScreen)
    : isAdmin
    ? adminAllowedScreens.includes(currentScreen)
    : providerAllowedScreens.includes(currentScreen);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    } font-sans`}>
      {/* Universal Floating Header for Logged-In Users */}
      <Navbar
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        currentUser={currentUser}
        onLogout={handleLogout}
        walletBalance={walletBalance}
        lang={lang}
        onToggleLang={() => setLang(lang === 'hi' ? 'en' : 'hi')}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        isSupplyActive={isSupplyActive}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Screen Views with strict RBAC gatekeeping */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!isScreenAllowed ? (
          <AccessDenied
            user={currentUser}
            onBack={() => setCurrentScreen(isConsumer ? 'consumer' : isAdmin ? 'admin' : 'provider')}
            lang={lang}
            isDark={isDark}
          />
        ) : (
          <>
            {currentScreen === 'consumer' && (
              <ConsumerDashboard
                walletBalance={walletBalance}
                isSupplyActive={isSupplyActive}
                onToggleSupply={() => setIsSupplyActive(!isSupplyActive)}
                onNavigate={setCurrentScreen}
                lang={lang}
                isDark={isDark}
                currentRate={currentRate}
                solarProduction={solarProduction}
                setSolarProduction={setSolarProduction}
                consumerLoad={consumerLoad}
                setConsumerLoad={setConsumerLoad}
                batterySOC={batterySOC}
                setBatterySOC={setBatterySOC}
                voltage={voltage}
                current={current}
                onQuickRecharge={handleRecharge}
              />
            )}

            {currentScreen === 'provider' && (
              <ProviderDashboard
                onNavigate={setCurrentScreen}
                lang={lang}
                isDark={isDark}
                solarProduction={solarProduction}
                setSolarProduction={setSolarProduction}
                batterySOC={batterySOC}
                currentRate={currentRate}
              />
            )}

            {currentScreen === 'wallet' && (
              <WalletScreen
                walletBalance={walletBalance}
                onRecharge={handleRecharge}
                onNavigate={setCurrentScreen}
                lang={lang}
                isDark={isDark}
              />
            )}
            {currentScreen === 'admin' && (
              <AdminDashboard
                currentUser={currentUser!}
                onNavigate={(screen: string) => setCurrentScreen(screen as Screen)}
                lang={lang}
                isDark={isDark}
              />
            )}
            {currentScreen === 'marketplace' && (
              <P2PMarketplace
                lang={lang}
                isDark={isDark}
                currentRate={currentRate}
                onSetRate={setCurrentRate}
                solarProduction={solarProduction}
              />
            )}

            {currentScreen === 'telemetry' && (
              <LiveTelemetryConsole
                lang={lang}
                isDark={isDark}
                solarProduction={solarProduction}
                consumerLoad={consumerLoad}
                voltage={voltage}
                current={current}
                isSupplyActive={isSupplyActive}
                onToggleSupply={() => setIsSupplyActive(!isSupplyActive)}
              />
            )}

            {currentScreen === 'reports' && (
              <ReportsScreen
                lang={lang}
                isDark={isDark}
                onNavigate={setCurrentScreen}
              />
            )}

            {currentScreen === 'setup' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h2 className="text-xl font-bold tracking-tight">
                    {lang === 'hi' ? 'हार्डवेयर और डेवलपर सेटअप गाइड' : 'Hardware & Developer Setup Guide'}
                  </h2>
                  <button
                    onClick={() => setCurrentScreen('provider')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500"
                  >
                    ← {lang === 'hi' ? 'वापस जाएं' : 'Back'}
                  </button>
                </div>
                <SetupGuide onNavigate={setCurrentScreen} />
              </div>
            )}
          </>
        )}
      </main>

      {/* Global Notification Center Drawer */}
      <NotificationCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        lang={lang}
        isDark={isDark}
        onNavigate={setCurrentScreen}
      />
    </div>
  );
}
