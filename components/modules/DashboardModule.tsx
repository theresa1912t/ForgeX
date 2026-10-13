'use client';

import React, { useState } from 'react';
import { useFactory } from '@/lib/factoryStore';
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Zap,
  Clock,
  Layers,
  Sparkles,
  SearchCode,
  DollarSign,
  Activity,
  CheckCircle2,
  PieChart,
  PanelRightOpen,
  Calendar,
  Filter,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/calculations';

export function DashboardModule() {
  const {
    productionLines,
    machines,
    alerts,
    setActiveTab,
    openInvestigationDrawer,
    setSelectedAlertId,
    setSelectedLineId,
    investigations,
    selectedShift,
    selectedPeriod,
    timeFilterLabel,
    filterMultiplier,
  } = useFactory();

  // Aggregate metrics
  const totalTargetUnits = Math.round(
    productionLines.reduce((acc, l) => acc + l.targetUnitsPerHour, 0) * filterMultiplier
  );
  const totalActualUnits = Math.round(
    productionLines.reduce((acc, l) => acc + l.currentUnitsPerHour, 0) * filterMultiplier
  );
  const variancePct = ((totalActualUnits - totalTargetUnits) / totalTargetUnits) * 100;

  const totalLostUnits = Math.round(
    productionLines.reduce((acc, l) => acc + l.productionLossUnits, 0) * filterMultiplier
  );
  const estimatedRevenueLoss = totalLostUnits * 1.25;

  const avgDefectRate = (
    productionLines.reduce((acc, l) => acc + l.defectRatePct, 0) / productionLines.length
  ).toFixed(2);

  const totalDowntimeMin = Math.round(
    productionLines.reduce((acc, l) => acc + l.downtimeMinutesToday, 0) * filterMultiplier
  );
  const activeAbnormalMachines = machines.filter((m) => m.status !== 'Normal').length;

  const heroInv = investigations['inv-line3-hero'];
  const isLine3Resolved = heroInv?.status === 'Resolved';

  // Loss concentration shares per line
  const lossShares: Record<string, { pct: number; label: string }> = {
    'line-3': {
      pct: isLine3Resolved ? 12 : 62,
      label: isLine3Resolved ? '12% of total loss' : '62% of total loss (Major Driver)',
    },
    'line-2': {
      pct: isLine3Resolved ? 45 : 21,
      label: isLine3Resolved ? '45% of total loss' : '21% of total loss',
    },
    'line-1': {
      pct: isLine3Resolved ? 25 : 11,
      label: '11% of total loss',
    },
    'line-4': {
      pct: isLine3Resolved ? 18 : 6,
      label: '6% of total loss',
    },
  };

  return (
    <div className="space-y-8">
      {/* 1. Header with Minimalist Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-[13px] font-medium text-[#5F6875] mb-1">
            FreshBite Foods Main Plant · Shift B Active
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[32px] leading-[40px] font-semibold text-[#18202A]">
              Operations Overview
            </h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[13px] font-medium bg-[#F2F4F7] text-[#344054] border border-[#E4E7EB]">
              <span
                className={`w-2 h-2 rounded-full ${
                  selectedShift === 'shift-b' ? 'bg-[#12B76A] animate-pulse' : 'bg-[#667085]'
                }`}
              />
              <span>{timeFilterLabel}</span>
            </div>
          </div>
          <p className="text-[14px] leading-[22px] text-[#5F6875] mt-1">
            Real-time throughput, line velocity variance, and root-cause loss tracking synchronized with global shift telemetry.
          </p>
        </div>

        {/* Clean, Single-line CTA Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* CTA 1: Loss Explorer */}
          <button
            onClick={() => setActiveTab('loss-explorer')}
            className="h-10 px-4 text-[13px] font-semibold text-[#18202A] bg-white hover:bg-[#F7F8FA] border border-[#D0D5DD] rounded-xl transition-all shadow-xs flex items-center gap-2 group cursor-pointer"
            title="Explore OEE loss breakdown by line, speed variance, and downtime categories"
          >
            <PieChart className="w-4 h-4 text-[#475467] group-hover:text-[#18202A] transition-colors" />
            <span>Loss Explorer</span>
          </button>

          {/* CTA 2: AI Diagnosis */}
          <button
            onClick={() => openInvestigationDrawer('inv-line3-hero')}
            className="h-10 px-4 text-[13px] font-semibold text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-xl transition-all shadow-sm flex items-center gap-2 group cursor-pointer"
            title="Open AI Root-Cause Investigation Slide-over Drawer for Line 3 Valve Anomaly"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>AI Diagnosis</span>
            {!isLine3Resolved && (
              <span className="w-2 h-2 rounded-full bg-[#FDA29B] animate-ping ml-0.5" />
            )}
            <PanelRightOpen className="w-3.5 h-3.5 text-white/80 ml-0.5" />
          </button>
        </div>
      </div>

      {/* 3. KPI Summary Cards (Minimalist & Aesthetic) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {/* KPI 1: Output */}
        <div className="card-base flex flex-col justify-between p-5">
          <div>
            <span className="text-[13px] font-medium text-[#5F6875]">Production Output</span>
            <div className="text-[26px] leading-[32px] font-semibold text-[#18202A] mt-2">
              {formatNumber(totalActualUnits)}
              <span className="text-[13px] font-normal text-[#5F6875] ml-1">/hr</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E4E7EB] flex items-center justify-between text-[13px]">
            <span className="text-[#5F6875]">Target: {formatNumber(totalTargetUnits)}</span>
            <span className={`font-semibold ${variancePct < 0 ? 'text-[#D92D20]' : 'text-[#18864B]'}`}>
              {variancePct > 0 ? `+${variancePct.toFixed(1)}%` : `${variancePct.toFixed(1)}%`}
            </span>
          </div>
        </div>

        {/* KPI 2: Production Loss */}
        <div className="card-base flex flex-col justify-between p-5">
          <div>
            <span className="text-[13px] font-medium text-[#5F6875]">Production Loss</span>
            <div className="text-[26px] leading-[32px] font-semibold text-[#D92D20] mt-2">
              {formatNumber(totalLostUnits)}
              <span className="text-[13px] font-normal text-[#5F6875] ml-1">units</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E4E7EB] flex items-center justify-between text-[13px]">
            <span className="text-[#5F6875]">Est. Loss:</span>
            <span className="font-semibold text-[#D92D20]">
              {formatCurrency(estimatedRevenueLoss)}
            </span>
          </div>
        </div>

        {/* KPI 3: Quality Defect Rate */}
        <div className="card-base flex flex-col justify-between p-5">
          <div>
            <span className="text-[13px] font-medium text-[#5F6875]">Defect Rate</span>
            <div className="text-[26px] leading-[32px] font-semibold text-[#18202A] mt-2">
              {avgDefectRate}%
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E4E7EB] flex items-center justify-between text-[13px] text-[#5F6875]">
            <span>Rework: 420 u</span>
            <span>Scrap: 138 kg</span>
          </div>
        </div>

        {/* KPI 4: Downtime */}
        <div className="card-base flex flex-col justify-between p-5">
          <div>
            <span className="text-[13px] font-medium text-[#5F6875]">Downtime</span>
            <div className="text-[26px] leading-[32px] font-semibold text-[#18202A] mt-2">
              {totalDowntimeMin}m
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E4E7EB] flex items-center justify-between text-[13px]">
            <span className="text-[#5F6875]">Active Issues:</span>
            <span className="font-semibold text-[#E56B00]">
              {activeAbnormalMachines} machines
            </span>
          </div>
        </div>

        {/* KPI 5: Material Waste */}
        <div className="card-base flex flex-col justify-between p-5">
          <div>
            <span className="text-[13px] font-medium text-[#5F6875]">Material Waste</span>
            <div className="text-[26px] leading-[32px] font-semibold text-[#18202A] mt-2">
              138 kg
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E4E7EB] flex items-center justify-between text-[13px]">
            <span className="text-[#5F6875]">Scrap Cost:</span>
            <span className="font-semibold text-[#18202A]">$1,225</span>
          </div>
        </div>

        {/* KPI 6: Energy Usage */}
        <div className="card-base flex flex-col justify-between p-5">
          <div>
            <span className="text-[13px] font-medium text-[#5F6875]">Energy Usage</span>
            <div className="text-[26px] leading-[32px] font-semibold text-[#18202A] mt-2">
              719 kWh
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E4E7EB] flex items-center justify-between text-[13px]">
            <span className="text-[#5F6875]">Spike:</span>
            <span className="font-semibold text-[#D92D20]">Line 2 (+18%)</span>
          </div>
        </div>
      </div>

      {/* 4. AI Operations Summary Panel */}
      <div className="card-ai">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#D9E4FF] gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EEF3FF] text-[#2F5BFF] flex items-center justify-center shrink-0 border border-[#D9E4FF]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[20px] leading-[28px] font-semibold text-[#18202A]">
                AI Operations Intelligence
              </h2>
              <p className="text-[14px] text-[#5F6875] mt-0.5">
                {isLine3Resolved
                  ? 'Line 3 restored. 1 active operational issue requires monitoring.'
                  : '3 active operational issues flagged across lines.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('ai-assistant')}
            className="h-9 px-3.5 text-[13px] font-semibold text-[#2F5BFF] bg-white hover:bg-[#EEF3FF] border border-[#D9E4FF] rounded-lg transition-colors flex items-center gap-2 self-start md:self-auto cursor-pointer"
          >
            <span>Ask AI Assistant</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Issues List Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
          {/* Issue 1: Line 3 Hero */}
          <div
            onClick={() => {
              openInvestigationDrawer('inv-line3-hero');
            }}
            className={`p-5 rounded-xl border bg-white cursor-pointer transition-all ${
              isLine3Resolved
                ? 'border-[#A6F4C5] bg-[#F6FEF9]'
                : 'border-[#FECDCA] hover:border-[#F97066] shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className={`h-6 px-2 rounded-[6px] text-[12px] font-semibold inline-flex items-center ${
                  isLine3Resolved
                    ? 'bg-[#EDFDF2] text-[#18864B]'
                    : 'bg-[#FEF3F2] text-[#D92D20]'
                }`}
              >
                {isLine3Resolved ? 'Resolved' : 'Critical Bottleneck'}
              </span>
              <span className="text-[13px] text-[#5F6875]">Line 3 · Hot-Fill</span>
            </div>
            <div className="text-[15px] leading-[22px] font-semibold text-[#18202A]">
              {isLine3Resolved
                ? 'Line 3 recovered to 4,940 units/hr (Valve replaced)'
                : 'Line 3 production is 14% below target'}
            </div>
            <div className="text-[13px] text-[#5F6875] mt-2">
              Financial impact:{' '}
              <span className="font-semibold text-[#D92D20]">$4,650</span> ($1,400/hr)
            </div>
            <div className="mt-4 pt-3 border-t border-[#E4E7EB] flex items-center justify-between text-[13px] font-medium text-[#2F5BFF]">
              <span className="flex items-center gap-1.5">
                <PanelRightOpen className="w-3.5 h-3.5" />
                <span>{isLine3Resolved ? 'Audit Resolution' : 'Open Investigation Drawer'}</span>
              </span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Issue 2: Product A Defect */}
          <div
            onClick={() => {
              setActiveTab('alerts');
              setSelectedAlertId('alt-prod-defect');
            }}
            className="p-5 rounded-xl border border-[#FEDF89] bg-white hover:border-[#FDB022] cursor-pointer transition-all shadow-xs"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="h-6 px-2 rounded-[6px] text-[12px] font-semibold inline-flex items-center bg-[#FFF6ED] text-[#E56B00]">
                High Risk
              </span>
              <span className="text-[13px] text-[#5F6875]">Line 2 · Dairy</span>
            </div>
            <div className="text-[15px] leading-[22px] font-semibold text-[#18202A]">
              Product A (Chocolate Milk) defect rate increased 2.4×
            </div>
            <div className="text-[13px] text-[#5F6875] mt-2">
              Impact: <span className="font-semibold text-[#E56B00]">$1,180</span> (420 units reworked)
            </div>
            <div className="mt-4 pt-3 border-t border-[#E4E7EB] flex items-center justify-between text-[13px] font-medium text-[#2F5BFF]">
              <span>Rec: Calibrate ultrasonic sealing horn</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Issue 3: Machine M-08 */}
          <div
            onClick={() => setActiveTab('machines')}
            className="p-5 rounded-xl border border-[#E4E7EB] bg-white hover:border-[#D0D5DD] cursor-pointer transition-all shadow-xs"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="h-6 px-2 rounded-[6px] text-[12px] font-semibold inline-flex items-center bg-[#FEF7E6] text-[#B78103]">
                Medium Risk
              </span>
              <span className="text-[13px] text-[#5F6875]">Packaging M-08</span>
            </div>
            <div className="text-[15px] leading-[22px] font-semibold text-[#18202A]">
              Machine M-08 drive vibration elevated (4.15 mm/s)
            </div>
            <div className="text-[13px] text-[#5F6875] mt-2">
              Impact: 1.5h unplanned stoppage risk ($2,100)
            </div>
            <div className="mt-4 pt-3 border-t border-[#E4E7EB] flex items-center justify-between text-[13px] font-medium text-[#2F5BFF]">
              <span>Rec: Inspect sprocket drive lubrication</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* 5. UNIFIED Line Performance & Loss Concentration Table */}
      <div className="card-base p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#E4E7EB] gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] leading-[26px] font-semibold text-[#18202A]">
                Line Performance & Loss Matrix
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EEF3FF] text-[#2F5BFF] border border-[#D9E4FF]">
                Unified Matrix
              </span>
            </div>
            <p className="text-[13px] text-[#5F6875] mt-1">
              Correlating production speed variance directly with plant loss concentration, quality, and downtime.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('loss-explorer')}
              className="h-8 px-3 text-[12px] font-semibold text-[#18202A] bg-white border border-[#D0D5DD] hover:bg-[#F7F8FA] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PieChart className="w-3.5 h-3.5 text-[#5F6875]" />
              <span>Loss Explorer</span>
            </button>
            <button
              onClick={() => setActiveTab('production')}
              className="h-8 px-3 text-[12px] font-semibold text-[#2F5BFF] hover:text-[#2448D8] flex items-center gap-1 cursor-pointer"
            >
              <span>View All Lines</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Minimalist Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-[#F8F9FA] text-[#5F6875] font-semibold border-b border-[#E4E7EB] text-[12px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Line & Active SKU</th>
                <th className="py-3 px-4">Target vs Actual Speed</th>
                <th className="py-3 px-4 w-44">Speed Variance</th>
                <th className="py-3 px-4 w-52">Loss Share (% of Total)</th>
                <th className="py-3 px-4">Defect Rate</th>
                <th className="py-3 px-4">Downtime</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EB]">
              {productionLines.map((line) => {
                const variance =
                  ((line.currentUnitsPerHour - line.targetUnitsPerHour) / line.targetUnitsPerHour) * 100;
                const isBottleneck = line.id === 'line-3' && !isLine3Resolved;
                const share = lossShares[line.id] || { pct: 5, label: '5% of total loss' };

                return (
                  <tr
                    key={line.id}
                    className={`hover:bg-[#F8F9FA] transition-colors ${
                      isBottleneck ? 'bg-[#FEF3F2]/25' : ''
                    }`}
                  >
                    {/* Column 1: Line Identity */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#18202A]">{line.name}</span>
                        <span className="text-[12px] text-[#5F6875] px-1.5 py-0.5 rounded bg-[#F2F4F7]">
                          {line.type}
                        </span>
                        {isBottleneck && (
                          <span className="h-5 px-1.5 rounded text-[11px] font-semibold bg-[#FEF3F2] text-[#D92D20] border border-[#FECDCA]">
                            Bottleneck
                          </span>
                        )}
                      </div>
                      <div className="text-[12px] text-[#5F6875] mt-1 font-medium">
                        {line.currentProduct}
                      </div>
                    </td>

                    {/* Column 2: Target vs Actual Speed */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-[#18202A]">
                        {formatNumber(line.currentUnitsPerHour)}{' '}
                        <span className="text-[12px] font-normal text-[#5F6875]">u/hr</span>
                      </div>
                      <div className="text-[12px] text-[#5F6875]">
                        Target: {formatNumber(line.targetUnitsPerHour)} u/hr
                      </div>
                    </td>

                    {/* Column 3: Speed Variance & Progress */}
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-[12px] font-semibold px-2 py-0.5 rounded ${
                            variance < -5
                              ? 'bg-[#FEF3F2] text-[#D92D20]'
                              : variance < 0
                              ? 'bg-[#FFF6ED] text-[#E56B00]'
                              : 'bg-[#EDFDF2] text-[#18864B]'
                          }`}
                        >
                          {variance > 0 ? `+${variance.toFixed(1)}%` : `${variance.toFixed(1)}%`}
                        </span>
                        <span className="text-[12px] text-[#5F6875]">
                          {line.efficiencyPct.toFixed(0)}% OEE
                        </span>
                      </div>
                      <div className="w-full bg-[#EAECF0] rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            line.efficiencyPct < 90
                              ? 'bg-[#D92D20]'
                              : line.efficiencyPct < 95
                              ? 'bg-[#E56B00]'
                              : 'bg-[#18864B]'
                          }`}
                          style={{ width: `${Math.min(100, line.efficiencyPct)}%` }}
                        />
                      </div>
                    </td>

                    {/* Column 4: Loss Share (% of Plant Loss) */}
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-[13px] font-semibold ${
                            share.pct > 50
                              ? 'text-[#D92D20]'
                              : share.pct > 20
                              ? 'text-[#E56B00]'
                              : 'text-[#5F6875]'
                          }`}
                        >
                          {share.pct}%
                        </span>
                        <span className="text-[11px] text-[#5F6875]">
                          {formatCurrency(line.productionLossUnits * 1.25)}
                        </span>
                      </div>
                      <div className="w-full bg-[#EAECF0] rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            share.pct > 50
                              ? 'bg-[#D92D20]'
                              : share.pct > 20
                              ? 'bg-[#E56B00]'
                              : 'bg-[#8A93A0]'
                          }`}
                          style={{ width: `${share.pct}%` }}
                        />
                      </div>
                    </td>

                    {/* Column 5: Defect Rate */}
                    <td className="py-4 px-4 font-medium text-[#18202A]">
                      <span
                        className={
                          line.defectRatePct > 2.0
                            ? 'text-[#E56B00] font-semibold'
                            : 'text-[#18202A]'
                        }
                      >
                        {line.defectRatePct}%
                      </span>
                    </td>

                    {/* Column 6: Downtime */}
                    <td className="py-4 px-4 font-medium text-[#18202A]">
                      {line.downtimeMinutesToday}m
                    </td>

                    {/* Column 7: Actions */}
                    <td className="py-4 px-4 text-right">
                      {isBottleneck ? (
                        <button
                          onClick={() => openInvestigationDrawer('inv-line3-hero')}
                          className="h-8 px-3 text-[12px] font-semibold text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <PanelRightOpen className="w-3.5 h-3.5" />
                          <span>Investigate</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedLineId(line.id);
                            setActiveTab('production');
                          }}
                          className="h-8 px-3 text-[12px] font-semibold text-[#18202A] bg-white border border-[#D0D5DD] hover:bg-[#F7F8FA] rounded-lg transition-colors cursor-pointer shadow-xs"
                        >
                          View Line
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Top Operational Issues Table */}
      <div className="card-base p-6">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#E4E7EB]">
          <div>
            <h2 className="text-[18px] leading-[26px] font-semibold text-[#18202A]">
              Top Operational Issues
            </h2>
            <p className="text-[13px] text-[#5F6875] mt-1">
              Issues ranked by severity, financial impact, and AI confidence.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('alerts')}
            className="text-[13px] font-semibold text-[#2F5BFF] hover:text-[#2448D8] flex items-center gap-1 cursor-pointer"
          >
            <span>View All Alerts ({alerts.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="border border-[#E4E7EB] rounded-xl overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-[#F8F9FA] text-[#5F6875] font-semibold border-b border-[#E4E7EB] text-[12px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Issue</th>
                <th className="py-3 px-4">Affected Area</th>
                <th className="py-3 px-4">Estimated Impact</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EB]">
              {alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-[#F8F9FA] transition-colors h-14">
                  <td className="py-4 px-4">
                    <span
                      className={`h-6 px-2 rounded-[6px] text-[12px] font-semibold inline-flex items-center ${
                        alert.severity === 'Critical'
                          ? 'bg-[#FEF3F2] text-[#D92D20]'
                          : alert.severity === 'High'
                          ? 'bg-[#FFF6ED] text-[#E56B00]'
                          : 'bg-[#FEF7E6] text-[#B78103]'
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-[#18202A]">
                    {alert.title}
                  </td>
                  <td className="py-4 px-4 text-[#5F6875]">
                    {alert.lineName} · {alert.machineName || 'System'}
                  </td>
                  <td className="py-4 px-4 font-semibold text-[#18202A]">
                    {alert.estimatedImpact}
                  </td>
                  <td className="py-4 px-4 text-[#5F6875]">
                    {alert.confidence}%
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`h-6 px-2 rounded-[6px] text-[12px] font-semibold inline-flex items-center ${
                        alert.status === 'Resolved'
                          ? 'bg-[#EDFDF2] text-[#18864B]'
                          : alert.status === 'In Progress'
                          ? 'bg-[#EEF3FF] text-[#2F5BFF]'
                          : 'bg-[#F2F4F7] text-[#5F6875]'
                      }`}
                    >
                      {alert.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    {alert.investigationId ? (
                      <button
                        onClick={() => {
                          openInvestigationDrawer(alert.investigationId!);
                        }}
                        className="h-8 px-3 text-[12px] font-semibold text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <PanelRightOpen className="w-3.5 h-3.5" />
                        <span>Investigate</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedAlertId(alert.id);
                          setActiveTab('alerts');
                        }}
                        className="h-8 px-3 text-[12px] font-semibold text-[#18202A] bg-white border border-[#D0D5DD] hover:bg-[#F7F8FA] rounded-lg transition-colors cursor-pointer shadow-xs"
                      >
                        View Alert
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. AI Insights Section */}
      <div className="card-ai">
        <div className="flex items-center gap-2 mb-3 text-[#2F5BFF] font-semibold text-[15px]">
          <Sparkles className="w-4 h-4" />
          <span>AI Operations Insights</span>
        </div>
        <div className="space-y-2 text-[14px] leading-[22px] text-[#18202A]">
          <p>
            • <strong>Line 3</strong> accounts for <strong>{isLine3Resolved ? 'resolved throughput' : '62% of today\'s total loss'}</strong> due to valve diaphragm friction on Machine M-03.
          </p>
          <p>
            • Defects on <strong>Product A (Chocolate Milk)</strong> increased 2.4× shortly after <strong>Material Batch RM-284</strong> was introduced, though mechanical sealing wear was the primary driver.
          </p>
          <p>
            • <strong>Machine M-03</strong> generated the highest downtime impact this week ($8,420 across 3 related stoppages).
          </p>
        </div>
      </div>
    </div>
  );
}
