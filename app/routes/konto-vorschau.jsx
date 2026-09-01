import {data} from '@shopify/remix-oxygen';
import {
  AdressLese,
  BestellKarte,
  BestellPosten,
  BestellSummen,
  KontoAbschnitt,
  KontoErfolg,
  KontoFehler,
  KontoLeer,
  KontoNav,
  KontoRahmen,
} from '~/components/konto/KontoUI';
import {datumText, versandText, zahlungsText} from '~/lib/konto-texte';
import kontoStyles from '~/styles/konto.css?url';

/**
 * MESS-VORSCHAU DER KONTO-FLÄCHE — NUR IM DEV-MODUS ERREICHBAR.
 *
 * WOZU: Die echten Konto-Routen sind nicht renderbar, solange die
 * Customer-Account-API-Zugangsdaten fehlen (Hydrogen wirft dort absichtlich
 * 500); gemessen am 2026-09-01 lokal: /account/login 500, /account/orders 500.
 * Die Zugangsdaten setzt Christian erst im Folge-Segment s03. Ohne ein
 * renderbares Objekt wäre die Design-Pflicht (design-rubrik >= 80) in diesem
 * Segment gar nicht messbar. Diese Route rendert deshalb EXAKT die
 * Präsentations-Bausteine aus components/konto/KontoUI.jsx mit Fixture-Daten.
 *
 * WAS DIESER BELEG NICHT IST — ausdrücklich, damit ihn niemand verwechselt:
 * Ein Score gegen diese Seite misst Markup und CSS, NICHT die ausgelieferte
 * Seite. Er misst nicht den echten Loader-Pfad, nicht die realen Datenformen
 * (lange Namen, viele Bestellungen, fremde Adressformate) und nicht die
 * Konsole des Auth-Flusses. Er wird deshalb unter EIGENEM Slug geführt
 * (konto-vorschau-fixture) und erfüllt das Beauty-Gate für /account/* NICHT.
 * Wer ihn unter dem Slug der echten Seite verbucht, macht ihn für das
 * Deploy-Gate ununterscheidbar von einer echten Messung — genau das ist die
 * Grenze, die hier nicht überschritten wird.
 *
 * WARUM DEV-ONLY UND NICHT DAUERHAFT MIT noindex: Fixtures driften von den
 * realen Datenformen weg, und es entstünde eine öffentliche Kundenfläche mit
 * erfundenen Bestelldaten. Braucht s03 ein stabiles Messobjekt, entscheidet
 * s03 das mit einem echten Testkonto.
 *
 * DER RIEGEL: der Loader wirft in der Produktion 404. Das ist eine
 * Server-Entscheidung, kein ausgeblendetes Markup — die Seite existiert dort
 * nicht, statt nur unsichtbar zu sein.
 */
export function links() {
  return [{rel: 'stylesheet', href: kontoStyles}];
}

export const meta = () => [
  {title: 'Konto-Vorschau (intern)'},
  {name: 'robots', content: 'noindex, nofollow'},
];

export async function loader() {
  if (process.env.NODE_ENV === 'production') {
    throw new Response('Not Found', {status: 404});
  }
  return data(
    {},
    {headers: {'X-Robots-Tag': 'noindex, nofollow'}},
  );
}

const BESTELLUNGEN = [
  {
    id: '1',
    nummer: '#1042',
    processedAt: '2026-08-21T10:12:00Z',
    versand: 'FULFILLED',
    zahlung: 'PAID',
    summe: '249,00 €',
  },
  {
    id: '2',
    nummer: '#1017',
    processedAt: '2026-07-03T08:40:00Z',
    versand: 'IN_PROGRESS',
    zahlung: 'PAID',
    summe: '99,90 €',
  },
  {
    id: '3',
    nummer: '#0993',
    processedAt: '2026-05-14T16:05:00Z',
    versand: null,
    zahlung: 'REFUNDED',
    summe: '149,00 €',
  },
];

export default function KontoVorschau() {
  return (
    <KontoRahmen
      eyebrow="Dein Konto"
      titel="Willkommen, Christian"
      lede="Hier findest du deine Bestellungen, deine Daten und deine Adressen."
    >
      <KontoNav aktiv="/account/orders" />

      <KontoAbschnitt titel="Deine Bestellungen">
        <div className="konto-bestellungen">
          {BESTELLUNGEN.map((b) => (
            <BestellKarte
              key={b.id}
              nummer={b.nummer}
              datum={datumText(b.processedAt)}
              status={versandText(b.versand) ?? zahlungsText(b.zahlung)}
              summe={b.summe}
              zu="/account/orders/1"
            />
          ))}
        </div>
      </KontoAbschnitt>

      <KontoAbschnitt
        titel="Bestellung #1042"
        beschreibung={`Bestellt am ${datumText('2026-08-21T10:12:00Z')}`}
      >
        <div className="konto-karte">
          <h3 className="konto-karte__titel">Das hast du bestellt</h3>
          <div>
            <BestellPosten
              titel="QiOne® 2 Pro"
              variante="Edelstahl · 60 cm"
              menge={1}
              preis="199,00 €"
              bild={null}
            />
            <BestellPosten
              titel="QiBracelet"
              variante="Größe M"
              menge={2}
              preis="25,00 €"
              bild={null}
            />
          </div>
          <BestellSummen
            zeilen={[
              {text: 'Rabatt', wert: '−10 %'},
              {text: 'Zwischensumme', wert: '249,00 €'},
              {text: 'Enthaltene Steuer', wert: '39,75 €'},
              {text: 'Gesamt', wert: '249,00 €', gesamt: true},
            ]}
          />
        </div>

        <div className="konto-raster konto-raster--zwei konto-raster--luft">
          <div className="konto-karte">
            <h3 className="konto-karte__titel">Lieferadresse</h3>
            <AdressLese
              name="Christian Muster"
              zeilen={['Musterstraße 1', '10115 Berlin', 'DE']}
            />
          </div>
          <div className="konto-karte">
            <h3 className="konto-karte__titel">Status</h3>
            <p className="konto-meta">{versandText('FULFILLED')}</p>
            <div className="konto-form__knoepfe">
              <a className="konto-cta konto-cta--sekundaer" href="/account/orders">
                Sendung verfolgen
              </a>
            </div>
          </div>
        </div>
      </KontoAbschnitt>

      <KontoAbschnitt
        titel="Dein Profil"
        beschreibung="Dein Name steht auf Bestellbestätigungen und Lieferscheinen."
      >
        <div className="konto-karte">
          <form className="konto-form">
            <div className="konto-form__paar">
              <label htmlFor="vorschauVorname">
                <span>Vorname</span>
                <input
                  id="vorschauVorname"
                  name="vorschauVorname"
                  type="text"
                  defaultValue="Christian"
                />
              </label>
              <label htmlFor="vorschauNachname">
                <span>Nachname</span>
                <input
                  id="vorschauNachname"
                  name="vorschauNachname"
                  type="text"
                  defaultValue="Muster"
                />
              </label>
            </div>
            <KontoErfolg>Gespeichert.</KontoErfolg>
            <div className="konto-form__knoepfe">
              <button className="konto-cta konto-cta--breit" type="button">
                Speichern
              </button>
            </div>
          </form>
        </div>
      </KontoAbschnitt>

      <KontoAbschnitt
        titel="Deine Adressen"
        beschreibung="An diese Adressen liefern wir. Du kannst eine davon als Standard festlegen."
      >
        <div className="konto-karte">
          <AdressLese
            name="Christian Muster"
            zeilen={['Musterstraße 1', '10115 Berlin', 'DE']}
            istStandard
          />
          <details className="konto-aufklappen">
            <summary>Adresse bearbeiten</summary>
            <div className="konto-aufklappen__inhalt">
              <form className="konto-form">
                <label htmlFor="vorschauStrasse">
                  <span>Straße und Hausnummer</span>
                  <input
                    id="vorschauStrasse"
                    name="vorschauStrasse"
                    type="text"
                    defaultValue="Musterstraße 1"
                  />
                </label>
                <div className="konto-form__paar">
                  <label htmlFor="vorschauPlz">
                    <span>Postleitzahl</span>
                    <input
                      id="vorschauPlz"
                      name="vorschauPlz"
                      type="text"
                      defaultValue="10115"
                    />
                  </label>
                  <label htmlFor="vorschauStadt">
                    <span>Stadt</span>
                    <input
                      id="vorschauStadt"
                      name="vorschauStadt"
                      type="text"
                      defaultValue="Berlin"
                    />
                  </label>
                </div>
                <div className="konto-form__schalter">
                  <input
                    id="vorschauStandard"
                    name="vorschauStandard"
                    type="checkbox"
                    defaultChecked
                  />
                  <label htmlFor="vorschauStandard">
                    Als Standardadresse verwenden
                  </label>
                </div>
                <KontoFehler>
                  Diese Postleitzahl kennen wir nicht. Bitte prüf sie noch einmal.
                </KontoFehler>
                <div className="konto-form__knoepfe">
                  <button className="konto-cta" type="button">
                    Speichern
                  </button>
                  <button
                    className="konto-cta konto-cta--gefahr"
                    type="button"
                  >
                    Löschen
                  </button>
                </div>
              </form>
            </div>
          </details>
        </div>
      </KontoAbschnitt>

      <KontoAbschnitt titel="Leerzustand">
        <KontoLeer
          text="Hier ist noch nichts. Sobald du bestellst, findest du jede Bestellung an dieser Stelle wieder — mit Status und Versandinfo."
          ctaText="Produkte ansehen"
          ctaZu="/collections"
        />
      </KontoAbschnitt>
    </KontoRahmen>
  );
}
