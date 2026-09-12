import {Link} from 'react-router';
import {ABSICHT, ABSENDER, ABSENDER_FOTO} from '~/data/absicht';
import {AbsichtText} from '~/components/campaign/AbsichtText';
import {CdnBild} from '~/components/reusables/CdnBild';

/**
 * /pages/warum-qi-blanco — die Absicht als eigene Seite.
 *
 * Der Rumpf sind die vier Gedanken aus <AbsichtText/> — dasselbe Bauteil, das
 * auch der Abschnitt auf /pages/hypothesen rendert. Diese Datei steuert nur
 * das, was die SEITE zusätzlich hat: Kopf, Unterschrift, Weiterlesen.
 *
 * DIE UNTERSCHRIFT STEHT IM TEXT, NICHT NUR IM MARKUP: Name, Rolle und Datum
 * sind sichtbar. Eine Maschine liest beides, ein Mensch nur das eine — wer die
 * Angabe allein ins JSON-LD schreibt, hat sie für die Hälfte der Leser nicht
 * gemacht. Das <time>-Element trägt das maschinenlesbare Datum.
 *
 * „WEITERLESEN" FÜHRT AUSDRÜCKLICH NICHT ZUM PRODUKT. Diese Seite hat keinen
 * Kaufweg — kein Preis, kein Knopf, kein Angebot (Arm G der Wache misst das).
 * Das ist keine Nachlässigkeit, sondern der Zweck: eine Absicht, die verkauft,
 * wird von keiner Maschine zitiert und von keinem Menschen geglaubt. Die
 * Verweise führen deshalb nur zu Erkenntniswegen — wer hinter Qi Blanco steht,
 * was geprüft wurde, was gegen uns vorgebracht wird.
 *
 * DER VERWEIS AUF /pages/hypothesen FEHLTE HIER BIS ZUM 2026-09-12 BEWUSST,
 * und jetzt steht er. Die Hypothesenseite hielt vier Sperren, deren vierte
 * lautete „nicht verlinkt von einer indexierten Seite"; ein Link von hier
 * hätte genau die Sperre gebrochen, die Christian angeordnet hatte („noch
 * nicht crawlbar machen — mir zeigen, wenn es live ist"). Er hat sie gelesen
 * und am 2026-09-12 freigegeben („Ja, ansonsten kannst du das hier
 * veröffentlichen, das liest sich gut") — damit ist die Sperre aufgehoben und
 * der Verweis fällig, nicht bloß erlaubt: eine Seite, die niemand verlinkt,
 * ist auch ohne noindex unsichtbar.
 *
 * ER STEHT AN ERSTER STELLE UNTER „WEITERLESEN" und nicht am Ende: diese Seite
 * sagt selbst, „deshalb legen wir unsere Annahmen offen, und deshalb steht
 * neben jeder von ihnen auch das, was gegen sie spricht" — die Hypothesenseite
 * IST dieser Ort. Der nächstliegende Klick nach diesem Satz ist der dorthin.
 * Die Gegenrichtung (Hypothesen -> Absicht) bestand schon und bleibt;
 * homepage-bauer/pruefungen/probe_absicht_naht.py Arm N3 misst beide und liest
 * seit demselben Commit den `status` der Fläche aus
 * homepage-bauer/konzepte/abgrenzung-flaechen.json, statt die Sperre fest
 * verdrahtet zu führen.
 */

/** Nur Erkenntniswege, kein Kaufweg. Siehe Begründung oben. */
const WEITERLESEN = [
  {
    pfad: '/pages/hypothesen',
    text: 'Was wir annehmen und wie gut es belegt ist — sechs Hypothesen mit dem, was dagegen spricht',
  },
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
        <div className="ab-inhalt">
          <p className="ab-vorspann">{ABSICHT.vorspann}</p>
          <h1 className="ab-h1">{ABSICHT.titel}</h1>
          <p className="ab-lead">{ABSICHT.lead}</p>
        </div>
      </section>

      <div className="ab-inhalt">
        <AbsichtText ebene={2} />

        <div className="ab-teil">
          <div className="ab-unterschrift">
            {/* Das Foto steht AN DER UNTERSCHRIFT und nicht im Seitenkopf.
                Der Kopf traegt die Frage („warum gibt es Qi Blanco"), die
                Unterschrift traegt die Antwort auf „wer sagt das". Ein
                Gesicht ueber dem ersten Absatz waere Schmuck; hier ist es
                der Traeger der Urheberschaft — genau die Angabe, die diese
                Seite von Werbematerial unterscheidet, und die einzige, die
                bisher nur als Name dastand. */}
            <div className="ab-unterschrift-kopf">
              <CdnBild
                className="ab-portrait"
                src={ABSENDER_FOTO.bild_id}
                alt={ABSENDER_FOTO.alt}
                anzeigeBreite={ABSENDER_FOTO.anzeigeBreite}
                breite={ABSENDER_FOTO.breite}
                hoehe={ABSENDER_FOTO.hoehe}
                masterBreite={ABSENDER_FOTO.masterBreite}
                loading="lazy"
                decoding="async"
              />
              <div className="ab-unterschrift-text">
                <p className="ab-unterschrift-name">{ABSENDER.name}</p>
                <p className="ab-unterschrift-rolle">{ABSENDER.rolle}</p>
                <p className="ab-unterschrift-datum">
                  Stand dieses Textes:{' '}
                  <time dateTime={ABSENDER.stand}>11. September 2026</time>
                </p>
              </div>
            </div>
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
