'use client';

import React, { useState } from 'react';
import { useFactory } from '@/lib/factoryStore';
import {
  Gauge,
  TrendingDown,
  TrendingUp,
  Clock,
  ShieldAlert,
  SearchCode,
  Layers,
  ArrowRight,
  PanelRightOpen,
  Flame,
} from 'lucide-react';
import { formatNumber } from '@/lib/calculations';

export function ProductionModule() {
  const {
    productionLines,
    selectedLineId,
    setSelectedLineId,
    machines,
    setActiveTab,
    openInvestigationDrawer,
    setSelectedInvestigationId,
  } = useFactory();

  const [filterShift, setFilterShift] = useState('all');

  const selectedLine =
    productionLines.find((l) => l.id === selectedLineId) || productionLines[2];

  const relatedMachines = machines.filter((m) => m.lineId === selectedLine.id);

  return (
    <div className="space-y-8">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[13px] font-medium text-[#5F6875] mb-1">
            Operations Execution
          </div>
          <h1 className="text-[32px] leading-[40px] font-semibold text-[#18202A]">
            Production
          </h1>
          <p className="text-[15px] leading-[24px] text-[#5F6875] mt-2">
            Continuous throughput tracking, scheduled vs actual run-rates, and line bottleneck isolation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterShift}
            onChange={(e) => setFilterShift(e.target.value)}
            className="h-10 px-3.5 bg-white border border-[#E4E7EB] rounded-lg text-[14px] text-[#18202A] focus:outline-none focus:border-[#2F5BFF]"
          >
            <option value="all">All Shifts</option>
            <option value="Shift A">Shift A (Night)</option>
            <option value="Shift B">Shift B (Active Day)</option>
            <option value="Shift C">Shift C (Evening)</option>
          </select>
        </div>
      </div>

      {/* 2. Line Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {productionLines.map((line) => {
          const isSelected = line.id === selectedLine.id;
          const variance = ((line.currentUnitsPerHour - line.targetUnitsPerHour) / line.targetUnitsPerHour) * 100;
          return (
            <button
              key={line.id}
              type="button"
              onClick={() => setSelectedLineId(line.id)}
              className={`card-base cursor-pointer transition-all text-left w-full ${
                isSelected
                  ? 'border-2 border-[#2F5BFF] ring-2 ring-[#2F5BFF]/25 shadow-sm bg-white'
                  : line.activeAlertCount > 0
                  ? 'border border-[#FEDF89] ring-2 ring-[#FEDF89]/40 bg-white hover:border-[#FDB022]'
                  : 'hover:border-[#CBD5E1] hover:shadow-xs bg-white border border-[#E4E7EB]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[16px] font-semibold text-[#18202A]">{line.name}</span>
                  {isSelected && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#EEF3FF] text-[#2F5BFF] border border-[#C7D7FE]">
                      Active
                    </span>
                  )}
                </div>
                <span
                  className={`h-7 px-2.5 rounded-[6px] text-[13px] font-medium inline-flex items-center ${
                    line.status === 'Running'
                      ? 'bg-[#EDFDF2] text-[#18864B]'
                      : 'bg-[#FEF3F2] text-[#D92D20]'
                  }`}
                >
                  {line.status}
                </span>
              </div>

              <div className="text-[14px] text-[#5F6875] truncate mb-4">{line.currentProduct}</div>

              <div className="space-y-2">
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#5F6875]">Output:</span>
                  <span className="font-semibold text-[#18202A]">{formatNumber(line.currentUnitsPerHour)} /hr</span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#5F6875]">Target:</span>
                  <span className="text-[#5F6875]">{formatNumber(line.targetUnitsPerHour)} /hr</span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#5F6875]">Variance:</span>
                  <span className={`font-semibold ${variance < -5 ? 'text-[#D92D20]' : 'text-[#18864B]'}`}>
                    {variance > 0 ? `+${variance.toFixed(1)}%` : `${variance.toFixed(1)}%`}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E4E7EB] flex items-center justify-between text-[13px] text-[#5F6875]">
                <span>Defects: {line.defectRatePct}%</span>
                <span>Downtime: {line.downtimeMinutesToday}m</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Detailed Line Performance Panel */}
      <div className="card-base space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#E4E7EB] gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-[22px] leading-[30px] font-semibold text-[#18202A]">
                {selectedLine.name} Overview
              </h2>
              <span className="h-7 px-2.5 rounded-[6px] text-[13px] font-medium bg-[#F1F3F5] text-[#5F6875]">
                Code {selectedLine.code}
              </span>
            </div>
            <p className="text-[14px] text-[#5F6875] mt-1">
              Real-time telemetry, connected machinery status, and downtime breakdown for{' '}
              <strong className="text-[#18202A]">{selectedLine.name}</strong>.
            </p>
          </div>

          {selectedLine.activeAlertCount > 0 ? (
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => openInvestigationDrawer('inv-line3-hero')}
                className="h-10 px-4 text-[13px] font-semibold text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <PanelRightOpen className="w-4 h-4" />
                <span>Investigate Anomaly</span>
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                className="h-10 px-3.5 text-[13px] font-semibold text-[#18202A] bg-white hover:bg-[#F7F8FA] border border-[#D0D5DD] rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Flame className="w-4 h-4 text-[#D92D20]" />
                <span>Log Line Scrap</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setActiveTab('materials')}
                className="h-10 px-3.5 text-[13px] font-semibold text-[#18202A] bg-white hover:bg-[#F7F8FA] border border-[#D0D5DD] rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Flame className="w-4 h-4 text-[#D92D20]" />
                <span>Log Scrap</span>
              </button>
            </div>
          )}
        </div>

        {/* 4 Line Sub-Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB]">
            <span className="text-[13px] text-[#5F6875]">Efficiency Rate</span>
            <div className="text-[28px] leading-[36px] font-semibold text-[#18202A] mt-1">
              {selectedLine.efficiencyPct}%
            </div>
            <div className="text-[13px] text-[#8A93A0] mt-1">OEE Run factor</div>
          </div>

          <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB]">
            <span className="text-[13px] text-[#5F6875]">Cumulative Loss Units</span>
            <div className="text-[28px] leading-[36px] font-semibold text-[#D92D20] mt-1">
              {formatNumber(selectedLine.productionLossUnits)}
            </div>
            <div className="text-[13px] text-[#8A93A0] mt-1">Today during Shift B</div>
          </div>

          <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB]">
            <span className="text-[13px] text-[#5F6875]">Defect Rejection</span>
            <div className="text-[28px] leading-[36px] font-semibold text-[#18202A] mt-1">
              {selectedLine.defectRatePct}%
            </div>
            <div className="text-[13px] text-[#8A93A0] mt-1">Tolerance &lt;0.80%</div>
          </div>

          <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB]">
            <span className="text-[13px] text-[#5F6875]">Stoppage Time</span>
            <div className="text-[28px] leading-[36px] font-semibold text-[#18202A] mt-1">
              {selectedLine.downtimeMinutesToday} mins
            </div>
            <div className="text-[13px] text-[#8A93A0] mt-1">Micro-stops & CIP</div>
          </div>
        </div>

        {/* Connected Machines on this line */}
        <div>
          <h3 className="text-[18px] leading-[26px] font-semibold text-[#18202A] mb-4">
            Connected Machines on {selectedLine.name}
          </h3>
          <div className="border border-[#E4E7EB] rounded-xl overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-[#F7F8FA] text-[#5F6875] font-medium border-b border-[#E4E7EB] text-[13px]">
                <tr>
                  <th className="py-3 px-4">Machine</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Health</th>
                  <th className="py-3 px-4">Cycle Time</th>
                  <th className="py-3 px-4">Loss Contribution</th>
                  <th className="py-3 px-4 text-right">Telemetry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EB]">
                {relatedMachines.map((m) => (
                  <tr key={m.id} className="hover:bg-[#F7F8FA] h-14">
                    <td className="py-4 px-4 font-semibold text-[#18202A]">{m.name}</td>
                    <td className="py-4 px-4 text-[#5F6875]">{m.type}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`h-7 px-2.5 rounded-[6px] text-[13px] font-medium inline-flex items-center ${
                          m.status === 'Normal'
                            ? 'bg-[#EDFDF2] text-[#18864B]'
                            : 'bg-[#FEF3F2] text-[#D92D20]'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium text-[#18202A]">{m.healthScorePct}%</td>
                    <td className="py-4 px-4 text-[#5F6875]">{m.cycleTimeSec}s</td>
                    <td className="py-4 px-4 font-semibold text-[#D92D20]">
                      {m.productionLossContributionPct}%
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setActiveTab('machines')}
                        className="text-[14px] text-[#2F5BFF] hover:underline font-medium"
                      >
                        Inspect Sensors
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
