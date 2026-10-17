import { $Enums } from '@prisma/client';

function reverse<K extends string, V extends string>(map: Record<K, V>): Record<V, K> {
  return Object.fromEntries(
    Object.entries(map).map(([label, enumValue]) => [enumValue, label]),
  ) as Record<V, K>;
}

export const machineStatusMap = {
  'Normal': 'Normal',
  'Abnormal Behavior': 'AbnormalBehavior',
  'Elevated Risk': 'ElevatedRisk',
  'Offline': 'Offline',
} satisfies Record<string, $Enums.MachineStatus>;
export const machineStatusReverseMap = reverse(machineStatusMap);

export const batchStatusMap = {
  'Approved': 'Approved',
  'Quarantine': 'Quarantine',
  'In Use': 'InUse',
  'Flagged': 'Flagged',
} satisfies Record<string, $Enums.MaterialBatchStatus>;
export const batchStatusReverseMap = reverse(batchStatusMap);

export const alertStatusMap = {
  'New': 'New',
  'Investigating': 'Investigating',
  'Action Required': 'ActionRequired',
  'In Progress': 'InProgress',
  'Resolved': 'Resolved',
  'Dismissed': 'Dismissed',
  'Reopened': 'Reopened',
} satisfies Record<string, $Enums.AlertStatus>;
export const alertStatusReverseMap = reverse(alertStatusMap);

export const rootCauseStatusMap = {
  'Likely Contributor': 'LikelyContributor',
  'Secondary Factor': 'SecondaryFactor',
  'Ruled Out': 'RuledOut',
  'Under Review': 'UnderReview',
} satisfies Record<string, $Enums.RootCauseStatus>;
export const rootCauseStatusReverseMap = reverse(rootCauseStatusMap);

export const recommendationStatusMap = {
  'Pending': 'Pending',
  'Approved': 'Approved',
  'Rejected': 'Rejected',
  'Task Created': 'TaskCreated',
} satisfies Record<string, $Enums.RecommendationStatus>;
export const recommendationStatusReverseMap = reverse(recommendationStatusMap);

export const actionTaskStatusMap = {
  'Pending': 'Pending',
  'Assigned': 'Assigned',
  'In Progress': 'InProgress',
  'Completed': 'Completed',
  'Cancelled': 'Cancelled',
} satisfies Record<string, $Enums.ActionTaskStatus>;
export const actionTaskStatusReverseMap = reverse(actionTaskStatusMap);

export const maintenanceStatusMap = {
  'Completed': 'Completed',
  'Scheduled': 'Scheduled',
  'In Progress': 'InProgress',
} satisfies Record<string, $Enums.MaintenanceStatus>;
export const maintenanceStatusReverseMap = reverse(maintenanceStatusMap);

export const downtimeCategoryMap = {
  'Equipment failure': 'EquipmentFailure',
  'Setup / changeover': 'SetupChangeover',
  'Material shortage': 'MaterialShortage',
  'Quality issue': 'QualityIssue',
  'Operator issue': 'OperatorIssue',
  'Planned maintenance': 'PlannedMaintenance',
  'Other': 'Other',
} satisfies Record<string, $Enums.DowntimeCategory>;
export const downtimeCategoryReverseMap = reverse(downtimeCategoryMap);

export const ingredientStatusMap = {
  'Normal': 'Normal',
  'Variance Warning': 'VarianceWarning',
  'Anomaly Loss': 'AnomalyLoss',
} satisfies Record<string, $Enums.IngredientUsageStatus>;
export const ingredientStatusReverseMap = reverse(ingredientStatusMap);

export const wasteDefectCategoryMap = {
  'Overfill/Spill': 'OverfillSpill',
  'Contamination': 'Contamination',
  'Underfill Rejection': 'UnderfillRejection',
  'Startup Purge': 'StartupPurge',
  'Packaging Tear': 'PackagingTear',
  'Off-Spec Viscosity': 'OffSpecViscosity',
} satisfies Record<string, $Enums.WasteDefectCategory>;
export const wasteDefectCategoryReverseMap = reverse(wasteDefectCategoryMap);

export const wasteReasonMap = {
  'Expired': 'Expired',
  'Spoiled': 'Spoiled',
  'Overproduction': 'Overproduction',
  'Preparation mistake': 'PreparationMistake',
  'Wrong order': 'WrongOrder',
  'Damaged': 'Damaged',
  'Process loss': 'ProcessLoss',
  'Other': 'Other',
} satisfies Record<string, $Enums.WasteReason>;
export const wasteReasonReverseMap = reverse(wasteReasonMap);

export const protocolMap = {
  'OPC-UA': 'OPC_UA',
  'MQTT': 'MQTT',
  'Modbus-TCP': 'Modbus_TCP',
  'REST-Historian': 'REST_Historian',
} satisfies Record<string, $Enums.ProtocolType>;
export const protocolReverseMap = reverse(protocolMap);
