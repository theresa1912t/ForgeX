'use client';

import React, { useState } from 'react';
import { useFactory } from '@/lib/factoryStore';
import { X, ClipboardList } from 'lucide-react';
import type { AlertCategory, AlertSeverity } from '@/lib/types';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: AlertCategory[] = ['Machine', 'Quality', 'Material', 'Downtime', 'Waste', 'Energy', 'Production'];
const SEVERITIES: AlertSeverity[] = ['Critical', 'High', 'Medium', 'Low'];

// Manual incident registration (need-checking.md Journey A) — the one path where an operator,
// not AI or a threshold rule, opens an incident. Asks for observations, not a root cause.
export function ReportIssueModal({ isOpen, onClose }: ReportIssueModalProps) {
  const { machines, reportIssue, isMutationPending } = useFactory();

  const [machineId, setMachineId] = useState('');
  const [category, setCategory] = useState<AlertCategory>('Machine');
  const [severity, setSeverity] = useState<AlertSeverity>('Medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const isSubmitting = isMutationPending('reportIssue');
  const canSubmit = machineId && title.trim() && description.trim() && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const created = await reportIssue({ machineId, category, severity, title, description });
    if (created) {
      setMachineId('');
      setCategory('Machine');
      setSeverity('Medium');
      setTitle('');
      setDescription('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#18202A]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-[#E4E7EB] w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E4E7EB] flex items-center justify-between">
          <h3 className="text-[18px] font-semibold text-[#18202A] flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#2F5BFF]" />
            Report Issue
          </h3>
          <button onClick={onClose} className="text-[#8A93A0] hover:text-[#18202A] text-[18px]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-[14px]">
          <div>
            <label className="block text-[13px] font-medium text-[#5F6875] mb-1">Machine</label>
            <select
              value={machineId}
              onChange={(e) => setMachineId(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-[#E4E7EB] rounded-lg text-[#18202A] focus:outline-none focus:border-[#2F5BFF]"
            >
              <option value="">Select a machine...</option>
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#5F6875] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AlertCategory)}
                className="w-full h-10 px-3 bg-white border border-[#E4E7EB] rounded-lg text-[#18202A] focus:outline-none focus:border-[#2F5BFF]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#5F6875] mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as AlertSeverity)}
                className="w-full h-10 px-3 bg-white border border-[#E4E7EB] rounded-lg text-[#18202A] focus:outline-none focus:border-[#2F5BFF]"
              >
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#5F6875] mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unusual grinding noise from conveyor motor"
              className="w-full h-10 px-3 bg-white border border-[#E4E7EB] rounded-lg text-[#18202A] focus:outline-none focus:border-[#2F5BFF]"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#5F6875] mb-1">What did you observe?</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe symptoms as observed — no need to know the technical cause."
              className="w-full px-3 py-2 bg-white border border-[#E4E7EB] rounded-lg text-[#18202A] focus:outline-none focus:border-[#2F5BFF]"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#E4E7EB] flex items-center justify-end gap-3 bg-[#F7F8FA]">
          <button
            onClick={onClose}
            className="h-10 px-4 text-[14px] text-[#5F6875] hover:text-[#18202A] font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="h-10 px-4 text-[14px] font-medium text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-lg shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Reporting...' : 'Report Issue'}
          </button>
        </div>
      </div>
    </div>
  );
}
