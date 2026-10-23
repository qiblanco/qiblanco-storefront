/**
 * COOKIE-ERKLÄRUNG — /pages/cookie-erklaerung
 *
 * Grossjob 20261022-GROSSJOB-cookiebot-abloesen-eigener-einwilligungshinweis-qiblanco, s04
 * (BAUVERTRAG Abschnitt 7). Ersetzt Cookiebots Cookie-Erklärung.
 *
 * Die Seite rendert NUR, was in app/data/cookie-register.json steht. Diese Datei
 * schreibt genau ein Generator: einwilligung-scanner/bin/einwilligung-register-export
 * (Quelle: einwilligung-scanner/register/*.yaml). Nie hier von Hand nachtragen — der
 * tägliche Scan (rt-Task einwilligung-scanner) vergleicht den Stand auf origin/main mit
 * dem Register und meldet eine Abweichung als Auftrag. Titel und Beschreibung je
 * Kategorie kommen im Generator aus app/lib/einwilligung-texte.js (derselbe Wortlaut wie
 * im Einstellungs-Dialog).
 *
 * Der Knopf „Cookie-Einstellungen“ öffnet in Motor eigen den eigenen Dialog, in Motor
 * cookiebot Cookiebots erneutes Fragen (Cookiebot.renew) — wie der Knopf im Fußbereich.
 */
import {canonicalLink} from '~/lib/seo';
import {Rechtsseite} from '~/components/Rechtsseite';
import {seitenSignale} from '~/lib/seiten-seo';
import register from '~/data/cookie-register.json';
import cookieErklaerungStyles from '~/styles/cookie-erklaerung.css?url';

const PFAD = '/pages/cookie-erklaerung';

export const meta = () => {
  const titel = 'Cookie-Erklärung | Qi Blanco';
  return [
    {title: titel},
    {
      name: 'description',
      content:
        'Welche Cookies qiblanco.com setzt: wer sie setzt, wozu und wie lange sie bleiben. Mit Knopf zum Ändern deiner Cookie-Wahl.',
    },
    // Nicht in den Index: eine Cookie-Liste beantwortet keine Suchfrage. Erreichbar über
    // den Cookie-Hinweis (Link im Banner, BAUVERTRAG Abschnitt 4) und den Knopf hier.
    {name: 'robots', content: 'noindex,nofollow'},
    canonicalLink(PFAD),
    ...seitenSignale({pfad: PFAD, titel}),
  ];
};

export function links() {
  return [{rel: 'stylesheet', href: cookieErklaerungStyles}];
}

export function loader() {
  return {};
}

const MONATE = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];

/** "2026-10-23" -> "23. Oktober 2026" (ohne Date: keine Zeitzonen-Verschiebung). */
function datumLang(iso) {
  const [j, m, t] = String(iso || '').split('-').map(Number);
  if (!j || !m || !t) return iso;
  return `${t}. ${MONATE[m - 1]} ${j}`;
}

function oeffneEinwilligung() {
  if (window.qbEinwilligung) {
    window.qbEinwilligung.oeffneEinstellungen();
  } else if (window.Cookiebot && typeof window.Cookiebot.renew === 'function') {
    window.Cookiebot.renew();
  }
}

function KategorieTabelle({kategorie}) {
  if (!kategorie.cookies.length) {
    return <p className="ce-leer">Auf qiblanco.com gibt es derzeit kein Cookie dieser Art.</p>;
  }
  return (
    <table className="ce-tabelle">
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Anbieter</th>
          <th scope="col">Zweck</th>
          <th scope="col">Laufzeit</th>
        </tr>
      </thead>
      <tbody>
        {kategorie.cookies.map((c) => (
          <tr key={`${c.anbieter}-${c.name}`}>
            <td data-spalte="Name">
              <code>{c.name}</code>
            </td>
            <td data-spalte="Anbieter">{c.anbieter}</td>
            <td data-spalte="Zweck">{c.zweck}</td>
            <td data-spalte="Laufzeit">{c.laufzeit}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function CookieErklaerungPage() {
  const anzahl = register.kategorien.reduce((n, k) => n + k.cookies.length, 0);
  return (
    <Rechtsseite>
      <header className="rs-doc__kopf">
        <h1>Cookie-Erklärung</h1>
        <p className="rs-doc__meta">
          Stand: {datumLang(register.stand)} · Fassung {register.fassung} · {anzahl} Cookies
        </p>
      </header>

      <section className="ce-einstieg">
        <p>
          Hier steht jedes Cookie, das auf qiblanco.com vorkommt: wer es setzt, wozu und wie
          lange es bleibt. Welche Kategorien du erlaubst, entscheidest du im Cookie-Hinweis.
          Notwendige Cookies sind immer aktiv.
        </p>
        <p>
          Deine Wahl kannst du jederzeit ändern:
        </p>
        <button
          type="button"
          className="ce-knopf"
          data-qb-wahl="einstellungen"
          onClick={oeffneEinwilligung}
        >
          Cookie-Einstellungen
        </button>
        <p className="ce-hinweis">
          Diese Liste entsteht aus unserem Cookie-Register. Ein täglicher Scan prüft alle
          Seiten des Shops und meldet uns jedes Cookie, das hier noch fehlt. Wie wir mit
          deinen Daten umgehen, steht in der{' '}
          <a href="/pages/datenschutz">Datenschutzerklärung</a>.
        </p>
      </section>

      {register.kategorien.map((k) => (
        <section key={k.id} id={`kategorie-${k.id}`} className="ce-kategorie">
          <h2>{k.titel}</h2>
          <p>{k.beschreibung}</p>
          <KategorieTabelle kategorie={k} />
        </section>
      ))}
    </Rechtsseite>
  );
}
