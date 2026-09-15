/**
 * LEXIKON — die Begriffe, die wir benutzen, in der Sprache der Physik.
 *
 * HERKUNFT: Grossjob 20260915-GEO-lexikon-frageseiten-und-ob-die-ki-uns-zitiert.
 * Die Inhalte schrieb Segment s04 (je Eintrag Gebrauch, Physik, Uebertragung,
 * Grenze, Quellen, mit Quellen-Existenzpruefung); dieses Modul ist ihr
 * committeter Traeger im Repo. Erzeugt aus inhalte/lexikon/lexikon.json —
 * DIE SCHLUESSELNAMEN SIND ABSICHTLICH UNVERAENDERT UEBERNOMMEN. Jede
 * Umbenennung waere eine Stelle, an der zwischen geschriebenem Inhalt und
 * ausgelieferter Seite etwas still verlorengeht.
 *
 * KEIN LOADER, KEIN FREMDER PFAD: Oxygen laeuft am Edge und kann
 * shared-state zur Laufzeit NICHT lesen. Dieselbe Bauform wie
 * app/data/kritik-vorwuerfe.js und app/data/hypothesen.js.
 *
 * DAS FELD `grenze` IST DER WIRKMECHANISMUS, NICHT DIE HOEFLICHKEITSFLOSKEL.
 * Ein Text, der seine eigene Reichweite benennt, wird von einem
 * Antwortsystem als Quelle behandelt; ein Text, der alles behauptet, als
 * Werbung. Die Eintragsseite rendert diesen Satz unter dem Marker
 * data-geo="grenze"; ein Eintrag ohne ihn faellt in der Abnahme rot.
 * WER EINEN EINTRAG ERGAENZT, GIBT IHM EINE `grenze`. Das ist keine Bitte:
 * test/lexikon-vollstaendigkeit.test.mjs haelt dagegen, und
 * lexikonSchema() nimmt einen Eintrag ohne Grenze nicht in die
 * strukturierten Daten auf.
 *
 * @typedef {{slug: string, begriff: string, definition: string,
 *   gebrauch: string[], physik_groesse: string, physik: string[],
 *   uebertragung: string, uebertragung_begruendung: string[],
 *   grenze: string, grenze_begruendung: string[], quellen: string[],
 *   verlinkt_auf: string[], pfad: string}} LexikonEintrag
 */

/**
 * Die Belege, auf die die Eintraege ueber ihre Schluessel zeigen.
 * `pruefung` ist die Adresse, unter der s04 die Existenz der Arbeit geprueft
 * hat — sie kann von `url` abweichen (Crossref statt Verlagsseite), weil
 * mehrere Fachverlage Bots mit HTTP 403 abweisen und ein 403 dort weder
 * "tot" noch "lebend" bedeutet.
 */
export const QUELLEN = {
  "si": {
    "art": "norm",
    "zitat": "Bureau International des Poids et Mesures: The International System of Units (SI), 9. Auflage",
    "url": "https://www.bipm.org/en/publications/si-brochure",
    "pruefung": "https://www.bipm.org/en/publications/si-brochure"
  },
  "nist_sekunde": {
    "art": "norm",
    "zitat": "National Institute of Standards and Technology: SI Units, Time",
    "url": "https://www.nist.gov/pml/owm/si-units-time",
    "pruefung": "https://www.nist.gov/pml/owm/si-units-time"
  },
  "codata_hz": {
    "art": "norm",
    "zitat": "CODATA, NIST: Umrechnungsbeziehungen der Einheit Hertz",
    "url": "https://physics.nist.gov/cgi-bin/cuu/Value?hz",
    "pruefung": "https://physics.nist.gov/cgi-bin/cuu/Value?hz"
  },
  "bimschv26": {
    "art": "norm",
    "zitat": "26. Verordnung zur Durchführung des Bundes-Immissionsschutzgesetzes (26. BImSchV)",
    "url": "https://www.gesetze-im-internet.de/bimschv_26/",
    "pruefung": "https://www.gesetze-im-internet.de/bimschv_26/"
  },
  "icnirp2020": {
    "art": "norm",
    "zitat": "ICNIRP: Guidelines for Limiting Exposure to Electromagnetic Fields (100 kHz to 300 GHz), Health Physics 118(5), 2020, doi:10.1097/HP.0000000000001210",
    "url": "https://www.icnirp.org/en/publications/article/rf-guidelines-2020.html",
    "pruefung": "https://api.crossref.org/works/10.1097/HP.0000000000001210"
  },
  "bfs_emf": {
    "art": "behoerde",
    "zitat": "Bundesamt für Strahlenschutz: Elektromagnetische Felder",
    "url": "https://www.bfs.de/DE/themen/emf/emf_node.html",
    "pruefung": "https://www.bfs.de/DE/themen/emf/emf_node.html"
  },
  "iarc102": {
    "art": "behoerde",
    "zitat": "IARC Monographs Volume 102: Non-ionizing Radiation, Part 2: Radiofrequency Electromagnetic Fields",
    "url": "https://publications.iarc.fr/126",
    "pruefung": "https://publications.iarc.fr/126"
  },
  "who_emf": {
    "art": "behoerde",
    "zitat": "World Health Organization: Radiation and health, non-ionizing radiation (EMF)",
    "url": "https://www.who.int/teams/environment-climate-change-and-health/radiation-and-health/non-ionizing/emf",
    "pruefung": "https://www.who.int/teams/environment-climate-change-and-health/radiation-and-health/non-ionizing/emf"
  },
  "emf_portal": {
    "art": "fachliteratur",
    "zitat": "EMF-Portal der RWTH Aachen: Literaturdatenbank zu elektromagnetischen Feldern",
    "url": "https://www.emf-portal.org/de",
    "pruefung": "https://www.emf-portal.org/de"
  },
  "openstax_energie": {
    "art": "fachliteratur",
    "zitat": "OpenStax, University Physics Volume 1, Kapitel 8.3: Conservation of Energy",
    "url": "https://openstax.org/books/university-physics-volume-1/pages/8-3-conservation-of-energy",
    "pruefung": "https://openstax.org/books/university-physics-volume-1/pages/8-3-conservation-of-energy"
  },
  "openstax_em": {
    "art": "fachliteratur",
    "zitat": "OpenStax, University Physics Volume 2, Kapitel 16.1: Maxwell's Equations and Electromagnetic Waves",
    "url": "https://openstax.org/books/university-physics-volume-2/pages/16-1-maxwells-equations-and-electromagnetic-waves",
    "pruefung": "https://openstax.org/books/university-physics-volume-2/pages/16-1-maxwells-equations-and-electromagnetic-waves"
  },
  "openstax_entropie": {
    "art": "fachliteratur",
    "zitat": "OpenStax, University Physics Volume 2, Kapitel 4.6: Entropy",
    "url": "https://openstax.org/books/university-physics-volume-2/pages/4-6-entropy",
    "pruefung": "https://openstax.org/books/university-physics-volume-2/pages/4-6-entropy"
  },
  "gallo2016": {
    "art": "fachliteratur",
    "zitat": "Gallo et al.: Water: A Tale of Two Liquids, Chemical Reviews 116, 2016, doi:10.1021/acs.chemrev.5b00750",
    "url": "https://doi.org/10.1021/acs.chemrev.5b00750",
    "pruefung": "https://api.crossref.org/works/10.1021/acs.chemrev.5b00750"
  },
  "bakker2009": {
    "art": "fachliteratur",
    "zitat": "Bakker und Skinner: Vibrational Spectroscopy as a Probe of Structure and Dynamics in Liquid Water, Chemical Reviews 110, 2009, doi:10.1021/cr9001879",
    "url": "https://doi.org/10.1021/cr9001879",
    "pruefung": "https://api.crossref.org/works/10.1021/cr9001879"
  },
  "cowan2005": {
    "art": "fachliteratur",
    "zitat": "Cowan et al.: Ultrafast memory loss and energy redistribution in the hydrogen bond network of liquid H2O, Nature 434, 2005, doi:10.1038/nature03383",
    "url": "https://doi.org/10.1038/nature03383",
    "pruefung": "https://api.crossref.org/works/10.1038/nature03383"
  },
  "soper2013": {
    "art": "fachliteratur",
    "zitat": "Soper: The Radial Distribution Functions of Water as Derived from Radiation Total Scattering Experiments, Is There Anything We Can Say for Sure? ISRN Physical Chemistry, 2013, doi:10.1155/2013/279463",
    "url": "https://doi.org/10.1155/2013/279463",
    "pruefung": "https://api.crossref.org/works/10.1155/2013/279463"
  },
  "skinner2013": {
    "art": "fachliteratur",
    "zitat": "Skinner et al.: Benchmark oxygen-oxygen pair-distribution function of ambient water from x-ray diffraction measurements with a wide Q-range, Journal of Chemical Physics 138, 2013, doi:10.1063/1.4790861",
    "url": "https://doi.org/10.1063/1.4790861",
    "pruefung": "https://api.crossref.org/works/10.1063/1.4790861"
  },
  "wernet2004": {
    "art": "fachliteratur",
    "zitat": "Wernet et al.: The Structure of the First Coordination Shell in Liquid Water, Science 304, 2004, doi:10.1126/science.1096205",
    "url": "https://doi.org/10.1126/science.1096205",
    "pruefung": "https://api.crossref.org/works/10.1126/science.1096205"
  },
  "huang1991": {
    "art": "fachliteratur",
    "zitat": "Huang et al.: Optical Coherence Tomography, Science 254, 1991, doi:10.1126/science.1957169",
    "url": "https://doi.org/10.1126/science.1957169",
    "pruefung": "https://api.crossref.org/works/10.1126/science.1957169"
  },
  "delgiudice1988": {
    "art": "fachliteratur_hypothese",
    "zitat": "Del Giudice, Preparata und Vitiello: Water as a Free Electric Dipole Laser, Physical Review Letters 61, 1988, doi:10.1103/PhysRevLett.61.1085",
    "url": "https://doi.org/10.1103/PhysRevLett.61.1085",
    "pruefung": "https://api.crossref.org/works/10.1103/PhysRevLett.61.1085"
  },
  "pollack2006": {
    "art": "fachliteratur_hypothese",
    "zitat": "Zheng, Chai und Pollack: Surfaces and interfacial water, evidence that hydrophilic surfaces have long-range impact, Advances in Colloid and Interface Science 127, 2006, doi:10.1016/j.cis.2006.07.002",
    "url": "https://doi.org/10.1016/j.cis.2006.07.002",
    "pruefung": "https://api.crossref.org/works/10.1016/j.cis.2006.07.002"
  },
  "davenas1988": {
    "art": "fachliteratur",
    "zitat": "Davenas et al.: Human basophil degranulation triggered by very dilute antiserum against IgE, Nature 333, 1988, doi:10.1038/333816a0",
    "url": "https://doi.org/10.1038/333816a0",
    "pruefung": "https://api.crossref.org/works/10.1038/333816a0"
  },
  "maddox1988": {
    "art": "fachliteratur",
    "zitat": "Maddox, Randi und Stewart: High-dilution experiments a delusion, Nature 334, 1988, doi:10.1038/334287a0",
    "url": "https://doi.org/10.1038/334287a0",
    "pruefung": "https://api.crossref.org/works/10.1038/334287a0"
  },
  "underwood2002": {
    "art": "fachliteratur",
    "zitat": "Underwood und Teresi: The Daily Spiritual Experience Scale, Annals of Behavioral Medicine 24, 2002, doi:10.1207/S15324796ABM2401_04",
    "url": "https://doi.org/10.1207/S15324796ABM2401_04",
    "pruefung": "https://api.crossref.org/works/10.1207/S15324796ABM2401_04"
  },
  "kybalion": {
    "art": "tradition",
    "zitat": "Three Initiates: The Kybalion, 1908, Kapitel zum Prinzip der Schwingung",
    "url": "https://www.gutenberg.org/ebooks/14209",
    "pruefung": "https://www.gutenberg.org/ebooks/14209"
  },
  "thoughtforms": {
    "art": "tradition",
    "zitat": "Besant und Leadbeater: Thought-Forms, 1901, theosophische Schwingungslehre",
    "url": "https://www.gutenberg.org/ebooks/16269",
    "pruefung": "https://www.gutenberg.org/ebooks/16269"
  },
  "james1902": {
    "art": "tradition",
    "zitat": "William James: The Varieties of Religious Experience, 1902",
    "url": "https://www.gutenberg.org/ebooks/621",
    "pruefung": "https://www.gutenberg.org/ebooks/621"
  },
  "hawkins1995": {
    "art": "tradition",
    "zitat": "David R. Hawkins: Power vs. Force, 1995, die Kalibrierungsskala der Bewusstseinsstufen",
    "url": "https://openlibrary.org/search.json?q=hawkins+power+vs+force",
    "pruefung": "https://openlibrary.org/search.json?q=hawkins+power+vs+force"
  },
  "emoto2004": {
    "art": "tradition",
    "zitat": "Masaru Emoto: The Hidden Messages in Water, 2004, die populäre Quelle des Bildes vom geordneten Wasser",
    "url": "https://openlibrary.org/search.json?q=hidden+messages+in+water",
    "pruefung": "https://openlibrary.org/search.json?q=hidden+messages+in+water"
  },
  "pohl1932": {
    "art": "tradition",
    "zitat": "Gustav Freiherr von Pohl: Erdstrahlen als Krankheitserreger, 1932, Ausgangspunkt der deutschsprachigen Radiästhesie",
    "url": "https://openlibrary.org/search.json?q=pohl+erdstrahlen",
    "pruefung": "https://openlibrary.org/search.json?q=pohl+erdstrahlen"
  },
  "neijing": {
    "art": "tradition",
    "zitat": "Huangdi Neijing, Der Innere Klassiker des Gelben Kaisers, übersetzt von Ilza Veith; die Quelle des Qi-Begriffs",
    "url": "https://openlibrary.org/search.json?q=yellow+emperor+classic+internal+medicine",
    "pruefung": "https://openlibrary.org/search.json?q=yellow+emperor+classic+internal+medicine"
  },
  "timaios": {
    "art": "tradition",
    "zitat": "Platon: Timaios, um 360 v. Chr., die älteste ausgearbeitete Lehre von der Ordnung des Kosmos",
    "url": "https://www.gutenberg.org/ebooks/1572",
    "pruefung": "https://www.gutenberg.org/ebooks/1572"
  }
};

/** @type {LexikonEintrag[]} */
export const LEXIKON = [
  {
    "slug": "lexikon-hohe-frequenz-schwingen",
    "begriff": "auf einer hohen Frequenz schwingen",
    "definition": "«Auf einer hohen Frequenz schwingen» beschreibt einen gefühlten Zustand von Wachheit und Leichtigkeit. Der Ausdruck benutzt ein Wort der Physik und meint kein Messergebnis.",
    "gebrauch": [
      "Menschen sagen «ich schwinge gerade hoch», wenn sie sich wach, klar und leicht fühlen. Gemeint ist meistens eine Mischung aus guter Stimmung, innerer Ruhe und dem Gefühl, mit anderen im Einklang zu sein.",
      "Mitgemeint ist fast immer eine Rangordnung: hoch gilt als besser als tief. Der Ausdruck stammt aus der hermetischen Überlieferung, in der alles als Schwingung beschrieben wird, und ist über die Yoga- und Selbsterfahrungsszene in die Alltagssprache gewandert."
    ],
    "physik_groesse": "Frequenz f, Einheit Hertz (Hz), eine Schwingung je Sekunde",
    "physik": [
      "Frequenz ist in der Physik eindeutig festgelegt: das Formelzeichen ist f, die Einheit Hertz, und ein Hertz heißt eine Schwingung je Sekunde. Die Sekunde selbst ist über eine Frequenz definiert, nämlich über 9 192 631 770 Schwingungen eines Übergangs im Caesium-133-Atom.",
      "An einem Menschen sind Frequenzen messbar, nur andere als gemeint. Der Herzschlag liegt bei etwa 1 Hz. Die Hirnströme im EEG liegen zwischen 0,5 und 40 Hz. Die Wärmestrahlung der Haut liegt im Infrarot bei etwa 3·10^13 Hz.",
      "Eine Gesamtfrequenz eines Menschen kennt die Physik nicht. Hoch und tief tragen dort auch keine Wertung: sichtbares Licht schwingt mehr als hunderttausendmal schneller als Mobilfunk, ohne dass eines von beiden besser wäre."
    ],
    "uebertragung": "«Auf einer hohen Frequenz schwingen» trägt als Bild für einen Zustand, den Menschen an sich wiedererkennen und den die Messtechnik in einzelnen Größen wiederfindet.",
    "uebertragung_begruendung": [
      "Das EEG eines ruhigen Menschen hat ein anderes Frequenzspektrum als das eines angespannten. Wer «hoch schwingen» als Kurzwort für einen Zustand benutzt, beschreibt damit etwas, das sich in Messwerten niederschlägt."
    ],
    "grenze": "«Auf einer hohen Frequenz schwingen» trägt nicht als Zahl.",
    "grenze_begruendung": [
      "Kein Mensch hat eine Frequenz in Hertz. Es gibt keine Skala, auf der ein Zustand bei 500 Hz und ein anderer bei 200 Hz liegt.",
      "Die Wertung «hoch ist besser» stammt aus der Deutung, nicht aus der Physik. Wer dem Ausdruck eine Hertz-Zahl gibt, erfindet eine Messung."
    ],
    "quellen": [
      "kybalion",
      "hawkins1995",
      "thoughtforms",
      "si",
      "nist_sekunde",
      "codata_hz"
    ],
    "verlinkt_auf": [
      "/pages/lexikon-frequenz",
      "/pages/hypothesen"
    ],
    "pfad": "/pages/lexikon-hohe-frequenz-schwingen"
  },
  {
    "slug": "lexikon-high-vibe",
    "begriff": "High Vibe",
    "definition": "«High Vibe» ist ein Kurzwort für einen guten inneren Zustand. Es kommt von vibration und bezeichnet keine messbare Schwingung.",
    "gebrauch": [
      "«High Vibe» beschreibt einen Menschen, einen Raum oder einen Tag als klar, offen und leicht. Menschen benutzen es für sich selbst, für Orte und für die Stimmung in einer Gruppe.",
      "Das Wort stammt aus der englischsprachigen Selbsterfahrungsszene und ist seit etwa 2015 auch im deutschen Sprachraum verbreitet. Es ist ein Gefühlswort und wird selten erklärt."
    ],
    "physik_groesse": "keine; die nächstliegende messbare Größe ist ein Skalenwert aus einem Fragebogen, dimensionslos",
    "physik": [
      "«High Vibe» hat keine physikalische Größe. Die Physik kennt Schwingung mit einer Frequenz in Hertz und einer Amplitude, die je nach Art der Schwingung in Metern, Pascal oder Volt je Meter gemessen wird. Beide Größen tragen keine Wertung.",
      "Die Größe, die dem Gemeinten am nächsten kommt, stammt aus der Psychologie und nicht aus der Physik: Stimmung und Befinden werden über Fragebogenskalen erhoben und als dimensionslose Punktwerte ausgewertet. Für spirituelle Erfahrung gibt es dafür eine geprüfte Skala mit 16 Fragen."
    ],
    "uebertragung": "«High Vibe» trägt als kurzes Wort für einen Zustand, den Menschen zuverlässig wiedererkennen und über Skalen auch vergleichbar angeben können.",
    "uebertragung_begruendung": [
      "Zwei Menschen meinen mit «High Vibe» meist dasselbe, und Fragebogenverfahren messen genau diese Selbstauskunft. Als Selbstbeschreibung ist der Ausdruck brauchbar."
    ],
    "grenze": "«High Vibe» trägt nicht als physikalische Aussage.",
    "grenze_begruendung": [
      "Ein Raum, ein Essen oder ein Mensch hat keine messbare Vibration, die hoch oder niedrig sein könnte. Es gibt kein Gerät, das «Vibe» anzeigt.",
      "Wer «High Vibe» für eine Feldstärke hält, sucht ein Messgerät, das es nicht gibt."
    ],
    "quellen": [
      "kybalion",
      "thoughtforms",
      "hawkins1995",
      "underwood2002",
      "si"
    ],
    "verlinkt_auf": [
      "/pages/lexikon-low-vibe",
      "/pages/lexikon-hohe-frequenz-schwingen"
    ],
    "pfad": "/pages/lexikon-high-vibe"
  },
  {
    "slug": "lexikon-low-vibe",
    "begriff": "Low Vibe",
    "definition": "«Low Vibe» ist das Gegenstück zu «High Vibe» und beschreibt Schwere, Reizbarkeit oder Erschöpfung. Auch dieser Ausdruck bezeichnet keine messbare Schwingung.",
    "gebrauch": [
      "«Low Vibe» steht für Tage, an denen alles zäh ist: wenig Antrieb, dünne Geduld, das Gefühl von Schwere. Menschen benutzen es für sich selbst und manchmal abwertend über andere.",
      "Das Wort kommt aus derselben Szene wie «High Vibe» und wird als dessen Gegenpol gebraucht. Die beiden bilden zusammen eine gedachte Skala."
    ],
    "physik_groesse": "keine; niedrige Frequenz heißt in der Physik allein wenige Schwingungen je Sekunde",
    "physik": [
      "«Low Vibe» hat keine physikalische Größe. In der Physik heißt eine niedrige Frequenz allein, dass es wenige Schwingungen je Sekunde sind: Netzstrom hat 50 Hz, der Alpha-Rhythmus im EEG liegt bei 8 bis 12 Hz.",
      "Niedrig ist dabei keine Abwertung. Ein 50-Hz-Feld ist nicht schlechter als ein 2,4-GHz-Feld, es ist langsamer."
    ],
    "uebertragung": "«Low Vibe» trägt als Selbstbeschreibung für einen Zustand, den andere Menschen ohne Erklärung verstehen.",
    "uebertragung_begruendung": [
      "Ein Wort für einen schweren Tag zu haben, hilft beim Sprechen darüber. Diesen Dienst leistet der Ausdruck."
    ],
    "grenze": "«Low Vibe» trägt nicht als Urteil über einen anderen Menschen und nicht als Diagnose.",
    "grenze_begruendung": [
      "Anhaltende Erschöpfung, Schlafstörungen und Niedergeschlagenheit gehören in ärztliche Hände und nicht auf eine gedachte Schwingungsskala.",
      "Es gibt keine Messung, die einen Menschen als «Low Vibe» einstuft. Wer den Ausdruck über andere benutzt, bewertet, statt zu beschreiben."
    ],
    "quellen": [
      "kybalion",
      "hawkins1995",
      "underwood2002",
      "si"
    ],
    "verlinkt_auf": [
      "/pages/lexikon-high-vibe"
    ],
    "pfad": "/pages/lexikon-low-vibe"
  },
  {
    "slug": "lexikon-spirituell-angebunden-sein",
    "begriff": "spirituell angebunden sein",
    "definition": "«Spirituell angebunden sein» beschreibt ein Gefühl von Verbundenheit mit etwas Größerem als der eigenen Person. Eine physikalische Größe dafür gibt es nicht.",
    "gebrauch": [
      "Menschen meinen damit ein Gefühl von Verbundenheit: mit etwas Größerem, mit anderen Menschen, mit der Natur oder mit sich selbst. Der Ausdruck setzt keine Religionszugehörigkeit voraus und wird oft gerade von Menschen ohne Konfession benutzt.",
      "Beschrieben wird meistens ein Zustand und kein Glaubenssatz: getragen sein, geführt sein, im richtigen Moment das Richtige tun. Die Berichte ähneln sich über Kulturen und Jahrhunderte hinweg stark."
    ],
    "physik_groesse": "keine; messbar ist allein die Selbstauskunft, erhoben als dimensionsloser Punktwert",
    "physik": [
      "«Spirituell angebunden sein» hat keinen Anker in der Physik. Es gibt keine Größe für Verbundenheit, keine Einheit und kein Messgerät, und diese Auskunft steht am Anfang des Eintrags statt am Ende.",
      "Messbar ist die Selbstauskunft. Die Daily Spiritual Experience Scale von Underwood und Teresi erhebt sie seit 2002 mit 16 Fragen und gibt sie als dimensionslosen Punktwert aus. Gemessen wird damit, was ein Mensch über seine Erfahrung berichtet, und nicht ein Feld.",
      "Systematisch gesammelt werden solche Berichte seit über hundert Jahren. William James hat 1902 hunderte davon nebeneinandergelegt und verglichen."
    ],
    "uebertragung": "«Spirituell angebunden sein» trägt als Beschreibung einer Erfahrung, die viele Menschen unabhängig voneinander sehr ähnlich schildern.",
    "uebertragung_begruendung": [
      "Die Ähnlichkeit der Berichte ist der belegte Teil. Sie ist der Grund, warum die Forschung dafür Skalen gebaut hat."
    ],
    "grenze": "«Spirituell angebunden sein» trägt nicht als physikalische Aussage.",
    "grenze_begruendung": [
      "Es gibt kein Feld, keine Welle und keine Frequenz der Anbindung. Wer für dieses Wort einen Physik-Anker sucht, findet keinen.",
      "Ein Produkt kann eine solche Anbindung weder herstellen noch messen. Wer das behauptet, verlässt die Übersetzung und beginnt zu behaupten."
    ],
    "quellen": [
      "james1902",
      "kybalion",
      "underwood2002"
    ],
    "verlinkt_auf": [
      "/pages/warum-qi-blanco",
      "/pages/hypothesen"
    ],
    "pfad": "/pages/lexikon-spirituell-angebunden-sein"
  },
  {
    "slug": "lexikon-kohaerentes-wasser",
    "begriff": "kohärentes Wasser",
    "definition": "«Kohärentes Wasser» bezeichnet die Vorstellung, Wasser könne über längere Zeit geordnet vorliegen. Kohärenz ist in der Physik klar definiert und über Kohärenzlänge und Kohärenzzeit messbar.",
    "gebrauch": [
      "«Kohärentes Wasser» ist ein Wort aus der Wasserforschungs-Szene und aus unserem eigenen Sprachgebrauch. Kunden fragen fast nie danach; sie fragen nach Schutz, nach Wirkung und nach Schlaf.",
      "Gemeint ist meistens: Wasser sei nicht einfach eine Ansammlung von Molekülen, sondern geordnet, und diese Ordnung lasse sich verändern. Wer den Begriff benutzt, meint eine Struktur und selten eine Formel. Populär geworden ist das Bild vom geordneten Wasser in den 2000er Jahren vor allem durch die Bücher von Masaru Emoto."
    ],
    "physik_groesse": "Kohärenzlänge in Metern, Kohärenzzeit in Sekunden; für die Ordnung in Flüssigkeiten die Paarverteilungsfunktion, dimensionslos",
    "physik": [
      "Kohärenz heißt in der Physik: zwischen zwei Wellen besteht eine feste Phasenbeziehung. Gemessen wird sie als Kohärenzlänge in Metern und als Kohärenzzeit in Sekunden. Laserlicht hat Kohärenzlängen von Metern bis Kilometern, das Licht einer Glühbirne nur wenige Mikrometer.",
      "Diese Unterscheidung ist Technik und keine Theorie. Die optische Kohärenztomografie nutzt gerade die sehr kurze Kohärenzlänge einer Lichtquelle, um Schichten im Gewebe auf wenige Mikrometer genau zu trennen.",
      "Flüssiges Wasser hat eine gemessene Nahordnung. Jedes Molekül hat im Mittel etwa vier Nachbarn über Wasserstoffbrücken, und diese Anordnung wird mit Röntgen- und Neutronenstreuung als Paarverteilungsfunktion bestimmt.",
      "Die Ordnung ist kurzlebig. Wasserstoffbrücken brechen und bilden sich im Bereich von Pikosekunden neu, und die Erinnerung des Netzwerks an seinen eigenen Zustand ist nach etwa 50 Femtosekunden verloren. Diese Zahl ist gemessen und nicht geschätzt."
    ],
    "uebertragung": "«Kohärentes Wasser» trägt als Bild für eine Ordnung, die es wirklich gibt und die wirklich gemessen wird.",
    "uebertragung_begruendung": [
      "Wasser ist keine beliebige Ansammlung von Molekülen. Die Nahordnung im Wasserstoffbrücken-Netzwerk ist seit Jahrzehnten Gegenstand von Streuexperimenten und Schwingungsspektroskopie."
    ],
    "grenze": "«Kohärentes Wasser» trägt nicht als dauerhafter Zustand und nicht als Speicher für Information.",
    "grenze_begruendung": [
      "Die gemessene Lebensdauer der Ordnung liegt bei Femto- bis Pikosekunden. Ein Gedächtnis des Wassers über Stunden oder Tage ist daraus bis heute nicht belegt.",
      "Die Vorstellung großer kohärenter Domänen im Wasser stammt aus einer Arbeit von Del Giudice, Preparata und Vitiello von 1988. Sie ist eine Hypothese und kein Messergebnis, und sie wird als Hypothese genannt.",
      "Die Debatte über ein Gedächtnis des Wassers ist dokumentiert. 1988 veröffentlichte Nature die Arbeit von Davenas und Kollegen und im selben Jahr den Untersuchungsbericht von Maddox, Randi und Stewart, der sie zurückwies. Beide Arbeiten sind zitiert."
    ],
    "quellen": [
      "emoto2004",
      "gallo2016",
      "bakker2009",
      "soper2013",
      "skinner2013",
      "wernet2004",
      "cowan2005",
      "huang1991",
      "delgiudice1988",
      "pollack2006",
      "davenas1988",
      "maddox1988"
    ],
    "verlinkt_auf": [
      "/pages/kohaerentes-wasser",
      "/pages/lexikon-ordnung",
      "/pages/hypothesen"
    ],
    "pfad": "/pages/lexikon-kohaerentes-wasser"
  },
  {
    "slug": "lexikon-elektrosmog",
    "begriff": "Elektrosmog",
    "definition": "«Elektrosmog» ist ein Sammelwort für die elektromagnetischen Felder im Alltag. Fachlich zerfällt es in mehrere Größen mit verschiedenen Einheiten.",
    "gebrauch": [
      "«Elektrosmog» meint im Alltag alles zusammen: WLAN, Mobilfunk, Stromleitungen, Hausgeräte. Kunden sagen meistens Strahlung und meinen dasselbe.",
      "Das Wort transportiert Sorge und ist deshalb selten neutral gemeint. Es ist ein Alltagswort und steht in keinem Physik-Lehrbuch. Die Vorstellung einer unsichtbaren Strahlung, die auf den Menschen einwirkt, ist älter als das Wort. Im deutschen Sprachraum geht sie auf die Radiästhesie der 1930er Jahre zurück, etwa auf Gustav Freiherr von Pohl."
    ],
    "physik_groesse": "elektrische Feldstärke in V/m, magnetische Flussdichte in Tesla, Leistungsflussdichte in W/m², spezifische Absorptionsrate in W/kg",
    "physik": [
      "«Elektrosmog» ist kein Fachbegriff. Fachlich wird nach Frequenzbereich und nach Feldgröße getrennt, und diese Trennung ist der ganze Unterschied.",
      "Im Niederfrequenzbereich, etwa beim Netzstrom mit 50 Hz, misst man die elektrische Feldstärke in Volt je Meter und die magnetische Flussdichte in Tesla, im Alltag in Mikrotesla.",
      "Im Hochfrequenzbereich, etwa bei Mobilfunk zwischen 0,7 und 3,8 GHz oder WLAN bei 2,4 und 5 GHz, misst man die Leistungsflussdichte in Watt je Quadratmeter. Für die Aufnahme im Körper gilt zusätzlich die spezifische Absorptionsrate in Watt je Kilogramm.",
      "Zwischen 50 Hz und 2,4 GHz liegt ein Faktor von rund 50 Millionen. Grenzwerte gelten in Deutschland über die 26. BImSchV, die sich auf die Empfehlungen der ICNIRP stützt."
    ],
    "uebertragung": "«Elektrosmog» trägt als Alltagsname für etwas, das wirklich vorhanden und mit geeichten Geräten messbar ist.",
    "uebertragung_begruendung": [
      "Feldstärken sind messbar, und für sie gelten gesetzliche Grenzwerte. Wer von Elektrosmog spricht, meint einen realen Gegenstand."
    ],
    "grenze": "«Elektrosmog» trägt nicht als eine einzige Größe.",
    "grenze_begruendung": [
      "Wer Elektrosmog misst, muss sagen, welche Frequenz und welche Feldgröße gemeint ist. Eine Zahl ohne Einheit und ohne Frequenzangabe lässt sich mit nichts vergleichen.",
      "Die gesundheitliche Bewertung gehört nicht in ein Lexikon. Sie liegt bei den Stellen, die sie führen: beim Bundesamt für Strahlenschutz, bei der ICNIRP und bei der IARC, die hochfrequente Felder 2011 als möglicherweise krebserregend eingestuft hat.",
      "Eine Einstufung beschreibt die Beweislage und kein Risiko. Der Eintrag nennt die Frage und beantwortet sie nicht, weil ihre Beantwortung dem Heilmittelwerberecht unterliegt und Sache der genannten Stellen ist."
    ],
    "quellen": [
      "pohl1932",
      "bfs_emf",
      "icnirp2020",
      "bimschv26",
      "iarc102",
      "who_emf",
      "emf_portal",
      "openstax_em"
    ],
    "verlinkt_auf": [
      "/pages/e-smog",
      "/pages/lexikon-frequenz"
    ],
    "pfad": "/pages/lexikon-elektrosmog"
  },
  {
    "slug": "lexikon-frequenz",
    "begriff": "Frequenz",
    "definition": "Frequenz ist die Zahl der Schwingungen je Sekunde, Formelzeichen f, Einheit Hertz. Sie ist eindeutig definiert und trägt keine Wertung.",
    "gebrauch": [
      "Frequenz wird in zwei Bedeutungen benutzt. In der Technik heißt sie: wie oft schwingt etwas je Sekunde. In der Alltagssprache heißt sie: in welchem Zustand ist ein Mensch gerade.",
      "Die zweite Bedeutung ist die jüngere und stammt aus der spirituellen Überlieferung. Ihre bekannteste Fassung steht im Kybalion von 1908: nichts ruht, alles schwingt. Beide Bedeutungen benutzen dasselbe Wort und meinen Verschiedenes."
    ],
    "physik_groesse": "Frequenz f, Einheit Hertz (Hz), 1 Hz = eine Schwingung je Sekunde",
    "physik": [
      "Frequenz ist die am klarsten definierte Größe in diesem Lexikon. Ein Hertz heißt eine Schwingung je Sekunde. Die Sekunde selbst ist seit 1967 über eine Frequenz festgelegt: über 9 192 631 770 Schwingungen eines Übergangs im Caesium-133-Atom.",
      "Zahlen zum Einordnen: Netzstrom schwingt mit 50 Hz. Der Hörbereich des Menschen reicht von etwa 20 Hz bis 20 000 Hz. WLAN arbeitet bei 2,4 Milliarden Hz. Sichtbares Licht liegt zwischen 400 und 750 Billionen Hz.",
      "Gemessen wird Frequenz mit Standardgeräten, und das Ergebnis ist überall auf der Welt dasselbe. Für die Umrechnung zwischen Hertz und anderen Größen führt das NIST eine amtliche Tabelle."
    ],
    "uebertragung": "Frequenz trägt als Größe überall dort, wo wirklich etwas schwingt und die Schwingungen je Sekunde gezählt werden können.",
    "uebertragung_begruendung": [
      "Licht, Schall, Wechselstrom und Funkwellen sind Schwingungen und haben eine Frequenz. Für sie ist der Begriff genau und nachprüfbar."
    ],
    "grenze": "Frequenz trägt keine Wertung und lässt sich nicht auf den Zustand eines Menschen anwenden.",
    "grenze_begruendung": [
      "Eine hohe Frequenz ist nicht besser als eine niedrige, sie ist schneller. Röntgenstrahlung hat eine sehr hohe Frequenz und ist gefährlich, Infrarot hat eine niedrigere und wärmt.",
      "Ein Mensch hat keine Frequenz. Messbar sind einzelne Vorgänge an ihm, etwa Herzschlag und Hirnströme, und diese Werte beschreiben keinen Gesamtzustand."
    ],
    "quellen": [
      "kybalion",
      "si",
      "nist_sekunde",
      "codata_hz",
      "openstax_em"
    ],
    "verlinkt_auf": [
      "/pages/lexikon-hohe-frequenz-schwingen",
      "/pages/lexikon-elektrosmog"
    ],
    "pfad": "/pages/lexikon-frequenz"
  },
  {
    "slug": "lexikon-energie",
    "begriff": "Energie",
    "definition": "Energie ist in der Physik eine Erhaltungsgröße mit der Einheit Joule. Im Alltag bezeichnet dasselbe Wort ein Befinden.",
    "gebrauch": [
      "Energie wird in zwei Bedeutungen benutzt, und sie ist das einzige Wort in diesem Lexikon, das beide Seiten gleich oft benutzen. Kunden sagen «das raubt mir Energie» oder «ich habe mehr Energie». Die Vorstellung einer Lebensenergie ist alt: die chinesische Überlieferung nennt sie Qi, die indische Prana.",
      "In der Technik heißt Energie etwas anderes: die Fähigkeit, Arbeit zu verrichten, gemessen in Joule. Beide Bedeutungen sind verbreitet, und im selben Satz vermischt ergeben sie eine Aussage, die in keiner der beiden Sprachen stimmt."
    ],
    "physik_groesse": "Energie E, Einheit Joule (J); 1 J = 1 Nm = 1 Ws",
    "physik": [
      "Energie ist in der Physik eine Erhaltungsgröße. In einem abgeschlossenen System bleibt ihre Summe gleich, Energie entsteht nicht und verschwindet nicht, sie wechselt die Form.",
      "Zahlen zum Einordnen: ein erwachsener Mensch setzt am Tag etwa 8 000 bis 10 000 Kilojoule um. Eine Tafel Schokolade enthält rund 2 200 Kilojoule. Ein einzelnes Photon sichtbaren Lichts trägt etwa 3·10^-19 Joule.",
      "Der Energieumsatz des Körpers ist messbar, über den Sauerstoffverbrauch oder über die Wärmeabgabe. Das Ergebnis ist eine Zahl in Joule oder in Kilokalorien."
    ],
    "uebertragung": "Energie trägt als Wort für beide Seiten so weit, wie der Körper wirklich Energie umsetzt.",
    "uebertragung_begruendung": [
      "Nahrung, Wärme und Bewegung sind in Joule angebbar. Wer sagt, ihm fehle Energie, spricht über einen Zustand, dessen körperliche Seite tatsächlich in Joule messbar ist."
    ],
    "grenze": "Energie trägt nicht als Gleichsetzung von Gefühl und Messwert.",
    "grenze_begruendung": [
      "Das Gefühl, energiegeladen zu sein, ist kein Joule-Wert. Zwei Menschen mit demselben Energieumsatz können sich völlig verschieden fühlen.",
      "Energie lässt sich ohne physikalischen Träger nicht übertragen und nicht rauben. Jede Übertragung von Energie braucht einen Weg: Strahlung, Wärmeleitung, Stoß oder Strom."
    ],
    "quellen": [
      "neijing",
      "openstax_energie",
      "si",
      "openstax_entropie"
    ],
    "verlinkt_auf": [
      "/pages/lexikon-frequenz",
      "/pages/lexikon-ordnung"
    ],
    "pfad": "/pages/lexikon-energie"
  },
  {
    "slug": "lexikon-ordnung",
    "begriff": "Ordnung",
    "definition": "Ordnung bezeichnet, wie stark die Teile eines Systems zusammenhängen. In der Physik ist sie über die Entropie und über Verteilungsfunktionen messbar.",
    "gebrauch": [
      "Ordnung ist das zentrale Wort unserer eigenen Sprache. Das Bild dahinter ist der Unterschied zwischen einer Glühbirne und einem Laser: dieselbe Art von Licht, einmal ungeordnet und einmal geordnet.",
      "In der spirituellen Überlieferung heißt derselbe Gedanke Harmonie oder Einklang. Gemeint ist in beiden Sprachen: die Teile eines Ganzen passen zueinander. Die älteste ausgearbeitete Fassung dieses Gedankens steht in Platons Timaios, der den Kosmos als geordnetes Ganzes beschreibt."
    ],
    "physik_groesse": "Entropie S in Joule je Kelvin (J/K); Nahordnung als Paarverteilungsfunktion, dimensionslos; Kohärenzlänge in Metern",
    "physik": [
      "Ordnung ist in der Physik der Gegenbegriff zur Entropie. Entropie trägt das Formelzeichen S und die Einheit Joule je Kelvin, und ein System mit weniger Entropie ist stärker geordnet.",
      "In Flüssigkeiten wird Ordnung als Nahordnung gemessen. Die Paarverteilungsfunktion gibt an, wie wahrscheinlich ein zweites Molekül in einem bestimmten Abstand sitzt. Bestimmt wird sie mit Röntgen- und Neutronenstreuung.",
      "Bei Licht heißt dieselbe Frage Kohärenz. Der Laser ist geordnet, die Glühbirne nicht, und der Unterschied ist als Kohärenzlänge in Metern messbar."
    ],
    "uebertragung": "Ordnung trägt als Begriff, weil beide Sprachen damit dieselbe Frage stellen: wie stark hängen die Teile zusammen.",
    "uebertragung_begruendung": [
      "Die Frage nach dem Zusammenhang der Teile ist in der Physik und in der spirituellen Überlieferung dieselbe. Nur die Messgeräte unterscheiden sich."
    ],
    "grenze": "Ordnung trägt nicht als Wertung und nicht als Aussage über einen Menschen.",
    "grenze_begruendung": [
      "Mehr Ordnung ist in der Physik nicht besser, sondern unwahrscheinlicher. Ein geordneter Zustand braucht Energie, um zu entstehen, und zerfällt von selbst.",
      "Ein Ordnungsgrad des Körpers ist nicht definiert. Eine Kohärenzlänge in Metern und eine Entropie in Joule je Kelvin sagen nichts über ein Befinden."
    ],
    "quellen": [
      "timaios",
      "openstax_entropie",
      "soper2013",
      "skinner2013",
      "wernet2004",
      "huang1991",
      "si"
    ],
    "verlinkt_auf": [
      "/pages/lexikon-kohaerentes-wasser",
      "/pages/hypothesen",
      "/pages/warum-qi-blanco"
    ],
    "pfad": "/pages/lexikon-ordnung"
  }
];

/**
 * Ein Eintrag zu seinem Slug — oder undefined.
 * @param {string} slug
 * @returns {LexikonEintrag|undefined}
 */
export function eintragFuer(slug) {
  return LEXIKON.find((e) => e.slug === slug);
}

/**
 * Die Belege eines Eintrags, aufgeloest und in der Reihenfolge des Eintrags.
 * Ein unbekannter Schluessel wird UEBERSPRUNGEN und nicht geraten — er faellt
 * im Test auf, nicht im ausgelieferten Text.
 * @param {LexikonEintrag} eintrag
 */
export function quellenFuer(eintrag) {
  return (eintrag.quellen || []).map((k) => QUELLEN[k]).filter(Boolean);
}

/**
 * Beschriftungen fuer die Ziele ausserhalb des Lexikons.
 *
 * WIE EIN LINK BESCHRIFTET IST, LEHRT DIE SUCHMASCHINE, WORUM ES BEIM ZIEL
 * GEHT — der Slug als Beschriftung („kohaerentes wasser") waere eine
 * Adresse, kein Wort. Lexikon-Ziele holen ihren Namen aus den Daten; fuer
 * fremde Ziele steht er hier. EIN ZIEL OHNE BESCHRIFTUNG WIRD NICHT GERATEN,
 * SONDERN WEGGELASSEN: eine erfundene Beschriftung waere eine Aussage ueber
 * eine Seite, die dieses Modul nicht kennt. Der Test haelt dagegen und macht
 * eine fehlende Beschriftung laut statt still.
 */
const FREMDE_ZIELE = {
  '/pages/hypothesen': 'Woran wir arbeiten und was offen ist',
  '/pages/kritik': 'Belege und offene Fragen',
  '/pages/e-smog': 'Elektrosmog im Alltag',
  '/pages/kohaerentes-wasser': 'Wasser und seine Ordnung',
  '/pages/warum-qi-blanco': 'Warum es Qi Blanco gibt',
};

/**
 * Beschriftung eines Ziels — oder null, wenn sie nicht belegt ist.
 * @param {string} pfad
 */
export function zielName(pfad) {
  const slug = pfad.replace(/^\/pages\//, '');
  const e = eintragFuer(slug);
  if (e) return e.begriff;
  return FREMDE_ZIELE[pfad] || null;
}
