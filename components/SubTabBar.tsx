'use client';

import React from 'react';
import { useFactory } from '@/lib/factoryStore';
import { getHubForTab } from '@/lib/navigation';

export function SubTabBar() {
  const { activeTab, setActiveTab, alerts, actionTasks } = useFactory();

  const currentHub = getHubForTab(activeTab);

  const activeAlertsCount = alerts.filter(
    (a) => a.status === 'New' || a.status === 'Action Required' || a.status === 'Investigating'
  ).length;

  const pendingTasksCount = actionTasks.filter(
    (t) => t.status === 'Pending' || t.status === 'Assigned' || t.status === 'In Progress'
  ).length;

  const getBadgeCount = (badgeKey?: 'alerts' | 'tasks') => {
    if (badgeKey === 'alerts') return activeAlertsCount > 0 ? activeAlertsCount : null;
    if (badgeKey === 'tasks') return pendingTasksCount > 0 ? pendingTasksCount : null;
    return null;
  };

  return (
    <div className="bg-[#FFFFFF] border-b border-[#E4E7EB] px-8 sticky top-16 z-10">
      <div className="max-w-[1440px] w-full mx-auto flex items-center justify-between">
        {/* Horizontal Sub-Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-[#8A93A0] mr-3 hidden sm:inline">
            {currentHub.label}:
          </span>

          {currentHub.subTabs.map((sub) => {
            const SubIcon = sub.icon;
            const isActive = activeTab === sub.id;
            const badge = getBadgeCount(sub.badgeKey);

            return (
              <button
                key={sub.id}
                onClick={() => setActiveTab(sub.id)}
                className={`h-9 px-3.5 rounded-lg text-[13px] font-medium flex items-center gap-2 transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#EEF3FF] text-[#2F5BFF] shadow-xs'
                    : 'text-[#5F6875] hover:text-[#18202A] hover:bg-[#F7F8FA]'
                }`}
              >
                <SubIcon
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#2F5BFF]' : 'text-[#8A93A0]'
                  }`}
                />
                <span>{sub.label}</span>
                {badge && (
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded font-semibold tabular-nums ${
                      isActive
                        ? 'bg-[#2F5BFF] text-white'
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

        {/* Right side operational indicator */}
        <div className="hidden lg:flex items-center gap-2 text-[12px] text-[#5F6875] shrink-0 pl-4">
          <span className="w-2 h-2 rounded-full bg-[#18864B] animate-pulse" />
          <span>Real-time factory telemetry live</span>
        </div>
      </div>
    </div>
  );
}
