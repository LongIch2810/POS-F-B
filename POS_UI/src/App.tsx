// POS-F&B Root Application Component

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DemoSwitcher } from './components/common/DemoSwitcher';
import { OfflineBar } from './components/common/OfflineBar';
import { AppShell, NavTab } from './components/common/AppShell';
import { ForcePasswordModal } from './features/auth/ForcePasswordModal';

// Features
import { PosScreen } from './features/pos/PosScreen';
import { InvoicesScreen } from './features/invoices/InvoicesScreen';
import { ShiftsScreen } from './features/shifts/ShiftsScreen';
import { ProductsScreen } from './features/products/ProductsScreen';
import { InventoryScreen } from './features/inventory/InventoryScreen';
import { DailyReportScreen } from './features/reports/DailyReportScreen';
import { SettingsScreen } from './features/settings/SettingsScreen';
import { PlatformAdminScreen } from './features/platform/PlatformAdminScreen';

const MainRouter: React.FC = () => {
  const { session } = useAuth();
  const isPlatformAdmin = session.user.role_code === 'PLATFORM_ADMIN';

  // Quản trị nền tảng chỉ vào tab platform
  const [currentTab, setCurrentTab] = useState<NavTab>(
    isPlatformAdmin ? 'platform_stores' : 'pos'
  );

  useEffect(() => {
    if (isPlatformAdmin) {
      if (
        currentTab !== 'platform_stores' &&
        currentTab !== 'platform_owners' &&
        currentTab !== 'platform_permissions'
      ) {
        setCurrentTab('platform_stores');
      }
    } else {
      if (
        currentTab === 'platform_stores' ||
        currentTab === 'platform_owners' ||
        currentTab === 'platform_permissions'
      ) {
        setCurrentTab('pos');
      }
    }
  }, [isPlatformAdmin]);

  const renderContent = () => {
    switch (currentTab) {
      case 'pos':
        return (
          <PosScreen
            activeMode="pos"
            onSwitchToTables={() => setCurrentTab('tables')}
            onSwitchToPos={() => setCurrentTab('pos')}
          />
        );
      case 'tables':
        return (
          <PosScreen
            activeMode="tables"
            onSwitchToTables={() => setCurrentTab('tables')}
            onSwitchToPos={() => setCurrentTab('pos')}
          />
        );
      case 'invoices':
        return <InvoicesScreen />;
      case 'shifts':
        return <ShiftsScreen />;
      case 'products':
        return <ProductsScreen />;
      case 'inventory':
        return <InventoryScreen />;
      case 'reports':
        return <DailyReportScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'platform_stores':
        return (
          <PlatformAdminScreen
            activeTab="stores"
            onTabChange={(tab) => {
              if (tab === 'stores') setCurrentTab('platform_stores');
              else if (tab === 'owners') setCurrentTab('platform_owners');
              else if (tab === 'permissions') setCurrentTab('platform_permissions');
            }}
          />
        );
      case 'platform_owners':
        return (
          <PlatformAdminScreen
            activeTab="owners"
            onTabChange={(tab) => {
              if (tab === 'stores') setCurrentTab('platform_stores');
              else if (tab === 'owners') setCurrentTab('platform_owners');
              else if (tab === 'permissions') setCurrentTab('platform_permissions');
            }}
          />
        );
      case 'platform_permissions':
        return (
          <PlatformAdminScreen
            activeTab="permissions"
            onTabChange={(tab) => {
              if (tab === 'stores') setCurrentTab('platform_stores');
              else if (tab === 'owners') setCurrentTab('platform_owners');
              else if (tab === 'permissions') setCurrentTab('platform_permissions');
            }}
          />
        );
      default:
        return (
          <PosScreen
            activeMode="pos"
            onSwitchToTables={() => setCurrentTab('tables')}
            onSwitchToPos={() => setCurrentTab('pos')}
          />
        );
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <DemoSwitcher />
      <OfflineBar />
      <ForcePasswordModal />

      <AppShell currentTab={currentTab} onSelectTab={setCurrentTab}>
        {renderContent()}
      </AppShell>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainRouter />
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
