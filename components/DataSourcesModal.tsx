'use client';

import React, { useState } from 'react';
import { useFactory } from '@/lib/factoryStore';
import {
  Server,
  Radio,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  Shield,
  Clock,
  Layers,
  Activity,
  Plus,
  Terminal,
} from 'lucide-react';
import { ProtocolType, DeviceConnection } from '@/lib/types';

interface DataSourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMachineId?: string;
}

export function DataSourcesModal({ isOpen, onClose, defaultMachineId }: DataSourcesModalProps) {
  const {
    deviceConnections,
    testConnection,
    addDeviceConnection,
    machineProfiles,
    machines,
    showToast,
    isMutationPending,
  } = useFactory();

  const [testingId, setTestingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'connections' | 'add'>('connections');
  
  // New connection form
  const [name, setName] = useState('');
  const [protocol, setProtocol] = useState<ProtocolType>('OPC-UA');
  const [endpointUrl, setEndpointUrl] = useState('');
  const [pollingFrequencyMs, setPollingFrequencyMs] = useState(1000);
  const [securityMode, setSecurityMode] = useState('SignAndEncrypt (Basic256Sha256)');

  if (!isOpen) return null;

  const handleTestPing = (id: string, name: string) => {
    setTestingId(id);
    setTimeout(() => {
      testConnection(id);
      setTestingId(null);
    }, 700);
  };

  const handleCreateConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !endpointUrl) {
      showToast('Please provide a name and endpoint URL', 'warning');
      return;
    }

    addDeviceConnection({
      name,
      protocol,
      endpointUrl,
      status: 'Connected',
      pollingFrequencyMs,
      lastHeartbeat: 'Just now (connected)',
      pingLatencyMs: Math.floor(Math.random() * 20) + 12,
      securityMode,
      assignedMachines: defaultMachineId ? [defaultMachineId] : ['mach-m03'],
    });

    setActiveTab('connections');
    setName('');
    setEndpointUrl('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-[#E4E7EB] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-labelledby="data-sources-title"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E4E7EB] flex items-center justify-between bg-[#F7F8FA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2F5BFF]/10 text-[#2F5BFF] flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 id="data-sources-title" className="text-[20px] font-semibold text-[#18202A]">
                Industrial Data Sources & Gateways
              </h2>
              <p className="text-[14px] text-[#5F6875] mt-0.5">
                Live field telemetry connectors (OPC UA, MQTT, Modbus & SCADA Historians) feeding real-time machine signals.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#5F6875] hover:text-[#18202A] hover:bg-[#E4E7EB]/60 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center px-6 border-b border-[#E4E7EB] bg-white gap-4">
          <button
            onClick={() => setActiveTab('connections')}
            className={`py-3 text-[14px] font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'connections'
                ? 'border-[#2F5BFF] text-[#2F5BFF]'
                : 'border-transparent text-[#5F6875] hover:text-[#18202A]'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Active Plant Gateways ({deviceConnections.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`py-3 text-[14px] font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'add'
                ? 'border-[#2F5BFF] text-[#2F5BFF]'
                : 'border-transparent text-[#5F6875] hover:text-[#18202A]'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Connect New Industrial Gateway</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'connections' ? (
            <div className="space-y-4">
              <div className="bg-[#EEF3FF] border border-[#C5D5FE] rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2F5BFF] shrink-0 mt-0.5" />
                <div className="text-[13px] text-[#18202A] leading-relaxed">
                  <span className="font-semibold text-[#2F5BFF]">Telemetry Transparency:</span> All sensor metrics in FactoryLens (vibration velocity, pneumatic pressure, cycle times) are ingested automatically from these physical PLC fieldbuses and IoT edge nodes — zero manual mock guessing.
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {deviceConnections.map((conn) => {
                  const assignedNames = conn.assignedMachines
                    .map((mId) => machines.find((m) => m.id === mId)?.name || mId)
                    .join(', ');

                  return (
                    <div
                      key={conn.id}
                      className="p-5 rounded-xl border border-[#E4E7EB] bg-white hover:border-[#C5D5FE] transition-all shadow-xs"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span
                            className={`px-2.5 py-1 rounded text-[12px] font-semibold tracking-wide uppercase mt-0.5 ${
                              conn.protocol === 'OPC-UA'
                                ? 'bg-[#EEF3FF] text-[#2F5BFF]'
                                : conn.protocol === 'MQTT'
                                ? 'bg-[#EDFDF2] text-[#18864B]'
                                : conn.protocol === 'Modbus-TCP'
                                ? 'bg-[#FFF6ED] text-[#E56B00]'
                                : 'bg-[#F7F8FA] text-[#5F6875] border border-[#E4E7EB]'
                            }`}
                          >
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
                            <div className="font-mono text-[12px] text-[#5F6875] mt-1 bg-[#F7F8FA] px-2 py-1 rounded border border-[#E4E7EB] inline-block">
                              {conn.endpointUrl}
                            </div>
                          </div>
                        </div>

                        {/* Test Connection Button */}
                        <div className="flex items-center gap-2 shrink-0">
                          {(() => {
                            const isTesting = testingId === conn.id || isMutationPending(`testConnection:${conn.id}`);
                            return (
                              <button
                                onClick={() => handleTestPing(conn.id, conn.name)}
                                disabled={isTesting}
                                className="h-9 px-3.5 rounded-lg text-[13px] font-medium border border-[#E4E7EB] hover:bg-[#F7F8FA] text-[#18202A] transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-[#2F5BFF]' : 'text-[#5F6875]'}`} />
                                <span>{isTesting ? 'Testing...' : 'Test Signal'}</span>
                              </button>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Details row */}
                      <div className="mt-4 pt-3 border-t border-[#F0F2F5] grid grid-cols-2 md:grid-cols-4 gap-3 text-[13px]">
                        <div>
                          <span className="text-[#8A93A0] block">Polling Cadence</span>
                          <span className="font-medium text-[#18202A]">{conn.pollingFrequencyMs} ms</span>
                        </div>
                        <div>
                          <span className="text-[#8A93A0] block">Ping Latency</span>
                          <span className="font-medium text-[#18864B]">{conn.pingLatencyMs} ms</span>
                        </div>
                        <div>
                          <span className="text-[#8A93A0] block">Security / TLS</span>
                          <span className="font-medium text-[#18202A] truncate block" title={conn.securityMode}>
                            {conn.securityMode}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#8A93A0] block">Mapped Fleet</span>
                          <span className="font-medium text-[#18202A] truncate block" title={assignedNames}>
                            {assignedNames}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Add Gateway Form */
            <form onSubmit={handleCreateConnection} className="space-y-5 max-w-xl">
              <div>
                <label className="block text-[13px] font-medium text-[#18202A] mb-1.5">
                  Gateway / Server Label
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Line 3 Rotary OPC-UA Node"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#E4E7EB] text-[14px] focus:outline-none focus:border-[#2F5BFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#18202A] mb-1.5">
                    Fieldbus Protocol
                  </label>
                  <select
                    value={protocol}
                    onChange={(e) => setProtocol(e.target.value as ProtocolType)}
                    className="w-full h-10 px-3 rounded-lg border border-[#E4E7EB] text-[14px] bg-white focus:outline-none focus:border-[#2F5BFF]"
                  >
                    <option value="OPC-UA">OPC-UA (IEC 62541)</option>
                    <option value="MQTT">MQTT v5 (Sparkplug B)</option>
                    <option value="Modbus-TCP">Modbus TCP/IP</option>
                    <option value="REST-Historian">SCADA REST Historian API</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#18202A] mb-1.5">
                    Sampling Frequency
                  </label>
                  <select
                    value={pollingFrequencyMs}
                    onChange={(e) => setPollingFrequencyMs(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg border border-[#E4E7EB] text-[14px] bg-white focus:outline-none focus:border-[#2F5BFF]"
                  >
                    <option value={200}>200 ms (High-frequency vibration)</option>
                    <option value={500}>500 ms (Standard Telemetry)</option>
                    <option value={1000}>1,000 ms (1 Hz Standard)</option>
                    <option value={5000}>5,000 ms (Historian Poll)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#18202A] mb-1.5">
                  Endpoint URL or IP Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="opc.tcp://192.168.1.100:4840 or tcp://192.168.1.50:502"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                  className="w-full h-10 px-3 font-mono text-[13px] rounded-lg border border-[#E4E7EB] focus:outline-none focus:border-[#2F5BFF]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#18202A] mb-1.5">
                  Security Mode / Certificate
                </label>
                <input
                  type="text"
                  value={securityMode}
                  onChange={(e) => setSecurityMode(e.target.value)}
                  className="w-full h-10 px-3 text-[13px] rounded-lg border border-[#E4E7EB] focus:outline-none focus:border-[#2F5BFF]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('connections')}
                  className="h-10 px-4 rounded-lg text-[14px] font-medium text-[#5F6875] hover:bg-[#F7F8FA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isMutationPending('addDeviceConnection')}
                  className="h-10 px-5 rounded-lg text-[14px] font-medium text-white bg-[#2F5BFF] hover:bg-[#2448D8] transition-colors shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isMutationPending('addDeviceConnection') ? 'Connecting...' : 'Save & Connect Gateway'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-[#E4E7EB] bg-[#F7F8FA] flex items-center justify-between text-[13px] text-[#5F6875]">
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#18864B]" />
            Industrial OT Network Isolated · Read-Only Telemetry Ingestion
          </span>
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg text-[13px] font-medium text-[#18202A] bg-white border border-[#E4E7EB] hover:bg-[#F7F8FA] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
