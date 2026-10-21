import {useLoaderData} from 'react-router';
import {CourseLesson} from '~/components/kurse/CourseLesson';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {canonicalLink} from '~/lib/seo';
import {beschreibungTags} from '~/lib/seiten-beschreibung';
import {seitenSignale} from '~/lib/seiten-seo';
import {kursVideoSignale} from '~/lib/kurs-video-schema';

export const meta = ({data}) => {
  // TITEL (2026-09-26, AI-CEO-Entscheid seo:entscheidung:vorlage-titel-und-
  // beschreibungen-dach-20260908): 30-65 Zeichen, weil die Suchergebnis-Zeile
  // darunter Flaeche verschenkt und darueber abschneidet. Aussage vorn, Marke
  // hinten, keine Kurs-Nummerierung und keine Minutenangabe: beides sagt dem
  // Suchenden nicht, was er auf der Seite bekommt.
  const titel = 'E-Smog im Alltag: woher die Strahlung kommt | Qi Blanco';
  return [
    {title: titel},
    ...beschreibungTags('/pages/e-smog', data?.page?.seo?.description),
    canonicalLink('/pages/e-smog'),
    ...seitenSignale({
      pfad: '/pages/e-smog',
      titel,
      beschreibung: data?.page?.seo?.description,
    }),
    // Das Lektionsvideo als VideoObject. Die Einbettungs-URL kommt aus
    // app/lib/kurs-video-schema.js und ist DIESELBE, die unten an
    // <CourseLesson videoEmbed=...> steht — dass die beiden nie
    // auseinanderlaufen, prüft test/kurs-video-schema.test.mjs Zeichen um
    // Zeichen, nicht diese Konvention.
    ...kursVideoSignale({
      pfad: '/pages/e-smog',
      beschreibung: data?.page?.seo?.description,
    }),
  ];
};

export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args, 'e-smog');
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, request}, handle) {
  const [{page}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {variables: {handle}}),
  ]);
  if (!page) throw new Response('Not Found', {status: 404});
  redirectIfHandleIsLocalized(request, {handle, data: page});
  return {page};
}

function loadDeferredData() {
  return {};
}

/**
 * DER ANKER AUF DIE ANTWORTSEITE „Was ist Elektrosmog?" (2026-09-25, Auftrag
 * 20260926-seo-duenne-vorlagenseiten-aufwerten-oder-zusammenfuehren).
 *
 * WARUM HIER: /pages/e-smog ist die einzige eigene Seite zum Thema, die Google
 * im Index hat. /pages/was-ist-elektrosmog war Google am 2026-09-25 „nicht
 * bekannt" und nur von Seiten verlinkt, die selbst nicht im Index stehen. Die
 * Gewinner-Analyse des SERP-Testsystems misst: was eine Seite in den Index
 * bringt, ist der Link von einer indexierten Seite, nicht ihr Umfang.
 *
 * WARUM KEIN 301 IN DIESE LEKTION: geprüft und verworfen. Die Lektion ist
 * Tag 4 eines Kurses mit eigener Erzählung, die Antwortseite eine Definition
 * mit Quellen; die Texte teilen fast nichts (TF-IDF-Kosinus 0,038). Ein 301
 * hätte die Antwort unter 1900 Wörter Kurs geschoben.
 *
 * WO: vor „Weiterführende Informationen" im CMS-Text der Lektion, also vor dem
 * Kaufblock. Fehlt die Marke (jemand ändert die Lektion im Shopify-Admin),
 * hängt der Absatz am Ende — der Anker geht nie still verloren.
 * CourseLesson bleibt unberührt (zehn Routen teilen die Komponente).
 */
const ANKER_MARKE = '<h3>Weiterführende Informationen</h3>';
const ANKER_HTML =
  '<h3>Was hinter dem Wort Elektrosmog steckt</h3>' +
  '<p>Elektrosmog ist ein Sammelwort für zwei verschiedene Bereiche: ' +
  'niederfrequente Felder aus der Stromversorgung und hochfrequente Felder ' +
  'aus der Funktechnik. Wie du beide unterscheidest, in welcher Einheit sie ' +
  'gemessen werden und wogegen die Grenzwerte schützen, liest du mit allen ' +
  'Quellen unter <a href="/pages/was-ist-elektrosmog">Was ist ' +
  'Elektrosmog?</a></p>';

/** @param {string} [body] */
function mitAnker(body = '') {
  const i = body.indexOf(ANKER_MARKE);
  if (i === -1) return `${body}${ANKER_HTML}`;
  return `${body.slice(0, i)}${ANKER_HTML}${body.slice(i)}`;
}

export default function ESmogPage() {
  const {page} = useLoaderData();
  return (
    <CourseLesson
      title={page.title}
      body={mitAnker(page.body)}
      courseTitle="Superhuman"
      courseTo="/pages/superhuman"
      videoEmbed="https://www.youtube.com/embed/JmDaIlhOYaA?si=fUstmDJgspa2eDli"
      prevLesson={{label: 'Vorherige Lektion', to: '/pages/vitamine-mineralien'}}
      nextLesson={{label: 'Nächste Lektion', to: '/pages/kohaerentes-wasser'}}
    />
  );
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  ) @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle
      id
      title
      body
      seo { description title }
    }
  }
`;
