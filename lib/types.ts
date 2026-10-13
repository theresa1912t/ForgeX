export type UserRole = 'Admin' | 'Manager' | 'Viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  avatar?: string;
  organizationId: string;
}

export interface Organization {
  id: string;
  name: string;
  industry: string;
  plan: string;
  createdAt: string;
}

export interface Factory {
  id: string;
  organizationId: string;
  name: string;
  location: string;
  timezone: string;
  activeLinesCount: number;
  totalCapacityUnitsPerDay: number;
}

export interface ProductionLine {
  id: string;
  factoryId: string;
  name: string;
  code: string;
  type: string;
  status: 'Running' | 'Degraded' | 'Down' | 'Maintenance';
  targetUnitsPerHour: number;
  currentUnitsPerHour: number;
  efficiencyPct: number;
  shift: string;
  currentProduct: string;
  downtimeMinutesToday: number;
  defectRatePct: number;
  productionLossUnits: number;
  activeAlertCount: number;
  description: string;
}

export interface Machine {
  id: string;
  lineId: string;
  name: string;
  code: string;
  type: string;
  status: 'Normal' | 'Abnormal Behavior' | 'Elevated Risk' | 'Offline';
  healthScorePct: number;
  temperatureC: number;
  vibrationMmS: number;
  pressureBar: number;
  cycleTimeSec: number;
  operatingSpeedRpm: number;
  downtimeHoursThisWeek: number;
  lastMaintenanceDate: string;
  nextScheduledMaintenance: string;
  activeAlertCount: number;
  productionLossContributionPct: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitRevenue: number;
  standardCycleTimeSec: number;
  shelfLifeDays: number;
  targetBatchSize: number;
}

export interface Material {
  id: string;
  name: string;
  code: string;
  category: string;
  supplier: string;
  unitCost: number;
  unitOfMeasure: string;
  currentStock: number;
  activeBatchCount: number;
  qualityStatus: 'Approved' | 'Quarantine' | 'Testing';
}

export interface MaterialBatch {
  id: string;
  materialId: string;
  batchCode: string;
  supplier: string;
  receivedDate: string;
  expiryDate: string;
  quantity: number;
  unitOfMeasure: string;
  status: 'Approved' | 'Quarantine' | 'In Use' | 'Flagged';
  viscosityDeviationPct?: number;
  associatedProducts: string[];
  defectRateImpact?: string;
  relatedAlertIds: string[];
}

export type AlertSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type AlertCategory = 'Production' | 'Machine' | 'Quality' | 'Material' | 'Downtime' | 'Waste' | 'Energy';
export type AlertStatus = 'New' | 'Investigating' | 'Action Required' | 'In Progress' | 'Resolved' | 'Dismissed';

export interface Alert {
  id: string;
  title: string;
  severity: AlertSeverity;
  category: AlertCategory;
  description: string;
  factoryId: string;
  lineId: string;
  lineName: string;
  machineId?: string;
  machineName?: string;
  productId?: string;
  productName?: string;
  detectedAt: string;
  estimatedImpact: string;
  revenueAtRisk: number;
  confidence: number;
  status: AlertStatus;
  investigationId?: string;
  resolvedAt?: string;
}

export type EvidenceSignalType = 'FACT' | 'INFERENCE' | 'RECOMMENDATION';

export interface EvidenceItem {
  id: string;
  signalType: EvidenceSignalType;
  title: string;
  detail: string;
  metric?: string;
  delta?: string;
  source: string;
  verified: boolean;
}

export interface RootCause {
  id: string;
  rank: number;
  title: string;
  confidence: number;
  status: 'Likely Contributor' | 'Secondary Factor' | 'Ruled Out' | 'Under Review';
  summary: string;
  supportingEvidence: string[];
  historicalPrecedent: string;
}

export interface BusinessImpact {
  lostUnits: number;
  estimatedRevenueLoss: number;
  additionalReworkUnits: number;
  additionalReworkCost: number;
  materialWasteKg: number;
  materialWasteCost: number;
  downtimeMinutes: number;
  downtimeCost: number;
  currentLossRatePerHour: number;
  potentialAdditionalLoss4h: number;
}

export interface RecommendedAction {
  id: string;
  investigationId: string;
  title: string;
  reason: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  owner: 'Maintenance' | 'Quality' | 'Operations';
  estimatedEffort: string;
  expectedImpact: string;
  evidence: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Task Created';
}

export interface Investigation {
  id: string;
  alertId: string;
  title: string;
  factoryId: string;
  lineId: string;
  lineName: string;
  machineId: string;
  machineName: string;
  productId: string;
  productName: string;
  shift: string;
  startTime: string;
  duration: string;
  outputVariancePct: number;
  status: 'Active' | 'Investigating' | 'Resolved';
  summary: string;
  timeline: Array<{
    time: string;
    source: string;
    event: string;
    impactLevel: 'low' | 'medium' | 'high' | 'critical';
    parameter?: string;
  }>;
  sensorDeltas: Array<{
    parameter: string;
    baseline: string;
    current: string;
    changePct: string;
    isAbnormal: boolean;
    unit: string;
  }>;
  rootCauses: RootCause[];
  evidence: EvidenceItem[];
  businessImpact: BusinessImpact;
  recommendations: RecommendedAction[];
  resolvedAt?: string;
  resolutionOutcome?: {
    recoveredUnitsPerHour: number;
    notes: string;
    completedBy: string;
    date: string;
  };
}

export type ActionTaskStatus = 'Pending' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled';

export interface ActionTask {
  id: string;
  title: string;
  description: string;
  investigationId: string;
  alertId: string;
  recommendationId?: string;
  lineName: string;
  machineName: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  assignedTo: string;
  assignedRole: string;
  dueDate: string;
  expectedImpact: string;
  actualResult?: string;
  resolutionNotes?: string;
  status: ActionTaskStatus;
  createdAt: string;
  completedAt?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  category: AlertCategory;
  timestamp: string;
  read: boolean;
  linkModule?: string;
  linkId?: string;
}

export interface OperationalThresholds {
  productionVariancePct: number;
  defectRateThresholdPct: number;
  vibrationAnomalyMmS: number;
  downtimeAlertMinutes: number;
  wasteThresholdKg: number;
  energyAnomalyPct: number;
}

export interface MaintenanceRecord {
  id: string;
  machineId: string;
  machineName: string;
  date: string;
  type: 'Preventive' | 'Corrective' | 'Emergency' | 'Inspection';
  issue: string;
  failureType: string;
  repairDurationMinutes: number;
  technician: string;
  notes: string;
  status: 'Completed' | 'Scheduled' | 'In Progress';
}

export interface DowntimeRecord {
  id: string;
  machineId: string;
  machineName: string;
  lineId: string;
  lineName: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  category: 'Equipment failure' | 'Setup / changeover' | 'Material shortage' | 'Quality issue' | 'Operator issue' | 'Planned maintenance' | 'Other';
  reason: string;
  description: string;
  estimatedImpactCost: number;
}

export interface IngredientUsageRecord {
  id: string;
  materialId: string;
  materialName: string;
  batchCode: string;
  machineId: string;
  machineName: string;
  lineId: string;
  lineName: string;
  plannedQuantityKg: number;
  actualQuantityKg: number;
  yieldVariancePct: number;
  scrapKg: number;
  scrapCost: number;
  unitOfMeasure: string;
  status: 'Normal' | 'Variance Warning' | 'Anomaly Loss';
  timestamp: string;
}

export type WasteDefectCategory =
  | 'Overfill/Spill'
  | 'Contamination'
  | 'Underfill Rejection'
  | 'Startup Purge'
  | 'Packaging Tear'
  | 'Off-Spec Viscosity';

export interface WasteRecord {
  id: string;
  materialId?: string;
  materialName: string;
  productionBatchCode: string;
  lineName: string;
  machineId?: string;
  machineName?: string;
  wasteQuantityKg: number;
  wasteType: string;
  defectCategory?: WasteDefectCategory;
  wasteReason: 'Expired' | 'Spoiled' | 'Overproduction' | 'Preparation mistake' | 'Wrong order' | 'Damaged' | 'Process loss' | 'Other';
  wasteCost: number;
  relatedAnomaly?: string;
  relatedInvestigationId?: string;
  recoveryActionTaken?: string;
  timestamp: string;
}

export interface EnergyRecord {
  id: string;
  lineName: string;
  machineName: string;
  kwhConsumed: number;
  costEstimate: number;
  varianceFromBaselinePct: number;
  status: 'Normal' | 'Elevated' | 'Spike';
  timestamp: string;
}

export interface QualityRecord {
  id: string;
  productName: string;
  lineName: string;
  batchCode: string;
  sampleSize: number;
  defectCount: number;
  defectRatePct: number;
  topDefectType: string;
  disposition: 'Approved' | 'Hold' | 'Scrap' | 'Rework';
  timestamp: string;
}

// --- Industrial Connectivity & Sensor Tag Types ---
export type ProtocolType = 'OPC-UA' | 'MQTT' | 'Modbus-TCP' | 'REST-Historian';
export type ConnectionStatus = 'Connected' | 'Degraded' | 'Offline' | 'Connecting';

export interface DeviceConnection {
  id: string;
  name: string;
  protocol: ProtocolType;
  endpointUrl: string;
  status: ConnectionStatus;
  pollingFrequencyMs: number;
  lastHeartbeat: string;
  pingLatencyMs: number;
  securityMode: string;
  assignedMachines: string[];
}

export interface SensorTagMapping {
  metricKey: string;
  label: string;
  tagAddress: string;
  dataType: 'Float32' | 'Int16' | 'Boolean' | 'Double';
  samplingRateHz: number;
  lastRawValue: string | number;
  unit: string;
  sourceGateway: string;
  status: 'Streaming' | 'Stale' | 'Offline';
}

export interface MachineConnectivityProfile {
  machineId: string;
  plcType: string;
  ipAddress: string;
  gatewayId: string;
  protocol: ProtocolType;
  lastTelemetryTimestamp: string;
  healthScoreMethodology: {
    vibrationWeightPct: number;
    cycleTimeWeightPct: number;
    temperatureWeightPct: number;
    pressureWeightPct: number;
    downtimeWeightPct: number;
    formulaSummary: string;
  };
  tags: SensorTagMapping[];
}
