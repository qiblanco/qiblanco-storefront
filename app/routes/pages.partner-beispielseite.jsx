import partnerBeispielseiteStyles from '~/styles/partner-beispielseite.css?url';
import {noindexMeta, noindexHeader} from '~/lib/seo';

/**
 * /pages/partner-beispielseite: „So kann eine Erfahrungsseite aufgebaut sein“.
 *
 * Christian, 26.09.2026: „… evtl. noch eine Beispielseite unter
 * pages/partner-beispielseite, nicht crawlbar, nicht gerankt, und mit in den
 * PDFs verlinken.“ Die Konzept-PDFs an Julie Boenig und Rainer J. Klement
 * verlinken genau diese Adresse (Großjob 20260926-GROSSJOB-partnerseiten-
 * ranken-julie-und-rainer-konzept-pdf-und-beispielseite-opus, Segment s02).
 *
 * WER HIER ÄNDERT, ÄNDERT DREI STELLEN. IDs und Namen der neun Bausteine
 * stammen aus der Tabelle zwischen BAUSTEINE-ANFANG und BAUSTEINE-ENDE in
 * ruf-manager/konzepte/konzept-partnerseiten-ranken-20260926.md (Abschnitt 5).
 * Die PDFs nennen dieselben Namen, und die Naht-Probe
 * worker-pool/pruefungen/probe_partner_beispielseite_naht__20260926.py misst
 * jede ID und jeden Namen an der Live-Seite. Der Wortlaut kommt aus
 * beispielseite-text.md im Job-Ordner des Großjobs.
 *
 * ─── LIVE, ABER NICHT IN GOOGLE ────────────────────────────────────────────
 * (1) meta robots noindex,nofollow und (2) derselbe Wert als X-Robots-Tag
 *     (Hausmuster D-006, noindexMeta()/noindexHeader() aus app/lib/seo.js).
 * (3) KEIN canonical: noindex und canonical zugleich widersprechen sich.
 * (4) KEIN Disallow in [robots.txt].jsx, anders als die Hausregel „Disallow
 *     + noindex“: eine per robots.txt gesperrte Seite kann Google nicht auf
 *     ihr noindex prüfen und führt sie womöglich trotzdem, weil die PDFs sie
 *     von außen verlinken (Google, „Block indexing“, Stand 10.12.2025).
 * (5) KEIN Shopify-Seitenobjekt und kein Eintrag in NUR_ROUTE_SEITEN: die
 *     Sitemap entsteht nur aus diesen beiden Quellen.
 * (6) Kein Menü, keine Fußzeile und keine Seite verlinkt sie. Einzige
 *     Ausnahme ist die interne Linkliste /pages/uebersicht (selbst
 *     noindex,nofollow), deren Generator jede Route aufnimmt.
 *
 * NICHTS IN AKKORDEONS: die Seite zeigt, wie eine Erfahrungsseite gebaut
 * wird, und versteckte Antworten gehören nicht dazu.
 *
 * TRACKING-NAHT: kein neuer Cookie, kein neuer Identitäts- oder
 * Tracking-Schlüssel, kein Kaufknopf. Die Kette hängt pfad-agnostisch im
 * root-Layout; TRACKING_COOKIE_NAMES bleibt unangetastet.
 */
export function links() {
  return [{rel: 'stylesheet', href: partnerBeispielseiteStyles}];
}

const TITEL =
  'Beispielseite für Partner: So kann eine Erfahrungsseite aufgebaut sein | Qi Blanco';

/** @type {MetaFunction} */
export const meta = () => [{title: TITEL}, noindexMeta()];

/** Zweite, vom HTML unabhängige Sperre desselben Signals. */
export const headers = () => noindexHeader();

const INDIVIDUELL =
  'Dieser Bereich sollte individuell von dir und deinen Erfahrungen gestaltet werden.';

/**
 * Die neun Bausteine in der Reihenfolge der Konzept-Tabelle. `muster` ist eine
 * Liste von Kästen; ein Kasten trägt Absätze, eine Zeitleiste oder Fragen.
 * Eckige Klammern markieren die Stellen, die die Partnerin oder der Partner
 * selbst füllt; die Seite hebt sie sichtbar ab.
 */
const BAUSTEINE = [
  {
    id: 'kurzantwort',
    name: 'Titel und Kurzantwort',
    wozu:
      'Der Titel greift auf, wonach Menschen suchen, und hält, was er verspricht. Die Kurzantwort beantwortet die Frage gleich darunter in wenigen Sätzen, die auch für sich allein verständlich sind.',
    platzhalter: [
      '[Titel: Welche Frage stellen die Menschen, die deine Seite finden sollen? Zum Beispiel: Erfahrungen, Bewertung, Kritik.]',
      '[Kurzantwort: Seit wann trägst du welches Produkt? Was hat sich für dich gezeigt? Was ist offen?]',
    ],
    muster: [
      {
        absaetze: [
          'Titel: Qi Blanco Erfahrungen seit [Jahr]: meine Bewertung und Kritik',
          'Ich trage [Produkt] seit [Monat Jahr]. Am deutlichsten merke ich es [bei deiner Beobachtung, zum Beispiel beim Schlaf]. [Was offen oder schwierig ist, in einem Satz.] Das ist meine Erfahrung, keine Studie.',
        ],
      },
    ],
  },
  {
    id: 'autor',
    name: 'Wer hier schreibt',
    wozu:
      'Google empfiehlt einen erkennbaren Autor. Name, Foto, Beruf und die Zeit mit dem Produkt machen aus einem Text eine Erfahrung, der man vertraut.',
    platzhalter: [
      '[Dein voller Name und ein Foto.]',
      '[Was machst du beruflich, und was hat dich zu diesem Thema gebracht?]',
      '[Seit wann trägst du Qi Blanco?]',
      '[Bist du Partnerin oder Partner? Sag es hier in einem Satz.]',
    ],
    muster: [
      {
        absaetze: [
          'Ich bin [Vorname Nachname], [Beruf]. Mit dem Thema Elektrosmog beschäftige ich mich seit [Jahr], weil [dein Anlass]. Qi Blanco trage ich seit [Jahr]. Ich bin Partnerin von Qi Blanco; kaufst du über meinen Link, erhalte ich eine Provision.',
        ],
      },
    ],
  },
  {
    id: 'zeitleiste',
    name: 'Meine Zeitleiste',
    wozu:
      'Daten statt Adjektive. Eine Zeitleiste zeigt auf einen Blick, wie lange du das Produkt schon trägst und was wann dazukam.',
    platzhalter: [
      '[Wann hast du Qi Blanco kennengelernt?]',
      '[Wann kam welches Produkt dazu?]',
      '[Wann hat sich was gezeigt?]',
      '[Wann hast du die Seite zuletzt aktualisiert?]',
    ],
    muster: [
      {
        zeitleiste: [
          '[Jahr] erster Kontakt mit Qi Blanco',
          '[Monat Jahr] das erste Produkt: [Name]',
          '[Monat Jahr] [was sich gezeigt hat]',
          '[Monat Jahr] Update',
        ],
      },
    ],
  },
  {
    id: 'erfahrung',
    name: 'Was ich erlebt habe',
    wozu:
      'Hier steht deine Erfahrung, auch zur Gesundheit. Sie wirkt, wenn sie konkret ist, einen eigenen Beleg hat und als deine Erfahrung erkennbar bleibt.',
    platzhalter: [
      '[Was hast du in den ersten Tagen bemerkt, was nach Wochen, was nach Monaten?]',
      '[Eine Situation aus deinem Alltag, in der du den Unterschied gemerkt hast.]',
      '[Ein eigener Beleg: ein Foto, ein Eintrag im Schlaf- oder Symptomtagebuch, jeweils mit Datum.]',
    ],
    muster: [
      {
        absaetze: [
          'In den ersten Tagen mit [Produkt] habe ich [deine Beobachtung] bemerkt. Nach [Zeitraum] hat sich das [wie entwickelt]. Seit [Monat Jahr] [deine Beobachtung zu Schlaf, Energie oder Beschwerden]. Wie sicher ich mir bin: [deine Einschränkung]. Festgehalten habe ich es in [Tagebuch, Foto, Notiz].',
        ],
      },
    ],
    nach: [
      'Gesundheitsaussagen haben hier ihren Platz, auch zu Beschwerden, wenn ihre Grundlage im Satz steht: ich, seit wann, woran ich es merke, wie sicher ich bin. Ein Satz ohne diese Grundlage, als Tatsache formuliert, etwa „heilt Elektrosensibilität“, stuft Google ganz unten ein.',
    ],
  },
  {
    id: 'forschung',
    name: 'Was andere berichten und was die Forschung zeigt',
    wozu:
      'Bei Gesundheitsthemen wollen Leserinnen und Leser die Grundlage sehen. Zwei Arten passen: was andere Trägerinnen und Träger berichten, als Erfahrung formuliert, und was im Labor gemessen wurde, als Möglichkeit formuliert und mit Quelle.',
    platzhalter: [
      '[Welche Studie oder Auswertung möchtest du anführen? Mit Titel der Zeitschrift und Jahr.]',
      '[Was folgt daraus für dich, und was ist offen?]',
    ],
    muster: [
      {
        etikett: 'Muster (Kundenerfahrung)',
        absaetze: [
          'Eine Auswertung von 171 öffentlichen Beiträgen in sozialen Medien nennt am häufigsten mehr Ruhe und tieferen Schlaf, jeweils bei rund einem Fünftel (Advances in Bioengineering & Biomedical Science Research, 2024). Einen Fragebogen oder eine Vergleichsgruppe gab es nicht. [Was dir Menschen aus deinem Umfeld erzählen, ohne Namen und mit ihrem Einverständnis.]',
        ],
      },
      {
        etikett: 'Muster (theoretisch möglich)',
        absaetze: [
          'Im Labor behielten Immunzellen unter Handystrahlung mit dem QiOne® 2 Pro in der Nähe rund 85 statt 60 Prozent ihrer Abwehrleistung (Japan Journal of Medicine, 2021). Ob das im Körper genauso ist, ist nicht untersucht. Alle fünf Arbeiten stammen aus einem Labor und wurden von Qi Blanco finanziert; eine kontrollierte Studie am Menschen gibt es nicht.',
        ],
      },
    ],
    nach: [
      <>
        Alle fünf Studien findest du mit den Originalen unter{' '}
        <a href="/pages/studien">Studien</a>, ihre Grenzen unter{' '}
        <a href="/pages/kritik">Kritik</a>, Erfahrungsberichte in Videos unter{' '}
        <a href="/pages/erfahrungen">Erfahrungen</a>.
      </>,
    ],
  },
  {
    id: 'kritik',
    name: 'Zur Kritik, in meinen Worten',
    wozu:
      'Wer nach Kritik sucht, will wissen, was daran stimmt. Qi Blanco räumt selbst vier Punkte ein: kein Wirknachweis am Menschen, alle Studien aus einem Labor, von Qi Blanco bezahlt, und das Erklärungsmodell ist in der etablierten Wissenschaft nicht anerkannt. Nenne die Kritik so, wie sie lautet, und gib dann deine Einordnung.',
    platzhalter: [
      '[Welche Kritik hörst du am häufigsten, und wie lautet sie genau?]',
      '[Was davon zählt für dich, und was nicht?]',
      '[Worauf stützt du dein Urteil?]',
    ],
    muster: [
      {
        absaetze: [
          '[Die Kritik in ein, zwei Sätzen, so wie sie lautet.] [Was davon für dich zählt und was nicht.] Ich beurteile Qi Blanco nach [Zeitraum] im eigenen Alltag, weil [dein Grund]. [Wie jemand es selbst prüfen kann.]',
        ],
      },
    ],
  },
  {
    id: 'abwaegung',
    name: 'Für wen es passt und für wen nicht',
    wozu:
      'Für Bewertungen empfiehlt Google, Vor- und Nachteile aus eigener Nutzung zu nennen. Eine ehrliche Abwägung macht deine Empfehlung glaubwürdiger, nicht schwächer.',
    platzhalter: [
      '[Für wen ist es aus deiner Sicht gemacht?]',
      '[Für wen eher nicht?]',
      '[Was war für dich ein Nachteil, zum Beispiel Preis oder Eingewöhnung?]',
    ],
    muster: [
      {
        absaetze: [
          'Qi Blanco passt zu dir, wenn [deine Einschätzung]. Es passt weniger, wenn [deine Einschätzung]. Ein Nachteil ist [dein Punkt]. Am Anfang war es für mich [deine Erfahrung mit der Eingewöhnung]. Selbst prüfen: Qi Blanco nimmt Produkte innerhalb von 20 Tagen ab Erhalt zurück, zusätzlich zum gesetzlichen Widerrufsrecht.',
        ],
      },
    ],
  },
  {
    id: 'fragen',
    name: 'Fragen, die mir gestellt werden',
    wozu:
      'Echte Fragen deiner Leserinnen und Leser, die Antwort je im ersten Satz. Menschen finden ihre Frage schneller, und Microsoft schreibt, dass Copilot solche Frage-Antwort-Paare oft wörtlich übernimmt.',
    platzhalter: [
      '[Vier bis sechs Fragen, die man dir wirklich stellt, jede als eigene Zwischenüberschrift.]',
    ],
    muster: [
      {
        fragen: [
          {
            frage: 'Was, wenn ich nichts spüre?',
            antwort:
              '[Deine Antwort im ersten Satz.] [Deine Erfahrung dazu, mit Einschränkung.]',
          },
          {
            frage: '[Deine Frage]',
            antwort: '[Deine Antwort im ersten Satz, dann eine Einordnung.]',
          },
        ],
      },
    ],
  },
  {
    id: 'offenlegung',
    name: 'Offenlegung und Stand',
    wozu:
      'Nenne die Partnerschaft klar und gut sichtbar, kennzeichne Partnerlinks und zeig, wann du die Seite zuletzt aktualisiert hast.',
    platzhalter: [
      '[Deine Partnerschaft in einem Satz.]',
      '[Datum der letzten Aktualisierung.]',
      '[Deine Quellen mit Link.]',
    ],
    muster: [
      {
        absaetze: [
          'Transparenz: Ich bin Partnerin von Qi Blanco und erhalte eine Provision, wenn du über meine Links kaufst. Für dich wird es dadurch nicht teurer. Meine Erfahrung beschreibe ich unabhängig davon. Zuletzt aktualisiert: [Monat Jahr].',
        ],
      },
    ],
  },
];

/** Der Anhang, kein Baustein: je Punkt eine fette Einleitung und der Rest. */
const TECHNIK = [
  [
    'Datum sichtbar und im Markup:',
    <>
      „Zuletzt aktualisiert: [Monat Jahr]“ unter der Überschrift, dazu{' '}
      <code>dateModified</code> in den strukturierten Daten. Das Datum nur
      ändern, wenn sich wirklich etwas geändert hat.
    </>,
  ],
  [
    'Autorin oder Autor verlinken:',
    <>
      der Name führt auf deine Seite „Über mich“. Im Markup <code>Person</code>{' '}
      mit <code>sameAs</code> auf deine Profile.
    </>,
  ],
  [
    'Partnerlinks kennzeichnen:',
    <>
      <code>{'rel="sponsored"'}</code> an jedem Link mit Partnercode.
    </>,
  ],
  [
    'Nichts sperren:',
    <>
      kein <code>noindex</code>, kein <code>nosnippet</code> auf deiner
      Erfahrungsseite, und in der robots.txt keine Suchmaschinen- oder
      KI-Crawler blockieren.
    </>,
  ],
  [
    'Search Console:',
    'Domain bestätigen. Seit Ende August 2026 zeigt sie je Seite, wie oft sie in KI-Übersicht und KI-Modus erschien; unter „Search generative AI“ prüfen, dass „Include“ gesetzt ist.',
  ],
  [
    'Bing Webmaster Tools:',
    'Domain anmelden; der Bericht „AI Performance“ zeigt, wann Antworten von Microsoft Copilot deine Seite zitieren.',
  ],
  [
    'Eigene Bilder:',
    'Fotos aus deinem Alltag mit einem Alt-Text, der beschreibt, was zu sehen ist.',
  ],
  [
    'Antworten sichtbar lassen:',
    'keine wichtigen Antworten in aufklappbaren Feldern verstecken.',
  ],
  [
    'Eine Seite statt vieler:',
    'Kritik, Bewertung und Erfahrung gehören auf dieselbe Seite.',
  ],
];

/**
 * Text mit sichtbar abgehobenen Lücken: jede eckige Klammer wird ein eigener
 * Span, der Wortlaut bleibt Zeichen für Zeichen erhalten.
 */
function MitLuecken({text}) {
  return text.split(/(\[[^\]]+\])/g).map((teil, i) =>
    teil.startsWith('[') && teil.endsWith(']') ? (
      <span className="pbs__luecke" key={i}>
        {teil}
      </span>
    ) : (
      teil
    ),
  );
}

function Musterkasten({kasten}) {
  return (
    <div className="pbs__muster">
      <p className="pbs__etikett">{kasten.etikett || 'Muster'}</p>
      {kasten.absaetze?.map((a) => (
        <p key={a}>
          <MitLuecken text={a} />
        </p>
      ))}
      {kasten.zeitleiste && (
        <ul className="pbs__zeitleiste">
          {kasten.zeitleiste.map((z) => (
            <li key={z}>
              <MitLuecken text={z} />
            </li>
          ))}
        </ul>
      )}
      {kasten.fragen?.map((f) => (
        <div className="pbs__frage" key={f.frage}>
          <p className="pbs__frage-titel">
            <MitLuecken text={f.frage} />
          </p>
          <p>
            <MitLuecken text={f.antwort} />
          </p>
        </div>
      ))}
    </div>
  );
}

function Baustein({baustein, nummer}) {
  const titelId = `baustein-${baustein.id}-titel`;
  return (
    <section
      id={`baustein-${baustein.id}`}
      className="pbs__baustein"
      aria-labelledby={titelId}
    >
      <div className="pbs__inhalt">
        <p className="pbs__nummer">Baustein {nummer}</p>
        <h2 id={titelId}>{baustein.name}</h2>
        <p className="pbs__wozu">
          <strong>Wozu:</strong> {baustein.wozu}
        </p>
        <div className="pbs__platzhalter">
          <p className="pbs__etikett">Platzhalter</p>
          <ul>
            {baustein.platzhalter.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        {baustein.muster.map((kasten, i) => (
          <Musterkasten kasten={kasten} key={kasten.etikett || i} />
        ))}
        {baustein.nach?.map((absatz, i) => (
          <p className="pbs__nach" key={i}>
            {absatz}
          </p>
        ))}
        <p className="pbs__individuell">{INDIVIDUELL}</p>
      </div>
    </section>
  );
}

export default function PartnerBeispielseite() {
  return (
    <div className="pbs">
      <section className="pbs__kopf" aria-labelledby="pbs-titel">
        <div className="pbs__inhalt">
          <p className="pbs__vorspann">Beispielseite für Partnerinnen und Partner</p>
          <h1 id="pbs-titel">So kann eine Erfahrungsseite aufgebaut sein</h1>
          <p className="pbs__lead">
            Eine Erfahrungsseite über Qi Blanco, die bei Google und in
            KI-Antworten gefunden wird, hat neun Bausteine. Zu jedem steht hier,
            wozu er dient, welche Fragen du selbst beantwortest und wie es
            klingen kann.
          </p>
          <p>
            Die Muster sind Beispiele, keine Vorlagen. Ein Text, den mehrere
            Seiten gleich tragen, zeigt Google nur einmal, und er klingt nicht
            nach dir. Deine Seite wirkt, weil sie deine Erfahrung erzählt.
          </p>
          <p className="pbs__hinweiszeile">
            Nur zur Orientierung: Google nimmt die Beispielseite nicht auf.
          </p>
          <nav className="pbs__sprungliste" aria-label="Inhalt">
            <p className="pbs__etikett">Inhalt</p>
            <ol>
              {BAUSTEINE.map((b) => (
                <li key={b.id}>
                  <a href={`#baustein-${b.id}`}>{b.name}</a>
                </li>
              ))}
            </ol>
            <p className="pbs__sprung-anhang">
              Anhang: <a href="#technik">Technik im Hintergrund</a>
            </p>
          </nav>
        </div>
      </section>

      {BAUSTEINE.map((b, i) => (
        <Baustein baustein={b} nummer={i + 1} key={b.id} />
      ))}

      <section id="technik" className="pbs__technik" aria-labelledby="technik-titel">
        <div className="pbs__inhalt">
          <p className="pbs__nummer">Anhang</p>
          <h2 id="technik-titel">Technik im Hintergrund</h2>
          <ul className="pbs__technikliste">
            {TECHNIK.map(([einleitung, rest]) => (
              <li key={einleitung}>
                <strong>{einleitung}</strong> {rest}
              </li>
            ))}
          </ul>
          <p className="pbs__schluss">
            Fragen zum Aufbau oder zur Technik? Wir helfen gern dabei, deine
            Seite einzurichten. Die Worte bleiben deine.
          </p>
        </div>
      </section>
    </div>
  );
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
