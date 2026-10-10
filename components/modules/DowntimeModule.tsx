'use client';

import React, { useState } from 'react';
import { useFactory } from '@/lib/factoryStore';
import {
  Clock,
  AlertTriangle,
  SearchCode,
  DollarSign,
  PieChart,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';

export function DowntimeModule() {
  const { downtimeRecords, setActiveTab, setSelectedInvestigationId } = useFactory();

  const [selectedCategory, setSelectedCategory] = useState('all');

  const filtered = downtimeRecords.filter((d) => {
    if (selectedCategory !== 'all' && d.category !== selectedCategory) return false;
    return true;
  });

  const totalDowntimeMin = downtimeRecords.reduce((acc, d) => acc + d.durationMinutes, 0);
  const totalDowntimeCost = downtimeRecords.reduce((acc, d) => acc + d.estimatedImpactCost, 0);

  return (
    <div className="space-y-8">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[13px] font-medium text-[#5F6875] mb-1">
            Stoppage Analytics
          </div>
          <h1 className="text-[32px] leading-[40px] font-semibold text-[#18202A]">
            Downtime
          </h1>
          <p className="text-[15px] leading-[24px] text-[#5F6875] mt-2">
            Categorization across equipment failures, CIP changeovers, micro-stops, and material feed delays.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 px-3.5 bg-white border border-[#E4E7EB] rounded-lg text-[14px] text-[#18202A] focus:outline-none focus:border-[#2F5BFF]"
          >
            <option value="all">All Categories</option>
            <option value="Equipment failure">Equipment failure</option>
            <option value="Setup / changeover">Setup / changeover</option>
            <option value="Material shortage">Material shortage</option>
            <option value="Quality issue">Quality issue</option>
            <option value="Planned maintenance">Planned maintenance</option>
          </select>
        </div>
      </div>

      {/* 2. KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-base">
          <span className="text-[14px] text-[#5F6875]">Cumulative Downtime</span>
          <div className="text-[28px] leading-[36px] font-semibold text-[#D92D20] mt-2">{totalDowntimeMin} mins</div>
          <div className="text-[13px] text-[#8A93A0] mt-1">Across 4 lines today</div>
        </div>

        <div className="card-base">
          <span className="text-[14px] text-[#5F6875]">Financial Impact</span>
          <div className="text-[28px] leading-[36px] font-semibold text-[#D92D20] mt-2">{formatCurrency(totalDowntimeCost)}</div>
          <div className="text-[13px] text-[#8A93A0] mt-1">Labor & idle capacity cost</div>
        </div>

        <div className="card-base">
          <span className="text-[14px] text-[#5F6875]">Primary Loss Driver</span>
          <div className="text-[18px] font-semibold text-[#18202A] mt-2">Machine M-03 (Line 3)</div>
          <div className="text-[13px] text-[#8A93A0] mt-1">54 min throttling & micro-stops</div>
        </div>

        <div className="card-base">
          <span className="text-[14px] text-[#5F6875]">Mean Time to Repair</span>
          <div className="text-[28px] leading-[36px] font-semibold text-[#18202A] mt-2">26.5 mins</div>
          <div className="text-[13px] text-[#8A93A0] mt-1">Median clearance time</div>
        </div>
      </div>

      {/* 3. Downtime Log Table */}
      <div className="card-base">
        <h2 className="text-[18px] leading-[26px] font-semibold text-[#18202A] mb-4">
          Detailed Incident Stoppage Log
        </h2>
        <div className="border border-[#E4E7EB] rounded-xl overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-[#F7F8FA] text-[#5F6875] font-medium border-b border-[#E4E7EB] text-[13px]">
              <tr>
                <th className="py-3 px-4">Line & Machine</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Window</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Root Reason</th>
                <th className="py-3 px-4">Impact Cost</th>
                <th className="py-3 px-4 text-right">Investigation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EB]">
              {filtered.map((dt) => (
                <tr key={dt.id} className="hover:bg-[#F7F8FA] h-14">
                  <td className="py-4 px-4">
                    <div className="font-semibold text-[#18202A]">{dt.lineName}</div>
                    <div className="text-[13px] text-[#5F6875]">{dt.machineName}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`h-7 px-2.5 rounded-[6px] text-[13px] font-medium inline-flex items-center ${
                        dt.category === 'Equipment failure'
                          ? 'bg-[#FEF3F2] text-[#D92D20]'
                          : dt.category === 'Quality issue'
                          ? 'bg-[#FFF6ED] text-[#E56B00]'
                          : 'bg-[#F1F3F5] text-[#5F6875]'
                      }`}
                    >
                      {dt.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-[#5F6875] text-[13px]">
                    {dt.startTime} - {dt.endTime.split(' ')[1] || dt.endTime}
                  </td>
                  <td className="py-4 px-4 font-semibold text-[#D92D20]">{dt.durationMinutes}m</td>
                  <td className="py-4 px-4 text-[#18202A] max-w-xs">{dt.reason}</td>
                  <td className="py-4 px-4 font-semibold text-[#18202A]">${dt.estimatedImpactCost}</td>
                  <td className="py-4 px-4 text-right">
                    {dt.machineId === 'mach-m03' ? (
                      <button
                        onClick={() => {
                          setActiveTab('investigations');
                          setSelectedInvestigationId('inv-line3-hero');
                        }}
                        className="text-[14px] text-[#2F5BFF] font-medium hover:underline"
                      >
                        Audit in Case #INV-01
                      </button>
                    ) : (
                      <span className="text-[#8A93A0] text-[13px]">Logged</span>
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
