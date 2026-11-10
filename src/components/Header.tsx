import React from 'react';
import { UserProfile } from '../types';
import { ChevronDown, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  activeTab: 'deal-inspector' | 'performance-report' | 'batch-sync' | 'editorial-cms';
  onChangeTab: (tab: 'deal-inspector' | 'performance-report' | 'batch-sync' | 'editorial-cms') => void;
  pendingSyncCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  onSelectUser,
  activeTab,
  onChangeTab,
  pendingSyncCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">

      {/* Main Top Navigation: 3-Zone Contract */}
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Lockup */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-[#53a318] flex items-center justify-center shadow-sm">
            {/* Iconic Groupon G */}
            <span className="text-white font-extrabold text-2xl tracking-tighter select-none font-sans">G</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-neutral-900 tracking-tight">Keyword Tool</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-none">Deal Keyword Generation & Performance</p>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1">
          <button
            onClick={() => onChangeTab('deal-inspector')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'deal-inspector'
                ? 'bg-[#53a318]/10 text-[#387b0e] font-bold border-b-2 border-[#53a318]'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Deal/Keywords
          </button>

          <button
            onClick={() => onChangeTab('performance-report')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'performance-report'
                ? 'bg-[#53a318]/10 text-[#387b0e] font-bold border-b-2 border-[#53a318]'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Performance Report {currentUser.isManager && '(Team Rollup)'}
          </button>

          <button
            onClick={() => onChangeTab('batch-sync')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap relative ${
              activeTab === 'batch-sync'
                ? 'bg-[#53a318]/10 text-[#387b0e] font-bold border-b-2 border-[#53a318]'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Overnight Sync & Daily Recap
            {pendingSyncCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 bg-amber-500 text-white text-[10px] rounded-full font-bold">
                {pendingSyncCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onChangeTab('editorial-cms')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'editorial-cms'
                ? 'bg-[#53a318]/10 text-[#387b0e] font-bold border-b-2 border-[#53a318]'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Editorial CMS Suggester
          </button>
        </nav>

        {/* Zone 3: User Identity Switcher (Scoped Login) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative group">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer">
              <div className="w-7 h-7 rounded-full bg-[#387b0e] text-white flex items-center justify-center text-xs font-bold">
                {currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5 leading-tight">
                  {currentUser.name}
                  {currentUser.isManager && (
                    <span className="text-[10px] text-amber-700 bg-amber-100 px-1 rounded font-semibold">Lead</span>
                  )}
                </div>
                <div className="text-[11px] text-neutral-500 leading-tight">
                  {currentUser.email} · {currentUser.country}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600" />
            </div>

            {/* Dropdown Menu to switch persona */}
            <div className="absolute right-0 top-full mt-1 w-72 bg-white rounded-lg shadow-xl border border-neutral-200 p-2 hidden group-hover:block z-50">
              <div className="px-2 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                <span>Switch Revenue Manager</span>
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
              </div>
              <div className="space-y-1">
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => onSelectUser(u)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center justify-between transition-colors ${
                      u.id === currentUser.id
                        ? 'bg-[#53a318]/15 text-[#387b0e] font-semibold'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-neutral-900 leading-snug">{u.name}</p>
                      <p className="text-[10px] text-neutral-500 leading-snug">
                        {u.role} ({u.country})
                      </p>
                    </div>
                    {u.id === currentUser.id && (
                      <span className="text-[10px] font-bold text-[#387b0e] bg-white px-1.5 py-0.5 rounded shadow-xs">
                        Active
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-neutral-100 text-[10px] text-neutral-400 px-2 leading-relaxed">
                As per Groupon SEM policy, revenue managers only access performance data for their assigned deals and keywords.
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
