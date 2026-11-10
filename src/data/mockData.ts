import { UserProfile, Deal, DealKeyword, KeywordBatchSubmission } from '../types';

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'user-damiano',
    name: 'Damiano Celestini',
    email: 'damiano.celestini@groupon.com',
    role: 'Senior Manager Global SEM',
    country: 'GLOBAL',
    isManager: true,
    directReports: ['user-elena', 'user-marc', 'user-liam', 'user-sophie', 'user-carlos'],
  },
  {
    id: 'user-elena',
    name: 'Elena Rossi',
    email: 'erossi@groupon.com',
    role: 'Country Revenue Manager',
    country: 'IT',
    isManager: false,
  },
  {
    id: 'user-liam',
    name: "Liam O'Connor",
    email: 'loconnor@groupon.com',
    role: 'Country Revenue Manager',
    country: 'IE',
    isManager: false,
  },
  {
    id: 'user-marc',
    name: 'Marc Dubois',
    email: 'mdubois@groupon.com',
    role: 'Country Revenue Manager',
    country: 'FR',
    isManager: false,
  },
  {
    id: 'user-sophie',
    name: 'Sophie Weber',
    email: 'sweber@groupon.com',
    role: 'Country Revenue Manager',
    country: 'DE',
    isManager: false,
  },
  {
    id: 'user-carlos',
    name: 'Carlos Mendez',
    email: 'cmendez@groupon.com',
    role: 'Country Revenue Manager',
    country: 'ES',
    isManager: false,
  },
];

export const MOCK_DEALS: Deal[] = [
  // ==========================================
  // ITALY (IT) - Elena Rossi (5 Deals)
  // Overall Blended EGR ~78.5% (Profitable / Healthy)
  // ==========================================
  {
    id: 'deal-it-1',
    permalink: 'qc-terme-spa-wellness',
    title: 'Ingresso Giornaliero QC Terme Milano con Percorso Sensoriale',
    merchantName: 'QC Terme Milano Centro',
    country: 'IT',
    city: 'Milano',
    category: 'Beauty & Spas',
    taxonomy: 'Local > Beauty & Spas > Thermal Baths & Saunas > Couples Day Spa',
    status: 'ACTIVE',
    assignedRevenueManagerId: 'user-elena',
    originalPrice: 72.0,
    discountPrice: 44.0,
    marginAmount: 18.5, // ~42%
  },
  {
    id: 'deal-it-2',
    permalink: 'colosseo-tour-guidato-vip',
    title: 'Tour Salta la Fila Colosseo, Foro Romano e Palatino con Guida Ufficiale',
    merchantName: 'Roma Capitale Experience',
    country: 'IT',
    city: 'Roma',
    category: 'Things To Do',
    taxonomy: 'Local > Things To Do > Sightseeing & Tours > Historical Tours',
    status: 'ACTIVE',
    assignedRevenueManagerId: 'user-elena',
    originalPrice: 65.0,
    discountPrice: 35.0,
    marginAmount: 13.3, // ~38%
  },
  {
    id: 'deal-it-3',
    permalink: 'degustazione-vini-chianti-castello',
    title: 'Visita Cantina Storica e Degustazione 4 Vini Chianti con Tagliere Toscano',
    merchantName: 'Castello di Verrazzano & Tenute',
    country: 'IT',
    city: 'Firenze',
    category: 'Food & Drink',
    taxonomy: 'Local > Food & Drink > Tastings & Classes > Wine Tastings & Tours',
    status: 'ACTIVE',
    assignedRevenueManagerId: 'user-elena',
    originalPrice: 85.0,
    discountPrice: 48.0,
    marginAmount: 21.6, // 45%
  },
  {
    id: 'deal-it-4',
    permalink: 'gardaland-biglietto-ingresso-parco',
    title: 'Biglietto Ingresso Gardaland Resort 1 Giorno a Data Aperta',
    merchantName: 'Gardaland Resort Official Partner',
    country: 'IT',
    city: 'Verona',
    category: 'Things To Do',
    taxonomy: 'Local > Things To Do > Amusement & Theme Parks > Family Attractions',
    status: 'ACTIVE',
    assignedRevenueManagerId: 'user-elena',
    originalPrice: 49.0,
    discountPrice: 36.0,
    marginAmount: 10.1, // ~28%
  },
  {
    id: 'deal-it-5',
    permalink: 'cena-gourmet-pesce-navigli',
    title: 'Menu Degustazione di Pesce Fresco 4 Portate con Calice di Franciacorta',
    merchantName: 'Osteria Del Mare Navigli',
    country: 'IT',
    city: 'Milano',
    category: 'Food & Drink',
    taxonomy: 'Local > Food & Drink > Restaurants > Seafood & Fish > Gourmet Dining',
    status: 'ACTIVE',
    assignedRevenueManagerId: 'user-elena',
    originalPrice: 98.0,
    discountPrice: 52.0,
    marginAmount: 18.2, // 35%
  },

  // ==========================================
  // IRELAND (IE) - Liam O'Connor (5 Deals)
  // Overall Blended EGR ~86.2% across IE & GB
  // ==========================================
  {
    id: 'deal-ie-1',
    permalink: 'rathmines-sushi-experience',
    title: '5-Course Tasting Menu for Two with Prosecco',
    merchantName: 'Kyoto Sushi & Robata Bar',
    country: 'IE',
    city: 'Dublin',
    category: 'Food & Drink',
    taxonomy: 'Local > Food & Drink > Restaurants > Japanese > Sushi & Robata',
    status: 'ACTIVE',
    assignedRevenueManagerId: 'user-liam',
    originalPrice: 95.0,
    discountPrice: 49.0,
    marginAmount: 21.5, // ~44%
  },
  {
    id: 'deal-ie-2',
    permalink: 'temple-bar-whiskey-tasting',
    title: 'Irish Whiskey Masterclass & Artisan Pairings for Two',
    merchantName: 'The Craft Cellar Dublin',
    country: 'IE',
    city: 'Dublin',
    category: 'Things To Do',
    taxonomy: 'Local > Food & Drink > Tastings & Classes > Whiskey Tasting',
    status: 'ACTIVE',
    assignedRevenueManagerId: 'user-liam',
    originalPrice: 70.0,
    discountPrice: 38.0,
    marginAmount: 15.2, // 40%
  },
  {
    id: 'deal-ie-3',
    permalink: 'cliffs-of-moher-day-tour',
    title: 'Full-Day Luxury Coach Tour to Cliffs of Moher, Burren & Galway City',
    merchantName: 'Wild Atlantic Tours Ireland',
    country: 'IE',
    city: 'Galway',
    category: 'Things To Do',
    taxonomy: 'Local > Things To Do > Day Trips & Excursions > Coastal & Nature Tours',
    status: 'ACTIVE',
    assignedRevenueManagerId: 'user-liam',
    originalPrice: 85.0,
    discountPrice: 45.0,
    marginAmount: 16.2, // 36%
  },
  {
    id: 'deal-ie-4',
    permalink: 'luxury-afternoon-tea-ballsbridge',
    title: 'Traditional Afternoon Tea with Champagne & Macarons for Two',
    merchantName: 'The Georgian Tea Rooms Ballsbridge',
    country: 'IE',
    city: 'Dublin',
    category: 'Food & Drink',
    taxonomy: 'Local > Food & Drink > Cafes & Treats > High Tea & Pastries',
    status: 'ACTIVE',
    assignedRevenueManagerId: 'user-liam',
    originalPrice: 75.0,
    discountPrice: 42.0,
    marginAmount: 13.86, // 33%
  },
  {
    id: 'deal-ie-5',
    permalink: 'powerscourt-spa-thermal-suite',
    title: 'Thermal Suite Hydrotherapy Day Pass with 60-Minute Aromatherapy Massage',
    merchantName: 'Powerscourt Springs Health Farm',
    country: 'IE',
    city: 'Wicklow',
    category: 'Beauty & Spas',
    taxonomy: 'Local > Beauty & Spas > Day Spas > Thermal Baths & Hydrotherapy',
    status: 'ACTIVE',
    assignedRevenueManagerId: 'user-liam',
    originalPrice: 130.0,
    discountPrice: 69.0,
    marginAmount: 21.4, // ~31%
  },

  // ==========================================
  // UNITED KINGDOM (GB) - Liam O'Connor (4 Deals)
  // ==========================================
  {
    id: 'deal-gb-1',
    permalink: 'tower-bridge-afternoon-tea',
    title: 'Traditional Afternoon Tea with Champagne on the River Thames',
    merchantName: 'Thames Riverside Brasserie',
    country: 'GB',
    city: 'London',
    category: 'Food & Drink',
    taxonomy: 'Local > Food & Drink > Cafes & Treats > Traditional Afternoon Tea',
    status: 'ACTIVE',
    assignedRevenueManagerId: 'user-liam',
    originalPrice: 85.0,
    discountPrice: 42.0,
    marginAmount: 16.4, // ~39%
  },
  {
    id: 'deal-gb-2',
    permalink: 'oxford-cotswolds-vintage-bus-tour',
    title: 'Vintage Bus Day Tour of Oxford & Cotswolds Villages with Cream Tea',
    merchantName: 'Heritage Cotswold Coaches',
    country: 'GB',
    city: 'Oxford',
    category: 'Things To Do',
    taxonomy: 'Local > Things To Do > Day Trips & Sightseeing > Countryside Tours',
    status: 'ACTIVE',
    assignedRevenueManagerId: 'user-liam',
    originalPrice: 90.0,
    discountPrice: 48.0,
    marginAmount: 16.8, // 35%
  },
  {
    id: 'deal-gb-3',
    permalink: 'soho-steakhouse-chateaubriand',
    title: 'Prime 16oz Chateaubriand for Two with Truffle Fries and Malbec Wine',
    merchantName: 'The Dean Street Grill Soho',
    country: 'GB',
    city: 'London',
    category: 'Food & Drink',
    taxonomy: 'Local > Food & Drink > Restaurants > Steakhouses > Prime Cuts',
    status: 'ACTIVE',
    assignedRevenueManagerId: 'user-liam',
    originalPrice: 120.0,
    discountPrice: 65.0,
    marginAmount: 27.95, // 43%
  },
  {
    id: 'deal-gb-4',
    permalink: 'edinburgh-castle-vaults-ghost-tour',
    title: 'Underground Vaults & Old Town Edinburgh Evening History Tour',
    merchantName: 'Auld Reekie Historical Tours',
    country: 'GB',
    city: 'Edinburgh',
    category: 'Things To Do',
    taxonomy: 'Local > Things To Do > Walking & Ghost Tours > Historical Landmarks',
    status: 'ACTIVE',
    assignedRevenueManagerId: 'user-liam',
    originalPrice: 38.0,
    discountPrice: 20.0,
    marginAmount: 5.4, // 27%
  },

  // ==========================================
  // FRANCE (FR) - Marc Dubois (4 Deals)
  // Overall Blended EGR ~93.5% (Borderline Profitable)
  // ==========================================
  {
    id: 'deal-fr-1',
    permalink: 'le-bistrot-gourmet-saint-germain',
    title: 'Menu Dégustation 3 Plats avec Accords Mets et Vins pour Deux',
    merchantName: 'Le Bistrot Saint-Germain',
    country: 'FR',
    city: 'Paris',
    category: 'Food & Drink',
    taxonomy: 'Local > Food & Drink > Restaurants > French Gastronomy > Wine Pairings',
    status: 'ACTIVE',
    assignedRevenueManagerId: 'user-marc',
    originalPrice: 110.0,
    discountPrice: 58.0,
    marginAmount: 23.2, // 40%
  },
  {
    id: 'deal-fr-2',
    permalink: 'croisiere-saone-dejeuner',
    title: 'Croisière Promenade Gastronomique sur la Saône pour Deux',
    merchantName: 'Bateaux Lyonnais Fluvial',
    country: 'FR',
    city: 'Lyon',
    category: 'Things To Do',
    taxonomy: 'Local > Things To Do > Cruises & Water Tours > River Dining',
    status: 'ACTIVE',
    assignedRevenueManagerId: 'user-marc',
    originalPrice: 90.0,
    discountPrice: 52.0,
    marginAmount: 21.8, // ~42%
  },
  {
    id: 'deal-fr-3',
    permalink: 'spa-balneo-champs-elysees',
    title: 'Accès Hammam Privatif, Bain Bouillonnant & Gommage aux Sels de Guérande',
    merchantName: 'Étoile Bien-Être & Spa Paris',
    country: 'FR',
    city: 'Paris',
    category: 'Beauty & Spas',
    taxonomy: 'Local > Beauty & Spas > Day Spas > Hammam & Balneotherapy',
    status: 'ACTIVE',
    assignedRevenueManagerId: 'user-marc',
    originalPrice: 140.0,
    discountPrice: 75.0,
    marginAmount: 24.0, // 32%
  },
  {
    id: 'deal-fr-4',
    permalink: 'cours-patisserie-macarons-marais',
    title: 'Atelier de Pâtisserie Française 2h30: Secrets des Macarons Parisiens',
    merchantName: 'L’Atelier Sucré du Marais',
    country: 'FR',
    city: 'Paris',
    category: 'Things To Do',
    taxonomy: 'Local > Things To Do > Cooking Classes > French Baking & Pastry',
    status: 'ACTIVE',
    assignedRevenueManagerId: 'user-marc',
    originalPrice: 80.0,
    discountPrice: 45.0,
    marginAmount: 16.65, // 37%
  },

  // ==========================================
  // GERMANY (DE) - Sophie Weber (3 Deals)
  // Overall Blended EGR ~112.8% (RED / UNPROFITABLE!)
  // ==========================================
  {
    id: 'deal-de-1',
    permalink: 'karting-speedway-berlin',
    title: '30 Min Gokart Renntraining inkl. Zeitmessung & Sturmhaube',
    merchantName: 'Grand Prix Speedway Berlin Spandau',
    country: 'DE',
    city: 'Berlin',
    category: 'Activities',
    taxonomy: 'Local > Things To Do > Sports & Active Life > Go Karting & Racing',
    status: 'ACTIVE',
    assignedRevenueManagerId: 'user-sophie',
    originalPrice: 45.0,
    discountPrice: 24.0,
    marginAmount: 6.96, // 29%
  },
  {
    id: 'deal-de-2',
    permalink: 'bavarian-beer-hall-tasting-munchen',
    title: 'Traditionelles 3-Gänge Brauhaus-Menü mit 4 Bierspezialitäten für Zwei',
    merchantName: 'Münchner Hofbräu & Brauhauskeller',
    country: 'DE',
    city: 'München',
    category: 'Food & Drink',
    taxonomy: 'Local > Food & Drink > Restaurants > Bavarian & German > Beer Tastings',
    status: 'ACTIVE',
    assignedRevenueManagerId: 'user-sophie',
    originalPrice: 70.0,
    discountPrice: 38.0,
    marginAmount: 12.16, // 32%
  },
  {
    id: 'deal-de-3',
    permalink: 'vabali-spa-day-pass-hamburg',
    title: 'Tageskarte Saunadorf & Entspannungsoase mit Panoramablick',
    merchantName: 'Vabali Balinesisches Spa Hamburg',
    country: 'DE',
    city: 'Hamburg',
    category: 'Beauty & Spas',
    taxonomy: 'Local > Beauty & Spas > Thermal Baths & Saunas > Day Retreats',
    status: 'ACTIVE',
    assignedRevenueManagerId: 'user-sophie',
    originalPrice: 85.0,
    discountPrice: 49.0,
    marginAmount: 14.7, // 30%
  },

  // ==========================================
  // SPAIN (ES) - Carlos Mendez (3 Deals)
  // Overall Blended EGR ~124.6% (RED / UNPROFITABLE!)
  // ==========================================
  {
    id: 'deal-es-1',
    permalink: 'hammam-al-andalus-banos-arabes',
    title: 'Circuito Termal Árabe y Masaje Relajante con Aceites Esenciales',
    merchantName: 'Hammam Al Ándalus Madrid',
    country: 'ES',
    city: 'Madrid',
    category: 'Beauty & Spas',
    taxonomy: 'Local > Beauty & Spas > Massage > Couples > Arab Thermal Baths',
    status: 'ACTIVE',
    assignedRevenueManagerId: 'user-carlos',
    originalPrice: 75.0,
    discountPrice: 42.0,
    marginAmount: 11.76, // 28%
  },
  {
    id: 'deal-es-2',
    permalink: 'tapas-gourmet-tour-barrio-gotico',
    title: 'Tour Gastronómico de Tapas y Vinos Catalanes por el Barrio Gótico',
    merchantName: 'Sabor Barcelona Gourmet Tours',
    country: 'ES',
    city: 'Barcelona',
    category: 'Food & Drink',
    taxonomy: 'Local > Food & Drink > Food Tours > Tapas & Local Gastronomy',
    status: 'ACTIVE',
    assignedRevenueManagerId: 'user-carlos',
    originalPrice: 65.0,
    discountPrice: 36.0,
    marginAmount: 9.36, // 26%
  },
  {
    id: 'deal-es-3',
    permalink: 'flamenco-show-cena-triana',
    title: 'Espectáculo Flamenco en Directo con Menú Degustación Andaluz',
    merchantName: 'Tablao Flamenco Triana Sevilla',
    country: 'ES',
    city: 'Sevilla',
    category: 'Things To Do',
    taxonomy: 'Local > Things To Do > Shows & Entertainment > Flamenco & Dinner',
    status: 'ACTIVE',
    assignedRevenueManagerId: 'user-carlos',
    originalPrice: 80.0,
    discountPrice: 44.0,
    marginAmount: 11.0, // 25%
  },
];

export const INITIAL_KEYWORDS: DealKeyword[] = [
  // =========================================================================
  // 1. QC TERME MILANO (IT) - Elena Rossi
  // Seed 1: qc terme milano sconti (EXACT, PHRASE, BROAD)
  // Seed 2: spa porta romana milano offerta (EXACT, PHRASE, BROAD)
  // =========================================================================
  {
    id: 'kw-it-1-exact',
    dealPermalink: 'qc-terme-spa-wellness',
    keyword: 'qc terme milano sconti',
    matchType: 'EXACT',
    addedByUserId: 'user-elena',
    addedDate: '2026-10-05',
    searchVolume: 2800,
    avgCpc: 0.88,
    clicks: 290,
    impressions: 4600, // CTR ~6.3%
    conversions: 26,   // CR ~9.0%
    cost: 255.2,
    revenue: 572.0,    // EGR = 44.6% (Star Winner)
    status: 'ACTIVE',
  },
  {
    id: 'kw-it-1-phrase',
    dealPermalink: 'qc-terme-spa-wellness',
    keyword: 'qc terme milano sconti',
    matchType: 'PHRASE',
    addedByUserId: 'user-elena',
    addedDate: '2026-10-05',
    searchVolume: 4200,
    avgCpc: 0.98,
    clicks: 240,
    impressions: 5900, // CTR ~4.1%
    conversions: 15,   // CR ~6.2%
    cost: 235.2,
    revenue: 350.0,    // EGR = 67.2% (Good)
    status: 'ACTIVE',
  },
  {
    id: 'kw-it-1-broad',
    dealPermalink: 'qc-terme-spa-wellness',
    keyword: 'qc terme milano sconti',
    matchType: 'BROAD',
    addedByUserId: 'user-elena',
    addedDate: '2026-10-05',
    searchVolume: 5600,
    avgCpc: 1.15,
    clicks: 180,
    impressions: 7200, // CTR ~2.5%
    conversions: 6,    // CR ~3.3%
    cost: 207.0,
    revenue: 210.0,    // EGR = 98.6% (Borderline / Break-even)
    status: 'ACTIVE',
  },

  {
    id: 'kw-it-2-exact',
    dealPermalink: 'qc-terme-spa-wellness',
    keyword: 'spa porta romana milano offerta',
    matchType: 'EXACT',
    addedByUserId: 'user-elena',
    addedDate: '2026-10-08',
    searchVolume: 1100,
    avgCpc: 1.05,
    clicks: 140,
    impressions: 2400, // CTR ~5.8%
    conversions: 10,   // CR ~7.1%
    cost: 147.0,
    revenue: 260.0,    // EGR = 56.5% (Good)
    status: 'ACTIVE',
  },
  {
    id: 'kw-it-2-phrase',
    dealPermalink: 'qc-terme-spa-wellness',
    keyword: 'spa porta romana milano offerta',
    matchType: 'PHRASE',
    addedByUserId: 'user-elena',
    addedDate: '2026-10-08',
    searchVolume: 1600,
    avgCpc: 1.18,
    clicks: 145,
    impressions: 3800, // CTR ~3.8%
    conversions: 7,    // CR ~4.8%
    cost: 171.1,
    revenue: 200.0,    // EGR = 85.5% (Acceptable)
    status: 'ACTIVE',
  },
  {
    id: 'kw-it-2-broad',
    dealPermalink: 'qc-terme-spa-wellness',
    keyword: 'spa porta romana milano offerta',
    matchType: 'BROAD',
    addedByUserId: 'user-elena',
    addedDate: '2026-10-08',
    searchVolume: 2400,
    avgCpc: 1.35,
    clicks: 115,
    impressions: 4800, // CTR ~2.4%
    conversions: 2,    // CR ~1.7%
    cost: 155.25,
    revenue: 110.0,    // EGR = 141.1% (Loss)
    status: 'ACTIVE',
  },

  // =========================================================================
  // 2. COLOSSEO VIP TOUR (IT) - Elena Rossi
  // Seed 1: biglietti salta fila colosseo offerta (EXACT, PHRASE, BROAD)
  // Seed 2: visita guidata foro romano colosseo (EXACT, PHRASE, BROAD)
  // =========================================================================
  {
    id: 'kw-it-col-1-exact',
    dealPermalink: 'colosseo-tour-guidato-vip',
    keyword: 'biglietti salta fila colosseo offerta',
    matchType: 'EXACT',
    addedByUserId: 'user-elena',
    addedDate: '2026-10-10',
    searchVolume: 3400,
    avgCpc: 1.05,
    clicks: 290,
    impressions: 4800,
    conversions: 22,
    cost: 304.5,
    revenue: 550.0,    // EGR = 55.4% (Good)
    status: 'ACTIVE',
  },
  {
    id: 'kw-it-col-1-phrase',
    dealPermalink: 'colosseo-tour-guidato-vip',
    keyword: 'biglietti salta fila colosseo offerta',
    matchType: 'PHRASE',
    addedByUserId: 'user-elena',
    addedDate: '2026-10-10',
    searchVolume: 5100,
    avgCpc: 1.15,
    clicks: 220,
    impressions: 5900,
    conversions: 12,
    cost: 253.0,
    revenue: 330.0,    // EGR = 76.7% (Good)
    status: 'ACTIVE',
  },
  {
    id: 'kw-it-col-1-broad',
    dealPermalink: 'colosseo-tour-guidato-vip',
    keyword: 'biglietti salta fila colosseo offerta',
    matchType: 'BROAD',
    addedByUserId: 'user-elena',
    addedDate: '2026-10-10',
    searchVolume: 6800,
    avgCpc: 1.40,
    clicks: 130,
    impressions: 5400,
    conversions: 3,
    cost: 182.0,
    revenue: 140.0,    // EGR = 130.0% (Loss)
    status: 'ACTIVE',
  },
  {
    id: 'kw-it-col-2-exact',
    dealPermalink: 'colosseo-tour-guidato-vip',
    keyword: 'visita guidata foro romano colosseo',
    matchType: 'EXACT',
    addedByUserId: 'user-elena',
    addedDate: '2026-10-15',
    searchVolume: 1800,
    avgCpc: 1.18,
    clicks: 140,
    impressions: 2600,
    conversions: 9,
    cost: 165.2,
    revenue: 240.0,    // EGR = 68.8%
    status: 'ACTIVE',
  },
  {
    id: 'kw-it-col-2-phrase',
    dealPermalink: 'colosseo-tour-guidato-vip',
    keyword: 'visita guidata foro romano colosseo',
    matchType: 'PHRASE',
    addedByUserId: 'user-elena',
    addedDate: '2026-10-15',
    searchVolume: 2800,
    avgCpc: 1.30,
    clicks: 130,
    impressions: 3700,
    conversions: 6,
    cost: 169.0,
    revenue: 190.0,    // EGR = 88.9%
    status: 'ACTIVE',
  },
  {
    id: 'kw-it-col-2-broad',
    dealPermalink: 'colosseo-tour-guidato-vip',
    keyword: 'visita guidata foro romano colosseo',
    matchType: 'BROAD',
    addedByUserId: 'user-elena',
    addedDate: '2026-10-15',
    searchVolume: 3900,
    avgCpc: 1.55,
    clicks: 80,
    impressions: 3400,
    conversions: 2,
    cost: 124.0,
    revenue: 80.0,     // EGR = 155.0% (Loss)
    status: 'ACTIVE',
  },

  // =========================================================================
  // 3. CHIANTI WINE TASTING (IT) - Elena Rossi
  // Seed: degustazione chianti firenze cantina (EXACT, PHRASE, BROAD)
  // =========================================================================
  {
    id: 'kw-it-ch-1-exact',
    dealPermalink: 'degustazione-vini-chianti-castello',
    keyword: 'degustazione chianti firenze cantina',
    matchType: 'EXACT',
    addedByUserId: 'user-elena',
    addedDate: '2026-10-11',
    searchVolume: 1400,
    avgCpc: 1.15,
    clicks: 165,
    impressions: 2800,
    conversions: 12,
    cost: 189.75,
    revenue: 320.0,    // EGR = 59.3%
    status: 'ACTIVE',
  },
  {
    id: 'kw-it-ch-1-phrase',
    dealPermalink: 'degustazione-vini-chianti-castello',
    keyword: 'degustazione chianti firenze cantina',
    matchType: 'PHRASE',
    addedByUserId: 'user-elena',
    addedDate: '2026-10-11',
    searchVolume: 2100,
    avgCpc: 1.25,
    clicks: 125,
    impressions: 3300,
    conversions: 7,
    cost: 156.25,
    revenue: 200.0,    // EGR = 78.1%
    status: 'ACTIVE',
  },
  {
    id: 'kw-it-ch-1-broad',
    dealPermalink: 'degustazione-vini-chianti-castello',
    keyword: 'degustazione chianti firenze cantina',
    matchType: 'BROAD',
    addedByUserId: 'user-elena',
    addedDate: '2026-10-11',
    searchVolume: 3200,
    avgCpc: 1.50,
    clicks: 75,
    impressions: 2900,
    conversions: 2,
    cost: 112.5,
    revenue: 90.0,     // EGR = 125.0% (Loss)
    status: 'ACTIVE',
  },

  // =========================================================================
  // 4. GARDALAND RESORT (IT) - Elena Rossi
  // Seed: biglietti gardaland scontati verona (EXACT, PHRASE, BROAD) -> Overall Loss
  // =========================================================================
  {
    id: 'kw-it-gar-1-exact',
    dealPermalink: 'gardaland-biglietto-ingresso-parco',
    keyword: 'biglietti gardaland scontati verona',
    matchType: 'EXACT',
    addedByUserId: 'user-elena',
    addedDate: '2026-10-12',
    searchVolume: 3100,
    avgCpc: 1.10,
    clicks: 190,
    impressions: 3700,
    conversions: 10,
    cost: 209.0,
    revenue: 240.0,    // EGR = 87.1%
    status: 'ACTIVE',
  },
  {
    id: 'kw-it-gar-1-phrase',
    dealPermalink: 'gardaland-biglietto-ingresso-parco',
    keyword: 'biglietti gardaland scontati verona',
    matchType: 'PHRASE',
    addedByUserId: 'user-elena',
    addedDate: '2026-10-12',
    searchVolume: 4800,
    avgCpc: 1.25,
    clicks: 140,
    impressions: 4200,
    conversions: 5,
    cost: 175.0,
    revenue: 160.0,    // EGR = 109.4% (Loss)
    status: 'ACTIVE',
  },
  {
    id: 'kw-it-gar-1-broad',
    dealPermalink: 'gardaland-biglietto-ingresso-parco',
    keyword: 'biglietti gardaland scontati verona',
    matchType: 'BROAD',
    addedByUserId: 'user-elena',
    addedDate: '2026-10-12',
    searchVolume: 6400,
    avgCpc: 1.50,
    clicks: 75,
    impressions: 3500,
    conversions: 1,
    cost: 112.5,
    revenue: 70.0,     // EGR = 160.7% (Loss)
    status: 'ACTIVE',
  },

  // =========================================================================
  // 5. CENA PESCE NAVIGLI (IT) - Elena Rossi
  // Seed: ristorante pesce milano navigli sconti (EXACT, PHRASE, BROAD)
  // =========================================================================
  {
    id: 'kw-it-nav-1-exact',
    dealPermalink: 'cena-gourmet-pesce-navigli',
    keyword: 'ristorante pesce milano navigli sconti',
    matchType: 'EXACT',
    addedByUserId: 'user-elena',
    addedDate: '2026-10-14',
    searchVolume: 1600,
    avgCpc: 1.20,
    clicks: 150,
    impressions: 2900,
    conversions: 10,
    cost: 180.0,
    revenue: 250.0,    // EGR = 72.0%
    status: 'ACTIVE',
  },
  {
    id: 'kw-it-nav-1-phrase',
    dealPermalink: 'cena-gourmet-pesce-navigli',
    keyword: 'ristorante pesce milano navigli sconti',
    matchType: 'PHRASE',
    addedByUserId: 'user-elena',
    addedDate: '2026-10-14',
    searchVolume: 2400,
    avgCpc: 1.35,
    clicks: 105,
    impressions: 3100,
    conversions: 5,
    cost: 141.75,
    revenue: 160.0,    // EGR = 88.6%
    status: 'ACTIVE',
  },
  {
    id: 'kw-it-nav-1-broad',
    dealPermalink: 'cena-gourmet-pesce-navigli',
    keyword: 'ristorante pesce milano navigli sconti',
    matchType: 'BROAD',
    addedByUserId: 'user-elena',
    addedDate: '2026-10-14',
    searchVolume: 3500,
    avgCpc: 1.55,
    clicks: 65,
    impressions: 2700,
    conversions: 2,
    cost: 100.75,
    revenue: 80.0,     // EGR = 125.9% (Loss)
    status: 'ACTIVE',
  },

  // =========================================================================
  // 6. RATHMINES SUSHI (IE) - Liam O'Connor
  // Seed 1: sushi rathmines tasting menu (EXACT, PHRASE, BROAD)
  // Seed 2: japanese restaurant dublin 6 deals (EXACT, PHRASE, BROAD)
  // =========================================================================
  {
    id: 'kw-ie-1-exact',
    dealPermalink: 'rathmines-sushi-experience',
    keyword: 'sushi rathmines tasting menu',
    matchType: 'EXACT',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-06',
    searchVolume: 1400,
    avgCpc: 1.05,
    clicks: 220,
    impressions: 3600,
    conversions: 17,
    cost: 231.0,
    revenue: 440.0,    // EGR = 52.5%
    status: 'ACTIVE',
  },
  {
    id: 'kw-ie-1-phrase',
    dealPermalink: 'rathmines-sushi-experience',
    keyword: 'sushi rathmines tasting menu',
    matchType: 'PHRASE',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-06',
    searchVolume: 2100,
    avgCpc: 1.20,
    clicks: 160,
    impressions: 4200,
    conversions: 10,
    cost: 192.0,
    revenue: 270.0,    // EGR = 71.1%
    status: 'ACTIVE',
  },
  {
    id: 'kw-ie-1-broad',
    dealPermalink: 'rathmines-sushi-experience',
    keyword: 'sushi rathmines tasting menu',
    matchType: 'BROAD',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-06',
    searchVolume: 3100,
    avgCpc: 1.45,
    clicks: 110,
    impressions: 4600,
    conversions: 4,
    cost: 159.5,
    revenue: 150.0,    // EGR = 106.3% (Loss)
    status: 'ACTIVE',
  },
  {
    id: 'kw-ie-2-exact',
    dealPermalink: 'rathmines-sushi-experience',
    keyword: 'japanese restaurant dublin 6 deals',
    matchType: 'EXACT',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-10',
    searchVolume: 900,
    avgCpc: 1.20,
    clicks: 130,
    impressions: 2200,
    conversions: 8,
    cost: 156.0,
    revenue: 220.0,    // EGR = 70.9%
    status: 'ACTIVE',
  },
  {
    id: 'kw-ie-2-phrase',
    dealPermalink: 'rathmines-sushi-experience',
    keyword: 'japanese restaurant dublin 6 deals',
    matchType: 'PHRASE',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-10',
    searchVolume: 1400,
    avgCpc: 1.35,
    clicks: 110,
    impressions: 2900,
    conversions: 5,
    cost: 148.5,
    revenue: 170.0,    // EGR = 87.4%
    status: 'ACTIVE',
  },
  {
    id: 'kw-ie-2-broad',
    dealPermalink: 'rathmines-sushi-experience',
    keyword: 'japanese restaurant dublin 6 deals',
    matchType: 'BROAD',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-10',
    searchVolume: 2200,
    avgCpc: 1.60,
    clicks: 70,
    impressions: 2800,
    conversions: 2,
    cost: 112.0,
    revenue: 90.0,     // EGR = 124.4% (Loss)
    status: 'ACTIVE',
  },

  // =========================================================================
  // 7. TEMPLE BAR WHISKEY (IE) - Liam O'Connor
  // Seed: whiskey tasting temple bar dublin (EXACT, PHRASE, BROAD)
  // =========================================================================
  {
    id: 'kw-ie-w-1-exact',
    dealPermalink: 'temple-bar-whiskey-tasting',
    keyword: 'whiskey tasting temple bar dublin',
    matchType: 'EXACT',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-09',
    searchVolume: 2100,
    avgCpc: 1.10,
    clicks: 210,
    impressions: 3800,
    conversions: 15,
    cost: 231.0,
    revenue: 380.0,    // EGR = 60.8%
    status: 'ACTIVE',
  },
  {
    id: 'kw-ie-w-1-phrase',
    dealPermalink: 'temple-bar-whiskey-tasting',
    keyword: 'whiskey tasting temple bar dublin',
    matchType: 'PHRASE',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-09',
    searchVolume: 3100,
    avgCpc: 1.25,
    clicks: 160,
    impressions: 4300,
    conversions: 8,
    cost: 200.0,
    revenue: 240.0,    // EGR = 83.3%
    status: 'ACTIVE',
  },
  {
    id: 'kw-ie-w-1-broad',
    dealPermalink: 'temple-bar-whiskey-tasting',
    keyword: 'whiskey tasting temple bar dublin',
    matchType: 'BROAD',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-09',
    searchVolume: 4400,
    avgCpc: 1.50,
    clicks: 95,
    impressions: 4100,
    conversions: 3,
    cost: 142.5,
    revenue: 120.0,    // EGR = 118.8% (Loss)
    status: 'ACTIVE',
  },

  // =========================================================================
  // 8. CLIFFS OF MOHER TOUR (IE) - Liam O'Connor
  // Seed: cliffs of moher day tour discount (EXACT, PHRASE, BROAD)
  // =========================================================================
  {
    id: 'kw-ie-cl-1-exact',
    dealPermalink: 'cliffs-of-moher-day-tour',
    keyword: 'cliffs of moher day tour discount',
    matchType: 'EXACT',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-07',
    searchVolume: 3200,
    avgCpc: 1.15,
    clicks: 240,
    impressions: 4200,
    conversions: 18,
    cost: 276.0,
    revenue: 480.0,    // EGR = 57.5%
    status: 'ACTIVE',
  },
  {
    id: 'kw-ie-cl-1-phrase',
    dealPermalink: 'cliffs-of-moher-day-tour',
    keyword: 'cliffs of moher day tour discount',
    matchType: 'PHRASE',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-07',
    searchVolume: 4900,
    avgCpc: 1.30,
    clicks: 180,
    impressions: 4900,
    conversions: 10,
    cost: 234.0,
    revenue: 310.0,    // EGR = 75.5%
    status: 'ACTIVE',
  },
  {
    id: 'kw-ie-cl-1-broad',
    dealPermalink: 'cliffs-of-moher-day-tour',
    keyword: 'cliffs of moher day tour discount',
    matchType: 'BROAD',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-07',
    searchVolume: 6100,
    avgCpc: 1.55,
    clicks: 80,
    impressions: 3900,
    conversions: 2,
    cost: 124.0,
    revenue: 110.0,    // EGR = 112.7% (Loss)
    status: 'ACTIVE',
  },

  // =========================================================================
  // 9. BALLSBRIDGE AFTERNOON TEA (IE) - Liam O'Connor
  // Seed: afternoon tea ballsbridge dublin 4 (EXACT, PHRASE, BROAD)
  // =========================================================================
  {
    id: 'kw-ie-bb-1-exact',
    dealPermalink: 'luxury-afternoon-tea-ballsbridge',
    keyword: 'afternoon tea ballsbridge dublin 4',
    matchType: 'EXACT',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-15',
    searchVolume: 1400,
    avgCpc: 1.20,
    clicks: 160,
    impressions: 2900,
    conversions: 10,
    cost: 192.0,
    revenue: 250.0,    // EGR = 76.8%
    status: 'ACTIVE',
  },
  {
    id: 'kw-ie-bb-1-phrase',
    dealPermalink: 'luxury-afternoon-tea-ballsbridge',
    keyword: 'afternoon tea ballsbridge dublin 4',
    matchType: 'PHRASE',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-15',
    searchVolume: 2200,
    avgCpc: 1.35,
    clicks: 125,
    impressions: 3300,
    conversions: 6,
    cost: 168.75,
    revenue: 180.0,    // EGR = 93.8%
    status: 'ACTIVE',
  },
  {
    id: 'kw-ie-bb-1-broad',
    dealPermalink: 'luxury-afternoon-tea-ballsbridge',
    keyword: 'afternoon tea ballsbridge dublin 4',
    matchType: 'BROAD',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-15',
    searchVolume: 3100,
    avgCpc: 1.60,
    clicks: 70,
    impressions: 2800,
    conversions: 2,
    cost: 112.0,
    revenue: 90.0,     // EGR = 124.4% (Loss)
    status: 'ACTIVE',
  },

  // =========================================================================
  // 10. POWERSCOURT SPRINGS SPA (IE) - Liam O'Connor
  // Seed: powerscourt springs spa day pass (EXACT, PHRASE, BROAD) -> Overall Loss
  // =========================================================================
  {
    id: 'kw-ie-ps-1-exact',
    dealPermalink: 'powerscourt-spa-thermal-suite',
    keyword: 'powerscourt springs spa day pass',
    matchType: 'EXACT',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-11',
    searchVolume: 1800,
    avgCpc: 1.35,
    clicks: 170,
    impressions: 3400,
    conversions: 8,
    cost: 229.5,
    revenue: 260.0,    // EGR = 88.3%
    status: 'ACTIVE',
  },
  {
    id: 'kw-ie-ps-1-phrase',
    dealPermalink: 'powerscourt-spa-thermal-suite',
    keyword: 'powerscourt springs spa day pass',
    matchType: 'PHRASE',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-11',
    searchVolume: 2800,
    avgCpc: 1.50,
    clicks: 130,
    impressions: 3900,
    conversions: 4,
    cost: 195.0,
    revenue: 170.0,    // EGR = 114.7% (Loss)
    status: 'ACTIVE',
  },
  {
    id: 'kw-ie-ps-1-broad',
    dealPermalink: 'powerscourt-spa-thermal-suite',
    keyword: 'powerscourt springs spa day pass',
    matchType: 'BROAD',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-11',
    searchVolume: 4100,
    avgCpc: 1.75,
    clicks: 70,
    impressions: 3100,
    conversions: 1,
    cost: 122.5,
    revenue: 80.0,     // EGR = 153.1% (Loss)
    status: 'ACTIVE',
  },

  // =========================================================================
  // 11. TOWER BRIDGE TEA (GB) - Liam O'Connor
  // Seed 1: tower bridge afternoon tea deals (EXACT, PHRASE, BROAD)
  // Seed 2: champagne afternoon tea river thames (EXACT, PHRASE, BROAD)
  // =========================================================================
  {
    id: 'kw-gb-1-exact',
    dealPermalink: 'tower-bridge-afternoon-tea',
    keyword: 'tower bridge afternoon tea deals',
    matchType: 'EXACT',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-08',
    searchVolume: 2400,
    avgCpc: 1.15,
    clicks: 220,
    impressions: 3900,
    conversions: 16,
    cost: 253.0,
    revenue: 420.0,    // EGR = 60.2%
    status: 'ACTIVE',
  },
  {
    id: 'kw-gb-1-phrase',
    dealPermalink: 'tower-bridge-afternoon-tea',
    keyword: 'tower bridge afternoon tea deals',
    matchType: 'PHRASE',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-08',
    searchVolume: 3800,
    avgCpc: 1.30,
    clicks: 160,
    impressions: 4600,
    conversions: 9,
    cost: 208.0,
    revenue: 260.0,    // EGR = 80.0%
    status: 'ACTIVE',
  },
  {
    id: 'kw-gb-1-broad',
    dealPermalink: 'tower-bridge-afternoon-tea',
    keyword: 'tower bridge afternoon tea deals',
    matchType: 'BROAD',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-08',
    searchVolume: 5200,
    avgCpc: 1.55,
    clicks: 90,
    impressions: 4200,
    conversions: 3,
    cost: 139.5,
    revenue: 120.0,    // EGR = 116.3% (Loss)
    status: 'ACTIVE',
  },
  {
    id: 'kw-gb-2-exact',
    dealPermalink: 'tower-bridge-afternoon-tea',
    keyword: 'champagne afternoon tea river thames',
    matchType: 'EXACT',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-14',
    searchVolume: 1400,
    avgCpc: 1.30,
    clicks: 140,
    impressions: 2600,
    conversions: 9,
    cost: 182.0,
    revenue: 260.0,    // EGR = 70.0%
    status: 'ACTIVE',
  },
  {
    id: 'kw-gb-2-phrase',
    dealPermalink: 'tower-bridge-afternoon-tea',
    keyword: 'champagne afternoon tea river thames',
    matchType: 'PHRASE',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-14',
    searchVolume: 2200,
    avgCpc: 1.45,
    clicks: 110,
    impressions: 3100,
    conversions: 5,
    cost: 159.5,
    revenue: 170.0,    // EGR = 93.8%
    status: 'ACTIVE',
  },
  {
    id: 'kw-gb-2-broad',
    dealPermalink: 'tower-bridge-afternoon-tea',
    keyword: 'champagne afternoon tea river thames',
    matchType: 'BROAD',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-14',
    searchVolume: 3400,
    avgCpc: 1.70,
    clicks: 65,
    impressions: 2900,
    conversions: 1,
    cost: 110.5,
    revenue: 80.0,     // EGR = 138.1% (Loss)
    status: 'ACTIVE',
  },

  // =========================================================================
  // 12. OXFORD COTSWOLDS TOUR (GB) - Liam O'Connor
  // Seed: cotswolds vintage bus tour from oxford (EXACT, PHRASE, BROAD)
  // =========================================================================
  {
    id: 'kw-gb-ox-1-exact',
    dealPermalink: 'oxford-cotswolds-vintage-bus-tour',
    keyword: 'cotswolds vintage bus tour from oxford',
    matchType: 'EXACT',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-13',
    searchVolume: 1600,
    avgCpc: 1.20,
    clicks: 180,
    impressions: 3400,
    conversions: 12,
    cost: 216.0,
    revenue: 320.0,    // EGR = 67.5%
    status: 'ACTIVE',
  },
  {
    id: 'kw-gb-ox-1-phrase',
    dealPermalink: 'oxford-cotswolds-vintage-bus-tour',
    keyword: 'cotswolds vintage bus tour from oxford',
    matchType: 'PHRASE',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-13',
    searchVolume: 2400,
    avgCpc: 1.35,
    clicks: 130,
    impressions: 3900,
    conversions: 6,
    cost: 175.5,
    revenue: 200.0,    // EGR = 87.8%
    status: 'ACTIVE',
  },
  {
    id: 'kw-gb-ox-1-broad',
    dealPermalink: 'oxford-cotswolds-vintage-bus-tour',
    keyword: 'cotswolds vintage bus tour from oxford',
    matchType: 'BROAD',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-13',
    searchVolume: 3600,
    avgCpc: 1.60,
    clicks: 65,
    impressions: 2800,
    conversions: 2,
    cost: 104.0,
    revenue: 80.0,     // EGR = 130.0% (Loss)
    status: 'ACTIVE',
  },

  // =========================================================================
  // 13. SOHO CHATEAUBRIAND (GB) - Liam O'Connor
  // Seed: chateaubriand soho steakhouse offer (EXACT, PHRASE, BROAD)
  // =========================================================================
  {
    id: 'kw-gb-sh-1-exact',
    dealPermalink: 'soho-steakhouse-chateaubriand',
    keyword: 'chateaubriand soho steakhouse offer',
    matchType: 'EXACT',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-09',
    searchVolume: 1800,
    avgCpc: 1.25,
    clicks: 210,
    impressions: 3700,
    conversions: 15,
    cost: 262.5,
    revenue: 440.0,    // EGR = 59.7%
    status: 'ACTIVE',
  },
  {
    id: 'kw-gb-sh-1-phrase',
    dealPermalink: 'soho-steakhouse-chateaubriand',
    keyword: 'chateaubriand soho steakhouse offer',
    matchType: 'PHRASE',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-09',
    searchVolume: 2900,
    avgCpc: 1.40,
    clicks: 140,
    impressions: 4100,
    conversions: 8,
    cost: 196.0,
    revenue: 250.0,    // EGR = 78.4%
    status: 'ACTIVE',
  },
  {
    id: 'kw-gb-sh-1-broad',
    dealPermalink: 'soho-steakhouse-chateaubriand',
    keyword: 'chateaubriand soho steakhouse offer',
    matchType: 'BROAD',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-09',
    searchVolume: 4200,
    avgCpc: 1.70,
    clicks: 80,
    impressions: 3600,
    conversions: 3,
    cost: 136.0,
    revenue: 120.0,    // EGR = 113.3% (Loss)
    status: 'ACTIVE',
  },

  // =========================================================================
  // 14. EDINBURGH GHOST TOUR (GB) - Liam O'Connor
  // Seed: edinburgh underground vaults ghost tour (EXACT, PHRASE, BROAD) -> Overall Loss
  // =========================================================================
  {
    id: 'kw-gb-ed-1-exact',
    dealPermalink: 'edinburgh-castle-vaults-ghost-tour',
    keyword: 'edinburgh underground vaults ghost tour',
    matchType: 'EXACT',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-12',
    searchVolume: 2100,
    avgCpc: 1.15,
    clicks: 170,
    impressions: 3200,
    conversions: 9,
    cost: 195.5,
    revenue: 200.0,    // EGR = 97.8%
    status: 'ACTIVE',
  },
  {
    id: 'kw-gb-ed-1-phrase',
    dealPermalink: 'edinburgh-castle-vaults-ghost-tour',
    keyword: 'edinburgh underground vaults ghost tour',
    matchType: 'PHRASE',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-12',
    searchVolume: 3200,
    avgCpc: 1.30,
    clicks: 130,
    impressions: 3900,
    conversions: 5,
    cost: 169.0,
    revenue: 130.0,    // EGR = 130.0% (Loss)
    status: 'ACTIVE',
  },
  {
    id: 'kw-gb-ed-1-broad',
    dealPermalink: 'edinburgh-castle-vaults-ghost-tour',
    keyword: 'edinburgh underground vaults ghost tour',
    matchType: 'BROAD',
    addedByUserId: 'user-liam',
    addedDate: '2026-10-12',
    searchVolume: 4600,
    avgCpc: 1.55,
    clicks: 70,
    impressions: 3400,
    conversions: 1,
    cost: 108.5,
    revenue: 60.0,     // EGR = 180.8% (Loss)
    status: 'ACTIVE',
  },

  // =========================================================================
  // 15. LE BISTROT GOURMET PARIS (FR) - Marc Dubois
  // Seed 1: menu degustation saint germain des pres (EXACT, PHRASE, BROAD)
  // Seed 2: bistrot gastronomique paris 6 reductions (EXACT, PHRASE, BROAD)
  // =========================================================================
  {
    id: 'kw-fr-1-exact',
    dealPermalink: 'le-bistrot-gourmet-saint-germain',
    keyword: 'menu degustation saint germain des pres',
    matchType: 'EXACT',
    addedByUserId: 'user-marc',
    addedDate: '2026-10-06',
    searchVolume: 1700,
    avgCpc: 1.10,
    clicks: 190,
    impressions: 3400,
    conversions: 14,
    cost: 209.0,
    revenue: 350.0,    // EGR = 59.7%
    status: 'ACTIVE',
  },
  {
    id: 'kw-fr-1-phrase',
    dealPermalink: 'le-bistrot-gourmet-saint-germain',
    keyword: 'menu degustation saint germain des pres',
    matchType: 'PHRASE',
    addedByUserId: 'user-marc',
    addedDate: '2026-10-06',
    searchVolume: 2600,
    avgCpc: 1.25,
    clicks: 140,
    impressions: 3900,
    conversions: 7,
    cost: 175.0,
    revenue: 220.0,    // EGR = 79.5%
    status: 'ACTIVE',
  },
  {
    id: 'kw-fr-1-broad',
    dealPermalink: 'le-bistrot-gourmet-saint-germain',
    keyword: 'menu degustation saint germain des pres',
    matchType: 'BROAD',
    addedByUserId: 'user-marc',
    addedDate: '2026-10-06',
    searchVolume: 3800,
    avgCpc: 1.50,
    clicks: 75,
    impressions: 3300,
    conversions: 2,
    cost: 112.5,
    revenue: 90.0,     // EGR = 125.0% (Loss)
    status: 'ACTIVE',
  },
  {
    id: 'kw-fr-2-exact',
    dealPermalink: 'le-bistrot-gourmet-saint-germain',
    keyword: 'bistrot gastronomique paris 6 reductions',
    matchType: 'EXACT',
    addedByUserId: 'user-marc',
    addedDate: '2026-10-11',
    searchVolume: 1100,
    avgCpc: 1.25,
    clicks: 125,
    impressions: 2400,
    conversions: 7,
    cost: 156.25,
    revenue: 210.0,    // EGR = 74.4%
    status: 'ACTIVE',
  },
  {
    id: 'kw-fr-2-phrase',
    dealPermalink: 'le-bistrot-gourmet-saint-germain',
    keyword: 'bistrot gastronomique paris 6 reductions',
    matchType: 'PHRASE',
    addedByUserId: 'user-marc',
    addedDate: '2026-10-11',
    searchVolume: 1700,
    avgCpc: 1.40,
    clicks: 100,
    impressions: 2800,
    conversions: 4,
    cost: 140.0,
    revenue: 150.0,    // EGR = 93.3%
    status: 'ACTIVE',
  },
  {
    id: 'kw-fr-2-broad',
    dealPermalink: 'le-bistrot-gourmet-saint-germain',
    keyword: 'bistrot gastronomique paris 6 reductions',
    matchType: 'BROAD',
    addedByUserId: 'user-marc',
    addedDate: '2026-10-11',
    searchVolume: 2700,
    avgCpc: 1.65,
    clicks: 65,
    impressions: 2700,
    conversions: 1,
    cost: 107.25,
    revenue: 80.0,     // EGR = 134.1% (Loss)
    status: 'ACTIVE',
  },

  // =========================================================================
  // 16. CROISIÈRE SAÔNE LYON (FR) - Marc Dubois
  // Seed: croisiere dejeuner lyon saone promo (EXACT, PHRASE, BROAD)
  // =========================================================================
  {
    id: 'kw-fr-ly-1-exact',
    dealPermalink: 'croisiere-saone-dejeuner',
    keyword: 'croisiere dejeuner lyon saone promo',
    matchType: 'EXACT',
    addedByUserId: 'user-marc',
    addedDate: '2026-10-09',
    searchVolume: 1900,
    avgCpc: 1.05,
    clicks: 220,
    impressions: 3900,
    conversions: 16,
    cost: 231.0,
    revenue: 400.0,    // EGR = 57.8%
    status: 'ACTIVE',
  },
  {
    id: 'kw-fr-ly-1-phrase',
    dealPermalink: 'croisiere-saone-dejeuner',
    keyword: 'croisiere dejeuner lyon saone promo',
    matchType: 'PHRASE',
    addedByUserId: 'user-marc',
    addedDate: '2026-10-09',
    searchVolume: 2900,
    avgCpc: 1.20,
    clicks: 155,
    impressions: 4300,
    conversions: 8,
    cost: 186.0,
    revenue: 240.0,    // EGR = 77.5%
    status: 'ACTIVE',
  },
  {
    id: 'kw-fr-ly-1-broad',
    dealPermalink: 'croisiere-saone-dejeuner',
    keyword: 'croisiere dejeuner lyon saone promo',
    matchType: 'BROAD',
    addedByUserId: 'user-marc',
    addedDate: '2026-10-09',
    searchVolume: 4100,
    avgCpc: 1.45,
    clicks: 85,
    impressions: 3700,
    conversions: 3,
    cost: 123.25,
    revenue: 110.0,    // EGR = 112.0% (Loss)
    status: 'ACTIVE',
  },

  // =========================================================================
  // 17. BALNÉO SPA CHAMPS-ÉLYSÉES (FR) - Marc Dubois
  // Seed: hammam privatif paris 8 champs elysees (EXACT, PHRASE, BROAD) -> Overall Loss
  // =========================================================================
  {
    id: 'kw-fr-sp-1-exact',
    dealPermalink: 'spa-balneo-champs-elysees',
    keyword: 'hammam privatif paris 8 champs elysees',
    matchType: 'EXACT',
    addedByUserId: 'user-marc',
    addedDate: '2026-10-11',
    searchVolume: 2100,
    avgCpc: 1.35,
    clicks: 180,
    impressions: 3600,
    conversions: 9,
    cost: 243.0,
    revenue: 280.0,    // EGR = 86.8%
    status: 'ACTIVE',
  },
  {
    id: 'kw-fr-sp-1-phrase',
    dealPermalink: 'spa-balneo-champs-elysees',
    keyword: 'hammam privatif paris 8 champs elysees',
    matchType: 'PHRASE',
    addedByUserId: 'user-marc',
    addedDate: '2026-10-11',
    searchVolume: 3200,
    avgCpc: 1.55,
    clicks: 140,
    impressions: 4400,
    conversions: 5,
    cost: 217.0,
    revenue: 180.0,    // EGR = 120.6% (Loss)
    status: 'ACTIVE',
  },
  {
    id: 'kw-fr-sp-1-broad',
    dealPermalink: 'spa-balneo-champs-elysees',
    keyword: 'hammam privatif paris 8 champs elysees',
    matchType: 'BROAD',
    addedByUserId: 'user-marc',
    addedDate: '2026-10-11',
    searchVolume: 4500,
    avgCpc: 1.80,
    clicks: 80,
    impressions: 3900,
    conversions: 2,
    cost: 144.0,
    revenue: 90.0,     // EGR = 160.0% (Loss)
    status: 'ACTIVE',
  },

  // =========================================================================
  // 18. MACARONS MARAIS (FR) - Marc Dubois
  // Seed: atelier patisserie macarons paris marais (EXACT, PHRASE, BROAD)
  // =========================================================================
  {
    id: 'kw-fr-mc-1-exact',
    dealPermalink: 'cours-patisserie-macarons-marais',
    keyword: 'atelier patisserie macarons paris marais',
    matchType: 'EXACT',
    addedByUserId: 'user-marc',
    addedDate: '2026-10-13',
    searchVolume: 1800,
    avgCpc: 1.15,
    clicks: 190,
    impressions: 3700,
    conversions: 12,
    cost: 218.5,
    revenue: 300.0,    // EGR = 72.8%
    status: 'ACTIVE',
  },
  {
    id: 'kw-fr-mc-1-phrase',
    dealPermalink: 'cours-patisserie-macarons-marais',
    keyword: 'atelier patisserie macarons paris marais',
    matchType: 'PHRASE',
    addedByUserId: 'user-marc',
    addedDate: '2026-10-13',
    searchVolume: 2700,
    avgCpc: 1.30,
    clicks: 135,
    impressions: 4100,
    conversions: 6,
    cost: 175.5,
    revenue: 180.0,    // EGR = 97.5%
    status: 'ACTIVE',
  },
  {
    id: 'kw-fr-mc-1-broad',
    dealPermalink: 'cours-patisserie-macarons-marais',
    keyword: 'atelier patisserie macarons paris marais',
    matchType: 'BROAD',
    addedByUserId: 'user-marc',
    addedDate: '2026-10-13',
    searchVolume: 3900,
    avgCpc: 1.55,
    clicks: 75,
    impressions: 3400,
    conversions: 2,
    cost: 116.25,
    revenue: 80.0,     // EGR = 145.3% (Loss)
    status: 'ACTIVE',
  },

  // =========================================================================
  // 19. KARTING BERLIN (DE) - Sophie Weber (RED / UNPROFITABLE)
  // Seed 1: gokart berlin spandau gutschein (EXACT, PHRASE, BROAD)
  // Seed 2: indoor kartbahn renntraining angebote (EXACT, PHRASE, BROAD)
  // =========================================================================
  {
    id: 'kw-de-1-exact',
    dealPermalink: 'karting-speedway-berlin',
    keyword: 'gokart berlin spandau gutschein',
    matchType: 'EXACT',
    addedByUserId: 'user-sophie',
    addedDate: '2026-10-05',
    searchVolume: 2200,
    avgCpc: 1.10,
    clicks: 220,
    impressions: 4100,
    conversions: 14,
    cost: 242.0,
    revenue: 280.0,    // EGR = 86.4%
    status: 'ACTIVE',
  },
  {
    id: 'kw-de-1-phrase',
    dealPermalink: 'karting-speedway-berlin',
    keyword: 'gokart berlin spandau gutschein',
    matchType: 'PHRASE',
    addedByUserId: 'user-sophie',
    addedDate: '2026-10-05',
    searchVolume: 3400,
    avgCpc: 1.25,
    clicks: 160,
    impressions: 4800,
    conversions: 7,
    cost: 200.0,
    revenue: 180.0,    // EGR = 111.1% (Loss)
    status: 'ACTIVE',
  },
  {
    id: 'kw-de-1-broad',
    dealPermalink: 'karting-speedway-berlin',
    keyword: 'gokart berlin spandau gutschein',
    matchType: 'BROAD',
    addedByUserId: 'user-sophie',
    addedDate: '2026-10-05',
    searchVolume: 4600,
    avgCpc: 1.50,
    clicks: 95,
    impressions: 4300,
    conversions: 2,
    cost: 142.5,
    revenue: 90.0,     // EGR = 158.3% (Loss)
    status: 'ACTIVE',
  },
  {
    id: 'kw-de-2-exact',
    dealPermalink: 'karting-speedway-berlin',
    keyword: 'indoor kartbahn renntraining angebote',
    matchType: 'EXACT',
    addedByUserId: 'user-sophie',
    addedDate: '2026-10-11',
    searchVolume: 1200,
    avgCpc: 1.25,
    clicks: 130,
    impressions: 2600,
    conversions: 5,
    cost: 162.5,
    revenue: 110.0,    // EGR = 147.7% (Loss)
    status: 'ACTIVE',
  },
  {
    id: 'kw-de-2-phrase',
    dealPermalink: 'karting-speedway-berlin',
    keyword: 'indoor kartbahn renntraining angebote',
    matchType: 'PHRASE',
    addedByUserId: 'user-sophie',
    addedDate: '2026-10-11',
    searchVolume: 1900,
    avgCpc: 1.40,
    clicks: 105,
    impressions: 3100,
    conversions: 3,
    cost: 147.0,
    revenue: 85.0,     // EGR = 172.9% (Loss)
    status: 'ACTIVE',
  },
  {
    id: 'kw-de-2-broad',
    dealPermalink: 'karting-speedway-berlin',
    keyword: 'indoor kartbahn renntraining angebote',
    matchType: 'BROAD',
    addedByUserId: 'user-sophie',
    addedDate: '2026-10-11',
    searchVolume: 2900,
    avgCpc: 1.65,
    clicks: 65,
    impressions: 2800,
    conversions: 1,
    cost: 107.25,
    revenue: 55.0,     // EGR = 195.0% (Loss)
    status: 'ACTIVE',
  },

  // =========================================================================
  // 20. BAVARIAN BEER HALL MÜNCHEN (DE) - Sophie Weber (EFFICIENT: ~86% EGR)
  // Seed: brauhaus munchen menue angebot (EXACT, PHRASE, BROAD)
  // =========================================================================
  {
    id: 'kw-de-mu-1-exact',
    dealPermalink: 'bavarian-beer-hall-tasting-munchen',
    keyword: 'brauhaus munchen menue angebot',
    matchType: 'EXACT',
    addedByUserId: 'user-sophie',
    addedDate: '2026-10-08',
    searchVolume: 1800,
    avgCpc: 1.10,
    clicks: 210,
    impressions: 3900,
    conversions: 14,
    cost: 231.0,
    revenue: 330.0,    // EGR = 70.0% (Good)
    status: 'ACTIVE',
  },
  {
    id: 'kw-de-mu-1-phrase',
    dealPermalink: 'bavarian-beer-hall-tasting-munchen',
    keyword: 'brauhaus munchen menue angebot',
    matchType: 'PHRASE',
    addedByUserId: 'user-sophie',
    addedDate: '2026-10-08',
    searchVolume: 2800,
    avgCpc: 1.25,
    clicks: 145,
    impressions: 4200,
    conversions: 8,
    cost: 181.25,
    revenue: 210.0,    // EGR = 86.3% (Good)
    status: 'ACTIVE',
  },
  {
    id: 'kw-de-mu-1-broad',
    dealPermalink: 'bavarian-beer-hall-tasting-munchen',
    keyword: 'brauhaus munchen menue angebot',
    matchType: 'BROAD',
    addedByUserId: 'user-sophie',
    addedDate: '2026-10-08',
    searchVolume: 3900,
    avgCpc: 1.50,
    clicks: 75,
    impressions: 3200,
    conversions: 2,
    cost: 112.5,
    revenue: 70.0,     // EGR = 160.7% (Loss)
    status: 'ACTIVE',
  },

  // =========================================================================
  // 21. VABALI SPA HAMBURG (DE) - Sophie Weber (RED / UNPROFITABLE)
  // Seed: vabali hamburg saunadorf tageskarte (EXACT, PHRASE, BROAD)
  // =========================================================================
  {
    id: 'kw-de-va-1-exact',
    dealPermalink: 'vabali-spa-day-pass-hamburg',
    keyword: 'vabali hamburg saunadorf tageskarte',
    matchType: 'EXACT',
    addedByUserId: 'user-sophie',
    addedDate: '2026-10-09',
    searchVolume: 1900,
    avgCpc: 1.25,
    clicks: 180,
    impressions: 3600,
    conversions: 8,
    cost: 225.0,
    revenue: 220.0,    // EGR = 102.3% (Loss)
    status: 'ACTIVE',
  },
  {
    id: 'kw-de-va-1-phrase',
    dealPermalink: 'vabali-spa-day-pass-hamburg',
    keyword: 'vabali hamburg saunadorf tageskarte',
    matchType: 'PHRASE',
    addedByUserId: 'user-sophie',
    addedDate: '2026-10-09',
    searchVolume: 3100,
    avgCpc: 1.40,
    clicks: 130,
    impressions: 4100,
    conversions: 4,
    cost: 182.0,
    revenue: 150.0,    // EGR = 121.3% (Loss)
    status: 'ACTIVE',
  },
  {
    id: 'kw-de-va-1-broad',
    dealPermalink: 'vabali-spa-day-pass-hamburg',
    keyword: 'vabali hamburg saunadorf tageskarte',
    matchType: 'BROAD',
    addedByUserId: 'user-sophie',
    addedDate: '2026-10-09',
    searchVolume: 4400,
    avgCpc: 1.65,
    clicks: 75,
    impressions: 3400,
    conversions: 1,
    cost: 123.75,
    revenue: 70.0,     // EGR = 176.8% (Loss)
    status: 'ACTIVE',
  },

  // =========================================================================
  // 22. HAMMAM MADRID (ES) - Carlos Mendez (RED / UNPROFITABLE)
  // Seed 1: hammam madrid ofertas banos arabes (EXACT, PHRASE, BROAD)
  // Seed 2: circuito termal madrid pareja descuento (EXACT, PHRASE, BROAD)
  // =========================================================================
  {
    id: 'kw-es-1-exact',
    dealPermalink: 'hammam-al-andalus-banos-arabes',
    keyword: 'hammam madrid ofertas banos arabes',
    matchType: 'EXACT',
    addedByUserId: 'user-carlos',
    addedDate: '2026-10-07',
    searchVolume: 2100,
    avgCpc: 1.05,
    clicks: 250,
    impressions: 4300,
    conversions: 13,
    cost: 262.5,
    revenue: 255.0,    // EGR = 102.9% (Loss)
    status: 'ACTIVE',
  },
  {
    id: 'kw-es-1-phrase',
    dealPermalink: 'hammam-al-andalus-banos-arabes',
    keyword: 'hammam madrid ofertas banos arabes',
    matchType: 'PHRASE',
    addedByUserId: 'user-carlos',
    addedDate: '2026-10-07',
    searchVolume: 3100,
    avgCpc: 1.20,
    clicks: 160,
    impressions: 4800,
    conversions: 6,
    cost: 192.0,
    revenue: 150.0,    // EGR = 128.0% (Loss)
    status: 'ACTIVE',
  },
  {
    id: 'kw-es-1-broad',
    dealPermalink: 'hammam-al-andalus-banos-arabes',
    keyword: 'hammam madrid ofertas banos arabes',
    matchType: 'BROAD',
    addedByUserId: 'user-carlos',
    addedDate: '2026-10-07',
    searchVolume: 4600,
    avgCpc: 1.45,
    clicks: 95,
    impressions: 4100,
    conversions: 2,
    cost: 137.75,
    revenue: 80.0,     // EGR = 172.2% (Loss)
    status: 'ACTIVE',
  },
  {
    id: 'kw-es-2-exact',
    dealPermalink: 'hammam-al-andalus-banos-arabes',
    keyword: 'circuito termal madrid pareja descuento',
    matchType: 'EXACT',
    addedByUserId: 'user-carlos',
    addedDate: '2026-10-12',
    searchVolume: 900,
    avgCpc: 1.20,
    clicks: 130,
    impressions: 2400,
    conversions: 6,
    cost: 156.0,
    revenue: 140.0,    // EGR = 111.4% (Loss)
    status: 'ACTIVE',
  },
  {
    id: 'kw-es-2-phrase',
    dealPermalink: 'hammam-al-andalus-banos-arabes',
    keyword: 'circuito termal madrid pareja descuento',
    matchType: 'PHRASE',
    addedByUserId: 'user-carlos',
    addedDate: '2026-10-12',
    searchVolume: 1400,
    avgCpc: 1.35,
    clicks: 95,
    impressions: 2900,
    conversions: 3,
    cost: 128.25,
    revenue: 90.0,     // EGR = 142.5% (Loss)
    status: 'ACTIVE',
  },
  {
    id: 'kw-es-2-broad',
    dealPermalink: 'hammam-al-andalus-banos-arabes',
    keyword: 'circuito termal madrid pareja descuento',
    matchType: 'BROAD',
    addedByUserId: 'user-carlos',
    addedDate: '2026-10-12',
    searchVolume: 2200,
    avgCpc: 1.60,
    clicks: 55,
    impressions: 2400,
    conversions: 1,
    cost: 88.0,
    revenue: 45.0,     // EGR = 195.6% (Loss)
    status: 'ACTIVE',
  },

  // =========================================================================
  // 23. TAPAS TOUR BARCELONA (ES) - Carlos Mendez (EFFICIENT: ~86% EGR)
  // Seed: tapas tour barcelona barrio gotico (EXACT, PHRASE, BROAD)
  // =========================================================================
  {
    id: 'kw-es-ba-1-exact',
    dealPermalink: 'tapas-gourmet-tour-barrio-gotico',
    keyword: 'tapas tour barcelona barrio gotico',
    matchType: 'EXACT',
    addedByUserId: 'user-carlos',
    addedDate: '2026-10-09',
    searchVolume: 2200,
    avgCpc: 1.10,
    clicks: 230,
    impressions: 4400,
    conversions: 16,
    cost: 253.0,
    revenue: 375.0,    // EGR = 67.5% (Good)
    status: 'ACTIVE',
  },
  {
    id: 'kw-es-ba-1-phrase',
    dealPermalink: 'tapas-gourmet-tour-barrio-gotico',
    keyword: 'tapas tour barcelona barrio gotico',
    matchType: 'PHRASE',
    addedByUserId: 'user-carlos',
    addedDate: '2026-10-09',
    searchVolume: 3400,
    avgCpc: 1.25,
    clicks: 160,
    impressions: 4800,
    conversions: 9,
    cost: 200.0,
    revenue: 240.0,    // EGR = 83.3% (Good)
    status: 'ACTIVE',
  },
  {
    id: 'kw-es-ba-1-broad',
    dealPermalink: 'tapas-gourmet-tour-barrio-gotico',
    keyword: 'tapas tour barcelona barrio gotico',
    matchType: 'BROAD',
    addedByUserId: 'user-carlos',
    addedDate: '2026-10-09',
    searchVolume: 4900,
    avgCpc: 1.50,
    clicks: 95,
    impressions: 4100,
    conversions: 2,
    cost: 142.5,
    revenue: 75.0,     // EGR = 190.0% (Loss)
    status: 'ACTIVE',
  },

  // =========================================================================
  // 24. FLAMENCO SHOW SEVILLA (ES) - Carlos Mendez (RED / UNPROFITABLE)
  // Seed: tablao flamenco triana sevilla entradas (EXACT, PHRASE, BROAD)
  // =========================================================================
  {
    id: 'kw-es-fl-1-exact',
    dealPermalink: 'flamenco-show-cena-triana',
    keyword: 'tablao flamenco triana sevilla entradas',
    matchType: 'EXACT',
    addedByUserId: 'user-carlos',
    addedDate: '2026-10-11',
    searchVolume: 1900,
    avgCpc: 1.10,
    clicks: 190,
    impressions: 3700,
    conversions: 9,
    cost: 209.0,
    revenue: 180.0,    // EGR = 116.1% (Loss)
    status: 'ACTIVE',
  },
  {
    id: 'kw-es-fl-1-phrase',
    dealPermalink: 'flamenco-show-cena-triana',
    keyword: 'tablao flamenco triana sevilla entradas',
    matchType: 'PHRASE',
    addedByUserId: 'user-carlos',
    addedDate: '2026-10-11',
    searchVolume: 2900,
    avgCpc: 1.25,
    clicks: 140,
    impressions: 4100,
    conversions: 5,
    cost: 175.0,
    revenue: 130.0,    // EGR = 134.6% (Loss)
    status: 'ACTIVE',
  },
  {
    id: 'kw-es-fl-1-broad',
    dealPermalink: 'flamenco-show-cena-triana',
    keyword: 'tablao flamenco triana sevilla entradas',
    matchType: 'BROAD',
    addedByUserId: 'user-carlos',
    addedDate: '2026-10-11',
    searchVolume: 4200,
    avgCpc: 1.50,
    clicks: 75,
    impressions: 3600,
    conversions: 1,
    cost: 112.5,
    revenue: 55.0,     // EGR = 204.5% (Loss)
    status: 'ACTIVE',
  },
];

export const INITIAL_BATCHES: KeywordBatchSubmission[] = [
  {
    id: 'batch-2026-11-08-01',
    userId: 'user-elena',
    dealPermalink: 'qc-terme-spa-wellness',
    country: 'IT',
    timestamp: '2026-11-08 17:42:15',
    rawKeywords: [
      'qc terme milano sconti',
      'just eat milano',
      'spa porta romana milano offerta',
      'super cheap free rolls',
    ],
    syncedToGoogleAds: true,
    emailSentAt: '2026-11-09 06:00:12',
    results: [
      {
        keyword: 'qc terme milano sconti',
        matchType: 'EXACT',
        status: 'ACCEPTED',
        searchVolume: 2800,
        avgCpc: 0.88,
      },
      {
        keyword: 'qc terme milano sconti',
        matchType: 'PHRASE',
        status: 'ACCEPTED',
        searchVolume: 4200,
        avgCpc: 0.98,
      },
      {
        keyword: 'qc terme milano sconti',
        matchType: 'BROAD',
        status: 'ACCEPTED',
        searchVolume: 5600,
        avgCpc: 1.15,
      },
      {
        keyword: 'just eat milano',
        matchType: 'EXACT',
        status: 'REJECTED',
        reason: 'COPYRIGHT_DENYLIST',
      },
      {
        keyword: 'just eat milano',
        matchType: 'PHRASE',
        status: 'REJECTED',
        reason: 'COPYRIGHT_DENYLIST',
      },
      {
        keyword: 'just eat milano',
        matchType: 'BROAD',
        status: 'REJECTED',
        reason: 'COPYRIGHT_DENYLIST',
      },
      {
        keyword: 'spa porta romana milano offerta',
        matchType: 'EXACT',
        status: 'ACCEPTED',
        searchVolume: 1100,
        avgCpc: 1.05,
      },
      {
        keyword: 'spa porta romana milano offerta',
        matchType: 'PHRASE',
        status: 'ACCEPTED',
        searchVolume: 1600,
        avgCpc: 1.18,
      },
      {
        keyword: 'spa porta romana milano offerta',
        matchType: 'BROAD',
        status: 'ACCEPTED',
        searchVolume: 2400,
        avgCpc: 1.35,
      },
      {
        keyword: 'super cheap free rolls',
        matchType: 'EXACT',
        status: 'REJECTED',
        reason: 'LOW_SEARCH_VOLUME_GOOGLE_ADS',
        searchVolume: 10,
      },
      {
        keyword: 'super cheap free rolls',
        matchType: 'PHRASE',
        status: 'REJECTED',
        reason: 'LOW_SEARCH_VOLUME_GOOGLE_ADS',
        searchVolume: 15,
      },
      {
        keyword: 'super cheap free rolls',
        matchType: 'BROAD',
        status: 'REJECTED',
        reason: 'LOW_SEARCH_VOLUME_GOOGLE_ADS',
        searchVolume: 20,
      },
    ],
  },
];
