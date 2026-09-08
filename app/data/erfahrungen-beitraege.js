/**
 * Beitraege der Seite /pages/erfahrungen — Datenquelle, kein Layout.
 *
 * HERKUNFT (nicht hier erhoben, sondern uebernommen): Segment s02 des Grossjobs
 * 20260907-GROSSJOB-erfahrungen-und-kritik-…-prio6 hat den eigenen YouTube-Kanal
 * ueber die Data API v3 geerntet, die Untertitelspuren gezogen und je Beitrag
 * eine von Hand geschriebene, treue Zusammenfassung angelegt.
 * SSoT: homepage-bauer/data/erfahrungen/{vorrat,zusammenfassungen}.json.
 *
 * DREI EIGENSCHAFTEN, DIE BEIM AENDERN NICHT VERLORENGEHEN DUERFEN:
 *
 * 1. KEIN WOERTLICHES ZITAT. Alle Untertitelspuren des Kanals sind `trackKind=asr`
 *    (maschinell). Sie tragen belegte Hoerfehler — "QiOne" erscheint als "the G1",
 *    "Qi Blanco" als "CH Blanco" —, und zwei Spuren DESSELBEN Testimonials
 *    (Patrick Thiele) geben dieselbe gesundheitsnahe Stelle WIDERSPRUECHLICH
 *    wieder. Ein Satz in Anfuehrungszeichen aus dieser Quelle waere ein Satz, den
 *    der Mensch so nie gesagt hat. Deshalb steht hier ausschliesslich
 *    zusammenfassende Rede ("er berichtet", "sie sagt") und nie eine Zeile
 *    Wortlaut. Das gilt AUCH fuer `titel`: der ist vom Haus geschrieben, nicht
 *    vom Sprecher — er wird als Videotitel gezeigt und NIE als Aeusserung
 *    zugeschrieben.
 *
 * 2. NUR VORVEROEFFENTLICHTE SPRECHER. Jeder Sprecher hier steht mit vollem Namen
 *    bereits auf einer Verkaufsflaeche des Hauses (Fundstellen je Beitrag in
 *    vorrat.json). Das ist eine bereits getroffene Hausentscheidung ueber die
 *    Veroeffentlichung — ausdruecklich KEIN Einwilligungsbeleg. Neun weitere
 *    gemessene Sprecher stehen dort NICHT und fehlen deshalb hier; sie liegen als
 *    offener Punkt bei Christian (forschungs-meister qione-testimonial-gastfreigabe).
 *    Wer einen Beitrag ergaenzt, prueft zuerst dieses Feld.
 *
 * 3. KEINE DOPPELUNG. Vier der 21 verwendbaren Beitraege sind inhaltsgleiche
 *    Zweitveroeffentlichungen (gr2KTESB3JM, EJEgM1KmGBc, MM2a5poXxhA, ll887l8_sBQ)
 *    und fehlen bewusst. Zwei Beitraege desselben Sprechers sind nur dann beide
 *    hier, wenn sie inhaltlich verschieden sind (Scott Schwenk).
 *
 * Umlaute: der Bestand in data/erfahrungen ist ASCII-transliteriert (Server-
 * Konvention fuer interne Dateien). Kundensichtbarer Text braucht echte Umlaute
 * (Hausregel, live gegated) — die Rueckwandlung lief wortweise ueber eine
 * Entscheidungstabelle, nicht per Muster: "Bauer", "Zuschauer", "gedauert" und
 * "spirituellen" tragen dieselbe Buchstabenfolge OHNE Umlaut.
 */
export const ERFAHRUNGS_BEITRAEGE = [
  {
    videoId: "CkHjy2lU0IM",
    sprecher: "Patrick Thiele",
    titel: "\"Der Game Changer!\" – Patrick Thiele | QiOne® 1",
    sprache: "de",
    zusammenfassung:
      "Patrick Thiele stellt sich als Biohacker und Mentaltrainer vor und trägt den QiOne zum Aufnahmezeitpunkt seit knapp vier Monaten. Er berichtet, er habe schon vor dem Kauf nach einer Lösung für genau die Bereiche gesucht, die das Produkt abdecke, und sei nach einem Gespräch mit Christian Bauer über die Technologie begeistert gewesen. Vom ersten Moment an habe er eine Veränderung im Körper gespürt und diese auch an seiner Uhr ablesen können. In Situationen, in denen es darauf ankomme – im Beruf, im Alltag, beim Sport – fühle er sich anders. Er empfiehlt, es einfach auszuprobieren, und nennt es für sich einen Game Changer.",
  },
  {
    videoId: "3prNkfss1Uc",
    sprecher: "Yann Sura",
    titel: "Der Unterschied in meinem Wohlbefinden ist enorm! – Yann Sura | QiHome® Air | Gitterchip™",
    sprache: "de",
    zusammenfassung:
      "Yann Sura spricht über den QiHome Air. Er stellt voran, dass er solchen Dingen gegenüber grundsätzlich kritisch eingestellt sei, und begründet das mit seiner Arbeit im spirituellen Umfeld. Er habe zuvor bereits den QiOne getragen und einen deutlichen Unterschied gespürt; deshalb habe er sich nach etwa vier Wochen zusätzlich das Gerät für zu Hause geholt. Er berichtet von drei Beobachtungen: im Büro habe er sich lockerer gefühlt und abends noch klar denken können statt erschöpft zu sein; im Schlafzimmer habe er – wie auch seine Frau – intensivere Träume gehabt; und beim Wasser habe er einen Geschmacksunterschied bemerkt. Er räumt ausdrücklich ein, es könne Placebo sein, glaubt es aber nicht. Er schildert außerdem, dass Dritte bei Videodrehs ebenfalls einen Unterschied bemerkt hätten.",
  },
  {
    videoId: "jyLyXZqHxaw",
    sprecher: "Constantin Preis",
    titel: "Deutscher Meister: \"Ich kann meine Freizeit wieder voll nutzen!\" – Constantin Preis | QiOne® 2 Pro",
    sprache: "de",
    zusammenfassung:
      "Constantin Preis, Leichtathlet über 400 Meter Hürden, trägt die Kette zum Aufnahmezeitpunkt seit etwa Ende September. Er berichtet vier Beobachtungen. Erstens das Immunsystem: in den Jahren zuvor sei er nach jeder Saison ein bis zwei Wochen krank gewesen, in diesem Jahr nicht; auf Reisen habe er zwar erste Anzeichen gespürt, sei aber am nächsten Morgen wieder fit gewesen. Zweitens der Schlaf: er schlafe entspannter ein, und seine per Tracker aufgezeichnete Tiefschlafphase habe sich verbessert; an Tagen ohne die Kette habe er nach eigener Aussage besonders schlecht geschlafen. Drittens Entspannung und Klarheit. Viertens die Bildschirmzeit: die Abhängigkeit vom Handy habe deutlich nachgelassen. Er ordnet diese Beobachtungen selbst ausdrücklich der Kette zu.",
  },
  {
    videoId: "aG36zJKxDzg",
    sprecher: "Nada & Kurt Tepperwein",
    titel: "Man spürt die Aktivierung der Seele in den Zellen – Nada & Kurt Tepperwein | QiOne®2Pro |Gitterchip™",
    sprache: "de",
    zusammenfassung:
      "Nada Breidenbach und Kurt Tepperwein schildern in einem Nachgespräch ihre Erfahrung mit dem QiOne. Nada berichtet, ihr Körper habe sofort reagiert, als sie das Gerät in der Hand hielt; in einer Nacht, in der sie es trug, seien Themen hochgekommen – es sei für sie kein durchweg entspannender, sondern ein Prozess auslösender Vorgang gewesen. Kurt Tepperwein sei zunächst skeptisch gewesen, habe es getragen und dann abgelegt mit der Begründung, er brauche es nicht mehr. Kurz darauf habe er über Herzrhythmusstörungen berichtet; nachdem er es wieder angelegt habe, sei der Zustand nach seiner Aussage wieder stabil gewesen. Beide ordnen das Produkt in einen spirituellen Deutungsrahmen ein.",
  },
  {
    videoId: "ugzSE3UXno4",
    sprecher: "Frank Delventhal",
    titel: "Dreifacher Weltrekordhalter Frank Delventhal spricht über seine Erfahrungen mit QiOne",
    sprache: "de",
    zusammenfassung:
      "Frank Delventhal, Weltrekordhalter im Kraftsport, bedankt sich für das Produkt und berichtet, er habe die erste Generation lange getragen und beim Wechsel auf die zweite erneut einen Unterschied bemerkt. Er habe seiner Tochter ebenfalls eines besorgt, weil ihm Gesundheit wichtiger sei als Kraft. Er erzählt, Ärzte hätten ihm vor elf Jahren wegen seiner Schulter gesagt, er werde nie wieder Sport machen; danach habe seine Rekordlaufbahn erst begonnen, und er habe in diesem Jahr mehrere Weltrekorde aufgestellt, bei denen er das Produkt getragen habe. Er stellt ausdrücklich klar, dass er nicht erzählen wolle, was das Produkt alles könne, sondern danke sagen wolle. Sein Appell an die Zuschauer ist allgemein gehalten: sich um die eigene Gesundheit zu kümmern und die Dinge zu tun, die zu dem Menschen gehören, der man sein möchte.",
  },
  {
    videoId: "EjXTIldVrk4",
    sprecher: "Yann Sura",
    titel: "\"Ich war sehr skeptisch, nun absoluter Fan!\" – Yann Sura | QiOne® 2 Pro | Gitterchip™",
    sprache: "de",
    zusammenfassung:
      "Yann Sura berichtet über den QiOne, den er zum Aufnahmezeitpunkt seit knapp zwei Monaten trägt. Er sagt, er habe zuvor viele ähnliche Anhänger ausprobiert, teils in derselben Preisklasse, und der Effekt sei jeweils unklar geblieben – er habe sich stets gefragt, ob es Placebo sei. Bei diesem Produkt sei ihm nach einem stressigen Tag und einer halben Stunde in der Natur aufgefallen, dass es ihm deutlich besser gehe, ohne dass er es zunächst dem Anhänger zugeschrieben habe. Überzeugt habe ihn erst der Gegentest: an einem Tag ohne den Anhänger sei der Tag chaotischer verlaufen, und als er ihn seiner Frau geliehen habe, habe er ihn zurückerbeten. Er grenzt ausdrücklich gegen Heilversprechen ab und beschreibt die Wirkung als Stärkung dessen, was ohnehin da ist. Er nennt Authentizität, Demut und Mitgefühl als seine wichtigsten Werte.",
  },
  {
    videoId: "4fd1kQCQ9FQ",
    sprecher: "Mark Henninger",
    titel: "QiOne® - zu intensiv am Anfang - Mark Henninger über den QiOne von Qi Blanco.",
    sprache: "de",
    zusammenfassung:
      "Mark Henninger, Mitgründer von Black Sheep Athletics in Berlin, trägt den QiOne zum Aufnahmezeitpunkt seit etwa eineinhalb Jahren. Er berichtet ausdrücklich von einem unangenehmen Anfang: beim ersten Tragen habe sich das Gefühl fremd angefühlt, er habe ihn weder ganztags noch nachts tragen können, und es habe eine Weile gedauert, bis sein Körper sich daran gewöhnt habe. Bereits in dieser Zeit habe er mehr Energie bemerkt. Wichtiger sei ihm gewesen, dass er sich ausbalancierter fühle: in stressigen Situationen einen klaren Kopf behalten, klare Entscheidungen treffen und Dinge weniger persönlich nehmen. Das sei bis heute der Grund, warum er ihn trage.",
  },
  {
    videoId: "yesfFpoBk-s",
    sprecher: "Marion Engelbrecht",
    titel: "Marion Engelbrecht über den QiOne® von Qi Blanco®",
    sprache: "de",
    zusammenfassung:
      "Marion Engelbrecht, Business-Coach und Sängerin und Mutter von zwei Kindern, berichtet über ihre Erfahrung. Sie arbeite täglich viel am Handy und am Laptop und sei seit der Nutzung dabei nicht mehr müde. Auch nach Auftritten vor vielen Menschen falle sie nicht mehr in ein Erschöpfungsloch. Sie schlafe intensiver, schlafe durch und wache ausgeruht auf. Sie nennt ausdrücklich eine Voraussetzung, die sie selbst bemerkt habe: sie müsse mindestens zwei Liter Wasser am Tag trinken, damit es gut wirke. Außerdem berichtet sie von einer regulierteren Verdauung, ebenfalls unter derselben Trinkmenge-Bedingung. Sie sagt, es habe auf vielen Ebenen viel Positives gebracht, vor allem, dass es ihr gut gehe und sie sowohl beruflich leistungsfähig als auch nachmittags für ihre Kinder da sein könne.",
  },
  {
    videoId: "3KBHZ2bWp6U",
    sprecher: "Constantin Preis",
    titel: "\"Es fühlt sich wie eine Schutzrüstung an\" – Constantin Preis – QiBracelet®",
    sprache: "de",
    zusammenfassung:
      "Constantin Preis spricht im Gespräch über das QiBracelet im Vergleich zur Kette. Er sagt, das Armband nehme er körperlich ständig wahr, die Kette dagegen kaum. Er beschreibt ein leichtes Druckgefühl und eine dauerhafte Präsenz, die ihm helfe, fokussiert zu bleiben. Ausführlich schildert er einen selbst beobachteten Unterschied zwischen linkem und rechtem Handgelenk: links empfinde er sich entspannter, rechts deutlich aktiver. Er trägt Kette und Armband nach eigener Aussage durchgehend, auch beim Duschen, Meditieren und in der Sauna.",
  },
  {
    videoId: "SWLQmO3TYQg",
    sprecher: "Robin Stolberg",
    titel: "Das Biohacking Tool Nr.1 | Robin Stolberg | Natural Biohacking | QiOne®",
    sprache: "de",
    zusammenfassung:
      "Robin Stolberg vom Natural-Biohacking-Podcast stellt den Anhänger als für ihn wichtigstes Biohacking-Werkzeug vor; er habe ihn zum Aufnahmezeitpunkt vier Monate testen dürfen. Er berichtet von besserem Schlaf und besserem Training und nennt als konkretes Beispiel seine Atemübungen nach der Wim-Hof-Methode: seine Retentionszeit habe zuvor meist zwischen eineinhalb und zwei Minuten gelegen und liege nun bei etwa drei Minuten. Als Mensch, der viel und lange am Laptop im Online-Business arbeite, halte er einen Schutz gegen Strahlung für wichtig. Er gibt anschließend in eigenen Worten wieder, wie das Haus die Technologie erklärt.",
  },
  {
    videoId: "Ay7tFOpqGVU",
    sprecher: "André Stern",
    titel: "\"Es fühlt sich an, als würde ich nach Hause kommen\" – André Stern | QiOne® 2 Pro",
    sprache: "de",
    zusammenfassung:
      "Andre Stern erzählt, wie er den QiOne geschenkt bekam. Er sei skeptisch gewesen und habe gedacht, schaden könne es nicht. Beim Tragen habe er bemerkt, es sei ein wenig, als sei etwas nach Hause gekommen. Er sagt, er sei zu diesem Zeitpunkt körperlich nicht besonders fit gewesen und habe in den folgenden Tagen einen Unterschied festgestellt, auch bei seinen sportlichen Leistungen. Er berichtet ausdrücklich, er habe die auf der Website verlinkten wissenschaftlichen Studien gelesen und sie hätten sich mit seinem Empfinden gedeckt. Bemerkenswert und ausdrücklich Teil seiner Aussage ist seine Placebo-Einordnung: selbst wenn es nur Placebo wäre, sei Placebo die beste Medizin, die es gebe – er halte es aber nicht dafür. Er führe das Produkt auf seiner Website unter der Rubrik der Dinge, die sein Leben verändert hätten.",
  },
  {
    videoId: "I0I0ErUHYbs",
    sprecher: "Lisa Mestars",
    titel: "QiOne® – mehr Energie für Dich - Lisa Mestars über den QiOne von Qi Blanco.",
    sprache: "de",
    zusammenfassung:
      "Lisa Mestars trägt den QiOne zum Aufnahmezeitpunkt seit drei Wochen. Sie berichtet, sie habe schon beim Anlegen ein deutliches Gefühl im Brustkorb bemerkt, und nehme seither ihre eigene Körperenergie stärker wahr. Sie trage ihn Tag und Nacht und merke vor allem dann, dass etwas fehle, wenn sie ihn zum Duschen ablege und danach vergesse, ihn wieder anzuziehen. Sie betont, sie sei sonst niemand, der Schmuck trage; es gehe ihr nicht um das Aussehen. Da sie sehr viel online am Laptop und am Handy arbeite, sei sie beruhigt, etwas gefunden zu haben, das sie dabei unterstütze, leistungsfähig zu bleiben.",
  },
  {
    videoId: "ltZx74vsFTs",
    sprecher: "Yann Sura",
    titel: "Ich fühle mich zentrierter und erlange mehr Bewusstsein | Yann Sura über die Qi Blanco® Technologie",
    sprache: "de",
    zusammenfassung:
      "Yann Sura beschreibt seine Erfahrung mit der Technologie in einem Gespräch. Er sagt, das Erlebte lasse sich schwer in Worte fassen, und nennt eine veränderte Schlafqualität sowie das Gefühl, zentrierter zu sein. Er berichtet, er habe das Produkt vielen Menschen weitergegeben und finde die Überschneidungen in deren Rückmeldungen bemerkenswert. Zum Aufnahmezeitpunkt nutzt er QiHome (etwa eineinhalb Jahre), QiOne (etwas länger) und zuletzt das QiBracelet. Der Beitrag ist stark von spiritueller Sprache geprägt und enthält keine konkrete körperliche Angabe.",
  },
  {
    videoId: "Krqm48Dc2b0",
    sprecher: "Mindy Sahagun",
    titel: "I feel more grounded & protected | Mindy Sahagun | QiOne® 2 Pro",
    sprache: "en",
    zusammenfassung:
      "Mindy Sahagun trägt das Schmuckstück seit etwa zwei Jahren und legt es nach eigener Aussage kaum je ab. Sie berichtet, es gebe ihr ein Gefühl von Geerdetsein und viel Energie, sie schlafe besser und fühle sich kreativer. Außerdem schätze sie den Schutz vor der Technik, von der sie ständig umgeben sei.",
  },
  {
    videoId: "tLETuX9bJoU",
    sprecher: "Dr. Andreas Kramer",
    titel: "I Feel Better, Sleep Better! | Dr. Andreas Kramer | Sleep Effects Health | QiBracelet®, QiOne® 2 Pro",
    sprache: "en",
    zusammenfassung:
      "Dr. Andreas Kramer hat das QiBracelet seit etwa zweieinhalb Monaten und trägt es täglich. Er stellt ausdrücklich voran, er habe beim ersten Anlegen keine Superkräfte und kein Kribbeln verspürt – eine der wenigen Stellen im Vorrat, an denen ein Sprecher eine Erwartung ausdrücklich dämpft. Inzwischen wolle er es aber nicht mehr missen: er berichtet von weniger Erschöpfung, mehr Energie am Morgen und besserem Schlaf. Da er viel am Telefon und am Rechner arbeite, empfinde er den Schutz als zusätzlichen Nutzen. Wenn er es nach dem Sport einmal vergesse, vermisse er es.",
  },
  {
    videoId: "HqnnToUGagI",
    sprecher: "Scott Schwenk",
    titel: "I've tried similar technologies – but this absolutely NEXT LEVEL! | Scott Schwenk | QiBracelet® |",
    sprache: "en",
    zusammenfassung:
      "Scott Schwenk berichtet, er habe die Wirkung bereits gespürt, als er das Produkt noch ungeöffnet in der Hand hielt. Er habe zuvor jahrzehntelang andere, in seinem Markt bekannte Technologien genutzt, die hilfreich gewesen seien; dieses sei für ihn eine andere Stufe. Als Beobachtungen nennt er tiefere Atemzüge, gleichmäßigere Stimmung, ein zugänglicheres Herzgefühl und weniger Augenbelastung vor dem Laptop – nach vier Stunden Videokonferenzen habe er nicht die übliche Erschöpfung verspürt. Er schränkt selbst ein, er sei erst etwa einen Monat dabei. Außerdem beschreibt er einen aus seiner Sicht verstärkten Effekt im Beisein anderer Träger.",
  },
  {
    videoId: "I-4r69GwmZ8",
    sprecher: "Scott Schwenk",
    titel: "Now I've found the ultimate EMF solution! | Scott Schwenk | QiBracelet® | QiOne® 2 Pro | QiHome® Air",
    sprache: "en",
    zusammenfassung:
      "Scott Schwenk stellt sich als Master Coach und Kursleiter vor und schildert seine Erfahrung ausführlicher. Er habe jahrzehntelang ein anderes Produkt genutzt und dieses bei einem Kursdreh in der Schweiz geschenkt bekommen. Schon bevor er es ausgepackt habe, habe er etwas wahrgenommen; nach dem Anlegen habe er ein Gefühl in der Brust bemerkt, das er als langjähriger Meditierender als Weitung des Herzzentrums beschreibt. Seither berichtet er, er sei ausgeruhter aufgewacht, obwohl er kein Morgenmensch sei, habe gleichmäßigere Energie über den Tag, sei auch nach einem Monat Europa vom Jetlag schneller erholt gewesen und sei ebenso fokussiert wie sonst – obwohl ihm ein sonst regelmäßig eingenommenes Nahrungsergänzungsmittel seit Wochen ausgegangen sei. Er ordnet seine eigene Sprache ausdrücklich als die eines Künstlers ein und sagt, jeder werde seine eigene Erfahrung machen.",
  },
];
