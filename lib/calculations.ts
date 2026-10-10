/**
 * Business Impact & Manufacturing KPI Calculation Utilities
 * Centralized formulas for production loss, financial impact, and waste.
 */

export function calculateLostUnits(plannedOutput: number, actualOutput: number): number {
  return Math.max(0, plannedOutput - actualOutput);
}

export function calculateRevenueLoss(lostUnits: number, unitRevenue: number): number {
  return lostUnits * unitRevenue;
}

export function calculateWasteCost(wasteQuantityKg: number, unitCostPerKg: number): number {
  return wasteQuantityKg * unitCostPerKg;
}

export function calculateDowntimeCost(downtimeMinutes: number, lossRatePerHour: number): number {
  return (downtimeMinutes / 60) * lossRatePerHour;
}

export function calculatePotentialFutureLoss(lossRatePerHour: number, projectedHours: number): number {
  return lossRatePerHour * projectedHours;
}

export function calculateEfficiency(actual: number, target: number): number {
  if (target <= 0) return 100;
  return Math.min(100, Math.max(0, (actual / target) * 100));
}

export function calculateDefectRate(defects: number, totalProduced: number): number {
  if (totalProduced <= 0) return 0;
  return (defects / totalProduced) * 100;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(num));
}

export function formatPercent(pct: number, decimals: number = 1): string {
  return `${pct.toFixed(decimals)}%`;
}
