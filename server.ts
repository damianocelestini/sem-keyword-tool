import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ProfitableKeywordInput {
  keyword: string;
  searchVolume: number;
  ctr: number;
  conversions: number;
  egr: number;
}

interface CopySuggestionOutput {
  actionType: 'REPLACE' | 'ADD';
  location: 'title' | 'body';
  keyword: string;
  existingSnippet: string;
  proposedSnippet: string;
  rationale: string;
}

interface HeadlineSuggestionOutput {
  headline: string;
  targetKeyword: string;
}

interface AnalysisOutput {
  editorialSummary: string;
  headlineSuggestions: HeadlineSuggestionOutput[];
  suggestions: CopySuggestionOutput[];
}

const MINOR_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'for', 'of', 'in', 'on', 'at', 'to', 'with', 'by',
  'di', 'del', 'della', 'dei', 'degli', 'delle', 'da', 'con', 'su', 'per', 'tra', 'fra', 'e', 'ed', 'o', 'al', 'allo', 'alla', 'ai', 'agli', 'alle', 'nel', 'nella', 'nei', 'nelle', 'sul', 'sulla',
  'de', 'du', 'des', 'le', 'la', 'les', 'et', 'ou', 'en', 'au', 'aux', 'sur', 'avec', 'pour', 'par',
  'und', 'oder', 'für', 'von', 'im', 'am', 'mit', 'auf', 'bei',
  'y', 'el', 'los', 'las', 'por', 'para',
]);

const UPPERCASE_ACRONYMS = new Set([
  'qc', 'vip', 'tv', 'uk', 'gb', 'it', 'fr', 'de', 'es', 'ie', '3d',
]);

function formatHeadlineCase(phrase: string): string {
  const words = phrase.trim().split(/\s+/);
  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (UPPERCASE_ACRONYMS.has(lower)) {
        return lower.toUpperCase();
      }
      if (index > 0 && MINOR_WORDS.has(lower)) {
        return lower;
      }
      if (lower.includes("'")) {
        const parts = lower.split("'");
        if (parts.length === 2 && parts[0].length <= 2) {
          return `${parts[0].toLowerCase()}'${parts[1].charAt(0).toUpperCase()}${parts[1].slice(1)}`;
        }
      }
      if (lower.includes('’')) {
        const parts = lower.split('’');
        if (parts.length === 2 && parts[0].length <= 2) {
          return `${parts[0].toLowerCase()}’${parts[1].charAt(0).toUpperCase()}${parts[1].slice(1)}`;
        }
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

function isKeywordInDraft(keyword: string, title: string, body: string): boolean {
  const combined = `${title} ${body}`.toLowerCase();
  const kwLower = keyword.toLowerCase().trim();
  if (!combined.trim()) return false;
  if (combined.includes(kwLower)) return true;

  const coreTokens = kwLower
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !MINOR_WORDS.has(t));
  if (coreTokens.length === 0) return false;
  return coreTokens.every((t) => combined.includes(t));
}

/**
 * Finds a natural 2-6 word phrase in the user's title or body that shares context
 * with the keyword or represents a generic anchor phrase that can be cleanly replaced.
 */
function findNaturalReplacementTarget(
  keyword: string,
  title: string,
  body: string,
  country: string,
  usedSnippets: Set<string>
): { location: 'title' | 'body'; existingSnippet: string; proposedSnippet: string } | null {
  const kwTokens = keyword
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !MINOR_WORDS.has(t));

  // Candidate regex patterns of generic editorial phrases in IT, EN, FR, DE, ES
  const candidatePatterns: Array<{
    regex: RegExp;
    buildReplacement: (match: string, kw: string, isTitle: boolean) => string;
  }> = [
    // Italian patterns
    {
      regex: /\b(ingresso giornaliero(?:\s+con\s+percorso\s+benessere)?|percorso benessere(?:\s+e\s+area\s+termale)?|pausa rigenerante|esperienza sensoriale(?:\s+indimenticabile)?|visita guidata(?:\s+esclusiva)?|esperienza enogastronomica|giornata di divertimento|percorso degustazione(?:\s+di\s+mare)?)\b/i,
      buildReplacement: (match, kw, isTitle) =>
        isTitle ? formatHeadlineCase(`${match} - ${kw}`) : `${match} con ${kw}`,
    },
    // English patterns
    {
      regex: /\b(dining experience(?:\s+for\s+two)?|culinary precision|guided(?:\s+irish)?(?:\s+single\s+malt)?\s+masterclass|full-day coach excursion|afternoon tea(?:\s+with\s+prosecco)?|luxury countryside retreat|full day of serenity|champagne afternoon tea|open-top bus excursion|sharing platter|history walk)\b/i,
      buildReplacement: (match, kw, isTitle) =>
        isTitle ? formatHeadlineCase(`${match}: ${kw}`) : `${match} featuring ${kw}`,
    },
    // French patterns
    {
      regex: /\b(menu dégustation(?:\s+raffiné)?|navigation panoramique|parenthèse sensorielle|moment d’évasion(?:\s+absolue)?|atelier pâtisserie)\b/i,
      buildReplacement: (match, kw, isTitle) =>
        isTitle ? formatHeadlineCase(`${match} - ${kw}`) : `${match} (${kw})`,
    },
    // German patterns
    {
      regex: /\b(highspeed-action(?:\s+und\s+zeittraining)?|wirtshaus-abend|ganztägige auszeit)\b/i,
      buildReplacement: (match, kw, isTitle) =>
        isTitle ? formatHeadlineCase(`${match}: ${kw}`) : `${match} mit ${kw}`,
    },
    // Spanish patterns
    {
      regex: /\b(ritual de bienestar|ruta gastronómica|velada de arte flamenco)\b/i,
      buildReplacement: (match, kw, isTitle) =>
        isTitle ? formatHeadlineCase(`${match}: ${kw}`) : `${match} con ${kw}`,
    },
  ];

  // 1. Check if the user's title or body has a phrase overlapping with at least one token of the keyword
  const checkTextForTokenWindow = (
    text: string,
    loc: 'title' | 'body'
  ): { location: 'title' | 'body'; existingSnippet: string; proposedSnippet: string } | null => {
    if (!text.trim()) return null;
    const words = text.trim().split(/\s+/);
    if (words.length < 2) return null;

    for (let i = 0; i < words.length; i++) {
      const cleanWord = words[i].toLowerCase().replace(/[.,;:!?()"'’]/g, '');
      if (kwTokens.includes(cleanWord)) {
        const start = Math.max(0, i - 1);
        const end = Math.min(words.length, start + 4);
        const snippet = words
          .slice(start, end)
          .join(' ')
          .replace(/^[.,;:!?]+|[.,;:!?]+$/g, '');
        if (snippet.length >= 6 && !usedSnippets.has(snippet) && text.includes(snippet)) {
          usedSnippets.add(snippet);
          const proposed =
            loc === 'title'
              ? formatHeadlineCase(`${snippet} (${keyword})`)
              : `${snippet} (${keyword})`;
          return { location: loc, existingSnippet: snippet, proposedSnippet: proposed };
        }
      }
    }
    return null;
  };

  // Try pattern matches in body first, then title
  for (const pat of candidatePatterns) {
    const bodyMatch = body.match(pat.regex);
    if (bodyMatch && bodyMatch[0] && !usedSnippets.has(bodyMatch[0])) {
      const snippet = bodyMatch[0];
      usedSnippets.add(snippet);
      return {
        location: 'body',
        existingSnippet: snippet,
        proposedSnippet: pat.buildReplacement(snippet, keyword, false),
      };
    }
    const titleMatch = title.match(pat.regex);
    if (titleMatch && titleMatch[0] && !usedSnippets.has(titleMatch[0])) {
      const snippet = titleMatch[0];
      usedSnippets.add(snippet);
      return {
        location: 'title',
        existingSnippet: snippet,
        proposedSnippet: pat.buildReplacement(snippet, keyword, true),
      };
    }
  }

  const fromBody = checkTextForTokenWindow(body, 'body');
  if (fromBody) return fromBody;

  const fromTitle = checkTextForTokenWindow(title, 'title');
  if (fromTitle) return fromTitle;

  return null;
}

function buildNaturalAdditionSnippet(
  keyword: string,
  location: 'title' | 'body',
  country: string
): string {
  if (location === 'title') {
    return formatHeadlineCase(`- ${keyword}`);
  }
  switch (country.toUpperCase()) {
    case 'IT':
      return `Approfitta dell’offerta esclusiva per ${keyword} con prenotazione immediata.`;
    case 'FR':
      return `Profitez de cette offre exclusive pour ${keyword}.`;
    case 'DE':
      return `Sichere dir jetzt dieses exklusive Angebot für ${keyword}.`;
    case 'ES':
      return `Aprovecha esta oferta exclusiva de ${keyword}.`;
    default:
      return `Book this exclusive offer for ${keyword} with instant voucher confirmation.`;
  }
}

function buildFastContextualAnalysis(
  city: string,
  country: string,
  taxonomy: string,
  title: string,
  body: string,
  profitableKeywords: ProfitableKeywordInput[]
): AnalysisOutput {
  const missingKeywords = profitableKeywords.filter(
    (k) => !isKeywordInDraft(k.keyword, title, body)
  );
  const usedSnippets = new Set<string>();

  const suggestions: CopySuggestionOutput[] = missingKeywords.map((kw, index) => {
    const replaceMatch = findNaturalReplacementTarget(
      kw.keyword,
      title,
      body,
      country,
      usedSnippets
    );

    if (replaceMatch) {
      return {
        actionType: 'REPLACE',
        location: replaceMatch.location,
        keyword: kw.keyword,
        existingSnippet: replaceMatch.existingSnippet,
        proposedSnippet: replaceMatch.proposedSnippet,
        rationale: `Upgrades your existing ${
          replaceMatch.location === 'title' ? 'headline' : 'description'
        } phrase with "${kw.keyword}" (${kw.searchVolume.toLocaleString('en-US')}/mo vol, ${kw.egr.toFixed(0)}% EGR).`,
      };
    }

    const targetLoc: 'title' | 'body' = index === 0 ? 'title' : 'body';
    return {
      actionType: 'ADD',
      location: targetLoc,
      keyword: kw.keyword,
      existingSnippet: '',
      proposedSnippet: buildNaturalAdditionSnippet(kw.keyword, targetLoc, country),
      rationale: `Adds high-intent search term "${kw.keyword}" (${kw.searchVolume.toLocaleString('en-US')}/mo vol, ${kw.egr.toFixed(0)}% EGR) directly into your ${
        targetLoc === 'title' ? 'headline' : 'copy'
      }.`,
    };
  });

  const top1 = profitableKeywords[0];
  const top2 = profitableKeywords[1] || profitableKeywords[0];

  const headlineSuggestions: HeadlineSuggestionOutput[] = [];
  if (top1) {
    const baseTitle = title.trim()
      ? formatHeadlineCase(title.trim())
      : formatHeadlineCase(`${city} ${taxonomy.split('>').pop()?.trim() || 'Deal'}`);
    headlineSuggestions.push({
      headline: formatHeadlineCase(`${ formatHeadlineCase(top1.keyword) }: ${baseTitle}`),
      targetKeyword: top1.keyword,
    });
  }
  if (top2 && top2.keyword !== top1?.keyword) {
    headlineSuggestions.push({
      headline: formatHeadlineCase(
        `${formatHeadlineCase(top2.keyword)} in ${city} - ${
          taxonomy.split('>').pop()?.trim() || 'Special Offer'
        }`
      ),
      targetKeyword: top2.keyword,
    });
  }

  const coveredCount = profitableKeywords.length - missingKeywords.length;
  const editorialSummary =
    missingKeywords.length === 0
      ? `Excellent coverage! Your draft already incorporates all ${profitableKeywords.length} verified profitable (<100% EGR) keywords for ${city} (${taxonomy}).`
      : `Your draft currently covers ${coveredCount} of ${profitableKeywords.length} verified profitable (<100% EGR) keywords for ${city}. Apply the ${missingKeywords.length} suggested Replace/Add edits below to maximize paid & organic search relevance.`;

  return {
    editorialSummary,
    headlineSuggestions,
    suggestions,
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  // POST /api/editorial-cms/analyze
  // Grounds Gemini on strictly profitable (<100% EGR) SEM keywords with a fast 3.2s ceiling and instant fallback
  app.post('/api/editorial-cms/analyze', async (req, res) => {
    const {
      city = '',
      country = 'IT',
      taxonomy = '',
      title = '',
      body = '',
      profitableKeywords = [],
    } = (req.body || {}) as {
      city: string;
      country: string;
      taxonomy: string;
      title: string;
      body: string;
      profitableKeywords: ProfitableKeywordInput[];
    };

    if (!profitableKeywords || profitableKeywords.length === 0) {
      return res.status(400).json({
        error: 'No profitable keywords provided for the selected City and Category Taxonomy.',
      });
    }

    // Prepare instant contextual analysis in case Gemini is slow or returns 503
    const fallbackResult = buildFastContextualAnalysis(
      city,
      country,
      taxonomy,
      title,
      body,
      profitableKeywords
    );

    if (!process.env.GEMINI_API_KEY) {
      return res.json(fallbackResult);
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `Groupon Editorial SEM Copy Check.
City: ${city} (${country}) | Taxonomy: ${taxonomy}
Headline: "${title}"
Description: "${body}"
Profitable Keywords (<100% EGR):
${profitableKeywords.map((k) => `- "${k.keyword}" (Vol:${k.searchVolume}, EGR:${k.egr.toFixed(0)}%)`).join('\n')}

Rules:
1. Suggest edits ONLY for profitable keywords above that are missing from the draft.
2. Same language as Headline/Description.
3. Any Headline text MUST use Headline Title Case (never all lowercase).
4. Prefer actionType="REPLACE" when an exact 2-6 word substring ("existingSnippet") in Headline or Description can be naturally replaced by "proposedSnippet" containing the keyword. Otherwise use actionType="ADD" with existingSnippet="".
5. Provide 2 Title-Cased "headlineSuggestions".`;

      const geminiPromise = ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              editorialSummary: { type: Type.STRING },
              headlineSuggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    headline: { type: Type.STRING },
                    targetKeyword: { type: Type.STRING },
                  },
                  required: ['headline', 'targetKeyword'],
                },
              },
              suggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    actionType: { type: Type.STRING },
                    location: { type: Type.STRING },
                    keyword: { type: Type.STRING },
                    existingSnippet: { type: Type.STRING },
                    proposedSnippet: { type: Type.STRING },
                    rationale: { type: Type.STRING },
                  },
                  required: [
                    'actionType',
                    'location',
                    'keyword',
                    'existingSnippet',
                    'proposedSnippet',
                    'rationale',
                  ],
                },
              },
            },
            required: ['editorialSummary', 'headlineSuggestions', 'suggestions'],
          },
        },
      });

      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), 1800);
      });

      const response = await Promise.race([geminiPromise, timeoutPromise]);

      if (!response || !response.text) {
        return res.json(fallbackResult);
      }

      const parsed = JSON.parse(response.text.trim()) as AnalysisOutput;
      if (!parsed || !Array.isArray(parsed.suggestions)) {
        return res.json(fallbackResult);
      }

      return res.json(parsed);
    } catch (_error: any) {
      // Never fail with 500 or let 503 high-demand errors break the user flow
      return res.json(fallbackResult);
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
