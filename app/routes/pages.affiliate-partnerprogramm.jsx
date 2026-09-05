import {
  AffiliatePartnerprogramm,
  FRAGEN,
} from '~/components/campaign/AffiliatePartnerprogramm';
import {canonicalLink, absoluteCanonical} from '~/lib/seo';
import lpTokenStyles from '~/styles/schlaf-zellen-schutz.css?url';
import ppStyles from '~/styles/affiliate-partnerprogramm.css?url';

const PFAD = '/pages/affiliate-partnerprogramm';
const TITEL = 'Partnerprogramm: 10 % Provision auf deine Empfehlung | Qi Blanco';
const BESCHREIBUNG =
  'Empfiehl Qi Blanco weiter und erhalte 10 % Provision auf den Netto-Warenwert. ' +
  'Dazu deinen eigenen 5-%-Gutscheincode für deine Community, einen Tracking-Link ' +
  'und 30 Tage Zuordnung. Bedingungen, Ablauf und Anmeldung auf einen Blick.';

/**
 * /pages/affiliate-partnerprogramm — die EIGENE, indexierbare Antwort auf die
 * Frage „Qi Blanco Partnerprogramm" (Job 20260905-eigene-indexierbare-
 * partnerseite-statt-vendor-flaeche-prio25).
 *
 * WARUM ES DIESE SEITE GIBT. Die SEO-Maßnahme L4 ist am 2026-09-05 als
 * Option B entschieden: das `noindex` für aff.revolution.qiblanco.com wird
 * beim Vendor UpPromote als X-Robots-Tag über die GANZE Subdomain bestellt.
 * Das nimmt `/register` mit — eine öffentliche, deutschsprachige
 * Partner-Werbeseite (203 KB, gemessen 2026-09-05), die heute die einzige
 * indexierbare Antwort auf diese Frage ist. Ohne Ersatz hätte die Frage
 * danach auf KEINER von uns kontrollierten Fläche mehr eine Antwort. Diese
 * Seite ist der Ersatz; das Formular selbst bleibt beim Vendor und wird
 * ausdrücklich NICHT nachgebaut.
 *
 * ABGRENZUNG ZU /pages/partner — die häufigste Verwechslung und der Grund,
 * warum hier kein Handle mit dem Präfix `partner` steht: /pages/partner ist
 * die Landeseite für BEREITS GEWORBENE Kunden („Auf Empfehlung hier"), ist
 * absichtlich `noindex,nofollow` und bleibt es. Zwei Seiten, zwei Aufgaben.
 * Wer ihr das noindex nimmt, erzeugt genau die Eigen-Kannibalisierung
 * (Klasse C), die der seo-manager ohnehin misst.
 *
 * INDEXIERBARKEIT, die drei Teile: (1) KEIN robots-noindex und kein
 * X-Robots-Tag, (2) canonical über `canonicalLink()` als echtes
 * `<link rel="canonical">` mit absoluter URL — ein Deskriptor ohne `tagName`
 * rendert in react-router-7 als wirkungsloses `<meta rel="canonical">`
 * (Befund F_canonical, Doku in ~/lib/seo), (3) der Sitemap-Eintrag kommt
 * NICHT von hier, sondern vom gleichnamigen Shopify-Seitenobjekt (leerer
 * Rumpf, wie `technologie`/`studien`) — das ist die Naht dieses Baus, gewacht
 * von homepage-bauer/pruefungen/probe_partnerseite_naht_sitemap_route.py.
 *
 * TRACKING-NAHT: KEIN Redirect, KEIN eigener Pixel, KEINE neuen Cookies. Die
 * R1/R2/R3-Kette hängt pfad-agnostisch im root-Layout (Hausmuster D-006),
 * TRACKING_COOKIE_NAMES bleibt unangetastet. Der Link auf das Vendor-Formular
 * ist ein gewöhnlicher Außenlink ohne Parameter-Uebergabe.
 *
 * DESIGN: geteilte Token-Quelle styles/schlaf-zellen-schutz.css (Scope
 * .lp-a3, Referenz-Rezept) + additive lp-pp-*-Regeln in
 * styles/affiliate-partnerprogramm.css. Keine freien Werte, kein zweiter
 * Goldton, EIN Radius-Token, EIN H2-Stil.
 */
export function links() {
  return [
    {rel: 'stylesheet', href: lpTokenStyles},
    {rel: 'stylesheet', href: ppStyles},
  ];
}

/**
 * FAQPage-Auszeichnung aus DERSELBEN Quelle wie der sichtbare Text
 * (FRAGEN im Komponenten-Modul). Zwei Listen würden auseinanderdriften, und
 * strukturierte Daten, die etwas anderes sagen als die Seite, sind ein
 * Verstoß gegen Googles Richtlinie — nicht nur eine Unsauberkeit.
 */
function faqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FRAGEN.map((f) => ({
      '@type': 'Question',
      name: f.frage,
      acceptedAnswer: {'@type': 'Answer', text: f.antwort},
    })),
  };
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: TITEL},
  {name: 'description', content: BESCHREIBUNG},
  canonicalLink(PFAD),
  {property: 'og:type', content: 'website'},
  {property: 'og:title', content: TITEL},
  {property: 'og:description', content: BESCHREIBUNG},
  {property: 'og:url', content: absoluteCanonical(PFAD)},
  {'script:ld+json': faqSchema()},
];

export function loader() {
  return {};
}

export default function AffiliatePartnerprogrammRoute() {
  return <AffiliatePartnerprogramm />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
