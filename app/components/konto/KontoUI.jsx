import {Form, NavLink} from 'react-router';

/**
 * Präsentations-Bausteine der Konto-Fläche (/account/*).
 *
 * REGEL DIESES FILES: hier steht KEIN Aufruf von context.customerAccount und
 * keine Datenbeschaffung — nur Darstellung aus Props. Das ist der Grund, warum
 * es dieses File gibt: die echten Konto-Routen sind ohne Customer-Account-API-
 * Credentials nicht renderbar (Hydrogen wirft dort absichtlich 500), und die
 * Credentials setzt Christian erst im Folge-Segment s03. Weil die Darstellung
 * hier von der Datenbeschaffung getrennt ist, kann die Vorschau-Route
 * (routes/konto-vorschau.jsx, nur im Dev-Modus erreichbar) EXAKT dieses Markup
 * mit Fixture-Daten rendern und messbar machen.
 *
 * GRENZE DIESES BELEGS, ausdrücklich: ein Score gegen die Vorschau misst
 * Markup und CSS, NICHT die ausgelieferte Seite — nicht den echten Loader-Pfad,
 * nicht die realen Datenformen, nicht die Konsole des Auth-Flusses. Er wird
 * deshalb unter eigenem Slug geführt und erfüllt das Beauty-Gate für /account/*
 * NICHT. Das tut erst s03 am angemeldeten Testkonto.
 *
 * Preise kommen als ReactNode (`preis`, `summe`) herein, nicht als Zahl: die
 * echten Routen reichen <Money data={...}/> durch, die Vorschau einen String.
 * So bleibt dieses File frei von Hydrogen-Kontext und in der Vorschau lauffähig.
 */

/** Äußerer Rahmen — trägt den Token-Scope `.konto` (siehe styles/konto.css). */
export function KontoRahmen({eyebrow, titel, lede, children}) {
  return (
    <div className="konto">
      <header className="konto-kopf">
        {eyebrow ? <p className="konto-eyebrow">{eyebrow}</p> : null}
        <h1>{titel}</h1>
        {lede ? <p className="konto-lede">{lede}</p> : null}
      </header>
      {children}
    </div>
  );
}

const NAV_PUNKTE = [
  {zu: '/account/orders', text: 'Bestellungen'},
  {zu: '/account/profile', text: 'Profil'},
  {zu: '/account/addresses', text: 'Adressen'},
];

/**
 * Konto-Navigation. `aktiv` überschreibt die Router-Erkennung — die Vorschau
 * rendert damit einen bestimmten Zustand, ohne die Adresse zu wechseln.
 */
export function KontoNav({aktiv}) {
  const BASIS = 'konto-nav__link';
  const AKTIV = 'konto-nav__link konto-nav__link--aktiv';

  // Ist `aktiv` gesetzt, entscheidet allein die Prop (Vorschau-Fall);
  // sonst entscheidet der Router über isActive (echter Fall).
  function klasseFuer(zu) {
    if (aktiv) return zu === aktiv ? AKTIV : BASIS;
    return ({isActive}) => (isActive ? AKTIV : BASIS);
  }

  return (
    <nav className="konto-nav" role="navigation" aria-label="Konto">
      {NAV_PUNKTE.map((punkt) => (
        <NavLink key={punkt.zu} to={punkt.zu} className={klasseFuer(punkt.zu)} end>
          {punkt.text}
        </NavLink>
      ))}
      <Form
        className="konto-nav__abmelden"
        method="POST"
        action="/account/logout"
      >
        <button className="konto-cta konto-cta--sekundaer" type="submit">
          Abmelden
        </button>
      </Form>
    </nav>
  );
}

/** Fehlermeldung. role="alert" — Screenreader lesen sie ohne Fokuswechsel vor. */
export function KontoFehler({children}) {
  if (!children) return null;
  return (
    <p className="konto-fehler" role="alert">
      {children}
    </p>
  );
}

export function KontoErfolg({children}) {
  if (!children) return null;
  return (
    <p className="konto-erfolg" role="status">
      {children}
    </p>
  );
}

/** Leerzustand — sagt, was als Nächstes geht, statt nur festzustellen. */
export function KontoLeer({text, ctaText, ctaZu}) {
  return (
    <div className="konto-leer">
      <p>{text}</p>
      {ctaText && ctaZu ? (
        <a className="konto-cta" href={ctaZu}>
          {ctaText}
        </a>
      ) : null}
    </div>
  );
}

export function KontoAbschnitt({titel, beschreibung, children}) {
  return (
    <section className="konto-abschnitt">
      {titel ? (
        <div className="konto-abschnitt__kopf">
          <h2>{titel}</h2>
          {beschreibung ? (
            <p className="konto-lede">{beschreibung}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/**
 * Eine Bestellung in der Übersicht.
 * `summe` und `status` sind ReactNode/String — siehe Kopfkommentar.
 */
export function BestellKarte({nummer, datum, status, summe, zu}) {
  return (
    <article className="konto-karte">
      <div className="konto-karte__kopf">
        <h3 className="konto-karte__titel">Bestellung {nummer}</h3>
        {status ? <span className="konto-merker">{status}</span> : null}
      </div>
      <div className="konto-bestellung__zeile">
        <p className="konto-meta">{datum}</p>
        <span className="konto-bestellung__summe">{summe}</span>
      </div>
      <div className="konto-form__knoepfe">
        <a className="konto-cta konto-cta--sekundaer" href={zu}>
          Bestellung ansehen
        </a>
      </div>
    </article>
  );
}

/** Eine Position innerhalb einer Bestellung. */
export function BestellPosten({titel, variante, menge, preis, bild}) {
  return (
    <div className="konto-posten">
      <div className="konto-posten__kopf">
        {bild}
        <div>
          <div className="konto-posten__titel">{titel}</div>
          {variante ? (
            <div className="konto-posten__variante">{variante}</div>
          ) : null}
        </div>
      </div>
      <div className="konto-posten__werte">
        <span>Menge: {menge}</span>
        <span>{preis}</span>
      </div>
    </div>
  );
}

/** Summenblock. `zeilen` = [{text, wert, gesamt?}] */
export function BestellSummen({zeilen}) {
  return (
    <div className="konto-summen">
      {zeilen.map((zeile) => (
        <div
          key={zeile.text}
          className={
            zeile.gesamt
              ? 'konto-summen__zeile konto-summen__zeile--gesamt'
              : 'konto-summen__zeile'
          }
        >
          <span>{zeile.text}</span>
          <span>{zeile.wert}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Störungs-Seite der Konto-Fläche.
 *
 * WARUM ES SIE GIBT: Ohne sie sieht der Kunde bei einem Fehler in /account/*
 * das, was heute live steht — bei /account/login 21 Byte text/plain
 * ("You do not have the valid credential to use Customer Account API"), bei
 * /account/orders die generische "Hoppla"-Seite. Beides sagt ihm nichts
 * darüber, was er jetzt tun kann.
 *
 * BEWUSST OHNE TECHNIK IM TEXT: kein Statuscode, kein "Customer Account API",
 * kein OAuth. Der Kunde bekommt einen Weg (neu versuchen, Startseite,
 * Support), nicht eine Diagnose. Die Diagnose gehört ins Log.
 */
export function KontoStoerung({titel, text}) {
  return (
    <div className="konto">
      <header className="konto-kopf">
        <p className="konto-eyebrow">Dein Konto</p>
        <h1>{titel ?? 'Das hat gerade nicht geklappt'}</h1>
        <p className="konto-lede">
          {text ??
            'Dein Konto ist gerade nicht erreichbar. Das liegt an uns, nicht an dir — versuch es bitte in ein paar Minuten noch einmal.'}
        </p>
      </header>
      <div className="konto-form__knoepfe">
        <a className="konto-cta" href="/account">
          Noch einmal versuchen
        </a>
        <a className="konto-cta konto-cta--sekundaer" href="/">
          Zur Startseite
        </a>
      </div>
      <p className="konto-meta konto-stoerung__hilfe">
        Du brauchst deine Bestellung dringend? Schreib uns über{' '}
        <a href="/pages/support">unseren Support</a> — wir kümmern uns darum.
      </p>
    </div>
  );
}

/** Adresse als Lesefassung. */
export function AdressLese({name, zeilen, istStandard}) {
  return (
    <div className="konto-karte__kopf">
      <div>
        <div className="konto-posten__titel">{name}</div>
        <address className="konto-adresse__text">
          {zeilen.filter(Boolean).map((zeile) => (
            <div key={zeile}>{zeile}</div>
          ))}
        </address>
      </div>
      {istStandard ? (
        <span className="konto-merker konto-merker--gold">Standardadresse</span>
      ) : null}
    </div>
  );
}
