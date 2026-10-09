/**
 * /pages/faq — die Fragen, die Kundinnen und Kunden WIRKLICH stellen.
 *
 * REINE DATENFABRIK: kein React-Import, damit dieses Modul ohne Build-Toolchain
 * lesbar und in Node-Unit-Tests direkt aufrufbar ist (dieselbe Bauform wie
 * app/lib/faq-schema.js und app/lib/produkt-schema.js).
 *
 * ── WOHER DIE FRAGEN KOMMEN ──────────────────────────────────────────────
 * NICHT aus dem Kopf. Reihenfolge und Auswahl folgen der GEMESSENEN Nachfrage
 * aus /srv/openclaw/datawarehouse/comms.db, Tabelle `gorgias_chats` (1.798
 * Zeilen, 1.793 mit `customer_q`), ausgezählt über die 1.023 deutsch-
 * sprachigen Chats:
 *     1. Tragen/Grösse/Kette      272  (26,6 %)   <- zugleich das am
 *                                                     SCHWÄCHSTEN beantwortete
 *                                                     Thema und der grösste
 *                                                     Abbruchtreiber
 *     2. Wirkung/Skepsis/Beweis    216  (21,1 %)
 *     3. Wasser/Sauna/Duschen      187  (18,3 %)
 *     4. QiHome Platzierung        169  (16,5 %)
 *     6. Reichweite                 97   (9,5 %)   <- DACH-Spezialität,
 *                                                     5x häufiger als US
 *     7. Preis/Finanzierung         87   (8,5 %)
 *     8. Haltbarkeit                86   (8,4 %)
 *     9. Rückgabe/20-Tage-Test     46   (4,5 %)
 * Gegenprobe an der unabhängigen Vollanalyse vom 2026-06-08
 * (shared-state/support-gorgias-vollanalyse, DE+EN, n=1.798): Tragen/Grösse
 * 22,0 %, Wasser/Sauna 21,5 % — dieselben zwei an der Spitze.
 *
 * BEWUSST NICHT als Rangliste benutzt: die `theme`-Spalte von `fd_tickets`
 * (daraus stammt die kursierende Zahl „12,8 % Zweifel"). Sie ist als Kennzahl
 * disqualifiziert — der Klassifikator existiert nicht mehr, 28,4 % des
 * Zählers ist unsere eigene Ausgangspost, und der Wert ist ein Sechsjahres-
 * Mittel über einen Niveaubruch (Grossjob 20260827-wirkfrage-ist-
 * vertrauensfrage-zeitverlauf-anna-statistikmanager-prio6).
 *
 * ── WOHER DIE ANTWORTEN KOMMEN ───────────────────────────────────────────
 * Jede Antwort trägt unten ihre Quelle im Feld `quelle`. KEINE Zahl, keine
 * Zusage und kein Studienbefund ist hier neu erfunden; alles stammt aus einem
 * bereits freigegebenen Bestand (Produktseiten, Rechtstexte, Salesbot-Skills,
 * Studien-Registry). Wo der Bestand nichts hergibt, steht keine Zahl, die gut
 * klingt.
 * NACHGEZOGEN 2026-09-28 (Christian, „Bestmögliches Licht", Grossjob
 * 20260928-GROSSJOB-frageseiten-menschlich-schreiben-und-bestmoegliches-
 * licht, Segment s04): Bis dahin stand hier „Wo der Bestand nichts hergibt,
 * steht das in der Antwort". Das ist aufgehoben. Eine Lücke wird nicht mehr
 * als Zugeständnis in die Antwort geschrieben; die Antwort sagt, was wir
 * belegen können, mit seiner Aussageklasse („Laborversuche an Zellkulturen,
 * also in vitro"). Erfunden wird weiterhin nichts, und was bewusst wegfiel,
 * steht je Antwort im Feld `quelle`.
 *
 * ── TON (seit 2026-09-28) ────────────────────────────────────────────────
 * Christian: „Diese ganzen FAQ-Seiten ranken gut, aber sie sind doch sehr
 * unangenehm, wie es nach AI klingt." Maßstab: Es liest sich, als erkläre
 * ein Mensch von Qi Blanco einer Kundin die Sache am Telefon, im Du. Die
 * Regeln (keine gebaute Antithese, kein Merksatz am Absatzende, kein
 * Selbstkommentar, kein Stakkato, Antwort zuerst) stehen im Stilblatt des
 * Auftrags 20260928-GROSSJOB-… (Stilblatt in marken-stimme/spec/stimme.json). Die Fragen `q`
 * sind Suchanfragen und blieben deshalb bis auf zwei behutsame Ausnahmen
 * stehen (Begründung jeweils im Feld `quelle`).
 *
 * ── DREI HARTE SCHREIBREGELN ─────────────────────────────────────────────
 * (1) DUZEN, durchgehend. Der Shop duzt (product-faqs.js: „ein Geschenk an
 *     dich", seit 2026-09-28 kleingeschrieben). Der Anrede-Mix Sie/Du war einer der Mängel, wegen derer
 *     Christian am 2026-08-31 /pages/wirkt-das aus dem Index genommen hat
 *     (Commit f3cf31f) — ausdrücklich wegen der AUSFÜHRUNG, nicht wegen des
 *     Zwecks. Übernommene Sätze von dort sind deshalb umgestellt.
 * (2) REICHWEITE NUR ALS RADIUS, NIE IN QUADRATMETERN. Wörtliche Auflage aus
 *     qi-salesbot/src/server/chat-skills.ts (Skill QiHome, Prio 940):
 *     „Reichweitenangaben als Auslegung und immer als Radius formulieren […],
 *     nie in Quadratmetern und nicht als sichere Eignungszusage; sprich von
 *     Einsatzbereich oder Auslegung, nie von 'Wirkungsradius' oder
 *     'Wirkbereich'." Die alte 300-m2-Angabe ist dort als FALSCH UND GESPERRT
 *     vermerkt. Der Kunde fragt in Quadratmetern — beantwortet wird trotzdem
 *     als Radius, und die Seite sagt WARUM.
 * (3) KEIN WORT AUS DEM DENY-NETZ. app/lib/faq-schema.js filtert Items mit
 *     Eso-/Wirkmechanismus-Vokabular STILL aus dem FAQPage-JSON-LD heraus —
 *     sie werden nicht rot, sie verschwinden nur. Ein Text mit „kohärent"
 *     wäre also sichtbar, aber für Google unauszeichenbar. Das deckt sich
 *     mit der Kundensprache-Regel des Kaufüberzeugungs-Kanons („MEIDEN:
 *     kohärentes Wasser — unser Marketingwort, kein Kundenwort").
 *     Das Deny-Netz faengt BEIDE Schreibungen (/koh(ä|ae)rent/) — die
 *     ASCII-Form ist also kein Schlupfloch.
 *     Die Probe test/faq-seite.test.mjs prüft das mechanisch, statt sich auf
 *     Disziplin zu verlassen.
 *
 * KEIN Item hier trägt ein `flag` — anders als 21 der 40 Items in
 * product-faqs.js, die auf Christians freigegebene Umformulierung warten.
 * Genau deshalb geht dieser Bestand vollständig ins FAQPage-Schema.
 */

/** Interner Link, den die Antwort am Ende anbietet (der „nächste Klick"). */

export const FAQ_ALLTAG = [
  {
    q: 'Ich habe ein schmales Handgelenk. Welche Größe brauche ich beim QiBracelet®?',
    a:
      'Das hängt von der Breite deines Handgelenks ab. Die meisten schicken uns ihren Umfang in ' +
      'Zentimetern, und das ist der häufigste Grund für eine Fehlbestellung, weil unsere Tabelle ' +
      'mit der Breite rechnet. Leg ein Lineal an die breiteste Stelle deines Handgelenks, dort, wo du an ' +
      'beiden Seiten die Knochen fühlst, schließ ein Auge und lies den Wert ab. ' +
      'Bei 4,5 und 5 cm brauchst du S. Bei 5,5 cm kannst du wählen: M, wenn es locker sitzen soll, ' +
      'und S, wenn es anliegen soll. Bei 6 cm passt M, bei 6,5 cm L für locker und M für anliegend, ' +
      'und bei 7 und 7,5 cm brauchst du L. ' +
      'Das QiBracelet® lässt sich vorsichtig dehnen und wieder enger machen, deshalb passen die ' +
      'meisten Handgelenke in zwei Größen, je nachdem, ob es locker mitlaufen oder anliegen soll. ' +
      'Wenn du unsicher bist, schreib uns einfach die gemessene Breite, dann sagen wir dir, welche ' +
      'Größe passt.',
    /*
     * Zusätzliche SICHTBARE Lesehilfe — bewusst KEIN Ersatz für den Fliesstext
     * oben: `a` muss für sich allein vollständig sein, weil genau dieser String
     * (und nur er) in `acceptedAnswer.text` des FAQPage-Schemas landet. Eine
     * Antwort, die ihre Zahlen nur in einer Tabelle führt, ist für Google und
     * für KI-Antwortsysteme leer. Reine Daten, kein JSX — dieses Modul bleibt
     * eine Datenfabrik.
     */
    tabelle: {
      caption:
        'Handgelenksbreite (nicht Umfang!), gemessen an der breitesten Stelle. ' +
        'Quelle: Größentabelle der QiBracelet®-Produktseite.',
      kopf: [
        'Deine Handgelenksbreite',
        'Locker (bewegt sich)',
        'Anliegend (liegt an)',
      ],
      zeilen: [
        ['4,5 cm', 'S', 'keine'],
        ['5 cm', 'S', 'S, verengt'],
        ['5,5 cm', 'M', 'S'],
        ['6 cm', 'M', 'M, verengt'],
        ['6,5 cm', 'L', 'M'],
        ['7 cm', 'L', 'L, verengt'],
        ['7,5 cm', 'L, gedehnt', 'L'],
      ],
    },
    quelle:
      'app/components/product-pages/QiBracelet.jsx, Abschnitt „Finde die perfekte Passform" ' +
      '(Messanleitung + Größentabelle Loose Fit / Tight Fit), live am 2026-09-02 nachgelesen. ' +
      'Der Hinweis „Breite, nicht Umfang" ist der Befund aus den Kundenzitaten: gefragt wird ' +
      'in Umfang („mein Armumfang ist 16,5cm brauche ich S oder M"), geantwortet wird in Breite.',
  },
  {
    q: 'Darf der QiOne® 2 Pro nass werden: Dusche, Meer, Sauna?',
    a:
      'Ja, die Technik darin ist unempfindlich gegen Wasser. QiOne® 2 Pro und QiBracelet® vertragen ' +
      'Chlor- und Meerwasser, Schweiß, Sonne und Hitze, deshalb kannst du sie beim Duschen, beim ' +
      'Schwimmen, in der Sauna und beim Sport einfach anlassen.',
    quelle:
      'app/data/product-faqs.js, Item „Darf der QiOne® in die Sauna bzw. nass werden?" (ungeflaggt), ' +
      'wortgleich live auf /products/qione-2-pro nachgemessen 2026-09-02. Sprache am 2026-09-28 ' +
      'nach dem Stilblatt geglättet (Grossjob 20260928-GROSSJOB-frageseiten-menschlich-…, s04), ' +
      'Inhalt unverändert; seitdem inhalts-, nicht mehr wortgleich zur Produktseite.',
  },
  {
    q: 'Wo und wie trage ich den QiOne® 2 Pro?',
    a:
      'Da, wo es für dich angenehm ist. Eine feste Stelle am Körper gibt es nicht. Für eine Kette hat er ' +
      'eine Bohrung von 2,5 mm Durchmesser. Das Baumwollbändchen, das dabeiliegt, schenken wir dir, ' +
      'damit du ihn gleich tragen kannst, und du kannst es jederzeit gegen deine Lieblingskette ' +
      'tauschen. Denk nur daran, dass Ketten aus Metall, auch aus Edelstahl, härter sind als das ' +
      'Gehäuse und es verkratzen können. Für diesen Fall gibt es unser Necklace, die Edelstahlkette ' +
      'für den QiOne®. Und wenn du gar nichts um den Hals tragen möchtest, steckst du ihn einfach ' +
      'in die Hosentasche.',
    quelle:
      'app/data/product-faqs.js, Items „Wie sollte ich den QiOne® tragen?" und „Kann ich den QiOne® ' +
      'an einer anderen Kette tragen?". BEWUSST WEGGELASSEN: der Satz „Der Effekt wird mit ' +
      'Hautkontakt stärker" und der Absatz über „zu intensives" Empfinden — beide tragen im ' +
      'Bestand das flag `unfalsifizierbar` und warten auf Christians Umformulierung.',
  },
  {
    q: 'Muss ich den QiOne® 2 Pro laden, warten oder irgendwann austauschen?',
    a:
      'Nein, nichts davon. Im QiOne® 2 Pro steckt weder Elektronik noch ein Akku oder eine Batterie, ' +
      'also gibt es nichts zu laden, nichts nachzufüllen und keine Teile, die sich abnutzen. Das ' +
      'Gehäuse ist aus Chirurgenstahl, der GitterChip™ aus einer maßgeschneiderten 750er ' +
      'Goldlegierung, und fertiggestellt wird er von Hand. Du kaufst ihn einmal, und danach kommen ' +
      'keine Kosten mehr dazu.',
    quelle:
      'app/data/product-faqs.js: „enthält keinerlei elektronische Bauteile" + Material-Item ' +
      '(ungeflaggt). KEINE Lebensdauer-Zahl genannt: Kunden fragen danach („Jahrzehnte heißt ' +
      'mindestens 20 Jahre?"), aber im Bestand steht keine belegte Zahl. Eine erfundene wäre der ' +
      'bequeme Weg gewesen.',
  },
];

export const FAQ_QIHOME = [
  {
    q: 'Wie weit reicht ein QiHome® Air, und reicht ein Gerät für meine Wohnung?',
    a:
      'Das QiHome® Air ist auf einen Einsatzbereich von bis zu 160 m Radius ausgelegt, so die ' +
      'Herstellerangabe. Das reicht für eine Wohnung, ein Einfamilienhaus und auch für ein Büro ' +
      'oder eine Praxis. In den allermeisten Haushalten genügt ein einziges Gerät, auch über ' +
      'mehrere Stockwerke und durch Wände hindurch. Wie stark es bei dir im Alltag ankommt, hängt ' +
      'allerdings vom Umfeld ab, und wo sehr viel Technik läuft, sind wir mit unserer Einschätzung ' +
      'vorsichtiger. Wir geben die Reichweite immer als Radius an. Die Zahl von 300 m², die früher ' +
      'kursierte, war falsch, und wir verwenden sie nicht mehr.',
    quelle:
      'qi-salesbot/src/server/chat-skills.ts, Skill QiHome (Prio 940), Evidenz-Zeile wörtlich: ' +
      '„Ausgelegt auf einen Radius von bis zu 160 m (rund 8 Hektar, Herstellerangabe) […] Die alte ' +
      '300-m2-Angabe ist falsch und gesperrt." Formulierung folgt der dortigen Auflage: als ' +
      'AUSLEGUNG und als RADIUS, nie in Quadratmetern, nie als sichere Eignungszusage.',
  },
  {
    q: 'Wo stelle ich das QiHome® Air am besten hin, und muss es in die Steckdose?',
    a:
      'Stell es am besten dorthin, wo du viel Zeit verbringst. Gut bewährt haben sich das ' +
      'Schlafzimmer und ein Raum, der zentral liegt und viel genutzt wird. In die Steckdose muss es ' +
      'nicht, denn das QiHome® Air arbeitet ohne Strom. Du kannst es zwar in eine europäische ' +
      'Schuko-Steckdose stecken, für die Funktion braucht es das aber nicht. Halte im Umkreis von ' +
      'etwa 0,5 m starke Elektrogeräte fern, also etwa Mikrowelle, PC oder WLAN-Router, weil sie den ' +
      'Aufbau stören können. Und gib ihm etwas Zeit: Nach dem Aufstellen baut sich das Feld über ' +
      'mehrere Stunden auf, und wenn du es wegnimmst, baut es sich über Stunden wieder ab. Wenn du ' +
      'es kurz umstellst oder in eine andere Steckdose steckst, macht das deshalb nichts.',
    quelle:
      'qi-salesbot/src/server/chat-skills.ts, Skill QiHome, Platzierungs-Evidenz (0,5-m-Umkreis, ' +
      'Schlafzimmer/zentraler Raum, Auf- und Abbau über Stunden; Zahl-SSoT ' +
      'data/referenzzahlen-vertrag.json, Eintrag qihome-platzierung-abstand-m) + product-faqs.js ' +
      'Item „Muss das QiHome® Air in die Steckdose eingesteckt werden?" (ungeflaggt).',
  },
];

export const FAQ_BELEGE = [
  {
    q: 'Wirkt ein Armband gegen Elektrosmog wirklich?',
    // Sprungziel /pages/faq#wirkt-ein-armband-gegen-elektrosmog (FaqEintrag
    // setzt es als id der h3). Seit 2026-10-09, Begründung im Feld `quelle`.
    anker: 'wirkt-ein-armband-gegen-elektrosmog',
    a:
      'Im Labor ja, dort ist ein deutlicher Unterschied gemessen, und du kannst jede Zahl ' +
      'nachlesen. Menschliche Immunzellen lagen vier Stunden unter der Strahlung eines sendenden ' +
      'Handys. Ohne Gerät sank ihre Fähigkeit, Abwehr-Radikale zu bilden, auf 60,5 Prozent des ' +
      'Normalwerts, mit einem QiOne® 2 Pro daneben blieben 84,7 Prozent erhalten. Bei Darmzellen ' +
      'unter derselben Belastung brach die Zellbarriere ohne Gerät auf etwa ein Zehntel ein, mit ' +
      'Gerät hielt sie gut sieben Zehntel des unbelasteten Werts. Das Gerät schirmt dabei nichts ' +
      'ab, gemessen wurde, wie sich die Zellen verhalten. Das QiBracelet® arbeitet mit derselben ' +
      'GitterChip™-Technologie. Zu unseren Produkten gibt es fünf Arbeiten in Fachzeitschriften: ' +
      'vier Laborversuche an Zellkulturen, also in vitro, und eine Auswertung von 171 ' +
      'Erfahrungsberichten. Durchgeführt hat sie das Dartsch Scientific Institut in unserem ' +
      'Auftrag, und alle fünf liegen bei uns vollständig als PDF. Wie es sich im Alltag anfühlt, ' +
      'erzählen dir Kundinnen und Kunden am besten selbst. Und ob du etwas merkst, findest du an ' +
      'dir heraus: Du trägst es 20 Tage, und wenn es nichts für dich ist, schickst du es ohne ' +
      'Angabe von Gründen zurück.',
    quelle:
      'FRAGE UND EINSTIEG NEU 2026-10-09 (Job 20261009-ki-lernschleife-bau-dach-0f6163, KI-' +
      'Lernschleife frageseite:dach-wirkt-das, Urauftrag Christian 15.09.2026): Die Frage steht ' +
      'jetzt so, wie sie gesucht wird, und die Antwort beginnt mit dem, was zu genau dieser Frage ' +
      'gemessen ist. Die Zahlen stammen aus kritik-vorwuerfe.js BEFUNDE e0001 und e0002 (Registry ' +
      'e0001/e0002.json, QiOne® 2 Pro). 1.837 von 2.542 Ω/cm² ergeben die „gut sieben Zehntel". ' +
      '„Schirmt nichts ab" steht wie Frage K1 auf /pages/kritik. Das QiBracelet® ist nicht unter ' +
      'Mobilfunk untersucht (e0003 ist oxidativer Stress), deshalb steht es nur mit seiner ' +
      'Technologie im Satz und ohne eine Zahl. Vorher lautete die Frage „Wirkt das überhaupt? Was ' +
      'ist wirklich belegt, und was nicht?" (origin/main d78a668). Gemessen hatte die Schleife ' +
      'in 10 von 10 KI-Antworten auf die neue Frage keinen Verweis auf uns. ' +
      'BIS 2026-10-09: ' +
      'Tatsachen aus der faktengegateten Registry app/data/studien/e0001…e0005.json: vier in ' +
      'vitro, eine Auswertung von 171 Berichten, Dartsch Scientific Institut, finanziert von Qi ' +
      'Blanco, je Eintrag ein eckdaten.pdfUrl. „In Fachzeitschriften erschienen" wie ' +
      'kritik-vorwuerfe.js KURZABSATZ, die 20 Tage wie FAQ_KAUF Frage 1. UMGESCHRIEBEN ' +
      '2026-09-28 nach Christians Regel „Bestmögliches Licht" (Stilblatt Regeln 11–14; Grossjob ' +
      '20260928-GROSSJOB-frageseiten-menschlich-…, s04). WEGGELASSEN sind die Sätze, die eine ' +
      'Lücke als Zugeständnis ausbreiteten: keine kontrollierte Studie am Menschen, kein Schluss ' +
      'auf das eigene Empfinden, keine Kontrollgruppe und Verblindung. Die Aussageklasse steht ' +
      'stattdessen im Satz selbst („Laborversuche an Zellkulturen, also in vitro"). Die Grenzen ' +
      'jeder einzelnen Arbeit stehen weiter auf ihrer Studienseite. Wortlaut vorher: origin/main ' +
      'b45d25b, damals aus MmWirktDas.jsx STUDIEN/GRENZEN.',
    // Die Vertiefung GENAU DIESER Antwort, und die Stelle ist mit Absicht
    // gewählt. Bis 2026-09-28 räumte der Absatz darüber ein „Ob und wie du
    // selbst etwas merkst, folgt daraus nicht", und der Link war der Punkt,
    // an dem einzelne Menschen weiterhelfen, wo Zellstudien es nicht können.
    // Seit Christians Licht-Regel sagt die Antwort positiv, dass Kundinnen und
    // Kunden selbst erzählen und dass jeder es 20 Tage an sich prüfen kann;
    // dieser Link ist die sichtbare Grundlage dafür (Stilblatt Regel 13:
    // „Kundenerfahrungen mit sichtbarer Grundlage"). Gemessene Grundlage: „Wirkt das überhaupt?" ist mit 3758
    // Nennungen der häufigste Einwand, und sozialer Beweis zieht dort, wo
    // Wissenschafts-Beweis erst beim Zweifel wirkt (Kaufüberzeugungs-Kanon:
    // „Menschen ziehen, Studien überzeugen").
    //
    // DER LINKTEXT NENNT KEINE ZAHL. Naheliegend wäre „13 Menschen" gewesen —
    // aber die Zahl wächst mit dem Datenmodul, und ein Zähler in einer
    // fremden Datei veraltet still. Die Seite selbst nennt sie und rechnet
    // sie aus ihren Daten aus.
    //
    // ARBEITSTEILUNG wie im Abgrenzungs-SSoT (konzepte/abgrenzung-flaechen.json):
    // die FAQ antwortet in EINEM Absatz und verlinkt in die Tiefe. Begehbar ist
    // dieser Weg erst seit der Freischaltung von /pages/erfahrungen am
    // 2026-09-11 — vorher wäre es ein Link auf eine per robots.txt gesperrte
    // Seite gewesen. Zweiter Nutzen: /pages/erfahrungen hat damit einen
    // server-gerenderten eingehenden Link von einer indexierten Seite. Der
    // Menü-Eintrag unter „Mehr" allein reicht dafür nicht — dessen Kinder
    // rendert Shopify clientseitig per Portal, im Server-HTML stehen sie nicht.
    //
    // LINKTEXT 2026-09-28 neu: „ihre Beobachtungen, nicht unsere Behauptung"
    // war eine gebaute Antithese (Stilblatt Regel 2). Ziel unverändert.
    weiter: {
      pfad: '/pages/erfahrungen',
      text: 'Hier erzählen Menschen selbst, was sie mit Qi Blanco erlebt haben',
    },
  },
  {
    q: 'Gibt es unabhängige Studien, und wo kann ich sie nachlesen?',
    a:
      'Alle fünf Arbeiten hat das Dartsch Scientific Institut von Prof. Dr. Peter C. Dartsch ' +
      'durchgeführt, in unserem Auftrag und mit Geräten, die wir dafür gestellt haben. So entsteht ' +
      'Produktforschung in aller Regel: Der Hersteller gibt die Untersuchung in Auftrag und legt ' +
      'die Ergebnisse offen. Vier der Arbeiten sind Laborversuche an Zellkulturen, die fünfte wertet ' +
      '171 Erfahrungsberichte aus. Erschienen sind alle fünf in Fachzeitschriften. Bei uns liest ' +
      'du sie im Original auf qiblanco.com/pages/studien, vollständig als PDF mit Methode und ' +
      'allen Zahlen.',
    quelle:
      'UMGESCHRIEBEN 2026-09-28 nach Christians Regel „Bestmögliches Licht" (Stilblatt Regeln ' +
      '11–14, Paare 9 und 16; Grossjob 20260928-GROSSJOB-frageseiten-menschlich-…, s04). Die ' +
      'Antwort beginnt jetzt damit, WER die Arbeiten gemacht hat und in WESSEN Auftrag. ' +
      'WEGGELASSEN sind der verneinende Einstieg zur Unabhängigkeit, der Hinweis auf eine ' +
      'ausstehende Wiederholung und die Aufzählung fehlender Kontrollgruppe, Verblindung und ' +
      'Humanstudie. Tatsachen unverändert aus der Registry app/data/studien/e0001…e0005.json: ' +
      'Labor, Finanzierung, gestellte Geräte, vier in vitro, eine Auswertung von 171 Berichten, ' +
      'pdfUrl je Eintrag. „In Fachzeitschriften erschienen" wie kritik-vorwuerfe.js KURZABSATZ. ' +
      '„So entsteht Produktforschung in aller Regel" ersetzt das frühere „Das ist bei ' +
      'Produktforschung üblich". Im Fragewortlaut wich allein der Gedankenstrich einem Komma. Die ' +
      'Suchwörter „unabhängige Studien" und „nachlesen" stehen unverändert. Wortlaut vorher: ' +
      'origin/main b45d25b. ' +
      'HERKUNFT DES ITEMS (unverändert gültig): KEINE neue Aussage, KEINE neue Zahl — neu war allein der ' +
      'FRAGEWORTLAUT „unabhängige Studien" und der genannte Beleg-Ort /pages/studien. Begründung: ' +
      'Einwand ew-05 des Kaufüberzeugungs-Kanons, wörtliches Kundenzitat „WARUM NICHT EINFACH EINEN ' +
      'LINK ZU DEN STUDIEN BEREITSTELLEN?", Gegenmittel dort „erreichbarer Beleg-Ort". Gemessen ' +
      '2026-09-14 (Job 20260914-ki-sichtbarkeit-…): das ausgelieferte FAQPage-Schema führte 13 ' +
      'Fragen, keine davon mit diesem Fragewortlaut — die Antwort stand nur unter „Wirkt das ' +
      'überhaupt?" und war für diese Frage damit nicht auffindbar.',
  },
  {
    q: 'Ich habe Kritik an Qi Blanco gelesen. Was ist da dran?',
    a:
      'Wir verstehen gut, dass man bei so etwas erst einmal skeptisch ist, und deshalb legen wir ' +
      'offen, worauf wir uns stützen. Das Dartsch Scientific Institut von Prof. Dr. Peter C. ' +
      'Dartsch hat unsere Produkte in fünf Arbeiten untersucht, die wir in Auftrag gegeben haben. ' +
      'Vier davon sind Laborversuche an Zellkulturen, eine wertet 171 Erfahrungsberichte aus, und ' +
      'erschienen sind alle fünf in Fachzeitschriften. Jede davon kannst du bei uns im Original ' +
      'lesen. Unsere Erklärung für die Messergebnisse stellen wir als Hypothese vor, so wie es auch ' +
      'die Publikationen selbst tun. Am meisten sagt dir aber, wie es dir selbst damit geht: Du ' +
      'kannst es 20 Tage lang an dir prüfen und ohne Angabe von Gründen zurückgeben.',
    quelle:
      'UMGESCHRIEBEN 2026-09-28 nach Christians Regel „Bestmögliches Licht" (Brain-Regel ' +
      'bestmoegliches-licht-kritik-nicht-selbst-verbreiten; Stilblatt Regeln 11–14 und Paar 20; ' +
      'Grossjob 20260928-GROSSJOB-frageseiten-menschlich-…, s04). Die FRAGE ist behutsam ' +
      'umformuliert. Die Suchwörter „Kritik" und „Qi Blanco" bleiben, die Nacherzählung von Form ' +
      'und Herkunft der Kritik fällt weg. Die ANTWORT beantwortet die Unsicherheit dahinter und ' +
      'erzählt die Kritik weder nach, noch gibt sie ihr recht. WEGGELASSEN sind die Zustimmung zum ' +
      'schwersten Einwand, die Zählung weiterer eingeräumter Punkte, der Satz zum Stand des ' +
      'Erklärungsmodells in der Fachwelt, die ausstehende Wiederholung und die Antithese ' +
      '„Gegenargument/Angebot". Tatsachen aus der Registry app/data/studien/e0001…e0005.json: ' +
      'Labor, Auftrag, vier in vitro, eine Auswertung von 171 Berichten, pdfUrl je Eintrag. „In ' +
      'Fachzeitschriften erschienen" wie kritik-vorwuerfe.js KURZABSATZ, die Hypothese wie ' +
      'MmWirktDas.jsx GRENZE 4, die 20 Tage wie FAQ_KAUF Frage 1. Namen Dritter bleiben ' +
      'ungenannt (früherer Entscheid s04, Begründung in dessen RESULT; jetzt zusätzlich ' +
      'Licht-Regel 11). Frage und Antwort vorher: origin/main b45d25b.',
    // Die Vertiefung dieser Antwort. Der Abgrenzungs-SSoT (konzepte/
    // abgrenzung-flaechen.json, Fläche `faq`) legt genau diese Arbeitsteilung
    // fest: „Die FAQ beantwortet … in je EINEM Absatz. Eine Kritik-Fläche darf
    // diese zwei Antworten nicht länger wiederholen, sondern muss sie
    // VERTIEFEN … Die FAQ verlinkt dorthin." Seit der Freischaltung von
    // /pages/kritik am 2026-09-11 ist dieser Weg begehbar; vorher wäre er ein
    // Link auf eine per robots.txt gesperrte Seite gewesen.
    //
    // LINKTEXT 2026-09-28 neu (Christian, Bestmögliches Licht): „Jeden Vorwurf
    // einzeln nachlesen, mit Fundstelle und Antwort" katalogisierte fremde
    // Vorwürfe, und Fundstellen trägt /pages/kritik seit dem 2026-09-11 gar
    // nicht mehr. Der neue Text beschreibt, was dort steht: sieben Fragen mit
    // Antwort und die fünf Studien mit ihren Zahlen. Ziel unverändert.
    weiter: {
      pfad: '/pages/kritik',
      text: 'Sieben Fragen, jede einzeln beantwortet, dazu alle fünf Studien mit ihren Zahlen',
    },
  },
  {
    q: 'Wie funktioniert das eigentlich, ganz ohne Elektronik?',
    a:
      'Im Inneren sitzt der GitterChip™ aus einer eigens entwickelten 750er Goldlegierung. Er ' +
      'kommt ohne Elektronik, Akku oder Batterie aus, sendet nichts und schirmt nichts ab. Unsere ' +
      'Erklärung dafür dreht sich um die Ordnung von Wasser, und wir stellen sie als Hypothese vor, ' +
      'so wie es auch unsere Publikationen tun. Die Messwerte hängen an dieser Erklärung nicht: Was ' +
      'in den Zellschalen passiert ist, wurde im Labor gemessen und veröffentlicht.',
    quelle:
      'MmWirktDas.jsx GRENZE 4 (Hypothese, Messwerte unabhängig von der Erklärung) + ' +
      'product-faqs.js Material-Item (ungeflaggt). UMGESCHRIEBEN 2026-09-28 nach Christians Regel ' +
      '„Bestmögliches Licht" (Stilblatt Paar 17; Grossjob 20260928-GROSSJOB-frageseiten-' +
      'menschlich-…, s04), seitdem nicht mehr wörtlich aus GRENZE 4. WEGGELASSEN sind der Satz ' +
      'zum Stand des Erklärungsmodells in der Fachwelt, der Schlusssatz über das offene Warum und ' +
      'die gedrechselten Paarformeln. Die Aussageklasse bleibt im Satz: „als Hypothese". Ebenfalls ' +
      'weiter weggelassen: die Mechanismus-Erklärung aus product-faqs.js, die im Bestand die flags ' +
      '`eso-buzzword` und `wirkmechanismus` trägt. Wortlaut vorher: origin/main b45d25b.',
    // DIE VERTIEFUNG DIESER ANTWORT, und zugleich ein eingehender Link, den
    // /pages/hypothesen braucht (Grossjob 20260925-GROSSJOB-neue-seiten-
    // kommen-bei-google-nicht-an-indexierung-und-soll, Segment s03): am
    // 2026-09-25 verlinkte keine indexierte Seite die Hypothesen aus dem
    // Inhalt, Google kannte sie nur aus der Sitemap. Die Antwort nennt das
    // Erklärungsmodell eine Hypothese; dort steht es ausgeführt.
    //
    // LINKTEXT 2026-09-28 neu (Stilblatt Regel 2 und Licht-Regel 12): „jede mit
    // dem, was dafür und was dagegen spricht" war ein symmetrischer Parallelbau
    // mit Zugeständnis im Linktext. „mit Quellen" stimmt weiter: hypothesen.js
    // führt je Hypothese `pro[]` „je mit Quellen statt Adjektiven". Ziel
    // unverändert.
    weiter: {
      pfad: '/pages/hypothesen',
      text: 'Unser Wirkmodell in sechs Hypothesen, ausführlich erklärt und mit Quellen',
    },
  },
];

export const FAQ_KAUF = [
  {
    q: 'Kann man ein Elektrosmog-Armband zurückgeben, wenn es keine Wirkung zeigt?',
    // Sprungziel /pages/faq#elektrosmog-armband-zurueckgeben, seit 2026-10-09.
    anker: 'elektrosmog-armband-zurueckgeben',
    a:
      'Ja. Bei Qi Blanco hast du 20 Tage ab Erhalt, um alles in Ruhe auszuprobieren, und darfst ' +
      'dein Stück in dieser Zeit ganz normal tragen und benutzen, dafür ist die Frist ja da. Wenn ' +
      'du nichts merkst oder es aus einem anderen Grund nicht behalten möchtest, meldest du dich ' +
      'bei uns, schickst es zurück und bekommst den Kaufpreis erstattet. Einen Grund musst du dafür ' +
      'nicht nennen, und die Rücksendung ist für dich kostenlos. Dieser 20-Tage-Test gilt ' +
      'zusätzlich zum gesetzlichen Widerrufsrecht von 14 Tagen.',
    quelle:
      'FRAGE NEU 2026-10-09 (Job 20261009-ki-lernschleife-bau-dach-0f6163, KI-Lernschleife ' +
      'Frage zur Rückgabe): Die Frage steht jetzt so, wie sie gesucht wird, die Antwort ' +
      'beginnt mit „Ja." Fristen, Erstattung und Kosten sind unverändert. Das Wort „20-Tage-Test" ' +
      'aus der alten Frage steht jetzt im letzten Satz. Vorher lautete die Frage „Wie läuft der ' +
      '20-Tage-Test, und was, wenn ich nichts merke?" (origin/main d78a668). BIS 2026-10-09: ' +
      'Kopfleiste jeder Seite („Jetzt 20 Tage risikofrei erleben!"), Bedingungen im Repo ' +
      '(„Frist: 20 Tage ab Erhalt · Grund: keiner nötig"), /pages/agb für die gesetzliche ' +
      '14-Tage-Frist (§ 7) und den Satz „Die Rücksendung ist für Sie kostenlos" (Abschnitt ' +
      'Zufriedenheitsgarantie, Absatz 2, Christian-Entscheidung vom 2026-08-14). ' +
      'Beide Fristen stehen NEBENEINANDER, weil sie zwei verschiedene Instrumente sind — genau die ' +
      'Lesart, die Segment s03 am 2026-09-01 für merchantReturnDays = 20 begründet hat.',
    // DIE VERTIEFUNG DIESER ANTWORT, und zugleich der eingehende Link, den
    // /pages/neu-oder-gebraucht braucht: eine Seite ohne Verweis von einer
    // indexierten Nachbarseite ist entdeckt und nicht gewichtet (Feld
    // `referringUrls` der Search Console). Der Menü-Eintrag allein trägt das
    // nicht — dessen Kinder rendert Shopify clientseitig per Portal, im
    // Server-HTML stehen sie nicht.
    //
    // ARBEITSTEILUNG wie im Abgrenzungs-SSoT: die FAQ antwortet in EINEM
    // Absatz und verlinkt in die Tiefe. Dort stehen beide Fristen mit ihrer
    // Quelle nebeneinander, dazu was im Preis enthalten ist und was ein Kauf
    // von privat nicht enthält.
    // LINKTEXT 2026-09-28: Gedankenstrich durch Komma ersetzt (keine
    // Gedankenstriche im Kundentext, Grossjob 20260928-GROSSJOB-frageseiten-
    // menschlich-…); Inhalt und Ziel unverändert.
    weiter: {
      pfad: '/pages/neu-oder-gebraucht',
      text:
        'Rücknahme, Widerruf, Gewährleistung und Versand mit Quelle, und ' +
        'was bei einem Kauf von privat wegfällt',
    },
    // DER ZWEITE WEG AUS DIESER ANTWORT, und einer der zwei eingehenden
    // Links, die /pages/healy-alternative braucht (Job 20261007-healy-
    // alternative-auffindbar-sitemap-kontextlinks-uebersicht-prio45;
    // Christian 06.10.2026: eine neue Seite ist erst fertig mit zwei
    // Kontextlinks von indexierten Seiten). Der Vergleich stellt die
    // Rückgabe beider Anbieter Zeile an Zeile, dazu Preis, Bauart und Belege:
    // dieselbe Kaufentscheidung wie diese Antwort, aus der anderen Richtung.
    // WARUM HIER UND NICHT BEI „Warum kostet das so viel?": nur der ERSTE
    // Eintrag jedes Blocks startet offen, die übrigen tragen `hidden`.
    // seiten_zufahrt zählt einen Link im zugeklappten Teil nicht als
    // Kontextlink (Vorschau 2026-10-07: 1 von 2). Der Linktext nennt nur
    // die Vergleichsachsen und wertet nicht.
    auch: {
      pfad: '/pages/healy-alternative',
      text: 'Healy und Qi Blanco im Vergleich: Bauart, Preis, Rückgabe und Belege',
    },
  },
  {
    q: 'Was sagen andere Kunden über Qi Blanco, und sind die Bewertungen echt?',
    a:
      'Ja, die sind echt. Jede Bewertung, die du bei uns siehst, steht öffentlich bei Google ' +
      'oder bei Trustpilot und ist dort im Original nachlesbar. Wir schreiben keine davon um, ' +
      'kaufen keine ein und geben für eine Bewertung auch keinen Gutschein oder Rabatt. Die ' +
      'aktuelle Google-Note und die Anzahl siehst du live auf unserer Bewertungsseite, genau so, ' +
      'wie Google sie zählt. Und weil jeder Mensch etwas anderes erlebt, kannst du jedes Produkt ' +
      '20 Tage lang selbst ausprobieren.',
    quelle:
      'app/lib/googleRating.js (Reputon-Feed des Google-Unternehmensprofils, root-Loader), ' +
      'app/lib/googleReviewsCurated.js (Kopf: menschlich geprüfte, echte Rezensionen), ' +
      'Elternauftrag des Grossjobs 20260921-GROSSJOB-die-bewertenden-markenbegriffe-gehoeren-uns ' +
      '(Festlegung: keine Fake-Bewertungen, keine gekauften Rezensionen). KEINE ZAHL IM TEXT: Note ' +
      'und Anzahl leben im Widget und würden hier still veralten. SPRACHE 2026-09-28 geglättet ' +
      '(Grossjob 20260928-GROSSJOB-frageseiten-menschlich-…, s04). Aus der gebauten Antithese über ' +
      'Erlebnis und Messwert wurde „weil jeder Mensch etwas anderes erlebt". Der Inhalt bleibt: ' +
      'eine Bewertung ist ein Erlebnis, die eigene Prüfung sind die 20 Tage.',
    // DIE VERTIEFUNG DIESER ANTWORT, und zugleich der eingehende Link, den
    // /pages/bewertungen braucht (Grossjob 20260921-GROSSJOB-die-bewertenden-
    // markenbegriffe-gehoeren-uns, Segment s04): eine Seite ohne Verweis von
    // einer indexierten Nachbarseite ist entdeckt und nicht gewichtet. Der
    // Menü-Eintrag trägt das nicht — dessen Kinder rendert Shopify
    // clientseitig per Portal, im Server-HTML stehen sie nicht.
    //
    // ARBEITSTEILUNG wie im Abgrenzungs-SSoT: die FAQ antwortet in EINEM
    // Absatz und verlinkt in die Tiefe. Dort stehen die Bewertungen selbst,
    // live aus dem Google-Profil, mit Herkunft und Grenzen.
    weiter: {
      pfad: '/pages/bewertungen',
      text: 'Alle Google-Bewertungen live, mit Note und Anzahl, und woher sie kommen',
    },
    // DER ZWEITE WEG AUS DIESER ANTWORT, und der eingehende Link, den
    // /pages/was-auf-reddit-ueber-qi-blanco-steht braucht (Job 20261001-
    // s07vm-tatsachenseite-reddit). Die FAQ ist am 2026-10-01 die einzige
    // Zweifels-Nachbarin, die laut Search Console im Index steht. Ein
    // EIGENES Feld statt `weiter` als Liste: drei Tests und vier Proben lesen
    // `weiter.pfad` als Objekt, eine Liste hätte sie still leer gemacht.
    // Der Eintrag ist der zweite seines Blocks und startet zugeklappt: im
    // Server-HTML steht der Link, das Bild der Seite ändert sich nicht.
    //
    // SEIT 2026-10-01 EINE LISTE (Job 20261001-s07vm-tatsachenseite-
    // trustpilot): /pages/qi-blanco-auf-trustpilot braucht denselben
    // eingehenden Link aus derselben Antwort. `auch` darf ein Objekt ODER eine
    // Liste sein; FaqSeite.jsx rendert beides. `weiter` bleibt ein Objekt.
    // TRUSTPILOT-STIMMEN (Job 20261006-bau-trustpilot-scroller-ki-seiten-und-
    // faq, Christian 2026-10-06 „ja bei FAQ z.B. schon"): FaqSeite.jsx setzt
    // den Trustpilot-Scroller direkt hinter den Block, der diesen Eintrag
    // trägt. Deshalb sagt die Antwort seither „bei Google oder bei Trustpilot"
    // statt „aus unserem Google-Unternehmensprofil": der alte Satz wäre neben
    // den Trustpilot-Karten falsch gewesen.
    trustpilot: true,
    auch: [
      {
        pfad: '/pages/was-auf-reddit-ueber-qi-blanco-steht',
        text: 'Was auf Reddit über Qi Blanco steht, Faden für Faden nachgezählt',
      },
      {
        pfad: '/pages/qi-blanco-auf-trustpilot',
        text: 'Was auf Trustpilot über Qi Blanco steht, mit Quelle und Stand',
      },
    ],
  },
  {
    q: 'Kann ich in Raten zahlen?',
    a:
      'Ja, über Klarna. Leg dein Produkt in den Warenkorb, geh zur Kasse und wähle als Zahlart ' +
      'Klarna („Sofort oder später bezahlen"). Im Klarna-Fenster klickst du dann auf „Ratenzahlung" ' +
      'und suchst dir deine Laufzeit aus. ' +
      'Ab 25 € Warenwert geht das in 6 Monatsraten, ab 500 € in 12 und ab 1.000 € in bis zu 24. ' +
      'Ob die Ratenzahlung klappt, prüft Klarna beziehungsweise PayPal selbst, deshalb ist sie nicht ' +
      'garantiert. Und im Moment geht das nur, wenn du deinen Wohnsitz in Deutschland hast.',
    quelle:
      'app/data/product-faqs.js, Klarna-Item (ungeflaggt) für die Staffel 25/500/1.000 €; ' +
      'Footer-Fußnote 2 (app/components/Footer.jsx) wörtlich für die zwei Einschränkungen: ' +
      '„Eine Genehmigung für Ratenzahlungen ist nicht garantiert […] Ratenzahlung aktuell nur für ' +
      'Kunden mit deutschem Wohnsitz möglich." Der zweite Punkt beantwortet eine real gestellte ' +
      'Kundenfrage („kann man den qi one auch in der schweiz über klarna in raten zahlen?").',
  },
  {
    q: 'Warum kostet das so viel?',
    a:
      'Weil in dem Stück wertvolles Material und Handarbeit stecken und du nur einmal zahlst. Das ' +
      'Gehäuse ist aus Chirurgenstahl, der GitterChip™ aus einer maßgeschneiderten 750er ' +
      'Goldlegierung, und fertiggestellt wird er von Oberflächenveredlern und Goldschmieden in ' +
      'Handarbeit. Nach dem Kauf kommt nichts mehr dazu, keine Batterie, kein Abo und nichts zum ' +
      'Nachkaufen. Entscheiden musst du dich trotzdem nicht sofort: 20 Tage ab Erhalt kannst du es ' +
      'tragen, benutzen und ohne Angabe von Gründen zurückgeben.',
    quelle:
      'app/data/product-faqs.js Material-Item (ungeflaggt) für Chirurgenstahl/750er Goldlegierung/ ' +
      'Handarbeit; „keine Elektronik" ebenda. Der Evidenz-Satz ist derselbe wie oben und wird ' +
      'NICHT abgeschwächt, weil hier von Geld die Rede ist.',
  },
  {
    q: 'Was kostet der Versand und wie lange dauert er?',
    a:
      'QiOne® 2 Pro, QiBracelet®, QiHome® Air und Qi Master® schicken wir dir nach Deutschland ' +
      'und Österreich versandkostenfrei. Für das Necklace und Crystal Cacao® kostet der Versand ' +
      'nach Deutschland 5,90 €. Ab 99 € Warenwert vor Mehrwertsteuer ist er frei, und mit zwei ' +
      'Packungen Crystal Cacao® bist du schon darüber. Nach Österreich kostet er 6,90 € und ist ab ' +
      '250 € Warenwert vor Mehrwertsteuer frei. In die Schweiz zahlst du 9 Franken für ein ' +
      'einzelnes Necklace oder eine Packung Crystal Cacao® und 21 Franken für alles andere. Zoll ' +
      'und Einfuhrabgaben sind dort schon im Preis enthalten. ' +
      'Wie lange die Lieferung dauert, steht auf jeder Produktseite. QiOne® 2 Pro, QiBracelet®, ' +
      'QiHome® Air und das Necklace sind in 2 bis 3 Tagen bei dir, die Crystal Cacao®-Sorten in 1 ' +
      'bis 3 Tagen.',
    quelle:
      'Versandkosten JE PRODUKT aus der rechnenden Instanz, nicht aus der Prosa: Storefront-API ' +
      'cartCreate/deliveryGroups mit Lieferadresse DE/AT/CH, gemessen 2026-09-23 (Job ' +
      '20260923-versand-faq-widerspricht-rate-engine-prio35). Gerät allein DE/AT 0,00; Necklace ' +
      '(94 € brutto) und 1x Kakao zahlen. Die Schwellen greifen auf den NETTO-Warenwert ' +
      '(taxes_included=false): DE 98,91 zahlt, 99,74 frei; AT 249,42 zahlt, 250,25 frei. CH in CHF: ' +
      'einzelnes Necklace oder 1x Kakao 9,00, alles Gemessene darüber 21,00. Die Versandrichtlinie ' +
      'nennt „Österreich 6,90 €" und „EU ab 250€" — die frühere FAQ zitierte nur die erste Hälfte ' +
      'und nannte das Necklace irrtümlich über 99 €. Lieferzeiten aus der Messreihe von Segment s03 über ' +
      'alle 13 DACH-Produktseiten (2026-09-01; die Kakao-Seiten am 2026-09-09 auf die Hausform ' +
      'nachgezogen): „In 2-3 Tagen bei Dir" auf den vier Geräteseiten, „In 1-3 Tagen bei Dir" ' +
      'auf den Kakao-Seiten. Bewusst KEINE pauschale Zahl für „den ' +
      'Shop" — sieben der dreizehn Seiten nennen gar keine.',
  },
];

/**
 * Die vier Bloecke in Anzeige-Reihenfolge. Sie folgt dem Kaufueberzeugungs-
 * Kanon: NEUGIER-Themen zuerst (Alltag/Reichweite sind die gemessenen
 * DACH-Einstiegsfragen), CLOSER zuletzt (Zahlbarkeit, Risikoumkehr,
 * Preisrechtfertigung). Der Beweis-Block steht dazwischen und nicht oben —
 * „Beweis ist ein Closer, kein Hook": ihn nach vorne zu ziehen verschenkt ihn.
 */
export const FAQ_BLOECKE = [
  {
    id: 'alltag',
    titel: 'Im Alltag',
    intro:
      'Größe, Wasser, Tragen, Haltbarkeit: die Fragen, die am häufigsten gestellt werden.',
    items: FAQ_ALLTAG,
  },
  {
    id: 'qihome',
    titel: 'QiHome® Air im Raum',
    intro: 'Wie weit es reicht und wohin es gehört.',
    items: FAQ_QIHOME,
  },
  {
    // Titel und Intro 2026-09-28 neu (Christian, Bestmögliches Licht): vorher
    // „Belege und Kritik" / „Was gemessen ist, was nicht, und wie wir mit der
    // Kritik daran umgehen." Die id bleibt, der Anker #faq-belege hängt an ihr
    // (ankerId() in FaqSeite.jsx), nicht am Titel.
    id: 'belege',
    titel: 'Studien und Erfahrungen',
    intro:
      'Was im Labor untersucht wurde, wie wir es uns erklären und wo du alles im Original nachliest.',
    items: FAQ_BELEGE,
  },
  {
    id: 'kauf',
    titel: 'Kaufen ohne Risiko',
    intro: 'Rückgabe, Raten, Preis und Versand.',
    items: FAQ_KAUF,
  },
];

/** Alle Q&A der Seite in Anzeige-Reihenfolge — die Quelle des FAQPage-Schemas. */
export const FAQ_ALLE = FAQ_BLOECKE.flatMap((b) => b.items);
