/**
 * WARUM EIN EIGENES MODUL (Nachzug zu PR #876, gleicher Tag): die Liste stand
 * zuerst in ~/lib/sitemap-bestand. Dann lasen sie auch products.$handle und
 * collections.$handle, und Gate 12 (R5, src/format_reichweite.py) konnte die
 * Reichweite von sitemap-bestand.js nicht mehr auflösen: dynamische Routen
 * haben keinen Slug. Jede spätere Änderung an den Sitemap-Abfragen hätte die
 * Formate-Basis ALLER Seiten entwertet (gemessen:
 * pruefungen/probe_gate12_modul_importeur_reichweite.py, Arm L1 BRUCH).
 * Hier steht nur die Liste. sitemap-bestand.js bleibt bei den Sitemap-Routen.
 */
/**
 * Vorlagen ohne eigenen Indexwert: kaufbar bzw. als Kategorie erreichbar,
 * aber weder im Index noch in der Sitemap. Zwei Namensräume in EINER Liste,
 * weil die Entscheidung je Eintrag dieselbe ist und genau ein Auftrag sie
 * trägt; das Feld `typ` hält Produkte und Kollektionen auseinander.
 *
 * ANLASS (GEO-Maßnahme M3, Job 20261010-geo-sageo-m3-index-hygiene-vorlagen-
 * hilfsseiten, Grossjob Christians vom 2026-10-10; Inventar s01 des Grossjobs,
 * e-seiteninventar.json p2/p3): die fünf Produkte tragen 21 bis 92 Wörter und
 * sind untereinander fast gleich (Jaccard 0,91 bis 0,98), die drei
 * Kollektionen führen null Produkte und 4 bis 6 Wörter. Viele Seiten ohne
 * eigenen Wert drücken die Bewertung der ganzen Website. Christian am
 * 2026-09-25: „Dünne Vorlagenseiten … zählen nicht als eigene Kandidaten."
 *
 * WARUM DAS DIE FRÜHERE EINORDNUNG ÜBERSTIMMT: an NICHT_INDEXIERBARE_PRODUKTE
 * (~/lib/seo) steht für die vier Bundles „besserer Inhalt statt
 * Unsichtbarkeit", an NICHT_INDEXIERBARE_KOLLEKTIONEN_DEF dasselbe für die
 * leeren Saison-Kollektionen. Beides waren Einordnungen der damaligen
 * Umsetzung. Der neuere Auftrag entscheidet anders, und die Aussagen dort
 * bleiben trotzdem WAHR: jene Listen führen „Handles ohne Zweck für Kunden",
 * und diese Einträge haben einen Zweck — man kann sie kaufen oder zur Saison
 * füllen. Deshalb eine eigene Klasse und kein Eintrag dort (dieselbe Bauform
 * wie IM_CRAWLER_MARKT_NICHT_ABRUFBAR_DEF in ~/lib/sitemap-bestand und
 * ~/lib/sitemap-weiterleitungen;
 * ~/lib/seo bleibt unberührt, Begründung zur Reichweite dort).
 *
 * WAS SICH NICHT ÄNDERT: Status, Kanäle, Preise und Warenkorb-Logik
 * (kakao-set-zeile, Mengenrabatt). Die Seiten antworten weiter mit 200, die
 * Kaufseiten bleiben kaufbar und in der Shop-Suche. Nur das robots-Meta
 * (products.$handle, collections.$handle) und die Sitemap lesen diese Liste.
 *
 * KEINE ÜBERGANGSSTUFE: sie existiert, damit Google ein `noindex` liest,
 * bevor der Sitemap-Eintrag verschwindet. Am 2026-10-10T06:39Z
 * (seo-manager/indexstand) war keine der acht URLs gecrawlt: fünf „URL ist
 * Google nicht bekannt", drei „Gefunden – zurzeit nicht indexiert". Aus dem
 * Index ist also nichts zu entfernen.
 *
 * KEIN canonical zusammen mit dem noindex: widersprüchliches Signal. Die
 * Route kehrt im noindex-Zweig vor dem canonical um.
 *
 * Rückweg: Eintrag entfernen (oder `hb-deploy revert --sha <merge-sha>`).
 *
 * @type {Array<{typ: 'products'|'collections', handle: string, grund: string,
 *               seit: string}>}
 */
export const VORLAGEN_OHNE_INDEXWERT_DEF = [
  {
    typ: 'products',
    handle: 'bundle-2x-awake',
    grund: 'Mengen-Vorlage der Kaufseite crystal-cacao-awake',
    seit: '2026-10-10',
  },
  {
    typ: 'products',
    handle: 'bundle-3x-awake',
    grund: 'Mengen-Vorlage der Kaufseite crystal-cacao-awake',
    seit: '2026-10-10',
  },
  {
    typ: 'products',
    handle: 'mengenrabatt-2x',
    grund: 'Mengen-Vorlage der Kaufseite crystal-cacao-create',
    seit: '2026-10-10',
  },
  {
    typ: 'products',
    handle: 'mengenrabatt-3x-create',
    grund: 'Mengen-Vorlage der Kaufseite crystal-cacao-create',
    seit: '2026-10-10',
  },
  {
    typ: 'products',
    handle: 'crystal-cacao-angebot',
    grund: 'Set Create + Awake, fast gleich mit den Mengen-Vorlagen',
    seit: '2026-10-10',
  },
  {
    typ: 'collections',
    handle: 'digitale-kurse',
    grund: 'führt null Produkte, 4 bis 6 Wörter',
    seit: '2026-10-10',
  },
  {
    typ: 'collections',
    handle: 'valentinstag-angebote',
    grund: 'Saison-Kollektion, außerhalb der Saison leer',
    seit: '2026-10-10',
  },
  {
    typ: 'collections',
    handle: 'blackfriday-sale-artikel',
    grund: 'Saison-Kollektion, außerhalb der Saison leer',
    seit: '2026-10-10',
  },
];

/**
 * Handles eines Typs aus VORLAGEN_OHNE_INDEXWERT_DEF.
 * Funktion statt abgeleiteter Konstante: beim Laden läuft nichts (Gate 12,
 * Begründung an `ausSitemapEntfernteKollektionen` in ~/lib/seo).
 * @param {'products'|'collections'} typ
 * @returns {string[]}
 */
export function vorlagenOhneIndexwert(typ) {
  return VORLAGEN_OHNE_INDEXWERT_DEF.filter((e) => e.typ === typ).map(
    (e) => e.handle,
  );
}

/**
 * Trägt dieser Handle ein `noindex`, weil er eine Vorlage ohne Indexwert ist?
 * @param {'products'|'collections'} typ
 * @param {string|undefined} handle
 * @returns {boolean}
 */
export function istVorlageOhneIndexwert(typ, handle) {
  return !!handle && vorlagenOhneIndexwert(typ).includes(handle);
}
