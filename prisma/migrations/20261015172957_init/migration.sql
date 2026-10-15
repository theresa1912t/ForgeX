-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Admin', 'Manager', 'Viewer');

-- CreateEnum
CREATE TYPE "LineStatus" AS ENUM ('Running', 'Degraded', 'Down', 'Maintenance');

-- CreateEnum
CREATE TYPE "MachineStatus" AS ENUM ('Normal', 'AbnormalBehavior', 'ElevatedRisk', 'Offline');

-- CreateEnum
CREATE TYPE "MaterialQualityStatus" AS ENUM ('Approved', 'Quarantine', 'Testing');

-- CreateEnum
CREATE TYPE "MaterialBatchStatus" AS ENUM ('Approved', 'Quarantine', 'InUse', 'Flagged');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('Critical', 'High', 'Medium', 'Low');

-- CreateEnum
CREATE TYPE "AlertCategory" AS ENUM ('Production', 'Machine', 'Quality', 'Material', 'Downtime', 'Waste', 'Energy');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('New', 'Investigating', 'ActionRequired', 'InProgress', 'Resolved', 'Dismissed');

-- CreateEnum
CREATE TYPE "EvidenceSignalType" AS ENUM ('FACT', 'INFERENCE', 'RECOMMENDATION');

-- CreateEnum
CREATE TYPE "RootCauseStatus" AS ENUM ('LikelyContributor', 'SecondaryFactor', 'RuledOut', 'UnderReview');

-- CreateEnum
CREATE TYPE "InvestigationStatus" AS ENUM ('Active', 'Investigating', 'Resolved');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('Critical', 'High', 'Medium', 'Low');

-- CreateEnum
CREATE TYPE "RecommendationOwner" AS ENUM ('Maintenance', 'Quality', 'Operations');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('Pending', 'Approved', 'Rejected', 'TaskCreated');

-- CreateEnum
CREATE TYPE "ActionTaskStatus" AS ENUM ('Pending', 'Assigned', 'InProgress', 'Completed', 'Cancelled');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('Preventive', 'Corrective', 'Emergency', 'Inspection');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('Completed', 'Scheduled', 'InProgress');

-- CreateEnum
CREATE TYPE "DowntimeCategory" AS ENUM ('EquipmentFailure', 'SetupChangeover', 'MaterialShortage', 'QualityIssue', 'OperatorIssue', 'PlannedMaintenance', 'Other');

-- CreateEnum
CREATE TYPE "IngredientUsageStatus" AS ENUM ('Normal', 'VarianceWarning', 'AnomalyLoss');

-- CreateEnum
CREATE TYPE "WasteDefectCategory" AS ENUM ('OverfillSpill', 'Contamination', 'UnderfillRejection', 'StartupPurge', 'PackagingTear', 'OffSpecViscosity');

-- CreateEnum
CREATE TYPE "WasteReason" AS ENUM ('Expired', 'Spoiled', 'Overproduction', 'PreparationMistake', 'WrongOrder', 'Damaged', 'ProcessLoss', 'Other');

-- CreateEnum
CREATE TYPE "EnergyStatus" AS ENUM ('Normal', 'Elevated', 'Spike');

-- CreateEnum
CREATE TYPE "QualityDisposition" AS ENUM ('Approved', 'Hold', 'Scrap', 'Rework');

-- CreateEnum
CREATE TYPE "ProtocolType" AS ENUM ('OPC_UA', 'MQTT', 'Modbus_TCP', 'REST_Historian');

-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('Connected', 'Degraded', 'Offline', 'Connecting');

-- CreateEnum
CREATE TYPE "TagDataType" AS ENUM ('Float32', 'Int16', 'Boolean', 'Double');

-- CreateEnum
CREATE TYPE "TagStatus" AS ENUM ('Streaming', 'Stale', 'Offline');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Factory" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "activeLinesCount" INTEGER NOT NULL,
    "totalCapacityUnitsPerDay" INTEGER NOT NULL,

    CONSTRAINT "Factory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "title" TEXT NOT NULL,
    "avatar" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionLine" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "LineStatus" NOT NULL,
    "targetUnitsPerHour" INTEGER NOT NULL,
    "currentUnitsPerHour" INTEGER NOT NULL,
    "efficiencyPct" DOUBLE PRECISION NOT NULL,
    "shift" TEXT NOT NULL,
    "currentProduct" TEXT NOT NULL,
    "downtimeMinutesToday" INTEGER NOT NULL,
    "defectRatePct" DOUBLE PRECISION NOT NULL,
    "productionLossUnits" INTEGER NOT NULL,
    "activeAlertCount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "ProductionLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Machine" (
    "id" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "MachineStatus" NOT NULL,
    "healthScorePct" DOUBLE PRECISION NOT NULL,
    "temperatureC" DOUBLE PRECISION NOT NULL,
    "vibrationMmS" DOUBLE PRECISION NOT NULL,
    "pressureBar" DOUBLE PRECISION NOT NULL,
    "cycleTimeSec" DOUBLE PRECISION NOT NULL,
    "operatingSpeedRpm" INTEGER NOT NULL,
    "downtimeHoursThisWeek" DOUBLE PRECISION NOT NULL,
    "lastMaintenanceDate" TEXT NOT NULL,
    "nextScheduledMaintenance" TEXT NOT NULL,
    "activeAlertCount" INTEGER NOT NULL,
    "productionLossContributionPct" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Machine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unitRevenue" DOUBLE PRECISION NOT NULL,
    "standardCycleTimeSec" DOUBLE PRECISION NOT NULL,
    "shelfLifeDays" INTEGER NOT NULL,
    "targetBatchSize" INTEGER NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "unitCost" DOUBLE PRECISION NOT NULL,
    "unitOfMeasure" TEXT NOT NULL,
    "currentStock" DOUBLE PRECISION NOT NULL,
    "activeBatchCount" INTEGER NOT NULL,
    "qualityStatus" "MaterialQualityStatus" NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialBatch" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "batchCode" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "receivedDate" TEXT NOT NULL,
    "expiryDate" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitOfMeasure" TEXT NOT NULL,
    "status" "MaterialBatchStatus" NOT NULL,
    "viscosityDeviationPct" DOUBLE PRECISION,
    "associatedProducts" TEXT[],
    "defectRateImpact" TEXT,
    "relatedAlertIds" TEXT[],

    CONSTRAINT "MaterialBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "category" "AlertCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,
    "lineName" TEXT NOT NULL,
    "machineId" TEXT,
    "machineName" TEXT,
    "productId" TEXT,
    "productName" TEXT,
    "detectedAt" TEXT NOT NULL,
    "estimatedImpact" TEXT NOT NULL,
    "revenueAtRisk" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "status" "AlertStatus" NOT NULL,
    "resolvedAt" TEXT,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Investigation" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,
    "lineName" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "machineName" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "shift" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "outputVariancePct" DOUBLE PRECISION NOT NULL,
    "status" "InvestigationStatus" NOT NULL,
    "summary" TEXT NOT NULL,
    "timeline" JSONB NOT NULL,
    "sensorDeltas" JSONB NOT NULL,
    "resolvedAt" TEXT,
    "resolutionOutcome" JSONB,

    CONSTRAINT "Investigation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RootCause" (
    "id" TEXT NOT NULL,
    "investigationId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "status" "RootCauseStatus" NOT NULL,
    "summary" TEXT NOT NULL,
    "supportingEvidence" TEXT[],
    "historicalPrecedent" TEXT NOT NULL,

    CONSTRAINT "RootCause_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceItem" (
    "id" TEXT NOT NULL,
    "investigationId" TEXT NOT NULL,
    "signalType" "EvidenceSignalType" NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "metric" TEXT,
    "delta" TEXT,
    "source" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL,

    CONSTRAINT "EvidenceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessImpact" (
    "id" TEXT NOT NULL,
    "investigationId" TEXT NOT NULL,
    "lostUnits" INTEGER NOT NULL,
    "estimatedRevenueLoss" DOUBLE PRECISION NOT NULL,
    "additionalReworkUnits" INTEGER NOT NULL,
    "additionalReworkCost" DOUBLE PRECISION NOT NULL,
    "materialWasteKg" DOUBLE PRECISION NOT NULL,
    "materialWasteCost" DOUBLE PRECISION NOT NULL,
    "downtimeMinutes" INTEGER NOT NULL,
    "downtimeCost" DOUBLE PRECISION NOT NULL,
    "currentLossRatePerHour" DOUBLE PRECISION NOT NULL,
    "potentialAdditionalLoss4h" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BusinessImpact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendedAction" (
    "id" TEXT NOT NULL,
    "investigationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "priority" "Priority" NOT NULL,
    "owner" "RecommendationOwner" NOT NULL,
    "estimatedEffort" TEXT NOT NULL,
    "expectedImpact" TEXT NOT NULL,
    "evidence" TEXT NOT NULL,
    "status" "RecommendationStatus" NOT NULL,

    CONSTRAINT "RecommendedAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "investigationId" TEXT,
    "alertId" TEXT NOT NULL,
    "recommendationId" TEXT,
    "lineName" TEXT NOT NULL,
    "machineName" TEXT NOT NULL,
    "priority" "Priority" NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "assignedRole" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,
    "expectedImpact" TEXT NOT NULL,
    "actualResult" TEXT,
    "resolutionNotes" TEXT,
    "status" "ActionTaskStatus" NOT NULL,
    "createdAt" TEXT NOT NULL,
    "completedAt" TEXT,

    CONSTRAINT "ActionTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "category" "AlertCategory" NOT NULL,
    "timestamp" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL,
    "linkModule" TEXT,
    "linkId" TEXT,

    CONSTRAINT "NotificationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationalThresholds" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "productionVariancePct" DOUBLE PRECISION NOT NULL,
    "defectRateThresholdPct" DOUBLE PRECISION NOT NULL,
    "vibrationAnomalyMmS" DOUBLE PRECISION NOT NULL,
    "downtimeAlertMinutes" INTEGER NOT NULL,
    "wasteThresholdKg" DOUBLE PRECISION NOT NULL,
    "energyAnomalyPct" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OperationalThresholds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceRecord" (
    "id" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "machineName" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "type" "MaintenanceType" NOT NULL,
    "issue" TEXT NOT NULL,
    "failureType" TEXT NOT NULL,
    "repairDurationMinutes" INTEGER NOT NULL,
    "technician" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "status" "MaintenanceStatus" NOT NULL,

    CONSTRAINT "MaintenanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DowntimeRecord" (
    "id" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "machineName" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,
    "lineName" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "category" "DowntimeCategory" NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estimatedImpactCost" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DowntimeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngredientUsageRecord" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "materialName" TEXT NOT NULL,
    "batchCode" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "machineName" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,
    "lineName" TEXT NOT NULL,
    "plannedQuantityKg" DOUBLE PRECISION NOT NULL,
    "actualQuantityKg" DOUBLE PRECISION NOT NULL,
    "yieldVariancePct" DOUBLE PRECISION NOT NULL,
    "scrapKg" DOUBLE PRECISION NOT NULL,
    "scrapCost" DOUBLE PRECISION NOT NULL,
    "unitOfMeasure" TEXT NOT NULL,
    "status" "IngredientUsageStatus" NOT NULL,
    "timestamp" TEXT NOT NULL,

    CONSTRAINT "IngredientUsageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WasteRecord" (
    "id" TEXT NOT NULL,
    "materialId" TEXT,
    "materialName" TEXT NOT NULL,
    "productionBatchCode" TEXT NOT NULL,
    "lineName" TEXT NOT NULL,
    "machineId" TEXT,
    "machineName" TEXT,
    "wasteQuantityKg" DOUBLE PRECISION NOT NULL,
    "wasteType" TEXT NOT NULL,
    "defectCategory" "WasteDefectCategory",
    "wasteReason" "WasteReason" NOT NULL,
    "wasteCost" DOUBLE PRECISION NOT NULL,
    "relatedAnomaly" TEXT,
    "relatedInvestigationId" TEXT,
    "recoveryActionTaken" TEXT,
    "timestamp" TEXT NOT NULL,

    CONSTRAINT "WasteRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnergyRecord" (
    "id" TEXT NOT NULL,
    "lineName" TEXT NOT NULL,
    "machineName" TEXT NOT NULL,
    "kwhConsumed" DOUBLE PRECISION NOT NULL,
    "costEstimate" DOUBLE PRECISION NOT NULL,
    "varianceFromBaselinePct" DOUBLE PRECISION NOT NULL,
    "status" "EnergyStatus" NOT NULL,
    "timestamp" TEXT NOT NULL,

    CONSTRAINT "EnergyRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityRecord" (
    "id" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "lineName" TEXT NOT NULL,
    "batchCode" TEXT NOT NULL,
    "sampleSize" INTEGER NOT NULL,
    "defectCount" INTEGER NOT NULL,
    "defectRatePct" DOUBLE PRECISION NOT NULL,
    "topDefectType" TEXT NOT NULL,
    "disposition" "QualityDisposition" NOT NULL,
    "timestamp" TEXT NOT NULL,

    CONSTRAINT "QualityRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceConnection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "protocol" "ProtocolType" NOT NULL,
    "endpointUrl" TEXT NOT NULL,
    "status" "ConnectionStatus" NOT NULL,
    "pollingFrequencyMs" INTEGER NOT NULL,
    "lastHeartbeat" TEXT NOT NULL,
    "pingLatencyMs" INTEGER NOT NULL,
    "securityMode" TEXT NOT NULL,
    "assignedMachines" TEXT[],

    CONSTRAINT "DeviceConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MachineConnectivityProfile" (
    "machineId" TEXT NOT NULL,
    "plcType" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "gatewayId" TEXT NOT NULL,
    "protocol" "ProtocolType" NOT NULL,
    "lastTelemetryTimestamp" TEXT NOT NULL,
    "healthScoreMethodology" JSONB NOT NULL,

    CONSTRAINT "MachineConnectivityProfile_pkey" PRIMARY KEY ("machineId")
);

-- CreateTable
CREATE TABLE "SensorTagMapping" (
    "id" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "metricKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "tagAddress" TEXT NOT NULL,
    "dataType" "TagDataType" NOT NULL,
    "samplingRateHz" DOUBLE PRECISION NOT NULL,
    "lastRawValue" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "sourceGateway" TEXT NOT NULL,
    "status" "TagStatus" NOT NULL,

    CONSTRAINT "SensorTagMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Factory_organizationId_idx" ON "Factory"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE INDEX "ProductionLine_factoryId_idx" ON "ProductionLine"("factoryId");

-- CreateIndex
CREATE INDEX "Machine_lineId_idx" ON "Machine"("lineId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Material_code_key" ON "Material"("code");

-- CreateIndex
CREATE INDEX "MaterialBatch_materialId_idx" ON "MaterialBatch"("materialId");

-- CreateIndex
CREATE INDEX "Alert_factoryId_idx" ON "Alert"("factoryId");

-- CreateIndex
CREATE INDEX "Alert_lineId_idx" ON "Alert"("lineId");

-- CreateIndex
CREATE INDEX "Alert_machineId_idx" ON "Alert"("machineId");

-- CreateIndex
CREATE UNIQUE INDEX "Investigation_alertId_key" ON "Investigation"("alertId");

-- CreateIndex
CREATE INDEX "Investigation_factoryId_idx" ON "Investigation"("factoryId");

-- CreateIndex
CREATE INDEX "Investigation_lineId_idx" ON "Investigation"("lineId");

-- CreateIndex
CREATE INDEX "RootCause_investigationId_idx" ON "RootCause"("investigationId");

-- CreateIndex
CREATE INDEX "EvidenceItem_investigationId_idx" ON "EvidenceItem"("investigationId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessImpact_investigationId_key" ON "BusinessImpact"("investigationId");

-- CreateIndex
CREATE INDEX "RecommendedAction_investigationId_idx" ON "RecommendedAction"("investigationId");

-- CreateIndex
CREATE INDEX "ActionTask_investigationId_idx" ON "ActionTask"("investigationId");

-- CreateIndex
CREATE INDEX "ActionTask_alertId_idx" ON "ActionTask"("alertId");

-- CreateIndex
CREATE UNIQUE INDEX "OperationalThresholds_factoryId_key" ON "OperationalThresholds"("factoryId");

-- CreateIndex
CREATE INDEX "MaintenanceRecord_machineId_idx" ON "MaintenanceRecord"("machineId");

-- CreateIndex
CREATE INDEX "DowntimeRecord_machineId_idx" ON "DowntimeRecord"("machineId");

-- CreateIndex
CREATE INDEX "DowntimeRecord_lineId_idx" ON "DowntimeRecord"("lineId");

-- CreateIndex
CREATE INDEX "IngredientUsageRecord_materialId_idx" ON "IngredientUsageRecord"("materialId");

-- CreateIndex
CREATE INDEX "IngredientUsageRecord_machineId_idx" ON "IngredientUsageRecord"("machineId");

-- CreateIndex
CREATE INDEX "IngredientUsageRecord_lineId_idx" ON "IngredientUsageRecord"("lineId");

-- CreateIndex
CREATE INDEX "WasteRecord_materialId_idx" ON "WasteRecord"("materialId");

-- CreateIndex
CREATE INDEX "SensorTagMapping_machineId_idx" ON "SensorTagMapping"("machineId");

-- AddForeignKey
ALTER TABLE "Factory" ADD CONSTRAINT "Factory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionLine" ADD CONSTRAINT "ProductionLine_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "Factory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Machine" ADD CONSTRAINT "Machine_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "ProductionLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialBatch" ADD CONSTRAINT "MaterialBatch_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "Factory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "ProductionLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investigation" ADD CONSTRAINT "Investigation_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investigation" ADD CONSTRAINT "Investigation_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "Factory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investigation" ADD CONSTRAINT "Investigation_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "ProductionLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investigation" ADD CONSTRAINT "Investigation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RootCause" ADD CONSTRAINT "RootCause_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceItem" ADD CONSTRAINT "EvidenceItem_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessImpact" ADD CONSTRAINT "BusinessImpact_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendedAction" ADD CONSTRAINT "RecommendedAction_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionTask" ADD CONSTRAINT "ActionTask_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionTask" ADD CONSTRAINT "ActionTask_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "RecommendedAction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationalThresholds" ADD CONSTRAINT "OperationalThresholds_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "Factory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRecord" ADD CONSTRAINT "MaintenanceRecord_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DowntimeRecord" ADD CONSTRAINT "DowntimeRecord_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DowntimeRecord" ADD CONSTRAINT "DowntimeRecord_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "ProductionLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientUsageRecord" ADD CONSTRAINT "IngredientUsageRecord_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientUsageRecord" ADD CONSTRAINT "IngredientUsageRecord_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientUsageRecord" ADD CONSTRAINT "IngredientUsageRecord_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "ProductionLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WasteRecord" ADD CONSTRAINT "WasteRecord_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MachineConnectivityProfile" ADD CONSTRAINT "MachineConnectivityProfile_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensorTagMapping" ADD CONSTRAINT "SensorTagMapping_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "MachineConnectivityProfile"("machineId") ON DELETE RESTRICT ON UPDATE CASCADE;
