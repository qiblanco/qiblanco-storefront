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
 * erledigt. Die sieben THEMEN sind vollständig geblieben, in derselben
 * Reihenfolge nach Gewicht. Weggefallen sind allein die fremden FORMULIERUNGEN
 * und ihre Fundstellen. Es fehlt kein Thema; es fehlt fremde Rede.
 *
 * DESHALB HEISST DAS FELD JETZT `kurz` UND NICHT MEHR `urteil`: ein Urteil
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
 * nicht verbaut). Die vier Einräumungen sind wortgleich zu
 * `MmWirktDas.jsx GRENZEN 1–4` und zu `faq-seite.js FAQ_BELEGE` — eine zweite
 * Fassung wäre eine zweite Wahrheit.
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
 * dorthin in STAERKEN sagt das ausdrücklich mit („Kein Beweis für eine
 * Wirkung"); sobald hier ein Erlebnis überzeugen soll statt eines Belegs, ist
 * die Abgrenzung gebrochen.
 */

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
 * Die sieben Fragen in der Reihenfolge, in der ein Zweifelnder sie sortiert:
 * zuerst die Frage, die am schwersten wiegt, zuletzt die, die am wenigsten mit
 * Messwerten zu tun hat.
 * @type {Array<{id: string, frage: string, kurz: string,
 *   ton: keyof typeof TON, antwort: string[]}>}
 */
export const FRAGEN = [
  {
    id: 'K2',
    frage: 'Ist das Erklärungsmodell wissenschaftlich belegt?',
    kurz: 'Nein.',
    ton: 'nein',
    antwort: [
      'Das ist der härteste Punkt auf dieser Seite, und wir stellen ihn nach vorn. Das Modell, mit dem unsere Publikationen ihre Messwerte erklären — geordnetes Wasser — ist in der etablierten Wissenschaft nicht anerkannt. Die Arbeiten selbst führen es als Hypothese, nicht als gesicherte Erkenntnis. Wir bestreiten das nicht und haben es nie bestritten.',
      'Was wir dem entgegensetzen, ist kein Gegenargument, sondern eine Unterscheidung: Die Erklärung ist offen. Die Messung ist es nicht. Was in den Zellschalen passiert ist, wurde gemessen und veröffentlicht — warum es passiert ist, weiß niemand sicher, wir eingeschlossen. Beides auseinanderzuhalten ist der ehrlichste Umgang mit dieser Datenlage.',
    ],
  },
  {
    id: 'K3',
    frage: 'Wurde die Wirkung überhaupt je untersucht?',
    kurz: 'Ja, fünf Mal — veröffentlicht und im Original nachlesbar.',
    ton: 'ja',
    antwort: [
      'Fünf Arbeiten sind erschienen, jede mit Fachzeitschrift, Datum und Seitenzahl; vier davon liegen bei uns im Original als PDF. Du kannst sie lesen, ohne uns ein Wort zu glauben.',
      'Wie weit diese fünf Arbeiten tragen, steht weiter unten — mit ihren Grenzen, Punkt für Punkt. Untersucht wurden Zellkulturen, nicht Menschen. Das ist der Unterschied, auf den es ankommt, und wir schreiben ihn hin, statt ihn zu überspringen.',
    ],
  },
  {
    id: 'K1',
    frage: 'Wehrt der Schmuck Strahlung ab?',
    kurz: 'Nein — gemessen wurden Zellen, nicht Strahlung.',
    ton: 'nein',
    antwort: [
      'In unseren Produkten steckt keine Elektronik, kein Akku, keine Batterie. Es wird nichts gesendet und nichts abgeschirmt. Wer ein Messgerät danebenlegt, misst dieselbe Strahlung wie vorher — das haben wir nie anders gesagt.',
      'Untersucht wurde etwas anderes: nicht die Strahlung, sondern was Zellen unter Strahlung tun. In den Zellstudien lagen Zellkulturen vier Stunden unter Mobilfunkbelastung, einmal mit und einmal ohne Gerät daneben. Gemessen wurden die Zellen, nicht das Feld. „Strahlung abwehren" beschreibt das falsch, auch wenn es kürzer klingt.',
    ],
  },
  {
    id: 'K6',
    frage: 'Versprecht ihr übermenschliche Fähigkeiten?',
    kurz: 'Nein.',
    ton: 'nein',
    antwort: [
      'Kein Text von uns verspricht das, und du wirst es auf keiner unserer Seiten finden.',
      'Ein Wirknachweis am Menschen liegt nicht vor. Wir behaupten keinen Heileffekt, versprechen keine Heilung und raten niemandem, wegen uns eine Behandlung zu ändern. Untersucht sind Zellkulturen und eine Sammlung von Erfahrungsberichten — mehr steht in keinem unserer Texte.',
    ],
  },
  {
    id: 'K5',
    frage: 'Über 1000 Euro — wofür eigentlich?',
    kurz: 'Der Preis stimmt. Hier steht, was drinsteckt.',
    ton: 'ja',
    antwort: [
      'Wir reden den Preis nicht klein. Was du bezahlst, ist nicht das Gehäuse: Im Inneren sitzt der GitterChip aus einer eigens entwickelten 750er Goldlegierung, und die fünf Publikationen haben wir bezahlt. Ob dir das den Preis wert ist, entscheidest du und niemand sonst.',
      'Deshalb hängt an dieser Seite kein Kaufknopf, sondern ein Rückgaberecht: 20 Tage tragen, und wenn es nichts für dich ist, ohne Angabe von Gründen zurück.',
    ],
  },
  {
    id: 'K4',
    frage: 'Kann so etwas überhaupt plausibel sein?',
    kurz: 'Offen — und die Frage ist berechtigt.',
    ton: 'offen',
    antwort: [
      'Das ist keine Messfrage, sondern ein Bauchgefühl in Frageform — und wir halten das Bauchgefühl für berechtigt. Es klingt unwahrscheinlich. Es klang für uns auch unwahrscheinlich.',
      'Ein klinischer Wirknachweis am Menschen, der die Frage entscheiden würde, liegt nicht vor. Was es gibt, sind fünf Zellstudien und 171 Erfahrungsberichte — und die Prüfung an dir selbst: 20 Tage tragen, danach ohne Angabe von Gründen zurückschicken. Wenn nichts passiert, hast du deine Antwort.',
    ],
  },
  {
    id: 'K8',
    frage: 'Sind das von euch bezahlte Studien?',
    kurz: 'Ja. Wir haben sie finanziert und die Geräte gestellt.',
    ton: 'ja',
    antwort: [
      'Das steht auch in den Publikationen selbst. Es sind fünf, und alle fünf stammen von demselben Labor — dem Dartsch Scientific Institut von Prof. Dr. Peter C. Dartsch. Das ist bei Produktforschung üblich und macht Ergebnisse nicht falsch. Es heißt aber, dass eine unabhängige Wiederholung durch ein zweites Labor aussteht, und das ist die größte offene Stelle unserer Datenlage. Sie liegt bei uns.',
      'Was wir belegen können, ist Offenlegung: Auftraggeber, Labor, Methode, Fallzahlen und die Grenzen stehen in den Arbeiten und auf unseren Studienseiten. Was wir nicht belegen können, ist Unabhängigkeit — deshalb steht das Wort „unabhängig getestet" bei uns nirgends.',
    ],
  },
];

/**
 * Die vier Einräumungen. WORTGLEICH zu MmWirktDas.jsx GRENZEN 1–4 und zu
 * faq-seite.js — sie sind die Inhaltsgrenze dieser Seite, nicht ihre Rhetorik.
 * SIE WERDEN NICHT GEKÜRZT: beim Aufräumen der fremden Zitate darf die
 * Ehrlichkeit nicht mit verschwinden, das wäre der schlimmere Schaden.
 * @type {Array<{titel: string, text: string}>}
 */
export const EINRAEUMUNGEN = [
  {
    titel: 'Es gibt keine Studie am Menschen.',
    text: 'Keine einzige. Vier der fünf Arbeiten sind Zellkultur, die fünfte ist eine Sammlung von Erfahrungsberichten. Was im Labor an Zellen messbar ist, muss im Körper nicht passieren. Ein klinischer Wirknachweis am Menschen liegt nicht vor.',
  },
  {
    titel: 'Alle fünf Arbeiten stammen von demselben Labor.',
    text: 'Sie wurden von Prof. Dr. Peter C. Dartsch am Dartsch Scientific Institut durchgeführt. Ein einzelnes Labor, ein einzelner Autor.',
  },
  {
    titel: 'Wir haben sie bezahlt.',
    text: 'Die Geräte wurden vom Hersteller — von uns — zur Verfügung gestellt, die Untersuchungen von uns finanziert. Das ist bei Produktforschung üblich und macht Ergebnisse nicht falsch. Es heißt aber: eine unabhängige Wiederholung durch ein zweites Labor steht aus. Bis dahin ist das ein offener Punkt, und zwar unserer.',
  },
  {
    titel: 'Die Erklärung dahinter ist eine Hypothese.',
    text: 'Das Modell, mit dem die Publikationen den Effekt erklären, ist in der konventionellen Wissenschaft nicht etabliert. Die Arbeiten selbst kennzeichnen es als Hypothese. Die Messwerte hängen nicht von der Erklärung ab: Was in den Zellschalen passiert ist, ist gemessen worden — warum, ist offen.',
  },
];

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
      'Menschliche Immunzellen (HL-60) lagen vier Stunden unter Mobilfunkbelastung. Ihre Fähigkeit, Abwehr-Radikale zu bilden, sank auf 60,5 ± 3,9 Prozent der unbestrahlten Kontrolle. Lag ein QiOne 2 Pro daneben, blieben 84,7 ± 7,0 Prozent erhalten (p ≤ 0,01).',
    grenze:
      'In vitro, eine Zelllinie, drei unabhängige Experimente. Auf den lebenden Menschen ist das nicht übertragbar.',
    slug: 'studie-immunzellen',
  },
  {
    id: 'e0002',
    titel: 'Darmbarriere unter derselben Belastung',
    quelle: 'Applied Cell Biology 2021, 9(3): 69–74',
    befund:
      'Kultivierte Darmzellen (IPEC-J2). Der elektrische Widerstand der Zellbarriere brach ungeschützt auf etwa ein Zehntel ein. Geschützt lag er bei 1.837 ± 349 Ω/cm² gegenüber 2.542 ± 389 Ω/cm² bei völlig unbestrahlten Zellen.',
    grenze:
      'In vitro, Zellen vom Schwein, n = 3–4. Eine Übertragbarkeit auf den menschlichen Darm ist nicht belegt.',
    slug: 'studie-darmbarriere',
  },
  {
    id: 'e0003',
    titel: 'Oxidativer Stress',
    quelle: 'Applied Cell Biology 2024, 12(1): 1–6',
    befund:
      'Vier Zelllinien wurden mit Wasserstoffperoxid unter Stress gesetzt, einmal mit und einmal ohne QiBracelet.',
    grenze:
      'In vitro. Der Stressor ist ein chemisches Modell — die Arbeit untersucht ausdrücklich keinen Schutz vor Mobilfunk. Zum Zahlenwert der Vitalität widersprechen sich Abstract und Ergebnisteil des Originals; wir geben ihn deshalb nicht wieder.',
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
      'Kein Fragebogen, keine Kontrollgruppe, keine Verblindung. Auswahl- und Bestätigungsverzerrung sind nicht ausgeschlossen; ein Ursachenzusammenhang folgt daraus nicht.',
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
      'In vitro. Keine klinische Untersuchung am Menschen. Das verwendete Regenerationsmodell bildet nach Angabe der Publikation ausschließlich das periphere Nervensystem ab.',
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
export const STAERKEN = [
  {
    titel: 'Wir nennen unsere Grenzen selbst.',
    text: 'Alles, was auf dieser Seite gegen uns spricht, hat uns niemand abgerungen. Es steht hier, weil du es wissen sollst, bevor du dich entscheidest — und es steht wortgleich auf unseren Studienseiten.',
    beleg: 'Die vier Einräumungen auf dieser Seite, wortgleich auf /pages/studien.',
  },
  {
    titel: '20 Tage auf unsere Rechnung prüfen.',
    text: 'Trag es 20 Tage. Wenn es nichts für dich ist, schickst du es ohne Angabe von Gründen zurück. Das Risiko liegt bei uns, nicht bei dir.',
    beleg: 'Rückgaberecht, öffentlich nachlesbar.',
    pfad: '/pages/das-20-tage-versprechen',
    link: 'Wie die 20 Tage laufen',
  },
  {
    titel: 'Fünf veröffentlichte Arbeiten, im Original nachlesbar.',
    text: 'Jede mit Fachzeitschrift, Datum und Seitenzahl; vier davon liegen bei uns als Original-PDF. Dass alle fünf aus demselben Labor stammen, steht weiter oben — beides gehört nebeneinander, nicht nur das eine.',
    beleg: 'Die fünf Arbeiten mit Methode, Zahlen und PDF.',
    pfad: '/pages/studien',
    link: 'Alle fünf Arbeiten ansehen',
  },
  {
    titel: 'Ein benanntes Institut, ein benannter Wissenschaftler.',
    text: 'Prof. Dr. Peter C. Dartsch, Dartsch Scientific Institut. Kein anonymes Gutachten, kein Prüfsiegel ohne Absender — du kannst nachsehen, wer gemessen hat.',
    beleg: 'Autor und Institut stehen in jeder der fünf Publikationen.',
  },
  {
    titel: 'Ein eingetragenes Unternehmen mit Anschrift.',
    text: 'Handelsregister, ladungsfähige Anschrift, Menschen, die mit ihrem Namen dafür einstehen. Alles im Impressum, ohne Umweg und ohne Formular.',
    beleg: 'Impressum mit Handelsregisternummer und Anschrift.',
    pfad: '/pages/impressum',
    link: 'Impressum ansehen',
  },
  {
    titel: 'Erfahrungen, die du selbst nachprüfen kannst.',
    text: 'Menschen berichten unter eigenem Namen auf ihren eigenen Konten — nicht auf unseren. Das ist kein Beweis für eine Wirkung, und wir führen es auch nicht als einen. Es ist nachprüfbar, und das ist mehr, als eine anonyme Bewertung dir bietet.',
    beleg: 'Berichte auf den öffentlichen Konten der Menschen selbst.',
    pfad: '/pages/erfahrungen',
    link: 'Erfahrungen nachsehen',
  },
];
