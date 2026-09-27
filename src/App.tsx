import { useState, useEffect } from 'react';
import OnboardingScreen from './components/OnboardingScreen';
import ConsumerDashboard from './components/ConsumerDashboard';
import ProviderDashboard from './components/ProviderDashboard';
import WalletScreen from './components/WalletScreen';

export type Screen = 'onboarding' | 'consumer' | 'provider' | 'wallet';
export type Role = 'consumer' | 'provider';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [userRole, setUserRole] = useState<Role>('consumer');
  const [walletBalance, setWalletBalance] = useState(345.50);
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
    </div>
  );
}
