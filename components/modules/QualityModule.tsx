'use client';

import React, { useState } from 'react';
import { useFactory } from '@/lib/factoryStore';
import {
  ShieldCheck,
  AlertTriangle,
  SearchCode,
  Layers,
  ArrowRight,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

export function QualityModule() {
  const { qualityRecords, setActiveTab, setSelectedInvestigationId } = useFactory();

  const [selectedProduct, setSelectedProduct] = useState('all');

  const filteredRecords = qualityRecords.filter((r) => {
    if (selectedProduct !== 'all' && r.productName !== selectedProduct) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[13px] font-medium text-[#5F6875] mb-1">
            Quality Assurance
          </div>
          <h1 className="text-[32px] leading-[40px] font-semibold text-[#18202A]">
            Quality & Defect Intelligence
          </h1>
          <p className="text-[15px] leading-[24px] text-[#5F6875] mt-2">
            Checkweigher fill-height logs, carton seal integrity, and first-pass yield tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="h-10 px-3.5 bg-white border border-[#E4E7EB] rounded-lg text-[14px] text-[#18202A] focus:outline-none focus:border-[#2F5BFF]"
          >
            <option value="all">All Products</option>
            <option value="Orange Drink 500ml">Orange Drink 500ml</option>
            <option value="Chocolate Milk 250ml">Chocolate Milk 250ml</option>
            <option value="Strawberry Yogurt 150g">Strawberry Yogurt 150g</option>
            <option value="Chili Sauce 250g">Chili Sauce 250g</option>
          </select>
        </div>
      </div>

      {/* 2. Top 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-base">
          <span className="text-[14px] text-[#5F6875]">First-Pass Yield</span>
          <div className="text-[28px] leading-[36px] font-semibold text-[#18864B] mt-2">98.58%</div>
          <div className="text-[13px] text-[#8A93A0] mt-1">Target: &gt;99.20%</div>
        </div>

        <div className="card-base">
          <span className="text-[14px] text-[#5F6875]">Active Defect Rate</span>
          <div className="text-[28px] leading-[36px] font-semibold text-[#D92D20] mt-2">1.42%</div>
          <div className="text-[13px] text-[#8A93A0] mt-1">Elevated on Lines 2 & 3</div>
        </div>

        <div className="card-base">
          <span className="text-[14px] text-[#5F6875]">Rework Volume</span>
          <div className="text-[28px] leading-[36px] font-semibold text-[#18202A] mt-2">420 units</div>
          <div className="text-[13px] text-[#8A93A0] mt-1">Fill-height underdosing</div>
        </div>

        <div className="card-base">
          <span className="text-[14px] text-[#5F6875]">Scrapped Units</span>
          <div className="text-[28px] leading-[36px] font-semibold text-[#18202A] mt-2">94 units</div>
          <div className="text-[13px] text-[#8A93A0] mt-1">Ultrasonic pinhole defect</div>
        </div>
      </div>

      {/* 3. AI Correlation Callout */}
      <div className="card-ai flex items-start gap-4">
        <Sparkles className="w-5 h-5 text-[#2F5BFF] shrink-0 mt-0.5" />
        <div className="text-[14px] leading-[22px] text-[#18202A]">
          <strong className="text-[#2F5BFF]">AI Cross-Domain Quality Correlation: </strong>
          Defect rates on <strong>Line 3 (Orange Drink 500ml)</strong> jumped 2.1× due to erratic nozzle shut-off pressure on Machine M-03. While <strong>Material Batch RM-284</strong> (+8.4% viscosity) contributed fluid backpressure, valve diaphragm mechanical wear remains the 61% primary contributor.
        </div>
      </div>

      {/* 4. Quality Inspection Records Table */}
      <div className="card-base">
        <h2 className="text-[18px] leading-[26px] font-semibold text-[#18202A] mb-4">
          Inspection Records & Dispositions
        </h2>
        <div className="border border-[#E4E7EB] rounded-xl overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-[#F7F8FA] text-[#5F6875] font-medium border-b border-[#E4E7EB] text-[13px]">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Line</th>
                <th className="py-3 px-4">Batch Code</th>
                <th className="py-3 px-4">Sample Size</th>
                <th className="py-3 px-4">Defects</th>
                <th className="py-3 px-4">Defect Rate</th>
                <th className="py-3 px-4">Primary Defect Type</th>
                <th className="py-3 px-4">Disposition</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EB]">
              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-[#F7F8FA] h-14">
                  <td className="py-4 px-4 font-semibold text-[#18202A]">{r.productName}</td>
                  <td className="py-4 px-4 text-[#5F6875]">{r.lineName}</td>
                  <td className="py-4 px-4 font-medium text-[#18202A]">{r.batchCode}</td>
                  <td className="py-4 px-4 text-[#5F6875]">{r.sampleSize}</td>
                  <td className="py-4 px-4 font-semibold text-[#D92D20]">{r.defectCount}</td>
                  <td className="py-4 px-4 font-semibold">
                    <span className={r.defectRatePct > 1.5 ? 'text-[#D92D20]' : 'text-[#18864B]'}>
                      {r.defectRatePct}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-[#5F6875]">{r.topDefectType}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`h-7 px-2.5 rounded-[6px] text-[13px] font-medium inline-flex items-center ${
                        r.disposition === 'Approved'
                          ? 'bg-[#EDFDF2] text-[#18864B]'
                          : r.disposition === 'Rework'
                          ? 'bg-[#FFF6ED] text-[#E56B00]'
                          : 'bg-[#FEF3F2] text-[#D92D20]'
                      }`}
                    >
                      {r.disposition}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right text-[13px] text-[#5F6875]">{r.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
