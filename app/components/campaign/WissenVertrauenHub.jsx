import {Link} from 'react-router';
import {WV_FRAGE, WV_GRUPPEN, WV_TITEL} from '~/lib/hub-seiten';

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
          <h1>{WV_FRAGE}</h1>
          {/* DIE ANTWORT ZUERST (SEO-Maßnahme M-SP-20261017-wissen-und-
              vertrauen, 2026-11-10): der erste Absatz beantwortet die Frage
              der H1, was gemessen ist und was offen ist, mit dem Link auf
              die Studien. Jede Angabe steht wortgleich oder sinngleich schon
              auf /pages/studien (EVIDENZSTUFE_ANTWORT, EVIDENZSTUFE_FRAGEN)
              und /pages/kritik; hier steht nichts, was dort nicht steht.
              Der Satz „In zwei dieser Arbeiten …" ist der Satz aus
              KritikSeite.jsx. */}
          <p className="wv__lead">
            Im Labor gemessen, am Menschen offen. Vier von fünf veröffentlichten{' '}
            <Link prefetch="intent" to="/pages/studien">
              Arbeiten zu den Qi-Blanco-Geräten
            </Link>{' '}
            untersuchen Zellkulturen, eine kontrollierte Studie am Menschen gibt
            es nicht. In zwei dieser Arbeiten haben Zellen unter Handystrahlung
            mit dem QiOne® 2 Pro deutlich besser standgehalten als ohne. Ob es
            zu dir passt, prüfst du an dir selbst. 20 Tage tragen, und wenn es
            nichts für dich ist, ohne Angabe von Gründen zurückgeben.
          </p>
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
                <li key={s.pfad} className="wv__eintrag">
                  <h3>
                    <Link className="wv__link" prefetch="intent" to={s.pfad}>
                      {s.anker}
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
