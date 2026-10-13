'use client';

import React, { useState } from 'react';
import { useFactory } from '@/lib/factoryStore';
import {
  Boxes,
  AlertTriangle,
  SearchCode,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Flame,
  CheckCircle2,
  PanelRightOpen,
  Warehouse,
  Scale,
  Activity,
  Layers,
  Info,
} from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';

export function MaterialsModule() {
  const {
    materials,
    materialBatches,
    ingredientUsageRecords,
    setActiveTab,
    openInvestigationDrawer,
    openInvestigation,
    investigations,
  } = useFactory();

  const [selectedBatchCode, setSelectedBatchCode] = useState('RM-284');

  const selectedBatch =
    materialBatches.find((b) => b.batchCode === selectedBatchCode) || materialBatches[0];

  const heroInvestigation = investigations['inv-line3-hero'];
  const isLine3Resolved = heroInvestigation?.status === 'Resolved';

  return (
    <div className="space-y-8">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[13px] font-medium text-[#5F6875] mb-1">
            Materials & Genealogy
          </div>
          <h1 className="text-[32px] leading-[40px] font-semibold text-[#18202A]">
            Materials
          </h1>
          <p className="text-[15px] leading-[24px] text-[#5F6875] mt-2">
            Warehouse inventory on-hand, real-time recipe dosing variances, and active lot traceability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('waste-energy')}
            className="h-10 px-4 bg-white border border-[#E4E7EB] hover:bg-[#F7F8FA] rounded-lg text-[14px] text-[#18202A] font-medium flex items-center gap-2 transition-colors shadow-xs"
          >
            <Flame className="w-4 h-4 text-[#D92D20]" />
            <span>Waste & Scrap Ledger</span>
          </button>
        </div>
      </div>

      {/* 2. TOP INCIDENT HERO CARD: Active Lot Anomaly (Lot #RM-284) */}
      <div className="rounded-xl border-2 border-[#FEDF89] bg-gradient-to-r from-[#FFFBF5] via-[#FFFFFF] to-[#FFF8F0] p-6 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-bold bg-[#FEF3F2] text-[#D92D20] border border-[#FECDCA] uppercase tracking-wide">
                <AlertTriangle className="w-3.5 h-3.5" />
                Active Anomaly Flagged
              </span>
              <h2 className="text-[20px] leading-[28px] font-bold text-[#18202A]">
                Concentrate Lot #{selectedBatch.batchCode} · Quality & Valve Anomaly
              </h2>
              <span className="text-[12px] font-medium px-2 py-0.5 rounded bg-[#FFF6ED] text-[#E56B00] border border-[#FEDF89]">
                Filling Machine M-03 (Line 3)
              </span>
            </div>
            <p className="text-[14px] text-[#5F6875]">
              Supplier: <span className="font-medium text-[#18202A]">{selectedBatch.supplier}</span> · Received:{' '}
              <span className="font-medium text-[#18202A]">{selectedBatch.receivedDate}</span> · Current Stock:{' '}
              <span className="font-medium text-[#18202A]">
                {selectedBatch.quantity} {selectedBatch.unitOfMeasure}
              </span>
            </p>
          </div>

          {/* Quick Drawer Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => openInvestigationDrawer('inv-line3-hero')}
              className="h-10 px-4 text-[13px] font-semibold text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-lg transition-all shadow-sm flex items-center gap-2 group"
              title="Open full root-cause investigation slide-over drawer"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Open Investigation Drawer</span>
              <PanelRightOpen className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => openInvestigation('inv-line3-hero', 'materials')}
              className="h-10 px-3.5 text-[13px] font-medium text-[#485363] hover:text-[#18202A] bg-white hover:bg-[#F7F8FA] border border-[#D0D5DD] rounded-lg transition-colors flex items-center gap-2"
              title="Navigate to full investigations workbench"
            >
              <SearchCode className="w-4 h-4 text-[#5F6875]" />
              <span>Full Workbench</span>
            </button>
          </div>
        </div>

        {/* Anomaly Impact Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-[#F2E7DC]">
          <div className="bg-white/80 rounded-lg p-3 border border-[#F2E7DC]">
            <div className="text-[12px] font-medium text-[#5F6875]">Viscosity Deviation</div>
            <div className="text-[16px] font-bold text-[#D92D20] mt-0.5">+8.4% above target</div>
            <div className="text-[11px] text-[#8A93A0]">68.2 cP vs 62.8 cP CoA standard</div>
          </div>
          <div className="bg-white/80 rounded-lg p-3 border border-[#F2E7DC]">
            <div className="text-[12px] font-medium text-[#5F6875]">Scrap Generated</div>
            <div className="text-[16px] font-bold text-[#D92D20] mt-0.5">128 kg / 256 bottles</div>
            <div className="text-[11px] text-[#8A93A0]">Checkweigher rejects & spillage</div>
          </div>
          <div className="bg-white/80 rounded-lg p-3 border border-[#F2E7DC]">
            <div className="text-[12px] font-medium text-[#5F6875]">Cumulative Loss Value</div>
            <div className="text-[16px] font-bold text-[#D92D20] mt-0.5">$768.00</div>
            <div className="text-[11px] text-[#8A93A0]">Raw material + scrap cost</div>
          </div>
          <div className="bg-white/80 rounded-lg p-3 border border-[#F2E7DC]">
            <div className="text-[12px] font-medium text-[#5F6875]">Primary Root Cause</div>
            <div className="text-[16px] font-bold text-[#18202A] mt-0.5">Valve #4 Diaphragm</div>
            <div className="text-[11px] text-[#8A93A0]">Mechanical tear under +0.2 bar backpressure</div>
          </div>
        </div>

        {/* AI Correlation Callout */}
        <div className="card-ai space-y-2.5">
          <div className="text-[14px] font-semibold text-[#18202A] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2F5BFF]" />
              <span>AI Genealogy & Shopfloor Correlation:</span>
            </div>
            {isLine3Resolved ? (
              <span className="text-[12px] font-medium text-[#18864B] flex items-center gap-1 bg-[#EDFDF2] px-2 py-0.5 rounded border border-[#A6F4C5]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Resolution Executed
              </span>
            ) : (
              <span className="text-[12px] font-medium text-[#D92D20] flex items-center gap-1 bg-[#FEF3F2] px-2 py-0.5 rounded border border-[#FECDCA]">
                Action Required
              </span>
            )}
          </div>
          <p className="text-[13px] leading-[20px] text-[#18202A]">
            Concentrate Lot RM-284 was charged into mixing tank MT-02 at 08:30 AM today. Supplier Certificate of Analysis notes viscosity at <strong>+8.4% above median standard</strong>. While this elevated line backpressure on Filling Machine M-03 by ~0.2 bar, AI correlation isolated mechanical diaphragm failure on valve head #4 as the primary restriction, generating <strong>128 kg of scrap ($768 loss)</strong> across checkweigher rejects and spillage.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#5F6875] pt-2 border-t border-[#D9E4FF]">
            <span>Associated SKU: <strong className="text-[#18202A]">Orange Drink 500ml</strong></span>
            <span>·</span>
            <span>Production Run: <strong className="text-[#18202A]">Batch PB-ORG-1008</strong></span>
            <span>·</span>
            <span>Equipment Destination: <strong className="text-[#18202A]">Filling Machine M-03</strong></span>
            <span>·</span>
            <span>Sample Status: <strong className="text-[#18202A]">Retained for QA viscosity audit</strong></span>
          </div>
        </div>
      </div>

      {/* 3. DYNAMIC SHOPFLOOR SECTION: Active Batch Consumption & Scrap Variance */}
      <div className="card-base space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E4E7EB]">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#2F5BFF]" />
              <h2 className="text-[18px] leading-[26px] font-semibold text-[#18202A]">
                Active Batch Consumption & Scrap Variance
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#EEF3FF] text-[#2F5BFF]">
                Shopfloor Execution
              </span>
            </div>
            <p className="text-[13px] text-[#5F6875] mt-1">
              Live recipe dosing variance between target formula (BOM) and actual shopfloor consumption across running lines.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[#5F6875] bg-[#F7F8FA] px-3 py-1.5 rounded-lg border border-[#E4E7EB] shrink-0">
            <Info className="w-3.5 h-3.5 text-[#8A93A0]" />
            <span>Tolerance Threshold: ±2.0%</span>
          </div>
        </div>

        <div className="border border-[#E4E7EB] rounded-xl overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-[#F7F8FA] text-[#5F6875] font-medium border-b border-[#E4E7EB] text-[13px]">
              <tr>
                <th className="py-3 px-4">Ingredient Lot</th>
                <th className="py-3 px-4">Processing Station & Machine</th>
                <th className="py-3 px-4">Planned BOM Target</th>
                <th className="py-3 px-4">Actual Consumed</th>
                <th className="py-3 px-4">Yield Variance</th>
                <th className="py-3 px-4">Scrap Generated</th>
                <th className="py-3 px-4">Loss Value</th>
                <th className="py-3 px-4 text-right">Yield Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EB]">
              {ingredientUsageRecords.map((ing) => {
                const isAnomaly = ing.status === 'Anomaly Loss';
                const isWarning = ing.status === 'Variance Warning';

                return (
                  <tr
                    key={ing.id}
                    className={`hover:bg-[#F7F8FA] h-16 transition-colors ${
                      isAnomaly ? 'bg-[#FEF3F2]/40' : ''
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div className="font-semibold text-[#18202A] flex items-center gap-1.5">
                        {ing.materialName}
                        {isAnomaly && (
                          <span className="w-2 h-2 rounded-full bg-[#D92D20] shrink-0" />
                        )}
                      </div>
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
                      {isAnomaly ? (
                        <button
                          onClick={() => openInvestigationDrawer('inv-line3-hero')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] font-semibold bg-[#FEF3F2] text-[#D92D20] border border-[#FECDCA] hover:bg-[#FEE4E2] transition-colors"
                          title="Click to inspect anomaly in slide-over drawer"
                        >
                          <span>{ing.status}</span>
                          <PanelRightOpen className="w-3.5 h-3.5 ml-0.5" />
                        </button>
                      ) : (
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-medium ${
                            isWarning
                              ? 'bg-[#FFF6ED] text-[#E56B00] border border-[#FEDF89]'
                              : 'bg-[#EDFDF2] text-[#18864B] border border-[#A6F4C5]'
                          }`}
                        >
                          {ing.status}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. STATIC WAREHOUSE SECTION: Warehouse Inventory Stock */}
      <div className="card-base space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E4E7EB]">
          <div>
            <div className="flex items-center gap-2">
              <Warehouse className="w-5 h-5 text-[#475467]" />
              <h2 className="text-[18px] leading-[26px] font-semibold text-[#18202A]">
                Warehouse Inventory Stock
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#F2F4F7] text-[#475467]">
                Storage Balances
              </span>
            </div>
            <p className="text-[13px] text-[#5F6875] mt-1">
              On-hand raw ingredient and packaging inventory levels with supplier Certificate of Analysis (CoA) status.
            </p>
          </div>
          <div className="text-[12px] text-[#5F6875]">
            Total SKUs Tracked: <strong className="text-[#18202A]">{materials.length}</strong>
          </div>
        </div>

        <div className="border border-[#E4E7EB] rounded-xl overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-[#F7F8FA] text-[#5F6875] font-medium border-b border-[#E4E7EB] text-[13px]">
              <tr>
                <th className="py-3 px-4">Material Name</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Active Batches</th>
                <th className="py-3 px-4">Unit Cost</th>
                <th className="py-3 px-4 text-right">CoA Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EB]">
              {materials.map((m) => (
                <tr key={m.id} className="hover:bg-[#F7F8FA] h-14">
                  <td className="py-4 px-4 font-semibold text-[#18202A]">{m.name}</td>
                  <td className="py-4 px-4 text-[#5F6875] font-mono text-[13px]">{m.code}</td>
                  <td className="py-4 px-4 text-[#5F6875]">{m.category}</td>
                  <td className="py-4 px-4 text-[#18202A]">{m.supplier}</td>
                  <td className="py-4 px-4 font-medium text-[#18202A] font-mono tabular-nums">
                    {m.currentStock.toLocaleString()} {m.unitOfMeasure}
                  </td>
                  <td className="py-4 px-4 text-[#5F6875]">{m.activeBatchCount}</td>
                  <td className="py-4 px-4 text-[#18202A] font-mono tabular-nums">
                    ${m.unitCost.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="h-7 px-2.5 rounded-[6px] text-[13px] font-medium bg-[#EDFDF2] text-[#18864B] inline-flex items-center">
                      {m.qualityStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
