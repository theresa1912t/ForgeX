'use client';

import React from 'react';
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
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/calculations';

export function DashboardModule() {
  const {
    productionLines,
    machines,
    alerts,
    setActiveTab,
    openInvestigation,
    setSelectedAlertId,
    setSelectedLineId,
    investigations,
  } = useFactory();

  // Aggregate metrics
  const totalTargetUnits = productionLines.reduce((acc, l) => acc + l.targetUnitsPerHour, 0);
  const totalActualUnits = productionLines.reduce((acc, l) => acc + l.currentUnitsPerHour, 0);
  const variancePct = ((totalActualUnits - totalTargetUnits) / totalTargetUnits) * 100;

  const totalLostUnits = productionLines.reduce((acc, l) => acc + l.productionLossUnits, 0);
  const estimatedRevenueLoss = totalLostUnits * 1.25;

  const avgDefectRate = (
    productionLines.reduce((acc, l) => acc + l.defectRatePct, 0) / productionLines.length
  ).toFixed(2);

  const totalDowntimeMin = productionLines.reduce((acc, l) => acc + l.downtimeMinutesToday, 0);
  const activeAbnormalMachines = machines.filter((m) => m.status !== 'Normal').length;

  const heroInv = investigations['inv-line3-hero'];
  const isLine3Resolved = heroInv?.status === 'Resolved';

  return (
    <div className="space-y-8">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[13px] font-medium text-[#5F6875] mb-1">
            FreshBite Foods Main Plant · Shift B
          </div>
          <h1 className="text-[32px] leading-[40px] font-semibold text-[#18202A]">
            Dashboard
          </h1>
          <p className="text-[15px] leading-[24px] text-[#5F6875] mt-2">
            Monitor factory performance, production loss, and operational issues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('loss-explorer')}
            className="h-10 px-4 text-[14px] font-medium text-[#18202A] bg-[#FFFFFF] hover:bg-[#F7F8FA] border border-[#E4E7EB] rounded-lg transition-colors"
          >
            Loss Explorer
          </button>
          <button
            onClick={() => {
              openInvestigation('inv-line3-hero', 'dashboard');
            }}
            className="h-10 px-4 text-[14px] font-medium text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <SearchCode className="w-4 h-4" />
            <span>Open AI Investigation</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary (Consistent 6 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {/* KPI 1: Output */}
        <div className="card-base flex flex-col justify-between">
          <div>
            <div className="text-[14px] font-medium text-[#5F6875]">Production Output</div>
            <div className="text-[28px] leading-[36px] font-semibold text-[#18202A] mt-2">
              {formatNumber(totalActualUnits)}
              <span className="text-[14px] font-normal text-[#5F6875] ml-1">/hr</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E4E7EB] flex items-center justify-between text-[14px]">
            <span className="text-[#5F6875]">Target: {formatNumber(totalTargetUnits)}</span>
            <span className={`font-medium ${variancePct < 0 ? 'text-[#D92D20]' : 'text-[#18864B]'}`}>
              {variancePct > 0 ? `+${variancePct.toFixed(1)}%` : `${variancePct.toFixed(1)}%`}
            </span>
          </div>
        </div>

        {/* KPI 2: Production Loss */}
        <div className="card-base flex flex-col justify-between">
          <div>
            <div className="text-[14px] font-medium text-[#5F6875]">Production Loss</div>
            <div className="text-[28px] leading-[36px] font-semibold text-[#D92D20] mt-2">
              {formatNumber(totalLostUnits)}
              <span className="text-[14px] font-normal text-[#5F6875] ml-1">units</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E4E7EB] flex items-center justify-between text-[14px]">
            <span className="text-[#5F6875]">Est. Revenue:</span>
            <span className="font-semibold text-[#D92D20]">
              {formatCurrency(estimatedRevenueLoss)}
            </span>
          </div>
        </div>

        {/* KPI 3: Quality */}
        <div className="card-base flex flex-col justify-between">
          <div>
            <div className="text-[14px] font-medium text-[#5F6875]">Quality Defect Rate</div>
            <div className="text-[28px] leading-[36px] font-semibold text-[#18202A] mt-2">
              {avgDefectRate}%
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E4E7EB] flex items-center justify-between text-[14px] text-[#5F6875]">
            <span>Rework: 420 units</span>
            <span>Scrap: 138 kg</span>
          </div>
        </div>

        {/* KPI 4: Reliability */}
        <div className="card-base flex flex-col justify-between">
          <div>
            <div className="text-[14px] font-medium text-[#5F6875]">Downtime Today</div>
            <div className="text-[28px] leading-[36px] font-semibold text-[#18202A] mt-2">
              {totalDowntimeMin}m
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E4E7EB] flex items-center justify-between text-[14px]">
            <span className="text-[#5F6875]">Active Issues:</span>
            <span className="font-medium text-[#E56B00]">
              {activeAbnormalMachines} machines
            </span>
          </div>
        </div>

        {/* KPI 5: Waste */}
        <div className="card-base flex flex-col justify-between">
          <div>
            <div className="text-[14px] font-medium text-[#5F6875]">Material Waste</div>
            <div className="text-[28px] leading-[36px] font-semibold text-[#18202A] mt-2">
              138 kg
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E4E7EB] flex items-center justify-between text-[14px]">
            <span className="text-[#5F6875]">Scrap Cost:</span>
            <span className="font-semibold text-[#18202A]">$1,225</span>
          </div>
        </div>

        {/* KPI 6: Energy */}
        <div className="card-base flex flex-col justify-between">
          <div>
            <div className="text-[14px] font-medium text-[#5F6875]">Energy Usage</div>
            <div className="text-[28px] leading-[36px] font-semibold text-[#18202A] mt-2">
              719 kWh
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E4E7EB] flex items-center justify-between text-[14px]">
            <span className="text-[#5F6875]">Spike:</span>
            <span className="font-medium text-[#D92D20]">Line 2 (+18.4%)</span>
          </div>
        </div>
      </div>

      {/* 3. AI Operations Summary Panel */}
      <div className="card-ai">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#D9E4FF] gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EEF3FF] text-[#2F5BFF] flex items-center justify-center shrink-0 border border-[#D9E4FF]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[22px] leading-[30px] font-semibold text-[#18202A]">
                AI Operations Summary
              </h2>
              <p className="text-[14px] text-[#5F6875] mt-0.5">
                {isLine3Resolved
                  ? 'Line 3 restored. 1 active operational issue requires monitoring.'
                  : '3 operational issues require attention today.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('ai-assistant')}
            className="h-10 px-4 text-[14px] font-medium text-[#2F5BFF] bg-white hover:bg-[#EEF3FF] border border-[#D9E4FF] rounded-lg transition-colors flex items-center gap-2 self-start md:self-auto"
          >
            <span>Ask AI Assistant</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Issues List Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Issue 1: Line 3 Hero */}
          <div
            onClick={() => {
              openInvestigation('inv-line3-hero', 'dashboard');
            }}
            className={`p-5 rounded-xl border bg-white cursor-pointer transition-all ${
              isLine3Resolved
                ? 'border-[#A6F4C5] bg-[#F6FEF9]'
                : 'border-[#FECDCA] hover:border-[#F97066] shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className={`h-7 px-2.5 rounded-[6px] text-[13px] font-medium inline-flex items-center ${
                  isLine3Resolved
                    ? 'bg-[#EDFDF2] text-[#18864B]'
                    : 'bg-[#FEF3F2] text-[#D92D20]'
                }`}
              >
                {isLine3Resolved ? 'Resolved' : 'Critical'}
              </span>
              <span className="text-[13px] text-[#5F6875]">Line 3 · Hot-Fill</span>
            </div>
            <div className="text-[16px] leading-[24px] font-semibold text-[#18202A]">
              {isLine3Resolved
                ? 'Line 3 recovered to 4,940 units/hr (Valve replaced)'
                : 'Line 3 production is 14% below target'}
            </div>
            <div className="text-[14px] text-[#5F6875] mt-2">
              Estimated impact:{' '}
              <span className="font-semibold text-[#D92D20]">$4,650</span> ($1,400/hr)
            </div>
            <div className="mt-4 pt-3 border-t border-[#E4E7EB] flex items-center justify-between text-[14px] font-medium text-[#2F5BFF]">
              <span>{isLine3Resolved ? 'View resolution audit' : 'Recommended: Inspect filling valve'}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Issue 2: Product A Defect */}
          <div
            onClick={() => {
              setActiveTab('alerts');
              setSelectedAlertId('alt-prod-defect');
            }}
            className="p-5 rounded-xl border border-[#FEDF89] bg-white hover:border-[#FDB022] cursor-pointer transition-all shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="h-7 px-2.5 rounded-[6px] text-[13px] font-medium inline-flex items-center bg-[#FFF6ED] text-[#E56B00]">
                High
              </span>
              <span className="text-[13px] text-[#5F6875]">Line 2 · Dairy</span>
            </div>
            <div className="text-[16px] leading-[24px] font-semibold text-[#18202A]">
              Product A (Chocolate Milk) defect rate increased 2.4×
            </div>
            <div className="text-[14px] text-[#5F6875] mt-2">
              Estimated impact: <span className="font-semibold text-[#E56B00]">$1,180</span> (420 units reworked)
            </div>
            <div className="mt-4 pt-3 border-t border-[#E4E7EB] flex items-center justify-between text-[14px] font-medium text-[#2F5BFF]">
              <span>Recommended: Calibrate ultrasonic sealing horn</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Issue 3: Machine M-08 */}
          <div
            onClick={() => setActiveTab('machines')}
            className="p-5 rounded-xl border border-[#E4E7EB] bg-white hover:border-[#D0D5DD] cursor-pointer transition-all shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="h-7 px-2.5 rounded-[6px] text-[13px] font-medium inline-flex items-center bg-[#FEF7E6] text-[#B78103]">
                Medium
              </span>
              <span className="text-[13px] text-[#5F6875]">Packaging M-08</span>
            </div>
            <div className="text-[16px] leading-[24px] font-semibold text-[#18202A]">
              Machine M-08 shows abnormal drive vibration (4.15 mm/s)
            </div>
            <div className="text-[14px] text-[#5F6875] mt-2">
              Estimated impact: 1.5h unplanned stoppage risk ($2,100)
            </div>
            <div className="mt-4 pt-3 border-t border-[#E4E7EB] flex items-center justify-between text-[14px] font-medium text-[#2F5BFF]">
              <span>Recommended: Check sprocket drive lubrication</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Production Performance & Loss Concentration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Target vs Actual Production */}
        <div className="lg:col-span-2 card-base">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[18px] leading-[26px] font-semibold text-[#18202A]">
                Target vs Actual Production
              </h2>
              <p className="text-[14px] text-[#5F6875] mt-1">
                Line performance comparison for current shift.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('production')}
              className="text-[14px] font-medium text-[#2F5BFF] hover:text-[#2448D8] flex items-center gap-1"
            >
              <span>View Production</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {productionLines.map((line) => {
              const variance = ((line.currentUnitsPerHour - line.targetUnitsPerHour) / line.targetUnitsPerHour) * 100;
              const isBottleneck = line.id === 'line-3' && !isLine3Resolved;
              return (
                <div
                  key={line.id}
                  onClick={() => {
                    setSelectedLineId(line.id);
                    setActiveTab('production');
                  }}
                  className={`p-5 rounded-xl border transition-all cursor-pointer ${
                    isBottleneck
                      ? 'border-[#FECDCA] bg-[#FEF3F2]/30 hover:bg-[#FEF3F2]/50'
                      : 'border-[#E4E7EB] bg-white hover:border-[#D0D5DD]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[15px] font-semibold text-[#18202A]">{line.name}</span>
                      <span className="text-[14px] text-[#5F6875]">({line.type})</span>
                      {isBottleneck && (
                        <span className="h-7 px-2.5 rounded-[6px] text-[13px] font-medium bg-[#FEF3F2] text-[#D92D20] border border-[#FECDCA]">
                          Bottleneck Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[14px]">
                      <span className="text-[#5F6875]">{line.currentProduct}</span>
                      <span className={`font-semibold ${variance < -5 ? 'text-[#D92D20]' : 'text-[#18864B]'}`}>
                        {variance > 0 ? `+${variance.toFixed(1)}%` : `${variance.toFixed(1)}%`}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#F1F3F5] rounded-full h-2.5 overflow-hidden">
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

                  <div className="mt-3 flex items-center justify-between text-[14px] text-[#5F6875]">
                    <span>
                      Actual: <strong className="text-[#18202A] font-semibold">{formatNumber(line.currentUnitsPerHour)}</strong> / Target: {formatNumber(line.targetUnitsPerHour)} units/hr
                    </span>
                    <span>
                      Defects: <strong className="text-[#18202A] font-semibold">{line.defectRatePct}%</strong> · Downtime: {line.downtimeMinutesToday}m
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Production Loss Concentration */}
        <div className="card-base flex flex-col justify-between">
          <div>
            <h2 className="text-[18px] leading-[26px] font-semibold text-[#18202A]">
              Production Loss Concentration
            </h2>
            <p className="text-[14px] text-[#5F6875] mt-1 mb-6">
              Share of financial loss by operational area.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[14px] mb-1.5">
                  <span className="text-[#18202A] font-medium">Line 3 (Hot-Fill Machine M-03)</span>
                  <span className="font-semibold text-[#D92D20]">{isLine3Resolved ? '12%' : '62%'}</span>
                </div>
                <div className="w-full bg-[#F1F3F5] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#D92D20] h-full rounded-full" style={{ width: isLine3Resolved ? '12%' : '62%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[14px] mb-1.5">
                  <span className="text-[#18202A] font-medium">Line 2 (Packaging Machine M-08)</span>
                  <span className="font-semibold text-[#E56B00]">{isLine3Resolved ? '45%' : '21%'}</span>
                </div>
                <div className="w-full bg-[#F1F3F5] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#E56B00] h-full rounded-full" style={{ width: isLine3Resolved ? '45%' : '21%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[14px] mb-1.5">
                  <span className="text-[#18202A] font-medium">Line 1 (Clearance / startup)</span>
                  <span className="font-semibold text-[#5F6875]">11%</span>
                </div>
                <div className="w-full bg-[#F1F3F5] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#8A93A0] h-full rounded-full" style={{ width: '11%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[14px] mb-1.5">
                  <span className="text-[#18202A] font-medium">Line 4 (Sauce pouches)</span>
                  <span className="font-semibold text-[#5F6875]">6%</span>
                </div>
                <div className="w-full bg-[#F1F3F5] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#8A93A0] h-full rounded-full" style={{ width: '6%' }} />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('loss-explorer')}
            className="mt-6 w-full h-10 px-4 text-[14px] font-medium text-[#18202A] bg-[#FFFFFF] hover:bg-[#F7F8FA] border border-[#E4E7EB] rounded-lg transition-colors text-center"
          >
            Analyze Loss Dimensions
          </button>
        </div>
      </div>

      {/* 5. Top Operational Issues Table */}
      <div className="card-base">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[18px] leading-[26px] font-semibold text-[#18202A]">
              Top Operational Issues
            </h2>
            <p className="text-[14px] text-[#5F6875] mt-1">
              Issues ranked by severity, financial impact, and AI confidence.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('alerts')}
            className="text-[14px] font-medium text-[#2F5BFF] hover:text-[#2448D8] flex items-center gap-1"
          >
            <span>View All Alerts ({alerts.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="border border-[#E4E7EB] rounded-xl overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-[#F7F8FA] text-[#5F6875] font-medium border-b border-[#E4E7EB] text-[13px]">
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
                <tr key={alert.id} className="hover:bg-[#F7F8FA] transition-colors h-14">
                  <td className="py-4 px-4">
                    <span
                      className={`h-7 px-2.5 rounded-[6px] text-[13px] font-medium inline-flex items-center ${
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
                  <td className="py-4 px-4 font-medium text-[#18202A]">
                    {alert.estimatedImpact}
                  </td>
                  <td className="py-4 px-4 text-[#5F6875]">
                    {alert.confidence}%
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`h-7 px-2.5 rounded-[6px] text-[13px] font-medium inline-flex items-center ${
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
                          openInvestigation(alert.investigationId!, 'dashboard');
                        }}
                        className="h-8 px-3 text-[13px] font-medium text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-md transition-colors"
                      >
                        Investigate
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedAlertId(alert.id);
                          setActiveTab('alerts');
                        }}
                        className="h-8 px-3 text-[13px] font-medium text-[#18202A] bg-white border border-[#E4E7EB] hover:bg-[#F7F8FA] rounded-md transition-colors"
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

      {/* 6. AI Insights Section */}
      <div className="card-ai">
        <div className="flex items-center gap-2 mb-3 text-[#2F5BFF] font-semibold text-[15px]">
          <Sparkles className="w-4 h-4" />
          <span>AI Insights</span>
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
