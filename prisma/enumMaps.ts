import { $Enums } from '@prisma/client';

function reverse<V extends string>(map: Record<string, V>): Record<V, string> {
  return Object.fromEntries(
    Object.entries(map).map(([label, enumValue]) => [enumValue, label]),
  ) as Record<V, string>;
}

export const machineStatusMap: Record<string, $Enums.MachineStatus> = {
  'Normal': 'Normal',
  'Abnormal Behavior': 'AbnormalBehavior',
  'Elevated Risk': 'ElevatedRisk',
  'Offline': 'Offline',
};
export const machineStatusReverseMap = reverse(machineStatusMap);

export const batchStatusMap: Record<string, $Enums.MaterialBatchStatus> = {
  'Approved': 'Approved',
  'Quarantine': 'Quarantine',
  'In Use': 'InUse',
  'Flagged': 'Flagged',
};
export const batchStatusReverseMap = reverse(batchStatusMap);

export const alertStatusMap: Record<string, $Enums.AlertStatus> = {
  'New': 'New',
  'Investigating': 'Investigating',
  'Action Required': 'ActionRequired',
  'In Progress': 'InProgress',
  'Resolved': 'Resolved',
  'Dismissed': 'Dismissed',
  'Reopened': 'Reopened',
};
export const alertStatusReverseMap = reverse(alertStatusMap);

export const rootCauseStatusMap: Record<string, $Enums.RootCauseStatus> = {
  'Likely Contributor': 'LikelyContributor',
  'Secondary Factor': 'SecondaryFactor',
  'Ruled Out': 'RuledOut',
  'Under Review': 'UnderReview',
};
export const rootCauseStatusReverseMap = reverse(rootCauseStatusMap);

export const recommendationStatusMap: Record<string, $Enums.RecommendationStatus> = {
  'Pending': 'Pending',
  'Approved': 'Approved',
  'Rejected': 'Rejected',
  'Task Created': 'TaskCreated',
};
export const recommendationStatusReverseMap = reverse(recommendationStatusMap);

export const actionTaskStatusMap: Record<string, $Enums.ActionTaskStatus> = {
  'Pending': 'Pending',
  'Assigned': 'Assigned',
  'In Progress': 'InProgress',
  'Completed': 'Completed',
  'Cancelled': 'Cancelled',
};
export const actionTaskStatusReverseMap = reverse(actionTaskStatusMap);

export const maintenanceStatusMap: Record<string, $Enums.MaintenanceStatus> = {
  'Completed': 'Completed',
  'Scheduled': 'Scheduled',
  'In Progress': 'InProgress',
};
export const maintenanceStatusReverseMap = reverse(maintenanceStatusMap);

export const downtimeCategoryMap: Record<string, $Enums.DowntimeCategory> = {
  'Equipment failure': 'EquipmentFailure',
  'Setup / changeover': 'SetupChangeover',
  'Material shortage': 'MaterialShortage',
  'Quality issue': 'QualityIssue',
  'Operator issue': 'OperatorIssue',
  'Planned maintenance': 'PlannedMaintenance',
  'Other': 'Other',
};
export const downtimeCategoryReverseMap = reverse(downtimeCategoryMap);

export const ingredientStatusMap: Record<string, $Enums.IngredientUsageStatus> = {
  'Normal': 'Normal',
  'Variance Warning': 'VarianceWarning',
  'Anomaly Loss': 'AnomalyLoss',
};
export const ingredientStatusReverseMap = reverse(ingredientStatusMap);

export const wasteDefectCategoryMap: Record<string, $Enums.WasteDefectCategory> = {
  'Overfill/Spill': 'OverfillSpill',
  'Contamination': 'Contamination',
  'Underfill Rejection': 'UnderfillRejection',
  'Startup Purge': 'StartupPurge',
  'Packaging Tear': 'PackagingTear',
  'Off-Spec Viscosity': 'OffSpecViscosity',
};
export const wasteDefectCategoryReverseMap = reverse(wasteDefectCategoryMap);

export const wasteReasonMap: Record<string, $Enums.WasteReason> = {
  'Expired': 'Expired',
  'Spoiled': 'Spoiled',
  'Overproduction': 'Overproduction',
  'Preparation mistake': 'PreparationMistake',
  'Wrong order': 'WrongOrder',
  'Damaged': 'Damaged',
  'Process loss': 'ProcessLoss',
  'Other': 'Other',
};
export const wasteReasonReverseMap = reverse(wasteReasonMap);

export const protocolMap: Record<string, $Enums.ProtocolType> = {
  'OPC-UA': 'OPC_UA',
  'MQTT': 'MQTT',
  'Modbus-TCP': 'Modbus_TCP',
  'REST-Historian': 'REST_Historian',
};
export const protocolReverseMap = reverse(protocolMap);
