'use client';

import React, { useState, useMemo } from 'react';
import { useFactory } from '@/lib/factoryStore';
import {
  Boxes,
  Warehouse,
  Scale,
  Flame,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  PanelRightOpen,
  X,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';
import { Material, MaterialBatch, WasteDefectCategory } from '@/lib/types';

export function MaterialsModule() {
  const {
    materials,
    materialBatches,
    ingredientUsageRecords,
    wasteRecords,
    productionLines,
    addMaterialBatch,
    addWasteRecord,
    adjustMaterialStock,
    openInvestigationDrawer,
    openInvestigation,
    investigations,
    isMutationPending,
  } = useFactory();

  // Active view tab: 'inventory' | 'batches' | 'scrap'
  const [activeTab, setActiveTab] = useState<'inventory' | 'batches' | 'scrap'>('inventory');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modal states
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isScrapModalOpen, setIsScrapModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedMaterialForAdjust, setSelectedMaterialForAdjust] = useState<Material | null>(null);

  // Form states for Receive Batch Modal
  const [receiveMaterialId, setReceiveMaterialId] = useState(materials[0]?.id || '');
  const [receiveBatchCode, setReceiveBatchCode] = useState('');
  const [receiveSupplier, setReceiveSupplier] = useState('');
  const [receiveQuantity, setReceiveQuantity] = useState<number>(500);
  const [receiveStatus, setReceiveStatus] = useState<'Approved' | 'Quarantine' | 'In Use'>('Approved');

  // Form states for Log Scrap Modal
  const [scrapLineName, setScrapLineName] = useState(productionLines[2]?.name || 'Line 3 (UHT Bottling)');
  const [scrapMaterialName, setScrapMaterialName] = useState(materials[0]?.name || 'Raw Grade A Farm Milk (3.8% Fat)');
  const [scrapBatchCode, setScrapBatchCode] = useState('LOT-RAW-904');
  const [scrapQuantityKg, setScrapQuantityKg] = useState<number>(25);
  const [scrapCost, setScrapCost] = useState<number>(150);
  const [scrapCategory, setScrapCategory] = useState<WasteDefectCategory>('Off-Spec Viscosity');
  const [scrapReason, setScrapReason] = useState<'Process loss' | 'Spoiled' | 'Damaged' | 'Other'>('Process loss');

  // Form states for Adjust Stock Modal
  const [adjustNewStock, setAdjustNewStock] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('Stock Count Audit');

  // Investigation status
  const heroInvestigation = investigations['inv-line3-hero'];
  const isLine3Resolved = heroInvestigation?.status === 'Resolved';

  // Computed summary metrics
  const totalStockValue = useMemo(() => {
    return materials.reduce((sum, m) => sum + m.currentStock * m.unitCost, 0);
  }, [materials]);

  const activeLotsCount = useMemo(() => {
    return materialBatches.filter((b) => b.status === 'In Use' || b.status === 'Approved').length;
  }, [materialBatches]);

  const totalScrapCost = useMemo(() => {
    return wasteRecords.reduce((sum, w) => sum + (w.wasteCost || 0), 0);
  }, [wasteRecords]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(materials.map((m) => m.category));
    return ['All', ...Array.from(set)];
  }, [materials]);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.supplier.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'All' || m.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [materials, searchQuery, selectedCategory]);

  // Handlers
  const handleOpenAdjust = (m: Material) => {
    setSelectedMaterialForAdjust(m);
    setAdjustNewStock(m.currentStock);
    setIsAdjustModalOpen(true);
  };

  const handleSaveReceiveBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMat = materials.find((m) => m.id === receiveMaterialId);
    if (!targetMat) return;

    const code = receiveBatchCode.trim() || `LOT-${Date.now().toString().slice(-4)}`;
    addMaterialBatch({
      materialId: targetMat.id,
      batchCode: code,
      supplier: receiveSupplier.trim() || targetMat.supplier,
      receivedDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      quantity: Number(receiveQuantity),
      unitOfMeasure: targetMat.unitOfMeasure,
      status: receiveStatus,
      associatedProducts: ['Beverage Bottling'],
      relatedAlertIds: [],
    });

    setIsReceiveModalOpen(false);
    setReceiveBatchCode('');
  };

  const handleSaveScrap = (e: React.FormEvent) => {
    e.preventDefault();
    addWasteRecord({
      materialName: scrapMaterialName,
      productionBatchCode: scrapBatchCode.trim() || 'PB-LIVE',
      lineName: scrapLineName,
      wasteQuantityKg: Number(scrapQuantityKg),
      wasteType: 'Ingredient / Bottle Scrap',
      defectCategory: scrapCategory,
      wasteReason: scrapReason,
      wasteCost: Number(scrapCost),
    });

    setIsScrapModalOpen(false);
  };

  const handleSaveAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterialForAdjust) return;
    adjustMaterialStock(selectedMaterialForAdjust.id, Number(adjustNewStock), adjustReason);
    setIsAdjustModalOpen(false);
    setSelectedMaterialForAdjust(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header with Action Modals */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-[13px] font-medium text-[#5F6875] mb-1">
            Supply Chain & Material Genealogy
          </div>
          <h1 className="text-[28px] md:text-[32px] leading-[38px] font-bold text-[#18202A] tracking-tight">
            Materials & Inventory
          </h1>
          <p className="text-[14px] md:text-[15px] leading-[22px] text-[#5F6875] mt-1">
            Warehouse on-hand balances, active lot traceability, and real-time scrap loss logs.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setReceiveMaterialId(materials[0]?.id || '');
              setReceiveBatchCode(`RM-${Math.floor(100 + Math.random() * 900)}`);
              setReceiveSupplier(materials[0]?.supplier || '');
              setIsReceiveModalOpen(true);
            }}
            className="h-10 px-4 bg-[#2F5BFF] hover:bg-[#2448D8] text-white text-[13px] font-semibold rounded-lg flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Receive Material Batch</span>
          </button>

          <button
            onClick={() => {
              setScrapLineName(productionLines[2]?.name || 'Line 3 (UHT Bottling)');
              setScrapMaterialName(materials[0]?.name || 'Raw Grade A Farm Milk (3.8% Fat)');
              setScrapBatchCode('LOT-RAW-904');
              setScrapQuantityKg(128);
              setScrapCost(768);
              setScrapCategory('Off-Spec Viscosity');
              setScrapReason('Process loss');
              setIsScrapModalOpen(true);
            }}
            className="h-10 px-3.5 bg-white hover:bg-[#F7F8FA] border border-[#D0D5DD] text-[#18202A] text-[13px] font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-xs"
          >
            <Flame className="w-4 h-4 text-[#D92D20]" />
            <span>Log Scrap Entry</span>
          </button>
        </div>
      </div>

      {/* 2. Three High-Level Glanceable KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E4E7EB] rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[13px] font-medium text-[#5F6875]">Total Inventory Valuation</div>
            <div className="text-[26px] font-bold text-[#18202A] mt-1 font-mono">
              {formatCurrency(totalStockValue)}
            </div>
            <div className="text-[12px] text-[#5F6875] mt-1 flex items-center gap-1.5">
              <Warehouse className="w-3.5 h-3.5 text-[#2F5BFF]" />
              <span>{materials.length} raw material SKUs tracked</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#EEF3FF] flex items-center justify-center text-[#2F5BFF]">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-[#E4E7EB] rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[13px] font-medium text-[#5F6875]">Active Lots in Production</div>
            <div className="text-[26px] font-bold text-[#18202A] mt-1 font-mono">
              {activeLotsCount} <span className="text-[15px] font-normal text-[#5F6875]">Lots</span>
            </div>
            <div className="text-[12px] text-[#5F6875] mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#18864B]" />
              <span>Charged into mixing & bottling lines</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#EDFDF2] flex items-center justify-center text-[#18864B]">
            <Scale className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-[#E4E7EB] rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[13px] font-medium text-[#5F6875]">Cumulative Scrap Loss</div>
            <div className="text-[26px] font-bold text-[#D92D20] mt-1 font-mono">
              {formatCurrency(totalScrapCost)}
            </div>
            <div className="text-[12px] text-[#5F6875] mt-1 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-[#D92D20]" />
              <span>{wasteRecords.length} reject events recorded</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FEF3F2] flex items-center justify-center text-[#D92D20]">
            <Flame className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Progressive Disclosure Tabs */}
      <div className="border-b border-[#E4E7EB] flex items-center gap-1">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 px-4 text-[14px] font-semibold transition-all relative flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'text-[#2F5BFF] border-b-2 border-[#2F5BFF]'
              : 'text-[#5F6875] hover:text-[#18202A]'
          }`}
        >
          <Warehouse className="w-4 h-4" />
          <span>Warehouse Inventory ({materials.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('batches')}
          className={`pb-3 px-4 text-[14px] font-semibold transition-all relative flex items-center gap-2 ${
            activeTab === 'batches'
              ? 'text-[#2F5BFF] border-b-2 border-[#2F5BFF]'
              : 'text-[#5F6875] hover:text-[#18202A]'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Active Lots & QA Traceability ({materialBatches.length})</span>
          {materialBatches.some((b) => b.status === 'Flagged' || b.status === 'Quarantine') && (
            <span className="w-2 h-2 rounded-full bg-[#D92D20]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('scrap')}
          className={`pb-3 px-4 text-[14px] font-semibold transition-all relative flex items-center gap-2 ${
            activeTab === 'scrap'
              ? 'text-[#2F5BFF] border-b-2 border-[#2F5BFF]'
              : 'text-[#5F6875] hover:text-[#18202A]'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Scrap & Waste Ledger ({wasteRecords.length})</span>
        </button>
      </div>

      {/* TAB CONTENT 1: WAREHOUSE INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Controls: Search and Category Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A93A0]" />
              <input
                type="text"
                placeholder="Search by material name, SKU code, or supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 bg-white border border-[#D0D5DD] rounded-lg text-[13px] text-[#18202A] placeholder-[#8A93A0] focus:outline-hidden focus:ring-2 focus:ring-[#2F5BFF]"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[12px] font-medium text-[#5F6875] flex items-center gap-1 shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Category:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`h-8 px-3 rounded-md text-[12px] font-medium transition-colors shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-[#18202A] text-white'
                      : 'bg-[#F2F4F7] text-[#475467] hover:bg-[#E4E7EB]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Clean Inventory Table */}
          <div className="bg-white border border-[#E4E7EB] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px]">
                <thead className="bg-[#F7F8FA] text-[#5F6875] font-medium border-b border-[#E4E7EB] text-[12px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Material / SKU</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4 text-right">Current On-Hand</th>
                    <th className="py-3 px-4 text-right">Unit Cost</th>
                    <th className="py-3 px-4 text-right">Total Valuation</th>
                    <th className="py-3 px-4 text-center">CoA Status</th>
                    <th className="py-3 px-4 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7EB]">
                  {filteredMaterials.map((m) => {
                    const isLowStock = m.currentStock < 1000;
                    const valuation = m.currentStock * m.unitCost;

                    return (
                      <tr key={m.id} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#18202A]">{m.name}</div>
                          <div className="text-[12px] font-mono text-[#5F6875]">{m.code}</div>
                        </td>

                        <td className="py-3.5 px-4 text-[13px] text-[#5F6875]">
                          <span className="px-2 py-0.5 rounded bg-[#F2F4F7] text-[#475467] text-[12px]">
                            {m.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-[13px] text-[#18202A]">{m.supplier}</td>

                        <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                          <div
                            className={`font-semibold ${
                              isLowStock ? 'text-[#D92D20]' : 'text-[#18202A]'
                            }`}
                          >
                            {m.currentStock.toLocaleString()} {m.unitOfMeasure}
                          </div>
                          {isLowStock && (
                            <span className="text-[11px] text-[#D92D20] font-sans font-medium">
                              Low Safety Stock
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono text-[13px] text-[#5F6875] tabular-nums">
                          ${m.unitCost.toFixed(2)}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#18202A] tabular-nums">
                          {formatCurrency(valuation)}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-medium ${
                              m.qualityStatus === 'Approved'
                                ? 'bg-[#EDFDF2] text-[#18864B] border border-[#A6F4C5]'
                                : m.qualityStatus === 'Quarantine'
                                ? 'bg-[#FEF3F2] text-[#D92D20] border border-[#FECDCA]'
                                : 'bg-[#FFF6ED] text-[#E56B00] border border-[#FEDF89]'
                            }`}
                          >
                            {m.qualityStatus === 'Approved' ? (
                              <ShieldCheck className="w-3 h-3" />
                            ) : (
                              <ShieldAlert className="w-3 h-3" />
                            )}
                            <span>{m.qualityStatus}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenAdjust(m)}
                            className="h-8 px-2.5 text-[12px] font-medium text-[#2F5BFF] hover:bg-[#EEF3FF] rounded-md border border-[#D9E4FF] transition-colors"
                          >
                            Adjust Stock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: ACTIVE BATCHES & QA TRACEABILITY */}
      {activeTab === 'batches' && (
        <div className="space-y-6">
          {/* Focused Highlight on Active Flagged Lot (RM-284) */}
          <div className="rounded-xl border border-[#FEDF89] bg-[#FFFBF5] p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[#FEF3F2] text-[#D92D20] border border-[#FECDCA]">
                  Quality Alert
                </span>
                <h3 className="text-[17px] font-bold text-[#18202A]">
                  Active Batch Lot #LOT-RAW-904 (Raw Grade A Farm Milk 3.8% Fat)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openInvestigation('inv-line3-hero', 'materials')}
                  className="h-8 px-3 text-[12px] font-semibold text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Diagnose Line 3 Anomaly</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>
            </div>

            <p className="text-[13px] text-[#5F6875] leading-[20px]">
              Supplier Certificate of Analysis recorded viscosity deviation of <strong>+8.4% (2.28 cP vs 2.10 cP standard)</strong> with elevated solids-not-fat. Resulted in high backpressure on Aseptic Filler M-03 and 128 kg / 256 bottles scrap loss before valve diaphragm maintenance.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#F2E7DC] text-[12px]">
              <div>
                <span className="text-[#8A93A0]">Supplier:</span>
                <div className="font-semibold text-[#18202A]">Midwest Dairy Cooperative</div>
              </div>
              <div>
                <span className="text-[#8A93A0]">Line Assigned:</span>
                <div className="font-semibold text-[#18202A]">Line 3 (UHT Bottling)</div>
              </div>
              <div>
                <span className="text-[#8A93A0]">Scrap Impact:</span>
                <div className="font-semibold text-[#D92D20]">128 kg ($768.00)</div>
              </div>
              <div>
                <span className="text-[#8A93A0]">Disposition:</span>
                <div className="font-semibold text-[#18202A]">
                  {isLine3Resolved ? 'Resolved & Cleared' : 'Under Investigation'}
                </div>
              </div>
            </div>
          </div>

          {/* All Batches Table */}
          <div className="bg-white border border-[#E4E7EB] rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E4E7EB] flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-semibold text-[#18202A]">
                  Material Batches & Lot Records
                </h3>
                <p className="text-[12px] text-[#5F6875] mt-0.5">
                  Full incoming lot genealogy, supplier CoA approvals, and expiration schedules.
                </p>
              </div>
              <button
                onClick={() => {
                  setReceiveMaterialId(materials[0]?.id || '');
                  setReceiveBatchCode(`LOT-${Math.floor(100 + Math.random() * 900)}`);
                  setIsReceiveModalOpen(true);
                }}
                className="h-8 px-3 text-[12px] font-medium bg-[#EEF3FF] text-[#2F5BFF] hover:bg-[#D9E4FF] rounded-md flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Receive Lot</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px]">
                <thead className="bg-[#F7F8FA] text-[#5F6875] font-medium border-b border-[#E4E7EB] text-[12px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Batch / Lot Code</th>
                    <th className="py-3 px-4">Material</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4">Received Date</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4 text-right">Quantity</th>
                    <th className="py-3 px-4 text-center">QA Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7EB]">
                  {materialBatches.map((b) => {
                    const mat = materials.find((m) => m.id === b.materialId);

                    return (
                      <tr key={b.id} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-[#18202A]">
                          {b.batchCode}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-[#18202A]">
                          {mat?.name || b.materialId}
                        </td>
                        <td className="py-3.5 px-4 text-[#5F6875] text-[13px]">{b.supplier}</td>
                        <td className="py-3.5 px-4 text-[#5F6875] text-[13px]">{b.receivedDate}</td>
                        <td className="py-3.5 px-4 text-[#5F6875] text-[13px]">{b.expiryDate}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#18202A] tabular-nums">
                          {b.quantity.toLocaleString()} {b.unitOfMeasure}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium ${
                              b.status === 'Approved'
                                ? 'bg-[#EDFDF2] text-[#18864B]'
                                : b.status === 'In Use'
                                ? 'bg-[#EEF3FF] text-[#2F5BFF]'
                                : 'bg-[#FEF3F2] text-[#D92D20]'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: SCRAP & WASTE LEDGER */}
      {activeTab === 'scrap' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E4E7EB] rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E4E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-[16px] font-semibold text-[#18202A]">
                  Factory Scrap & Rejection Records
                </h3>
                <p className="text-[12px] text-[#5F6875] mt-0.5">
                  Detailed ledger of material loss, checkweigher rejects, and financial cost impact.
                </p>
              </div>

              <button
                onClick={() => setIsScrapModalOpen(true)}
                className="h-8 px-3 text-[12px] font-semibold bg-[#FEF3F2] text-[#D92D20] hover:bg-[#FEE4E2] border border-[#FECDCA] rounded-md flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log New Scrap</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px]">
                <thead className="bg-[#F7F8FA] text-[#5F6875] font-medium border-b border-[#E4E7EB] text-[12px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Line & Machine</th>
                    <th className="py-3 px-4">Material / Product</th>
                    <th className="py-3 px-4">Batch Lot</th>
                    <th className="py-3 px-4">Defect Category</th>
                    <th className="py-3 px-4 text-right">Quantity Lost</th>
                    <th className="py-3 px-4 text-right">Cost Impact</th>
                    <th className="py-3 px-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7EB]">
                  {wasteRecords.map((w) => (
                    <tr key={w.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#18202A]">{w.lineName}</div>
                        <div className="text-[12px] text-[#5F6875]">{w.machineName || 'Filling Station'}</div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-[#18202A]">
                        {w.materialName}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[13px] text-[#5F6875]">
                        #{w.productionBatchCode}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#FFF6ED] text-[#E56B00] border border-[#FEDF89]">
                          {w.defectCategory || w.wasteReason}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#18202A] tabular-nums">
                        {w.wasteQuantityKg} kg
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#D92D20] tabular-nums">
                        {formatCurrency(w.wasteCost)}
                      </td>

                      <td className="py-3.5 px-4 text-right text-[12px] text-[#8A93A0]">
                        {new Date(w.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: RECEIVE MATERIAL BATCH */}
      {isReceiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-[#E4E7EB] overflow-hidden">
            <div className="p-4 border-b border-[#E4E7EB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-[#2F5BFF]" />
                <h3 className="text-[16px] font-bold text-[#18202A]">Receive Material Batch</h3>
              </div>
              <button
                onClick={() => setIsReceiveModalOpen(false)}
                className="p-1 hover:bg-[#F2F4F7] rounded-md text-[#8A93A0] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReceiveBatch} className="p-5 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#18202A] mb-1">
                  Select Material SKU
                </label>
                <select
                  value={receiveMaterialId}
                  onChange={(e) => {
                    setReceiveMaterialId(e.target.value);
                    const mat = materials.find((m) => m.id === e.target.value);
                    if (mat) setReceiveSupplier(mat.supplier);
                  }}
                  className="w-full h-10 px-3 bg-white border border-[#D0D5DD] rounded-lg text-[13px] text-[#18202A] focus:outline-hidden focus:ring-2 focus:ring-[#2F5BFF]"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#18202A] mb-1">
                  Batch / Lot Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RM-305"
                  value={receiveBatchCode}
                  onChange={(e) => setReceiveBatchCode(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#D0D5DD] rounded-lg text-[13px] text-[#18202A] focus:outline-hidden focus:ring-2 focus:ring-[#2F5BFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[#18202A] mb-1">
                    Received Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={receiveQuantity}
                    onChange={(e) => setReceiveQuantity(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-white border border-[#D0D5DD] rounded-lg text-[13px] text-[#18202A] focus:outline-hidden focus:ring-2 focus:ring-[#2F5BFF]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#18202A] mb-1">
                    CoA Clearance Status
                  </label>
                  <select
                    value={receiveStatus}
                    onChange={(e) => setReceiveStatus(e.target.value as any)}
                    className="w-full h-10 px-3 bg-white border border-[#D0D5DD] rounded-lg text-[13px] text-[#18202A] focus:outline-hidden focus:ring-2 focus:ring-[#2F5BFF]"
                  >
                    <option value="Approved">Approved (Lab Passed)</option>
                    <option value="Quarantine">Quarantine (Hold)</option>
                    <option value="In Use">In Use (Immediate)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#18202A] mb-1">
                  Supplier Name
                </label>
                <input
                  type="text"
                  required
                  value={receiveSupplier}
                  onChange={(e) => setReceiveSupplier(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#D0D5DD] rounded-lg text-[13px] text-[#18202A] focus:outline-hidden focus:ring-2 focus:ring-[#2F5BFF]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E4E7EB]">
                <button
                  type="button"
                  onClick={() => setIsReceiveModalOpen(false)}
                  className="h-9 px-3.5 text-[13px] font-medium text-[#5F6875] hover:bg-[#F2F4F7] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isMutationPending('addMaterialBatch')}
                  className="h-9 px-4 text-[13px] font-semibold text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-lg transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isMutationPending('addMaterialBatch') ? 'Receiving...' : 'Receive & Update Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LOG SCRAP ENTRY */}
      {isScrapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-[#E4E7EB] overflow-hidden">
            <div className="p-4 border-b border-[#E4E7EB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#D92D20]" />
                <h3 className="text-[16px] font-bold text-[#18202A]">Log Factory Scrap Entry</h3>
              </div>
              <button
                onClick={() => setIsScrapModalOpen(false)}
                className="p-1 hover:bg-[#F2F4F7] rounded-md text-[#8A93A0] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveScrap} className="p-5 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#18202A] mb-1">
                  Production Line Affected
                </label>
                <select
                  value={scrapLineName}
                  onChange={(e) => setScrapLineName(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#D0D5DD] rounded-lg text-[13px] text-[#18202A] focus:outline-hidden focus:ring-2 focus:ring-[#2F5BFF]"
                >
                  {productionLines.map((l) => (
                    <option key={l.id} value={l.name}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#18202A] mb-1">
                  Material / Ingredient Discarded
                </label>
                <select
                  value={scrapMaterialName}
                  onChange={(e) => setScrapMaterialName(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#D0D5DD] rounded-lg text-[13px] text-[#18202A] focus:outline-hidden focus:ring-2 focus:ring-[#2F5BFF]"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[#18202A] mb-1">
                    Scrap Quantity (kg)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={scrapQuantityKg}
                    onChange={(e) => {
                      const qty = Number(e.target.value);
                      setScrapQuantityKg(qty);
                      setScrapCost(qty * 6); // default estimate
                    }}
                    className="w-full h-10 px-3 bg-white border border-[#D0D5DD] rounded-lg text-[13px] text-[#18202A] focus:outline-hidden focus:ring-2 focus:ring-[#2F5BFF]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#18202A] mb-1">
                    Estimated Loss Cost ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={scrapCost}
                    onChange={(e) => setScrapCost(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-white border border-[#D0D5DD] rounded-lg text-[13px] text-[#18202A] focus:outline-hidden focus:ring-2 focus:ring-[#2F5BFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#18202A] mb-1">
                  Defect Category
                </label>
                <select
                  value={scrapCategory}
                  onChange={(e) => setScrapCategory(e.target.value as WasteDefectCategory)}
                  className="w-full h-10 px-3 bg-white border border-[#D0D5DD] rounded-lg text-[13px] text-[#18202A] focus:outline-hidden focus:ring-2 focus:ring-[#2F5BFF]"
                >
                  <option value="Off-Spec Viscosity">Off-Spec Viscosity</option>
                  <option value="Underfill Rejection">Underfill Rejection</option>
                  <option value="Overfill/Spill">Overfill/Spill</option>
                  <option value="Packaging Tear">Packaging Tear</option>
                  <option value="Contamination">Contamination</option>
                  <option value="Startup Purge">Startup Purge</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E4E7EB]">
                <button
                  type="button"
                  onClick={() => setIsScrapModalOpen(false)}
                  className="h-9 px-3.5 text-[13px] font-medium text-[#5F6875] hover:bg-[#F2F4F7] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isMutationPending('addWasteRecord')}
                  className="h-9 px-4 text-[13px] font-semibold text-white bg-[#D92D20] hover:bg-[#B42318] rounded-lg transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isMutationPending('addWasteRecord') ? 'Recording...' : 'Record Scrap Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADJUST STOCK */}
      {isAdjustModalOpen && selectedMaterialForAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-[#E4E7EB] overflow-hidden">
            <div className="p-4 border-b border-[#E4E7EB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-[#2F5BFF]" />
                <h3 className="text-[16px] font-bold text-[#18202A]">Adjust Inventory Stock</h3>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="p-1 hover:bg-[#F2F4F7] rounded-md text-[#8A93A0] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjust} className="p-5 space-y-4">
              <div>
                <div className="text-[14px] font-semibold text-[#18202A]">
                  {selectedMaterialForAdjust.name}
                </div>
                <div className="text-[12px] font-mono text-[#5F6875]">
                  SKU: {selectedMaterialForAdjust.code} · Current: {selectedMaterialForAdjust.currentStock.toLocaleString()}{' '}
                  {selectedMaterialForAdjust.unitOfMeasure}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#18202A] mb-1">
                  New Adjusted Stock Count ({selectedMaterialForAdjust.unitOfMeasure})
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={adjustNewStock}
                  onChange={(e) => setAdjustNewStock(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-white border border-[#D0D5DD] rounded-lg text-[13px] text-[#18202A] focus:outline-hidden focus:ring-2 focus:ring-[#2F5BFF]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#18202A] mb-1">
                  Adjustment Reason
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#D0D5DD] rounded-lg text-[13px] text-[#18202A] focus:outline-hidden focus:ring-2 focus:ring-[#2F5BFF]"
                >
                  <option value="Physical Stock Opname Count">Physical Stock Opname Count</option>
                  <option value="Damaged / Expired Removal">Damaged / Expired Removal</option>
                  <option value="Supplier Reconciliation">Supplier Reconciliation</option>
                  <option value="Production Spill Write-off">Production Spill Write-off</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E4E7EB]">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="h-9 px-3.5 text-[13px] font-medium text-[#5F6875] hover:bg-[#F2F4F7] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isMutationPending(`adjustMaterialStock:${selectedMaterialForAdjust.id}`)}
                  className="h-9 px-4 text-[13px] font-semibold text-white bg-[#2F5BFF] hover:bg-[#2448D8] rounded-lg transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isMutationPending(`adjustMaterialStock:${selectedMaterialForAdjust.id}`) ? 'Applying...' : 'Apply Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
