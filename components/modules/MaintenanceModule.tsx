'use client';

import React, { useState } from 'react';
import { useFactory } from '@/lib/factoryStore';
import {
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  SearchCode,
} from 'lucide-react';

export function MaintenanceModule() {
  const {
    maintenanceRecords,
    setActiveTab,
    setSelectedInvestigationId,
  } = useFactory();

  const [selectedType, setSelectedType] = useState('all');

  const filtered = maintenanceRecords.filter((r) => {
    if (selectedType !== 'all' && r.type !== selectedType) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[13px] font-medium text-[#5F6875] mb-1">
            Reliability Engineering
          </div>
          <h1 className="text-[32px] leading-[40px] font-semibold text-[#18202A]">
            Maintenance
          </h1>
          <p className="text-[15px] leading-[24px] text-[#5F6875] mt-2">
            Work orders, component failure recurrence patterns, and technician repair durations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-10 px-3.5 bg-white border border-[#E4E7EB] rounded-lg text-[14px] text-[#18202A] focus:outline-none focus:border-[#2F5BFF]"
          >
            <option value="all">All Types</option>
            <option value="Corrective">Corrective</option>
            <option value="Preventive">Preventive</option>
            <option value="Inspection">Inspection</option>
          </select>
        </div>
      </div>

      {/* 2. Recurring Failure Pattern Banner */}
      <div className="card-ai flex items-start gap-4">
        <Sparkles className="w-5 h-5 text-[#2F5BFF] shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[15px] font-semibold text-[#18202A]">
              Recurring Failure Pattern Detected on Machine M-03
            </span>
            <button
              onClick={() => {
                setActiveTab('investigations');
                setSelectedInvestigationId('inv-line3-hero');
              }}
              className="text-[14px] text-[#2F5BFF] hover:underline font-medium flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Audit in Investigation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[14px] leading-[22px] text-[#18202A] mt-1.5">
            <strong>Machine M-03 has experienced 3 valve-related maintenance interventions in the last 30 days</strong> (Aug 28, Sept 14, and today). AI reliability analysis recommends migrating to reinforced PTFE diaphragms during the upcoming weekend scheduled PM.
          </p>
        </div>
      </div>

      {/* 3. Maintenance Records Table */}
      <div className="card-base">
        <h2 className="text-[18px] leading-[26px] font-semibold text-[#18202A] mb-4">
          Equipment Maintenance History
        </h2>
        <div className="border border-[#E4E7EB] rounded-xl overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-[#F7F8FA] text-[#5F6875] font-medium border-b border-[#E4E7EB] text-[13px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Machine</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Issue Reported</th>
                <th className="py-3 px-4">Failure Classification</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Lead Tech</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EB]">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-[#F7F8FA] h-14">
                  <td className="py-4 px-4 text-[#5F6875]">{log.date}</td>
                  <td className="py-4 px-4 font-semibold text-[#18202A]">{log.machineName}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`h-7 px-2.5 rounded-[6px] text-[13px] font-medium inline-flex items-center ${
                        log.type === 'Corrective'
                          ? 'bg-[#FEF3F2] text-[#D92D20]'
                          : log.type === 'Preventive'
                          ? 'bg-[#EEF3FF] text-[#2F5BFF]'
                          : 'bg-[#F1F3F5] text-[#5F6875]'
                      }`}
                    >
                      {log.type}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-[#18202A] max-w-xs">{log.issue}</td>
                  <td className="py-4 px-4 text-[#5F6875]">{log.failureType}</td>
                  <td className="py-4 px-4 font-medium text-[#18202A]">{log.repairDurationMinutes}m</td>
                  <td className="py-4 px-4 text-[#5F6875]">{log.technician}</td>
                  <td className="py-4 px-4 text-right">
                    <span className="h-7 px-2.5 rounded-[6px] text-[13px] font-medium bg-[#EDFDF2] text-[#18864B] inline-flex items-center">
                      {log.status}
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
