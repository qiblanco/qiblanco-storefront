import {Form} from 'react-router';
import {WITHDRAWAL_PRODUCTS} from '~/lib/withdrawal';

export const meta = () => [
  {title: 'Vertrag widerrufen | Qi Blanco'},
  {
    name: 'description',
    content:
      'Online-Widerruf für Qi Blanco Bestellungen ohne Kundenkonto oder Login.',
  },
  {rel: 'canonical', href: '/widerruf'},
];

export function loader() {
  return {};
}

export default function WithdrawalPage() {
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
            name="company"
            tabIndex={-1}
            type="text"
          />

          <label>
            <span>Bestellnummer</span>
            <input
              autoComplete="off"
              maxLength={80}
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
              name="email"
              placeholder="name@example.com"
              required
              type="email"
            />
          </label>

          <label>
            <span>Produkt / Vertrag</span>
            <select name="product" required defaultValue="">
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
