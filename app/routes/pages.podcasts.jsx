import {useLoaderData} from 'react-router';
import {Podcasts} from '~/components/campaign/Podcasts';
import {ladeSeite} from '~/lib/podcast-daten.server';
import {CANONICAL_ORIGIN, canonicalLink, absoluteCanonical} from '~/lib/seo';
import lpTokenStyles from '~/styles/schlaf-zellen-schutz.css?url';
import podcastStyles from '~/styles/podcasts.css?url';

/**
 * /pages/podcasts — Seite 1 des Podcast-Index (Job 20260814-podcast-sektion-
 * umzug-us-zu-dach-qiblanco-com).
 *
 * WARUM ES DIESE ROUTE GIBT: die Folgen sind deutschsprachig, standen aber bis
 * 2026-08-14 auf der US-Seite qi-blanco.com (dort zurueckgerollt). Für die
 * DACH-Markensuche zählt der Text nur auf dieser Domain.
 *
 * DIE NAHT, DIE HIER ENTSCHEIDET: unter dem Handle 'podcasts' liegt in Shopify
 * eine publizierte Seite (gid 102610600204), die von pages.$handle.jsx als
 * body_html gerendert würde. Diese Datei gewinnt, weil ein statischer
 * Routenname spezifischer ist als $handle. Wäre das nicht so, lieferte der
 * Shop weiter die Altseite aus — mit HTTP 200, also ohne dass irgendeine
 * Prüfung anschlaegt. Genau das misst probe_podcast_dach.py --modus naht.
 *
 * DIE ALTSEITE IST NICHT VERLOREN: ihre 11 Eintraege ("Qi Blanco zu Gast bei
 * anderen") sind in podcast-daten.server.js uebernommen und stehen unter der
 * Liste. Der Rueckweg ist deshalb ein reiner git revert — die Shopify-Seite
 * bleibt unangetastet publiziert und rendert danach wieder wie zuvor.
 *
 * KEIN Preis und KEIN harter Kaufaufruf auf dieser Seite (Format-Regel: die
 * gehoeren in den langen VSL). Die Produktlinks je Folge sind Verweise auf das
 * im Gespraech Erwaehnte, nicht der Abschluss.
 */
export function links() {
  return [
    {rel: 'stylesheet', href: lpTokenStyles},
    {rel: 'stylesheet', href: podcastStyles},
  ];
}

const TITEL = 'Podcasts von Qi Blanco — alle Folgen mit Beschreibung';
const BESCHREIBUNG =
  'Alle Podcast-Folgen von Qi Blanco: lange Gespräche über Wasser, ' +
  'Frequenzen und den Alltag mit Technologie — jede Folge mit Beschreibung, ' +
  'Kapiteln und Video.';

/**
 * Indexierbar und selbst-kanonisch. Kein robots-noindex: diese Seite SOLL
 * gefunden werden, das ist ihr einziger Zweck.
 *
 * ALLES AUS `data`, NICHTS AUS DEM DATENMODUL: `meta` läuft auch im Client,
 * das Datenmodul ist `.server.js` — ein Import hier bricht den Build
 * ("Server-only module referenced by client", gemessen 2026-08-14). Der
 * Umweg über die Loader-Daten ist zugleich die bessere Kopplung: Kopf und
 * Körper können nicht auseinanderlaufen, weil beide dieselbe Quelle lesen.
 * @type {MetaFunction}
 */
export const meta = ({data}) => {
  const eintraege = [
    {title: TITEL},
    {name: 'description', content: BESCHREIBUNG},
    canonicalLink('/pages/podcasts'),
    {property: 'og:title', content: TITEL},
    {property: 'og:description', content: BESCHREIBUNG},
    {property: 'og:type', content: 'website'},
    {property: 'og:url', content: absoluteCanonical('/pages/podcasts')},
  ];
  const nachher = data?.daten?.nachher;
  if (nachher) {
    eintraege.push({tagName: 'link', rel: 'next', href: absoluteCanonical(nachher)});
  }
  if (data?.schema) eintraege.push({'script:ld+json': data.schema});
  return eintraege;
};

export async function loader() {
  return ladeSeite(1, CANONICAL_ORIGIN);
}

export default function PodcastSeite() {
  const {daten, pfade, gaeste} = useLoaderData();
  return <Podcasts daten={daten} pfade={pfade} gaeste={gaeste} />;
}
