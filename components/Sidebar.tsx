'use client';

import React from 'react';
import { useFactory } from '@/lib/factoryStore';
import {
  LayoutDashboard,
  AlertTriangle,
  Gauge,
  Cpu,
  ShieldCheck,
  Boxes,
  Wrench,
  Clock,
  Flame,
  PieChart,
  CheckSquare,
  Bot,
  Settings,
  UploadCloud,
  RotateCcw,
  Factory as FactoryIcon,
} from 'lucide-react';

interface SidebarProps {
  onOpenIngest: () => void;
}

export function Sidebar({ onOpenIngest }: SidebarProps) {
  const {
    activeTab,
    setActiveTab,
    alerts,
    actionTasks,
    resetDemoToHeroState,
  } = useFactory();

  const activeAlertsCount = alerts.filter(
    (a) => a.status === 'New' || a.status === 'Action Required' || a.status === 'Investigating'
  ).length;

  const pendingTasksCount = actionTasks.filter(
    (t) => t.status === 'Pending' || t.status === 'Assigned' || t.status === 'In Progress'
  ).length;

  const navSections = [
    {
      group: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        {
          id: 'alerts',
          label: 'Alerts',
          icon: AlertTriangle,
          badge: activeAlertsCount > 0 ? activeAlertsCount : undefined,
          badgeColor: 'bg-[#FEF3F2] text-[#D92D20]',
        },
      ],
    },
    {
      group: 'Operations',
      items: [
        { id: 'production', label: 'Production', icon: Gauge },
        { id: 'machines', label: 'Machines', icon: Cpu },
        { id: 'quality', label: 'Quality', icon: ShieldCheck },
        { id: 'materials', label: 'Materials', icon: Boxes },
        { id: 'maintenance', label: 'Maintenance', icon: Wrench },
        { id: 'downtime', label: 'Downtime', icon: Clock },
        { id: 'waste-energy', label: 'Waste & Energy', icon: Flame },
      ],
    },
    {
      group: 'Intelligence',
      items: [
        { id: 'loss-explorer', label: 'Loss Explorer', icon: PieChart },
        {
          id: 'actions',
          label: 'Action Center',
          icon: CheckSquare,
          badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
          badgeColor: 'bg-[#FFF6ED] text-[#E56B00]',
        },
        { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
      ],
    },
  ];

  return (
    <aside className="w-[248px] bg-[#FFFFFF] border-r border-[#E4E7EB] flex flex-col shrink-0 h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-[#E4E7EB] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2F5BFF] text-white flex items-center justify-center shrink-0">
            <FactoryIcon className="w-[18px] h-[18px]" />
          </div>
          <div>
            <div className="text-[16px] font-semibold text-[#18202A] leading-tight">
              FactoryLens
            </div>
            <div className="text-[13px] text-[#5F6875] leading-tight">
              Operations Copilot
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navSections.map((section) => (
          <div key={section.group}>
            <div className="px-3 mb-2 text-[13px] font-medium text-[#8A93A0]">
              {section.group}
            </div>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full h-10 flex items-center justify-between px-3 text-[14px] rounded-lg transition-colors text-left ${
                      isActive
                        ? 'bg-[#EEF3FF] text-[#2F5BFF] font-medium'
                        : 'text-[#5F6875] hover:text-[#18202A] hover:bg-[#F1F3F5] font-normal'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-[18px] h-[18px] shrink-0 ${
                          isActive ? 'text-[#2F5BFF]' : 'text-[#5F6875]'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[13px] px-2 py-0.5 rounded font-medium tabular-nums ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Bottom Utility Actions */}
      <div className="p-3 border-t border-[#E4E7EB] bg-[#FFFFFF] space-y-1">
        <button
          onClick={onOpenIngest}
          className="w-full h-10 flex items-center gap-3 px-3 text-[14px] text-[#5F6875] hover:text-[#18202A] hover:bg-[#F1F3F5] rounded-lg transition-colors text-left font-normal"
        >
          <UploadCloud className="w-[18px] h-[18px] text-[#5F6875] shrink-0" />
          <span className="truncate">Ingest CSV Data</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full h-10 flex items-center gap-3 px-3 text-[14px] rounded-lg transition-colors text-left ${
            activeTab === 'settings'
              ? 'bg-[#EEF3FF] text-[#2F5BFF] font-medium'
              : 'text-[#5F6875] hover:text-[#18202A] hover:bg-[#F1F3F5] font-normal'
          }`}
        >
          <Settings className={`w-[18px] h-[18px] shrink-0 ${activeTab === 'settings' ? 'text-[#2F5BFF]' : 'text-[#5F6875]'}`} />
          <span className="truncate">Settings & Thresholds</span>
        </button>

        <button
          onClick={resetDemoToHeroState}
          title="Reset hero incident state"
          className="w-full h-10 flex items-center justify-between px-3 text-[13px] font-medium text-[#5F6875] hover:text-[#18202A] hover:bg-[#F1F3F5] rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <RotateCcw className="w-4 h-4 text-[#8A93A0]" />
            <span>Reset Demo Scenario</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
