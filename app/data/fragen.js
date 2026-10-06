/**
 * FRAGEN — je Frage eine Seite, die Frage ist die Ueberschrift und die Adresse.
 *
 * HERKUNFT: Grossjob 20260915-GEO-lexikon-frageseiten-und-ob-die-ki-uns-zitiert.
 * Die ersten Antworten schrieb Segment s05 (je Seite Antwort-zuerst, Beleg mit
 * Zahl, Quellen mit geprüfter Identität); dieses Modul ist ihr committeter
 * Träger im Repo. Ursprünglich erzeugt aus inhalte/fragen/fragen.json — DIE
 * SCHLÜSSELNAMEN SIND ABSICHTLICH UNVERÄNDERT ÜBERNOMMEN. Jede Umbenennung
 * wäre eine Stelle, an der zwischen geschriebenem Inhalt und ausgelieferter
 * Seite etwas still verlorengeht.
 *
 * UMGESCHRIEBEN 2026-09-28 (Grossjob 20260928-GROSSJOB-frageseiten-menschlich-
 * schreiben-und-bestmoegliches-licht). Christian: „Diese ganzen FAQ-Seiten …
 * sind doch sehr unangenehm, wie es nach AI klingt. Der Inhalt darf ja
 * bleiben, aber die Wortwahl und der Satzbau sind echt unangenehm." Und zu
 * ist-qi-blanco-serioes: „Sollten so öffentlich Zugeständnisse stehen?"
 * Seitdem gilt hier: (1) das Stilblatt in marken-stimme (stimme.json,
 * Schlüssel stilblatt) — es liest sich, als erkläre ein Mensch von Qi Blanco
 * einer Kundin die Sache am Telefon, im Du; (2) Bestmögliches Licht (Brain-
 * Regel bestmoegliches-licht-kritik-nicht-selbst-verbreiten): keine fremde
 * Kritik, keine Kritikernamen, keine Zugeständnisse; eine prüfbare Tatsache
 * bleibt und steht als Aussageklasse („Im Labor an Zellkulturen gemessen"),
 * nicht als Rückzieher im Satz. Die Frage „Was sagen die Quarks Science Cops
 * …?" ist deshalb kein Eintrag mehr; ihre Adresse leitet per 301 auf
 * „Ist Qi Blanco seriös?" (app/routes/pages.was-sagen-die-quarks-science-
 * cops.jsx). Der alte Wortlaut steht in git (b45d25b).
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
 * DAS FELD `offen` (Abschnitt „Gut zu wissen") gibt dem Leser etwas in die
 * Hand: eine Präzision, die er zum Urteilen braucht, oder etwas, das er selbst
 * tun oder nachprüfen kann (GL-SPR-0016, GL-SPR-0019). Bis 2026-09-28 hieß der
 * Abschnitt „Was wir nicht wissen" und war Pflicht; seitdem darf er leer sein
 * (ist-qi-blanco-serioes hat keinen), und eine Note auf unser eigenes Material
 * gehört nicht hinein. `beleg_titel` überschreibt auf Wunsch die Überschrift
 * „Was gemessen ist".
 *
 * @typedef {{slug: string, katalog_id: string|null, markt: string,
 *   klasse: string, frage: string, antwort: string,
 *   "begruendung": string[], beleg_titel?: string,
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
  "qb_bewertungen": {
    "art": "eigen",
    "zitat": "Qi Blanco: Bewertungen aus dem Google-Unternehmensprofil",
    "url": "https://qiblanco.com/pages/bewertungen",
    "pruefung": "https://qiblanco.com/pages/bewertungen",
    "identitaet": "Qi Blanco Bewertungen"
  },
  "qb_erfahrungen": {
    "art": "eigen",
    "zitat": "Qi Blanco: Erfahrungen, Menschen erzählen selbst",
    "url": "https://qiblanco.com/pages/erfahrungen",
    "pruefung": "https://qiblanco.com/pages/erfahrungen",
    "identitaet": "Erfahrungen mit Qi Blanco"
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
    "zitat": "Qi Blanco: unsere Hypothesen zum Wirkmodell",
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
    "zitat": "Qi Blanco: Zellversuche, was sie sagen und was nicht",
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
    "zitat": "Qi Blanco: AGB, § 7 Widerrufsbelehrung",
    "url": "https://qiblanco.com/pages/agb",
    "pruefung": "https://qiblanco.com/pages/agb",
    "identitaet": "Widerrufsbelehrung"
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
    "antwort": "Den Schlaf stört vor allem das Handy selbst, mit seinem Licht und seinen Nachrichten am Abend, während Schlafstudien beim Funkfeld allein keinen Einfluss gefunden haben.",
    "begruendung": [
      "Forscher haben den Elektrosmog, also das Funkfeld einer Mobilfunkanlage oder eines Routers, getrennt von dem untersucht, was sonst mit dem Handy ins Schlafzimmer kommt. Dazu gehören das Licht am Abend, die ständige Erreichbarkeit und der letzte Blick aufs Display kurz vor dem Einschlafen.",
      "Beim Funkfeld allein fanden die Studien keinen Einfluss auf den Schlaf, beim Handy selbst dagegen einen deutlichen.",
      "Spannend ist ein dritter Punkt, über den kaum jemand spricht: die Sorge selbst. In einer Feldstudie schliefen Anwohner, die sich wegen einer Sendeanlage Sorgen machten, schlechter als die anderen, und zwar auch in den Nächten, in denen die Anlage gar nicht sendete. Das heißt nicht, dass ihre Beschwerden eingebildet waren. Wer schlecht geschlafen hat, hat schlecht geschlafen, egal was ihn wach gehalten hat.",
      "Für deinen eigenen Schlaf heißt das: Mehr Abstand zum Handy, der Flugmodus in der Nacht und ein dunkles Schlafzimmer helfen sofort und kosten nichts."
    ],
    "beleg": [
      "397 Anwohnerinnen und Anwohner zwischen 18 und 81 Jahren schliefen zwölf Nächte lang an zehn Orten in Deutschland, an denen es sonst keinen Mobilfunk gab. Eine Versuchs-Basisstation sendete in fünf dieser Nächte echte GSM-Signale bei 900 und 1800 Megahertz und in fünf Nächten gar nichts. Weder die aufgezeichneten Schlafdaten noch die eigene Einschätzung der Teilnehmer unterschieden sich zwischen beiden Bedingungen. Wer sich um die Anlage sorgte, schlief in den Nächten ohne Feld messbar schlechter als die Unbesorgten.",
      "Eine Übersichtsarbeit im Auftrag der Weltgesundheitsorganisation hat 2024 insgesamt 41 Experimente mit 2874 Teilnehmern zusammengefasst. Für Schlafstörungen lag der gemeinsame Effekt bei Feldern am Kopf bei minus 0,01, mit einem Vertrauensbereich von minus 0,22 bis 0,20. Bei Feldern am ganzen Körper waren es 0,00, mit minus 0,15 bis 0,15. Ob das Feld an oder aus war, konnten die Teilnehmer nicht erkennen.",
      "Beim Handy selbst sieht die Zahlenlage anders aus. Eine Zusammenfassung von 20 Studien mit 125 198 Kindern und Jugendlichen hat untersucht, was ein Bildschirmgerät zur Schlafenszeit ausmacht. Das Chancenverhältnis für zu wenig Schlaf lag bei 2,17, mit einem Vertrauensbereich von 1,42 bis 3,32. Studien zur elektromagnetischen Strahlung hatte diese Arbeit von vornherein ausgeschlossen.",
      "Am besten untersucht ist das Licht. Wer vier Stunden vor dem Schlafengehen auf einem selbstleuchtenden Lesegerät liest statt auf Papier, braucht länger zum Einschlafen und schüttet abends weniger Melatonin aus. Außerdem verschiebt sich seine innere Uhr nach hinten, und am nächsten Morgen ist er weniger wach.",
      "Das Bundesamt für Strahlenschutz fasst den Stand so zusammen: Weder in Experimenten mit Testpersonen noch in Beobachtungsstudien ließ sich ein Zusammenhang mit Schlafstörungen belegen. Gemeint sind die hochfrequenten Felder von Handys und Mobilfunkbasisstationen.",
      "In 31 Experimenten mit 725 Menschen, die sich selbst als elektrosensibel bezeichnen, wurde verblindet geprüft, ob jemand ein Feld spüren kann. 24 der 31 Experimente fanden dafür keinen Hinweis. Dieselbe Übersicht hält fest, wie schwer die Beschwerden dieser Menschen sind und dass sie den Alltag manchmal stark einschränken."
    ],
    "offen": [
      "Alle Zahlen sind Durchschnitte über viele Menschen. Wie du persönlich reagierst, zeigt dir am ehesten dein eigener Schlaf.",
      "Für die neueren Mobilfunkfrequenzen gibt es noch keine Beobachtungen über Jahrzehnte, weil sie erst seit wenigen Jahren im Einsatz sind.",
      "Schlaf ist das Thema, zu dem uns Kundinnen und Kunden am häufigsten schreiben. Was einige von ihnen unter eigenem Namen erzählen, haben wir bei den Erfahrungen gesammelt."
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
        "pfad": "/pages/erfahrungen",
        "text": "Was Menschen selbst über ihren Schlaf und ihren Alltag erzählen"
      },
      {
        "pfad": "/pages/kritik",
        "text": "Was an unseren Produkten untersucht ist"
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
      "qb_erfahrungen",
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
    "antwort": "Ein elektromagnetisches Feld am Körper wird physikalisch auf drei Wegen kleiner: durch mehr Abstand, durch eine leitfähige Hülle oder indem du die Quelle abschaltest.",
    "begruendung": [
      "Am meisten bringt Abstand, und er kostet nichts. Die Feldstärke nimmt mit jedem Zentimeter Entfernung stark ab, schon wenige Zentimeter ändern die Größenordnung.",
      "Eine leitfähige Hülle schirmt ab, solange sie etwas rundherum umschließt. Das Prinzip kennst du vom Faradayschen Käfig: Im Inneren eines geschlossenen Leiters bleibt kein elektrisches Feld übrig. Wie gut ein Material das kann, wird nach einem festgelegten Prüfverfahren in Dezibel gemessen. Ein Anhänger von drei Zentimetern umschließt keinen Menschen, eine Abschirmung kann er deshalb nicht sein, und unser QiOne® 2 Pro will auch keine sein.",
      "Die Quelle abzuschalten wirkt sofort. Den größten Teil der Strahlung am Körper erzeugen deine eigenen Geräte, die Anlage auf dem Nachbardach trägt weniger dazu bei.",
      "Abschirmen kann die Strahlung sogar erhöhen. Ein Handy regelt seine Sendeleistung nach dem Empfang und sendet stärker, wenn der Empfang schlecht ist. Wer einen Aufkleber über die Antenne klebt, verschlechtert also den Empfang und treibt die Sendeleistung nach oben.",
      "Der QiOne® 2 Pro arbeitet ganz ohne Elektronik und ohne Strom. Er sendet nichts und schirmt nichts ab, deshalb zeigt ein Messgerät neben ihm dieselben Werte wie ohne ihn.",
      "In unseren Laborarbeiten ging es deshalb um die Zellen: wie sie sich unter Mobilfunk verhalten und was sich ändert, wenn ein QiOne® 2 Pro daneben liegt."
    ],
    "beleg": [
      "Für den Abstand gibt es Messwerte des Bundesamts für Strahlenschutz. Ein Haarföhn erzeugt in drei Zentimetern Entfernung zwischen 6 und 2000 Mikrotesla, in einem Meter Entfernung sind davon noch 0,01 bis 0,3 Mikrotesla übrig. Bei einem Staubsauger sind es 200 bis 800 Mikrotesla in drei Zentimetern und 0,13 bis 2 Mikrotesla in einem Meter. Der empfohlene Referenzwert für das Magnetfeld liegt bei 100 Mikrotesla, und in 30 Zentimetern Abstand bleiben die meisten Geräte deutlich darunter.",
      "Für Abschirmungen gibt es ein genormtes Prüfverfahren. ASTM D4935 misst, wie stark ein flaches Material ein Feld dämpft, und das Ergebnis ist eine Zahl in Dezibel.",
      "Die Grenzwerte stehen in der 26. Verordnung zum Bundes-Immissionsschutzgesetz und hängen von der Frequenz ab. Für GSM um 900 Megahertz gelten 41 Volt pro Meter und bei 1800 Megahertz 58 Volt pro Meter. Für 5G um 2000 und um 3600 Megahertz sind es je 61 Volt pro Meter. Als Leistungsdichte sind das etwa 4,5 Watt pro Quadratmeter bei 900 Megahertz und 9 Watt pro Quadratmeter bei 1800 Megahertz.",
      "Im Labor an Zellkulturen gemessen: Menschliche Immunzellen der Linie HL-60 lagen vier Stunden im Mobilfunkfeld. Ihre Fähigkeit, Abwehr-Radikale zu bilden, fiel dabei auf 60,5 plus minus 3,9 Prozent der unbestrahlten Kontrolle. Mit einem QiOne® 2 Pro daneben blieben 84,7 plus minus 7,0 Prozent erhalten, bei p kleiner gleich 0,01.",
      "Im Labor an Zellkulturen gemessen: Bei kultivierten Darmzellen der Linie IPEC-J2 brach der elektrische Widerstand der Zellbarriere unter derselben Belastung ungeschützt auf etwa ein Zehntel ein. Im geschützten Ansatz lag er bei 1837 plus minus 349 Ohm je Quadratzentimeter, bei völlig unbestrahlten Zellen bei 2542 plus minus 389 Ohm je Quadratzentimeter.",
      "Alle diese Werte stammen aus Laborversuchen an einzelnen Zelllinien, jeder Versuch wurde drei- bis viermal durchgeführt. Methode, Fallzahl und Messwerte stehen vollständig in den veröffentlichten Arbeiten."
    ],
    "offen": [
      "Wie wir uns erklären, was in den Zellschalen passiert ist, stellen wir bei unseren Hypothesen im Einzelnen vor.",
      "Die Laborarbeiten sind veröffentlicht, mit Methode, Fallzahl und allen Messwerten. Du kannst jede Zahl selbst nachlesen."
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
        "text": "Kohärentes Wasser: der Begriff hinter unserem Erklärungsmodell"
      },
      {
        "pfad": "/pages/hypothesen",
        "text": "Unser Wirkmodell im Einzelnen"
      },
      {
        "pfad": "/pages/studien",
        "text": "Die fünf Arbeiten im Original"
      }
    ],
    "quellen": [
      "bfs_haushalt",
      "bfs_grenzwerte",
      "bimschv26",
      "icnirp2020",
      "astm_d4935",
      "openstax_leiter",
      "openstax_energie",
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
    "antwort": "Zu unseren Produkten gibt es fünf veröffentlichte Arbeiten, die wir beim Dartsch Scientific Institut in Auftrag gegeben haben und die du im Original nachlesen kannst.",
    "begruendung": [
      "Zu den elektromagnetischen Feldern selbst gibt es sehr viel Forschung, bezahlt von Behörden und internationalen Organisationen. Zu Produkten, die davor schützen sollen, gibt es weltweit nur wenige veröffentlichte Arbeiten, und fünf davon betreffen unsere Produkte.",
      "Durchgeführt hat sie Prof. Dr. Peter C. Dartsch an seinem Institut, in unserem Auftrag. So entsteht Produktforschung in aller Regel: Der Hersteller gibt die Untersuchung in Auftrag und legt sie offen.",
      "Vier der Arbeiten sind Laborversuche an Zellkulturen. Die fünfte wertet 171 öffentlich gepostete Erfahrungen von Anwenderinnen und Anwendern aus.",
      "Alle fünf sind in Fachzeitschriften erschienen, jede mit Jahr, Heft und Seitenzahl, und alle fünf kannst du bei uns als Original-PDF lesen."
    ],
    "beleg": [
      "Vier der fünf Arbeiten liegen bei uns als Original-PDF, mit Methode, Fallzahl und dem Rahmen, den die Autoren selbst angeben.",
      "Im Labor an Zellkulturen gemessen: Menschliche Immunzellen bildeten nach vier Stunden im Mobilfunkfeld nur noch 60,5 Prozent ihrer Abwehr-Radikale, verglichen mit unbestrahlten Zellen. Mit einem QiOne® 2 Pro daneben waren es 84,7 Prozent.",
      "Zu den Feldern selbst gibt es große Arbeiten von Behörden und Forschungsverbünden. Die Kohortenstudie COSMOS hat über 260 000 Menschen begleitet und im ersten Beobachtungszeitraum keinen Zusammenhang zwischen Dauer oder Intensität der Handynutzung und Hirntumoren gefunden. Eine Übersicht im Auftrag der Weltgesundheitsorganisation fasste 41 Experimente mit 2874 Teilnehmern zu selbst berichteten Beschwerden zusammen und fand keine oder nur kleine, nicht signifikante Effekte. Eine zweite Übersicht derselben Reihe hat die geistige Leistungsfähigkeit untersucht.",
      "Die Internationale Krebsforschungsagentur der Weltgesundheitsorganisation stuft hochfrequente elektromagnetische Felder seit 2011 als möglicherweise krebserregend ein. Die Einstufung beschreibt die Beweislage, über die Höhe eines Risikos sagt sie nichts. Sie bezieht sich auf Tumoren im Kopfbereich und auf die Nutzung von Handys und anderen Endgeräten."
    ],
    "fundstellen": [
      "Abwehr-Radikale in Immunzellen, Japan Journal of Medicine 2021, Band 4 Heft 1, Seite 484 bis 488",
      "Elektrischer Widerstand einer Darmzellbarriere, Applied Cell Biology 2021, Band 9 Heft 3, Seite 69 bis 74",
      "Oxidativer Stress in vier Zelllinien, Applied Cell Biology 2024, Band 12 Heft 1, Seite 1 bis 6",
      "171 Anwenderberichte, Advances in Bioengineering & Biomedical Science Research 2024, Band 7 Heft 3, Seite 01 bis 04",
      "Nervenzellen und entzündungsvermittelnde Zellen, Neurodegenerative Diseases Current Research 2026, Band 6 Heft 1, Seite 1 bis 8"
    ],
    "offen": [
      "Auf unseren Studienseiten ist jede Arbeit in Ruhe zusammengefasst, mit Methode, Messwerten und dem Rahmen, den die Autoren angeben.",
      "Wie wir die Messwerte erklären, stellen wir bei unseren Hypothesen im Einzelnen vor."
    ],
    "weiter": [
      {
        "pfad": "/pages/studien",
        "text": "Die fünf Arbeiten im Original"
      },
      {
        "pfad": "/pages/quellen",
        "text": "Alle Arbeiten, auf die wir uns berufen"
      },
      {
        "pfad": "/pages/lexikon-kohaerentes-wasser",
        "text": "Kohärentes Wasser: der Begriff hinter unserem Erklärungsmodell"
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
        "pfad": "/pages/kritik",
        "text": "Was an unseren Produkten untersucht ist"
      }
    ],
    "quellen": [
      "cosmos2024",
      "bosch2024",
      "pophof2024",
      "bfs_diskutiert",
      "who_emf",
      "qb_studien",
      "qb_quellen",
      "qb_hypothesen",
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
    "antwort": "Ja, und du kannst es selbst prüfen: Wir sind ein eingetragenes Unternehmen aus Maßbach, stehen mit unseren Namen dafür ein und geben dir 20 Tage, alles in Ruhe zu testen.",
    "beleg_titel": "Zum Nachprüfen",
    "begruendung": [
      "Hinter Qi Blanco steht die Qi Blanco UG (haftungsbeschränkt) mit Sitz in der Brunnrangenstraße 25 in 97711 Maßbach. Eingetragen ist sie beim Amtsgericht Schweinfurt unter HRB 7306, die Umsatzsteuer-Identifikationsnummer lautet DE306530406, und Geschäftsführer ist Dipl.-Ing. Christian Bernd Bauer. Das alles kannst du im Handelsregister nachschlagen, ohne uns zu fragen.",
      "Gegründet haben Qi Blanco Christian und Anna, und die beiden zeigen ihr Gesicht: Jeden Sonntag sind sie bei Coming Home eine Stunde live.",
      "Hinter unserem Schmuck und dem QiHome® Air stehen zehn Jahre Forschung, entwickelt und gefertigt in Deutschland. Das Gehäuse ist aus Chirurgenstahl, der GitterChip™ aus einer eigens entwickelten 750er Goldlegierung, und Oberflächenveredler und Goldschmiede vollenden jedes Stück von Hand.",
      "Das Dartsch Scientific Institut von Prof. Dr. Peter C. Dartsch hat unsere Produkte in fünf Arbeiten untersucht. Alle fünf sind in Fachzeitschriften erschienen, jede mit Jahr und Seitenzahl, und alle fünf kannst du bei uns im Original lesen.",
      "Viele unserer Kundinnen und Kunden erzählen uns, was sie mit ihrem QiOne® oder ihrem QiHome® Air erleben. Einige berichten darüber unter eigenem Namen auf ihren eigenen Konten, und diese Berichte haben wir bei den Erfahrungen gesammelt. In Deutschland sind inzwischen über 450 QiHome® Air im Einsatz.",
      "Jedes Stück kannst du 20 Tage ab Erhalt tragen und ohne Angabe von Gründen zurückgeben, du bekommst dann den Kaufpreis erstattet. Das ist mehr als das gesetzliche Widerrufsrecht von 14 Tagen, und beide Fristen gelten nebeneinander.",
      "Unsere Bewertungen kommen aus unserem Google-Unternehmensprofil. Jede stammt von einem Google-Konto und ist dort öffentlich nachlesbar, und für eine Bewertung gibt es bei uns weder Gutschein noch Rabatt."
    ],
    "beleg": [
      "Handelsregister: Amtsgericht Schweinfurt, HRB 7306. Umsatzsteuer-Identifikationsnummer DE306530406. Anschrift und Geschäftsführer stehen im Impressum.",
      "Fünf Arbeiten des Dartsch Scientific Institut, erschienen in Fachzeitschriften: vier Laborversuche an Zellkulturen und eine Auswertung von 171 öffentlich geposteten Erfahrungsberichten.",
      "Rückgabe: 20 Tage ab Erhalt, ohne Angabe von Gründen, zusätzlich zu den gesetzlichen 14 Tagen aus der Widerrufsbelehrung nach § 7 unserer Rückerstattungsrichtlinie.",
      "Bewertungen: live aus unserem Google-Unternehmensprofil, jede von einem Google-Konto geschrieben und dort öffentlich nachlesbar.",
      "Erfahrungen: Berichte von Menschen unter eigenem Namen, veröffentlicht auf ihren eigenen Konten."
    ],
    "fundstellen": [
      "Abwehr-Radikale in Immunzellen, Japan Journal of Medicine 2021, Band 4 Heft 1, Seite 484 bis 488",
      "Elektrischer Widerstand einer Darmzellbarriere, Applied Cell Biology 2021, Band 9 Heft 3, Seite 69 bis 74",
      "Oxidativer Stress in vier Zelllinien, Applied Cell Biology 2024, Band 12 Heft 1, Seite 1 bis 6",
      "171 Anwenderberichte, Advances in Bioengineering & Biomedical Science Research 2024, Band 7 Heft 3, Seite 01 bis 04",
      "Nervenzellen und entzündungsvermittelnde Zellen, Neurodegenerative Diseases Current Research 2026, Band 6 Heft 1, Seite 1 bis 8"
    ],
    "offen": [],
    "weiter": [
      {
        "pfad": "/pages/studien",
        "text": "Die fünf Arbeiten im Original"
      },
      {
        "pfad": "/pages/erfahrungen",
        "text": "Menschen erzählen selbst, was sie mit Qi Blanco erleben"
      },
      {
        "pfad": "/pages/bewertungen",
        "text": "Alle Google-Bewertungen, live aus unserem Profil"
      },
      {
        "pfad": "/pages/impressum",
        "text": "Handelsregister, Anschrift und Geschäftsführer"
      }
    ],
    "quellen": [
      "qb_impressum",
      "qb_studien",
      "qb_erfahrungen",
      "qb_bewertungen",
      "qb_widerruf",
      "qb_faq",
      "qb_studie_immun",
      "qb_studie_darm",
      "qb_studie_oxstress",
      "qb_studie_nutzer",
      "qb_studie_qihome"
    ],
    "pfad": "/pages/ist-qi-blanco-serioes",
    "trustpilot": true
  },
  {
    "slug": "wie-weit-reicht-elektrosmog-schutz",
    "katalog_id": "dach-reichweite",
    "markt": "dach",
    "klasse": "neugier",
    "frage": "Wie groß ist der Wirkungsbereich eines Elektrosmog-Schutzes?",
    "antwort": "Unser QiHome® Air ist laut Herstellerangabe auf einen Einsatzbereich von bis zu 160 Metern Radius ausgelegt, das reicht für eine Wohnung und auch für ein ganzes Haus.",
    "begruendung": [
      "Jedes Feld wird mit dem Abstand zur Quelle schnell schwächer. Diese Reichweite gehört zur Quelle, also zum Handy, zum Router oder zur Sendeanlage.",
      "Im Fernfeld einer Antenne verteilt sich die Leistung über eine immer größere Kugelfläche. Bei doppeltem Abstand kommt noch ein Viertel der Leistungsdichte an, bei zehnfachem Abstand ein Hundertstel.",
      "In der Nähe von Haushaltsgeräten fällt das Magnetfeld noch steiler ab. Zwischen drei Zentimetern und einem Meter liegen bei vielen Geräten zwei bis drei Größenordnungen.",
      "Eine Abschirmung wirkt nur dort, wo ihr Material ist. Ein geschlossener Leiter hält das Feld draußen, und schon einen Zentimeter daneben ist seine Wirkung zu Ende, einen Radius von mehreren Metern kann eine Abschirmung deshalb nicht haben.",
      "Das QiHome® Air ist keine Abschirmung. Seinen Einsatzbereich von bis zu 160 Metern Radius geben wir als Herstellerangabe an, und für die allermeisten Haushalte reicht ein einziges Gerät, auch über mehrere Stockwerke hinweg. Am besten stellst du es dorthin, wo du dich viel aufhältst, zum Beispiel ins Schlafzimmer oder in einen Raum, den ihr viel nutzt.",
      "Wer die Strahlung in den eigenen vier Wänden schon heute senken will, hat außerdem einen einfachen Hebel: Abstand zu den eigenen Geräten."
    ],
    "beleg": [
      "Messwerte des Bundesamts für Strahlenschutz zum Abstand, in Mikrotesla, jeweils bei drei Zentimetern, 30 Zentimetern und einem Meter. Haarföhn: 6 bis 2000, dann 0,01 bis 7, dann 0,01 bis 0,3. Staubsauger: 200 bis 800, dann 2 bis 20, dann 0,13 bis 2. Bohrmaschine: 400 bis 800, dann 2 bis 3,5, dann 0,08 bis 0,2. Mikrowellengerät: 73 bis 200, dann 4 bis 8, dann 0,25 bis 0,6.",
      "Der empfohlene Referenzwert für das Magnetfeld liegt bei 100 Mikrotesla. In 30 Zentimetern Abstand bleiben die meisten Geräte deutlich darunter.",
      "Für hochfrequente Felder gelten die Grenzwerte der 26. Verordnung zum Bundes-Immissionsschutzgesetz, und sie hängen von der Frequenz ab. Bei GSM um 900 Megahertz sind es 41 Volt pro Meter, bei 1800 Megahertz 58 Volt pro Meter und bei 5G um 2000 und um 3600 Megahertz 61 Volt pro Meter.",
      "Dass die Leistungsdichte mit dem Quadrat des Abstands abnimmt, steht in jedem Lehrbuch der Elektrodynamik, weil sich die Leistung über eine Kugelfläche verteilt.",
      "Die bis zu 160 Meter Radius für das QiHome® Air sind unsere Herstellerangabe. Wir geben die Reichweite immer als Radius an, und die Zahl von 300 Quadratmetern, die früher kursierte, gilt nicht mehr."
    ],
    "offen": [
      "Wie gut ein Aufstellungsort passt, hängt vom Umfeld ab. Halte rund einen halben Meter Abstand zu starken Elektrogeräten wie Mikrowelle, PC oder WLAN-Router.",
      "Nach dem Aufstellen gib dem QiHome® Air ein paar Stunden Zeit. Kurzes Umstellen oder ein Wechsel der Steckdose ist deshalb kein Problem."
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
        "pfad": "/pages/faq",
        "text": "Häufige Fragen zum QiHome® Air: Reichweite und Aufstellung"
      },
      {
        "pfad": "/pages/hypothesen",
        "text": "Unser Wirkmodell im Einzelnen"
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
    "slug": "was-ist-elektrosmog",
    "katalog_id": "dach-was-ist-elektrosmog",
    "markt": "dach",
    "klasse": "neugier",
    "frage": "Was ist Elektrosmog?",
    "antwort": "Elektrosmog ist ein Alltagswort für die Felder, die Technik um uns herum erzeugt: niederfrequente aus der Stromversorgung und hochfrequente aus Handy, WLAN und Funk.",
    "begruendung": [
      "Das Wort ist aus Elektrizität und Smog zusammengesetzt und stammt aus der öffentlichen Debatte, aus der Physik kommt es nicht. Auch Behörden benutzen es, weil die Menschen danach fragen. Wer genauer sein will, nennt den Bereich, um den es geht.",
      "Niederfrequente Felder entstehen überall, wo Strom fließt. Das Stromnetz in Deutschland schwingt mit 50 Hertz, und die Leitung in der Wand, die Herdplatte oder das Ladegerät erzeugen ein Magnetfeld, solange sie Strom ziehen. Gemessen wird es als magnetische Flussdichte in Mikrotesla.",
      "Hochfrequente Felder entstehen überall, wo Technik funkt. Mobilfunk, WLAN und Rundfunk arbeiten mit Frequenzen von einigen hundert Megahertz bis in den Gigahertz-Bereich. Gemessen werden sie als elektrische Feldstärke in Volt pro Meter oder als Leistungsdichte in Watt pro Quadratmeter.",
      "Der Unterschied ist wichtig, weil beide Bereiche anders auf den Körper wirken. Niederfrequente Felder können Nerven und Muskeln reizen, hochfrequente können Gewebe erwärmen, und die Grenzwerte schützen genau vor diesen beiden Wirkungen.",
      "Ein Messgerät zeigt deshalb nie eine Zahl für „Elektrosmog“ an, weil das Wort mehrere Größen mit verschiedenen Einheiten zusammenfasst. Wer eine Belastung beziffern will, sagt dazu, welches Feld er meint, in welcher Einheit und in welchem Abstand.",
      "Wie belastbar eine einzelne Studie ist, erkennst du an ein paar Fragen. Wurde verblindet, und gab es zum Vergleich eine Scheinbestrahlung? Stand der Auswertungsplan vorher fest, und haben genug Menschen teilgenommen, um den gesuchten Effekt überhaupt sehen zu können?"
    ],
    "beleg": [
      "Für ortsfeste Funkanlagen legt die 26. Verordnung zum Bundes-Immissionsschutzgesetz Grenzwerte fest, die von der Frequenz abhängen. Um 900 Megahertz sind es 41 Volt pro Meter, um 1800 Megahertz 58 Volt pro Meter und um 2000 und um 3600 Megahertz je 61 Volt pro Meter.",
      "Die international empfohlenen Richtlinien reichen von 100 Kilohertz bis 300 Gigahertz und begründen ihre Werte mit der Erwärmung von Gewebe.",
      "Für niederfrequente Magnetfelder liegt der empfohlene Referenzwert bei 100 Mikrotesla. Direkt an der Oberfläche liegen Haushaltsgeräte darüber, doch mit dem Abstand fallen die Werte steil ab. Ein Haarföhn liefert in drei Zentimetern zwischen 6 und 2000 Mikrotesla, in einem Meter noch 0,01 bis 0,3 Mikrotesla.",
      "Das Bundesamt für Strahlenschutz führt mögliche Wirkungen unterhalb der Grenzwerte als wissenschaftlich diskutiert. Diskutiert heißt dort: weder nachgewiesen noch widerlegt."
    ],
    "offen": [
      "Ob unterhalb der Grenzwerte etwas passiert, ist noch nicht abschließend geklärt, und auch die Behörden halten die Frage offen.",
      "Für die neueren Mobilfunkfrequenzen gibt es noch keine Beobachtungen über Jahrzehnte, weil sie erst seit wenigen Jahren im Einsatz sind.",
      "Ob du selbst empfindlicher reagierst als der Durchschnitt, beantworten diese Arbeiten nicht, denn sie rechnen über viele Menschen."
    ],
    "weiter": [
      {
        "pfad": "/pages/was-senkt-elektrosmog-im-alltag",
        "text": "Was die Belastung im Alltag senkt"
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
        "text": "Was an unseren Produkten untersucht ist"
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
    "antwort": "Ja, das QiBracelet® und den QiOne® 2 Pro kannst du beim Duschen, beim Schwimmen und in der Sauna anbehalten, nur wird ihr Gehäuse aus Chirurgenstahl in der Sauna warm.",
    "begruendung": [
      "Wasser macht den beiden nichts aus. Das Gehäuse ist aus Chirurgenstahl 316L, einem Edelstahl, aus dem in der Medizin auch Implantate gemacht werden. Er ist korrosionsbeständig und verträgt Chlorwasser, Meerwasser, Schweiß und Sonne.",
      "In der Sauna geht es um etwas anderes: Metall wird dort warm. Es leitet Wärme viel besser als Stoff oder Haut und kann sich in der Kabine bis auf die Raumtemperatur aufheizen, während ein Baumwollband kühler bleibt.",
      "Deshalb legen wir dir nur eine Vorsichtsmaßnahme ans Herz: Trag den Schmuck in der Sauna mit Hautkontakt und lass ihn nicht frei baumeln. Liegt er auf der Haut, merkst du rechtzeitig, wenn er dir zu warm wird. Ein Stück, das lose hängt und dann an die Haut schlägt, kommt dagegen ohne Vorwarnung.",
      "Beim Armband kommt es auch auf das Band an. Silikon und Kautschuk halten Hitze aus, nehmen kaum Feuchtigkeit auf und sind für Sauna und Schwimmbad die einfachste Wahl. Leder mag dauernde Nässe nicht, und ein Metallband wird genauso warm wie das Gehäuse.",
      "Beim QiOne® 2 Pro liegt ein Baumwollbändchen bei. Baumwolle saugt sich voll und bleibt lange feucht, das schadet ihr nicht, ist aber unangenehm. Wenn du viel schwimmst oder oft in die Sauna gehst, nimm lieber ein Band aus Silikon oder unsere Edelstahlkette.",
      "Nach dem Meer oder dem Schwimmbad spülst du ihn kurz mit klarem Wasser ab und trocknest ihn, wie jeden Schmuck aus Edelstahl."
    ],
    "beleg": [
      "Material: Das Gehäuse von QiBracelet® und QiOne® 2 Pro ist aus Chirurgenstahl 316L. Dieser Edelstahl wird in der Medizin für implantierbare Teile verwendet, weil er korrosionsbeständig und gut verträglich ist und allergische Reaktionen selten sind.",
      "Pflege: Beide Stücke sind beständig gegen Chlor- und Meerwasser, Schweiß, Sonne und Hitze und eignen sich für Schwimmer, Sportler und Saunagänger. Das Material kann sich dabei erhitzen.",
      "Die Bohrung im QiOne® hat einen Durchmesser von 2,5 Millimetern. Wenn du das Baumwollbändchen tauschen willst, brauchst du ein Band, das hindurchpasst.",
      "Wasser kann dem QiOne® nichts anhaben. Kratzer bekommt er höchstens von Ketten aus hartem Metall, deshalb wechselst du nach dem Tragen an so einer Kette am besten wieder auf das Band."
    ],
    "offen": [
      "Wie warm das Gehäuse wird, hängt von der Temperatur in der Kabine ab, davon, wie lange du drin bleibst, und ob das Stück auf der Haut liegt oder frei hängt.",
      "Chirurgenstahl gilt auch bei einer Nickelallergie als gut verträglich. Wenn du empfindlich reagierst, probier es einfach für kurze Zeit aus."
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
        "text": "Was an unseren Produkten untersucht ist"
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
    "antwort": "Am meisten bringt Abstand: Leg das Handy weg vom Körper, schalte nachts den Flugmodus ein und den Router aus, das senkt die Belastung sofort und kostet nichts.",
    "begruendung": [
      "Abstand hilft immer. Die Stärke eines Feldes nimmt mit der Entfernung steil ab, bei Haushaltsgeräten liegen zwischen drei Zentimetern und einem Meter oft zwei bis drei Größenordnungen. Ein Ladegerät, das einen Meter weiter weg steht, ist die billigste Maßnahme, die es gibt.",
      "Beim Handy funktionieren dieselben Griffe. Im Flugmodus ist der Sender aus, und ein Gerät ohne Sender strahlt nicht. Mit Headset oder Freisprechen ist das Handy weg vom Kopf, und ein Handy mit gutem Empfang sendet mit weniger Leistung als eins, das im Funkloch nach dem Netz sucht.",
      "Wenn du ein neues Handy kaufst, lohnt ein Blick auf eine Zahl im Datenblatt, die kaum jemand beachtet: den SAR-Wert. Er gibt an, wie viel Sendeleistung pro Kilogramm Körpergewebe im ungünstigsten Fall aufgenommen wird, und die Geräte unterscheiden sich darin deutlich. Hier entscheidest du schon beim Kauf, ohne später etwas umstellen zu müssen.",
      "Das Schlafzimmer lohnt einen eigenen Blick, allerdings aus einem anderen Grund, als viele denken. Für das Funkfeld allein zeigen die Studien keinen Einfluss auf den Schlaf. Das Handy im Raum stört dagegen sehr wohl: Licht am Abend verschiebt die innere Uhr, und wer erreichbar ist, wird im Schlaf unterbrochen.",
      "Die praktischen Tipps sind schnell erzählt. Das Handy lädt außerhalb des Schlafzimmers, der Router ist nachts aus, wenn ihn niemand braucht, und der Wecker steht nicht direkt am Kopfkissen. Damit sinkt die Feldstärke im Zimmer, und Licht und Unterbrechungen sind gleich mit weg.",
      "Auch die Sorge selbst wirkt mit, und darüber spricht kaum jemand. In einer Feldstudie schliefen Anwohner, die sich wegen einer Sendeanlage Sorgen machten, schlechter als die anderen, und zwar in den Nächten, in denen die Anlage gar nicht sendete. Ihre Beschwerden werden dadurch nicht kleiner. Es zeigt aber, dass der Weg vom Feld zum schlechten Schlaf auch über den Kopf führen kann."
    ],
    "beleg": [
      "Messwerte des Bundesamts für Strahlenschutz zum Abstand, in Mikrotesla, jeweils bei drei Zentimetern, 30 Zentimetern und einem Meter. Haarföhn: 6 bis 2000, dann 0,01 bis 7, dann 0,01 bis 0,3. Staubsauger: 200 bis 800, dann 2 bis 20, dann 0,13 bis 2. Bohrmaschine: 400 bis 800, dann 2 bis 3,5, dann 0,08 bis 0,2.",
      "Der empfohlene Referenzwert für das niederfrequente Magnetfeld liegt bei 100 Mikrotesla. In 30 Zentimetern Abstand bleiben die genannten Geräte deutlich darunter.",
      "Im Fernfeld einer Antenne verteilt sich die Leistung über eine Kugelfläche. Bei doppeltem Abstand kommt noch ein Viertel der Leistungsdichte an, bei zehnfachem Abstand ein Hundertstel.",
      "397 Anwohnerinnen und Anwohner zwischen 18 und 81 Jahren schliefen an zehn Orten in Deutschland zwölf Nächte lang neben einer Versuchs-Basisstation. Sie sendete in fünf Nächten und in fünf Nächten nicht. Weder die Schlafaufzeichnung noch die eigene Einschätzung unterschied sich zwischen beiden Bedingungen. In den Nächten ohne Sendung schliefen die Besorgten messbar schlechter als die Unbesorgten.",
      "Wer vier Stunden vor dem Zubettgehen auf einem selbstleuchtenden Lesegerät liest statt auf Papier, braucht länger zum Einschlafen, schüttet abends weniger Melatonin aus und ist am Morgen weniger wach.",
      "Eine Zusammenfassung von 20 Studien mit 125 198 Kindern und Jugendlichen hat untersucht, was ein Bildschirmgerät zur Schlafenszeit ausmacht. Das Chancenverhältnis für zu wenig Schlaf lag bei 2,17, mit einem Vertrauensbereich von 1,42 bis 3,32. Studien zur elektromagnetischen Strahlung hatte diese Auswertung von vornherein ausgeschlossen."
    ],
    "offen": [
      "Alle Zahlen sind Durchschnitte über viele Menschen oder Messreihen. Wie stark eine Maßnahme bei dir ankommt, merkst du am besten selbst.",
      "Wenn du ein QiHome® Air hast, stell es dorthin, wo du dich viel aufhältst, am besten ins Schlafzimmer oder in einen zentral genutzten Raum."
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
        "text": "Was an unseren Produkten untersucht ist"
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
      "qb_faq",
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
