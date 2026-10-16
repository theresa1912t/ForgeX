'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
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
  useOrganizationQuery,
  useFactoriesQuery,
  useUsersQuery,
  useProductionLinesQuery,
  useMachinesQuery,
  useProductsQuery,
  useMaterialsQuery,
  useMaterialBatchesQuery,
  useAlertsQuery,
  useInvestigationsQuery,
  useActionTasksQuery,
  useNotificationsQuery,
  useMaintenanceRecordsQuery,
  useDowntimeRecordsQuery,
  useWasteRecordsQuery,
  useIngredientUsageRecordsQuery,
  useEnergyRecordsQuery,
  useQualityRecordsQuery,
  useThresholdsQuery,
  useDeviceConnectionsQuery,
  useMachineProfilesQuery,
} from './queries';
import { useFactoryMutations } from './mutations';

const EMPTY_ARRAY: never[] = [];
const EMPTY_RECORD = {};
const EMPTY_ORGANIZATION: Organization = { id: '', name: '', industry: '', plan: '', createdAt: '' };
const EMPTY_THRESHOLDS: OperationalThresholds = {
  productionVariancePct: 0,
  defectRateThresholdPct: 0,
  vibrationAnomalyMmS: 0,
  downtimeAlertMinutes: 0,
  wasteThresholdKg: 0,
  energyAnomalyPct: 0,
};

interface FactoryContextType {
  // Tenant & Organization
  organization: Organization;
  factories: Factory[];
  selectedFactoryId: string;
  setSelectedFactoryId: (id: string) => void;
  selectedFactory: Factory;

  // Loading state (data-fetching only; nothing renders below this until it's false)
  isLoading: boolean;
  loadError: Error | null;

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
  const organizationQuery = useOrganizationQuery();
  const factoriesQuery = useFactoriesQuery();
  const usersQuery = useUsersQuery();
  const productionLinesQuery = useProductionLinesQuery();
  const machinesQuery = useMachinesQuery();
  const productsQuery = useProductsQuery();
  const materialsQuery = useMaterialsQuery();
  const materialBatchesQuery = useMaterialBatchesQuery();
  const alertsQuery = useAlertsQuery();
  const investigationsQuery = useInvestigationsQuery();
  const actionTasksQuery = useActionTasksQuery();
  const notificationsQuery = useNotificationsQuery();
  const maintenanceRecordsQuery = useMaintenanceRecordsQuery();
  const downtimeRecordsQuery = useDowntimeRecordsQuery();
  const wasteRecordsQuery = useWasteRecordsQuery();
  const ingredientUsageRecordsQuery = useIngredientUsageRecordsQuery();
  const energyRecordsQuery = useEnergyRecordsQuery();
  const qualityRecordsQuery = useQualityRecordsQuery();
  const thresholdsQuery = useThresholdsQuery();
  const deviceConnectionsQuery = useDeviceConnectionsQuery();
  const machineProfilesQuery = useMachineProfilesQuery();

  const allQueries = [
    organizationQuery,
    factoriesQuery,
    usersQuery,
    productionLinesQuery,
    machinesQuery,
    productsQuery,
    materialsQuery,
    materialBatchesQuery,
    alertsQuery,
    investigationsQuery,
    actionTasksQuery,
    notificationsQuery,
    maintenanceRecordsQuery,
    downtimeRecordsQuery,
    wasteRecordsQuery,
    ingredientUsageRecordsQuery,
    energyRecordsQuery,
    qualityRecordsQuery,
    thresholdsQuery,
    deviceConnectionsQuery,
    machineProfilesQuery,
  ];
  const isLoading = allQueries.some((q) => q.isLoading);
  const loadError = allQueries.find((q) => q.isError)?.error as Error | undefined;

  const organization = organizationQuery.data ?? EMPTY_ORGANIZATION;
  const factories = factoriesQuery.data ?? EMPTY_ARRAY;
  const users = usersQuery.data ?? EMPTY_ARRAY;
  const productionLines = productionLinesQuery.data ?? EMPTY_ARRAY;
  const machines = machinesQuery.data ?? EMPTY_ARRAY;
  const products = productsQuery.data ?? EMPTY_ARRAY;
  const materials = materialsQuery.data ?? EMPTY_ARRAY;
  const materialBatches = materialBatchesQuery.data ?? EMPTY_ARRAY;
  const alerts = alertsQuery.data ?? EMPTY_ARRAY;
  const investigations = investigationsQuery.data ?? EMPTY_RECORD;
  const actionTasks = actionTasksQuery.data ?? EMPTY_ARRAY;
  const notifications = notificationsQuery.data ?? EMPTY_ARRAY;
  const maintenanceRecords = maintenanceRecordsQuery.data ?? EMPTY_ARRAY;
  const downtimeRecords = downtimeRecordsQuery.data ?? EMPTY_ARRAY;
  const wasteRecords = wasteRecordsQuery.data ?? EMPTY_ARRAY;
  const ingredientUsageRecords = ingredientUsageRecordsQuery.data ?? EMPTY_ARRAY;
  const energyRecords = energyRecordsQuery.data ?? EMPTY_ARRAY;
  const qualityRecords = qualityRecordsQuery.data ?? EMPTY_ARRAY;
  const thresholds = thresholdsQuery.data ?? EMPTY_THRESHOLDS;
  const deviceConnections = deviceConnectionsQuery.data ?? EMPTY_ARRAY;
  const machineProfiles = machineProfilesQuery.data ?? EMPTY_RECORD;

  const [selectedFactoryId, setSelectedFactoryId] = useState<string>('fac-main');
  const [currentUserId, setCurrentUserId] = useState<string>('usr-1'); // Marcus Vance (Manager)
  // Role switching is cosmetic (no auth/RBAC enforcement yet — see PLANNING.md phase 3), so it's
  // a local override rather than a write to the fetched user list.
  const [roleOverride, setRoleOverride] = useState<UserRole | null>(null);

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

  // Computed User & Role
  const currentUser = useMemo(() => {
    const user = users.find((u) => u.id === currentUserId) || users[0];
    return roleOverride && user ? { ...user, role: roleOverride } : user;
  }, [users, currentUserId, roleOverride]);

  const currentRole = currentUser?.role ?? 'Viewer';

  const setCurrentRole = (role: UserRole) => {
    setRoleOverride(role);
  };

  const selectedFactory = useMemo(() => {
    return factories.find((f) => f.id === selectedFactoryId) || factories[0];
  }, [factories, selectedFactoryId]);

  const mutations = useFactoryMutations(showToast);

  const resetDemoToHeroState = async () => {
    await mutations.resetDemoToHeroState();
    setSelectedAlertId('alt-line3-loss');
    setSelectedInvestigationId('inv-line3-hero');
  };

  return (
    <FactoryContext.Provider
      value={{
        organization,
        factories,
        selectedFactoryId,
        setSelectedFactoryId,
        selectedFactory,
        isLoading,
        loadError: loadError ?? null,
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
        updateThresholds: mutations.updateThresholds,
        deviceConnections,
        machineProfiles,
        testConnection: mutations.testConnection,
        addDeviceConnection: mutations.addDeviceConnection,
        updateMachineProfileGateway: mutations.updateMachineProfileGateway,
        addMaterialBatch: mutations.addMaterialBatch,
        addWasteRecord: mutations.addWasteRecord,
        adjustMaterialStock: mutations.adjustMaterialStock,
        approveRecommendation: mutations.approveRecommendation,
        createActionTaskFromRecommendation: mutations.createActionTaskFromRecommendation,
        updateTaskStatus: mutations.updateTaskStatus,
        assignTask: mutations.assignTask,
        completeTaskWithOutcome: mutations.completeTaskWithOutcome,
        markNotificationAsRead: mutations.markNotificationAsRead,
        markAllNotificationsAsRead: mutations.markAllNotificationsAsRead,
        addNotification: mutations.addNotification,
        ingestData: mutations.ingestData,
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
