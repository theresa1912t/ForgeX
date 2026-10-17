-- CreateEnum
CREATE TYPE "ProductionMetricSource" AS ENUM ('Seed', 'Simulator');

-- AlterEnum
ALTER TYPE "AlertStatus" ADD VALUE 'Reopened';

-- AlterEnum
ALTER TYPE "InvestigationStatus" ADD VALUE 'Reopened';

-- CreateTable
CREATE TABLE "IncidentEvent" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorName" TEXT,
    "fromStatus" TEXT,
    "toStatus" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncidentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionMetric" (
    "id" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "intervalStart" TIMESTAMP(3) NOT NULL,
    "intervalEnd" TIMESTAMP(3) NOT NULL,
    "expectedUnits" DOUBLE PRECISION NOT NULL,
    "actualUnits" DOUBLE PRECISION NOT NULL,
    "goodUnits" DOUBLE PRECISION NOT NULL,
    "defectiveUnits" DOUBLE PRECISION NOT NULL,
    "unitRevenue" DOUBLE PRECISION NOT NULL,
    "source" "ProductionMetricSource" NOT NULL DEFAULT 'Seed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductionMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IncidentEvent_alertId_idx" ON "IncidentEvent"("alertId");

-- CreateIndex
CREATE INDEX "ProductionMetric_machineId_intervalStart_idx" ON "ProductionMetric"("machineId", "intervalStart");

-- CreateIndex
CREATE INDEX "Alert_status_idx" ON "Alert"("status");

-- CreateIndex
CREATE INDEX "Alert_severity_idx" ON "Alert"("severity");

-- AddForeignKey
ALTER TABLE "IncidentEvent" ADD CONSTRAINT "IncidentEvent_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionMetric" ADD CONSTRAINT "ProductionMetric_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
