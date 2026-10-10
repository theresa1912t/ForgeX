'use client';

import React, { useState } from 'react';
import { useFactory } from '@/lib/factoryStore';
import {
  PieChart,
  DollarSign,
  TrendingDown,
  Layers,
  SearchCode,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/calculations';

type Dimension = 'machine' | 'line' | 'product' | 'shift' | 'downtime-reason' | 'waste-reason';

export function LossExplorerModule() {
  const {
    productionLines,
    machines,
    products,
    setActiveTab,
    setSelectedInvestigationId,
  } = useFactory();

  const [dimension, setDimension] = useState<Dimension>('machine');

  const getDataForDimension = () => {
    switch (dimension) {
      case 'machine':
        return [
          { name: 'Filling Machine M-03 (Line 3)', lostUnits: 3720, revenueLoss: 4650, share: 62, costRate: '$1,400/hr', highlight: true },
          { name: 'Packaging Machine M-08 (Line 2)', lostUnits: 760, revenueLoss: 1064, share: 21, costRate: '$350/hr' },
          { name: 'Filling Machine M-01 (Line 1)', lostUnits: 180, revenueLoss: 225, share: 8, costRate: '$80/hr' },
          { name: 'Mixer M-05 (Line 2)', lostUnits: 140, revenueLoss: 196, share: 5, costRate: '$60/hr' },
          { name: 'Labeling Machine M-10 (Line 4)', lostUnits: 120, revenueLoss: 252, share: 4, costRate: '$50/hr' },
        ];
      case 'line':
        return [
          { name: 'Line 3 (Beverage Hot-Fill & Capping)', lostUnits: 3720, revenueLoss: 4650, share: 74, costRate: '$1,400/hr', highlight: true },
          { name: 'Line 2 (Dairy Processing & Cartons)', lostUnits: 760, revenueLoss: 1064, share: 15, costRate: '$350/hr' },
          { name: 'Line 1 (High-Speed Beverage Bottling)', lostUnits: 180, revenueLoss: 225, share: 7, costRate: '$80/hr' },
          { name: 'Line 4 (Condiment & Sauce Pouches)', lostUnits: 120, revenueLoss: 252, share: 4, costRate: '$50/hr' },
        ];
      case 'product':
        return [
          { name: 'Orange Drink 500ml (SKU BEV-ORG-500)', lostUnits: 3900, revenueLoss: 4875, share: 76, costRate: '$1,480/hr', highlight: true },
          { name: 'Chocolate Milk 250ml (SKU DAI-CHOC-250)', lostUnits: 760, revenueLoss: 1064, share: 17, costRate: '$350/hr' },
          { name: 'Chili Sauce 250g (SKU SAU-CHI-250)', lostUnits: 120, revenueLoss: 252, share: 4, costRate: '$50/hr' },
          { name: 'Strawberry Yogurt 150g (SKU DAI-YOG-150)', lostUnits: 80, revenueLoss: 76, share: 3, costRate: '$30/hr' },
        ];
      case 'shift':
        return [
          { name: 'Shift B (Morning/Afternoon · Active)', lostUnits: 4780, revenueLoss: 5975, share: 82, costRate: '$1,880/hr', highlight: true },
          { name: 'Shift A (Night / Previous)', lostUnits: 740, revenueLoss: 925, share: 13, costRate: '$210/hr' },
          { name: 'Shift C (Evening / Scheduled)', lostUnits: 280, revenueLoss: 350, share: 5, costRate: '$100/hr' },
        ];
      case 'downtime-reason':
        return [
          { name: 'Valve Stroke Cavitation & Jam (M-03)', lostUnits: 2800, revenueLoss: 3500, share: 59, costRate: '$1,166/hr', highlight: true },
          { name: 'Ultrasonic Carton Sealing Misfire (M-08)', lostUnits: 980, revenueLoss: 1372, share: 23, costRate: '$450/hr' },
          { name: 'CIP Rinse Flush Interlock Delay', lostUnits: 550, revenueLoss: 687, share: 11, costRate: '$220/hr' },
          { name: 'Pouch Foil Splice Alignment Delay', lostUnits: 320, revenueLoss: 416, share: 7, costRate: '$140/hr' },
        ];
      case 'waste-reason':
        return [
          { name: 'Process Loss (Fill-height checkweigher rejects)', lostUnits: 1850, revenueLoss: 2312, share: 66, costRate: '$770/hr', highlight: true },
          { name: 'Preparation / Startup Misfit', lostUnits: 520, revenueLoss: 650, share: 20, costRate: '$210/hr' },
          { name: 'Damaged Preforms / Foil Tears', lostUnits: 310, revenueLoss: 387, share: 14, costRate: '$130/hr' },
        ];
    }
  };

  const rows = getDataForDimension();
  const totalRevenueAtRisk = rows.reduce((acc, r) => acc + r.revenueLoss, 0);

  return (
    <div className="space-y-8">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[13px] font-medium text-[#5F6875] mb-1">
            Financial Intelligence
          </div>
          <h1 className="text-[32px] leading-[40px] font-semibold text-[#18202A]">
            Loss Explorer
          </h1>
          <p className="text-[15px] leading-[24px] text-[#5F6875] mt-2">
            Drill down into where manufacturing revenue is leaking across lines, machines, SKUs, and stoppage reasons.
          </p>
        </div>

        <div className="h-10 px-4 bg-[#FEF3F2] border border-[#FECDCA] rounded-lg text-[14px] text-[#D92D20] flex items-center gap-2">
          <span>Cumulative Loss Today:</span>
          <strong className="text-[16px] font-semibold">{formatCurrency(totalRevenueAtRisk)}</strong>
        </div>
      </div>

      {/* 2. Dimension Filter Toolbar */}
      <div className="card-base flex flex-wrap items-center gap-2">
        <span className="text-[14px] font-medium text-[#5F6875] mr-2">Breakdown By:</span>
        {[
          { id: 'machine', label: 'Machine Fleet' },
          { id: 'line', label: 'Production Line' },
          { id: 'product', label: 'Product / SKU' },
          { id: 'shift', label: 'Operating Shift' },
          { id: 'downtime-reason', label: 'Downtime Reason' },
          { id: 'waste-reason', label: 'Scrap & Waste Cause' },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setDimension(btn.id as Dimension)}
            className={`h-10 px-4 rounded-lg text-[14px] font-medium transition-colors ${
              dimension === btn.id
                ? 'bg-[#EEF3FF] text-[#2F5BFF]'
                : 'bg-white text-[#5F6875] border border-[#E4E7EB] hover:bg-[#F7F8FA]'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* 3. Dimension Waterfall Table */}
      <div className="card-base space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] leading-[26px] font-semibold text-[#18202A]">
            Dimension Breakdown: {dimension.replace('-', ' ').toUpperCase()}
          </h2>
          <span className="text-[13px] text-[#5F6875]">Click contributor to open Root Cause Analysis</span>
        </div>

        <div className="border border-[#E4E7EB] rounded-xl overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-[#F7F8FA] text-[#5F6875] font-medium border-b border-[#E4E7EB] text-[13px]">
              <tr>
                <th className="py-3 px-4">Contributor</th>
                <th className="py-3 px-4">Lost Output</th>
                <th className="py-3 px-4">Gross Revenue Loss</th>
                <th className="py-3 px-4">Loss Run-Rate</th>
                <th className="py-3 px-4">Share of Loss</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EB]">
              {rows.map((row, idx) => (
                <tr
                  key={idx}
                  className={`h-14 transition-colors ${
                    row.highlight
                      ? 'bg-[#FEF3F2]/30 hover:bg-[#FEF3F2]/50'
                      : 'hover:bg-[#F7F8FA]'
                  }`}
                >
                  <td className="py-4 px-4">
                    <span className="text-[#18202A] font-semibold">{row.name}</span>
                    {row.highlight && (
                      <span className="ml-2 h-6 px-2 text-[13px] font-medium bg-[#FEF3F2] text-[#D92D20] border border-[#FECDCA] rounded inline-flex items-center">
                        Focal Bottleneck
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 font-semibold text-[#D92D20]">
                    {formatNumber(row.lostUnits)} units
                  </td>
                  <td className="py-4 px-4 font-semibold text-[#D92D20]">
                    {formatCurrency(row.revenueLoss)}
                  </td>
                  <td className="py-4 px-4 text-[#5F6875]">{row.costRate}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-28 bg-[#F1F3F5] h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${row.share > 50 ? 'bg-[#D92D20]' : 'bg-[#E56B00]'}`}
                          style={{ width: `${row.share}%` }}
                        />
                      </div>
                      <span className="text-[13px] text-[#5F6875]">{row.share}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    {row.highlight ? (
                      <button
                        onClick={() => {
                          setActiveTab('investigations');
                          setSelectedInvestigationId('inv-line3-hero');
                        }}
                        className="h-8 px-3 text-[13px] font-medium text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-md transition-colors shadow-sm"
                      >
                        Investigate Loss
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveTab('investigations')}
                        className="text-[13px] font-medium text-[#2F5BFF] hover:underline"
                      >
                        Explore
                      </button>
                    )}
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
