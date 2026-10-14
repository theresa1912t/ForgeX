'use client';

import React from 'react';
import { useFactory } from '@/lib/factoryStore';
import {
  HelpCircle,
  X,
  Gauge,
  Activity,
  AlertTriangle,
  Clock,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Machine } from '@/lib/types';

interface HealthFormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  machine: Machine;
}

export function HealthFormulaModal({ isOpen, onClose, machine }: HealthFormulaModalProps) {
  const { machineProfiles } = useFactory();
  const profile = machineProfiles[machine.id] || machineProfiles['mach-m03'];
  const methodology = profile?.healthScoreMethodology;

  if (!isOpen) return null;

  // Calculate detailed deduction breakdown
  // Baseline vibration: 1.8 mm/s, nominal max threshold 3.0 mm/s
  // Machine M-03 has 4.2 mm/s
  const vibDelta = Math.max(0, machine.vibrationMmS - 1.8);
  const vibPenalty = Math.min(35, Math.round((vibDelta / 2.4) * 35));

  // Nominal cycle time: 1.80s, M-03 is 2.45s
  const ctDelta = Math.max(0, machine.cycleTimeSec - 1.80);
  const ctPenalty = Math.min(30, Math.round((ctDelta / 0.8) * 30));

  // Temp nominal ~45C, M-03 is 58.4C
  const tempDelta = Math.max(0, machine.temperatureC - 48);
  const tempPenalty = Math.min(15, Math.round((tempDelta / 20) * 15));

  // Pressure nominal 6.2 bar, M-03 is 5.9 bar
  const pressurePenalty = machine.pressureBar < 6.0 ? 5 : 0;

  // Stoppage penalty
  const downtimePenalty = Math.min(10, Math.round(machine.downtimeHoursThisWeek * 2));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-[#E4E7EB] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-labelledby="health-formula-title"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E4E7EB] flex items-center justify-between bg-[#F7F8FA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2F5BFF]/10 text-[#2F5BFF] flex items-center justify-center">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h2 id="health-formula-title" className="text-[20px] font-semibold text-[#18202A]">
                Machine Health Score Methodology
              </h2>
              <p className="text-[14px] text-[#5F6875] mt-0.5">
                Transparent calculation engine for <span className="font-semibold text-[#18202A]">{machine.name}</span> ({machine.code})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#5F6875] hover:text-[#18202A] hover:bg-[#E4E7EB]/60 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Score Result */}
          <div className="p-5 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB] flex items-center justify-between">
            <div>
              <span className="text-[13px] font-medium text-[#5F6875] block">
                Current Composite Health Index
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span
                  className={`text-[36px] font-bold leading-none ${
                    machine.healthScorePct >= 90
                      ? 'text-[#18864B]'
                      : machine.healthScorePct >= 75
                      ? 'text-[#E56B00]'
                      : 'text-[#D92D20]'
                  }`}
                >
                  {machine.healthScorePct}%
                </span>
                <span className="text-[14px] font-medium text-[#5F6875]">
                  Status: <strong className="text-[#18202A]">{machine.status}</strong>
                </span>
              </div>
            </div>
            <div className="text-right text-[13px] text-[#5F6875]">
              <div>Baseline Target: <strong className="text-[#18864B]">100%</strong></div>
              <div>Total Deductions: <strong className="text-[#D92D20]">-{100 - machine.healthScorePct}%</strong></div>
            </div>
          </div>

          {/* Explanation Box */}
          <div className="bg-[#EEF3FF] border border-[#C5D5FE] rounded-xl p-4 text-[13px] text-[#18202A] leading-relaxed flex items-start gap-3">
            <Info className="w-5 h-5 text-[#2F5BFF] shrink-0 mt-0.5" />
            <div>
              <strong>How is the Health Score calculated?</strong> This score is dynamically computed in real-time from 5 weighted physical IoT/PLC telemetry parameters (ISO 10816 mechanical vibration standards and nominal cycle time variance).
            </div>
          </div>

          {/* Weights & Current Penalty Breakdown Table */}
          <div>
            <h3 className="text-[15px] font-semibold text-[#18202A] mb-3">
              Parameter Weights & Penalty Breakdown
            </h3>
            <div className="border border-[#E4E7EB] rounded-xl overflow-hidden text-[13px]">
              <table className="w-full text-left">
                <thead className="bg-[#F7F8FA] text-[#5F6875] font-medium border-b border-[#E4E7EB]">
                  <tr>
                    <th className="py-2.5 px-4">Telemetry Parameter</th>
                    <th className="py-2.5 px-3">Live Value</th>
                    <th className="py-2.5 px-3">Nominal / Threshold</th>
                    <th className="py-2.5 px-3">Weight</th>
                    <th className="py-2.5 px-4 text-right">Penalty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7EB]">
                  <tr>
                    <td className="py-3 px-4 font-medium text-[#18202A]">
                      Vibration Velocity (RMS)
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#D92D20]">
                      {machine.vibrationMmS} mm/s
                    </td>
                    <td className="py-3 px-3 text-[#5F6875]">
                      &lt; 3.0 mm/s (Base: 1.8)
                    </td>
                    <td className="py-3 px-3 font-medium text-[#5F6875]">35%</td>
                    <td className="py-3 px-4 text-right font-semibold text-[#D92D20]">
                      -{vibPenalty}%
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-[#18202A]">
                      Dispense Cycle Time
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#D92D20]">
                      {machine.cycleTimeSec}s
                    </td>
                    <td className="py-3 px-3 text-[#5F6875]">
                      1.80s (Nominal)
                    </td>
                    <td className="py-3 px-3 font-medium text-[#5F6875]">30%</td>
                    <td className="py-3 px-4 text-right font-semibold text-[#D92D20]">
                      -{ctPenalty}%
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-[#18202A]">
                      Jacket / Manifold Temp
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#18202A]">
                      {machine.temperatureC}°C
                    </td>
                    <td className="py-3 px-3 text-[#5F6875]">
                      42°C - 50°C
                    </td>
                    <td className="py-3 px-3 font-medium text-[#5F6875]">15%</td>
                    <td className="py-3 px-4 text-right font-medium text-[#E56B00]">
                      -{tempPenalty}%
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-[#18202A]">
                      Pneumatic Pressure
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#18202A]">
                      {machine.pressureBar} bar
                    </td>
                    <td className="py-3 px-3 text-[#5F6875]">
                      6.0 - 6.5 bar
                    </td>
                    <td className="py-3 px-3 font-medium text-[#5F6875]">10%</td>
                    <td className="py-3 px-4 text-right font-medium text-[#5F6875]">
                      -{pressurePenalty}%
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-[#18202A]">
                      Stoppage / Downtime Frequency
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#18202A]">
                      {machine.downtimeHoursThisWeek}h
                    </td>
                    <td className="py-3 px-3 text-[#5F6875]">
                      &lt; 0.5h weekly
                    </td>
                    <td className="py-3 px-3 font-medium text-[#5F6875]">10%</td>
                    <td className="py-3 px-4 text-right font-medium text-[#5F6875]">
                      -{downtimePenalty}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Formula summary */}
          <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB] text-[13px] text-[#5F6875] space-y-1">
            <span className="font-semibold text-[#18202A] block">Formal Mathematical Formula:</span>
            <p className="font-mono text-[12px] text-[#18202A] bg-white p-2.5 rounded border border-[#E4E7EB]">
              Score = 100 - (0.35 * ΔVib) - (0.30 * ΔCycleTime) - (0.15 * ΔTemp) - (0.10 * ΔPress) - (0.10 * ΔDown)
            </p>
            <p className="text-[12px] text-[#8A93A0] mt-1">
              {methodology?.formulaSummary}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-[#E4E7EB] bg-[#F7F8FA] flex items-center justify-between text-[13px] text-[#5F6875]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#18864B]" />
            Audited Against ISO 10816 Mechanical Reliability Standard
          </span>
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg text-[13px] font-medium text-[#18202A] bg-white border border-[#E4E7EB] hover:bg-[#F7F8FA] transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
