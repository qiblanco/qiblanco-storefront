import {useEffect, useId, useRef, useState} from 'react';
import {
  Link,
  data,
  redirect,
  useFetcher,
  useLoaderData,
} from 'react-router';
import {useAktionsergebnisUeberRevalidierung} from '~/lib/aktionsergebnis';
import {canonicalLink} from '~/lib/seo';
import {seitenSignale} from '~/lib/seiten-seo';
import {buyerIpAusRequest} from '~/lib/interner-verkehr';
import {artikelInhaltAufraeumen} from '~/lib/blog-inhalt';
import {fremdHtmlMitBildAuszeichnung} from '~/lib/fremd-html-bilder';
import {teilnahmeLink} from '~/lib/coming-home.server';
import {
  BLOG_HANDLE as BLOG_HANDLE_SERVER,
  abmeldeZustand,
  anmeldeZustand,
  apiBasis,
  apiPost,
  artikelLaden,
  bestaetigeZustand,
  eingabePruefen,
  seitenDaten,
  tokenAusCookie,
  tokenCookie,
  tokenCookieLoeschen,
  tokenGueltig,
  ueberschriftenTiefer,
} from '~/lib/coming-home-live.server';
import liveStyles from '~/styles/live.css?url';

/**
 * /pages/live — COMING HOME LIVE: nächster Termin, Anmeldung, Rückblick.
 *
 * NEUE FASSUNG (SEITE_NEU_AN, Grossjob 20261020-GROSSJOB-coming-home-live-
 * seite-neu-nach-christians-idee-pr-manager-als-chef-zusammenfassungen-live,
 * Segment s02, Vertrag KONZEPT.md Abschnitt 4). Christian 20.10.2026 zur
 * vorigen Fassung: „die Idee ist doch ganz anders … das bitte jetzt mal neu
 * machen mit PR-Manager als Chef.“ Reihenfolge nach seiner Idee: Kopf (was
 * wir machen, in den Worten von Anna und Christian, Eckdaten, wie man
 * teilnimmt) -> nächster Termin mit Thema -> Anmeldung -> je vergangene Woche
 * die schriftliche Zusammenfassung (Datum, Thema, Teaser, die Inhalte),
 * neueste zuerst; jede Woche mit vollem Text im HTML, ältere eingeklappt.
 * Den sichtbaren Text hat der PR-Chef (pr-manager chef pruefe) freigegeben.
 * Merkmal nur der neuen Fassung: data-ch-live-fassung="neu-20261020".
 * BLUE-GREEN: SEITE_NEU_AN = false rendert die Fassung von #957/#958.
 *
 * Die Beschreibung unten gilt der Fassung vom 18.10.2026 (SEITE_NEU_AN = false).
 *
 * Grossjob 20261018-GROSSJOB-coming-home-zoom-aufnahme-transkript-
 * zusammenfassung-homepage-reiter-live, Segment s04. Christian 18.10.2026:
 * „auf der Homepage … unter 'Mehr' unter dem Reiter 'Live' … beschreiben, was
 * wir da machen, und dann die Zusammenfassung … pro Woche festhalten, und
 * oben steht immer der neueste Termin … welches Thema", Nachtrag: „dass man
 * sich zu den Calls mit Name und E-Mail-Adresse anmelden kann … ein
 * Anmeldefenster … auf diesem Live-Reiter".
 *
 * AUFBAU (KONZEPT §7), Messmarker data-ch-live=kopf|termin|anmeldung|rueckblick
 * (Probe coming-home/pruefungen/probe_live_seite.py):
 *   (1) Kopf: was wir machen, wie man teilnimmt. Belegte Sätze aus
 *       /pages/coming-home (fragen und antworten, zuhören reicht, ohne
 *       Programm, kostenlos, Zoom im Browser oder in der App, 60 Minuten aus
 *       Christians Folie 15) und EIN Satz zur Aufnahme (Datenschutz-Leitplanke
 *       5 des Konzepts). Die Uhrzeit steht nur im Termin, nie im Fließtext:
 *       sie kommt aus dem Termin (Christians Uhrzeit-Widerspruch wird in Zoom
 *       geklärt, nicht hier).
 *   (2) Nächster Termin: ch-vorschau-Artikel mit dem kleinsten ch-datum, der
 *       noch nicht vorbei ist; ohne ihn der nächste Sonntag mit „Thema folgt".
 *       Ohne ch-zeit-HHMM (oder mit ch-zeit-offen) steht „Uhrzeit folgt",
 *       nie eine erfundene Uhrzeit (Nachtrag P2, 18.10.).
 *   (3) Anmeldung: Name, E-Mail, eigene Einwilligung NUR für Coming Home
 *       (Wortlaut und Version ch-live-1 von s05, kein Newsletter), Honigtopf.
 *       Die Action reicht an den Anmeldedienst (N4). Fällt er aus, zeigt die
 *       Seite den Zoom-Link direkt: niemand wird ausgesperrt.
 *   (4) Rückblick je Woche, neueste zuerst (ch-rueckblick). Die neueste
 *       Geschichte steht ganz da, die älteren mit Teaser und Link; höchstens
 *       26, der Rest über den Link in den Blog.
 *
 * MAIL-LINKS ?bestaetigen=<t> und ?abmelden=<t>: der Loader legt den Token in
 * den HttpOnly-Cookie ch_live und leitet auf ?schritt=… um. So liest kein
 * Tracker der Seite den Token aus der Adresse (Muster pb_verwalten,
 * app/lib/produktberatung-verwalten.server.js). Ein GET bestätigt nie: erst
 * der Klick auf den Knopf schickt den POST.
 *
 * TRACKING-NAHT: kein Tracking-Cookie, kein neuer Identitäts- oder
 * Tracking-Schlüssel, die Seite führt nicht zur Kasse. ch_live ist HttpOnly,
 * host-only, lebt einen Tag und geht an keinen Tracker. TRACKING_COOKIE_NAMES
 * bleibt unberührt. Die Kunden-IP geht nur als X-CH-Kunde-IP an den eigenen
 * Dienst. Das Formular ist ein echtes <form> mit input[type=email], das
 * identify macht der Bestand (qpx.js, nur mit Einwilligung).
 *
 * RÜCKWEG: hb-deploy revert des Merge-Commits (Seite liefert dann 404, der
 * Menüeintrag „Live" wird per menue-Rückbau entfernt). Nur den Zoom-Link
 * abschalten: LINK_AN in app/lib/coming-home.server.js.
 */

const PFAD = '/pages/live';

/**
 * BLUE-GREEN (Vorbild NEUER_TITEL_AN, homepage-bauer devlog D-3519):
 * true = neue Fassung nach Christians Idee (20.10.2026), false = die Fassung
 * von #957/#958 Zeichen für Zeichen (Kopf, Rückblick, Titel, Beschreibung).
 * Termin und Anmeldung sind in beiden Fassungen dieselben Bausteine.
 */
const SEITE_NEU_AN = true;

/** Blog des Nahtvertrags N3; muss dem Server-Modul gleichen (Loader prueft). */
const BLOG_HANDLE = 'coming-home';

/** Einwilligungs-Version und Wortlaut von s05 (Anmeldedienst, Naht N4). */
const EINWILLIGUNG_VERSION = 'ch-live-1';

/**
 * Titel der Reihe (Christian 20.10.2026 ~03:47Z, wörtlich: „Nein, der Titel
 * heißt nur Coming Home, eine Reise zu dir selbst.“). Server-SSoT:
 * shared-state/coming-home/config/coming-home.conf CH_REIHE_* (stand.json
 * reihe{}); dieselben Konstanten stehen in pages.coming-home.jsx.
 * Der Zusatz bricht nur als Ganzes um (kein einzelnes Wort allein in Zeile 2).
 * BLUE-GREEN: NEUER_TITEL_AN = false stellt die Fassung vor dem 20.10.2026
 * Zeichen für Zeichen wieder her (Original bleibt aktivierbar).
 */
const NEUER_TITEL_AN = true;
const REIHE_NAME = 'Coming Home';
const REIHE_ZUSATZ = 'Eine Reise zu dir selbst';
const REIHE_TITEL = `${REIHE_NAME} – ${REIHE_ZUSATZ}`;
const REIHE_VORZEILE = NEUER_TITEL_AN ? (
  <>
    {REIHE_NAME} –{' '}
    <span style={{whiteSpace: 'nowrap'}}>{REIHE_ZUSATZ}</span>
  </>
) : (
  'Coming Home · jeden Sonntag live'
);

const TITEL_ALT = NEUER_TITEL_AN
  ? `${REIHE_TITEL}: nächster Termin | Qi Blanco`
  : 'Coming Home live: nächster Termin und Rückblick | Qi Blanco';

const BESCHREIBUNG_ALT =
  'Jeden Sonntag eine Stunde live per Zoom mit Anna und Christian, ' +
  'kostenlos. Der nächste Termin mit Thema, die Anmeldung mit Link per Mail ' +
  'und was wir an den letzten Sonntagen besprochen haben.';

// ─── Text der neuen Fassung (vom PR-Chef geprüft) ───────────────────────────

const TITEL_NEU = `${REIHE_TITEL}: Termine und Zusammenfassungen | Qi Blanco`;

const BESCHREIBUNG_NEU =
  'Jeden Sonntag um 12 Uhr (Berlin) treffen sich Anna und Christian mit allen, ' +
  'die dabei sein möchten, 90 Minuten per Zoom, kostenlos. Hier stehen der ' +
  'nächste Termin mit Thema, die Anmeldung und je Woche, worüber wir ' +
  'gesprochen haben.';

const TITEL = SEITE_NEU_AN ? TITEL_NEU : TITEL_ALT;
const BESCHREIBUNG = SEITE_NEU_AN ? BESCHREIBUNG_NEU : BESCHREIBUNG_ALT;

/**
 * Kopftext in den Worten der Gastgeber (Calls 20.09., 11.10., 18.10.2026,
 * KONZEPT.md Abschnitt 4). Erster Absatz groß, die übrigen als Fließtext.
 */
const KOPF_LEDE =
  'Coming Home heißt: nach Hause kommen, zu dir selbst. Mehr Wahrheit, mehr ' +
  'Selbstliebe, mehr Freude.';
const KOPF_TEXT = [
  'Jeden Sonntag treffen wir uns dafür auf Zoom, Anna und Christian und alle, ' +
    'die dabei sein möchten. Wir reden über das, was uns gerade bewegt, auch ' +
    'über Herausforderungen. Und wir suchen gemeinsam einen neuen Blick ' +
    'darauf, damit du gestärkt aus der Runde gehst.',
  'Alles darf, nichts muss. Kamera an oder aus, beides ist willkommen.',
];

const ECKDATEN_NEU = [
  {begriff: 'Wann', wert: 'Jeden Sonntag, 12:00 Uhr (Berlin)'},
  {begriff: 'Dauer', wert: '90 Minuten'},
  {begriff: 'Wo', wert: 'Per Zoom, im Browser oder in der App'},
  {begriff: 'Kosten', wert: 'Keine'},
];

const TEILNAHME_TEXT =
  'So bist du dabei: Melde dich mit Name und E-Mail-Adresse an. Den ' +
  'Zoom-Link schicken wir dir per Mail.';

const AUFNAHME_TEXT =
  'Wir zeichnen jeden Sonntag auf, um danach aufzuschreiben, worüber wir ' +
  'gesprochen haben. Die Aufnahme bleibt bei uns. Aus der Runde nennen wir ' +
  'keine Namen und erzählen keine persönlichen Geschichten.';

const WOCHEN_TITEL = 'Worüber wir gesprochen haben';
const WOCHEN_LEER = 'Nach jedem Sonntag steht hier, worüber wir gesprochen haben.';
const WOCHEN_LADEFEHLER =
  'Die Zusammenfassungen laden gerade nicht. Versuch es in ein paar Minuten ' +
  'noch einmal.';
const WOCHE_AUFKLAPPEN = 'Zusammenfassung lesen';

const ECKDATEN = [
  {begriff: 'Wann', wert: 'Jeden Sonntag'},
  {begriff: 'Dauer', wert: '60 Minuten'},
  {begriff: 'Wo', wert: 'Per Zoom, im Browser oder in der App'},
  {begriff: 'Kosten', wert: 'Keine'},
];

const EINWILLIGUNG_TEXT =
  'Ja, ich möchte zu Coming Home eingeladen werden. Qi Blanco schickt mir ' +
  'dafür den Zoom-Link und vor jedem Termin eine Erinnerung per Mail. Das ist ' +
  'kein Newsletter. Abmelden geht jederzeit mit einem Klick in jeder Mail.';

const KOPF_PRIVAT = {'Cache-Control': 'private, no-store'};

export function links() {
  return [{rel: 'stylesheet', href: liveStyles}];
}

export const meta = ({data: d}) => {
  const basis = [
    {title: TITEL},
    {name: 'description', content: BESCHREIBUNG},
    canonicalLink(PFAD),
    ...seitenSignale({pfad: PFAD, titel: TITEL, beschreibung: BESCHREIBUNG}),
  ];
  // Die Schritt-Ansichten der Mail-Links gehören nicht in den Index.
  return d?.schritt ? [...basis, {name: 'robots', content: 'noindex'}] : basis;
};

export function headers({loaderHeaders}) {
  const cc = loaderHeaders.get('Cache-Control');
  return cc ? {'Cache-Control': cc} : {};
}

export async function loader({request, context}) {
  const url = new URL(request.url);
  for (const [param, schritt] of [
    ['bestaetigen', 'bestaetigen'],
    ['abmelden', 'abmelden'],
  ]) {
    const roh = url.searchParams.get(param);
    if (roh !== null) {
      if (!tokenGueltig(roh)) throw redirect(`${PFAD}?schritt=ungueltig`);
      throw redirect(`${PFAD}?schritt=${schritt}`, {
        headers: {'Set-Cookie': tokenCookie(roh), ...KOPF_PRIVAT},
      });
    }
  }
  let schritt = url.searchParams.get('schritt') || '';
  if (!['bestaetigen', 'abmelden', 'ungueltig'].includes(schritt)) schritt = '';
  if (schritt && schritt !== 'ungueltig' && !tokenAusCookie(request)) {
    schritt = 'ungueltig';
  }

  if (BLOG_HANDLE !== BLOG_HANDLE_SERVER) throw new Error('BLOG_HANDLE driftet');
  const {artikel, ladeFehler} = await artikelLaden(context);
  const seite = seitenDaten(artikel, new Date());
  const rueckblicke = seite.rueckblicke.map((r) => {
    const html = fremdHtmlMitBildAuszeichnung(
      artikelInhaltAufraeumen(r.html, r.titel),
    );
    return {...r, html: SEITE_NEU_AN ? ueberschriftenTiefer(html) : html};
  });
  return data(
    {...seite, rueckblicke, ladeFehler, schritt},
    schritt ? {headers: KOPF_PRIVAT} : undefined,
  );
}

export async function action({request, context}) {
  if (request.method !== 'POST') {
    return data({zustand: 'fehler'}, {status: 405, headers: KOPF_PRIVAT});
  }
  let form;
  try {
    form = await request.formData();
  } catch {
    return data({zustand: 'fehler'}, {status: 400, headers: KOPF_PRIVAT});
  }
  const intent = String(form.get('intent') || 'anmelden');
  const basis = apiBasis(context?.env);
  const optionen = {
    kundeIp: buyerIpAusRequest(request),
    probe: request.headers.get('X-CH-Probe') || '',
  };

  if (intent === 'bestaetigen' || intent === 'abmelden') {
    const token = tokenAusCookie(request);
    if (!token) {
      return data({intent, zustand: 'ungueltig'}, {headers: KOPF_PRIVAT});
    }
    const r = await apiPost(basis, `/api/${intent}`, {token}, optionen);
    const zustand =
      intent === 'bestaetigen' ? bestaetigeZustand(r) : abmeldeZustand(r);
    const kopf = {...KOPF_PRIVAT};
    // Der Token hat ausgedient, sobald der Dienst ihn beantwortet hat.
    if (zustand !== 'fehler' && zustand !== 'direkt') {
      kopf['Set-Cookie'] = tokenCookieLoeschen();
    }
    const antwort = {intent, zustand};
    if (intent === 'bestaetigen' && zustand === 'bestaetigt') {
      antwort.link = r.body?.zoom_link || teilnahmeLink();
    }
    if (intent === 'bestaetigen' && zustand === 'direkt') {
      antwort.link = teilnahmeLink();
    }
    return data(antwort, {headers: kopf});
  }

  // Anmeldung. Ist der Honigtopf gefüllt, geht nichts an den Dienst, der
  // Link kommt trotzdem (Lehre /pages/coming-home 02.10.2026: Autofill füllt
  // solche Felder, ein Mensch stünde sonst ohne Link da).
  const eingabe = eingabePruefen(form, EINWILLIGUNG_VERSION);
  if (!eingabe.ok) {
    return data(
      {intent: 'anmelden', zustand: 'eingabe', grund: eingabe.grund},
      {headers: KOPF_PRIVAT},
    );
  }
  if (String(form.get('hp') || '') !== '') {
    return data(
      {intent: 'anmelden', zustand: 'direkt', link: teilnahmeLink()},
      {headers: KOPF_PRIVAT},
    );
  }
  const r = await apiPost(
    basis,
    '/api/anmeldung',
    {
      name: eingabe.name,
      email: eingabe.email,
      einwilligung_version: EINWILLIGUNG_VERSION,
      quelle: 'live-de',
      markt: 'dach',
      hp: '',
    },
    optionen,
  );
  const zustand = anmeldeZustand(r);
  const antwort = {intent: 'anmelden', zustand};
  if (['direkt', 'schon_bestaetigt', 'gedrosselt'].includes(zustand)) {
    antwort.link = teilnahmeLink();
  }
  return data(antwort, {headers: KOPF_PRIVAT});
}

export default function Live() {
  const d = useLoaderData();
  if (SEITE_NEU_AN) return <LiveNeu d={d} />;
  return (
    <div className="lv">
      <Kopf />
      <Termin naechster={d.naechster} weitere={d.weitere} />
      <section
        className="lv-abschnitt lv-dunkel"
        id="anmelden"
        data-ch-live="anmeldung"
      >
        <div className="lv-innen lv-innen-schmal">
          {d.schritt ? (
            <Schritt schritt={d.schritt} />
          ) : (
            <>
              <h2 className="lv-h2">Melde dich an, der Link kommt per Mail</h2>
              <Anmeldung />
            </>
          )}
        </div>
      </section>
      <Rueckblick
        rueckblicke={d.rueckblicke}
        gesamt={d.rueckblickeGesamt}
        ladeFehler={d.ladeFehler}
      />
    </div>
  );
}

/** Neue Fassung (20.10.2026): Kopf, Termin, Anmeldung, Woche für Woche. */
function LiveNeu({d}) {
  return (
    <div className="lv" data-ch-live-fassung="neu-20261020">
      <KopfNeu />
      <Termin naechster={d.naechster} weitere={d.weitere} />
      <section
        className="lv-abschnitt lv-dunkel"
        id="anmelden"
        data-ch-live="anmeldung"
      >
        <div className="lv-innen lv-innen-schmal">
          {d.schritt ? (
            <Schritt schritt={d.schritt} />
          ) : (
            <>
              <h2 className="lv-h2">Melde dich an, der Link kommt per Mail</h2>
              <Anmeldung />
            </>
          )}
        </div>
      </section>
      <Zusammenfassungen
        rueckblicke={d.rueckblicke}
        gesamt={d.rueckblickeGesamt}
        ladeFehler={d.ladeFehler}
      />
    </div>
  );
}

function KopfNeu() {
  return (
    <section className="lv-abschnitt lv-kopf" data-ch-live="kopf">
      <div className="lv-innen">
        <p className="lv-vorzeile">Live auf Zoom</p>
        <h1 className="lv-h1">{REIHE_TITEL}</h1>
        <p className="lv-lede lv-lede-eng">{KOPF_LEDE}</p>
        <div className="lv-kopftext">
          {KOPF_TEXT.map((absatz) => (
            <p className="lv-text" key={absatz.slice(0, 24)}>
              {absatz}
            </p>
          ))}
        </div>
        <dl className="lv-eckdaten">
          {ECKDATEN_NEU.map((e) => (
            <div className="lv-eckdatum" key={e.begriff}>
              <dt className="lv-eckdatum-begriff">{e.begriff}</dt>
              <dd className="lv-eckdatum-wert">{e.wert}</dd>
            </div>
          ))}
        </dl>
        <p className="lv-text lv-teilnahme">
          {TEILNAHME_TEXT}{' '}
          <a className="lv-verweis" href="#anmelden">
            Zur Anmeldung
          </a>
        </p>
        <p className="lv-text lv-aufnahme">{AUFNAHME_TEXT}</p>
        {/* Kontextlink auf die Sprechstunde (Folgeauftrag Sprechstunde-
            Kontextlinks, 19.10.2026). Kein Preis im Link. */}
        <p className="lv-hinweis">
          Eine Stunde allein mit Christian gibt es in der{' '}
          <Link
            className="lv-verweis"
            to="/pages/sprechstunde"
            prefetch="intent"
          >
            Sprechstunde
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

/**
 * Je vergangene Woche die Zusammenfassung, neueste zuerst. Die neueste steht
 * offen da, die älteren in <details>: ihr voller Text steht trotzdem im HTML
 * (für Leser ohne Klick, Suchmaschinen und KI-Abruf).
 */
function Zusammenfassungen({rueckblicke, gesamt, ladeFehler}) {
  return (
    <section
      className="lv-abschnitt"
      data-ch-live="rueckblick"
      data-ch-live-anzahl={rueckblicke.length}
      data-ch-live-gesamt={gesamt}
      data-ch-live-ladefehler={ladeFehler ? 'ja' : 'nein'}
    >
      <div className="lv-innen lv-innen-schmal">
        <h2 className="lv-h2">{WOCHEN_TITEL}</h2>
        {rueckblicke.length === 0 ? (
          <p className="lv-text lv-leer">
            {ladeFehler ? WOCHEN_LADEFEHLER : WOCHEN_LEER}
          </p>
        ) : (
          <ol className="lv-woche-liste">
            {rueckblicke.map((r, i) => (
              <li
                className="lv-woche"
                key={r.handle || r.datum}
                data-ch-live-eintrag={r.datum}
              >
                <p className="lv-woche-wann">
                  <time dateTime={r.startUtc}>{r.datumLang}</time>
                </p>
                <h3 className="lv-h3">{r.titel}</h3>
                {r.teaser ? (
                  <p className="lv-text lv-woche-teaser">{r.teaser}</p>
                ) : null}
                {i === 0 ? (
                  <div
                    className="lv-geschichte lv-inhalte"
                    dangerouslySetInnerHTML={{__html: r.html}}
                  />
                ) : (
                  <details className="lv-aufklapp">
                    <summary className="lv-aufklapp-knopf">
                      {WOCHE_AUFKLAPPEN}
                    </summary>
                    <div
                      className="lv-geschichte lv-inhalte"
                      dangerouslySetInnerHTML={{__html: r.html}}
                    />
                  </details>
                )}
              </li>
            ))}
          </ol>
        )}
        {gesamt > rueckblicke.length ? (
          <p className="lv-text lv-alle">
            <Link
              className="lv-verweis"
              to={`/blogs/${BLOG_HANDLE}`}
              prefetch="intent"
            >
              Alle {gesamt} Zusammenfassungen im Blog
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}

function Kopf() {
  return (
    <section className="lv-abschnitt lv-kopf" data-ch-live="kopf">
      <div className="lv-innen">
        <p className="lv-vorzeile">{REIHE_VORZEILE}</p>
        <h1 className="lv-h1">Eine Stunde mit Anna und Christian</h1>
        <p className="lv-lede">
          Du fragst, wir antworten. Auch die unbequemen Fragen. Oder du hörst
          einfach zu, mit einer Tasse Kakao oder Tee.
        </p>
        <dl className="lv-eckdaten">
          {ECKDATEN.map((e) => (
            <div className="lv-eckdatum" key={e.begriff}>
              <dt className="lv-eckdatum-begriff">{e.begriff}</dt>
              <dd className="lv-eckdatum-wert">{e.wert}</dd>
            </div>
          ))}
        </dl>
        <p className="lv-text lv-aufnahme">
          Wir zeichnen jeden Sonntag auf, um danach aufzuschreiben, worüber wir
          gesprochen haben. Die Aufnahme bleibt bei uns. Geschichten aus der
          Runde erzählen wir ohne Namen.
        </p>
        {/* Kontextlink auf die Sprechstunde (Folgeauftrag Sprechstunde-
            Kontextlinks, 19.10.2026). Kein Preis im Link. */}
        <p className="lv-hinweis">
          Eine Stunde allein mit Christian gibt es in der{' '}
          <Link
            className="lv-verweis"
            to="/pages/sprechstunde"
            prefetch="intent"
          >
            Sprechstunde
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

function Termin({naechster, weitere}) {
  return (
    <section className="lv-abschnitt lv-termin" data-ch-live="termin">
      <div className="lv-innen lv-innen-schmal">
        <h2 className="lv-h2">Der nächste Termin</h2>
        {naechster ? (
          <article
            className="lv-terminkarte"
            data-ch-live-termin={naechster.datum}
            data-ch-live-quelle={naechster.quelle}
          >
            <p className="lv-termin-wann">
              <time dateTime={naechster.startUtc}>
                {naechster.datumLang}, {naechster.uhrzeit || 'Uhrzeit folgt'}
              </time>
            </p>
            <h3 className="lv-h3">{naechster.titel || 'Thema folgt'}</h3>
            {naechster.teaser ? (
              <p className="lv-text">{naechster.teaser}</p>
            ) : null}
            <a className="btn--primary lv-knopf" href="#anmelden">
              Kostenlos anmelden
            </a>
          </article>
        ) : null}
        {weitere.length ? (
          <div className="lv-weitere">
            <h3 className="lv-h4">Danach geplant</h3>
            <ul className="lv-weitere-liste">
              {weitere.map((w) => (
                <li className="lv-weitere-punkt" key={w.datum}>
                  <time className="lv-weitere-wann" dateTime={w.startUtc}>
                    {w.datumKurz}
                  </time>{' '}
                  <span>{w.titel || 'Thema folgt'}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Rueckblick({rueckblicke, gesamt, ladeFehler}) {
  return (
    <section
      className="lv-abschnitt"
      data-ch-live="rueckblick"
      data-ch-live-anzahl={rueckblicke.length}
      data-ch-live-gesamt={gesamt}
      data-ch-live-ladefehler={ladeFehler ? 'ja' : 'nein'}
    >
      <div className="lv-innen lv-innen-schmal">
        <h2 className="lv-h2">Worüber wir gesprochen haben</h2>
        {rueckblicke.length === 0 ? (
          <p className="lv-text lv-leer">
            {ladeFehler
              ? 'Die Rückblicke laden gerade nicht. Versuch es in ein paar Minuten noch einmal.'
              : 'Die erste Zusammenfassung erscheint nach dem nächsten Sonntag.'}
          </p>
        ) : (
          <ol className="lv-woche-liste">
            {rueckblicke.map((r, i) => (
              <li
                className="lv-woche"
                key={r.handle || r.datum}
                data-ch-live-eintrag={r.datum}
              >
                <p className="lv-woche-wann">
                  <time dateTime={r.startUtc}>{r.datumLang}</time>
                </p>
                <h3 className="lv-h3">{r.titel}</h3>
                {i === 0 ? (
                  <div
                    className="lv-geschichte"
                    dangerouslySetInnerHTML={{__html: r.html}}
                  />
                ) : (
                  <p className="lv-text">{r.teaser}</p>
                )}
                {i > 0 && r.handle ? (
                  <Link
                    className="lv-verweis"
                    to={`/blogs/${BLOG_HANDLE}/${r.handle}`}
                    prefetch="intent"
                  >
                    Ganze Geschichte lesen
                  </Link>
                ) : null}
              </li>
            ))}
          </ol>
        )}
        {gesamt > rueckblicke.length ? (
          <p className="lv-text lv-alle">
            <Link
              className="lv-verweis"
              to={`/blogs/${BLOG_HANDLE}`}
              prefetch="intent"
            >
              Alle {gesamt} Rückblicke im Blog
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}

/**
 * Antwort der Action: Fetcher (mit JavaScript) oder Seitenantwort (ohne). Die
 * Seitenantwort über den Haus-Hook, damit eine Revalidierung (Cookie-Banner)
 * sie nicht wegwirft (F-2566).
 */
function useAntwort(fetcher) {
  const ohneJs = useAktionsergebnisUeberRevalidierung();
  return fetcher.data ?? ohneJs ?? null;
}

function Anmeldung() {
  const fetcher = useFetcher();
  const antwort = useAntwort(fetcher);
  const id = useId();
  const erfolgRef = useRef(null);
  const sendet = fetcher.state !== 'idle';
  const zustand = sendet ? 'sendet' : antwort?.zustand || 'offen';
  const fertig = [
    'doi_gesendet',
    'schon_bestaetigt',
    'gedrosselt',
    'direkt',
  ].includes(zustand);

  useEffect(() => {
    if (fertig) erfolgRef.current?.focus();
  }, [fertig]);

  if (fertig) {
    return (
      <div
        className="lv-karte"
        data-ch-live-form=""
        data-ch-live-zustand={zustand}
      >
        <h3 className="lv-h3" tabIndex={-1} ref={erfolgRef}>
          {ERFOLG_TITEL[zustand]}
        </h3>
        <p className="lv-text">{ERFOLG_TEXT[zustand]}</p>
        {antwort?.link ? <ZoomZugang link={antwort.link} id={id} /> : null}
      </div>
    );
  }

  return (
    <fetcher.Form
      method="post"
      action={PFAD}
      className="lv-karte"
      data-ch-live-form=""
      data-ch-live-zustand={zustand}
      data-qb-kaufknopf=""
    >
      <input type="hidden" name="intent" value="anmelden" />
      <label className="lv-feldname" htmlFor={`${id}-name`}>
        Dein Name
      </label>
      <input
        id={`${id}-name`}
        className="lv-feld"
        type="text"
        name="name"
        autoComplete="name"
        required
        maxLength={120}
      />
      <label className="lv-feldname" htmlFor={`${id}-email`}>
        Deine E-Mail-Adresse
      </label>
      <input
        id={`${id}-email`}
        className="lv-feld"
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        required
        maxLength={254}
      />
      <label className="lv-einwilligung" htmlFor={`${id}-einwilligung`}>
        <input
          id={`${id}-einwilligung`}
          className="lv-haken"
          type="checkbox"
          name="einwilligung_version"
          value={EINWILLIGUNG_VERSION}
          required
        />
        <span>{EINWILLIGUNG_TEXT}</span>
      </label>
      <input
        className="lv-topf"
        type="text"
        name="hp"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        data-lpignore="true"
        data-1p-ignore=""
        data-bwignore=""
        data-form-type="other"
      />
      <button className="btn--primary lv-knopf" type="submit" disabled={sendet}>
        {sendet ? 'Wird gesendet …' : 'Anmelden'}
      </button>
      {zustand === 'fehler' || zustand === 'eingabe' ? (
        <p className="lv-fehler" role="alert">
          {antwort?.grund === 'einwilligung'
            ? 'Setz bitte den Haken, damit wir dir den Link schicken dürfen.'
            : 'Das hat nicht geklappt. Bitte prüf deinen Namen und deine E-Mail-Adresse.'}
        </p>
      ) : null}
      <p className="lv-hinweis">
        Du bekommst eine Mail mit einem Knopf zum Bestätigen. Danach schicken
        wir dir den Zoom-Link.{' '}
        <Link className="lv-verweis" to="/pages/datenschutz" prefetch="intent">
          Datenschutz
        </Link>
      </p>
    </fetcher.Form>
  );
}

const ERFOLG_TITEL = {
  doi_gesendet: 'Schau in dein Postfach',
  schon_bestaetigt: 'Du bist schon angemeldet',
  gedrosselt: 'Du hast dich gerade schon angemeldet',
  direkt: 'Hier ist dein Zoom-Link',
};

const ERFOLG_TEXT = {
  doi_gesendet:
    'Wir haben dir eine Mail geschickt. Klick dort auf den Knopf, dann ' +
    'bekommst du den Zoom-Link. Schau auch im Spam-Ordner nach.',
  schon_bestaetigt:
    'Vor jedem Termin bekommst du eine Erinnerung per Mail. Hier ist der ' +
    'Link für Sonntag.',
  gedrosselt:
    'Die Mail ist schon unterwegs. Bis sie da ist, kommst du mit diesem Link ' +
    'ins Meeting.',
  direkt:
    'Die Mail kommt gerade nicht durch. Mit diesem Link kommst du trotzdem ' +
    'ins Meeting.',
};

/** Ansicht der Mail-Links: ein Knopf, erst der Klick schickt den POST. */
function Schritt({schritt}) {
  const fetcher = useFetcher();
  const antwort = useAntwort(fetcher);
  const id = useId();
  const sendet = fetcher.state !== 'idle';
  const zustand = sendet ? 'sendet' : antwort?.zustand || schritt;

  if (zustand === 'ungueltig') {
    return (
      <>
        <h2 className="lv-h2">Dieser Link gilt nicht mehr</h2>
        <p className="lv-text lv-text-mitte">
          Melde dich einfach noch einmal an. Das dauert eine Minute.
        </p>
        <Anmeldung />
      </>
    );
  }
  if (zustand === 'bestaetigt' || (antwort?.intent === 'bestaetigen' && zustand === 'direkt')) {
    return (
      <>
        <h2 className="lv-h2">Du bist dabei</h2>
        <div className="lv-karte" data-ch-live-zustand={zustand}>
          <p className="lv-text">
            Vor jedem Termin erinnern wir dich per Mail. Hier kommst du ins
            Meeting:
          </p>
          {antwort?.link ? <ZoomZugang link={antwort.link} id={id} /> : null}
        </div>
      </>
    );
  }
  if (zustand === 'abgemeldet') {
    return (
      <>
        <h2 className="lv-h2">Du bist abgemeldet</h2>
        <p className="lv-text lv-text-mitte" data-ch-live-zustand="abgemeldet">
          Wir schicken dir keine Einladungen mehr. Du kannst dich jederzeit
          wieder anmelden.
        </p>
      </>
    );
  }

  const bestaetigen = schritt === 'bestaetigen';
  return (
    <>
      <h2 className="lv-h2">
        {bestaetigen ? 'Bestätige deine Anmeldung' : 'Von Coming Home abmelden'}
      </h2>
      <fetcher.Form
        method="post"
        action={`${PFAD}?schritt=${schritt}`}
        className="lv-karte lv-karte-knopf"
        data-ch-live-form=""
        data-ch-live-zustand={zustand}
      >
        <input type="hidden" name="intent" value={schritt} />
        <p className="lv-text">
          {bestaetigen
            ? 'Ein Klick genügt. Danach bekommst du den Zoom-Link.'
            : 'Danach bekommst du keine Einladungen und Erinnerungen mehr.'}
        </p>
        <button className="btn--primary lv-knopf" type="submit" disabled={sendet}>
          {sendet
            ? 'Wird gesendet …'
            : bestaetigen
              ? 'Anmeldung bestätigen'
              : 'Abmelden'}
        </button>
        {zustand === 'fehler' ? (
          <p className="lv-fehler" role="alert">
            Das hat nicht geklappt. Versuch es bitte gleich noch einmal.
          </p>
        ) : null}
      </fetcher.Form>
    </>
  );
}

/** Knopf ins Meeting (neuer Tab), darunter derselbe Link als Text mit Kopieren. */
function ZoomZugang({link, id}) {
  const [kopiert, setKopiert] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    if (!kopiert) return undefined;
    const t = setTimeout(() => setKopiert(false), 2500);
    return () => clearTimeout(t);
  }, [kopiert]);

  async function kopieren() {
    try {
      await navigator.clipboard.writeText(link);
      setKopiert(true);
      return;
    } catch {
      // ältere Browser oder ohne Freigabe: Text markieren, damit Strg+C geht
    }
    const el = textRef.current;
    if (!el) return;
    const bereich = document.createRange();
    bereich.selectNodeContents(el);
    const auswahl = window.getSelection();
    auswahl?.removeAllRanges();
    auswahl?.addRange(bereich);
    try {
      setKopiert(document.execCommand('copy'));
    } catch {
      setKopiert(false);
    }
  }

  return (
    <>
      <a
        className="btn--primary lv-knopf lv-knopf-zoom"
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        data-ch-live-link=""
      >
        Zum Zoom-Meeting
      </a>
      <p className="lv-feldname lv-link-titel" id={`${id}-linktext`}>
        Oder kopiere dir den Link:
      </p>
      <div className="lv-link-zeile">
        <span
          className="lv-link-text"
          ref={textRef}
          aria-labelledby={`${id}-linktext`}
        >
          {link}
        </span>
        <button type="button" className="lv-kopieren" onClick={kopieren}>
          {kopiert ? 'Kopiert' : 'Kopieren'}
        </button>
      </div>
      <p className="lv-sr" aria-live="polite">
        {kopiert ? 'Der Link ist kopiert.' : ''}
      </p>
    </>
  );
}
