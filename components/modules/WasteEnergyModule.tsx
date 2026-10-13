'use client';

import React, { useState, useMemo } from 'react';
import { useFactory } from '@/lib/factoryStore';
import {
  Flame,
  Zap,
  Boxes,
  Cpu,
  AlertTriangle,
  ArrowRight,
  SearchCode,
  TrendingDown,
  Sparkles,
  Filter,
  CheckCircle2,
  PieChart,
  BarChart3,
  Layers,
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/calculations';

export function WasteEnergyModule() {
  const {
    wasteRecords,
    ingredientUsageRecords,
    energyRecords,
    machines,
    openInvestigation,
    setSelectedMachineId,
    setActiveTab,
  } = useFactory();

  const [machineFilter, setMachineFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<'waste' | 'ingredients' | 'energy'>('waste');

  // Aggregated metrics
  const totalWasteKg = useMemo(
    () => wasteRecords.reduce((acc, w) => acc + w.wasteQuantityKg, 0),
    [wasteRecords]
  );
  const totalWasteCost = useMemo(
    () => wasteRecords.reduce((acc, w) => acc + w.wasteCost, 0),
    [wasteRecords]
  );

  const totalPlannedIngredientsKg = useMemo(
    () => ingredientUsageRecords.reduce((acc, r) => acc + r.plannedQuantityKg, 0),
    [ingredientUsageRecords]
  );
  const totalActualIngredientsKg = useMemo(
    () => ingredientUsageRecords.reduce((acc, r) => acc + r.actualQuantityKg, 0),
    [ingredientUsageRecords]
  );
  const overallYieldVariancePct = totalPlannedIngredientsKg > 0
    ? ((totalPlannedIngredientsKg - totalActualIngredientsKg) / totalPlannedIngredientsKg) * 100
    : 0;

  const totalEnergyKwh = useMemo(
    () => energyRecords.reduce((acc, e) => acc + e.kwhConsumed, 0),
    [energyRecords]
  );
  const totalEnergyCost = useMemo(
    () => energyRecords.reduce((acc, e) => acc + e.costEstimate, 0),
    [energyRecords]
  );

  // Machine waste attribution breakdown
  const machineWasteSummary = useMemo(() => {
    const summaryMap: Record<
      string,
      { machineId: string; machineName: string; totalKg: number; totalCost: number; incidents: number }
    > = {};

    wasteRecords.forEach((w) => {
      const key = w.machineName || 'Unassigned Line Waste';
      if (!summaryMap[key]) {
        summaryMap[key] = {
          machineId: w.machineId || '',
          machineName: key,
          totalKg: 0,
          totalCost: 0,
          incidents: 0,
        };
      }
      summaryMap[key].totalKg += w.wasteQuantityKg;
      summaryMap[key].totalCost += w.wasteCost;
      summaryMap[key].incidents += 1;
    });

    return Object.values(summaryMap).sort((a, b) => b.totalKg - a.totalKg);
  }, [wasteRecords]);

  // Filtered waste records
  const filteredWaste = useMemo(() => {
    return wasteRecords.filter((w) => {
      const matchesMachine =
        machineFilter === 'all' ||
        (w.machineId && w.machineId === machineFilter) ||
        (w.machineName && w.machineName.toLowerCase().includes(machineFilter.toLowerCase()));
      const matchesCategory =
        categoryFilter === 'all' || w.defectCategory === categoryFilter || w.wasteReason === categoryFilter;
      return matchesMachine && matchesCategory;
    });
  }, [wasteRecords, machineFilter, categoryFilter]);

  return (
    <div className="space-y-8">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[13px] font-medium text-[#5F6875] mb-1">
            Resource Conservation
          </div>
          <h1 className="text-[32px] leading-[40px] font-semibold text-[#18202A]">
            Waste Streams
          </h1>
          <p className="text-[15px] leading-[24px] text-[#5F6875] mt-2">
            Real-time reconciliation of raw material scrap, line rejects, and correlation to machine mechanical anomalies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="h-10 px-4 bg-white border border-[#E4E7EB] rounded-lg text-[14px] text-[#5F6875] flex items-center gap-2">
            <span>Total Scrap Cost:</span>
            <strong className="text-[#D92D20] font-mono tabular-nums">{formatCurrency(totalWasteCost)}</strong>
          </div>
          <div className="h-10 px-4 bg-white border border-[#E4E7EB] rounded-lg text-[14px] text-[#5F6875] flex items-center gap-2">
            <span>Power Draw:</span>
            <strong className="text-[#18202A] font-mono tabular-nums">{totalEnergyKwh} kWh</strong>
          </div>
        </div>
      </div>

      {/* 2. Machine-Correlated Anomaly Callout Banner */}
      <div className="card-ai border-l-4 border-l-[#D92D20] space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[#D92D20] font-semibold text-[15px]">
            <AlertTriangle className="w-4 h-4 text-[#D92D20]" />
            <span>Root Cause Linkage: Machine M-03 Throttle Correlated with 128 kg Batch Scrap</span>
          </div>
          <button
            onClick={() => openInvestigation('inv-line3-hero', 'waste-energy')}
            className="text-[13px] font-medium text-[#2F5BFF] hover:text-[#2448D8] flex items-center gap-1 shrink-0"
          >
            <span>Open Root Cause Investigation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[14px] leading-[22px] text-[#18202A]">
          Mechanical vibration harmonics on <strong>Filling Machine M-03</strong> (+38% vibration, 2.11s stroke cycle) caused nozzle dribble and checkweigher weight underfill. This directly resulted in <strong>128 kg of Valencia Citrus Concentrate (Lot RM-284)</strong> scrap valued at <strong>$768.00</strong> during Shift B.
        </p>
        <div className="pt-2 border-t border-[#D9E4FF] flex flex-wrap items-center gap-6 text-[13px] text-[#5F6875]">
          <span>Affected Batch: <strong className="text-[#18202A] font-mono">Lot RM-284 (PB-ORG-1008)</strong></span>
          <span>·</span>
          <span>Equipment: <strong className="text-[#18202A]">Filling Machine M-03 (Line 3)</strong></span>
          <span>·</span>
          <span>Yield Impact: <strong className="text-[#D92D20] font-mono">-6.9% BOM Variance</strong></span>
          <span>·</span>
          <span>Telemetry Status: <strong className="text-[#D92D20]">Active Valve Flutter</strong></span>
        </div>
      </div>

      {/* 3. Top Metrics KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-base p-5">
          <div className="text-[13px] font-medium text-[#5F6875] flex items-center justify-between">
            <span>Total Material Scrap</span>
            <Flame className="w-4 h-4 text-[#D92D20]" />
          </div>
          <div className="text-[28px] leading-[36px] font-semibold text-[#18202A] mt-2 font-mono tabular-nums">
            {totalWasteKg} <span className="text-[16px] font-normal text-[#5F6875]">kg</span>
          </div>
          <div className="text-[13px] text-[#D92D20] mt-1 flex items-center gap-1">
            <span>+18.2% vs shift baseline target</span>
          </div>
        </div>

        <div className="card-base p-5">
          <div className="text-[13px] font-medium text-[#5F6875] flex items-center justify-between">
            <span>Direct Scrap Loss Value</span>
            <span className="text-[12px] font-mono text-[#5F6875]">$ USD</span>
          </div>
          <div className="text-[28px] leading-[36px] font-semibold text-[#D92D20] mt-2 font-mono tabular-nums">
            {formatCurrency(totalWasteCost)}
          </div>
          <div className="text-[13px] text-[#5F6875] mt-1">
            Calculated across {wasteRecords.length} recorded loss incidents
          </div>
        </div>

        <div className="card-base p-5">
          <div className="text-[13px] font-medium text-[#5F6875] flex items-center justify-between">
            <span>Overall Yield Efficiency</span>
            <Boxes className="w-4 h-4 text-[#2F5BFF]" />
          </div>
          <div className="text-[28px] leading-[36px] font-semibold text-[#18202A] mt-2 font-mono tabular-nums">
            {(100 + overallYieldVariancePct).toFixed(1)}%
          </div>
          <div className={`text-[13px] mt-1 font-mono ${overallYieldVariancePct < -2 ? 'text-[#D92D20]' : 'text-[#18864B]'}`}>
            {overallYieldVariancePct.toFixed(1)}% variance vs standard BOM
          </div>
        </div>

        <div className="card-base p-5">
          <div className="text-[13px] font-medium text-[#5F6875] flex items-center justify-between">
            <span>Top Waste Generator</span>
            <Cpu className="w-4 h-4 text-[#E56B00]" />
          </div>
          <div className="text-[22px] leading-[30px] font-semibold text-[#18202A] mt-2 truncate">
            {machineWasteSummary[0]?.machineName || 'N/A'}
          </div>
          <div className="text-[13px] text-[#5F6875] mt-1">
            Contributes <strong className="text-[#18202A] font-mono">{machineWasteSummary[0] ? ((machineWasteSummary[0].totalKg / (totalWasteKg || 1)) * 100).toFixed(0) : 0}%</strong> of total scrap volume
          </div>
        </div>
      </div>

      {/* 4. Equipment Scrap Attribution Breakdown (Machine-to-Waste Linkage) */}
      <div className="card-base space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4E7EB]">
          <div>
            <h2 className="text-[18px] leading-[26px] font-semibold text-[#18202A]">
              Machine Waste Attribution & Equipment Health
            </h2>
            <p className="text-[13px] text-[#5F6875] mt-0.5">
              Direct telemetry mapping showing which physical machines produce raw material scrap and defect purges
            </p>
          </div>
          <span className="text-[13px] text-[#5F6875]">
            Updated via automated checkweighers and PLC tag counters
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {machineWasteSummary.map((item) => {
            const machineObj = machines.find((m) => m.id === item.machineId);
            const isAnomalyMachine = item.machineId === 'mach-m03' || (machineObj && machineObj.status !== 'Normal');
            const pctOfTotal = totalWasteKg > 0 ? (item.totalKg / totalWasteKg) * 100 : 0;

            return (
              <div
                key={item.machineName}
                className={`p-4 rounded-xl border transition-all ${
                  isAnomalyMachine
                    ? 'border-[#D92D20]/30 bg-[#FFF8F7]'
                    : 'border-[#E4E7EB] bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[15px] text-[#18202A]">{item.machineName}</span>
                    {machineObj && (
                      <span className="text-[11px] font-mono text-[#5F6875] bg-[#F1F3F5] px-1.5 py-0.5 rounded">
                        {machineObj.code}
                      </span>
                    )}
                  </div>
                  {machineObj && (
                    <span
                      className={`text-[12px] font-semibold px-2 py-0.5 rounded ${
                        machineObj.status === 'Normal'
                          ? 'bg-[#EDFDF2] text-[#18864B]'
                          : 'bg-[#FEF3F2] text-[#D92D20]'
                      }`}
                    >
                      {machineObj.healthScorePct}% Health
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <div>
                    <div className="text-[22px] font-semibold text-[#18202A] font-mono tabular-nums">
                      {item.totalKg} <span className="text-[14px] font-normal text-[#5F6875]">kg scrap</span>
                    </div>
                    <div className="text-[13px] text-[#D92D20] font-mono tabular-nums">
                      {formatCurrency(item.totalCost)} financial loss
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[16px] font-semibold text-[#5F6875] font-mono">
                      {pctOfTotal.toFixed(0)}%
                    </div>
                    <div className="text-[12px] text-[#8A93A0]">of plant scrap</div>
                  </div>
                </div>

                {/* Machine action buttons */}
                <div className="mt-4 pt-3 border-t border-[#E4E7EB] flex items-center justify-between text-[13px]">
                  <button
                    onClick={() => {
                      if (item.machineId) {
                        setSelectedMachineId(item.machineId);
                        setActiveTab('machines');
                      }
                    }}
                    className="text-[#5F6875] hover:text-[#18202A] font-medium flex items-center gap-1 transition-colors"
                  >
                    <span>View Machine Telemetry</span>
                  </button>

                  {item.machineId === 'mach-m03' && (
                    <button
                      onClick={() => openInvestigation('inv-line3-hero', 'waste-energy')}
                      className="text-[#2F5BFF] hover:text-[#2448D8] font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>Investigate Anomaly</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Sub-Navigation Tabs: Waste Logs vs Ingredient Usage vs Energy Draw */}
      <div className="flex border-b border-[#E4E7EB] gap-6 text-[15px] font-medium">
        <button
          onClick={() => setActiveSubTab('waste')}
          className={`pb-3 relative transition-colors ${
            activeSubTab === 'waste'
              ? 'text-[#2F5BFF] font-semibold border-b-2 border-[#2F5BFF]'
              : 'text-[#5F6875] hover:text-[#18202A]'
          }`}
        >
          Scrap & Defect Incidents ({wasteRecords.length})
        </button>
        <button
          onClick={() => setActiveSubTab('ingredients')}
          className={`pb-3 relative transition-colors ${
            activeSubTab === 'ingredients'
              ? 'text-[#2F5BFF] font-semibold border-b-2 border-[#2F5BFF]'
              : 'text-[#5F6875] hover:text-[#18202A]'
          }`}
        >
          Ingredient Consumption & BOM Yield ({ingredientUsageRecords.length} Batches)
        </button>
        <button
          onClick={() => setActiveSubTab('energy')}
          className={`pb-3 relative transition-colors ${
            activeSubTab === 'energy'
              ? 'text-[#2F5BFF] font-semibold border-b-2 border-[#2F5BFF]'
              : 'text-[#5F6875] hover:text-[#18202A]'
          }`}
        >
          Power Consumption & Motor Spikes ({energyRecords.length} Lines)
        </button>
      </div>

      {/* TAB 1: Waste & Scrap Log */}
      {activeSubTab === 'waste' && (
        <div className="card-base space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-[18px] leading-[26px] font-semibold text-[#18202A]">
                Scrap & Waste Incident Registry
              </h2>
              <p className="text-[13px] text-[#5F6875]">
                Log entries with correlated equipment IDs, defect mechanisms, and recovery actions
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-[13px] text-[#5F6875]">
                <Filter className="w-3.5 h-3.5" />
                <span>Machine:</span>
                <select
                  value={machineFilter}
                  onChange={(e) => setMachineFilter(e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-[#E4E7EB] bg-white text-[13px] text-[#18202A] focus:outline-none focus:border-[#2F5BFF]"
                >
                  <option value="all">All Machines</option>
                  <option value="mach-m03">Filling Machine M-03</option>
                  <option value="mach-m08">Packaging Machine M-08</option>
                  <option value="mach-m01">Filling Machine M-01</option>
                  <option value="mach-m05">Mixer M-05</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-[13px] text-[#5F6875]">
                <span>Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-[#E4E7EB] bg-white text-[13px] text-[#18202A] focus:outline-none focus:border-[#2F5BFF]"
                >
                  <option value="all">All Categories</option>
                  <option value="Overfill/Spill">Overfill / Spill</option>
                  <option value="Underfill Rejection">Underfill Rejection</option>
                  <option value="Packaging Tear">Packaging Tear</option>
                  <option value="Startup Purge">Startup Purge</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border border-[#E4E7EB] rounded-xl overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-[#F7F8FA] text-[#5F6875] font-medium border-b border-[#E4E7EB] text-[13px]">
                <tr>
                  <th className="py-3 px-4">Material & Batch</th>
                  <th className="py-3 px-4">Attributed Machine & Line</th>
                  <th className="py-3 px-4">Defect Mechanism</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Loss Cost</th>
                  <th className="py-3 px-4">Correlated Anomaly / Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EB]">
                {filteredWaste.map((w) => {
                  const hasInvestigation = Boolean(w.relatedInvestigationId);
                  return (
                    <tr key={w.id} className="hover:bg-[#F7F8FA] h-16">
                      <td className="py-4 px-4">
                        <div className="font-semibold text-[#18202A]">{w.materialName}</div>
                        <div className="text-[12px] font-mono text-[#5F6875]">
                          Batch: {w.productionBatchCode}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-medium text-[#18202A]">
                          {w.machineName || 'Unassigned Line Station'}
                        </div>
                        <div className="text-[12px] text-[#5F6875]">{w.lineName}</div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-[13px] text-[#18202A]">{w.wasteType}</div>
                        {w.defectCategory && (
                          <span className="text-[11px] font-medium text-[#5F6875] bg-[#F1F3F5] px-1.5 py-0.5 rounded inline-block mt-0.5">
                            {w.defectCategory}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 font-mono font-semibold text-[#18202A] tabular-nums">
                        {w.wasteQuantityKg} kg
                      </td>

                      <td className="py-4 px-4 font-mono font-semibold text-[#D92D20] tabular-nums">
                        ${w.wasteCost}
                      </td>

                      <td className="py-4 px-4">
                        {w.relatedAnomaly ? (
                          <div className="max-w-xs">
                            <span className="text-[12px] font-medium text-[#D92D20] flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span className="truncate">{w.relatedAnomaly}</span>
                            </span>
                            {w.recoveryActionTaken && (
                              <div className="text-[11px] text-[#5F6875] mt-0.5 truncate">
                                Action: {w.recoveryActionTaken}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[12px] text-[#5F6875]">Nominal Process Waste</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        {hasInvestigation ? (
                          <button
                            onClick={() => openInvestigation(w.relatedInvestigationId!, 'waste-energy')}
                            className="h-8 px-3 rounded-lg text-[12px] font-medium text-white bg-[#2F5BFF] hover:bg-[#2448D8] transition-colors shadow-xs inline-flex items-center gap-1.5"
                          >
                            <SearchCode className="w-3.5 h-3.5" />
                            <span>Investigate</span>
                          </button>
                        ) : (
                          <span className="text-[12px] text-[#8A93A0]">{w.timestamp}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Ingredient Usage & Yield Analysis */}
      {activeSubTab === 'ingredients' && (
        <div className="card-base space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-[18px] leading-[26px] font-semibold text-[#18202A]">
                Ingredient Consumption vs. Bill of Materials (BOM) Standard
              </h2>
              <p className="text-[13px] text-[#5F6875]">
                Yield variance tracking per material lot and active processing machinery
              </p>
            </div>
            <div className="text-[13px] text-[#5F6875]">
              Negative variance indicates over-consumption / scrap loss
            </div>
          </div>

          <div className="border border-[#E4E7EB] rounded-xl overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-[#F7F8FA] text-[#5F6875] font-medium border-b border-[#E4E7EB] text-[13px]">
                <tr>
                  <th className="py-3 px-4">Ingredient & Lot Code</th>
                  <th className="py-3 px-4">Processing Machine</th>
                  <th className="py-3 px-4">Standard BOM Target</th>
                  <th className="py-3 px-4">Actual Consumed</th>
                  <th className="py-3 px-4">Yield Variance</th>
                  <th className="py-3 px-4">Scrap Generated</th>
                  <th className="py-3 px-4">Scrap Cost</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EB]">
                {ingredientUsageRecords.map((ing) => {
                  const isAnomaly = ing.status === 'Anomaly Loss';
                  const isWarning = ing.status === 'Variance Warning';

                  return (
                    <tr key={ing.id} className="hover:bg-[#F7F8FA] h-16">
                      <td className="py-4 px-4">
                        <div className="font-semibold text-[#18202A]">{ing.materialName}</div>
                        <div className="text-[12px] font-mono text-[#5F6875]">Lot #{ing.batchCode}</div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-medium text-[#18202A]">{ing.machineName}</div>
                        <div className="text-[12px] text-[#5F6875]">{ing.lineName}</div>
                      </td>

                      <td className="py-4 px-4 font-mono text-[#5F6875] tabular-nums">
                        {ing.plannedQuantityKg.toLocaleString()} {ing.unitOfMeasure}
                      </td>

                      <td className="py-4 px-4 font-mono font-semibold text-[#18202A] tabular-nums">
                        {ing.actualQuantityKg.toLocaleString()} {ing.unitOfMeasure}
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`font-mono font-semibold tabular-nums text-[13px] ${
                            isAnomaly
                              ? 'text-[#D92D20]'
                              : isWarning
                              ? 'text-[#E56B00]'
                              : 'text-[#18864B]'
                          }`}
                        >
                          {ing.yieldVariancePct > 0 ? `+${ing.yieldVariancePct}%` : `${ing.yieldVariancePct}%`}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-mono font-semibold text-[#18202A] tabular-nums">
                        {ing.scrapKg} {ing.unitOfMeasure}
                      </td>

                      <td className="py-4 px-4 font-mono font-semibold text-[#D92D20] tabular-nums">
                        ${ing.scrapCost}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-medium ${
                            isAnomaly
                              ? 'bg-[#FEF3F2] text-[#D92D20] border border-[#FECDCA]'
                              : isWarning
                              ? 'bg-[#FFF6ED] text-[#E56B00] border border-[#FEDF89]'
                              : 'bg-[#EDFDF2] text-[#18864B] border border-[#A6F4C5]'
                          }`}
                        >
                          {ing.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Machine Power Consumption & Spikes */}
      {activeSubTab === 'energy' && (
        <div className="card-base space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-[18px] leading-[26px] font-semibold text-[#18202A]">
                Machine Power Consumption & Spikes
              </h2>
              <p className="text-[13px] text-[#5F6875]">
                Line & machine electrical draw against historical energy baseline
              </p>
            </div>
            <span className="text-[13px] text-[#5F6875] font-mono tabular-nums">
              Total Current: {totalEnergyKwh} kWh (${totalEnergyCost.toFixed(2)})
            </span>
          </div>

          <div className="border border-[#E4E7EB] rounded-xl overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-[#F7F8FA] text-[#5F6875] font-medium border-b border-[#E4E7EB] text-[13px]">
                <tr>
                  <th className="py-3 px-4">Line & Machine</th>
                  <th className="py-3 px-4">Power Draw</th>
                  <th className="py-3 px-4">Cost Est.</th>
                  <th className="py-3 px-4">Baseline Delta</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EB]">
                {energyRecords.map((e, idx) => (
                  <tr key={idx} className="hover:bg-[#F7F8FA] h-14">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-[#18202A]">{e.machineName}</div>
                      <div className="text-[13px] text-[#5F6875]">{e.lineName}</div>
                    </td>
                    <td className="py-4 px-4 font-mono font-semibold text-[#18202A] tabular-nums">
                      {e.kwhConsumed} kWh
                    </td>
                    <td className="py-4 px-4 font-mono text-[#5F6875] tabular-nums">
                      ${e.costEstimate.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 font-semibold font-mono tabular-nums">
                      <span className={e.varianceFromBaselinePct > 10 ? 'text-[#D92D20]' : 'text-[#18202A]'}>
                        {e.varianceFromBaselinePct > 0 ? `+${e.varianceFromBaselinePct}%` : `${e.varianceFromBaselinePct}%`}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span
                        className={`h-7 px-2.5 rounded-[6px] text-[13px] font-medium inline-flex items-center ${
                          e.status === 'Spike'
                            ? 'bg-[#FEF3F2] text-[#D92D20]'
                            : e.status === 'Elevated'
                            ? 'bg-[#FFF6ED] text-[#E56B00]'
                            : 'bg-[#EDFDF2] text-[#18864B]'
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
