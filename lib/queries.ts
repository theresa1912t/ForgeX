import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/apiClient';
import type {
  Organization,
  Factory,
  User,
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
  DeviceConnection,
  MachineConnectivityProfile,
  SensorReading,
} from '@/lib/types';

export const QUERY_KEYS = {
  organization: ['organization'],
  factories: ['factories'],
  users: ['users'],
  productionLines: ['productionLines'],
  machines: ['machines'],
  products: ['products'],
  materials: ['materials'],
  materialBatches: ['materialBatches'],
  alerts: ['alerts'],
  investigations: ['investigations'],
  actionTasks: ['actionTasks'],
  notifications: ['notifications'],
  maintenanceRecords: ['maintenanceRecords'],
  downtimeRecords: ['downtimeRecords'],
  wasteRecords: ['wasteRecords'],
  ingredientUsageRecords: ['ingredientUsageRecords'],
  energyRecords: ['energyRecords'],
  qualityRecords: ['qualityRecords'],
  thresholds: ['thresholds'],
  deviceConnections: ['deviceConnections'],
  machineProfiles: ['machineProfiles'],
} as const;

export function useOrganizationQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.organization,
    queryFn: () => apiGet<Organization>('/organization'),
  });
}

export function useFactoriesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.factories,
    queryFn: () => apiGet<Factory[]>('/factories'),
  });
}

export function useUsersQuery() {
  return useQuery({ queryKey: QUERY_KEYS.users, queryFn: () => apiGet<User[]>('/users') });
}

export function useProductionLinesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.productionLines,
    queryFn: () => apiGet<ProductionLine[]>('/production-lines'),
  });
}

export function useMachinesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.machines,
    queryFn: () => apiGet<Machine[]>('/machines'),
  });
}

export function useProductsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.products,
    queryFn: () => apiGet<Product[]>('/products'),
  });
}

export function useMaterialsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.materials,
    queryFn: () => apiGet<Material[]>('/materials'),
  });
}

export function useMaterialBatchesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.materialBatches,
    queryFn: () => apiGet<MaterialBatch[]>('/material-batches'),
  });
}

export function useAlertsQuery() {
  return useQuery({ queryKey: QUERY_KEYS.alerts, queryFn: () => apiGet<Alert[]>('/alerts') });
}

// Investigations are consumed throughout the app as a Record<id, Investigation> (lookup by id
// with a hero-id fallback, never iterated as a list) — `select` reshapes the array response to
// match that, so no consumer needs to change.
export function useInvestigationsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.investigations,
    queryFn: () => apiGet<Investigation[]>('/investigations'),
    select: (rows) => Object.fromEntries(rows.map((row) => [row.id, row])),
  });
}

export function useActionTasksQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.actionTasks,
    queryFn: () => apiGet<ActionTask[]>('/action-tasks'),
  });
}

export function useNotificationsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.notifications,
    queryFn: () => apiGet<NotificationItem[]>('/notifications'),
  });
}

export function useMaintenanceRecordsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.maintenanceRecords,
    queryFn: () => apiGet<MaintenanceRecord[]>('/maintenance-records'),
  });
}

export function useDowntimeRecordsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.downtimeRecords,
    queryFn: () => apiGet<DowntimeRecord[]>('/downtime-records'),
  });
}

export function useWasteRecordsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.wasteRecords,
    queryFn: () => apiGet<WasteRecord[]>('/waste-records'),
  });
}

export function useIngredientUsageRecordsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.ingredientUsageRecords,
    queryFn: () => apiGet<IngredientUsageRecord[]>('/ingredient-usage-records'),
  });
}

export function useEnergyRecordsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.energyRecords,
    queryFn: () => apiGet<EnergyRecord[]>('/energy-records'),
  });
}

export function useQualityRecordsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.qualityRecords,
    queryFn: () => apiGet<QualityRecord[]>('/quality-records'),
  });
}

export function useThresholdsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.thresholds,
    queryFn: () => apiGet<OperationalThresholds>('/thresholds'),
  });
}

export function useDeviceConnectionsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.deviceConnections,
    queryFn: () => apiGet<DeviceConnection[]>('/device-connections'),
  });
}

// machineProfiles is consumed as Record<machineId, profile> — same reasoning as investigations.
export function useMachineProfilesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.machineProfiles,
    queryFn: () => apiGet<MachineConnectivityProfile[]>('/machine-profiles'),
    select: (rows) => Object.fromEntries(rows.map((row) => [row.machineId, row])),
  });
}

// Deliberate exception to this file's pattern: not part of FactoryProvider's fetch-everything-
// on-mount model (see lib/factoryStore.tsx). This is genuinely time-varying live telemetry, only
// needed while viewing one machine's detail panel, so MachinesModule.tsx calls it directly.
export function useMachineReadingsQuery(machineId: string) {
  return useQuery({
    queryKey: ['machineReadings', machineId],
    queryFn: () => apiGet<SensorReading[]>(`/machines/${machineId}/readings`),
    refetchInterval: 3000,
  });
}
