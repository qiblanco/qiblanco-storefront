/*
 * /pages/affiliate-partnerprogramm — die eigene, indexierbare Antwort auf
 * „Qi Blanco Partnerprogramm" (Job 20260905-eigene-indexierbare-partnerseite-
 * statt-vendor-flaeche-prio25). Begründung, Abgrenzung zu /pages/partner und
 * die Sitemap-Naht stehen im Kopf der Route.
 *
 * INHALTS-DISZIPLIN: Jede Zahl und jede Bedingung auf dieser Seite ist am
 * 2026-09-05 aus dem Vendor-Portal selbst erhoben (Anmeldeseite
 * aff.revolution.qiblanco.com/register samt der dort hinterlegten
 * Partnerprogramm-AGB, Stand April 2026) — hier wird NICHTS erfunden und
 * nichts aufgerundet:
 *   10 % Provision auf den Netto-Warenwert          (AGB § 4, § 7)
 *   eigener 5-%-Gutscheincode für die Community     (Anmeldeseite)
 *   Tracking-Link mit automatischem Rabatt, 30 Tage (Anmeldeseite)
 *   Teilnahme erst nach Prüfung/Freigabe            (AGB § 2, § 6)
 *   keine Provision auf Eigen- und Firmenkäufe      (AGB § 5)
 *   nur abgeschlossene, nicht widerrufene Käufe     (AGB § 7)
 *   jederzeit ohne Grund kündbar                    (AGB § 9)
 *
 * KEINE PRODUKT-WIRKAUSSAGEN. Diese Seite verkauft kein Produkt, sie erklärt
 * ein Programm — der Leser ist ein möglicher Partner, kein Käufer. Studien,
 * Wirkmechanismus und Produktversprechen gehören auf die Produkt- und
 * Studienseiten und sind hier bewusst weggelassen (KWD-0001 Frage 3: was ihn
 * NICHT interessiert). Verlinkt wird dorthin, statt es zu wiederholen.
 *
 * DESIGN: geteilte Token-Quelle styles/schlaf-zellen-schutz.css (Scope
 * .lp-a3) + additive lp-pp-*-Klassen. Alle Werte aus den :root-Tokens.
 */

const FORMULAR = 'https://aff.revolution.qiblanco.com/register';

// Bestands-Asset vom Shopify-CDN (dieselbe Datei, die /pages/partner als
// Hero-Rückfall nutzt) — GL-PRO-0015: Medien liegen auf dem CDN, nie im Repo.
//
// MIT `width=` AUSGELIEFERT, nicht in Originalgröße: der Alle-Formate-Lauf
// (bin/hb-formate, Prüfpunkt `bild-ueberaufloesung`) hat am 2026-09-05 in
// allen elf Formaten gemessen, dass die 1080-px-Quelle auf einer 423-px-
// Fläche landet — Ladezeit ohne Gegenwert. Zwei Breiten als srcset: 440 für
// Standard-Displays, 880 für Retina. Damit `sizes` in JEDEM Format stimmt,
// deckelt die CSS die Anzeigefläche bei 440 px — sonst zieht ein 600-px-Handy
// bei 100vw das 440er Bild auf 600 px auf und wird sichtbar unscharf (genau
// dieser Blocker, gemessen im Format mobil-600 am 2026-09-05).
const HERO_BASIS =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/' +
  'QiOne2Pro_mit-Siegel_2a003117-6b48-42ea-be23-c237a78215db.webp?v=1673788196';
const HERO_IMG = `${HERO_BASIS}&width=880`;
const HERO_SRCSET = `${HERO_BASIS}&width=440 440w, ${HERO_BASIS}&width=880 880w`;

/**
 * Die Fragen stehen EINMAL hier und werden zweimal gelesen: sichtbar von
 * dieser Komponente und als FAQPage-Auszeichnung von der Route. Zwei Listen
 * würden auseinanderdriften — und strukturierte Daten, die etwas anderes
 * sagen als die Seite, sind ein Richtlinienverstoß, keine Unsauberkeit.
 */
export const FRAGEN = [
  {
    frage: 'Wie hoch ist die Provision im Qi Blanco Partnerprogramm?',
    antwort:
      'Du erhältst 10 % Provision auf den Netto-Warenwert jedes vermittelten ' +
      'Verkaufs. Netto heißt: ohne Steuern und ohne Versandkosten. Der Satz ' +
      'ist für alle Partner gleich, es gibt keine Staffel und keine ' +
      'Mindestumsätze.',
  },
  {
    frage: 'Was kostet die Teilnahme?',
    antwort:
      'Nichts. Die Teilnahme am Partnerprogramm ist kostenlos, und du gehst ' +
      'keine Mindestlaufzeit ein — beide Seiten können jederzeit ohne Angabe ' +
      'von Gründen kündigen.',
  },
  {
    frage: 'Wie lange wird ein Klick mir zugeordnet?',
    antwort:
      'Dein Tracking-Link setzt ein Cookie mit 30 Tagen Laufzeit. Kauft ' +
      'jemand innerhalb dieser 30 Tage, wird der Verkauf dir zugeordnet — ' +
      'auch dann, wenn er erst ein paar Tage später bestellt. Käufe nach ' +
      'Ablauf der Cookie-Laufzeit können nicht mehr zugeordnet werden.',
  },
  {
    frage: 'Bekomme ich Provision auf meine eigenen Bestellungen?',
    antwort:
      'Nein. Provision gibt es ausschließlich für Empfehlungen an Dritte. ' +
      'Eigenkäufe, Bestellungen deiner eigenen Firma oder verbundener ' +
      'Unternehmen und die systematische Eigennutzung deines Codes sind ' +
      'ausgeschlossen. Der Rabatt aus deinem Code greift dabei weiterhin — ' +
      'nur eine Provision entsteht daraus nicht.',
  },
  {
    frage: 'Wann wird ausgezahlt?',
    antwort:
      'Provisionen werden gutgeschrieben, sobald der Kauf abgeschlossen und ' +
      'nicht widerrufen ist. Die Auszahlung läuft über PayPal oder ' +
      'Banküberweisung; dafür hinterlegst du eine gültige Rechnungsadresse ' +
      'und Zahlungsverbindung in deinem Partnerkonto.',
  },
  {
    frage: 'Wird jede Anmeldung angenommen?',
    antwort:
      'Nein. Jede Anmeldung wird von uns geprüft, und wir behalten uns vor, ' +
      'Anmeldungen abzulehnen. Einen Anspruch auf Zulassung gibt es nicht. ' +
      'Du erfährst nach der Prüfung, ob dein Partnerkonto freigeschaltet ist.',
  },
];

const VORTEILE = [
  {
    titel: '10 % auf den Netto-Warenwert',
    text:
      'Für jeden Kauf, der über deinen Link oder deinen Code zustande kommt, ' +
      'bekommst du 10 % des Netto-Warenwerts. Ein Satz für alle, ohne Staffel ' +
      'und ohne Mindestumsatz.',
  },
  {
    titel: 'Dein eigener 5-%-Code',
    text:
      'Du bekommst einen persönlichen Gutscheincode, den du selbst benennen ' +
      'kannst. Wer ihn nutzt, spart 5 % — du empfiehlst also nicht mit leeren ' +
      'Händen, sondern gibst deiner Community etwas mit.',
  },
  {
    titel: '30 Tage Zuordnung',
    text:
      'Dein Tracking-Link zieht den Rabatt automatisch. Wer darüber kommt, ' +
      'bleibt dir 30 Tage lang zugeordnet — auch wenn er erst ein paar Tage ' +
      'später bestellt.',
  },
];

const SCHRITTE = [
  {
    titel: 'Anmelden',
    text:
      'Du füllst das Formular im Partnerportal aus: Name, Kontakt, deine ' +
      'Kanäle und der Wunschname für deinen Gutscheincode. Das dauert ein ' +
      'paar Minuten.',
  },
  {
    titel: 'Freigabe abwarten',
    text:
      'Wir sehen uns jede Anmeldung an. Nach der Prüfung schalten wir dein ' +
      'Partnerkonto frei — oder sagen dir, dass es diesmal nicht passt.',
  },
  {
    titel: 'Link und Code teilen',
    text:
      'Im Partnerkonto liegen dein Tracking-Link, dein Gutscheincode und ' +
      'deine Zahlen. Du teilst, wo du ohnehin unterwegs bist.',
  },
  {
    titel: 'Provision erhalten',
    text:
      'Jeder abgeschlossene, nicht widerrufene Kauf wird dir gutgeschrieben. ' +
      'Die Auszahlung läuft über PayPal oder Bankverbindung.',
  },
];

const PASST = [
  'Du benutzt Qi Blanco selbst und wirst ohnehin danach gefragt.',
  'Du hast eine Community, der ein 5-%-Code echten Nutzen bringt.',
  'Du empfiehlst gern in eigenen Worten, statt Werbetexte zu kopieren.',
  'Du willst nachlesen können, woran du bist — Zahlen, Bedingungen, Kündigung.',
];

const PASST_NICHT = [
  'Du möchtest den Code vor allem für eigene Einkäufe nutzen — dafür gibt es keine Provision.',
  'Du willst mit fremden Marken- oder Wirkversprechen werben, die wir nicht belegen können.',
  'Du erwartest eine garantierte Zulassung — jede Anmeldung wird geprüft.',
];

/* ───────── Hero: die Zahl zuerst, das Versprechen danach ───────── */
function Hero() {
  return (
    <section
      className="lp-a-hero"
      aria-labelledby="lp-pp-hero-title"
      data-section="lp-pp-hero"
    >
      <div className="lp-a-hero__inner lp-pp-hero__inner">
        <div className="lp-a-hero__copy">
          <span className="lp-a-hero__eyebrow">Partnerprogramm</span>
          <h1 id="lp-pp-hero-title" className="lp-a-hero__title">
            10 % Provision auf deine Empfehlung.
          </h1>
          <ul className="lp-a-hero__dreizeiler">
            <li>Eigener 5-%-Gutscheincode.</li>
            <li>Tracking-Link mit 30 Tagen Zuordnung.</li>
            <li>Kostenlos, jederzeit kündbar.</li>
          </ul>
          <p className="lp-a-hero__subline">
            Du empfiehlst Qi Blanco ohnehin weiter? Dann bekommst du dafür
            10&nbsp;% Provision auf den Netto-Warenwert — und deine Community
            bekommt über deinen Code 5&nbsp;% Rabatt. Auf dieser Seite steht
            in zwei Minuten alles, was du vorher wissen willst: die Zahlen,
            der Ablauf und die Fälle, in denen es keine Provision gibt.
          </p>
          <div className="lp-a-hero__cta-row">
            <a
              className="lp-vp-btn lp-vp-btn--lg"
              href={FORMULAR}
              rel="noopener"
            >
              Jetzt als Partner bewerben
            </a>
            <a className="lp-vp-btn lp-vp-btn--secondary" href="#bedingungen">
              Erst die Bedingungen lesen
            </a>
          </div>
          <ul className="lp-a-hero__trust">
            <li>Kostenlos</li>
            <li>Keine Mindestlaufzeit</li>
            <li>Anmeldung in wenigen Minuten</li>
          </ul>
        </div>
        <figure className="lp-pp-hero__visual">
          <img
            src={HERO_IMG}
            srcSet={HERO_SRCSET}
            sizes="440px"
            alt="QiOne® 2 Pro — eines der Produkte, die du als Partner empfiehlst"
            width="880"
            height="880"
            loading="eager"
          />
          <figcaption>
            Das empfiehlst du: QiOne<sup>®</sup>&nbsp;2 Pro, QiBracelet und
            QiHome Air.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/* ───────── Was du bekommst ───────── */
function Vorteile() {
  return (
    <section aria-labelledby="lp-pp-vorteile-title" data-section="lp-pp-vorteile">
      <span className="eyebrow">Deine Konditionen</span>
      <h2 id="lp-pp-vorteile-title">Das bekommst du als Partner</h2>
      <p className="lp-vp-section__lede">
        Ein Satz für alle, ohne Staffel und ohne Mindestumsatz — damit du
        vorher ausrechnen kannst, was eine Empfehlung dir bringt.
      </p>
      <div className="lp-vp-benefits-grid">
        {VORTEILE.map((v) => (
          <article className="lp-a-benefit" key={v.titel}>
            <h3 className="lp-vp-benefit__title">{v.titel}</h3>
            <p className="lp-vp-benefit__body">{v.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ───────── Ablauf in vier Schritten ───────── */
function Ablauf() {
  return (
    <section aria-labelledby="lp-pp-ablauf-title" data-section="lp-pp-ablauf">
      <span className="eyebrow">In vier Schritten</span>
      <h2 id="lp-pp-ablauf-title">So läuft es ab</h2>
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

/* ───────── Ehrliche Bedingungen ─────────
 * Bewusst VOR dem Abschluss und nicht im Kleingedruckten: die Ausschlüsse
 * (AGB § 5) sind der häufigste Grund für Ärger im Nachhinein.
 */
function Bedingungen() {
  return (
    <section
      id="bedingungen"
      aria-labelledby="lp-pp-bedingungen-title"
      data-section="lp-pp-bedingungen"
    >
      <span className="eyebrow">Klarheit vorab</span>
      <h2 id="lp-pp-bedingungen-title">Für wen das passt — und für wen nicht</h2>
      <p className="lp-vp-section__lede">
        Provision entsteht nur für Empfehlungen an Dritte, und jede Anmeldung
        wird vor der Freischaltung geprüft. Was das konkret bedeutet, steht
        hier.
      </p>
      <div className="lp-pp-grid-2">
        <article className="lp-a-benefit">
          <h3 className="lp-vp-benefit__title">Das passt zu dir, wenn …</h3>
          <ul className="lp-pp-liste lp-pp-liste--ja">
            {PASST.map((z) => (
              <li key={z}>{z}</li>
            ))}
          </ul>
        </article>
        <article className="lp-a-benefit">
          <h3 className="lp-vp-benefit__title">Das passt nicht, wenn …</h3>
          <ul className="lp-pp-liste lp-pp-liste--nein">
            {PASST_NICHT.map((z) => (
              <li key={z}>{z}</li>
            ))}
          </ul>
        </article>
      </div>
      <p className="lp-a-note">
        Die vollständigen Teilnahmebedingungen liegen im Anmeldeformular unter
        {'„AGBs“'} — dort steht auch, wie Prüfung, Stornierung und Kündigung
        geregelt sind. Womit du wirbst, kannst du dir hier ansehen:{' '}
        <a href="/products/qione-2-pro">QiOne® 2 Pro</a>,{' '}
        <a href="/products/qibracelet">QiBracelet</a>,{' '}
        <a href="/products/qihome-air">QiHome Air</a> und die{' '}
        <a href="/pages/studien">wissenschaftlichen Studien</a>.
      </p>
    </section>
  );
}

/* ───────── Fragen ───────── */
function Fragen() {
  return (
    <section aria-labelledby="lp-pp-faq-title" data-section="lp-pp-faq">
      <span className="eyebrow">Häufige Fragen</span>
      <h2 id="lp-pp-faq-title">Was Partner vorher wissen wollen</h2>
      <dl className="lp-pp-faq">
        {FRAGEN.map((f) => (
          <div className="lp-pp-faq__item" key={f.frage}>
            <dt>{f.frage}</dt>
            <dd>{f.antwort}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ───────── Abschluss ───────── */
function Abschluss() {
  return (
    <section
      className="lp-vp-final-cta"
      aria-labelledby="lp-pp-cta-title"
      data-section="lp-pp-cta"
    >
      <div className="lp-pp-cta__inner">
        <span className="eyebrow">Anmeldung</span>
        <h2 id="lp-pp-cta-title">Werde Partner</h2>
        <p className="lp-vp-final-cta__lede">
          Die Anmeldung läuft über unser Partnerportal. Du hinterlegst dort
          deine Daten und den Wunschnamen für deinen Gutscheincode — danach
          prüfen wir und schalten dein Partnerkonto frei.
        </p>
        <a className="lp-vp-btn lp-vp-btn--lg" href={FORMULAR} rel="noopener">
          Zum Anmeldeformular
        </a>
        <ul className="lp-vp-final-cta__trust">
          <li>10 % auf den Netto-Warenwert</li>
          <li>5-%-Code für deine Community</li>
          <li>30 Tage Zuordnung</li>
          <li>Jederzeit kündbar</li>
        </ul>
      </div>
    </section>
  );
}

export function AffiliatePartnerprogramm() {
  return (
    <div
      className="lp-vp lp-a3 lp-pp"
      data-qbp-route="affiliate-partnerprogramm"
    >
      <Hero />
      <Vorteile />
      <Ablauf />
      <Bedingungen />
      <Fragen />
      <Abschluss />
    </div>
  );
}
