'use client';

import React, { useState } from 'react';
import { useFactory } from '@/lib/factoryStore';
import {
  Settings,
  Building2,
  Sliders,
  Users,
  Bell,
  Sparkles,
  Save,
  Check,
  Server,
  Radio,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { DataSourcesModal } from '@/components/DataSourcesModal';

export function SettingsModule() {
  const {
    organization,
    factories,
    thresholds,
    updateThresholds,
    users,
    addNotification,
    deviceConnections,
    testConnection,
    isMutationPending,
  } = useFactory();

  const [activeSubTab, setActiveSubTab] = useState<'thresholds' | 'connectivity' | 'org' | 'users' | 'ai'>('thresholds');
  const [formThresholds, setFormThresholds] = useState(thresholds);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isDataSourcesModalOpen, setIsDataSourcesModalOpen] = useState(false);

  const handleSaveThresholds = () => {
    updateThresholds(formThresholds);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
    addNotification({
      title: 'Thresholds Updated',
      message: 'Operational anomaly detection parameters re-calibrated across SCADA historians.',
      severity: 'Low',
      category: 'Production',
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[13px] font-medium text-[#5F6875] mb-1">
            Platform Configuration
          </div>
          <h1 className="text-[32px] leading-[40px] font-semibold text-[#18202A]">
            Settings
          </h1>
          <p className="text-[15px] leading-[24px] text-[#5F6875] mt-2">
            Configure anomaly trigger bounds, industrial PLC/SCADA connectivity, manage user roles, and customize AI inference sensitivity.
          </p>
        </div>
      </div>

      {/* 2. Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E4E7EB] overflow-x-auto">
        {[
          { id: 'thresholds', label: 'Operational Thresholds', icon: Sliders },
          { id: 'connectivity', label: 'Data Sources & Fieldbuses', icon: Server },
          { id: 'org', label: 'Organization & Facility', icon: Building2 },
          { id: 'users', label: 'Users & Roles (RBAC)', icon: Users },
          { id: 'ai', label: 'AI Intelligence Settings', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`h-11 px-4 text-[14px] font-medium border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'border-[#2F5BFF] text-[#2F5BFF]'
                  : 'border-transparent text-[#5F6875] hover:text-[#18202A]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Thresholds Tab Content */}
      {activeSubTab === 'thresholds' && (
        <div className="card-base space-y-6">
          <div>
            <h2 className="text-[18px] leading-[26px] font-semibold text-[#18202A]">
              Anomaly Detection Thresholds
            </h2>
            <p className="text-[14px] text-[#5F6875] mt-1">
              Adjust sensitivity thresholds for automatic anomaly creation across manufacturing lines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Production Variance */}
            <div className="p-5 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB] space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[14px] font-medium text-[#18202A]">Production Drop Threshold</label>
                <span className="h-7 px-2.5 rounded-[6px] text-[13px] font-medium bg-[#EEF3FF] text-[#2F5BFF] border border-[#D9E4FF] inline-flex items-center">
                  -{formThresholds.productionVariancePct}%
                </span>
              </div>
              <p className="text-[13px] text-[#5F6875]">
                Trigger alert when actual output drops below target by this percentage.
              </p>
              <input
                type="range"
                min="5"
                max="30"
                value={formThresholds.productionVariancePct}
                onChange={(e) => setFormThresholds({ ...formThresholds, productionVariancePct: Number(e.target.value) })}
                className="w-full cursor-pointer accent-[#2F5BFF]"
              />
            </div>

            {/* 2. Defect Rate */}
            <div className="p-5 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB] space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[14px] font-medium text-[#18202A]">Defect Rate Anomaly Limit</label>
                <span className="h-7 px-2.5 rounded-[6px] text-[13px] font-medium bg-[#EEF3FF] text-[#2F5BFF] border border-[#D9E4FF] inline-flex items-center">
                  {formThresholds.defectRateThresholdPct}%
                </span>
              </div>
              <p className="text-[13px] text-[#5F6875]">
                Flag quality deviation when sampled lot defects exceed this percentage.
              </p>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.1"
                value={formThresholds.defectRateThresholdPct}
                onChange={(e) => setFormThresholds({ ...formThresholds, defectRateThresholdPct: Number(e.target.value) })}
                className="w-full cursor-pointer accent-[#2F5BFF]"
              />
            </div>

            {/* 3. Machine Vibration */}
            <div className="p-5 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB] space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[14px] font-medium text-[#18202A]">Machine Vibration Limit</label>
                <span className="h-7 px-2.5 rounded-[6px] text-[13px] font-medium bg-[#EEF3FF] text-[#2F5BFF] border border-[#D9E4FF] inline-flex items-center">
                  {formThresholds.vibrationAnomalyMmS} mm/s
                </span>
              </div>
              <p className="text-[13px] text-[#5F6875]">
                Flag machine behavior as abnormal if 3-axis accelerometer RMS exceeds this value.
              </p>
              <input
                type="range"
                min="1.5"
                max="5.0"
                step="0.1"
                value={formThresholds.vibrationAnomalyMmS}
                onChange={(e) => setFormThresholds({ ...formThresholds, vibrationAnomalyMmS: Number(e.target.value) })}
                className="w-full cursor-pointer accent-[#2F5BFF]"
              />
            </div>

            {/* 4. Downtime Minutes */}
            <div className="p-5 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB] space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[14px] font-medium text-[#18202A]">Micro-Stop Duration Alert</label>
                <span className="h-7 px-2.5 rounded-[6px] text-[13px] font-medium bg-[#EEF3FF] text-[#2F5BFF] border border-[#D9E4FF] inline-flex items-center">
                  {formThresholds.downtimeAlertMinutes} mins
                </span>
              </div>
              <p className="text-[13px] text-[#5F6875]">
                Trigger downtime alert if cumulative stoppages in an hour exceed this duration.
              </p>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={formThresholds.downtimeAlertMinutes}
                onChange={(e) => setFormThresholds({ ...formThresholds, downtimeAlertMinutes: Number(e.target.value) })}
                className="w-full cursor-pointer accent-[#2F5BFF]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-[#E4E7EB]">
            <button
              onClick={handleSaveThresholds}
              disabled={isMutationPending('updateThresholds')}
              className="h-10 px-4 text-[14px] font-medium text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isMutationPending('updateThresholds') ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : savedSuccess ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isMutationPending('updateThresholds') ? 'Saving...' : savedSuccess ? 'Thresholds Saved' : 'Save Operational Thresholds'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Connectivity Tab (New transparent UX) */}
      {activeSubTab === 'connectivity' && (
        <div className="card-base space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-[18px] leading-[26px] font-semibold text-[#18202A]">
                Plant Fieldbuses & Data Source Connections
              </h2>
              <p className="text-[14px] text-[#5F6875] mt-1">
                Industrial OT connectors feeding real-time sensor metrics (Vibration, Cycle Time, Temperature) to FactoryLens.
              </p>
            </div>
            <button
              onClick={() => setIsDataSourcesModalOpen(true)}
              className="h-10 px-4 rounded-lg text-[14px] font-medium text-white bg-[#2F5BFF] hover:bg-[#2448D8] transition-colors flex items-center gap-2 shrink-0 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Connect Gateway</span>
            </button>
          </div>

          <div className="space-y-4">
            {deviceConnections.map((conn) => (
              <div
                key={conn.id}
                className="p-5 rounded-xl border border-[#E4E7EB] bg-white hover:border-[#C5D5FE] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="px-2.5 py-1 rounded text-[12px] font-semibold uppercase tracking-wider bg-[#EEF3FF] text-[#2F5BFF]">
                      {conn.protocol}
                    </span>
                    <div>
                      <h3 className="text-[15px] font-semibold text-[#18202A] flex items-center gap-2">
                        {conn.name}
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-medium bg-[#EDFDF2] text-[#18864B]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#18864B] animate-pulse" />
                          {conn.status}
                        </span>
                      </h3>
                      <div className="font-mono text-[12px] text-[#5F6875] mt-1">
                        {conn.endpointUrl}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => testConnection(conn.id)}
                    disabled={isMutationPending(`testConnection:${conn.id}`)}
                    className="h-9 px-3.5 rounded-lg text-[13px] font-medium border border-[#E4E7EB] hover:bg-[#F7F8FA] text-[#18202A] transition-colors flex items-center gap-2 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#5F6875] ${isMutationPending(`testConnection:${conn.id}`) ? 'animate-spin' : ''}`} />
                    <span>{isMutationPending(`testConnection:${conn.id}`) ? 'Pinging...' : 'Ping Test'}</span>
                  </button>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F0F2F5] grid grid-cols-2 md:grid-cols-4 gap-3 text-[13px]">
                  <div>
                    <span className="text-[#8A93A0] block">Polling Interval</span>
                    <span className="font-medium text-[#18202A]">{conn.pollingFrequencyMs} ms</span>
                  </div>
                  <div>
                    <span className="text-[#8A93A0] block">Ping Latency</span>
                    <span className="font-medium text-[#18864B]">{conn.pingLatencyMs} ms</span>
                  </div>
                  <div>
                    <span className="text-[#8A93A0] block">Security</span>
                    <span className="font-medium text-[#18202A] truncate block">{conn.securityMode}</span>
                  </div>
                  <div>
                    <span className="text-[#8A93A0] block">Heartbeat</span>
                    <span className="font-medium text-[#18202A]">{conn.lastHeartbeat}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Org Tab */}
      {activeSubTab === 'org' && (
        <div className="card-base space-y-6">
          <h2 className="text-[18px] leading-[26px] font-semibold text-[#18202A]">
            Enterprise Tenant & Facilities
          </h2>
          <div className="grid grid-cols-2 gap-6 text-[14px]">
            <div>
              <span className="text-[13px] text-[#5F6875]">Organization</span>
              <div className="text-[16px] font-semibold text-[#18202A] mt-1">{organization.name}</div>
              <div className="text-[14px] text-[#5F6875] mt-0.5">{organization.industry}</div>
            </div>
            <div>
              <span className="text-[13px] text-[#5F6875]">Subscription Plan</span>
              <div className="text-[16px] font-semibold text-[#18202A] mt-1">{organization.plan}</div>
              <div className="text-[14px] text-[#5F6875] mt-0.5">Active since {organization.createdAt}</div>
            </div>
          </div>
          <div className="pt-4 border-t border-[#E4E7EB]">
            <h3 className="text-[16px] font-semibold text-[#18202A] mb-3">Registered Facilities</h3>
            <div className="space-y-3">
              {factories.map((fac) => (                <div key={fac.id} className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB] flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[#18202A] text-[15px]">{fac.name}</span>
                    <p className="text-[13px] text-[#5F6875] mt-0.5">{fac.location} · {fac.timezone}</p>
                  </div>
                  <span className="text-[13px] font-medium text-[#5F6875]">
                    {fac.activeLinesCount} active lines
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeSubTab === 'users' && (
        <div className="card-base space-y-4">
          <h2 className="text-[18px] leading-[26px] font-semibold text-[#18202A]">
            User Roles & Access Control
          </h2>
          <div className="border border-[#E4E7EB] rounded-xl overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-[#F7F8FA] text-[#5F6875] font-medium border-b border-[#E4E7EB] text-[13px]">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4 text-right">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EB]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F7F8FA] h-14">
                    <td className="py-4 px-4 font-semibold text-[#18202A]">{u.name}</td>
                    <td className="py-4 px-4 text-[#5F6875]">{u.email}</td>
                    <td className="py-4 px-4 text-[#5F6875]">{u.title}</td>
                    <td className="py-4 px-4 text-right">
                      <span className="h-7 px-2.5 rounded-[6px] text-[13px] font-medium bg-[#F1F3F5] text-[#5F6875] inline-flex items-center">
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Tab */}
      {activeSubTab === 'ai' && (
        <div className="card-base space-y-6 text-[14px]">
          <div>
            <h2 className="text-[18px] leading-[26px] font-semibold text-[#18202A]">
              AI Reasoning Configuration
            </h2>
            <p className="text-[14px] text-[#5F6875] mt-1">
              Google GenAI Gemini 3.8 Flash operational synthesis settings.
            </p>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB] flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#18202A]">Minimum AI Confidence Threshold</div>
                <div className="text-[13px] text-[#5F6875]">Only surface root causes with statistical confidence above:</div>
              </div>
              <span className="text-[14px] font-semibold text-[#18202A]">10%</span>
            </div>
            <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB] flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#18202A]">Historical Lookback Window</div>
                <div className="text-[13px] text-[#5F6875]">Window for matching recurring maintenance component patterns:</div>
              </div>
              <span className="text-[14px] font-semibold text-[#18202A]">30 Days</span>
            </div>
            <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB] flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#18202A]">Human-in-the-Loop Action Approval</div>
                <div className="text-[13px] text-[#5F6875]">Require manager approval before creating operational maintenance work orders:</div>
              </div>
              <span className="h-7 px-2.5 rounded-[6px] text-[13px] font-medium bg-[#EDFDF2] text-[#18864B] inline-flex items-center">
                Enabled
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Data Sources Modal */}
      <DataSourcesModal
        isOpen={isDataSourcesModalOpen}
        onClose={() => setIsDataSourcesModalOpen(false)}
      />
    </div>
  );
}
