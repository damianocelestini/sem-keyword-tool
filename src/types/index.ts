export type MatchType = 'EXACT' | 'PHRASE' | 'BROAD';

export type KeywordStatus = 'ACTIVE' | 'PENDING_SYNC' | 'REMOVED' | 'REJECTED';

export type RejectionReason = 
  | 'DUPLICATE' 
  | 'COPYRIGHT_DENYLIST' 
  | 'HISTORICAL_POOR_PERFORMANCE' 
  | 'LOW_SEARCH_VOLUME_GOOGLE_ADS';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Senior Manager Global SEM' | 'Country Revenue Manager' | 'Merchandising Manager';
  country: string;
  isManager: boolean;
  avatarUrl?: string;
  directReports?: string[]; // user IDs
}

export interface Deal {
  id: string;
  permalink: string;
  title: string;
  merchantName: string;
  country: string; // ISO 2-letter: IE, IT, FR, DE, GB, ES
  city: string;
  category: string;
  taxonomy: string; // Full taxonomy breadcrumb e.g. "Local > Beauty & Spas > Massage > Couples"
  status: 'ACTIVE' | 'SOLD_OUT' | 'PAUSED';
  assignedRevenueManagerId: string;
  imageUrl?: string;
  originalPrice: number;
  discountPrice: number;
  marginAmount: number; // Groupon net margin per voucher amount e.g. €22.00
}

export interface DealKeyword {
  id: string;
  dealPermalink: string;
  keyword: string;
  matchType: MatchType;
  addedByUserId: string;
  addedDate: string;
  searchVolume: number; // Google Ads API monthly volume
  avgCpc: number;
  clicks: number;
  impressions: number;
  conversions: number;
  cost: number;
  revenue: number;
  status: KeywordStatus;
  rejectionReason?: RejectionReason;
}

export interface KeywordBatchSubmission {
  id: string;
  userId: string;
  dealPermalink: string;
  country: string;
  timestamp: string;
  rawKeywords: string[];
  results: {
    keyword: string;
    matchType: MatchType;
    status: 'ACCEPTED' | 'REJECTED';
    reason?: RejectionReason;
    searchVolume?: number;
    avgCpc?: number;
  }[];
  syncedToGoogleAds: boolean;
  emailSentAt?: string;
}

export interface DirectReportSummary {
  userId: string;
  name: string;
  country: string;
  dealsCount: number;
  keywordsAdded: number;
  impressions: number;
  clicks: number;
  cost: number;
  revenue: number;
  blendedEgr: number; // Expense as % of Gross Revenue (Cost / Revenue * 100). Below 100% is profitable, above 100% is unprofitable.
  efficiencyScore: number;
}
