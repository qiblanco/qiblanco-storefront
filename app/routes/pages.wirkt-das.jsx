import {MmWirktDas} from '~/components/campaign/MmWirktDas';
import mmStyles from '~/styles/mm-lp.css?url';
import {canonicalLink} from '~/lib/seo';

/**
 * /pages/wirkt-das — Antwort auf den größten Einwand des Bestands
 * (`ew-01` „Wirkt das überhaupt?", 3.758 von 29.251 Vorgängen).
 *
 * ZWEI TRAEGER, UND DAS IST ABSICHT — die Naht ist in s01 gemessen und in s03
 * am Bestand nachgewiesen worden:
 *   diese Route          trägt Design, Inhalt und Token-CSS
 *   die Shopify-Page mit
 *   Handle `wirkt-das`   trägt Sitemap-Eintrag und Menü-Ziel
 * Eine code-only-Route ist live HTTP 200 und steht NICHT in der Sitemap:
 * sitemap.$type.$page[.xml].jsx erzeugt die Liste über getSitemap() aus der
 * SHOPIFY-Page-Liste und kennt nur eine Ausschluss-Liste, keine Inclusion-
 * Liste. Gegenprobe im Bestand: /pages/zellstudien-ehrlich,
 * /pages/das-20-tage-versprechen und /pages/so-wirkt-kohaerentes-wasser
 * liefern je 200 und haben je 0 Treffer in sitemap/pages/1.xml. Die
 * Koexistenz beider Träger ist kein Konflikt, sondern der Regelfall: 30
 * Handles im Repo haben beides, darunter `technologie` — dort rendert
 * nachweislich die Route (eindeutiger Marker im Live-HTML) und der
 * Sitemap-Eintrag existiert trotzdem.
 *
 * INDEXIERBAR, im Gegensatz zu /pages/zellstudien-ehrlich: diese Seite ist
 * genau dafür gebaut, von einem zweifelnden Menschen gefunden zu werden.
 * Deshalb canonical und KEIN noindex. Der Canonical kommt aus `canonicalLink`
 * (app/lib/seo.js) und NICHT als `{rel:'canonical'}`-Descriptor: react-router-7
 * rendert einen Descriptor ohne `tagName` als `<meta rel="canonical">`, was im
 * Quelltext fast gleich aussieht und für Suchmaschinen wirkungslos ist. Genau
 * diese Stelle wurde am 2026-08-26 in 14 Bestands-Routen repariert (Commits
 * 6cbb85b/a70ab68); eine neue Route mit dem alten Muster hätte den Defekt am
 * Tag seiner Behebung wieder eingeführt.
 *
 * Tracking hängt global im root-Layout; die Seite braucht keine Produktdaten
 * und hat bewusst keinen Kauf-CTA — ihr Ausgang ist „selbst prüfen".
 */
export function links() {
  return [{rel: 'stylesheet', href: mmStyles}];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'Wirkt das überhaupt? Was gemessen ist – und was nicht | Qi Blanco'},
  {
    name: 'description',
    content:
      'Fünf Zellstudien, ein Labor, klare Grenzen: was bei Qi Blanco im Labor gemessen wurde, was daraus folgt und was ausdrücklich nicht. Zum Selbstnachlesen.',
  },
  canonicalLink('/pages/wirkt-das'),
];

export function loader() {
  return {};
}

export default function WirktDasRoute() {
  return <MmWirktDas />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
