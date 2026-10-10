'use client';

import React, { useState } from 'react';
import { useFactory } from '@/lib/factoryStore';
import { UserRole } from '@/lib/types';
import {
  Building2,
  Calendar,
  Bell,
  Search,
  UserCheck,
  ChevronDown,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  onToggleNotifications: () => void;
  unreadCount: number;
}

export function Header({ onToggleNotifications, unreadCount }: HeaderProps) {
  const {
    factories,
    selectedFactoryId,
    setSelectedFactoryId,
    currentUser,
    users,
    setCurrentUserId,
    currentRole,
    setCurrentRole,
    setActiveTab,
    resetDemoToHeroState,
  } = useFactory();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showFactoryMenu, setShowFactoryMenu] = useState(false);
  const [dateRange, setDateRange] = useState('Today (Shift B · 07:00 - 15:00)');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedFactory = factories.find((f) => f.id === selectedFactoryId) || factories[0];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setActiveTab('ai-assistant');
  };

  return (
    <header className="h-16 bg-[#FFFFFF] border-b border-[#E4E7EB] px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Factory Selector & Date Filter */}
      <div className="flex items-center gap-3">
        {/* Factory Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowFactoryMenu(!showFactoryMenu)}
            className="h-10 flex items-center gap-2.5 px-3.5 text-[14px] font-medium text-[#18202A] bg-[#FFFFFF] hover:bg-[#F7F8FA] border border-[#E4E7EB] rounded-lg transition-colors"
          >
            <Building2 className="w-4 h-4 text-[#5F6875]" />
            <span className="truncate max-w-[200px]">{selectedFactory.name}</span>
            <ChevronDown className="w-4 h-4 text-[#8A93A0]" />
          </button>

          {showFactoryMenu && (
            <div className="absolute left-0 mt-1.5 w-72 bg-[#FFFFFF] rounded-xl shadow-lg border border-[#E4E7EB] py-1.5 z-50">
              <div className="px-4 py-2 text-[13px] font-medium text-[#8A93A0]">
                Select Facility
              </div>
              {factories.map((fac) => (
                <button
                  key={fac.id}
                  onClick={() => {
                    setSelectedFactoryId(fac.id);
                    setShowFactoryMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-[14px] flex flex-col hover:bg-[#F7F8FA] ${
                    fac.id === selectedFactoryId ? 'bg-[#EEF3FF] font-medium text-[#2F5BFF]' : 'text-[#18202A]'
                  }`}
                >
                  <span>{fac.name}</span>
                  <span className="text-[13px] text-[#5F6875]">{fac.location} · {fac.activeLinesCount} active lines</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date / Shift Picker */}
        <div className="h-10 flex items-center gap-2 px-3.5 text-[14px] text-[#5F6875] bg-[#FFFFFF] border border-[#E4E7EB] rounded-lg">
          <Calendar className="w-4 h-4 text-[#8A93A0]" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-transparent border-none text-[14px] font-normal text-[#18202A] focus:outline-none cursor-pointer"
          >
            <option value="Today (Shift B · 07:00 - 15:00)">Today (Shift B · 07:00 - 15:00)</option>
            <option value="Shift A (Previous · 23:00 - 07:00)">Shift A (Previous · 23:00 - 07:00)</option>
            <option value="Last 24 Hours">Last 24 Hours</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Month to Date">Month to Date (October 2026)</option>
          </select>
        </div>
      </div>

      {/* Center: Search & Operational Question */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center w-80 lg:w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#8A93A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Ask AI or search operations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-9 text-[14px] bg-[#F7F8FA] border border-[#E4E7EB] rounded-lg placeholder-[#8A93A0] text-[#18202A] focus:outline-none focus:border-[#2F5BFF] focus:bg-[#FFFFFF] transition-colors"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8A93A0] hover:text-[#2F5BFF]"
            title="Ask AI Assistant"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Right: Actions, Notifications & User Persona */}
      <div className="flex items-center gap-3">
        {/* Reset Demo Button */}
        <button
          onClick={resetDemoToHeroState}
          title="Reset hero incident state"
          className="hidden sm:flex items-center gap-2 h-10 px-3 text-[14px] font-normal text-[#5F6875] hover:text-[#18202A] bg-[#FFFFFF] hover:bg-[#F7F8FA] border border-[#E4E7EB] rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-[#8A93A0]" />
          <span className="hidden lg:inline text-[13px]">Reset Scenario</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={onToggleNotifications}
          className="relative h-10 w-10 flex items-center justify-center text-[#5F6875] hover:text-[#18202A] hover:bg-[#F7F8FA] border border-[#E4E7EB] rounded-lg transition-colors"
          title="Operational Notifications"
        >
          <Bell className="w-[18px] h-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#D92D20] ring-2 ring-white" />
          )}
        </button>

        {/* User Profile & Persona Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="h-10 flex items-center gap-2.5 pl-2 pr-3 rounded-lg border border-[#E4E7EB] bg-[#FFFFFF] hover:bg-[#F7F8FA] transition-colors"
          >
            <div className="w-7 h-7 rounded-md bg-[#EEF3FF] text-[#2F5BFF] font-semibold text-[13px] flex items-center justify-center">
              {currentUser.avatar || 'OP'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-[14px] font-medium text-[#18202A] leading-tight flex items-center gap-1.5">
                {currentUser.name}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-[#8A93A0]" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-1.5 w-72 bg-[#FFFFFF] rounded-xl shadow-lg border border-[#E4E7EB] py-2 z-50">
              <div className="px-4 py-1.5 text-[13px] font-medium text-[#8A93A0]">
                Switch Demo Persona
              </div>
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setCurrentUserId(u.id);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-[14px] flex items-start gap-3 hover:bg-[#F7F8FA] ${
                    u.id === currentUser.id ? 'bg-[#EEF3FF] font-medium text-[#2F5BFF]' : 'text-[#18202A]'
                  }`}
                >
                  <div className="w-7 h-7 rounded-md bg-[#F1F3F5] text-[#5F6875] font-semibold text-[13px] flex items-center justify-center shrink-0 mt-0.5">
                    {u.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{u.name}</span>
                      <span className="text-[13px] px-1.5 py-0.2 rounded bg-[#F1F3F5] text-[#5F6875]">
                        {u.role}
                      </span>
                    </div>
                    <div className="text-[13px] text-[#5F6875] truncate">{u.title}</div>
                  </div>
                </button>
              ))}

              <div className="border-t border-[#E4E7EB] my-1.5 pt-2 px-4 py-1 bg-[#F7F8FA]">
                <div className="text-[13px] font-medium text-[#5F6875] mb-2 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#5F6875]" />
                  Role Permission Override:
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Admin', 'Manager', 'Viewer'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setCurrentRole(r);
                        setShowRoleMenu(false);
                      }}
                      className={`h-8 text-[13px] rounded-md text-center font-medium border transition-colors ${
                        currentRole === r
                          ? 'bg-[#2F5BFF] text-white border-[#2F5BFF]'
                          : 'bg-[#FFFFFF] text-[#5F6875] border-[#E4E7EB] hover:bg-[#F1F3F5]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
