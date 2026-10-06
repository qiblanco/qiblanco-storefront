import {Link} from 'react-router';
import {WV_GRUPPEN, WV_TITEL, WV_HUB} from '~/lib/hub-seiten';

/**
 * /pages/wissen-und-vertrauen — die Übersicht der Wissens- und
 * Vertrauensseiten (Großjob 20261006-GROSSJOB-seo-strategie-seiten-bewertung-
 * crawl-kannibalisierung, Segment s06). Christian am 2026-10-06 auf
 * Nachfrage: der Hub ist „eine Übersichtsseite bzw. ein Inhaltsverzeichnis
 * aller Wissens- und Vertrauensseiten".
 *
 * KEIN EIGENER TEXT JE SEITE IN DIESER DATEI: Ankertext und Teaser kommen aus
 * WV_GRUPPEN (app/lib/hub-seiten.js), derselben Liste, aus der Fußspalte und
 * Leiste „Weiterlesen" lesen.
 *
 * KEIN LOADER, KEIN KAUFWEG, KEIN PREIS. Die Seite erzeugt den nächsten Klick.
 *
 * KEINE EINLEITUNG JE GRUPPE (Haltungs-Gate K4, 2026-10-06): ein Satz, der nur
 * sagt, was in der Gruppe steht, ist ein Gedanke über den Aufbau der Seite und
 * keine Angabe für den Leser. Überschrift und Teaser tragen die Gruppe.
 */

export function WissenVertrauenHub() {
  return (
    <div className="wv">
      <section className="wv__kopf" data-section="wv-kopf">
        <div className="wv__inhalt">
          <p className="wv__vorspann">{WV_TITEL}</p>
          <h1>{WV_HUB.label}</h1>
          <p className="wv__lead">
            Was Elektrosmog ist, wie ein Schutz funktioniert und was andere mit
            Qi Blanco erlebt haben: jede dieser Fragen hat ihre eigene Seite.
            Fang mit der an, die dich gerade beschäftigt.
          </p>
        </div>
      </section>

      {WV_GRUPPEN.map((g) => (
        <section key={g.id} data-section={`wv-${g.id}`}>
          <div className="wv__inhalt">
            <h2 id={g.id}>{g.titel}</h2>
            <ul className="wv__liste">
              {g.seiten.map((s) => (
                <li key={s.to} className="wv__eintrag">
                  <h3>
                    <Link className="wv__link" prefetch="intent" to={s.to}>
                      {s.label}
                    </Link>
                  </h3>
                  <p>{s.teaser}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      <section data-section="wv-kontakt">
        <div className="wv__inhalt">
          <p className="wv__kontakt">
            Deine Frage fehlt? Über{' '}
            <Link prefetch="intent" to="/pages/support">
              Kontakt &amp; Hilfe
            </Link>{' '}
            erreichst du uns direkt.
          </p>
        </div>
      </section>
    </div>
  );
}
