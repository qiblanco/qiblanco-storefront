import {redirect} from 'react-router';

/**
 * /pages/was-sagen-die-quarks-science-cops — ALTE ADRESSE, leitet per 301 auf
 * /pages/ist-qi-blanco-serioes.
 *
 * WARUM (Christian 2026-09-28, Grossjob 20260928-GROSSJOB-frageseiten-
 * menschlich-schreiben-und-bestmoegliches-licht): die Seite erzählte eine
 * fremde Kritik nach, nannte ihre Absender und räumte ihr Punkt für Punkt ein
 * („in ihrem härtesten Punkt haben sie recht"). Das verstößt gegen Christians
 * Regel vom 07.09. „Bestmögliches Licht" (Brain-Regel
 * bestmoegliches-licht-kritik-nicht-selbst-verbreiten): Kritik wird nicht
 * zitiert, nicht nacherzählt, nicht katalogisiert; beantwortet wird die
 * Unsicherheit dahinter. Genau das tut „Ist Qi Blanco seriös?".
 *
 * ENTSCHIEDEN NACH DATEN, nicht nach Geschmack (Wahl zwischen (a) Umbau unter
 * derselben Adresse und (b) 301): am 2026-09-28 hatte die Seite in der Search
 * Console 0 Zeilen (seo-manager/data/seo.db, sichtbarkeit_tag, Fenster ab
 * 2026-09-12), im Index-Zensus vom 25.09. den Stand „gefunden, zurzeit nicht
 * indexiert" und in der KI-Lernschleife 0 Zitate in 70 Läufen. Es gab also
 * kein Ranking zu verlieren. (a) hätte Titel und H1 ohne den Namen des
 * Kritikers gebraucht und damit die Suchabsicht ohnehin aufgegeben.
 *
 * DIE ROUTE-DATEI BLEIBT als Weiterleitung (Bauform wie pages.fragen.jsx):
 * ohne sie fiele die Adresse in den Katchall pages.$handle.jsx und lieferte
 * 404 — alte Links und Lesezeichen gingen ins Leere. Die Adresse steht in
 * keiner Sitemap mehr (NUR_ROUTE_SEITEN) und in keinem internen Link.
 *
 * RÜCKWEG: git revert des Commits, der diese Datei zur Weiterleitung gemacht
 * hat; der alte Wortlaut steht in git (b45d25b).
 */
const ZIEL = '/pages/ist-qi-blanco-serioes';

export async function loader({request}) {
  const url = new URL(request.url);
  throw redirect(`${ZIEL}${url.search}`, 301);
}

export default function QuarksWeiterleitung() {
  return null;
}
