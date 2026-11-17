import {FrageSeite} from '~/components/campaign/FrageSeite';
import fragenStyles from '~/styles/fragen.css?url';
import {canonicalLink, absoluteCanonical} from '~/lib/seo';
import {seiteFuer} from '~/data/fragen';
import {frageSchema} from '~/lib/fragen-schema';
import {MARKE, brotkrume, kurzName, teilbildTags} from '~/lib/seiten-seo';
import {isoMitZone} from '~/lib/datum';

const PFAD = '/pages/kann-elektrosmog-den-schlaf-stoeren';
// EIN Traeger für die Adresse: der Slug wird abgeleitet, nicht danebengeschrieben.
const SLUG = PFAD.slice('/pages/'.length);

/**
 * /pages/kann-elektrosmog-den-schlaf-stoeren — die Frage „Kann Elektrosmog den Schlaf stören?".
 *
 * Gebaut von 20260915-GEO-lexikon-frageseiten-und-ob-die-ki-uns-zitiert,
 * Segment s07. Den Text schrieb Segment s05; er steht committet in
 * app/data/fragen.js, die Darstellung in
 * app/components/campaign/FrageSeite.jsx. DIESE DATEI TRÄGT KEINEN INHALT —
 * wer den Text aendert, aendert das Datenmodul, nicht die Route.
 *
 * DIE FRAGE IST DIE ADRESSE UND DIE UEBERSCHRIFT. Das ist keine Kosmetik: ein
 * Antwortsystem schneidet Texte in Abschnitte und bewertet sie isoliert. Eine
 * Frage, die nur eine Zeile unter zwoelf anderen auf /pages/faq ist,
 * konkurriert mit ihren Nachbarn um dieselbe URL. Die Bestands-FAQ bleibt
 * unangetastet — sie bedient den Menschen, der blaettert.
 *
 * Die Datei sticht ausserdem den Katchall pages.$handle.jsx, der sonst ein
 * Shopify-Seitenobjekt dieses Handles suchen und 404 liefern würde.
 *
 * SITEMAP ÜBER `NUR_ROUTE_SEITEN` (app/lib/seo.js), NICHT über ein
 * Shopify-Seitenobjekt: die Shopify-Sitemap entsteht aus Seitenobjekten, eine
 * reine Route kaeme dort baulich nie hinein und wäre erreichbar UND
 * unauffindbar. Ein Seitenobjekt wäre der zweite mögliche Traeger und ist
 * bewusst nicht gewählt (Fremdsystem) — dieselbe Begründung wie bei
 * /pages/kritik, /pages/hypothesen und /pages/lexikon.
 *
 * NICHT IM MENUE, UND DAS IST KEIN VERSTECK: die Route hängt nicht am
 * Shopify-Menue-Objekt, also gibt es keinen Dropdown-Eintrag. Öffentlich,
 * indexierbar, in der Sitemap, vom Fragen-Hub verlinkt — nur eben nicht im
 * Navigationsband. Jeder Besucher bekommt denselben Text, Mensch wie Crawler;
 * das misst die Abnahme und nicht dieser Kommentar.
 *
 * TRACKING-NAHT: keine Cookies, kein neuer Identitaets- oder Tracking-Key,
 * kein eigener Pixel, kein Kaufknopf. Die R1/R2/R3-Kette hängt pfad-agnostisch
 * im root-Layout; TRACKING_COOKIE_NAMES bleibt unangetastet.
 *
 * KEIN LOADER: Oxygen läuft am Edge und kann shared-state zur Laufzeit nicht
 * lesen.
 */
const SEITE = seiteFuer(SLUG);
if (!SEITE) {
  // FAIL-LOUD AN DER RICHTIGEN STELLE. Faehrt jemand diese Frage aus
  // app/data/fragen.js heraus, wäre die stille Variante eine leere Seite mit
  // HTTP 200 — erreichbar und inhaltslos, also genau der Zustand, den der
  // Wissens-Blog monatelang hatte. Ein Fehler beim Rendern ist laut und trifft
  // nur diese eine Route.
  throw new Error(
    `Frageseite "${SLUG}" fehlt in app/data/fragen.js — ` +
      'Route und Datenmodul sind auseinandergelaufen.',
  );
}

const TITEL = "Kann Elektrosmog den Schlaf stören? | Qi Blanco";
// Beschreibung seit 2026-10-11 mit der Feldstudie, die die Seite unter „Was
// gemessen ist" trägt (397 Anwohner, zwölf Nächte, kein Unterschied in den
// Schlafdaten), auf 120 bis 160 Zeichen (GEO-Seitenregel R4, Job
// 20261011-geo-sageo-m5f3-frageseiten-schema-strukturfelder-de-us). Die
// 41 Experimente der WHO-Übersicht stehen bewusst NICHT drin: sie zählen
// Beschwerden aller Art, Schlaf ist dort nur ein Teilergebnis. Der Titel
// bleibt.
// Seit 2026-11-17 (SEO-Maßnahme M-SP-20261025-kann-elektrosmog-den-schlaf-
// stoeren) steht der Suchbegriff „Elektrosmog und Schlaf" vorn, und der
// Praxis-Abschnitt ist genannt. Die Feldstudie bleibt mit ihrem Gegenstand
// (Funkfeld einer Versuchsanlage) drin, nicht verallgemeinert.
const BESCHREIBUNG =
  'Elektrosmog und Schlaf: Bei 397 Anwohnern änderte das Funkfeld einer ' +
  'Versuchsanlage nichts. Was abends wirklich stört und was du am Bett tun kannst.';

/**
 * DATUM ALS KONSTANTE, NICHT ALS LAUFZEIT-UHR: ein `dateModified`, das sich bei
 * jedem Abruf bewegt, behauptet eine Pflege, die nicht stattfindet.
 * WER DEN TEXT DIESER SEITE AENDERT, ZIEHT `GEAENDERT` NACH — und den
 * `lastmod`-Wert in NUR_ROUTE_SEITEN im selben Commit.
 */
const VEROEFFENTLICHT = '2026-09-16';
const GEAENDERT = '2026-11-17';

export function links() {
  return [{rel: 'stylesheet', href: fragenStyles}];
}

/** @type {MetaFunction} */
export const meta = () => {
  const schema = frageSchema(SEITE, {
    datePublished: isoMitZone(VEROEFFENTLICHT),
    dateModified: isoMitZone(GEAENDERT),
  });
  return [
    {title: TITEL},
    {name: 'description', content: BESCHREIBUNG},
    canonicalLink(PFAD),
    ...teilbildTags(PFAD),
    {property: 'og:type', content: 'article'},
    {property: 'og:title', content: TITEL},
    {property: 'og:description', content: BESCHREIBUNG},
    {property: 'og:url', content: absoluteCanonical(PFAD)},
    {property: 'og:site_name', content: MARKE},
    ...(schema ? [{'script:ld+json': schema}] : []),
    // Brotkrume Startseite -> diese Seite (GEO-Seitenregel R6,
    // schema_pflicht.frageseite), aus der gemeinsamen Fabrik.
    {
      'script:ld+json': brotkrume({
        url: absoluteCanonical(PFAD),
        name: kurzName(TITEL),
      }),
    },
  ];
};

/**
 * PRAXIS-ABSCHNITT „Elektrosmog im Schlafzimmer: drei Quellen, drei
 * Handgriffe" (seit 2026-11-17, SEO-Maßnahme
 * M-SP-20261025-kann-elektrosmog-den-schlaf-stoeren). Der Text steht HIER in
 * der Route und nicht in app/data/fragen.js: das Datenmodul erreicht 13
 * Seiten, die Route nur diese eine, und der Abschnitt gehört nur hierher
 * (Gate 12 misst genau diese Reichweite). Die Route setzt ihn über den
 * vorhandenen Prop `anhang` ein: nach „Gut zu wissen", vor den Begriffen. FrageSeite.jsx bleibt dafür unverändert. Die Karten nutzen die
 * vorhandenen Klassen der Frageseiten (frg__inhalt, frg__liste, frg__karte),
 * es gibt keine neue Stilregel. Ohne das Feld rendert die Seite wie vorher.
 */
const ABSCHNITT = {
  "id": "elektrosmog-im-schlafzimmer",
  "titel": "Elektrosmog im Schlafzimmer: drei Quellen, drei Handgriffe",
  "einleitung": "In fast jedem Schlafzimmer liegen das Handy und Geräte am Kopfende, oft steht dort auch der WLAN-Router. Für jedes davon reicht ein einfacher Handgriff, und keiner kostet etwas.",
  "punkte": [
    {
      "titel": "Das Handy auf dem Nachttisch",
      "text": "Es bleibt die ganze Nacht mit dem Netz verbunden und meldet sich bei jeder Nachricht. Lade es außerhalb des Schlafzimmers, dann bleiben Funk, Licht und Nachrichten draußen. Bleibt es am Bett, schaltet der Flugmodus den Sender aus. In einer Studie brauchten Menschen, die abends an einem leuchtenden Lesegerät lasen, länger zum Einschlafen als mit einem gedruckten Buch."
    },
    {
      "titel": "Der WLAN-Router",
      "text": "Viele Router lassen sich so einstellen, dass das WLAN in der Nacht ruht. Diesen Handgriff nennt auch das Bundesamt für Strahlenschutz. Steht der Router im Schlafzimmer, stell ihn in einen anderen Raum. Bei doppeltem Abstand sinkt die Leistungsdichte im freien Raum auf ein Viertel."
    },
    {
      "titel": "Radiowecker, Ladegerät und Kabel am Kopfende",
      "text": "Elektrische Geräte bilden im Betrieb ein Magnetfeld, und das nimmt mit jedem Zentimeter Abstand stark ab. Schon bei 30 Zentimetern bleiben die meisten Haushaltsgeräte deutlich unter dem empfohlenen Referenzwert. Wer am Kopfkissen möglichst wenig Feld möchte, stellt Radiowecker und Netzteil eine Armlänge entfernt."
    }
  ]
};

function PraxisAbschnitt({abschnitt}) {
  if (!abschnitt) return null;
  return (
    <section
      id={abschnitt.id}
      data-geo="abschnitt"
      data-section="frg-abschnitt"
    >
      <div className="frg__inhalt">
        <h2>{abschnitt.titel}</h2>
        {abschnitt.einleitung ? <p>{abschnitt.einleitung}</p> : null}
        <ol className="frg__liste">
          {abschnitt.punkte.map((punkt) => (
            <li key={punkt.titel} className="frg__karte">
              <h3>{punkt.titel}</h3>
              <p>{punkt.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default function FrageRoute() {
  return (
    <FrageSeite
      seite={SEITE}
      anhang={<PraxisAbschnitt abschnitt={ABSCHNITT} />}
    />
  );
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
