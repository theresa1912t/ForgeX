'use client';

import React from 'react';
import { useFactory } from '@/lib/factoryStore';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  ExternalLink,
  BellOff,
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setActiveTab,
    setSelectedInvestigationId,
    setSelectedAlertId,
  } = useFactory();

  if (!isOpen) return null;

  const handleNotificationClick = (notif: (typeof notifications)[0]) => {
    markNotificationAsRead(notif.id);
    if (notif.linkModule) {
      setActiveTab(notif.linkModule);
      if (notif.linkId) {
        if (notif.linkModule === 'investigations') {
          setSelectedInvestigationId(notif.linkId);
        } else if (notif.linkModule === 'alerts') {
          setSelectedAlertId(notif.linkId);
        }
      }
      onClose();
    }
  };

  const getSeverityIcon = (sev: string) => {
    switch (sev) {
      case 'Critical':
        return <AlertOctagon className="w-4 h-4 text-[#D92D20] shrink-0" />;
      case 'High':
        return <AlertTriangle className="w-4 h-4 text-[#E56B00] shrink-0" />;
      case 'Medium':
        return <Info className="w-4 h-4 text-[#B78103] shrink-0" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-[#18864B] shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#18202A]/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-[#E4E7EB]">
        {/* Header */}
        <div className="h-16 px-6 border-b border-[#E4E7EB] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <h3 className="text-[16px] font-semibold text-[#18202A]">Notifications</h3>
            <span className="h-6 px-2 text-[13px] font-medium rounded-full bg-[#F1F3F5] text-[#5F6875] inline-flex items-center">
              {notifications.filter((n) => !n.read).length} new
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={markAllNotificationsAsRead}
              className="text-[13px] text-[#5F6875] hover:text-[#18202A] hover:underline"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1 text-[#8A93A0] hover:text-[#18202A] rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-20 text-center text-[#5F6875]">
              <BellOff className="w-8 h-8 mx-auto mb-2 text-[#8A93A0]" />
              <p className="text-[14px]">No active notifications</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  notif.read
                    ? 'bg-white border-[#E4E7EB] hover:bg-[#F7F8FA]'
                    : 'bg-[#F8FAFF] border-[#D9E4FF] shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getSeverityIcon(notif.severity)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[14px] font-semibold text-[#18202A] truncate">
                        {notif.title}
                      </span>
                      <span className="text-[13px] text-[#8A93A0] shrink-0 ml-2">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-[14px] leading-[22px] text-[#5F6875]">
                      {notif.message}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-[13px]">
                      <span className="font-medium text-[#5F6875]">
                        {notif.category}
                      </span>
                      {notif.linkModule && (
                        <span className="text-[#2F5BFF] font-medium flex items-center gap-1 hover:underline">
                          View in {notif.linkModule}
                          <ExternalLink className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
