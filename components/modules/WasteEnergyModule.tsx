'use client';

import React from 'react';
import { useFactory } from '@/lib/factoryStore';
import {
  Flame,
  Zap,
  Layers,
  AlertTriangle,
  TrendingDown,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';

export function WasteEnergyModule() {
  const { wasteRecords, energyRecords } = useFactory();

  const totalWasteKg = wasteRecords.reduce((acc, w) => acc + w.wasteQuantityKg, 0);
  const totalWasteCost = wasteRecords.reduce((acc, w) => acc + w.wasteCost, 0);

  const totalEnergyKwh = energyRecords.reduce((acc, e) => acc + e.kwhConsumed, 0);
  const totalEnergyCost = energyRecords.reduce((acc, e) => acc + e.costEstimate, 0);

  return (
    <div className="space-y-8">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[13px] font-medium text-[#5F6875] mb-1">
            Resource Conservation
          </div>
          <h1 className="text-[32px] leading-[40px] font-semibold text-[#18202A]">
            Waste & Energy
          </h1>
          <p className="text-[15px] leading-[24px] text-[#5F6875] mt-2">
            Material scrap volumes and electrical power draw anomalies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-10 px-4 bg-white border border-[#E4E7EB] rounded-lg text-[14px] text-[#5F6875] flex items-center gap-2">
            <span>Scrap Cost:</span>
            <strong className="text-[#D92D20]">{formatCurrency(totalWasteCost)}</strong>
          </div>
          <div className="h-10 px-4 bg-white border border-[#E4E7EB] rounded-lg text-[14px] text-[#5F6875] flex items-center gap-2">
            <span>Power Draw:</span>
            <strong className="text-[#18202A]">{totalEnergyKwh} kWh</strong>
          </div>
        </div>
      </div>

      {/* 2. Utility Anomaly Callout */}
      <div className="card-ai flex items-start gap-4">
        <Zap className="w-5 h-5 text-[#2F5BFF] shrink-0 mt-0.5" />
        <div className="text-[14px] leading-[22px] text-[#18202A]">
          <strong className="text-[#2F5BFF]">Utility Anomaly Detected on Line 2: </strong>
          <strong>Line 2 energy consumption is running 18.4% above normal baseline</strong> (245 kWh vs 207 kWh baseline). Cross-referencing indicates packaging drive motor friction on Machine M-08 is drawing elevated current without volume increase.
        </div>
      </div>

      {/* 3. Grid: Waste Table & Energy Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Waste Scrap Table */}
        <div className="card-base">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] leading-[26px] font-semibold text-[#18202A]">
              Scrap & Material Loss Log
            </h2>
            <span className="text-[14px] font-medium text-[#5F6875]">{totalWasteKg} kg total</span>
          </div>

          <div className="border border-[#E4E7EB] rounded-xl overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-[#F7F8FA] text-[#5F6875] font-medium border-b border-[#E4E7EB] text-[13px]">
                <tr>
                  <th className="py-3 px-4">Material</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4 text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EB]">
                {wasteRecords.map((w, idx) => (
                  <tr key={idx} className="hover:bg-[#F7F8FA] h-14">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-[#18202A]">{w.materialName}</div>
                      <div className="text-[13px] text-[#5F6875]">{w.lineName} · {w.productionBatchCode}</div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-[#18202A]">{w.wasteQuantityKg} kg</td>
                    <td className="py-4 px-4">
                      <span className="h-7 px-2.5 rounded-[6px] text-[13px] font-medium bg-[#F1F3F5] text-[#5F6875] inline-flex items-center">
                        {w.wasteReason}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-[#D92D20]">
                      ${w.wasteCost}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Energy Consumption Table */}
        <div className="card-base">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] leading-[26px] font-semibold text-[#18202A]">
              Machine Power Consumption & Spikes
            </h2>
            <span className="text-[14px] font-medium text-[#5F6875]">{totalEnergyKwh} kWh total</span>
          </div>

          <div className="border border-[#E4E7EB] rounded-xl overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-[#F7F8FA] text-[#5F6875] font-medium border-b border-[#E4E7EB] text-[13px]">
                <tr>
                  <th className="py-3 px-4">Line & Machine</th>
                  <th className="py-3 px-4">Draw</th>
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
                    <td className="py-4 px-4 font-semibold text-[#18202A]">{e.kwhConsumed} kWh</td>
                    <td className="py-4 px-4 font-semibold">
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
      </div>
    </div>
  );
}
