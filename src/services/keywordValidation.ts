import { MatchType, RejectionReason, DealKeyword } from '../types';

// Historical deny-list & competitor copyright terms enforced by Groupon SEM Martech
export const DENYLIST_TERMS = [
  'just eat',
  'justeat',
  'deliveroo',
  'uber eats',
  'ubereats',
  'tripadvisor',
  'michelin guide',
  'booking.com',
  'expedia',
  'yelp',
  'airbnb',
  'amazon',
  'ebay',
  'free coupon',
  'free food',
  'pirate',
  'crack',
  'hack',
  'scam',
  'complaint',
  'lawsuit',
  'stolen',
  'counterfeit',
];

export const LOW_VOLUME_TRIGGER_TERMS = [
  'super cheap free',
  'xyz',
  'obscure',
  'qwerty',
  'random words test',
  'zero clicks',
];

export interface ValidationItemResult {
  keyword: string;
  matchType: MatchType;
  status: 'ACCEPTED' | 'REJECTED';
  reason?: RejectionReason;
  reasonMessage?: string;
  searchVolume?: number;
  avgCpc?: number;
}

export function validateKeywordCandidate(
  rawKeyword: string,
  matchType: MatchType,
  existingDealKeywords: DealKeyword[],
  alreadyValidatedInBatch: string[]
): ValidationItemResult {
  const normalized = rawKeyword.trim().toLowerCase();

  if (!normalized) {
    return {
      keyword: rawKeyword,
      matchType,
      status: 'REJECTED',
      reason: 'LOW_SEARCH_VOLUME_GOOGLE_ADS',
      reasonMessage: 'Empty or blank keyword string.',
    };
  }

  // 1. Check Duplicates (both against existing campaign keywords and current submission batch)
  const batchKey = `${normalized}:::${matchType}`;
  const isDuplicateInCampaign = existingDealKeywords.some(
    (kw) =>
      kw.keyword.toLowerCase() === normalized &&
      kw.matchType === matchType &&
      kw.status !== 'REMOVED'
  );
  const isDuplicateInBatch = alreadyValidatedInBatch.includes(batchKey);

  if (isDuplicateInCampaign || isDuplicateInBatch) {
    return {
      keyword: rawKeyword,
      matchType,
      status: 'REJECTED',
      reason: 'DUPLICATE',
      reasonMessage: isDuplicateInCampaign
        ? `Duplicate: Keyword already active for this deal in ${matchType} match.`
        : `Duplicate: Repeated with ${matchType} match in current batch.`,
    };
  }

  // 2. Check Copyright & Deny-list
  const hitDenylist = DENYLIST_TERMS.find((term) => normalized.includes(term));
  if (hitDenylist) {
    return {
      keyword: rawKeyword,
      matchType,
      status: 'REJECTED',
      reason: 'COPYRIGHT_DENYLIST',
      reasonMessage: `Not allowed due to trademark/copyright or denylist rule (matched: "${hitDenylist}").`,
    };
  }

  // 3. Check Google Ads API Search Volume & Planner Data
  // If keyword is too long (> 80 chars) or hits dummy low volume triggers or is single letter
  const isLowVolume =
    normalized.length <= 2 ||
    normalized.length > 80 ||
    LOW_VOLUME_TRIGGER_TERMS.some((term) => normalized.includes(term));

  if (isLowVolume) {
    return {
      keyword: rawKeyword,
      matchType,
      status: 'REJECTED',
      reason: 'LOW_SEARCH_VOLUME_GOOGLE_ADS',
      reasonMessage:
        'No data from Google Ads kwtool: Monthly search volume is below minimum threshold (<50/mo) or unpredictable.',
    };
  }

  // Generated estimated search metrics from Google Ads API simulation
  // Deterministic seed based on keyword characters
  let seed = 0;
  for (let i = 0; i < normalized.length; i++) {
    seed = (seed * 31 + normalized.charCodeAt(i)) % 10000;
  }

  const volMult = matchType === 'EXACT' ? 0.65 : matchType === 'PHRASE' ? 1.0 : 1.45;
  const cpcMult = matchType === 'EXACT' ? 0.92 : matchType === 'PHRASE' ? 1.05 : 1.25;
  const estimatedSearchVolume = Math.round((150 + (seed % 3500)) * volMult);
  const estimatedAvgCpc = Number(((0.55 + ((seed % 120) / 100)) * cpcMult).toFixed(2));

  return {
    keyword: rawKeyword.trim(),
    matchType,
    status: 'ACCEPTED',
    searchVolume: estimatedSearchVolume,
    avgCpc: estimatedAvgCpc,
  };
}

export function parseKeywordsInput(input: string): string[] {
  // Supports comma separated, newline separated, or semicolon separated
  return input
    .split(/[\n,;]+/)
    .map((k) => k.trim())
    .filter((k) => k.length > 0);
}
