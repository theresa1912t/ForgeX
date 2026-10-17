'use client';

import React, { useState } from 'react';
import { useFactory } from '@/lib/factoryStore';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  SearchCode,
  Filter,
  DollarSign,
  Calendar,
  Layers,
  ArrowRight,
  Activity,
  ClipboardList,
  RotateCcw,
  FlaskConical,
} from 'lucide-react';
import { ReportIssueModal } from '@/components/ReportIssueModal';
import { SimulateFailureModal } from '@/components/SimulateFailureModal';

export function AlertsModule() {
  const {
    alerts,
    openInvestigation,
    setSelectedAlertId,
    evaluateThresholds,
    generateInvestigation,
    reopenAlert,
    isMutationPending,
  } = useFactory();

  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);

  const filteredAlerts = alerts.filter((alert) => {
    if (selectedSeverity !== 'all' && alert.severity !== selectedSeverity) return false;
    if (selectedCategory !== 'all' && alert.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && alert.status !== selectedStatus) return false;
    if (
      searchFilter &&
      !alert.title.toLowerCase().includes(searchFilter.toLowerCase()) &&
      !alert.lineName.toLowerCase().includes(searchFilter.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[13px] font-medium text-[#5F6875] mb-1">
            Anomaly & Threshold Monitor
          </div>
          <h1 className="text-[32px] leading-[40px] font-semibold text-[#18202A]">
            Alerts
          </h1>
          <p className="text-[15px] leading-[24px] text-[#5F6875] mt-2">
            Multi-source anomaly triage across equipment, quality, materials, downtime, and energy.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-[14px] text-[#5F6875]">
            Showing <strong className="text-[#18202A] font-semibold">{filteredAlerts.length}</strong> of {alerts.length} alerts
          </div>
          <button
            onClick={evaluateThresholds}
            disabled={isMutationPending('evaluateThresholds')}
            title="Check live telemetry against configured thresholds and raise an alert if needed"
            className="h-10 px-3.5 text-[14px] font-medium text-[#18202A] bg-[#F7F8FA] hover:bg-[#E4E7EB]/60 border border-[#E4E7EB] rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Activity className={`w-4 h-4 text-[#2F5BFF] ${isMutationPending('evaluateThresholds') ? 'animate-spin' : ''}`} />
            <span>{isMutationPending('evaluateThresholds') ? 'Checking...' : 'Run Threshold Check'}</span>
          </button>
          <button
            onClick={() => setIsReportModalOpen(true)}
            title="Manually report an observed issue"
            className="h-10 px-3.5 text-[14px] font-medium text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Report Issue</span>
          </button>
          <button
            onClick={() => setIsSimulateModalOpen(true)}
            title="Trigger a demo failure scenario"
            className="h-10 px-3.5 text-[14px] font-medium text-[#18202A] bg-white hover:bg-[#F7F8FA] border border-[#E4E7EB] rounded-lg transition-colors flex items-center gap-2"
          >
            <FlaskConical className="w-4 h-4 text-[#2F5BFF]" />
            <span>Simulate Failure</span>
          </button>
        </div>
      </div>

      <ReportIssueModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
      <SimulateFailureModal isOpen={isSimulateModalOpen} onClose={() => setIsSimulateModalOpen(false)} />

      {/* 2. Filters Toolbar */}
      <div className="card-base flex flex-wrap items-center gap-3">
        {/* Search */}
        <input
          type="text"
          placeholder="Filter by keyword or line..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="h-10 px-3.5 bg-[#F7F8FA] border border-[#E4E7EB] rounded-lg text-[14px] placeholder-[#8A93A0] text-[#18202A] focus:outline-none focus:border-[#2F5BFF] focus:bg-white w-64"
        />

        {/* Severity */}
        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="h-10 px-3.5 bg-white border border-[#E4E7EB] rounded-lg text-[14px] text-[#18202A] focus:outline-none focus:border-[#2F5BFF]"
        >
          <option value="all">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {/* Category */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-10 px-3.5 bg-white border border-[#E4E7EB] rounded-lg text-[14px] text-[#18202A] focus:outline-none focus:border-[#2F5BFF]"
        >
          <option value="all">All Categories</option>
          <option value="Production">Production</option>
          <option value="Machine">Machine</option>
          <option value="Quality">Quality</option>
          <option value="Material">Material</option>
          <option value="Downtime">Downtime</option>
          <option value="Waste">Waste</option>
          <option value="Energy">Energy</option>
        </select>

        {/* Status */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="h-10 px-3.5 bg-white border border-[#E4E7EB] rounded-lg text-[14px] text-[#18202A] focus:outline-none focus:border-[#2F5BFF]"
        >
          <option value="all">All Statuses</option>
          <option value="New">New</option>
          <option value="Investigating">Investigating</option>
          <option value="Action Required">Action Required</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Reopened">Reopened</option>
        </select>

        {(selectedSeverity !== 'all' || selectedCategory !== 'all' || selectedStatus !== 'all' || searchFilter) && (
          <button
            onClick={() => {
              setSelectedSeverity('all');
              setSelectedCategory('all');
              setSelectedStatus('all');
              setSearchFilter('');
            }}
            className="text-[14px] text-[#2F5BFF] hover:underline font-medium ml-auto"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* 3. Alerts Cards */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="py-20 text-center text-[#5F6875] card-base">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-[#8A93A0]" />
            <p className="text-[16px] font-semibold text-[#18202A]">No active alerts matching criteria</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'Critical';
            const isResolved = alert.status === 'Resolved';
            return (
              <div
                key={alert.id}
                className={`card-base transition-all ${
                  isResolved
                    ? 'border-[#A6F4C5] bg-[#F6FEF9]'
                    : isCritical
                    ? 'border-[#FECDCA] bg-white'
                    : 'border-[#E4E7EB] bg-white'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span
                        className={`h-7 px-2.5 rounded-[6px] text-[13px] font-medium inline-flex items-center ${
                          alert.severity === 'Critical'
                            ? 'bg-[#FEF3F2] text-[#D92D20]'
                            : alert.severity === 'High'
                            ? 'bg-[#FFF6ED] text-[#E56B00]'
                            : 'bg-[#FEF7E6] text-[#B78103]'
                        }`}
                      >
                        {alert.severity}
                      </span>

                      <span className="h-7 px-2.5 rounded-[6px] text-[13px] font-medium bg-[#F1F3F5] text-[#5F6875] inline-flex items-center">
                        {alert.category}
                      </span>

                      <h3 className="text-[16px] font-semibold text-[#18202A]">
                        {alert.title}
                      </h3>

                      <span
                        className={`h-7 px-2.5 rounded-[6px] text-[13px] font-medium inline-flex items-center ml-auto lg:ml-0 ${
                          isResolved
                            ? 'bg-[#EDFDF2] text-[#18864B]'
                            : alert.status === 'In Progress'
                            ? 'bg-[#EEF3FF] text-[#2F5BFF]'
                            : 'bg-[#FEF7E6] text-[#B78103]'
                        }`}
                      >
                        {alert.status}
                      </span>
                    </div>

                    <p className="text-[14px] leading-[22px] text-[#5F6875] mb-3">
                      {alert.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[13px] text-[#5F6875]">
                      <span>Area: <strong className="text-[#18202A]">{alert.lineName}</strong> {alert.machineName ? `· ${alert.machineName}` : ''}</span>
                      <span>·</span>
                      <span>Estimated Impact: <strong className="text-[#D92D20]">{alert.estimatedImpact}</strong></span>
                      <span>·</span>
                      <span>AI Confidence: <strong className="text-[#18202A]">{alert.confidence}%</strong></span>
                      <span>·</span>
                      <span className="text-[#8A93A0]">{alert.detectedAt}</span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#E4E7EB]">
                    {(alert.status === 'Resolved' || alert.status === 'Dismissed') && (
                      <button
                        onClick={() => reopenAlert(alert.id, '')}
                        disabled={isMutationPending(`reopenAlert:${alert.id}`)}
                        title="Reopen this incident if the fault has returned"
                        className="h-10 px-3.5 text-[14px] font-medium text-[#B78103] bg-white hover:bg-[#FEF7E6] border border-[#E4E7EB] rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <RotateCcw className={`w-4 h-4 ${isMutationPending(`reopenAlert:${alert.id}`) ? 'animate-spin' : ''}`} />
                        <span>{isMutationPending(`reopenAlert:${alert.id}`) ? 'Reopening...' : 'Reopen'}</span>
                      </button>
                    )}
                    {alert.investigationId ? (
                      <button
                        onClick={() => {
                          openInvestigation(alert.investigationId!, 'alerts');
                        }}
                        className="h-10 px-4 text-[14px] font-medium text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-lg transition-colors shadow-sm flex items-center gap-2"
                      >
                        <SearchCode className="w-4 h-4" />
                        <span>Launch Investigation</span>
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          const investigation = await generateInvestigation(alert.id);
                          if (investigation) {
                            openInvestigation(investigation.id, 'alerts');
                          }
                        }}
                        disabled={isMutationPending(`generateInvestigation:${alert.id}`)}
                        className="h-10 px-4 text-[14px] font-medium text-[#18202A] bg-white hover:bg-[#F7F8FA] border border-[#E4E7EB] rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <span>{isMutationPending(`generateInvestigation:${alert.id}`) ? 'Investigating...' : 'Investigate with AI'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
