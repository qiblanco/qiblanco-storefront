/*
 * SPRACHE 2026-09-28 (Christian: „wie es nach AI klingt … Der Inhalt darf ja
 * bleiben, aber die Wortwahl und der Satzbau sind echt unangenehm"; Grossjob
 * 20260928-GROSSJOB-frageseiten-menschlich-schreiben-und-bestmoegliches-licht,
 * Segment s04, Stilblatt im Jobordner). Umgeschrieben sind NUR die Antworten
 * `a` der ungeflaggten Items außerhalb von FAQ_QI_MASTER; Fakten, Zahlen,
 * Materialangaben und die Klarna-Staffel sind unverändert.
 * BEWUSST NICHT ANGEFASST:
 *  · jedes Item mit `flag`: es wartet auf Christians INHALTLICHE
 *    Umformulierung, und eine Sprachglättung würde dieses Warten unsichtbar
 *    machen;
 *  · FAQ_QI_MASTER komplett: Christians eigene Festlegungen, sein Wortlaut
 *    wird nicht ersetzt;
 *  · jede Frage `q`: sie wird in app/components/reusables/amazonstil-daten.js
 *    wörtlich kopiert und dort per Test gegen diese Datei geprüft.
 * Diese Texte speisen auch Anna (qi-salesbot/scripts/import-storefront-
 * faqs.mjs); den Import zieht der Merge nach.
 */
export const FAQ_QIONE_2_PRO = [
  {
    q: 'Wie funktioniert der QiOne®?',
    a: 'Der QiOne® enthält keinerlei elektronische Bauteile. Maßgeblich für die Funktion ist der eigens entwickelte Gitterchip™. Dieser prägt durch sein statisches Feld, das maßgeblich durch die spezifische Atompositionierung von Goldatomen erreicht wird, Wassermoleküle. Somit steigt die Wahrscheinlichkeit an, dass Wasser Wasserstoffbrücken ausbaut. Dieser Zustand wird als kohärente Wasserstruktur bezeichnet und ist auch unter dem Begriff EZ-Water (extended zone) oder CD-Wasser (kohärente Domäne) bekannt. Der kohärente Zustand des Wassers ist selbstvermehrend.',
    flag: 'eso-buzzword',
  },
  {
    q: 'Ist die kohärente Wasserstruktur messbar?',
    a: 'Ja. Die kohärente Wasserstruktur kann am einfachsten mit dem Mikroskop an hydrophoben Oberflächen beobachtet werden. Grenzflächenwasser ist ein Synonym für kohärentes Wasser. Kohärentes Wasser absorbiert verstärkt Licht bei 270nm. Je höher die Absorptionsrate bei 270nm, je höher der Anteil der kohärenten Wasserstruktur. Indirekt ist der Gehalt über ein HRV oder EKG-Gerät messbar. Quelle: Bionisches Wasser, Prof. Dr. Warnke, 2019',
    flag: 'faktenwiderspruch',
  },
  {
    q: 'Aus welchem Material bestehen die Qi Blanco® Produkte?',
    a: 'Das Gehäuse ist aus hochwertigem Chirurgenstahl, und der Gitterchip™ darin entsteht aus einer maßgeschneiderten 750er Goldlegierung. Den Feinschliff machen am Ende Oberflächenveredler und Goldschmiede, die jedes Detail von Hand vollenden.',
  },
  {
    q: 'Darf der QiOne® in die Sauna bzw. nass werden?',
    a: 'Ja, die Technik darin ist unempfindlich gegen Wasser. Der QiOne® 2 Pro und das QiBracelet® sind robust und langlebig und vertragen Chlor- und Meerwasser, Schweiß, Sonne und Hitze. Du kannst sie also beim Sonnenbaden, in der Sauna, beim Schwimmen und beim Sport einfach anbehalten.',
  },
  {
    q: 'Kann ich den QiOne® an einer anderen Kette tragen?',
    a: 'Ja, gern. Das Baumwollbändchen, das dabeiliegt, ist ein Geschenk an dich, damit du den Anhänger gleich tragen kannst, und du kannst es jederzeit gegen deine Lieblingskette tauschen. Die Bohrung im QiOne® hat einen Durchmesser von 2,5 mm. Denk nur daran, dass Ketten aus Metall, auch aus Edelstahl, härter sind als der QiOne® und ihn verkratzen können. Wir haben übrigens auch eine eigene Edelstahlkette für den QiOne®, die perfekt zu deinem Anhänger passt.',
  },
  {
    q: 'Wie sollte ich den QiOne® tragen?',
    a: 'Der QiOne® kann an jeder beliebigen Stelle am Körper getragen werden. Der Effekt wird mit Hautkontakt stärker. Zum einfachen Gebrauch ist eine 2,5 mm Bohrung angebracht, sodass du ihn mittels einer Kette oder dem mitgelieferten Band um den Hals tragen kannst. Es ist aber auch möglich ihn in der Hosentasche oder einer ähnlich körpernahen Position zu tragen. Manche Kunden berichten, dass der QiOne® am Anfang zu intensiv ist. Trage hier einfach den QiOne® über der Kleidung (z.B. durch eine längere Kette) oder wickle ihn in ein Tuch ein und trage ihn in der Hosentasche.',
    flag: 'unfalsifizierbar',
  },
  {
    q: 'Lässt die Wirkung irgendwann nach bzw. verändert sich das Empfinden mit der Zeit?',
    a: 'Nein. Die Qi Blanco® Produkte wirken IMMER. Ja. Das Empfinden kann sich mit der Zeit verändern. Viele spüren es nach einigen Tagen nicht mehr so intensiv. Hier tritt der „Gewöhnungseffekt" ein. Die kohärente Wasserstruktur wird zum Alltag. Es gibt Menschen, die keinen Unterschied merken. Die Ursachen können verschieden sein: Übermäßiger Konsum von berauschenden Substanzen (Nikotin, Koffein, Teein, Alkohol, Medikamente) und/oder Dehydrierung.',
    flag: 'unfalsifizierbar',
  },
  {
    q: 'Hat der QiOne® auch einen Einfluss auf das Wasser, das ich trinke?',
    a: 'Ja. Das Wasser, das du trinkst wird direkt dazu animiert, kohärente Strukturen zu bilden – wenn es diese nicht schon hat. Das liegt daran, dass der kohärente Effekt „selbstvermehrend" ist.',
    flag: 'eso-buzzword',
  },
  {
    q: 'Wie funktioniert die Finanzierung über Klarna?',
    a: 'Leg deinen QiOne in den Warenkorb und geh zur Kasse. Als Bezahlart wählst du „Klarna – Sofort oder später bezahlen“ und klickst auf „Jetzt Kaufen“, berechnet wird dir dabei noch nichts. Danach landest du im Klarna-Checkout, klickst dort auf „Ratenzahlung“ und suchst dir Laufzeit und Betrag aus. Zum Schluss klickst du noch einmal auf „Jetzt Kaufen“. Mit unserem Partner Klarna kannst du ab 25 € Warenwert in 6 Monatsraten zahlen, ab 500 € in 12 und ab 1000 € in 24 Monatsraten.',
  },
];

/*
 * FAQ /products/qi-master — QiMaster, der QiOne mit Diamant (Job
 * 20260910-BAU-qi-master-produkt-und-shopseite-…, Christian-Auftrag
 * CW-20260910-0e45045b). Nur Fragen, deren Antwort heute belegt ist:
 * Gitterchip (Herstellerangaben wie bei FAQ_QIONE_2_PRO), Kette/Verschluss
 * (Festlegungen Christian 2026-09-10), Seriennummer, Rückgabe (Haus-Regel).
 * Bewusst NICHT: Lieferzeit, Diamant-Karat/-Anzahl, Ratenzahlung — nicht belegt.
 */
export const FAQ_QI_MASTER = [
  {
    q: 'Wie stark ist der Qi Master® im Vergleich zum QiOne® 2 Pro?',
    a: 'Aufgrund der Schwingungsfrequenzen des Diamanten, die der Zellbiologie sehr nahe liegen, dringen die Effekte deutlich tiefer ein. Vereinfacht lässt sich sagen, dass die Stärke mit einem QiHome® Air vergleichbar ist, d. h. der Qi Master® ist sozusagen ein QiHome® zum \u201eUmhängen\u201c. Die Stärke ist mit einem Faktor von 100 sehr stark erweitert, sodass keine Wünsche offen bleiben.\n\nWir empfehlen grundsätzlich, den Qi Master® am Anfang immer \u201eeinzuschleichen\u201c. D. h. so lange tragen, wie es sich angenehm anfühlt, und ihn dann ablegen, bis man ihn wieder \u201evermisst\u201c.',
  },
  {
    q: 'Für wen ist der Qi Master® geeignet?',
    a: 'Grundsätzlich ist der Qi Master® definitiv ein Luxusprodukt. D. h. für den normalen Alltag ist der QiOne® 2 Pro mehr als ausreichend und deckt alle Bedürfnisse ab. Für diejenigen, die wirklich das Maximum aus ihrem Leben holen wollen, auf beruflicher und privater Ebene, ist der Qi Master® der ideale Begleiter. Er ist gemacht für diejenigen, die wollen. Und zwar alles.',
  },
  {
    q: 'Was unterscheidet den Qi Master® vom QiOne® 2 Pro?',
    a: 'Der Qi Master® ist der QiOne mit Diamanten: Er trägt denselben Gitterchip™ der zweiten Generation wie der QiOne® 2 Pro – dazu echte Diamanten und eine Iris mit 108 Strichen rund um das Auge. Für den Gitterchip™ kommt eine eigene spezielle 750er Goldlegierung zum Einsatz. Jeder Qi Master® ist nummeriert.',
  },
  {
    q: 'Wie funktioniert der Gitterchip™?',
    a: 'Der Gitterchip™ enthält keinerlei elektronische Bauteile. Maßgeblich ist sein statisches Feld, das durch die spezifische Anordnung von Goldatomen in einer maßgeschneiderten 750er Goldlegierung entsteht. Es prägt Wassermoleküle in seiner Umgebung: Die Wahrscheinlichkeit steigt, dass Wasser Wasserstoffbrücken ausbaut – der Zustand, der als kohärente Wasserstruktur, EZ-Wasser oder kohärente Domäne beschrieben wird.',
    flag: 'eso-buzzword',
  },
  {
    q: 'Warum sind Diamanten im Qi Master®?',
    a: 'Ein Diamant ist reiner Kohlenstoff – dasselbe Element, das jede Zelle deines Körpers aufbaut. In der Literatur wird dieser Zusammenhang beschrieben (Michael König, 2011); dass sich damit im Schmuckstück Frequenzen erzeugen lassen, die dem Schwingungsbereich menschlicher Zellen näher liegen, ist unsere Deutung.',
  },
  {
    q: 'Schützt der Qi Master® vor 6G?',
    a: 'Ja. Der Gitterchip™ ist nicht auf ein Frequenzband gebaut – er ist ein passives Bauteil ohne Elektronik und ohne frequenzselektive Abschirmung. Er arbeitet deshalb unabhängig davon, welches Netz gerade sendet: 5G heute, 6G morgen. Gemessen wurde in Zellstudien (in vitro, Dartsch 2021) die Wirkung unter der Strahlung eines sendenden Smartphones mit aktivem WLAN (SAR 0,76 W/kg).',
  },
  {
    q: 'Darf der Qi Master® in die Sauna oder ins Wasser?',
    a: 'Der Gitterchip™ ist unempfindlich gegenüber Wasser, Chlor, Salzwasser, Schweiß und Hitze. Für die Goldkette gilt, was für jedes Goldschmuckstück gilt: Sie ist beständig, sollte aber nicht dauerhaft Chlorwasser ausgesetzt werden.',
  },
  {
    q: 'Kann ich den Qi Master® zurückgeben?',
    a: 'Ja. Wie jedes Stück aus unserem Haus kannst du den Qi Master® 20 Tage lang erleben und innerhalb dieser Frist zurückgeben – du erhältst den vollen Kaufpreis zurück.',
  },
];

export const FAQ_QIBRACELET = [
  {
    q: 'Was ist der Unterschied zwischen dem QiOne® 2 Pro und dem QiBracelet®?',
    a: 'Der Hauptunterschied zwischen dem QiOne® 2 Pro und dem QiBracelet® liegt in ihrer äußeren Gestaltung und dem Tragekomfort. Beide verwenden den gleichen innovativen Gitterchip™ 2.0, der durch die spezifische Atompositionierung von Goldatomen die Bildung kohärenter Wasserstrukturen fördert. Der QiOne® 2 Pro ist als Gehäuse mit einem Anhänger konzipiert und eignet sich daher ideal zum Tragen um den Hals. Im Gegensatz dazu ist das QiBracelet® als Armreifen aus Chirurgenstahl gestaltet. Dies verleiht dem QiBracelet® nicht nur einen edlen Look, sondern bietet auch einen besonders komfortablen Tragestil am Handgelenk.',
    flag: 'wirkmechanismus',
  },
  {
    q: 'Ist die kohärente Wasserstruktur messbar?',
    a: 'Ja, die kohärente Wasserstruktur kann am einfachsten mit dem Mikroskop an hydrophoben Oberflächen beobachtet werden. Grenzflächenwasser ist ein Synonym für kohärentes Wasser. Kohärentes Wasser absorbiert verstärkt Licht bei 270nm. Je höher die Absorptionsrate bei 270nm, je höher der Anteil der kohärenten Wasserstruktur. Indirekt ist der Gehalt über ein HRV oder EKG-Gerät messbar. Quelle: Bionisches Wasser, Prof. Dr. Warnke, 2019',
    flag: 'faktenwiderspruch',
  },
  {
    q: 'Aus welchem Material bestehen die Qi Blanco® Produkte?',
    a: 'Das Gehäuse ist aus hochwertigem Chirurgenstahl, und der Gitterchip™ darin entsteht aus einer maßgeschneiderten 750er Goldlegierung. Den Feinschliff machen am Ende Oberflächenveredler und Goldschmiede, die jedes Detail von Hand vollenden.',
  },
  {
    q: 'Darf das QiBracelet® nass werden, bzw. in die Sauna?',
    a: 'Ja, das QiBracelet® ist robust gebaut, und Feuchtigkeit macht seinen Materialien nichts aus. Du kannst es also ohne Bedenken im Schwimmbad oder beim Schwimmen im Meer tragen. Auch in die Sauna darf es mit, denn hohe Temperaturen hält es problemlos aus. Denk dort nur daran, dass das Material dabei heiß werden kann.',
  },
  {
    q: 'Ist das QiBracelet® sicher für Anwender mit Allergien?',
    a: 'Das Gehäuse des QiBracelet® ist aus hochwertigem Chirurgenstahl 316L. Diesen Edelstahl haben wir ausgewählt, weil er besonders korrosionsbeständig ist und vom menschlichen Körper sehr gut vertragen wird. Er wird sogar in der Medizin für Implantate verwendet, zum Beispiel in der Orthopädie, weil er sich bestens mit dem Körper verbindet und allergische Reaktionen äußerst selten sind.',
  },
  {
    q: 'Lässt die Wirkung irgendwann nach bzw. verändert sich das Empfinden mit der Zeit?',
    a: 'Die Wirkung der Qi Blanco® Produkte bleibt konstant hoch, doch das Empfinden kann sich tatsächlich über die Zeit verändern. Dies ist ein ganz normaler Vorgang und kann durch verschiedene Faktoren beeinflusst werden. Menschen mit einer ausgeprägten Körpersensorik können die Wirkung des QiOne beispielsweise als besonders intensiv empfinden. Um eine hohe Körpersensorik zu erreichen, kann es hilfreich sein, den Körper zu entgiften und mit Mineralien zu versorgen. Es ist auch wichtig zu beachten, dass bestimmte Substanzen, wie Nikotin, Koffein, Teein und Alkohol, sowie einige Medikamente, die Körpersensorik beeinträchtigen können.',
    flag: 'schuldumkehr',
  },
  {
    q: 'Wie funktioniert die Finanzierung über Klarna?',
    a: 'Leg dein QiBracelet® in den Warenkorb und geh zur Kasse. Als Bezahlart wählst du „Klarna – Sofort oder später bezahlen“ und klickst auf „Jetzt Kaufen“, berechnet wird dir dabei noch nichts. Danach landest du im Klarna-Checkout, klickst dort auf „Ratenzahlung“ und suchst dir Laufzeit und Betrag aus. Zum Schluss klickst du noch einmal auf „Jetzt Kaufen“. Ab 25 € Warenwert kannst du in 6 Monatsraten zahlen, ab 500 € in 12 und ab 1000 € in 24 Monatsraten.',
  },
];

export const FAQ_QIHOME_AIR = [
  {
    q: 'Wie funktioniert das QiHome® Air?',
    a: 'Das QiHome® Air enthält keinerlei elektronische Bauteile. Maßgeblich für die Funktion ist der eigens entwickelte Gitterchip™. Dieser prägt durch sein statisches Feld, das maßgeblich durch die spezifische Atompositionierung von Goldatomen erreicht wird, Wassermoleküle. Somit steigt die Wahrscheinlichkeit an, dass Wasser Wasserstoffbrücken ausbaut. Dieser Zustand wird als kohärente Wasserstruktur bezeichnet und ist auch unter dem Begriff EZ-Water (extended zone) oder CD-Wasser (kohärente Domäne) bekannt. Der kohärente Zustand des Wassers ist selbstvermehrend.',
    flag: 'eso-buzzword',
  },
  {
    q: 'Ist die kohärente Wasserstruktur messbar?',
    a: 'Ja, die kohärente Wasserstruktur kann am einfachsten mit dem Mikroskop an hydrophoben Oberflächen beobachtet werden. Grenzflächenwasser ist ein Synonym für kohärentes Wasser. Kohärentes Wasser absorbiert verstärkt Licht bei 270nm. Je höher die Absorptionsrate bei 270nm, je höher der Anteil der kohärenten Wasserstruktur. Indirekt ist der Gehalt über ein HRV oder EKG-Gerät messbar. Quelle: Bionisches Wasser, Prof. Dr. Warnke, 2019',
    flag: 'faktenwiderspruch',
  },
  {
    q: 'Aus welchem Material bestehen die Qi Blanco® Produkte?',
    a: 'Das Gehäuse ist aus hochwertigem Chirurgenstahl, der Gitterchip™ entsteht aus einer maßgeschneiderten High-Carat-Goldlegierung, und die Holzteile des QiHome Air® sind aus regionaler deutscher Eiche. Den Feinschliff machen am Ende Oberflächenveredler und Goldschmiede, die jedes Detail von Hand vollenden.',
  },
  {
    q: 'Kann das QiHome® Air im Freien verwendet werden?',
    a: 'Das QiHome® Air entfaltet seine optimale Leistung vor allem in geschlossenen Räumen. Hier schafft das Gerät ein stabiles statisches Feld und unterstützt aktiv die Bildung kohärenter Wasserstrukturen. Für individuelle Vorteile unterwegs oder im Freien empfehlen wir Produkte wie den QiOne® 2 Pro und das QiBracelet®, die direkt am Körper getragen werden können.',
    flag: 'wirkmechanismus',
  },
  {
    q: 'Wo sollte das QiHome® Air platziert werden?',
    a: 'Das QiHome® Air sollte auf einer stabilen und rutschfesten Oberfläche platziert werden, um eine sichere Position zu gewährleisten. Idealerweise sollte das Gerät in Umgebungen platziert werden, in denen eine höhere Aufenthaltsdauer besteht oder in denen man verstärkt elektromagnetischer Strahlung ausgesetzt wird. Durch eine gezielte Platzierung in frequenzbelasteten Bereichen kann die Wirksamkeit des QiHome® Air maximiert werden.',
    flag: 'wirkmechanismus',
  },
  {
    q: 'Muss das QiHome® Air in die Steckdose eingesteckt werden?',
    a: 'Nein, das QiHome® Air muss nicht in die Steckdose eingesteckt werden. Obwohl es eine Möglichkeit gibt, das Gerät in europäische Schuko-Steckdosen des Typs C einzustecken, ist dies nicht erforderlich für die Wirksamkeit. Die Funktionalität des QiHome® Air basiert auf dem eigens entwickelten Gitterchip™, der unabhängig von einer Stromquelle arbeitet.',
    flag: 'wirkmechanismus',
  },
  {
    q: 'Kann ich mit dem QiHome® Air reisen?',
    a: 'Ja, das QiHome® Air ist kompakt und leicht mitzunehmen. Es passt bequem ins Gepäck, und du kannst es überall aufstellen, wo du gerade bist, ob im Hotel oder in der Ferienwohnung. Um seine Haltbarkeit musst du dir unterwegs keine Sorgen machen, es ist ein zuverlässiger Begleiter auf jeder Reise.',
  },
  {
    q: 'Hat das QiHome® Air einen Einfluss auf das Wasser, das ich trinke?',
    a: 'Ja, das QiHome® Air beeinflusst das Wasser, das du trinkst. Es animiert das Wasser direkt dazu, kohärente Strukturen zu bilden. Dieser Effekt ist "selbstvermehrend", was bedeutet, dass er eine positive Rückkopplungsschleife erzeugt.',
    flag: 'eso-buzzword',
  },
  {
    q: 'Lässt die Wirkung irgendwann nach bzw. verändert sich das Empfinden mit der Zeit?',
    a: 'Die Wirkung der Qi Blanco® Produkte bleibt konstant hoch, doch das Empfinden kann sich tatsächlich über die Zeit verändern. Dies ist ein ganz normaler Vorgang und kann durch verschiedene Faktoren beeinflusst werden. Menschen mit einer ausgeprägten Körpersensorik können die Wirkung des QiOne beispielsweise als besonders intensiv empfinden. Um eine hohe Körpersensorik zu erreichen, kann es hilfreich sein, den Körper zu entgiften und mit Mineralien zu versorgen. Bestimmte Substanzen, wie Nikotin, Koffein, Teein und Alkohol, sowie einige Medikamente, können die Körpersensorik beeinträchtigen.',
    flag: 'schuldumkehr',
  },
  {
    q: 'Wie funktioniert die Finanzierung über Klarna?',
    a: 'Leg dein QiHome® Air in den Warenkorb und geh zur Kasse. Als Bezahlart wählst du „Klarna – Sofort oder später bezahlen“ und klickst auf „Jetzt Kaufen“, berechnet wird dir dabei noch nichts. Danach landest du im Klarna-Checkout, klickst dort auf „Ratenzahlung“ und suchst dir Laufzeit und Betrag aus. Ab 25 € Warenwert kannst du in 6 Monatsraten zahlen, ab 500 € in 12 und ab 1000 € in 24 Monatsraten.',
  },
];

export const FAQ_QIONE_KETTE = [
  {
    q: 'Wie funktioniert der QiOne®?',
    a: 'Der QiOne® enthält keinerlei elektronische Bauteile. Maßgeblich für die Funktion ist der eigens entwickelte Gitterchip™. Dieser prägt durch sein statisches Feld, das maßgeblich durch die spezifische Atompositionierung von Goldatomen erreicht wird, Wassermoleküle. Somit steigt die Wahrscheinlichkeit an, dass Wasser Wasserstoffbrücken ausbaut. Dieser Zustand wird als kohärente Wasserstruktur bezeichnet und ist auch unter dem Begriff EZ-Water (extended zone) oder CD-Wasser (kohärente Domäne) bekannt. Der kohärente Zustand des Wassers ist selbstvermehrend.',
    flag: 'eso-buzzword',
  },
  {
    q: 'Ist die kohärente Wasserstruktur messbar?',
    a: 'Ja, die kohärente Wasserstruktur kann am einfachsten mit dem Mikroskop an hydrophoben Oberflächen beobachtet werden. Grenzflächenwasser ist ein Synonym für kohärentes Wasser. Kohärentes Wasser absorbiert verstärkt Licht bei 270nm. Je höher die Absorptionsrate bei 270nm, je höher der Anteil der kohärenten Wasserstruktur. Indirekt ist der Gehalt über ein HRV oder EKG-Gerät messbar. Zitat: Bionisches Wasser, Prof. Dr. Warnke, 2019',
    flag: 'faktenwiderspruch',
  },
  {
    q: 'Darf der QiOne® 2 Pro nass werden, bzw. in die Sauna?',
    a: 'Ja, der QiOne® 2 Pro ist robust gebaut, und Feuchtigkeit macht seinen Materialien nichts aus. Du kannst ihn also ohne Bedenken im Schwimmbad oder beim Schwimmen im Meer tragen. Auch in die Sauna darf er mit, denn hohe Temperaturen hält er problemlos aus. Denk dort nur daran, dass das Material dabei heiß werden kann.',
  },
  {
    q: 'Ist der QiOne® 2 Pro sicher für Anwender mit Allergien?',
    a: 'Das Gehäuse des QiOne® 2 Pro ist aus hochwertigem Chirurgenstahl 316L. Diesen Edelstahl haben wir ausgewählt, weil er besonders korrosionsbeständig ist und vom menschlichen Körper sehr gut vertragen wird. Er wird sogar in der Medizin für Implantate verwendet, zum Beispiel in der Orthopädie, weil er sich bestens mit dem Körper verbindet und allergische Reaktionen äußerst selten sind.',
  },
  {
    q: 'Lässt die Wirkung irgendwann nach bzw. verändert sich das Empfinden mit der Zeit?',
    a: 'Die Wirkung der Qi Blanco® Produkte bleibt konstant hoch, doch das Empfinden kann sich tatsächlich über die Zeit verändern. Dies ist ein ganz normaler Vorgang und kann durch verschiedene Faktoren beeinflusst werden. Menschen mit einer ausgeprägten Körpersensorik können die Wirkung des QiOne beispielsweise als besonders intensiv empfinden. Um eine hohe Körpersensorik zu erreichen, kann es hilfreich sein, den Körper zu entgiften und mit Mineralien zu versorgen.',
    flag: 'schuldumkehr',
  },
  {
    q: 'Wie funktioniert die Finanzierung über Klarna?',
    a: 'Leg deinen QiOne in den Warenkorb und geh zur Kasse. Als Bezahlart wählst du „Klarna – Sofort oder später bezahlen“ und klickst auf „Jetzt Kaufen“, berechnet wird dir dabei noch nichts. Danach landest du im Klarna-Checkout, klickst dort auf „Ratenzahlung“ und suchst dir Laufzeit und Betrag aus. Ab 25 € Warenwert kannst du in 6 Monatsraten zahlen, ab 500 € in 12 und ab 1000 € in 24 Monatsraten.',
  },
  {
    q: 'Aus welchem Material bestehen die Qi Blanco® Produkte?',
    a: 'Das Gehäuse ist aus hochwertigem Chirurgenstahl, und der Gitterchip™ darin entsteht aus einer maßgeschneiderten 750er Goldlegierung. Den Feinschliff machen am Ende Oberflächenveredler und Goldschmiede, die jedes Detail von Hand vollenden.',
  },
];

export const FAQ_CACAO = [
  {
    q: 'Was ist zeremonieller Kakao?',
    a: 'Zeremonieller Kakao ist eine spezielle Form von Kakao, die absichtsvoll und bewusst zubereitet und konsumiert wird. Im Gegensatz zu gewöhnlichem Kakao wird dieser Kakao unter Einbeziehung ritueller Elemente, Achtsamkeit und Intentionalität zubereitet. Zeremonieller Kakao wird oft in ganzheitlichen Praktiken verwendet und kann eine tiefere Verbindung mit dem Selbst, der Natur oder anderen Menschen fördern. Die Zubereitung und der Konsum werden als eine Art Zeremonie betrachtet, die die psychoaktiven und energetischen Eigenschaften des Kakaos betont.',
    flag: 'eso-buzzword',
  },
  {
    q: 'Was bedeutet psychoaktiv in diesem Zusammenhang?',
    a: 'Gemeint ist damit, dass Kakao das zentrale Nervensystem beeinflussen kann. Er enthält natürliche Stoffe wie Theobromin, Koffein, Phenylethylamin und Anandamid, und die können deine Stimmung, deine Wachheit und deine Entspannung leicht verändern, sodass sich auch Denken, Fühlen und Wahrnehmen positiv verändern können. Diese Effekte sind sanft und mit einem starken Rausch überhaupt nicht zu vergleichen.',
  },
  {
    q: 'Wie wird zeremonieller Kakao zubereitet?',
    a: 'Das ist ganz unkompliziert, und nach den ersten Versuchen wird es dir schnell vertraut und macht sogar richtig Freude. Erwärm etwa 75 ml Wasser oder Pflanzenmilch, zum Beispiel Hafermilch, auf höchstens 85 °C. Zerkleinere die Kakaomasse, wieg 15 g für eine Tasse ab und lös sie in der warmen Flüssigkeit auf, am besten unter Rühren. Wenn du magst, verfeinerst du deinen Kakao mit verschiedenen Gewürzen. Und dann nimm dir Zeit, ihn zu spüren und zu genießen.',
  },
  {
    q: 'Für wen ist Kakao (un)geeignet?',
    a: 'Kakao enthält Theobromin, einen natürlichen Wachmacher. Wenn du empfindlich auf Koffein reagierst, fang deshalb sehr vorsichtig an, mit 5 bis 10 g pro Tasse. Wenn du schwanger bist und reinen Kakao trinken möchtest, frag am besten vorher deine Ärztin, deinen Arzt oder deine Hebamme, weil die Ansichten dazu auseinandergehen. Kinder mögen Kakao oft sehr und genießen, dass er die Stimmung hebt. Dosier für sie behutsam und achte darauf, dass sie ihn nicht zu kurz vor dem Schlafengehen trinken. Und wenn du Medikamente oder Antidepressiva (SSRIs) nimmst, sprich bitte unbedingt mit deinem behandelnden Arzt, bevor du zeremoniellen Kakao trinkst.',
  },
  {
    q: 'Was ist eine Kakaozeremonie und ist diese nötig?',
    a: 'Die Kakaozeremonie ist eine bewusste und absichtliche Praxis des Genießens von zeremoniellem Kakao an einem Ort der Wohlfühlatmosphäre. Diese einzigartige Art des Konsums verstärkt die tiefe und unterschwellige Wirkung des Kakaos, was sie für den Einnehmenden leichter erfahrbar macht. Obwohl eine Kakaozeremonie keine zwingende Voraussetzung ist, bietet sie Raum für persönliche Entfaltung und Reflektion. Viele Menschen wählen bewusst, sich Zeit für ihren Kakao zu nehmen und ihn auf individuelle Weise zu zelebrieren, oft im Rahmen von Dankbarkeitspraktiken.',
    flag: 'unfalsifizierbar',
  },
  {
    q: 'Wie oft darf man zeremoniellen Kakao trinken?',
    a: 'Das ist ganz individuell und bei jedem Menschen ein bisschen anders. Achte am besten darauf, wie du dich körperlich und im Kopf damit fühlst. In der Regel passt ein maßvoller Genuss, der dir guttut.',
  },
  {
    q: 'Welche Effekte entstehen durch die Kombination von Qi Blanco®-Produkten und zeremoniellem Kakao?',
    a: 'Die Verwendung von Qi Blanco®-Produkten in Verbindung mit psychoaktivem Kakao kann die psychoaktive Erfahrung intensivieren und klarer erlebbar machen. Die speziellen Eigenschaften des Gitterchip™s 2.0 fördert die Bildung kohärenter Strukturen, die dazu beitragen, die tiefgehende mentale Wirkung des Kakaos zu unterstützen.',
    flag: 'wirkmechanismus',
  },
];
