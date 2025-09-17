import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import Portfolio from './components/Portfolio';
import Transactions from './components/Transactions';
import AIEnhancedReport from './components/AIEnhancedReport';
import RiskManagement from './components/RiskManagement';
import StressTest from './components/StressTest';
import MyReport from './components/MyReport';
import ThemeSwitcher from './components/common/ThemeSwitcher';
import { useClubData } from './hooks/useClubData';
import AssetAllocation from './components/AssetAllocation';
import Stocks from './components/analysis/Stocks';
import Bonds from './components/analysis/Bonds';
import ETFs from './components/analysis/ETFs';
import REITs from './components/analysis/REITs';
import TrackRecord from './components/TrackRecord';

type View = 'dashboard' | 'members' | 'portfolio' | 'transactions' | 'ai-report' | 'risk-management' | 'stress-test' | 'my-report' | 'asset-allocation' | 'stocks' | 'bonds' | 'etfs' | 'reits' | 'track-record';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const clubDataHook = useClubData();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);


  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard {...clubDataHook} />;
      case 'members':
        return <Members {...clubDataHook} />;
      case 'portfolio':
        return <Portfolio {...clubDataHook} />;
      case 'transactions':
        return <Transactions {...clubDataHook} />;
      case 'asset-allocation':
        return <AssetAllocation {...clubDataHook} />;
      case 'track-record':
        return <TrackRecord {...clubDataHook} />;
      case 'ai-report':
        return <AIEnhancedReport />;
      case 'risk-management':
        return <RiskManagement {...clubDataHook} />;
      case 'stress-test':
        return <StressTest {...clubDataHook} />;
      case 'stocks':
        return <Stocks />;
      case 'bonds':
        return <Bonds />;
      case 'etfs':
        return <ETFs />;
      case 'reits':
        return <REITs />;
      case 'my-report':
        return <MyReport {...clubDataHook} />;
      default:
        return <Dashboard {...clubDataHook} />;
    }
  };
  
  const NavButton: React.FC<{ view: View; label: string }> = ({ view, label }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        currentView === view
          ? 'bg-primary dark:bg-dark-primary text-white dark:text-gray-900 shadow-md'
          : 'text-gray-600 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background text-text-primary dark:text-dark-text-primary">
      <header className="bg-card dark:bg-dark-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary dark:text-dark-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h1 className="text-xl md:text-2xl font-bold text-primary dark:text-dark-primary">Phronesis Capital</h1>
            </div>
            <div className="flex items-center space-x-4">
               <nav className="hidden md:flex items-center space-x-1">
                  <NavButton view="dashboard" label="Dashboard" />
                  <NavButton view="members" label="Members" />
                  <NavButton view="portfolio" label="Portfolio" />
                  <NavButton view="transactions" label="Transactions" />
                  <NavButton view="asset-allocation" label="Allocation" />
                  <NavButton view="track-record" label="Track Record" />
                  <NavButton view="risk-management" label="Risk" />
                  <NavButton view="stress-test" label="Stress Test" />
                  <NavButton view="stocks" label="Stocks" />
                  <NavButton view="bonds" label="Bonds" />
                  <NavButton view="etfs" label="ETFs" />
                  <NavButton view="reits" label="REITs" />
                  <NavButton view="ai-report" label="AI Report" />
                  <NavButton view="my-report" label="My Report" />
              </nav>
              <ThemeSwitcher theme={theme} setTheme={setTheme} />
            </div>
          </div>
           <nav className="md:hidden flex flex-wrap items-center space-x-1 pb-2">
                <NavButton view="dashboard" label="Dashboard" />
                <NavButton view="members" label="Members" />
                <NavButton view="portfolio" label="Portfolio" />
                <NavButton view="transactions" label="Transactions" />
                <NavButton view="asset-allocation" label="Allocation" />
                <NavButton view="track-record" label="Track Record" />
                <NavButton view="risk-management" label="Risk" />
                <NavButton view="stress-test" label="Stress Test" />
                <NavButton view="stocks" label="Stocks" />
                <NavButton view="bonds" label="Bonds" />
                <NavButton view="etfs" label="ETFs" />
                <NavButton view="reits" label="REITs" />
                <NavButton view="ai-report" label="AI Report" />
                <NavButton view="my-report" label="My Report" />
            </nav>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderView()}
      </main>
    </div>
  );
};

export default App;