import {Form} from 'react-router';
import {useAktionsergebnisUeberRevalidierung} from '~/lib/aktionsergebnis';
import {canonicalLink} from '~/lib/seo';
import {seitenSignale} from '~/lib/seiten-seo';
import {
  WITHDRAWAL_HONEYPOT_FIELD,
  WITHDRAWAL_PRODUCTS,
  validateWithdrawalFormData,
} from '~/lib/withdrawal';

const PFAD = '/widerruf';
const TITEL = 'Vertrag widerrufen | Qi Blanco';
const BESCHREIBUNG =
  'Online-Widerruf für Qi Blanco Bestellungen ohne Kundenkonto oder Login.';

/**
 * Teilbild und strukturierte Daten (Job 20260912-sieben-indexierbare-seiten-
 * ohne-sitemap-und-ohne-auszeichnung-prio22). Der Canonical stand schon hier.
 *
 * Diese Seite gehört zur Rechtstext-Klasse und SOLL gefunden werden: "Qi
 * Blanco Widerruf" ist eine echte Suche, und die Seite ist der Weg, sie ohne
 * Kundenkonto zu erledigen. Am 2026-09-12 trug sie kein og:image und kein
 * JSON-LD. *
 * DIESE ROUTE LIEGT AB HIER IN DER IMPORT-CLOSURE VON app/lib/seiten-seo.js.
 * Der Kopf jener Datei sagt, sie werde "ausschließlich von den /pages-Routen"
 * importiert -- das gilt seit diesem Commit nicht mehr, und das ist keine
 * Nebenbemerkung: hb-deploy Gate 12 loest eine geaenderte geteilte Datei über
 * ihre Import-Closure auf. Wer seiten-seo.js aendert, braucht ab jetzt auch
 * für diese Seite einen gueltigen Formate-Nachweis. Der Satz dort wird bewusst
 * NICHT nachgezogen: eine Kommentar-Aenderung an seiten-seo.js zieht ihrerseits
 * alle 31 /pages-Routen in dieselbe Prüfung, also genau den Preis, vor dem der
 * Satz warnt. Der Hinweis steht deshalb hier, beim neuen Importeur.
 */
export const meta = () => [
  {title: TITEL},
  {name: 'description', content: BESCHREIBUNG},
  canonicalLink(PFAD),
  ...seitenSignale({pfad: PFAD, titel: TITEL, beschreibung: BESCHREIBUNG}),
];

export function loader() {
  return {};
}

/**
 * "ANGABEN ÄNDERN" KOMMT HIERHER ZURÜCK, MIT DEN WERTEN IM POST-RUMPF (Job
 * 20261001-widerruf-angaben-aendern-leert-das-formular-prio40).
 *
 * Bis dahin war "Angaben ändern" auf /widerruf/bestaetigen ein Link auf
 * diese Seite, und alle Felder standen leer: gemessen am 2026-10-01 in
 * Firefox und Chromium, 4 von 4 Feldern. Wer einen Tippfehler korrigieren
 * wollte, tippte alles neu.
 *
 * WARUM POST UND NICHT ?orderNumber=...: Query-Parameter landen im
 * page_view der Analytics, im Referrer und in Zugriffslogs Dritter. Der
 * POST-Rumpf geht nur an unseren Server, die URL bleibt /widerruf. Ohne
 * JavaScript funktioniert es genauso (echtes Formular).
 *
 * Die Aktion sendet nichts und speichert nichts. Sie bereinigt die Werte mit
 * derselben Funktion wie die Bestätigungsseite und gibt sie zurück. Prüft die
 * Bereinigung Fehler, ist das hier egal: der Kunde will ja gerade korrigieren.
 * Ein Produktwert außerhalb der Liste wird leer, damit die Auswahl ehrlich
 * "Bitte auswählen" zeigt.
 *
 * Probe: homepage-bauer/pruefungen/probe_widerruf_angaben_aendern_vorbelegt.py
 */
export async function action({request}) {
  const {values} = validateWithdrawalFormData(await request.formData());
  return {
    werte: {
      ...values,
      product: WITHDRAWAL_PRODUCTS.some((p) => p.value === values.product)
        ? values.product
        : '',
    },
  };
}

export default function WithdrawalPage() {
  // Über die Revalidierung der Cookie-Wahl gehalten: sonst setzt React die
  // noch unberührten Felder auf den leeren defaultValue zurück.
  const werte = useAktionsergebnisUeberRevalidierung()?.werte || {};

  return (
    <main className="withdrawal-page">
      <section className="withdrawal-hero">
        <p className="withdrawal-kicker">Online-Widerruf</p>
        <h1>Vertrag widerrufen</h1>
        <p>
          Hier kannst du den Widerruf zu deiner Qi Blanco Bestellung online
          erklären. Du brauchst kein Kundenkonto und keinen Login.
        </p>
      </section>

      <section className="withdrawal-panel" aria-labelledby="withdrawal-form">
        <h2 id="withdrawal-form">Angaben zum Widerruf</h2>
        <p>
          Nach dem Ausfüllen kommst du auf eine separate Bestätigungsseite.
          Erst der zweite Klick sendet den Widerruf verbindlich ab.
        </p>

        <Form
          action="/widerruf/bestaetigen"
          className="withdrawal-form"
          method="post"
          noValidate
        >
          <input
            aria-hidden="true"
            autoComplete="off"
            className="withdrawal-honeypot"
            name={WITHDRAWAL_HONEYPOT_FIELD}
            tabIndex={-1}
            type="text"
          />

          <label>
            <span>Bestellnummer</span>
            <input
              autoComplete="off"
              maxLength={80}
              defaultValue={werte.orderNumber || ''}
              name="orderNumber"
              placeholder="#1001"
              required
              type="text"
            />
          </label>

          <label>
            <span>Name</span>
            <input
              autoComplete="name"
              maxLength={120}
              defaultValue={werte.name || ''}
              name="name"
              placeholder="Vor- und Nachname"
              required
              type="text"
            />
          </label>

          <label>
            <span>E-Mail für die Eingangsbestätigung</span>
            <input
              autoComplete="email"
              maxLength={254}
              defaultValue={werte.email || ''}
              name="email"
              placeholder="name@example.com"
              required
              type="email"
            />
          </label>

          <label>
            <span>Produkt / Vertrag</span>
            <select
              name="product"
              required
              defaultValue={werte.product || ''}
            >
              <option disabled value="">
                Bitte auswählen
              </option>
              {WITHDRAWAL_PRODUCTS.map((product) => (
                <option key={product.value} value={product.value}>
                  {product.label}
                </option>
              ))}
            </select>
          </label>

          <button className="withdrawal-button" type="submit">
            Weiter zur Bestätigung
          </button>
        </Form>
      </section>
    </main>
  );
}
