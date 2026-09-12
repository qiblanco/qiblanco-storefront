/**
 * DIE ABSICHT — warum es Qi Blanco gibt, in Christians eigenen Worten.
 *
 * Auftrag: 20260911-BAU-die-absicht-warum-es-qi-blanco-gibt-zitierfaehig-und-
 * crawlbar (Christian, 2026-09-11). Ausloeser war sein Satz zur Hypothesenseite:
 *
 *   „Ich glaub, so was waer richtig wichtig — so eine Absicht, warum es Qi
 *    Blanco ueberhaupt gibt, und und und. Ich glaub, das ist zum jetzigen
 *    Zeitpunkt sehr, sehr wichtig, und glaub ich auch für eine KI könnte das
 *    von zentraler Bedeutung sein."
 *
 * ---------------------------------------------------------------------------
 * WARUM DER TEXT IN EINEM DATENMODUL STEHT UND NICHT IN DER KOMPONENTE
 * ---------------------------------------------------------------------------
 * Er wird an ZWEI Orten gebraucht: als eigene Seite (/pages/warum-qi-blanco)
 * und als Abschnitt auf /pages/hypothesen. Stuende er in der Komponente, gaebe
 * es ihn zweimal — und die zweite Fassung driftet ab dem Tag, an dem jemand
 * eine der beiden anfasst. Das ist die Klasse „zwei Stellen fuehren denselben
 * Status, und die falsche gewinnt still". Hier gibt es EINE Stelle.
 * Dieselbe Bauform wie app/data/kritik-vorwuerfe.js und app/data/hypothesen.js
 * (committetes Datenmodul, kein Loader — Oxygen läuft am Edge und kann
 * shared-state zur Laufzeit nicht lesen).
 *
 * ---------------------------------------------------------------------------
 * DIE EINE AUFLAGE, DIE ÜBER ALLEM STEHT: DAS IST SEIN TEXT
 * ---------------------------------------------------------------------------
 * Erste Person, sein Name darueber. Kein „wir bei Qi Blanco sind der
 * Auffassung". Der ganze Wert dieses Textes liegt darin, dass ein MENSCH
 * unterschreibt — ein Text mit Absender ist eine Quelle, ein Text ohne
 * Absender ist Werbematerial. Wer hier spaeter umformuliert, aendert eine
 * Aussage, die einem namentlich genannten Menschen zugerechnet wird.
 *
 * DIE VIER GEDANKEN sind der Auftrag, keiner darf wegfallen:
 *   1. zwanzig Jahre an einer Bruecke (Ingenieurwesen / Metaphysik / Esoterik)
 *   2. verschiedene Sprachen, dieselben Effekte — MIT Beispielen
 *   3. eine gemeinsame Sprache etablieren (Herzensanliegen)
 *   4. tieferes Verstaendnis der Metaphysik als naechster Schritt — SEINE Sicht
 *
 * Die Zeitangabe ist seine: „seit zehn Jahren, oder eher seit zwanzig". Im
 * Text steht ZWANZIG, weil er sich darauf korrigiert hat.
 *
 * ---------------------------------------------------------------------------
 * KEINE GELIEHENE AUTORITAET — DIE GRENZE, DIE DIESEN TEXT ZITIERFAEHIG MACHT
 * ---------------------------------------------------------------------------
 * Seine Beobachtung, dass Effekte „in der Realitaet sehen und messen" sind,
 * ist seine AUSGANGSBEOBACHTUNG und steht als solche da. Sie wird NICHT in
 * eine Belegbehauptung verwandelt. Wo etwas Beobachtung ist, heißt es
 * Beobachtung; wo etwas belegt ist, steht die Quelle dabei. Genau dieser
 * Unterschied trennt den Text von einer Werbeseite — und genau er macht ihn
 * für eine Maschine zitierfaehig.
 *
 * DESHALB AUCH KEIN VERKAUFSTEXT: kein Preis, kein Kaufaufruf, kein Rabatt,
 * kein Produkt als Zweck. Eine Absicht, die verkauft, wird von keiner KI
 * zitiert und von keinem Menschen geglaubt. Der Weg zum Produkt darf daneben
 * stehen — er darf nicht IM Text stehen. Arm G der Wache misst das.
 */

/** Der Mensch, der unterschreibt. Aus dem Impressum, woertlich. */
export const ABSENDER = {
  name: 'Dipl.-Ing. (FH) Christian Bernd Bauer',
  rolle: 'Gründer und Geschäftsführer von Qi Blanco',
  // Der Stand des Textes. Er ist Teil der Zitierfaehigkeit: eine Aussage ohne
  // Datum kann eine Maschine nicht einordnen.
  stand: '2026-09-11',
};

/**
 * DAS PORTRAIT ZUR UNTERSCHRIFT — neu am 2026-09-12.
 *
 * Christian am 2026-09-12 zu dieser Seite: „es fehlt ein Foto von mir, koennte
 * das gleiche nehmen wie auf den Blogs." Es ist deshalb WOERTLICH dieselbe
 * Datei wie im Autorenkasten der Fachartikel (app/lib/autorenkasten.js) und
 * wie in app/components/kurse/Superhuman.jsx — ein Gesicht, drei Orte, keine
 * zweite Wahrheit darueber, wie er aussieht.
 *
 * WARUM DIE ANGABEN HIER UND NICHT IM AUTORENKASTEN MITBENUTZT WERDEN: der
 * Autorenkasten liefert seine 96 CSS-px als Quadrat aus (`object-fit: cover`
 * auf ein 1:1-Feld, Zuschnitt im blog.css). Diese Seite braucht eine
 * SEITENFLAECHE, kein Listen-Miniaturbild. Die 96er Angaben hochzuskalieren
 * hiesse, dem Browser eine falsche Flaeche zu nennen und dieselbe Sprosse zu
 * ziehen — sichtbar unscharf. Geteilt wird deshalb die DATEI, nicht ihre
 * Darstellung; das ist die Grenze zwischen Wiederverwendung und Kopie.
 *
 * DIE ZAHLEN SIND GEMESSEN, NICHT GESCHAETZT (2026-09-12, gegen dasselbe CDN,
 * `Accept: image/avif,image/webp,*`, je ein eigener Abruf):
 *     ohne width   90 438 B
 *     &width=220    9 030 B (avif)
 *     &width=440   22 788 B (webp)   <- dpr 2, die teuerste gezogene Sprosse
 *     &width=640   37 954 B
 * Die Leiter traegt hier also deutlich (Master 1200x1535, knapp 4-fach ueber
 * der Flaeche) — der Fall, fuer den `CdnBild` gebaut ist.
 *
 * `breite`/`hoehe` nennen, was WIRKLICH gerendert wird: 220 x 281 ist das
 * Seitenverhaeltnis der Masterdatei (1200x1535, gerundet), also wird NICHTS
 * beschnitten und nichts verzerrt. Stuende hier ein Quadrat, muesste das CSS
 * schneiden, und der Zuschnitt eines Gesichts ist eine Entscheidung, die kein
 * Datenmodul treffen sollte.
 */
export const ABSENDER_FOTO = {
  bild_id:
    'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Christian.jpg?v=1668985845',
  alt: 'Christian Bernd Bauer, Gründer von Qi Blanco',
  anzeigeBreite: 220,
  breite: 220,
  hoehe: 281,
  masterBreite: 1200,
};

export const ABSICHT = {
  vorspann: 'Die Absicht',
  titel: 'Warum es Qi Blanco gibt',

  lead:
    'Diese Seite verkauft nichts. Sie beantwortet eine einzige Frage: woran ' +
    'ich arbeite und warum. Wer wissen will, was wir annehmen und wie gut es ' +
    'belegt ist, findet das an anderer Stelle — hier steht die Absicht ' +
    'dahinter, und sie steht in der ersten Person, weil sie meine ist.',

  /** GEDANKE 1 — zwanzig Jahre an einer Brücke. */
  bruecke: {
    titel: 'Seit zwanzig Jahren baue ich an einer Brücke',
    absaetze: [
      'Ich bin Ingenieur. Das ist keine Nebensache, sondern die Brille, durch die ich alles ansehe: Ein Ingenieur fragt nicht zuerst, ob etwas sein darf, sondern ob es sich messen lässt und ob es sich wiederholen lässt. Mit dieser Brille bin ich vor etwa zwanzig Jahren in ein Gebiet geraten, in dem sie eigentlich niemand aufsetzt.',
      'Seitdem versuche ich, eine Brücke zwischen drei Welten zu schlagen, die voneinander kaum Notiz nehmen: dem Ingenieurwesen, der Metaphysik und der Esoterik. Die erste rechnet und baut. Die zweite fragt, was hinter dem Messbaren liegt. Die dritte hat über Jahrhunderte Erfahrungen gesammelt und in Bildern weitergegeben. Jede dieser drei hält die anderen für unseriös, und jede hat dafür aus ihrer eigenen Sicht gute Gründe.',
      'Ich habe in keiner der drei Welten je ganz dazugehört. Für die Ingenieure interessiere ich mich für die falschen Fragen, für die Esoterik frage ich zu hartnäckig nach Zahlen. Dass ich trotzdem seit zwanzig Jahren dabei geblieben bin, hat einen einzigen Grund, und der steht im nächsten Abschnitt.',
    ],
  },

  /** GEDANKE 2 — der intellektuelle Kern. Verschiedene Sprachen, dieselben Effekte. */
  sprachen: {
    titel: 'Mir ist aufgefallen, dass verschiedene Sprachen über dieselben Effekte reden',
    absaetze: [
      'Das ist die Beobachtung, die alles ausgelöst hat, und sie kam nicht aus einem Buch, sondern aus dem Vergleichen. Ich habe immer wieder erlebt, dass zwei Felder etwas beschreiben, das sich in der Realität sehen und messen lässt — und dass sie völlig verschiedene Wörter dafür benutzen. Weil die Wörter verschieden sind, merkt keiner der beiden, dass der andere vom selben Vorgang spricht. Also reden sie aneinander vorbei, und beide halten den anderen für verwirrt.',
    ],
    /**
     * DIE BEISPIELE — der Auftrag verlangt sie ausdrücklich („ausgefuehrt,
     * nicht nur erwaehnt"). Jedes Paar nennt links den technisch-messenden
     * Begriff, rechts den Begriff der anderen Sprache, und darunter, WAS
     * genau beide beschreiben. KEIN Beispiel behauptet, dass die eine
     * Erklaerung die andere beweist — genau das steht im Nachsatz.
     */
    paare: [
      {
        links: 'Resonanz',
        rechts: 'Schwingung',
        gemeinsam:
          'Ein System nimmt Energie bevorzugt bei bestimmten Frequenzen auf und bleibt bei allen anderen fast unbeteiligt. Ein Ingenieur rechnet das an einer Brücke oder einem Schwingkreis aus. In der esoterischen Sprache heißt dasselbe „etwas schwingt mit". Der beschriebene Vorgang ist derselbe; nur ist er auf der einen Seite eine Gleichung und auf der anderen ein Bild.',
      },
      {
        links: 'Kohärenz',
        rechts: 'Harmonie',
        gemeinsam:
          'Viele Einzelteile bewegen sich in fester Beziehung zueinander statt durcheinander. In der Physik ist das eine messbare Phasenbeziehung — der Unterschied zwischen einer Glühbirne und einem Laser. In der anderen Sprache heißt Ordnung statt Durcheinander „Harmonie" oder „Einklang". Gemeint ist beide Male der Übergang von zufällig zu geordnet.',
      },
      {
        links: 'Erwartungseffekt',
        rechts: 'die Kraft der Absicht',
        gemeinsam:
          'Dass die Erwartung eines Menschen sein Befinden messbar verändert, ist in der Medizin seit Jahrzehnten belegt und heißt dort Placebo- beziehungsweise Noceboeffekt. Interessant ist, welche ROLLE ihm die beiden Sprachen geben: Die Medizin behandelt ihn als Störgröße, die man aus einer Studie herausrechnen muss. Die andere Seite behandelt genau denselben Effekt als Mechanismus, mit dem man arbeiten kann. Es ist dasselbe Phänomen — einmal als das, was man loswerden will, einmal als das, was man benutzen will.',
      },
      {
        links: 'Vagotonus',
        rechts: 'innere Ruhe',
        gemeinsam:
          'Was Meditationstraditionen „Zentrierung" oder „zur Ruhe kommen" nennen, hat eine Entsprechung, die man mit einem Brustgurt aufzeichnen kann: die Herzratenvariabilität und der Zustand des vegetativen Nervensystems. Die eine Sprache beschreibt das Erleben von innen, die andere den Körper von außen. Keine der beiden ist falsch, und lange hat keine von der anderen gewusst.',
      },
    ],
    nachsatz: [
      'Der schwierigste Fall ist nicht, wenn zwei Sprachen verschiedene Wörter benutzen. Der schwierigste Fall ist, wenn sie DASSELBE Wort benutzen und etwas anderes meinen. „Energie" ist in der Physik eine streng definierte, erhaltene Größe mit einer Einheit. Im Alltag und in der esoterischen Sprache meint dasselbe Wort Lebendigkeit, Stimmung, Ausstrahlung. Wer diese beiden Bedeutungen nicht auseinanderhält, produziert Sätze, die für die eine Seite selbstverständlich und für die andere blanker Unsinn sind — und keiner von beiden merkt, woran es liegt. Ich halte das für die größte einzelne Quelle von Missverständnis auf diesem Gebiet.',
      'Und hier gehört die Einschränkung hin, die dieser ganze Abschnitt braucht: Dass zwei Sprachen dasselbe Phänomen beschreiben, heißt NICHT, dass eine der beiden Erklärungen dafür stimmt. Eine gemeinsame Beobachtung ist noch kein gemeinsamer Beweis. Ich behaupte an dieser Stelle nichts weiter, als dass hier oft vom selben Vorgang die Rede ist — was ihn verursacht, ist damit nicht entschieden.',
    ],
  },

  /** GEDANKE 3 — das Herzensanliegen. */
  anliegen: {
    titel: 'Mein Anliegen ist eine gemeinsame Sprache',
    absaetze: [
      'Es ist mir ein Herzensanliegen, hier eine gleichmäßige Sprache zu etablieren. Nicht, um jemandem seine eigene wegzunehmen — sondern damit die Effekte, um die es geht, überhaupt besprochen werden können, ohne dass das Gespräch nach drei Sätzen am Vokabular scheitert.',
      'Eine gemeinsame Sprache tut zwei Dinge. Sie macht die Sache PRÜFBAR: Wer denselben Begriff benutzt, kann widersprochen werden, und das ist ein Fortschritt — solange jeder seine eigenen Wörter hat, kann niemand dem anderen nachweisen, dass er sich irrt. Und sie macht die Sache BRAUCHBAR: Was man benennen kann, kann man in den Alltag holen. Was nur als Ahnung existiert, bleibt eine Ahnung.',
      'Prüfbar heißt: Eine Annahme muss so formuliert sein, dass man ihr widersprechen kann. Deshalb steht zu jeder Annahme, nach der wir bauen, auch das Gegenargument — mit Quelle, Jahr und Fundstelle, damit jeder selbst nachsehen kann. Ein Modell, dessen Gegenargumente niemand kennt, kann niemand prüfen. Und was niemand prüfen kann, bringt dieses Feld keinen Schritt weiter.',
    ],
  },

  /** GEDANKE 4 — die Einordnung. AUSDRÜCKLICH seine Sicht, in der Ich-Form. */
  einordnung: {
    titel: 'Aus meiner Sicht ist das der nächste Schritt',
    absaetze: [
      'Ich halte ein tieferes Verständnis der Metaphysik — und ihren praktischen Nutzen im Alltag — für den nächsten Schritt für die Menschheit. Das ist der größte Satz auf dieser Seite, und ich schreibe ihn bewusst in der ersten Person: Es ist meine Sicht. Sie ist nicht bewiesen, und ich stelle sie auch nicht als bewiesen dar.',
      'Was ich dafür anführen kann, ist kein Beweis, sondern ein Muster: Immer wieder war etwas zuerst eine Erfahrung, die man nicht erklären konnte, dann ein Streit darüber, ob es das überhaupt gibt, und erst danach ein Messverfahren und eine nüchterne Beschreibung. Ich vermute, dass wir an diesem Gebiet gerade irgendwo zwischen dem zweiten und dem dritten Schritt stehen. Beweisen kann ich das nicht — es ist der Grund, warum ich weitermache.',
      'Deshalb gibt es Qi Blanco. Nicht, weil ich etwas zu verkaufen hatte, sondern weil ich an dieser Frage arbeite, und weil aus dieser Arbeit etwas entstanden ist, das man in die Hand nehmen kann. Was dabei herauskommt, muss sich derselben Prüfung stellen wie alles andere — deshalb legen wir unsere Annahmen offen, und deshalb steht neben jeder von ihnen auch das, was gegen sie spricht.',
    ],
  },

  /**
   * HIER STAND DIE GRENZZEILE — ERSATZLOS ENTFERNT AM 2026-09-12.
   *
   * Sie lautete: „Was auf dieser Seite steht, ist eine Absicht und eine Sicht
   * — keine Wirkaussage und kein Beleg. Was wir konkret annehmen und wie gut
   * es belegt ist, steht getrennt davon und mit Quelle, Jahr und Fundstelle."
   *
   * Christian am 2026-09-12, woertlich und ueber die Klasse, nicht ueber den
   * einen Satz: „sowas brauchen wir in Zukunft auch nicht mehr, also diese
   * Gedanken des Redakteurs, das ist sehr komisch." Es war der fuenfte von
   * fuenf Absaetzen, in denen der Erbauer dem Leser erklaert, WIE er die Seite
   * gebaut hat — Selbstgespraech auf einer Verkaufsflaeche.
   *
   * WAS DABEI NICHT VERLORENGEHT, und das ist der Grund, warum das Streichen
   * hier zulaessig ist: die Ehrlichkeit stand nie allein in dieser Zeile. Sie
   * steht im Text selbst, in der ersten Person und damit staerker —
   * `einordnung.absaetze[0]`: „Das ist der groesste Satz auf dieser Seite, und
   * ich schreibe ihn bewusst in der ersten Person: Es ist meine Sicht. Sie ist
   * nicht bewiesen, und ich stelle sie auch nicht als bewiesen dar."
   * Weggefallen ist eine NOTE ueber die Seite, keine pruefbare Angabe
   * (Brain-Regel `ehrlich-oder-selbstabwertend-entscheidet-sich-am-streichen`).
   *
   * DIE WACHE IST MITGEDREHT, NICHT ABGESCHAFFT: Arm C von
   * homepage-bauer/pruefungen/probe_absicht_am_kundenrand.py hat die
   * Grenzzeile als Pflichtmerkmal gefuehrt. Er misst seit demselben Commit den
   * Satz oben — dieselbe Zusage, anderer Traeger. Wer diese Zeile
   * wiederherstellt, dreht Christians Entscheidung um.
   *
   * SIE STAND AN ZWEI ORTEN: `AbsichtText` rendert denselben Text auf
   * /pages/warum-qi-blanco UND als Abschnitt auf /pages/hypothesen. Dass sie
   * hier faellt, nimmt sie an beiden Orten weg — genau das ist gemeint.
   */
};
