import { DealKeyword } from '../types';

export type TimeRangeOption = '7d' | '14d' | '30d' | '90d' | 'ytd';

export const TIME_RANGE_LABELS: Record<TimeRangeOption, string> = {
  '7d': 'Last 7 Days',
  '14d': 'Last 14 Days',
  '30d': 'Last 30 Days',
  '90d': 'Last 90 Days (Quarter)',
  ytd: 'Year-to-Date (YTD)',
};

// Deterministic hash from string to [0, 1]
function getHashFraction(seedStr: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    hash ^= seedStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 1000) / 1000;
}

/**
 * Computes time-range adjusted keyword metrics deterministically so that
 * switching between Last 7 Days, Last 14 Days, Last 30 Days, Last 90 Days, and YTD
 * dynamically updates volume (clicks, impressions, conversions, cost, revenue)
 * as well as efficiency rates (CPC, CTR, CR, and EGR %).
 */
export function getKeywordMetricsForTimeRange(
  kw: DealKeyword,
  timeRange: TimeRangeOption
): DealKeyword {
  if (timeRange === '30d' || kw.clicks === 0 || kw.impressions === 0) {
    return kw;
  }

  // Base volume multiplier for the period relative to 30 days
  const baseScaleMap: Record<TimeRangeOption, number> = {
    '7d': 0.24,
    '14d': 0.48,
    '30d': 1.0,
    '90d': 2.85,
    ytd: 8.6,
  };

  const baseScale = baseScaleMap[timeRange] ?? 1.0;

  // Deterministic per-keyword + per-range variance (-12% to +12%)
  const f1 = getHashFraction(`${kw.id}-${timeRange}-vol`);
  const f2 = getHashFraction(`${kw.id}-${timeRange}-cpc`);
  const f3 = getHashFraction(`${kw.id}-${timeRange}-cr`);

  const volVariance = 0.9 + f1 * 0.22; // 0.90 to 1.12
  const cpcShift = 0.94 + f2 * 0.14;   // 0.94 to 1.08
  const revShift = 0.88 + f3 * 0.26;   // 0.88 to 1.14 (shifts CR and EGR %)

  const impressions = Math.max(15, Math.round(kw.impressions * baseScale * volVariance));
  const ctrShift = 0.93 + ((f1 + f2) % 1) * 0.15;
  const clicks = Math.max(2, Math.round(kw.clicks * baseScale * volVariance * ctrShift));

  const avgCpc = Number((kw.avgCpc * cpcShift).toFixed(2));
  const cost = Number((clicks * avgCpc).toFixed(2));

  const rawConv = kw.conversions * baseScale * volVariance * revShift;
  const conversions = kw.conversions > 0 ? Math.max(1, Math.round(rawConv)) : 0;

  // Revenue per conversion derived from original keyword or fallback
  const revPerConv = kw.conversions > 0 && kw.revenue > 0 ? kw.revenue / kw.conversions : 0;
  const revenue =
    conversions > 0 && revPerConv > 0
      ? Number((conversions * revPerConv * (0.96 + f3 * 0.08)).toFixed(2))
      : 0;

  return {
    ...kw,
    avgCpc,
    impressions,
    clicks,
    conversions,
    cost,
    revenue,
  };
}
