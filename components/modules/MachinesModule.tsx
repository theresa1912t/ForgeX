'use client';

import React, { useState } from 'react';
import { useFactory } from '@/lib/factoryStore';
import {
  Cpu,
  Activity,
  AlertTriangle,
  Wrench,
  SearchCode,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Server,
  Radio,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Wifi,
  Sparkles,
  Layers,
  Flame,
  Boxes,
  TrendingDown,
} from 'lucide-react';
import { DataSourcesModal } from '@/components/DataSourcesModal';
import { HealthFormulaModal } from '@/components/HealthFormulaModal';
import { formatCurrency } from '@/lib/calculations';

export function MachinesModule() {
  const {
    machines,
    selectedMachineId,
    setSelectedMachineId,
    maintenanceRecords,
    downtimeRecords,
    wasteRecords,
    ingredientUsageRecords,
    setActiveTab,
    setSelectedInvestigationId,
    openInvestigation,
    machineProfiles,
    deviceConnections,
  } = useFactory();

  const [isDataSourcesOpen, setIsDataSourcesOpen] = useState(false);
  const [isHealthFormulaOpen, setIsHealthFormulaOpen] = useState(false);

  const currentMachine =
    machines.find((m) => m.id === selectedMachineId) ||
    machines.find((m) => m.id === 'mach-m03') ||
    machines[0];

  const currentProfile = machineProfiles[currentMachine.id] || machineProfiles['mach-m03'];
  const currentGateway = deviceConnections.find((c) => c.id === currentProfile?.gatewayId);

  const machineMaint = maintenanceRecords.filter((r) => r.machineId === currentMachine.id);
  const machineDown = downtimeRecords.filter((r) => r.machineId === currentMachine.id);
  const machineWaste = wasteRecords.filter((w) => w.machineId === currentMachine.id);
  const machineIngredients = ingredientUsageRecords.filter((ing) => ing.machineId === currentMachine.id);
  const machineWasteKg = machineWaste.reduce((acc, w) => acc + w.wasteQuantityKg, 0);
  const machineWasteCost = machineWaste.reduce((acc, w) => acc + w.wasteCost, 0);

  return (
    <div className="space-y-8">
      {/* 1. Page Header with Data Sources Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[13px] font-medium text-[#5F6875] mb-1">
            Equipment Fleet & Physical OT Telemetry
          </div>
          <h1 className="text-[32px] leading-[40px] font-semibold text-[#18202A]">
            Machines
          </h1>
          <p className="text-[15px] leading-[24px] text-[#5F6875] mt-2">
            Sensor telemetry streaming from PLC fieldbuses (OPC UA, MQTT, Modbus), mechanical vibration harmonics, and real-time health scores.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Transparent Connectivity Action */}
          <button
            onClick={() => setIsDataSourcesOpen(true)}
            className="h-10 px-4 rounded-lg text-[14px] font-medium bg-white text-[#18202A] border border-[#E4E7EB] hover:bg-[#F7F8FA] hover:border-[#2F5BFF]/40 transition-colors shadow-xs flex items-center gap-2"
          >
            <Server className="w-4 h-4 text-[#2F5BFF]" />
            <span>Industrial Gateways ({deviceConnections.length} Active)</span>
          </button>
          <span className="h-10 px-3.5 rounded-lg text-[14px] font-medium bg-[#EDFDF2] text-[#18864B] border border-[#A6F4C5] inline-flex items-center">
            {machines.filter((m) => m.status === 'Normal').length} of {machines.length} Machines Normal
          </span>
        </div>
      </div>

      {/* 2. Fleet Overview Table */}
      <div className="card-base">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h2 className="text-[18px] leading-[26px] font-semibold text-[#18202A]">
            Equipment Fleet Overview
          </h2>
          <span className="text-[13px] text-[#5F6875]">
            Click any row to inspect mapped sensor tags & gateway bindings
          </span>
        </div>

        <div className="border border-[#E4E7EB] rounded-xl overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-[#F7F8FA] text-[#5F6875] font-medium border-b border-[#E4E7EB] text-[13px]">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Machine Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Health Score</th>
                <th className="py-3 px-4">Vibration</th>
                <th className="py-3 px-4">Cycle Time</th>
                <th className="py-3 px-4">Loss Contribution</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EB]">
              {machines.map((m) => {
                const isSelected = m.id === currentMachine.id;
                return (
                  <tr
                    key={m.id}
                    onClick={() => setSelectedMachineId(m.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#EEF3FF]/70'
                        : 'hover:bg-[#F7F8FA]'
                    }`}
                  >
                    <td className="py-4 px-4 font-mono font-medium text-[13px] text-[#18202A]">
                      {m.code}
                    </td>
                    <td className="py-4 px-4 font-medium text-[#18202A]">
                      {m.name}
                      {isSelected && (
                        <span className="ml-2 text-[11px] font-semibold uppercase tracking-wider text-[#2F5BFF] bg-[#2F5BFF]/10 px-1.5 py-0.5 rounded">
                          Selected
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-[#5F6875]">{m.type}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[13px] font-medium ${
                          m.status === 'Normal'
                            ? 'bg-[#EDFDF2] text-[#18864B]'
                            : m.status === 'Elevated Risk'
                            ? 'bg-[#FEF3F2] text-[#D92D20]'
                            : 'bg-[#FFF6ED] text-[#E56B00]'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${
                          m.healthScorePct >= 90 ? 'text-[#18864B]' : m.healthScorePct >= 75 ? 'text-[#E56B00]' : 'text-[#D92D20]'
                        }`}>
                          {m.healthScorePct}%
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMachineId(m.id);
                            setIsHealthFormulaOpen(true);
                          }}
                          className="text-[#8A93A0] hover:text-[#2F5BFF] transition-colors p-0.5 rounded"
                          title="Explain Health Score Calculation"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className={`py-4 px-4 font-medium ${m.vibrationMmS > 3.0 ? 'text-[#D92D20]' : 'text-[#18202A]'}`}>
                      {m.vibrationMmS} mm/s
                    </td>
                    <td className="py-4 px-4 text-[#5F6875]">{m.cycleTimeSec}s</td>
                    <td className="py-4 px-4 font-semibold text-[#D92D20]">
                      {m.productionLossContributionPct}%
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMachineId(m.id);
                        }}
                        className="text-[14px] text-[#2F5BFF] hover:underline font-medium"
                      >
                        View Telemetry
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Selected Machine Telemetry Details */}
      <div className="card-base space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#E4E7EB] gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-[22px] leading-[30px] font-semibold text-[#18202A]">
                {currentMachine.name} Telemetry Details
              </h2>
              <span className="h-7 px-2.5 rounded-[6px] text-[13px] font-medium bg-[#F1F3F5] text-[#5F6875]">
                {currentMachine.type}
              </span>
              <button
                onClick={() => setIsHealthFormulaOpen(true)}
                className="h-7 px-2.5 rounded-[6px] text-[12px] font-semibold bg-[#EEF3FF] text-[#2F5BFF] hover:bg-[#2F5BFF]/15 transition-colors flex items-center gap-1.5"
              >
                <span>Health: {currentMachine.healthScorePct}%</span>
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[14px] text-[#5F6875] mt-1">
              Line {currentMachine.lineId.replace('line-', '')} · Last PM: {currentMachine.lastMaintenanceDate} · Next PM: {currentMachine.nextScheduledMaintenance}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsDataSourcesOpen(true)}
              className="h-10 px-3.5 text-[14px] font-medium text-[#18202A] bg-[#F7F8FA] hover:bg-[#E4E7EB]/60 border border-[#E4E7EB] rounded-lg transition-colors flex items-center gap-2"
            >
              <Radio className="w-4 h-4 text-[#2F5BFF]" />
              <span>Gateway Binding</span>
            </button>

            {currentMachine.id === 'mach-m03' && (
              <button
                onClick={() => {
                  setActiveTab('investigations');
                  setSelectedInvestigationId('inv-line3-hero');
                }}
                className="h-10 px-4 text-[14px] font-medium text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-lg transition-colors shadow-sm flex items-center gap-2"
              >
                <SearchCode className="w-4 h-4" />
                <span>Open Root Cause Investigation</span>
              </button>
            )}
          </div>
        </div>

        {/* Real-time Sensor Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB]">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#5F6875]">Vibration RMS</span>
              <span className="w-2 h-2 rounded-full bg-[#18864B] animate-pulse" title="Live stream" />
            </div>
            <div className={`text-[22px] font-semibold mt-1 ${currentMachine.vibrationMmS > 3.0 ? 'text-[#D92D20]' : 'text-[#18202A]'}`}>
              {currentMachine.vibrationMmS} mm/s
            </div>
            <div className="text-[13px] text-[#8A93A0] mt-0.5">Threshold: 3.0 mm/s</div>
          </div>

          <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB]">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#5F6875]">Temperature</span>
              <span className="w-2 h-2 rounded-full bg-[#18864B] animate-pulse" title="Live stream" />
            </div>
            <div className="text-[22px] font-semibold text-[#18202A] mt-1">{currentMachine.temperatureC}°C</div>
            <div className="text-[13px] text-[#8A93A0] mt-0.5">Manifold / Jacket</div>
          </div>

          <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB]">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#5F6875]">Pneumatic Pressure</span>
              <span className="w-2 h-2 rounded-full bg-[#18864B] animate-pulse" title="Live stream" />
            </div>
            <div className="text-[22px] font-semibold text-[#18202A] mt-1">{currentMachine.pressureBar} bar</div>
            <div className="text-[13px] text-[#8A93A0] mt-0.5">Supply line</div>
          </div>

          <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB]">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#5F6875]">Cycle Time</span>
              <span className="w-2 h-2 rounded-full bg-[#18864B] animate-pulse" title="Live stream" />
            </div>
            <div className={`text-[22px] font-semibold mt-1 ${currentMachine.cycleTimeSec > 2.0 ? 'text-[#D92D20]' : 'text-[#18202A]'}`}>
              {currentMachine.cycleTimeSec}s
            </div>
            <div className="text-[13px] text-[#8A93A0] mt-0.5">Nominal: 1.80s</div>
          </div>

          <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB]">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#5F6875]">Operating Speed</span>
              <span className="w-2 h-2 rounded-full bg-[#18864B] animate-pulse" title="Live stream" />
            </div>
            <div className="text-[22px] font-semibold text-[#18202A] mt-1">{currentMachine.operatingSpeedRpm} RPM</div>
            <div className="text-[13px] text-[#8A93A0] mt-0.5">Rotary turret</div>
          </div>

          <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB]">
            <span className="text-[13px] text-[#5F6875]">Downtime This Week</span>
            <div className="text-[22px] font-semibold text-[#18202A] mt-1">{currentMachine.downtimeHoursThisWeek}h</div>
            <div className="text-[13px] text-[#8A93A0] mt-0.5">Stoppage total</div>
          </div>
        </div>

        {/* 4. Telemetry Source & Hardware Tag Mapping Section (UX Transparency) */}
        <div className="p-5 rounded-xl border border-[#C5D5FE] bg-[#F7F9FF] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#2F5BFF] text-white flex items-center justify-center shrink-0">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-[#18202A] flex items-center gap-2">
                  <span>Physical Data Source & Signal Origin</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-[#EDFDF2] text-[#18864B]">
                    Active Streaming
                  </span>
                </h3>
                <p className="text-[13px] text-[#5F6875]">
                  Connected PLC Controller: <strong className="text-[#18202A]">{currentProfile?.plcType || 'Siemens S7-1500'}</strong> ({currentProfile?.ipAddress || '192.168.10.45'}) via <strong className="text-[#18202A]">{currentGateway?.name || 'OPC-UA Server'}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsHealthFormulaOpen(true)}
                className="h-9 px-3.5 rounded-lg text-[13px] font-medium text-[#2F5BFF] bg-white border border-[#C5D5FE] hover:bg-[#EEF3FF] transition-colors flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Explain Health Score ({currentMachine.healthScorePct}%)</span>
              </button>
              <button
                onClick={() => setIsDataSourcesOpen(true)}
                className="h-9 px-3.5 rounded-lg text-[13px] font-medium text-[#18202A] bg-white border border-[#E4E7EB] hover:bg-[#F7F8FA] transition-colors flex items-center gap-1.5"
              >
                <Server className="w-3.5 h-3.5 text-[#5F6875]" />
                <span>Manage Gateways</span>
              </button>
            </div>
          </div>

          {/* Sensor Tag Mapping Table */}
          <div className="border border-[#E4E7EB] rounded-lg overflow-x-auto bg-white">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#F7F8FA] text-[#5F6875] font-medium border-b border-[#E4E7EB] text-[12px]">
                <tr>
                  <th className="py-2.5 px-3">Telemetry Metric</th>
                  <th className="py-2.5 px-3">PLC Tag / Register Address</th>
                  <th className="py-2.5 px-3">Sampling Rate</th>
                  <th className="py-2.5 px-3">Live Value</th>
                  <th className="py-2.5 px-3">Protocol / Gateway</th>
                  <th className="py-2.5 px-3 text-right">Stream Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EB]">
                {(currentProfile?.tags || []).map((tag) => (
                  <tr key={tag.metricKey} className="hover:bg-[#F7F8FA]/60">
                    <td className="py-2.5 px-3 font-medium text-[#18202A]">
                      {tag.label}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[12px] text-[#5F6875]">
                      {tag.tagAddress}
                    </td>
                    <td className="py-2.5 px-3 text-[#5F6875]">
                      {tag.samplingRateHz} Hz ({tag.dataType})
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#18202A]">
                      {tag.lastRawValue} {tag.unit}
                    </td>
                    <td className="py-2.5 px-3 text-[#5F6875]">
                      {tag.sourceGateway}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#18864B]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#18864B] animate-pulse" />
                        {tag.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Material & Waste Telemetry Impact Section */}
        <div className="p-5 rounded-xl border border-[#FEDF89] bg-[#FFFCF5] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#FEDF89]/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#E56B00] text-white flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-[#18202A] flex items-center gap-2">
                  <span>Material Consumption & Scrap Impact</span>
                  {machineWasteKg > 0 && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-[#FEF3F2] text-[#D92D20]">
                      {machineWasteKg} kg Scrap Generated
                    </span>
                  )}
                </h3>
                <p className="text-[13px] text-[#5F6875]">
                  Automated correlation between mechanical sensor telemetry and checkweigher / reject bin loss
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('waste-energy')}
                className="h-8 px-3 text-[13px] font-medium text-[#18202A] bg-white border border-[#E4E7EB] hover:bg-[#F7F8FA] rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Boxes className="w-3.5 h-3.5 text-[#5F6875]" />
                <span>View Full Waste Log</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 bg-white rounded-lg border border-[#E4E7EB]">
              <span className="text-[12px] text-[#5F6875]">Cumulative Shift Scrap</span>
              <div className="text-[20px] font-semibold font-mono text-[#18202A] mt-1 tabular-nums">
                {machineWasteKg} <span className="text-[13px] font-normal text-[#5F6875]">kg</span>
              </div>
              <div className="text-[12px] font-mono text-[#D92D20] mt-0.5">
                {formatCurrency(machineWasteCost)} direct loss
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-lg border border-[#E4E7EB]">
              <span className="text-[12px] text-[#5F6875]">Active Batch In-Process</span>
              <div className="text-[14px] font-semibold text-[#18202A] mt-1 truncate">
                {machineIngredients[0]?.materialName || 'Standard Production Batch'}
              </div>
              <div className="text-[12px] font-mono text-[#5F6875] mt-0.5">
                {machineIngredients[0] ? `Lot #${machineIngredients[0].batchCode}` : 'Recipe Nominal'}
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-lg border border-[#E4E7EB]">
              <span className="text-[12px] text-[#5F6875]">Telemetry-Waste Rate</span>
              <div className="text-[20px] font-semibold font-mono text-[#18202A] mt-1 tabular-nums">
                {currentMachine.id === 'mach-m03' ? '27.2 kg/hr' : currentMachine.status === 'Normal' ? '0.0 kg/hr' : '8.5 kg/hr'}
              </div>
              <div className="text-[12px] text-[#8A93A0] mt-0.5">
                {currentMachine.id === 'mach-m03' ? 'Elevated during valve flutter' : 'Normal operating limits'}
              </div>
            </div>
          </div>

          {machineWaste.length > 0 && (
            <div className="pt-2">
              <div className="text-[13px] font-medium text-[#18202A] mb-2">
                Recorded Scrap Incidents for {currentMachine.name}:
              </div>
              <div className="space-y-2">
                {machineWaste.map((w) => (
                  <div
                    key={w.id}
                    className="p-3 bg-white rounded-lg border border-[#E4E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px]"
                  >
                    <div>
                      <div className="font-semibold text-[#18202A]">
                        {w.wasteQuantityKg} kg — {w.wasteType}
                      </div>
                      <div className="text-[#5F6875] text-[12px] mt-0.5">
                        Batch: {w.productionBatchCode} · {w.timestamp} {w.defectCategory ? `· [${w.defectCategory}]` : ''}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-semibold text-[#D92D20]">
                        ${w.wasteCost}
                      </span>
                      {w.relatedInvestigationId && (
                        <button
                          onClick={() => openInvestigation(w.relatedInvestigationId!, 'machines')}
                          className="h-7 px-2.5 rounded text-[12px] font-medium text-white bg-[#2F5BFF] hover:bg-[#2448D8] transition-colors inline-flex items-center gap-1 shrink-0"
                        >
                          <SearchCode className="w-3 h-3" />
                          <span>Investigate Anomaly</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Maintenance Logs and Downtime Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl border border-[#E4E7EB] bg-white">
            <h3 className="text-[16px] font-semibold text-[#18202A] mb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#5F6875]" />
              Recent Maintenance Work Orders ({machineMaint.length})
            </h3>
            {machineMaint.length === 0 ? (
              <p className="text-[14px] text-[#5F6875] py-4">No recent maintenance events recorded</p>
            ) : (
              <div className="space-y-3">
                {machineMaint.map((log) => (
                  <div key={log.id} className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-[#18202A]">{log.issue}</span>
                      <span className="text-[13px] text-[#5F6875]">{log.date}</span>
                    </div>
                    <p className="text-[14px] text-[#5F6875]">{log.notes}</p>
                    <div className="mt-2 flex items-center justify-between text-[13px] text-[#5F6875]">
                      <span>Tech: {log.technician} · {log.repairDurationMinutes} mins</span>
                      <span className="text-[#18864B] font-medium">{log.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 rounded-xl border border-[#E4E7EB] bg-white">
            <h3 className="text-[16px] font-semibold text-[#18202A] mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#5F6875]" />
              Recorded Stoppages ({machineDown.length})
            </h3>
            {machineDown.length === 0 ? (
              <p className="text-[14px] text-[#5F6875] py-4">No recent downtime events recorded</p>
            ) : (
              <div className="space-y-3">
                {machineDown.map((dt) => (
                  <div key={dt.id} className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-[#18202A]">{dt.reason}</span>
                      <span className="text-[#D92D20] font-semibold">{dt.durationMinutes}m stop</span>
                    </div>
                    <p className="text-[14px] text-[#5F6875]">{dt.description}</p>
                    <div className="mt-2 flex items-center justify-between text-[13px] text-[#5F6875]">
                      <span>Category: {dt.category}</span>
                      <span>Impact: ${dt.estimatedImpactCost}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Industrial Data Sources & Gateways Modal */}
      <DataSourcesModal
        isOpen={isDataSourcesOpen}
        onClose={() => setIsDataSourcesOpen(false)}
        defaultMachineId={currentMachine.id}
      />

      {/* Health Score Calculation Modal */}
      <HealthFormulaModal
        isOpen={isHealthFormulaOpen}
        onClose={() => setIsHealthFormulaOpen(false)}
        machine={currentMachine}
      />
    </div>
  );
}
