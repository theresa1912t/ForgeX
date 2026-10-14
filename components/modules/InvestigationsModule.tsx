'use client';

import React, { useState } from 'react';
import { useFactory } from '@/lib/factoryStore';
import {
  SearchCode,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingDown,
  Activity,
  DollarSign,
  Layers,
  Wrench,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  Check,
  X,
  RotateCcw,
  Flame,
  Boxes,
  Cpu,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/calculations';

export function InvestigationsModule() {
  const {
    investigations,
    selectedInvestigationId,
    setSelectedInvestigationId,
    approveRecommendation,
    createActionTaskFromRecommendation,
    currentUser,
    activeTab,
    setActiveTab,
    previousTab,
    showToast,
  } = useFactory();

  const currentInv =
    (selectedInvestigationId && investigations[selectedInvestigationId]) ||
    investigations['inv-line3-hero'] ||
    Object.values(investigations)[0];

  const [expandedCauseId, setExpandedCauseId] = useState<string>('rc-1');
  const [selectedActionModalRec, setSelectedActionModalRec] = useState<any | null>(null);
  const [rejectModalRec, setRejectModalRec] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('Operating telemetry is within permissible variance');
  const [assignedTechnician, setAssignedTechnician] = useState('Carlos Ruiz');
  const [taskDueDate, setTaskDueDate] = useState('Today (Within 1 hour)');

  if (!currentInv) {
    return (
      <div className="py-24 max-w-xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-[#F1F3F5] text-[#5F6875] flex items-center justify-center mx-auto">
          <SearchCode className="w-6 h-6" />
        </div>
        <h2 className="text-[22px] leading-[30px] font-semibold text-[#18202A]">
          No Active Investigation Selected
        </h2>
        <p className="text-[15px] leading-[24px] text-[#5F6875]">
          Investigations in FactoryLens are launched on-demand from operational alerts or telemetry anomalies. You can open an investigation directly from any active issue.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={() => setActiveTab('alerts')}
            className="h-10 px-4 text-[14px] font-medium text-[#18202A] bg-white hover:bg-[#F7F8FA] border border-[#E4E7EB] rounded-lg transition-colors"
          >
            View Active Alerts
          </button>
          <button
            onClick={() => {
              setSelectedInvestigationId('inv-line3-hero');
              setActiveTab('investigations');
            }}
            className="h-10 px-4 text-[14px] font-medium text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-lg transition-colors shadow-sm"
          >
            Open Demo Case (Line 3 Loss)
          </button>
        </div>
      </div>
    );
  }

  const isResolved = currentInv.status === 'Resolved';
  const { businessImpact } = currentInv;

  const handleApprove = (recId: string) => {
    approveRecommendation(currentInv.id, recId);
  };

  const handleOpenAssignModal = (rec: any) => {
    setSelectedActionModalRec(rec);
  };

  const handleConfirmTaskCreate = () => {
    if (selectedActionModalRec) {
      createActionTaskFromRecommendation(
        currentInv.id,
        selectedActionModalRec,
        assignedTechnician,
        taskDueDate
      );
      setSelectedActionModalRec(null);
      setActiveTab('actions');
    }
  };

  const handleConfirmReject = () => {
    if (rejectModalRec) {
      showToast(`Recommendation "${rejectModalRec.title}" was rejected: ${rejectReason}`, 'info');
      setRejectModalRec(null);
    }
  };

  const backDestination = previousTab === 'alerts' ? 'Alerts' : previousTab === 'actions' ? 'Action Center' : 'Dashboard';

  return (
    <div className="space-y-8">
      {/* 0. Contextual Subpage Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E4E7EB]">
        <div className="flex items-center gap-2 text-[14px]">
          <button
            onClick={() => setActiveTab(previousTab || 'dashboard')}
            className="inline-flex items-center gap-1.5 font-medium text-[#2F5BFF] hover:text-[#2448D8] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {backDestination}</span>
          </button>
          <span className="text-[#8A93A0]">/</span>
          <span className="text-[#5F6875]">Operations</span>
          <span className="text-[#8A93A0]">/</span>
          <span className="text-[#18202A] font-medium">Investigation Case #{currentInv.id.toUpperCase()}</span>
        </div>

        {/* Visible System Status Badge */}
        <div className="flex items-center gap-3 text-[13px] text-[#5F6875]">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EEF3FF] text-[#2F5BFF] font-medium border border-[#D9E4FF]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Analysis Complete · 4m ago</span>
          </span>
          <span className="hidden md:inline">Confidence: <strong className="text-[#18202A] font-semibold">87%</strong></span>
        </div>
      </div>

      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[13px] font-medium text-[#5F6875] mb-1">
            Diagnostic Subpage · {currentInv.lineName} ({currentInv.machineName})
          </div>
          <h1 className="text-[32px] leading-[40px] font-semibold text-[#18202A]">
            Why did Line 3 production drop 14%?
          </h1>
          <p className="text-[15px] leading-[24px] text-[#5F6875] mt-2">
            AI root cause analysis correlating equipment telemetry, quality checkweighers, and raw material lots.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('actions')}
            className="h-10 px-4 text-[14px] font-medium text-[#18202A] bg-white hover:bg-[#F7F8FA] border border-[#E4E7EB] rounded-lg transition-colors flex items-center gap-2"
          >
            <span>View Related Tasks</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Resolution Verified Banner */}
      {isResolved && currentInv.resolutionOutcome && (
        <div className="p-6 rounded-xl border border-[#A6F4C5] bg-[#EDFDF2] flex items-start gap-4">
          <div className="w-9 h-9 rounded-full bg-[#18864B] text-white flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h2 className="text-[18px] font-semibold text-[#18864B]">
                Corrective Action Completed & Verified
              </h2>
              <span className="text-[13px] font-medium text-[#18864B]">
                Resolved: {currentInv.resolvedAt}
              </span>
            </div>
            <p className="text-[15px] leading-[24px] text-[#18202A] mt-2">
              <strong>Outcome:</strong> {currentInv.resolutionOutcome.notes}
            </p>
            <div className="mt-3 pt-3 border-t border-[#A6F4C5] flex flex-wrap items-center gap-4 text-[14px] text-[#18864B] font-medium">
              <span>Throughput Recovered: <strong>+{currentInv.resolutionOutcome.recoveredUnitsPerHour} units/hr</strong></span>
              <span>·</span>
              <span>Signed Off By: <strong>{currentInv.resolutionOutcome.completedBy}</strong></span>
              <span>·</span>
              <span>Vibration: <strong>2.15 mm/s (Normal)</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Top Summary Card */}
      <div className="card-base">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E4E7EB]">
          <div className="flex items-center gap-3">
            <span
              className={`h-7 px-3 rounded-[6px] text-[13px] font-medium inline-flex items-center ${
                isResolved
                  ? 'bg-[#EDFDF2] text-[#18864B]'
                  : 'bg-[#FEF3F2] text-[#D92D20]'
              }`}
            >
              {isResolved ? 'Resolved' : 'Critical'}
            </span>
            <span className="h-7 px-3 rounded-[6px] text-[13px] font-medium inline-flex items-center bg-[#F1F3F5] text-[#5F6875]">
              Production
            </span>
            <span className="text-[14px] text-[#5F6875]">
              Line 3 · Shift B · Orange Drink 500ml
            </span>
          </div>

          <div className="text-[13px] text-[#5F6875]">
            Detected at <strong className="text-[#18202A]">10:42 AM</strong>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
          <div>
            <div className="text-[14px] text-[#5F6875]">Output Variance</div>
            <div className={`text-[28px] leading-[36px] font-semibold mt-1 ${isResolved ? 'text-[#18864B]' : 'text-[#D92D20]'}`}>
              {isResolved ? '+14% recovered' : '-14.0%'}
            </div>
            <div className="text-[13px] text-[#8A93A0] mt-1">vs planned target</div>
          </div>

          <div>
            <div className="text-[14px] text-[#5F6875]">Estimated Revenue Loss</div>
            <div className="text-[28px] leading-[36px] font-semibold text-[#D92D20] mt-1">
              $4,650
            </div>
            <div className="text-[13px] text-[#8A93A0] mt-1">3,720 lost units ($1.25/unit)</div>
          </div>

          <div>
            <div className="text-[14px] text-[#5F6875]">Incident Duration</div>
            <div className="text-[28px] leading-[36px] font-semibold text-[#18202A] mt-1">
              3h 18m
            </div>
            <div className="text-[13px] text-[#8A93A0] mt-1">Active bottleneck</div>
          </div>

          <div>
            <div className="text-[14px] text-[#5F6875]">Current Loss Rate</div>
            <div className="text-[28px] leading-[36px] font-semibold text-[#D92D20] mt-1">
              $1,400/hr
            </div>
            <div className="text-[13px] text-[#8A93A0] mt-1">Compounding loss</div>
          </div>
        </div>
      </div>

      {/* Section A: What Happened? */}
      <div className="card-base">
        <h2 className="text-[22px] leading-[30px] font-semibold text-[#18202A] mb-2">
          What Happened?
        </h2>
        <p className="text-[15px] leading-[24px] text-[#5F6875] mb-6">
          Production output on Line 3 collapsed from the scheduled 5,000 units/hr to 4,300 units/hr (-14%). Automated cross-source correlation isolated Filling Machine M-03 as the focal bottleneck, where filling valve diaphragm resistance caused intermittent cycle stalls and fill-height variance.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB]">
            <div className="text-[13px] text-[#5F6875]">Output Variance</div>
            <div className="text-[18px] font-semibold text-[#D92D20] mt-1">-14%</div>
            <div className="text-[13px] text-[#8A93A0] mt-0.5">vs expected</div>
          </div>

          <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB]">
            <div className="text-[13px] text-[#5F6875]">Start Time</div>
            <div className="text-[18px] font-semibold text-[#18202A] mt-1">10:42 AM</div>
            <div className="text-[13px] text-[#8A93A0] mt-0.5">Today</div>
          </div>

          <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB]">
            <div className="text-[13px] text-[#5F6875]">Duration</div>
            <div className="text-[18px] font-semibold text-[#18202A] mt-1">3h 18m</div>
            <div className="text-[13px] text-[#8A93A0] mt-0.5">Active</div>
          </div>

          <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB]">
            <div className="text-[13px] text-[#5F6875]">Affected Product</div>
            <div className="text-[18px] font-semibold text-[#18202A] mt-1 truncate">Orange Drink</div>
            <div className="text-[13px] text-[#8A93A0] mt-0.5">500ml bottle</div>
          </div>

          <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB]">
            <div className="text-[13px] text-[#5F6875]">Affected Line</div>
            <div className="text-[18px] font-semibold text-[#18202A] mt-1">Line 3</div>
            <div className="text-[13px] text-[#8A93A0] mt-0.5">Hot-fill rotary</div>
          </div>

          <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB]">
            <div className="text-[13px] text-[#5F6875]">Operating Shift</div>
            <div className="text-[18px] font-semibold text-[#18202A] mt-1">Shift B</div>
            <div className="text-[13px] text-[#8A93A0] mt-0.5">Lead: M. Vance</div>
          </div>
        </div>
      </div>

      {/* Section B: Event Timeline */}
      <div className="card-base">
        <h2 className="text-[22px] leading-[30px] font-semibold text-[#18202A] mb-2">
          Event Timeline
        </h2>
        <p className="text-[15px] leading-[24px] text-[#5F6875] mb-6">
          Operational signals changed sequentially around the incident:
        </p>

        <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E4E7EB]">
          {currentInv.timeline.map((step, idx) => (
            <div key={idx} className="relative flex items-start gap-4">
              <div className="w-4 h-4 rounded-full bg-[#2F5BFF] ring-4 ring-white -ml-[23px] shrink-0 mt-1" />
              <div className="flex-1 p-4 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB]">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-[#18202A]">{step.time}</span>
                    <span className="text-[13px] text-[#5F6875]">· {step.source}</span>
                  </div>
                  {step.parameter && (
                    <span className="h-6 px-2.5 rounded-[6px] text-[13px] font-medium bg-white text-[#18202A] border border-[#E4E7EB]">
                      {step.parameter}
                    </span>
                  )}
                </div>
                <p className="text-[14px] leading-[22px] text-[#18202A]">
                  {step.event}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section C: What Changed? */}
      <div className="card-base">
        <h2 className="text-[22px] leading-[30px] font-semibold text-[#18202A] mb-2">
          What Changed?
        </h2>
        <p className="text-[15px] leading-[24px] text-[#5F6875] mb-6">
          Comparing observed sensor readings against verified 30-day operating baselines:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {currentInv.sensorDeltas.map((sensor, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                sensor.isAbnormal && !isResolved
                  ? 'border-[#FECDCA] bg-[#FEF3F2]/30'
                  : 'border-[#E4E7EB] bg-[#F7F8FA]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[14px] font-medium text-[#18202A] truncate">{sensor.parameter}</span>
                  <span
                    className={`h-6 px-2 rounded-[6px] text-[13px] font-medium ${
                      sensor.isAbnormal && !isResolved
                        ? 'bg-[#FEF3F2] text-[#D92D20]'
                        : 'bg-white text-[#5F6875] border border-[#E4E7EB]'
                    }`}
                  >
                    {isResolved ? 'Normal' : sensor.changePct}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#5F6875]">Baseline:</span>
                    <span className="text-[#18202A]">{sensor.baseline}</span>
                  </div>
                  <div className="flex justify-between text-[14px] font-medium">
                    <span className="text-[#5F6875]">Observed:</span>
                    <span className={sensor.isAbnormal && !isResolved ? 'text-[#D92D20]' : 'text-[#18202A]'}>
                      {isResolved ? sensor.baseline : sensor.current}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-[#E4E7EB] text-[13px] flex justify-between">
                <span className="text-[#8A93A0]">Tolerance ±5%</span>
                <span className={sensor.isAbnormal && !isResolved ? 'text-[#D92D20] font-medium' : 'text-[#18864B]'}>
                  {sensor.isAbnormal && !isResolved ? 'Breached' : 'Within Bounds'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section C.2: Multi-Signal Cross-Correlation Triangulation */}
      <div className="card-base space-y-4 border-2 border-[#2F5BFF]/20 bg-[#FBFDFF]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E7EB]">
          <div>
            <div className="flex items-center gap-2 text-[#2F5BFF] font-semibold text-[15px]">
              <Sparkles className="w-4 h-4" />
              <span>Multi-Signal Triangulation: Machine × Ingredient × Waste Synthesis</span>
            </div>
            <p className="text-[13px] text-[#5F6875] mt-0.5">
              How mechanical condition, raw material batch physics, and scrap measurements converge into one root cause
            </p>
          </div>
          <span className="text-[12px] font-mono text-[#5F6875] bg-white px-2.5 py-1 rounded border border-[#E4E7EB]">
            Correlation Confidence: 87%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Signal 1: Machine Telemetry */}
          <div className="p-4 bg-white rounded-xl border border-[#E4E7EB] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#2F5BFF] flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                <span>Signal 1: Machine OT</span>
              </span>
              <span className="text-[11px] font-mono text-[#D92D20] bg-[#FEF3F2] px-2 py-0.5 rounded font-semibold">
                Anomalous (68% Health)
              </span>
            </div>

            <div>
              <h4 className="font-semibold text-[15px] text-[#18202A]">Filling Machine M-03</h4>
              <p className="text-[13px] text-[#5F6875] mt-1 leading-[20px]">
                Manifold vibration spiked <strong>+38% (3.31 mm/s)</strong> and stroke cycle time stretched <strong>+17% (2.11s)</strong> on Siemens PLC register R:102.
              </p>
            </div>

            <div className="pt-2 border-t border-[#E4E7EB] text-[12px] text-[#18202A]">
              <strong>Physical effect:</strong> Flutter on diaphragm heads #4 & #8 producing internal fluid cavitation.
            </div>
          </div>

          {/* Signal 2: Raw Material Batch */}
          <div className="p-4 bg-white rounded-xl border border-[#E4E7EB] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#E56B00] flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5" />
                <span>Signal 2: Ingredient Batch</span>
              </span>
              <span className="text-[11px] font-mono text-[#E56B00] bg-[#FFF6ED] px-2 py-0.5 rounded font-semibold">
                Viscosity +8.4%
              </span>
            </div>

            <div>
              <h4 className="font-semibold text-[15px] text-[#18202A]">Raw Milk Lot #LOT-RAW-904</h4>
              <p className="text-[13px] text-[#5F6875] mt-1 leading-[20px]">
                Supplier CoA indicated raw milk viscosity at <strong>2.28 cP vs 2.10 cP standard</strong> with high solids-not-fat, introduced into batch PB-UHT-1008 at 08:30 AM.
              </p>
            </div>

            <div className="pt-2 border-t border-[#E4E7EB] text-[12px] text-[#18202A]">
              <strong>Physical effect:</strong> Elevated line hydraulic backpressure by +0.2 bar, stressing worn aseptic diaphragm seals.
            </div>
          </div>

          {/* Signal 3: Waste & Scrap Telemetry */}
          <div className="p-4 bg-white rounded-xl border border-[#E4E7EB] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#D92D20] flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                <span>Signal 3: Scrap & Waste</span>
              </span>
              <span className="text-[11px] font-mono text-[#D92D20] bg-[#FEF3F2] px-2 py-0.5 rounded font-semibold">
                86 kg ($516) Scrapped
              </span>
            </div>

            <div>
              <h4 className="font-semibold text-[15px] text-[#18202A]">Checkweigher Rejects & Dribble</h4>
              <p className="text-[13px] text-[#5F6875] mt-1 leading-[20px]">
                Mettler checkweigher rejected <strong>420 underfill bottles</strong> and optical sensors logged <strong>86 kg nozzle dribble loss</strong> during Shift B.
              </p>
            </div>

            <div className="pt-2 border-t border-[#E4E7EB] text-[12px] text-[#18202A]">
              <strong>Physical effect:</strong> Erratic shut-off valve timing created bottle lip overflow and net fill under-dosing.
            </div>
          </div>
        </div>

        <div className="p-3 bg-[#EEF3FF] rounded-lg border border-[#D9E4FF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px]">
          <div className="text-[#18202A]">
            <strong>Cross-Disciplinary Finding:</strong> Machine mechanical wear is the primary constraint. Batch viscosity variation exacerbated the bottleneck but did not initiate it.
          </div>
          <button
            onClick={() => setActiveTab('waste-energy')}
            className="text-[#2F5BFF] hover:text-[#2448D8] font-semibold flex items-center gap-1 shrink-0"
          >
            <span>View Waste Log Detail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Section D: Root Cause Analysis */}
      <div className="card-base">
        <h2 className="text-[22px] leading-[30px] font-semibold text-[#18202A] mb-2">
          Root Cause Analysis
        </h2>
        <p className="text-[15px] leading-[24px] text-[#5F6875] mb-6">
          Ranked potential contributors based on multi-variate telemetry correlation:
        </p>

        <div className="space-y-4">
          {currentInv.rootCauses.map((cause) => {
            const isExpanded = expandedCauseId === cause.id;
            const isRank1 = cause.rank === 1;
            return (
              <div
                key={cause.id}
                className={`border rounded-xl transition-all overflow-hidden ${
                  isRank1
                    ? 'border-[#2F5BFF]/30 bg-[#F8FAFF]'
                    : 'border-[#E4E7EB] bg-white'
                }`}
              >
                <div
                  onClick={() => setExpandedCauseId(isExpanded ? '' : cause.id)}
                  className="p-5 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-[14px] shrink-0 ${
                        isRank1
                          ? 'bg-[#2F5BFF] text-white'
                          : 'bg-[#F1F3F5] text-[#5F6875]'
                      }`}
                    >
                      {cause.rank}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-[16px] font-semibold text-[#18202A]">
                          {cause.title}
                        </h3>
                        <span
                          className={`h-7 px-2.5 rounded-[6px] text-[13px] font-medium inline-flex items-center ${
                            cause.status === 'Likely Contributor'
                              ? 'bg-[#FEF3F2] text-[#D92D20]'
                              : cause.status === 'Secondary Factor'
                              ? 'bg-[#FFF6ED] text-[#E56B00]'
                              : 'bg-[#F2F4F7] text-[#5F6875]'
                          }`}
                        >
                          {cause.status}
                        </span>
                      </div>
                      <p className="text-[14px] text-[#5F6875] mt-1">{cause.summary}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-[13px] text-[#5F6875]">Confidence</div>
                      <div className="text-[16px] font-semibold text-[#18202A]">{cause.confidence}%</div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-[#8A93A0]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#8A93A0]" />
                    )}
                  </div>
                </div>

                {/* Expanded Evidence & Supporting Signals */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-[#E4E7EB] bg-white space-y-4">
                    <div>
                      <div className="text-[13px] font-medium text-[#18202A] mb-2">
                        Supporting Evidence:
                      </div>
                      <ul className="space-y-1.5 text-[14px] text-[#5F6875]">
                        {cause.supportingEvidence.map((ev, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[#2F5BFF] font-semibold">•</span>
                            <span>{ev}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-[#F7F8FA] rounded-lg text-[13px] text-[#5F6875]">
                      <strong className="text-[#18202A]">Historical Precedent:</strong> {cause.historicalPrecedent}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section E: Evidence Registry (FACT vs INFERENCE vs RECOMMENDATION) */}
      <div className="card-base">
        <h2 className="text-[22px] leading-[30px] font-semibold text-[#18202A] mb-2">
          Evidence Registry
        </h2>
        <p className="text-[15px] leading-[24px] text-[#5F6875] mb-6">
          Explicitly distinguishing direct observations from analytical inferences and recommendations:
        </p>

        <div className="space-y-3">
          {currentInv.evidence.map((ev) => (
            <div
              key={ev.id}
              className="p-4 rounded-xl border border-[#E4E7EB] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`h-7 px-2.5 rounded-[6px] text-[13px] font-medium tracking-wide shrink-0 inline-flex items-center ${
                    ev.signalType === 'FACT'
                      ? 'bg-[#F2F4F7] text-[#18202A]'
                      : ev.signalType === 'INFERENCE'
                      ? 'bg-[#EEF3FF] text-[#2F5BFF]'
                      : 'bg-[#FFF6ED] text-[#E56B00]'
                  }`}
                >
                  {ev.signalType === 'FACT' ? 'OBSERVED' : ev.signalType === 'INFERENCE' ? 'AI INFERENCE' : 'RECOMMENDATION'}
                </span>

                <div>
                  <div className="text-[15px] font-semibold text-[#18202A] flex items-center gap-2">
                    {ev.title}
                  </div>
                  <p className="text-[14px] text-[#5F6875] mt-0.5">{ev.detail}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0 sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E4E7EB]">
                <div>
                  <div className="text-[13px] text-[#8A93A0]">Metric</div>
                  <div className="text-[14px] font-semibold text-[#18202A]">{ev.metric || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-[13px] text-[#8A93A0]">Source</div>
                  <div className="text-[14px] text-[#5F6875]">{ev.source}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section F: Business Impact */}
      <div className="card-base">
        <h2 className="text-[22px] leading-[30px] font-semibold text-[#18202A] mb-2">
          Business Impact
        </h2>
        <p className="text-[15px] leading-[24px] text-[#5F6875] mb-6">
          Quantified operational losses translated into gross revenue, scrap costs, and downtime run-rates:
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB]">
            <div className="text-[14px] text-[#5F6875]">Lost Production</div>
            <div className="text-[28px] leading-[36px] font-semibold text-[#D92D20] mt-1">
              {formatNumber(businessImpact.lostUnits)}
            </div>
            <div className="text-[13px] text-[#8A93A0] mt-1">units below plan</div>
          </div>

          <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB]">
            <div className="text-[14px] text-[#5F6875]">Revenue Loss</div>
            <div className="text-[28px] leading-[36px] font-semibold text-[#D92D20] mt-1">
              {formatCurrency(businessImpact.estimatedRevenueLoss)}
            </div>
            <div className="text-[13px] text-[#8A93A0] mt-1">at $1.25/unit</div>
          </div>

          <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB]">
            <div className="text-[14px] text-[#5F6875]">Rework Volume</div>
            <div className="text-[28px] leading-[36px] font-semibold text-[#18202A] mt-1">
              {formatNumber(businessImpact.additionalReworkUnits)}
            </div>
            <div className="text-[13px] text-[#8A93A0] mt-1">cost: ${businessImpact.additionalReworkCost}</div>
          </div>

          <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB]">
            <div className="text-[14px] text-[#5F6875] flex items-center justify-between">
              <span>Material Scrap</span>
              <span className="text-[11px] font-mono font-medium text-[#2F5BFF]">Lot #LOT-RAW-904</span>
            </div>
            <div className="text-[28px] leading-[36px] font-semibold text-[#18202A] mt-1 font-mono tabular-nums">
              {businessImpact.materialWasteKg} kg
            </div>
            <div className="text-[13px] text-[#D92D20] mt-1 font-mono tabular-nums">
              loss: ${businessImpact.materialWasteCost} (Spill & Rejects)
            </div>
          </div>

          <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E4E7EB]">
            <div className="text-[14px] text-[#5F6875]">Current Loss Rate</div>
            <div className="text-[28px] leading-[36px] font-semibold text-[#D92D20] mt-1">
              ${formatNumber(businessImpact.currentLossRatePerHour)}/hr
            </div>
            <div className="text-[13px] text-[#8A93A0] mt-1">ongoing bleeding</div>
          </div>

          <div className="p-4 bg-[#FEF3F2] rounded-xl border border-[#FECDCA]">
            <div className="text-[14px] font-medium text-[#D92D20]">Potential 4h Loss</div>
            <div className="text-[28px] leading-[36px] font-semibold text-[#D92D20] mt-1">
              {formatCurrency(businessImpact.potentialAdditionalLoss4h)}
            </div>
            <div className="text-[13px] text-[#D92D20] mt-1">if unresolved</div>
          </div>
        </div>
      </div>

      {/* Section G: Recommended Actions */}
      <div className="card-base">
        <h2 className="text-[22px] leading-[30px] font-semibold text-[#18202A] mb-2">
          Recommended Actions
        </h2>
        <p className="text-[15px] leading-[24px] text-[#5F6875] mb-6">
          Prioritized operational interventions to stop ongoing loss:
        </p>

        <div className="space-y-4">
          {currentInv.recommendations.map((rec) => {
            const isApproved = rec.status === 'Approved' || rec.status === 'Task Created';
            return (
              <div
                key={rec.id}
                className="p-5 rounded-xl border border-[#E4E7EB] bg-white flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span
                      className={`h-7 px-2.5 rounded-[6px] text-[13px] font-medium inline-flex items-center ${
                        rec.priority === 'Critical'
                          ? 'bg-[#FEF3F2] text-[#D92D20]'
                          : 'bg-[#FFF6ED] text-[#E56B00]'
                      }`}
                    >
                      {rec.priority}
                    </span>
                    <h3 className="text-[16px] font-semibold text-[#18202A]">
                      {rec.title}
                    </h3>
                  </div>

                  <p className="text-[14px] leading-[22px] text-[#5F6875]">
                    {rec.reason}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-[13px] text-[#5F6875]">
                    <span>Owner: <strong className="text-[#18202A]">{rec.owner}</strong></span>
                    <span>·</span>
                    <span>Estimated Effort: <strong className="text-[#18202A]">{rec.estimatedEffort}</strong></span>
                    <span>·</span>
                    <span>Expected Impact: <strong className="text-[#18864B]">{rec.expectedImpact}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {isApproved ? (
                    <div className="flex items-center gap-3">
                      <span className="h-10 px-3.5 rounded-lg text-[14px] font-medium bg-[#EDFDF2] text-[#18864B] border border-[#A6F4C5] inline-flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#18864B]" />
                        <span>Approved & Dispatched</span>
                      </span>
                      <button
                        onClick={() => setActiveTab('actions')}
                        className="text-[14px] text-[#2F5BFF] hover:underline font-medium"
                      >
                        View in Actions
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setRejectModalRec(rec)}
                        className="h-10 px-3 text-[14px] font-medium text-[#5F6875] hover:text-[#D92D20] hover:bg-[#FEF3F2] rounded-lg transition-colors"
                        title="Reject or dismiss recommendation"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleOpenAssignModal(rec)}
                        className="h-10 px-4 text-[14px] font-medium text-[#18202A] bg-white hover:bg-[#F7F8FA] border border-[#E4E7EB] rounded-lg transition-colors"
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => handleApprove(rec.id)}
                        className="h-10 px-4 text-[14px] font-medium text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-lg shadow-sm transition-colors flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve Action</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Assign Task */}
      {selectedActionModalRec && (
        <div className="fixed inset-0 z-50 bg-[#18202A]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-[#E4E7EB] w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E4E7EB] flex items-center justify-between">
              <h3 className="text-[18px] font-semibold text-[#18202A]">Assign Action Task</h3>
              <button
                onClick={() => setSelectedActionModalRec(null)}
                className="text-[#8A93A0] hover:text-[#18202A] text-[18px]"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-[14px]">
              <div>
                <label className="block text-[13px] font-medium text-[#5F6875] mb-1">
                  Task Title
                </label>
                <div className="p-3 bg-[#F7F8FA] border border-[#E4E7EB] rounded-lg font-medium text-[#18202A]">
                  {selectedActionModalRec.title}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#5F6875] mb-1">
                    Assignee
                  </label>
                  <select
                    value={assignedTechnician}
                    onChange={(e) => setAssignedTechnician(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#E4E7EB] rounded-lg text-[#18202A] focus:outline-none focus:border-[#2F5BFF]"
                  >
                    <option value="Carlos Ruiz">Carlos Ruiz (Maintenance)</option>
                    <option value="Marcus Vance">Marcus Vance (Operations)</option>
                    <option value="Priya Patel">Priya Patel (Quality)</option>
                    <option value="Elena Rostova">Elena Rostova (Engineering)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#5F6875] mb-1">
                    Due Window
                  </label>
                  <select
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#E4E7EB] rounded-lg text-[#18202A] focus:outline-none focus:border-[#2F5BFF]"
                  >
                    <option value="Today (Within 1 hour)">Within 1 hour</option>
                    <option value="Today before Shift B close">Before Shift B close</option>
                    <option value="Tonight during CIP clean">Tonight during CIP window</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-[#F8FAFF] border border-[#D9E4FF] rounded-lg text-[#18202A]">
                <strong className="text-[#2F5BFF]">Expected Impact:</strong> {selectedActionModalRec.expectedImpact}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#E4E7EB] flex items-center justify-end gap-3 bg-[#F7F8FA]">
              <button
                onClick={() => setSelectedActionModalRec(null)}
                className="h-10 px-4 text-[14px] text-[#5F6875] hover:text-[#18202A] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTaskCreate}
                className="h-10 px-4 text-[14px] font-medium text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-lg shadow-sm"
              >
                Create Task in Action Center
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reject / Dismiss Recommendation (User Control & Freedom Heuristic) */}
      {rejectModalRec && (
        <div className="fixed inset-0 z-50 bg-[#18202A]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-[#E4E7EB] w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E4E7EB] flex items-center justify-between">
              <h3 className="text-[18px] font-semibold text-[#18202A]">Dismiss Recommendation</h3>
              <button
                onClick={() => setRejectModalRec(null)}
                className="text-[#8A93A0] hover:text-[#18202A] text-[18px]"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-[14px]">
              <div>
                <span className="text-[13px] font-medium text-[#5F6875] block mb-1">
                  Proposed Action:
                </span>
                <div className="p-3 bg-[#F7F8FA] border border-[#E4E7EB] rounded-lg font-medium text-[#18202A]">
                  {rejectModalRec.title}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#5F6875] mb-1">
                  Reason for Dismissal
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#E4E7EB] rounded-lg text-[#18202A] focus:outline-none focus:border-[#2F5BFF]"
                >
                  <option value="Operating telemetry is within permissible variance">Operating telemetry is within permissible variance</option>
                  <option value="Scheduled maintenance is already planned for next shift">Scheduled maintenance is already planned for next shift</option>
                  <option value="Alternative mechanical root cause identified by floor lead">Alternative mechanical root cause identified by floor lead</option>
                  <option value="Product run concludes within 30 minutes; no downtime warranted">Product run concludes within 30 minutes; no downtime warranted</option>
                </select>
              </div>

              <p className="text-[13px] text-[#5F6875]">
                Dismissing this recommendation will record operator feedback in the audit log without creating an open task.
              </p>
            </div>

            <div className="px-6 py-4 border-t border-[#E4E7EB] flex items-center justify-end gap-3 bg-[#F7F8FA]">
              <button
                onClick={() => setRejectModalRec(null)}
                className="h-10 px-4 text-[14px] text-[#5F6875] hover:text-[#18202A] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="h-10 px-4 text-[14px] font-medium text-white bg-[#D92D20] hover:bg-[#B42318] rounded-lg shadow-sm"
              >
                Confirm Dismissal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
