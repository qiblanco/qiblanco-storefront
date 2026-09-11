/**
 * INHALTS-SSoT der Kritik-Fläche `/pages/kritik`.
 *
 * HERKUNFT DER VORWÜRFE — erhoben, nicht formuliert: die wörtlichen Zitate
 * stammen aus `shared-state/ads-manager/state/welle-f/KRITIK-BEHAUPTUNGEN.md`
 * (eigene Abrufe 2026-09-07, HTTP 200, Rohdokumente daneben abgelegt), von
 * Segment s04 des Grossjobs 20260907-GROSSJOB-erfahrungen-und-kritik-… gegen
 * die Rohabrufe nachgeprüft. DIESELBE Erhebung trägt die Einwandbehandlung der
 * Anzeigen. Wer hier einen Vorwurf umformuliert, ändert ihn für beide —
 * abweichende Antworten auf denselben Vorwurf wären schlimmer als keine.
 *
 * HERKUNFT DER ANTWORTEN — faktengegatet, nicht neu erfunden: jede Zahl kommt
 * aus `app/data/studien/e0001…e0005.json` (Feld `factGate` hält fest, welche
 * kursierenden Zahlen in der Primärquelle NICHT stehen; solche Zahlen sind hier
 * nicht verbaut). Die vier Einräumungen sind wortgleich zu
 * `MmWirktDas.jsx GRENZEN 1–4` und zu `faq-seite.js FAQ_BELEGE` — eine zweite
 * Fassung wäre eine zweite Wahrheit.
 *
 * WAS HIER BEWUSST FEHLT (benannt, nicht beispielhaft):
 *  · K7 aus der Erhebung — die Anführungszeichen um „Informationsseite" zu
 *    der in der Kritik verlinkten Fremddomäne zum Thema kohärentes Wasser.
 *    Das ist eine Tatsachenfrage über eine FREMDE Domain, für die im Haus
 *    KEIN Beleg der Betreiberschaft vorliegt. Eine
 *    Antwort in die eine oder andere Richtung wäre hier eine Behauptung ohne
 *    Grundlage. Der Punkt liegt als Entscheidung bei Christian, nicht auf
 *    dieser Seite.
 *  · Die 90-Minuten-Podcastfolge und das Video sind NICHT ausgewertet (der Ton
 *    ist aus diesem Rechenzentrum maschinell nicht abrufbar). Beantwortet wird
 *    ausschließlich, was auf den ABGERUFENEN Seiten steht — also das, was der
 *    Suchende gelesen hat.
 *
 * TEXTSORTE (Abgrenzungs-SSoT `konzepte/abgrenzung-flaechen.json`, Fläche
 * `kritik`): diese Seite trägt BEWEISFÜHRUNG. Keine Kundenstimme wird hier als
 * Beweis benutzt — das ist der Gegenstand von /pages/erfahrungen. Sobald hier
 * ein Erlebnis überzeugen soll statt eines Belegs, ist die Abgrenzung gebrochen.
 */

/** Die drei Urteilsstufen. Mehr gibt es nicht — ein Vorwurf, der keine dieser
 *  drei Antworten verträgt, gehört nicht auf diese Seite. */
export const URTEIL = {
  stimmt: {kuerzel: 'stimmt', text: 'Das stimmt.'},
  teilweise: {kuerzel: 'teilweise', text: 'Das stimmt zum Teil.'},
  falsch: {kuerzel: 'falsch', text: 'Das stimmt nicht.'},
};

/**
 * Die Vorwürfe in der Reihenfolge, in der ein Zweifelnder sie sortiert:
 * zuerst der harte Sachvorwurf, zuletzt der Ton.
 * @type {Array<{id: string, frage: string, woertlich: string, fundstelle: string,
 *   urteil: keyof typeof URTEIL, antwort: string[]}>}
 */
export const VORWUERFE = [
  {
    id: 'K2',
    frage: 'Gibt es für das Erklärungsmodell wissenschaftliche Belege?',
    woertlich:
      'Wissenschaftlich gibt es jedoch weder für die Struktur noch für eine Wirkung von hexagonalem Wasser irgendwelche haltbaren Belege.',
    fundstelle: 'quarks.de, Beitrag vom 27. Juni 2026',
    urteil: 'stimmt',
    antwort: [
      'Das ist der härteste Satz der ganzen Kritik, und er trifft. Das Modell, mit dem unsere Publikationen ihre Messwerte erklären — geordnetes Wasser — ist in der etablierten Wissenschaft nicht anerkannt. Die Arbeiten selbst führen es als Hypothese, nicht als gesicherte Erkenntnis. Wir bestreiten das nicht und haben es nie bestritten.',
      'Was wir dagegenhalten, ist kein Gegenargument, sondern eine Unterscheidung: Die Erklärung ist offen. Die Messung ist es nicht. Was in den Zellschalen passiert ist, wurde gemessen und veröffentlicht — warum es passiert ist, weiß niemand sicher, wir eingeschlossen. Beides auseinanderzuhalten ist der ehrlichste Umgang mit dieser Datenlage. Wer daraus schließt, dass deshalb auch die Messwerte nicht existieren, macht einen anderen Fehler als der, den er uns vorwirft.',
    ],
  },
  {
    id: 'K3',
    frage: 'Wurde das wirklich untersucht — oder nur „angeblich"?',
    woertlich:
      'Und trotzdem wurde die Wirkung des teuren Schmucks angeblich wissenschaftlich getestet und in Fachpublikationen bestätigt.',
    fundstelle: 'quarks.de, Beitrag vom 27. Juni 2026',
    urteil: 'falsch',
    antwort: [
      'Das Wort „angeblich" trägt hier den ganzen Vorwurf, und es ist das einzige, was daran nicht stimmt. Fünf Arbeiten sind erschienen, jede mit Fachzeitschrift, Datum und Seitenzahl; vier davon liegen bei uns im Original als PDF, und dieselbe Kritik verlinkt sie in ihrer eigenen Quellenliste. Die Studien werden dort also nicht übersehen — sie werden bestritten. Das ist ein Unterschied.',
      'Wie weit diese fünf Arbeiten tragen, steht weiter unten – mit ihren Grenzen, Punkt für Punkt. Aber „es gibt sie nicht" ist keine der Möglichkeiten. Du kannst sie im Original lesen, ohne uns ein Wort zu glauben.',
    ],
  },
  {
    id: 'K1',
    frage: 'Behauptet ihr, Strahlung abzuwehren?',
    woertlich:
      'Die Firma Qi Blanco behauptet, mit ihrem Schmuck könne man Strahlung abwehren und die Zellgesundheit fördern.',
    fundstelle: 'quarks.de, Beitrag vom 27. Juni 2026',
    urteil: 'teilweise',
    antwort: [
      'Der Satz gibt unsere Aussage verkürzt wieder, und der verkürzte Teil ist der wichtige. In unseren Produkten steckt keine Elektronik, kein Akku, keine Batterie. Es wird nichts gesendet und nichts abgeschirmt. Wer ein Messgerät danebenlegt, misst dieselbe Strahlung wie vorher — das haben wir nie anders gesagt.',
      'Untersucht wurde etwas anderes: nicht die Strahlung, sondern was Zellen unter Strahlung tun. In den Zellstudien lagen Zellkulturen vier Stunden unter Mobilfunkbelastung, einmal mit und einmal ohne Gerät daneben. Gemessen wurden die Zellen, nicht das Feld. „Strahlung abwehren" beschreibt das falsch, auch wenn es kürzer klingt.',
    ],
  },
  {
    id: 'K6',
    frage: 'Versprecht ihr, dass man damit zum „Superhuman" wird?',
    woertlich:
      'verwandelt gewöhnliches Wasser in angeblich kohärentes Wasser und macht euch damit zu nichts Geringerem als einem Superhuman',
    fundstelle: 'Podcast-Seite zur Folge vom 25. Januar 2025',
    urteil: 'falsch',
    antwort: [
      'Das haben wir nicht gesagt. Kein Text von uns verspricht das, und du wirst es auf keiner unserer Seiten finden. Der Satz übertreibt ein Versprechen ins Lächerliche, das in dieser Form nie gegeben wurde, und widerlegt danach die Übertreibung.',
      'Ein Wirknachweis am Menschen liegt nicht vor. Wir behaupten keinen Heileffekt, versprechen keine Heilung und raten niemandem, wegen uns eine Behandlung zu ändern. Untersucht sind Zellkulturen und eine Sammlung von Erfahrungsberichten — mehr steht in keinem unserer Texte.',
    ],
  },
  {
    id: 'K5',
    frage: 'Über 1000 Euro für ein Stück Edelstahl?',
    woertlich: 'der Schmuck für über 1000 Euro',
    fundstelle:
      'Podcast-Seite zur Folge vom 25. Januar 2025; die Materialfrage stammt aus einem Leserkommentar unter dem Beitrag',
    urteil: 'stimmt',
    antwort: [
      'Der Preis stimmt, und wir reden ihn nicht klein. Was du bezahlst, ist nicht das Gehäuse: Im Inneren sitzt der GitterChip aus einer eigens entwickelten 750er Goldlegierung, und die fünf Publikationen, um die hier gestritten wird, haben wir bezahlt. Ob dir das den Preis wert ist, entscheidest du und niemand sonst.',
      'Deshalb hängt an dieser Seite kein Kaufknopf, sondern ein Rückgaberecht: 20 Tage tragen, und wenn es nichts für dich ist, ohne Angabe von Gründen zurück.',
    ],
  },
  {
    id: 'K4',
    frage: 'Kann so etwas überhaupt plausibel sein?',
    woertlich:
      'Kann es überhaupt plausibel sein, dass das Tragen eines kleinen Schmuckstücks weitreichende Auswirkungen auf die Gesundheit hat?',
    fundstelle: 'quarks.de, Beitrag vom 27. Juni 2026',
    urteil: 'teilweise',
    antwort: [
      'Das ist keine Messfrage, sondern ein Bauchgefühl in Frageform — und wir halten das Bauchgefühl für berechtigt. Es klingt unwahrscheinlich. Es klang für uns auch unwahrscheinlich.',
      'Ein klinischer Wirknachweis am Menschen, der die Frage entscheiden würde, liegt nicht vor. Was es gibt, sind fünf Zellstudien und 171 Erfahrungsberichte — und die Prüfung an dir selbst: 20 Tage tragen, danach ohne Angabe von Gründen zurückschicken. Wenn nichts passiert, hast du deine Antwort.',
    ],
  },
  {
    id: 'K8',
    frage: 'Sind das nicht einfach von euch gekaufte Studien?',
    woertlich:
      'Die zwei studien die sie selbst finanziert haben sind aussagelos und unwissenschaftlich ausgeführt.',
    fundstelle: 'öffentliche Bewertung, Wortlaut unverändert',
    urteil: 'teilweise',
    antwort: [
      'Der erste Teil stimmt und steht auch in den Publikationen selbst: Wir haben die Untersuchungen finanziert und die Geräte gestellt. Es sind fünf, nicht zwei, und alle fünf stammen von demselben Labor — dem Dartsch Scientific Institut von Prof. Dr. Peter C. Dartsch. Das ist bei Produktforschung üblich und macht Ergebnisse nicht falsch. Es heißt aber, dass eine unabhängige Wiederholung durch ein zweites Labor aussteht, und das ist die größte offene Stelle unserer Datenlage. Sie liegt bei uns.',
      'Was wir belegen können, ist Offenlegung: Auftraggeber, Labor, Methode, Fallzahlen und die Grenzen stehen in den Arbeiten und auf unseren Studienseiten. Was wir nicht belegen können, ist Unabhängigkeit — deshalb steht das Wort „unabhängig getestet" bei uns nirgends. „Aussagelos" ist dagegen ein Urteil, kein Befund: Was gemessen wurde, ist nachlesbar; wie weit es trägt, siehst du unten.',
    ],
  },
];

/**
 * Die vier Einräumungen. WORTGLEICH zu MmWirktDas.jsx GRENZEN 1–4 und zu
 * faq-seite.js — sie sind die Inhaltsgrenze dieser Seite, nicht ihre Rhetorik.
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
