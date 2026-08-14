import {redirect} from 'react-router';
import {useLoaderData} from 'react-router';
import {Podcasts} from '~/components/campaign/Podcasts';
import {ladeSeite, nummerAusSegment, SEITEN_ZAHL} from '~/lib/podcast-daten.server';
import {CANONICAL_ORIGIN, canonicalLink, absoluteCanonical} from '~/lib/seo';
import lpTokenStyles from '~/styles/schlaf-zellen-schutz.css?url';
import podcastStyles from '~/styles/podcasts.css?url';

/**
 * /pages/podcasts/seite-2 … seite-N — die Folgeseiten des Podcast-Index.
 *
 * DER UNTERSTRICH IN 'pages.podcasts_' IST TRAGEND: er koppelt diese Route von
 * pages.podcasts.jsx ab. Ohne ihn wäre Seite 1 das Layout dieser Route, und
 * da sie kein <Outlet/> rendert, kaeme auf jeder Folgeseite Seite 1 heraus —
 * mit HTTP 200. (Konvention wie widerruf_.bestaetigen.jsx, account_.login.jsx.)
 *
 * ECHTE URLs STATT QUERY: jede Seite ist eine eigene, verlinkte, indexierbare
 * Adresse mit self-canonical und rel prev/next. Kein infinite scroll — was ein
 * Crawler nur per JavaScript erreicht, zählt für die Auffindbarkeit nicht.
 *
 * ZWEI ENDEN WERDEN DICHT GEMACHT, damit kein unendlicher Crawl-Raum
 * entsteht: 'seite-1' faellt per 301 auf /pages/podcasts (sonst zwei URLs mit
 * identischem Inhalt), alles ausserhalb 2..N ist 404 statt geklemmt.
 */
export function links() {
  return [
    {rel: 'stylesheet', href: lpTokenStyles},
    {rel: 'stylesheet', href: podcastStyles},
  ];
}

/**
 * ALLES AUS `data`: `meta` läuft auch im Client und darf das `.server.js`
 * nicht anfassen (sonst bricht der Build). Zugleich die bessere Kopplung —
 * Kopf und Körper lesen dieselbe Quelle. Siehe pages.podcasts.jsx.
 * @type {MetaFunction}
 */
export const meta = ({data}) => {
  const d = data?.daten;
  if (!d) return [{title: 'Podcasts von Qi Blanco'}];
  const titel = `Podcasts von Qi Blanco — Seite ${d.nr} von ${d.seitenZahl}`;
  const beschreibung =
    `Podcast-Folgen von Qi Blanco, Seite ${d.nr}: lange Gespräche über Wasser, ` +
    'Frequenzen und den Alltag mit Technologie — mit Beschreibung und Kapiteln.';
  const eintraege = [
    {title: titel},
    {name: 'description', content: beschreibung},
    canonicalLink(data.pfad),
    {property: 'og:title', content: titel},
    {property: 'og:description', content: beschreibung},
    {property: 'og:type', content: 'website'},
    {property: 'og:url', content: absoluteCanonical(data.pfad)},
  ];
  if (d.vorher) {
    eintraege.push({tagName: 'link', rel: 'prev', href: absoluteCanonical(d.vorher)});
  }
  if (d.nachher) {
    eintraege.push({tagName: 'link', rel: 'next', href: absoluteCanonical(d.nachher)});
  }
  if (data.schema) eintraege.push({'script:ld+json': data.schema});
  return eintraege;
};

export async function loader({params}) {
  const nr = nummerAusSegment(params.seite);
  if (nr === 1) throw redirect('/pages/podcasts', 301);
  if (nr === null || nr < 1 || nr > SEITEN_ZAHL) {
    throw new Response(null, {status: 404});
  }
  return ladeSeite(nr, CANONICAL_ORIGIN);
}

export default function PodcastFolgeSeite() {
  const {daten, pfade, gaeste} = useLoaderData();
  return <Podcasts daten={daten} pfade={pfade} gaeste={gaeste} />;
}
