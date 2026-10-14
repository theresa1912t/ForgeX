'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Organization,
  Factory,
  User,
  UserRole,
  ProductionLine,
  Machine,
  Product,
  Material,
  MaterialBatch,
  Alert,
  Investigation,
  ActionTask,
  NotificationItem,
  MaintenanceRecord,
  DowntimeRecord,
  WasteRecord,
  IngredientUsageRecord,
  EnergyRecord,
  QualityRecord,
  OperationalThresholds,
  RecommendedAction,
  DeviceConnection,
  MachineConnectivityProfile,
} from './types';
import {
  initialDeviceConnections,
  initialMachineProfiles,
} from './connectivityData';
import {
  initialOrganization,
  initialFactories,
  initialUsers,
  initialProducts,
  initialMaterials,
  initialMaterialBatches,
  initialProductionLines,
  initialMachines,
  initialAlerts,
  heroInvestigation,
  initialActionTasks,
  initialNotifications,
  initialMaintenanceRecords,
  initialDowntimeRecords,
  initialWasteRecords,
  initialIngredientUsageRecords,
  initialEnergyRecords,
  initialQualityRecords,
  initialThresholds,
} from './mockData';

interface FactoryContextType {
  // Tenant & Organization
  organization: Organization;
  factories: Factory[];
  selectedFactoryId: string;
  setSelectedFactoryId: (id: string) => void;
  selectedFactory: Factory;
  
  // User & Role
  users: User[];
  currentUser: User;
  setCurrentUserId: (id: string) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;

  // Active module view
  activeTab: string;
  setActiveTab: (tab: string) => void;
  previousTab: string;
  setPreviousTab: (tab: string) => void;
  openInvestigation: (id: string, fromTab?: string) => void;
  selectedAlertId: string | null;
  setSelectedAlertId: (id: string | null) => void;
  selectedInvestigationId: string | null;
  setSelectedInvestigationId: (id: string | null) => void;
  selectedMachineId: string | null;
  setSelectedMachineId: (id: string | null) => void;
  selectedLineId: string | null;
  setSelectedLineId: (id: string | null) => void;

  // Slide-over Investigation Drawer State
  investigationDrawerOpen: boolean;
  setInvestigationDrawerOpen: (open: boolean) => void;
  activeDrawerInvestigationId: string | null;
  openInvestigationDrawer: (investigationId?: string) => void;
  closeInvestigationDrawer: () => void;

  // System Toast Feedback
  toast: { id: string; message: string; type: 'success' | 'info' | 'warning' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  clearToast: () => void;

  // Global Shift & Time Temporal Scope (Single Source of Truth)
  selectedShift: 'shift-b' | 'shift-a' | 'shift-c' | 'all';
  setSelectedShift: (shift: 'shift-b' | 'shift-a' | 'shift-c' | 'all') => void;
  selectedPeriod: 'today' | 'yesterday' | '7d' | 'last24h' | 'mtd';
  setSelectedPeriod: (period: 'today' | 'yesterday' | '7d' | 'last24h' | 'mtd') => void;
  timeFilterLabel: string;
  setTimeFilterPreset: (presetKey: string) => void;
  filterMultiplier: number;

  // Industrial Device Connections & Telemetry Profiles
  deviceConnections: DeviceConnection[];
  machineProfiles: Record<string, MachineConnectivityProfile>;
  testConnection: (connectionId: string) => void;
  addDeviceConnection: (conn: Omit<DeviceConnection, 'id'>) => void;
  updateMachineProfileGateway: (machineId: string, gatewayId: string) => void;
  // Core Data
  productionLines: ProductionLine[];
  machines: Machine[];
  products: Product[];
  materials: Material[];
  materialBatches: MaterialBatch[];
  alerts: Alert[];
  investigations: Record<string, Investigation>;
  actionTasks: ActionTask[];
  notifications: NotificationItem[];
  maintenanceRecords: MaintenanceRecord[];
  downtimeRecords: DowntimeRecord[];
  wasteRecords: WasteRecord[];
  ingredientUsageRecords: IngredientUsageRecord[];
  energyRecords: EnergyRecord[];
  qualityRecords: QualityRecord[];
  thresholds: OperationalThresholds;
  updateThresholds: (thresholds: Partial<OperationalThresholds>) => void;

  // Material & Waste Mutations
  addMaterialBatch: (batch: Omit<MaterialBatch, 'id'>) => void;
  addWasteRecord: (waste: Omit<WasteRecord, 'id' | 'timestamp'>) => void;
  adjustMaterialStock: (materialId: string, newStock: number, reason?: string) => void;

  // Hero Workflow Mutations
  approveRecommendation: (investigationId: string, recommendationId: string) => void;
  createActionTaskFromRecommendation: (
    investigationId: string,
    rec: RecommendedAction,
    assignedTo: string,
    dueDate: string
  ) => void;
  updateTaskStatus: (taskId: string, status: ActionTask['status']) => void;
  assignTask: (taskId: string, assignedTo: string, role: string) => void;
  completeTaskWithOutcome: (
    taskId: string,
    actualResult: string,
    resolutionNotes: string,
    recoveredUnitsPerHour?: number
  ) => void;
  
  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;

  // Data Ingestion
  ingestData: (datasetType: string, count: number, summaryNotes?: string) => void;

  // Demo Reset
  resetDemoToHeroState: () => void;
}

const FactoryContext = createContext<FactoryContextType | undefined>(undefined);

export function FactoryProvider({ children }: { children: React.ReactNode }) {
  const [organization, setOrganization] = useState<Organization>(initialOrganization);
  const [factories, setFactories] = useState<Factory[]>(initialFactories);
  const [selectedFactoryId, setSelectedFactoryId] = useState<string>('fac-main');
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUserId, setCurrentUserId] = useState<string>('usr-1'); // Marcus Vance (Manager)
  
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [previousTab, setPreviousTab] = useState<string>('dashboard');
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [selectedInvestigationId, setSelectedInvestigationId] = useState<string | null>(null);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);

  // Investigation Slide-over Drawer State
  const [investigationDrawerOpen, setInvestigationDrawerOpen] = useState<boolean>(false);
  const [activeDrawerInvestigationId, setActiveDrawerInvestigationId] = useState<string | null>('inv-line3-hero');

  const openInvestigationDrawer = (id?: string) => {
    if (id) {
      setActiveDrawerInvestigationId(id);
    }
    setInvestigationDrawerOpen(true);
  };

  const closeInvestigationDrawer = () => {
    setInvestigationDrawerOpen(false);
  };

  // System Toast Feedback State
  const [toast, setToast] = useState<{ id: string; message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 4500);
  };

  const clearToast = () => {
    setToast(null);
  };

  // Global Shift & Period Temporal Scope (Single Source of Truth)
  const [selectedShift, setSelectedShift] = useState<'shift-b' | 'shift-a' | 'shift-c' | 'all'>('shift-b');
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'yesterday' | '7d' | 'last24h' | 'mtd'>('today');
  const [timeFilterLabel, setTimeFilterLabel] = useState<string>('Today (Shift B · 07:00 - 15:00)');

  const setTimeFilterPreset = (presetKey: string) => {
    switch (presetKey) {
      case 'shift-b-live':
      case 'Today (Shift B · 07:00 - 15:00)':
        setSelectedShift('shift-b');
        setSelectedPeriod('today');
        setTimeFilterLabel('Today (Shift B · 07:00 - 15:00)');
        break;
      case 'shift-a':
      case 'Shift A (Previous · 23:00 - 07:00)':
        setSelectedShift('shift-a');
        setSelectedPeriod('today');
        setTimeFilterLabel('Shift A (Previous · 23:00 - 07:00)');
        break;
      case 'shift-c':
      case 'Shift C (Evening · 15:00 - 23:00)':
        setSelectedShift('shift-c');
        setSelectedPeriod('yesterday');
        setTimeFilterLabel('Shift C (Evening · 15:00 - 23:00)');
        break;
      case 'last24h':
      case 'Last 24 Hours':
        setSelectedShift('all');
        setSelectedPeriod('last24h');
        setTimeFilterLabel('Last 24 Hours (All Shifts)');
        break;
      case '7d':
      case 'Last 7 Days':
        setSelectedShift('all');
        setSelectedPeriod('7d');
        setTimeFilterLabel('Last 7 Days');
        break;
      case 'mtd':
      case 'Month to Date (October 2026)':
      case 'Month to Date':
        setSelectedShift('all');
        setSelectedPeriod('mtd');
        setTimeFilterLabel('Month to Date (October 2026)');
        break;
      default:
        setSelectedShift('shift-b');
        setSelectedPeriod('today');
        setTimeFilterLabel(presetKey || 'Today (Shift B · 07:00 - 15:00)');
    }
  };

  const filterMultiplier = useMemo(() => {
    if (selectedPeriod === 'yesterday') return 0.94;
    if (selectedPeriod === '7d') return 6.8;
    if (selectedPeriod === 'last24h') return 2.85;
    if (selectedPeriod === 'mtd') return 24.5;
    if (selectedShift === 'shift-a') return 0.98;
    if (selectedShift === 'shift-c') return 0.92;
    if (selectedShift === 'all') return 2.85;
    return 1.0;
  }, [selectedPeriod, selectedShift]);

  const openInvestigation = (id: string, fromTab?: string) => {
    setPreviousTab(fromTab || activeTab);
    setSelectedInvestigationId(id);
    setActiveTab('investigations');
  };

  // Entities
  const [productionLines, setProductionLines] = useState<ProductionLine[]>(initialProductionLines);
  const [machines, setMachines] = useState<Machine[]>(initialMachines);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [materialBatches, setMaterialBatches] = useState<MaterialBatch[]>(initialMaterialBatches);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [investigations, setInvestigations] = useState<Record<string, Investigation>>({
    'inv-line3-hero': heroInvestigation,
  });
  const [actionTasks, setActionTasks] = useState<ActionTask[]>(initialActionTasks);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(initialMaintenanceRecords);
  const [downtimeRecords, setDowntimeRecords] = useState<DowntimeRecord[]>(initialDowntimeRecords);
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>(initialWasteRecords);
  const [ingredientUsageRecords, setIngredientUsageRecords] = useState<IngredientUsageRecord[]>(initialIngredientUsageRecords);
  const [energyRecords, setEnergyRecords] = useState<EnergyRecord[]>(initialEnergyRecords);
  const [qualityRecords, setQualityRecords] = useState<QualityRecord[]>(initialQualityRecords);
  const [thresholds, setThresholds] = useState<OperationalThresholds>(initialThresholds);
  const [deviceConnections, setDeviceConnections] = useState<DeviceConnection[]>(initialDeviceConnections);
  const [machineProfiles, setMachineProfiles] = useState<Record<string, MachineConnectivityProfile>>(initialMachineProfiles);

  const testConnection = (connectionId: string) => {
    const target = deviceConnections.find((c) => c.id === connectionId);
    const newLatency = Math.floor(Math.random() * 15) + 8;
    setDeviceConnections((prev) =>
      prev.map((c) =>
        c.id === connectionId
          ? { ...c, status: 'Connected', pingLatencyMs: newLatency, lastHeartbeat: 'Just now (verified)' }
          : c
      )
    );
    showToast(`Gateway "${target?.name || connectionId}" verified responsive (${newLatency}ms latency)`, 'success');
  };

  const addDeviceConnection = (conn: Omit<DeviceConnection, 'id'>) => {
    const newConn: DeviceConnection = {
      ...conn,
      id: `conn-user-${Date.now()}`,
    };
    setDeviceConnections((prev) => [newConn, ...prev]);
    showToast(`Industrial Gateway "${newConn.name}" connected successfully`, 'success');
  };

  const updateMachineProfileGateway = (machineId: string, gatewayId: string) => {
    setMachineProfiles((prev) => {
      const existing = prev[machineId];
      if (!existing) return prev;
      return {
        ...prev,
        [machineId]: { ...existing, gatewayId },
      };
    });
    showToast(`Machine telemetry binding updated`, 'success');
  };

  // Material & Waste Operations
  const addMaterialBatch = (batchData: Omit<MaterialBatch, 'id'>) => {
    const newBatch: MaterialBatch = {
      ...batchData,
      id: `mb-user-${Date.now()}`,
    };
    setMaterialBatches((prev) => [newBatch, ...prev]);
    // Synchronously increase the corresponding material warehouse stock
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === batchData.materialId
          ? {
              ...m,
              currentStock: m.currentStock + batchData.quantity,
              activeBatchCount: m.activeBatchCount + 1,
            }
          : m
      )
    );
    showToast(`Material lot ${newBatch.batchCode} received (+${newBatch.quantity} ${newBatch.unitOfMeasure})`, 'success');
  };

  const addWasteRecord = (wasteData: Omit<WasteRecord, 'id' | 'timestamp'>) => {
    const newRecord: WasteRecord = {
      ...wasteData,
      id: `w-user-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setWasteRecords((prev) => [newRecord, ...prev]);
    showToast(`Scrap entry logged for ${newRecord.lineName}: ${newRecord.wasteQuantityKg} kg ($${newRecord.wasteCost.toFixed(2)})`, 'warning');
  };

  const adjustMaterialStock = (materialId: string, newStock: number, reason?: string) => {
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === materialId
          ? { ...m, currentStock: Math.max(0, newStock) }
          : m
      )
    );
    const targetMat = materials.find((m) => m.id === materialId);
    showToast(`Inventory stock adjusted for ${targetMat?.name || materialId}: ${newStock} ${targetMat?.unitOfMeasure || 'units'}${reason ? ` (${reason})` : ''}`, 'info');
  };

  // Computed User & Role
  const currentUser = useMemo(() => {
    return users.find((u) => u.id === currentUserId) || users[0];
  }, [users, currentUserId]);

  const currentRole = currentUser.role;

  const setCurrentRole = (role: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUserId ? { ...u, role } : u))
    );
  };

  const selectedFactory = useMemo(() => {
    return factories.find((f) => f.id === selectedFactoryId) || factories[0];
  }, [factories, selectedFactoryId]);

  const updateThresholds = (newThresholds: Partial<OperationalThresholds>) => {
    setThresholds((prev) => ({ ...prev, ...newThresholds }));
  };

  // Add notification helper
  const addNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newItem: NotificationItem = {
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      read: false,
      ...notif,
    };
    setNotifications((prev) => [newItem, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // HERO WORKFLOW: Approve Recommendation & Create Task
  const approveRecommendation = (investigationId: string, recommendationId: string) => {
    const inv = investigations[investigationId];
    if (!inv) return;

    const rec = inv.recommendations.find((r) => r.id === recommendationId);
    if (!rec) return;

    // Update recommendation status
    setInvestigations((prev) => {
      const targetInv = prev[investigationId];
      if (!targetInv) return prev;
      return {
        ...prev,
        [investigationId]: {
          ...targetInv,
          status: 'Investigating',
          recommendations: targetInv.recommendations.map((r) =>
            r.id === recommendationId ? { ...r, status: 'Approved' } : r
          ),
        },
      };
    });

    // Update alert status
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === inv.alertId ? { ...a, status: 'In Progress' } : a
      )
    );

    // Auto create or activate task in Action Center
    const existingTask = actionTasks.find(
      (t) => t.investigationId === investigationId && t.recommendationId === recommendationId
    );

    if (existingTask) {
      setActionTasks((prev) =>
        prev.map((t) =>
          t.id === existingTask.id ? { ...t, status: 'Assigned' } : t
        )
      );
    } else {
      createActionTaskFromRecommendation(
        investigationId,
        rec,
        'Carlos Ruiz',
        'Today (Within 1 hour)'
      );
    }

    addNotification({
      title: 'Action Approved by Operations Manager',
      message: `Recommendation "${rec.title}" approved and dispatched to ${rec.owner}.`,
      severity: 'High',
      category: 'Production',
      linkModule: 'actions',
    });

    showToast(`Recommendation "${rec.title}" approved and assigned to Carlos Ruiz`, 'success');
  };

  const createActionTaskFromRecommendation = (
    investigationId: string,
    rec: RecommendedAction,
    assignedTo: string,
    dueDate: string
  ) => {
    const inv = investigations[investigationId];
    const newTask: ActionTask = {
      id: `tsk-${Date.now()}`,
      title: rec.title,
      description: `${rec.reason} Evidence: ${rec.evidence}`,
      investigationId,
      alertId: inv ? inv.alertId : '',
      recommendationId: rec.id,
      lineName: inv ? inv.lineName : 'Line 3',
      machineName: inv ? inv.machineName : 'Filling Machine M-03',
      priority: rec.priority,
      assignedTo: assignedTo || 'Carlos Ruiz',
      assignedRole: rec.owner === 'Maintenance' ? 'Maintenance Lead' : 'QA Lead',
      dueDate: dueDate || 'Today',
      expectedImpact: rec.expectedImpact,
      status: 'Assigned',
      createdAt: 'Today (Just now)',
    };

    setActionTasks((prev) => [newTask, ...prev]);

    setInvestigations((prev) => {
      const target = prev[investigationId];
      if (!target) return prev;
      return {
        ...prev,
        [investigationId]: {
          ...target,
          recommendations: target.recommendations.map((r) =>
            r.id === rec.id ? { ...r, status: 'Task Created' } : r
          ),
        },
      };
    });

    showToast(`Maintenance task created in Action Center for ${assignedTo || 'Carlos Ruiz'}`, 'success');
  };

  const updateTaskStatus = (taskId: string, status: ActionTask['status']) => {
    setActionTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
  };

  const assignTask = (taskId: string, assignedTo: string, role: string) => {
    setActionTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, assignedTo, assignedRole: role, status: 'Assigned' }
          : t
      )
    );
  };

  // HERO STEP 15-19: Complete task with outcome and update investigation & factory performance
  const completeTaskWithOutcome = (
    taskId: string,
    actualResult: string,
    resolutionNotes: string,
    recoveredUnitsPerHour: number = 920
  ) => {
    const task = actionTasks.find((t) => t.id === taskId);
    if (!task) return;

    // 1. Mark task completed
    setActionTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: 'Completed',
              actualResult,
              resolutionNotes,
              completedAt: 'Just now',
            }
          : t
      )
    );

    // 2. If connected to Line 3 Hero Investigation
    if (task.investigationId === 'inv-line3-hero' || task.alertId === 'alt-line3-loss') {
      // Mark Investigation Resolved
      setInvestigations((prev) => {
        const inv = prev['inv-line3-hero'];
        if (!inv) return prev;
        return {
          ...prev,
          'inv-line3-hero': {
            ...inv,
            status: 'Resolved',
            resolvedAt: 'Today at 12:45 PM',
            resolutionOutcome: {
              recoveredUnitsPerHour,
              notes: resolutionNotes || 'Filling valve M-03-V2 inspected and diaphragm seal kit replaced. Vibration normalized.',
              completedBy: currentUser.name,
              date: 'Today',
            },
          },
        };
      });

      // Mark Alert Resolved
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === 'alt-line3-loss'
            ? {
                ...a,
                status: 'Resolved',
                resolvedAt: 'Today at 12:45 PM',
              }
            : a
        )
      );

      // Improve Line 3 performance live on dashboard!
      setProductionLines((prev) =>
        prev.map((l) =>
          l.id === 'line-3'
            ? {
                ...l,
                status: 'Running',
                currentUnitsPerHour: 5380,
                efficiencyPct: 99.6,
                defectRatePct: 0.45,
                productionLossUnits: 140,
                activeAlertCount: 0,
              }
            : l
        )
      );

      // Improve Machine M-03 telemetry
      setMachines((prev) =>
        prev.map((m) =>
          m.id === 'mach-m03'
            ? {
                ...m,
                status: 'Normal',
                healthScorePct: 96,
                vibrationMmS: 1.85,
                cycleTimeSec: 0.67,
                activeAlertCount: 0,
                productionLossContributionPct: 3,
              }
            : m
        )
      );

      // Add Maintenance Log entry
      const newMaintRecord: MaintenanceRecord = {
        id: `maint-${Date.now()}`,
        machineId: 'mach-m03',
        machineName: 'Aseptic Rotary Liquid Filler M-03',
        date: '2026-10-08',
        type: 'Corrective',
        issue: 'Replaced degraded aseptic filling valve M-03-V2 diaphragm seal',
        failureType: 'Aseptic Valve Diaphragm Replacement',
        repairDurationMinutes: 28,
        technician: task.assignedTo || 'Carlos Ruiz',
        notes: resolutionNotes || 'Installed OEM EPDM aseptic diaphragm kit #LP-DIA-04. Recalibrated stroke pressure to 3.2 bar.',
        status: 'Completed',
      };
      setMaintenanceRecords((prev) => [newMaintRecord, ...prev]);

      // Fire completion notification
      addNotification({
        title: 'Action Task COMPLETED - Line 3 Restored',
        message: `Filling valve M-03-V2 serviced. Line 3 recovered ${recoveredUnitsPerHour} units/hr. Alert resolved.`,
        severity: 'Low',
        category: 'Production',
        linkModule: 'dashboard',
      });

      showToast(`Action completed: Line 3 recovered +${recoveredUnitsPerHour} units/hr and marked as Resolved`, 'success');
    } else {
      // General task completion
      if (task.alertId) {
        setAlerts((prev) =>
          prev.map((a) =>
            a.id === task.alertId ? { ...a, status: 'Resolved' } : a
          )
        );
      }
      addNotification({
        title: 'Operational Task Completed',
        message: `Task "${task.title}" was marked completed by ${currentUser.name}.`,
        severity: 'Low',
        category: 'Production',
        linkModule: 'actions',
      });

      showToast(`Task "${task.title}" marked as completed`, 'success');
    }
  };

  // Ingest data handler (for CSV upload)
  const ingestData = (datasetType: string, count: number, summaryNotes?: string) => {
    addNotification({
      title: `CSV Ingestion Completed: ${datasetType}`,
      message: `Successfully processed ${count} records. AI cross-domain anomaly checks executed. ${summaryNotes || ''}`,
      severity: 'Low',
      category: 'Production',
      linkModule: 'dashboard',
    });

    showToast(`${count.toLocaleString()} ${datasetType} records imported successfully`, 'success');
  };

  // Reset to initial hero demo state
  const resetDemoToHeroState = () => {
    setProductionLines(initialProductionLines);
    setMachines(initialMachines);
    setAlerts(initialAlerts);
    setInvestigations({ 'inv-line3-hero': heroInvestigation });
    setActionTasks(initialActionTasks);
    setNotifications(initialNotifications);
    setMaintenanceRecords(initialMaintenanceRecords);
    setDeviceConnections(initialDeviceConnections);
    setMachineProfiles(initialMachineProfiles);
    setWasteRecords(initialWasteRecords);
    setIngredientUsageRecords(initialIngredientUsageRecords);
    setSelectedAlertId('alt-line3-loss');
    setSelectedInvestigationId('inv-line3-hero');
    addNotification({
      title: 'Demo State Reset',
      message: 'LactaPure Dairy scenario re-initialized to Hero Incident: Line 3 UHT Bottling loss (-18.9%).',
      severity: 'Low',
      category: 'Production',
      linkModule: 'dashboard',
    });

    showToast('Demo scenario reset to initial dairy incident state (Line 3 loss -18.9%)', 'info');
  };

  return (
    <FactoryContext.Provider
      value={{
        organization,
        factories,
        selectedFactoryId,
        setSelectedFactoryId,
        selectedFactory,
        users,
        currentUser,
        setCurrentUserId,
        currentRole,
        setCurrentRole,
        activeTab,
        setActiveTab,
        previousTab,
        setPreviousTab,
        openInvestigation,
        selectedAlertId,
        setSelectedAlertId,
        selectedInvestigationId,
        setSelectedInvestigationId,
        selectedMachineId,
        setSelectedMachineId,
        selectedLineId,
        setSelectedLineId,
        investigationDrawerOpen,
        setInvestigationDrawerOpen,
        activeDrawerInvestigationId,
        openInvestigationDrawer,
        closeInvestigationDrawer,
        toast,
        showToast,
        clearToast,
        selectedShift,
        setSelectedShift,
        selectedPeriod,
        setSelectedPeriod,
        timeFilterLabel,
        setTimeFilterPreset,
        filterMultiplier,
        productionLines,
        machines,
        products,
        materials,
        materialBatches,
        alerts,
        investigations,
        actionTasks,
        notifications,
        maintenanceRecords,
        downtimeRecords,
        wasteRecords,
        ingredientUsageRecords,
        energyRecords,
        qualityRecords,
        thresholds,
        updateThresholds,
        deviceConnections,
        machineProfiles,
        testConnection,
        addDeviceConnection,
        updateMachineProfileGateway,
        addMaterialBatch,
        addWasteRecord,
        adjustMaterialStock,
        approveRecommendation,
        createActionTaskFromRecommendation,
        updateTaskStatus,
        assignTask,
        completeTaskWithOutcome,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        ingestData,
        resetDemoToHeroState,
      }}
    >
      {children}
    </FactoryContext.Provider>
  );
}

export function useFactory() {
  const context = useContext(FactoryContext);
  if (!context) {
    throw new Error('useFactory must be used within a FactoryProvider');
  }
  return context;
}
