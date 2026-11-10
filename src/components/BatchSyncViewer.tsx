import React, { useState } from 'react';
import { UserProfile, KeywordBatchSubmission, RejectionReason } from '../types';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Mail,
  RefreshCw,
  FileSpreadsheet,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

interface BatchSyncViewerProps {
  currentUser: UserProfile;
  batches: KeywordBatchSubmission[];
  onTriggerOvernightSync: () => void;
  isSyncing: boolean;
}

const REJECTION_REASON_LABELS: Record<RejectionReason, string> = {
  DUPLICATE: 'Duplicate (Already active in campaign or batch)',
  COPYRIGHT_DENYLIST: 'Copyright / Trademark Denylist Rule',
  HISTORICAL_POOR_PERFORMANCE: 'Historical Poor Performance (EGR > 150%)',
  LOW_SEARCH_VOLUME_GOOGLE_ADS: 'Low Search Volume (<50/mo in Google Ads)',
};

export const BatchSyncViewer: React.FC<BatchSyncViewerProps> = ({
  currentUser,
  batches,
  onTriggerOvernightSync,
  isSyncing,
}) => {
  const visibleBatches = currentUser.isManager
    ? batches
    : batches.filter((b) => b.userId === currentUser.id || b.country === currentUser.country);

  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    visibleBatches[0]?.id || ''
  );

  const activeBatch =
    visibleBatches.find((b) => b.id === selectedBatchId) || visibleBatches[0];

  const pendingBatchesCount = batches.filter((b) => !b.syncedToGoogleAds).length;

  return (
    <div className="space-y-6">
      {/* Top Control Bar: Overnight Sync Scheduler & Manual Trigger */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-neutral-900">
              Overnight Google Ads Batch Sync &amp; Daily Email Recap
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-[#387b0e] border border-emerald-200">
              02:00 UTC Scheduled Job
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            Submitted keywords are queued during the day, validated against Google Ads Keyword Planner &amp; Denylist rules overnight, and summarized in a morning email recap.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-neutral-800">
              {pendingBatchesCount} Pending {pendingBatchesCount === 1 ? 'Batch' : 'Batches'}
            </div>
            <div className="text-[11px] text-neutral-500">
              Ready for Google Ads API push
            </div>
          </div>

          <button
            type="button"
            onClick={onTriggerOvernightSync}
            disabled={isSyncing || pendingBatchesCount === 0}
            className="px-4 py-2.5 bg-[#53a318] hover:bg-[#468c14] disabled:bg-neutral-200 disabled:text-neutral-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Running Overnight Sync...' : 'Simulate Overnight Sync Now'}
          </button>
        </div>
      </div>

      {/* Split View: Batch Queue List on Left, Email Recap Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Submitted Batches Queue */}
        <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-neutral-200 bg-neutral-50/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#53a318]" />
              <span className="text-xs font-bold text-neutral-900">
                Batch Submission Log ({visibleBatches.length})
              </span>
            </div>
          </div>

          <div className="divide-y divide-neutral-100 max-h-[540px] overflow-y-auto">
            {visibleBatches.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                No keyword batches submitted yet.
              </div>
            ) : (
              visibleBatches.map((batch) => {
                const acceptedCount = batch.results.filter(
                  (r) => r.status === 'ACCEPTED'
                ).length;
                const rejectedCount = batch.results.filter(
                  (r) => r.status === 'REJECTED'
                ).length;
                const isSelected = activeBatch?.id === batch.id;

                return (
                  <button
                    key={batch.id}
                    type="button"
                    onClick={() => setSelectedBatchId(batch.id)}
                    className={`w-full text-left p-4 transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected ? 'bg-[#53a318]/5' : 'hover:bg-neutral-50'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">
                          {batch.country}
                        </span>
                        <span className="text-xs font-bold text-neutral-900 truncate font-mono">
                          {batch.dealPermalink}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                        <span>{batch.timestamp}</span>
                        <span>·</span>
                        <span>{batch.results.length} terms</span>
                      </div>

                      <div className="flex items-center gap-2 pt-0.5">
                        {batch.syncedToGoogleAds ? (
                          <>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#387b0e] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Synced ({acceptedCount} Active, {rejectedCount} Rejected)
                            </span>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <Clock className="w-3 h-3" />
                            Queued for Overnight Sync
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? 'text-[#53a318]' : 'text-neutral-300'
                      }`}
                    />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Automated Morning Email Recap / Validation Breakdown */}
        <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
          {!activeBatch ? (
            <div className="p-10 text-center text-xs text-neutral-500">
              Select a batch on the left to inspect its status and email recap.
            </div>
          ) : !activeBatch.syncedToGoogleAds ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900">
                Batch Queued for Overnight Validation
              </h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
                This submission of <strong>{activeBatch.results.length} keywords</strong> for{' '}
                <span className="font-mono font-semibold text-neutral-800">
                  {activeBatch.dealPermalink}
                </span>{' '}
                is currently in the queue. Click{' '}
                <strong>&ldquo;Simulate Overnight Sync Now&rdquo;</strong> above to run the Google Ads validation job and generate the morning email recap.
              </p>
            </div>
          ) : (
            <div>
              {/* Email Header */}
              <div className="p-4 border-b border-neutral-200 bg-neutral-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#53a318]" />
                    <span className="text-xs font-bold text-neutral-900">
                      Automated Morning Email Recap
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    Sent: {activeBatch.emailSentAt || activeBatch.timestamp}
                  </span>
                </div>
                <div className="text-xs text-neutral-600 space-y-0.5 bg-white p-3 rounded-lg border border-neutral-200">
                  <div>
                    <span className="font-semibold text-neutral-500">Subject:</span>{' '}
                    <span className="font-bold text-neutral-900">
                      [Groupon SEM] Keyword Sync Results for {activeBatch.dealPermalink} ({activeBatch.country})
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-500">Summary:</span>{' '}
                    {activeBatch.results.filter((r) => r.status === 'ACCEPTED').length} Accepted &amp; Pushed to Google Ads ·{' '}
                    {activeBatch.results.filter((r) => r.status === 'REJECTED').length} Rejected by Guardrails
                  </div>
                </div>
              </div>

              {/* Validation Results Table */}
              <div className="p-4 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 text-[11px] font-bold text-neutral-500 uppercase">
                      <th className="py-2 pr-3">Keyword</th>
                      <th className="py-2 px-3">Match</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 pl-3">Validation Detail / Search Vol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {activeBatch.results.map((item, idx) => (
                      <tr key={`${item.keyword}-${idx}`} className="hover:bg-neutral-50/80">
                        <td className="py-2.5 pr-3 font-mono font-semibold text-neutral-900">
                          {item.keyword}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">
                            {item.matchType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {item.status === 'ACCEPTED' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#387b0e] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              ACCEPTED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              <XCircle className="w-3 h-3" />
                              REJECTED
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 pl-3 text-[11px] text-neutral-600">
                          {item.status === 'ACCEPTED' ? (
                            <span className="font-mono text-neutral-700">
                              Vol: {(item.searchVolume || 0).toLocaleString('en-US')}/mo · Est. CPC: €
                              {(item.avgCpc || 0).toFixed(2)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-700">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              {item.reason
                                ? REJECTION_REASON_LABELS[item.reason]
                                : 'Filtered by automated guardrails'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
