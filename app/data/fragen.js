/**
 * FRAGEN — je Frage eine Seite, die Frage ist die Ueberschrift und die Adresse.
 *
 * HERKUNFT: Grossjob 20260915-GEO-lexikon-frageseiten-und-ob-die-ki-uns-zitiert.
 * Die sechs Antworten schrieb Segment s05 (je Seite Antwort-zuerst, Beleg mit
 * Zahl, offene Stelle, Quellen mit geprüfter Identität); dieses Modul ist ihr
 * committeter Träger im Repo. Erzeugt aus inhalte/fragen/fragen.json — DIE
 * SCHLÜSSELNAMEN SIND ABSICHTLICH UNVERÄNDERT ÜBERNOMMEN. Jede Umbenennung
 * wäre eine Stelle, an der zwischen geschriebenem Inhalt und ausgelieferter
 * Seite etwas still verlorengeht.
 *
 * KEIN LOADER, KEIN FREMDER PFAD: Oxygen läuft am Edge und kann shared-state
 * zur Laufzeit NICHT lesen. Dieselbe Bauform wie app/data/lexikon.js,
 * app/data/kritik-vorwuerfe.js und app/data/hypothesen.js.
 *
 * DAS FELD `antwort` IST EIN VERTRAG, KEIN VORSPANN: GENAU EIN Satz, und er
 * steht auf der Seite vor der ersten Zwischenüberschrift. Ein Antwortsystem
 * schneidet Abschnitte und bewertet sie isoliert — eine Antwort hinter ihrer
 * Begründung wird mit abgeschnitten. Derselbe Satz trägt `acceptedAnswer` im
 * FAQPage-Schema; die Seite und ihr Markup sagen dasselbe, weil beide aus
 * diesem einen Feld kommen.
 *
 * DAS FELD `offen` IST DER WIRKMECHANISMUS und ist auf den Frageseiten, was
 * `grenze` im Lexikon ist. Ein Text, der benennt, was er nicht weiß, wird von
 * einem Antwortsystem als Quelle behandelt; ein Text, der alles beantwortet,
 * als Werbung. WER EINE FRAGE ERGÄNZT, GIBT IHR EIN `offen` — das ist keine
 * Bitte: test/fragen-vollstaendigkeit.test.mjs hält dagegen.
 *
 * @typedef {{slug: string, katalog_id: string|null, markt: string,
 *   klasse: string, frage: string, antwort: string,
 *   "begruendung": string[],
 *   beleg: string[], fundstellen?: string[], offen: string[],
 *   weiter: Array<{pfad: string, text: string}>, quellen: string[],
 *   pfad: string}} FrageSeite
 */

/**
 * Die Belege, auf die die Seiten über ihre Schlüssel zeigen.
 * Das Feld `"pruefung":` ist die Adresse, unter der s05 die Arbeit geprüft hat — sie kann
 * von `url` abweichen (Crossref statt Verlagsseite), weil mehrere Fachverlage
 * Bots mit HTTP 403 abweisen und ein 403 dort weder „tot" noch „lebend" heißt.
 * `identitaet` ist die Zeichenfolge, die im abgerufenen Titel stehen MUSS: ein
 * HTTP 200 mit fremdem Titel ist der teurere Fall und sieht wie ein lebender
 * Beleg aus (belegt an https://standards.ieee.org/ieee/299/5657/, das eine
 * Ethernet-Norm ausliefert).
 */
export const QUELLEN = {
  "astm_d4935": {
    "art": "norm",
    "zitat": "ASTM D4935-18: Standard Test Method for Measuring the Electromagnetic Shielding Effectiveness of Planar Materials",
    "url": "https://www.astm.org/d4935-18.html",
    "pruefung": "https://www.astm.org/d4935-18.html",
    "identitaet": "Shielding Effectiveness of Planar Materials"
  },
  "bfs_diskutiert": {
    "art": "behoerde",
    "zitat": "Bundesamt für Strahlenschutz: Wissenschaftlich diskutierte biologische und gesundheitliche Wirkungen hochfrequenter Felder",
    "url": "https://www.bfs.de/DE/themen/emf/hff/wirkung/hff-diskutiert/hff-diskutiert.html",
    "pruefung": "https://www.bfs.de/DE/themen/emf/hff/wirkung/hff-diskutiert/hff-diskutiert.html",
    "identitaet": "Diskutierte Wirkungen"
  },
  "bfs_grenzwerte": {
    "art": "behoerde",
    "zitat": "Bundesamt für Strahlenschutz: Grenzwerte beim Mobilfunk",
    "url": "https://www.bfs.de/DE/themen/emf/mobilfunk/vorsorge/recht/grenzwerte.html",
    "pruefung": "https://www.bfs.de/DE/themen/emf/mobilfunk/vorsorge/recht/grenzwerte.html",
    "identitaet": "Grenzwerte beim Mobilfunk"
  },
  "bfs_haushalt": {
    "art": "behoerde",
    "zitat": "Bundesamt für Strahlenschutz: Haushaltsgeräte und Elektroinstallationen, mit der Tabelle magnetischer Flussdichten nach Abstand",
    "url": "https://www.bfs.de/DE/themen/emf/nff/anwendung/haushalt-elektro/haushalt-elektro.html",
    "pruefung": "https://www.bfs.de/DE/themen/emf/nff/anwendung/haushalt-elektro/haushalt-elektro.html",
    "identitaet": "Haushaltsgeräte und Elektroinstallationen"
  },
  "bfs_hff": {
    "art": "behoerde",
    "zitat": "Bundesamt für Strahlenschutz: Hochfrequente elektromagnetische Felder, Einführung",
    "url": "https://www.bfs.de/DE/themen/emf/mobilfunk/basiswissen/einfuehrung/einfuehrung.html",
    "pruefung": "https://www.bfs.de/DE/themen/emf/mobilfunk/basiswissen/einfuehrung/einfuehrung.html",
    "identitaet": "Hochfrequente elektromagnetische Felder"
  },
  "bfs_schutzprodukte": {
    "art": "behoerde",
    "zitat": "Bundesamt für Strahlenschutz: Sogenannte „Schutzprodukte gegen Elektrosmog“ sind unnötig",
    "url": "https://www.bfs.de/DE/themen/emf/kompetenzzentrum/berichte/berichte-emf/anti-emf-produkte.html",
    "pruefung": "https://www.bfs.de/DE/themen/emf/kompetenzzentrum/berichte/berichte-emf/anti-emf-produkte.html",
    "identitaet": "Schutzprodukte gegen Elektrosmog"
  },
  "bimschv26": {
    "art": "norm",
    "zitat": "26. Verordnung zur Durchführung des Bundes-Immissionsschutzgesetzes, 26. BImSchV",
    "url": "https://www.gesetze-im-internet.de/bimschv_26/",
    "pruefung": "https://www.gesetze-im-internet.de/bimschv_26/",
    "identitaet": "BImSchV"
  },
  "bosch2024": {
    "art": "fachliteratur",
    "zitat": "Bosch-Capblanch X., Esu E., Oringanje C. M. u. a.: The effects of radiofrequency electromagnetic fields exposure on human self-reported symptoms, Environment International 187, 2024, doi:10.1016/j.envint.2024.108612",
    "url": "https://doi.org/10.1016/j.envint.2024.108612",
    "pruefung": "https://api.crossref.org/works/10.1016/j.envint.2024.108612",
    "identitaet": "self-reported symptoms"
  },
  "carter2016": {
    "art": "fachliteratur",
    "zitat": "Carter B., Rees P., Hale L. u. a.: Association Between Portable Screen-Based Media Device Access or Use and Sleep Outcomes, JAMA Pediatrics 170, 2016, doi:10.1001/jamapediatrics.2016.2341",
    "url": "https://doi.org/10.1001/jamapediatrics.2016.2341",
    "pruefung": "https://api.crossref.org/works/10.1001/jamapediatrics.2016.2341",
    "identitaet": "Portable Screen-Based Media Device"
  },
  "chang2015": {
    "art": "fachliteratur",
    "zitat": "Chang A.-M., Aeschbach D., Duffy J. F., Czeisler C. A.: Evening use of light-emitting eReaders negatively affects sleep, circadian timing, and next-morning alertness, PNAS 112, 2015, doi:10.1073/pnas.1418490112",
    "url": "https://doi.org/10.1073/pnas.1418490112",
    "pruefung": "https://api.crossref.org/works/10.1073/pnas.1418490112",
    "identitaet": "light-emitting eReaders"
  },
  "cosmos2024": {
    "art": "fachliteratur",
    "zitat": "Feychting M., Schüz J., Toledano M. B. u. a.: Mobile phone use and brain tumour risk, COSMOS, a prospective cohort study, Environment International 185, 2024, doi:10.1016/j.envint.2024.108552",
    "url": "https://doi.org/10.1016/j.envint.2024.108552",
    "pruefung": "https://api.crossref.org/works/10.1016/j.envint.2024.108552",
    "identitaet": "COSMOS"
  },
  "danker_hopfe2010": {
    "art": "fachliteratur",
    "zitat": "Danker-Hopfe H., Dorn H., Bornkessel C. u. a.: Do mobile phone base stations affect sleep of residents, American Journal of Human Biology 22, 2010, doi:10.1002/ajhb.21053",
    "url": "https://doi.org/10.1002/ajhb.21053",
    "pruefung": "https://api.crossref.org/works/10.1002/ajhb.21053",
    "identitaet": "Do mobile phone base stations affect sleep of residents"
  },
  "icnirp2020": {
    "art": "norm",
    "zitat": "ICNIRP: Guidelines for Limiting Exposure to Electromagnetic Fields, 100 kHz bis 300 GHz, Health Physics 118, 2020, doi:10.1097/HP.0000000000001210",
    "url": "https://www.icnirp.org/en/publications/article/rf-guidelines-2020.html",
    "pruefung": "https://api.crossref.org/works/10.1097/HP.0000000000001210",
    "identitaet": "Guidelines for Limiting Exposure to Electromagnetic Fields"
  },
  "openstax_energie": {
    "art": "lehrbuch",
    "zitat": "OpenStax, University Physics Volume 2, Kapitel 16.3: Energy Carried by Electromagnetic Waves",
    "url": "https://openstax.org/books/university-physics-volume-2/pages/16-3-energy-carried-by-electromagnetic-waves",
    "pruefung": "https://openstax.org/books/university-physics-volume-2/pages/16-3-energy-carried-by-electromagnetic-waves",
    "identitaet": "Energy Carried by Electromagnetic Waves"
  },
  "openstax_leiter": {
    "art": "lehrbuch",
    "zitat": "OpenStax, University Physics Volume 2, Kapitel 6.4: Conductors in Electrostatic Equilibrium",
    "url": "https://openstax.org/books/university-physics-volume-2/pages/6-4-conductors-in-electrostatic-equilibrium",
    "pruefung": "https://openstax.org/books/university-physics-volume-2/pages/6-4-conductors-in-electrostatic-equilibrium",
    "identitaet": "Conductors in Electrostatic Equilibrium"
  },
  "pophof2024": {
    "art": "fachliteratur",
    "zitat": "Pophof B., Kuhne J., Schmid G. u. a.: The effect of exposure to radiofrequency electromagnetic fields on cognitive performance in human experimental studies, Environment International 191, 2024, doi:10.1016/j.envint.2024.108899",
    "url": "https://doi.org/10.1016/j.envint.2024.108899",
    "pruefung": "https://api.crossref.org/works/10.1016/j.envint.2024.108899",
    "identitaet": "cognitive performance"
  },
  "qb_faq": {
    "art": "eigen",
    "zitat": "Qi Blanco: häufige Fragen",
    "url": "https://qiblanco.com/pages/faq",
    "pruefung": "https://qiblanco.com/pages/faq",
    "identitaet": "Häufige Fragen"
  },
  "qb_hypothesen": {
    "art": "eigen",
    "zitat": "Qi Blanco: unsere Hypothesen, das Wirkmodell mit Stärken und Schwächen",
    "url": "https://qiblanco.com/pages/hypothesen",
    "pruefung": "https://qiblanco.com/pages/hypothesen",
    "identitaet": "unsere Hypothesen"
  },
  "qb_impressum": {
    "art": "eigen",
    "zitat": "Qi Blanco: Impressum mit Handelsregister und Umsatzsteuer-Identifikationsnummer",
    "url": "https://qiblanco.com/pages/impressum",
    "pruefung": "https://qiblanco.com/pages/impressum",
    "identitaet": "Impressum"
  },
  "qb_kritik": {
    "art": "eigen",
    "zitat": "Qi Blanco: Kritik, was belegt ist und was nicht",
    "url": "https://qiblanco.com/pages/kritik",
    "pruefung": "https://qiblanco.com/pages/kritik",
    "identitaet": "Qi Blanco Kritik"
  },
  "qb_quellen": {
    "art": "eigen",
    "zitat": "Qi Blanco: Quellen, alle Arbeiten, auf die wir uns berufen",
    "url": "https://qiblanco.com/pages/quellen",
    "pruefung": "https://qiblanco.com/pages/quellen",
    "identitaet": "Quellen"
  },
  "qb_studie_darm": {
    "art": "eigen",
    "zitat": "Qi Blanco: Studie zur Darmbarriere, Applied Cell Biology 2021, 9 Heft 3, Seite 69 bis 74",
    "url": "https://qiblanco.com/pages/studie-darmbarriere",
    "pruefung": "https://qiblanco.com/pages/studie-darmbarriere",
    "identitaet": "Darmbarriere"
  },
  "qb_studie_immun": {
    "art": "eigen",
    "zitat": "Qi Blanco: Studie zu Immunzellen unter Mobilfunkbelastung, Japan Journal of Medicine 2021, 4 Heft 1, Seite 484 bis 488",
    "url": "https://qiblanco.com/pages/studie-immunzellen",
    "pruefung": "https://qiblanco.com/pages/studie-immunzellen",
    "identitaet": "Immunzellen"
  },
  "qb_studie_nutzer": {
    "art": "eigen",
    "zitat": "Qi Blanco: Auswertung von 171 Anwenderberichten, Advances in Bioengineering & Biomedical Science Research 2024, 7 Heft 3, Seite 01 bis 04",
    "url": "https://qiblanco.com/pages/studie-nutzererfahrung",
    "pruefung": "https://qiblanco.com/pages/studie-nutzererfahrung",
    "identitaet": "Nutzererfahrungen"
  },
  "qb_studie_oxstress": {
    "art": "eigen",
    "zitat": "Qi Blanco: Studie zu oxidativem Stress, Applied Cell Biology 2024, 12 Heft 1, Seite 1 bis 6",
    "url": "https://qiblanco.com/pages/studie-oxidativer-stress",
    "pruefung": "https://qiblanco.com/pages/studie-oxidativer-stress",
    "identitaet": "oxidativen Stress"
  },
  "qb_studie_qihome": {
    "art": "eigen",
    "zitat": "Qi Blanco: Studie zu neuronalen Zellen, Neurodegenerative Diseases Current Research 2026, 6 Heft 1, Seite 1 bis 8",
    "url": "https://qiblanco.com/pages/studie-qihome-air",
    "pruefung": "https://qiblanco.com/pages/studie-qihome-air",
    "identitaet": "QiHome"
  },
  "qb_studien": {
    "art": "eigen",
    "zitat": "Qi Blanco: die fünf veröffentlichten Arbeiten im Original",
    "url": "https://qiblanco.com/pages/studien",
    "pruefung": "https://qiblanco.com/pages/studien",
    "identitaet": "Wissenschaftliche Studien"
  },
  "qb_superhuman": {
    "art": "eigen",
    "zitat": "Qi Blanco: Superhuman, das Kursangebot in fünf Stufen",
    "url": "https://qiblanco.com/pages/superhuman",
    "pruefung": "https://qiblanco.com/pages/superhuman",
    "identitaet": "Superhuman"
  },
  "qb_widerruf": {
    "art": "eigen",
    "zitat": "Qi Blanco: Widerrufsbelehrung nach § 7 der Rückerstattungsrichtlinie",
    "url": "https://qiblanco.com/policies/refund-policy",
    "pruefung": "https://qiblanco.com/policies/refund-policy",
    "identitaet": "Rückerstattungsrichtlinie"
  },
  "quarks96": {
    "art": "kritik",
    "zitat": "Quarks Science Cops, Folge 96: Abzocke mit Energie-Schmuck, Der Fall Qi Blanco, von Jonathan Focke und Maximilian Doeckel, 25. Januar 2025",
    "url": "https://www.quarks.de/podcast/qi-blanco-science-cops-quarks/",
    "pruefung": "https://www.quarks.de/podcast/qi-blanco-science-cops-quarks/",
    "identitaet": "Die Akte Qi Blanco"
  },
  "rubin2005": {
    "art": "fachliteratur",
    "zitat": "Rubin G. J., Das Munshi J., Wessely S.: Electromagnetic Hypersensitivity, a Systematic Review of Provocation Studies, Psychosomatic Medicine 67, 2005, doi:10.1097/01.psy.0000155664.13300.64",
    "url": "https://doi.org/10.1097/01.psy.0000155664.13300.64",
    "pruefung": "https://api.crossref.org/works/10.1097/01.psy.0000155664.13300.64",
    "identitaet": "Electromagnetic Hypersensitivity"
  },
  "who_emf": {
    "art": "behoerde",
    "zitat": "Weltgesundheitsorganisation: The International EMF Project",
    "url": "https://www.who.int/initiatives/the-international-emf-project",
    "pruefung": "https://www.who.int/initiatives/the-international-emf-project",
    "identitaet": "International EMF Project"
  }
};

/** @type {FrageSeite[]} */
export const FRAGEN = [
  {
    "slug": "kann-elektrosmog-den-schlaf-stoeren",
    "katalog_id": "dach-schlaf",
    "markt": "dach",
    "klasse": "neugier",
    "frage": "Kann Elektrosmog den Schlaf stören?",
    "antwort": "Gemessen stört das Gerät im Schlafzimmer den Schlaf, sein elektromagnetisches Feld dagegen nicht.",
    "begruendung": [
      "Die Frage lässt sich in zwei Hälften teilen, und genau so haben Forscher sie untersucht. Auf der einen Seite steht das Feld einer Mobilfunkanlage oder eines Routers. Auf der anderen steht alles, was mit dem Gerät ins Zimmer kommt: Licht am Abend, Erreichbarkeit und der Griff zum Bildschirm kurz vor dem Einschlafen.",
      "Für das Feld allein fallen die Ergebnisse eindeutig aus. Für das Gerät fallen sie ebenso eindeutig aus, und sie zeigen in die andere Richtung.",
      "Eine dritte Größe wirkt messbar mit, und sie wird selten genannt: die Sorge selbst. In einer Feldstudie schliefen besorgte Anwohner schlechter als unbesorgte, und zwar in den Nächten, in denen die Versuchsanlage gar nicht sendete. Das macht die Beschwerden nicht eingebildet. Wer schlecht geschlafen hat, hat schlecht geschlafen, unabhängig davon, was ihn wach gehalten hat.",
      "Für den eigenen Schlaf folgt daraus ein praktischer Hebel. Abstand, Flugmodus und Dunkelheit sind sofort wirksam, kosten nichts und brauchen kein Produkt."
    ],
    "beleg": [
      "397 Anwohner zwischen 18 und 81 Jahren schliefen zwölf Nächte lang an zehn deutschen Orten ohne Mobilfunkversorgung. Eine Versuchs-Basisstation sendete in fünf Nächten echte GSM-Signale bei 900 und 1800 Megahertz und in fünf Nächten nichts. Weder die aufgezeichneten Schlafdaten noch die Selbsteinschätzung unterschieden sich zwischen beiden Bedingungen. In den Nächten ohne Feld schliefen die Teilnehmer, die sich um die Anlage sorgten, messbar schlechter als die Unbesorgten.",
      "Eine systematische Übersicht im Auftrag der Weltgesundheitsorganisation fasste 2024 41 Experimente mit 2874 Teilnehmern zusammen. Für Schlafstörungen lag der zusammengefasste Effekt bei Kopfexposition bei minus 0,01 mit einem Vertrauensbereich von minus 0,22 bis 0,20. Bei Ganzkörperexposition lag er bei 0,00 mit minus 0,15 bis 0,15. Die Teilnehmer konnten außerdem nicht erkennen, ob das Feld an oder aus war.",
      "Für das Gerät sieht die Zahlenlage anders aus. Eine Zusammenfassung von 20 Studien mit 125 198 Kindern und Jugendlichen fand für den Gebrauch eines Bildschirmgeräts zur Schlafenszeit ein Chancenverhältnis von 2,17 für zu wenig Schlaf, mit einem Vertrauensbereich von 1,42 bis 3,32. Diese Arbeit schloss Studien zu elektromagnetischer Strahlung von vornherein aus ihrer Auswahl aus.",
      "Das Licht ist der am besten untersuchte Weg. Wer vier Stunden vor dem Schlafengehen auf einem selbstleuchtenden Lesegerät liest statt auf Papier, braucht länger zum Einschlafen, schüttet abends weniger Melatonin aus, verschiebt seine innere Uhr nach hinten und ist am nächsten Morgen weniger wach.",
      "Das Bundesamt für Strahlenschutz fasst den Stand in einem Satz: weder in Experimenten an Testpersonen noch in Beobachtungsstudien an Menschen konnte ein Zusammenhang zwischen hochfrequenten Feldern von Mobiltelefonen oder Mobilfunkbasisstationen und Schlafstörungen nachgewiesen werden.",
      "31 Experimente mit 725 Menschen, die sich selbst als elektrosensibel bezeichnen, prüften unter Verblindung, ob jemand ein Feld erkennen kann. 24 der 31 fanden keinen Hinweis darauf. Dieselbe Übersicht hält fest, dass die Beschwerden schwer und manchmal behindernd sind."
    ],
    "offen": [
      "Die Zahlen oben sind Durchschnitte über viele Menschen. Ob ein einzelner Mensch anders reagiert, beantwortet ein Durchschnitt nicht.",
      "Langzeitwirkungen über Jahrzehnte sind für die neueren Mobilfunkfrequenzen noch nicht messbar, weil diese Frequenzen noch nicht lange genug in Gebrauch sind.",
      "Zu unseren eigenen Produkten liegt keine Untersuchung zum Schlaf vor. Was Menschen uns darüber schreiben, sind Berichte und keine Messung."
    ],
    "weiter": [
      {
        "pfad": "/pages/lexikon-elektrosmog",
        "text": "Elektrosmog: was das Wort umfasst und warum es keine einzelne Messgröße gibt"
      },
      {
        "pfad": "/pages/lexikon-frequenz",
        "text": "Frequenz: die Größe, in der Felder unterschieden werden"
      },
      {
        "pfad": "/pages/lexikon-energie",
        "text": "Energie: wo der Alltagsgebrauch und die physikalische Größe auseinandergehen"
      },
      {
        "pfad": "/pages/kritik",
        "text": "Was bei uns belegt ist und was nicht"
      }
    ],
    "quellen": [
      "danker_hopfe2010",
      "bosch2024",
      "carter2016",
      "chang2015",
      "bfs_diskutiert",
      "rubin2005",
      "bfs_hff",
      "who_emf",
      "qb_kritik"
    ],
    "pfad": "/pages/kann-elektrosmog-den-schlaf-stoeren"
  },
  {
    "slug": "wie-funktioniert-schutz-vor-elektrosmog",
    "katalog_id": "dach-mechanismus",
    "markt": "dach",
    "klasse": "neugier",
    "frage": "Wie funktioniert ein Schutz gegen Elektrosmog am Körper?",
    "antwort": "Physikalisch gibt es genau drei Wege, ein elektromagnetisches Feld am Körper kleiner zu machen: mehr Abstand, eine leitfähige Hülle, oder die Quelle abschalten.",
    "begruendung": [
      "Abstand ist der stärkste der drei Wege und der billigste. Die Feldstärke fällt mit jedem Zentimeter Entfernung erheblich, und schon wenige Zentimeter verändern die Größenordnung.",
      "Eine leitfähige Hülle schirmt ab, solange sie etwas umschließt. Das Prinzip heißt Faraday-Käfig: im Inneren eines geschlossenen Leiters bleibt kein elektrisches Feld übrig. Wie gut ein Material das kann, wird in Dezibel gemessen, nach einem festgelegten Prüfverfahren. Eine Hülle, die nichts umschließt, schirmt nichts ab. Ein Anhänger von drei Zentimetern Durchmesser umschließt keinen Menschen.",
      "Die Quelle abzuschalten wirkt sofort. Den größten Teil der Belastung am eigenen Körper erzeugen die eigenen Geräte, nicht die Anlage auf dem Nachbardach.",
      "Abschirmung kann die Belastung sogar erhöhen. Ein Mobiltelefon regelt seine Sendeleistung nach dem Empfang und sendet bei schlechtem Empfang stärker. Wer einen Aufkleber über die Antenne klebt, verschlechtert den Empfang und erhöht damit die Sendeleistung.",
      "Für tragbare Produkte dieser Klasse ist die Einordnung der Behörde eindeutig, und sie nennt die Bauformen beim Namen. Anhänger, Ketten, Armbänder, Mineralien und Chipkarten haben nach Einschätzung des Bundesamts für Strahlenschutz keine wissenschaftlich nachweisbare Wirkung auf die Felder oder den Körper, weil sie technisch funktionslos sind.",
      "Für unsere eigenen Produkte gilt derselbe Satz, und wir schreiben ihn selbst hin. Ein QiOne 2 Pro enthält weder Elektronik noch eine Stromquelle. Er sendet nicht, und er schirmt nicht ab. Ein Messgerät neben ihm zeigt denselben Wert an wie ohne ihn.",
      "Unsere Publikationen messen eine andere Größe. Untersucht wurde, was Zellkulturen unter Mobilfunkbelastung tun, nicht was das Feld tut. Das ist eine Unterscheidung und kein Gegenargument."
    ],
    "beleg": [
      "Zum Abstand liegen Messwerte einer Behörde vor. Ein Haarföhn erzeugt in drei Zentimetern Entfernung zwischen 6 und 2000 Mikrotesla; in einem Meter Entfernung sind davon 0,01 bis 0,3 Mikrotesla übrig. Ein Staubsauger liegt bei 200 bis 800 Mikrotesla in drei Zentimetern und bei 0,13 bis 2 Mikrotesla in einem Meter. Der empfohlene Referenzwert für das Magnetfeld liegt bei 100 Mikrotesla und wird in 30 Zentimetern Abstand von den meisten Geräten deutlich unterschritten.",
      "Zur Abschirmung gibt es ein genormtes Prüfverfahren. ASTM D4935 misst die Schirmdämpfung flacher Materialien; das Ergebnis ist eine Zahl in Dezibel und keine Eigenschaft eines Schmuckstücks.",
      "Die Grenzwerte stehen in der 26. Verordnung zum Bundes-Immissionsschutzgesetz und sind frequenzabhängig. Für GSM um 900 Megahertz gelten 41 Volt pro Meter, für 1800 Megahertz 58 Volt pro Meter, für 5G um 2000 und um 3600 Megahertz je 61 Volt pro Meter. Als Leistungsdichte entspricht das etwa 4,5 Watt pro Quadratmeter bei 900 Megahertz und 9 Watt pro Quadratmeter bei 1800 Megahertz.",
      "Was in unseren Zellstudien gemessen wurde, steht mit Zahl und Grenze in den Publikationen. Immunzellen der menschlichen Linie HL-60 verbrachten vier Stunden im Mobilfunkfeld; die Bildung ihrer Abwehr-Radikale fiel auf 60,5 plus minus 3,9 Prozent der unbestrahlten Kontrolle, und mit einem QiOne 2 Pro daneben blieben 84,7 plus minus 7,0 Prozent erhalten, bei p kleiner gleich 0,01. Bei kultivierten Darmzellen der Linie IPEC-J2 lag der elektrische Widerstand der Barriere geschützt bei 1837 plus minus 349 Ohm je Quadratzentimeter gegenüber 2542 plus minus 389 Ohm je Quadratzentimeter bei völlig unbestrahlten Zellen.",
      "Die Grenze dieser Zahlen steht in den Arbeiten selbst: in vitro, einzelne Zelllinien, drei bis vier unabhängige Ansätze. Eine Übertragung auf den lebenden Organismus folgt daraus nicht."
    ],
    "offen": [
      "Warum die Zellen in den Schalen sich so verhalten haben, ist offen. Unsere Publikationen führen ihr Erklärungsmodell selbst als Hypothese und nicht als gesicherte Erkenntnis.",
      "Ein Wirknachweis am Menschen liegt nicht vor, für unsere Produkte nicht und für die Produktklasse insgesamt nicht.",
      "Eine Wiederholung unserer Messungen durch ein zweites, unbeteiligtes Labor steht aus."
    ],
    "weiter": [
      {
        "pfad": "/pages/lexikon-elektrosmog",
        "text": "Elektrosmog: was das Wort umfasst und warum es keine einzelne Messgröße gibt"
      },
      {
        "pfad": "/pages/lexikon-frequenz",
        "text": "Frequenz: die Größe, in der Felder unterschieden werden"
      },
      {
        "pfad": "/pages/lexikon-ordnung",
        "text": "Ordnung: was der Begriff physikalisch bedeutet"
      },
      {
        "pfad": "/pages/lexikon-kohaerentes-wasser",
        "text": "Kohärentes Wasser: der Begriff aus unserem Erklärungsmodell, mit seiner Grenze"
      },
      {
        "pfad": "/pages/hypothesen",
        "text": "Unser Wirkmodell mit Stärken und Schwächen"
      },
      {
        "pfad": "/pages/studien",
        "text": "Die fünf Arbeiten im Original"
      }
    ],
    "quellen": [
      "bfs_schutzprodukte",
      "bfs_haushalt",
      "bfs_grenzwerte",
      "bimschv26",
      "icnirp2020",
      "astm_d4935",
      "openstax_leiter",
      "openstax_energie",
      "qb_kritik",
      "qb_hypothesen",
      "qb_studie_immun",
      "qb_studie_darm"
    ],
    "pfad": "/pages/wie-funktioniert-schutz-vor-elektrosmog"
  },
  {
    "slug": "gibt-es-studien-zu-elektrosmog-schutz",
    "katalog_id": "dach-studien",
    "markt": "dach",
    "klasse": "einwand",
    "frage": "Gibt es unabhängige Studien zu Elektrosmog-Schutzprodukten?",
    "antwort": "Nein, für diese Produktklasse gibt es keine unabhängige Wirksamkeitsstudie, und für unsere Produkte gibt es sie auch nicht.",
    "begruendung": [
      "Die Frage hat zwei Hälften, und sie werden oft vermischt. Zu den elektromagnetischen Feldern selbst gibt es sehr viel unabhängige Forschung, finanziert von Behörden und internationalen Organisationen. Zu den Produkten, die vor diesen Feldern schützen sollen, gibt es fast nichts.",
      "Unabhängig heißt vier Dinge zugleich: ein anderes Labor als der Hersteller, kein Geld vom Hersteller, ein vorab festgelegter Auswertungsplan, und Prüfer, die nicht wissen, welche Gruppe welches Produkt hatte. Fehlt eines davon, ist die Arbeit nicht unabhängig.",
      "Für unsere Produkte sind fünf Arbeiten veröffentlicht, und keine davon erfüllt diese vier Bedingungen. Durchgeführt hat sie alle ein einziger Wissenschaftler, Prof. Dr. Peter C. Dartsch, an seinem eigenen Institut. Die Aufträge, die Rechnungen und die Prüfgeräte kamen von uns. In der Produktforschung ist diese Konstellation der Normalfall, und sie entwertet keinen einzelnen Messwert. Sie lässt die Wiederholung durch ein zweites Haus offen.",
      "Vier dieser Arbeiten sind Laborversuche an Zellkulturen. Die fünfte beschreibt 171 öffentlich gepostete Beobachtungen von Anwendern; eine Kontrollgruppe fehlt, eine Verblindung ebenfalls. Am Menschen ist keine kontrollierte Untersuchung durchgeführt worden.",
      "Für die Produktklasse insgesamt liegt eine behördliche Bewertung vor, und sie fällt ablehnend aus. Das Bundesamt für Strahlenschutz hält sogenannte Schutzprodukte gegen Elektrosmog für unnötig oder ungeeignet und nennt Anhänger, Ketten und Armbänder technisch funktionslos.",
      "Dieselbe Bewertung nennt ein zweites Muster: Hersteller entziehen ihren Produkten im Kleingedruckten oft die vorher beworbene Wirkung. Bei uns stehen die Einschränkungen in der Überschrift der Kritikseite und in der Antwort auf die häufigste Frage, nicht in einer Fußnote."
    ],
    "beleg": [
      "Vier der fünf liegen bei uns als Original-PDF, mit Methode, Fallzahl und der Grenze, die die Autoren selbst nennen.",
      "Zur Gegenseite, also zu den Feldern selbst, gibt es große unabhängige Arbeiten. Die Kohortenstudie COSMOS verfolgte über 260 000 Menschen und fand im ersten Nachbeobachtungszeitraum keinen Zusammenhang zwischen Dauer oder Intensität der Handynutzung und Hirntumoren. Eine systematische Übersicht im Auftrag der Weltgesundheitsorganisation fasste 41 Experimente mit 2874 Teilnehmern zu selbstberichteten Beschwerden zusammen und fand keine oder kleine, nicht signifikante Effekte. Eine zweite Übersicht derselben Reihe untersuchte die kognitive Leistungsfähigkeit.",
      "Die Internationale Krebsforschungsagentur der Weltgesundheitsorganisation stuft hochfrequente elektromagnetische Felder seit 2011 als möglicherweise krebserregend ein. Diese Einstufung beschreibt die Beweislage und nicht die Höhe eines Risikos; sie bezieht sich auf Tumoren im Kopfbereich und auf die Nutzung von Endgeräten."
    ],
    "fundstellen": [
      "Abwehr-Radikale in Immunzellen, Japan Journal of Medicine 2021, Band 4 Heft 1, Seite 484 bis 488",
      "Elektrischer Widerstand einer Darmzellbarriere, Applied Cell Biology 2021, Band 9 Heft 3, Seite 69 bis 74",
      "Oxidativer Stress in vier Zelllinien, Applied Cell Biology 2024, Band 12 Heft 1, Seite 1 bis 6",
      "171 Anwenderberichte, Advances in Bioengineering & Biomedical Science Research 2024, Band 7 Heft 3, Seite 01 bis 04",
      "Nervenzellen und entzündungsvermittelnde Zellen, Neurodegenerative Diseases Current Research 2026, Band 6 Heft 1, Seite 1 bis 8"
    ],
    "offen": [
      "Eine Wiederholung unserer Messungen durch ein zweites, unbeteiligtes Labor steht aus. Wie sie ausgehen würde, können wir nicht sagen.",
      "Am Menschen fehlt der klinische Wirknachweis vollständig.",
      "Unser Erklärungsmodell hat in der etablierten Wissenschaft keine Anerkennung. Die Publikationen selbst führen es als Hypothese und nicht als gesicherte Erkenntnis."
    ],
    "weiter": [
      {
        "pfad": "/pages/lexikon-kohaerentes-wasser",
        "text": "Kohärentes Wasser: der Begriff aus unserem Erklärungsmodell, mit seiner Grenze"
      },
      {
        "pfad": "/pages/lexikon-ordnung",
        "text": "Ordnung: was der Begriff physikalisch bedeutet"
      },
      {
        "pfad": "/pages/lexikon-elektrosmog",
        "text": "Elektrosmog: was das Wort umfasst und warum es keine einzelne Messgröße gibt"
      },
      {
        "pfad": "/pages/studien",
        "text": "Die fünf Arbeiten im Original"
      },
      {
        "pfad": "/pages/quellen",
        "text": "Alle Arbeiten, auf die wir uns berufen"
      },
      {
        "pfad": "/pages/kritik",
        "text": "Was bei uns belegt ist und was nicht"
      }
    ],
    "quellen": [
      "bfs_schutzprodukte",
      "cosmos2024",
      "bosch2024",
      "pophof2024",
      "bfs_diskutiert",
      "who_emf",
      "qb_studien",
      "qb_quellen",
      "qb_kritik",
      "qb_studie_immun",
      "qb_studie_darm",
      "qb_studie_oxstress",
      "qb_studie_nutzer",
      "qb_studie_qihome"
    ],
    "pfad": "/pages/gibt-es-studien-zu-elektrosmog-schutz"
  },
  {
    "slug": "ist-qi-blanco-serioes",
    "katalog_id": "dach-marke-seriositaet",
    "markt": "dach",
    "klasse": "marke",
    "frage": "Ist Qi Blanco seriös?",
    "antwort": "Nachprüfbar sind vier Dinge, und sie liegen alle offen: Handelsregistereintrag, fünf Publikationen im Original, ein namentlich benanntes Labor und eine Rückgabefrist über die gesetzliche hinaus.",
    "begruendung": [
      "Seriös und wirksam sind zwei verschiedene Fragen. Die erste fragt, ob jemand sagt, wer er ist, was er gemessen hat und wo die Grenzen liegen. Die zweite fragt, ob das Produkt tut, was es soll. Die erste Frage lässt sich an Dokumenten prüfen, die zweite nur an Studien.",
      "Das Unternehmen: Qi Blanco UG mit beschränkter Haftung, Brunnrangenstraße 25, 97711 Maßbach. Geschäftsführer ist Dipl.-Ing. Christian Bernd Bauer. Eingetragen ist die Gesellschaft beim Amtsgericht Schweinfurt unter HRB 7306, die Umsatzsteuer-Identifikationsnummer lautet DE306530406. Diese Angaben kannst du im Handelsregister nachschlagen, ohne uns zu fragen.",
      "Die Belege: fünf veröffentlichte Arbeiten, jede mit Fachzeitschrift, Jahr und Seitenzahl, vier davon bei uns als Original-PDF.",
      "Alle fünf Arbeiten stammen aus einem Labor. Bezahlt haben wir sie, und die Prüfgeräte stellten wir ebenfalls. Für das Erklärungsmodell dahinter fehlt die Anerkennung der etablierten Wissenschaft. Am Menschen ist die Wirkung nicht nachgewiesen.",
      "Die Kritik ist öffentlich und wir verlinken sie. Die Quarks Science Cops haben Qi Blanco in Folge 96 am 25. Januar 2025 untersucht und kommen zu einem ablehnenden Urteil. Ihr härtester Punkt trifft zu: einen Wirknachweis am Menschen gibt es nicht.",
      "Die Rückgabe: das gesetzliche Widerrufsrecht umfasst 14 Tage, und wir räumen darüber hinaus eine Frist von 20 Tagen ab Warenerhalt ein. Einen Grund musst du dafür nicht angeben, und tragen darfst du das Stück in dieser Zeit.",
      "Aus offenen Angaben folgt keine Wirkung. Sie machen die Prüfung möglich, und mehr beansprucht diese Antwort nicht."
    ],
    "beleg": [
      "Handelsregister: Amtsgericht Schweinfurt, HRB 7306. Umsatzsteuer-Identifikationsnummer DE306530406. Ladungsfähige Anschrift und Geschäftsführer stehen im Impressum.",
      "Vier dieser Arbeiten sind Laborversuche an Zellkulturen. Die fünfte beschreibt 171 öffentlich gepostete Beobachtungen; eine Kontrollgruppe fehlt, eine Verblindung ebenfalls.",
      "Das Labor ist benannt: Dartsch Scientific Institut, Prof. Dr. Peter C. Dartsch. Alle fünf Arbeiten stammen von dort, und wir haben sie finanziert.",
      "Die Widerrufsbelehrung nach § 7 unserer Rückerstattungsrichtlinie nennt die gesetzlichen 14 Tage. Die 20 Tage darüber hinaus stehen in der Antwort auf die Frage nach dem Rückgabeweg.",
      "Die Kritikfolge ist unter ihrem Titel öffentlich abrufbar: Quarks Science Cops, Die Akte Qi Blanco, Folge 96, veröffentlicht am 25. Januar 2025."
    ],
    "fundstellen": [
      "Abwehr-Radikale in Immunzellen, Japan Journal of Medicine 2021, Band 4 Heft 1, Seite 484 bis 488",
      "Elektrischer Widerstand einer Darmzellbarriere, Applied Cell Biology 2021, Band 9 Heft 3, Seite 69 bis 74",
      "Oxidativer Stress in vier Zelllinien, Applied Cell Biology 2024, Band 12 Heft 1, Seite 1 bis 6",
      "171 Anwenderberichte, Advances in Bioengineering & Biomedical Science Research 2024, Band 7 Heft 3, Seite 01 bis 04",
      "Nervenzellen und entzündungsvermittelnde Zellen, Neurodegenerative Diseases Current Research 2026, Band 6 Heft 1, Seite 1 bis 8"
    ],
    "offen": [
      "Eine Wiederholung unserer Messungen durch ein zweites, unbeteiligtes Labor steht aus.",
      "Am Menschen ist die Wirkung klinisch nicht nachgewiesen.",
      "Unser Erklärungsmodell hat in der etablierten Wissenschaft keine Anerkennung. Die Publikationen selbst führen es als Hypothese."
    ],
    "weiter": [
      {
        "pfad": "/pages/lexikon-kohaerentes-wasser",
        "text": "Kohärentes Wasser: der Begriff aus unserem Erklärungsmodell, mit seiner Grenze"
      },
      {
        "pfad": "/pages/kritik",
        "text": "Die sieben härtesten Fragen, jede mit gerader Antwort"
      },
      {
        "pfad": "/pages/studien",
        "text": "Die fünf Arbeiten im Original"
      },
      {
        "pfad": "/pages/impressum",
        "text": "Handelsregister, Anschrift und Geschäftsführer"
      }
    ],
    "quellen": [
      "qb_impressum",
      "qb_studien",
      "qb_kritik",
      "qb_widerruf",
      "qb_faq",
      "quarks96",
      "qb_studie_immun",
      "qb_studie_darm",
      "qb_studie_oxstress",
      "qb_studie_nutzer",
      "qb_studie_qihome"
    ],
    "pfad": "/pages/ist-qi-blanco-serioes"
  },
  {
    "slug": "wie-weit-reicht-elektrosmog-schutz",
    "katalog_id": "dach-reichweite",
    "markt": "dach",
    "klasse": "neugier",
    "frage": "Wie groß ist der Wirkungsbereich eines Elektrosmog-Schutzes?",
    "antwort": "Eine Reichweite in Metern lässt sich nur dort angeben, wo eine Feldgröße gemessen wird, und sie gilt dann für genau diese Größe.",
    "begruendung": [
      "Felder werden mit dem Abstand schnell schwächer, und das ist die einzige Reichweite, die sich sauber angeben lässt. Sie gehört zur Quelle, nicht zum Schutzprodukt.",
      "Im Fernfeld einer Antenne verteilt sich die abgestrahlte Leistung über eine Kugelfläche. Doppelter Abstand bedeutet ein Viertel der Leistungsdichte. Zehnfacher Abstand bedeutet ein Hundertstel.",
      "In der Nähe eines Haushaltsgeräts fällt das Magnetfeld noch steiler ab. Zwischen drei Zentimetern und einem Meter liegen bei vielen Geräten zwei bis drei Größenordnungen.",
      "Für eine Abschirmung ist die Reichweite die Hülle selbst. Ein geschlossener Leiter hält das Feld draußen, und einen Zentimeter neben der Hülle hört die Wirkung auf. Eine Abschirmung mit einem Radius von mehreren Metern gibt es nicht, weil ein Radius kein Material ist.",
      "Eine Zahl, die ein Hersteller als Einsatzbereich oder als Radius angibt, ist zunächst eine Auslegungsangabe. Sie wird zur Messung in dem Moment, in dem jemand sagt, welche Größe sich in welchem Abstand um wie viel ändert, und mit welchem Gerät er das gemessen hat.",
      "Für unser QiHome Air nennen wir einen Einsatzbereich von bis zu 160 Metern Radius und kennzeichnen ihn als Herstellerangabe. Eine unabhängige Messung dieses Bereichs liegt nicht vor. Eine früher kursierende Angabe von 300 Quadratmetern war unzutreffend; sie steht in keinem unserer Texte mehr.",
      "Wer die Belastung im eigenen Zuhause senken will, hat einen Hebel, der ohne jedes Produkt funktioniert und sofort wirkt: Abstand."
    ],
    "beleg": [
      "Messwerte einer Behörde zum Abstand, in Mikrotesla, jeweils bei drei Zentimetern, 30 Zentimetern und einem Meter. Haarföhn: 6 bis 2000, dann 0,01 bis 7, dann 0,01 bis 0,3. Staubsauger: 200 bis 800, dann 2 bis 20, dann 0,13 bis 2. Bohrmaschine: 400 bis 800, dann 2 bis 3,5, dann 0,08 bis 0,2. Mikrowellengerät: 73 bis 200, dann 4 bis 8, dann 0,25 bis 0,6.",
      "Der empfohlene Referenzwert für das Magnetfeld liegt bei 100 Mikrotesla. In 30 Zentimetern Abstand unterschreiten ihn die meisten Geräte deutlich.",
      "Für hochfrequente Felder gelten frequenzabhängige Grenzwerte aus der 26. Verordnung zum Bundes-Immissionsschutzgesetz: 41 Volt pro Meter bei GSM um 900 Megahertz, 58 Volt pro Meter bei 1800 Megahertz, 61 Volt pro Meter bei 5G um 2000 und um 3600 Megahertz.",
      "Die quadratische Abnahme der Leistungsdichte mit dem Abstand steht in jedem Lehrbuch zur Elektrodynamik und folgt aus der Kugelfläche, über die sich die Leistung verteilt.",
      "Die Angabe von bis zu 160 Metern Radius für das QiHome Air ist eine Herstellerangabe aus unserem eigenen Text und keine Messung durch Dritte."
    ],
    "offen": [
      "Für unsere Geräte liegt keine unabhängige Messung des Einsatzbereichs vor. Die Zahl ist eine Auslegungsangabe.",
      "Wie stark ein Aufstellungsort im Alltag zählt, hängt vom Umfeld ab. In technisch stark belasteten Umgebungen ordnen wir den Einsatzbereich vorsichtiger ein.",
      "Eine Angabe in Quadratmetern führen wir nicht mehr, weil die früher kursierende Zahl unzutreffend war."
    ],
    "weiter": [
      {
        "pfad": "/pages/lexikon-elektrosmog",
        "text": "Elektrosmog: was das Wort umfasst und warum es keine einzelne Messgröße gibt"
      },
      {
        "pfad": "/pages/lexikon-frequenz",
        "text": "Frequenz: die Größe, in der Felder unterschieden werden"
      },
      {
        "pfad": "/pages/lexikon-energie",
        "text": "Energie: wo der Alltagsgebrauch und die physikalische Größe auseinandergehen"
      },
      {
        "pfad": "/pages/hypothesen",
        "text": "Unser Wirkmodell mit Stärken und Schwächen"
      }
    ],
    "quellen": [
      "bfs_haushalt",
      "bfs_grenzwerte",
      "bimschv26",
      "openstax_energie",
      "openstax_leiter",
      "icnirp2020",
      "qb_faq",
      "qb_hypothesen"
    ],
    "pfad": "/pages/wie-weit-reicht-elektrosmog-schutz"
  },
  {
    "slug": "was-sagen-die-quarks-science-cops",
    "katalog_id": "dach-quarks",
    "markt": "dach",
    "klasse": "einwand",
    "frage": "Was sagen die Quarks Science Cops zu Elektrosmog-Schmuck?",
    "antwort": "Sie halten Energie-Schmuck für unwirksam, sie nennen Qi Blanco namentlich, und in ihrem härtesten Punkt haben sie recht.",
    "begruendung": [
      "Die Folge heißt Die Akte Qi Blanco und lief am 25. Januar 2025 als Folge 96 unter der Kopfzeile Abzocke mit Energie-Schmuck, Der Fall Qi Blanco. Die Hosts sind Jonathan Focke und Maximilian Doeckel. Die Folge ist frei abrufbar, und die Quellenliste steht daneben.",
      "Vier Punkte tragen ihr Urteil, und drei davon bestreiten wir nicht.",
      "Erstens: der Schmuck schütze nicht vor Strahlung. Das trifft zu. Unsere Produkte enthalten weder Elektronik noch eine Stromquelle. Sie senden nicht, und sie schirmen nicht ab. Ein Messgerät daneben zeigt denselben Wert an wie ohne sie.",
      "Zweitens: kohärentes Wasser sei wissenschaftlich nicht anerkannt. Das trifft zu. Unsere Publikationen führen das Modell selbst als Hypothese, und die Kritikseite stellt diesen Punkt an die erste Stelle.",
      "Drittens: die Studien seien vom Hersteller bezahlt und stammten aus einem Labor. Das trifft zu. Wir haben die fünf Arbeiten beauftragt und bezahlt und die Geräte gestellt, und alle fünf stammen aus dem Dartsch Scientific Institut.",
      "Viertens: das Wort Superhuman. Es ist bei uns der Name eines Kursangebots in fünf Stufen und keine Aussage über ein Produkt.",
      "Die Messwerte in den Zellschalen bleiben von diesem Urteil unberührt. Sie sind veröffentlicht, mit Methode, Fallzahl und der Grenze, die die Autoren selbst nennen. Die Kritik richtet sich gegen die Erklärung und gegen die Unabhängigkeit, und beides ist eine andere Frage als die Messung.",
      "Ein Gegenangriff folgt daraus nicht. Drei der vier Punkte stehen seit Langem in unseren eigenen Texten, und sie standen dort vor der Folge."
    ],
    "beleg": [
      "Die Folge: Quarks Science Cops, Die Akte Qi Blanco, Folge 96, veröffentlicht am 25. Januar 2025 von Jonathan Focke und Maximilian Doeckel, abrufbar auf quarks.de.",
      "Unsere eigene Kritikseite führt sieben Fragen, sortiert nach Gewicht. Auf Platz eins steht die Frage, ob das Erklärungsmodell wissenschaftlich belegt ist, und die Antwort dort lautet nein.",
      "Zur Produktklasse insgesamt liegt eine behördliche Bewertung vor. Das Bundesamt für Strahlenschutz hält sogenannte Schutzprodukte gegen Elektrosmog für unnötig oder ungeeignet und zählt Anhänger, Ketten und Armbänder zu den technisch funktionslosen Produkten.",
      "Bei der Immunzell-Arbeit sank die Radikalbildung unter Mobilfunkbelastung auf 60,5 plus minus 3,9 Prozent der unbestrahlten Kontrolle, und mit einem QiOne 2 Pro daneben blieben 84,7 plus minus 7,0 Prozent erhalten, bei p kleiner gleich 0,01. Die Grenze steht in der Arbeit: in vitro, eine Zelllinie, drei unabhängige Experimente."
    ],
    "fundstellen": [
      "Abwehr-Radikale in Immunzellen, Japan Journal of Medicine 2021, Band 4 Heft 1, Seite 484 bis 488",
      "Elektrischer Widerstand einer Darmzellbarriere, Applied Cell Biology 2021, Band 9 Heft 3, Seite 69 bis 74",
      "Oxidativer Stress in vier Zelllinien, Applied Cell Biology 2024, Band 12 Heft 1, Seite 1 bis 6",
      "171 Anwenderberichte, Advances in Bioengineering & Biomedical Science Research 2024, Band 7 Heft 3, Seite 01 bis 04",
      "Nervenzellen und entzündungsvermittelnde Zellen, Neurodegenerative Diseases Current Research 2026, Band 6 Heft 1, Seite 1 bis 8"
    ],
    "offen": [
      "Eine Wiederholung unserer Messungen durch ein zweites, unbeteiligtes Labor steht aus.",
      "Am Menschen fehlt bis heute der klinische Wirknachweis.",
      "Warum sich die Zellen in den Schalen so verhalten haben, ist offen."
    ],
    "weiter": [
      {
        "pfad": "/pages/lexikon-kohaerentes-wasser",
        "text": "Kohärentes Wasser: der Begriff aus unserem Erklärungsmodell, mit seiner Grenze"
      },
      {
        "pfad": "/pages/lexikon-ordnung",
        "text": "Ordnung: was der Begriff physikalisch bedeutet"
      },
      {
        "pfad": "/pages/lexikon-energie",
        "text": "Energie: wo der Alltagsgebrauch und die physikalische Größe auseinandergehen"
      },
      {
        "pfad": "/pages/kritik",
        "text": "Die sieben härtesten Fragen, jede mit gerader Antwort"
      },
      {
        "pfad": "/pages/studien",
        "text": "Die fünf Arbeiten im Original"
      }
    ],
    "quellen": [
      "quarks96",
      "qb_kritik",
      "qb_studien",
      "qb_hypothesen",
      "qb_superhuman",
      "bfs_schutzprodukte",
      "qb_studie_immun",
      "qb_studie_darm",
      "qb_studie_oxstress",
      "qb_studie_nutzer",
      "qb_studie_qihome"
    ],
    "pfad": "/pages/was-sagen-die-quarks-science-cops"
  },
  {
    "slug": "was-ist-elektrosmog",
    "katalog_id": "dach-was-ist-elektrosmog",
    "markt": "dach",
    "klasse": "neugier",
    "frage": "Was ist Elektrosmog?",
    "antwort": "Elektrosmog ist ein Sammelwort für die elektrischen, magnetischen und elektromagnetischen Felder der Technik und fasst zwei physikalisch verschiedene Bereiche zusammen, niederfrequente Felder aus der Stromversorgung und hochfrequente Felder aus der Funktechnik.",
    "begruendung": [
      "Das Wort kommt nicht aus der Physik. Es setzt sich aus Elektrizität und Smog zusammen und hat sich in der öffentlichen Debatte eingebürgert. Behörden greifen es auf, weil die Leute danach fragen. Wer genauer werden will, nennt den Bereich, um den es geht.",
      "Niederfrequente Felder entstehen dort, wo Strom fließt. Das deutsche Netz schwingt mit 50 Hertz. Eine Leitung in der Wand, eine Herdplatte, ein Ladegerät: alle erzeugen ein Magnetfeld, solange sie Strom ziehen. Gemessen wird es als magnetische Flussdichte in Mikrotesla.",
      "Hochfrequente elektromagnetische Felder entstehen dort, wo Technik funkt. Mobilfunk, WLAN und Rundfunk arbeiten mit Frequenzen von einigen hundert Megahertz bis in den Gigahertz-Bereich. Gemessen werden sie als elektrische Feldstärke in Volt pro Meter oder als Leistungsdichte in Watt pro Quadratmeter.",
      "Der Unterschied ist nicht akademisch, denn die beiden Bereiche wirken verschieden. Niederfrequente Felder können Nerven und Muskeln reizen. Hochfrequente Felder können Gewebe erwärmen. Die Grenzwerte sind gegen genau diese beiden Wirkungen gebaut und gegen keine dritte.",
      "Elektrosmog selbst lässt sich nicht messen. Kein Gerät zeigt eine Zahl dafür an, weil das Wort mehrere Größen mit verschiedenen Einheiten zusammenfasst. Wer eine Belastung beziffern will, muss sagen, welches Feld er meint, in welcher Einheit und in welchem Abstand.",
      "Daraus folgt auch, wie man die Studienlage liest. Eine einzelne Studie entscheidet die Frage nicht, und ob eine Arbeit trägt, hängt an nachprüfbaren wissenschaftlichen Kriterien: Verblindung, eine Scheinexposition zum Vergleich, ein vorab angemeldeter Auswertungsplan und genug Teilnehmer, um den gesuchten Effekt überhaupt zu sehen. Fehlt eines davon, ist das Ergebnis eine Beobachtung und kein Beleg."
    ],
    "beleg": [
      "Für ortsfeste Funkanlagen legt die 26. Verordnung zum Bundes-Immissionsschutzgesetz frequenzabhängige Grenzwerte fest. Um 900 Megahertz sind es 41 Volt pro Meter, um 1800 Megahertz 58 Volt pro Meter, um 2000 und um 3600 Megahertz je 61 Volt pro Meter.",
      "Die international empfohlenen Richtlinien decken den Bereich von 100 Kilohertz bis 300 Gigahertz ab und begründen die Werte mit der Erwärmung von Gewebe.",
      "Für niederfrequente Magnetfelder liegt der empfohlene Referenzwert bei 100 Mikrotesla. Haushaltsgeräte überschreiten ihn dicht an der Oberfläche, fallen aber steil ab: ein Haarföhn liefert in drei Zentimetern Abstand zwischen 6 und 2000 Mikrotesla und in einem Meter noch 0,01 bis 0,3 Mikrotesla.",
      "Das Bundesamt für Strahlenschutz führt Wirkungen unterhalb der Grenzwerte als wissenschaftlich diskutiert. Diskutiert heißt dort weder nachgewiesen noch widerlegt."
    ],
    "offen": [
      "Ob unterhalb der Grenzwerte etwas passiert, ist nicht abschließend geklärt. Die Behörden halten die Frage offen, und wir halten sie ebenfalls offen.",
      "Für die neueren Mobilfunkfrequenzen fehlen Beobachtungen über Jahrzehnte, weil diese Frequenzen noch nicht lange genug in Gebrauch sind.",
      "Ob ein einzelner Mensch empfindlicher reagiert als der Durchschnitt, beantwortet keine der genannten Arbeiten. Durchschnitte sagen nichts über den Einzelfall."
    ],
    "weiter": [
      {
        "pfad": "/pages/was-senkt-elektrosmog-im-alltag",
        "text": "Was die Belastung im Alltag senkt, ohne dass man etwas kaufen muss"
      },
      {
        "pfad": "/pages/lexikon-frequenz",
        "text": "Frequenz: die Größe, in der Felder unterschieden werden"
      },
      {
        "pfad": "/pages/kann-elektrosmog-den-schlaf-stoeren",
        "text": "Kann Elektrosmog den Schlaf stören?"
      },
      {
        "pfad": "/pages/kritik",
        "text": "Was bei uns belegt ist und was nicht"
      }
    ],
    "quellen": [
      "bimschv26",
      "icnirp2020",
      "bfs_hff",
      "bfs_haushalt",
      "bfs_grenzwerte",
      "bfs_diskutiert",
      "who_emf",
      "qb_kritik"
    ],
    "pfad": "/pages/was-ist-elektrosmog"
  },
  {
    "slug": "armband-duschen-sauna",
    "katalog_id": "dach-alltag-wasser",
    "markt": "dach",
    "klasse": "neugier",
    "frage": "Kann man ein Armband gegen Elektrosmog beim Duschen und in der Sauna tragen?",
    "antwort": "Das QiBracelet® und der QiOne® 2 Pro dürfen beim Duschen, Schwimmen und in der Sauna anbleiben, und weil ihr Gehäuse aus Chirurgenstahl besteht, nehmen sie in der Saunakabine deren Wärme an.",
    "begruendung": [
      "Wasser ist bei diesen beiden Stücken kein Thema. Das Gehäuse besteht aus Chirurgenstahl 316L, einem Edelstahl, der in der Medizintechnik für Implantate verwendet wird. Er ist korrosionsbeständig und verträgt Chlorwasser, Meerwasser, Schweiß und Sonne.",
      "Die Sauna stellt eine andere Frage, und sie betrifft nicht die Technik, sondern die Wärme. Metall leitet Wärme sehr viel besser als Stoff oder Haut. Ein Schmuckstück aus Stahl kann sich in der Kabine deshalb bis auf die Umgebungstemperatur aufheizen, während ein Baumwollband darunter bleibt.",
      "Daraus folgt die einzige Vorsichtsmaßnahme, die wir für nötig halten: Schmuck sollte in der Sauna Hautkontakt haben und nicht frei baumeln. Wer ein aufgeheiztes Metallstück auf der Haut trägt, merkt rechtzeitig, wenn es ihm zu warm wird. Ein Stück, das lose hängt und dann aufschlägt, tut das unangekündigt.",
      "Beim Armband entscheidet außerdem das Band mit, und dort gehen die Materialien auseinander. Silikon und Kautschuk sind hitzebeständig, nehmen kaum Feuchtigkeit auf und sind für Sauna und Schwimmbad die unkomplizierte Wahl. Leder verträgt dauernde Nässe schlecht. Ein Metallband erwärmt sich wie das Gehäuse.",
      "Dem QiOne® 2 Pro liegt ein Baumwollbändchen bei. Baumwolle saugt sich voll und bleibt lange feucht, was ihr nicht schadet, aber unangenehm ist. Wer viel schwimmt oder sauniert, ist mit einem Band aus Silikon oder mit der Edelstahlkette besser bedient.",
      "Nach Salz- oder Chlorwasser genügt klares Wasser und Abtrocknen. Das ist keine Pflegevorschrift, sondern gilt für jeden Schmuck aus Edelstahl."
    ],
    "beleg": [
      "Unsere Materialangabe: das Gehäuse des QiBracelet® und des QiOne® 2 Pro besteht aus Chirurgenstahl 316L. Dieser Edelstahl wird in der Medizin für implantierbare Teile eingesetzt, weil er korrosionsbeständig und gut verträglich ist und allergische Reaktionen selten sind.",
      "Unsere Pflegeangabe: beide Stücke sind resistent gegen Chlor- und Meerwasser, Schweiß, Sonneneinstrahlung und Hitze, und sie sind für Schwimmer, Sportler und Saunagänger geeignet. Zu beachten ist, dass das Material sich erhitzen kann.",
      "Die Bohrung im QiOne® misst 2,5 Millimeter im Durchmesser. Wer das beiliegende Baumwollbändchen ersetzen will, braucht ein Band, das hindurchpasst.",
      "Ketten aus hartem Metall können den QiOne® verkratzen. Das ist ein Grund, das Band nach dem Gebrauch zu wechseln, und keiner gegen Wasser."
    ],
    "offen": [
      "Wie warm das Gehäuse in einer Kabine wirklich wird, haben wir nicht gemessen. Was hier steht, folgt aus dem Material und aus unserer eigenen Pflegeangabe.",
      "Ob das Tragen in Hitze oder Wasser die Wirkung verändert, ist von uns nicht untersucht worden.",
      "Für Menschen mit einer Nickelallergie gilt Chirurgenstahl als gut verträglich, und selten ist nicht nie. Wer empfindlich reagiert, probiert es kurz aus."
    ],
    "weiter": [
      {
        "pfad": "/pages/faq",
        "text": "Häufige Fragen zu Material, Pflege und Tragen"
      },
      {
        "pfad": "/pages/qibracelet-details",
        "text": "QiBracelet: Aufbau, Maße und Material"
      },
      {
        "pfad": "/pages/qione-2-pro-details",
        "text": "QiOne 2 Pro: Aufbau, Maße und Material"
      },
      {
        "pfad": "/pages/kritik",
        "text": "Was bei uns belegt ist und was nicht"
      }
    ],
    "quellen": [
      "qb_faq",
      "qb_kritik",
      "qb_hypothesen"
    ],
    "pfad": "/pages/armband-duschen-sauna"
  },
  {
    "slug": "was-senkt-elektrosmog-im-alltag",
    "katalog_id": null,
    "markt": "dach",
    "klasse": "neugier",
    "frage": "Was senkt die Belastung durch Elektrosmog im Alltag?",
    "antwort": "Abstand halten, den Flugmodus einschalten und Funkquellen abschalten senken die Belastung im Alltag sofort, kosten nichts und brauchen kein Produkt.",
    "begruendung": [
      "Abstand ist der stärkste Hebel, und er ist der einzige, der ohne Ausnahme wirkt. Die Stärke eines Feldes fällt mit der Entfernung steil ab. Bei Haushaltsgeräten liegen zwischen drei Zentimetern und einem Meter oft zwei bis drei Größenordnungen. Ein Ladegerät, das einen Meter weiter steht, ist die billigste Maßnahme, die es gibt.",
      "Beim Telefon lässt sich Handystrahlung mit denselben drei Griffen senken. Der Flugmodus schaltet den Sender ab, und ein Gerät ohne Sender strahlt nicht. Ein Headset oder die Freisprechfunktion bringt das Gerät vom Kopf weg. Und ein Telefon mit gutem Empfang sendet mit weniger Leistung als eines, das im Funkloch nach dem Netz sucht.",
      "Beim Kauf eines neuen Telefons steht eine Zahl im Datenblatt, die selten beachtet wird: der SAR-Wert. Er gibt an, wie viel Sendeleistung pro Kilogramm Körpergewebe im ungünstigsten Fall aufgenommen wird, und die Geräte unterscheiden sich darin erheblich. Wer die Belastung ohne Verhaltensänderung senken will, hat hier den einzigen Hebel, der beim Kauf entschieden wird.",
      "Das Schlafzimmer verdient einen eigenen Blick, und zwar aus einem anderen Grund als vermutet. Für das Feld allein zeigen die Untersuchungen nichts. Für das Gerät im Raum zeigen sie viel: Licht am Abend verschiebt die innere Uhr, und die Erreichbarkeit kostet Erholung, weil sie den Schlaf unterbricht.",
      "Praktische Tipps für den Raum sind deshalb schnell erzählt. Das Telefon lädt außerhalb des Schlafzimmers. Der Router läuft nachts nicht, wenn ihn niemand braucht. Der Wecker steht nicht am Kopfkissen. Diese Maßnahmen senken die Feldstärke im Zimmer und nehmen zugleich das Licht und die Unterbrechungen weg, für die die Beweislage deutlich ist.",
      "Eine Sorge wirkt dabei selbst mit, und sie wird selten genannt. In einer Feldstudie schliefen Anwohner, die sich um eine Sendeanlage sorgten, schlechter als unbesorgte, und zwar in den Nächten, in denen die Anlage nichts sendete. Das macht niemandes Beschwerden kleiner. Es heißt, dass der Weg vom Feld zum schlechten Schlaf auch über den Kopf führen kann."
    ],
    "beleg": [
      "Messwerte einer Behörde zum Abstand, in Mikrotesla, jeweils bei drei Zentimetern, 30 Zentimetern und einem Meter. Haarföhn: 6 bis 2000, dann 0,01 bis 7, dann 0,01 bis 0,3. Staubsauger: 200 bis 800, dann 2 bis 20, dann 0,13 bis 2. Bohrmaschine: 400 bis 800, dann 2 bis 3,5, dann 0,08 bis 0,2.",
      "Der empfohlene Referenzwert für das niederfrequente Magnetfeld liegt bei 100 Mikrotesla. In 30 Zentimetern Abstand unterschreiten ihn die aufgeführten Geräte deutlich.",
      "Im Fernfeld einer Antenne verteilt sich die Leistung über eine Kugelfläche. Doppelter Abstand bedeutet ein Viertel der Leistungsdichte, zehnfacher Abstand ein Hundertstel.",
      "397 Anwohner zwischen 18 und 81 Jahren schliefen an zehn deutschen Orten zwölf Nächte lang neben einer Versuchs-Basisstation, die in fünf Nächten sendete und in fünf Nächten nicht. Zwischen beiden Bedingungen unterschied sich weder die Schlafaufzeichnung noch die Selbsteinschätzung. In den sendefreien Nächten schliefen die Besorgten messbar schlechter als die Unbesorgten.",
      "Wer vier Stunden vor dem Zubettgehen auf einem selbstleuchtenden Lesegerät liest statt auf Papier, braucht länger zum Einschlafen, schüttet abends weniger Melatonin aus und ist am Morgen weniger wach.",
      "Eine Zusammenfassung von 20 Studien mit 125 198 Kindern und Jugendlichen fand für ein Bildschirmgerät zur Schlafenszeit ein Chancenverhältnis von 2,17 für zu wenig Schlaf, Vertrauensbereich 1,42 bis 3,32. Studien zu elektromagnetischer Strahlung waren aus dieser Auswahl von vornherein ausgeschlossen."
    ],
    "offen": [
      "Alle genannten Zahlen sind Durchschnitte über viele Menschen oder Messreihen. Wie stark eine Maßnahme bei einer einzelnen Person ankommt, sagen sie nicht.",
      "Dass diese Maßnahmen die Exposition senken, ist Physik. Dass sich dadurch jemand besser fühlt, ist damit nicht gezeigt.",
      "Zu unseren eigenen Produkten liegt keine Untersuchung vor, die sie mit diesen Alltagsmaßnahmen vergleicht."
    ],
    "weiter": [
      {
        "pfad": "/pages/was-ist-elektrosmog",
        "text": "Was ist Elektrosmog?"
      },
      {
        "pfad": "/pages/kann-elektrosmog-den-schlaf-stoeren",
        "text": "Kann Elektrosmog den Schlaf stören?"
      },
      {
        "pfad": "/pages/wie-weit-reicht-elektrosmog-schutz",
        "text": "Wie groß ist der Wirkungsbereich eines Elektrosmog-Schutzes?"
      },
      {
        "pfad": "/pages/kritik",
        "text": "Was bei uns belegt ist und was nicht"
      }
    ],
    "quellen": [
      "bfs_haushalt",
      "bfs_grenzwerte",
      "bfs_hff",
      "danker_hopfe2010",
      "chang2015",
      "carter2016",
      "openstax_energie",
      "qb_kritik"
    ],
    "pfad": "/pages/was-senkt-elektrosmog-im-alltag"
  }
];


/**
 * Eine Seite zu ihrem Slug — oder undefined.
 * @param {string} slug
 * @returns {FrageSeite|undefined}
 */
export function seiteFuer(slug) {
  return FRAGEN.find((s) => s.slug === slug);
}

/**
 * Die Belege einer Seite, aufgelöst und in der Reihenfolge der Seite.
 * Ein unbekannter Schlüssel wird ÜBERSPRUNGEN und nicht geraten — er fällt im
 * Test auf, nicht im ausgelieferten Text.
 * @param {FrageSeite} seite
 */
export function quellenFuer(seite) {
  return (seite.quellen || []).map((k) => QUELLEN[k]).filter(Boolean);
}
