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
  // Ankertext am 2026-09-26 nachgezogen: die Seite heißt seit PR #657
  // live "Superhuman: der kostenlose Videokurs in fünf Stufen | Qi Blanco".
  // "Superhuman Videokurs" war darin nicht mehr enthalten, die Naht-Probe
  // homepage-bauer/pruefungen/probe_hub_ankertext_titel_naht.py wurde rot.
  // Der Titelanfang "Superhuman: der kostenlose Videokurs" hat 36 Zeichen
  // und sprengt den 32-Zeichen-Deckel des Tests; es bleibt der Seitenname.
  {to: '/pages/superhuman', label: 'Superhuman', titel_ok: true},
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
 * Die Hub-Seiten, die der Fuß NOCH NICHT an anderer Stelle verlinkt.
 *
 * WARUM ES DIESEN FILTER GIBT (Rebase auf main am 2026-09-26, Job
 * 20260926-altrueckstau-vollzug-ai-ceo-shop-prio35-s05): während PR #200
 * lag, hat main den Fuß um zwei Link-Zeilen erweitert (INHALT_LINKS mit
 * /pages/technologie und /pages/crystal-cacao, NACHLESEN_LINKS mit
 * /pages/studien, #636). Alle sechs Hubs unverändert zu rendern hieße drei
 * davon doppelt im selben Fuß — genau das, was der Test "keine Dublette"
 * verbietet. HUB_LINKS bleibt die vollständige Absicht (die Knopfdruck-Probe
 * misst alle sechs); gerendert wird unter "Themen" nur der Rest.
 *
 * @param {string[]} [bereitsImFuss] Pfade, die der Fuß schon anderswo führt.
 * @param {{to: string}[]} [liste] Ohne Angabe der Echtbestand `HUB_LINKS`.
 * @returns {{to: string, label: string}[]}
 */
export function themenLinks(bereitsImFuss = [], liste = HUB_LINKS) {
  const schon = new Set(bereitsImFuss);
  return liste.filter((h) => !schon.has(h.to));
}

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

/* ==========================================================================
 * WISSEN & VERTRAUEN — die Übersicht der Wissens- und Vertrauensseiten.
 *
 * Gebaut vom Großjob 20261006-GROSSJOB-seo-strategie-seiten-bewertung-crawl-
 * kannibalisierung, Segment s06. Christian am 2026-10-06 über Coworker A zur
 * Verlinkung der neuen Seiten: „das muss sauber gemacht werden", sein
 * Vorschlag war der Fuß. Zu Trustpilot: „wir sollten es gekonnt verlinken,
 * da auch dort die Bewertungen in Summe sehr gut sind".
 *
 * DREI LESER, EINE QUELLE: die Spalte „Wissen & Vertrauen" im Fuß, die
 * Übersichtsseite /pages/wissen-und-vertrauen und die Leiste „Weiterlesen"
 * über dem Fuß jeder aufgeführten Seite lesen alle aus dieser Liste. Dieselbe
 * Begründung wie bei HUB_LINKS oben: lägen die Ziele in drei Komponenten,
 * drifteten die Kopien auseinander.
 *
 * WARUM EINE NEUE SEITE UND KEINE BESTEHENDE (geprüft am 2026-10-06): das
 * Lexikon trägt ein DefinedTermSet und übersetzt Begriffe in Physik; Seiten
 * zu Trustpilot oder Reddit verwässerten genau das. /pages/warum-qi-blanco ist
 * ein Brief in der ersten Person, kein Inhaltsverzeichnis. Die FAQ beantwortet
 * Fragen in je einem Absatz und ist selbst ein Testkandidat des SERP-Registers.
 * Kein Begriff der Kannibalisierungs-Auswertung (seo-manager/exports/
 * seo-strategie.json, zwölf Familien) zielt auf eine Übersicht; die Seite
 * konkurriert deshalb mit keiner bestehenden, solange Titel und Überschrift
 * nicht „Erfahrungen", „seriös" oder „Kritik" tragen.
 *
 * ANKERTEXT = SUCHBEGRIFF DER ZIELSEITE, mit einer Ausnahme: /pages/kritik
 * heißt hier wie im Fuß „Belege und offene Fragen". Christian am 2026-09-07:
 * wir verbreiten die Kritik nicht selbst (Brain-Regel bestmoegliches-licht-
 * kritik-nicht-selbst-verbreiten). Titel und Überschrift der Zielseite tragen
 * den Suchbegriff.
 *
 * KAUFPFAD-ZAUN: /pages/kritik, /pages/was-auf-reddit-ueber-qi-blanco-steht
 * und /pages/hypothesen
 * stehen NUR hier in der Übersicht und damit hinter dem einen Link im Fuß,
 * nie als eigener Fußlink und nie auf Startseite, Produktseiten, /pages/qione,
 * Landingpage oder Kasse. Der Test prüft das an `fuss`.
 *
 * DIE FELDER JE SEITE (bewusst NICHT `to`/`label` wie in HUB_LINKS oben: zwei
 * Proben lesen jedes `to: '/pages/…'` bzw. `{to: …, label: …}` dieser Datei
 * per Ausdruck als S5-Hub — pruefungen/abnahme-s5 verlangt dafür einen Link
 * von der Startseite, pruefungen/probe_hub_ankertext_titel_naht.py einen
 * Ankertext gleich dem Seitentitel. Beides gilt für diese Liste nicht.
 * Gemessen nach dem Merge von #805: „9 von 25 nicht verlinkt". Der Test
 * „die S5-Leser sehen nur HUB_LINKS" hält die Trennung.)
 *   pfad      absoluter Pfad
 *   anker     Ankertext auf der Übersicht und in der Leiste
 *   teaser    EIN Satz: was der Leser dort findet
 *   fuss      Kurzname, wenn die Seite in der Fußspalte steht (höchstens fünf
 *             Seiten plus der Übersichtslink; „Erfahrungen" und „Bewertungen"
 *             führt der Fuß schon in der Zeile NACHLESEN_LINKS, Footer.jsx —
 *             ein zweiter Link auf dasselbe Ziel im selben Fuß ist Unordnung)
 *   weiter    ein bis zwei Geschwister für die Leiste „Weiterlesen". Fehlt das
 *             Feld, bekommt die Seite keine Leiste. Ohne Leiste bleiben die
 *             FAQ und /pages/studien: beide verlinken selbst in die Tiefe, und
 *             /pages/studien steht im SERP-Register in einer laufenden
 *             Messphase (m03).
 *
 * WER EINE SEITE ERGÄNZT, prüft vorher, ob sie live 200 liefert, in der
 * Sitemap steht und kein noindex trägt. Der Test prüft, dass es die Route im
 * Repo gibt, nicht den Live-Zustand.
 * ======================================================================== */

/** Die Übersichtsseite selbst; der Ankertext ist Christians Wortlaut. */
export const WV_HUB = {
  pfad: '/pages/wissen-und-vertrauen',
  anker: 'Alle Antworten rund um Qi Blanco',
};

/** Überschrift der Fußspalte und Name der Übersicht. */
export const WV_TITEL = 'Wissen & Vertrauen';

export const WV_GRUPPEN = [
  {
    id: 'wissen',
    titel: 'Wissen',
    seiten: [
      {
        pfad: '/pages/was-ist-elektrosmog',
        anker: 'Was ist Elektrosmog?',
        teaser:
          'Welche Felder das Wort zusammenfasst, wie man sie misst und was die Belastung im Alltag sofort senkt.',
        fuss: 'Was ist Elektrosmog?',
        // Seit 2026-10-07 (Job 20261007-seo-zusammenlegung-duenne-seiten-301-
        // umsetzen) stehen die Fragen „Was senkt Elektrosmog im Alltag?",
        // „Wie funktioniert Schutz vor Elektrosmog?", „Wie weit reicht ein
        // Elektrosmog-Schutz?", „Armband beim Duschen und in der Sauna?" und
        // „Gibt es Studien zu Elektrosmog-Schutz?" als Abschnitte auf ihren
        // Zielseiten (app/lib/zusammenlegungen.js). Ihre eigenen Einträge sind
        // hier entfallen; die Zielseiten stehen in dieser Liste.
        weiter: ['/pages/technologie', '/pages/kann-elektrosmog-den-schlaf-stoeren'],
      },
      {
        pfad: '/pages/lexikon',
        anker: 'Lexikon: unsere Begriffe in der Sprache der Physik',
        teaser:
          'Hohe Frequenz, High Vibe, kohärentes Wasser: was Menschen damit meinen und welche messbare Größe dahinter liegt.',
        fuss: 'Lexikon',
        weiter: ['/pages/hypothesen', '/pages/studien'],
      },
      {
        pfad: '/pages/faq',
        anker: 'Häufige Fragen zu Qi Blanco',
        teaser:
          'Größe, Wasser und Sauna, Reichweite, Rückgabe und Ratenzahlung, jede Frage in einem Absatz beantwortet.',
      },
      {
        pfad: '/pages/kann-elektrosmog-den-schlaf-stoeren',
        anker: 'Kann Elektrosmog den Schlaf stören?',
        teaser:
          'Was Schlafstudien zum Funkfeld zeigen und warum am Abend vor allem Licht und Nachrichten des Handys stören.',
        weiter: ['/pages/was-ist-elektrosmog', '/pages/faq'],
      },
      {
        pfad: '/pages/technologie',
        anker: 'Wie der Schutz am Körper funktioniert',
        teaser:
          'Auf welchen drei Wegen ein Feld am Körper kleiner wird und für welchen Bereich der QiHome® Air ausgelegt ist.',
        weiter: ['/pages/was-ist-elektrosmog', '/pages/hypothesen'],
      },
      {
        pfad: '/pages/studien',
        anker: 'Qi Blanco Studien',
        teaser:
          'Die fünf veröffentlichten Arbeiten mit Methode und allen Zahlen, vollständig als PDF.',
      },
      {
        pfad: '/pages/hypothesen',
        anker: 'Unsere Hypothesen zum Wirkmodell',
        teaser:
          'Wie wir uns die Wirkung erklären, Gedanke für Gedanke und mit allen Quellen.',
        weiter: ['/pages/studien', '/pages/lexikon'],
      },
    ],
  },
  {
    id: 'vertrauen',
    titel: 'Vertrauen & Stimmen',
    seiten: [
      {
        pfad: '/pages/erfahrungen',
        anker: 'Qi Blanco Erfahrungen',
        teaser:
          'Menschen erzählen in eigenen Videos, was sie mit QiOne®, QiBracelet® und QiHome® Air erlebt haben.',
        weiter: ['/pages/bewertungen', '/pages/qi-blanco-auf-trustpilot'],
      },
      {
        pfad: '/pages/bewertungen',
        anker: 'Qi Blanco Bewertungen',
        teaser: 'Die Google-Bewertungen live, mit Note, Anzahl und Herkunft.',
        weiter: ['/pages/qi-blanco-auf-trustpilot', '/pages/erfahrungen'],
      },
      {
        pfad: '/pages/qi-blanco-auf-trustpilot',
        anker: 'Qi Blanco auf Trustpilot',
        teaser:
          'Was Kundinnen und Kunden auf Trustpilot schreiben, mit Quelle und Stand.',
        fuss: 'Qi Blanco auf Trustpilot',
        weiter: ['/pages/bewertungen', '/pages/erfahrungen'],
      },
      {
        pfad: '/pages/ist-qi-blanco-serioes',
        anker: 'Ist Qi Blanco seriös?',
        teaser:
          'Wer hinter Qi Blanco steht und wie du alles 20 Tage in Ruhe selbst prüfst.',
        fuss: 'Ist Qi Blanco seriös?',
        weiter: ['/pages/warum-qi-blanco', '/pages/qi-blanco-auf-trustpilot'],
      },
      {
        pfad: '/pages/warum-qi-blanco',
        anker: 'Warum es Qi Blanco gibt',
        teaser:
          'Christian Bernd Bauer schreibt in der ersten Person, woran er seit zwanzig Jahren arbeitet und warum.',
        fuss: 'Warum Qi Blanco',
        weiter: ['/pages/ist-qi-blanco-serioes', '/pages/erfahrungen'],
      },
      {
        pfad: '/pages/neu-oder-gebraucht',
        anker: 'Qi Blanco neu oder gebraucht?',
        teaser:
          'Rücknahme, Widerruf, Gewährleistung und Versand mit Quelle, und was bei einem Kauf von privat wegfällt.',
        weiter: ['/pages/ist-qi-blanco-serioes', '/pages/bewertungen'],
      },
      {
        pfad: '/pages/kritik',
        anker: 'Belege und offene Fragen',
        teaser:
          'Sieben Fragen, die du dir vielleicht auch stellst, beantwortet mit fünf veröffentlichten Studien und ihren Zahlen.',
        weiter: ['/pages/hypothesen', '/pages/erfahrungen'],
      },
      {
        pfad: '/pages/was-auf-reddit-ueber-qi-blanco-steht',
        anker: 'Was auf Reddit über Qi Blanco steht',
        teaser:
          'Die Fäden, die Google zu Qi Blanco zeigt, einzeln mit Datum und Quelle nachgelesen.',
        weiter: ['/pages/qi-blanco-auf-trustpilot', '/pages/erfahrungen'],
      },
    ],
  },
];

/**
 * Alle Seiten der Übersicht in Anzeige-Reihenfolge.
 * @param {typeof WV_GRUPPEN} [gruppen]
 */
export function wvSeiten(gruppen = WV_GRUPPEN) {
  return gruppen.flatMap((g) => g.seiten);
}

/**
 * Die Fußspalte: die Seiten mit `fuss`, in Christians Reihenfolge, und zuletzt
 * der Link auf die Übersicht.
 *
 * DIE REIHENFOLGE IST CHRISTIANS LISTE vom 2026-10-06 (Lexikon, Was ist
 * Elektrosmog?, Warum Qi Blanco, Ist Qi Blanco seriös?, Trustpilot) und nicht
 * die der Übersicht. Erfahrungen und Bewertungen stehen in seiner Liste vorn;
 * im Fuß führt sie die Zeile NACHLESEN_LINKS bereits.
 *
 * @param {typeof WV_GRUPPEN} [gruppen]
 * @returns {{to: string, label: string}[]}
 */
export function wvFussLinks(gruppen = WV_GRUPPEN) {
  const reihenfolge = [
    '/pages/lexikon',
    '/pages/was-ist-elektrosmog',
    '/pages/warum-qi-blanco',
    '/pages/ist-qi-blanco-serioes',
    '/pages/qi-blanco-auf-trustpilot',
  ];
  const mitFuss = wvSeiten(gruppen).filter((s) => s.fuss);
  const rang = (s) => {
    const i = reihenfolge.indexOf(s.pfad);
    return i < 0 ? reihenfolge.length : i;
  };
  return [...mitFuss]
    .sort((a, b) => rang(a) - rang(b))
    .map((s) => ({to: s.pfad, label: s.fuss}))
    .concat([{to: WV_HUB.pfad, label: WV_HUB.anker}]);
}

/**
 * Die Leiste „Weiterlesen" für einen Pfad: ein bis zwei Geschwister und der
 * Link auf die Übersicht. `null`, wenn die Seite keine Leiste trägt.
 *
 * Der Pfad wird ohne Länderpräfix (/EN-US/…) und ohne Schrägstrich am Ende
 * verglichen, damit die Leiste auf jeder Adresse derselben Seite erscheint.
 *
 * @param {string} pfad
 * @param {typeof WV_GRUPPEN} [gruppen]
 * @returns {{geschwister: {to: string, label: string}[], hub: {to: string, label: string}} | null}
 */
export function wvWeiterFuer(pfad, gruppen = WV_GRUPPEN) {
  const p = String(pfad || '')
    .replace(/^\/[A-Za-z]{2}-[A-Za-z]{2}(?=\/)/, '')
    .replace(/\/+$/, '');
  const seiten = wvSeiten(gruppen);
  const s = seiten.find((x) => x.pfad === p);
  if (!s || !s.weiter || s.weiter.length === 0) return null;
  const geschwister = s.weiter
    .map((pf) => seiten.find((x) => x.pfad === pf))
    .filter(Boolean)
    .map((x) => ({to: x.pfad, label: x.anker}));
  return {geschwister, hub: {to: WV_HUB.pfad, label: WV_HUB.anker}};
}
