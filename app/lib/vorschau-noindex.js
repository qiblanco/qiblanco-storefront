/**
 * VORSCHAU-NOINDEX — die EINE Pfadliste der Seiten, die live erreichbar, aber
 * nicht auffindbar sind (Grossjob 20261023-GROSSJOB-qi-alpha-landingpage-
 * produktseite-finalisieren-lp-simulation, Segment s04).
 *
 * Christian am 23.10.2026 (Z8), wörtlich: „Also, dass das alles live ist, aber
 * eben nicht searchbar, nicht indiziert und nicht crawlbar und nicht für KI
 * verfügbar, bis auf weiteres."
 *
 * DIESE LISTE SPEIST VIER STELLEN, und keine davon hat eine eigene Kopie:
 *   1. X-Robots-Tag `noindex, nofollow` auf jeder Dokument-Antwort eines
 *      Listenpfads (app/entry.server.jsx);
 *   2. robots.txt (app/routes/[robots.txt].jsx): die KI-Gruppen sperren jeden
 *      Listenpfad, die Gruppe `*` nur die Pfade mit `googlebot: false`;
 *   3. der Sitemap-Filter (app/routes/sitemap.$type.$page[.xml].jsx);
 *   4. der Test test/vorschau-noindex.test.mjs.
 * Die beiden B-Routen tragen zusätzlich `<meta name="robots">` wie
 * /pages/qione-2-pro-b (Doppelgate).
 *
 * RÜCKWEG: ein Eintrag raus = die Seite ist wieder öffentlich (Header, robots
 * und Sitemap folgen im selben Deploy). Christians „let's go" ist genau das.
 *
 * WARUM /products/qi-master UND /products/qi-alpha FÜR GOOGLEBOT LESBAR
 * BLEIBEN (`googlebot: false` heißt hier: Gruppe `*` sperrt NICHT): Shop A
 * steht heute im Index. Sperrt robots.txt die Seite, holt Google sie nie
 * wieder ab und liest das frische noindex nie — die Seite bliebe als
 * Suchtreffer stehen (KONZEPT Festlegung 3; derselbe Widerspruch, den
 * ~/lib/seo.js an `ausSitemap` beschreibt). Die KI-Agenten sperrt robots.txt
 * trotzdem, Googlebot bekommt das noindex über den Header.
 *
 * JEDE robots-Zeile trägt den `$`-Anker: `Disallow: /products/qi-alpha` ohne
 * Anker träfe auch /products/qi-alpha-goldkette, -wunschnummer und -b. Mit
 * Anker trifft die Zeile genau den Pfad; eine zweite Zeile `<pfad>?` deckt
 * die Varianten-Adressen (`?Seriennummer=…`) derselben Seite.
 *
 * Beide Formen der Umbenennung Qi Master -> Qi Alpha stehen hier. Der
 * Umbenennungs-Grossjob vom 17.10.2026 lenkt die alten Pfade per 301 auf
 * die neuen.
 */
export const VORSCHAU_NOINDEX = [
  // /pages/qi-alpha-b (LP B) trifft seit dem Umzug Qi Alpha (27.10.2026) die
  // Route pages.Qi-Alpha-B.jsx (Schreibweise egal) und geht per 301 dorthin.
  {pfad: '/pages/Qi-Alpha-B', googlebot: true, rolle: 'Qi Alpha Testarm C (KI-optimiert)'},
  {pfad: '/pages/Qi-Alpha-C', googlebot: true, rolle: 'Qi Alpha Testarm B (Server)'},
  // Elinas B-Seite (EL-20261101-a930d588, EL-20261101-242cff9c), getrennt von A.
  {pfad: '/pages/Qi-Alpha-Elina', googlebot: true, rolle: 'Qi Alpha: Elinas B-Seite (getrennt von A)'},
  {pfad: '/products/qi-alpha-b', googlebot: true, rolle: 'Shop B: bisherige Kaufseite, seit 27.10.2026 hier'},
  {pfad: '/pages/qi-master-vorverkauf', googlebot: true, rolle: 'LP A'},
  {pfad: '/pages/qi-alpha-vorverkauf', googlebot: true, rolle: 'LP A nach Umbenennung'},
  {pfad: '/products/qi-master', googlebot: false, rolle: 'Shop A'},
  {pfad: '/products/qi-alpha', googlebot: false, rolle: 'Shop A (Kaufseite seit dem Umzug Qi Alpha 27.10.2026)'},
  // Umzug auf the-alpha (Christian Z4 vom 25.10.2026, Grossjob 20261025-prio1-
  // the-alpha-..., s06): die Kaufseite lebt seit 2026-10-26 hier, die beiden
  // Zeilen darüber sind 301-Hüllen. Dieselbe Rolle, dieselbe Lesbarkeit für
  // Googlebot wie Shop A.
  {pfad: '/products/the-alpha', googlebot: false, rolle: '301-Hülle auf /products/qi-alpha'},
  // B-Fassung der Kaufseite (Christian Z10 vom 25.10.2026: „die alte seite als
  // B Vraitne aufheben mit ienem link wo ich drauf zugreifen kann“; s12). Nur
  // für Christian zum Nachlesen, deshalb auch für Googlebot gesperrt wie
  // Shop B.
  {pfad: '/products/the-alpha-b', googlebot: true, rolle: '301-Hülle auf /products/qi-alpha-b'},
  // Testarme der The-Alpha-Seite (Grossjob 20261025-prio1-the-alpha-
  // landingpage-figma-vorlage-a-server-b-ki-c, s03 trägt sie VORAB ein, damit
  // s04/s05 diese gemeinsame Datei nicht anfassen). A = /pages/The-Alpha ist
  // die Hauptseite und steht NICHT hier. Die Pfade stehen in Christians
  // Schreibweise (Z6); der Vergleich in istVorschauNoindex ist Groß/Klein-frei,
  // robots.txt bekommt beide Schreibweisen (vorschauDisallowZeilen).
  {pfad: '/pages/The-Alpha-B', googlebot: true, rolle: '301-Hülle auf /pages/Qi-Alpha-B'},
  {pfad: '/pages/The-Alpha-C', googlebot: true, rolle: '301-Hülle auf /pages/Qi-Alpha-C'},
];

/** Der Kopf, den jeder Listenpfad trägt. */
export const VORSCHAU_ROBOTS_KOPF = 'noindex, nofollow';

function normiere(pfad) {
  let p = String(pfad || '').split('?')[0].split('#')[0].toLowerCase();
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

/**
 * Trägt dieser Pfad das Vorschau-noindex? Exakter Vergleich (ohne Abfrage,
 * ohne Schrägstrich am Ende): /products/qi-alpha-goldkette ist NICHT
 * /products/qi-alpha.
 * @param {string} pathname
 */
export function istVorschauNoindex(pathname) {
  const p = normiere(pathname);
  return VORSCHAU_NOINDEX.some((e) => normiere(e.pfad) === p);
}

/**
 * robots.txt-Zeilen für eine Gruppe. `alle: true` = KI-Gruppen (jeder
 * Listenpfad), sonst nur die Einträge mit `googlebot: true` (Gruppe `*`).
 * @param {{alle?: boolean}} [opt]
 */
export function vorschauDisallowZeilen({alle = false} = {}) {
  return VORSCHAU_NOINDEX.filter((e) => alle || e.googlebot)
    .flatMap((e) => schreibweisen(e.pfad))
    .flatMap((p) => [`Disallow: ${p}$`, `Disallow: ${p}?`])
    .join('\n');
}

/**
 * robots.txt vergleicht Groß/Klein genau, die Storefront nicht: ein Pfad in
 * Großschreibung (/pages/The-Alpha-B) ist auch klein erreichbar. Beide
 * Schreibweisen bekommen deshalb eine Zeile; ein klein geschriebener Pfad
 * bleibt bei genau einer.
 */
function schreibweisen(pfad) {
  const klein = pfad.toLowerCase();
  return klein === pfad ? [pfad] : [pfad, klein];
}

/**
 * Handles je Sitemap-Typ (`products`, `pages`), die aus der Sitemap fallen:
 * alle Listenpfade, auch Shop A. Google findet Shop A trotzdem wieder, denn
 * die Adresse ist bekannt und robots.txt lässt Googlebot dort lesen.
 * @param {string} typ
 */
export function vorschauSitemapHandles(typ) {
  const vorne = `/${typ}/`;
  return VORSCHAU_NOINDEX.filter((e) => e.pfad.startsWith(vorne)).map((e) =>
    e.pfad.slice(vorne.length),
  );
}
