import {useEffect, useId, useRef, useState} from 'react';
import {Link, data, useFetcher} from 'react-router';
import {canonicalLink, absoluteCanonical} from '~/lib/seo';
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
 * ANMELDUNG = BESTAND. Die Felder gehen an das ActiveCampaign-Formular 15,
 * dasselbe, das im Fuß jeder Seite hängt: Liste „Newsletter DACH", Name und
 * E-Mail, Bestätigung per E-Mail (Double-Opt-in). Der Browser schickt sie
 * direkt an ActiveCampaign, unser Server sieht weder Name noch Adresse.
 *
 * WARUM EIGENES FORMULAR-MARKUP statt <ActiveCampaignForm formId="15">: der
 * Fuß trägt das Embed dieser Id schon. Die Komponente entfernt jedes zweite
 * Element der Klasse _form_15 außerhalb ihres Containers, sie würde also das
 * Formular im Fuß löschen. Die verborgenen Felder unten sind die des
 * Live-Embeds (embed.php?id=15, gemessen 2026-10-01). Die Wache
 * growth-manager/pruefungen/probe_coming_home_seite.py vergleicht sie mit
 * dem Embed und meldet, wenn ActiveCampaign sie ändert.
 *
 * DERSELBE WEG WIE DAS EMBED: proc.php?…&jsonp=true als GET. So schickt das
 * Embed von Formular 15 selbst ab (dort formSupportsPost = false). Die Antwort
 * trägt access-control-allow-origin: *, die Seite kann sie also lesen und
 * Erfolg von Fehler unterscheiden. Gemessen am 2026-10-01: Erfolg beginnt mit
 * _show_thank_you(, ein Fehler mit _show_error(. Ein verstecktes iframe wie
 * auf der alten Pre-Access-Seite geht nicht: frame-src der CSP
 * (app/entry.server.jsx) führt qiblanco.activehosted.com nicht, connect-src
 * führt es. So bleibt entry.server.jsx unberührt.
 *
 * DER TEILNAHME-LINK kommt nach dem Absenden aus der Action dieser Route
 * (app/lib/coming-home.server.js). Er steht nicht im HTML und nicht im
 * Bundle. Rückweg ohne Revert: LINK_AN = false in jener Datei.
 *
 * TRACKING-NAHT: die Seite setzt keine Cookies und führt keinen neuen
 * Identitäts- oder Tracking-Schlüssel ein; TRACKING_COOKIE_NAMES bleibt
 * unangetastet. Das identify macht der Bestand: qpx.js meldet das Absenden
 * eines <form> mit E-Mail-Feld und lädt nur mit Einwilligung. Deshalb ist
 * dies ein echtes <form> mit input[type=email].
 *
 * Messmarker: data-coming-home-form, data-coming-home-zustand
 * (offen | sendet | gesendet | fehler), data-coming-home-link.
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
 * Ziel und verborgene Felder des ActiveCampaign-Formulars 15, wörtlich aus
 * dem Live-Embed. `s` ist dort leer.
 */
const AC_ZIEL = 'https://qiblanco.activehosted.com/proc.php';
const AC_ERFOLG = '_show_thank_you(';
const AC_FELDER = {
  u: '6ABE3FFF6E1DB',
  f: '15',
  s: '',
  c: '0',
  m: '0',
  act: 'sub',
  v: '2',
  or: '75dbe52b-0360-4678-937a-db2130c711bc',
};

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
 * Teilnahme-Link aus der Action, (4) Erfolgszustand. Meldet ActiveCampaign
 * einen Fehler oder scheitert das Netz, bleibt das Formular stehen und sagt
 * es. Den Link gibt es nur nach einer angenommenen Anmeldung.
 */
function Anmeldung() {
  const [zustand, setZustand] = useState('offen');
  const fetcher = useFetcher();
  const id = useId();
  const erfolgRef = useRef(null);
  const link = fetcher.data?.ok ? fetcher.data.link : null;

  useEffect(() => {
    if (zustand === 'gesendet') erfolgRef.current?.focus();
  }, [zustand]);

  async function absenden(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (zustand === 'sendet') return;
    if (!form.reportValidity()) return;
    const werte = new FormData(form);
    // Honigtopf: ein Mensch sieht das Feld nicht. Ist es gefüllt, endet der
    // Weg hier, ohne Sendung und ohne Link.
    if (String(werte.get('website') || '') !== '') {
      setZustand('gesendet');
      return;
    }
    setZustand('sendet');
    const sendung = new URLSearchParams(AC_FELDER);
    sendung.set('fullname', String(werte.get('fullname') || '').trim());
    sendung.set('email', String(werte.get('email') || '').trim());
    sendung.set('jsonp', 'true');
    let angenommen = false;
    try {
      const antwort = await fetch(`${AC_ZIEL}?${sendung.toString()}`, {
        credentials: 'omit',
      });
      angenommen = (await antwort.text()).trimStart().startsWith(AC_ERFOLG);
    } catch {
      angenommen = false;
    }
    if (!angenommen) {
      setZustand('fehler');
      return;
    }
    fetcher.submit({absicht: 'link'}, {method: 'post', action: PFAD});
    setZustand('gesendet');
  }

  if (zustand === 'gesendet') {
    return (
      <div
        className="ch-karte"
        data-coming-home-form=""
        data-coming-home-zustand="gesendet"
        data-qb-kaufknopf=""
      >
        <h3 className="ch-h3" tabIndex={-1} ref={erfolgRef}>
          Fast geschafft
        </h3>
        <p className="ch-text" role="status">
          Wir haben dir eine E-Mail geschickt. Bestätige sie mit einem Klick,
          dann bekommst du jede Woche die Einladung. Schau auch im Spam-Ordner
          nach.
        </p>
        {link ? (
          <>
            <p className="ch-text ch-text-stark">
              Dein Link für Sonntag, 19 Uhr:
            </p>
            <a
              className="btn--primary ch-knopf"
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              data-coming-home-link=""
            >
              Zoom-Link öffnen
            </a>
            <p className="ch-hinweis">
              Speichere dir den Link am besten gleich als Lesezeichen.
            </p>
          </>
        ) : fetcher.state === 'idle' && fetcher.data ? (
          <p className="ch-text ch-text-stark">
            Den Zoom-Link bekommst du mit der Einladung per E-Mail.
          </p>
        ) : null}
      </div>
    );
  }

  const sendet = zustand === 'sendet';
  return (
    <form
      className="ch-karte"
      onSubmit={absenden}
      data-coming-home-form=""
      data-coming-home-zustand={zustand}
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
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <button className="btn--primary ch-knopf" type="submit" disabled={sendet}>
        {sendet ? 'Wird gesendet …' : 'Anmelden und Link bekommen'}
      </button>
      {zustand === 'fehler' ? (
        <p className="ch-fehler" role="alert">
          Das hat nicht geklappt. Bitte prüf deine E-Mail-Adresse und versuch
          es noch einmal.
        </p>
      ) : null}
      <p className="ch-hinweis">
        Mit der Anmeldung bekommst du unsere E-Mails: jede Woche die Einladung
        zu Coming Home und Neuigkeiten von Qi Blanco. Du bestätigst deine
        Adresse per E-Mail und kannst dich jederzeit mit einem Klick abmelden.{' '}
        <Link className="ch-verweis" to="/pages/datenschutz" prefetch="intent">
          Datenschutz
        </Link>
      </p>
    </form>
  );
}
