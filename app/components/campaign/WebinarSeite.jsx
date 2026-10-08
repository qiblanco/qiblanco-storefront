import {useEffect, useId, useState} from 'react';
import {Link, data, useFetcher, useLocation, useNavigate} from 'react-router';
import {ActiveCampaignForm} from '~/components/reusables/ActiveCampaignForm';

/**
 * WEBINAR-ANMELDESEITEN /pages/webinar-elektrosmog, /pages/webinar-kohaerentes-wasser
 * und je eine Bestätigungsseite (…-angemeldet). Grossjob Webinar-Manager vom
 * 08.10.2026, s02 (Christian). Inhalte aus webinar-manager/themen/<thema>/thema.json.
 *
 * STAND: Vorschau, NICHT live. Bis Christian Termin und Zoom festlegt, stehen
 * `termin` und `formularId` auf null: „Termin folgt in Kürze“, Formular sichtbar
 * und gesperrt, kein Fremdskript. Livegang (eigener PR): beide Werte und
 * ZOOM_LINK in der Bestätigungsroute setzen, Ad-Weiche und Sitemap.
 *
 * ANMELDUNG = HAUSWEG VON /pages/coming-home: eigenes Formular im Seitendesign,
 * das ActiveCampaign-Formular kommt über die Anmeldeweiche (<ActiveCampaignForm>)
 * unsichtbar dazu, nur als Quelle seiner verborgenen Felder. Abgeschickt wird wie
 * vom Embed (proc.php, jsonp, GET), danach geht es zur Bestätigungsseite. Name und
 * Adresse gehen direkt an ActiveCampaign, die Bestätigungsmail schickt das
 * Formular (Double-Opt-in). GRENZE: schaltet ac-eingang das Formular auf 'eigen',
 * fehlen hier die Felder (Meldung statt Anmeldung); das gehört dann wie bei
 * Coming Home zur AC-Ablösung.
 * EINWILLIGUNG wie im Haus: Satz direkt über dem Knopf (aria-describedby) plus
 * Link zum Datenschutz. Wer `formularId` setzt, gleicht ihn mit dem Formular ab.
 * TEXTE sind Entwurf: Christian ersetzt sie in WEBINARE, `zitat` ist der Platz
 * für seinen eigenen Satz. TRACKING: kein Cookie, kein neuer Schlüssel; echtes
 * <form> mit input[type=email], damit qpx.js das Absenden wie überall meldet.
 * Marker: data-webinar, data-webinar-seite, data-webinar-zustand, data-qa="cta".
 */

const FOTO = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Christian.jpg?v=1668985845';
const FOTO_ALT = 'Christian Bernd Bauer, Gründer von Qi Blanco';
const KALENDER_MINUTEN = 60;
const EINWILLIGUNG =
  'Ja, ich möchte die Einladung mit dem Zoom-Link zum kostenlosen Webinar und danach den ' +
  'Newsletter von Qi Blanco per E-Mail bekommen. Abmelden kann ich mich jederzeit mit einem Klick.';
const AC_ZIEL = 'https://qiblanco.activehosted.com/proc.php';
const AC_ERFOLG = '_show_thank_you(';
/** Antwort für schon bestätigte Kontakte (auf Coming Home gemessen am 02.10.2026). */
const AC_BEKANNT =
  /^window\.top\.location\.href\s*=\s*["']https:\/\/qiblanco\.activehosted\.com\/f\/confirm\.php\?/;
/** Spam-Fangfeld: ein Name ohne Bedeutung, den Autofill nicht füllt. */
const TOPF = 'wb_kontrollfeld';

const SCHRITTE = [
  ['Trag dich ein', 'Dein Vorname und deine E-Mail-Adresse genügen.'],
  ['Bestätige deine Adresse', 'Du bekommst eine E-Mail mit einem Link. Ein Klick, und dein Platz ist sicher.'],
  [
    'Sei live dabei',
    'Den Zoom-Link bekommst du nach der Anmeldung, und kurz vor dem Start erinnern wir dich per E-Mail.',
  ],
];
const FRAGEN = [
  ['Kostet das Webinar etwas?', 'Nein, das Webinar ist kostenlos.'],
  [
    'Was brauche ich, um dabei zu sein?',
    'Ein Handy, ein Tablet oder einen Rechner mit Internet. Zoom läuft im Browser oder als App.',
  ],
  [
    'Kann ich meine Fragen stellen?',
    'Ja, genau dafür ist die Fragerunde da. Nach den 45 Minuten nimmt sich Christian Zeit für ' +
      'alles, was dich beschäftigt.',
  ],
];

/**
 * Ein Block je Thema. "slug" ist der Themenname im Webinar-Manager (Ordner
 * themen/<slug>) und der Wert von data-webinar; als Datenfeld in Anführungs-
 * zeichen, weil er ein ASCII-Bezeichner ist. termin: ISO mit Zone, etwa
 * '2026-11-05T19:00:00+01:00'. formularId: Id des ActiveCampaign-Formulars.
 */
export const WEBINARE = {
  esmog: {
    "slug": "esmog",
    pfad: '/pages/webinar-elektrosmog',
    bestaetigung: '/pages/webinar-elektrosmog-angemeldet',
    termin: null,
    formularId: null,
    kurztitel: 'Webinar Elektrosmog',
    titel: 'Strahlung im Alltag: Was machen Handy, WLAN und Strom mit deinem Körper?',
    beschreibung:
      'Kostenloses Webinar mit Christian von Qi Blanco: 45 Minuten über Handy, WLAN und Strom ' +
      'im Alltag, mit Live-Experiment und Fragerunde. Live per Zoom.',
    versprechen:
      'In 45 Minuten verstehst du, warum dein Körper ein elektrisches System ist und was Funk ' +
      'und Strom darin anstoßen können. Dazu nimmst du Handgriffe mit, die dein Schlafzimmer ' +
      'noch heute Abend ruhiger machen.',
    szene:
      'Es ist kurz vor Mitternacht. Das Handy liegt auf dem Nachttisch, im Flur blinkt der ' +
      'Router, und du schläfst längst. Um dich herum funkt es trotzdem weiter, die ganze Nacht. ' +
      'Was macht das mit deinem Körper?',
    agenda: [
      'Dein Körper ist elektrisch: Nerven, Herz und Zellen arbeiten mit Spannung',
      'Was Funk und Strom im Körper anstoßen können, und was die Forschung dazu zeigt',
      'Live-Experiment: Elektrosmog hörbar machen',
      'Dein Schlafzimmer: die Handgriffe mit der größten Wirkung',
      'Deine Fragen an Christian',
    ],
    sprecher:
      'Christian hat Qi Blanco gegründet, weil er selbst wissen wollte, was Funk im Alltag mit ' +
      'uns macht. Jeden Sonntag ist er mit Anna bei Coming Home live.',
    wissen:
      'Im Webinar erzählt er dir, was Dr. Ulrich Warnke in Jahrzehnten Forschung darüber ' +
      'herausgefunden hat, wie Felder auf den Körper wirken. Und zwar so, dass du es am ' +
      'Küchentisch weitererzählen kannst.',
    zitat: null,
    anderes: 'wasser',
  },
  wasser: {
    "slug": "kohaerentes-wasser",
    pfad: '/pages/webinar-kohaerentes-wasser',
    bestaetigung: '/pages/webinar-kohaerentes-wasser-angemeldet',
    termin: null,
    formularId: null,
    kurztitel: 'Webinar Wasser',
    titel: 'Das Geheimnis im Wasser: Warum kann Wasser mehr, als wir in der Schule gelernt haben?',
    beschreibung:
      'Kostenloses Webinar mit Christian von Qi Blanco: 45 Minuten über Wasser, Licht und ' +
      'Ordnung, mit Experiment zum Nachmachen und Fragerunde. Live per Zoom.',
    versprechen:
      'In 45 Minuten erfährst du, was Prof. Dr. Gerald H. Pollack in seinem Labor an Wasser ' +
      'beobachtet hat. Er nennt es die vierte Phase, neben fest, flüssig und gasförmig: geordnet ' +
      'wie ein Kristall und aufgeladen vom Licht.',
    szene:
      'Häng ein Küchentuch mit einer Ecke in ein Glas Wasser. Nach ein paar Minuten ist das Tuch ' +
      'nass, weit über dem Wasserspiegel. Das Wasser ist nach oben geklettert, gegen die ' +
      'Schwerkraft. Warum eigentlich?',
    agenda: [
      'Die vierte Phase des Wassers: was Prof. Dr. Gerald H. Pollack beobachtet hat',
      'Live-Experiment: Wasser klettert gegen die Schwerkraft',
      'Was kohärent heißt, einfach erklärt: Ordnung und Takt',
      'Wasser in deinem Körper: Zellen, Licht und Energie',
      'Unsere Erklärung, wie Qi Blanco wirkt, und deine Fragen an Christian',
    ],
    sprecher:
      'Christian hat Qi Blanco gegründet und beschäftigt sich seit Jahren mit der Ordnung von ' +
      'Wasser. Jeden Sonntag ist er mit Anna bei Coming Home live.',
    wissen:
      'Unsere Erklärung, wie Qi Blanco wirkt, dreht sich um genau diese Ordnung, und wir stellen ' +
      'sie dir als Hypothese vor. Das Experiment aus dem Webinar kannst du danach zu Hause selbst ' +
      'ausprobieren.',
    zitat: null,
    anderes: 'esmog',
  },
};

/** „Donnerstag, 5. November um 19:00 Uhr“, Berliner Zeit, auf Server und Browser gleich. */
function terminText(termin) {
  if (!termin) return 'Termin folgt in Kürze';
  const format = {weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'};
  const zeit = new Intl.DateTimeFormat('de-DE', {...format, timeZone: 'Europe/Berlin'});
  return `${zeit.format(new Date(termin))} Uhr`;
}

/** Meta der Anmeldeseite. noindex, ohne canonical (Kampagnenseite). */
export function webinarMeta(w) {
  return [
    {title: `${w.titel} | Kostenloses Webinar | Qi Blanco`},
    {name: 'description', content: w.beschreibung},
    {name: 'robots', content: 'noindex,nofollow'},
    {property: 'og:type', content: 'website'},
    {property: 'og:site_name', content: 'Qi Blanco'},
    {property: 'og:locale', content: 'de_DE'},
    {property: 'og:title', content: w.titel},
    {property: 'og:description', content: w.beschreibung},
    {property: 'og:image', content: `${FOTO}&width=1200`},
    {property: 'og:image:alt', content: FOTO_ALT},
  ];
}

export const ROBOTS_KOPF = {'X-Robots-Tag': 'noindex, nofollow'};

/**
 * Action der Bestätigungsroute: gibt den Zoom-Link heraus, den die Route als
 * Konstante führt (nur auf dem Server, wie coming-home.server.js).
 */
export async function zoomLinkAntwort(request, link) {
  const kopf = {...ROBOTS_KOPF, 'Cache-Control': 'private, no-store'};
  const form = await request.formData().catch(() => null);
  if (!form || String(form.get('absicht') || '') !== 'link') {
    return data({ok: false, link: null}, {status: 400, headers: kopf});
  }
  return data({ok: Boolean(link), link: link || null}, {headers: kopf});
}

function Eckdaten({w}) {
  const daten = [
    ['Wann', terminText(w.termin)],
    ['Dauer', '45 Minuten und deine Fragen'],
    ['Wo', 'Live per Zoom, von zu Hause'],
    ['Kosten', 'Keine'],
  ];
  return (
    <dl className="wb-eckdaten">
      {daten.map(([begriff, wert]) => (
        <div key={begriff}>
          <dt className="wb-eckdatum-begriff">{begriff}</dt>
          <dd className="wb-eckdatum-wert">{wert}</dd>
        </div>
      ))}
    </dl>
  );
}

function Nummernliste({className, punkte}) {
  return (
    <ol className={className}>
      {punkte.map(([titel, text], i) => (
        <li className={text ? 'wb-schritt' : 'wb-agenda-punkt'} key={titel}>
          <span className="wb-nr" aria-hidden="true">
            {i + 1}
          </span>
          {text ? (
            <div>
              <h3 className="wb-h3">{titel}</h3>
              <p className="wb-text">{text}</p>
            </div>
          ) : (
            <span>{titel}</span>
          )}
        </li>
      ))}
    </ol>
  );
}

export function WebinarSeite({w}) {
  return (
    <div className="wb" data-webinar={w.slug} data-webinar-seite="anmeldung">
      <section className="wb-abschnitt">
        <div className="wb-innen wb-kopf-raster">
          <div>
            <p className="wb-vorzeile">Kostenloses Webinar · live per Zoom</p>
            <h1 className="wb-h1">{w.titel}</h1>
            <p className="wb-lede">{w.versprechen}</p>
            <a className="btn--primary wb-knopf" href="#anmelden" data-qa="cta">
              Kostenlos anmelden
            </a>
          </div>
          <figure className="wb-bild">
            <img
              src={`${FOTO}&width=640`}
              srcSet={[320, 480, 640, 800].map((b) => `${FOTO}&width=${b} ${b}w`).join(', ')}
              sizes="(max-width: 899px) min(calc(100vw - 48px), 360px), 400px"
              width="1200"
              height="1535"
              alt={FOTO_ALT}
              fetchPriority="high"
            />
          </figure>
        </div>
      </section>

      <section className="wb-abschnitt wb-band" aria-label="Auf einen Blick">
        <div className="wb-innen">
          <Eckdaten w={w} />
        </div>
      </section>

      <section className="wb-abschnitt">
        <div className="wb-innen wb-innen-schmal">
          <h2 className="wb-h2">Das erwartet dich in 45 Minuten</h2>
          <p className="wb-text wb-szene">{w.szene}</p>
          <Nummernliste className="wb-agenda" punkte={w.agenda.map((p) => [p])} />
        </div>
      </section>

      <section className="wb-abschnitt wb-flaeche">
        <div className="wb-innen wb-innen-schmal">
          <h2 className="wb-h2">Wer mit dir spricht</h2>
          <p className="wb-text">{w.sprecher}</p>
          <p className="wb-text">{w.wissen}</p>
          {w.zitat ? (
            <blockquote className="wb-zitat">
              <p className="wb-zitat-satz">„{w.zitat}“</p>
              <footer className="wb-zitat-von">Christian</footer>
            </blockquote>
          ) : null}
        </div>
      </section>

      <section className="wb-abschnitt wb-dunkel" id="anmelden">
        <div className="wb-innen">
          <h2 className="wb-h2">So bist du dabei</h2>
          <div className="wb-dabei">
            <Nummernliste className="wb-schritte" punkte={SCHRITTE} />
            <Anmeldung w={w} />
          </div>
        </div>
      </section>

      <section className="wb-abschnitt">
        <div className="wb-innen wb-innen-schmal">
          <h2 className="wb-h2">Häufige Fragen</h2>
          <dl className="wb-fragen">
            {FRAGEN.map(([frage, antwort]) => (
              <div className="wb-frage" key={frage}>
                <dt className="wb-frage-titel">{frage}</dt>
                <dd className="wb-text">{antwort}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}

/** Wartet bis zu 4 s auf das unsichtbare Embed und liefert sein Formular. */
async function embedFormular(formId) {
  for (let i = 0; i < 20; i += 1) {
    const form = document.querySelector(`form._form_${formId}`);
    if (form) return form;
    await new Promise((weiter) => setTimeout(weiter, 200));
  }
  return null;
}

/** Schickt die Anmeldung wie das Embed ab. Liefert 'neu', 'bekannt' oder ''. */
async function anActiveCampaign(embed, werte) {
  // Die verborgenen Felder wechseln je Rendern (u, or): immer frisch aus dem Embed.
  const sendung = new URLSearchParams();
  embed.querySelectorAll('input[type="hidden"]').forEach((feld) => {
    if (feld.name) sendung.set(feld.name, feld.value);
  });
  const nameFeld = embed.querySelector('input[name="fullname"], input[name="firstname"]');
  sendung.set(nameFeld ? nameFeld.name : 'fullname', String(werte.get('vorname') || '').trim());
  sendung.set('email', String(werte.get('email') || '').trim());
  sendung.set('jsonp', 'true');
  try {
    const antwort = await fetch(`${AC_ZIEL}?${sendung.toString()}`, {credentials: 'omit'});
    const text = (await antwort.text()).trimStart();
    if (text.startsWith(AC_ERFOLG)) return 'neu';
    if (AC_BEKANNT.test(text)) return 'bekannt';
  } catch {
    // Netzfehler: wie eine Ablehnung, das Formular bleibt stehen.
  }
  return '';
}

/**
 * Das Anmeldeformular. Ohne formularId (bis zum Livegang) sichtbar und gesperrt,
 * mit dem Satz, warum. Mit formularId der Hausweg aus dem Kopf dieser Datei.
 */
function Anmeldung({w}) {
  const offen = Boolean(w.formularId);
  const [zustand, setZustand] = useState(offen ? 'offen' : 'wartet');
  const navigate = useNavigate();
  const id = useId();

  async function absenden(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!offen || zustand === 'sendet' || !form.reportValidity()) return;
    const werte = new FormData(form);
    // Fangfeld gefüllt: nichts an ActiveCampaign, der Mensch kommt trotzdem weiter.
    if (String(werte.get(TOPF) || '') !== '') {
      navigate(w.bestaetigung, {state: {anmeldung: 'topf'}});
      return;
    }
    setZustand('sendet');
    const embed = await embedFormular(w.formularId);
    const anmeldung = embed ? await anActiveCampaign(embed, werte) : '';
    if (!anmeldung) {
      setZustand('fehler');
      return;
    }
    navigate(w.bestaetigung, {state: {anmeldung}});
  }

  let knopf = 'Kostenlos anmelden';
  if (!offen) knopf = 'Anmeldung öffnet mit dem Termin';
  else if (zustand === 'sendet') knopf = 'Wird gesendet …';
  const feld = {className: 'wb-feld', required: true, disabled: !offen};

  return (
    <>
      <form
        className="wb-karte"
        onSubmit={absenden}
        data-webinar-form=""
        data-webinar-zustand={zustand}
        data-qb-kaufknopf=""
      >
        <h3 className="wb-h3">Melde dich kostenlos an</h3>
        {offen ? null : (
          <p className="wb-text wb-status" role="status">
            Der Termin steht noch nicht fest. Sobald er feststeht, kannst du dich hier anmelden.
          </p>
        )}
        <label className="wb-feldname" htmlFor={`${id}-vorname`}>
          Dein Vorname
        </label>
        <input {...feld} id={`${id}-vorname`} type="text" name="vorname" autoComplete="given-name" maxLength={80} />
        <label className="wb-feldname" htmlFor={`${id}-email`}>
          Deine E-Mail-Adresse
        </label>
        <input
          {...feld}
          id={`${id}-email`}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          maxLength={254}
        />
        <input
          className="wb-topf"
          type="text"
          name={TOPF}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          data-lpignore="true"
          data-1p-ignore=""
          data-bwignore=""
          data-form-type="other"
        />
        <p className="wb-einwilligung" id={`${id}-einwilligung`}>
          {EINWILLIGUNG}{' '}
          <Link className="wb-verweis" to="/pages/datenschutz" prefetch="intent">
            Datenschutz
          </Link>
        </p>
        <button
          className="btn--primary wb-knopf"
          type="submit"
          disabled={!offen || zustand === 'sendet'}
          aria-describedby={`${id}-einwilligung`}
          data-qa="cta"
        >
          {knopf}
        </button>
        {zustand === 'fehler' ? (
          <p className="wb-fehler" role="alert">
            Das hat nicht geklappt. Bitte prüf deine E-Mail-Adresse und versuch es noch einmal.
          </p>
        ) : null}
      </form>
      {offen ? (
        <div hidden aria-hidden="true">
          <ActiveCampaignForm formId={w.formularId} />
        </div>
      ) : null}
    </>
  );
}

/** Kalenderdatei (.ics) im Browser bauen und herunterladen. */
function kalenderLaden(w) {
  const start = new Date(w.termin);
  const ende = new Date(start.getTime() + KALENDER_MINUTEN * 60000);
  const utc = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Qi Blanco//Webinar//DE',
    'BEGIN:VEVENT',
    `UID:${w.slug}-${utc(start)}@qiblanco.com`,
    `DTSTAMP:${utc(new Date())}`,
    `DTSTART:${utc(start)}`,
    `DTEND:${utc(ende)}`,
    `SUMMARY:${w.kurztitel} mit Christian (Qi Blanco)`,
    'DESCRIPTION:Den Zoom-Link findest du in deiner E-Mail von Qi Blanco.',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], {type: 'text/calendar;charset=utf-8'}));
  const a = document.createElement('a');
  a.href = url;
  a.download = `qi-blanco-${w.slug}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const BESTAETIGT = {
  neu:
    'Schau in dein Postfach: Wir haben dir eine E-Mail geschickt. Bestätige darin deine Adresse ' +
    'mit einem Klick, dann ist dein Platz sicher. Schau auch im Spam-Ordner nach.',
  bekannt: 'Du stehst schon auf unserer Liste, deshalb musst du nichts mehr bestätigen.',
  standard: 'Alles Weitere zum Webinar bekommst du von uns per E-Mail.',
};

/**
 * Die Bestätigungsseite. Wer von der Anmeldeseite kommt, bringt den Stand im
 * Verlauf mit (location.state); dann holt die Seite den Zoom-Link aus der Action
 * ihrer Route, er steht nie im HTML und nie im Bundle. Gelesen wird erst nach dem
 * Laden, sonst bräche die Hydration bei einem Reload.
 */
export function WebinarBestaetigung({w}) {
  const location = useLocation();
  const fetcher = useFetcher();
  const [anmeldung, setAnmeldung] = useState('');
  const anderes = WEBINARE[w.anderes];
  const link = fetcher.data?.ok ? fetcher.data.link : null;

  useEffect(() => {
    const stand = location.state?.anmeldung;
    if (!stand) return;
    setAnmeldung(stand);
    fetcher.submit({absicht: 'link'}, {method: 'post'});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  return (
    <div className="wb" data-webinar={w.slug} data-webinar-seite="bestaetigung">
      <section className="wb-abschnitt">
        <div className="wb-innen wb-innen-schmal">
          <p className="wb-vorzeile">{w.kurztitel}</p>
          <h1 className="wb-h1">Schön, dass du dabei bist</h1>
          <p className="wb-lede">{BESTAETIGT[anmeldung] || BESTAETIGT.standard}</p>
        </div>
      </section>
      <section className="wb-abschnitt wb-band">
        <div className="wb-innen">
          <Eckdaten w={w} />
        </div>
      </section>
      <section className="wb-abschnitt">
        <div className="wb-innen wb-innen-schmal">
          <h2 className="wb-h2">So geht es weiter</h2>
          <div className="wb-karte wb-karte-hell">
            <h3 className="wb-h3">{w.titel}</h3>
            {link ? (
              <>
                <p className="wb-text">Hier kommst du zum Termin ins Webinar:</p>
                <a
                  className="btn--primary wb-knopf"
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-webinar-link=""
                >
                  Zum Zoom-Webinar
                </a>
                <p className="wb-hinweis wb-link-text">{link}</p>
              </>
            ) : (
              <p className="wb-text">
                Den Zoom-Link schicken wir dir per E-Mail, und kurz vor dem Start erinnern wir dich
                noch einmal.
              </p>
            )}
            {w.termin ? (
              <button
                className="btn--secondary wb-knopf wb-kalender"
                type="button"
                onClick={() => kalenderLaden(w)}
              >
                In den Kalender eintragen
              </button>
            ) : null}
          </div>
          <p className="wb-text wb-weiter">
            Auch spannend:{' '}
            <Link className="wb-verweis" to={anderes.pfad} prefetch="intent">
              {anderes.titel}
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
