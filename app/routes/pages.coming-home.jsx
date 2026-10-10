import {useEffect, useId, useRef, useState} from 'react';
import {Link, data, useFetcher} from 'react-router';
import {canonicalLink, absoluteCanonical} from '~/lib/seo';
import {seitenSignale} from '~/lib/seiten-seo';
import {ActiveCampaignForm} from '~/components/reusables/ActiveCampaignForm';
import {teilnahmeLink} from '~/lib/coming-home.server';
import comingHomeStyles from '~/styles/coming-home.css?url';

/**
 * /pages/coming-home — ANMELDESEITE FÜR „COMING HOME LIVE".
 *
 * Auftrag growth-m-lp-coming-home-anmeldeseite (Christian, 26.09.2026, über
 * den Business-Growth-Manager; Leitplanke Folie 15 „Jeden Sonntag Live
 * 60 min"). Ziel der Einladung, der Reels und der Anzeige V18.
 *
 * WAS DIE SEITE WILL: genau einen nächsten Klick, die Anmeldung. Kein Preis,
 * kein Kaufknopf, kein Produktversprechen (Format-Regel: Preis und harte
 * Kaufaufforderung nur im langen Video).
 *
 * WOHER DIE ANGABEN STAMMEN, keine ist geraten:
 *   · jeden Sonntag 19 Uhr, per Zoom  -> Elinas Einladungen an die DACH-Liste
 *     (ActiveCampaign-Kampagnen 1049 vom 18.09. und 1051 vom 24.09.2026)
 *   · 60 Minuten                      -> Christians Leitplanke, Folie 15
 *   · „Alles kann, nichts muss", Kakao oder Tee, zuhören reicht, ohne
 *     Programm                        -> Wortlaut der Einladungen
 *   · „Ihr fragt, wir antworten. Auch die unbequemen Fragen. Nichts ist
 *     vorher abgesprochen."           -> Drehplan, Video V18
 * NICHT geschrieben, weil in keiner Quelle belegt: Aussagen zu Kamera,
 * Aufzeichnung oder Teilnehmerzahl.
 *
 * ANMELDUNG = EIGENES FORMULAR 33 „Coming Home Anmeldung" (seit Elinas
 * Auftrag EL-20261002-4328e3fe; bis dahin Formular 15 wie der Fuß). Elina
 * hat es am 02.10.2026 in ActiveCampaign angelegt: Liste „Newsletter DACH",
 * dieselbe Bestätigungsmail wie Formular 15 (Double-Opt-in), und das
 * Formular hängt selbst den Tag „coming-home" an. So ist jede Anmeldung über
 * diese Seite in ActiveCampaign einzeln zählbar. Der Fuß jeder Seite bleibt
 * bei Formular 15. Der Browser schickt Name und E-Mail direkt an
 * ActiveCampaign, unser Server sieht weder Name noch Adresse.
 *
 * EIGENES FORMULAR-MARKUP, DAS EMBED NUR ALS QUELLE: die Seite zeigt ihr
 * eigenes Formular im Seitendesign. Das Embed von Formular 33 wird
 * unsichtbar mitgeladen (<ActiveCampaignForm formId="33"> in einem
 * hidden-Container), nur damit die Seite seine verborgenen Felder lesen kann.
 * Es kollidiert nicht mit dem Fuß, der trägt die Id 15.
 *
 * DIE VERBORGENEN FELDER KOMMEN AUS DEM EMBED, NICHT AUS DIESER DATEI.
 * Zwei davon erzeugt ActiveCampaign bei jedem Rendern des Embeds neu: `u`
 * (eine Kennung mit der Renderzeit) und `or` (eine UUID). Gemessen am
 * 2026-10-01: um 11:16Z und um 11:48Z lieferte embed.php?id=15 verschiedene
 * Werte. Feste Werte in dieser Datei veralten also nach Minuten. Beim
 * Absenden liest die Seite deshalb die verborgenen Felder aus dem
 * unsichtbaren Embed (form._form_33), so wie das Embed sie selbst abschickt.
 * Die Werte unten (Stand embed.php?id=33 vom 2026-10-02) sind nur der
 * Rückfall, falls das Embed noch nicht geladen ist. Die Wache
 * growth-manager/pruefungen/probe_coming_home_seite.py prüft die festen
 * Felder gegen das Embed und meldet, wenn ActiveCampaign das Formular ändert.
 *
 * DERSELBE WEG WIE DAS EMBED: proc.php?…&jsonp=true als GET. So schickt das
 * Embed von Formular 33 selbst ab (dort formSupportsPost = false). Die Antwort
 * trägt access-control-allow-origin: *, die Seite kann sie also lesen und
 * Erfolg von Fehler unterscheiden. Gemessen am 2026-10-01: Erfolg beginnt mit
 * _show_thank_you(, ein Fehler mit _show_error(.
 *
 * ZWEITE ERFOLGSANTWORT, gemessen am 2026-10-02 an Formular 33 mit einer
 * Adresse, die schon bestätigt auf der Liste steht: ActiveCampaign antwortet
 * dann mit window.top.location.href = "…/f/confirm.php?id=…" (seine Seite
 * „Vielen Dank für die Registrierung!") und nimmt die Anmeldung an (Eintrag
 * gezählt, Tag gesetzt), schickt aber keine Bestätigungsmail. Bis dahin hielt
 * die Seite das für einen Fehler und zeigte „Das hat nicht geklappt", genau
 * bei den Menschen, die die Einladung schon bekommen. Die Seite wertet die
 * Antwort jetzt als Erfolg und folgt der Weiterleitung NICHT (Elina: man
 * bleibt auf der Seite). Ein verstecktes iframe wie
 * auf der alten Pre-Access-Seite geht nicht: frame-src der CSP
 * (app/entry.server.jsx) führt qiblanco.activehosted.com nicht, connect-src
 * führt es. So bleibt entry.server.jsx unberührt.
 *
 * DER TEILNAHME-LINK kommt nach dem Absenden aus der Action dieser Route
 * (app/lib/coming-home.server.js). Er steht nicht im HTML und nicht im
 * Bundle. Rückweg ohne Revert: LINK_AN = false in jener Datei.
 *
 * NACH DEM ABSENDEN bleibt man in derselben Section, ohne Weiterleitung
 * (Elina, EL-20261002-4328e3fe): ein großer Knopf „Zum Zoom-Meeting" öffnet
 * das Meeting in einem neuen Tab, darunter steht derselbe Link als Text mit
 * einem Kopieren-Knopf, ganz unten klein der Hinweis auf die
 * Bestätigungsmail. Knopf und Text lesen denselben Wert, sie können nicht
 * auseinanderlaufen.
 *
 * WARUM ELINAS PROBE NUR „Fast geschafft" ZEIGTE (02.10.2026, 10:49Z): die
 * Anmeldung kam bei ActiveCampaign nie an (Formular 15 blieb bei 979
 * Einträgen, ihr Kontakt unverändert), und der Link wurde nie abgefragt. Den
 * Erfolgszustand ohne beides erreichte nur ein Weg: das unsichtbare
 * Spam-Fangfeld (Honigtopf) war gefüllt. Es hieß „website" und lag nur
 * außerhalb des Bildes; das füllen Browser-Autofill und Passwortmanager mit.
 * Deshalb jetzt: ein Name ohne Bedeutung, die Ignorier-Merkmale der gängigen
 * Passwortmanager, und ein gefüllter Topf führt nicht mehr in eine Sackgasse
 * (kein Versand an ActiveCampaign, aber der Link kommt).
 *
 * TRACKING-NAHT: die Seite setzt keine Cookies und führt keinen neuen
 * Identitäts- oder Tracking-Schlüssel ein; TRACKING_COOKIE_NAMES bleibt
 * unangetastet. Das identify macht der Bestand: qpx.js meldet das Absenden
 * eines <form> mit E-Mail-Feld und lädt nur mit Einwilligung. Deshalb ist
 * dies ein echtes <form> mit input[type=email].
 *
 * Messmarker: data-coming-home-form, data-coming-home-zustand
 * (offen | sendet | gesendet | fehler), data-coming-home-felder
 * (embed | ersatz | topf, nach dem Absenden), data-coming-home-anmeldung
 * (neu | bekannt | topf), data-coming-home-link (Knopf),
 * data-coming-home-linktext (Link als Text), data-coming-home-kopieren.
 */

const PFAD = '/pages/coming-home';

const TITEL =
  'Coming Home live: jeden Sonntag um 19 Uhr mit Anna und Christian | Qi Blanco';

const BESCHREIBUNG =
  'Eine Stunde live mit Anna und Christian von Qi Blanco. Du fragst, wir ' +
  'antworten. Oder du hörst einfach zu. Jeden Sonntag um 19 Uhr per Zoom, ' +
  'kostenlos.';

/** Eigenes Foto, steht schon auf der Kakao-Kursseite (KakaoKurs.jsx). */
const BILD =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/' +
  '2022-07-26-qiblanco-berlin-1001088.png?v=1679327456';
const BILD_BREITEN = [480, 720, 960, 1200, 1600];
const BILD_ALT =
  'Anna und Christian von Qi Blanco sitzen nebeneinander auf dem Sofa und lachen';

/**
 * Ziel und verborgene Felder des ActiveCampaign-Formulars 33. `u` und `or`
 * sind der Stand des Embeds vom 2026-10-02 und nur der Rückfall; die
 * übrigen Felder sind fest. `s` ist im Embed leer.
 */
const AC_FORMULAR_ID = '33';
const AC_ZIEL = 'https://qiblanco.activehosted.com/proc.php';
const AC_ERFOLG = '_show_thank_you(';
/** Erfolg für schon bestätigte Kontakte (siehe Kopf): Weiterleitung auf confirm.php. */
const AC_ERFOLG_BEKANNT =
  /^window\.top\.location\.href\s*=\s*["']https:\/\/qiblanco\.activehosted\.com\/f\/confirm\.php\?/;
const AC_EMBED_FORMULAR = 'form._form_33';

/**
 * Die verborgenen Felder, wie das unsichtbare Embed sie gerade trägt. Fehlt das
 * Embed oder eines seiner Felder, bleibt für dieses Feld der Rückfall.
 * @returns {{felder: Record<string, string>, ausEmbed: boolean}}
 */
function acFelder() {
  const felder = {...AC_FELDER};
  const embed = document.querySelector(AC_EMBED_FORMULAR);
  if (!embed) return {felder, ausEmbed: false};
  let gelesen = 0;
  for (const name of Object.keys(AC_FELDER)) {
    const feld = embed.querySelector(`input[type="hidden"][name="${name}"]`);
    if (feld) {
      felder[name] = feld.value;
      gelesen += 1;
    }
  }
  return {felder, ausEmbed: gelesen === Object.keys(AC_FELDER).length};
}
const AC_FELDER = {
  u: '6ABFA6BE407FA',
  f: '33',
  s: '',
  c: '0',
  m: '0',
  act: 'sub',
  v: '2',
  or: '6b32c1ee-6c69-4110-b4a9-c59c12d45df4',
};

/**
 * Das Spam-Fangfeld. Der Name trägt bewusst keine Bedeutung („website",
 * „url", „company" füllt Autofill mit), dazu die Ignorier-Merkmale von
 * LastPass, 1Password und Bitwarden.
 */
const TOPF_NAME = 'ch_kontrollfeld';

const ECKDATEN = [
  {begriff: 'Wann', wert: 'Jeden Sonntag, 19 Uhr'},
  {begriff: 'Dauer', wert: '60 Minuten'},
  {begriff: 'Wo', wert: 'Live per Zoom, von zu Hause'},
  {begriff: 'Kosten', wert: 'Keine'},
];

const ERWARTUNG = [
  {
    titel: 'Du fragst, wir antworten',
    text:
      'Zu unseren Geräten, zum Alltag damit und zu allem, was dich gerade ' +
      'beschäftigt. Auch die unbequemen Fragen. Nichts ist vorher abgesprochen.',
  },
  {
    titel: 'Zuhören reicht',
    text:
      'Du musst nichts sagen. Du kannst einfach dabei sein und mithören.',
  },
  {
    titel: 'Ohne Programm',
    text:
      'Ein entspannter Austausch, so wie am Küchentisch. Mach dir einen ' +
      'Kakao oder einen Tee und komm dazu.',
  },
];

const SCHRITTE = [
  {
    titel: 'Trag dich ein',
    text: 'Dein Name und deine E-Mail-Adresse genügen.',
  },
  {
    titel: 'Du bekommst den Zoom-Link',
    text: 'Er erscheint sofort hier auf der Seite.',
  },
  {
    titel: 'Sonntag um 19 Uhr',
    text: 'Du öffnest den Link. Mehr brauchst du nicht.',
  },
];

const FRAGEN = [
  {
    frage: 'Kostet die Teilnahme etwas?',
    antwort: 'Nein. Coming Home ist kostenlos.',
  },
  {
    frage: 'Muss ich etwas sagen?',
    antwort: 'Nein. Du kannst einfach dabei sein und zuhören.',
  },
  {
    frage: 'Brauche ich ein Programm dafür?',
    antwort:
      'Zoom läuft im Browser und als App, auf dem Handy, dem Tablet und dem ' +
      'Rechner.',
  },
  {
    frage: 'Und wenn ich an einem Sonntag keine Zeit habe?',
    antwort: 'Coming Home findet jeden Sonntag statt. Komm, wann es dir passt.',
  },
];

const KOPF = {'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex'};

export function links() {
  return [{rel: 'stylesheet', href: comingHomeStyles}];
}

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
  {property: 'og:image', content: `${BILD}&width=1200`},
  {property: 'og:image:alt', content: BILD_ALT},
  // WebPage + BreadcrumbList (GEO-Massnahme M2, Job
  // 20261010-geo-sageo-m2-schema-paritaet-us-wie-de): am 2026-10-10 trug diese
  // Seite als einzige der gemessenen gar kein JSON-LD. Aus seitenSignale nur
  // die ld+json-Descriptoren, denn die og-Tags stehen oben schon von Hand.
  // Das Seitenbild ist das Foto dieser Seite, nicht das Standardbild der
  // Marke, das seitenSignale ohne kuratierten Eintrag nimmt.
  ...seitenSignale({pfad: PFAD, titel: TITEL, beschreibung: BESCHREIBUNG})
    .filter((d) => d['script:ld+json'])
    .map((d) =>
      d['script:ld+json']['@type'] === 'WebPage'
        ? {
            'script:ld+json': {
              ...d['script:ld+json'],
              primaryImageOfPage: {
                '@type': 'ImageObject',
                url: `${BILD}&width=1200`,
              },
            },
          }
        : d,
    ),
];

/**
 * Gibt nach dem Absenden den Teilnahme-Link heraus. Name und Adresse kommen
 * hier nicht an, der Browser schickt sie direkt an ActiveCampaign.
 */
export async function action({request}) {
  if (request.method !== 'POST') {
    return data({ok: false, link: null}, {status: 405, headers: KOPF});
  }
  let form;
  try {
    form = await request.formData();
  } catch {
    return data({ok: false, link: null}, {status: 400, headers: KOPF});
  }
  if (String(form.get('absicht') || '') !== 'link') {
    return data({ok: false, link: null}, {status: 400, headers: KOPF});
  }
  return data({ok: true, link: teilnahmeLink()}, {headers: KOPF});
}

function bildQuelle(breite) {
  return `${BILD}&width=${breite}`;
}

export default function ComingHome() {
  return (
    <div className="ch">
      <section className="ch-abschnitt ch-kopf">
        <div className="ch-innen ch-kopf-raster">
          <div className="ch-kopf-text">
            <p className="ch-vorzeile">Coming Home · jeden Sonntag live</p>
            <h1 className="ch-h1">
              Jeden Sonntag um 19{'\u00a0'}Uhr: eine Stunde live mit Anna und
              Christian
            </h1>
            <p className="ch-lede">
              Du fragst, wir antworten. Oder du hörst einfach zu, mit einer
              Tasse Kakao oder Tee.
            </p>
            <a className="btn--primary ch-knopf" href="#anmelden">
              Kostenlos anmelden
            </a>
          </div>
          <figure className="ch-bild">
            <img
              src={bildQuelle(960)}
              srcSet={BILD_BREITEN.map((b) => `${bildQuelle(b)} ${b}w`).join(', ')}
              sizes="(max-width: 899px) calc(100vw - 48px), 500px"
              width="2995"
              height="3058"
              alt={BILD_ALT}
              fetchPriority="high"
            />
          </figure>
        </div>
      </section>

      <section className="ch-abschnitt ch-band" aria-label="Auf einen Blick">
        <dl className="ch-innen ch-eckdaten">
          {ECKDATEN.map((e) => (
            <div className="ch-eckdatum" key={e.begriff}>
              <dt className="ch-eckdatum-begriff">{e.begriff}</dt>
              <dd className="ch-eckdatum-wert">{e.wert}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="ch-abschnitt">
        <div className="ch-innen">
          <h2 className="ch-h2">Was dich erwartet</h2>
          <ul className="ch-erwartung">
            {ERWARTUNG.map((e) => (
              <li className="ch-erwartung-punkt" key={e.titel}>
                <h3 className="ch-h3">{e.titel}</h3>
                <p className="ch-text">{e.text}</p>
              </li>
            ))}
          </ul>
          <blockquote className="ch-zitat">
            <p className="ch-zitat-satz">„Alles kann, nichts muss.“</p>
            <footer className="ch-zitat-von">Anna und Christian</footer>
          </blockquote>
        </div>
      </section>

      <section className="ch-abschnitt ch-dunkel" id="anmelden">
        <div className="ch-innen">
          <h2 className="ch-h2">So bist du dabei</h2>
          <div className="ch-dabei">
            <ol className="ch-schritte">
              {SCHRITTE.map((s, i) => (
                <li className="ch-schritt" key={s.titel}>
                  <span className="ch-schritt-nr" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="ch-h3">{s.titel}</h3>
                    <p className="ch-text">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Anmeldung />
          </div>
        </div>
      </section>

      <section className="ch-abschnitt">
        <div className="ch-innen ch-innen-schmal">
          <h2 className="ch-h2">Häufige Fragen</h2>
          <dl className="ch-fragen">
            {FRAGEN.map((f) => (
              <div className="ch-frage" key={f.frage}>
                <dt className="ch-frage-titel">{f.frage}</dt>
                <dd className="ch-frage-antwort">{f.antwort}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}

/**
 * Das Anmeldeformular samt Erfolgszustand.
 *
 * ABLAUF: (1) der Browser prüft die Felder, (2) er schickt sie an
 * ActiveCampaign und liest die Antwort, (3) bei Erfolg holt die Seite den
 * Teilnahme-Link aus der Action, (4) Erfolgszustand in derselben Karte, ohne
 * Weiterleitung. Meldet ActiveCampaign einen Fehler oder scheitert das Netz,
 * bleibt das Formular stehen und sagt es.
 */
function Anmeldung() {
  const [zustand, setZustand] = useState('offen');
  const [felderQuelle, setFelderQuelle] = useState('');
  // neu = Bestätigungsmail unterwegs | bekannt = stand schon auf der Liste |
  // topf = nichts gesendet (Fangfeld gefüllt)
  const [anmeldung, setAnmeldung] = useState('');
  const fetcher = useFetcher();
  const id = useId();
  const erfolgRef = useRef(null);
  const link = fetcher.data?.ok ? fetcher.data.link : null;
  const linkLaedt = fetcher.state !== 'idle';

  useEffect(() => {
    if (zustand === 'gesendet') erfolgRef.current?.focus();
  }, [zustand]);

  function linkHolen() {
    fetcher.submit({absicht: 'link'}, {method: 'post', action: PFAD});
  }

  async function absenden(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (zustand === 'sendet') return;
    if (!form.reportValidity()) return;
    const werte = new FormData(form);
    // Honigtopf: ein Mensch sieht das Feld nicht. Ist es gefüllt, geht nichts
    // an ActiveCampaign. Den Link gibt es trotzdem: füllt ein übereifriges
    // Autofill das Feld, steht ein Mensch sonst ohne Link da (so geschehen
    // bei Elinas Probe am 02.10.2026).
    if (String(werte.get(TOPF_NAME) || '') !== '') {
      setFelderQuelle('topf');
      setAnmeldung('topf');
      linkHolen();
      setZustand('gesendet');
      return;
    }
    setZustand('sendet');
    const {felder, ausEmbed} = acFelder();
    setFelderQuelle(ausEmbed ? 'embed' : 'ersatz');
    const sendung = new URLSearchParams(felder);
    sendung.set('fullname', String(werte.get('fullname') || '').trim());
    sendung.set('email', String(werte.get('email') || '').trim());
    sendung.set('jsonp', 'true');
    let ergebnis = '';
    try {
      const antwort = await fetch(`${AC_ZIEL}?${sendung.toString()}`, {
        credentials: 'omit',
      });
      const text = (await antwort.text()).trimStart();
      if (text.startsWith(AC_ERFOLG)) ergebnis = 'neu';
      else if (AC_ERFOLG_BEKANNT.test(text)) ergebnis = 'bekannt';
    } catch {
      ergebnis = '';
    }
    if (!ergebnis) {
      setZustand('fehler');
      return;
    }
    setAnmeldung(ergebnis);
    linkHolen();
    setZustand('gesendet');
  }

  if (zustand === 'gesendet') {
    return (
      <div
        className="ch-karte"
        data-coming-home-form=""
        data-coming-home-zustand="gesendet"
        data-coming-home-felder={felderQuelle}
        data-coming-home-anmeldung={anmeldung}
        data-qb-kaufknopf=""
      >
        <h3 className="ch-h3" tabIndex={-1} ref={erfolgRef}>
          Du bist dabei
        </h3>
        {link ? (
          <ZoomZugang link={link} id={id} />
        ) : linkLaedt || !fetcher.data ? (
          <p className="ch-text" role="status">
            Dein Zoom-Link wird geladen …
          </p>
        ) : (
          <p className="ch-text ch-text-stark" role="status">
            Den Zoom-Link bekommst du mit der Einladung per E-Mail.
          </p>
        )}
        {anmeldung === 'neu' ? (
          <p className="ch-hinweis">
            Für unseren Newsletter haben wir dir außerdem eine E-Mail
            geschickt. Bestätige sie mit einem Klick, dann bekommst du jede
            Woche die Einladung. Schau auch im Spam-Ordner nach.
          </p>
        ) : null}
        {anmeldung === 'bekannt' ? (
          <p className="ch-hinweis">
            Du stehst schon auf unserer Newsletter-Liste. Die Einladung bekommst
            du weiter jede Woche per E-Mail.
          </p>
        ) : null}
      </div>
    );
  }

  const sendet = zustand === 'sendet';
  return (
    <>
      <form
        className="ch-karte"
        onSubmit={absenden}
        data-coming-home-form=""
        data-coming-home-zustand={zustand}
        data-coming-home-felder={felderQuelle}
        data-qb-kaufknopf=""
      >
        <h3 className="ch-h3">Melde dich an und hol dir den Link</h3>
        <label className="ch-feldname" htmlFor={`${id}-name`}>
          Dein Name
        </label>
        <input
          id={`${id}-name`}
          className="ch-feld"
          type="text"
          name="fullname"
          autoComplete="name"
          required
          maxLength={120}
        />
        <label className="ch-feldname" htmlFor={`${id}-email`}>
          Deine E-Mail-Adresse
        </label>
        <input
          id={`${id}-email`}
          className="ch-feld"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          maxLength={254}
        />
        <input
          className="ch-topf"
          type="text"
          name={TOPF_NAME}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          data-lpignore="true"
          data-1p-ignore=""
          data-bwignore=""
          data-form-type="other"
        />
        <button
          className="btn--primary ch-knopf"
          type="submit"
          disabled={sendet}
        >
          {sendet ? 'Wird gesendet …' : 'Anmelden und Link bekommen'}
        </button>
        {zustand === 'fehler' ? (
          <p className="ch-fehler" role="alert">
            Das hat nicht geklappt. Bitte prüf deine E-Mail-Adresse und
            versuch es noch einmal.
          </p>
        ) : null}
        <p className="ch-hinweis">
          Mit der Anmeldung bekommst du unsere E-Mails: jede Woche die
          Einladung zu Coming Home und Neuigkeiten von Qi Blanco. Du bestätigst
          deine Adresse per E-Mail und kannst dich jederzeit mit einem Klick
          abmelden.{' '}
          <Link className="ch-verweis" to="/pages/datenschutz" prefetch="intent">
            Datenschutz
          </Link>
        </p>
      </form>
      {/* Nur Quelle der verborgenen Felder, nie sichtbar (siehe Kopf). */}
      <div className="ch-ac-quelle" hidden aria-hidden="true">
        <ActiveCampaignForm formId={AC_FORMULAR_ID} />
      </div>
    </>
  );
}

/**
 * Der Link als Text, umbrechbar nur hinter einem Schrägstrich (<wbr>), damit
 * er auf dem Handy nicht mitten in der Meeting-Nummer bricht. <wbr> trägt
 * keinen Text: markiert und kopiert wird genau der Link.
 */
function mitUmbruchstellen(link) {
  // Schlüssel = der Link bis einschließlich dieses Stücks: wächst mit jedem
  // Stück, ist also eindeutig.
  const teile = link.match(/[^/]*\/|[^/]+$/g) || [link];
  let bisher = '';
  return teile.map((teil) => {
    bisher += teil;
    return teil.endsWith('/') ? (
      <span key={bisher}>
        {teil}
        <wbr />
      </span>
    ) : (
      <span key={bisher}>{teil}</span>
    );
  });
}

/**
 * Der Zugang nach der Anmeldung: Knopf ins Meeting (neuer Tab), darunter
 * derselbe Link als Text mit Kopieren-Knopf. Beide lesen `link`.
 */
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
      <p className="ch-text">
        Sonntag um 19{' '}Uhr geht es los. Hier kommst du ins Meeting:
      </p>
      <a
        className="btn--primary ch-knopf ch-knopf-zoom"
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        data-coming-home-link=""
      >
        Zum Zoom-Meeting
      </a>
      <p className="ch-feldname ch-link-titel" id={`${id}-linktext`}>
        Oder kopiere dir den Link:
      </p>
      <div className="ch-link-zeile">
        <span
          className="ch-link-text"
          ref={textRef}
          aria-labelledby={`${id}-linktext`}
          data-coming-home-linktext=""
        >
          <span>{mitUmbruchstellen(link)}</span>
        </span>
        <button
          type="button"
          className="ch-kopieren"
          onClick={kopieren}
          data-coming-home-kopieren=""
        >
          {kopiert ? 'Kopiert' : 'Kopieren'}
        </button>
      </div>
      <p className="ch-sr" aria-live="polite">
        {kopiert ? 'Der Link ist kopiert.' : ''}
      </p>
    </>
  );
}
