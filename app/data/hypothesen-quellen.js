/**
 * QUELLEN-SSoT der Hypothesen-Fläche `/pages/hypothesen`.
 *
 * REGEL DIESER DATEI (Auftrag 20260911-BAU-pages-hypothesen, Teil C): keine
 * Quelle, die wir nicht gelesen haben. Jede Arbeit hier liegt im Volltext in
 * der Hausbibliothek (wissens-bibliothek-rag/data/library.db, Feld `bibliothek`
 * = ihre Kennung dort); die wörtlichen Zitate wurden gegen diesen Volltext
 * geprüft und tragen die Seite. Was nicht im Volltext gelesen wurde, steht
 * hier nicht.
 *
 * JEDE QUELLE TRÄGT IHRE REICHWEITE: was untersucht wurde (an was, wie viele,
 * welche Methode), was gezeigt wurde — und den Satz, der über die ganze Seite
 * entscheidet: was diese Arbeit über UNSER Produkt NICHT aussagt. Der
 * naheliegendste Angriff auf eine Hypothesenseite lautet „sie zitieren
 * Pollack, aber Pollack hat nie ihren Anhänger untersucht". Er trifft — es sei
 * denn, er steht schon hier.
 *
 * SORTIERUNG: nach Rolle im Modell (Physik des Wassers -> Theorie ->
 * Grenzflächen an Metall/Feldern -> Wasser in der Zelle -> Strahlung und
 * Zellstress -> unsere eigenen Messungen -> Bücher, die uns geprägt haben).
 *
 * ECHTE UMLAUTE, kundensichtbar (Hausregel). Links: DOI, wo es einen gibt;
 * sonst der Verlag oder das Labor. Wo ein Link nicht mehr auflöst, steht das
 * dabei — die Arbeit ist deshalb nicht weniger real.
 */

/** Die Arten, in denen eine Quelle hier auftritt. */
export const QUELLENART = {
  messung: 'Experimentelle Arbeit',
  theorie: 'Theoretische Arbeit',
  uebersicht: 'Übersichtsarbeit / Behördenbericht',
  eigene: 'Von uns beauftragte Messung',
  buch: 'Buch',
};

/**
 * @typedef {Object} Quelle
 * @property {string} id            Kurzschlüssel, von hypothesen.js referenziert
 * @property {string} autor
 * @property {string} jahr
 * @property {string} titel
 * @property {string} wo            Zeitschrift / Verlag, Band, Seiten
 * @property {keyof typeof QUELLENART} art
 * @property {string} untersucht    An was, wie viele, welche Methode
 * @property {string} gezeigt       Was die Arbeit zeigt — in ihren Worten, nicht in unseren
 * @property {string} nichtUeberUns Was diese Arbeit über unser Produkt NICHT aussagt
 * @property {string} [zitat]       Wörtliches Zitat, gegen den Volltext geprüft
 * @property {string} [zitatOrt]    Seite / Abschnitt des Zitats
 * @property {string} [link]
 * @property {string} [linkText]
 * @property {string} bibliothek    Kennung in der Hausbibliothek (Lese-Nachweis)
 */

/** @type {Quelle[]} */
export const QUELLEN = [
  /* ---------------------------------------------------------------- Physik */
  {
    id: 'pollack-2013',
    autor: 'Gerald H. Pollack',
    jahr: '2013',
    titel: 'The Fourth Phase of Water. Beyond Solid, Liquid, and Vapor',
    wo: 'Ebner & Sons, Seattle',
    art: 'buch',
    untersucht:
      'Zusammenfassung von rund zwei Jahrzehnten Laborarbeit an der University of Washington: Wasser neben wasserliebenden (hydrophilen) Oberflächen wie Nafion, Gelen und Geweben, beobachtet unter dem Mikroskop mit Mikrokügelchen und Farbstoffen, gemessen mit Elektroden, pH-Sonden und UV-Spektroskopie.',
    gezeigt:
      'Neben solchen Oberflächen bildet sich eine bis zu einige Hundert Mikrometer breite Zone, die gelöste Stoffe und Partikel ausschließt („Exclusion Zone", EZ). Sie ist elektrisch negativ geladen, das Wasser dahinter positiv; diese Ladungstrennung wird von Lichtenergie angetrieben, vor allem von Infrarot.',
    nichtUeberUns:
      'Das Buch untersucht keinen Anhänger, kein Armband und kein Gold-Gitter. Pollack hat kein Produkt von uns gesehen. Ob neben unserem Chip eine solche Zone entsteht, sagt es nicht.',
    zitat:
      'The exclusion zone (EZ), the unexpectedly large zone of water that forms next to many submersed materials, got its name because it excludes practically everything. The EZ contains a lot of charge, and its character differs from that of bulk water. Sometimes it is referred to as water’s fourth phase.',
    zitatOrt: 'S. 35–37, Abschnitt „A Bestiary"',
    link: 'https://ebnerandsons.com/the-fourth-phase-of-water/',
    linkText: 'Verlagsseite (Ebner & Sons)',
    bibliothek: 'pollack-fourth-phase',
  },
  {
    id: 'pollack-2010',
    autor: 'Gerald H. Pollack',
    jahr: '2010',
    titel: 'Water, Energy and Life: Fresh Views from the Water’s Edge',
    wo: 'International Journal of Design & Nature and Ecodynamics 5(1), S. 27–29',
    art: 'messung',
    untersucht:
      'Kurzer Übersichtsaufsatz über die eigenen Messungen an Grenzflächenwasser (Hydrogele, hydrophile Polymere, Monoschichten, Ionenaustauscher-Kügelchen, biologisches Gewebe).',
    gezeigt:
      'Die Ausschlusszone ist geladen, das Wasser dahinter entgegengesetzt geladen — „batterieartig" —, und diese Batterie wird von aufgenommener Strahlungsenergie gespeist. Pollack hält fest, dass der Ausschluss inzwischen „in a dozen different laboratories worldwide" bestätigt worden sei.',
    nichtUeberUns:
      'Der Aufsatz behandelt Grenzflächen aus Gelen und Polymeren. Über Metall, über Schmuck oder über einen Körper, der ein solches Objekt trägt, steht darin nichts.',
    zitat:
      'Exclusion zones are observed next to many hydrophilic surfaces, but not next to hydrophobic surfaces.',
    zitatOrt: 'S. 27',
    link: 'https://doi.org/10.2495/DNE-V5-N1-27-29',
    linkText: 'DOI 10.2495/DNE-V5-N1-27-29',
    bibliothek:
      'paper-water-energy-and-life-fresh-views-from-the-water-s-edge-2010',
  },
  {
    id: 'wang-pollack-2021',
    autor: 'Anqi Wang, Gerald H. Pollack',
    jahr: '2021',
    titel:
      'Effect of infrared radiation on interfacial water at hydrophilic surfaces',
    wo: 'Colloid and Interface Science Communications 42, 100397',
    art: 'messung',
    untersucht:
      'Ausschlusszone und Protonenzone neben Nafion, fünf Minuten mit mittlerem und nahem Infrarot bestrahlt; Größe der Zonen vorher und nachher gemessen.',
    gezeigt:
      'Nach fünf Minuten Mittel-Infrarot wuchs die Ausschlusszone auf das 1,41-Fache; zugleich wurden Protonen ins freie Wasser abgegeben. Infrarot baut die Zone auf und treibt die Ladungstrennung an.',
    nichtUeberUns:
      'Die Energiequelle ist hier eine Infrarotlampe. Unser Chip strahlt nichts ab und wird nicht bestrahlt; ob Körperwärme dieselbe Rolle spielt, wurde nicht untersucht.',
    link: 'https://doi.org/10.1016/j.colcom.2021.100397',
    linkText: 'DOI 10.1016/j.colcom.2021.100397',
    bibliothek:
      'paper-effect-of-infrared-radiation-on-interfacial-water-at-hydroph-2021',
  },
  {
    id: 'nhan-pollack-2011',
    autor: 'D. T. Nhan, Gerald H. Pollack',
    jahr: '2011',
    titel: 'Effect of particle diameter on exclusion-zone size',
    wo: 'International Journal of Design & Nature and Ecodynamics 6(2), S. 139–144',
    art: 'messung',
    untersucht:
      'Einzelne Ionenaustauscher-Kügelchen von 15 bis 300 Mikrometer Durchmesser in Mikrokügelchen-Suspension; Breite der Ausschlusszone je Kügelchengröße.',
    gezeigt:
      'Je größer das Kügelchen, desto breiter die Ausschlusszone — über den ganzen gemessenen Bereich. Sehr kleine Oberflächen erzeugen sehr kleine Zonen.',
    nichtUeberUns:
      'Die Arbeit sagt, dass die Größe der Oberfläche zählt. Sie sagt nicht, welche Zone ein Gitter von der Größe unseres Chips erzeugen würde — das hat niemand gemessen.',
    link: 'https://doi.org/10.2495/DNE-V6-N2-139-144',
    linkText: 'DOI 10.2495/DNE-V6-N2-139-144',
    bibliothek: 'paper-effect-of-particle-diameter-on-exclusion-zone-size-2011',
  },
  {
    id: 'so-pollack-2011',
    autor: 'E. So, R. Stahlberg, Gerald H. Pollack',
    jahr: '2011',
    titel: 'Exclusion zone as intermediate between ice and water',
    wo: 'Water and Society (WIT Press), Kapitel 3',
    art: 'messung',
    untersucht:
      'Schmelzendes Eis, verfolgt mit UV-Vis-Spektroskopie; die Ausschlusszone hat eine kennzeichnende Absorption bei 270 nm.',
    gezeigt:
      'Beim Schmelzen tritt vorübergehend die 270-nm-Absorption auf und verschwindet dann wieder — im Einklang mit der Annahme, dass Eis nicht direkt zu gewöhnlichem Wasser wird, sondern über die geordnete Zwischenphase.',
    nichtUeberUns:
      'Eine Arbeit über Eis. Sie stützt die Idee einer geordneten Wasserphase, nicht die Idee, dass ein Gegenstand sie im Körper erzeugt.',
    bibliothek:
      'paper-exclusion-zone-as-intermediate-between-ice-and-water-2011',
  },

  /* --------------------------------------------------------------- Theorie */
  {
    id: 'preparata-1995',
    autor: 'Giuliano Preparata',
    jahr: '1995',
    titel: 'QED Coherence in Matter',
    wo: 'World Scientific, Singapore',
    art: 'theorie',
    untersucht:
      'Theoretische Physik: eine Beschreibung kondensierter Materie — auch flüssigen Wassers — mit den Mitteln der Quantenelektrodynamik. Keine Messung, eine Rechnung.',
    gezeigt:
      'Nach dieser Theorie können Moleküle in Flüssigkeiten „kohärente Domänen" bilden, in denen sie im Gleichtakt mit einem eingeschlossenen elektromagnetischen Feld schwingen.',
    nichtUeberUns:
      'Ein Theoriebuch von 1995. Es kennt weder Pollacks spätere Messungen noch unser Produkt. Die Theorie ist in der Physik nicht Mehrheitsmeinung; sie ist das Fundament, auf dem unser Hauswort „kohärentes Wasser" steht — und das muss man wissen, wenn man es benutzt.',
    link: 'https://doi.org/10.1142/2738',
    linkText: 'DOI 10.1142/2738',
    bibliothek: 'preparata-qed-coherence',
  },
  {
    id: 'delgiudice-2015',
    autor:
      'Emilio Del Giudice, Vladimir Voeikov, Alberto Tedeschi, Giuseppe Vitiello',
    jahr: '2015',
    titel:
      'The origin and the special role of coherent water in living systems',
    wo: 'In: D. Fels, M. Cifra, F. Scholkmann (Hg.), Fields of the Cell, Research Signpost, S. 95–111',
    art: 'theorie',
    untersucht:
      'Theoretische Ableitung: die gemessenen Eigenschaften der Ausschlusszone (Ladung, Ausschluss, Größe) werden aus dem QED-Zweiphasenmodell des Wassers hergeleitet.',
    gezeigt:
      'Die Autoren zeigen rechnerisch, dass sich Pollacks Befunde als Folge kohärenter kollektiver Schwingungen im Wasser verstehen lassen. Das ist eine Deutung der Messungen, keine neue Messung.',
    nichtUeberUns:
      'Die Arbeit verbindet Theorie (Preparata) und Messung (Pollack). Sie sagt nichts darüber, ob ein Gegenstand außerhalb des Körpers diese Domänen im Körper vergrößert.',
    zitat:
      'According to quantum electrodynamics (QED) liquid water is a two-phase system in which one of the phases is in a coherent state where all molecules are phase correlated, whereas the other is made up of uncorrelated molecules in a gas-like state.',
    zitatOrt: 'S. 95, Abstract',
    bibliothek: 'delgiudice-coherent-water',
  },

  /* -------------------------------------------- Grenzflächen: Metall, Felder */
  {
    id: 'chai-pollack-2012',
    autor: 'B. Chai, A. G. Mahtani, Gerald H. Pollack',
    jahr: '2012',
    titel: 'Unexpected presence of solute-free zones at metal-water interfaces',
    wo: 'Contemporary Materials III(1), S. 1–12',
    art: 'messung',
    untersucht:
      'Verschiedene Metalle in wässriger Mikrokügelchen-Suspension: Zink, Aluminium, Zinn, Blei, Wolfram, Platin, Gold. Breite der partikelfreien Zone, elektrisches Potential, pH.',
    gezeigt:
      'Neben reaktiven Metallen entstehen Ausschlusszonen — am breitesten neben Zink (rund 200 Mikrometer). Ihre Größe folgt der Stellung des Metalls in der elektrochemischen Spannungsreihe.',
    nichtUeberUns:
      'Das ist die Arbeit, die am stärksten GEGEN unsere Chip-Hypothese spricht, und deshalb steht sie hier: neben Gold und Platin fand Pollacks Labor keine Ausschlusszone. Unser Gitter ist aus 750er Gold. Gemessen wurde allerdings reines Metall in Wasser — nicht eine Goldlegierung im Körper, nicht unser Gitter, nicht unsere Geometrie. Das schwächt die Hypothese; es widerlegt sie nicht. Beides muss man sagen.',
    zitat:
      'Other reactive metals, including aluminum, tin, lead, and tungsten exhibited distinct but smaller exclusion zones, while precious metals such as platinum and gold did not produce any.',
    zitatOrt: 'S. 1, Abstract',
    link: 'https://doi.org/10.7251/COM1201001C',
    linkText: 'DOI 10.7251/COM1201001C',
    bibliothek:
      'paper-unexpected-presence-of-solute-free-zones-at-metal-water-inte-2012',
  },
  {
    id: 'shalatonin-pollack-2022',
    autor: 'Valery Shalatonin, Gerald H. Pollack',
    jahr: '2022',
    titel: 'Magnetic fields induce exclusion zones in water',
    wo: 'PLOS ONE 17(5), e0268747',
    art: 'messung',
    untersucht:
      'Mikrokügelchen-Suspensionen (Polystyrol und Carboxylat) neben den Polen statischer Magnete; Größe und Dynamik der kügelchenfreien Zone.',
    gezeigt:
      'Neben beiden Magnetpolen bilden sich kügelchenfreie Zonen, die den Ausschlusszonen an hydrophilen Oberflächen in Größe und Verhalten ähneln. Die Zone am Nordpol war größer; der Unterschied war nur bei Polystyrol-Kügelchen statistisch signifikant.',
    nichtUeberUns:
      'Die Arbeit zeigt, dass auch ein Feld — nicht nur eine benetzte Oberfläche — Wasser ordnen kann. Unser Chip ist kein Magnet; die Arbeit sagt nichts über die Art Feld, die wir für ihn annehmen. Finanziert von der Software AG Stiftung.',
    link: 'https://doi.org/10.1371/journal.pone.0268747',
    linkText: 'DOI 10.1371/journal.pone.0268747',
    bibliothek: 'paper-magnetic-fields-induce-exclusion-zones-in-water-2022',
  },
  {
    id: 'rad-pollack-2021',
    autor: 'Iman Rad, Rainer Stahlberg, Kurt Kung, Gerald H. Pollack',
    jahr: '2021',
    titel:
      'Low frequency weak electric fields can induce structural changes in water',
    wo: 'PLOS ONE 16(12), e0260967',
    art: 'messung',
    untersucht:
      'Entionisiertes, EZ- und gewöhnliches Wasser unter schwachen elektrischen Wechselfeldern (600 ± 150 V/m; 7,8 bis 1000 Hz) über Platinelektroden; gemessen mit Spektroradiometer und Kontaktwinkel.',
    gezeigt:
      'Ein von oben angelegtes schwaches Feld bei 7,8 bis 75 Hz veränderte das Strahlungsprofil von entionisiertem Wasser so, dass es dem von EZ-Wasser ähnelte — die Autoren sprechen von einer möglicherweise induzierten molekularen Ordnung.',
    nichtUeberUns:
      'Die Felder kamen aus einer Spannungsquelle. Ob ein passiver Gegenstand ohne Stromversorgung ein vergleichbares Feld erzeugt, wurde nicht untersucht.',
    link: 'https://doi.org/10.1371/journal.pone.0260967',
    linkText: 'DOI 10.1371/journal.pone.0260967',
    bibliothek:
      'paper-low-frequency-weak-electric-fields-can-induce-structural-cha-2021',
  },

  /* ------------------------------------------------------ Wasser in der Zelle */
  {
    id: 'pollack-2001',
    autor: 'Gerald H. Pollack',
    jahr: '2001',
    titel: 'Is the Cell a Gel — and Why Does It Matter?',
    wo: 'Japanese Journal of Physiology 51, S. 649–660',
    art: 'uebersicht',
    untersucht:
      'Übersichtsarbeit: der Widerspruch zwischen dem Lehrbuchsatz „die Zelle ist ein Gel" und Modellen, die die Zelle wie eine frei diffundierende Lösung behandeln.',
    gezeigt:
      'Wird die Zelle als Gel ernst genommen, erklärt der Phasenübergang von Gelen viele Zellfunktionen; Wasser ist darin strukturiert, nicht frei.',
    nichtUeberUns:
      'Eine Arbeit über die Zelle, nicht über ein Produkt. Sie begründet, warum die Ordnung des Zellwassers überhaupt eine sinnvolle Frage ist — mehr nicht.',
    link: 'https://doi.org/10.2170/jjphysiol.51.649',
    linkText: 'DOI 10.2170/jjphysiol.51.649',
    bibliothek: 'paper-is-the-cell-a-gel-and-why-does-it-matter-2001',
  },
  {
    id: 'sharma-pollack-2018',
    autor:
      'Abha Sharma, Daniel Toso, Kurt Kung, Gun-Woong Bahng, Gerald H. Pollack',
    jahr: '2018',
    titel: 'Effect of Health-Promoting Agents on Exclusion-Zone Size',
    wo: 'Dose-Response 16(3)',
    art: 'messung',
    untersucht:
      'Rund ein halbes Dutzend Substanzen, denen ein gesundheitlicher Nutzen zugeschrieben wird, in physiologischer Dosis an Nafion-Ausschlusszonen; dazu das Herbizid Glyphosat.',
    gezeigt:
      'Alle getesteten „gesundheitsfördernden" Stoffe vergrößerten die Ausschlusszone, Glyphosat verkleinerte sie deutlich; sehr hohe Dosen verkleinerten sie wieder. Die Autoren stellen die Hypothese auf, EZ-Aufbau könne ein gemeinsamer Wirkmechanismus sein.',
    nichtUeberUns:
      'Getestet wurden gelöste Stoffe in einem Laboraufbau. Kein Gegenstand, kein Körper. Und die Verbindung zur Gesundheit ist hier ausdrücklich eine Hypothese der Autoren.',
    link: 'https://doi.org/10.1177/1559325818796937',
    linkText: 'DOI 10.1177/1559325818796937',
    bibliothek:
      'paper-effect-of-health-promoting-agents-on-exclusion-zone-size-2018',
  },
  {
    id: 'pollack-2024',
    autor: 'Gerald H. Pollack',
    jahr: '2024',
    titel: 'Cancer: An Unexpectedly Critical Role of Cell Water?',
    wo: 'Advances in Preventive Medicine and Health Care 7, 1060',
    art: 'uebersicht',
    untersucht:
      'Übersichts- und Thesenartikel — mit Fragezeichen im Titel. Keine eigene Messung.',
    gezeigt:
      'Pollack schlägt vor, dass EZ-Wasser die negative elektrische Spannung der Zelle erzeugt und ein Mangel daran mit dem niedrigen Potential von Krebszellen zusammenhängen könnte.',
    nichtUeberUns:
      'Wir nennen diese Arbeit, weil sie zeigt, wie weit Pollack selbst seine Idee treibt — und dass er sie als Frage formuliert. Sie hat mit unserem Produkt nichts zu tun, und wir leiten daraus keine Aussage über Krankheiten ab.',
    link: 'https://doi.org/10.29011/2688-996X.001060',
    linkText: 'DOI 10.29011/2688-996X.001060',
    bibliothek: 'paper-cancer-cell-water-2024',
  },

  /* ---------------------------------------------- Strahlung und Zellstress */
  {
    id: 'berenis-2021',
    autor:
      'Meike Mevissen, David Schürmann (BERENIS — Beratende Expertengruppe nichtionisierende Strahlung, Schweiz)',
    jahr: '2021',
    titel:
      'Is there evidence for oxidative stress caused by electromagnetic fields?',
    wo: 'BERENIS-Newsletter, Sonderausgabe Januar 2021 (Bundesamt für Umwelt BAFU)',
    art: 'uebersicht',
    untersucht:
      'Rund 150 begutachtete Tier- und Zellstudien der Jahre 2010–2020 zu niederfrequenten Magnetfeldern (50/60 Hz) und Mobilfunkfeldern (800 MHz–2,5 GHz) und oxidativem Stress.',
    gezeigt:
      'Die Mehrheit der Tierstudien und mehr als die Hälfte der Zellstudien lieferten Hinweise auf erhöhten oxidativen Stress — auch unterhalb der Grenzwerte. Zugleich: kein wissenschaftlicher Konsens, methodische Schwächen in etlichen Studien, und eine ROS-Erhöhung ist nicht automatisch ein Gesundheitsschaden.',
    nichtUeberUns:
      'Der Bericht belegt die Ausgangslage unserer Zellstudien (Strahlung kann Zellen stressen). Er kennt kein Schutzprodukt und sagt nichts über unseres. Und er warnt vor genau einer Schwäche, die auch unsere Studien haben: Kontrollen in einem anderen Brutschrank.',
    zitat:
      'In summary, the majority of the animal and more than half of the cell studies provided evidence of increased oxidative stress caused by RF-EMF or ELF-MF.',
    zitatOrt: 'S. 7, Conclusions',
    link: 'https://www.bafu.admin.ch/de/elektrosmog',
    linkText: 'BAFU, Themenseite Elektrosmog (Newsletter BERENIS)',
    bibliothek: 'berenis-2021-special',
  },
  {
    id: 'uvek-2019',
    autor:
      'Arbeitsgruppe Mobilfunk und Strahlung im Auftrag des UVEK (Schweiz)',
    jahr: '2019',
    titel: 'Bericht Mobilfunk und Strahlung',
    wo: 'Eidgenössisches Departement für Umwelt, Verkehr, Energie und Kommunikation, 18. November 2019',
    art: 'uebersicht',
    untersucht:
      'Behördlicher Sachstandsbericht einer Arbeitsgruppe aus Ämtern, Forschung, Ärzteschaft und Telekommunikation; Evidenzbewertung gesundheitlicher Effekte von Mobilfunkstrahlung.',
    gezeigt:
      'Für Hirnströme wird die Evidenz als ausreichend eingestuft. Für oxidativen Stress und andere zelluläre Effekte gibt die Arbeitsgruppe ausdrücklich KEINE Evidenzbeurteilung ab — mit dem Hinweis, dass reaktive Sauerstoffspezies in niedriger Konzentration gesundheitsfördernd und wichtig sind.',
    nichtUeberUns:
      'Ein Bericht über Strahlung, nicht über Schutz. Er bremst uns eher: die Frage, ob Mobilfunk Zellen dauerhaft schädigt, ist nach diesem Bericht offen.',
    link: 'https://www.bafu.admin.ch/de/elektrosmog',
    linkText: 'BAFU, Themenseite Elektrosmog',
    bibliothek: 'bericht-mobilfunk-schweiz',
  },
  {
    id: 'kim-2019',
    autor: 'Ju Hwan Kim, Jin-Koo Lee, Hyung-Gun Kim, Kyu-Bong Kim, Hak Rim Kim',
    jahr: '2019',
    titel:
      'Possible Effects of Radiofrequency Electromagnetic Field Exposure on Central Nerve System',
    wo: 'Biomolecules & Therapeutics 27(3), S. 265–275',
    art: 'uebersicht',
    untersucht:
      'Übersichtsarbeit zu Zell- und Tierstudien über Mobilfunkfelder und das zentrale Nervensystem.',
    gezeigt:
      'Mobilfunkfelder können in Modellen Nervenzellen verändern und als Stressquelle wirken; die Autoren halten zugleich fest, dass die biologischen Effekte am Menschen nicht bewiesen sind und die Daten für eine klare Risikoaussage nicht reichen.',
    nichtUeberUns:
      'Kein Bezug zu einem Produkt und keine Messung am Menschen: die Arbeit fasst Zell- und Tierstudien zusammen und hält ausdrücklich fest, dass die Datenlage für eine Risikoaussage nicht reicht.',
    link: 'https://doi.org/10.4062/biomolther.2019.152',
    linkText: 'DOI 10.4062/biomolther.2019.152',
    bibliothek: 'emf-possible-effects-rf',
  },

  /* ------------------------------------------------- Unsere eigenen Messungen */
  {
    id: 'dartsch-2021a',
    autor: 'Peter C. Dartsch (Dartsch Scientific GmbH)',
    jahr: '2021',
    titel:
      'QiOne® 2 Pro – Investigations on its Potential for the Exclusion of Unwanted Cellular Effects of Mobile Phone Radiation',
    wo: 'Japan Journal of Medicine 4(1), S. 484–488',
    art: 'eigene',
    untersucht:
      'Humane Immunzellen (HL-60, zu Neutrophilen ausdifferenziert), vier Stunden neben einem sendenden Mobiltelefon, mit und ohne QiOne 2 Pro; danach Radikalbildung im „oxidativen Burst" gemessen. Drei unabhängige Experimente.',
    gezeigt:
      'Ohne Schutz sank die Radikalbildung auf 60,5 ± 3,9 % der unbestrahlten Kontrolle, mit QiOne 2 Pro blieb sie bei 84,7 ± 7,0 % (p ≤ 0,01). Die Werte der unbestrahlten Kontrolle wurden auch mit Schutz nicht vollständig erreicht.',
    nichtUeberUns:
      'Das IST unser Produkt — deshalb gilt hier die andere Reichweitenfrage: Zellkultur, nicht Mensch; ein Labor, vom Hersteller gestellt, ohne unabhängige Wiederholung; drei Experimente; Kontrollen in einem anderen Brutschrank. Die Publikation erklärt ihre Messung mit kohärentem Wasser — und nennt das selbst eine Hypothese.',
    zitat:
      'However, even for the protected conditions, the values of the untreated controls without mobile phone radiation were not completely achieved.',
    zitatOrt: 'S. 484, Abstract',
    link: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro-human-cell-study-publication-april-30-2021_1.pdf?v=1679586513',
    linkText: 'Original-PDF',
    bibliothek: 'studie-qione2pro-human-cell-2021',
  },
  {
    id: 'dartsch-2021b',
    autor: 'Peter C. Dartsch (Dartsch Scientific GmbH)',
    jahr: '2021',
    titel:
      'Protective Effect of QiOne® 2 Pro on Cultured Intestinal Epithelial Cells after Mobile Phone Radiation',
    wo: 'Applied Cell Biology 9(3), S. 69–74',
    art: 'eigene',
    untersucht:
      'Darmepithelzellen vom Schwein (IPEC-J2) unter Mobilfunkbestrahlung, mit und ohne QiOne 2 Pro; Barrierewiderstand (TEER) und Zellregeneration. n = 3 bis 4.',
    gezeigt:
      'Barrierewiderstand: ungeschützt 152 ± 16, mit QiOne 1.837 ± 349, unbestrahlte Kontrolle 2.542 ± 389 Ω/cm² (p ≤ 0,01). Der Schutz war deutlich, aber nicht vollständig.',
    nichtUeberUns:
      'Zellkultur vom Schwein, nicht menschlicher Darm; sehr kleine Stichprobe; ein Labor, Gerät vom Hersteller; Mechanismus als Hypothese gekennzeichnet.',
    link: 'https://doi.org/10.53043/2320-1991.acb90012',
    linkText: 'DOI 10.53043/2320-1991.acb90012',
    bibliothek: 'studie-qione2pro-intestinal-epithelial',
  },
  {
    id: 'dartsch-2024a',
    autor: 'Peter C. Dartsch (Dartsch Scientific GmbH)',
    jahr: '2024',
    titel: 'Protective Effect of the QiBracelet® Against Oxidative Stress',
    wo: 'Applied Cell Biology 12(1), S. 1–6',
    art: 'eigene',
    untersucht:
      'Fünf Zelltypen (Niere/Hund, Leber/Mensch, Darm/Schwein, Lunge/Mensch, Bindegewebe/Maus) unter Wasserstoffperoxid als chemischem Stressor, mit und ohne QiBracelet; drei Serien.',
    gezeigt:
      'Relativer Schutz je Zelltyp: Leber 47,3 %, Bindegewebe 29,6 %, Niere 27,1 %, Darm 18,0 %, Lunge 3,9 % — bei Lungenzellen also fast keiner.',
    nichtUeberUns:
      'Stressor ist Wasserstoffperoxid, nicht Strahlung — diese Studie sagt nichts über Elektrosmog. Sie gilt für das Armband, nicht für die Kette. p-Werte je Zelltyp werden nicht einzeln ausgewiesen.',
    link: 'https://doi.org/10.53043/2320-1991.acb12001',
    linkText: 'DOI 10.53043/2320-1991.acb12001',
    bibliothek: 'studie-qibracelet-oxidative-2024',
  },
  {
    id: 'dartsch-2024b',
    autor: 'Peter C. Dartsch (Dartsch Scientific GmbH)',
    jahr: '2024',
    titel:
      'QTA Gitterchip Technology: Relationship Between Individual User Observations and Experimental Preclinical Data',
    wo: 'Advances in Bioengineering & Biomedical Science Research 7(3), S. 1–4',
    art: 'eigene',
    untersucht:
      '171 freiwillig in sozialen Medien veröffentlichte Anwenderberichte, nach Themen gezählt. Kein Fragebogen, keine Kontrollgruppe, keine Verblindung.',
    gezeigt:
      'Am häufigsten genannt: ruhigerer, tieferer Schlaf (rund 20 %) und mehr Energie (rund 17 %); alles Weitere unter 10 %. Der Autor vermutet als gemeinsamen Nenner weniger oxidativen Stress — gemessen hat er das in dieser Arbeit nicht.',
    nichtUeberUns:
      'Das ist keine Wirkungsstudie, sondern eine Zählung von Selbstberichten. Wer schreibt, dass ihm etwas geholfen hat, schreibt eher als wer nichts merkt. Diese Arbeit kann deshalb nicht sagen, wie es bei dir sein wird.',
    link: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/ABBSR-24_-31_3.pdf?v=1717500318',
    linkText: 'Original-PDF',
    bibliothek: 'studie-abbsr-24',
  },
  {
    id: 'dartsch-2026',
    autor: 'Peter C. Dartsch (Dartsch Scientific GmbH)',
    jahr: '2026',
    titel:
      'Beneficial Effect of the QiHome® Air on Cultured Neuronal and Inflammation-Mediating Cells',
    wo: 'Neurodegenerative Diseases: Current Research 6(1), S. 1–8',
    art: 'eigene',
    untersucht:
      'Humane Nervenzellen (SH-SY5Y) und Immunzellen (HL-60) in Kultur, mit und ohne QiHome Air; Regeneration, Überleben unter Wasserstoffperoxid, Grundstoffwechsel, Radikalbildung. Vier Replikate.',
    gezeigt:
      'Nervenzell-Regeneration +53,3 ± 6,4 % gegenüber Kontrolle (p ≤ 0,01); Überleben unter oxidativem Stress +34 % bzw. über +80 % je Konzentration; weniger Superoxid-Bildung (−16,4 ± 4,1 %).',
    nichtUeberUns:
      'Zellkultur, keine Daten aus dem Alltag; das Regenerationsmodell bildet nur das periphere Nervensystem ab; von uns finanziert, ein Labor. Und: es geht um das Raumgerät, nicht um Kette oder Armband.',
    link: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-studien--e0005--b754deb9ee0d.pdf?v=1786753494',
    linkText: 'Original-PDF',
    bibliothek: 'studie-qione2pro-human-cell-2021',
  },

  /* ------------------------------------------- Bücher, die uns geprägt haben */
  {
    id: 'warnke-bionisch',
    autor: 'Ulrich Warnke',
    jahr: '2019',
    titel: 'Bionisches Wasser',
    wo: 'Arkana (Verlagsgruppe Random House), München',
    art: 'buch',
    untersucht:
      'Sachbuch eines Biologen und Physikers: verknüpft Pollacks Ausschlusszone, die QED-Theorie kohärenter Domänen und hexagonales Wasser zu einem Bild vom „bionischen" Wasser im Körper.',
    gezeigt:
      'Warnke führt die Fäden zusammen — und ist an der entscheidenden Stelle selbst vorsichtig: zur Wirkung dieses Wassers auf Organismen gebe es kaum robuste Forschung.',
    nichtUeberUns:
      'Ein Buch, kein Experiment; unser Produkt kommt darin nicht vor. Wir zitieren gerade den Satz, der uns Grenzen setzt.',
    zitat:
      'Wissenschaftlich robuste Forschung zu den Wirkungen speziell dieses Wassers auf Organismen gibt es kaum; man weiß bisher nur, dass es bestimmte Enzyme wie Dehydrogenasen, die Wasserstoff abspalten, aktivieren kann.',
    zitatOrt: 'S. 168–169',
    bibliothek: 'warnke-bionisches-wasser',
  },
  {
    id: 'warnke-quanten',
    autor: 'Ulrich Warnke',
    jahr: '2013',
    titel: 'Quantenphilosophie und Interwelt',
    wo: 'Scorpio, Berlin/München (E-Book-Ausgabe)',
    art: 'buch',
    untersucht:
      'Philosophisches Sachbuch: Bewusstsein, Quantenphysik und Biologie — Warnkes Deutung, nicht Laborarbeit.',
    gezeigt:
      'Das Buch verbindet Physik mit Fragen des Bewusstseins. Es ist die Lektüre, aus der ein Teil unserer eigenen Sicht auf Bewusstsein kommt — und deshalb steht es hier, im Abschnitt „unsere Sicht", nicht im Abschnitt „Belege".',
    nichtUeberUns:
      'Kein Beleg für irgendetwas an unserem Produkt. Eine Weltsicht, als solche gekennzeichnet.',
    bibliothek: 'warnke-quantenphilosophie',
  },
];

export const QUELLEN_NACH_ID = Object.fromEntries(
  QUELLEN.map((q) => [q.id, q]),
);

/**
 * Die Videos — ausgezeichnet als VideoObject (Teil D des Auftrags), jedes mit
 * derselben Einordnung wie eine Quelle: was es zeigt, worüber es nichts sagt.
 *
 * HERKUNFT DER METADATEN: YouTube Data API (videos.list) am 2026-09-11,
 * Kanal, Datum, Dauer und Aufrufe wörtlich übernommen
 * (homepage-bauer/data/hypothesen/videos-meta.json). Eingebettet werden NUR
 * Videos auf dem Kanal des Veranstalters (TEDx Talks) bzw. der Universität
 * (UW Video) — keine Re-Uploads Dritter. Deshalb fehlt hier ein Warnke-Vortrag:
 * die einzige auffindbare Fassung liegt auf einem Backup-Kanal.
 *
 * EINORDNUNG: die Vorträge konnten aus diesem Rechenzentrum nicht angesehen
 * werden (kein Ton, kein Transkript abrufbar). Die Einordnung stützt sich auf
 * die vom Veranstalter veröffentlichte Beschreibung und — beim UW-Vortrag —
 * auf Pollacks gleichnamigen Aufsatz von 2010, der im Volltext gelesen wurde.
 * Das steht so auf der Seite.
 */
/*
 * POSTER UND EINBETTUNG SIND GEMESSEN, NICHT GERATEN.
 *
 * Die Facade `YoutubeTimestamp` faehrt sonst eine maxres-Kette mit Abstieg bei
 * `onError`. Der Abstieg greift bei YouTube NIE: fehlt `maxresdefault.jpg`,
 * antwortet i.ytimg.com mit HTTP 404 UND einem gueltigen 120x90-Graubild im
 * Rumpf — der Browser dekodiert es erfolgreich und feuert kein `error`. Der
 * Poster stand damit als Graukachel auf der Seite.
 *
 * Deshalb traegt jeder Eintrag seine Poster-Datei samt gemessener Breite. Am
 * 2026-09-11 je Stufe abgerufen und die Breite aus dem JPEG-Kopf gelesen:
 *   i-T7tCMUDXU   maxresdefault 1280x720
 *   p9UC0chfXcg   maxresdefault 1280x720
 *   XVBEwn6iWOo   maxres/sd/hq720 je 404 (120x90) -> bestes vorhandenes
 *                 Standbild ist hqdefault 480x360
 *
 * `einbetten: false` FOLGT AUS DER MESSUNG, nicht aus Geschmack: das Gate
 * `bild-aufloesung` verlangt Quellbreite >= Anzeigebreite * dpr * 0.9, auf
 * mobil-360 also 312*2*0.9 = 562 px. 480 px reissen das, und 480 ist fuer
 * dieses Video das Maximum, das ueberhaupt existiert — mit keiner Dateiwahl
 * heilbar. Eine sichtbar unscharfe Kachel auf einer Seite, deren Gegenstand
 * Nachpruefbarkeit ist, waere der teurere Fehler als ein Link. Der Vortrag
 * bleibt mit Einordnung und als VideoObject auf der Seite, nur ohne Kachel.
 */
export const VIDEOS = [
  {
    videoId: 'i-T7tCMUDXU',
    poster: 'https://i.ytimg.com/vi/i-T7tCMUDXU/maxresdefault.jpg',
    posterBreite: 1280,
    einbetten: true,
    titel: 'The Fourth Phase of Water: Dr. Gerald Pollack at TEDxGuelphU',
    kanal: 'TEDx Talks',
    veroeffentlicht: '2013-09-06',
    dauerIso: 'PT24M15S',
    dauerText: '24 Minuten',
    sprache: 'en',
    zeigt:
      'Pollacks Kurzfassung seines Buches: die Ausschlusszone, ihre negative Ladung, und die These, dass Licht — vor allem Infrarot — sie aufbaut. Der meistgesehene Einstieg in das Thema.',
    sagtNichts:
      'Über Schmuck, Gold-Gitter oder ein Produkt, das man am Körper trägt. Pollack spricht über Wasser an Oberflächen und über Zellen, nicht über uns.',
    quellen: ['pollack-2013', 'pollack-2010'],
  },
  {
    videoId: 'p9UC0chfXcg',
    poster: 'https://i.ytimg.com/vi/p9UC0chfXcg/maxresdefault.jpg',
    posterBreite: 1280,
    einbetten: true,
    titel: 'Water, Cells, and Life | Dr. Gerald Pollack | TEDxNewYorkSalon',
    kanal: 'TEDx Talks',
    veroeffentlicht: '2016-11-21',
    dauerIso: 'PT13M39S',
    dauerText: '14 Minuten',
    sprache: 'en',
    zeigt:
      'Der Schritt von der Oberfläche in die Zelle: warum Pollack das Zellwasser für strukturiert hält und was das für Zellfunktion bedeuten könnte.',
    sagtNichts:
      'Über einen Weg, dieses Zellwasser von außen zu beeinflussen. Genau diese Lücke — zwischen Pollacks Zelle und unserem Chip — ist die offene Stelle unseres Modells.',
    quellen: ['pollack-2001', 'sharma-pollack-2018'],
  },
  {
    videoId: 'XVBEwn6iWOo',
    poster: 'https://i.ytimg.com/vi/XVBEwn6iWOo/hqdefault.jpg',
    posterBreite: 480,
    einbetten: false,
    titel: 'Water, Energy and Life: Fresh Views From the Water’s Edge',
    kanal: 'UW Video (University of Washington)',
    veroeffentlicht: '2009-04-29',
    dauerIso: 'PT58M9S',
    dauerText: '58 Minuten',
    sprache: 'en',
    zeigt:
      'Die lange, akademische Fassung an der eigenen Universität — gleichnamig mit Pollacks Aufsatz von 2010: Ausschluss, Ladungstrennung, Strahlungsenergie, und die Kontrollen gegen Artefakte.',
    sagtNichts:
      'Über irgendein Produkt. Es ist eine Vorlesung über Grenzflächenwasser; wer eine Stunde Zeit hat, sieht hier, wie die Messungen gemacht wurden.',
    quellen: ['pollack-2010', 'pollack-2013'],
  },
];
