import { useState } from 'react';
import OnboardingScreen from './components/OnboardingScreen';
import ConsumerDashboard from './components/ConsumerDashboard';
import ProviderDashboard from './components/ProviderDashboard';
import WalletScreen from './components/WalletScreen';
import SetupGuide from './components/SetupGuide';

export type Screen = 'onboarding' | 'consumer' | 'provider' | 'wallet' | 'setup';
export type Role = 'consumer' | 'provider';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [, setUserRole] = useState<Role>('consumer');
  const [walletBalance] = useState(345.50);
  const [isSupplyActive, setIsSupplyActive] = useState(true);

  const handleConsent = (role: Role) => {
    setUserRole(role);
    setCurrentScreen(role === 'consumer' ? 'consumer' : 'provider');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {currentScreen === 'onboarding' && (
        <OnboardingScreen onConsent={handleConsent} />
      )}
      {currentScreen === 'consumer' && (
        <ConsumerDashboard
          walletBalance={walletBalance}
          isSupplyActive={isSupplyActive}
          onToggleSupply={() => setIsSupplyActive(!isSupplyActive)}
          onNavigate={setCurrentScreen}
          onRoleSwitch={() => { setUserRole('provider'); setCurrentScreen('provider'); }}
        />
      )}
      {currentScreen === 'provider' && (
        <ProviderDashboard
          onNavigate={setCurrentScreen}
          onRoleSwitch={() => { setUserRole('consumer'); setCurrentScreen('consumer'); }}
        />
      )}
      {currentScreen === 'wallet' && (
        <WalletScreen
          walletBalance={walletBalance}
          onNavigate={setCurrentScreen}
        />
      )}
      {currentScreen === 'setup' && (
        <SetupGuide onNavigate={setCurrentScreen} />
      )}
    </div>
  );
}
