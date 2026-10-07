import {ZUSAMMENGELEGT} from '~/lib/zusammenlegungen';

/**
 * `<lastmod>` der ZIELSEITEN einer Zusammenlegung.
 *
 * DER ANLASS: eine Zielseite hat am Tag der Zusammenlegung neuen Inhalt
 * bekommen (die Abschnitte der Quellseiten, mit Anker). Bei
 * /pages/technologie, /pages/studien und /pages/faq steht
 * dieser Inhalt im Repo, die Sitemap-Zeile kommt aber aus dem Shopify-
 * Seitenobjekt: `getSitemap` schreibt dessen `updatedAt`, und das bewegt sich
 * durch einen Code-Umbau nicht. Gemessen am 2026-10-07 nach dem Merge von
 * PR #815: support 2022-11-21, technologie 2022-12-12, studien 2024-11-22,
 * faq 2026-09-02. Google bekam also für genau die Seiten, die gerade
 * gewachsen waren, ein Alter von bis zu vier Jahren gemeldet.
 *
 * DAS DATUM IST DER COMMIT-ZEITPUNKT DES MERGES (UTC), also dieselbe Größe,
 * die homepage-bauer/pruefungen/probe_sitemap_lastmod_wahrhaftig.py als
 * Wahrheitsmaßstab nimmt. Es wird nur ANGEHOBEN, nie gesenkt: ist das
 * `updatedAt` oder das `lastmod` einer Nur-Route-Seite jünger, bleibt es
 * stehen. So kann eine spätere Admin-Änderung das Datum weiter vorrücken,
 * und dieser Nachtrag kann nie ein Datum zurückdrehen.
 *
 * EIN EINTRAG JE ZUSAMMENLEGUNG, NICHT EIN DATUM FÜR ALLE: eine spätere
 * Zusammenlegung bekommt eine eigene Zeile mit eigenem Datum. Ein einziges
 * Datum, das bei jeder neuen Zusammenlegung vorrückt, würde alle älteren
 * Zielseiten mit anheben, obwohl sich an ihnen nichts geändert hat.
 *
 * WELCHE ZIELE: alle `/pages/`-Ziele aus `ZUSAMMENGELEGT`, deren Quell-Adresse
 * in `quellen` steht. Zwei Ziele fehlen mit Absicht, weil sich an ihnen nichts
 * geändert hat: /pages/support-1 und /products/qione-1 gingen ohne Anker und
 * ohne übernommenen Inhalt in /pages/support bzw. /products/qione-2-pro auf
 * (PR #815 fasst weder die Support-Route noch ihre Bausteine an). Ein neues
 * Datum dort wäre ein Frischesignal ohne neuen Inhalt.
 *
 * RÜCKWEG: eine Zeile entfernen (die Seite zeigt dann wieder ihr
 * `updatedAt`), oder `hb-deploy revert --sha <merge>`.
 *
 * @type {ReadonlyArray<{am: string, beleg: string, quellen: string[]}>}
 */
export const ZUSAMMENLEGUNGS_STAENDE = Object.freeze([
  {
    am: '2026-10-07T05:48:38Z',
    beleg: 'PR #815, main 41ca15b932 (Job 20261007-seo-zusammenlegung-duenne-seiten-301-umsetzen)',
    quellen: [
      '/pages/lexikon-energie',
      '/pages/lexikon-frequenz',
      '/pages/lexikon-high-vibe',
      '/pages/lexikon-hohe-frequenz-schwingen',
      '/pages/lexikon-low-vibe',
      '/pages/lexikon-ordnung',
      '/pages/lexikon-spirituell-angebunden-sein',
      '/pages/lexikon-kohaerentes-wasser',
      '/pages/was-senkt-elektrosmog-im-alltag',
      '/pages/gibt-es-studien-zu-elektrosmog-schutz',
      '/pages/wie-funktioniert-schutz-vor-elektrosmog',
      '/pages/wie-weit-reicht-elektrosmog-schutz',
      '/pages/armband-duschen-sauna',
    ],
  },
]);

/**
 * Zielseite (Pfad) -> jüngstes Zusammenlegungs-Datum.
 *
 * Gelesen wird das Ziel aus `ZUSAMMENGELEGT`, nie hier abgeschrieben: zeigt
 * eine Quelle dort auf ein anderes Ziel, wandert das Datum mit. Eine Quelle,
 * die dort fehlt (Eintrag zurückgenommen), trägt kein Datum mehr bei.
 *
 * @returns {Map<string, string>}
 */
export function zielLastmod() {
  const karte = new Map();
  for (const stand of ZUSAMMENLEGUNGS_STAENDE) {
    for (const quelle of stand.quellen) {
      const ziel = ZUSAMMENGELEGT[quelle]?.ziel;
      if (!ziel || !ziel.startsWith('/pages/')) continue;
      const bisher = karte.get(ziel);
      if (!bisher || Date.parse(stand.am) > Date.parse(bisher)) {
        karte.set(ziel, stand.am);
      }
    }
  }
  return karte;
}

/**
 * Hebt in einer `pages`-Sitemap das `<lastmod>` der Zielseiten an.
 *
 * Verankert auf `<pfad></loc>` (wie der Versteckt-Filter der Kind-Route),
 * damit ein Handle nicht seinen längeren Namensvetter mittrifft. Fehlt einem
 * Eintrag das `<lastmod>`, wird es direkt hinter `</loc>` eingesetzt.
 *
 * @param {string} body Sitemap-XML
 * @returns {string}
 */
export function mitZusammenlegungsLastmod(body) {
  const karte = zielLastmod();
  if (!karte.size) return body;
  return body.replace(/<url>[\s\S]*?<\/url>/g, (eintrag) => {
    const loc = eintrag.match(/<loc>[^<]*?(\/pages\/[^<]+)<\/loc>/);
    const datum = loc && karte.get(loc[1]);
    if (!datum) return eintrag;
    const alt = eintrag.match(/<lastmod>([^<]*)<\/lastmod>/);
    if (alt) {
      const altZahl = Date.parse(alt[1]);
      if (!Number.isNaN(altZahl) && altZahl >= Date.parse(datum)) {
        return eintrag;
      }
      return eintrag.replace(alt[0], `<lastmod>${datum}</lastmod>`);
    }
    return eintrag.replace(
      '</loc>',
      `</loc>\n  <lastmod>${datum}</lastmod>`,
    );
  });
}
