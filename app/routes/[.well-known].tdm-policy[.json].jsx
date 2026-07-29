/**
 * /.well-known/tdm-policy.json — die ODRL-Policy zum Nutzungsvorbehalt.
 *
 * Job 20260729-homepage-anti-scraping-schutz-rechtlich-technisch.
 *
 * tdmrep.json sagt DASS wir uns die TDM-Nutzung vorbehalten. Diese Datei sagt
 * maschinenlesbar, WAS genau gilt und an wen man sich für eine Lizenz wendet
 * — der W3C-TDMRep-Anhang sieht dafür eine ODRL-Policy vor.
 *
 * Bewusst NICHT "alles verboten": untersagt ist die Verwendung als
 * TRAININGSMATERIAL. Das Abrufen und Zitieren als Antwortquelle für einen
 * fragenden Menschen bleibt erlaubt — dieselbe Unterscheidung wie in
 * robots.txt (Content-Signal ai-train=no, ai-input=yes) und in der
 * Abwehr-Schicht (sicherheitsmeister/src/kundenpfad.py). Drei Flächen,
 * EINE Aussage; wer eine davon ändert, muss die anderen zwei nachziehen.
 *
 * KEIN RECHTSRAT — Text vorbereitet, Freigabe = Christian/Anwalt.
 */

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({request}) {
  const origin = new URL(request.url).origin;

  const body = JSON.stringify(
    {
      '@context': [
        'http://www.w3.org/ns/odrl.jsonld',
        {tdm: 'http://www.w3.org/ns/tdmrep#'},
      ],
      '@type': 'Policy',
      uid: `${origin}/.well-known/tdm-policy.json`,
      profile: 'http://www.w3.org/ns/tdmrep',
      permission: [
        {
          target: `${origin}/`,
          action: 'tdm:mine',
          assigner: `${origin}/pages/impressum`,
          // Erlaubt nur mit vorheriger schriftlicher Lizenz.
          duty: [
            {
              action: 'obtainConsent',
              // Kontaktweg für Lizenzanfragen. Bewusst das Impressum und
              // keine hier hartcodierte Adresse: das Impressum ist die
              // gepflegte Wahrheit, eine zweite Kopie veraltet.
              target: `${origin}/pages/impressum`,
            },
          ],
        },
      ],
      prohibition: [
        {
          target: `${origin}/`,
          action: 'tdm:mine',
          // Ohne Lizenz: untersagt. Das ist der Vorbehalt nach 44b Abs. 3
          // UrhG in maschinenlesbarer Form.
        },
      ],
    },
    null,
    2,
  );

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/ld+json',
      'tdm-reservation': '1',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
