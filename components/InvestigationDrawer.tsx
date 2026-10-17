'use client';

import React from 'react';
import { useFactory } from '@/lib/factoryStore';
import {
  X,
  Sparkles,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Flame,
  Check,
  ClipboardList,
  Wrench,
  Activity,
  TrendingDown,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/calculations';
import { RecommendedAction } from '@/lib/types';

const HERO_INVESTIGATION_ID = 'inv-line3-hero';

// The 1-click "dispatch" shortcut skips the assign modal, so it needs a default assignee —
// mapped to the real seeded person who actually owns that recommendation's discipline, instead
// of a single hardcoded name regardless of category.
const DEFAULT_ASSIGNEE_BY_OWNER: Record<string, string> = {
  Maintenance: 'Carlos Ruiz',
  Quality: 'Priya Patel',
  Operations: 'Marcus Vance',
};

export function InvestigationDrawer() {
  const {
    investigationDrawerOpen,
    closeInvestigationDrawer,
    activeDrawerInvestigationId,
    investigations,
    openInvestigation,
    approveRecommendation,
    createActionTaskFromRecommendation,
    completeTaskWithOutcome,
    actionTasks,
    setActiveTab,
    setSelectedInvestigationId,
    showToast,
    isMutationPending,
  } = useFactory();

  if (!investigationDrawerOpen) return null;

  const invId = activeDrawerInvestigationId || HERO_INVESTIGATION_ID;
  const investigation = investigations[invId] || investigations[HERO_INVESTIGATION_ID];

  if (!investigation) return null;

  const isHero = investigation.id === HERO_INVESTIGATION_ID;
  const isResolved = investigation.status === 'Resolved';
  // Prefer a task actually tied to THIS investigation; only fall back to matching by alertId for
  // legacy tasks with no investigationId set — otherwise a different, unrelated task sharing the
  // same alert (e.g. an old seeded one) could be picked instead.
  const linkedTask =
    actionTasks.find((t) => t.investigationId === investigation.id) ||
    actionTasks.find((t) => !t.investigationId && t.alertId === investigation.alertId);

  // Every real investigation always has >=1 recommendation (generateInvestigation.ts throws
  // before creating one with none) — this fallback is a defensive no-data placeholder, so it
  // stays neutral rather than inventing specifics for an investigation it knows nothing about.
  const primaryRec = investigation.recommendations?.[0] || {
    id: 'rec-fallback',
    investigationId: investigation.id,
    title: 'No recommendation on record',
    reason: investigation.summary,
    priority: 'Medium',
    owner: 'Operations',
    estimatedEffort: 'TBD',
    expectedImpact: 'Not yet quantified',
    evidence: '',
    status: 'Pending',
  };

  const handleApprove = (rec: RecommendedAction) => {
    approveRecommendation(investigation.id, rec.id);
    showToast(`Approved recommendation: "${rec.title}"`, 'success');
  };

  const handleCreateTask = (rec: RecommendedAction) => {
    const assignee = DEFAULT_ASSIGNEE_BY_OWNER[rec.owner] || 'Carlos Ruiz';
    const dueDate = 'Today (Within 45 mins)';
    createActionTaskFromRecommendation(investigation.id, rec, assignee, dueDate);
    showToast(`Dispatched work order to ${assignee}: "${rec.title}"`, 'success');
  };

  const handleOpenFullWorkbench = () => {
    openInvestigation(investigation.id, 'dashboard');
    closeInvestigationDrawer();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#18202A]/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-[580px] bg-white h-full shadow-2xl flex flex-col border-l border-[#E4E7EB] animate-in slide-in-from-right duration-300">
        
        {/* 1. Clean Drawer Header Bar (Redundant Line/Machine text removed) */}
        <div className="px-6 py-3.5 border-b border-[#E4E7EB] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span
              className={`h-7 px-2.5 rounded-[6px] text-[13px] font-semibold inline-flex items-center ${
                isResolved
                  ? 'bg-[#EDFDF2] text-[#18864B] border border-[#A6F4C5]'
                  : 'bg-[#FEF3F2] text-[#D92D20] border border-[#FECDCA]'
              }`}
            >
              {isResolved ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Resolved
                </>
              ) : (
                <>
                  <AlertOctagon className="w-3.5 h-3.5 mr-1" />
                  Active Incident
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenFullWorkbench}
              className="h-8 px-2.5 text-[12px] font-semibold text-[#2F5BFF] hover:bg-[#EEF3FF] rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Open full interactive workbench view"
            >
              <span>Full Workbench</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={closeInvestigationDrawer}
              className="p-1.5 text-[#8A93A0] hover:text-[#18202A] hover:bg-[#F1F3F5] rounded-md transition-colors cursor-pointer"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Drawer Title & Operational Context */}
        <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E4E7EB] shrink-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#2F5BFF] flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            AI Root-Cause Diagnosis
          </div>
          <h2 className="text-[18px] font-bold text-[#18202A] leading-snug">
            {investigation.title}
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-[12px] text-[#5F6875]">
            <span>Product: <strong className="text-[#18202A]">{investigation.productName}</strong></span>
            <span>Shift: <strong className="text-[#18202A]">{investigation.shift}</strong></span>
            <span>Started: <strong className="text-[#18202A]">{investigation.startTime}</strong></span>
          </div>
        </div>

        {/* 3. Streamlined Content Body (Low Cognitive Load) */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          
          {/* A. Status & Progression Banner */}
          {isResolved ? (
            <div className="p-4 rounded-xl border border-[#A6F4C5] bg-[#EDFDF2]/80">
              <div className="flex items-center gap-2 text-[14px] font-bold text-[#18864B] mb-1">
                <CheckCircle2 className="w-4 h-4 text-[#18864B]" />
                <span>
                  {investigation.lineName} Issue Resolved
                  {investigation.resolutionOutcome && (
                    <> (+{investigation.resolutionOutcome.recoveredUnitsPerHour} units/hr recovered)</>
                  )}
                </span>
              </div>
              <p className="text-[13px] text-[#18864B] leading-relaxed">
                {investigation.resolutionOutcome?.notes ?? investigation.summary}
                {investigation.resolutionOutcome && (
                  <>
                    {' '}Signed off by <strong>{investigation.resolutionOutcome.completedBy}</strong>.
                  </>
                )}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => {
                    closeInvestigationDrawer();
                    setActiveTab('materials');
                    showToast('Opening Materials Ledger to verify scrap documentation.', 'info');
                  }}
                  className="h-8 px-3 text-[12px] font-semibold text-[#18202A] bg-white border border-[#D0D5DD] hover:bg-[#F7F8FA] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Flame className="w-3.5 h-3.5 text-[#D92D20]" />
                  <span>Audit Scrap Ledger</span>
                </button>
                <button
                  onClick={() => {
                    closeInvestigationDrawer();
                    setSelectedInvestigationId(investigation.id);
                    setActiveTab('actions');
                  }}
                  className="h-8 px-3 text-[12px] font-semibold text-[#2F5BFF] hover:bg-[#EEF3FF] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>View in Action Center</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : linkedTask ? (
            <div className="p-4 rounded-xl border border-[#A6F4C5] bg-[#F6FEF9]">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 text-[13px] font-bold text-[#18864B]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Work Order Dispatched: {linkedTask.assignedTo}</span>
                </div>
                <span className="text-[11px] font-semibold text-[#18864B] px-2 py-0.5 rounded bg-[#EDFDF2] border border-[#A6F4C5]">
                  In Progress
                </span>
              </div>
              <p className="text-[13px] text-[#5F6875] mb-3 leading-relaxed">
                {linkedTask.description}
              </p>
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
                className="w-full h-9 px-4 text-[13px] font-semibold text-white bg-[#18864B] hover:bg-[#157340] rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
            </div>
          ) : (
            <div className="p-3.5 rounded-xl border border-[#FEDF89] bg-[#FFFBF5] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#B54708] shrink-0" />
                <div>
                  <div className="text-[13px] font-bold text-[#B54708]">
                    {isHero ? 'Line 3 Speed Loss Alert' : `${investigation.lineName} — Action Required`}
                  </div>
                  <div className="text-[12px] text-[#7A5E0B]">
                    {isHero ? 'Action required to prevent further scrap' : 'No work order dispatched yet'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleCreateTask(primaryRec)}
                disabled={isMutationPending(`createActionTaskFromRecommendation:${primaryRec.id}`)}
                className="h-8 px-3.5 text-[12px] font-semibold text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>{isMutationPending(`createActionTaskFromRecommendation:${primaryRec.id}`) ? 'Dispatching...' : '1-Click Dispatch Order'}</span>
              </button>
            </div>
          )}

          {/* B. The Core Problem: Compact 2-Tile Financial & Throughput Impact */}
          <div>
            <div className="text-[12px] font-bold uppercase tracking-wider text-[#5F6875] mb-2">
              Operational & Financial Impact
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-[#FECDCA] bg-[#FEF3F2]/40">
                <div className="text-[12px] font-medium text-[#5F6875] flex items-center justify-between">
                  <span>Output Variance</span>
                  <TrendingDown className="w-3.5 h-3.5 text-[#D92D20]" />
                </div>
                <div className="text-[20px] font-bold text-[#D92D20] mt-1 font-mono">
                  {investigation.outputVariancePct}%
                </div>
                <div className="text-[12px] text-[#D92D20] mt-0.5 font-medium">
                  {isHero ? '4,380 / 5,400 bph (-1,020 bph)' : 'vs planned target'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-[#FEDF89] bg-[#FFFBF5]">
                <div className="text-[12px] font-medium text-[#5F6875]">Run-Rate Financial Loss</div>
                <div className="text-[20px] font-bold text-[#B54708] mt-1 font-mono">
                  ${formatNumber(investigation.businessImpact?.currentLossRatePerHour ?? 0)}/hr
                </div>
                <div className="text-[12px] text-[#7A5E0B] mt-0.5">
                  {formatCurrency(investigation.businessImpact?.estimatedRevenueLoss ?? 0)} shift loss
                </div>
              </div>
            </div>
          </div>

          {/* C. Primary Root Cause Synthesis (#1 Cause Only) */}
          <div className="p-4 rounded-xl border border-[#D9E4FF] bg-[#F8FAFF]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#18202A]">
                <Sparkles className="w-4 h-4 text-[#2F5BFF]" />
                <span>Primary Root Cause (Rank #1)</span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#EEF3FF] text-[#2F5BFF] border border-[#C7D7FE]">
                {investigation.rootCauses[0]?.confidence ?? 0}% Confidence
              </span>
            </div>

            <p className="text-[13px] font-medium text-[#18202A] leading-relaxed">
              {investigation.rootCauses[0]?.title ?? 'No root cause on record'}
            </p>

            {/* Quick Evidence Bullets — the hero scenario's exact telemetry readout is narrative
                detail with no generic equivalent fields; other investigations render their own
                real evidence array instead of inheriting the hero's numbers. */}
            {isHero ? (
              <div className="mt-3 pt-3 border-t border-[#D9E4FF] grid grid-cols-2 gap-2 text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D92D20]" />
                  <span className="text-[#5F6875]">Vibration:</span>
                  <strong className="text-[#18202A] font-mono">3.31 mm/s (+38%)</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D92D20]" />
                  <span className="text-[#5F6875]">Dosing Cycle:</span>
                  <strong className="text-[#18202A] font-mono">0.82s (+22%)</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E56B00]" />
                  <span className="text-[#5F6875]">Manifold Pressure:</span>
                  <strong className="text-[#18202A] font-mono">2.45 bar (-21%)</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E56B00]" />
                  <span className="text-[#5F6875]">Raw Milk Lot:</span>
                  <strong className="text-[#18202A] font-mono">#904 (+8.4% cP)</strong>
                </div>
              </div>
            ) : (
              <div className="mt-3 pt-3 border-t border-[#D9E4FF] grid grid-cols-2 gap-2 text-[12px]">
                {investigation.evidence.slice(0, 4).map((ev) => (
                  <div key={ev.id} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2F5BFF]" />
                    <span className="text-[#5F6875] truncate">{ev.metric || ev.title}:</span>
                    <strong className="text-[#18202A] font-mono shrink-0">{ev.delta}</strong>
                  </div>
                ))}
              </div>
            )}

            {investigation.rootCauses.length > 1 && (
              <div className="mt-3 pt-2 text-[12px] text-[#2F5BFF] flex items-center justify-between">
                <button
                  onClick={handleOpenFullWorkbench}
                  className="hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <span>+ View {investigation.rootCauses.length - 1} secondary factor{investigation.rootCauses.length - 1 > 1 ? 's' : ''} in Full Workbench</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* D. Single Primary Action Recommendation (Zero Decision Paralysis) */}
          <div className="p-4 rounded-xl border border-[#E4E7EB] bg-white shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#2F5BFF]" />
                <span className="text-[13px] font-bold text-[#18202A]">
                  Recommended {primaryRec.owner} Action
                </span>
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                  primaryRec.priority === 'Critical'
                    ? 'text-[#D92D20] bg-[#FEF3F2] border-[#FECDCA]'
                    : primaryRec.priority === 'High'
                    ? 'text-[#E56B00] bg-[#FFF6ED] border-[#FEDF89]'
                    : 'text-[#5F6875] bg-[#F2F4F7] border-[#E4E7EB]'
                }`}
              >
                {primaryRec.priority} Priority
              </span>
            </div>

            <h4 className="text-[14px] font-semibold text-[#18202A]">
              {primaryRec.title}
            </h4>
            <p className="text-[12px] text-[#5F6875] mt-1 leading-[18px]">
              {primaryRec.reason}
            </p>

            <div className="mt-3 pt-3 border-t border-[#E4E7EB] flex items-center justify-between gap-3">
              <div className="text-[12px] text-[#18864B] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Target: {primaryRec.expectedImpact}</span>
              </div>

              {!isResolved && !linkedTask && (
                <button
                  onClick={() => handleCreateTask(primaryRec)}
                  disabled={isMutationPending(`createActionTaskFromRecommendation:${primaryRec.id}`)}
                  className="h-8 px-3.5 text-[12px] font-semibold text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>{isMutationPending(`createActionTaskFromRecommendation:${primaryRec.id}`) ? 'Dispatching...' : 'Dispatch Work Order'}</span>
                </button>
              )}

              {linkedTask && !isResolved && (
                <span className="h-8 px-3 text-[12px] font-medium text-[#18864B] bg-[#EDFDF2] border border-[#A6F4C5] rounded-lg flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Dispatched to {linkedTask.assignedTo}</span>
                </span>
              )}

              {isResolved && (
                <span className="h-8 px-3 text-[12px] font-medium text-[#18864B] bg-[#EDFDF2] border border-[#A6F4C5] rounded-lg flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Work Order Completed</span>
                </span>
              )}
            </div>
          </div>

        </div>

        {/* 4. Streamlined Persistent Drawer Footer */}
        <div className="p-3.5 px-6 border-t border-[#E4E7EB] bg-white flex items-center justify-between shrink-0">
          <button
            onClick={closeInvestigationDrawer}
            className="h-9 px-4 text-[13px] font-semibold text-[#5F6875] hover:text-[#18202A] hover:bg-[#F1F3F5] rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={handleOpenFullWorkbench}
            className="h-9 px-4 text-[13px] font-semibold text-[#18202A] bg-white hover:bg-[#F7F8FA] border border-[#D0D5DD] rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <span>Open Full Workbench</span>
            <ExternalLink className="w-4 h-4 text-[#5F6875]" />
          </button>
        </div>

      </div>
    </div>
  );
}
