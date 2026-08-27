/**
 * /.well-known/tdm-policy.json — die ODRL-Policy zum Nutzungsvorbehalt.
 *
 * Job 20260729-homepage-anti-scraping-schutz-rechtlich-technisch,
 * auf W3C-Konformität gezogen von 20260801-tdm-policy-w3c-konformitaet.
 *
 * ARBEITSTEILUNG — diese Datei erklärt NICHT den Vorbehalt.
 * Den Vorbehalt nach § 44b Abs. 3 UrhG tragen tdmrep.json
 * (`tdm-reservation: 1` mit `location: "/"`, deckt den gesamten Pfadraum)
 * und das HTML-meta `tdm-reservation`. Diese Datei ist der
 * LIZENZ-KONTAKTWEG: die Spec definiert eine TDM Policy wörtlich als
 * "Description of the kind of TDM Licenses a TDM Actor may obtain from a
 * Rightsholder". Wer hier etwas ändert, ändert die Lizenz-Auskunft — nicht
 * die Erklärung. Das Impressum nennt als maschinenlesbare Flächen
 * tdmrep.json, den HTTP-Header und robots.txt; diese Datei ist dort
 * bewusst nicht genannt.
 *
 * FORM = Beispiel 16 der Spec (CG-FINAL-tdmrep-20240202):
 *   `@type: "Offer"`            — § 7.1.2 "MUST have Offer as value"
 *   `assigner` auf Policy-Ebene — § 7.1.4 "A Policy MUST contain one
 *                                 assigner property", als vCard-Objekt
 *   genau eine `permission` mit `duty: obtainConsent`, KEINE `prohibition`
 *                              — § 7.1.5 "It SHOULD not contain any
 *                                 obligation or prohibition property"
 * Das ist die kanonische Form für "vorbehalten, Lizenz auf Anfrage".
 * Vorher stand hier `@type: "Policy"` plus eine `prohibition`, die auf
 * demselben target/action lag wie die permission — ein Selbstwiderspruch,
 * den ein strenger Konsument als ungültig verwerfen konnte.
 *
 * WAS TDMRep NICHT KANN: die Trennung "KI-Training nein, kundengetriebene
 * KI-Suche ja" lässt sich hier nicht ausdrücken — das Vokabular kennt nur
 * `tdm:mine` sowie die Zweckgrenzen `tdm:research`/`tdm:non-research`,
 * aber keine Unterscheidung Training vs. Inferenz. Diese Trennung tragen
 * deshalb die Flächen, die sie ausdrücken können: robots.txt
 * (Content-Signal `ai-train=no, ai-input=yes`) und die Abwehr-Schicht
 * (sicherheitsmeister/src/kundenpfad.py). Ein früherer Kommentar zählte
 * diese Datei als dritte Fläche mit — das war baulich nie einlösbar
 * (homepage-bauer devlog D-111).
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
      '@type': 'Offer',
      profile: 'http://www.w3.org/ns/tdmrep',
      uid: `${origin}/.well-known/tdm-policy.json`,
      // Kontaktweg für Lizenzanfragen. Bewusst nur `vcard:hasURL` auf das
      // Impressum und keine hier hartcodierte Adresse: das Impressum ist
      // die gepflegte Wahrheit, eine zweite Kopie veraltet. Die Spec deckt
      // das ausdrücklich ("Just keep the properties you really see as
      // useful. The vcard:hasURL property is especially useful ...").
      assigner: {
        uid: origin,
        'vcard:hasURL': `${origin}/pages/impressum`,
      },
      permission: [
        {
          target: `${origin}/`,
          action: 'tdm:mine',
          // Erlaubt nur mit vorheriger schriftlicher Lizenz. Genau diese
          // duty ist der maschinenlesbare Vorbehalt in Policy-Form.
          duty: [{action: 'obtainConsent'}],
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
