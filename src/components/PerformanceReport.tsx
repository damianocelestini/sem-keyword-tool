import React, { useState } from 'react';
import { Deal, DealKeyword, UserProfile } from '../types';
import {
  getKeywordMetricsForTimeRange,
  TimeRangeOption,
  TIME_RANGE_LABELS,
} from '../utils/timeRangeMetrics';
import {
  BarChart3,
  Download,
  Users,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface PerformanceReportProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  deals: Deal[];
  keywords: DealKeyword[];
  onSelectDealToInspect: (permalink: string, country: string) => void;
  timeRange?: TimeRangeOption;
  onChangeTimeRange?: (range: TimeRangeOption) => void;
}

const formatNumber = (num: number): string => num.toLocaleString('en-US');
const formatCurrency = (amount: number): string =>
  '€' +
  amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const PerformanceReport: React.FC<PerformanceReportProps> = ({
  currentUser,
  allUsers,
  deals,
  keywords,
  onSelectDealToInspect,
  timeRange: externalTimeRange,
  onChangeTimeRange,
}) => {
  const [localDateRange, setLocalDateRange] = useState<TimeRangeOption>('30d');
  const [countryFilter, setCountryFilter] = useState<string>('ALL');
  const [reportView, setReportView] = useState<'my-deals' | 'team-rollup'>(
    currentUser.isManager ? 'team-rollup' : 'my-deals'
  );
  // Track which Revenue Managers are expanded to show their deal-by-deal breakdown
  const [expandedManagerIds, setExpandedManagerIds] = useState<string[]>([]);
  // Optional filter inside expanded manager breakdown: 'all' | 'efficient' | 'inefficient'
  const [dealEfficiencyFilter, setDealEfficiencyFilter] = useState<
    Record<string, 'all' | 'efficient' | 'inefficient'>
  >({});

  const toggleExpandManager = (userId: string) => {
    setExpandedManagerIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const dateRange = externalTimeRange ?? localDateRange;
  const handleDateRangeChange = (newRange: TimeRangeOption) => {
    setLocalDateRange(newRange);
    if (onChangeTimeRange) {
      onChangeTimeRange(newRange);
    }
  };

  // Compute time-range adjusted keywords for all downstream calculations
  const timeRangeKeywords = keywords.map((kw) =>
    getKeywordMetricsForTimeRange(kw, dateRange)
  );

  // Deals scoped to current user (or all deals if global SEM manager)
  const accessibleDeals = deals.filter((deal) => {
    if (countryFilter !== 'ALL' && deal.country !== countryFilter) return false;
    if (!currentUser.isManager && deal.assignedRevenueManagerId !== currentUser.id) return false;
    return true;
  });

  const accessiblePermalinks = new Set(
    accessibleDeals.map((d) => d.permalink.toLowerCase())
  );

  // Export report to CSV
  const handleExportCSV = () => {
    const headers = [
      'Deal Permalink',
      'Merchant',
      'Country',
      'City',
      'Keywords Count',
      'Clicks',
      'Impressions',
      'CTR %',
      'Conversions',
      'Cost (€)',
      'Revenue (€)',
      'EGR %',
    ];

    const rows = accessibleDeals.map((deal) => {
      const dealKws = timeRangeKeywords.filter(
        (kw) =>
          kw.dealPermalink.toLowerCase() === deal.permalink.toLowerCase() &&
          (currentUser.isManager || kw.addedByUserId === currentUser.id)
      );
      const clicks = dealKws.reduce((s, k) => s + k.clicks, 0);
      const impr = dealKws.reduce((s, k) => s + k.impressions, 0);
      const conv = dealKws.reduce((s, k) => s + k.conversions, 0);
      const cost = dealKws.reduce((s, k) => s + k.cost, 0);
      const rev = dealKws.reduce((s, k) => s + k.revenue, 0);
      const ctr = impr > 0 ? ((clicks / impr) * 100).toFixed(1) : '0';
      const egr = rev > 0 ? ((cost / rev) * 100).toFixed(0) : cost > 0 ? '>200' : '0';

      return [
        deal.permalink,
        `"${deal.merchantName}"`,
        deal.country,
        deal.city,
        dealKws.length,
        clicks,
        impr,
        ctr,
        conv,
        cost.toFixed(2),
        rev.toFixed(2),
        egr,
      ].join(',');
    });

    const csvData = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `groupon_sem_performance_report_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Direct reports metrics calculation for manager rollup (with deal-level breakdown)
  const directReports = allUsers.filter((u) => !u.isManager);
  const teamRollupData = directReports
    .map((reportUser) => {
      const userDeals = deals.filter(
        (d) =>
          d.assignedRevenueManagerId === reportUser.id &&
          (countryFilter === 'ALL' || d.country === countryFilter)
      );
      const userDealPermalinks = new Set(userDeals.map((d) => d.permalink.toLowerCase()));
      const userKws = timeRangeKeywords.filter(
        (k) =>
          k.addedByUserId === reportUser.id &&
          userDealPermalinks.has(k.dealPermalink.toLowerCase())
      );

      const clicks = userKws.reduce((s, k) => s + k.clicks, 0);
      const impr = userKws.reduce((s, k) => s + k.impressions, 0);
      const conv = userKws.reduce((s, k) => s + k.conversions, 0);
      const cost = userKws.reduce((s, k) => s + k.cost, 0);
      const rev = userKws.reduce((s, k) => s + k.revenue, 0);
      // EGR = Cost / Revenue * 100 (Below 100% good, above 100% bad)
      const egr = rev > 0 ? (cost / rev) * 100 : cost > 0 ? 999 : 0;
      const efficiencyScore = Math.min(
        100,
        Math.max(10, Math.round(100 - egr / 2 + userKws.length * 1.5))
      );
      const bonusPacing = egr <= 40 ? 140 : egr <= 60 ? 120 : egr <= 100 ? 100 : 70;

      // Per-deal breakdown for this Revenue Manager
      const dealBreakdown = userDeals
        .map((deal) => {
          const dKws = timeRangeKeywords.filter(
            (kw) => kw.dealPermalink.toLowerCase() === deal.permalink.toLowerCase()
          );
          const dClicks = dKws.reduce((s, k) => s + k.clicks, 0);
          const dImpr = dKws.reduce((s, k) => s + k.impressions, 0);
          const dConv = dKws.reduce((s, k) => s + k.conversions, 0);
          const dCost = dKws.reduce((s, k) => s + k.cost, 0);
          const dRev = dKws.reduce((s, k) => s + k.revenue, 0);
          const dCtr = dImpr > 0 ? (dClicks / dImpr) * 100 : 0;
          const dEgr = dRev > 0 ? (dCost / dRev) * 100 : dCost > 0 ? 999 : 0;
          const dNetProfit = dRev - dCost;
          const isEfficient = dEgr < 100;

          // Count how many unprofitable broad/phrase keywords exist on this deal
          const unprofitableKwsCount = dKws.filter(
            (k) => k.status !== 'REMOVED' && k.cost > k.revenue
          ).length;

          return {
            deal,
            keywordsCount: dKws.length,
            clicks: dClicks,
            impressions: dImpr,
            ctr: dCtr,
            conversions: dConv,
            cost: dCost,
            revenue: dRev,
            netProfit: dNetProfit,
            egr: dEgr,
            isEfficient,
            unprofitableKwsCount,
          };
        })
        .sort((a, b) => b.egr - a.egr); // Sort highest EGR (least efficient) first so manager immediately spots issues

      const efficientDealsCount = dealBreakdown.filter((d) => d.isEfficient).length;
      const inefficientDealsCount = dealBreakdown.filter((d) => !d.isEfficient).length;

      return {
        user: reportUser,
        dealsCount: userDeals.length,
        keywordsCount: userKws.length,
        clicks,
        impr,
        conv,
        cost,
        revenue: rev,
        egr,
        efficiencyScore,
        bonusPacing,
        dealBreakdown,
        efficientDealsCount,
        inefficientDealsCount,
      };
    })
    .filter((row) => row.dealsCount > 0);

  // Calculate aggregated totals for the active time range and market filter
  const totalUserKeywords = timeRangeKeywords.filter(
    (k) =>
      accessiblePermalinks.has(k.dealPermalink.toLowerCase()) &&
      (currentUser.isManager || k.addedByUserId === currentUser.id)
  );
  const totalSpend = totalUserKeywords.reduce((s, k) => s + k.cost, 0);
  const totalRevenue = totalUserKeywords.reduce((s, k) => s + k.revenue, 0);
  const totalProfit = totalRevenue - totalSpend;
  const blendedEgr = totalRevenue > 0 ? (totalSpend / totalRevenue) * 100 : 0;

  const allManagersExpanded =
    teamRollupData.length > 0 &&
    teamRollupData.every((r) => expandedManagerIds.includes(r.user.id));

  const handleToggleExpandAll = () => {
    if (allManagersExpanded) {
      setExpandedManagerIds([]);
    } else {
      setExpandedManagerIds(teamRollupData.map((r) => r.user.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Executive Controls & Filters */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              SEM Performance & Revenue Efficiency Report
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Tracking deal-level keyword contribution, revenue per click, and bonus challenge milestones.
            </p>
          </div>

          {/* Sub-view switcher & Export */}
          <div className="flex items-center gap-3">
            {currentUser.isManager && (
              <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
                <button
                  type="button"
                  onClick={() => setReportView('team-rollup')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    reportView === 'team-rollup'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  SEM Team Rollup
                </button>
                <button
                  type="button"
                  onClick={() => setReportView('my-deals')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    reportView === 'my-deals'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Assigned Deals
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-lg border border-neutral-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-neutral-500" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="pt-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <label
                htmlFor="country-filter-select"
                className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mr-2"
              >
                Market:
              </label>
              <select
                id="country-filter-select"
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="h-8 px-2.5 bg-neutral-50 border border-neutral-300 rounded-md text-xs font-semibold text-neutral-800"
              >
                <option value="ALL">All Markets</option>
                <option value="IE">Ireland (IE)</option>
                <option value="IT">Italy (IT)</option>
                <option value="FR">France (FR)</option>
                <option value="DE">Germany (DE)</option>
                <option value="GB">United Kingdom (GB)</option>
                <option value="ES">Spain (ES)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="date-window-select"
                className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mr-2"
              >
                Time Range:
              </label>
              <select
                id="date-window-select"
                value={dateRange}
                onChange={(e) => handleDateRangeChange(e.target.value as TimeRangeOption)}
                className="h-8 px-2.5 bg-neutral-50 border border-neutral-300 rounded-md text-xs font-semibold text-neutral-800 cursor-pointer"
              >
                <option value="7d">Last 7 Days</option>
                <option value="14d">Last 14 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days (Quarter)</option>
                <option value="ytd">Year-to-Date (YTD)</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-neutral-500 font-medium">
            Showing metrics for:{' '}
            <span className="font-bold text-[#387b0e]">{TIME_RANGE_LABELS[dateRange]}</span>
          </div>
        </div>
      </div>

      {/* 2. Top Metric KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
          <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Active Deals Tracked
          </p>
          <p className="text-2xl font-extrabold text-neutral-900 tabular-nums font-mono mt-1">
            {accessibleDeals.length}
          </p>
          <p className="text-xs text-neutral-500 mt-0.5">
            {totalUserKeywords.length} keywords active in Google Ads
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
          <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Total SEM Ad Spend
          </p>
          <p className="text-2xl font-extrabold text-neutral-900 tabular-nums font-mono mt-1">
            €{totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-neutral-500 mt-0.5">
            Avg CPC: €
            {totalUserKeywords.reduce((s, k) => s + k.clicks, 0) > 0
              ? (totalSpend / totalUserKeywords.reduce((s, k) => s + k.clicks, 0)).toFixed(2)
              : '0.00'}
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
          <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Total SEM Revenue
          </p>
          <p className="text-2xl font-extrabold text-[#387b0e] tabular-nums font-mono mt-1">
            €{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-emerald-700 font-semibold mt-0.5">
            Net Margin: +€
            {totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xs">
          <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Blended EGR (E%GR)
          </p>
          <p
            className={`text-2xl font-extrabold tabular-nums font-mono mt-1 ${
              blendedEgr < 100 ? 'text-[#387b0e]' : 'text-rose-600'
            }`}
          >
            {blendedEgr.toFixed(0)}%
          </p>
          <p className="text-xs text-neutral-500 mt-0.5">
            {blendedEgr < 100 ? 'Good: <100% (Healthy Margin)' : 'Bad: >100% (Loss)'}
          </p>
        </div>
      </div>

      {/* 3. Main Data View: Team Rollup OR Assigned Deals */}
      {reportView === 'team-rollup' && currentUser.isManager ? (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-neutral-500" />
                SEM Direct Reports Rollup (Manager View: Damiano Celestini)
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Click on any <span className="font-semibold text-neutral-800">Revenue Manager name</span> to break down their deals and identify which deals are efficient vs. inefficient.
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleExpandAll}
              className="self-start sm:self-center px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg border border-neutral-200 transition-colors cursor-pointer shrink-0"
            >
              {allManagersExpanded ? 'Collapse All Deals' : 'Expand All Deals'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-100/75 border-b border-neutral-200 text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Revenue Manager</th>
                  <th className="py-2.5 px-3">Market</th>
                  <th className="py-2.5 px-3 text-right">Deals (Eff / Ineff)</th>
                  <th className="py-2.5 px-3 text-right">KWs Added</th>
                  <th className="py-2.5 px-3 text-right">Clicks</th>
                  <th className="py-2.5 px-3 text-right">Cost</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                  <th className="py-2.5 px-4 text-right">Blended EGR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-sans">
                {teamRollupData.map((row) => {
                  const isExpanded = expandedManagerIds.includes(row.user.id);
                  const activeEfficiencyFilter = dealEfficiencyFilter[row.user.id] || 'all';
                  const filteredDealBreakdown = row.dealBreakdown.filter((d) => {
                    if (activeEfficiencyFilter === 'efficient') return d.isEfficient;
                    if (activeEfficiencyFilter === 'inefficient') return !d.isEfficient;
                    return true;
                  });

                  return (
                    <React.Fragment key={row.user.id}>
                      {/* Main Revenue Manager Row (Clickable to toggle deal breakdown) */}
                      <tr
                        onClick={() => toggleExpandManager(row.user.id)}
                        className={`transition-colors cursor-pointer group ${
                          isExpanded ? 'bg-neutral-100/90' : 'hover:bg-neutral-50/90'
                        }`}
                      >
                        {/* Name with Expand Chevron */}
                        <td className="py-3 px-4 font-semibold text-neutral-900">
                          <div className="flex items-center gap-2">
                            <span
                              className={`p-1 rounded transition-colors ${
                                isExpanded
                                  ? 'bg-[#53a318] text-white'
                                  : 'bg-neutral-100 text-neutral-500 group-hover:bg-[#53a318]/15 group-hover:text-[#387b0e]'
                              }`}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                            </span>
                            <div>
                              <p className="font-bold text-neutral-900 group-hover:text-[#387b0e] transition-colors flex items-center gap-1.5">
                                {row.user.name}
                                <span className="text-[10px] font-medium text-neutral-400 group-hover:text-[#387b0e]">
                                  {isExpanded ? '(Hide deals)' : '(View deals)'}
                                </span>
                              </p>
                              <p className="text-[10px] text-neutral-500 font-mono">
                                {row.user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Market */}
                        <td className="py-3 px-3 font-semibold text-neutral-700">
                          {row.user.country}
                        </td>

                        {/* Deals Count + Efficient vs Inefficient Split */}
                        <td className="py-3 px-3 text-right font-mono tabular-nums">
                          <span className="font-bold text-neutral-900">{row.dealsCount}</span>{' '}
                          <span className="text-[10px] text-neutral-500">
                            (<span className="text-[#387b0e] font-bold">{row.efficientDealsCount}✓</span>
                            {' / '}
                            <span
                              className={
                                row.inefficientDealsCount > 0
                                  ? 'text-rose-600 font-bold'
                                  : 'text-neutral-400'
                              }
                            >
                              {row.inefficientDealsCount}!
                            </span>
                            )
                          </span>
                        </td>

                        {/* Keywords */}
                        <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-neutral-900">
                          {formatNumber(row.keywordsCount)}
                        </td>

                        {/* Clicks */}
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-700">
                          {formatNumber(row.clicks)}
                        </td>

                        {/* Cost */}
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-700">
                          {formatCurrency(row.cost)}
                        </td>

                        {/* Revenue */}
                        <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-[#387b0e]">
                          {formatCurrency(row.revenue)}
                        </td>

                        {/* Blended EGR (Below 100% good, above 100% bad) */}
                        <td
                          className={`py-3 px-4 text-right font-mono tabular-nums font-bold ${
                            row.egr < 100 ? 'text-[#387b0e]' : 'text-rose-600'
                          }`}
                        >
                          {row.egr > 900 ? '>200%' : `${row.egr.toFixed(0)}%`}
                        </td>
                      </tr>

                      {/* Expanded Deal-by-Deal Breakdown for this Revenue Manager */}
                      {isExpanded && (
                        <tr className="bg-neutral-50/90">
                          <td colSpan={8} className="p-0 border-b-2 border-neutral-300">
                            <div className="p-4 pl-8 space-y-3">
                              {/* Breakdown Header & Quick Efficiency Filter */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-200">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-bold text-neutral-900">
                                    {row.user.name} — Assigned Deals Breakdown ({row.dealsCount} Deals)
                                  </span>
                                  <span className="text-[11px] font-semibold text-[#387b0e] bg-[#53a318]/10 px-2 py-0.5 rounded border border-[#53a318]/20">
                                    {row.efficientDealsCount} Efficient (&lt;100% EGR)
                                  </span>
                                  <span
                                    className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                                      row.inefficientDealsCount > 0
                                        ? 'text-rose-700 bg-rose-50 border-rose-200'
                                        : 'text-neutral-500 bg-neutral-100 border-neutral-200'
                                    }`}
                                  >
                                    {row.inefficientDealsCount} Inefficient (&gt;100% EGR)
                                  </span>
                                </div>

                                {/* Filter Deals by Efficiency inside this Manager's breakdown */}
                                <div className="flex items-center gap-1 bg-white p-0.5 rounded-md border border-neutral-200 text-[11px]">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDealEfficiencyFilter((prev) => ({
                                        ...prev,
                                        [row.user.id]: 'all',
                                      }));
                                    }}
                                    className={`px-2 py-1 rounded font-semibold cursor-pointer ${
                                      activeEfficiencyFilter === 'all'
                                        ? 'bg-neutral-900 text-white'
                                        : 'text-neutral-600 hover:text-neutral-900'
                                    }`}
                                  >
                                    All ({row.dealsCount})
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDealEfficiencyFilter((prev) => ({
                                        ...prev,
                                        [row.user.id]: 'inefficient',
                                      }));
                                    }}
                                    className={`px-2 py-1 rounded font-semibold cursor-pointer ${
                                      activeEfficiencyFilter === 'inefficient'
                                        ? 'bg-rose-600 text-white'
                                        : 'text-rose-600 hover:bg-rose-50'
                                    }`}
                                  >
                                    Inefficient ({row.inefficientDealsCount})
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDealEfficiencyFilter((prev) => ({
                                        ...prev,
                                        [row.user.id]: 'efficient',
                                      }));
                                    }}
                                    className={`px-2 py-1 rounded font-semibold cursor-pointer ${
                                      activeEfficiencyFilter === 'efficient'
                                        ? 'bg-[#53a318] text-white'
                                        : 'text-[#387b0e] hover:bg-[#53a318]/10'
                                    }`}
                                  >
                                    Efficient ({row.efficientDealsCount})
                                  </button>
                                </div>
                              </div>

                              {/* Nested Deal Breakdown Table */}
                              <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-2xs">
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead>
                                    <tr className="bg-neutral-100/80 border-b border-neutral-200 text-[10px] font-bold text-neutral-600 uppercase tracking-wider">
                                      <th className="py-2 px-3">Efficiency</th>
                                      <th className="py-2 px-3">Deal Permalink / Title</th>
                                      <th className="py-2 px-2.5">City</th>
                                      <th className="py-2 px-2.5 text-right">KWs</th>
                                      <th className="py-2 px-2.5 text-right">Clicks</th>
                                      <th className="py-2 px-2.5 text-right">Conv</th>
                                      <th className="py-2 px-2.5 text-right">Cost</th>
                                      <th className="py-2 px-2.5 text-right">Revenue</th>
                                      <th className="py-2 px-2.5 text-right">Net P&amp;L</th>
                                      <th className="py-2 px-2.5 text-right">Deal EGR</th>
                                      <th className="py-2 px-3">Manager Coaching Note</th>
                                      <th className="py-2 px-3 text-center">Action</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-neutral-200">
                                    {filteredDealBreakdown.length === 0 ? (
                                      <tr>
                                        <td
                                          colSpan={12}
                                          className="py-6 text-center text-neutral-400 text-xs"
                                        >
                                          No deals match the selected efficiency filter.
                                        </td>
                                      </tr>
                                    ) : (
                                      filteredDealBreakdown.map((item) => {
                                        const isStrong = item.egr < 80;
                                        const isBorderline = item.egr >= 80 && item.egr < 100;

                                        return (
                                          <tr
                                            key={item.deal.id}
                                            onClick={() =>
                                              onSelectDealToInspect(
                                                item.deal.permalink,
                                                item.deal.country
                                              )
                                            }
                                            className={`hover:bg-neutral-50 transition-colors cursor-pointer ${
                                              !item.isEfficient ? 'bg-rose-50/30' : ''
                                            }`}
                                          >
                                            {/* Efficiency Status */}
                                            <td className="py-2.5 px-3 whitespace-nowrap">
                                              {item.isEfficient ? (
                                                <span
                                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                                                    isStrong
                                                      ? 'bg-emerald-50 text-[#387b0e] border-emerald-200'
                                                      : 'bg-amber-50 text-amber-800 border-amber-200'
                                                  }`}
                                                >
                                                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                                                  {isStrong ? 'Efficient' : 'Borderline (<100%)'}
                                                </span>
                                              ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                  <AlertTriangle className="w-3 h-3 shrink-0" />
                                                  Inefficient
                                                </span>
                                              )}
                                            </td>

                                            {/* Deal Permalink & Title */}
                                            <td className="py-2.5 px-3">
                                              <p className="font-mono font-semibold text-neutral-900 max-w-[230px] truncate">
                                                {item.deal.permalink}
                                              </p>
                                              <p className="text-[10px] text-neutral-500 max-w-[230px] truncate">
                                                {item.deal.title}
                                              </p>
                                            </td>

                                            {/* City & Country */}
                                            <td className="py-2.5 px-2.5 whitespace-nowrap">
                                              <span className="font-semibold text-neutral-800">
                                                {item.deal.city}
                                              </span>
                                              <span className="text-[10px] text-neutral-400 ml-1">
                                                ({item.deal.country})
                                              </span>
                                            </td>

                                            {/* KWs */}
                                            <td className="py-2.5 px-2.5 text-right font-mono tabular-nums font-semibold text-neutral-800">
                                              {formatNumber(item.keywordsCount)}
                                            </td>

                                            {/* Clicks */}
                                            <td className="py-2.5 px-2.5 text-right font-mono tabular-nums text-neutral-700">
                                              {formatNumber(item.clicks)}
                                            </td>

                                            {/* Conv */}
                                            <td className="py-2.5 px-2.5 text-right font-mono tabular-nums font-semibold text-neutral-900">
                                              {formatNumber(item.conversions)}
                                            </td>

                                            {/* Cost */}
                                            <td className="py-2.5 px-2.5 text-right font-mono tabular-nums text-neutral-700">
                                              {formatCurrency(item.cost)}
                                            </td>

                                            {/* Revenue */}
                                            <td className="py-2.5 px-2.5 text-right font-mono tabular-nums font-bold text-[#387b0e]">
                                              {formatCurrency(item.revenue)}
                                            </td>

                                            {/* Net P&L */}
                                            <td
                                              className={`py-2.5 px-2.5 text-right font-mono tabular-nums font-semibold ${
                                                item.netProfit >= 0
                                                  ? 'text-[#387b0e]'
                                                  : 'text-rose-600'
                                              }`}
                                            >
                                              {(item.netProfit >= 0 ? '+€' : '-€') +
                                                Math.abs(item.netProfit).toLocaleString('en-US', {
                                                  minimumFractionDigits: 2,
                                                  maximumFractionDigits: 2,
                                                })}
                                            </td>

                                            {/* Deal EGR */}
                                            <td
                                              className={`py-2.5 px-2.5 text-right font-mono tabular-nums font-bold ${
                                                item.egr < 100
                                                  ? 'text-[#387b0e]'
                                                  : 'text-rose-600'
                                              }`}
                                            >
                                              {item.egr > 900
                                                ? '>200%'
                                                : `${item.egr.toFixed(0)}%`}
                                            </td>

                                            {/* Manager Coaching Note */}
                                            <td className="py-2.5 px-3 text-[11px]">
                                              {!item.isEfficient ? (
                                                <span className="text-rose-700 font-medium">
                                                  Pause {item.unprofitableKwsCount} high-spend Broad/Phrase KWs
                                                </span>
                                              ) : isBorderline ? (
                                                <span className="text-amber-800 font-medium">
                                                  Trim {item.unprofitableKwsCount} bleeding broad KWs to lower EGR
                                                </span>
                                              ) : (
                                                <span className="text-neutral-600">
                                                  Healthy margin ({item.unprofitableKwsCount} minor KWs to review)
                                                </span>
                                              )}
                                            </td>

                                            {/* Action */}
                                            <td className="py-2.5 px-3 text-center">
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  onSelectDealToInspect(
                                                    item.deal.permalink,
                                                    item.deal.country
                                                  );
                                                }}
                                                className="px-2.5 py-1 bg-neutral-100 hover:bg-[#53a318] hover:text-white text-neutral-700 rounded text-[11px] font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                                              >
                                                <span>Inspect</span>
                                                <ChevronRight className="w-3 h-3" />
                                              </button>
                                            </td>
                                          </tr>
                                        );
                                      })
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Deals-Level Performance Report */
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Assigned Permalinks Performance
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Click any permalink or 'Inspect' to view granular keywords and manage removals.
              </p>
            </div>
            <span className="text-xs text-neutral-500 font-mono">
              {accessibleDeals.length} Deals in view
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-100/75 border-b border-neutral-200 text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Deal Permalink</th>
                  <th className="py-2.5 px-3">Merchant / City</th>
                  <th className="py-2.5 px-3 text-right">KWs</th>
                  <th className="py-2.5 px-3 text-right">Clicks</th>
                  <th className="py-2.5 px-3 text-right">Impr</th>
                  <th className="py-2.5 px-3 text-right">CTR</th>
                  <th className="py-2.5 px-3 text-right">Conv</th>
                  <th className="py-2.5 px-3 text-right">Cost</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                  <th className="py-2.5 px-3 text-right">EGR %</th>
                  <th className="py-2.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-sans">
                {accessibleDeals.map((deal) => {
                  const dealKws = timeRangeKeywords.filter(
                    (kw) =>
                      kw.dealPermalink.toLowerCase() === deal.permalink.toLowerCase() &&
                      (currentUser.isManager || kw.addedByUserId === currentUser.id)
                  );
                  const clicks = dealKws.reduce((s, k) => s + k.clicks, 0);
                  const impr = dealKws.reduce((s, k) => s + k.impressions, 0);
                  const conv = dealKws.reduce((s, k) => s + k.conversions, 0);
                  const cost = dealKws.reduce((s, k) => s + k.cost, 0);
                  const rev = dealKws.reduce((s, k) => s + k.revenue, 0);
                  const ctr = impr > 0 ? (clicks / impr) * 100 : 0;
                  const egr = rev > 0 ? (cost / rev) * 100 : cost > 0 ? 999 : 0;

                  return (
                    <tr
                      key={deal.id}
                      className="hover:bg-neutral-50/80 transition-colors group cursor-pointer"
                      onClick={() => onSelectDealToInspect(deal.permalink, deal.country)}
                    >
                      {/* Permalink */}
                      <td className="py-3 px-4 font-mono font-semibold text-neutral-900 group-hover:text-[#387b0e] transition-colors">
                        <div>
                          <p className="max-w-[280px] truncate">{deal.permalink}</p>
                          <p className="text-[10px] text-neutral-500 font-sans truncate font-normal">
                            {deal.title}
                          </p>
                        </div>
                      </td>

                      {/* Merchant & City */}
                      <td className="py-3 px-3 text-neutral-700">
                        <p className="font-medium text-neutral-900">{deal.merchantName}</p>
                        <p className="text-[10px] text-neutral-600 font-semibold flex items-center gap-1 mt-0.5">
                          <span className="text-[#387b0e]">{deal.city}</span> · {deal.country}
                        </p>
                      </td>

                      {/* Keywords Count */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-neutral-900">
                        {formatNumber(dealKws.length)}
                      </td>

                      {/* Clicks */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-700">
                        {formatNumber(clicks)}
                      </td>

                      {/* Impressions */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-500">
                        {formatNumber(impr)}
                      </td>

                      {/* CTR */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-700">
                        {ctr.toFixed(1)}%
                      </td>

                      {/* Conv */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-neutral-900">
                        {formatNumber(conv)}
                      </td>

                      {/* Cost */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-700">
                        {formatCurrency(cost)}
                      </td>

                      {/* Revenue */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-[#387b0e]">
                        {formatCurrency(rev)}
                      </td>

                      {/* EGR (Below 100% good, above 100% bad) */}
                      <td
                        className={`py-3 px-3 text-right font-mono tabular-nums font-bold ${
                          egr < 100 ? 'text-[#387b0e]' : 'text-rose-600'
                        }`}
                      >
                        {egr > 900 ? '>200%' : `${egr.toFixed(0)}%`}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDealToInspect(deal.permalink, deal.country);
                          }}
                          className="px-2.5 py-1 bg-neutral-100 hover:bg-[#53a318] hover:text-white text-neutral-700 rounded text-xs font-semibold transition-colors flex items-center gap-1 mx-auto cursor-pointer"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

