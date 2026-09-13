/**
 * Handles, deren /pages-URL nur noch WEITERLEITET — und die deshalb in keiner
 * Sitemap stehen dürfen.
 *
 * WARUM DAS EIN DEFEKT IST: die Sitemap sagt „das ist die kanonische URL",
 * die Antwort sagt „nein, eine andere". Der Widerspruch kostet Crawl-Budget
 * und sendet ein gegenläufiges Signal. Gemessen am 2026-09-13 traf das genau
 * zwei der 44 ausgelieferten `sitemap/pages/1.xml`-URLs.
 *
 * WARUM NICHT IN `NICHT_INDEXIERBARE_SEITEN_DEF` (~/lib/seo) — der Fix-Ort,
 * den der Auftrag nannte, und er ist der falsche:
 *
 *  1. FACHLICH. Jene Liste führt Seiten, die ein `noindex` bekommen, und
 *     `AUS_SITEMAP_ENTFERNTE_SEITEN` ist ausdrücklich ihre TEILMENGE („aus der
 *     Sitemap fliegt nur, was ohnehin schon noindex trägt — nie umgekehrt",
 *     durchgesetzt von test/seo-canonical.test.mjs). Eine 301-Antwort hat
 *     keinen Rumpf und kann gar kein `noindex` tragen; ein Eintrag dort wäre
 *     eine Aussage, die nicht stimmt, und machte die Invariante kaputt.
 *  2. FOLGEN AM AUFNAHME-KRITERIUM. Jene Liste ist für Seiten „ohne Zweck für
 *     Kunden". Diese beiden URLs haben einen Zweck: sie halten alte Links und
 *     Lesezeichen am Leben. Sie sind keine Restseiten, sie sind Wegweiser.
 *  3. REICHWEITE. `~/lib/seo` wird von rund 36 Routen importiert. hb-deploy
 *     Gate 12 löst eine geänderte geteilte Datei über die Import-Closure auf
 *     und verlangt für JEDE damit erreichte Seite einen Formate-Nachweis —
 *     eine Zeile hier zöge den halben Seitenbestand in die Prüfmenge. Dieselbe
 *     Begründung steht wörtlich im Kopf von ~/lib/seiten-seo.js.
 *
 * DIE BAUFORM IST NICHT NEU, SIE IST DIE DES NACHBARN: `leereBlogHandles` in
 * ~/lib/sitemap-bestand beantwortet exakt dieselbe Frage für Blogs, und die
 * Sitemap-Route begründet dort auch schon, warum Weiterleitungen eine EIGENE
 * Klasse neben `noindex` sind: „Die Übergangsstufe von `pages` gilt hier
 * ausdrücklich NICHT: sie existiert, weil Google eine Seite CRAWLEN muss, um
 * ihr `noindex` überhaupt zu lesen. Einen 301 sieht Google bei jedem Crawl der
 * URL, ob sie in der Sitemap steht oder nicht." Genau deshalb gibt es hier
 * auch keine Übergangsstufe: Entfernen ist sofort richtig.
 *
 * WARUM DIE LISTE GETIPPT IST UND NICHT GEMESSEN: die Wahrheit stünde in den
 * Routendateien (`pages.<handle>.jsx`, deren Loader nur einen `redirect` wirft).
 * Die Sitemap-Route läuft im Oxygen-Worker und kann kein Dateisystem lesen; ein
 * Build-Zeit-Glob über Routenquellen wäre eine Textanalyse mit eigener
 * Fehlerklasse. Der Schutz gegen eine veraltete Liste liegt deshalb NICHT hier,
 * sondern in einer Probe am Rand, die die AUSGELIEFERTE Sitemap Zeile für Zeile
 * abruft: pruefungen/probe_sitemap_ohne_weiterleitung.py. Sie kennt diese Datei
 * nicht und wird rot, sobald irgendeine Sitemap-URL weiterleitet — auch bei
 * einem Typ, an den hier niemand gedacht hat.
 *
 * NICHT AUFGENOMMEN, WEIL HEUTE OHNE GEGENSTAND (gemessen 2026-09-13): vier
 * weitere `pages.*`-Routen leiten ebenfalls nur weiter (`E-Smog-Schutz`,
 * `qione-zellschutz`, `schlaf-zellen-schutz`, `zell-schutz`). Keine von ihnen
 * hat ein Shopify-Seitenobjekt, keine steht in einer Sitemap — ein Eintrag wäre
 * eine Sperre ohne Fall. Legt jemand dort eine CMS-Seite an, meldet ihn die
 * Probe oben; DANN gehört er hierher.
 *
 * @type {Array<{handle: string, ziel: string, grund: string, seit: string}>}
 */
export const WEITERGELEITETE_PAGES_DEF = [
  {
    handle: 'qihome',
    ziel: '/pages/qihome-details',
    grund:
      'IA-Zweiblock-Umbau 2026-07-17: die LP-Shopseite trägt „Air", der ' +
      'Detail-Inhalt zog auf /pages/qihome-details. Der 301 steht in ' +
      'app/routes/pages.qihome.jsx; das Shopify-Seitenobjekt blieb bestehen ' +
      'und hielt die URL dadurch in der Sitemap.',
    seit: '2026-09-13',
  },
  {
    handle: 'qione',
    ziel: '/pages/qione-2-pro-details',
    grund:
      'IA-Zweiblock-Umbau 2026-07-17: der Name „qione" traf als einziger das ' +
      'Produkt (qione-2-pro) nicht. Der 301 steht in ' +
      'app/routes/pages.qione.jsx; das Shopify-Seitenobjekt blieb bestehen ' +
      'und hielt die URL dadurch in der Sitemap.',
    seit: '2026-09-13',
  },
];

/**
 * Die Handles allein — die Form, die der Sitemap-Filter braucht.
 * @type {string[]}
 */
export const WEITERGELEITETE_PAGES_HANDLES = WEITERGELEITETE_PAGES_DEF.map(
  (e) => e.handle,
);
