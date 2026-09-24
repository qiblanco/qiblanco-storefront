/*
 * /pages/affiliate-partnerprogramm — die Erklärseite des Partnerprogramms.
 *
 * AUFTRAG (Christian 2026-09-24, Job 20260924-bau-partner-werden-erst-
 * erklaerseite-mit-freude-dann-anmeldung): „Partner werden" im Menü führt
 * zuerst hierher. Die Seite erklärt die Idee, die Vorteile und den Ablauf
 * mit echten Bildern, „mit viel Freude, mit viel Leidenschaft", und erst
 * unten steht der Knopf zur Anmeldung im Partnerportal. Bis dahin sprang das
 * Menü direkt ins Formular.
 *
 * WARUM DIESE ADRESSE UND KEINE NEUE: die Seite ist seit dem 2026-09-05
 * indexiert, steht in der Sitemap (Shopify-Seitenobjekt + NUR_ROUTE_SEITEN)
 * und wird von zwei stehenden Proben gewacht (Routen-Marker, Provisionssatz,
 * Formular-Link, canonical). Eine zweite Adresse wie /pages/partner-werden
 * hätte zwei Seiten zur selben Frage erzeugt. Begründung, Abgrenzung zu
 * /pages/partner und die Sitemap-Naht stehen im Kopf der Route.
 *
 * INHALTS-DISZIPLIN: Jede Zahl und jede Bedingung stammt aus dem
 * Vendor-Portal (Anmeldeseite aff.revolution.qiblanco.com/register samt der
 * Partnerprogramm-AGB, Stand April 2026, erhoben am 2026-09-05):
 *   10 % Provision auf den Netto-Warenwert          (AGB § 4, § 7)
 *   eigener 5-%-Gutscheincode für die Community     (Anmeldeseite)
 *   Empfehlungslink mit 30 Tagen Zuordnung          (Anmeldeseite)
 *   Code liegt beim Aufruf mit sca_ref im Warenkorb (PR #616, am Rand gemessen)
 *   Teilnahme erst nach Prüfung/Freigabe            (AGB § 2, § 6)
 *   keine Provision auf Eigen- und Firmenkäufe      (AGB § 5)
 *   nur abgeschlossene, nicht widerrufene Käufe     (AGB § 7)
 *   jederzeit ohne Grund kündbar                    (AGB § 9)
 * Das Rechenbeispiel (238 € brutto = 200 € netto = 20 € Provision) ist reine
 * Arithmetik mit 19 % Mehrwertsteuer, kein Preis aus dem Shop.
 *
 * KEINE PRODUKT-WIRKAUSSAGEN. Der Leser ist ein möglicher Partner, kein
 * Käufer. Die Produktkarten nennen, was man in der Hand hält, und verlinken
 * auf die Produktseiten, statt Aussagen von dort zu wiederholen.
 *
 * BILDER: nur Bestand vom Shopify-CDN (GL-PRO-0015), über CdnBild mit
 * Bildleiter und festen Maßen. Die Instagram-Aufnahme stammt aus dem
 * Testimonial-Korpus (app/data/ig-testimonials.js); die Nutzungsrechte sind
 * dort vermerkt, der Name steht unter dem Bild.
 *
 * DESIGN: geteilte Token-Quelle styles/schlaf-zellen-schutz.css (Scope .lp-a3)
 * + lp-pp-*-Regeln aus affiliate-partnerprogramm.css (Ablauf, Fragen,
 * Partnerkonto-Zeile) + eigene lp-pw-*-Regeln in partner-werden.css. Die
 * geteilte Datei affiliate-partnerprogramm.css bleibt unberührt, weil
 * /pages/partner-details sie ebenfalls lädt.
 */
import {CdnBild} from '~/components/reusables/CdnBild';

const FORMULAR = 'https://aff.revolution.qiblanco.com/register';
/* Das Login desselben Partnerportals. Gemessen 2026-09-08: HTTP 200, Titel
   "Qi Blanco® UG (haftungsbeschränkt) | Login", kein Redirect. Die nahe-
   liegenden Nachbarpfade sind TOT und dürfen hier nie stehen: /account,
   /dashboard und /signin geben je 410, /affiliate/login gibt 403. */
const PARTNERKONTO = 'https://aff.revolution.qiblanco.com/login';
const HILFESEITE = '/pages/partner-details';
const KONTAKT = 'info@qiblanco.com';

const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/';

/*
 * Die Bilder. `masterBreite` ist die echte Breite der Masterdatei, am
 * 2026-09-24 am CDN nachgemessen; sie klemmt die Bildleiter, damit keine
 * Sprosse versprochen wird, die das CDN nur mit dem Master beantwortet.
 */
const BILD = {
  hero: {
    src: `${CDN}2024-06-qiblanco-bali-06610.jpg?v=1738529250`,
    alt: 'Zwei Menschen lachen in einem Café und zeigen sich etwas auf Tablet und Laptop',
    breite: 1200,
    hoehe: 800,
    masterBreite: 6000,
  },
  idee: {
    src: `${CDN}2022-07-26-qiblanco-berlin-1001190-Kopie-1024x589_jpg.webp?v=1666617198`,
    alt: 'Frau mit gelber Tasse lächelt mit geschlossenen Augen in die Sonne',
    breite: 1024,
    hoehe: 589,
    masterBreite: 1024,
  },
  community: {
    src: `${CDN}qb-themen--themen-zellen-qibracelet-gruensaft-canggu-06390--b4ab3f9b62c8.webp?v=1790161977`,
    alt: 'Hand mit QiBracelet hält ein Glas grünen Saft, draußen im Grünen',
    breite: 1200,
    hoehe: 800,
    masterBreite: 2400,
  },
  // Dasselbe Foto wie 2024-06-qiblanco-bali-05984.webp, aber als 2400-px-
  // Master: die 940-px-Fassung reicht auf Tablet und Handy nicht für 2x
  // (hb-formate bild-aufloesung, gemessen 2026-09-24).
  werkzeuge: {
    src: `${CDN}qb-themen--themen-esmog-laptop-bali-05984--f786b6fa5b29.webp?v=1790161971`,
    alt: 'Frau sitzt mit dem Laptop auf dem Sofa und schreibt',
    breite: 2400,
    hoehe: 1471,
    masterBreite: 2400,
  },
  team: {
    src: `${CDN}Christian.jpg?v=1668985845`,
    alt: 'Christian Bernd Bauer, Gründer von Qi Blanco',
    breite: 1200,
    hoehe: 1535,
    masterBreite: 1200,
  },
  online: {
    src: `${CDN}qb-ig-testimonials--ig-dzpdupbu-i--dd93ce088f50.jpg?v=1789161030`,
    alt: 'Frau sitzt im Garten und erzählt in einem Instagram-Video, dass sie das QiBracelet trägt',
    breite: 640,
    hoehe: 1136,
    masterBreite: 640,
  },
  sport: {
    src: `${CDN}2023-06-qiblanco-kitzbuehel-10.webp?v=1738529579`,
    alt: 'Mann sitzt nach dem Sport im Gras, am einen Handgelenk die Uhr, am anderen das QiBracelet',
    breite: 668,
    hoehe: 350,
    masterBreite: 668,
  },
  familie: {
    src: `${CDN}2023-03-01-qiblanco-milva-martin-1020791_1_0f03ee06-6ad1-4997-9182-3685335eb04c.webp?v=1738063344`,
    alt: 'Älteres Paar liegt entspannt im Bett und lächelt sich an',
    breite: 1714,
    hoehe: 964,
    masterBreite: 1714,
  },
  abschluss: {
    src: `${CDN}2022-11-02-qiblanco-bracelet-L1010739_1.webp?v=1676979374`,
    alt: 'Drei QiBracelet® aus gebürstetem Edelstahl, ineinandergelegt auf dunklem Untergrund',
    breite: 2333,
    hoehe: 3500,
    masterBreite: 2333,
  },
};

/*
 * `sizes` je Akt, abgeleitet aus dem Layout in partner-werden.css und der
 * Token-Quelle (Sektion polstert --a-s3 = 24 px je Seite, Container
 * --a-breite 1080 bzw. --a-breite-schmal 760). Stimmt `sizes` nicht mit dem
 * Layout überein, zieht der Browser eine zu kleine Sprosse und das Bild wird
 * hochskaliert; genau das hat hb-formate im ersten Lauf auf Tablet und Handy
 * gemeldet.
 *   halb      Hero, Idee: zwei Spalten ab 768 px ((1080 - 64) / 2 = 508)
 *   karte     drei Spalten ab 901 px (344), waagerecht 768-900 px
 *             (40 % von 760 = 304), darunter volle Breite
 *   ort       wie karte, aber auch unter 768 px waagerecht (40 %)
 *   produkt   Kachel höchstens 280 px, auf dem Handy ein 96-px-Vorschaubild
 *   abschluss 5/12 des Containers ab 768 px ((1080 - 64) * 5 / 12 = 424)
 */
const SIZES = {
  halb: '(min-width: 768px) 508px, calc(100vw - 48px)',
  karte: '(min-width: 901px) 344px, (min-width: 768px) 304px, calc(100vw - 48px)',
  ort: '(min-width: 901px) 344px, (min-width: 768px) 304px, calc((100vw - 48px) * 0.4)',
  produkt: '(min-width: 768px) 280px, 96px',
  abschluss: '(min-width: 768px) 424px, calc(100vw - 48px)',
};

const PRODUKTE = [
  {
    name: 'QiOne® 2 Pro',
    text: 'Der kleine Anhänger, an der Kette nah am Körper getragen.',
    pfad: '/products/qione-2-pro',
    bild: {
      src: `${CDN}QiOne2Pro_mit-Siegel_2a003117-6b48-42ea-be23-c237a78215db.webp?v=1673788196`,
      alt: 'QiOne® 2 Pro',
      breite: 1080,
      hoehe: 1080,
      masterBreite: 1080,
    },
  },
  {
    name: 'QiBracelet®',
    text: 'Der Armreif aus gebürstetem Edelstahl, gemacht für jeden Tag.',
    pfad: '/products/qibracelet',
    bild: {
      src: `${CDN}2022-11-02-qiblanco-bracelet-L1010711-min-819x1024.jpg_1_967270d0-a41c-4da4-8539-498fdbb832a6.webp`,
      alt: 'QiBracelet® auf seinem Ständer mit dem Qi-Blanco-Zeichen',
      breite: 819,
      hoehe: 1024,
      masterBreite: 819,
    },
  },
  {
    name: 'QiHome® Air',
    text: 'Der Würfel mit Holzdeckel für Wohnung, Haus, Schlafzimmer und Büro.',
    pfad: '/products/qihome-air',
    bild: {
      src: `${CDN}QiHomeAir-Front-Alpha-Web2_1024x1024_741c3ad5-b5f7-49bf-89d4-c9b4a961545b.webp`,
      alt: 'QiHome® Air, ein heller Würfel mit Holzdeckel und goldenem Punkt',
      breite: 1024,
      hoehe: 906,
      masterBreite: 1024,
    },
  },
];

/**
 * Die Fragen stehen EINMAL hier und werden zweimal gelesen: sichtbar von
 * dieser Komponente und als FAQPage-Auszeichnung von der Route. Zwei Listen
 * würden auseinanderdriften, und strukturierte Daten, die etwas anderes
 * sagen als die Seite, sind ein Richtlinienverstoß.
 */
export const FRAGEN = [
  {
    frage: 'Wie werde ich Partner von Qi Blanco?',
    antwort:
      'Du meldest dich im Partnerportal von Qi Blanco an und trägst Name, ' +
      'Kontakt, deine Kanäle und den Wunschnamen für deinen Gutscheincode ' +
      'ein. Wir sehen uns jede Anmeldung an und schalten dein Partnerkonto ' +
      'nach der Prüfung frei. Die Teilnahme ist kostenlos.',
  },
  {
    frage: 'Wie hoch ist die Provision im Qi Blanco Partnerprogramm?',
    antwort:
      'Du erhältst 10 % Provision auf den Netto-Warenwert jedes vermittelten ' +
      'Kaufs, also ohne Mehrwertsteuer und ohne Versandkosten. Ein Beispiel: ' +
      'Ein Einkauf über 238 € inklusive 19 % Mehrwertsteuer sind 200 € ' +
      'Netto-Warenwert, du bekommst also 20 €. Der Satz gilt für alle ' +
      'Partner, ohne Staffel und ohne Mindestumsatz.',
  },
  {
    frage: 'Was hat meine Community davon?',
    antwort:
      'Mit deinem persönlichen Gutscheincode spart deine Community 5 %. ' +
      'Kommt jemand über deinen Empfehlungslink in den Shop, liegt dein Code ' +
      'schon im Warenkorb.',
  },
  {
    frage: 'Was kostet die Teilnahme?',
    antwort:
      'Nichts. Die Teilnahme am Partnerprogramm ist kostenlos, und du gehst ' +
      'keine Mindestlaufzeit ein. Beide Seiten können jederzeit ohne Angabe ' +
      'von Gründen kündigen.',
  },
  {
    frage: 'Wie lange wird ein Kauf mir zugeordnet?',
    antwort:
      'Dein Empfehlungslink setzt ein Cookie mit 30 Tagen Laufzeit. Kauft ' +
      'jemand innerhalb dieser 30 Tage, wird der Verkauf dir zugeordnet, ' +
      'auch wenn er erst ein paar Tage später bestellt. Käufe nach Ablauf ' +
      'der Laufzeit können nicht mehr zugeordnet werden.',
  },
  {
    frage: 'Wann und wie wird ausgezahlt?',
    antwort:
      'Provisionen werden gutgeschrieben, sobald der Kauf abgeschlossen und ' +
      'nicht widerrufen ist. Die Auszahlung läuft über PayPal oder ' +
      'Banküberweisung; dafür hinterlegst du eine Rechnungsadresse und deine ' +
      'Zahlungsverbindung im Partnerkonto.',
  },
  {
    frage: 'Bekomme ich Provision auf meine eigenen Bestellungen?',
    antwort:
      'Nein. Provision gibt es für Empfehlungen an andere. Eigenkäufe, ' +
      'Bestellungen deiner eigenen Firma oder verbundener Unternehmen und ' +
      'die systematische Eigennutzung deines Codes sind ausgeschlossen.',
  },
  {
    frage: 'Wird jede Anmeldung angenommen?',
    antwort:
      'Jede Anmeldung wird von uns geprüft, und einen Anspruch auf Zulassung ' +
      'gibt es nicht. Du erfährst nach der Prüfung, ob dein Partnerkonto ' +
      'freigeschaltet ist.',
  },
  {
    frage: 'Wo finde ich meinen Link und meinen Code?',
    antwort:
      'Nach der Freischaltung im Partnerkonto. Wie du Link, Code und ' +
      'QR-Code auf Instagram, im Newsletter, im Podcast oder in deiner Praxis ' +
      'einsetzt, zeigt dir die Hilfeseite für Partner Schritt für Schritt, ' +
      'mit fertigen Beispieltexten zum Kopieren.',
  },
];

/** Stand der Konditionen, sichtbar und im JSON-LD (dateModified). */
export const STAND = {iso: '2026-09-24', text: '24. September 2026'};

const ECKDATEN = [
  {wert: '10 %', titel: 'Provision', text: 'auf den Netto-Warenwert jedes Kaufs über dich'},
  {wert: '5 %', titel: 'für deine Community', text: 'mit deinem eigenen Gutscheincode'},
  {wert: '30 Tage', titel: 'Zuordnung', text: 'auch wenn erst später bestellt wird'},
  {wert: '0 €', titel: 'Kosten', text: 'kostenlos und jederzeit kündbar'},
];

const SCHRITTE = [
  {
    titel: 'Anmelden',
    text:
      'Du füllst das Formular im Partnerportal aus: Name, Kontakt, deine ' +
      'Kanäle und den Wunschnamen für deinen Code. Das dauert ein paar Minuten.',
  },
  {
    titel: 'Freischaltung',
    text:
      'Wir sehen uns deine Anmeldung an und schalten dein Partnerkonto frei. ' +
      'Du bekommst Bescheid, sobald es losgehen kann.',
  },
  {
    titel: 'Teilen',
    text:
      'Im Partnerkonto liegen dein Link, dein Code und deine Zahlen. Du teilst ' +
      'dort, wo du ohnehin unterwegs bist.',
  },
  {
    titel: 'Provision erhalten',
    text:
      'Jeder abgeschlossene Kauf über dich wird dir gutgeschrieben und per ' +
      'PayPal oder Überweisung ausgezahlt.',
  },
];

/* ───────── Hero: Menschen zuerst, die Zahlen gleich dahinter ───────── */
function Hero() {
  return (
    <section
      className="lp-a-hero"
      aria-labelledby="lp-pw-hero-title"
      data-section="lp-pw-hero"
    >
      <div className="lp-a-hero__inner lp-pw-hero__inner">
        <div className="lp-a-hero__copy">
          <span className="lp-a-hero__eyebrow">Partnerprogramm</span>
          <h1 id="lp-pw-hero-title" className="lp-a-hero__title">
            Werde Partner von Qi&nbsp;Blanco und teile, was dich begeistert.
          </h1>
          <p className="lp-a-hero__subline">
            Du erzählst gern von Qi Blanco? Dann mach mehr daraus. Deine
            Community spart mit deinem Code 5&nbsp;%, und du bekommst
            10&nbsp;% Provision auf jeden Kauf, der über dich kommt.
          </p>
          <div className="lp-a-hero__cta-row lp-pw-hero__knoepfe">
            <a className="lp-vp-btn lp-vp-btn--lg" href="#anmeldung">
              Partner werden
            </a>
            <a className="lp-vp-btn lp-vp-btn--secondary" href="#so-gehts">
              So funktioniert es
            </a>
          </div>
          <ul className="lp-a-hero__trust">
            <li>Kostenlos</li>
            <li>Jederzeit kündbar</li>
            <li>Auszahlung per PayPal oder Überweisung</li>
          </ul>
          <p className="lp-pp-konto">
            Schon Partner? Im{' '}
            <a href={PARTNERKONTO} rel="noopener">
              Partnerkonto
            </a>{' '}
            liegen dein Link, dein Code und deine Zahlen.{' '}
            <a href={HILFESEITE}>So setzt du deine Links ein</a>.
          </p>
        </div>
        <figure className="lp-pw-hero__bild">
          <CdnBild
            {...BILD.hero}
            anzeigeBreite={552}
            sizes={SIZES.halb}
            loading="eager"
          />
        </figure>
      </div>
    </section>
  );
}

/* ───────── Die Idee ───────── */
function Idee() {
  return (
    <section aria-labelledby="lp-pw-idee-title" data-section="lp-pw-idee">
      <span className="eyebrow">Die Idee</span>
      <h2 id="lp-pw-idee-title">
        Was ist die Idee hinter dem Partnerprogramm?
      </h2>
      <div className="lp-pw-zwei">
        <figure className="lp-pw-zwei__bild">
          <CdnBild
            {...BILD.idee}
            anzeigeBreite={552}
            sizes={SIZES.halb}
            loading="lazy"
          />
        </figure>
        <div className="lp-pw-zwei__text">
          <p className="lp-pw-leitsatz">
            Die schönste Empfehlung kommt von jemandem, der etwas selbst
            erlebt hat.
          </p>
          <p>
            Wer Qi Blanco trägt, wird danach gefragt: beim Abendessen, im
            Studio, nach einer Story. Deine Antwort überzeugt, weil sie aus
            deinem Alltag kommt und nicht aus einer Anzeige.
          </p>
          <p>
            Dafür gibt es das Partnerprogramm. Wir arbeiten am liebsten mit
            Menschen, die Qi Blanco selbst leben und gern weitergeben. Du
            bringst deine Erfahrung und deine Community mit, wir bringen den
            Rest: deinen eigenen Code, fertige Links und 10&nbsp;% Provision.
          </p>
          <p>
            Deine Leute bekommen einen Rabatt von jemandem, dem sie vertrauen.
            Und du wirst für etwas belohnt, das du ohnehin gern tust.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ───────── Vorteile: Eckdaten + drei Bildkarten ───────── */
function Vorteile() {
  const karten = [
    {
      marke: 'Für deine Community',
      titel: 'Du empfiehlst mit einem Geschenk in der Hand',
      text:
        'Du bekommst einen persönlichen Gutscheincode und wählst seinen ' +
        'Namen selbst. Wer ihn nutzt, spart 5 %. Kommt jemand über deinen ' +
        'Link, liegt der Code schon im Warenkorb.',
      bild: BILD.community,
    },
    {
      marke: 'Fertig vorbereitet',
      titel: 'Alles, was du zum Teilen brauchst',
      text:
        'Im Link-Baukasten baust du Links zu jedem Produkt. Dazu gibt es ' +
        'einen QR-Code für Flyer, Visitenkarte und Praxis und Beispieltexte ' +
        'für Instagram, Newsletter und WhatsApp.',
      bild: BILD.werkzeuge,
      link: {href: HILFESEITE, text: 'Zur Hilfeseite für Partner'},
    },
    {
      marke: 'Persönlich',
      titel: 'Wir sind für dich da',
      text:
        'Du hast einen direkten Draht zu uns. Wir helfen dir beim Start und ' +
        'schauen mit dir hin, wenn ein Link einmal nicht tut, was er soll.',
      bild: BILD.team,
      bildKlasse: 'lp-pw-karte__bild--portrait',
      link: {href: `mailto:${KONTAKT}`, text: KONTAKT},
    },
  ];
  return (
    <section aria-labelledby="lp-pw-vorteile-title" data-section="lp-pw-vorteile">
      <span className="eyebrow">Deine Vorteile</span>
      <h2 id="lp-pw-vorteile-title">Was habe ich als Partner davon?</h2>
      <ul className="lp-pw-eckdaten">
        {ECKDATEN.map((e) => (
          <li className="lp-pw-eckdatum" key={e.titel}>
            <span className="lp-pw-eckdatum__wert">{e.wert}</span>
            <span className="lp-pw-eckdatum__titel">{e.titel}</span>
            <span className="lp-pw-eckdatum__text">{e.text}</span>
          </li>
        ))}
      </ul>
      <div className="lp-pw-karten">
        {karten.map((k) => (
          <article className="lp-pw-karte" key={k.titel}>
            <figure className={`lp-pw-karte__bild ${k.bildKlasse || ''}`}>
              <CdnBild
                {...k.bild}
                anzeigeBreite={552}
                sizes={SIZES.karte}
                loading="lazy"
              />
            </figure>
            <div className="lp-pw-karte__text">
              <span className="lp-pw-marke">{k.marke}</span>
              <h3>{k.titel}</h3>
              <p>{k.text}</p>
              {k.link ? (
                <a className="lp-pw-link" href={k.link.href}>
                  {k.link.text}
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ───────── Rechenbeispiel ───────── */
function Verdienst() {
  return (
    <section aria-labelledby="lp-pw-verdienst-title" data-section="lp-pw-verdienst">
      <span className="eyebrow">Rechenbeispiel</span>
      <h2 id="lp-pw-verdienst-title">Was verdiene ich als Partner?</h2>
      <p className="lp-vp-section__lede">
        Du bekommst 10&nbsp;% vom Netto-Warenwert, also vom Einkauf ohne
        Mehrwertsteuer und ohne Versand. An einem Beispiel:
      </p>
      <ol className="lp-pw-rechnung">
        <li className="lp-pw-rechnung__schritt">
          <span className="lp-pw-rechnung__zahl">238&nbsp;€</span>
          <span className="lp-pw-rechnung__text">
            kauft jemand über deinen Link ein, inklusive 19&nbsp;% Mehrwertsteuer
          </span>
        </li>
        <li className="lp-pw-rechnung__schritt">
          <span className="lp-pw-rechnung__zahl">200&nbsp;€</span>
          <span className="lp-pw-rechnung__text">sind davon der Netto-Warenwert</span>
        </li>
        <li className="lp-pw-rechnung__schritt lp-pw-rechnung__schritt--ziel">
          <span className="lp-pw-rechnung__zahl">20&nbsp;€</span>
          <span className="lp-pw-rechnung__text">bekommst du als Provision</span>
        </li>
      </ol>
      <p className="lp-a-note">
        Der Satz gilt für alle Partner, ohne Staffel und ohne Mindestumsatz.
        Gutgeschrieben wird, sobald der Kauf abgeschlossen und nicht widerrufen
        ist.
      </p>
    </section>
  );
}

/* ───────── Was empfehle ich? ───────── */
function Produkte() {
  return (
    <section aria-labelledby="lp-pw-produkte-title" data-section="lp-pw-produkte">
      <span className="eyebrow">Das empfiehlst du</span>
      <h2 id="lp-pw-produkte-title">Was empfehle ich als Partner?</h2>
      <p className="lp-vp-section__lede">
        Im Link-Baukasten führst du deine Leute direkt zu dem Produkt, von dem
        du erzählst.
      </p>
      <div className="lp-pw-produkte">
        {PRODUKTE.map((p) => (
          <a className="lp-pw-produkt" href={p.pfad} key={p.pfad}>
            <span className="lp-pw-produkt__bild">
              <CdnBild
                {...p.bild}
                anzeigeBreite={280}
                sizes={SIZES.produkt}
                loading="lazy"
              />
            </span>
            <span className="lp-pw-produkt__wort">
              <span className="lp-pw-produkt__name">{p.name}</span>
              <span className="lp-pw-produkt__text">{p.text}</span>
            </span>
          </a>
        ))}
      </div>
      <p className="lp-a-note">
        Wer tiefer einsteigen will, findet die{' '}
        <a href="/pages/studien">Studien zu unseren Produkten</a> und die{' '}
        <a href="/pages/warum-qi-blanco">Geschichte hinter Qi Blanco</a>.
      </p>
    </section>
  );
}

/* ───────── Ablauf ───────── */
function Ablauf() {
  return (
    <section
      id="so-gehts"
      aria-labelledby="lp-pw-ablauf-title"
      data-section="lp-pw-ablauf"
    >
      <span className="eyebrow">In vier Schritten</span>
      <h2 id="lp-pw-ablauf-title">Wie werde ich Partner von Qi Blanco?</h2>
      <ol className="lp-pp-schritte">
        {SCHRITTE.map((s, i) => (
          <li className="lp-pp-schritt" key={s.titel}>
            <span className="lp-pp-schritt__nr" aria-hidden="true">
              {i + 1}
            </span>
            <div className="lp-pp-schritt__text">
              <h3>{s.titel}</h3>
              <p>{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ───────── Wo teile ich meinen Link? ───────── */
function Kanaele() {
  const orte = [
    {
      titel: 'Online',
      text:
        'Auf Instagram, TikTok, YouTube oder im Newsletter: Link in die Bio ' +
        'oder unter das Video, Code in den Text.',
      bild: BILD.online,
      bildKlasse: 'lp-pw-ort__bild--hoch',
      quelle: 'Instagram-Beitrag von @desiree_witschel',
    },
    {
      titel: 'Beim Sport und im Studio',
      text:
        'Im Gespräch nach dem Training reicht dein Code. Auf Flyer und ' +
        'Aufsteller kommt dein QR-Code.',
      bild: BILD.sport,
    },
    {
      titel: 'Mit Familie und Freunden',
      text:
        'Eine Nachricht mit deinem Link genügt. Wer ihn öffnet, hat deinen ' +
        'Rabatt schon im Warenkorb.',
      bild: BILD.familie,
    },
  ];
  return (
    <section aria-labelledby="lp-pw-kanaele-title" data-section="lp-pw-kanaele">
      <span className="eyebrow">Wo Empfehlungen entstehen</span>
      <h2 id="lp-pw-kanaele-title">Wo teile ich meinen Link?</h2>
      <p className="lp-vp-section__lede">
        Überall dort, wo du ohnehin von Qi Blanco erzählst.
      </p>
      <div className="lp-pw-orte">
        {orte.map((o) => (
          <article className="lp-pw-ort" key={o.titel}>
            <figure className={`lp-pw-ort__bild ${o.bildKlasse || ''}`}>
              <CdnBild
                {...o.bild}
                anzeigeBreite={344}
                sizes={SIZES.ort}
                loading="lazy"
              />
            </figure>
            <h3>{o.titel}</h3>
            <p>{o.text}</p>
            {o.quelle ? <p className="lp-pw-quelle">{o.quelle}</p> : null}
          </article>
        ))}
      </div>
      <p className="lp-a-note">
        Jeden Kanal Schritt für Schritt, mit fertigen Texten zum Kopieren,
        zeigt dir die <a href={HILFESEITE}>Hilfeseite für Partner</a>.
      </p>
    </section>
  );
}

/* ───────── Fragen ───────── */
function Fragen() {
  return (
    <section aria-labelledby="lp-pw-faq-title" data-section="lp-pw-faq">
      <span className="eyebrow">Häufige Fragen</span>
      <h2 id="lp-pw-faq-title">Häufige Fragen zum Partnerprogramm</h2>
      <dl className="lp-pp-faq">
        {FRAGEN.map((f) => (
          <div className="lp-pp-faq__item" key={f.frage}>
            <dt>{f.frage}</dt>
            <dd>{f.antwort}</dd>
          </div>
        ))}
      </dl>
      <p className="lp-a-note">
        Stand der Konditionen: <time dateTime={STAND.iso}>{STAND.text}</time>.
        Die vollständigen Teilnahmebedingungen findest du im Anmeldeformular.
      </p>
    </section>
  );
}

/* ───────── Anmeldung: der Hauptknopf steht am Ende ───────── */
function Anmeldung() {
  return (
    <section
      id="anmeldung"
      className="lp-vp-final-cta"
      aria-labelledby="lp-pw-cta-title"
      data-section="lp-pw-anmeldung"
    >
      <div className="lp-vp-final-cta__inner">
        <figure className="lp-pw-abschluss__bild">
          <CdnBild
            {...BILD.abschluss}
            anzeigeBreite={552}
            sizes={SIZES.abschluss}
            loading="lazy"
          />
        </figure>
        <div className="lp-vp-final-cta__body">
          <span className="eyebrow">Anmeldung</span>
          <h2 id="lp-pw-cta-title">Leg los und werde Partner</h2>
          <p className="lp-vp-final-cta__lede">
            Die Anmeldung dauert ein paar Minuten. Danach sehen wir uns deine
            Angaben an und schalten dein Partnerkonto frei. Wir freuen uns auf
            dich.
          </p>
          <a
            className="lp-vp-btn lp-vp-btn--lg"
            href={FORMULAR}
            target="_blank"
            rel="noopener"
          >
            Jetzt Partner werden
          </a>
          <p className="lp-pw-hinweis">
            Das Formular öffnet sich in einem neuen Fenster im Partnerportal
            von Qi Blanco.
          </p>
          <ul className="lp-vp-final-cta__trust">
            <li>10 % Provision</li>
            <li>5 % für deine Community</li>
            <li>30 Tage Zuordnung</li>
            <li>Jederzeit kündbar</li>
          </ul>
          <p className="lp-pp-konto lp-pp-konto--dunkel">
            Schon angemeldet?{' '}
            <a href={PARTNERKONTO} rel="noopener">
              Zum Partnerkonto
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

export function AffiliatePartnerprogramm() {
  return (
    <div
      className="lp-vp lp-a3 lp-pp lp-pw"
      data-qbp-route="affiliate-partnerprogramm"
    >
      <Hero />
      <Idee />
      <Vorteile />
      <Verdienst />
      <Produkte />
      <Ablauf />
      <Kanaele />
      <Fragen />
      <Anmeldung />
    </div>
  );
}
