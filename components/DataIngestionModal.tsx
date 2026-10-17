'use client';

import React, { useState } from 'react';
import { useFactory } from '@/lib/factoryStore';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Check,
  ArrowRight,
  Database,
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

  const [mappings] = useState<Record<string, string>>({
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
    }, 1000);
  };

  const handleReset = () => {
    setCurrentStep('select');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#18202A]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#E4E7EB] w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header (Shrink-0) */}
        <div className="px-6 py-3.5 border-b border-[#E4E7EB] flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EEF3FF] text-[#2F5BFF] flex items-center justify-center shrink-0">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#18202A]">Operational Data Ingestion</h3>
              <p className="text-[12px] text-[#5F6875]">Import plant telemetry datasets into live historian</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8A93A0] hover:text-[#18202A] rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress (Shrink-0) */}
        <div className="px-6 py-2.5 bg-[#F8FAFC] border-b border-[#E4E7EB] flex items-center justify-between text-[12px] font-semibold text-[#5F6875] shrink-0">
          <div className={`flex items-center gap-1.5 ${currentStep === 'select' ? 'text-[#2F5BFF]' : ''}`}>
            <span className="w-5 h-5 rounded-full bg-white border border-[#E4E7EB] flex items-center justify-center text-[11px] font-bold">1</span>
            Select Dataset
          </div>
          <ArrowRight className="w-3 h-3 text-[#8A93A0]" />
          <div className={`flex items-center gap-1.5 ${currentStep === 'mapping' ? 'text-[#2F5BFF]' : ''}`}>
            <span className="w-5 h-5 rounded-full bg-white border border-[#E4E7EB] flex items-center justify-center text-[11px] font-bold">2</span>
            Map Fields
          </div>
          <ArrowRight className="w-3 h-3 text-[#8A93A0]" />
          <div className={`flex items-center gap-1.5 ${currentStep === 'validation' ? 'text-[#2F5BFF]' : ''}`}>
            <span className="w-5 h-5 rounded-full bg-white border border-[#E4E7EB] flex items-center justify-center text-[11px] font-bold">3</span>
            Validate
          </div>
          <ArrowRight className="w-3 h-3 text-[#8A93A0]" />
          <div className={`flex items-center gap-1.5 ${currentStep === 'complete' ? 'text-[#18864B]' : ''}`}>
            <span className="w-5 h-5 rounded-full bg-white border border-[#E4E7EB] flex items-center justify-center text-[11px] font-bold">4</span>
            Done
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {currentStep === 'select' && (
            <div className="space-y-4">
              <div className="border border-dashed border-[#D0D5DD] hover:border-[#2F5BFF] rounded-xl p-4 text-center bg-[#F8FAFC] transition-colors cursor-pointer">
                <FileSpreadsheet className="w-7 h-7 text-[#8A93A0] mx-auto mb-1.5" />
                <p className="text-[13px] font-bold text-[#18202A]">Drag & drop factory CSV export here</p>
                <p className="text-[12px] text-[#5F6875]">Supports SCADA historians, MES run records, and QA inspection logs</p>
              </div>

              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-[#5F6875] mb-2">
                  Select A Plant Dataset Template:
                </label>
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {datasetOptions.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedDataset(opt.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        selectedDataset === opt.id
                          ? 'border-[#2F5BFF] bg-[#EEF3FF] shadow-xs'
                          : 'border-[#E4E7EB] hover:border-[#D0D5DD] bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-bold text-[#18202A]">{opt.id}</span>
                        <span className="text-[11px] font-semibold text-[#5F6875] font-mono">{opt.records} rows</span>
                      </div>
                      <p className="text-[12px] text-[#5F6875] mt-0.5 line-clamp-1">{opt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 'mapping' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#EEF3FF] border border-[#D9E4FF] rounded-xl text-[13px] text-[#18202A] flex items-center gap-2.5">
                <Database className="w-4 h-4 shrink-0 text-[#2F5BFF]" />
                <span>Auto-detected 5 columns in <strong>{selectedDataset}</strong>. Confirm mapping:</span>
              </div>

              <div className="space-y-2 border border-[#E4E7EB] rounded-xl p-3 bg-[#F8FAFC]">
                <div className="grid grid-cols-2 text-[12px] font-bold text-[#5F6875] px-1 mb-1">
                  <span>Source Column</span>
                  <span>Target Schema Field</span>
                </div>

                {Object.entries(mappings).map(([src, tgt]) => (
                  <div key={src} className="grid grid-cols-2 gap-3 items-center bg-white p-2.5 rounded-lg border border-[#E4E7EB]">
                    <span className="text-[13px] font-mono font-medium text-[#18202A] truncate">{src}</span>
                    <span className="text-[13px] font-mono font-semibold text-[#2F5BFF] truncate">{tgt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 'validation' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#EDFDF2] border border-[#A6F4C5] rounded-xl">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#18864B]" />
                  <span className="text-[13px] font-bold text-[#18864B]">Schema Validation Passed</span>
                </div>
                <span className="text-[12px] text-[#18864B] font-semibold">1,440 of 1,440 rows valid</span>
              </div>

              <div>
                <div className="text-[13px] font-bold text-[#18202A] mb-1.5 flex items-center justify-between">
                  <span>Record Preview (First 3 rows)</span>
                  <span className="text-[11px] text-[#5F6875]">Schema v2.4</span>
                </div>
                <div className="border border-[#E4E7EB] rounded-xl overflow-x-auto text-[13px]">
                  <table className="w-full text-left">
                    <thead className="bg-[#F8FAFC] text-[#5F6875] font-semibold text-[11px] uppercase tracking-wider border-b border-[#E4E7EB]">
                      <tr>
                        <th className="py-2 px-3">lineId</th>
                        <th className="py-2 px-3">shift</th>
                        <th className="py-2 px-3">actual</th>
                        <th className="py-2 px-3">target</th>
                        <th className="py-2 px-3">variance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E7EB] font-mono">
                      <tr>
                        <td className="py-2 px-3">Line 3</td>
                        <td className="py-2 px-3">Shift B</td>
                        <td className="py-2 px-3 font-bold text-[#D92D20]">4,380</td>
                        <td className="py-2 px-3">5,400</td>
                        <td className="py-2 px-3 font-bold text-[#D92D20]">-18.9%</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3">Line 1</td>
                        <td className="py-2 px-3">Shift B</td>
                        <td className="py-2 px-3 font-bold text-[#18864B]">5,880</td>
                        <td className="py-2 px-3">6,000</td>
                        <td className="py-2 px-3 font-bold text-[#18864B]">-2.0%</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3">Line 2</td>
                        <td className="py-2 px-3">Shift B</td>
                        <td className="py-2 px-3 font-bold text-[#E56B00]">4,320</td>
                        <td className="py-2 px-3">4,800</td>
                        <td className="py-2 px-3 font-bold text-[#E56B00]">-10.0%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'complete' && (
            <div className="py-4 text-center space-y-3">
              <div className="w-10 h-10 bg-[#EDFDF2] text-[#18864B] rounded-full flex items-center justify-center mx-auto">
                <Check className="w-5 h-5" />
              </div>
              <h4 className="text-[18px] font-bold text-[#18202A]">Dataset Ingested & Analyzed</h4>
              <p className="text-[13px] text-[#5F6875] max-w-sm mx-auto">
                1,440 records integrated into plant historian. The AI cross-domain engine updated anomaly detection bounds and verified Line 3 telemetry.
              </p>
              <div className="p-3 bg-[#EEF3FF] border border-[#D9E4FF] rounded-xl text-[12px] text-[#18202A] max-w-sm mx-auto text-left flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#2F5BFF] shrink-0 mt-0.5" />
                <span>
                  <strong>AI Detection:</strong> Re-verified vibration harmonics on Filling Machine M-03 (3.31 mm/s). Recommendation #REC-1 remains high urgency.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions (Permanently Sticky & Visible) */}
        <div className="px-6 py-3.5 border-t border-[#E4E7EB] bg-[#F8FAFC] flex items-center justify-between shrink-0">
          {currentStep === 'complete' ? (
            <button
              onClick={handleReset}
              className="w-full h-10 bg-[#2F5BFF] hover:bg-[#2448D8] text-white rounded-xl text-[13px] font-semibold shadow-xs cursor-pointer"
            >
              Done & Return to Operations
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="h-9 px-3.5 text-[13px] font-semibold text-[#5F6875] hover:text-[#18202A] cursor-pointer"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2.5">
                {currentStep === 'select' && (
                  <button
                    onClick={handleStartMapping}
                    className="h-9 px-4 bg-[#2F5BFF] hover:bg-[#2448D8] text-white font-semibold rounded-xl text-[13px] shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Proceed to Field Mapping</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {currentStep === 'mapping' && (
                  <button
                    onClick={handleRunValidation}
                    className="h-9 px-4 bg-[#2F5BFF] hover:bg-[#2448D8] text-white font-semibold rounded-xl text-[13px] shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Validate Dataset</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {currentStep === 'validation' && (
                  <button
                    onClick={handleConfirmImport}
                    disabled={isProcessing}
                    className="h-9 px-4 bg-[#2F5BFF] hover:bg-[#2448D8] text-white font-semibold rounded-xl text-[13px] shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Running AI Ingestion...</span>
                      </>
                    ) : (
                      <span>Confirm Import & Ingest</span>
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
