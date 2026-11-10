import React, { useState, useId, useEffect } from 'react';
import { Deal, DealKeyword, MatchType, UserProfile, KeywordBatchSubmission } from '../types';
import {
  parseKeywordsInput,
  validateKeywordCandidate,
  ValidationItemResult,
} from '../services/keywordValidation';
import {
  getKeywordMetricsForTimeRange,
  TimeRangeOption,
  TIME_RANGE_LABELS,
} from '../utils/timeRangeMetrics';
import {
  Search,
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  TrendingUp,
  MousePointer,
  Percent,
  Check,
  MapPin,
  Building2,
  Tag,
  Calendar,
  RotateCcw,
  X,
  Clock,
  Mail,
} from 'lucide-react';

interface DealInspectorProps {
  currentUser: UserProfile;
  deals: Deal[];
  keywords: DealKeyword[];
  onAddBatch: (batch: KeywordBatchSubmission) => void;
  onRemoveKeyword: (keywordId: string) => void;
  selectedPermalink: string;
  selectedCountry: string;
  onSearchDeal: (permalink: string, country: string) => void;
  timeRange?: TimeRangeOption;
  onChangeTimeRange?: (range: TimeRangeOption) => void;
}

// Consistent number and financial formatters for numbers >= 1000
const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

const formatCurrency = (amount: number): string => {
  return (
    '€' +
    amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};

// Formats keyword with match type syntax (e.g. [qc terme milano sconti], "spa porta romana", +terme milano)
const formatKeywordWithMatch = (rawKw: string, matchType: MatchType): string => {
  const clean = rawKw
    .replace(/^\[|\]$/g, '')
    .replace(/^"|"$/g, '')
    .replace(/^\+/g, '')
    .trim();

  switch (matchType) {
    case 'EXACT':
      return `[${clean}]`;
    case 'PHRASE':
      return `"${clean}"`;
    case 'BROAD':
      return `+${clean}`;
    default:
      return `"${clean}"`;
  }
};

export const DealInspector: React.FC<DealInspectorProps> = ({
  currentUser,
  deals,
  keywords,
  onAddBatch,
  onRemoveKeyword,
  selectedPermalink,
  selectedCountry,
  onSearchDeal,
  timeRange: externalTimeRange,
  onChangeTimeRange,
}) => {
  // Search inputs
  const [permalinkInput, setPermalinkInput] = useState<string>(selectedPermalink);
  const [countryInput, setCountryInput] = useState<string>(selectedCountry);
  const [searchAttempted, setSearchAttempted] = useState<boolean>(
    Boolean(selectedPermalink && selectedCountry)
  );
  const [searchError, setSearchError] = useState<string | null>(null);
  const [localTimeRange, setLocalTimeRange] = useState<TimeRangeOption>('30d');

  const activeTimeRange = externalTimeRange ?? localTimeRange;
  const handleTimeRangeChange = (newRange: TimeRangeOption) => {
    setLocalTimeRange(newRange);
    if (onChangeTimeRange) {
      onChangeTimeRange(newRange);
    }
  };

  // Synchronize when selected permalink/country changes from parent (e.g. navigation or switching persona)
  useEffect(() => {
    setPermalinkInput(selectedPermalink);
    setCountryInput(selectedCountry);
    setSearchAttempted(Boolean(selectedPermalink && selectedCountry));
    setSearchError(null);
  }, [selectedPermalink, selectedCountry]);

  // Keyword Addition State
  const [rawKeywordInput, setRawKeywordInput] = useState<string>('');
  const [csvFileName, setCsvFileName] = useState<string | null>(null);

  // Modal / Filter / Sorting state
  const [validationModalOpen, setValidationModalOpen] = useState<boolean>(false);
  const [validationResults, setValidationResults] = useState<ValidationItemResult[]>([]);
  const [keywordFilterText, setKeywordFilterText] = useState<string>('');
  const [sortBy, setSortBy] = useState<
    'revenue' | 'egr' | 'clicks' | 'conversions' | 'cost' | 'keyword'
  >('revenue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [removalConfirmId, setRemovalConfirmId] = useState<string | null>(null);

  const csvInputId = useId();

  // Find the selected deal by pairing both the permalink slug and the selected country
  const currentDeal =
    selectedPermalink.trim() && selectedCountry.trim()
      ? deals.find(
          (d) =>
            d.permalink.toLowerCase() === selectedPermalink.toLowerCase() &&
            d.country.toUpperCase() === selectedCountry.toUpperCase()
        )
      : undefined;

  // Filter keywords strictly by deal permalink and revenue manager scope, then compute time-range metrics
  const dealKeywords = keywords
    .filter((kw) => {
      const matchesDeal = kw.dealPermalink.toLowerCase() === selectedPermalink.toLowerCase();
      if (!matchesDeal) return false;

      // Scoped access: non-managers only see their own keywords
      if (!currentUser.isManager && kw.addedByUserId !== currentUser.id) {
        return false;
      }
      return true;
    })
    .map((kw) => getKeywordMetricsForTimeRange(kw, activeTimeRange));

  // Filtered & sorted keywords for the table
  const displayedKeywords = dealKeywords
    .filter((kw) => {
      if (!keywordFilterText.trim()) return true;
      const lower = keywordFilterText.toLowerCase();
      const formatted = formatKeywordWithMatch(kw.keyword, kw.matchType).toLowerCase();
      return (
        kw.keyword.toLowerCase().includes(lower) ||
        formatted.includes(lower) ||
        kw.matchType.toLowerCase().includes(lower)
      );
    })
    .sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      if (sortBy === 'keyword') {
        valA = a.keyword.toLowerCase();
        valB = b.keyword.toLowerCase();
        return sortOrder === 'asc'
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      }

      if (sortBy === 'revenue') {
        valA = a.revenue;
        valB = b.revenue;
      } else if (sortBy === 'cost') {
        valA = a.cost;
        valB = b.cost;
      } else if (sortBy === 'clicks') {
        valA = a.clicks;
        valB = b.clicks;
      } else if (sortBy === 'conversions') {
        valA = a.conversions;
        valB = b.conversions;
      } else if (sortBy === 'egr') {
        valA = a.revenue > 0 ? (a.cost / a.revenue) * 100 : a.cost > 0 ? 999 : 0;
        valB = b.revenue > 0 ? (b.cost / b.revenue) * 100 : b.cost > 0 ? 999 : 0;
      }

      return sortOrder === 'asc'
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });

  // Calculate Totals for the deal
  const totalClicks = dealKeywords.reduce((sum, kw) => sum + kw.clicks, 0);
  const totalImpressions = dealKeywords.reduce((sum, kw) => sum + kw.impressions, 0);
  const totalConversions = dealKeywords.reduce((sum, kw) => sum + kw.conversions, 0);
  const totalCost = dealKeywords.reduce((sum, kw) => sum + kw.cost, 0);
  const totalRevenue = dealKeywords.reduce((sum, kw) => sum + kw.revenue, 0);
  const overallCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const overallCr = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const netProfit = totalRevenue - totalCost;
  // EGR = Cost / Revenue * 100%. Below 100% is profitable, above 100% is unprofitable
  const overallEgrPercent =
    totalRevenue > 0 ? (totalCost / totalRevenue) * 100 : totalCost > 0 ? 999 : 0;

  // Handle Search submit: Requires Country & Deal Permalink
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!countryInput.trim() || !permalinkInput.trim()) {
      setSearchError('Please select a Country and enter a Deal Permalink to inspect a deal.');
      return;
    }
    setSearchError(null);
    setSearchAttempted(true);
    onSearchDeal(permalinkInput.trim(), countryInput.trim());
  };

  // Reset / Clear both Deal Permalink and Country back to empty state
  const handleResetSearch = () => {
    setPermalinkInput('');
    setCountryInput('');
    setSearchAttempted(false);
    setSearchError(null);
    setKeywordFilterText('');
    setRawKeywordInput('');
    setCsvFileName(null);
    onSearchDeal('', '');
  };

  // CSV Template download
  const handleDownloadTemplate = () => {
    const csvContent =
      'Keyword\nqc terme milano sconti\nspa porta romana milano offerta\nterme milano ingresso coppia\ncentro benessere milano';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'groupon_sem_keywords_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV File Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n');
      const extractedKeywords: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        if (i === 0 && line.toLowerCase().includes('keyword')) continue;

        const parts = line.split(',');
        const kw = parts[0]?.trim();
        if (kw) {
          extractedKeywords.push(kw);
        }
      }

      if (extractedKeywords.length > 0) {
        setRawKeywordInput((prev) => {
          const joined = extractedKeywords.join(', ');
          return prev ? `${prev}, ${joined}` : joined;
        });
      }
    };
    reader.readAsText(file);
  };

  // Handle Keyword Submission: Each entered keyword is automatically expanded into all 3 match types ([Exact], "Phrase", +Broad) and queued
  const handleSubmitKeywords = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawKeywordInput.trim()) return;

    const parsedKeywords = parseKeywordsInput(rawKeywordInput);
    if (parsedKeywords.length === 0) return;

    const results: ValidationItemResult[] = [];
    const acceptedBatchKeywords: string[] = [];

    parsedKeywords.forEach((raw) => {
      // Strip any wrapper punctuation to get the clean seed keyword
      const clean = raw
        .replace(/^\[|\]$/g, '')
        .replace(/^"|"$/g, '')
        .replace(/^\+/g, '')
        .trim();

      if (!clean) return;

      // Automatically add in all 3 Google Ads match types
      const matchTypes: MatchType[] = ['EXACT', 'PHRASE', 'BROAD'];
      matchTypes.forEach((matchType) => {
        const result = validateKeywordCandidate(
          clean,
          matchType,
          keywords.filter((k) => k.dealPermalink.toLowerCase() === selectedPermalink.toLowerCase()),
          acceptedBatchKeywords
        );

        results.push(result);
        if (result.status === 'ACCEPTED') {
          acceptedBatchKeywords.push(`${result.keyword.toLowerCase()}:::${matchType}`);
        }
      });
    });

    if (results.length === 0) return;

    const newBatch: KeywordBatchSubmission = {
      id: `batch-${Date.now()}`,
      userId: currentUser.id,
      dealPermalink: selectedPermalink,
      country: selectedCountry,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      rawKeywords: results.map((r) => r.keyword),
      results: results.map((r) => ({
        keyword: r.keyword,
        matchType: r.matchType,
        status: r.status,
        reason: r.reason,
        searchVolume: r.searchVolume,
        avgCpc: r.avgCpc,
      })),
      syncedToGoogleAds: false,
    };

    onAddBatch(newBatch);
    setValidationResults(results);
    setValidationModalOpen(true);
    setRawKeywordInput('');
    setCsvFileName(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Deal Search Bar: Country + Deal Permalink + Search & Reset buttons */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-3">
            {/* Country Selector (Required because permalinks are slugs) */}
            <div className="w-full lg:w-52">
              <label
                htmlFor="country-selector"
                className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1"
              >
                Country (Required)
              </label>
              <select
                id="country-selector"
                value={countryInput}
                onChange={(e) => {
                  const newCountry = e.target.value;
                  setCountryInput(newCountry);
                  setSearchError(null);
                }}
                className="w-full h-10 px-3 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#53a318] focus:border-transparent cursor-pointer"
              >
                <option value="">-- Select Country --</option>
                <option value="IT">Italy (IT)</option>
                <option value="IE">Ireland (IE)</option>
                <option value="FR">France (FR)</option>
                <option value="DE">Germany (DE)</option>
                <option value="GB">United Kingdom (GB)</option>
                <option value="ES">Spain (ES)</option>
              </select>
            </div>

            {/* Deal Permalink Slug Input with autocomplete datalist & inline clear button */}
            <div className="flex-1">
              <label
                htmlFor="permalink-input"
                className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1"
              >
                Deal Permalink
              </label>
              <div className="relative">
                <input
                  id="permalink-input"
                  list="deal-permalinks-list"
                  type="text"
                  placeholder="Enter or select deal permalink (e.g. qc-terme-spa-wellness)..."
                  value={permalinkInput}
                  onChange={(e) => {
                    setPermalinkInput(e.target.value);
                    setSearchError(null);
                  }}
                  className="w-full h-10 pl-3 pr-8 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-mono text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#53a318] focus:border-transparent"
                />
                {permalinkInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setPermalinkInput('');
                      setSearchError(null);
                    }}
                    title="Clear permalink input"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5 rounded cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <datalist id="deal-permalinks-list">
                {deals
                  .filter(
                    (d) =>
                      !countryInput || d.country.toUpperCase() === countryInput.toUpperCase()
                  )
                  .map((d) => (
                    <option key={d.id} value={d.permalink}>
                      [{d.country}] {d.city} · {d.title}
                    </option>
                  ))}
              </datalist>
            </div>

            {/* Search & Reset Buttons */}
            <div className="shrink-0 flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 lg:flex-initial h-10 px-6 bg-[#53a318] hover:bg-[#468c14] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Search className="w-3.5 h-3.5" />
                Search
              </button>

              <button
                type="button"
                onClick={handleResetSearch}
                disabled={!countryInput && !permalinkInput && !selectedCountry && !selectedPermalink}
                title="Reset Country and Deal Permalink to empty"
                className={`h-10 px-3.5 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                  countryInput || permalinkInput || selectedCountry || selectedPermalink
                    ? 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-300 cursor-pointer'
                    : 'bg-neutral-50 text-neutral-300 border-neutral-200 cursor-not-allowed'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>

          {searchError && (
            <div className="text-xs text-rose-600 font-medium flex items-center gap-1.5 pt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}
        </form>
      </div>

      {/* 2. MDS Deal Details Banner - Prominently Showing City, Margin %, and Category Taxonomy */}
      {currentDeal ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2">
              {/* City & Country Highlight Badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Prominent City Badge as instructed */}
                <span className="font-bold text-neutral-900 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#53a318]" />
                  City: <span className="text-[#387b0e] font-extrabold">{currentDeal.city}</span>
                </span>

                <span className="font-semibold text-neutral-700 bg-neutral-50 border border-neutral-200 px-2 py-1 rounded-md">
                  Country: {currentDeal.country}
                </span>

                <span className="text-neutral-500 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                  {currentDeal.merchantName}
                </span>

                <span className="text-neutral-400">·</span>

                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Status: {currentDeal.status}
                </span>
              </div>

              {/* Deal Title and Permalink */}
              <div>
                <h2 className="text-base font-bold text-neutral-900 tracking-tight leading-snug">
                  {currentDeal.title}
                </h2>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs">
                  <p className="text-neutral-500 font-mono">
                    Permalink:{' '}
                    <span className="font-semibold text-neutral-700">{currentDeal.permalink}</span>
                  </p>
                  <span className="text-neutral-300">|</span>
                  {/* Category Taxonomy breadcrumb display as requested */}
                  <p className="text-neutral-600 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="font-medium text-neutral-500">Taxonomy:</span>
                    <span className="font-semibold text-neutral-800">
                      {currentDeal.taxonomy || currentDeal.category}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Price, Margin % & Manager Card */}
            <div className="flex items-center gap-4 bg-neutral-50 border border-neutral-200/80 rounded-lg px-4 py-2.5 shrink-0 self-start lg:self-center">
              <div>
                <p className="text-[10px] uppercase font-semibold text-neutral-400">Deal Price</p>
                <p className="text-sm font-bold text-neutral-900 tabular-nums">
                  {formatCurrency(currentDeal.discountPrice)}{' '}
                  <span className="text-neutral-400 line-through text-xs font-normal">
                    {formatCurrency(currentDeal.originalPrice)}
                  </span>
                </p>
                {/* Show margin in % form below deal price as requested */}
                <p className="text-[11px] font-semibold text-neutral-600 tabular-nums mt-0.5">
                  Margin:{' '}
                  <span className="font-bold text-[#387b0e]">
                    {currentDeal.discountPrice > 0
                      ? `${Math.round((currentDeal.marginAmount / currentDeal.discountPrice) * 100)}%`
                      : '0%'}
                  </span>
                </p>
              </div>
              <div className="h-10 w-px bg-neutral-200" />
              <div>
                <p className="text-[10px] uppercase font-semibold text-neutral-400">
                  Assigned Manager
                </p>
                <p className="text-xs font-medium text-neutral-800">
                  {currentDeal.assignedRevenueManagerId === currentUser.id
                    ? `${currentUser.name} (You)`
                    : 'Assigned to Country Team'}
                </p>
                <p className="text-[10px] text-neutral-400 mt-0.5 font-mono">
                  Market: {currentDeal.country}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : searchAttempted ? (
        <div className="p-8 text-center bg-white border border-neutral-200 rounded-xl space-y-2">
          <AlertCircle className="w-8 h-8 text-neutral-400 mx-auto" />
          <p className="text-sm font-bold text-neutral-800">Deal Not Found in MDS</p>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            No deal found matching permalink slug{' '}
            <span className="font-mono font-semibold text-neutral-700">
              "{selectedPermalink}"
            </span>{' '}
            in Country <span className="font-bold text-neutral-700">{selectedCountry}</span>.
            Please ensure you have selected the country where the deal was published.
          </p>
        </div>
      ) : (
        <div className="p-10 text-center bg-white border border-dashed border-neutral-300 rounded-xl space-y-2">
          <Search className="w-7 h-7 text-neutral-400 mx-auto" />
          <p className="text-sm font-bold text-neutral-800">No Deal Selected</p>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            Select a <span className="font-semibold text-neutral-700">Country</span> and enter a{' '}
            <span className="font-semibold text-neutral-700">Deal Permalink</span> above, then click{' '}
            <span className="font-semibold text-[#387b0e]">Search</span> to inspect deal metrics and manage SEM keywords.
          </p>
        </div>
      )}

      {/* 3. Keyword Addition Section (Field to add comma separated keywords or CSV) */}
      {currentDeal && (
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Add Keywords to this Deal</h3>
              <p className="text-xs text-neutral-500">
                Each keyword entered is automatically expanded into all 3 match types ([Exact], "Phrase", +Broad) with automated duplicate and trademark validation.
              </p>
            </div>

            {/* CSV Template Download */}
            <button
              onClick={handleDownloadTemplate}
              className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-neutral-100 border border-neutral-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-neutral-500" />
              Download CSV Template
            </button>
          </div>

          <form onSubmit={handleSubmitKeywords} className="space-y-4">
            <div>
              <label
                htmlFor="keyword-bulk-input"
                className="block text-xs font-semibold text-neutral-700 mb-1"
              >
                Enter Keywords (separated by comma or newline)
              </label>
              <textarea
                id="keyword-bulk-input"
                rows={3}
                placeholder="e.g. qc terme milano sconti, spa porta romana milano, terme milano ingresso coppia"
                value={rawKeywordInput}
                onChange={(e) => setRawKeywordInput(e.target.value)}
                className="w-full p-3 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-sans text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#53a318] focus:border-transparent font-mono"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              {/* CSV Upload & Match syntax helper */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <input
                    id={csvInputId}
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                  <label
                    htmlFor={csvInputId}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-md border border-neutral-300 cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-neutral-500" />
                    {csvFileName ? `CSV: ${csvFileName}` : 'Attach CSV File'}
                  </label>
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">
                  Auto-creates: [Exact], "Phrase", and +Broad for each term
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!rawKeywordInput.trim()}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                  rawKeywordInput.trim()
                    ? 'bg-[#53a318] hover:bg-[#468c14] text-white shadow-xs'
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                }`}
              >
                Submit Keywords
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Deal Keywords Performance Table */}
      {currentDeal && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
          {/* Header of Table */}
          <div className="p-5 border-b border-neutral-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-900">
                  Deal Keywords Performance
                </h3>
                <span className="text-xs text-neutral-500">
                  ({dealKeywords.length} keywords active/tracked)
                </span>
                <span className="text-[11px] font-semibold text-[#387b0e] bg-[#53a318]/10 px-2 py-0.5 rounded border border-[#53a318]/20">
                  {TIME_RANGE_LABELS[activeTimeRange]}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Showing keywords for{' '}
                <span className="font-semibold text-neutral-700">{currentDeal.title}</span> in{' '}
                <span className="font-semibold text-neutral-700">{currentDeal.city}</span> ({currentDeal.country})
              </p>
            </div>

            {/* Time Range, Filter and Sort controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Time Range Selector */}
              <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                <Calendar className="w-3.5 h-3.5 text-[#53a318]" />
                <label htmlFor="deal-time-range" className="font-semibold text-neutral-500">
                  Time Range:
                </label>
                <select
                  id="deal-time-range"
                  value={activeTimeRange}
                  onChange={(e) => handleTimeRangeChange(e.target.value as TimeRangeOption)}
                  className="h-8 px-2.5 bg-neutral-50 border border-neutral-300 rounded-md text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#53a318] cursor-pointer"
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="14d">Last 14 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days (Quarter)</option>
                  <option value="ytd">Year-to-Date (YTD)</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="Filter keywords..."
                value={keywordFilterText}
                onChange={(e) => setKeywordFilterText(e.target.value)}
                className="h-8 px-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#53a318]"
              />

              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-8 px-2 bg-neutral-50 border border-neutral-300 rounded-md text-xs font-medium text-neutral-800 cursor-pointer"
                >
                  <option value="revenue">Revenue</option>
                  <option value="egr">EGR %</option>
                  <option value="clicks">Clicks</option>
                  <option value="conversions">Conversions</option>
                  <option value="cost">Cost</option>
                  <option value="keyword">Keyword</option>
                </select>
                <button
                  type="button"
                  onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                  className="h-8 px-2 bg-neutral-100 hover:bg-neutral-200 rounded border border-neutral-200 text-xs font-semibold cursor-pointer"
                  title="Toggle Asc/Desc"
                >
                  {sortOrder === 'desc' ? '↓' : '↑'}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Aggregate KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-y md:divide-y-0 divide-neutral-200 border-b border-neutral-200 bg-neutral-50/70">
            <div className="p-3.5">
              <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                <MousePointer className="w-3 h-3 text-neutral-400" />
                Clicks & Impr
              </p>
              <p className="text-sm font-bold text-neutral-900 tabular-nums mt-0.5 font-mono">
                {formatNumber(totalClicks)}{' '}
                <span className="text-[11px] font-normal text-neutral-500">
                  / {formatNumber(totalImpressions)}
                </span>
              </p>
              <p className="text-[10px] text-neutral-500 font-mono">
                CTR: {overallCtr.toFixed(2)}%
              </p>
            </div>

            <div className="p-3.5">
              <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                <Percent className="w-3 h-3 text-neutral-400" />
                Conversions & CR
              </p>
              <p className="text-sm font-bold text-neutral-900 tabular-nums mt-0.5 font-mono">
                {formatNumber(totalConversions)}
              </p>
              <p className="text-[10px] text-neutral-500 font-mono">CR: {overallCr.toFixed(2)}%</p>
            </div>

            <div className="p-3.5">
              <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-neutral-400" />
                Total Cost
              </p>
              <p className="text-sm font-bold text-neutral-900 tabular-nums mt-0.5 font-mono">
                {formatCurrency(totalCost)}
              </p>
              <p className="text-[10px] text-neutral-500 font-mono">
                Avg CPC: {formatCurrency(totalClicks > 0 ? totalCost / totalClicks : 0)}
              </p>
            </div>

            <div className="p-3.5">
              <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-[#53a318]" />
                Total Revenue
              </p>
              <p className="text-sm font-bold text-[#387b0e] tabular-nums mt-0.5 font-mono">
                {formatCurrency(totalRevenue)}
              </p>
              <p className="text-[10px] text-emerald-600 font-mono">
                Net Profit:{' '}
                {(netProfit >= 0 ? '+€' : '-€') +
                  Math.abs(netProfit).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </p>
            </div>

            <div className="p-3.5 col-span-2 md:col-span-1">
              <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                Overall EGR (E%GR)
              </p>
              <p
                className={`text-sm font-bold tabular-nums mt-0.5 font-mono ${
                  overallEgrPercent < 100 ? 'text-[#387b0e]' : 'text-rose-600'
                }`}
              >
                {overallEgrPercent > 900 ? '>200%' : `${overallEgrPercent.toFixed(1)}%`}
              </p>
              <p className="text-[10px] font-mono text-neutral-500">
                {overallEgrPercent < 100 ? 'Good (<100% Profitable)' : 'Bad (>100% Loss)'}
              </p>
            </div>
          </div>

          {/* Table Container: 12 Columns without Match and Status columns */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-100/75 border-b border-neutral-200 text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Keyword</th>
                  <th className="py-2.5 px-3 text-right">Search Vol</th>
                  <th className="py-2.5 px-3 text-right">Avg CPC</th>
                  <th className="py-2.5 px-3 text-right">Clicks</th>
                  <th className="py-2.5 px-3 text-right">Impr</th>
                  <th className="py-2.5 px-3 text-right">CTR</th>
                  <th className="py-2.5 px-3 text-right">Conv</th>
                  <th className="py-2.5 px-3 text-right">CR</th>
                  <th className="py-2.5 px-3 text-right">Cost</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                  <th className="py-2.5 px-3 text-right">EGR %</th>
                  <th className="py-2.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-sans">
                {displayedKeywords.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-neutral-400">
                      No keywords found matching filter for this deal.
                    </td>
                  </tr>
                ) : (
                  displayedKeywords.map((kw) => {
                    const ctr = kw.impressions > 0 ? (kw.clicks / kw.impressions) * 100 : 0;
                    const cr = kw.clicks > 0 ? (kw.conversions / kw.clicks) * 100 : 0;
                    // EGR = Cost / Revenue * 100. Below 100% good, above 100% bad.
                    const egr =
                      kw.revenue > 0 ? (kw.cost / kw.revenue) * 100 : kw.cost > 0 ? 999 : 0;
                    const isRemoved = kw.status === 'REMOVED';
                    const formattedKeyword = formatKeywordWithMatch(kw.keyword, kw.matchType);

                    return (
                      <tr
                        key={kw.id}
                        className={`hover:bg-neutral-50/80 transition-colors ${
                          isRemoved ? 'opacity-40 bg-neutral-100/40' : ''
                        }`}
                      >
                        {/* Keyword with match format directly displayed, e.g. [qc terme milano sconti] */}
                        <td
                          className="py-2.5 px-4 font-mono text-xs font-semibold text-neutral-900 max-w-[240px] truncate"
                          title={formattedKeyword}
                        >
                          {formattedKeyword}
                        </td>

                        {/* Search Volume */}
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-neutral-700">
                          {formatNumber(kw.searchVolume)}
                        </td>

                        {/* Avg CPC */}
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-neutral-700">
                          {formatCurrency(kw.avgCpc)}
                        </td>

                        {/* Clicks */}
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-neutral-900">
                          {formatNumber(kw.clicks)}
                        </td>

                        {/* Impressions */}
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-neutral-600">
                          {formatNumber(kw.impressions)}
                        </td>

                        {/* CTR */}
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-neutral-700">
                          {ctr.toFixed(1)}%
                        </td>

                        {/* Conversions */}
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-neutral-900">
                          {formatNumber(kw.conversions)}
                        </td>

                        {/* CR */}
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-neutral-700">
                          {cr.toFixed(1)}%
                        </td>

                        {/* Cost */}
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-neutral-700">
                          {formatCurrency(kw.cost)}
                        </td>

                        {/* Revenue */}
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-[#387b0e]">
                          {formatCurrency(kw.revenue)}
                        </td>

                        {/* EGR % (Below 100% good, above 100% bad) */}
                        <td
                          className={`py-2.5 px-3 text-right font-mono tabular-nums font-bold ${
                            egr < 100 ? 'text-[#387b0e]' : 'text-rose-600'
                          }`}
                        >
                          {egr > 900 ? '>200%' : `${egr.toFixed(0)}%`}
                        </td>

                        {/* Action: Click to remove keyword if poor performance */}
                        <td className="py-2.5 px-4 text-center">
                          {!isRemoved ? (
                            removalConfirmId === kw.id ? (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onRemoveKeyword(kw.id);
                                    setRemovalConfirmId(null);
                                  }}
                                  className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded cursor-pointer"
                                >
                                  Confirm
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRemovalConfirmId(null)}
                                  className="px-1.5 py-0.5 bg-neutral-200 text-neutral-700 text-[10px] rounded cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setRemovalConfirmId(kw.id)}
                                title="Remove keyword from deal"
                                className="text-neutral-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )
                          ) : (
                            <span className="text-[11px] font-medium text-neutral-400">Removed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Total Row: Exactly 12 columns */}
              <tfoot>
                <tr className="bg-neutral-100 font-bold border-t-2 border-neutral-300 text-xs">
                  <td className="py-3 px-4 text-neutral-900" colSpan={3}>
                    TOTAL DEAL PERFORMANCE ({dealKeywords.length} Keywords)
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-900">
                    {formatNumber(totalClicks)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-700">
                    {formatNumber(totalImpressions)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-700">
                    {overallCtr.toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-900">
                    {formatNumber(totalConversions)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-700">
                    {overallCr.toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-900">
                    {formatCurrency(totalCost)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-[#387b0e]">
                    {formatCurrency(totalRevenue)}
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-mono tabular-nums font-bold ${
                      overallEgrPercent < 100 ? 'text-[#387b0e]' : 'text-rose-600'
                    }`}
                  >
                    {overallEgrPercent > 900 ? '>200%' : `${overallEgrPercent.toFixed(0)}%`}
                  </td>
                  <td className="py-3 px-4 text-center text-[11px] text-neutral-500 font-mono">
                    {overallEgrPercent < 100
                      ? 'E%GR Target (<100% Good)'
                      : 'E%GR Alert (>100% Bad)'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* 5. Keyword Submission & Queuing Confirmation Modal */}
      {validationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#53a318]/15 text-[#387b0e] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">
                    Keywords Submitted &amp; Queued
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Deal: <span className="font-mono text-neutral-800">{selectedPermalink}</span> (
                    {selectedCountry})
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Queued ({validationResults.length})
              </span>
            </div>

            <div className="py-4 overflow-y-auto flex-1 space-y-4">
              {/* Queuing & Email Recap Notice */}
              <div className="bg-neutral-50 p-3.5 rounded-lg border border-neutral-200 text-xs text-neutral-700 space-y-2">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-[#53a318] shrink-0 mt-0.5" />
                  <p>
                    Your keywords have been submitted and placed in the{' '}
                    <span className="font-semibold text-neutral-900">overnight sync queue</span>{' '}
                    across all 3 match types (<span className="font-mono">[Exact]</span>,{' '}
                    <span className="font-mono">"Phrase"</span>, and{' '}
                    <span className="font-mono">+Broad</span>).
                  </p>
                </div>
                <div className="flex items-start gap-2 pt-1 border-t border-neutral-200/80">
                  <Mail className="w-4 h-4 text-[#53a318] shrink-0 mt-0.5" />
                  <p>
                    Automated validation checks (duplicates, search volume, and policy rules) will
                    run during the overnight batch process. You will receive an{' '}
                    <span className="font-semibold text-neutral-900">
                      email recap at {currentUser.email}
                    </span>{' '}
                    with the final results.
                  </p>
                </div>
              </div>

              {/* Submitted Keywords List (Queued status only, no premature validation results) */}
              <div>
                <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  Submitted Keywords in Queue ({validationResults.length})
                </p>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {validationResults.map((item, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 rounded-lg border border-neutral-200 bg-white text-xs flex items-center justify-between gap-3"
                    >
                      <span className="font-semibold text-neutral-900 font-mono">
                        {formatKeywordWithMatch(item.keyword, item.matchType)}
                      </span>
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                        Queued
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setValidationModalOpen(false)}
                className="px-5 py-2 bg-[#53a318] hover:bg-[#468c14] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
