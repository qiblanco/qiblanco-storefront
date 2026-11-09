import {useEffect, useId, useRef, useState} from 'react';
import {Link, data, useFetcher} from 'react-router';
import {canonicalLink, absoluteCanonical} from '~/lib/seo';
import {seitenSignale} from '~/lib/seiten-seo';
import {ANMELDE_ENDPUNKT, holeAnmeldewege} from '~/components/reusables/Anmeldeweiche';
import {zustellen} from '~/components/reusables/anmelde-puffer';
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
 *   · jeden Sonntag 12 Uhr (Berlin),  -> Christian 18.10.2026 („12 Uhr Berlin
 *     per Zoom                            ... gilt auf jeden Fall bis Anfang April
 *                                         2027", Grossjob 20261018-GROSSJOB-
 *                                         coming-home-...-live, Übergabe #42);
 *                                         Elinas Einladungen nennen 12 Uhr seit
 *                                         der Kampagne 1056 vom 08.10.2026. Bis
 *                                         dahin 19 Uhr (Kampagnen 1049, 1051).
 *                                         Die Wache probe_coming_home_seite.py
 *                                         (Arm E) liest die Uhrzeit von DIESER
 *                                         Seite und vergleicht sie mit der
 *                                         jüngsten Einladung.
 *   · 60 Minuten                      -> Christians Leitplanke, Folie 15
 *   · „Alles kann, nichts muss", Kakao oder Tee, zuhören reicht, ohne
 *     Programm                        -> Wortlaut der Einladungen
 *   · „Ihr fragt, wir antworten. Auch die unbequemen Fragen. Nichts ist
 *     vorher abgesprochen."           -> Drehplan, Video V18
 * NICHT geschrieben, weil in keiner Quelle belegt: Aussagen zu Kamera,
 * Aufzeichnung oder Teilnehmerzahl.
 *
 * ANMELDUNG = FORMULAR 33 „Coming Home Anmeldung" AUF DEM EIGENEN WEG
 * (AC-Abschluss, Elina EL-20261103-b633cb45, Punkt 5). Bis dahin schickte der
 * Browser Name und Adresse an ActiveCampaign (proc.php mit den verborgenen
 * Feldern eines unsichtbaren Embeds). Jetzt geht die Anmeldung an den eigenen
 * Anmelde-Endpunkt (ac-eingang, POST /f/33), derselbe Weg wie Fußzeile und
 * Kursseiten: Liste 2 (Newsletter DACH), Tag „coming-home" nach der
 * Bestätigung, Bestätigungsmail nur, wer noch nicht im Newsletter steht.
 *
 * DER EINWILLIGUNGSSATZ KOMMT AUS /w (anzeige['33']), so wie in
 * Anmeldeweiche.jsx. Steht /w noch nicht bereit, zeigt die Karte den Satz, der
 * hier schon stand; er ist wortgleich mit formulare.yaml. Die Kennung
 * (einwilligung_id) geht nur mit, wenn der Satz aus /w kam; ohne sie nimmt der
 * Endpunkt die aktuelle Fassung.
 *
 * ZEITFALLE UND PUFFER wie in Anmeldeweiche.jsx: t in Serverzeit ab der
 * Anzeige, mindestens 1,6 s bis zum Absenden; scheitert das Netz, hält
 * anmelde-puffer.js die Anmeldung im Browser, und der Zoom-Link kommt trotzdem.

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
 * (keine Anmeldung, aber der Link kommt).
 *
 * TRACKING-NAHT: die Seite setzt keine Cookies und führt keinen neuen
 * Identitäts- oder Tracking-Schlüssel ein; TRACKING_COOKIE_NAMES bleibt
 * unangetastet. Das identify macht der Bestand: qpx.js meldet das Absenden
 * eines <form> mit E-Mail-Feld und lädt nur mit Einwilligung. Deshalb ist
 * dies ein echtes <form> mit input[type=email].
 *
 * Messmarker: data-coming-home-form, data-coming-home-zustand
 * (offen | sendet | gesendet | fehler), data-coming-home-felder
 * (eigen | topf, nach dem Absenden), data-coming-home-anmeldung
 * (neu | gepuffert | topf), data-coming-home-link (Knopf),
 * data-coming-home-linktext (Link als Text), data-coming-home-kopieren.
 */

const PFAD = '/pages/coming-home';

/**
 * Titel der Reihe (Christian 20.10.2026 ~03:47Z, wörtlich: „Nein, der Titel
 * heißt nur Coming Home, eine Reise zu dir selbst.“). Server-SSoT:
 * shared-state/coming-home/config/coming-home.conf CH_REIHE_* (stand.json
 * reihe{}); dieselben Konstanten stehen in pages.live.jsx.
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

const TITEL = NEUER_TITEL_AN
  ? `${REIHE_TITEL}: sonntags 12 Uhr live | Qi Blanco`
  : 'Coming Home live: jeden Sonntag um 12 Uhr mit Anna und Christian | Qi Blanco';

const BESCHREIBUNG =
  'Eine Stunde live mit Anna und Christian von Qi Blanco. Du fragst, wir ' +
  'antworten. Oder du hörst einfach zu. Jeden Sonntag um 12 Uhr (Berliner Zeit) per Zoom, ' +
  'kostenlos.';

/** Eigenes Foto, steht schon auf der Kakao-Kursseite (KakaoKurs.jsx). */
const BILD =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/' +
  '2022-07-26-qiblanco-berlin-1001088.png?v=1679327456';
const BILD_BREITEN = [480, 720, 960, 1200, 1600];
const BILD_ALT =
  'Anna und Christian von Qi Blanco sitzen nebeneinander auf dem Sofa und lachen';

/** Formular 33 des eigenen Anmelde-Endpunkts (ac-eingang, formulare.yaml). */
const FORMULAR_ID = '33';
const MIN_ANZEIGE_MS = 1600;
/** Satz, solange /w noch nicht bereit ist (wortgleich mit formulare.yaml). */
const EINWILLIGUNG_RUECKFALL =
  'Mit der Anmeldung bekommst du unsere E-Mails: jede Woche die ' +
  'Einladung zu Coming Home und Neuigkeiten von Qi Blanco. Du bestätigst ' +
  'deine Adresse per E-Mail und kannst dich jederzeit mit einem Klick ' +
  'abmelden.';

/**
 * Das Spam-Fangfeld. Der Name trägt bewusst keine Bedeutung („website",
 * „url", „company" füllt Autofill mit), dazu die Ignorier-Merkmale von
 * LastPass, 1Password und Bitwarden.
 */
const TOPF_NAME = 'ch_kontrollfeld';

const ECKDATEN = [
  {begriff: 'Wann', wert: 'Jeden Sonntag, 12 Uhr (Berlin)'},
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
    titel: 'Sonntag um 12 Uhr',
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
  // WebPage + BreadcrumbList (GEO-Maßnahme M2, Job
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
 * hier nicht an, der Browser schickt sie an den eigenen Anmelde-Endpunkt.
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
            <p className="ch-vorzeile">{REIHE_VORZEILE}</p>
            <h1 className="ch-h1">
              Jeden Sonntag um 12{'\u00a0'}Uhr: eine Stunde live mit Anna und
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
 * ABLAUF: (1) der Browser prüft die Felder, (2) er schickt sie an den
 * eigenen Anmelde-Endpunkt und liest die Antwort, (3) bei Erfolg (oder wenn
 * der Puffer sie hält) holt die Seite den Teilnahme-Link aus der Action,
 * (4) Erfolgszustand in derselben Karte, ohne Weiterleitung. Lehnt der
 * Endpunkt ab, bleibt das Formular stehen und sagt es.
 */
function Anmeldung() {
  const [zustand, setZustand] = useState('offen');
  const [felderQuelle, setFelderQuelle] = useState('');
  // neu = Bestätigungsmail unterwegs | bekannt = stand schon auf der Liste |
  // topf = nichts gesendet (Fangfeld gefüllt)
  const [anmeldung, setAnmeldung] = useState('');
  const [antwortText, setAntwortText] = useState('');
  const [fehlerText, setFehlerText] = useState('');
  const [anzeige, setAnzeige] = useState(null);
  const angezeigt = useRef(0);
  const versatz = useRef(0);
  const fetcher = useFetcher();
  const id = useId();
  const erfolgRef = useRef(null);
  const link = fetcher.data?.ok ? fetcher.data.link : null;
  const linkLaedt = fetcher.state !== 'idle';

  useEffect(() => {
    if (zustand === 'gesendet') erfolgRef.current?.focus();
  }, [zustand]);

  // Satz, Kennung und Uhrversatz aus /w; Anzeigezeit für die Zeitfalle.
  useEffect(() => {
    angezeigt.current = Date.now();
    let aktiv = true;
    holeAnmeldewege()
      .then((wege) => {
        const neu = wege && wege.anzeige ? wege.anzeige[FORMULAR_ID] : null;
        if (!aktiv || !neu || !neu.einwilligung || !neu.einwilligung_id) return;
        versatz.current = wege.versatz || 0;
        setAnzeige(neu);
      })
      .catch(() => {});
    return () => {
      aktiv = false;
    };
  }, []);

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
    // an den Endpunkt. Den Link gibt es trotzdem: füllt ein übereifriges
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
    setFehlerText('');
    setFelderQuelle('eigen');
    const rest = MIN_ANZEIGE_MS - (Date.now() - angezeigt.current);
    if (rest > 0) await new Promise((fertig) => setTimeout(fertig, rest));
    const t = Math.round(angezeigt.current + versatz.current);
    let ergebnis = null;
    try {
      ergebnis = await zustellen(
        {
          formular: FORMULAR_ID,
          felder: {
            vorname: String(werte.get('fullname') || '').trim(),
            email: String(werte.get('email') || '').trim(),
            website: '',
            einwilligung_id: anzeige ? String(anzeige.einwilligung_id) : '',
            seite: PFAD,
          },
          t,
          versatz: versatz.current,
        },
        {endpunkt: ANMELDE_ENDPUNKT},
      );
    } catch {
      ergebnis = null;
    }
    if (ergebnis && ergebnis.gepuffert) {
      setAnmeldung('gepuffert');
      linkHolen();
      setZustand('gesendet');
      return;
    }
    const status = ergebnis ? ergebnis.status : 0;
    const antwort = ergebnis ? ergebnis.antwort : null;
    if (status === 202 && antwort && antwort.ok) {
      setAntwortText(String(antwort.text || ''));
      setAnmeldung('neu');
      linkHolen();
      setZustand('gesendet');
      return;
    }
    if (status === 409) {
      // Satz geändert, während die Seite offen stand: neuen Satz zeigen,
      // der Mensch bestätigt den Satz, den er jetzt sieht.
      const wege = await holeAnmeldewege({frisch: true}).catch(() => null);
      const neu = wege && wege.anzeige ? wege.anzeige[FORMULAR_ID] : null;
      if (neu && neu.einwilligung && neu.einwilligung_id) {
        versatz.current = wege.versatz || 0;
        setAnzeige(neu);
      }
      setFehlerText(
        'Der Text unter dem Knopf hat sich gerade geändert. Bitte lies ihn und klick noch einmal.',
      );
      setZustand('fehler');
      return;
    }
    if (status === 403 && antwort && antwort.text) {
      setFehlerText(String(antwort.text));
      setZustand('fehler');
      return;
    }
    setFehlerText(
      status === 400
        ? 'Das hat nicht geklappt. Bitte prüf deine E-Mail-Adresse und versuch es noch einmal.'
        : 'Das hat nicht geklappt. Bitte versuch es in ein paar Minuten noch einmal.',
    );
    setZustand('fehler');
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
        {anmeldung === 'neu' && antwortText ? (
          <p className="ch-hinweis">{antwortText}</p>
        ) : null}
        {anmeldung === 'gepuffert' ? (
          <p className="ch-hinweis">
            Deine Anmeldung wird übertragen, sobald die Verbindung wieder steht.
            Danach kommt die Mail zum Bestätigen.
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
            {fehlerText ||
              'Das hat nicht geklappt. Bitte prüf deine E-Mail-Adresse und versuch es noch einmal.'}
          </p>
        ) : null}
        <p className="ch-hinweis" data-einwilligung={anzeige ? anzeige.einwilligung_id : ''}>
          {anzeige ? anzeige.einwilligung : EINWILLIGUNG_RUECKFALL}{' '}
          <Link className="ch-verweis" to="/pages/datenschutz" prefetch="intent">
            Datenschutz
          </Link>
        </p>
      </form>
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
