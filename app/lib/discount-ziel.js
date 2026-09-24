/**
 * Weiterleitungsziel des Rabattlinks /discount/<CODE>?redirect=<pfad>.
 *
 * Job 20260924-GROSSJOB-partnerlinks-sauber-in-die-kasse-partnerseite-und-
 * mail-an-elina. Seit diesem Job ist /discount/<CODE>?redirect=/products/…
 * &sca_ref=… der Link, den wir allen Partnern empfehlen (Partnerseite,
 * Link-Baukasten, Julies neue Links), und die Ad-Weiche benutzt dieselbe
 * Route (ad-weiche.server.js rabattZiel).
 *
 * DER DEFEKT, gemessen 2026-09-24 am Rand: die Skeleton-Route warf nur Werte
 * mit '//' weg. `redirect=/%5Cevil.example.com` kam als `/\evil.example.com`
 * in den Location-Kopf, und Browser lesen `/\` wie `//` — ein 303 auf eine
 * fremde Domain unter unserer Adresse (offene Weiterleitung, Phishing-Hebel).
 * `redirect=javascript:…` wurde ungefiltert gespiegelt.
 *
 * REGEL: das Ziel ist immer ein Pfad auf der eigenen Herkunft. Alles andere
 * (kein führender '/', '//' irgendwo, Backslash, Steuerzeichen — der
 * URL-Parser streicht Tab und Zeilenumbruch und macht aus '/\t/x' sonst
 * '//x') fällt auf die Startseite, wie bisher bei '//'. Zusätzlich muss die
 * aufgelöste Adresse dieselbe Herkunft haben.
 *
 * Der übrige Query (sca_ref, utm_*, h_ad_id …) fährt unverändert mit, jetzt
 * sauber angehängt: ein Ziel, das selbst schon '?' trägt, bekam vorher ein
 * zweites '?' und verlor damit seine Parameter.
 */
const UNERLAUBT = /[\u0000-\u001f\u007f\\]/;

/**
 * @param {string} anfrageUrl  volle URL der /discount-Anfrage
 * @returns {string} Pfad + Query + Anker auf der eigenen Herkunft
 */
export function rabattlinkZiel(anfrageUrl) {
  const url = new URL(anfrageUrl);
  const params = new URLSearchParams(url.search);
  const roh = params.get('redirect') || params.get('return_to') || '/';
  params.delete('redirect');
  params.delete('return_to');

  const ziel = eigenerPfad(roh, url.origin);
  for (const [name, wert] of params) ziel.searchParams.append(name, wert);
  return `${ziel.pathname}${ziel.search}${ziel.hash}`;
}

function eigenerPfad(roh, herkunft) {
  const start = new URL('/', herkunft);
  if (!roh.startsWith('/') || roh.includes('//') || UNERLAUBT.test(roh)) {
    return start;
  }
  let ziel;
  try {
    ziel = new URL(roh, herkunft);
  } catch {
    return start;
  }
  return ziel.origin === start.origin ? ziel : start;
}
