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
  Wrench,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Flame,
  Boxes,
  Cpu,
  ClipboardList,
  RotateCcw,
  Gauge,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/calculations';
import { RecommendedAction } from '@/lib/types';

export function InvestigationsModule() {
  const {
    investigations,
    selectedInvestigationId,
    setSelectedInvestigationId,
    createActionTaskFromRecommendation,
    completeTaskWithOutcome,
    actionTasks,
    setActiveTab,
    previousTab,
    showToast,
    resetDemoToHeroState,
  } = useFactory();

  const currentInv =
    (selectedInvestigationId && investigations[selectedInvestigationId]) ||
    investigations['inv-line3-hero'] ||
    Object.values(investigations)[0];

  const [activeEvidenceTab, setActiveEvidenceTab] = useState<'synthesis' | 'sensors' | 'deep_dive'>('synthesis');
  const [expandedCauseId, setExpandedCauseId] = useState<string>('rc-1');

  if (!currentInv) {
    return (
      <div className="py-24 max-w-xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
          <SearchCode className="w-6 h-6" />
        </div>
        <h2 className="text-[22px] leading-[30px] font-semibold text-slate-900">
          No Active Investigation Selected
        </h2>
        <p className="text-[15px] leading-[24px] text-slate-500">
          Select an active incident from the dashboard or alerts to run root-cause diagnosis.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="h-10 px-4 text-[14px] font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => {
              setSelectedInvestigationId('inv-line3-hero');
              setActiveTab('investigations');
            }}
            className="h-10 px-4 text-[14px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            Open Line 3 Speed Loss Case
          </button>
        </div>
      </div>
    );
  }

  const isResolved = currentInv.status === 'Resolved';
  const { businessImpact } = currentInv;
  const linkedTask = actionTasks.find(
    (t) => t.investigationId === currentInv.id || t.alertId === 'alt-line3-loss'
  );
  const isTaskDispatched = Boolean(linkedTask);

  const primaryRec = currentInv.recommendations?.[0] || {
    id: 'rec-1',
    investigationId: currentInv.id,
    title: 'Inspect filling valve M-03-V2 & replace worn diaphragm seal',
    reason: 'Mechanical wear on elastomer diaphragm head #4/#8 is causing fluid throttling, pressure drop, and vibration.',
    priority: 'Critical',
    owner: 'Maintenance',
    estimatedEffort: '30 minutes',
    expectedImpact: 'Recover 1,000 bottles/hr (~$1,683/hr revenue)',
    evidence: 'Vibration +38%, cycle time +22%',
    status: 'Pending',
  };

  // Direct In-Place Handlers (Zero Tab Bouncing)
  const handleQuickDispatch = () => {
    createActionTaskFromRecommendation(
      currentInv.id,
      primaryRec,
      'Carlos Ruiz',
      'Today (Within 45 mins)'
    );
    showToast('Work order dispatched to Carlos Ruiz (Senior Maintenance Tech)', 'success');
  };

  const handleQuickComplete = () => {
    const taskId = linkedTask?.id || 'tsk-line3-filler';
    completeTaskWithOutcome(
      taskId,
      'Valve #4 diaphragm replaced. Mechanical stroke returned to nominal resistance.',
      'Completed replacement under +0.2 bar backpressure test. Output normalized to 5,380 bph.',
      1000
    );
    showToast('Maintenance verified! Line 3 output fully restored to 5,380 bottles/hr', 'success');
  };

  const handleReset = () => {
    resetDemoToHeroState();
    showToast('Demo reset to initial bottleneck state.', 'info');
  };

  const backDestination = previousTab === 'alerts' ? 'Alerts' : 'Dashboard';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2 text-[14px]">
          <button
            onClick={() => setActiveTab(previousTab || 'dashboard')}
            className="inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {backDestination}</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500">Root-Cause Investigation</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-semibold">{currentInv.lineName} ({currentInv.machineName})</span>
        </div>

        <div className="flex items-center gap-2">
          {isResolved && (
            <button
              onClick={handleReset}
              className="h-8 px-3 text-[12px] font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Reset simulation to re-experience the investigation flow"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Scenario</span>
            </button>
          )}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-[12px] font-medium border border-blue-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Signal Correlation</span>
          </span>
        </div>
      </div>

      {/* 2. Interactive 4-Step Resolution Stepper (Eliminates "Muter-Muter" Confusion) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">
            Resolution Lifecycle
          </span>
          <span className="text-[12px] font-medium text-slate-600">
            {isResolved
              ? 'Status: Problem Resolved & Verified'
              : isTaskDispatched
              ? 'Status: Technician Dispatched · Awaiting Sign-Off'
              : 'Status: Root Cause Identified · Action Required'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
          {/* Step 1: Anomaly Flagged */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[12px] shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-emerald-800 uppercase">Step 1: Detection</div>
              <div className="text-[13px] font-bold text-slate-900 leading-tight">Speed Deficit (-18.9%)</div>
            </div>
          </div>

          {/* Step 2: Diagnosis */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[12px] shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-emerald-800 uppercase">Step 2: Diagnosis</div>
              <div className="text-[13px] font-bold text-slate-900 leading-tight">Valve #4 Diaphragm Seal</div>
            </div>
          </div>

          {/* Step 3: Work Order */}
          <div
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              isResolved || isTaskDispatched
                ? 'bg-emerald-50/60 border-emerald-200'
                : 'bg-blue-50 border-blue-300 ring-2 ring-blue-100'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[12px] shrink-0 ${
                isResolved || isTaskDispatched
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {isResolved || isTaskDispatched ? <Check className="w-4 h-4" /> : '3'}
            </div>
            <div>
              <div
                className={`text-[11px] font-semibold uppercase ${
                  isResolved || isTaskDispatched ? 'text-emerald-800' : 'text-blue-700'
                }`}
              >
                Step 3: Action
              </div>
              <div className="text-[13px] font-bold text-slate-900 leading-tight">
                {isTaskDispatched ? 'Carlos Ruiz Assigned' : 'Dispatch Maintenance'}
              </div>
            </div>
          </div>

          {/* Step 4: Restored */}
          <div
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              isResolved
                ? 'bg-emerald-50/60 border-emerald-200'
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[12px] shrink-0 ${
                isResolved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-300 text-slate-600'
              }`}
            >
              {isResolved ? <Check className="w-4 h-4" /> : '4'}
            </div>
            <div>
              <div
                className={`text-[11px] font-semibold uppercase ${
                  isResolved ? 'text-emerald-800' : 'text-slate-500'
                }`}
              >
                Step 4: Recovery
              </div>
              <div className="text-[13px] font-bold text-slate-900 leading-tight">
                {isResolved ? 'Restored (5,380 bph)' : 'Pending Verification'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. The Linear Triage Core (3 High-Clarity Pillars) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Pillar 1: The Problem (What is happening?) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">
                1. The Problem
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                  isResolved
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {isResolved ? 'Recovered' : 'Critical Deficit'}
              </span>
            </div>

            <h3 className="text-[16px] font-bold text-slate-900 mt-3 leading-snug">
              {currentInv.title}
            </h3>
            <p className="text-[13px] text-slate-500 mt-1">
              Line 3 Aseptic Rotary Filler is running below target speed during the 200ml Almond Milk run.
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-lg space-y-2 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Current Velocity:</span>
                <span className={`font-mono font-bold ${isResolved ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {isResolved ? '5,380 bph (+1,000)' : '4,380 bph (-18.9%)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Target Velocity:</span>
                <span className="font-mono font-semibold text-slate-800">5,400 bph</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Financial Burn Rate:</span>
                <span className="font-mono font-bold text-amber-700">
                  {isResolved ? '$0/hr (Halted)' : `$${formatNumber(businessImpact.currentLossRatePerHour)}/hr`}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-[12px] text-slate-500 flex items-center justify-between">
            <span>Shift Deficit: <strong>{isResolved ? '0 units' : '1,020 units/hr'}</strong></span>
            <span>Shift: <strong>{currentInv.shift}</strong></span>
          </div>
        </div>

        {/* Pillar 2: The Root Cause (Why is it happening?) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">
                2. Confirmed Root Cause
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                68% Confidence · Rank #1
              </span>
            </div>

            <h3 className="text-[16px] font-bold text-slate-900 mt-3 leading-snug">
              Valve #4 Diaphragm Micro-Tear
            </h3>
            <p className="text-[13px] text-slate-600 mt-1 leading-relaxed">
              Elastomer fatigue on rotary valve head #4 prevents full nozzle opening, causing fluid throttling, pressure loss, and vibration.
            </p>

            {/* 3 Core Sensor Proof Items */}
            <div className="mt-4 space-y-2 text-[12px]">
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Vibration (PLC R:102):</span>
                <span className="font-mono font-bold text-rose-700">3.31 mm/s (+38% spike)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Dosing Cycle Time:</span>
                <span className="font-mono font-bold text-rose-700">0.82s (+22% delay)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Manifold Pressure:</span>
                <span className="font-mono font-bold text-amber-700">2.45 bar (-21% drop)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-[12px] text-slate-500 flex items-center justify-between">
            <span>Machine: <strong>Aseptic Filler M-03</strong></span>
            <span>Secondary factor: <strong>Milk Viscosity (+8.4%)</strong></span>
          </div>
        </div>

        {/* Pillar 3: The Action Hub (Everything actionable happens right here!) */}
        <div
          className={`rounded-xl p-5 shadow-xs flex flex-col justify-between border transition-all ${
            isResolved
              ? 'bg-emerald-50/50 border-emerald-300'
              : isTaskDispatched
              ? 'bg-amber-50/40 border-amber-300'
              : 'bg-blue-50/40 border-blue-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
              <span className="text-[12px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                <span>3. Direct Action &amp; Recovery</span>
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                  isResolved
                    ? 'bg-emerald-100 text-emerald-800'
                    : isTaskDispatched
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {isResolved ? 'Resolved' : isTaskDispatched ? 'In Progress' : 'Ready to Dispatch'}
              </span>
            </div>

            <h3 className="text-[16px] font-bold text-slate-900 mt-3 leading-snug">
              {primaryRec.title}
            </h3>
            <p className="text-[13px] text-slate-600 mt-1 leading-relaxed">
              Target: Replace EPDM diaphragm seal kit on Valve M-03-V2. Recover +1,000 bottles/hr ($1,683/hr value).
            </p>

            {/* In-Place Status Display */}
            <div className="mt-4 p-3 bg-white/80 rounded-lg border border-slate-200/80 space-y-1.5 text-[13px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Technician:</span>
                <span className="font-semibold text-slate-900">Carlos Ruiz (Lead Mechanic)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Effort:</span>
                <span className="font-semibold text-slate-900">30 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Expected Result:</span>
                <span className="font-semibold text-emerald-700">+1,000 bph throughput</span>
              </div>
            </div>
          </div>

          {/* Interactive In-Place Action Buttons (Zero Tab Jumps) */}
          <div className="mt-5 pt-3 border-t border-slate-200/60 space-y-2">
            {isResolved ? (
              <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-lg text-center space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-bold text-[13px]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Line 3 Speed Fully Restored</span>
                </div>
                <p className="text-[12px] text-emerald-700">
                  Valve replaced. Velocity restored to 5,380 bph and scrap rates returned to nominal baseline.
                </p>
                <button
                  onClick={handleReset}
                  className="w-full h-8 px-3 text-[12px] font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Replay / Reset Scenario</span>
                </button>
              </div>
            ) : isTaskDispatched ? (
              <div className="space-y-2">
                <div className="text-[12px] text-amber-800 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Carlos Ruiz on-site at Filler M-03. Replacement in progress.</span>
                </div>
                <button
                  onClick={handleQuickComplete}
                  className="w-full h-10 px-4 text-[13px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify Fix &amp; Restore Line Speed</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleQuickDispatch}
                className="w-full h-11 px-4 text-[14px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <ClipboardList className="w-4 h-4" />
                <span>1-Click Dispatch Carlos Ruiz</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* 4. Progressive Evidence & Deep Engineering Proof (Clean, Non-Intrusive) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Evidence Navigation Bar */}
        <div className="px-6 py-3 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-slate-700">Deep Diagnostic Evidence:</span>
            <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-lg">
              <button
                onClick={() => setActiveEvidenceTab('synthesis')}
                className={`px-3 py-1.5 text-[12px] font-semibold rounded-md transition-colors cursor-pointer ${
                  activeEvidenceTab === 'synthesis'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Multi-Signal Triangulation
              </button>
              <button
                onClick={() => setActiveEvidenceTab('sensors')}
                className={`px-3 py-1.5 text-[12px] font-semibold rounded-md transition-colors cursor-pointer ${
                  activeEvidenceTab === 'sensors'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Live Sensor Registers ({currentInv.sensorDeltas?.length || 5})
              </button>
              <button
                onClick={() => setActiveEvidenceTab('deep_dive')}
                className={`px-3 py-1.5 text-[12px] font-semibold rounded-md transition-colors cursor-pointer ${
                  activeEvidenceTab === 'deep_dive'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Root-Cause Ranking &amp; 5-Whys
              </button>
            </div>
          </div>

          <span className="text-[12px] text-slate-500 font-mono">
            Line 3 OT Stream · Sensor Sync Active
          </span>
        </div>

        {/* Tab Content 1: Multi-Signal Synthesis */}
        {activeEvidenceTab === 'synthesis' && (
          <div className="p-6 space-y-4 animate-in fade-in duration-150">
            <p className="text-[13px] text-slate-600 leading-relaxed">
              FactoryLens cross-correlates 3 distinct data pipelines to confirm root cause without false-positive maintenance dispatches:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Signal 1 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Signal 1: Machine OT</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {isResolved ? 'Normalized' : 'Vibration +38%'}
                  </span>
                </div>
                <div className="text-[14px] font-bold text-slate-900">Aseptic Filler M-03</div>
                <p className="text-[12px] text-slate-600 leading-relaxed">
                  Rotary manifold accelerometer detected elevated vibration at <strong>3.31 mm/s</strong>. Dosing cycle stretched to <strong>0.82s (+22%)</strong>.
                </p>
              </div>

              {/* Signal 2 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5" />
                    <span>Signal 2: Raw Ingredients</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Viscosity +8.4%
                  </span>
                </div>
                <div className="text-[14px] font-bold text-slate-900">Milk Lot #LOT-RAW-904</div>
                <p className="text-[12px] text-slate-600 leading-relaxed">
                  Supplier CoA showed raw viscosity at <strong>2.28 cP</strong> (nominal 2.10 cP). Added +0.2 bar backpressure, stressing the already worn diaphragm.
                </p>
              </div>

              {/* Signal 3 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Signal 3: Reject Scale</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {isResolved ? 'Zero Rejects' : '256 Bottles Scrap'}
                  </span>
                </div>
                <div className="text-[14px] font-bold text-slate-900">Checkweigher CW-03</div>
                <p className="text-[12px] text-slate-600 leading-relaxed">
                  Underfill reject bin logged <strong>128 kg ($768)</strong> material waste. Valve throttling prevented complete fill before carousel cutoff.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Sensor Telemetry Registers */}
        {activeEvidenceTab === 'sensors' && (
          <div className="p-6 space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {currentInv.sensorDeltas?.map((sensor, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border ${
                    sensor.isAbnormal && !isResolved
                      ? 'border-rose-200 bg-rose-50/40'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] font-bold text-slate-900 truncate">{sensor.parameter}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        sensor.isAbnormal && !isResolved
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isResolved ? 'Nominal' : sensor.changePct}
                    </span>
                  </div>
                  <div className="text-[12px] space-y-0.5 text-slate-600">
                    <div className="flex justify-between">
                      <span>Baseline:</span>
                      <span className="font-mono text-slate-900">{sensor.baseline}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Observed:</span>
                      <span className={`font-mono ${sensor.isAbnormal && !isResolved ? 'text-rose-700' : 'text-slate-900'}`}>
                        {isResolved ? sensor.baseline : sensor.current}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 3: Ranked Causes & 5-Whys */}
        {activeEvidenceTab === 'deep_dive' && (
          <div className="p-6 space-y-3 animate-in fade-in duration-150">
            {currentInv.rootCauses?.map((cause) => {
              const isExpanded = expandedCauseId === cause.id;
              const isRank1 = cause.rank === 1;

              return (
                <div
                  key={cause.id}
                  className={`border rounded-xl transition-all overflow-hidden ${
                    isRank1 ? 'border-blue-300 bg-blue-50/20' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div
                    onClick={() => setExpandedCauseId(isExpanded ? '' : cause.id)}
                    className="p-4 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[12px] shrink-0 ${
                          isRank1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        #{cause.rank}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-[14px] font-bold text-slate-900">{cause.title}</h4>
                          <span className="text-[11px] font-semibold text-slate-600">({cause.confidence}% confidence)</span>
                        </div>
                        <p className="text-[12px] text-slate-500 mt-0.5">{cause.summary}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-4 pt-2 border-t border-slate-100 bg-white space-y-2 text-[12px]">
                      <div className="font-semibold text-slate-800">Telemetry Validation:</div>
                      <ul className="space-y-1 text-slate-600 list-disc list-inside">
                        {cause.supportingEvidence?.map((ev, i) => (
                          <li key={i}>{ev}</li>
                        ))}
                      </ul>
                      <div className="p-2.5 bg-slate-50 rounded text-slate-600 mt-2">
                        <strong>Precedent:</strong> {cause.historicalPrecedent}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
