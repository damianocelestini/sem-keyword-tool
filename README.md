# Groupon SEM Keyword Tool (v2.0)

> **Product Management Case Study & Interactive Prototype**  
> Bridging local merchandising insights and paid search (SEM) automation across international markets.
>
> **Note on Prototype Scope:** This repository is an interactive reconstruction of the internal SEM tool built at Groupon, extended with a v2.0 AI Editorial Copy Optimizer. To allow standalone evaluation without internal Groupon credentials or live ad spend, the **Groupon MDS Feed** and **Google Ads (AdWords) API** are simulated with deterministic services, while the **Editorial CMS AI Copy Check** runs live against the **Google Gemini API** (with a built-in contextual NLP fallback so the app also works offline or without an API key).

---

## 1. The Problem

Centralized paid search (SEM) engines excel at broad, generic queries in English, but consistently miss **hyper-local and non-English search intent**—such as neighborhood-specific dining in Dublin (*"rathmines sushi"*) or colloquial wellness terms in Milan (*"qc terme milano sconti"*).

Local Revenue and Merchandising Managers know exactly how customers in their cities search for deals, yet giving non-SEM specialists direct access to Google Ads risks polluting campaigns with duplicate keywords, competitor trademarks, zero-volume phrases, or unprofitable spend (`>100% EGR`).

**Product Goal:** Empower local Revenue Managers and Editorial teams to scale high-intent local keywords and deal copy automatically—backed by strict automated guardrails that block junk keywords before they ever reach live auctions.

---

## 2. The Features

- **Deal Permalink Lookup & Economics (`Deal/Keywords`)**
  - Start from an empty state or filter by country (`IE`, `IT`, `FR`, `DE`, `GB`, `ES`) and deal permalink to inspect MDS deal unit economics, including **Deal Price**, **Discount**, and **Net Margin (%)**.
  - View keyword-level performance (**Impressions**, **Clicks**, **Cost**, **Revenue**, **CPC**, **CTR %**, **CR %**, and **EGR %**) dynamically across selectable time ranges (`Last 7 Days`, `14 Days`, `30 Days`, `90 Days`, `YTD`).
- **Bulk Keyword Upload & Automated Guardrails**
  - Upload keywords in bulk via text or CSV across `Exact`, `Phrase`, and `Broad` match types.
  - **Automated Pre-Sync Validation** filters out:
    1. **Campaign & Batch Duplicates**
    2. **Trademark & Copyright Denylist Terms**
    3. **Low Search Volume (`<50/mo`) via Google Ads Keyword Planner**
  - Submissions are queued (`PENDING_SYNC`) for the overnight Google Ads batch sync, with an automated email recap sent to the user detailing accepted vs. rejected keywords.
- **Manager Performance Report (`Performance Report`)**
  - Executive KPI rollup tracking total SEM spend, gross revenue, and **Blended EGR %** (`Expense as % of Gross Revenue`).
  - Interactive **Deal-by-Deal Efficiency Breakdown**: Clicking on any Revenue Manager reveals which of their deals are **Efficient (`<100% EGR`)** vs. **Inefficient (`>100% EGR`)** to guide 1:1 coaching and budget reallocation.
- **AI Editorial CMS Copy Suggester (`Editorial CMS Suggester`)**
  - Filters strictly profitable (`<100% EGR`) keywords by **City / Market** and **Category Taxonomy**.
  - Uses **Google Gemini AI** (`POST /api/editorial-cms/analyze`) grounded on verified profitable keywords to suggest 1-click **"Add"** or **"Replace `[phrase]` with `[keyword phrase]`"** copy edits, automatically enforcing proper **Headline Title Case**.

---

## 3. The Architecture

![Groupon SEM Keyword Tool Architecture](./docs/architecture.svg)

### Production System vs. Portfolio Prototype

| Logical Block | Production System (At Groupon) | This Portfolio Prototype |
| :--- | :--- | :--- |
| **1. Frontend (`React SPA`)** | Internal web portal for Revenue Managers & Global SEM leads | Interactive React 19 + TypeScript + Tailwind CSS workspace |
| **2. Core Services & APIs** | Deduplication, trademark denylist, and batch queue pipeline | `keywordValidation.ts`, `timeRangeMetrics.ts`, and Express `server.ts` |
| **3. Deal & Taxonomy Catalog** | Live **Groupon MDS (Merchant Data System)** feed | Seeded multi-country deal dataset (`IE`, `IT`, `FR`, `DE`, `GB`, `ES`) |
| **4. Paid Search & Volume API** | Live **Google AdWords / Ads API** (Keyword Planner + Nightly Sync) | Simulated deterministic volume lookup & overnight batch sync |
| **5. Editorial Copy Optimizer** | *(v2.0 Product Extension)* | **Live Google Gemini API** (`gemini-3.1-flash-lite`) + local NLP fallback |

---

## 4. The Real-World Impact

- **Up to 30% Revenue Contribution in Non-English Markets**: Unlocking localized, native-language keyword coverage (`IT`, `FR`, `DE`, `ES`) captured high-converting local search demand that automated English-centric templates missed.
- **~15% Revenue Contribution Globally**: Scaled across international merchandising teams while maintaining strict **`<100% EGR`** profitability guardrails.
- **Zero Campaign Pollution**: Automated deduplication, copyright denylist checks, and search volume thresholds eliminated manual SEM QA bottlenecks.

---

## 5. Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the full-stack development server (Express + Vite on http://localhost:3000)
npm run dev
```

*(Optional)* To enable live Gemini AI generation in the **Editorial CMS Suggester**, create a `.env` file with `GEMINI_API_KEY="your_api_key"`. If omitted, the application automatically uses its built-in multi-language contextual NLP rewriter so all features work out of the box.
