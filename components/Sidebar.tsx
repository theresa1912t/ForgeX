'use client';

import React from 'react';
import { useFactory } from '@/lib/factoryStore';
import { NAV_HUBS, getHubForTab } from '@/lib/navigation';
import {
  UploadCloud,
  RotateCcw,
  Factory as FactoryIcon,
  ChevronDown,
  ChevronRight,
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

  const currentHub = getHubForTab(activeTab);

  const getBadgeCount = (badgeKey?: 'alerts' | 'tasks') => {
    if (badgeKey === 'alerts') return activeAlertsCount > 0 ? activeAlertsCount : null;
    if (badgeKey === 'tasks') return pendingTasksCount > 0 ? pendingTasksCount : null;
    return null;
  };

  const getHubBadgeCount = (hubId: string) => {
    if (hubId === 'operations') return activeAlertsCount > 0 ? activeAlertsCount : null;
    if (hubId === 'equipment') return pendingTasksCount > 0 ? pendingTasksCount : null;
    return null;
  };

  return (
    <aside className="w-[260px] bg-[#FFFFFF] border-r border-[#E4E7EB] flex flex-col shrink-0 h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-[#E4E7EB] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2F5BFF] text-white flex items-center justify-center shrink-0 shadow-xs">
            <FactoryIcon className="w-[18px] h-[18px]" />
          </div>
          <div>
            <div className="text-[16px] font-semibold text-[#18202A] leading-tight">
              FactoryLens
            </div>
            <div className="text-[12px] text-[#5F6875] leading-tight mt-0.5">
              Operations Copilot
            </div>
          </div>
        </div>
      </div>

      {/* 5 Core Consolidated Hubs */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
        <div className="px-3 mb-2 text-[12px] font-semibold uppercase tracking-wider text-[#8A93A0]">
          Main Navigation
        </div>

        {NAV_HUBS.map((hub) => {
          const HubIcon = hub.icon;
          const isHubActive = currentHub.id === hub.id;
          const hubBadge = getHubBadgeCount(hub.id);

          return (
            <div key={hub.id} className="space-y-1">
              {/* Primary Hub Row */}
              <button
                onClick={() => {
                  if (!isHubActive) {
                    setActiveTab(hub.defaultTab);
                  }
                }}
                className={`w-full h-11 flex items-center justify-between px-3 text-[14px] rounded-lg transition-colors text-left ${
                  isHubActive
                    ? 'bg-[#EEF3FF] text-[#2F5BFF] font-semibold'
                    : 'text-[#485363] hover:text-[#18202A] hover:bg-[#F4F6F8] font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <HubIcon
                    className={`w-[18px] h-[18px] shrink-0 ${
                      isHubActive ? 'text-[#2F5BFF]' : 'text-[#5F6875]'
                    }`}
                  />
                  <span className="truncate">{hub.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {hubBadge && (
                    <span
                      className={`text-[12px] px-2 py-0.5 rounded font-semibold tabular-nums ${
                        hub.id === 'operations'
                          ? 'bg-[#FEF3F2] text-[#D92D20]'
                          : 'bg-[#FFF6ED] text-[#E56B00]'
                      }`}
                    >
                      {hubBadge}
                    </span>
                  )}
                  {isHubActive ? (
                    <ChevronDown className="w-4 h-4 text-[#2F5BFF]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#8A93A0]" />
                  )}
                </div>
              </button>

              {/* Nested Sub-Tabs when Hub is active */}
              {isHubActive && (
                <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-[#D9E4FF] ml-4 my-1">
                  {hub.subTabs.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubActive = activeTab === sub.id;
                    const badge = getBadgeCount(sub.badgeKey);

                    return (
                      <button
                        key={sub.id}
                        onClick={() => setActiveTab(sub.id)}
                        className={`w-full h-9 flex items-center justify-between px-2.5 text-[13px] rounded-md transition-colors text-left ${
                          isSubActive
                            ? 'bg-[#2F5BFF] text-white font-medium shadow-xs'
                            : 'text-[#5F6875] hover:text-[#18202A] hover:bg-[#F1F3F5] font-normal'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <SubIcon
                            className={`w-4 h-4 shrink-0 ${
                              isSubActive ? 'text-white' : 'text-[#8A93A0]'
                            }`}
                          />
                          <span className="truncate">{sub.label}</span>
                        </div>

                        {badge && (
                          <span
                            className={`text-[11px] px-1.5 py-0.2 rounded font-semibold tabular-nums ${
                              isSubActive
                                ? 'bg-white/20 text-white'
                                : sub.badgeKey === 'alerts'
                                ? 'bg-[#FEF3F2] text-[#D92D20]'
                                : 'bg-[#FFF6ED] text-[#E56B00]'
                            }`}
                          >
                            {badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Utility Actions */}
      <div className="p-3 border-t border-[#E4E7EB] bg-[#FFFFFF] space-y-1">
        <button
          onClick={onOpenIngest}
          className="w-full h-10 flex items-center gap-3 px-3 text-[14px] text-[#5F6875] hover:text-[#18202A] hover:bg-[#F1F3F5] rounded-lg transition-colors text-left font-normal"
        >
          <UploadCloud className="w-[18px] h-[18px] text-[#5F6875] shrink-0" />
          <span className="truncate">Ingest Operational CSV</span>
        </button>

        <button
          onClick={resetDemoToHeroState}
          title="Reset hero incident state"
          className="w-full h-10 flex items-center justify-between px-3 text-[13px] font-medium text-[#5F6875] hover:text-[#18202A] hover:bg-[#F1F3F5] rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <RotateCcw className="w-4 h-4 text-[#8A93A0]" />
            <span>Reset Demo Scenario</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
