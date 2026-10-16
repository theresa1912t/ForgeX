'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { FactoryProvider, useFactory } from '@/lib/factoryStore';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { NotificationDrawer } from '@/components/NotificationDrawer';
import { InvestigationDrawer } from '@/components/InvestigationDrawer';
import { DataIngestionModal } from '@/components/DataIngestionModal';
import { CheckCircle2, Sparkles, AlertTriangle, X } from 'lucide-react';

import { DashboardModule } from '@/components/modules/DashboardModule';
import { AlertsModule } from '@/components/modules/AlertsModule';
import { InvestigationsModule } from '@/components/modules/InvestigationsModule';
import { ProductionModule } from '@/components/modules/ProductionModule';
import { MachinesModule } from '@/components/modules/MachinesModule';
import { QualityModule } from '@/components/modules/QualityModule';
import { MaterialsModule } from '@/components/modules/MaterialsModule';
import { MaintenanceModule } from '@/components/modules/MaintenanceModule';
import { DowntimeModule } from '@/components/modules/DowntimeModule';
import { WasteEnergyModule } from '@/components/modules/WasteEnergyModule';
import { LossExplorerModule } from '@/components/modules/LossExplorerModule';
import { ActionsModule } from '@/components/modules/ActionsModule';
import { AIAssistantModule } from '@/components/modules/AIAssistantModule';
import { SettingsModule } from '@/components/modules/SettingsModule';

const emptySubscribe = () => () => {};

function AppContent() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const { activeTab, notifications, toast, clearToast, isLoading, loadError } = useFactory();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isIngestionOpen, setIsIngestionOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!isClient || isLoading) {
    return (
      <div className="flex min-h-screen bg-[#F7F8FA] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#2F5BFF] border-t-transparent rounded-full animate-spin" />
          <p className="text-[13px] font-medium text-[#5F6875]">Initializing FactoryLens Operations...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen bg-[#F7F8FA] items-center justify-center">
        <div className="flex flex-col items-center gap-3 max-w-md text-center">
          <p className="text-[14px] font-semibold text-[#18202A]">Couldn&apos;t load factory data</p>
          <p className="text-[13px] font-medium text-[#5F6875]">{loadError.message}</p>
        </div>
      </div>
    );
  }

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardModule />;
      case 'alerts':
        return <AlertsModule />;
      case 'investigations':
        return <InvestigationsModule />;
      case 'production':
        return <ProductionModule />;
      case 'machines':
        return <MachinesModule />;
      case 'quality':
        return <QualityModule />;
      case 'materials':
        return <MaterialsModule />;
      case 'maintenance':
        return <MaintenanceModule />;
      case 'downtime':
        return <DowntimeModule />;
      case 'waste-energy':
        return <WasteEnergyModule />;
      case 'loss-explorer':
        return <LossExplorerModule />;
      case 'actions':
        return <ActionsModule />;
      case 'ai-assistant':
        return <AIAssistantModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <DashboardModule />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F7F8FA] text-[#18202A]">
      {/* Persistent Left Sidebar */}
      <Sidebar onOpenIngest={() => setIsIngestionOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onToggleNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)}
          unreadCount={unreadCount}
        />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-[1440px] w-full mx-auto">
            {renderActiveModule()}
          </div>
        </main>
      </div>

      {/* Slide-over Right Investigation Drawer */}
      <InvestigationDrawer />

      {/* In-App Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Operational CSV Data Ingestion Modal */}
      <DataIngestionModal
        isOpen={isIngestionOpen}
        onClose={() => setIsIngestionOpen(false)}
      />

      {/* Global Interactive System Feedback Toast (Visibility of System Status Heuristic #1) */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#18202A] text-white shadow-xl border border-[#2A3441] animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#18864B] shrink-0" />}
          {toast.type === 'info' && <Sparkles className="w-5 h-5 text-[#2F5BFF] shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-[#E56B00] shrink-0" />}
          <span className="text-[14px] font-medium max-w-md">{toast.message}</span>
          <button
            onClick={clearToast}
            className="text-[#8A93A0] hover:text-white ml-2 p-1 rounded transition-colors"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: Infinity, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <FactoryProvider>
          <AppContent />
        </FactoryProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
