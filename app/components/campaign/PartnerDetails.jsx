/*
 * /pages/partner-details — Hilfe für angemeldete Partner (Job 20260924-
 * GROSSJOB-partnerlinks-sauber-in-die-kasse-partnerseite-und-mail-an-elina).
 * Begründung, Abgrenzung und noindex stehen im Kopf der Route.
 *
 * INHALTS-DISZIPLIN, jede Aussage am 2026-09-24 gemessen:
 *   Rabattlink /discount/<CODE>?redirect=<pfad>&sca_ref=<ref>: Code liegt in
 *     der Kasse, Kassen-URL trägt sca_ref (Playwright, bis vor die Zahlung).
 *   Empfehlungslink ?sca_ref=: Zuordnung ja, Code NICHT automatisch
 *     (gemessen mit erlaubten UpPromote-Aufrufen, Test-Partner).
 *   Kassen-/Warenkorb-Adressen: eingebettet net::ERR_BLOCKED_BY_RESPONSE.
 *   Kasse zeigt netto + "Geschätzte Steuern", Endbetrag = Seitenpreis
 *     (shop.taxesIncluded=false, Admin-API).
 *   10 % auf den Netto-Warenwert ohne Steuern und Versand, PayPal oder Bank
 *     (UpPromote GET /programs: exclude_product_tax, exclude_shipping).
 *
 * KEINE PRODUKT-WIRKAUSSAGEN: der Leser ist Partner, kein Käufer.
 * DESIGN: Token-Quelle styles/schlaf-zellen-schutz.css (.lp-a3), lp-pp-* aus
 * affiliate-partnerprogramm.css, additive lp-pd-* in partner-details.css.
 */
import {useState} from 'react';

const PARTNERKONTO = 'https://aff.revolution.qiblanco.com/login';
const KONTAKT = 'info@qiblanco.com';

const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/';

/* Bildschirmfotos vom 2026-09-24 (Test-Partner, Code und Referenz
   unkenntlich). Breite/Höhe = Pixelmaß der Datei, gegen Layout-Sprung. */
const BILDER = {
  konto: {
    src: `${CDN}qb-partner-details--partner-details-01-partnerkonto-login--535fa00def01.webp?v=1790255474`,
    alt: 'Anmeldeseite des Qi Blanco Partnerkontos',
    w: 1280,
    h: 800,
  },
  konditionen: {
    src: `${CDN}qb-partner-details--partner-details-02-partnerprogramm--f67abced6296.webp?v=1790255477`,
    alt: 'Die Konditionen des Partnerprogramms: 10 % Provision, eigener 5-%-Code, 30 Tage Zuordnung',
    w: 1280,
    h: 800,
  },
  produkt: {
    src: `${CDN}qb-partner-details--partner-details-03-produktseite-handy--7c73f0dbd60f.webp?v=1790255480`,
    alt: 'Produktseite QiOne 2 Pro auf dem Handy, geöffnet über einen Rabattlink',
    w: 780,
    h: 1688,
  },
  warenkorb: {
    src: `${CDN}qb-partner-details--partner-details-04-warenkorb-handy--1a24160c2ce2.webp?v=1790255483`,
    alt: 'Warenkorb auf dem Handy, der Rabatt ist schon abgezogen',
    w: 780,
    h: 1688,
  },
  kasse: {
    src: `${CDN}qb-partner-details--partner-details-05-kasse-mit-code--e49584edad73.webp?v=1790255486`,
    alt: 'Kasse mit angewendetem Partnercode und Abzug von 5 Prozent',
    w: 490,
    h: 380,
  },
  codefeld: {
    src: `${CDN}qb-partner-details--partner-details-06-kasse-code-eingeben--fa3641c1419a.webp?v=1790255489`,
    alt: 'Kasse ohne Code, das Feld Rabattcode oder Gutschein ist markiert',
    w: 490,
    h: 350,
  },
  eingebettet: {
    src: `${CDN}qb-partner-details--partner-details-07-eingebettet-weiter--87832b8614f0.webp?v=1790255492`,
    alt: 'Ein eingebetteter Link zeigt den Knopf Jetzt öffnen statt einer Fehlermeldung',
    w: 1100,
    h: 700,
  },
};

const ZIELE = [
  {pfad: '/products/qione-2-pro', name: 'QiOne® 2 Pro'},
  {pfad: '/products/qibracelet', name: 'QiBracelet'},
  {pfad: '/products/qihome-air', name: 'QiHome Air'},
  {pfad: '/pages/studien', name: 'Studien'},
  {pfad: '/', name: 'Startseite'},
];

const LINKARTEN = [
  {
    titel: 'Rabattlink',
    marke: 'Unsere Empfehlung',
    text:
      'Dein Code liegt sofort im Warenkorb, und der Kauf wird dir ' +
      'zugeordnet. Für Posts, Stories, Newsletter und deine Website.',
    beispiel:
      'qiblanco.com/discount/DEINCODE?redirect=/products/qione-2-pro&sca_ref=DEINE-REFERENZ',
  },
  {
    titel: 'Empfehlungslink aus dem Partnerkonto',
    text:
      'Ordnet dir jeden Kauf 30 Tage lang zu. Den Rabatt gibt dein Kunde ' +
      'in der Kasse selbst als Code ein.',
    beispiel: 'qiblanco.com/?sca_ref=DEINE-REFERENZ',
  },
  {
    titel: 'Dein Code allein',
    text:
      'Für Gespräche, Podcasts und Videos. Dein Kunde tippt ihn in der ' +
      'Kasse in das Feld „Rabattcode oder Gutschein“. Zugeordnet wird der ' +
      'Kauf über den Code.',
    beispiel: 'DEINCODE',
  },
  {
    titel: 'Diese Adressen bitte nicht teilen',
    warnung: true,
    text:
      'Adressen aus der Kasse oder dem Warenkorb zeigen auf einen einzelnen ' +
      'Warenkorb. Sie laufen ab und öffnen sich in Vorschauen und ' +
      'eingebetteten Bausteinen nicht.',
    beispiel: 'checkout.qiblanco.com/…  ·  qiblanco.com/cart/…',
  },
];

const HILFE = [
  {
    frage: 'Die Seite öffnet sich nicht, es steht „hat die Verbindung abgelehnt“.',
    antwort:
      'Der Link wurde eingebettet geöffnet, etwa in einer Vorschau oder ' +
      'einem Website-Baustein. Setze ihn als normalen Link. Seit dem ' +
      '24. September zeigt ein eingebetteter Link statt des Fehlers einen ' +
      'Knopf „Jetzt öffnen“, der den Shop in einem eigenen Fenster öffnet. ' +
      'Kassen- und Warenkorb-Adressen bleiben eingebettet gesperrt, das ' +
      'legt Shopify fest.',
    bild: 'eingebettet',
  },
  {
    frage: 'In der Kasse fehlt der Rabatt.',
    antwort:
      'Nutze den Rabattlink aus dem Baukasten. Oder dein Kunde gibt den Code ' +
      'in der Kasse in das Feld „Rabattcode oder Gutschein“ ein und tippt ' +
      'auf „Anwenden“.',
    bild: 'codefeld',
  },
  {
    frage: 'Der Link wird in Instagram, TikTok oder Facebook geöffnet.',
    antwort:
      'Diese Apps öffnen Links in einem eigenen kleinen Browser. Dort gehen ' +
      'Rabatt und Zuordnung manchmal verloren. Empfiehl deinen Leuten ' +
      '„Im Browser öffnen“ über die drei Punkte oben rechts. Der Code ' +
      'funktioniert in jedem Fall.',
  },
  {
    frage: 'Ein Kauf wurde mir nicht zugeordnet.',
    antwort:
      'Die Zuordnung über den Link gilt 30 Tage im selben Browser auf ' +
      'demselben Gerät. Wer am Handy klickt und später am Laptop kauft, wird ' +
      'dir über den Code zugeordnet. Deshalb gehört der Code in jede ' +
      'Empfehlung.',
  },
  {
    frage: 'Ich will meinen Link selbst testen.',
    antwort:
      'Öffne ihn einmal im normalen Browser und einmal in einem privaten ' +
      'Fenster und geh bis in die Kasse. Dort siehst du deinen Code mit dem ' +
      'Abzug. Eigene Käufe bringen keine Provision, der Rabatt greift ' +
      'trotzdem.',
  },
];

function Bild({name, klasse}) {
  const b = BILDER[name];
  return (
    <img
      className={klasse}
      src={b.src}
      alt={b.alt}
      width={b.w}
      height={b.h}
      loading="lazy"
      decoding="async"
    />
  );
}

/* Referenz aus einem eingefügten Link oder als nackter Wert. */
function referenzAus(eingabe) {
  const text = (eingabe || '').trim();
  const treffer = text.match(/sca_ref=([0-9]+\.[A-Za-z0-9]+)/);
  if (treffer) return treffer[1];
  return /^[0-9]+\.[A-Za-z0-9]+$/.test(text) ? text : '';
}

function codeAus(eingabe) {
  const text = (eingabe || '').trim();
  return /^[A-Za-z0-9_-]{2,40}$/.test(text) ? text : '';
}

/* Baut den Rabattlink. Exportiert für den Test. */
export function baueRabattlink(code, referenzEingabe, pfad) {
  const c = codeAus(code);
  if (!c) return {link: '', hinweis: 'Trag deinen Gutscheincode ein.'};
  const ref = referenzAus(referenzEingabe);
  const ziel = ZIELE.some((z) => z.pfad === pfad) ? pfad : '/';
  let link =
    `https://qiblanco.com/discount/${encodeURIComponent(c)}` +
    `?redirect=${ziel}`;
  if (ref) link += `&sca_ref=${ref}`;
  const hinweis = ref
    ? 'Fertig: Rabatt und Zuordnung stecken im Link.'
    : 'Ohne Empfehlungslink kommt der Rabatt an, zugeordnet wird dann über den Code.';
  return {link, hinweis};
}

function Baukasten() {
  const [code, setCode] = useState('');
  const [referenz, setReferenz] = useState('');
  const [pfad, setPfad] = useState(ZIELE[0].pfad);
  const [kopiert, setKopiert] = useState(false);
  const {link, hinweis} = baueRabattlink(code, referenz, pfad);

  function kopieren() {
    if (!link || typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }
    navigator.clipboard.writeText(link).then(
      () => setKopiert(true),
      () => setKopiert(false),
    );
  }

  return (
    <div className="lp-pd-baukasten" data-lp-pd-baukasten>
      <label className="lp-pd-feld">
        <span>Dein Gutscheincode</span>
        <input
          type="text"
          value={code}
          autoComplete="off"
          spellCheck="false"
          placeholder="zum Beispiel DEINCODE"
          onChange={(e) => {
            setCode(e.target.value);
            setKopiert(false);
          }}
        />
      </label>
      <label className="lp-pd-feld">
        <span>Dein Empfehlungslink aus dem Partnerkonto</span>
        <input
          type="text"
          value={referenz}
          autoComplete="off"
          spellCheck="false"
          placeholder="https://qiblanco.com/?sca_ref=…"
          onChange={(e) => {
            setReferenz(e.target.value);
            setKopiert(false);
          }}
        />
      </label>
      <label className="lp-pd-feld">
        <span>Wohin soll der Link führen?</span>
        <select
          value={pfad}
          onChange={(e) => {
            setPfad(e.target.value);
            setKopiert(false);
          }}
        >
          {ZIELE.map((z) => (
            <option key={z.pfad} value={z.pfad}>
              {z.name}
            </option>
          ))}
        </select>
      </label>
      <div className="lp-pd-ergebnis" aria-live="polite">
        <code data-lp-pd-link>{link || '…'}</code>
        <button
          type="button"
          className="lp-vp-btn"
          onClick={kopieren}
          disabled={!link}
        >
          {kopiert ? 'Kopiert' : 'Link kopieren'}
        </button>
      </div>
      <p className="lp-pd-hinweis">{hinweis}</p>
      <p className="lp-pd-hinweis">
        Der Baukasten rechnet nur in deinem Browser und speichert nichts.
      </p>
    </div>
  );
}

function Hero() {
  return (
    <section
      className="lp-a-hero"
      aria-labelledby="lp-pd-hero-title"
      data-section="lp-pd-hero"
    >
      <div className="lp-a-hero__inner lp-pd-hero__inner">
        <div className="lp-a-hero__copy">
          <span className="lp-a-hero__eyebrow">Für Partner</span>
          <h1 id="lp-pd-hero-title" className="lp-a-hero__title">
            Dein Link bringt Rabatt und Provision sicher in die Kasse.
          </h1>
          <ul className="lp-a-hero__dreizeiler">
            <li>Welcher Link wofür.</li>
            <li>So sieht es dein Kunde.</li>
            <li>Was du tust, wenn etwas hakt.</li>
          </ul>
          <p className="lp-a-hero__subline">
            Deine Empfehlung soll zweimal ankommen: bei deinen Leuten als
            5&nbsp;% Rabatt und bei dir als Provision. Die Bilder zeigen jeden
            Schritt so, wie ihn dein Kunde sieht.
          </p>
          <div className="lp-pd-hero__knoepfe">
            <a className="lp-vp-btn lp-vp-btn--lg" href="#baukasten">
              Rabattlink bauen
            </a>
            <a className="lp-pd-textlink" href={PARTNERKONTO} rel="noopener">
              Zum Partnerkonto
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Konto() {
  return (
    <section aria-labelledby="lp-pd-konto-title" data-section="lp-pd-konto">
      <span className="eyebrow">Dein Partnerkonto</span>
      <h2 id="lp-pd-konto-title">Link, Code und Zahlen liegen im Partnerkonto</h2>
      <div className="lp-pd-zweispaltig">
        <div className="lp-pd-text">
          <p>
            Du meldest dich unter{' '}
            <a href={PARTNERKONTO} rel="noopener">
              aff.revolution.qiblanco.com
            </a>{' '}
            an. Dort findest du deinen Empfehlungslink, deinen Gutscheincode,
            deine vermittelten Käufe und deine Auszahlungen.
          </p>
          <p>
            Den Empfehlungslink und den Code brauchst du gleich im Baukasten.
          </p>
        </div>
        <figure className="lp-pd-bild">
          <Bild name="konto" />
          <figcaption>Die Anmeldung zum Partnerkonto.</figcaption>
        </figure>
      </div>
    </section>
  );
}

function Linkarten() {
  return (
    <section aria-labelledby="lp-pd-links-title" data-section="lp-pd-links">
      <span className="eyebrow">Linkarten</span>
      <h2 id="lp-pd-links-title">Welcher Link wofür</h2>
      <div className="lp-pd-karten">
        {LINKARTEN.map((l) => (
          <article
            className={`lp-a-benefit${l.warnung ? ' lp-pd-karte--warnung' : ''}`}
            key={l.titel}
          >
            {l.marke ? <span className="lp-pd-marke">{l.marke}</span> : null}
            <h3 className="lp-vp-benefit__title">{l.titel}</h3>
            <p className="lp-vp-benefit__body">{l.text}</p>
            <code className="lp-pd-beispiel">{l.beispiel}</code>
          </article>
        ))}
      </div>
    </section>
  );
}

function BaukastenSektion() {
  return (
    <section
      id="baukasten"
      aria-labelledby="lp-pd-baukasten-title"
      data-section="lp-pd-baukasten"
    >
      <span className="eyebrow">Link-Baukasten</span>
      <h2 id="lp-pd-baukasten-title">Deinen Rabattlink in zehn Sekunden bauen</h2>
      <p className="lp-vp-section__lede">
        Code eintragen, Empfehlungslink einfügen, Ziel wählen. Der fertige
        Link bringt deinen Rabatt in den Warenkorb und den Kauf zu dir.
      </p>
      <Baukasten />
    </section>
  );
}

function Kunde() {
  return (
    <section aria-labelledby="lp-pd-kunde-title" data-section="lp-pd-kunde">
      <span className="eyebrow">Beim Kunden</span>
      <h2 id="lp-pd-kunde-title">So sieht es dein Kunde</h2>
      <div className="lp-pd-schritte">
        <figure className="lp-pd-bild lp-pd-bild--handy">
          <Bild name="produkt" />
          <figcaption>1. Dein Rabattlink öffnet die Produktseite.</figcaption>
        </figure>
        <figure className="lp-pd-bild lp-pd-bild--handy">
          <Bild name="warenkorb" />
          <figcaption>2. Im Warenkorb ist dein Rabatt schon abgezogen.</figcaption>
        </figure>
        <figure className="lp-pd-bild">
          <Bild name="kasse" />
          <figcaption>
            3. In der Kasse steht dein Code mit dem Abzug von 5&nbsp;%.
          </figcaption>
        </figure>
      </div>
      <p className="lp-a-note">
        Die Kasse zeigt die Preise zurzeit ohne Mehrwertsteuer und rechnet sie
        als „Geschätzte Steuern“ dazu. Der Endbetrag ist der Preis der
        Produktseite abzüglich deines Rabatts. Fragt dich jemand danach, kannst
        du genau das sagen.
      </p>
    </section>
  );
}

function Provision() {
  return (
    <section
      aria-labelledby="lp-pd-provision-title"
      data-section="lp-pd-provision"
    >
      <span className="eyebrow">Provision</span>
      <h2 id="lp-pd-provision-title">Provision und Auszahlung</h2>
      <div className="lp-pd-zweispaltig">
        <ul className="lp-pp-liste lp-pp-liste--ja">
          <li>10&nbsp;% auf den Netto-Warenwert, also ohne Steuern und Versand.</li>
          <li>
            Gutgeschrieben wird, sobald der Kauf abgeschlossen und nicht
            widerrufen ist.
          </li>
          <li>
            Ausgezahlt wird per PayPal oder Banküberweisung. Die Verbindung
            hinterlegst du im Partnerkonto.
          </li>
          <li>Deine vermittelten Käufe und dein Guthaben siehst du im Partnerkonto.</li>
        </ul>
        <figure className="lp-pd-bild">
          <Bild name="konditionen" />
          <figcaption>
            Die Konditionen im Überblick auf{' '}
            <a href="/pages/affiliate-partnerprogramm">
              der Seite zum Partnerprogramm
            </a>
            .
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function Hilfe() {
  return (
    <section aria-labelledby="lp-pd-hilfe-title" data-section="lp-pd-hilfe">
      <span className="eyebrow">Hilfe</span>
      <h2 id="lp-pd-hilfe-title">Wenn es nicht funktioniert</h2>
      <dl className="lp-pp-faq lp-pd-hilfe">
        {HILFE.map((h) => (
          <div className="lp-pp-faq__item" key={h.frage}>
            <dt>{h.frage}</dt>
            <dd>
              {h.antwort}
              {h.bild ? (
                <figure className="lp-pd-bild lp-pd-bild--klein">
                  <Bild name={h.bild} />
                </figure>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Kontakt() {
  return (
    <section
      className="lp-vp-final-cta"
      aria-labelledby="lp-pd-kontakt-title"
      data-section="lp-pd-kontakt"
    >
      <div className="lp-pp-cta__inner">
        <span className="eyebrow">Kontakt</span>
        <h2 id="lp-pd-kontakt-title">Wir helfen dir weiter</h2>
        <p className="lp-vp-final-cta__lede">
          Schreib uns den Link, den du nutzt, und wo du ihn geteilt hast. Dann
          sagen wir dir, woran es liegt.
        </p>
        <a className="lp-vp-btn lp-vp-btn--lg" href={`mailto:${KONTAKT}`}>
          {KONTAKT}
        </a>
        <p className="lp-pp-konto lp-pp-konto--dunkel">
          <a href={PARTNERKONTO} rel="noopener">
            Zum Partnerkonto
          </a>
        </p>
      </div>
    </section>
  );
}

export function PartnerDetails() {
  return (
    <div className="lp-vp lp-a3 lp-pp lp-pd" data-qbp-route="partner-details">
      <Hero />
      <Konto />
      <Linkarten />
      <BaukastenSektion />
      <Kunde />
      <Provision />
      <Hilfe />
      <Kontakt />
    </div>
  );
}
