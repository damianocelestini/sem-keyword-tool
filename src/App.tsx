import React, { useState } from 'react';
import {
  MOCK_USERS,
  MOCK_DEALS,
  INITIAL_KEYWORDS,
  INITIAL_BATCHES,
} from './data/mockData';
import {
  UserProfile,
  Deal,
  DealKeyword,
  KeywordBatchSubmission,
} from './types';
import { Header } from './components/Header';
import { DealInspector } from './components/DealInspector';
import { PerformanceReport } from './components/PerformanceReport';
import { BatchSyncViewer } from './components/BatchSyncViewer';
import { EditorialCmsSuggester } from './components/EditorialCmsSuggester';
import { TimeRangeOption } from './utils/timeRangeMetrics';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  // Current user persona: default to Damiano Celestini (Global SEM Lead)
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USERS[0]);
  const [deals] = useState<Deal[]>(MOCK_DEALS);
  const [keywords, setKeywords] = useState<DealKeyword[]>(INITIAL_KEYWORDS);
  const [batches, setBatches] = useState<KeywordBatchSubmission[]>(INITIAL_BATCHES);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    'deal-inspector' | 'performance-report' | 'batch-sync' | 'editorial-cms'
  >('deal-inspector');

  // Shared time range across Deal/Keywords and Performance Report
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('30d');

  // Currently inspected deal permalink and country (starts empty so user can start from scratch or reset)
  const [selectedPermalink, setSelectedPermalink] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  // Syncing state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Add new submitted batch to queue (processed overnight, results sent via email recap)
  const handleAddBatch = (newBatch: KeywordBatchSubmission) => {
    setBatches((prev) => [newBatch, ...prev]);

    showToast(
      `Keywords submitted and queued (${newBatch.results.length} terms). You will receive an email recap with the results.`
    );
  };

  // Remove a keyword (pause in Google Ads)
  const handleRemoveKeyword = (keywordId: string) => {
    setKeywords((prev) =>
      prev.map((kw) => (kw.id === keywordId ? { ...kw, status: 'REMOVED' } : kw))
    );
    showToast('Keyword removed from deal campaign.');
  };

  // Trigger overnight batch sync
  const handleTriggerOvernightSync = () => {
    setIsSyncing(true);

    setTimeout(() => {
      // Collect accepted keywords from all unsynced batches to push into active deal keywords
      const unsyncedBatches = batches.filter((b) => !b.syncedToGoogleAds);
      const newlySyncedKeywords: DealKeyword[] = [];

      unsyncedBatches.forEach((batch, bIdx) => {
        const acceptedKws = batch.results.filter((r) => r.status === 'ACCEPTED');
        acceptedKws.forEach((r, kIdx) => {
          const isExact = r.matchType === 'EXACT';
          const isPhrase = r.matchType === 'PHRASE';

          const baseImpr = 260 + Math.floor(Math.random() * 220);
          const impressions = isExact
            ? Math.round(baseImpr * 0.75)
            : isPhrase
            ? baseImpr
            : Math.round(baseImpr * 1.5);
          const ctr = isExact ? 0.055 : isPhrase ? 0.038 : 0.024;
          const clicks = Math.max(5, Math.round(impressions * ctr));
          const cpc = r.avgCpc || (isExact ? 0.95 : isPhrase ? 1.15 : 1.35);
          const cost = Number((clicks * cpc).toFixed(2));

          const cr = isExact ? 0.08 : isPhrase ? 0.048 : 0.02;
          const conversions = Math.round(clicks * cr);
          let revenue = 0;

          if (isExact) {
            revenue = Number((cost * (1.6 + Math.random() * 0.4)).toFixed(2));
          } else if (isPhrase) {
            revenue = Number((cost * (1.1 + Math.random() * 0.25)).toFixed(2));
          } else {
            revenue =
              conversions > 0 ? Number((cost * (0.65 + Math.random() * 0.2)).toFixed(2)) : 0;
          }

          newlySyncedKeywords.push({
            id: `kw-synced-${Date.now()}-${bIdx}-${kIdx}`,
            dealPermalink: batch.dealPermalink,
            keyword: r.keyword,
            matchType: r.matchType,
            addedByUserId: batch.userId,
            addedDate: new Date().toISOString().split('T')[0],
            searchVolume: r.searchVolume || 250,
            avgCpc: cpc,
            clicks,
            impressions,
            conversions,
            cost,
            revenue,
            status: 'ACTIVE',
          });
        });
      });

      if (newlySyncedKeywords.length > 0) {
        setKeywords((prev) => [...newlySyncedKeywords, ...prev]);
      }

      // Mark all pending batches as synced
      setBatches((prev) =>
        prev.map((b) =>
          !b.syncedToGoogleAds
            ? {
                ...b,
                syncedToGoogleAds: true,
                emailSentAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
              }
            : b
        )
      );

      setIsSyncing(false);
      showToast(
        'Overnight sync complete! Validated keywords pushed to Google Ads & morning recap email sent.'
      );
    }, 1200);
  };

  // Switch to inspect a deal from performance report
  const handleSelectDealToInspect = (permalink: string, country: string) => {
    setSelectedPermalink(permalink);
    setSelectedCountry(country);
    setActiveTab('deal-inspector');
  };

  const handleSearchDeal = (permalink: string, country: string) => {
    setSelectedPermalink(permalink);
    setSelectedCountry(country);
  };

  const handleSelectUser = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.country !== 'GLOBAL') {
      setSelectedCountry(user.country);
      const userDeal = deals.find((d) => d.country === user.country);
      if (userDeal) {
        setSelectedPermalink(userDeal.permalink);
      }
    }
  };

  // Count pending queued keywords across unsynced batches
  const pendingSyncCount = batches
    .filter((b) => !b.syncedToGoogleAds)
    .reduce((sum, b) => sum + b.results.length, 0);

  return (
    <div className="min-h-screen bg-neutral-100/70 text-neutral-900 flex flex-col font-sans">
      {/* Top Bar with Groupon branding, tabs, and persona switcher */}
      <Header
        currentUser={currentUser}
        allUsers={MOCK_USERS}
        onSelectUser={handleSelectUser}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        pendingSyncCount={pendingSyncCount}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 text-white text-xs px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-neutral-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#53a318] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6">
        {/* Deal Inspector & Add Keywords (Core View 1) */}
        {activeTab === 'deal-inspector' && (
          <DealInspector
            currentUser={currentUser}
            deals={deals}
            keywords={keywords}
            onAddBatch={handleAddBatch}
            onRemoveKeyword={handleRemoveKeyword}
            selectedPermalink={selectedPermalink}
            selectedCountry={selectedCountry}
            onSearchDeal={handleSearchDeal}
            timeRange={timeRange}
            onChangeTimeRange={setTimeRange}
          />
        )}

        {/* Tableau-Style Performance Report & Manager Rollup (Core View 2) */}
        {activeTab === 'performance-report' && (
          <PerformanceReport
            currentUser={currentUser}
            allUsers={MOCK_USERS}
            deals={deals}
            keywords={keywords}
            onSelectDealToInspect={handleSelectDealToInspect}
            timeRange={timeRange}
            onChangeTimeRange={setTimeRange}
          />
        )}

        {/* Overnight Batch Sync & Daily Email Recap (Core View 3) */}
        {activeTab === 'batch-sync' && (
          <BatchSyncViewer
            currentUser={currentUser}
            batches={batches}
            onTriggerOvernightSync={handleTriggerOvernightSync}
            isSyncing={isSyncing}
          />
        )}

        {/* Editorial CMS Keyword Suggester (Cross-Functional Innovation) */}
        {activeTab === 'editorial-cms' && (
          <EditorialCmsSuggester allKeywords={keywords} deals={deals} />
        )}
      </main>
    </div>
  );
}
