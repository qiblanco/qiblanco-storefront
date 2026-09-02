import {useId, useState} from 'react';
import {Link} from 'react-router';
import {FAQ_BLOECKE} from '~/data/faq-seite';

/**
 * /pages/faq — die öffentliche Fragen-und-Antworten-Fläche der DACH-Storefront.
 *
 * WARUM ES DIESE SEITE GIBT (Segment s04 des Grossjobs
 * 20260831-GROSSJOB-seo-warum-ranken-kritiker-über-uns-fruechte-prio6): Auf
 * „Qi Blanco Erfahrungen" sind die Plätze 1 bis 3 sämtlich kritisch, und
 * unsere erste eigene Domain-Fläche ist Platz 7 mit einer STUDIENSEITE. Wer
 * „Erfahrungen" tippt, will eine Einordnung; wer eine FAQ sucht, will eine
 * Antwort. Bis heute hatten wir für diese Absicht keine Fläche —
 * /pages/faq lieferte HTTP 404, obwohl die Seite im Sollzustand des
 * SEO-Playbooks steht und dort seit Wochen als `H_geplant_fehlt` gemeldet wird.
 *
 * ── DREI BAUENTSCHEIDUNGEN, DIE MAN DEM CODE NICHT ANSIEHT ───────────────
 *
 * (1) DIE ANTWORTEN STEHEN IMMER IM DOM. Sie werden per `hidden`-Attribut nur
 *     visuell auf- und zugeklappt (WAI-ARIA-Accordion-Muster), NIE bedingt
 *     gemountet. Das ist die tragende Eigenschaft einer SEO-FAQ: eine
 *     client-seitig nachgeladene Antwort ist für Crawler und für
 *     KI-Antwortsysteme nicht vorhanden. Übernommen aus ProductFAQ.jsx
 *     (Befund FJ2 des GEO/ÄO-Deep-Dive) — die Eigenschaft ist geliehen, die
 *     Datei nicht.
 *
 * (2) DAS FAQPage-SCHEMA KOMMT AUS app/lib/faq-schema.js, NICHT AUS EINER
 *     ZWEITEN FABRIK. P10: der Bestand hat die Fabrik, samt zweistufigem
 *     Ausschluss (explizites `flag` + Deny-Netz gegen Eso-/Wirkmechanismus-
 *     Vokabular). Eine eigene Serialisierung hätte dieses Netz umgangen —
 *     also genau die Sperre, die verhindert, dass eine unbelegte Wirkaussage
 *     in strukturierte Daten leckt. Der Nebeneffekt ist der eigentliche Grund:
 *     ein Text mit „kohärent" fällt dort STILL heraus. Er wird nicht rot, er
 *     verschwindet nur. test/faq-seite.test.mjs prüft deshalb mechanisch,
 *     dass ALLE Items dieser Seite das Netz passieren.
 *
 * (3) KEIN KAUF-CTA, SONDERN DREI WEGE. Eine /pages/-Seite ist die
 *     Landingpage-Fassung und wird am NÄCHSTEN KLICK gemessen, nicht an der
 *     Bestellung (Kanon: „Die Landingpage verkauft nicht — sie erzeugt den
 *     nächsten Klick"; /products/<handle> ist die Kaufseite). Der Ausgang
 *     dieser Seite ist deshalb „selbst nachlesen" bzw. „Produkt ansehen",
 *     nicht „jetzt kaufen".
 *
 * ANREDE: durchgehend DU. Der Anrede-Mix Sie/Du war einer der Mängel, wegen
 * derer Christian am 2026-08-31 /pages/wirkt-das aus dem Index genommen hat.
 */

/** Ein Block-Anker, damit die Sprungmarken und die H2 dieselbe ID benutzen. */
const ankerId = (blockId) => `faq-${blockId}`;

function FaqTabelle({tabelle}) {
  return (
    <table className="faq-tabelle">
      <caption>{tabelle.caption}</caption>
      <thead>
        <tr>
          {tabelle.kopf.map((zelle) => (
            <th key={zelle} scope="col">
              {zelle}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tabelle.zeilen.map((zeile) => (
          <tr key={zeile[0]}>
            <th scope="row">{zeile[0]}</th>
            {zeile.slice(1).map((zelle, i) => (
              <td key={i}>{zelle}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function FaqEintrag({item, id, offen, onToggle}) {
  const antwortId = `${id}-antwort`;
  return (
    <div className="faq-eintrag">
      <h3 style={{margin: 0}}>
        <button
          type="button"
          className="faq-frage"
          aria-expanded={offen}
          aria-controls={antwortId}
          onClick={onToggle}
        >
          <span>{item.q}</span>
          <span className="faq-zeichen" aria-hidden="true" />
        </button>
      </h3>
      {/* Immer gerendert, nur visuell geklappt — siehe Bauentscheidung (1). */}
      <div className="faq-antwort" id={antwortId} role="region" hidden={!offen}>
        <p>{item.a}</p>
        {item.tabelle ? <FaqTabelle tabelle={item.tabelle} /> : null}
      </div>
    </div>
  );
}

function FaqBlock({block}) {
  // Der erste Eintrag jedes Blocks startet offen: die Seite zeigt damit schon
  // ohne Klick echte Antworten statt einer Liste zugeklappter Zeilen.
  const [offenerIndex, setOffenerIndex] = useState(0);
  const basisId = useId();

  return (
    <section className="faq-block">
      <div className="faq-inner faq-inner--schmal">
        <h2 id={ankerId(block.id)}>{block.titel}</h2>
        <p className="faq-block-intro">{block.intro}</p>
        <div className="faq-liste">
          {block.items.map((item, i) => (
            <FaqEintrag
              key={item.q}
              item={item}
              id={`${basisId}-${i}`}
              offen={offenerIndex === i}
              onToggle={() => setOffenerIndex(offenerIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqSeite() {
  return (
    <div className="faq-a1">
      <section className="faq-kopf">
        <div className="faq-inner faq-inner--schmal">
          <h1>Häufige Fragen</h1>
          <p className="faq-lede">
            Die Fragen, die uns am häufigsten erreichen — beantwortet in der
            Reihenfolge, in der sie gestellt werden. Auch die unangenehmen: was
            belegt ist, was nicht, und was die Kritik an uns trifft.
          </p>
          <ul className="faq-sprungmarken">
            {FAQ_BLOECKE.map((block) => (
              <li key={block.id}>
                <a href={`#${ankerId(block.id)}`}>{block.titel}</a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {FAQ_BLOECKE.map((block) => (
        <FaqBlock key={block.id} block={block} />
      ))}

      <section className="faq-schluss">
        <div className="faq-inner faq-inner--schmal">
          <h2>Deine Frage war nicht dabei?</h2>
          <p>
            Dann nimm einen dieser drei Wege — oder schreib uns einfach, wir
            antworten dir persönlich.
          </p>
          <ul className="faq-wege">
            <li>
              <Link className="faq-weg" to="/pages/studien">
                <strong>Die Studien im Original</strong>
                <span>
                  Alle fünf Publikationen als PDF, mit Methode, Zahlen und den
                  Grenzen, die die Autoren selbst nennen.
                </span>
              </Link>
            </li>
            <li>
              <Link className="faq-weg" to="/pages/technologie">
                <strong>Wie das Modell gedacht ist</strong>
                <span>
                  Die Erklärung hinter dem GitterChip™ — ausdrücklich als
                  Hypothese, nicht als gesicherte Wissenschaft.
                </span>
              </Link>
            </li>
            <li>
              <Link className="faq-weg" to="/pages/support">
                <strong>Uns direkt fragen</strong>
                <span>
                  Kontaktformular und persönliche Beratung. Auch zur Größe —
                  schick uns einfach deine gemessene Handgelenksbreite.
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
