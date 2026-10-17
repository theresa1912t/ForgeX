'use client';

import React from 'react';
import { useFactory } from '@/lib/factoryStore';
import {
  X,
  Sparkles,
  AlertOctagon,
  CheckCircle2,
  ExternalLink,
  Wrench,
  TrendingDown,
  ClipboardList,
  RotateCcw,
  Check,
  Clock,
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
    createActionTaskFromRecommendation,
    completeTaskWithOutcome,
    actionTasks,
    showToast,
    resetDemoToHeroState,
  } = useFactory();

  if (!investigationDrawerOpen) return null;

  const invId = activeDrawerInvestigationId || 'inv-line3-hero';
  const investigation = investigations[invId] || investigations['inv-line3-hero'];

  if (!investigation) return null;

  const isResolved = investigation.status === 'Resolved';
  const linkedTask = actionTasks.find(
    (t) => t.investigationId === investigation.id || t.alertId === 'alt-line3-loss'
  );
  const isTaskDispatched = Boolean(linkedTask);

  const primaryRec = investigation.recommendations?.[0] || {
    id: 'rec-1',
    investigationId: investigation.id,
    title: 'Inspect filling valve M-03-V2 & replace worn diaphragm seal',
    reason: 'Mechanical wear on elastomer diaphragm head #4/#8 is causing fluid throttling, pressure drop, and vibration.',
    priority: 'Critical',
    owner: 'Maintenance',
    estimatedEffort: '30 minutes',
    expectedImpact: 'Recover 1,000 bottles/hr (~$1,683/hr revenue)',
    evidence: 'Vibration +38%, cycle time +22%',
    status: 'Pending',
  };

  const handleQuickDispatch = () => {
    createActionTaskFromRecommendation(
      investigation.id,
      primaryRec,
      'Carlos Ruiz',
      'Today (Within 45 mins)'
    );
    showToast('Work order dispatched to Carlos Ruiz', 'success');
  };

  const handleQuickComplete = () => {
    const taskId = linkedTask?.id || 'tsk-line3-filler';
    completeTaskWithOutcome(
      taskId,
      'Valve #4 diaphragm replaced. Mechanical stroke returned to nominal resistance.',
      'Completed replacement under +0.2 bar backpressure test. Output normalized to 5,380 bph.',
      1000
    );
    showToast('Line 3 speed fully restored to 5,380 bottles/hr!', 'success');
  };

  const handleOpenFullWorkbench = () => {
    openInvestigation(investigation.id, 'dashboard');
    closeInvestigationDrawer();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-[540px] bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-250">
        
        {/* 1. Header Bar with Status */}
        <div className="px-6 py-3.5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span
              className={`h-6 px-2.5 rounded-md text-[12px] font-semibold inline-flex items-center gap-1.5 ${
                isResolved
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {isResolved ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Resolved &amp; Restored</span>
                </>
              ) : (
                <>
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>Active Incident</span>
                </>
              )}
            </span>
            <span className="text-[12px] text-slate-500 font-medium">
              Line 3 · Filler M-03
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleOpenFullWorkbench}
              className="h-8 px-2.5 text-[12px] font-semibold text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
              title="Open full workbench view"
            >
              <span>Full View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={closeInvestigationDrawer}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Title & Context */}
        <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 shrink-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Root-Cause Diagnosis
          </div>
          <h2 className="text-[17px] font-bold text-slate-900 leading-snug">
            {investigation.title}
          </h2>
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[12px] text-slate-500">
            <span>Product: <strong className="text-slate-800">{investigation.productName}</strong></span>
            <span>·</span>
            <span>Shift: <strong className="text-slate-800">{investigation.shift}</strong></span>
            <span>·</span>
            <span>Deficit: <strong className="text-rose-600">-1,020 bph</strong></span>
          </div>
        </div>

        {/* 3. Linear 3-Step Body (No Clutter, Direct Action) */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          
          {/* A. Problem: Loss & Velocity Gap */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[12px] font-bold uppercase text-slate-500">
              <span>1. Throughput Gap</span>
              <span className="text-rose-600 font-mono font-bold">-18.9% Below Schedule</span>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-[11px] text-slate-500 font-medium">Actual Speed</div>
                <div className={`text-[18px] font-bold font-mono mt-0.5 ${isResolved ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {isResolved ? '5,380 bph' : '4,380 bph'}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Target: 5,400 bph</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-[11px] text-slate-500 font-medium">Financial Burn</div>
                <div className="text-[18px] font-bold font-mono text-amber-700 mt-0.5">
                  {isResolved ? '$0/hr' : `$${formatNumber(investigation.businessImpact?.currentLossRatePerHour || 1683)}/hr`}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {isResolved ? 'Revenue saved' : 'Shift loss accumulating'}
                </div>
              </div>
            </div>
          </div>

          {/* B. Confirmed Root Cause */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase text-blue-800">
                2. Confirmed Root Cause
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                68% Confidence
              </span>
            </div>
            <h4 className="text-[14px] font-bold text-slate-900 leading-snug">
              Aseptic Filling Valve #4 Diaphragm Seal Micro-Tear
            </h4>
            <p className="text-[12px] text-slate-600 leading-relaxed">
              Mechanical wear on valve #4 elastomer diaphragm causes fluid throttling, increased cycle time (+22%), and manifold vibration (+38%).
            </p>
            <div className="pt-2 border-t border-blue-200/60 grid grid-cols-3 gap-2 text-[11px] text-slate-700 font-mono">
              <div className="p-1.5 bg-white/80 rounded border border-blue-100 text-center">
                <span className="text-slate-400 block text-[10px]">Vibration</span>
                <strong className="text-rose-700">3.31 mm/s</strong>
              </div>
              <div className="p-1.5 bg-white/80 rounded border border-blue-100 text-center">
                <span className="text-slate-400 block text-[10px]">Cycle Time</span>
                <strong className="text-rose-700">0.82s (+22%)</strong>
              </div>
              <div className="p-1.5 bg-white/80 rounded border border-blue-100 text-center">
                <span className="text-slate-400 block text-[10px]">Pressure</span>
                <strong className="text-amber-700">2.45 bar</strong>
              </div>
            </div>
          </div>

          {/* C. Direct Action & Resolution Box */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              isResolved
                ? 'bg-emerald-50/70 border-emerald-300'
                : isTaskDispatched
                ? 'bg-amber-50/60 border-amber-300'
                : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                <span>3. Corrective Action</span>
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                  isResolved
                    ? 'bg-emerald-100 text-emerald-800'
                    : isTaskDispatched
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-50 text-blue-700'
                }`}
              >
                {isResolved ? 'Restored' : isTaskDispatched ? 'In Progress' : 'Pending'}
              </span>
            </div>

            <h4 className="text-[14px] font-bold text-slate-900 leading-snug">
              {primaryRec.title}
            </h4>
            <p className="text-[12px] text-slate-600 mt-1 leading-relaxed">
              Assigned: <strong>Carlos Ruiz (Lead Mechanic)</strong> · Expected recovery: <strong>+1,000 bph</strong>
            </p>

            {/* In-place resolution control */}
            <div className="mt-4 pt-3 border-t border-slate-200/80">
              {isResolved ? (
                <div className="space-y-2 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-bold text-[13px]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Speed Restored to 5,380 bph</span>
                  </div>
                  <button
                    onClick={() => {
                      resetDemoToHeroState();
                      showToast('Demo reset to initial bottleneck state.', 'info');
                    }}
                    className="w-full h-8 px-3 text-[12px] font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Replay Investigation</span>
                  </button>
                </div>
              ) : isTaskDispatched ? (
                <div className="space-y-2">
                  <div className="text-[12px] text-amber-800 font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Carlos Ruiz on-site. Replacement seal kit ready.</span>
                  </div>
                  <button
                    onClick={handleQuickComplete}
                    className="w-full h-10 px-4 text-[13px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify Fix &amp; Restore Speed</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleQuickDispatch}
                  className="w-full h-10 px-4 text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>1-Click Dispatch Carlos Ruiz</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 4. Drawer Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[12px] text-slate-500">
          <span>Incident ID: {investigation.id}</span>
          <button
            onClick={handleOpenFullWorkbench}
            className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
          >
            Open Full Workbench →
          </button>
        </div>

      </div>
    </div>
  );
}
