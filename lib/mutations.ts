import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiPatch, apiPost } from '@/lib/apiClient';
import { QUERY_KEYS } from '@/lib/queries';
import type {
  ActionTask,
  DeviceConnection,
  Investigation,
  MaterialBatch,
  NotificationItem,
  OperationalThresholds,
  RecommendedAction,
  WasteRecord,
} from '@/lib/types';

type ToastType = 'success' | 'info' | 'warning';
type ShowToast = (message: string, type?: ToastType) => void;

const HERO_INVESTIGATION_ID = 'inv-line3-hero';
const HERO_ALERT_ID = 'alt-line3-loss';

// Backs every mutator exposed by useFactory(): call the matching /api/v1 route, invalidate
// whichever queries that route's usecase touches so React Query refetches fresh data, then
// surface the same showToast(...) feedback the old synchronous mutators gave. Mutations wait for
// the response before updating anything (no optimistic writes), so a failed request just shows a
// warning toast and leaves state untouched — nothing to roll back.
export function useFactoryMutations(showToast: ShowToast) {
  const queryClient = useQueryClient();
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());

  function invalidate(...keys: (readonly string[])[]) {
    keys.forEach((queryKey) => queryClient.invalidateQueries({ queryKey: [...queryKey] }));
  }

  function reportError(error: unknown, fallback: string) {
    showToast(error instanceof Error ? error.message : fallback, 'warning');
  }

  function isPending(key: string) {
    return pendingKeys.has(key);
  }

  // Every mutator below runs its body through this: a key already in flight is dropped silently
  // (no-op) instead of firing a second request, so a slow network + an impatient double-click
  // can never double-fire the same mutation. `isPending(key)` is exposed so buttons can also show
  // a visual loading/disabled state for that same key.
  async function withPending<T>(key: string, fn: () => Promise<T>): Promise<T | undefined> {
    if (pendingKeys.has(key)) {
      return undefined;
    }
    setPendingKeys((prev) => new Set(prev).add(key));
    try {
      return await fn();
    } finally {
      setPendingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }

  async function testConnection(connectionId: string) {
    await withPending(`testConnection:${connectionId}`, async () => {
      try {
        const connection = await apiPost<DeviceConnection>(
          `/device-connections/${connectionId}/test`,
        );
        invalidate(QUERY_KEYS.deviceConnections);
        showToast(
          `Gateway "${connection.name}" verified responsive (${connection.pingLatencyMs}ms latency)`,
          'success',
        );
      } catch (error) {
        reportError(error, 'Failed to verify gateway connection');
      }
    });
  }

  async function addDeviceConnection(conn: Omit<DeviceConnection, 'id'>) {
    await withPending('addDeviceConnection', async () => {
      try {
        const connection = await apiPost<DeviceConnection>('/device-connections', conn);
        invalidate(QUERY_KEYS.deviceConnections);
        showToast(`Industrial Gateway "${connection.name}" connected successfully`, 'success');
      } catch (error) {
        reportError(error, 'Failed to add device connection');
      }
    });
  }

  async function updateMachineProfileGateway(machineId: string, gatewayId: string) {
    await withPending(`updateMachineProfileGateway:${machineId}`, async () => {
      try {
        await apiPatch(`/machine-profiles/${machineId}`, { gatewayId });
        invalidate(QUERY_KEYS.machineProfiles);
        showToast('Machine telemetry binding updated', 'success');
      } catch (error) {
        reportError(error, 'Failed to update machine telemetry binding');
      }
    });
  }

  async function addMaterialBatch(batch: Omit<MaterialBatch, 'id'>) {
    await withPending('addMaterialBatch', async () => {
      try {
        const created = await apiPost<MaterialBatch>('/material-batches', batch);
        invalidate(QUERY_KEYS.materialBatches, QUERY_KEYS.materials);
        showToast(
          `Material lot ${created.batchCode} received (+${created.quantity} ${created.unitOfMeasure})`,
          'success',
        );
      } catch (error) {
        reportError(error, 'Failed to receive material batch');
      }
    });
  }

  async function addWasteRecord(waste: Omit<WasteRecord, 'id' | 'timestamp'>) {
    await withPending('addWasteRecord', async () => {
      try {
        const created = await apiPost<WasteRecord>('/waste-records', waste);
        invalidate(QUERY_KEYS.wasteRecords);
        showToast(
          `Scrap entry logged for ${created.lineName}: ${created.wasteQuantityKg} kg ($${created.wasteCost.toFixed(2)})`,
          'warning',
        );
      } catch (error) {
        reportError(error, 'Failed to log scrap entry');
      }
    });
  }

  async function adjustMaterialStock(materialId: string, newStock: number, reason?: string) {
    await withPending(`adjustMaterialStock:${materialId}`, async () => {
      try {
        const material = await apiPatch<{ name: string; currentStock: number; unitOfMeasure: string }>(
          `/materials/${materialId}/stock`,
          { newStock },
        );
        invalidate(QUERY_KEYS.materials);
        showToast(
          `Inventory stock adjusted for ${material.name}: ${material.currentStock} ${material.unitOfMeasure}${reason ? ` (${reason})` : ''}`,
          'info',
        );
      } catch (error) {
        reportError(error, 'Failed to adjust inventory stock');
      }
    });
  }

  async function updateThresholds(thresholds: Partial<OperationalThresholds>) {
    await withPending('updateThresholds', async () => {
      try {
        await apiPatch('/thresholds', thresholds);
        invalidate(QUERY_KEYS.thresholds);
      } catch (error) {
        reportError(error, 'Failed to update operational thresholds');
      }
    });
  }

  async function approveRecommendation(investigationId: string, recommendationId: string) {
    await withPending(`approveRecommendation:${recommendationId}`, async () => {
      try {
        const result = await apiPost<{ recommendation: RecommendedAction; actionTask: ActionTask }>(
          `/investigations/${investigationId}/recommendations/${recommendationId}/approve`,
        );
        invalidate(QUERY_KEYS.investigations, QUERY_KEYS.alerts, QUERY_KEYS.actionTasks, QUERY_KEYS.notifications);
        showToast(
          `Recommendation "${result.recommendation.title}" approved and assigned to ${result.actionTask.assignedTo}`,
          'success',
        );
      } catch (error) {
        reportError(error, 'Failed to approve recommendation');
      }
    });
  }

  async function createActionTaskFromRecommendation(
    investigationId: string,
    rec: RecommendedAction,
    assignedTo: string,
    dueDate: string,
  ) {
    await withPending(`createActionTaskFromRecommendation:${rec.id}`, async () => {
      try {
        await apiPost<ActionTask>(`/investigations/${investigationId}/action-tasks`, {
          recommendationId: rec.id,
          assignedTo,
          dueDate,
        });
        invalidate(QUERY_KEYS.investigations, QUERY_KEYS.actionTasks);
        showToast(`Maintenance task created in Action Center for ${assignedTo || 'Carlos Ruiz'}`, 'success');
      } catch (error) {
        reportError(error, 'Failed to create maintenance task');
      }
    });
  }

  async function updateTaskStatus(taskId: string, status: ActionTask['status']) {
    await withPending(`updateTaskStatus:${taskId}`, async () => {
      try {
        await apiPatch(`/action-tasks/${taskId}`, { status });
        invalidate(QUERY_KEYS.actionTasks);
      } catch (error) {
        reportError(error, 'Failed to update task status');
      }
    });
  }

  async function assignTask(taskId: string, assignedTo: string, role: string) {
    await withPending(`assignTask:${taskId}`, async () => {
      try {
        await apiPatch(`/action-tasks/${taskId}`, { assignedTo, assignedRole: role });
        invalidate(QUERY_KEYS.actionTasks);
      } catch (error) {
        reportError(error, 'Failed to assign task');
      }
    });
  }

  async function completeTaskWithOutcome(
    taskId: string,
    actualResult: string,
    resolutionNotes: string,
    recoveredUnitsPerHour: number = 920,
  ) {
    await withPending(`completeTaskWithOutcome:${taskId}`, async () => {
      try {
        const cachedTasks = queryClient.getQueryData<ActionTask[]>(QUERY_KEYS.actionTasks);
        const task = cachedTasks?.find((t) => t.id === taskId);
        const isHeroTask =
          task?.investigationId === HERO_INVESTIGATION_ID || task?.alertId === HERO_ALERT_ID;

        await apiPost<ActionTask>(`/action-tasks/${taskId}/complete`, {
          actualResult,
          resolutionNotes,
          recoveredUnitsPerHour,
        });

        invalidate(
          QUERY_KEYS.actionTasks,
          QUERY_KEYS.investigations,
          QUERY_KEYS.alerts,
          QUERY_KEYS.productionLines,
          QUERY_KEYS.machines,
          QUERY_KEYS.maintenanceRecords,
          QUERY_KEYS.notifications,
        );

        if (isHeroTask) {
          showToast(
            `Action completed: Line 3 recovered +${recoveredUnitsPerHour} units/hr and marked as Resolved`,
            'success',
          );
        } else {
          showToast(`Task "${task?.title ?? 'Task'}" marked as completed`, 'success');
        }
      } catch (error) {
        reportError(error, 'Failed to complete task');
      }
    });
  }

  async function markNotificationAsRead(id: string) {
    await withPending(`markNotificationAsRead:${id}`, async () => {
      try {
        await apiPatch(`/notifications/${id}`, { read: true });
        invalidate(QUERY_KEYS.notifications);
      } catch (error) {
        reportError(error, 'Failed to mark notification as read');
      }
    });
  }

  async function markAllNotificationsAsRead() {
    await withPending('markAllNotificationsAsRead', async () => {
      try {
        await apiPost('/notifications/mark-all-read');
        invalidate(QUERY_KEYS.notifications);
      } catch (error) {
        reportError(error, 'Failed to mark notifications as read');
      }
    });
  }

  async function addNotification(notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) {
    await withPending('addNotification', async () => {
      try {
        await apiPost('/notifications', notif);
        invalidate(QUERY_KEYS.notifications);
      } catch (error) {
        reportError(error, 'Failed to add notification');
      }
    });
  }

  async function ingestData(datasetType: string, count: number, summaryNotes?: string) {
    await withPending('ingestData', async () => {
      try {
        await apiPost('/data-ingestion', { datasetType, count, summaryNotes });
        invalidate(QUERY_KEYS.notifications);
        showToast(`${count.toLocaleString()} ${datasetType} records imported successfully`, 'success');
      } catch (error) {
        reportError(error, 'Failed to import data');
      }
    });
  }

  async function resetDemoToHeroState() {
    await withPending('resetDemoToHeroState', async () => {
      try {
        await apiPost('/demo/reset');
        invalidate(
          QUERY_KEYS.productionLines,
          QUERY_KEYS.machines,
          QUERY_KEYS.alerts,
          QUERY_KEYS.investigations,
          QUERY_KEYS.actionTasks,
          QUERY_KEYS.notifications,
          QUERY_KEYS.maintenanceRecords,
          QUERY_KEYS.deviceConnections,
          QUERY_KEYS.machineProfiles,
          QUERY_KEYS.wasteRecords,
          QUERY_KEYS.ingredientUsageRecords,
        );
        showToast('Demo scenario reset to initial dairy incident state (Line 3 loss -18.9%)', 'info');
      } catch (error) {
        reportError(error, 'Failed to reset demo state');
      }
    });
  }

  // Unlike every other mutator here (fire-and-forget), the caller needs the new investigation's
  // id to navigate straight into it — returns the created investigation on success, undefined on
  // failure (the toast is still shown via reportError, same as everywhere else).
  async function generateInvestigation(alertId: string): Promise<Investigation | undefined> {
    return withPending(`generateInvestigation:${alertId}`, async () => {
      try {
        const investigation = await apiPost<Investigation>(`/alerts/${alertId}/investigate`);
        invalidate(QUERY_KEYS.alerts, QUERY_KEYS.investigations, QUERY_KEYS.notifications);
        showToast(`Investigation generated: ${investigation.title}`, 'success');
        return investigation;
      } catch (error) {
        reportError(error, 'Failed to generate investigation');
        return undefined;
      }
    });
  }

  async function evaluateThresholds() {
    await withPending('evaluateThresholds', async () => {
      try {
        const result = await apiPost<{ createdFor: string[] }>('/alerts/evaluate-thresholds');
        invalidate(QUERY_KEYS.alerts, QUERY_KEYS.notifications);
        if (result.createdFor.length === 0) {
          showToast('No anomalies detected — all live readings within threshold', 'info');
        } else {
          showToast(`New alert raised for: ${result.createdFor.join(', ')}`, 'warning');
        }
      } catch (error) {
        reportError(error, 'Failed to run threshold check');
      }
    });
  }

  return {
    isPending,
    testConnection,
    addDeviceConnection,
    updateMachineProfileGateway,
    addMaterialBatch,
    addWasteRecord,
    adjustMaterialStock,
    updateThresholds,
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
    evaluateThresholds,
    generateInvestigation,
  };
}
