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
  {pfad: '/pages/qi-alpha-b', googlebot: true, rolle: 'LP B'},
  {pfad: '/products/qi-alpha-b', googlebot: true, rolle: 'Shop B'},
  {pfad: '/pages/qi-master-vorverkauf', googlebot: true, rolle: 'LP A'},
  {pfad: '/pages/qi-alpha-vorverkauf', googlebot: true, rolle: 'LP A nach Umbenennung'},
  {pfad: '/products/qi-master', googlebot: false, rolle: 'Shop A'},
  {pfad: '/products/qi-alpha', googlebot: false, rolle: 'Shop A nach Umbenennung'},
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
  return VORSCHAU_NOINDEX.some((e) => e.pfad === p);
}

/**
 * robots.txt-Zeilen für eine Gruppe. `alle: true` = KI-Gruppen (jeder
 * Listenpfad), sonst nur die Einträge mit `googlebot: true` (Gruppe `*`).
 * @param {{alle?: boolean}} [opt]
 */
export function vorschauDisallowZeilen({alle = false} = {}) {
  return VORSCHAU_NOINDEX.filter((e) => alle || e.googlebot)
    .flatMap((e) => [`Disallow: ${e.pfad}$`, `Disallow: ${e.pfad}?`])
    .join('\n');
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
