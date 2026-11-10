import React, { useState, useMemo } from 'react';
import { Deal, DealKeyword } from '../types';
import {
  Sparkles,
  FileText,
  Check,
  Plus,
  MapPin,
  Tag,
  SearchCheck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Wand2,
  ArrowRightLeft,
  Loader2,
} from 'lucide-react';

interface EditorialCmsSuggesterProps {
  allKeywords: DealKeyword[];
  deals: Deal[];
}

interface SuggestedGoodKeyword {
  id: string;
  keyword: string;
  searchVolume: number;
  ctr: number;
  conversions: number;
  cost: number;
  revenue: number;
  egr: number;
}

interface AiCopySuggestion {
  actionType: 'REPLACE' | 'ADD';
  location: 'title' | 'body';
  keyword: string;
  existingSnippet: string;
  proposedSnippet: string;
  rationale: string;
}

interface AiHeadlineSuggestion {
  headline: string;
  targetKeyword: string;
}

interface AiAnalysisResult {
  editorialSummary: string;
  headlineSuggestions: AiHeadlineSuggestion[];
  suggestions: AiCopySuggestion[];
}

// Lowercase connectors/prepositions across EN, IT, FR, DE, ES that stay lowercase in Title Case (unless first word)
const MINOR_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'for',
  'of',
  'in',
  'on',
  'at',
  'to',
  'with',
  'by',
  'di',
  'del',
  'della',
  'dei',
  'degli',
  'delle',
  'da',
  'con',
  'su',
  'per',
  'tra',
  'fra',
  'e',
  'ed',
  'o',
  'al',
  'allo',
  'alla',
  'ai',
  'agli',
  'alle',
  'nel',
  'nella',
  'nei',
  'nelle',
  'sul',
  'sulla',
  'de',
  'du',
  'des',
  'le',
  'la',
  'les',
  'et',
  'ou',
  'en',
  'au',
  'aux',
  'sur',
  'avec',
  'pour',
  'par',
  'und',
  'oder',
  'für',
  'von',
  'im',
  'am',
  'an',
  'mit',
  'auf',
  'bei',
  'y',
  'el',
  'los',
  'las',
  'por',
  'para',
]);

const UPPERCASE_ACRONYMS = new Set([
  'qc',
  'vip',
  'tv',
  'uk',
  'gb',
  'it',
  'fr',
  'de',
  'es',
  'ie',
  '3d',
]);

/**
 * Formats a keyword into proper Headline Title Case (e.g. "qc terme milano sconti" -> "QC Terme Milano Sconti")
 */
const formatHeadlineCase = (phrase: string): string => {
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
};

// Curated editorial copy templates by deal permalink
const EDITORIAL_SAMPLE_COPY: Record<string, { title: string; body: string }> = {
  'qc-terme-spa-wellness': {
    title: 'Ingresso Giornaliero con Percorso Benessere e Area Termale nel Centro di Milano',
    body: 'Concediti una pausa rigenerante tra vasche idromassaggio, biosaune, bagni di vapore e sale relax panoramiche nel cuore di Porta Romana. Include kit cortesia con accappatoio, telo e ciabattine per un’esperienza sensoriale indimenticabile.',
  },
  'colosseo-tour-guidato-vip': {
    title: 'Visita Guidata Esclusiva di Roma Antica con Accesso Prioritario',
    body: 'Scopri la storia millenaria dell’Anfiteatro Flavio accompagnato da un archeologo esperto. Il percorso include l’accesso diretto all’arena, la passeggiata lungo la Via Sacra e la vista panoramica dal Colle Palatino.',
  },
  'degustazione-vini-chianti-castello': {
    title: 'Esperienza Enogastronomica nelle Colline Toscane con Visita alle Cantine Storiche',
    body: 'Un viaggio tra i sapori autentici della tradizione vinicola vicino a Firenze. Passeggiata tra i vigneti, tour guidato della barriccaia cinquecentesca e calici selezionati accompagnati da salumi artigianali, pecorino e bruschette.',
  },
  'gardaland-biglietto-ingresso-parco': {
    title: 'Giornata di Divertimento per Tutta la Famiglia sul Lago di Garda',
    body: 'Vivi l’adrenalina delle montagne russe, gli spettacoli dal vivo e le aree tematiche dedicate ai più piccoli. Biglietto valido per un intero giorno con accesso a tutte le attrazioni acquatiche e d’avventura.',
  },
  'cena-gourmet-pesce-navigli': {
    title: 'Percorso Degustazione di Mare a 4 Portate sui Navigli',
    body: 'Assapora il pescato del giorno preparato secondo ricette contemporanee in un’atmosfera elegante lungo il canale. Dall’antipasto di crudi fino al dolce fatto in casa, accompagnato da bollicine selezionate.',
  },
  'rathmines-sushi-experience': {
    title: 'Authentic Japanese Omakase & 5-Course Dining Experience for Two',
    body: 'Immerse your tastebuds in culinary precision in the heart of South Dublin. Prepared by master chefs using market-fresh Atlantic fish, signature hand-rolled nigiri, and charcoal-fired robata skewers.',
  },
  'temple-bar-whiskey-tasting': {
    title: 'Guided Irish Single Malt Masterclass with Artisan Cheese Pairings',
    body: 'Explore the heritage of triple-distilled spirits in a historic cellar setting. Sample four premium aged pours paired with local farmhouse cheeses and dark chocolate truffles.',
  },
  'cliffs-of-moher-day-tour': {
    title: 'Scenic Wild Atlantic Way Full-Day Coach Excursion & Coastal Walk',
    body: 'Experience Ireland’s most dramatic sea cliffs, the lunar karst landscape of the Burren, and vibrant streets along Galway Bay with live commentary from an expert local driver-guide.',
  },
  'luxury-afternoon-tea-ballsbridge': {
    title: 'Traditional Georgian Drawing Room Afternoon Tea with Prosecco for Two',
    body: 'Indulge in tiers of finger sandwiches, warm buttermilk scones with clotted cream, and handcrafted patisserie in an elegant Victorian setting in Dublin 4.',
  },
  'powerscourt-spa-thermal-suite': {
    title: 'Luxury Countryside Retreat with Hydrotherapy Pool & Aromatherapy Massage',
    body: 'Escape to the Wicklow Mountains for a full day of serenity. Enjoy heated vitality pools, herbal steam rooms, and a tailored 60-minute essential oil full-body treatment.',
  },
  'tower-bridge-afternoon-tea': {
    title: 'Riverside Champagne Afternoon Tea Overlooking Iconic London Landmarks',
    body: 'Savour freshly baked scones, artisan finger sandwiches, and delicate macarons while taking in panoramic views of the Thames and Tower Bridge.',
  },
  'oxford-cotswolds-vintage-bus-tour': {
    title: 'Heritage Open-Top Bus Excursion Through Historic University Colleges & Cotswold Villages',
    body: 'Step aboard a restored 1960s Routemaster for a guided journey through honey-stone villages, dreaming spires, and traditional country tearooms.',
  },
  'soho-steakhouse-chateaubriand': {
    title: 'Dry-Aged 16oz Chateaubriand Sharing Platter with Truffle Fries & Malbec',
    body: 'Dine in the heart of London’s West End with prime grass-fed beef seared to perfection, served alongside bone marrow jus, triple-cooked chips, and a bottle of Argentine red.',
  },
  'edinburgh-castle-vaults-ghost-tour': {
    title: 'Evening Underground Blair Street Vaults & Old Town History Walk',
    body: 'Venture beneath the Royal Mile with a cloaked historian to uncover centuries-old chambers, eerie legends, and hidden closes of historic Edinburgh.',
  },
  'le-bistrot-gourmet-saint-germain': {
    title: 'Menu Dégustation Raffiné 3 Plats avec Accords Mets et Vins sur la Rive Gauche',
    body: 'Venez savourer une cuisine française de saison dans un cadre intimiste au cœur du 6e arrondissement. Produits frais du marché et sélection de grands crus par notre sommelier.',
  },
  'croisiere-saone-dejeuner': {
    title: 'Navigation Panoramique et Déjeuner Gastronomique au Fil de l’Eau',
    body: 'Admirez les façades classées du Vieux Lyon et de la Presqu’île depuis notre bateau vitré tout en dégustant un menu lyonnais préparé à bord.',
  },
  'spa-balneo-champs-elysees': {
    title: 'Parenthèse Sensorielle avec Hammam Privatif et Modelage aux Huiles Précieuses',
    body: 'Offrez-vous un moment d’évasion absolue à deux pas de l’Arc de Triomphe avec bain bouillonnant, gommage au savon noir et rituel relaxant en duo.',
  },
  'cours-patisserie-macarons-marais': {
    title: 'Atelier Pâtisserie de 2h30 avec un Chef pour Réussir vos Coques et Ganaches',
    body: 'Apprenez les gestes techniques du meringage italien et du pochage dans un atelier lumineux du Marais, et repartez avec votre coffret gourmand.',
  },
  'karting-speedway-berlin': {
    title: '30 Minuten Highspeed-Action und Zeittraining auf der Indoor-Rennstrecke',
    body: 'Erlebe packende Überholmanöver in modernen 270ccm Rundenkarts inklusive elektronischer Rundenzeitmessung, Sicherheits-Briefing und Leih-Sturmhaube.',
  },
  'bavarian-beer-hall-tasting-munchen': {
    title: 'Original Münchner Wirtshaus-Abend mit 3-Gänge-Schmankerlmenü & Bierverkostung',
    body: 'Genieße knusprige Schweinshaxe, frisch gebackene Brezn und vier handgebraute Bierspezialitäten in geselliger Atmosphäre im Herzen der Altstadt.',
  },
  'vabali-spa-day-pass-hamburg': {
    title: 'Ganztägige Auszeit im Balinesischen Saunadorf mit Infinity-Pool & Ruhehäusern',
    body: 'Entspanne in 13 verschiedenen Saunen, Dampfbädern und weitläufigen Sonnenterrassen mit fernöstlichem Ambiente vor den Toren Hamburgs.',
  },
  'hammam-al-andalus-banos-arabes': {
    title: 'Ritual de Bienestar en Termas Árabes con Masaje Relajante y Té a la Menta',
    body: 'Sumérgete en salas de agua templada, caliente y fría bajo bóvedas iluminadas con velas en pleno centro histórico de Madrid, acompañado de aceites esenciales.',
  },
  'tapas-gourmet-tour-barrio-gotico': {
    title: 'Ruta Gastronómica de Pinchos de Autor y Maridaje de Vinos Catalanes',
    body: 'Recorre las callejuelas históricas de Barcelona degustando creaciones ibéricas, bombas artesanales y vinos con denominación de origen en cuatro tabernas emblemáticas.',
  },
  'flamenco-show-cena-triana': {
    title: 'Velada de Arte Flamenco en Directo con Cena Degustación Andaluza',
    body: 'Disfruta de la pasión del cante, toque y baile en un tablao tradicional a orillas del Guadalquivir acompañado de platos típicos sevillanos.',
  },
};

// Extra curated high-performing (<100% EGR) keywords per deal permalink
const EXTRA_GOOD_KEYWORDS_BY_DEAL: Record<
  string,
  Array<{ keyword: string; searchVolume: number; ctr: number; conversions: number; cost: number; revenue: number }>
> = {
  'qc-terme-spa-wellness': [
    { keyword: 'ingresso qc terme milano coppia', searchVolume: 2400, ctr: 6.4, conversions: 24, cost: 215, revenue: 390 },
    { keyword: 'percorso benessere porta romana milano', searchVolume: 1650, ctr: 5.8, conversions: 18, cost: 160, revenue: 295 },
  ],
  'colosseo-tour-guidato-vip': [
    { keyword: 'visita guidata colosseo e foro romano', searchVolume: 2900, ctr: 6.1, conversions: 26, cost: 230, revenue: 410 },
    { keyword: 'biglietti salta fila arena colosseo', searchVolume: 2100, ctr: 5.7, conversions: 19, cost: 175, revenue: 310 },
  ],
  'degustazione-vini-chianti-castello': [
    { keyword: 'degustazione vini chianti firenze', searchVolume: 1850, ctr: 6.2, conversions: 17, cost: 155, revenue: 280 },
    { keyword: 'visita cantina storica toscana tagliere', searchVolume: 1300, ctr: 5.5, conversions: 14, cost: 130, revenue: 235 },
  ],
  'gardaland-biglietto-ingresso-parco': [
    { keyword: 'offerta biglietti gardaland parco divertimenti', searchVolume: 3600, ctr: 6.5, conversions: 29, cost: 240, revenue: 380 },
    { keyword: 'ingresso gardaland data aperta famiglia', searchVolume: 2200, ctr: 5.9, conversions: 21, cost: 180, revenue: 290 },
  ],
  'cena-gourmet-pesce-navigli': [
    { keyword: 'ristorante pesce milano navigli menu', searchVolume: 1950, ctr: 6.0, conversions: 16, cost: 145, revenue: 260 },
    { keyword: 'cena degustazione crudi di mare milano', searchVolume: 1400, ctr: 5.4, conversions: 13, cost: 120, revenue: 210 },
  ],
  'rathmines-sushi-experience': [
    { keyword: 'japanese sushi tasting menu dublin', searchVolume: 2100, ctr: 6.3, conversions: 22, cost: 195, revenue: 340 },
    { keyword: 'omakase & robata grill rathmines', searchVolume: 1250, ctr: 5.8, conversions: 15, cost: 135, revenue: 245 },
  ],
  'temple-bar-whiskey-tasting': [
    { keyword: 'irish whiskey masterclass dublin', searchVolume: 1900, ctr: 6.1, conversions: 18, cost: 160, revenue: 275 },
    { keyword: 'temple bar whiskey & artisan pairings', searchVolume: 1450, ctr: 5.6, conversions: 14, cost: 125, revenue: 215 },
  ],
  'cliffs-of-moher-day-tour': [
    { keyword: 'cliffs of moher & burren day tour', searchVolume: 3100, ctr: 6.7, conversions: 28, cost: 220, revenue: 395 },
    { keyword: 'galway bay & wild atlantic coach tour', searchVolume: 1800, ctr: 5.9, conversions: 17, cost: 150, revenue: 265 },
  ],
  'luxury-afternoon-tea-ballsbridge': [
    { keyword: 'champagne afternoon tea ballsbridge dublin', searchVolume: 1600, ctr: 5.8, conversions: 15, cost: 140, revenue: 235 },
    { keyword: 'traditional high tea for two dublin 4', searchVolume: 1200, ctr: 5.4, conversions: 12, cost: 110, revenue: 185 },
  ],
  'powerscourt-spa-thermal-suite': [
    { keyword: 'powerscourt spa thermal suite wicklow', searchVolume: 2300, ctr: 6.4, conversions: 21, cost: 190, revenue: 330 },
    { keyword: 'hydrotherapy pass & aromatherapy massage', searchVolume: 1500, ctr: 5.7, conversions: 15, cost: 135, revenue: 230 },
  ],
  'tower-bridge-afternoon-tea': [
    { keyword: 'tower bridge afternoon tea river thames', searchVolume: 2800, ctr: 6.2, conversions: 24, cost: 210, revenue: 365 },
    { keyword: 'champagne high tea london riverside', searchVolume: 1950, ctr: 5.8, conversions: 18, cost: 165, revenue: 280 },
  ],
  'oxford-cotswolds-vintage-bus-tour': [
    { keyword: 'oxford & cotswolds villages day tour', searchVolume: 2400, ctr: 6.0, conversions: 20, cost: 175, revenue: 300 },
    { keyword: 'vintage bus tour with cream tea oxford', searchVolume: 1450, ctr: 5.5, conversions: 14, cost: 125, revenue: 210 },
  ],
  'soho-steakhouse-chateaubriand': [
    { keyword: 'chateaubriand steak for two soho london', searchVolume: 2600, ctr: 6.5, conversions: 23, cost: 205, revenue: 360 },
    { keyword: 'prime steakhouse malbec wine london', searchVolume: 1750, ctr: 5.7, conversions: 16, cost: 150, revenue: 255 },
  ],
  'edinburgh-castle-vaults-ghost-tour': [
    { keyword: 'edinburgh underground vaults evening tour', searchVolume: 2700, ctr: 6.4, conversions: 25, cost: 170, revenue: 295 },
    { keyword: 'old town ghost & history walk edinburgh', searchVolume: 1950, ctr: 5.9, conversions: 18, cost: 130, revenue: 225 },
  ],
  'le-bistrot-gourmet-saint-germain': [
    { keyword: 'bistrot gastronomique saint germain paris', searchVolume: 2200, ctr: 6.1, conversions: 20, cost: 185, revenue: 320 },
    { keyword: 'menu degustation accords mets et vins', searchVolume: 1650, ctr: 5.6, conversions: 15, cost: 140, revenue: 240 },
  ],
  'croisiere-saone-dejeuner': [
    { keyword: 'croisiere dejeuner gastronomique lyon', searchVolume: 1900, ctr: 6.3, conversions: 18, cost: 160, revenue: 285 },
    { keyword: 'promenade bateau saone pour deux', searchVolume: 1400, ctr: 5.7, conversions: 14, cost: 125, revenue: 215 },
  ],
  'spa-balneo-champs-elysees': [
    { keyword: 'spa & hammam privatif champs elysees', searchVolume: 2500, ctr: 6.2, conversions: 22, cost: 210, revenue: 355 },
    { keyword: 'bain bouillonnant et gommage duo paris', searchVolume: 1700, ctr: 5.8, conversions: 16, cost: 150, revenue: 260 },
  ],
  'cours-patisserie-macarons-marais': [
    { keyword: 'cours patisserie macarons paris marais', searchVolume: 2100, ctr: 6.0, conversions: 19, cost: 170, revenue: 290 },
    { keyword: 'atelier macarons francais avec chef', searchVolume: 1450, ctr: 5.5, conversions: 14, cost: 125, revenue: 215 },
  ],
  'karting-speedway-berlin': [
    { keyword: 'gokart renntraining berlin spandau', searchVolume: 2400, ctr: 6.3, conversions: 22, cost: 180, revenue: 310 },
    { keyword: 'indoor kartbahn berlin zeitmessung', searchVolume: 1900, ctr: 5.9, conversions: 18, cost: 150, revenue: 255 },
  ],
  'bavarian-beer-hall-tasting-munchen': [
    { keyword: 'brauhaus menue & bierverkostung munchen', searchVolume: 2200, ctr: 6.4, conversions: 21, cost: 175, revenue: 305 },
    { keyword: 'bayerisches 3-gange-menue für zwei', searchVolume: 1600, ctr: 5.8, conversions: 15, cost: 130, revenue: 225 },
  ],
  'vabali-spa-day-pass-hamburg': [
    { keyword: 'vabali spa tageskarte saunadorf hamburg', searchVolume: 2800, ctr: 6.6, conversions: 25, cost: 210, revenue: 365 },
    { keyword: 'tagesticket wellness & sauna hamburg', searchVolume: 1950, ctr: 5.9, conversions: 18, cost: 155, revenue: 265 },
  ],
  'hammam-al-andalus-banos-arabes': [
    { keyword: 'hammam al andalus madrid banos arabes', searchVolume: 2600, ctr: 6.5, conversions: 24, cost: 195, revenue: 340 },
    { keyword: 'circuito termal y masaje pareja madrid', searchVolume: 1850, ctr: 5.9, conversions: 17, cost: 145, revenue: 250 },
  ],
  'tapas-gourmet-tour-barrio-gotico': [
    { keyword: 'ruta tapas gourmet barrio gotico barcelona', searchVolume: 2400, ctr: 6.3, conversions: 22, cost: 180, revenue: 315 },
    { keyword: 'degustacion tapas y vinos barcelona', searchVolume: 1750, ctr: 5.8, conversions: 16, cost: 135, revenue: 235 },
  ],
  'flamenco-show-cena-triana': [
    { keyword: 'tablao flamenco triana sevilla con cena', searchVolume: 2300, ctr: 6.2, conversions: 21, cost: 175, revenue: 300 },
    { keyword: 'espectaculo flamenco directo sevilla', searchVolume: 1650, ctr: 5.7, conversions: 15, cost: 130, revenue: 220 },
  ],
};

export const EditorialCmsSuggester: React.FC<EditorialCmsSuggesterProps> = ({
  allKeywords,
  deals,
}) => {
  // Unique cities from deals
  const availableCities = useMemo(() => {
    const seen = new Set<string>();
    const list: Array<{ city: string; country: string }> = [];
    deals.forEach((d) => {
      if (!seen.has(d.city)) {
        seen.add(d.city);
        list.push({ city: d.city, country: d.country });
      }
    });
    return list;
  }, [deals]);

  const [selectedCity, setSelectedCity] = useState<string>('Milano');
  const [selectedDealPermalink, setSelectedDealPermalink] = useState<string>(
    'qc-terme-spa-wellness'
  );

  // Taxonomies available for the selected city
  const dealsInCity = useMemo(
    () =>
      selectedCity
        ? deals.filter((d) => d.city.toLowerCase() === selectedCity.toLowerCase())
        : [],
    [deals, selectedCity]
  );

  // Active deal representing the selected City + Category Taxonomy (undefined when reset to None)
  const activeDeal = useMemo(() => {
    if (!selectedCity || !selectedDealPermalink) return undefined;
    return deals.find((d) => d.permalink === selectedDealPermalink);
  }, [deals, selectedCity, selectedDealPermalink]);

  const [dealTitle, setDealTitle] = useState<string>(
    EDITORIAL_SAMPLE_COPY['qc-terme-spa-wellness'].title
  );
  const [dealBody, setDealBody] = useState<string>(
    EDITORIAL_SAMPLE_COPY['qc-terme-spa-wellness'].body
  );
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  // AI Copy Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Switch City handler (supports "" / None to reset)
  const handleCityChange = (newCity: string) => {
    setSelectedCity(newCity);
    setAiAnalysis(null);
    setAnalysisError(null);
    if (!newCity) {
      setSelectedDealPermalink('');
      setDealTitle('');
      setDealBody('');
      return;
    }

    const firstDealInNewCity = deals.find(
      (d) => d.city.toLowerCase() === newCity.toLowerCase()
    );
    if (firstDealInNewCity) {
      setSelectedDealPermalink(firstDealInNewCity.permalink);
      const sample = EDITORIAL_SAMPLE_COPY[firstDealInNewCity.permalink];
      if (sample) {
        setDealTitle(sample.title);
        setDealBody(sample.body);
      } else {
        setDealTitle(firstDealInNewCity.title);
        setDealBody('');
      }
    }
  };

  // Switch Category Taxonomy handler (supports "" / None)
  const handleTaxonomyChange = (newPermalink: string) => {
    setSelectedDealPermalink(newPermalink);
    setAiAnalysis(null);
    setAnalysisError(null);
    if (!newPermalink) {
      setDealTitle('');
      setDealBody('');
      return;
    }

    const dealObj = deals.find((d) => d.permalink === newPermalink);
    if (dealObj) {
      setSelectedCity(dealObj.city);
      const sample = EDITORIAL_SAMPLE_COPY[dealObj.permalink];
      if (sample) {
        setDealTitle(sample.title);
        setDealBody(sample.body);
      } else {
        setDealTitle(dealObj.title);
        setDealBody('');
      }
    }
  };

  // Build strictly GOOD (<100% EGR) keywords related to the chosen City & Category Taxonomy
  const goodTaxonomyKeywords: SuggestedGoodKeyword[] = useMemo(() => {
    if (!activeDeal) return [];

    // 1. Pull real keywords for this deal permalink that are strictly profitable (EGR < 100%, i.e., cost < revenue)
    const rawDealKws = allKeywords.filter(
      (kw) =>
        kw.dealPermalink.toLowerCase() === activeDeal.permalink.toLowerCase() &&
        kw.status !== 'REMOVED' &&
        kw.revenue > 0 &&
        kw.cost < kw.revenue
    );

    // Deduplicate by lowercase keyword phrase, keeping the best (lowest EGR) entry
    const byTerm = new Map<string, SuggestedGoodKeyword>();

    rawDealKws.forEach((kw) => {
      const cleanTerm = kw.keyword.trim().toLowerCase();
      const egr = (kw.cost / kw.revenue) * 100;
      const ctr = kw.impressions > 0 ? (kw.clicks / kw.impressions) * 100 : 5.2;

      const existing = byTerm.get(cleanTerm);
      if (!existing || egr < existing.egr) {
        byTerm.set(cleanTerm, {
          id: kw.id,
          keyword: kw.keyword.trim(),
          searchVolume: kw.searchVolume,
          ctr,
          conversions: kw.conversions,
          cost: kw.cost,
          revenue: kw.revenue,
          egr,
        });
      }
    });

    // 2. Supplement with curated high-performing (<100% EGR) City + Taxonomy terms
    const extras = EXTRA_GOOD_KEYWORDS_BY_DEAL[activeDeal.permalink] || [];
    extras.forEach((ex, idx) => {
      const cleanTerm = ex.keyword.trim().toLowerCase();
      if (!byTerm.has(cleanTerm)) {
        const egr = (ex.cost / ex.revenue) * 100;
        byTerm.set(cleanTerm, {
          id: `extra-${activeDeal.permalink}-${idx}`,
          keyword: ex.keyword,
          searchVolume: ex.searchVolume,
          ctr: ex.ctr,
          conversions: ex.conversions,
          cost: ex.cost,
          revenue: ex.revenue,
          egr,
        });
      }
    });

    return Array.from(byTerm.values()).sort((a, b) => a.egr - b.egr);
  }, [activeDeal, allKeywords]);

  // Check if a keyword (or all its core tokens) is present in the user's copy
  const isKeywordInCopy = (keyword: string): boolean => {
    const combined = `${dealTitle} ${dealBody}`.toLowerCase();
    const kwLower = keyword.toLowerCase().trim();
    if (!combined.trim()) return false;
    if (combined.includes(kwLower)) return true;

    const coreTokens = kwLower
      .split(/\s+/)
      .filter((t) => t.length >= 3 && !MINOR_WORDS.has(t));
    if (coreTokens.length === 0) return false;
    return coreTokens.every((t) => combined.includes(t));
  };

  const includedKeywords = goodTaxonomyKeywords.filter((k) => isKeywordInCopy(k.keyword));

  // Calculate Copy SEO/SEM Optimization Score
  const copyScore = useMemo(() => {
    if (!activeDeal || (!dealTitle.trim() && !dealBody.trim())) return 0;
    const kwRatio =
      goodTaxonomyKeywords.length > 0
        ? includedKeywords.length / goodTaxonomyKeywords.length
        : 0;
    const hasCity = `${dealTitle} ${dealBody}`
      .toLowerCase()
      .includes(activeDeal.city.toLowerCase());
    const wordCount = `${dealTitle} ${dealBody}`.trim().split(/\s+/).filter(Boolean).length;
    const lengthBonus = wordCount >= 20 ? 15 : Math.round((wordCount / 20) * 15);
    const cityBonus = hasCity ? 15 : 0;
    return Math.min(100, Math.round(kwRatio * 70 + lengthBonus + cityBonus));
  }, [dealTitle, dealBody, goodTaxonomyKeywords.length, includedKeywords.length, activeDeal]);

  // Add keyword directly to Headline with proper Headline Title Case
  const handleAddKeywordToTitle = (textToAdd: string) => {
    const formatted = formatHeadlineCase(textToAdd);
    setDealTitle((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return formatted;
      return `${trimmed} ${formatted}`;
    });
  };

  // Add keyword or proposed snippet directly to Body
  const handleAddKeywordToBody = (textToAdd: string) => {
    setDealBody((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return textToAdd;
      return `${trimmed} ${textToAdd}`;
    });
  };

  // Replace existingSnippet with proposedSnippet in Headline or Body
  const handleApplySuggestion = (suggestion: AiCopySuggestion) => {
    const target = suggestion.existingSnippet?.trim();
    const replacement =
      suggestion.location === 'title'
        ? formatHeadlineCase(suggestion.proposedSnippet)
        : suggestion.proposedSnippet;

    if (suggestion.actionType === 'REPLACE' && target) {
      if (suggestion.location === 'title' && dealTitle.includes(target)) {
        setDealTitle((prev) => prev.replace(target, replacement));
      } else if (dealBody.includes(target)) {
        setDealBody((prev) => prev.replace(target, replacement));
      } else if (dealTitle.includes(target)) {
        setDealTitle((prev) => prev.replace(target, formatHeadlineCase(replacement)));
      } else {
        // Fallback if user edited the text after running check: append cleanly
        if (suggestion.location === 'title') {
          handleAddKeywordToTitle(replacement);
        } else {
          handleAddKeywordToBody(replacement);
        }
      }
    } else {
      if (suggestion.location === 'title') {
        handleAddKeywordToTitle(replacement);
      } else {
        handleAddKeywordToBody(replacement);
      }
    }

    // Remove applied suggestion from the active list
    setAiAnalysis((prev) =>
      prev
        ? {
            ...prev,
            suggestions: prev.suggestions.filter(
              (s) =>
                !(
                  s.keyword === suggestion.keyword &&
                  s.proposedSnippet === suggestion.proposedSnippet
                )
            ),
          }
        : null
    );
  };

  // Build instant contextual analysis fallback so network blips or timeouts never block the editor
  const buildLocalContextualAnalysis = (): AiAnalysisResult => {
    const city = activeDeal?.city || '';
    const country = (activeDeal?.country || 'IT').toUpperCase();
    const taxonomy = activeDeal?.taxonomy || `Local > ${activeDeal?.category || 'Deal'}`;
    const missingKeywords = goodTaxonomyKeywords.filter((k) => !isKeywordInCopy(k.keyword));
    const usedSnippets = new Set<string>();

    const candidatePatterns: Array<{
      regex: RegExp;
      buildReplacement: (match: string, kw: string, isTitle: boolean) => string;
    }> = [
      {
        regex: /\b(ingresso giornaliero(?:\s+con\s+percorso\s+benessere)?|percorso benessere(?:\s+e\s+area\s+termale)?|pausa rigenerante|esperienza sensoriale(?:\s+indimenticabile)?|visita guidata(?:\s+esclusiva)?|esperienza enogastronomica|giornata di divertimento|percorso degustazione(?:\s+di\s+mare)?)\b/i,
        buildReplacement: (match, kw, isTitle) =>
          isTitle ? formatHeadlineCase(`${match} - ${kw}`) : `${match} con ${kw}`,
      },
      {
        regex: /\b(dining experience(?:\s+for\s+two)?|culinary precision|guided(?:\s+irish)?(?:\s+single\s+malt)?\s+masterclass|full-day coach excursion|afternoon tea(?:\s+with\s+prosecco)?|luxury countryside retreat|full day of serenity|champagne afternoon tea|open-top bus excursion|sharing platter|history walk)\b/i,
        buildReplacement: (match, kw, isTitle) =>
          isTitle ? formatHeadlineCase(`${match}: ${kw}`) : `${match} featuring ${kw}`,
      },
      {
        regex: /\b(menu dégustation(?:\s+raffiné)?|navigation panoramique|parenthèse sensorielle|moment d’évasion(?:\s+absolue)?|atelier pâtisserie)\b/i,
        buildReplacement: (match, kw, isTitle) =>
          isTitle ? formatHeadlineCase(`${match} - ${kw}`) : `${match} (${kw})`,
      },
      {
        regex: /\b(highspeed-action(?:\s+und\s+zeittraining)?|wirtshaus-abend|ganztägige auszeit)\b/i,
        buildReplacement: (match, kw, isTitle) =>
          isTitle ? formatHeadlineCase(`${match}: ${kw}`) : `${match} mit ${kw}`,
      },
      {
        regex: /\b(ritual de bienestar|ruta gastronómica|velada de arte flamenco)\b/i,
        buildReplacement: (match, kw, isTitle) =>
          isTitle ? formatHeadlineCase(`${match}: ${kw}`) : `${match} con ${kw}`,
      },
    ];

    const findReplacement = (
      kw: string
    ): { location: 'title' | 'body'; existingSnippet: string; proposedSnippet: string } | null => {
      for (const pat of candidatePatterns) {
        const bMatch = dealBody.match(pat.regex);
        if (bMatch && bMatch[0] && !usedSnippets.has(bMatch[0])) {
          usedSnippets.add(bMatch[0]);
          return {
            location: 'body',
            existingSnippet: bMatch[0],
            proposedSnippet: pat.buildReplacement(bMatch[0], kw, false),
          };
        }
        const tMatch = dealTitle.match(pat.regex);
        if (tMatch && tMatch[0] && !usedSnippets.has(tMatch[0])) {
          usedSnippets.add(tMatch[0]);
          return {
            location: 'title',
            existingSnippet: tMatch[0],
            proposedSnippet: pat.buildReplacement(tMatch[0], kw, true),
          };
        }
      }

      const kwTokens = kw
        .toLowerCase()
        .split(/\s+/)
        .filter((t) => t.length >= 3 && !MINOR_WORDS.has(t));

      const scanTokens = (
        text: string,
        loc: 'title' | 'body'
      ): { location: 'title' | 'body'; existingSnippet: string; proposedSnippet: string } | null => {
        const words = text.trim().split(/\s+/);
        if (words.length < 2) return null;
        for (let i = 0; i < words.length; i++) {
          const clean = words[i].toLowerCase().replace(/[.,;:!?()"'’]/g, '');
          if (kwTokens.includes(clean)) {
            const start = Math.max(0, i - 1);
            const end = Math.min(words.length, start + 4);
            const snippet = words
              .slice(start, end)
              .join(' ')
              .replace(/^[.,;:!?]+|[.,;:!?]+$/g, '');
            if (snippet.length >= 6 && !usedSnippets.has(snippet) && text.includes(snippet)) {
              usedSnippets.add(snippet);
              return {
                location: loc,
                existingSnippet: snippet,
                proposedSnippet:
                  loc === 'title' ? formatHeadlineCase(`${snippet} (${kw})`) : `${snippet} (${kw})`,
              };
            }
          }
        }
        return null;
      };

      return scanTokens(dealBody, 'body') || scanTokens(dealTitle, 'title');
    };

    const buildAddClause = (kw: string, loc: 'title' | 'body'): string => {
      if (loc === 'title') return formatHeadlineCase(`- ${kw}`);
      switch (country) {
        case 'IT':
          return `Approfitta dell’offerta esclusiva per ${kw} con prenotazione immediata.`;
        case 'FR':
          return `Profitez de cette offre exclusive pour ${kw}.`;
        case 'DE':
          return `Sichere dir jetzt dieses exklusive Angebot für ${kw}.`;
        case 'ES':
          return `Aprovecha esta oferta exclusiva de ${kw}.`;
        default:
          return `Book this exclusive offer for ${kw} with instant voucher confirmation.`;
      }
    };

    const suggestions: AiCopySuggestion[] = missingKeywords.map((k, idx) => {
      const rep = findReplacement(k.keyword);
      if (rep) {
        return {
          actionType: 'REPLACE',
          location: rep.location,
          keyword: k.keyword,
          existingSnippet: rep.existingSnippet,
          proposedSnippet: rep.proposedSnippet,
          rationale: `Upgrades your existing ${
            rep.location === 'title' ? 'headline' : 'description'
          } phrase with "${k.keyword}" (${k.searchVolume.toLocaleString('en-US')}/mo vol, ${k.egr.toFixed(0)}% EGR).`,
        };
      }
      const loc: 'title' | 'body' = idx === 0 ? 'title' : 'body';
      return {
        actionType: 'ADD',
        location: loc,
        keyword: k.keyword,
        existingSnippet: '',
        proposedSnippet: buildAddClause(k.keyword, loc),
        rationale: `Adds high-intent search term "${k.keyword}" (${k.searchVolume.toLocaleString('en-US')}/mo vol, ${k.egr.toFixed(0)}% EGR) directly into your ${
          loc === 'title' ? 'headline' : 'copy'
        }.`,
      };
    });

    const top1 = goodTaxonomyKeywords[0];
    const top2 = goodTaxonomyKeywords[1] || goodTaxonomyKeywords[0];
    const headlineSuggestions: AiHeadlineSuggestion[] = [];
    if (top1) {
      const baseTitle = dealTitle.trim()
        ? formatHeadlineCase(dealTitle.trim())
        : formatHeadlineCase(`${city} ${taxonomy.split('>').pop()?.trim() || 'Deal'}`);
      headlineSuggestions.push({
        headline: formatHeadlineCase(`${formatHeadlineCase(top1.keyword)}: ${baseTitle}`),
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

    const coveredCount = goodTaxonomyKeywords.length - missingKeywords.length;
    return {
      editorialSummary:
        missingKeywords.length === 0
          ? `Excellent coverage! Your draft already incorporates all ${goodTaxonomyKeywords.length} verified profitable (<100% EGR) keywords for ${city} (${taxonomy}).`
          : `Your draft currently covers ${coveredCount} of ${goodTaxonomyKeywords.length} verified profitable (<100% EGR) keywords for ${city}. Apply the ${missingKeywords.length} suggested Replace/Add edits below to maximize paid & organic search relevance.`,
      headlineSuggestions,
      suggestions,
    };
  };

  // Call Server-Side Gemini API to analyze user's copy & generate natural Replace / Add suggestions
  const handleRunAiCopyCheck = async () => {
    if (!activeDeal) return;
    setIsAnalyzing(true);
    setAnalysisError(null);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 2500);

    try {
      const response = await fetch('/api/editorial-cms/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          city: activeDeal.city,
          country: activeDeal.country,
          taxonomy: activeDeal.taxonomy || `Local > ${activeDeal.category}`,
          title: dealTitle,
          body: dealBody,
          profitableKeywords: goodTaxonomyKeywords.map((k) => ({
            keyword: k.keyword,
            searchVolume: k.searchVolume,
            ctr: k.ctr,
            conversions: k.conversions,
            egr: k.egr,
          })),
        }),
      });

      window.clearTimeout(timeoutId);

      if (!response.ok) {
        setAiAnalysis(buildLocalContextualAnalysis());
        return;
      }

      const data = await response.json();
      setAiAnalysis(data as AiAnalysisResult);
    } catch (_err: any) {
      window.clearTimeout(timeoutId);
      // Gracefully provide contextual Replace/Add analysis if fetch times out or network blips
      setAiAnalysis(buildLocalContextualAnalysis());
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClearCopy = () => {
    setDealTitle('');
    setDealBody('');
    setAiAnalysis(null);
    setAnalysisError(null);
  };

  const wordCount = `${dealTitle} ${dealBody}`
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* 1. Feature Intro Banner & City + Category Taxonomy Selectors */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-neutral-900">
                Editorial CMS × SEM Keyword Suggester
              </h2>
              <span className="text-[11px] font-semibold text-[#387b0e] bg-[#53a318]/10 px-2 py-0.5 rounded border border-[#53a318]/20">
                AI Copy Optimizer · EGR &lt; 100% Only
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Select a City and Category Taxonomy to view verified profitable SEM keywords, then run an AI Copy Check to get natural <strong>Add</strong> or <strong>Replace</strong> edits tailored to your draft.
            </p>
          </div>
        </div>

        {/* City & Category Taxonomy Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* City Selector with None option to reset */}
          <div className="md:col-span-4">
            <label
              htmlFor="cms-city-select"
              className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1 flex items-center gap-1"
            >
              <MapPin className="w-3 h-3 text-[#53a318]" />
              City / Market
            </label>
            <select
              id="cms-city-select"
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full h-10 px-3 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#53a318] cursor-pointer"
            >
              <option value="">None (Reset / Select City)</option>
              {availableCities.map((c) => (
                <option key={c.city} value={c.city}>
                  {c.city} ({c.country})
                </option>
              ))}
            </select>
          </div>

          {/* Category Taxonomy Selector (without merchant name) */}
          <div className="md:col-span-8">
            <label
              htmlFor="cms-taxonomy-select"
              className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1 flex items-center gap-1"
            >
              <Tag className="w-3 h-3 text-[#53a318]" />
              Category Taxonomy {selectedCity ? `(${selectedCity})` : ''}
            </label>
            <select
              id="cms-taxonomy-select"
              value={selectedDealPermalink}
              disabled={!selectedCity}
              onChange={(e) => handleTaxonomyChange(e.target.value)}
              className={`w-full h-10 px-3 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#53a318] ${
                !selectedCity ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <option value="">None (Select Category Taxonomy)</option>
              {dealsInCity.map((d) => (
                <option key={d.id} value={d.permalink}>
                  {d.taxonomy || `Local > ${d.category}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Empty State when City / Market or Category Taxonomy is set to None */}
      {!activeDeal ? (
        <div className="p-10 text-center bg-white border border-dashed border-neutral-300 rounded-xl space-y-2">
          <MapPin className="w-7 h-7 text-neutral-400 mx-auto" />
          <p className="text-sm font-bold text-neutral-800">No City or Category Taxonomy Selected</p>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            Select a <span className="font-semibold text-neutral-700">City / Market</span> and a{' '}
            <span className="font-semibold text-neutral-700">Category Taxonomy</span> above to load high-performing keywords and analyze your editorial copy.
          </p>
        </div>
      ) : (
        /* 2. CMS Split Workspace: Editorial Editor on Left, Unified AI + SEM Suggester on Right */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Groupon Deal CMS Editor */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-2 bg-neutral-50/60">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#53a318]" />
                    <span className="text-xs font-bold text-neutral-900">
                      Groupon Deal CMS Content Editor
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 font-medium">
                    <span className="font-semibold text-[#387b0e]">{activeDeal.city}</span> ·{' '}
                    {activeDeal.taxonomy || activeDeal.category}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearCopy}
                    title="Clear title and body to write your own custom deal copy"
                    className="px-2.5 py-1 text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 bg-white hover:bg-neutral-100 rounded-md border border-neutral-200 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Clear Copy
                  </button>

                  <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-md border border-neutral-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveTab('edit')}
                      className={`px-2.5 py-0.5 font-semibold rounded cursor-pointer ${
                        activeTab === 'edit'
                          ? 'bg-white shadow-xs text-neutral-900'
                          : 'text-neutral-600'
                      }`}
                    >
                      Drafting
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('preview')}
                      className={`px-2.5 py-0.5 font-semibold rounded cursor-pointer ${
                        activeTab === 'preview'
                          ? 'bg-white shadow-xs text-neutral-900'
                          : 'text-neutral-600'
                      }`}
                    >
                      Deal Page View
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4 text-xs font-sans">
                {activeTab === 'edit' ? (
                  <>
                    <div>
                      <label
                        htmlFor="deal-headline-input"
                        className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1"
                      >
                        Deal Headline / Title
                      </label>
                      <input
                        id="deal-headline-input"
                        type="text"
                        placeholder={`Write your deal headline for ${activeDeal.city}...`}
                        value={dealTitle}
                        onChange={(e) => setDealTitle(e.target.value)}
                        className="w-full p-2.5 text-xs font-semibold bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#53a318]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="deal-description-input"
                        className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1"
                      >
                        Editorial Description &amp; Highlights
                      </label>
                      <textarea
                        id="deal-description-input"
                        rows={7}
                        placeholder={`Write or paste your deal description for ${activeDeal.taxonomy || activeDeal.category} in ${activeDeal.city}, then click "AI Check Copy & Suggest Edits"...`}
                        value={dealBody}
                        onChange={(e) => setDealBody(e.target.value)}
                        className="w-full p-3 text-xs bg-neutral-50 border border-neutral-300 rounded-lg leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#53a318]"
                      />
                    </div>

                    {/* Active Keywords Coverage Strip */}
                    <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-neutral-600 mr-1">
                          Keywords in Copy ({includedKeywords.length}/{goodTaxonomyKeywords.length}):
                        </span>
                        {includedKeywords.length === 0 ? (
                          <span className="text-[11px] text-neutral-400 italic">
                            None detected yet
                          </span>
                        ) : (
                          includedKeywords.map((kw) => (
                            <span
                              key={kw.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[10px] font-mono font-semibold text-[#387b0e]"
                            >
                              <Check className="w-2.5 h-2.5" />
                              {kw.keyword}
                            </span>
                          ))
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] font-mono">
                        <span className="text-neutral-500">{wordCount} words</span>
                        <span className="text-neutral-300">|</span>
                        <span
                          className={`font-bold ${
                            copyScore >= 75
                              ? 'text-[#387b0e]'
                              : copyScore >= 45
                              ? 'text-amber-700'
                              : 'text-rose-600'
                          }`}
                        >
                          Score: {copyScore}/100
                        </span>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-end">
                      <button
                        type="button"
                        disabled={isAnalyzing}
                        onClick={handleRunAiCopyCheck}
                        className="px-4 py-2.5 bg-[#53a318] hover:bg-[#468c14] disabled:bg-neutral-300 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analyzing Copy with AI...
                          </>
                        ) : (
                          <>
                            <SearchCheck className="w-4 h-4" />
                            AI Check Copy &amp; Suggest Edits
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  /* Live Deal Page Mockup */
                  <div className="space-y-3 p-4 border border-neutral-200 rounded-lg bg-neutral-50">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold text-[#387b0e] bg-[#53a318]/15 px-2 py-0.5 rounded uppercase tracking-wider">
                        {activeDeal.city} ({activeDeal.country})
                      </span>
                      <span className="text-[11px] text-neutral-500 font-medium">
                        {activeDeal.taxonomy || activeDeal.category}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-neutral-900 leading-snug">
                      {dealTitle || '(Untitled Deal Draft)'}
                    </h3>
                    <p className="text-xs text-neutral-700 leading-relaxed">
                      {dealBody || '(No editorial description entered yet.)'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Copy Check Results Panel (Natural Replace / Add Suggestions & Headline Upgrades) */}
            {analysisError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{analysisError}</span>
              </div>
            )}

            {aiAnalysis && (
              <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-200">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-[#53a318]" />
                      AI Editorial Copy Recommendations
                    </h3>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      {aiAnalysis.editorialSummary}
                    </p>
                  </div>
                </div>

                {/* 1. Natural Replace / Add Edits in Copy */}
                {aiAnalysis.suggestions && aiAnalysis.suggestions.length > 0 ? (
                  <div className="space-y-2.5">
                    <p className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
                      Suggested Copy Edits ({aiAnalysis.suggestions.length})
                    </p>

                    <div className="space-y-2.5">
                      {aiAnalysis.suggestions.map((s, idx) => {
                        const isReplace =
                          s.actionType === 'REPLACE' && Boolean(s.existingSnippet?.trim());
                        const formattedProposed =
                          s.location === 'title'
                            ? formatHeadlineCase(s.proposedSnippet)
                            : s.proposedSnippet;

                        return (
                          <div
                            key={`${s.keyword}-${idx}`}
                            className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1.5 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                    isReplace
                                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                                      : 'bg-emerald-50 text-[#387b0e] border-emerald-200'
                                  }`}
                                >
                                  {isReplace ? 'Replace' : 'Add'} in{' '}
                                  {s.location === 'title' ? 'Headline' : 'Body'}
                                </span>
                                <span className="text-[11px] font-mono text-neutral-500">
                                  Target KW: <strong className="text-neutral-800">"{s.keyword}"</strong>
                                </span>
                              </div>

                              {isReplace ? (
                                <p className="text-xs text-neutral-800 leading-relaxed">
                                  Replace{' '}
                                  <span className="font-mono line-through text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                                    "{s.existingSnippet}"
                                  </span>{' '}
                                  with{' '}
                                  <span className="font-mono font-semibold text-[#387b0e] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                    "{formattedProposed}"
                                  </span>
                                </p>
                              ) : (
                                <p className="text-xs text-neutral-800 leading-relaxed">
                                  Add{' '}
                                  <span className="font-mono font-semibold text-[#387b0e] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                    "{formattedProposed}"
                                  </span>{' '}
                                  to your {s.location === 'title' ? 'Headline' : 'Body'}
                                </p>
                              )}

                              {s.rationale && (
                                <p className="text-[11px] text-neutral-500">{s.rationale}</p>
                              )}
                            </div>

                            <div className="shrink-0 self-start sm:self-center">
                              <button
                                type="button"
                                onClick={() => handleApplySuggestion(s)}
                                className={`px-3 py-1.5 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
                                  isReplace
                                    ? 'bg-amber-600 hover:bg-amber-700'
                                    : 'bg-[#53a318] hover:bg-[#468c14]'
                                }`}
                              >
                                {isReplace ? (
                                  <>
                                    <ArrowRightLeft className="w-3.5 h-3.5" />
                                    Replace
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3.5 h-3.5" />
                                    Add
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-[#387b0e] shrink-0" />
                    <span>All recommended keyword edits have been applied to your draft!</span>
                  </div>
                )}

                {/* 2. AI Headline Upgrades (Proper Title Case) */}
                {aiAnalysis.headlineSuggestions && aiAnalysis.headlineSuggestions.length > 0 && (
                  <div className="pt-3 border-t border-neutral-200 space-y-2">
                    <p className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
                      Suggested Headline Upgrades (Title Case)
                    </p>
                    <div className="space-y-2">
                      {aiAnalysis.headlineSuggestions.map((hl, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg border border-neutral-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-0.5">
                            <p className="font-bold text-neutral-900">
                              "{formatHeadlineCase(hl.headline)}"
                            </p>
                            <p className="text-[10px] font-mono text-neutral-500">
                              Includes profitable keyword:{' '}
                              <span className="text-[#387b0e] font-semibold">
                                "{hl.targetKeyword}"
                              </span>
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDealTitle(formatHeadlineCase(hl.headline))}
                            className="px-3 py-1.5 bg-neutral-100 hover:bg-[#53a318] text-neutral-800 hover:text-white text-[11px] font-bold rounded-md border border-neutral-200 transition-colors shrink-0 cursor-pointer self-start sm:self-center"
                          >
                            Replace Headline
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Profitable SEM Keyword Suggester Widget (Strictly Good Keywords <100% EGR) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border-2 border-[#53a318]/40 rounded-xl overflow-hidden shadow-xs">
              <div className="p-4 bg-[#53a318]/10 border-b border-[#53a318]/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#387b0e]" />
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    Profitable Keywords for City &amp; Taxonomy
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-[#387b0e] bg-white px-2 py-0.5 rounded border border-[#53a318]/20">
                  EGR &lt; 100% Only
                </span>
              </div>

              <div className="p-4 space-y-3 text-xs">
                <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-200 text-[11px] text-neutral-600 space-y-1">
                  <p>
                    <span className="font-semibold text-neutral-800">City:</span> {activeDeal.city} (
                    {activeDeal.country})
                  </p>
                  <p>
                    <span className="font-semibold text-neutral-800">Taxonomy:</span>{' '}
                    {activeDeal.taxonomy || activeDeal.category}
                  </p>
                </div>

                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Verified high-converting SEM keywords (&lt;100% EGR) for this city and taxonomy. Click <strong>+ Headline</strong> or <strong>+ Body</strong> to insert directly, or run <strong>AI Check Copy</strong> on the left for natural sentence replacements.
                </p>

                <div className="space-y-2.5 pt-1">
                  {goodTaxonomyKeywords.map((kw) => {
                    const inCopy = isKeywordInCopy(kw.keyword);

                    return (
                      <div
                        key={kw.id}
                        className={`p-3 rounded-lg border transition-colors ${
                          inCopy
                            ? 'bg-emerald-50/50 border-emerald-300'
                            : 'bg-neutral-50/80 border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-bold text-neutral-900 font-mono text-xs">
                            "{kw.keyword}"
                          </span>

                          {inCopy ? (
                            <span className="text-[10px] font-bold text-[#387b0e] flex items-center gap-1 shrink-0">
                              <Check className="w-3 h-3" />
                              In Copy
                            </span>
                          ) : (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleAddKeywordToTitle(kw.keyword)}
                                title={`Add "${formatHeadlineCase(kw.keyword)}" to Headline`}
                                className="px-2 py-0.5 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300 text-[10px] font-semibold rounded transition-colors cursor-pointer"
                              >
                                + Headline
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddKeywordToBody(kw.keyword)}
                                title={`Add "${kw.keyword}" to Body`}
                                className="px-2 py-0.5 bg-[#53a318] hover:bg-[#468c14] text-white text-[10px] font-bold rounded flex items-center gap-0.5 transition-colors cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                Body
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="text-[10px] text-neutral-500 font-mono flex flex-wrap items-center justify-between gap-2">
                          <span>Vol: {kw.searchVolume.toLocaleString('en-US')}</span>
                          <span>Paid CTR: {kw.ctr.toFixed(1)}%</span>
                          <span>Conv: {kw.conversions}</span>
                          <span className="font-bold text-[#387b0e]">
                            Rev: €{kw.revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })} ({kw.egr.toFixed(0)}% EGR)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-neutral-100 text-[10px] text-neutral-400 leading-normal">
                  Filtered to verified profitable SEM terms (&lt;100% EGR) matching the selected City and Category Taxonomy.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
