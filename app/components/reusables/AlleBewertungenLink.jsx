import {Link, useLocation} from 'react-router';

/*
 * „Alle Bewertungen lesen" — der sichtbare Weg von jeder Rezensions-Ansicht
 * zur Bewertungsseite (Grossjob 20260925-GROSSJOB-seo-geo-bewertung-und-
 * kritik-auf-platz-1-bis-3-und-ki-zitat, Segment s02).
 *
 * WARUM ES IHN GIBT: /pages/bewertungen ist die zuständige Seite für die
 * Suche „qi blanco bewertung". Sie war am 2026-09-25 technisch einwandfrei
 * (200, Canonical, Sitemap) und trotzdem nicht in Googles Index; die Search
 * Console kannte keinen einzigen Link auf sie. Von zwölf seit Mitte August
 * angelegten Seiten war nur /pages/faq im Index — die einzige mit einem
 * sichtbaren, server-gerenderten Link. Dieser Link ist genau das: ein
 * normales <a href> im Server-HTML, kein Klick-Handler, kein Popup.
 *
 * EIN BAUSTEIN, ZWEI TRÄGER: Bewertungsblock (Startseite) und
 * GoogleRezensionenBereich (Produktseiten und Sterne-Popup im Kopf). Beide
 * führen dieselben Google-Bewertungen; der Weiterweg hat deshalb genau eine
 * Definition, nicht zwei Abschriften.
 *
 * AUF DER ZIELSEITE SELBST rendert er nichts: ein Link auf die Seite, auf der
 * man steht, ist für den Besucher ein toter Klick.
 *
 * `onKlick` braucht nur das Popup: es liegt als Portal über der Seite, und
 * eine Navigation ohne Schließen ließe es über der neuen Seite stehen.
 *
 * Farbe und Hover sind die des Widgets darüber (ReputonWidget, „Mehr lesen"):
 * derselbe Block, dieselbe Linkform.
 */
export const BEWERTUNGEN_PFAD = '/pages/bewertungen';

export function AlleBewertungenLink({onKlick}) {
  const {pathname} = useLocation();
  if (pathname === BEWERTUNGEN_PFAD) return null;
  return (
    <p className="text-center mt-6 mb-2" data-qb-weg="alle-bewertungen">
      <Link
        to={BEWERTUNGEN_PFAD}
        prefetch="intent"
        onClick={onKlick}
        className="text-base font-semibold text-[#1565c0] hover:underline"
      >
        Alle Bewertungen lesen
      </Link>
    </p>
  );
}
