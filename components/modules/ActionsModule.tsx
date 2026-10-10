'use client';

import React, { useState } from 'react';
import { useFactory } from '@/lib/factoryStore';
import {
  CheckSquare,
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { ActionTask } from '@/lib/types';

export function ActionsModule() {
  const {
    actionTasks,
    updateTaskStatus,
    completeTaskWithOutcome,
    setActiveTab,
    openInvestigation,
  } = useFactory();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [completeModalTask, setCompleteModalTask] = useState<ActionTask | null>(null);
  const [actualResult, setActualResult] = useState('Recovered 920 units/hour. Valve M-03-V2 inspected, worn elastomer diaphragm replaced, recalibrated stroke pressure.');
  const [resolutionNotes, setResolutionNotes] = useState('Diaphragm seal kit replaced by Carlos Ruiz. Post-repair stroke test showed cycle time normalized to 1.82s and manifold vibration dropped to 2.15 mm/s.');
  const [recoveredUnitsPerHour, setRecoveredUnitsPerHour] = useState<number>(920);

  const filteredTasks = actionTasks.filter((t) => {
    if (filterStatus === 'all') return true;
    return t.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const handleOpenCompleteModal = (task: ActionTask) => {
    setCompleteModalTask(task);
    if (task.investigationId === 'inv-line3-hero') {
      setActualResult('Recovered 920 units/hour. Valve M-03-V2 diaphragm replaced & stroke recalibrated.');
      setResolutionNotes('Elastomer diaphragm kit replaced. Manifold pressure returned to 3.1 bar, vibration normalized to 2.15 mm/s.');
      setRecoveredUnitsPerHour(920);
    } else {
      setActualResult('Task verified and signed off by lead technician.');
      setResolutionNotes('Standard operational procedure executed.');
      setRecoveredUnitsPerHour(0);
    }
  };

  const handleConfirmCompletion = () => {
    if (!completeModalTask) return;
    completeTaskWithOutcome(
      completeModalTask.id,
      actualResult,
      resolutionNotes,
      recoveredUnitsPerHour
    );
    setCompleteModalTask(null);
  };

  return (
    <div className="space-y-8">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[13px] font-medium text-[#5F6875] mb-1">
            Operational Work Queue
          </div>
          <h1 className="text-[32px] leading-[40px] font-semibold text-[#18202A]">
            Action Center
          </h1>
          <p className="text-[15px] leading-[24px] text-[#5F6875] mt-2">
            Track corrective tasks, assign maintenance technicians, and verify resolution outcomes.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {['all', 'pending', 'assigned', 'in progress', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`h-10 px-4 text-[14px] rounded-lg capitalize transition-colors font-medium ${
                filterStatus === st
                  ? 'bg-[#EEF3FF] text-[#2F5BFF]'
                  : 'bg-white text-[#5F6875] border border-[#E4E7EB] hover:bg-[#F7F8FA]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Loop Banner */}
      <div className="card-ai flex items-start gap-4">
        <Sparkles className="w-5 h-5 text-[#2F5BFF] shrink-0 mt-0.5" />
        <div className="text-[14px] leading-[22px] text-[#18202A]">
          <strong className="text-[#2F5BFF]">Closed-Loop Verification: </strong>
          When an operational task is marked <strong>Completed</strong>, FactoryLens records the actual recovered units, automatically resolves the linked AI investigation, and updates line performance on the dashboard.
        </div>
      </div>

      {/* Task List Cards */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="py-20 text-center text-[#5F6875] card-base">
            <CheckSquare className="w-8 h-8 mx-auto mb-2 text-[#8A93A0]" />
            <p className="text-[16px] font-semibold text-[#18202A]">No active tasks in this view</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'Completed';
            const isHeroTask = task.investigationId === 'inv-line3-hero';
            return (
              <div
                key={task.id}
                className={`card-base transition-all ${
                  isCompleted
                    ? 'border-[#A6F4C5] bg-[#F6FEF9]'
                    : isHeroTask
                    ? 'border-[#D9E4FF] bg-white'
                    : 'border-[#E4E7EB] bg-white'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Task Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span
                        className={`h-7 px-2.5 rounded-[6px] text-[13px] font-medium inline-flex items-center ${
                          task.priority === 'Critical'
                            ? 'bg-[#FEF3F2] text-[#D92D20]'
                            : task.priority === 'High'
                            ? 'bg-[#FFF6ED] text-[#E56B00]'
                            : 'bg-[#F1F3F5] text-[#5F6875]'
                        }`}
                      >
                        {task.priority}
                      </span>
                      <h3 className="text-[16px] font-semibold text-[#18202A]">
                        {task.title}
                      </h3>
                      <span
                        className={`h-7 px-2.5 rounded-[6px] text-[13px] font-medium inline-flex items-center ml-auto lg:ml-0 ${
                          isCompleted
                            ? 'bg-[#EDFDF2] text-[#18864B]'
                            : task.status === 'In Progress'
                            ? 'bg-[#EEF3FF] text-[#2F5BFF]'
                            : 'bg-[#FEF7E6] text-[#B78103]'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>

                    <p className="text-[14px] leading-[22px] text-[#5F6875]">
                      {task.description}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-[13px] text-[#5F6875]">
                      <span>Area: <strong className="text-[#18202A]">{task.lineName} · {task.machineName}</strong></span>
                      <span>·</span>
                      <span>Owner: <strong className="text-[#18202A]">{task.assignedTo}</strong> ({task.assignedRole})</span>
                      <span>·</span>
                      <span>Due: <strong className="text-[#18202A]">{task.dueDate}</strong></span>
                      {task.investigationId && (
                        <>
                          <span>·</span>
                          <button
                            onClick={() => {
                              openInvestigation(task.investigationId, 'actions');
                            }}
                            className="text-[#2F5BFF] hover:underline font-medium flex items-center gap-1"
                          >
                            <span>Linked Investigation</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* If Completed, show resolution summary */}
                    {isCompleted && task.actualResult && (
                      <div className="mt-4 p-4 bg-white border border-[#A6F4C5] rounded-lg text-[14px] text-[#18864B] space-y-1">
                        <div>
                          <strong>Outcome Result:</strong> {task.actualResult}
                        </div>
                        {task.resolutionNotes && (
                          <div className="text-[13px] text-[#5F6875]">
                            <strong>Notes:</strong> {task.resolutionNotes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#E4E7EB]">
                    {!isCompleted ? (
                      <>
                        {task.status !== 'In Progress' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'In Progress')}
                            className="h-10 px-4 text-[14px] font-medium text-[#18202A] bg-white hover:bg-[#F7F8FA] border border-[#E4E7EB] rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Play className="w-3.5 h-3.5 text-[#5F6875]" />
                            <span>Mark In Progress</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenCompleteModal(task)}
                          className="h-10 px-4 text-[14px] font-medium text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-lg transition-colors shadow-sm flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Complete & Log Outcome</span>
                        </button>
                      </>
                    ) : (
                      <div className="h-10 px-4 rounded-lg bg-[#EDFDF2] text-[14px] text-[#18864B] font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Completed & Verified</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Completion Modal */}
      {completeModalTask && (
        <div className="fixed inset-0 z-50 bg-[#18202A]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-[#E4E7EB] w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E4E7EB] flex items-center justify-between">
              <h3 className="text-[18px] font-semibold text-[#18202A]">
                Record Action Outcome
              </h3>
              <button
                onClick={() => setCompleteModalTask(null)}
                className="text-[#8A93A0] hover:text-[#18202A] text-[18px]"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-[14px]">
              <div>
                <span className="text-[13px] text-[#5F6875]">Task</span>
                <div className="font-semibold text-[#18202A] text-[16px] mt-0.5">{completeModalTask.title}</div>
                <div className="text-[13px] text-[#5F6875] mt-0.5">{completeModalTask.lineName} · {completeModalTask.machineName}</div>
              </div>

              <div className="p-3 bg-[#F7F8FA] rounded-lg border border-[#E4E7EB]">
                <div className="text-[13px] text-[#5F6875]">Expected Impact</div>
                <div className="text-[14px] font-medium text-[#18202A] mt-0.5">
                  {completeModalTask.expectedImpact || 'Recover planned throughput'}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#18202A] mb-1">
                  Actual Result (Recovered Output / Inspection Verification)
                </label>
                <input
                  type="text"
                  value={actualResult}
                  onChange={(e) => setActualResult(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#E4E7EB] rounded-lg text-[#18202A] focus:outline-none focus:border-[#2F5BFF]"
                />
              </div>

              {completeModalTask.investigationId === 'inv-line3-hero' && (
                <div>
                  <label className="block text-[13px] font-medium text-[#18202A] mb-1">
                    Recovered Production Rate (Units / Hour)
                  </label>
                  <input
                    type="number"
                    value={recoveredUnitsPerHour}
                    onChange={(e) => setRecoveredUnitsPerHour(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-white border border-[#E4E7EB] rounded-lg font-semibold text-[#18202A] focus:outline-none focus:border-[#2F5BFF]"
                  />
                  <p className="text-[13px] text-[#5F6875] mt-1">Target is 5,000 units/hr. Line 3 will update to 4,940 units/hr.</p>
                </div>
              )}

              <div>
                <label className="block text-[13px] font-medium text-[#18202A] mb-1">
                  Technician Resolution Notes
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full p-3 bg-white border border-[#E4E7EB] rounded-lg text-[#18202A] focus:outline-none focus:border-[#2F5BFF] resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#E4E7EB] flex items-center justify-end gap-3 bg-[#F7F8FA]">
              <button
                onClick={() => setCompleteModalTask(null)}
                className="h-10 px-4 text-[14px] text-[#5F6875] hover:text-[#18202A] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCompletion}
                className="h-10 px-4 text-[14px] font-medium text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-lg shadow-sm"
              >
                Confirm Completion & Close Investigation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
