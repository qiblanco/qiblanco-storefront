/**
 * HUB-SEITEN — die thematischen Einstiege der Domain (SEO-Stufe S5).
 *
 * Reine Datenfabrik ohne React-Import (Node-unit-testbar, wie app/lib/seo.js
 * und app/lib/produkt-seo.js).
 *
 * WARUM ES DIESE DATEI GIBT (Befund SEO-2026-W33, am 2026-08-14 am
 * ausgelieferten HTML nachgemessen, nicht aus dem Repo gelesen): von den
 * sechs thematischen Einstiegen der Domain war über die Startseite nur
 * /pages/studien und /pages/superhuman erreichbar. `/pages/crystal-cacao` —
 * die Startseite unserer zweiten Produktwelt — war von der Startseite aus gar
 * nicht verlinkt. Google kann unter Platz 1 nur Seiten als Sitelinks
 * anbieten, die es über unsere eigene Linkstruktur findet und für wichtig
 * hält.
 *
 * SITELINKS SIND NICHT EINREICHBAR. Google Search Central (Stand 2025-12-10)
 * sagt wörtlich "At the moment, sitelinks are automated", und die
 * Demote-Funktion der Search Console ist seit Oktober 2016 abgeschaltet.
 * Steuerbar ist ausschließlich diese Struktur, nie das Ergebnis — deshalb ist
 * das Abnahmekriterium dieser Stufe "die Hub-Seiten sind von der Startseite
 * aus verlinkt" und ausdrücklich NICHT "Sitelinks erscheinen".
 *
 * WARUM DIE LISTE HIER UND NICHT IN Footer.jsx STEHT: sie hat zwei Leser mit
 * verschiedenen Fragen. Der hermetische Test fragt "ist die Absicht
 * vollständig verdrahtet?", die Knopfdruck-Probe fragt "steht sie im
 * ausgelieferten HTML?". Beide brauchen dieselbe Absicht als eine Quelle;
 * läge sie in der Komponente, müsste jeder Leser sie neu abschreiben und die
 * Kopien drifteten auseinander.
 *
 * WARUM IM FOOTER UND NICHT IN DER HAUPTNAVIGATION: die Hauptnavigation wird
 * nicht aus diesem Repo gerendert. root.jsx lädt sie per HEADER_QUERY mit
 * headerMenuHandle 'main-menu' aus dem Shopify-Admin; Header.jsx nutzt sein
 * FALLBACK_HEADER_MENU nur, wenn diese Query scheitert. Eine Änderung in
 * diesem Repo kann die Nav-Punkte baulich nicht bewegen — das ist ein
 * Handgriff im Shopify-Admin und steht als solcher im Konzept, damit niemand
 * ihn für gebaut hält. Der Footer dagegen ist hartkodiert und rendert auf
 * JEDER Seite, also auch auf der Startseite.
 *
 * ANKERTEXT: bewusst der Seitentitel, nicht ein Werbewort. Google Search
 * Central nennt als Sitelink-Qualitätshebel wörtlich "internal links' anchor
 * text is concise and relevant to the page they're pointing to".
 *
 * NICHT gebaut, obwohl es in SEO-Ratgebern steht: `SiteNavigationElement`-
 * Schema — es gibt keine Google-Primärquelle, die eine Wirkung auf Sitelinks
 * belegt (Evidenzklasse F, Folklore). Ebenso nicht: die Sitelinks-Searchbox
 * (WebSite + SearchAction), die Google am 2024-11-21 global abgeschaltet hat.
 * Beides wäre Deko gewesen.
 */

/**
 * Die Hub-Seiten in Anzeige-Reihenfolge.
 *
 * `titel_ok: false` markiert eine Seite, die live noch den
 * Hydrogen-Scaffold-Titel trägt ("Hydrogen | Superhuman"). Das ist KEIN
 * Grund, sie hier wegzulassen — der interne Link hilft ihrer Auffindbarkeit
 * unabhängig vom Titel. Es ist ein Grund, es sichtbar zu halten: Google nennt
 * "informative, compact titles" als Sitelink-Qualitätshebel, ein
 * Scaffold-Titel arbeitet also gegen genau die Wirkung, die diese Stufe
 * sucht. Der Titel-Fix gehört in die Hygiene-Stufe S0 und wird von
 * `pruefe_titel_hygiene()` als offene Flanke gemeldet statt vergessen.
 *
 * STAND 2026-09-07: DIESE FLANKE IST LEER — GEMESSEN, NICHT ÜBERNOMMEN.
 * Beim Erstbau am 2026-08-14 trugen `/pages/superhuman` und
 * `/pages/zeremonie-kakao-kurs` den Scaffold-Titel und standen deshalb auf
 * `titel_ok: false`. Am 2026-09-07 selbst abgerufen (Hydrogen-DACH-Shop
 * über `storefront_messung.url('dach', …)`, Browser-User-Agent,
 * `data-qb-region` im Rumpf belegt, also nachweislich NICHT der fremde
 * Liquid-Store `qi-blanco.com`) und den `<title>` gelesen statt den
 * Statuscode:
 *   /pages/superhuman            -> "Superhuman | Qi Blanco"
 *   /pages/zeremonie-kakao-kurs  -> "Qi Blanco | Zeremonie Kakao Kurs"
 *   /pages/support               -> "Kontakt & Hilfe | Qi Blanco"
 * Kein Scaffold-Titel mehr; die S0-Flanke ist von fremder Hand geschlossen
 * worden. Beide Flags stehen deshalb auf `true`. Wäre `false` stehen
 * geblieben, meldete `pruefe_titel_hygiene()` dauerhaft eine längst
 * erledigte Flanke — eine Wache, die sicher nie mehr recht hat.
 *
 * WER DIESE WERTE ÄNDERT, MISST SIE VORHER. Sie sind eine Aussage über die
 * LIVE-Seite, nicht über dieses Repo: der Titel wird im Shopify-Admin
 * gepflegt und kann sich ohne einen einzigen Commit hier bewegen. Ein aus
 * einem älteren Stand abgeschriebener Wert ist keine Messung.
 */
export const HUB_LINKS = [
  {to: '/pages/technologie', label: 'Technologie', titel_ok: true},
  {to: '/pages/studien', label: 'Wissenschaftliche Studien', titel_ok: true},
  {to: '/pages/crystal-cacao', label: 'Crystal Cacao®', titel_ok: true},
  {to: '/pages/superhuman', label: 'Superhuman Videokurs', titel_ok: true},
  {
    to: '/pages/zeremonie-kakao-kurs',
    label: 'Zeremonie Kakao Kurs',
    titel_ok: true,
  },
  // Ankertext "Kontakt & Hilfe" statt "Support & FAQ": das ist der
  // Seitentitel, den die Seite am 2026-09-07 wirklich trägt (siehe
  // Messung oben). "Support & FAQ" wäre zusätzlich verwechselbar — der
  // Fußbereich führt seit dem 2026-09-02 einen eigenen Punkt
  // "Häufige Fragen", der auf die ANDERE Seite /pages/faq zeigt.
  {to: '/pages/support', label: 'Kontakt & Hilfe', titel_ok: true},
];

/**
 * Die Pfade der Hub-Seiten — der Prüfgegenstand der Knopfdruck-Probe.
 * @returns {string[]}
 */
export function hubPfade() {
  return HUB_LINKS.map((h) => h.to);
}

/**
 * Die Hub-Seiten, die live noch einen Scaffold-Titel tragen (offene S0-Flanke).
 *
 * Bewusst eine eigene Funktion und kein Kommentar: ein Hinweis ohne Leser ist
 * Deko. Der Test liest sie und schlägt Alarm, wenn diese Menge WÄCHST — eine
 * neue Hub-Seite mit kaputtem Titel soll nicht unbemerkt dazukommen.
 *
 * WARUM DIE LISTE SEIT 2026-09-07 ÜBERGEBEN WERDEN KANN: seit die beiden
 * bekannten Fälle geheilt sind, ist die Antwort auf dem Echtbestand die
 * leere Liste. Eine Prüfung, die nur diese Leere sieht, bliebe auch dann
 * grün, wenn jemand die Filter-Bedingung hier kaputt macht — die Wache wäre
 * still tot und von "alles in Ordnung" nicht zu unterscheiden. Der Test
 * füttert deshalb eine eigene Liste mit einem kaputten Eintrag und prüft
 * damit die MECHANIK, nicht bloß den heutigen Bestand.
 *
 * @param {{to: string, titel_ok?: boolean}[]} [liste] Zu prüfende Liste;
 *   ohne Angabe der Echtbestand `HUB_LINKS`.
 * @returns {string[]}
 */
export function pruefe_titel_hygiene(liste = HUB_LINKS) {
  return liste.filter((h) => h.titel_ok === false).map((h) => h.to);
}
