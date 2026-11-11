import {redirect} from 'react-router';
import TheAlpha from '~/components/campaign/TheAlpha';
import {TheAlphaArm} from '~/components/campaign/TheAlphaArm';
import {entscheideSeitenExperiment} from '~/lib/experiment-weiche.server';
import {absoluteCanonical, canonicalLink} from '~/lib/seo';
import {ORG_ID, SITE_ID, brotkrume} from '~/lib/seiten-seo';
import theAlphaPremiumStyles from '~/styles/the-alpha-premium.css?url';

/*
 * /pages/The-Alpha — Variante A (Grossjob 20261025-prio1-the-alpha-landingpage-
 * figma-vorlage-a-server-b-ki-c, s03). Seit 26.10.2026 gestaltet statt 1:1
 * (Grossjob 20261026-prio1-the-alpha-variante-a-designmeister-premium-
 * gestaltung): Bausteine TheAlphaPremium.jsx, Stil the-alpha-premium.css.
 * Christian (Z2): „link wird sein
 * https://qiblanco.com/pages/The-Alpha“, (Z4): „wir gehen im link weg von
 * qi-alpha hin zu the alpha“. Gekauft wird auf der Shopseite (Z9/Z10); der
 * rote Knopf (TheAlphaKauf) führt dorthin.
 *
 * GROẞ- UND KLEINSCHREIBUNG: React Router vergleicht Pfade ohne Rücksicht auf
 * Groß/Klein, diese Route fängt also auch /pages/the-alpha und
 * /pages/THE-ALPHA (die statische Route schlägt pages.$handle.jsx). Jede
 * andere Schreibweise als Christians bekommt ein 301 auf /pages/The-Alpha
 * (Abfrage bleibt erhalten, z. B. utm_*), damit es genau EINE Adresse gibt.
 *
 * INDEXIERBAR: A ist die Hauptseite. canonical = https://qiblanco.com/pages/The-Alpha,
 * Sitemap über NUR_ROUTE_SEITEN in lib/seo.js. Die Testarme -B und -C stehen in
 * lib/vorschau-noindex.js.
 *
 * TRACKING: kein Pixel-Code hier (0-Pixel-Regel). A/B/C-TEST the-alpha-abc-e1
 * (s07, Christian Z5): der Loader teilt per 302 auf B (/pages/Qi-Alpha-C) und
 * C (/pages/Qi-Alpha-B), stabil je Besucher, Regeln in
 * lib/experiment-weiche.server.js (Bots, eigener Verkehr und Rückkehr aus der
 * Kasse sehen A; Pin ?shop_exp=a|b|c für Messwerkzeuge; Kill Env
 * EXP_THE_ALPHA_MODE=off). Solange die Zeile ruhend 0/0 steht, lenken nur die
 * Pins. TheAlphaArm meldet den Arm an den Receiver und legt ihn für die
 * Bestellung ins Cookie qb_ab_the_alpha_abc.
 */

/*
 * UMZUG QI ALPHA (Christian 27.10.2026, Z1: „Und den Link ändern wir auch
 * wieder von The Alpha in Qi Alpha“; Job 20261027-prio1-umzug-the-alpha-zu-
 * qi-alpha-links-name). Bis dahin stand diese Seite unter /pages/The-Alpha.
 */
/** Film-Seite: ohne Shop-Kopf, Ankündigungsband, Fuß und AI Anna (root.jsx
 * istFilmSeite; Christian 27.10.2026, Z275–Z279). */
export const handle = {filmSeite: true};

const KANON_PFAD = '/pages/Qi-Alpha';

export function links() {
  return [
    {rel: 'stylesheet', href: theAlphaPremiumStyles},
  ];
}

const BESCHREIBUNG =
  'Qi Alpha® mit Diamant, Limited 1st. Edition: 111 Stück, jedes mit eigener Nummer der Alpha-Serie. Jetzt exklusiv reservieren.';
const TEILBILD =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qi-alpha-01-front.jpg?v=1792849253';

/*
 * STRUKTURIERTE DATEN (Vorgang #129 der Schaltwarte, 2026-11-11): die Wache
 * auffindbarkeit-beide-laeden meldete /pages/Qi-Alpha als einzige
 * indexierbare Seite des Global Deutsch-Shops ohne JSON-LD. Diese Route
 * exportiert ihr meta selbst und nutzt seitenSignale() nicht, weil sie
 * og:title und og:image von Hand setzt (die große Funktion hätte beide
 * doppelt geschrieben). Sie bekommt deshalb nur den Teil, der fehlte:
 * WebPage + Brotkrume, mit denselben Ankern wie jede /pages-Seite
 * (ORG_ID, SITE_ID, brotkrume aus ~/lib/seiten-seo, dort unverändert).
 * Nur der <head>, an Inhalt und Gestaltung der Seite ändert sich nichts.
 * Ein Product-Knoten gehört auf die Kaufseite /products/qi-alpha, nicht
 * auf die Landingpage.
 */
function seitenSchema() {
  const url = absoluteCanonical(KANON_PFAD);
  const name = 'Qi Alpha®, Limited 1st. Edition 111/111';
  return [
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name,
        description: BESCHREIBUNG,
        inLanguage: 'de-DE',
        isPartOf: {'@id': SITE_ID},
        publisher: {'@id': ORG_ID},
        primaryImageOfPage: {'@type': 'ImageObject', url: TEILBILD},
      },
    },
    {'script:ld+json': brotkrume({url, name: 'Qi Alpha®'})},
  ];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'Qi Alpha®, Limited 1st. Edition 111/111 | Qi Blanco'},
  {name: 'description', content: BESCHREIBUNG},
  {property: 'og:title', content: 'Qi Alpha®, Limited 1st. Edition 111/111'},
  {property: 'og:image', content: TEILBILD},
  canonicalLink(KANON_PFAD),
  ...seitenSchema(),
];

/** @param {LoaderFunctionArgs} args */
export async function loader({request, context}) {
  const url = new URL(request.url);
  const pfad = url.pathname.replace(/\/+$/, '');
  if (pfad !== KANON_PFAD) {
    throw redirect(`${KANON_PFAD}${url.search}`, 301);
  }
  // A/B/C-TEST the-alpha-abc-e1: vor jedem await, Ziel B oder C, sonst rendert A.
  const exp = entscheideSeitenExperiment(request, context?.env, 'the-alpha-abc-e1');
  if (exp) throw redirect(exp.ziel, {status: 302, headers: {'Cache-Control': 'no-store'}});
  return {};
}

export default function TheAlphaRoute() {
  // Die Seite endet mit dem letzten Bild und dem roten Knopf, darunter steht
  // nichts mehr (Christian 31.10.2026: Links-Leiste „muss weg auf der LP“,
  // „Nur die Links-Leiste“, „Sodass der Kunde nur noch als nächstes den roten
  // Knopf drücken kann.“). Die Rechtszeile vom 30.10. (Elina,
  // EL-20261030-ae569366) bleibt auf der Kaufseite /products/qi-alpha.
  // A/B/C-TEST the-alpha-abc-e1 (s07): Arm A meldet sich und merkt sich für die Bestellung.
  return (
    <>
      <TheAlphaArm arm="a" />
      <TheAlpha />
    </>
  );
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
