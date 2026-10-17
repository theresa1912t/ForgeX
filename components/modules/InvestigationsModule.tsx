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
  Check,
  X,
  Flame,
  Boxes,
  Cpu,
  ClipboardList,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/calculations';
import { RecommendedAction } from '@/lib/types';

const HERO_INVESTIGATION_ID = 'inv-line3-hero';

export function InvestigationsModule() {
  const {
    investigations,
    selectedInvestigationId,
    setSelectedInvestigationId,
    approveRecommendation,
    createActionTaskFromRecommendation,
    completeTaskWithOutcome,
    actionTasks,
    activeTab,
    setActiveTab,
    previousTab,
    showToast,
    isMutationPending,
  } = useFactory();

  const currentInv =
    (selectedInvestigationId && investigations[selectedInvestigationId]) ||
    investigations['inv-line3-hero'] ||
    Object.values(investigations)[0];

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'telemetry' | 'financial'>('overview');
  const [expandedCauseId, setExpandedCauseId] = useState<string>('rc-1');
  const [selectedActionModalRec, setSelectedActionModalRec] = useState<RecommendedAction | null>(null);
  const [rejectModalRec, setRejectModalRec] = useState<RecommendedAction | null>(null);
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
            className="h-10 px-4 text-[14px] font-medium text-[#18202A] bg-white hover:bg-[#F7F8FA] border border-[#E4E7EB] rounded-lg transition-colors cursor-pointer"
          >
            View Active Alerts
          </button>
          <button
            onClick={() => {
              setSelectedInvestigationId('inv-line3-hero');
              setActiveTab('investigations');
            }}
            className="h-10 px-4 text-[14px] font-medium text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            Open Line 3 Root Cause Case
          </button>
        </div>
      </div>
    );
  }

  const isResolved = currentInv.status === 'Resolved';
  const isHero = currentInv.id === HERO_INVESTIGATION_ID;
  const { businessImpact } = currentInv;
  const linkedTask = actionTasks.find(
    (t) => t.investigationId === currentInv.id || t.alertId === currentInv.alertId
  );

  const primaryRec = currentInv.recommendations?.[0];

  const handleApprove = (recId: string) => {
    approveRecommendation(currentInv.id, recId);
    showToast('Recommendation approved and validated as operational SOP', 'success');
  };

  const handleOpenAssignModal = (rec: RecommendedAction) => {
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
      showToast(`Work order dispatched to ${assignedTechnician}`, 'success');
      setSelectedActionModalRec(null);
      setActiveTab('actions');
    }
  };

  const handleConfirmReject = () => {
    if (rejectModalRec) {
      showToast(`Recommendation "${rejectModalRec.title}" was dismissed: ${rejectReason}`, 'info');
      setRejectModalRec(null);
    }
  };

  const backDestination = previousTab === 'alerts' ? 'Alerts' : previousTab === 'actions' ? 'Action Center' : 'Dashboard';

  return (
    <div className="space-y-6">
      {/* 0. Contextual Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E7EB]">
        <div className="flex items-center gap-2 text-[14px]">
          <button
            onClick={() => setActiveTab(previousTab || 'dashboard')}
            className="inline-flex items-center gap-1.5 font-semibold text-[#2F5BFF] hover:text-[#2448D8] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {backDestination}</span>
          </button>
          <span className="text-[#8A93A0]">/</span>
          <span className="text-[#5F6875]">Operations Intelligence</span>
          <span className="text-[#8A93A0]">/</span>
          <span className="text-[#18202A] font-semibold">Case #{currentInv.id.toUpperCase()}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EEF3FF] text-[#2F5BFF] text-[12px] font-semibold border border-[#D9E4FF]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Root-Cause Diagnosis · Automated Correlation</span>
          </span>
        </div>
      </div>

      {/* 1. Unified Incident Hero Card (Consolidated Metrics & Direct Actions) */}
      <div className="bg-white border border-[#E4E7EB] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E4E7EB]">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span
                className={`h-7 px-3 rounded-md text-[12px] font-bold uppercase tracking-wider inline-flex items-center ${
                  isResolved
                    ? 'bg-[#EDFDF2] text-[#18864B] border border-[#A6F4C5]'
                    : 'bg-[#FEF3F2] text-[#D92D20] border border-[#FECDCA]'
                }`}
              >
                {isResolved ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Resolved & Restored
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                    Active Investigation
                  </>
                )}
              </span>
              <span className="text-[13px] font-semibold text-[#5F6875]">
                {currentInv.lineName} · {currentInv.machineName}
              </span>
            </div>

            <h1 className="text-[26px] leading-[34px] font-bold text-[#18202A]">
              {currentInv.title}
            </h1>
            <p className="text-[13px] leading-[20px] text-[#5F6875] mt-1.5 max-w-2xl">
              {currentInv.summary}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[13px] text-[#5F6875]">
              <span>Product: <strong className="text-[#18202A]">{currentInv.productName || 'N/A'}</strong></span>
              <span>·</span>
              <span>Operating Shift: <strong className="text-[#18202A]">{currentInv.shift}</strong></span>
              <span>·</span>
              <span>Triggered: <strong className="text-[#18202A]">{currentInv.startTime}</strong> ({currentInv.duration})</span>
            </div>
            {isResolved && currentInv.resolutionOutcome && (
              <div className="mt-1.5 text-[13px] text-[#18864B] font-medium">
                Signed off by {currentInv.resolutionOutcome.completedBy}: {currentInv.resolutionOutcome.notes}
              </div>
            )}
          </div>

          {/* Primary Quick-Action Header Box */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {isResolved ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setActiveTab('materials');
                    showToast('Opening Materials Ledger to verify scrap documentation.', 'info');
                  }}
                  className="h-10 px-4 text-[13px] font-semibold text-[#18202A] bg-white border border-[#D0D5DD] hover:bg-[#F7F8FA] rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Flame className="w-4 h-4 text-[#D92D20]" />
                  <span>Audit Scrap Ledger</span>
                </button>
                <button
                  onClick={() => setActiveTab('actions')}
                  className="h-10 px-4 text-[13px] font-semibold text-white bg-[#18864B] hover:bg-[#157340] rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Resolved in Action Center</span>
                </button>
              </div>
            ) : linkedTask ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (isHero) {
                      completeTaskWithOutcome(
                        linkedTask.id,
                        'Valve #4 diaphragm replaced. Mechanical stroke returned to nominal resistance.',
                        'Completed replacement under +0.2 bar backpressure test. Output normalized.',
                        1000
                      );
                    } else {
                      completeTaskWithOutcome(
                        linkedTask.id,
                        `${linkedTask.title} completed.`,
                        linkedTask.description,
                      );
                    }
                  }}
                  disabled={isMutationPending(`completeTaskWithOutcome:${linkedTask.id}`)}
                  className="h-10 px-4 text-[13px] font-semibold text-white bg-[#18864B] hover:bg-[#157340] rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isMutationPending(`completeTaskWithOutcome:${linkedTask.id}`)
                      ? 'Completing...'
                      : isHero
                      ? 'Complete Maintenance & Restore Speed'
                      : 'Mark Task Complete'}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('actions')}
                  className="h-10 px-3.5 text-[13px] font-semibold text-[#18202A] bg-white border border-[#D0D5DD] hover:bg-[#F7F8FA] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>View Work Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              primaryRec && (
                <button
                  onClick={() => handleOpenAssignModal(primaryRec)}
                  className="h-11 px-5 text-[14px] font-semibold text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-xl transition-all flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Dispatch Work Order</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* 4 Core Vital Metrics (Glanceable, zero repetition) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="p-4 bg-[#F8FAFC] border border-[#E4E7EB] rounded-xl">
            <div className="text-[12px] font-semibold text-[#5F6875] flex items-center justify-between">
              <span>Throughput Deficit</span>
              <TrendingDown className="w-4 h-4 text-[#D92D20]" />
            </div>
            <div className={`text-[24px] font-bold mt-1 font-mono ${isResolved ? 'text-[#18864B]' : 'text-[#D92D20]'}`}>
              {currentInv.outputVariancePct}%
            </div>
            <div className="text-[12px] text-[#5F6875] mt-0.5">
              {isResolved ? 'Resolved — restored to target' : 'vs planned target'}
            </div>
          </div>

          <div className="p-4 bg-[#F8FAFC] border border-[#E4E7EB] rounded-xl">
            <div className="text-[12px] font-semibold text-[#5F6875] flex items-center justify-between">
              <span>Financial Loss Rate</span>
              <DollarSign className="w-4 h-4 text-[#D92D20]" />
            </div>
            <div className="text-[24px] font-bold text-[#D92D20] mt-1 font-mono">
              ${formatNumber(businessImpact.currentLossRatePerHour)}/hr
            </div>
            <div className="text-[12px] text-[#5F6875] mt-0.5">
              {formatCurrency(businessImpact.estimatedRevenueLoss)} accumulated shift loss
            </div>
          </div>

          <div className="p-4 bg-[#F8FAFC] border border-[#E4E7EB] rounded-xl">
            <div className="text-[12px] font-semibold text-[#5F6875] flex items-center justify-between">
              <span>Primary Failure Mode</span>
              <Wrench className="w-4 h-4 text-[#2F5BFF]" />
            </div>
            <div className="text-[15px] font-bold text-[#18202A] mt-1 truncate">
              {currentInv.rootCauses[0]?.title ?? 'Not yet determined'}
            </div>
            <div className="text-[12px] text-[#2F5BFF] font-semibold mt-0.5">
              Rank #1 · {currentInv.rootCauses[0]?.confidence ?? 0}% Confidence
            </div>
          </div>

          <div className="p-4 bg-[#F8FAFC] border border-[#E4E7EB] rounded-xl">
            <div className="text-[12px] font-semibold text-[#5F6875] flex items-center justify-between">
              <span>Material Waste</span>
              <Flame className="w-4 h-4 text-[#D92D20]" />
            </div>
            <div className="text-[24px] font-bold text-[#18202A] mt-1 font-mono">
              {businessImpact.materialWasteKg} kg
            </div>
            <div className="text-[12px] text-[#D92D20] font-medium mt-0.5">
              ${businessImpact.materialWasteCost} scrap cost
            </div>
          </div>
        </div>
      </div>

      {/* 2. Three Clean Focus Tabs (Reducing Cognitive Load by Role/Task) */}
      <div className="flex items-center gap-2 border-b border-[#E4E7EB]">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`h-11 px-5 text-[14px] font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'overview'
              ? 'border-[#2F5BFF] text-[#2F5BFF]'
              : 'border-transparent text-[#5F6875] hover:text-[#18202A]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Root Cause & Corrective Actions</span>
        </button>

        <button
          onClick={() => setActiveSubTab('telemetry')}
          className={`h-11 px-5 text-[14px] font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'telemetry'
              ? 'border-[#2F5BFF] text-[#2F5BFF]'
              : 'border-transparent text-[#5F6875] hover:text-[#18202A]'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Sensor Telemetry & Timeline</span>
        </button>

        <button
          onClick={() => setActiveSubTab('financial')}
          className={`h-11 px-5 text-[14px] font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'financial'
              ? 'border-[#2F5BFF] text-[#2F5BFF]'
              : 'border-transparent text-[#5F6875] hover:text-[#18202A]'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Financial & Scrap Accounting</span>
        </button>
      </div>

      {/* TAB 1: ROOT CAUSE & CORRECTIVE ACTIONS (Default View) */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* A. Multi-Signal Triangulation (Machine OT × Ingredient Batch × Floor Scrap) — narrative
              detail specific to the seeded hero scenario (no generic equivalent fields exist on
              Investigation for an AI-generated case), so it only renders for that one case. The
              Ranked Root Causes list below is real and investigation-specific for every case. */}
          {isHero && (
          <div className="bg-white border border-[#E4E7EB] rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4E7EB]">
              <div>
                <h3 className="text-[17px] font-bold text-[#18202A] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#2F5BFF]" />
                  <span>Multi-Signal Triangulation Synthesis</span>
                </h3>
                <p className="text-[13px] text-[#5F6875] mt-0.5">
                  Cross-correlating physical machine kinematics, raw milk solids chemistry, and floor reject scales.
                </p>
              </div>
              <span className="text-[12px] font-mono text-[#2F5BFF] bg-[#EEF3FF] px-2.5 py-1 rounded-md border border-[#D9E4FF] font-semibold self-start sm:self-auto">
                Correlation Confidence: 87%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Signal 1: Machine OT */}
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E4E7EB] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#2F5BFF] flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Signal 1: Machine OT</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#D92D20] bg-[#FEF3F2] px-2 py-0.5 rounded font-bold border border-[#FECDCA]">
                    Anomalous (68% Health)
                  </span>
                </div>
                <h4 className="font-bold text-[14px] text-[#18202A]">Aseptic Rotary Filler M-03</h4>
                <p className="text-[13px] text-[#5F6875] leading-relaxed">
                  Rotary manifold vibration escalated <strong>+38% (3.31 mm/s)</strong> and dosing duration stretched <strong>+22% (0.82s)</strong> on PLC register R:102.
                </p>
                <div className="pt-2 border-t border-[#E4E7EB] text-[12px] text-[#18202A]">
                  <strong>Physical Effect:</strong> Mechanical diaphragm fatigue on valve head #4.
                </div>
              </div>

              {/* Signal 2: Raw Material Batch */}
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E4E7EB] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#E56B00] flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5" />
                    <span>Signal 2: Raw Ingredient</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#E56B00] bg-[#FFF6ED] px-2 py-0.5 rounded font-bold border border-[#FEDF89]">
                    Viscosity +8.4%
                  </span>
                </div>
                <h4 className="font-bold text-[14px] text-[#18202A]">Raw Milk Lot #LOT-RAW-904</h4>
                <p className="text-[13px] text-[#5F6875] leading-relaxed">
                  Supplier CoA recorded raw milk viscosity at <strong>2.28 cP vs 2.10 cP nominal</strong> due to natural solids-not-fat, fed into batch PB-UHT-1008.
                </p>
                <div className="pt-2 border-t border-[#E4E7EB] text-[12px] text-[#18202A]">
                  <strong>Physical Effect:</strong> Added +0.2 bar backpressure, stressing worn seals.
                </div>
              </div>

              {/* Signal 3: Quality Checkweigher Scrap */}
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E4E7EB] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#D92D20] flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Signal 3: Reject Waste</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#D92D20] bg-[#FEF3F2] px-2 py-0.5 rounded font-bold border border-[#FECDCA]">
                    128 kg ($768) Scrap
                  </span>
                </div>
                <h4 className="font-bold text-[14px] text-[#18202A]">Inline Checkweigher CW-03</h4>
                <p className="text-[13px] text-[#5F6875] leading-relaxed">
                  Checkweigher rejected <strong>256 underfill bottles (&lt;988g)</strong> with erratic nozzle cut-off timing during high-speed rotary passes.
                </p>
                <div className="pt-2 border-t border-[#E4E7EB] text-[12px] text-[#18202A]">
                  <strong>Physical Effect:</strong> Valve lag prevents complete dosing before cutoff.
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-[#EEF3FF] rounded-xl border border-[#D9E4FF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px]">
              <div className="text-[#18202A]">
                <strong>Synthesis Finding:</strong> Mechanical diaphragm fatigue is the primary bottleneck constraint. The raw milk viscosity variation aggravated fluid resistance but did not cause the mechanical failure.
              </div>
            </div>
          </div>
          )}

          {/* B. Ranked Root Causes (Clean Accordion Hierarchy) */}
          <div className="bg-white border border-[#E4E7EB] rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-[17px] font-bold text-[#18202A]">
              Ranked Root-Cause Explanations
            </h3>

            <div className="space-y-3">
              {currentInv.rootCauses.map((cause) => {
                const isExpanded = expandedCauseId === cause.id;
                const isRank1 = cause.rank === 1;

                return (
                  <div
                    key={cause.id}
                    className={`border rounded-xl transition-all overflow-hidden ${
                      isRank1
                        ? 'border-[#2F5BFF]/40 bg-[#F8FAFF]'
                        : 'border-[#E4E7EB] bg-white'
                    }`}
                  >
                    <div
                      onClick={() => setExpandedCauseId(isExpanded ? '' : cause.id)}
                      className="p-4 flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[13px] shrink-0 ${
                            isRank1
                              ? 'bg-[#2F5BFF] text-white shadow-xs'
                              : 'bg-[#F1F3F5] text-[#5F6875]'
                          }`}
                        >
                          #{cause.rank}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-[15px] font-bold text-[#18202A]">
                              {cause.title}
                            </h4>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                                cause.status === 'Likely Contributor'
                                  ? 'bg-[#FEF3F2] text-[#D92D20] border border-[#FECDCA]'
                                  : cause.status === 'Secondary Factor'
                                  ? 'bg-[#FFF6ED] text-[#E56B00] border border-[#FEDF89]'
                                  : 'bg-[#F2F4F7] text-[#5F6875]'
                              }`}
                            >
                              {cause.status}
                            </span>
                          </div>
                          <p className="text-[13px] text-[#5F6875] mt-0.5">{cause.summary}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <div className="text-right">
                          <div className="text-[15px] font-bold text-[#18202A]">{cause.confidence}%</div>
                          <div className="text-[11px] text-[#5F6875]">Confidence</div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-[#8A93A0]" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-[#8A93A0]" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-5 pb-4 pt-2 border-t border-[#E4E7EB] bg-white space-y-3">
                        <div className="text-[13px] font-semibold text-[#18202A]">
                          Supporting Telemetry Evidence:
                        </div>
                        <ul className="space-y-1.5 text-[13px] text-[#5F6875]">
                          {cause.supportingEvidence.map((ev, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-[#2F5BFF] font-bold">•</span>
                              <span>{ev}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="p-3 bg-[#F8FAFC] rounded-lg text-[12px] text-[#5F6875]">
                          <strong className="text-[#18202A]">Historical Precedent:</strong> {cause.historicalPrecedent}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* C. Actionable Work Order Recommendations */}
          <div className="bg-white border border-[#E4E7EB] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EB]">
              <div>
                <h3 className="text-[17px] font-bold text-[#18202A] flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#2F5BFF]" />
                  <span>Recommended Corrective Actions</span>
                </h3>
                <p className="text-[13px] text-[#5F6875] mt-0.5">
                  Verified maintenance standard operating procedures (SOPs) to recover lost line throughput.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {currentInv.recommendations.map((rec) => {
                const isApproved = rec.status === 'Approved' || rec.status === 'Task Created';
                const isTaskCreated = rec.status === 'Task Created';

                return (
                  <div
                    key={rec.id}
                    className="p-4 rounded-xl border border-[#E4E7EB] bg-white hover:border-[#D0D5DD] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2.5 mb-1">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                            rec.priority === 'Critical'
                              ? 'bg-[#FEF3F2] text-[#D92D20] border border-[#FECDCA]'
                              : 'bg-[#FFF6ED] text-[#E56B00] border border-[#FEDF89]'
                          }`}
                        >
                          {rec.priority}
                        </span>
                        <h4 className="text-[15px] font-bold text-[#18202A]">
                          {rec.title}
                        </h4>
                      </div>
                      <p className="text-[13px] text-[#5F6875] leading-relaxed">
                        {rec.reason}
                      </p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[12px] text-[#5F6875]">
                        <span>Assigned Team: <strong className="text-[#18202A]">{rec.owner}</strong></span>
                        <span>·</span>
                        <span>Effort: <strong className="text-[#18202A]">{rec.estimatedEffort}</strong></span>
                        <span>·</span>
                        <span>Target: <strong className="text-[#18864B]">{rec.expectedImpact}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {isApproved || isTaskCreated ? (
                        <span className="h-9 px-3.5 rounded-lg text-[13px] font-semibold bg-[#EDFDF2] text-[#18864B] border border-[#A6F4C5] inline-flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#18864B]" />
                          <span>Dispatched to {rec.owner}</span>
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => setRejectModalRec(rec)}
                            className="h-9 px-3 text-[13px] font-semibold text-[#5F6875] hover:text-[#D92D20] hover:bg-[#FEF3F2] rounded-lg transition-colors cursor-pointer"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => handleOpenAssignModal(rec)}
                            className="h-9 px-3.5 text-[13px] font-semibold text-[#18202A] bg-white hover:bg-[#F7F8FA] border border-[#D0D5DD] rounded-lg transition-colors cursor-pointer shadow-xs"
                          >
                            Assign...
                          </button>
                          <button
                            onClick={() => handleApprove(rec.id)}
                            disabled={isMutationPending(`approveRecommendation:${rec.id}`)}
                            className="h-9 px-4 text-[13px] font-semibold text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <Check className="w-4 h-4" />
                            <span>{isMutationPending(`approveRecommendation:${rec.id}`) ? 'Approving...' : 'Approve Action'}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SENSOR TELEMETRY & EVENT TIMELINE */}
      {activeSubTab === 'telemetry' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* A. 5 Sensor Baseline vs Observed Deltas */}
          <div className="bg-white border border-[#E4E7EB] rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-[17px] font-bold text-[#18202A] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#2F5BFF]" />
                <span>Operational Telemetry & Baseline Deltas</span>
              </h3>
              <p className="text-[13px] text-[#5F6875] mt-0.5">
                Comparing current real-time streaming registers against 30-day validated nominal baselines.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {currentInv.sensorDeltas.map((sensor, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    sensor.isAbnormal && !isResolved
                      ? 'border-[#FECDCA] bg-[#FEF3F2]/40'
                      : 'border-[#E4E7EB] bg-[#F8FAFC]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] font-bold text-[#18202A] truncate">{sensor.parameter}</span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          sensor.isAbnormal && !isResolved
                            ? 'bg-[#FEF3F2] text-[#D92D20] border border-[#FECDCA]'
                            : 'bg-white text-[#5F6875] border border-[#E4E7EB]'
                        }`}
                      >
                        {isResolved ? 'Normalized' : sensor.changePct}
                      </span>
                    </div>

                    <div className="space-y-1 text-[13px]">
                      <div className="flex justify-between">
                        <span className="text-[#5F6875]">Baseline:</span>
                        <span className="text-[#18202A] font-mono">{sensor.baseline}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span className="text-[#5F6875]">Observed:</span>
                        <span className={`font-mono ${sensor.isAbnormal && !isResolved ? 'text-[#D92D20]' : 'text-[#18202A]'}`}>
                          {isResolved ? sensor.baseline : sensor.current}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#E4E7EB] text-[11px] flex justify-between font-semibold">
                    <span className="text-[#8A93A0]">Tolerance ±5%</span>
                    <span className={sensor.isAbnormal && !isResolved ? 'text-[#D92D20]' : 'text-[#18864B]'}>
                      {sensor.isAbnormal && !isResolved ? 'Breached' : 'Within Bounds'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* B. Chronological Event Timeline */}
          <div className="bg-white border border-[#E4E7EB] rounded-2xl p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-[17px] font-bold text-[#18202A] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#2F5BFF]" />
                <span>Incident Chronology & Sequence of Events</span>
              </h3>
              <p className="text-[13px] text-[#5F6875] mt-0.5">
                Exact sequence of recorded events and telemetry correlated to this investigation.
              </p>
            </div>

            <div className="relative pl-6 space-y-5 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E4E7EB]">
              {currentInv.timeline.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  <div className="w-4 h-4 rounded-full bg-[#2F5BFF] ring-4 ring-white -ml-[23px] shrink-0 mt-1" />
                  <div className="flex-1 p-4 bg-[#F8FAFC] rounded-xl border border-[#E4E7EB]">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-[#18202A] font-mono">{step.time}</span>
                        <span className="text-[12px] text-[#5F6875]">· Source: {step.source}</span>
                      </div>
                      {step.parameter && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-white text-[#18202A] border border-[#E4E7EB]">
                          {step.parameter}
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-[#18202A] leading-relaxed">
                      {step.event}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FINANCIAL & SCRAP ACCOUNTING */}
      {activeSubTab === 'financial' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white border border-[#E4E7EB] rounded-2xl p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-[17px] font-bold text-[#18202A] flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#2F5BFF]" />
                <span>Quantified Financial Loss & Floor Scrap Accounting</span>
              </h3>
              <p className="text-[13px] text-[#5F6875] mt-0.5">
                Translating this investigation&apos;s operational losses into direct P&amp;L impact.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E4E7EB]">
                <div className="text-[12px] font-semibold text-[#5F6875]">Lost Finished Units</div>
                <div className="text-[24px] font-bold text-[#D92D20] mt-1 font-mono">
                  {formatNumber(businessImpact.lostUnits)}
                </div>
                <div className="text-[11px] text-[#5F6875] mt-0.5">bottles below schedule</div>
              </div>

              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E4E7EB]">
                <div className="text-[12px] font-semibold text-[#5F6875]">Throughput Revenue Loss</div>
                <div className="text-[24px] font-bold text-[#D92D20] mt-1 font-mono">
                  {formatCurrency(businessImpact.estimatedRevenueLoss)}
                </div>
                <div className="text-[11px] text-[#5F6875] mt-0.5">at {currentInv.productName || 'this product'}&apos;s unit revenue</div>
              </div>

              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E4E7EB]">
                <div className="text-[12px] font-semibold text-[#5F6875]">Quality Defect Cost</div>
                <div className="text-[24px] font-bold text-[#18202A] mt-1 font-mono">
                  ${businessImpact.additionalReworkCost}
                </div>
                <div className="text-[11px] text-[#5F6875] mt-0.5">{businessImpact.additionalReworkUnits} rejected units</div>
              </div>

              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E4E7EB]">
                <div className="text-[12px] font-semibold text-[#5F6875]">Raw Ingredient Scrap</div>
                <div className="text-[24px] font-bold text-[#D92D20] mt-1 font-mono">
                  ${businessImpact.materialWasteCost}
                </div>
                <div className="text-[11px] text-[#5F6875] mt-0.5">{businessImpact.materialWasteKg} kg scrap material</div>
              </div>

              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E4E7EB]">
                <div className="text-[12px] font-semibold text-[#5F6875]">Run-Rate Burn</div>
                <div className="text-[24px] font-bold text-[#D92D20] mt-1 font-mono">
                  ${formatNumber(businessImpact.currentLossRatePerHour)}/hr
                </div>
                <div className="text-[11px] text-[#5F6875] mt-0.5">continuous line deficit</div>
              </div>

              <div className="p-4 bg-[#FEF3F2] rounded-xl border border-[#FECDCA]">
                <div className="text-[12px] font-bold text-[#D92D20]">Potential 4h Loss</div>
                <div className="text-[24px] font-bold text-[#D92D20] mt-1 font-mono">
                  {formatCurrency(businessImpact.potentialAdditionalLoss4h)}
                </div>
                <div className="text-[11px] text-[#D92D20] mt-0.5 font-medium">if left unserviced</div>
              </div>
            </div>

            <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E4E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-[14px] font-bold text-[#18202A]">Need to record scrap units from this incident?</h4>
                <p className="text-[12px] text-[#5F6875]">
                  Floor supervisors can directly audit and post defective volumes to the material scrap ledger.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('materials')}
                className="h-9 px-4 text-[13px] font-semibold text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
              >
                <Flame className="w-3.5 h-3.5 text-white" />
                <span>Open Materials & Scrap Ledger</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Assign Task */}
      {selectedActionModalRec && (
        <div className="fixed inset-0 z-50 bg-[#18202A]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E4E7EB] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-[#E4E7EB] flex items-center justify-between">
              <h3 className="text-[17px] font-bold text-[#18202A]">Dispatch Work Order</h3>
              <button
                onClick={() => setSelectedActionModalRec(null)}
                className="text-[#8A93A0] hover:text-[#18202A] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-[14px]">
              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-[#5F6875] mb-1.5">
                  Task Title & Action
                </label>
                <div className="p-3 bg-[#F8FAFC] border border-[#E4E7EB] rounded-xl font-semibold text-[#18202A]">
                  {selectedActionModalRec.title}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-[#5F6875] mb-1.5">
                    Assignee
                  </label>
                  <select
                    value={assignedTechnician}
                    onChange={(e) => setAssignedTechnician(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#D0D5DD] rounded-xl text-[#18202A] font-medium focus:outline-none focus:border-[#2F5BFF]"
                  >
                    <option value="Carlos Ruiz">Carlos Ruiz (Maintenance Lead)</option>
                    <option value="Marcus Vance">Marcus Vance (Shift Supervisor)</option>
                    <option value="Priya Patel">Priya Patel (QA Director)</option>
                    <option value="Elena Rostova">Elena Rostova (Plant Operations)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-[#5F6875] mb-1.5">
                    Due Window
                  </label>
                  <select
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#D0D5DD] rounded-xl text-[#18202A] font-medium focus:outline-none focus:border-[#2F5BFF]"
                  >
                    <option value="Today (Within 1 hour)">Within 1 hour</option>
                    <option value="Today before Shift B close">Before Shift B close</option>
                    <option value="Tonight during CIP clean">Tonight during CIP window</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 bg-[#EEF3FF] border border-[#D9E4FF] rounded-xl text-[13px] text-[#18202A]">
                <strong className="text-[#2F5BFF]">Target Recovery:</strong> {selectedActionModalRec.expectedImpact}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#E4E7EB] flex items-center justify-end gap-3 bg-[#F8FAFC]">
              <button
                onClick={() => setSelectedActionModalRec(null)}
                className="h-10 px-4 text-[13px] font-semibold text-[#5F6875] hover:text-[#18202A] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTaskCreate}
                disabled={isMutationPending(`createActionTaskFromRecommendation:${selectedActionModalRec.id}`)}
                className="h-10 px-5 text-[13px] font-semibold text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-xl shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isMutationPending(`createActionTaskFromRecommendation:${selectedActionModalRec.id}`) ? 'Dispatching...' : 'Dispatch Work Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reject / Dismiss Recommendation */}
      {rejectModalRec && (
        <div className="fixed inset-0 z-50 bg-[#18202A]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E4E7EB] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-[#E4E7EB] flex items-center justify-between">
              <h3 className="text-[17px] font-bold text-[#18202A]">Dismiss Recommendation</h3>
              <button
                onClick={() => setRejectModalRec(null)}
                className="text-[#8A93A0] hover:text-[#18202A] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-[14px]">
              <div>
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#5F6875] block mb-1.5">
                  Proposed Action:
                </span>
                <div className="p-3 bg-[#F8FAFC] border border-[#E4E7EB] rounded-xl font-semibold text-[#18202A]">
                  {rejectModalRec.title}
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-[#5F6875] mb-1.5">
                  Reason for Dismissal
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#D0D5DD] rounded-xl text-[#18202A] font-medium focus:outline-none focus:border-[#2F5BFF]"
                >
                  <option value="Operating telemetry is within permissible variance">Operating telemetry is within permissible variance</option>
                  <option value="Scheduled maintenance is already planned for next shift">Scheduled maintenance is already planned for next shift</option>
                  <option value="Alternative mechanical root cause identified by floor lead">Alternative mechanical root cause identified by floor lead</option>
                  <option value="Product run concludes within 30 minutes; no downtime warranted">Product run concludes within 30 minutes; no downtime warranted</option>
                </select>
              </div>

              <p className="text-[12px] text-[#5F6875]">
                Dismissing this recommendation records operator feedback in the audit log without creating an open work order.
              </p>
            </div>

            <div className="px-6 py-4 border-t border-[#E4E7EB] flex items-center justify-end gap-3 bg-[#F8FAFC]">
              <button
                onClick={() => setRejectModalRec(null)}
                className="h-10 px-4 text-[13px] font-semibold text-[#5F6875] hover:text-[#18202A] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="h-10 px-5 text-[13px] font-semibold text-white bg-[#D92D20] hover:bg-[#B42318] rounded-xl shadow-xs cursor-pointer"
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
