import {Link} from 'react-router';
import {canonicalLink, absoluteCanonical, CANONICAL_ORIGIN} from '~/lib/seo';
import {ORGANISATION, ORG_ID, SITE_ID} from '~/lib/entity-schema';
import {STUDIEN, UEBERSICHT_PFAD} from '~/data/studien';
import {STAND_ISO} from '~/data/redaktionsstand';
import ueberUnsStyles from '~/styles/ueber-uns.css?url';

/**
 * /pages/ueber-uns — WER HINTER QI BLANCO STEHT.
 *
 * Auftrag 20260823-seo-grossjob-…-prio50, Segment s06, Backlog-Posten B-10(a).
 *
 * WARUM ES DIESE SEITE GIBT (s04 hat es live gemessen, nicht vermutet):
 * die gesamte 48-URL-Sitemap der Domain führte KEINE „Über uns"/Team-Seite,
 * auf keiner Inhaltsseite stand eine Autorenangabe. Wir sind eine
 * YMYL-Domain — Gesundheit und Wohlbefinden —, und dort ist „Trust" der am
 * stärksten gewichtete E-E-A-T-Faktor. Das ist keine Regeländerung von 2026;
 * es ist der Grund, warum uns jede Verschärfung überproportional trifft.
 *
 * DIE EINE AUFLAGE, DIE HIER ÜBER ALLEM STEHT: keine erfundene Person, keine
 * erfundene Qualifikation. Eine Autorenzeile ohne echten Menschen dahinter ist
 * auf einer YMYL-Domain SCHLIMMER als gar keine — sie ist genau die Fassade,
 * gegen die der strengere Maßstab gebaut ist. Jede Angabe auf dieser Seite
 * stammt deshalb aus einer Quelle IM BESTAND:
 *   · Firma, Anschrift, Register, USt-ID, E-Mail  -> app/lib/entity-schema.js
 *     ORGANISATION (deckungsgleich mit /pages/impressum, am 2026-08-24 live
 *     gegengelesen)
 *   · Geschäftsführer und inhaltlich Verantwortlicher nach § 18 Abs. 2 MStV
 *     -> /pages/impressum, wörtlich
 *   · Prüfinstitut und Studienautor -> app/data/studien/*.json, Feld
 *     `eckdaten.autor` / `eckdaten.institut`
 * NICHT geschrieben, weil nirgends belegt: eine Telefonnummer (s04 hat ihr
 * Fehlen ausdrücklich gemessen), Teamgröße, Gründungsjahr, weitere Personen.
 *
 * TONALITÄT (Christian, 2026-08-23, wörtlich: „Ich möchte aus der Angst raus.
 * Wir wollen überzeugen und selbstbewusst auftreten."): aktiv, klar, keine
 * Vorsichtsformel, kein Konjunktiv-Gefälle, keine Distanzierung von der
 * eigenen Aussage — und ausdrücklich KEINE Ersatz-Absicherung in kürzerer
 * Form, weder im Fließtext noch in `description` oder JSON-LD. Was belegbar
 * ist, steht mit seiner Quelle da; was nicht belegbar wäre, ist gestrichen
 * statt relativiert. Selbstbewusst heißt hier nachprüfbare Herkunft, nicht
 * starke Worte.
 *
 * DESIGN: eigenes Token-System `styles/über-uns.css` (Scope .uu, flach) nach
 * dem Referenz-Rezept der LP A über den Bestands-Verwandten uebersicht.css.
 *
 * TRACKING-NAHT: diese Seite setzt KEINE Cookies, führt KEINEN neuen
 * Identitäts-/Tracking-Key ein und enthält keinen eigenen Pixel. Die
 * R1/R2/R3-Kette hängt pfad-agnostisch im root-Layout (Hausmuster D-006) —
 * `TRACKING_COOKIE_NAMES` bleibt unangetastet, es gibt an dieser Route keine
 * Bereichsgrenze, über die etwas verloren gehen könnte.
 */

const PFAD = '/pages/ueber-uns';

const TITEL = 'Über uns — wer hinter Qi Blanco steht | Qi Blanco';

/**
 * Meta-Beschreibung. Sie sagt, was die Seite BIETET (Namen, Register,
 * Prüfinstitut) — bewusst ohne jede Vorsichtsformel, weil genau die aus dem
 * Snippet heraus soll (Christian 2026-08-23). Unter der Snippet-Kappung
 * von ~155 Zeichen.
 *
 * WARUM HIER NICHT MEHR „unabhängige" STEHT (geändert 2026-08-24, nachdem
 * eine unabhängige Gegenprüfung dieses Segments genau dieses Wort als
 * einzigen echten Angriffspunkt der Seite benannt hat): Dartsch Scientific
 * ist ein eigenständiges Unternehmen, aber ein von UNS BEAUFTRAGTES
 * Auftragslabor. „Unabhängig" behauptet Unbefangenheit — und das ist die
 * Sorte Aussage, die wir nicht belegen können, hier auf einer YMYL-Fläche
 * und in einem snippet-relevanten Feld, das Google wörtlich ausspielt.
 *
 * Christians Regel geht in die andere Richtung, als man beim Wort
 * „selbstbewusst" zuerst vermutet: was belegbar ist, wird belegt — was
 * nicht belegbar ist, wird GESTRICHEN statt relativiert. Also kein
 * „weitgehend unabhängig" und kein Konjunktiv, sondern das Adjektiv
 * ersatzlos weg. Übrig bleibt die überprüfbare Tatsache: es gibt ein
 * Institut, es ist nicht unseres, und die Seite nennt es beim Namen.
 * Für E-E-A-T ist das ohnehin das stärkere Signal — ein NAME ist prüfbar,
 * ein Adjektiv nicht.
 */
const BESCHREIBUNG =
  'Wer Qi Blanco verantwortet, mit Namen, Anschrift und Handelsregister — und ' +
  'in welchem Institut unsere Produkte zellbiologisch geprüft wurden.';

/** Aus dem Impressum, wörtlich. Die einzige natürliche Person dieser Seite. */
const VERANTWORTLICH = {
  name: 'Dipl.-Ing. Christian Bernd Bauer',
  rolle: 'Geschäftsführer der Qi Blanco UG (haftungsbeschränkt)',
  // § 18 Abs. 2 MStV nennt denselben Namen — das ist die Angabe, die eine
  // Suchmaschine als „wer verantwortet den Inhalt" liest.
  inhaltlich: 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV',
};

/** Aus app/data/studien/*.json, Feld eckdaten.autor / eckdaten.institut. */
const PRUEFINSTITUT = {
  autor: 'Prof. Dr. Peter C. Dartsch',
  institut: 'Dartsch Scientific GmbH, Institute for Cell Biological Test Systems',
  ort: 'Wagenfeld',
};

/**
 * Deeplink der Google-Quellenwahl („Preferred Sources"), Doku-Stand
 * 2026-08-20 (developers.google.com/search/docs/appearance/preferred-sources).
 *
 * BEWUSST NUR DER DEEPLINK, NICHT Googles einbettbares Skript-Widget
 * (`news.google.com/swg/js/v1/publisher.js`). Drei gemessene Gründe:
 *   1. Die Abnahme dieses Postens verlangt ausdrücklich, dass die Schaltfläche
 *      OHNE JavaScript funktioniert — ein `<a href>` erfüllt das, ein Widget,
 *      das sich erst per Skript rendert, nicht.
 *   2. Ein Fremdskript bräuchte eine CSP-Ausnahme in app/entry.server.jsx.
 *      Das ist ein sicherheitsrelevanter Eingriff mit shopweiter Reichweite
 *      für einen Posten, dessen WIRKUNG ausdrücklich unbelegt ist.
 *   3. Der Deeplink ist gemessen erreichbar: HTTP 200 am 2026-08-24.
 *
 * UND DER POSTEN IST BEWUSST KEIN „Low Hanging Fruit": die Wirkung entsteht
 * erst, wenn Menschen den Knopf drücken — also wenn ein Kanal die Bitte
 * transportiert. Ohne Kanal ist er ein toter Link. Genau diese offene Frage
 * ist beim forschungs-meister als datiertes Item registriert; sie versandet
 * nicht in diesem Kommentar.
 */
const GOOGLE_QUELLENWAHL = 'https://www.google.com/preferences/source?q=qiblanco.com';

export function links() {
  return [{rel: 'stylesheet', href: ueberUnsStyles}];
}

/**
 * JSON-LD dieser Seite.
 *
 * Der Organisationsknoten wird NICHT gedoppelt, sondern per `@id` referenziert
 * (`ORG_ID`) — er entsteht einmal in app/lib/entity-schema.js und trägt dort
 * Register, USt-ID und die Wikidata-Kennung. Zwei Knoten mit derselben
 * Identität und verschiedenen Feldern wären genau die Drift, die eine
 * Entitätsauflösung ruiniert.
 *
 * DIE PERSON IST DER PUNKT: `author` der Seite ist ein benannter Mensch mit
 * `worksFor` auf dieselbe Organisation. Das ist die Angabe, die auf einer
 * YMYL-Domain zählt — und sie ist deshalb belegbar, weil sie wörtlich aus dem
 * Impressum stammt.
 */
function aboutSchema() {
  const url = absoluteCanonical(PFAD);
  const personId = `${url}#person`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': `${url}#seite`,
        url,
        name: 'Über uns — wer hinter Qi Blanco steht',
        description: BESCHREIBUNG,
        inLanguage: 'de',
        isPartOf: {'@id': SITE_ID},
        about: {'@id': ORG_ID},
        mainEntity: {'@id': ORG_ID},
        author: {'@id': personId},
        publisher: {'@id': ORG_ID},
        dateModified: STAND_ISO,
      },
      {
        '@type': 'Person',
        '@id': personId,
        name: VERANTWORTLICH.name,
        jobTitle: 'Geschäftsführer',
        worksFor: {'@id': ORG_ID},
        // Anschrift der Gesellschaft, weil § 18 Abs. 2 MStV genau sie nennt.
        // Eine Privatanschrift stünde hier nicht und wäre auch nicht belegt.
        address: {
          '@type': 'PostalAddress',
          streetAddress: ORGANISATION.streetAddress,
          postalCode: ORGANISATION.postalCode,
          addressLocality: ORGANISATION.addressLocality,
          addressCountry: ORGANISATION.addressCountry,
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#brotkrume`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Startseite',
            item: `${CANONICAL_ORIGIN}/`,
          },
          {'@type': 'ListItem', position: 2, name: 'Über uns', item: url},
        ],
      },
    ],
  };
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: TITEL},
  {name: 'description', content: BESCHREIBUNG},
  canonicalLink(PFAD),
  {property: 'og:type', content: 'website'},
  {property: 'og:site_name', content: 'Qi Blanco'},
  {property: 'og:locale', content: 'de_DE'},
  {property: 'og:title', content: TITEL},
  {property: 'og:description', content: BESCHREIBUNG},
  {property: 'og:url', content: absoluteCanonical(PFAD)},
  {'script:ld+json': aboutSchema()},
];

export default function UeberUns() {
  const o = ORGANISATION;
  return (
    <div className="uu">
      <section className="uu-abschnitt uu-kopf">
        <div className="uu-innen">
          <h1>Wer hinter Qi Blanco steht</h1>
          <p className="uu-lead">
            Du kaufst hier bei einem Unternehmen mit Anschrift, Handelsregister
            und einem Menschen, der mit Namen dafür geradesteht. Auf dieser
            Seite steht beides — und daneben das Institut, das unsere Produkte
            zellbiologisch untersucht hat.
          </p>
        </div>
      </section>

      <section className="uu-abschnitt">
        <div className="uu-innen">
          <h2 className="uu-h2">Diese Person verantwortet, was hier steht</h2>
          <div className="uu-person">
            <p className="uu-person-name">{VERANTWORTLICH.name}</p>
            <p className="uu-person-rolle">{VERANTWORTLICH.rolle}</p>
            <p className="uu-person-rolle">{VERANTWORTLICH.inhaltlich}</p>
          </div>
          <p className="uu-text">
            Dieselben Angaben findest du rechtsverbindlich im{' '}
            <Link className="uu-link" to="/pages/impressum" prefetch="intent">
              Impressum
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="uu-abschnitt uu-abschnitt-flaeche">
        <div className="uu-innen">
          <h2 className="uu-h2">Worauf wir uns stützen</h2>
          <p className="uu-text">
            {STUDIEN.length} zellbiologische Fachpublikationen zu unseren
            Produkten stammen von {PRUEFINSTITUT.autor},{' '}
            {PRUEFINSTITUT.institut} in {PRUEFINSTITUT.ort}. Wir veröffentlichen
            sie vollständig: deutsche Fassung, Abbildungen, Original-PDF. Du
            musst uns nicht glauben — du kannst nachlesen.
          </p>
          <ul className="uu-belege">
            {STUDIEN.map((s) => (
              <li key={s.slug}>
                <Link
                  className="uu-link"
                  to={`/pages/${s.slug}`}
                  prefetch="intent"
                >
                  {s.eckdaten.titelDeutsch || s.seo.h1}
                </Link>
              </li>
            ))}
          </ul>
          <p className="uu-text" style={{marginTop: 'var(--uu-s4)'}}>
            <Link className="uu-link" to={UEBERSICHT_PFAD} prefetch="intent">
              Alle Untersuchungen im Überblick
            </Link>
          </p>
        </div>
      </section>

      <section className="uu-abschnitt">
        <div className="uu-innen">
          <h2 className="uu-h2">Unternehmensangaben</h2>
          <dl className="uu-angaben">
            <dt className="uu-angaben-schluessel">Firma</dt>
            <dd className="uu-angaben-wert">{o.legalName}</dd>

            <dt className="uu-angaben-schluessel">Anschrift</dt>
            <dd className="uu-angaben-wert">
              {o.streetAddress}, {o.postalCode} {o.addressLocality}, Deutschland
            </dd>

            <dt className="uu-angaben-schluessel">Registergericht</dt>
            <dd className="uu-angaben-wert">{o.registergericht}</dd>

            <dt className="uu-angaben-schluessel">Registernummer</dt>
            <dd className="uu-angaben-wert">{o.handelsregister}</dd>

            <dt className="uu-angaben-schluessel">Umsatzsteuer-ID</dt>
            <dd className="uu-angaben-wert">{o.vatID}</dd>

            <dt className="uu-angaben-schluessel">E-Mail</dt>
            <dd className="uu-angaben-wert">
              <a className="uu-link" href={`mailto:${o.email}`}>
                {o.email}
              </a>
            </dd>
          </dl>
        </div>
      </section>

      <section className="uu-abschnitt uu-abschnitt-flaeche">
        <div className="uu-innen">
          <h2 className="uu-h2">Uns in deiner Google-Suche bevorzugen</h2>
          <p className="uu-text">
            Google lässt dich seit 2026 selbst festlegen, welche Quellen dir
            bevorzugt angezeigt werden. Wenn du unsere Seite dazu zählen willst,
            geht das in einem Schritt.
          </p>
          <a
            className="uu-knopf"
            href={GOOGLE_QUELLENWAHL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Qi Blanco als bevorzugte Quelle wählen
          </a>
          <p className="uu-fussnote">
            Der Link führt zu Google und wirkt nur für dein eigenes Konto. Wir
            erfahren nicht, ob du ihn benutzt.
          </p>
        </div>
      </section>
    </div>
  );
}

/** @typedef {import('react-router').MetaFunction} MetaFunction */
