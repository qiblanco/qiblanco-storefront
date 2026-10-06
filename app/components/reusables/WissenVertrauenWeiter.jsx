import {Link, useLocation} from 'react-router';
import {wvWeiterFuer} from '~/lib/hub-seiten';

/**
 * Leiste „Weiterlesen" über dem Fuß jeder Wissens- und Vertrauensseite
 * (Großjob 20261006-GROSSJOB-seo-strategie-seiten-bewertung-crawl-
 * kannibalisierung, Segment s06): ein bis zwei Geschwister und der Link
 * zurück auf die Übersicht /pages/wissen-und-vertrauen. Welche Seite welche
 * Geschwister zeigt, steht in app/lib/hub-seiten.js (Feld `weiter`).
 *
 * WARUM IM LAYOUT UND NICHT IN ZEHN ROUTEN: eine Stelle statt zehn, und die
 * Leiste steht AUSSERHALB von <main>. Das SERP-Testsystem des seo-manager
 * misst den Fingerabdruck einer Seite an Titel, Beschreibung, h1 und dem Text
 * in <main> (bin/serp_test.py fingerabdruck_html); jede Änderung dort startet
 * das Beobachtungsfenster eines Kandidaten neu. /pages/kritik,
 * /pages/erfahrungen und /pages/bewertungen sind solche Kandidaten, und ihre
 * Texte gehören einem eigenen Großjob. Die Leiste berührt keinen davon.
 *
 * Auf allen anderen Seiten rendert sie nichts, auch keinen leeren Rahmen.
 */
export function WissenVertrauenWeiter() {
  const {pathname} = useLocation();
  const weiter = wvWeiterFuer(pathname);
  if (!weiter) return null;
  return (
    <nav className="wv-weiter" aria-label="Weiterlesen: Wissen und Vertrauen">
      <div className="wv-weiter__inhalt">
        <p className="wv-weiter__titel">Weiterlesen</p>
        <ul className="wv-weiter__liste">
          {weiter.geschwister.map(({to, label}) => (
            <li key={to}>
              <Link prefetch="intent" to={to}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="wv-weiter__hub">
          <Link prefetch="intent" to={weiter.hub.to}>
            {weiter.hub.label}
          </Link>
        </p>
      </div>
    </nav>
  );
}
