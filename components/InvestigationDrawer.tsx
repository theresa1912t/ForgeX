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
  Cpu,
  ArrowRight,
  ShieldCheck,
  Flame,
  Check,
  ClipboardList,
  Wrench,
  Activity,
  Layers,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/calculations';
import { RecommendedAction } from '@/lib/types';

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
    showToast,
    isMutationPending,
  } = useFactory();

  if (!investigationDrawerOpen) return null;

  const invId = activeDrawerInvestigationId || 'inv-line3-hero';
  const investigation = investigations[invId] || investigations['inv-line3-hero'];

  if (!investigation) return null;

  const isResolved = investigation.status === 'Resolved';
  const linkedTask = actionTasks.find(
    (t) => t.investigationId === investigation.id || t.alertId === 'alt-line3-loss'
  );

  const handleApprove = (rec: RecommendedAction) => {
    approveRecommendation(investigation.id, rec.id);
    showToast(`Approved recommendation: "${rec.title}"`, 'success');
  };

  const handleCreateTask = (rec: RecommendedAction) => {
    const assignee = rec.owner === 'Maintenance' ? 'Tom Reynolds' : 'Sarah Jenkins';
    const dueDate = 'Today (Within 45 mins)';
    createActionTaskFromRecommendation(investigation.id, rec, assignee, dueDate);
    showToast(`Created work order for ${assignee}: "${rec.title}"`, 'success');
  };

  const handleOpenFullWorkbench = () => {
    openInvestigation(investigation.id, 'dashboard');
    closeInvestigationDrawer();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#18202A]/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-[640px] bg-white h-full shadow-2xl flex flex-col border-l border-[#E4E7EB] animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-[#E4E7EB] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span
              className={`h-7 px-2.5 rounded-[6px] text-[13px] font-medium inline-flex items-center ${
                isResolved
                  ? 'bg-[#EDFDF2] text-[#18864B]'
                  : 'bg-[#FEF3F2] text-[#D92D20]'
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
            <span className="text-[13px] font-medium text-[#5F6875]">
              {investigation.lineName} · {investigation.machineName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenFullWorkbench}
              className="h-8 px-2.5 text-[13px] font-medium text-[#2F5BFF] hover:bg-[#EEF3FF] rounded-md transition-colors flex items-center gap-1.5"
              title="Open full interactive workbench view"
            >
              <span>Full Workbench</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={closeInvestigationDrawer}
              className="p-1.5 text-[#8A93A0] hover:text-[#18202A] hover:bg-[#F1F3F5] rounded-md transition-colors"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Title & Meta Banner */}
        <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E4E7EB] shrink-0">
          <div className="text-[12px] font-semibold uppercase tracking-wider text-[#2F5BFF] flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            AI Root-Cause Diagnosis
          </div>
          <h2 className="text-[20px] font-semibold text-[#18202A] leading-snug">
            {investigation.title}
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[13px] text-[#5F6875]">
            <span>Product: <strong className="text-[#18202A]">{investigation.productName}</strong></span>
            <span>Shift: <strong className="text-[#18202A]">{investigation.shift}</strong></span>
            <span>Triggered: <strong className="text-[#18202A]">{investigation.startTime}</strong></span>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Shift Supervisor Incident Progression Banner */}
          {isResolved ? (
            <div className="p-4 rounded-xl border border-[#A6F4C5] bg-[#EDFDF2]/80">
              <div className="flex items-center gap-2 text-[14px] font-semibold text-[#18864B] mb-1">
                <CheckCircle2 className="w-5 h-5 text-[#18864B]" />
                <span>Incident Resolved & Line 3 Speed Recovered</span>
              </div>
              <p className="text-[13px] text-[#18864B] leading-relaxed">
                Filling valve M-03-V2 diaphragm replaced. Output has successfully recovered to <strong>5,380 bottles/hr</strong> (+1,000 bottles/hr recovered).
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
                    setActiveTab('actions');
                  }}
                  className="h-8 px-3 text-[12px] font-semibold text-[#2F5BFF] hover:bg-[#EEF3FF] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>View Completed Action in Action Center</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : linkedTask ? (
            <div className="p-4 rounded-xl border border-[#A6F4C5] bg-[#F6FEF9]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-[#18864B]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Work Order Dispatched: {linkedTask.title}</span>
                </div>
                <span className="text-[12px] text-[#5F6875] font-medium">Assigned: {linkedTask.assignedTo}</span>
              </div>
              <p className="text-[13px] text-[#5F6875] mb-3 leading-relaxed">
                Maintenance technician has been dispatched. After replacing the EPDM aseptic diaphragm kit on Filler M-03, complete the fix below to restore line speed live on the dashboard.
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => {
                    completeTaskWithOutcome(
                      linkedTask.id,
                      'Valve #4 diaphragm replaced. Mechanical stroke returned to nominal resistance.',
                      'Completed replacement under +0.2 bar backpressure test. Output normalized.',
                      1000
                    );
                    showToast('Maintenance marked complete. Line 3 speed restored to 5,380 bottles/hr!', 'success');
                  }}
                  disabled={isMutationPending(`completeTaskWithOutcome:${linkedTask.id}`)}
                  className="h-8 px-3 text-[12px] font-semibold text-white bg-[#18864B] hover:bg-[#157340] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isMutationPending(`completeTaskWithOutcome:${linkedTask.id}`) ? 'Completing...' : 'Complete Maintenance & Restore Speed'}</span>
                </button>

                <button
                  onClick={() => {
                    closeInvestigationDrawer();
                    setActiveTab('materials');
                    showToast('Navigated to Materials. Use "Log Scrap Entry" to record rejected units.', 'info');
                  }}
                  className="h-8 px-3 text-[12px] font-semibold text-[#18202A] bg-white border border-[#D0D5DD] hover:bg-[#F7F8FA] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 text-[#D92D20]" />
                  <span>Log Scrap Rejects for this Incident</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-[#FEDF89] bg-[#FFFCF5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-[13px] font-semibold text-[#B54708]">
                  <AlertTriangle className="w-4 h-4 text-[#B54708]" />
                  <span>Line 3 Speed Loss Alert: Immediate Action Required</span>
                </div>
                <p className="text-[12px] text-[#7A5E0B] mt-0.5">
                  Review the mechanical root cause and dispatch a work order to maintenance to prevent further scrap.
                </p>
              </div>
              <button
                onClick={() => {
                  const rec = investigation.recommendations[0];
                  if (rec) {
                    handleCreateTask(rec);
                  }
                }}
                disabled={Boolean(investigation.recommendations[0]) && isMutationPending(`createActionTaskFromRecommendation:${investigation.recommendations[0]?.id}`)}
                className="h-8 px-3 text-[12px] font-semibold text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap self-start sm:self-auto disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>
                  {investigation.recommendations[0] && isMutationPending(`createActionTaskFromRecommendation:${investigation.recommendations[0].id}`)
                    ? 'Dispatching...'
                    : '1-Click Dispatch Order'}
                </span>
              </button>
            </div>
          )}

          {/* 1. Financial & Output Impact Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-[#FECDCA] bg-[#FEF3F2]/40">
              <div className="text-[12px] font-medium text-[#5F6875]">Revenue at Risk</div>
              <div className="text-[20px] font-semibold text-[#D92D20] mt-1">
                {formatCurrency(investigation.businessImpact?.estimatedRevenueLoss || 4650)}
              </div>
              <div className="text-[12px] text-[#D92D20] mt-0.5 font-medium">
                ${investigation.businessImpact?.currentLossRatePerHour || 1400}/hr burn rate
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E4E7EB] bg-white">
              <div className="text-[12px] font-medium text-[#5F6875]">Throughput Deficit</div>
              <div className="text-[20px] font-semibold text-[#18202A] mt-1">
                {investigation.outputVariancePct}%
              </div>
              <div className="text-[12px] text-[#5F6875] mt-0.5">
                -{formatNumber(investigation.businessImpact?.lostUnits || 3720)} units total
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-[#D9E4FF] bg-[#EEF3FF]/40">
              <div className="text-[12px] font-medium text-[#5F6875]">AI Confidence</div>
              <div className="text-[20px] font-semibold text-[#2F5BFF] mt-1">
                {investigation.rootCauses[0]?.confidence || 94}%
              </div>
              <div className="text-[12px] text-[#2F5BFF] mt-0.5 font-medium">
                High Multi-Factor Match
              </div>
            </div>
          </div>

          {/* 2. Primary Root Cause Summary */}
          <div className="p-4 rounded-xl border border-[#D9E4FF] bg-[#F8FAFF]">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#2F5BFF]" />
              <span className="text-[14px] font-semibold text-[#18202A]">
                Primary Root Cause
              </span>
              <span className="ml-auto text-[12px] font-semibold px-2 py-0.5 rounded bg-[#EEF3FF] text-[#2F5BFF]">
                Rank #1
              </span>
            </div>
            <p className="text-[14px] leading-[22px] text-[#18202A]">
              {investigation.rootCauses[0]?.summary ||
                'Mechanical wear in the filling nozzle diaphragm is generating excessive resistance during stroke return.'}
            </p>
            <div className="mt-3 pt-3 border-t border-[#D9E4FF] text-[13px] text-[#5F6875] flex items-center justify-between">
              <span>Historical match: 3 similar incidents in past 180 days</span>
              <span className="font-medium text-[#2F5BFF]">94% Confidence</span>
            </div>
          </div>

          {/* 3. Real-Time Telemetry & Evidence Signals */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-semibold text-[#18202A] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#2F5BFF]" />
                <span>Machine Sensor & Quality Telemetry</span>
              </h3>
              <span className="text-[12px] text-[#5F6875]">Live stream verification</span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl border border-[#FECDCA] bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FEF3F2] text-[#D92D20] flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-[#18202A]">
                      Filling Valve Vibration (M-03)
                    </div>
                    <div className="text-[12px] text-[#5F6875]">
                      Expected: 1.8 - 2.4 mm/s · Threshold: 3.5 mm/s
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[16px] font-semibold text-[#D92D20]">4.82 mm/s</div>
                  <div className="text-[12px] font-medium text-[#D92D20]">+128% spike</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-[#FEDF89] bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FFF6ED] text-[#E56B00] flex items-center justify-center shrink-0">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-[#18202A]">
                      Nozzle Block Temperature
                    </div>
                    <div className="text-[12px] text-[#5F6875]">
                      Target: 72.0°C · Upper tolerance: 78.0°C
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[16px] font-semibold text-[#E56B00]">84.2°C</div>
                  <div className="text-[12px] font-medium text-[#E56B00]">+12.2°C excess</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E4E7EB] bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F1F3F5] text-[#5F6875] flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-[#18202A]">
                      Raw Milk Lot #LOT-RAW-904 Viscosity & Solids
                    </div>
                    <div className="text-[12px] text-[#5F6875]">
                      Spec: 1.8 - 2.1 cP · Observed: 2.28 cP
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[16px] font-semibold text-[#18202A]">2.28 cP</div>
                  <div className="text-[12px] text-[#8A93A0]">+8.4% deviation</div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Actionable Recommendations */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-semibold text-[#18202A] flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#2F5BFF]" />
                <span>Recommended Operational Actions</span>
              </h3>
              <span className="text-[12px] text-[#5F6875]">Verified mitigations</span>
            </div>

            <div className="space-y-3">
              {investigation.recommendations.map((rec) => {
                const isApproved = rec.status === 'Approved' || rec.status === 'Task Created';
                const isTaskCreated = rec.status === 'Task Created';

                return (
                  <div
                    key={rec.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isTaskCreated
                        ? 'border-[#A6F4C5] bg-[#F6FEF9]'
                        : isApproved
                        ? 'border-[#D9E4FF] bg-[#F8FAFF]'
                        : 'border-[#E4E7EB] bg-white hover:border-[#D0D5DD]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[12px] font-medium px-2 py-0.5 rounded ${
                            rec.priority === 'Critical'
                              ? 'bg-[#FEF3F2] text-[#D92D20]'
                              : 'bg-[#FFF6ED] text-[#E56B00]'
                          }`}
                        >
                          {rec.priority}
                        </span>
                        <span className="text-[13px] text-[#5F6875] font-medium">
                          Team: {rec.owner}
                        </span>
                      </div>
                      <span className="text-[12px] text-[#5F6875]">
                        Effort: {rec.estimatedEffort}
                      </span>
                    </div>

                    <div className="text-[15px] font-semibold text-[#18202A] mt-1">
                      {rec.title}
                    </div>
                    <div className="text-[13px] text-[#5F6875] mt-1 leading-[20px]">
                      {rec.reason}
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#E4E7EB] flex items-center justify-between gap-3">
                      <div className="text-[12px] text-[#18864B] font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Expected: {rec.expectedImpact}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isTaskCreated ? (
                          <span className="h-8 px-3 rounded-lg bg-[#EDFDF2] text-[#18864B] text-[13px] font-medium inline-flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5" />
                            Work Order Created
                          </span>
                        ) : isApproved ? (
                          <button
                            onClick={() => handleCreateTask(rec)}
                            disabled={isMutationPending(`createActionTaskFromRecommendation:${rec.id}`)}
                            title="Generate and dispatch an official Work Order ticket to the maintenance team"
                            className="h-8 px-3 text-[13px] font-medium text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <ClipboardList className="w-3.5 h-3.5" />
                            <span>{isMutationPending(`createActionTaskFromRecommendation:${rec.id}`) ? 'Dispatching...' : 'Dispatch Work Order'}</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(rec)}
                              disabled={isMutationPending(`approveRecommendation:${rec.id}`)}
                              title="Sign off and validate this AI mitigation as official SOP"
                              className="h-8 px-3 text-[13px] font-medium text-[#2F5BFF] bg-[#EEF3FF] hover:bg-[#D9E4FF] rounded-lg transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {isMutationPending(`approveRecommendation:${rec.id}`) ? 'Approving...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleCreateTask(rec)}
                              disabled={isMutationPending(`createActionTaskFromRecommendation:${rec.id}`)}
                              title="Approve and immediately dispatch an official Work Order to the maintenance team"
                              className="h-8 px-3 text-[13px] font-medium text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              <ClipboardList className="w-3.5 h-3.5" />
                              <span>{isMutationPending(`createActionTaskFromRecommendation:${rec.id}`) ? 'Dispatching...' : 'Assign Work Order'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Persistent Drawer Footer */}
        <div className="p-4 px-6 border-t border-[#E4E7EB] bg-white flex items-center justify-between shrink-0">
          <button
            onClick={closeInvestigationDrawer}
            className="h-10 px-4 text-[14px] font-medium text-[#5F6875] hover:text-[#18202A] hover:bg-[#F1F3F5] rounded-lg transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenFullWorkbench}
              className="h-10 px-4 text-[14px] font-medium text-[#18202A] bg-white hover:bg-[#F7F8FA] border border-[#E4E7EB] rounded-lg transition-colors flex items-center gap-2"
            >
              <span>Full Screen Workbench</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                investigation.recommendations.forEach((rec) => {
                  if (rec.status === 'Pending') {
                    approveRecommendation(investigation.id, rec.id);
                  }
                });
                showToast('All recommended mitigations approved successfully', 'success');
              }}
              disabled={investigation.recommendations.some(
                (rec) => rec.status === 'Pending' && isMutationPending(`approveRecommendation:${rec.id}`)
              )}
              className="h-10 px-4 text-[14px] font-medium text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-lg transition-colors flex items-center gap-2 shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {investigation.recommendations.some(
                  (rec) => rec.status === 'Pending' && isMutationPending(`approveRecommendation:${rec.id}`)
                )
                  ? 'Approving...'
                  : 'Approve All Fixes'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
