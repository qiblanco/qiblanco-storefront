import {useActionData, useLoaderData} from 'react-router';
import {PotenzialtestSeite} from '~/components/potenzialtest/PotenzialtestSeite';
import {
  anfrageAusFormular,
  ergebnisAusAntwort,
  fehlerSatz,
  quelleAusSuche,
  terminwegZeigen,
} from '~/components/potenzialtest/potenzialtest-logik';
import potenzialtestStyles from '~/styles/potenzialtest.css?url';
import {buyerIpAusRequest} from '~/lib/interner-verkehr';
import {holeJson} from '~/lib/produktberatung-abruf.server';

/**
 * /pages/potenzialtest — „Wie viel Potenzial nutzt du wirklich?"
 *
 * Gebaut vom Grossjob 20261030-GROSSJOB-linkedin-christian-account-outreach-
 * potenzialtest-ohne-werbebudget, Segment s03. Christian 28.10.2026: „Und der
 * Test wird eben bei uns auf der Homepage abgewickelt." und „dass man den im
 * Browser ausfüllt und dann gleich das Ergebnis per Mail bekommt."
 *
 * STAND: VORSCHAU, NICHT LIVE. Der Zweig vorschau/potenzialtest ist ein
 * Draft-PR; der Merge auf main IST der Produktiv-Deploy und wartet auf
 * Christians Freigabe (Konzept, Lückensätze seiner Geschichte, Livegang).
 * Bis dahin: noindex, kein Canonical, nicht im Menü, nicht in der Sitemap.
 *
 * DIE AUSWERTUNG IST NICHT HIER. Fragen, Typen und Texte stehen in
 * potenzialtest-spec.js (aus der Spezifikation erzeugt); Umpolung, Prozente,
 * Index, Typ, PDF und Mail rechnet und verschickt der Dienst
 * (mail-manager/potenzialtest, s02). Die Action reicht die Antworten
 * SERVERSEITIG durch (POST <basis>/potenzialtest/v1/auswerten) — nie aus dem
 * Browser, so wie die Produktberatung zum Termin-Host. Antwortet der Dienst
 * nicht, zeigt die Seite einen ehrlichen Satz und behält die Antworten; es gibt
 * keinen Ersatzwert und kein lokal gerechnetes Ergebnis.
 *
 * TESTUMGEBUNG: die Env-Variable POTENZIALTEST_API lenkt die Action auf einen
 * anderen Endpunkt um. Ohne sie gilt der Dienst-Host unten. `?test_lauf=1` in
 * der Adresse setzt test_lauf=true (Probe/Testkonto, zählt nie als Lead).
 *
 * TRACKING-NAHT: kein Cookie, kein neuer Identitäts- oder Tracking-Key, kein
 * Pixel-Ereignis. `_qpx_anon`, Click-IDs und UTM bleiben, wie die Hülle sie
 * setzt. Die UTM-Parameter der Einstiegs-URL gehen als `quelle` an den Dienst
 * (utm_source[/utm_campaign] oder 'direkt'). Die Kunden-IP geht nur als
 * X-PT-Kunde-IP an den eigenen Dienst (Drossel je Kundin statt je Oxygen-Knoten).
 * TRACKING_COOKIE_NAMES bleibt unangetastet.
 *
 * AD-WEICHE: der Pfad steht in AUSSCHLUSS_SEGMENTE (app/lib/ad-weiche.server.js),
 * damit kein Klick mitten aus dem Test auf eine Kaufseite umgeleitet wird.
 */
export const ENDPUNKT = 'https://potenzialtest.65-108-150-121.sslip.io';
const PFAD = '/potenzialtest/v1/auswerten';

export function basis(context) {
  const env = context?.env?.POTENZIALTEST_API;
  return ((typeof env === 'string' && env.trim()) || ENDPUNKT).replace(/\/+$/, '');
}

export function links() {
  return [{rel: 'stylesheet', href: potenzialtestStyles}];
}

/** Antworten und Mail-Adressen: nie in einem Zwischenspeicher. */
export const headers = () => ({'Cache-Control': 'private, no-store'});

export async function loader({request}) {
  const url = new URL(request.url);
  return {
    quelle: quelleAusSuche(url.searchParams),
    testLauf: url.searchParams.get('test_lauf') === '1',
  };
}

/** Was die Kundin eingegeben hat, damit ein Fehler nichts löscht (auch ohne JavaScript). */
function eingabeZurueck(form) {
  const e = {};
  for (const [k, v] of form.entries()) {
    if (k !== 'website' && typeof v === 'string') e[k] = v.slice(0, 200);
  }
  return e;
}

export async function action({request, context}) {
  const form = await request.formData();
  const eingabe = eingabeZurueck(form);
  // Honigtopf: ein Mensch sieht das Feld nicht. Kein Aufruf des Dienstes.
  if (String(form.get('website') || '').trim()) {
    return {
      ok: false,
      fehler: {feld: '', text: fehlerSatz(0)},
      eingabe,
    };
  }
  const {anfrage, fehler} = anfrageAusFormular(form);
  if (fehler) return {ok: false, fehler, eingabe};

  const r = await holeJson(
    `${basis(context)}${PFAD}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-PT-Kunde-IP': buyerIpAusRequest(request),
      },
      body: JSON.stringify(anfrage),
    },
    15000,
  );
  const ergebnis = r.status === 200 ? ergebnisAusAntwort(r.body) : null;
  if (!ergebnis) {
    return {
      ok: false,
      fehler: {feld: '', text: fehlerSatz(r.status, r.body)},
      eingabe,
    };
  }
  return {
    ok: true,
    ergebnis,
    vorname: anfrage.vorname,
    terminweg: terminwegZeigen(ergebnis, anfrage.q_interesse, anfrage.q_gespraech),
  };
}

const TITEL = 'Wie viel Potenzial nutzt du wirklich? Der Test | Qi Blanco';
const BESCHREIBUNG =
  '15 Fragen, 3 Minuten: dein Potenzial-Index, dein Typ und drei Hebel, die zu dir passen. Das Ergebnis siehst du sofort.';

export const meta = () => [
  {title: TITEL},
  {name: 'description', content: BESCHREIBUNG},
  // VORSCHAU: kein Index, kein Canonical, bis Christian den Livegang freigibt.
  {name: 'robots', content: 'noindex, nofollow'},
];

export default function PotenzialtestRoute() {
  const {quelle, testLauf} = useLoaderData();
  const antwort = useActionData();
  return (
    <PotenzialtestSeite quelle={quelle} testLauf={testLauf} antwort={antwort} />
  );
}
