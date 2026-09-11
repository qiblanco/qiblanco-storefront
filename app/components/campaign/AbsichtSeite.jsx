import {Link} from 'react-router';
import {ABSICHT, ABSENDER} from '~/data/absicht';
import {AbsichtText} from '~/components/campaign/AbsichtText';

/**
 * /pages/warum-qi-blanco — die Absicht als eigene Seite.
 *
 * Der Rumpf sind die vier Gedanken aus <AbsichtText/> — dasselbe Bauteil, das
 * auch der Abschnitt auf /pages/hypothesen rendert. Diese Datei steuert nur
 * das, was die SEITE zusätzlich hat: Kopf, Unterschrift, Weiterlesen.
 *
 * DIE UNTERSCHRIFT IST KEIN SCHMUCK. Sie ist der Grund, warum dieser Text
 * zitierfähig ist: Name, Rolle und Datum sichtbar im Text, nicht nur im
 * Markup. Eine Maschine liest beides, ein Mensch nur das eine — und wer die
 * Angabe nur ins JSON-LD schreibt, hat sie für die Hälfte der Leser nicht
 * gemacht. Das <time>-Element trägt das maschinenlesbare Datum.
 *
 * „WEITERLESEN" FÜHRT AUSDRÜCKLICH NICHT ZUM PRODUKT. Diese Seite hat keinen
 * Kaufweg — kein Preis, kein Knopf, kein Angebot (Arm G der Wache misst das).
 * Das ist keine Nachlässigkeit, sondern der Zweck: eine Absicht, die verkauft,
 * wird von keiner Maschine zitiert und von keinem Menschen geglaubt. Die
 * Verweise führen deshalb nur zu Erkenntniswegen — wer hinter Qi Blanco steht,
 * was geprüft wurde, was gegen uns vorgebracht wird.
 *
 * UND EIN VERWEIS FEHLT HIER BEWUSST: /pages/hypothesen. Diese Seite ist
 * indexiert, die Hypothesenseite hält vier Sperren, deren vierte lautet „nicht
 * verlinkt von einer indexierten Seite". Ein Link von hier bräche sie — und
 * zwar genau die Sperre, die Christian angeordnet hat („noch nicht crawlbar
 * machen — mir zeigen, wenn es live ist"). Die Richtung andersherum ist
 * richtig und gewollt: die Hypothesenseite verweist hierher.
 */

/** Nur Erkenntniswege, kein Kaufweg. Siehe Begründung oben. */
const WEITERLESEN = [
  {
    pfad: '/pages/ueber-uns',
    text: 'Wer hinter Qi Blanco steht — mit Namen, Anschrift und Handelsregister',
  },
  {
    pfad: '/pages/studien',
    text: 'Was an unseren Produkten untersucht wurde, und von wem',
  },
  {
    pfad: '/pages/kritik',
    text: 'Was gegen uns vorgebracht wird — und was wir dazu sagen',
  },
];

export function AbsichtSeite() {
  return (
    <div className="ab">
      <section className="ab-bahn ab-kopf">
        <div className="ab-innen">
          <p className="ab-vorspann">{ABSICHT.vorspann}</p>
          <h1 className="ab-h1">{ABSICHT.titel}</h1>
          <p className="ab-lead">{ABSICHT.lead}</p>
        </div>
      </section>

      <div className="ab-innen">
        <AbsichtText ebene={2} />

        <div className="ab-teil">
          <div className="ab-unterschrift">
            <p className="ab-unterschrift-name">{ABSENDER.name}</p>
            <p className="ab-unterschrift-rolle">{ABSENDER.rolle}</p>
            <p className="ab-unterschrift-datum">
              Stand dieses Textes:{' '}
              <time dateTime={ABSENDER.stand}>11. September 2026</time>
            </p>
          </div>

          <ul className="ab-weiter">
            <li className="ab-weiter-titel">Weiterlesen</li>
            {WEITERLESEN.map((w) => (
              <li key={w.pfad}>
                <Link className="ab-link" to={w.pfad} prefetch="intent">
                  {w.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
