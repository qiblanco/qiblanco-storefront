/**
 * INHALTS-SSoT der Fläche `/pages/kritik`.
 *
 * UMGEBAUT 2026-09-11 (Job 20260911-BAU-kritikseite-antwortet-in-unseren-worten-
 * statt-fremde-vorwuerfe-abzudrucken). Christian, nachdem er die Seite gesehen
 * hat: „Es wirkt so, als wäre die Kritik so groß — ist sie aber nicht." Und:
 * „Wir müssen uns ja nicht verstecken. Aber wir sollten nicht so tun, als wäre
 * sich die Wissenschaft einig über uns."
 *
 * WAS SICH GEÄNDERT HAT — und was ausdrücklich NICHT:
 * Die Seite trug sieben Vorwürfe als WÖRTLICHE Zitate mit Fundstelle. Damit
 * stand die Anklage einer einzelnen Redaktion wörtlich und crawlbar auf unserer
 * eigenen Domain: wir haben ihre Verbreitungsarbeit mit unserer Reichweite
 * erledigt. Die sieben THEMEN sind vollständig geblieben (Reihenfolge seit
 * 2026-09-25 neu, Begründung über FRAGEN). Weggefallen sind allein die fremden FORMULIERUNGEN
 * und ihre Fundstellen. Es fehlt kein Thema; es fehlt fremde Rede.
 *
 * DAS FELD TRÄGT DESHALB DEN NAMEN `kurz` UND NICHT MEHR `urteil`: ein Urteil
 * („Das stimmt zum Teil.") beurteilt eine fremde Aussage und setzt sie damit
 * voraus. Eine Seite ohne fremde Aussage beantwortet stattdessen die FRAGE —
 * mit Ja, Nein oder Offen. Wer hier ein Urteilsfeld wiedereinführt, holt die
 * fremde Aussage durch die Hintertür zurück.
 *
 * HERKUNFT DER THEMEN — erhoben, nicht erfunden: die sieben Fragen decken
 * dieselben Sachverhalte ab wie die Erhebung in
 * `shared-state/ads-manager/state/welle-f/KRITIK-BEHAUPTUNGEN.md` (IDs K1-K6,
 * K8), auf der auch die Einwandbehandlung der Anzeigen steht. Die IDs bleiben
 * deshalb erhalten: sie sind die Brücke zu jener Erhebung. Wer ein Thema
 * streicht, streicht es für beide.
 *
 * HERKUNFT DER ANTWORTEN — faktengegatet: jede Zahl kommt aus
 * `app/data/studien/e0001…e0005.json` (Feld `factGate` hält fest, welche
 * kursierenden Zahlen in der Primärquelle NICHT stehen; solche Zahlen sind hier
 * nicht verbaut). Die vier Einräumungen waren bis 2026-09-28 wortgleich zu
 * `MmWirktDas.jsx GRENZEN 1–4` und zu `faq-seite.js FAQ_BELEGE`, mit der
 * Begründung „eine zweite Fassung wäre eine zweite Wahrheit".
 * DIESE KOPPLUNG IST SEIT 2026-09-28 GEWOLLT AUFGELÖST (Grossjob
 * 20260928-GROSSJOB-frageseiten-menschlich-schreiben-und-bestmoegliches-
 * licht, Segment s04):
 *  · faq-seite.js folgt Christians Licht-Regel vom 07.09. („Bestmögliches
 *    Licht") und führt keine Einräumungen mehr, nur noch die Tatsachen mit
 *    ihrer Aussageklasse.
 *  · Diese Seite folgt Christians NEUERER Vorgabe vom 21.09. (Landeziel der
 *    Anzeige „Qi Blanco Kritik: Zellversuche / Was sie sagen und was nicht")
 *    und behält alle vier Einräumungen INHALTLICH vollständig. Nur die Sprache
 *    ist nach dem Stilblatt des Grossjobs geglättet (Antwort zuerst, keine
 *    gebaute Antithese, kein Selbstkommentar, kein Stakkato).
 *  · MmWirktDas.jsx bleibt beim alten Wortlaut; die Seite /pages/wirkt-das ist
 *    zurückgezogen und wird nicht angefasst.
 * Es gibt also keine wortgleiche zweite Fassung mehr, deren Abweichung eine
 * Wache fangen müsste. Die Zahlen bleiben faktengegatet (s. o.).
 *
 * WAS HIER BEWUSST FEHLT (benannt, nicht beispielhaft):
 *  · JEDER Redaktions-, Sendungs- und Domainname, jedes Datum eines fremden
 *    Beitrags, jede Zählung fremder Vorwürfe und jeder Satz der Form „es gibt
 *    Kritik". Die kleinste ehrliche Darstellung einer Sache, die klein ist,
 *    ist keine Erwähnung. Das ist keine Verheimlichung — inhaltlich fehlt
 *    nichts, alle sieben Themen sind beantwortet.
 *  · K7 aus der Erhebung — eine Tatsachenfrage über eine FREMDE Domain, für
 *    die im Haus KEIN Beleg der Betreiberschaft vorliegt. Eine Antwort in die
 *    eine oder andere Richtung wäre eine Behauptung ohne Grundlage.
 *  · Jede Zahl, die wir nicht selbst nachgemessen haben — auch dann, wenn sie
 *    anderswo im Shop steht (Kundenzahl, Sternebewertung). Auf dieser Seite
 *    liest jemand misstrauisch; eine unbelegte Zahl kostet hier mehr, als sie
 *    bringt.
 *
 * TEXTSORTE (Abgrenzungs-SSoT `konzepte/abgrenzung-flaechen.json`, Fläche
 * `kritik`): diese Seite trägt BEWEISFÜHRUNG. Keine Kundenstimme wird hier als
 * Beweis benutzt — das ist der Gegenstand von /pages/erfahrungen. Der Verweis
 * dorthin in PLUSPUNKTE sagt das ausdrücklich mit (seit 2026-09-28: „Als
 * Beweis für eine Wirkung führen wir das nicht", vorher „Das ist kein Beweis
 * für eine Wirkung"); sobald hier ein Erlebnis überzeugen soll statt eines
 * Belegs, ist die Abgrenzung gebrochen.
 */

/**
 * DER KURZABSATZ unter der H1 (2026-09-25, Segment s03 des Grossjobs
 * 20260925-GROSSJOB-seo-geo-bewertung-und-kritik-auf-platz-1-bis-3-und-ki-
 * zitat). Er ist die Passage, die eine KI-Übersicht zu „Qi Blanco Kritik"
 * übernehmen soll, und steht deshalb für sich allein: wer wir sind, was
 * untersucht ist, was jeder selbst prüfen kann.
 *
 * JEDE ANGABE HAT IHREN BELEG IM HAUS — ändert sich eine Quelle, zieht dieser
 * Absatz im selben Commit mit:
 *  · Firma, Sitz, Register, Geschäftsführer: app/routes/pages.impressum.jsx
 *    (dieselben Daten in app/data/fragen.js, Frage „seriös").
 *  · fünf Arbeiten, vier Zellkultur, eine Auswertung von 171 Berichten, ein
 *    Labor: BEFUNDE unten, K8 und PLUSPUNKTE (bis 2026-10-06 auch EINRAEUMUNGEN 1–2). „Fünf Arbeiten an
 *    Zellkulturen" wäre kürzer und falsch — e0004 ist keine Zellkultur.
 *  · 20 Tage, ohne Angabe von Gründen: K5 und PLUSPUNKTE.
 * KEIN SATZ IST WÖRTLICH AUS DER FAQ übernommen (zwei Seiten mit derselben
 * Passage konkurrieren um dieselbe Zitierstelle). Keine Wirkaussage: gesagt
 * wird, DASS untersucht wurde, nicht was es bewirkt.
 */
export const KURZABSATZ =
  'Qi Blanco ist ein eingetragenes Unternehmen aus Maßbach, Amtsgericht Schweinfurt, HRB 7306, geführt von Christian Bernd Bauer. Das Dartsch Scientific Institut hat unsere Produkte in fünf veröffentlichten Arbeiten untersucht: vier an Zellkulturen im Labor, eine als Auswertung von 171 Erfahrungsberichten. Alle fünf sind in Fachzeitschriften erschienen und dort nachlesbar. Und prüfen kannst du es an dir selbst: Du trägst es 20 Tage und gibst es ohne Angabe von Gründen zurück, wenn es nichts für dich ist.';

/**
 * DER EINSTIEG ersetzt seit 2026-09-25 den Satz „… oder ob du verschaukelt
 * wirst". Der alte Satz nahm den Leser als Misstrauischen auf und ließ uns
 * als Verdächtige antreten. Christians Lesart der Frage: „Jeder will von uns
 * überzeugt werden." Das ist dieselbe Frage, positiv aufgenommen — ohne
 * Wirkversprechen und ohne fremde Stimme.
 * SPRACHE 2026-09-28 (Grossjob 20260928-GROSSJOB-frageseiten-menschlich-…,
 * s04, Stilblatt Paar 18): „und das ist der richtige Anspruch" (Merksatz) und
 * „jede mit einer geraden Antwort: was gemessen ist, was offen ist und was du
 * selbst nachprüfen kannst" (Selbstkommentar + Dreierformel) sind ersetzt.
 * Dass manches offen ist, sagen die Fragen selbst (K4 trägt ton `offen`).
 */
export const EINSTIEG =
  'Bevor du dich entscheidest, willst du überzeugt sein, und das verstehen wir gut. Hier stehen sieben Fragen, die du dir vielleicht auch stellst, und zu jeder, was wir gemessen haben und was du selbst nachprüfen kannst.';

/**
 * Die drei Antwortstufen. Mehr gibt es nicht — eine Frage, die keine dieser
 * drei Antworten verträgt, ist auf dieser Seite nicht ehrlich zu beantworten.
 * `ton` steuert allein die Farbgebung, nie den Inhalt.
 */
export const TON = {
  ja: 'ja',
  nein: 'nein',
  offen: 'offen',
};

/**
 * Die sieben Fragen. REIHENFOLGE UMGESTELLT AM 2026-09-25 (Grossjob
 * 20260925-GROSSJOB-seo-geo-bewertung-und-kritik-auf-platz-1-bis-3-und-ki-
 * zitat, Segment s03). Bis dahin stand K2 vorn, mit „Nein." als erster
 * Antwort der Seite. Für eine KI-Übersicht ist der erste Antwortsatz der
 * bequemste Beleg — sie hätte unser eigenes „Nein" als Zusammenfassung der
 * Gegenseite übernommen. Christian 2026-09-07: „Wir stellen uns immer im
 * bestmöglichen Licht dar." Debunking Handbook 2020 (über ruf-manager/
 * konzepte/PROFI-PRAXIS.md): mit der Tatsache anfangen, mit der Tatsache
 * enden.
 *
 * DIE NEUE ORDNUNG IST TRAGEND: zuerst das Belegte (K3 veröffentlicht, K1 was
 * gemessen wurde, K6 was wir nicht behaupten), dann die Offenlegung (K8
 * bezahlt, K2 Erklärungsmodell offen), dann der Preis (K5) und zuletzt die
 * Prüfung an dir selbst (K4). ALLE SIEBEN THEMEN UND ALLE GRENZEN SIND
 * GEBLIEBEN — K2 steht weiter da und sagt weiter „Nein"; es eröffnet nur
 * nicht mehr. Wer K2 wieder nach vorn zieht, dreht die Seite zurück.
 * Die IDs (Anker #k1 … #k8) sind unverändert; Verweise bleiben gültig.
 * @type {Array<{id: string, frage: string, kurz: string,
 *   ton: keyof typeof TON, antwort: string[]}>}
 */
export const FRAGEN = [
  {
    id: 'K3',
    frage: 'Wurde die Wirkung überhaupt je untersucht?',
    kurz: 'Ja, fünf Mal, veröffentlicht und im Original nachlesbar.',
    ton: 'ja',
    antwort: [
      'Fünf Arbeiten sind in Fachzeitschriften erschienen, jede mit Datum und Seitenzahl, und alle fünf kannst du bei uns im Original als PDF lesen. So siehst du selbst, was drinsteht.',
      'Vier der fünf Arbeiten untersuchen Zellkulturen, die fünfte wertet Erfahrungsberichte aus, und eine Studie am Menschen ist nicht darunter.',
    ],
  },
  {
    id: 'K1',
    frage: 'Wehrt der Schmuck Strahlung ab?',
    kurz: 'Nein. Gemessen wurde, wie sich Zellen unter Strahlung verhalten.',
    ton: 'nein',
    antwort: [
      'Unsere Produkte arbeiten ganz ohne Elektronik, Akku oder Batterie, senden nichts und schirmen nichts ab. Ein Messgerät daneben zeigt deshalb dieselbe Strahlung wie vorher, und das haben wir auch nie anders gesagt.',
      'In den Zellstudien ging es um die Zellen selbst: Zellkulturen lagen vier Stunden unter Mobilfunkbelastung, einmal mit und einmal ohne Gerät daneben, und gemessen wurde, wie sie sich dabei verhalten. Mit „Strahlung abwehren" wäre das falsch beschrieben, auch wenn es kürzer klingt.',
    ],
  },
  {
    id: 'K6',
    frage: 'Versprecht ihr übermenschliche Fähigkeiten?',
    kurz: 'Nein.',
    ton: 'nein',
    antwort: [
      'So etwas versprechen wir in keinem Text, und du wirst es auf keiner unserer Seiten finden.',
      'Wir behaupten keinen Heileffekt, versprechen keine Heilung und raten niemandem, wegen uns eine Behandlung zu ändern. Ein Wirknachweis am Menschen liegt nicht vor. Untersucht sind Zellkulturen und eine Sammlung von Erfahrungsberichten, und mehr als das steht in keinem unserer Texte.',
    ],
  },
  {
    id: 'K8',
    frage: 'Sind das von euch bezahlte Studien?',
    kurz: 'Ja. Wir haben sie bezahlt und die Geräte gestellt.',
    ton: 'ja',
    antwort: [
      'Dass die Studien von uns finanziert sind, steht auch so in den Publikationen. Alle fünf Arbeiten kommen aus demselben Labor, dem Dartsch Scientific Institut von Prof. Dr. Peter C. Dartsch. So läuft Produktforschung in aller Regel, und falsch werden die Ergebnisse dadurch nicht. Eine Wiederholung durch ein zweites, unabhängiges Labor steht noch aus.',
      'Auftraggeber, Labor, Methode, Fallzahlen und Grenzen stehen in den Arbeiten und auf unseren Studienseiten. Unabhängigkeit können wir dagegen nicht belegen, und deshalb schreiben wir nirgends „unabhängig getestet".',
    ],
  },
  {
    id: 'K2',
    frage: 'Ist das Erklärungsmodell wissenschaftlich belegt?',
    kurz: 'Nein, es ist eine Hypothese, und die Messwerte hängen nicht davon ab.',
    ton: 'nein',
    antwort: [
      'Unsere Publikationen erklären ihre Messwerte mit dem Modell des geordneten Wassers. In der etablierten Wissenschaft ist dieses Modell nicht anerkannt, die Arbeiten selbst führen es als Hypothese, und genau so haben wir es auch immer dargestellt.',
      'An den Messwerten ändert das nichts: Was in den Zellschalen passiert ist, wurde gemessen und veröffentlicht. Offen ist, warum es passiert, und das weiß heute niemand sicher, wir auch nicht.',
    ],
  },
  {
    id: 'K5',
    frage: 'Über 1000 Euro: wofür eigentlich?',
    kurz: 'Der Preis stimmt, und er steckt im GitterChip aus 750er Gold und in fünf Publikationen.',
    ton: 'ja',
    antwort: [
      'Der Preis ist hoch, und das Geld steckt vor allem im Inneren: Dort sitzt der GitterChip aus einer eigens entwickelten 750er Goldlegierung. Dazu kommen die fünf Publikationen, die wir bezahlt haben. Ob dir das den Preis wert ist, entscheidest ganz allein du.',
      'Damit du das in Ruhe entscheiden kannst, trägst du es erst einmal 20 Tage, und wenn es nichts für dich ist, schickst du es ohne Angabe von Gründen zurück.',
    ],
  },
  {
    id: 'K4',
    frage: 'Kann so etwas überhaupt plausibel sein?',
    kurz: 'Offen, und die Frage ist völlig verständlich.',
    ton: 'offen',
    antwort: [
      'Diese Frage kommt meistens aus dem Bauch, und wir haben sie uns am Anfang genauso gestellt.',
      'Beantworten könnte sie erst eine klinische Untersuchung am Menschen, und die gibt es bisher nicht. Es gibt vier Zellstudien und eine Auswertung von 171 Erfahrungsberichten. Und es gibt die Prüfung an dir selbst: Du trägst es 20 Tage, und wenn nichts passiert, schickst du es ohne Angabe von Gründen zurück und hast deine Antwort.',
    ],
  },
];

/**
 * DIE VIER EINRÄUMUNGEN SIND AUFGELÖST (2026-10-06, Grossjob „neue Seiten,
 * PR-Freigabe“, s02). Bis dahin stand
 * hier ein Export EINRAEUMUNGEN, den KritikSeite.jsx als Rubrik „Was wir selbst
 * einräumen" rendert. Christian, 06.10.: „steht da also nichts mehr, was uns
 * selbst beleidigt oder klein macht?" Die Rubrik benotet unser Material,
 * obwohl jede Angabe darin stimmt. DIE ANGABEN SIND GEBLIEBEN, jede an ihrer
 * Frage: keine Studie am Menschen (K3, K6, K4), ein Labor und ein Autor (K8,
 * PLUSPUNKTE), von uns bezahlt und Geräte gestellt, Wiederholung durch ein
 * zweites Labor steht aus (K8), Erklärung ist eine Hypothese und in der
 * etablierten Wissenschaft nicht anerkannt (K2), Grenzen je Arbeit (BEFUNDE).
 * Wer die Rubrik zurückholt, holt die Note zurück, nicht eine Angabe.
 */

/**
 * Was in den Studien wirklich steht. Zahlen ausschließlich aus den
 * faktengegateten Registry-Einträgen; die auf älteren Seiten kursierenden
 * Werte, die in KEINER Primärquelle stehen (Feld `factGate`), fehlen hier
 * absichtlich und dürfen nicht ergänzt werden.
 * @type {Array<{id: string, titel: string, quelle: string, befund: string,
 *   grenze: string, slug: string}>}
 */
export const BEFUNDE = [
  {
    id: 'e0001',
    titel: 'Immunzellen unter Mobilfunkbelastung',
    quelle: 'Japan Journal of Medicine 2021, 4(1): 484–488',
    befund:
      'Menschliche Immunzellen (HL-60) lagen vier Stunden unter Mobilfunkbelastung. Dabei sank ihre Fähigkeit, Abwehr-Radikale zu bilden, auf 60,5 ± 3,9 Prozent der unbestrahlten Kontrolle. Lag ein QiOne 2 Pro daneben, blieben 84,7 ± 7,0 Prozent erhalten (p ≤ 0,01).',
    grenze:
      'In vitro, eine Zelllinie, drei unabhängige Experimente. Auf den lebenden Menschen lässt sich das nicht übertragen.',
    slug: 'studie-immunzellen',
  },
  {
    id: 'e0002',
    titel: 'Darmbarriere unter derselben Belastung',
    quelle: 'Applied Cell Biology 2021, 9(3): 69–74',
    befund:
      'Bei kultivierten Darmzellen (IPEC-J2) brach der elektrische Widerstand der Zellbarriere ungeschützt auf etwa ein Zehntel ein. Geschützt lag er bei 1.837 ± 349 Ω/cm², bei völlig unbestrahlten Zellen bei 2.542 ± 389 Ω/cm².',
    grenze:
      'In vitro, Zellen vom Schwein, n = 3–4. Dass sich das auf den menschlichen Darm übertragen lässt, ist nicht belegt.',
    slug: 'studie-darmbarriere',
  },
  {
    id: 'e0003',
    titel: 'Oxidativer Stress',
    quelle: 'Applied Cell Biology 2024, 12(1): 1–6',
    befund:
      'Vier Zelllinien wurden mit Wasserstoffperoxid unter Stress gesetzt, einmal mit und einmal ohne QiBracelet.',
    grenze:
      'In vitro. Den Stress erzeugt hier ein chemisches Modell, um einen Schutz vor Mobilfunk geht es in dieser Arbeit nicht. Beim Zahlenwert der Vitalität widersprechen sich Abstract und Ergebnisteil des Originals, deshalb geben wir ihn nicht wieder.',
    slug: 'studie-oxidativer-stress',
  },
  {
    id: 'e0004',
    titel: '171 freiwillige Anwenderberichte',
    quelle:
      'Advances in Bioengineering & Biomedical Science Research 2024, 7(3): 01–04',
    befund:
      'Eine beschreibende Auswertung von 171 öffentlich geposteten Nutzerbeobachtungen zu QiOne 2 Pro und QiBracelet.',
    grenze:
      'Ohne Fragebogen, ohne Kontrollgruppe und ohne Verblindung. Auswahl- und Bestätigungsverzerrung sind deshalb nicht ausgeschlossen, und auf eine Ursache lässt sich daraus nicht schließen.',
    slug: 'studie-nutzererfahrung',
  },
  {
    id: 'e0005',
    titel: 'Neuronale und entzündungsvermittelnde Zellen',
    quelle:
      'Neurodegenerative Diseases: Current Research 2026, 6(1): 1–8 (Open Access)',
    befund:
      'Humane Nervenzellen (SH-SY5Y) und entzündungsvermittelnde Zellen unter Einfluss des QiHome Air.',
    grenze:
      'In vitro, ohne klinische Untersuchung am Menschen. Das verwendete Regenerationsmodell bildet nach Angabe der Publikation nur das periphere Nervensystem ab.',
    slug: 'studie-qihome-air',
  },
];

/**
 * WAS FÜR UNS SPRICHT — die zweite Hälfte der Seite (Christian 2026-09-11:
 * „wirklich unsere eigenen Stärken auch auf der Kritik ausbauen — also nicht
 * nur defensiv, man kann da ja auch proaktiv vorgehen").
 *
 * DIE REIHENFOLGE IST BINDEND und steht in der Komponente, nicht hier: erst die
 * offenen Punkte, dann die Stärken. Wer mit den Stärken anfängt, wirkt
 * ausweichend; wer mit ihnen aufhört, wirkt souverän.
 *
 * AUFNAHMEREGEL — jede Zeile mit Beleg oder sie fällt weg. `beleg` nennt, WORAN
 * die Aussage nachprüfbar ist; ein Eintrag ohne Beleg gehört nicht in diese
 * Liste, auch wenn er stimmt. `pfad`/`link` nur auf Seiten, die ausgeliefert
 * werden — ein Verweis ins Leere ist auf DIESER Seite teurer als anderswo.
 *
 * WAS MANGELS BELEG NICHT AUFGENOMMEN IST (benannt, nicht beispielhaft):
 *  · „Eine unabhängige Wiederholung ist in Arbeit." Dafür liegt kein Beleg vor.
 *    Ein erfundenes Vorhaben wäre schlimmer als eine eingestandene Lücke — und
 *    das ist die eine Stelle dieser Seite, an der nichts geschönt werden darf.
 *  · Kundenzahl und Sternebewertung aus dem Kopfbereich des Shops: auf dieser
 *    Seite nicht nachgemessen, also hier nicht behauptet.
 *  · „Warum es Qi Blanco gibt" (/pages/warum-qi-blanco): am 2026-09-11 mit
 *    HTTP 404 gemessen, also noch nicht ausgeliefert. SOBALD SIE LIVE IST,
 *    gehört sie als achter Eintrag hierher — ihr Fehlen war kein Grund zu warten.
 *
 * @type {Array<{titel: string, text: string, beleg: string,
 *   pfad?: string, link?: string}>}
 */
export const PLUSPUNKTE = [
  {
    titel: 'Zu jeder Arbeit steht, was sie nicht zeigt.',
    // „wortgleich" 2026-09-28 gestrichen: die Einräumungen sind seitdem
    // sprachlich geglättet (Dateikopf), und die Studienseiten tragen ihre
    // Grenzen aus der Registry, nicht diesen Wortlaut. Der Satz in
    // KritikSeite.jsx („Sie stehen wortgleich auch auf unseren Studienseiten")
    // ist nicht Teil dieses Moduls und steht als offener Punkt im RESULT-s04.
    text: 'Bei allen fünf Studien steht die Grenze gleich daneben: in vitro, welche Zelllinie, welche Fallzahl und was daraus nicht folgt. So steht es auch auf unseren Studienseiten.',
    beleg: 'Die Grenzen-Zeile bei jeder der fünf Arbeiten, hier und auf /pages/studien.',
  },
  {
    titel: '20 Tage auf unsere Rechnung prüfen.',
    text: 'Trag es 20 Tage, und wenn es nichts für dich ist, schickst du es ohne Angabe von Gründen zurück. Das Risiko liegt bei uns.',
    beleg: 'Rückgaberecht, öffentlich nachlesbar.',
    // ZIEL UMGEBOGEN AM 2026-09-14 (offener Vollzug ov90ac04c6c8). Vorher
    // /pages/das-20-tage-versprechen — und das ist eine Landingpage des
    // geschlossenen Paid-Funnels (noindex, Kanon des Landing-Bereichs).
    // /pages/kritik ist crawlbar; ein Link von hier hinein kostet nicht diese
    // eine Seite, sondern die Aussagekraft der Ads-Zuordnung der GANZEN
    // Landing-Fläche: „wer sich dort bewegt, ist Ads-Verkehr" gilt nur,
    // solange niemand aus dem offenen Shop hineinstolpert.
    // WARUM die FAQ und nicht /policies/refund-policy: der Beleg daneben sagt
    // „Rückgaberecht, öffentlich nachlesbar", und die Beschriftung verspricht
    // den ABLAUF der 20 Tage. Den beschreibt FAQ_KAUF Frage 1 vollständig
    // (Frist, kein Grund nötig, Rücksendekosten); die Policy-Seite trägt nur
    // die gesetzlichen 14 Tage, also eine andere Frist. Der Anker faq-kauf
    // kommt aus ankerId() in FaqSeite.jsx — dieselbe ID trägt dort die H2.
    pfad: '/pages/faq#faq-kauf',
    link: 'Wie die 20 Tage laufen',
  },
  {
    titel: 'Fünf veröffentlichte Arbeiten, im Original nachlesbar.',
    text: 'Jede ist mit Fachzeitschrift, Datum und Seitenzahl erschienen, und alle fünf kannst du bei uns als Original-PDF lesen. Dass alle fünf aus demselben Labor stammen, steht gleich mit dabei.',
    beleg: 'Die fünf Arbeiten mit Methode, Zahlen und PDF.',
    pfad: '/pages/studien',
    link: 'Alle fünf Arbeiten ansehen',
  },
  {
    titel: 'Ein Institut und ein Wissenschaftler, beide mit Namen.',
    text: 'Gemessen hat Prof. Dr. Peter C. Dartsch am Dartsch Scientific Institut. Du kannst also genau nachsehen, wer hinter den Ergebnissen steht, anders als bei einem anonymen Gutachten oder einem Prüfsiegel ohne Absender.',
    beleg: 'Autor und Institut stehen in jeder der fünf Publikationen.',
  },
  {
    titel: 'Ein eingetragenes Unternehmen mit Anschrift.',
    text: 'Wir stehen im Handelsregister, haben eine ladungsfähige Anschrift, und hinter Qi Blanco stehen Menschen, die mit ihrem Namen dafür einstehen. Das findest du alles im Impressum, ohne Umweg und ohne Formular.',
    beleg: 'Impressum mit Handelsregisternummer und Anschrift.',
    pfad: '/pages/impressum',
    link: 'Impressum ansehen',
  },
  {
    titel: 'Erfahrungen, die du selbst nachprüfen kannst.',
    text: 'Menschen erzählen unter ihrem eigenen Namen und auf ihren eigenen Konten, was sie erlebt haben. Als Beweis für eine Wirkung führen wir das nicht, aber du kannst jeden Bericht selbst nachprüfen, und das bietet dir eine anonyme Bewertung nicht.',
    beleg: 'Berichte auf den öffentlichen Konten der Menschen selbst.',
    pfad: '/pages/erfahrungen',
    link: 'Erfahrungen nachsehen',
  },
];
