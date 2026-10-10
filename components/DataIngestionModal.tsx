'use client';

import React, { useState } from 'react';
import { useFactory } from '@/lib/factoryStore';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Check,
  AlertCircle,
  ArrowRight,
  Database,
  Cpu,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface DataIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'select' | 'mapping' | 'validation' | 'complete';

export function DataIngestionModal({ isOpen, onClose }: DataIngestionModalProps) {
  const { ingestData } = useFactory();

  const [currentStep, setCurrentStep] = useState<Step>('select');
  const [selectedDataset, setSelectedDataset] = useState('production.csv');
  const [isProcessing, setIsProcessing] = useState(false);

  const [mappings, setMappings] = useState<Record<string, string>>({
    actual_qty: 'actualOutput',
    line_code: 'lineId',
    shift_code: 'shift',
    target_qty: 'targetOutput',
    timestamp_utc: 'timestamp',
  });

  if (!isOpen) return null;

  const datasetOptions = [
    { id: 'production.csv', name: 'Production Records (production.csv)', records: 1440, desc: 'Hourly output, target vs actual, line metrics' },
    { id: 'machine_readings.csv', name: 'Machine Telemetry (machine_readings.csv)', records: 8640, desc: 'Vibration, temperature, pressure, cycle times' },
    { id: 'quality.csv', name: 'Quality & Defect Inspections (quality.csv)', records: 480, desc: 'Checkweigher reject counts, seal tests, defect types' },
    { id: 'maintenance.csv', name: 'Maintenance & Work Orders (maintenance.csv)', records: 96, desc: 'Repairs, diaphragm swaps, technician logs' },
    { id: 'downtime.csv', name: 'Downtime & Stoppages (downtime.csv)', records: 180, desc: 'Micro-stops, equipment failure durations, root categories' },
    { id: 'material_batches.csv', name: 'Material Batches & CoA (material_batches.csv)', records: 64, desc: 'Batch codes, supplier viscosity, receipt dates' },
    { id: 'waste.csv', name: 'Material Waste & Scrap (waste.csv)', records: 120, desc: 'Discarded kg, scrap reasons, waste costs' },
    { id: 'energy.csv', name: 'Energy Consumption (energy.csv)', records: 720, desc: 'kWh per machine, power factor, baseline deviations' },
  ];

  const handleStartMapping = () => {
    setCurrentStep('mapping');
  };

  const handleRunValidation = () => {
    setCurrentStep('validation');
  };

  const handleConfirmImport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep('complete');
      const opt = datasetOptions.find((d) => d.id === selectedDataset);
      ingestData(
        opt?.name || selectedDataset,
        opt?.records || 1440,
        'Anomaly analysis: Line 3 M-03 vibration anomaly (+38%) confirmed in new telemetry window.'
      );
    }, 1200);
  };

  const handleReset = () => {
    setCurrentStep('select');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#18202A]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-[#E4E7EB] w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E4E7EB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EEF3FF] text-[#2F5BFF] flex items-center justify-center shrink-0">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[18px] font-semibold text-[#18202A]">Operational Data Ingestion</h3>
              <p className="text-[13px] text-[#5F6875]">Import CSV datasets, map columns, and run AI correlation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8A93A0] hover:text-[#18202A] rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="px-6 py-3 bg-[#F7F8FA] border-b border-[#E4E7EB] flex items-center justify-between text-[13px] font-medium text-[#5F6875]">
          <div className={`flex items-center gap-2 ${currentStep === 'select' ? 'text-[#2F5BFF]' : ''}`}>
            <span className="w-6 h-6 rounded-full bg-white border border-[#E4E7EB] flex items-center justify-center text-[13px]">1</span>
            Select Dataset
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#8A93A0]" />
          <div className={`flex items-center gap-2 ${currentStep === 'mapping' ? 'text-[#2F5BFF]' : ''}`}>
            <span className="w-6 h-6 rounded-full bg-white border border-[#E4E7EB] flex items-center justify-center text-[13px]">2</span>
            Map Columns
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#8A93A0]" />
          <div className={`flex items-center gap-2 ${currentStep === 'validation' ? 'text-[#2F5BFF]' : ''}`}>
            <span className="w-6 h-6 rounded-full bg-white border border-[#E4E7EB] flex items-center justify-center text-[13px]">3</span>
            Validate & Preview
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#8A93A0]" />
          <div className={`flex items-center gap-2 ${currentStep === 'complete' ? 'text-[#18864B]' : ''}`}>
            <span className="w-6 h-6 rounded-full bg-white border border-[#E4E7EB] flex items-center justify-center text-[13px]">4</span>
            Completed
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {currentStep === 'select' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-[#E4E7EB] hover:border-[#2F5BFF] rounded-xl p-8 text-center bg-[#F7F8FA] transition-colors cursor-pointer">
                <FileSpreadsheet className="w-10 h-10 text-[#8A93A0] mx-auto mb-3" />
                <p className="text-[15px] font-semibold text-[#18202A]">Drag & drop factory CSV export here</p>
                <p className="text-[13px] text-[#5F6875] mt-1">Supports SCADA historians, MES run records, and QA inspection files</p>
                <button className="mt-4 h-10 px-4 text-[14px] font-medium text-[#18202A] bg-white border border-[#E4E7EB] rounded-lg shadow-sm hover:bg-[#F7F8FA]">
                  Browse Files
                </button>
              </div>

              <div>
                <label className="block text-[14px] font-semibold text-[#18202A] mb-3">
                  Or select a standard plant dataset template:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {datasetOptions.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedDataset(opt.id)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        selectedDataset === opt.id
                          ? 'border-[#2F5BFF] bg-[#EEF3FF] shadow-sm'
                          : 'border-[#E4E7EB] hover:border-[#D0D5DD] bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] font-semibold text-[#18202A]">{opt.id}</span>
                        <span className="text-[13px] text-[#5F6875]">{opt.records} rows</span>
                      </div>
                      <p className="text-[13px] text-[#5F6875] mt-1 line-clamp-1">{opt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 'mapping' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#F8FAFF] border border-[#D9E4FF] rounded-xl text-[14px] text-[#18202A] flex items-center gap-3">
                <Database className="w-4 h-4 shrink-0 text-[#2F5BFF]" />
                <span>Auto-detected 5 columns in <strong>{selectedDataset}</strong>. Confirm mapping to FactoryLens schema:</span>
              </div>

              <div className="space-y-2 border border-[#E4E7EB] rounded-xl p-4 bg-[#F7F8FA]">
                <div className="grid grid-cols-2 text-[13px] font-medium text-[#5F6875] px-2 mb-2">
                  <span>Source CSV Column</span>
                  <span>Target Schema Field</span>
                </div>

                {Object.entries(mappings).map(([src, tgt]) => (
                  <div key={src} className="grid grid-cols-2 gap-4 items-center bg-white p-3 rounded-lg border border-[#E4E7EB]">
                    <span className="text-[14px] font-medium text-[#18202A]">{src}</span>
                    <select
                      value={tgt}
                      onChange={(e) => setMappings({ ...mappings, [src]: e.target.value })}
                      className="h-10 px-3 text-[14px] bg-[#F7F8FA] border border-[#E4E7EB] rounded-lg text-[#18202A] focus:outline-none focus:border-[#2F5BFF]"
                    >
                      <option value="actualOutput">actualOutput (Units Produced)</option>
                      <option value="targetOutput">targetOutput (Scheduled Target)</option>
                      <option value="lineId">lineId (Production Line ID)</option>
                      <option value="shift">shift (Shift A/B/C)</option>
                      <option value="timestamp">timestamp (ISO 8601)</option>
                      <option value="temperature">temperature (Celsius)</option>
                      <option value="vibration">vibration (mm/s RMS)</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 'validation' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#EDFDF2] border border-[#A6F4C5] rounded-xl">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#18864B]" />
                  <span className="text-[14px] font-semibold text-[#18864B]">Schema Validation Passed</span>
                </div>
                <span className="text-[13px] text-[#18864B] font-medium">1,440 of 1,440 rows valid</span>
              </div>

              <div>
                <div className="text-[14px] font-semibold text-[#18202A] mb-2 flex items-center justify-between">
                  <span>Sample Record Preview (First 3 rows)</span>
                  <span className="text-[13px] text-[#5F6875]">Schema version 2.4</span>
                </div>
                <div className="border border-[#E4E7EB] rounded-xl overflow-x-auto text-[14px]">
                  <table className="w-full text-left">
                    <thead className="bg-[#F7F8FA] text-[#5F6875] font-medium text-[13px] border-b border-[#E4E7EB]">
                      <tr>
                        <th className="py-2.5 px-3">lineId</th>
                        <th className="py-2.5 px-3">shift</th>
                        <th className="py-2.5 px-3">actualOutput</th>
                        <th className="py-2.5 px-3">targetOutput</th>
                        <th className="py-2.5 px-3">variance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E7EB]">
                      <tr>
                        <td className="py-3 px-3">Line 3</td>
                        <td className="py-3 px-3">Shift B</td>
                        <td className="py-3 px-3 font-semibold text-[#D92D20]">4,300</td>
                        <td className="py-3 px-3">5,000</td>
                        <td className="py-3 px-3 font-semibold text-[#D92D20]">-14.0%</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3">Line 1</td>
                        <td className="py-3 px-3">Shift B</td>
                        <td className="py-3 px-3 font-semibold text-[#18864B]">5,410</td>
                        <td className="py-3 px-3">5,500</td>
                        <td className="py-3 px-3 font-semibold text-[#18864B]">-1.6%</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3">Line 2</td>
                        <td className="py-3 px-3">Shift B</td>
                        <td className="py-3 px-3 font-semibold text-[#E56B00]">3,820</td>
                        <td className="py-3 px-3">4,200</td>
                        <td className="py-3 px-3 font-semibold text-[#E56B00]">-9.1%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'complete' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 bg-[#EDFDF2] text-[#18864B] rounded-full flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-[22px] font-semibold text-[#18202A]">Dataset Ingested & Analyzed</h4>
              <p className="text-[15px] leading-[24px] text-[#5F6875] max-w-md mx-auto">
                1,440 records integrated into plant historian. The AI cross-domain engine updated anomaly detection bounds and verified Line 3 telemetry.
              </p>
              <div className="p-4 bg-[#F8FAFF] border border-[#D9E4FF] rounded-xl text-[14px] text-[#18202A] max-w-md mx-auto text-left flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-[#2F5BFF] shrink-0 mt-0.5" />
                <span>
                  <strong>AI Detection:</strong> New telemetry re-verified vibration harmonics on Filling Machine M-03 (3.31 mm/s). Recommendation #REC-1 remains high urgency.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#E4E7EB] bg-[#F7F8FA] flex items-center justify-between">
          {currentStep === 'complete' ? (
            <button
              onClick={handleReset}
              className="w-full h-10 bg-[#2F5BFF] hover:bg-[#2448D8] text-white rounded-lg text-[14px] font-medium shadow-sm"
            >
              Done & Return to Operations
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="h-10 px-4 text-[14px] font-medium text-[#5F6875] hover:text-[#18202A]"
              >
                Cancel
              </button>
              <div className="flex items-center gap-3">
                {currentStep === 'select' && (
                  <button
                    onClick={handleStartMapping}
                    className="h-10 px-4 bg-[#2F5BFF] hover:bg-[#2448D8] text-white font-medium rounded-lg text-[14px] shadow-sm"
                  >
                    Proceed to Field Mapping
                  </button>
                )}
                {currentStep === 'mapping' && (
                  <button
                    onClick={handleRunValidation}
                    className="h-10 px-4 bg-[#2F5BFF] hover:bg-[#2448D8] text-white font-medium rounded-lg text-[14px] shadow-sm"
                  >
                    Validate Dataset
                  </button>
                )}
                {currentStep === 'validation' && (
                  <button
                    onClick={handleConfirmImport}
                    disabled={isProcessing}
                    className="h-10 px-4 bg-[#2F5BFF] hover:bg-[#2448D8] text-white font-medium rounded-lg text-[14px] shadow-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Running AI Ingestion...
                      </>
                    ) : (
                      'Confirm Import & Run AI Anomaly Ingestion'
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
