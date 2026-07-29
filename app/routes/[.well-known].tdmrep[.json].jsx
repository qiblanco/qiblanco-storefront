/**
 * /.well-known/tdmrep.json — MASCHINENLESBARER NUTZUNGSVORBEHALT (W3C TDMRep)
 *
 * Job 20260729-homepage-anti-scraping-schutz-rechtlich-technisch.
 *
 * WARUM DIESE DATEI DER EIGENTLICHE HEBEL IST
 * -------------------------------------------
 * § 44b Abs. 3 UrhG erlaubt kommerzielles Text- und Data-Mining, SOLANGE der
 * Rechteinhaber sich die Nutzung nicht vorbehalten hat — und:
 *
 *   "Ein Nutzungsvorbehalt bei online zugänglichen Werken ist nur dann
 *    wirksam, wenn er in maschinenlesbarer Form erfolgt."
 *
 * Das LG Hamburg hatte 2024 (310 O 227/23) noch angedeutet, natürliche
 * Sprache könne genügen, weil KI Sprache ja verstehe. Das OLG Hamburg hat
 * diese Begründung am 10.12.2025 (5 U 104/24) AUFGEHOBEN und auf
 * Erwägungsgrund 18 DSM-RL abgestellt. Revision zum BGH ist zugelassen,
 * die Sache ist also nicht rechtskräftig — aber der derzeit geltende
 * Berufungsmaßstab verlangt Maschinenlesbarkeit.
 *
 * Praktische Folge, die diese Datei zieht: FAZ, ZEIT und Süddeutsche haben
 * exakt die Prosa-Klausel im Impressum und sonst nichts. Gemessen am
 * 2026-07-29 liefert KEINER der geprüften deutschen Shops (zalando, otto,
 * thomann, aboutyou, bergfreunde) eine tdmrep.json. Wer sie ausliefert,
 * erfüllt den strengeren Maßstab, bevor er streiten muss.
 *
 * KEIN RECHTSRAT. Der Text ist vorbereitet, die juristische Freigabe ist
 * Christians Hand bzw. die des Anwalts (siehe RESULT, Christian-Hand-Liste).
 *
 * Spec: https://www.w3.org/community/reports/tdmrep/CG-FINAL-tdmrep-20240202/
 */

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({request}) {
  const origin = new URL(request.url).origin;

  // tdm-reservation: 1 = Vorbehalt für den GESAMTEN Pfadraum ("/").
  // tdm-policy verweist auf die maschinenlesbare ODRL-Policy daneben.
  const body = JSON.stringify(
    [
      {
        location: '/',
        'tdm-reservation': 1,
        'tdm-policy': `${origin}/.well-known/tdm-policy.json`,
      },
    ],
    null,
    2,
  );

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/ld+json',
      // Der Vorbehalt gilt auch für den Abruf dieser Datei selbst.
      'tdm-reservation': '1',
      'tdm-policy': `${origin}/.well-known/tdm-policy.json`,
      // Kurz halten: eine Rechtsposition, die sich ändert, soll sich schnell
      // ausbreiten können. 1 h statt der 24 h der robots.txt.
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
