'use client';

import React, { useState } from 'react';
import { useFactory } from '@/lib/factoryStore';
import { X, FlaskConical } from 'lucide-react';

interface SimulateFailureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SCENARIOS: Array<{ value: string; label: string; description: string }> = [
  { value: 'unexpected_shutdown', label: 'Unexpected shutdown', description: 'Machine stops; downtime accumulates until recovery.' },
  { value: 'reduced_speed', label: 'Reduced speed', description: 'Machine continues operating below expected capacity.' },
  { value: 'overheating', label: 'Overheating warning', description: 'Warning appears; investigate before any shutdown.' },
  { value: 'quality_defect', label: 'Quality defect', description: 'Good output falls and defective units rise.' },
  { value: 'recurring_fault', label: 'Recurring fault', description: "Reopens the machine's most recent resolved incident, if one exists." },
];

// User-triggered demo scenarios (need-checking.md §9) — deliberately not a continuously-running
// background loop, matching the PRD's explicit preference for a first iteration.
export function SimulateFailureModal({ isOpen, onClose }: SimulateFailureModalProps) {
  const { machines, simulateFailure, isMutationPending } = useFactory();

  const [machineId, setMachineId] = useState('');
  const [scenario, setScenario] = useState(SCENARIOS[0].value);

  if (!isOpen) return null;

  const isSubmitting = isMutationPending('simulateFailure');
  const canSubmit = machineId && scenario && !isSubmitting;
  const selected = SCENARIOS.find((s) => s.value === scenario);

  const handleTrigger = () => {
    if (!canSubmit) return;
    simulateFailure(machineId, scenario);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#18202A]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-[#E4E7EB] w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E4E7EB] flex items-center justify-between">
          <h3 className="text-[18px] font-semibold text-[#18202A] flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-[#2F5BFF]" />
            Simulate Failure
          </h3>
          <button onClick={onClose} className="text-[#8A93A0] hover:text-[#18202A] text-[18px]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-[14px]">
          <p className="text-[13px] text-[#8A93A0]">
            Demo data only — every alert created here is clearly labeled &quot;(simulated)&quot; in its title.
          </p>

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

          <div>
            <label className="block text-[13px] font-medium text-[#5F6875] mb-1">Scenario</label>
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-[#E4E7EB] rounded-lg text-[#18202A] focus:outline-none focus:border-[#2F5BFF]"
            >
              {SCENARIOS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            {selected && <p className="text-[12px] text-[#8A93A0] mt-1.5">{selected.description}</p>}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#E4E7EB] flex items-center justify-end gap-3 bg-[#F7F8FA]">
          <button onClick={onClose} className="h-10 px-4 text-[14px] text-[#5F6875] hover:text-[#18202A] font-medium">
            Cancel
          </button>
          <button
            onClick={handleTrigger}
            disabled={!canSubmit}
            className="h-10 px-4 text-[14px] font-medium text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-lg shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Triggering...' : 'Trigger Scenario'}
          </button>
        </div>
      </div>
    </div>
  );
}
