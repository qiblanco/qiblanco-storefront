import {KontoAbschnitt, KontoLeer} from '~/components/konto/KontoUI';

/**
 * Darstellung des Partnerbereichs (/account/partner).
 *
 * REGEL WIE IN KontoUI.jsx: hier steht keine Datenbeschaffung, nur Darstellung
 * aus Props. Die Daten holt der Loader der Route beim Datendienst des Servers
 * (partnerbereich), der das Shopify-Kundentoken selbst prüft und nur den
 * Datensatz der bestätigten Mailadresse zurückgibt.
 *
 * Beträge sind eine Lesekopie aus UpPromote mit Zeitstempel. Gerechnet und
 * ausgezahlt wird dort; deshalb steht neben den Zahlen der Weg zu UpPromote.
 */

const EUR = new Intl.NumberFormat('de-DE', {style: 'currency', currency: 'EUR'});
const ZAHL = new Intl.NumberFormat('de-DE');
const STAND = new Intl.DateTimeFormat('de-DE', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Europe/Berlin',
});
const TAG = new Intl.DateTimeFormat('de-DE', {dateStyle: 'medium', timeZone: 'UTC'});

const STATUS_TEXT = {pending: 'offen', approved: 'freigegeben', paid: 'ausgezahlt'};

function geld(wert) {
  return EUR.format(Number(wert) || 0);
}

function tag(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? iso : TAG.format(d);
}

export function standText(iso) {
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(d.getTime()) ? `${STAND.format(d)} Uhr` : 'unbekannt';
}

function Kachel({wert, text}) {
  return (
    <div className="partner-kachel">
      <span className="partner-kachel__wert">{wert}</span>
      <span className="partner-kachel__text">{text}</span>
    </div>
  );
}

/** Abschnitt 1: Kennzahlen aus UpPromote. */
export function PartnerZahlen({konto, stand, veraltet, portal}) {
  const v = konto.verkaeufe || {};
  const p = konto.provision || {};
  const klicks = konto.klicks;
  const letzte = v.letzte || [];
  return (
    <KontoAbschnitt
      titel="Deine Zahlen"
      beschreibung={`Stand ${standText(stand)}. Auszahlung und Kontodaten verwaltest du in UpPromote.`}
    >
      {veraltet ? (
        <p className="konto-fehler" role="status">
          Diese Zahlen sind älter als sechs Stunden. Den aktuellen Stand zeigt UpPromote.
        </p>
      ) : null}
      <div className="partner-kacheln">
        <Kachel
          wert={klicks ? ZAHL.format(klicks.tage_30 || 0) : '–'}
          text="Klicks, 30 Tage"
        />
        <Kachel wert={ZAHL.format(v.tage_30?.anzahl || 0)} text="Verkäufe, 30 Tage" />
        <Kachel wert={geld(p.offen)} text="Provision offen" />
        <Kachel wert={geld(p.freigegeben)} text="Provision freigegeben" />
        <Kachel wert={geld(p.ausgezahlt)} text="Bereits ausgezahlt" />
      </div>
      <p className="partner-luft">
        Seit {tag(konto.seit)}: {ZAHL.format(v.gesamt || 0)} Verkäufe über deinen Code oder Link,{' '}
        {geld(v.umsatz_gesamt)} Umsatz. In 90 Tagen: {ZAHL.format(v.tage_90?.anzahl || 0)} Verkäufe
        {klicks ? `, ${ZAHL.format(klicks.tage_90 || 0)} Klicks` : ''}.
      </p>
      {letzte.length ? (
        <div className="konto-karte partner-luft">
          <h3 className="konto-karte__titel">Letzte Verkäufe</h3>
          <ul className="partner-liste">
            {letzte.map((z, i) => (
              <li key={`${z.datum}-${i}`} className="partner-liste__zeile">
                <span>{tag(z.datum)}</span>
                <span>{geld(z.betrag)}</span>
                <span>Provision {geld(z.provision)}</span>
                <span className="konto-merker">{STATUS_TEXT[z.status] || z.status}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="konto-form__knoepfe--luft">
        <a className="konto-cta konto-cta--sekundaer" href={portal} rel="noopener">
          Zu UpPromote: Auszahlung und Kontodaten
        </a>
      </div>
    </KontoAbschnitt>
  );
}

/** Abschnitt 2: Sales-Kit mit persönlichem Link je Produkt. */
export function PartnerKit({konto, provisionProzent}) {
  const links = (konto.links || []).filter((l) => l.link);
  return (
    <KontoAbschnitt
      titel="Dein Sales-Kit"
      beschreibung="Fertige Sätze, Bilder und Links mit deiner Kennung. Erzähl dazu, was du selbst erlebst."
    >
      <div className="konto-karte">
        <h3 className="konto-karte__titel">Dein Link und dein Code</h3>
        {konto.link ? <p className="partner-code">{konto.link}</p> : null}
        {(konto.codes || []).map((c) => (
          <p key={c} className="partner-code">
            {c}
          </p>
        ))}
        {provisionProzent ? (
          <p className="konto-meta">
            {provisionProzent} % Provision auf jedes Produkt, auch auf Crystal Cacao®.
          </p>
        ) : null}
      </div>
      <div className="partner-produkte partner-luft">
        {links.map((l) => (
          <article key={l.name} className="konto-karte partner-produkt">
            {l.bild ? (
              <img
                className="partner-produkt__bild"
                src={l.bild}
                alt={l.name}
                loading="lazy"
                width="160"
                height="160"
              />
            ) : null}
            <div>
              <h3 className="konto-karte__titel">{l.name}</h3>
              <p>{l.kurztext}</p>
              <p className="partner-code">{l.link}</p>
            </div>
          </article>
        ))}
      </div>
    </KontoAbschnitt>
  );
}

/** Abschnitt 3: Einstieg zum Seitencheck. */
export function PartnerSeitencheck({seitencheck}) {
  const url = seitencheck?.url;
  return (
    <KontoAbschnitt
      titel="Seitencheck"
      beschreibung="Wir prüfen deine Seite auf Verkauf, Design, SEO, Sichtbarkeit in KI-Antworten und Technik. Du bekommst die Auswertung als PDF."
    >
      {url ? (
        <a className="konto-cta" href={url} rel="noopener">
          Meine Seite prüfen lassen
        </a>
      ) : (
        <p className="konto-meta">Der Seitencheck kommt in Kürze an diese Stelle.</p>
      )}
    </KontoAbschnitt>
  );
}

/** Kein Partnerkonto unter der angemeldeten Adresse. */
export function PartnerKeinKonto() {
  return (
    <KontoAbschnitt titel="Partnerbereich">
      <KontoLeer
        text="Mit dieser E-Mail-Adresse ist kein Partnerkonto verbunden. Melde dich mit der Adresse an, die du in unserem Partnerprogramm nutzt."
        ctaText="Zum Partnerprogramm"
        ctaZu="/pages/affiliate-partnerprogramm"
      />
    </KontoAbschnitt>
  );
}

/** Datendienst nicht erreichbar: keine Zahlen, kein Raten. */
export function PartnerStoerung() {
  return (
    <KontoAbschnitt titel="Partnerbereich">
      <p className="konto-fehler" role="alert">
        Deine Zahlen sind gerade nicht erreichbar. Versuch es in ein paar Minuten noch einmal.
      </p>
    </KontoAbschnitt>
  );
}
