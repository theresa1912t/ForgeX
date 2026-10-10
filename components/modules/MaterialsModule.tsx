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
} from 'lucide-react';

export function MaterialsModule() {
  const {
    materials,
    materialBatches,
    setActiveTab,
    setSelectedInvestigationId,
  } = useFactory();

  const [selectedBatchCode, setSelectedBatchCode] = useState('RM-284');

  const selectedBatch =
    materialBatches.find((b) => b.batchCode === selectedBatchCode) || materialBatches[0];

  return (
    <div className="space-y-8">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[13px] font-medium text-[#5F6875] mb-1">
            Genealogy & Traceability
          </div>
          <h1 className="text-[32px] leading-[40px] font-semibold text-[#18202A]">
            Materials & Batches
          </h1>
          <p className="text-[15px] leading-[24px] text-[#5F6875] mt-2">
            Ingredient lots, supplier certificates of analysis (CoA), and root-cause traceability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="h-10 px-3.5 rounded-lg text-[14px] font-medium bg-[#FFF6ED] text-[#E56B00] border border-[#FEDF89] inline-flex items-center">
            Batch RM-284 Under AI Investigation
          </span>
        </div>
      </div>

      {/* 2. Materials List Table */}
      <div className="card-base">
        <h2 className="text-[18px] leading-[26px] font-semibold text-[#18202A] mb-4">
          Ingredient & Packaging Inventory
        </h2>
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
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EB]">
              {materials.map((m) => (
                <tr key={m.id} className="hover:bg-[#F7F8FA] h-14">
                  <td className="py-4 px-4 font-semibold text-[#18202A]">{m.name}</td>
                  <td className="py-4 px-4 text-[#5F6875]">{m.code}</td>
                  <td className="py-4 px-4 text-[#5F6875]">{m.category}</td>
                  <td className="py-4 px-4 text-[#18202A]">{m.supplier}</td>
                  <td className="py-4 px-4 font-medium text-[#18202A]">{m.currentStock.toLocaleString()} {m.unitOfMeasure}</td>
                  <td className="py-4 px-4 text-[#5F6875]">{m.activeBatchCount}</td>
                  <td className="py-4 px-4 text-[#18202A]">${m.unitCost.toFixed(2)}</td>
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

      {/* 3. Batch Traceability & Root Cause Card */}
      <div className="card-base space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#E4E7EB] gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-[22px] leading-[30px] font-semibold text-[#18202A]">
                Active Lot Investigation: Lot #{selectedBatch.batchCode}
              </h2>
              <span
                className={`h-7 px-2.5 rounded-[6px] text-[13px] font-medium inline-flex items-center ${
                  selectedBatch.status === 'Flagged'
                    ? 'bg-[#FEF3F2] text-[#D92D20]'
                    : 'bg-[#EDFDF2] text-[#18864B]'
                }`}
              >
                {selectedBatch.status}
              </span>
            </div>
            <p className="text-[14px] text-[#5F6875] mt-1">
              Supplier: {selectedBatch.supplier} · Received: {selectedBatch.receivedDate} · Stock: {selectedBatch.quantity} {selectedBatch.unitOfMeasure}
            </p>
          </div>

          <button
            onClick={() => {
              setActiveTab('investigations');
              setSelectedInvestigationId('inv-line3-hero');
            }}
            className="h-10 px-4 text-[14px] font-medium text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-lg transition-colors shadow-sm flex items-center gap-2 self-start md:self-auto"
          >
            <SearchCode className="w-4 h-4" />
            <span>Correlate with Line 3 Loss</span>
          </button>
        </div>

        <div className="card-ai space-y-3">
          <div className="text-[15px] font-semibold text-[#18202A] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2F5BFF]" />
            <span>AI Genealogy Analysis for Batch RM-284:</span>
          </div>
          <p className="text-[14px] leading-[22px] text-[#18202A]">
            Concentrate Lot RM-284 was charged into mixing tank MT-02 at 08:30 AM today. Supplier Certificate of Analysis notes viscosity at <strong>+8.4% above median standard</strong> (68.2 cP vs 62.8 cP). While this elevated backpressure on Filling Machine M-03 by ~0.2 bar, AI cross-spectral correlation isolated mechanical diaphragm failure on valve head #4 as the primary restriction.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-[13px] text-[#5F6875] pt-2 border-t border-[#D9E4FF]">
            <span>Associated SKU: <strong className="text-[#18202A]">Orange Drink 500ml</strong></span>
            <span>·</span>
            <span>Production Run: <strong className="text-[#18202A]">Batch PB-ORG-1008</strong></span>
            <span>·</span>
            <span>Sample Status: <strong className="text-[#18202A]">Retained for QA viscosity audit</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
