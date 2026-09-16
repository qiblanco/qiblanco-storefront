/**
 * Die zwei Diamantbilder auf /products/qi-master — Bild, Unterschrift, Herkunft
 * an EINER Stelle.
 *
 * Christian am 2026-09-16: „Diesen Bereich hier ersatzlos streichen, dafür zwei
 * Bilder einfügen: eines von einem Naturdiamanten und eines von einem
 * geschliffenen hochreinen Diamanten in höchster Qualität, Brillantschliff.
 * Unterschrift: ‚Rohdiamant‘ und ‚Hochreiner Diamant in Brillantschliff‘."
 *
 * WARUM DIE TEXTE HIER UND NICHT IM MARKUP LEBEN: dieselbe Trennung, die
 * qi-master-texte.js für die drei Inhalts-Abschnitte trägt — jede Aussage steht
 * bei ihrer Quelle, und die Herkunft eines Bildes ist prüfbar, ohne dass man
 * JSX lesen muss.
 *
 * DIE UNTERSCHRIFTEN SIND WORTGENAU UND WERDEN NICHT ANGEFASST. Christian tippte
 * „Roh Diamant" und „Hochreiner Diamant in Brilljant Schliff"; korrigiert ist
 * allein die Rechtschreibung (stehende Erlaubnis vom 2026-09-16). „Rohdiamant"
 * ist dabei keine Erfindung, sondern die Schreibweise, die dieselbe Seite
 * bereits trägt (qi-master-texte.js, Abschnitt „Warum ein Diamant").
 *
 * HERKUNFT IST PFLICHT UND STEHT AM KUNDENRAND (Erfüllungskriterium des
 * Auftrags: „Zu jedem Bild ist die Herkunft geschrieben. Fehlt sie, ist die
 * Probe rot."). Sie wandert deshalb in ein `data-herkunft` an JEDEM <img> UND
 * in eine sichtbare Zeile unter dem Paar — ein Eintrag, den nur diese Datei
 * kennt, wäre die Quelle, aber kein Beleg: er kann dastehen, während die Seite
 * ihn nie ausliefert.
 *
 * WAS DIE BILDER SIND UND WAS NICHT: erzeugte Illustrationen, keine
 * Produktfotos. Christian hat genau diesen Weg gewählt („erzeugtes Bild —
 * schnell und frei, zeigt keinen realen Stein. Das nehmen wir.") und die
 * Auflage dazugegeben: generisch halten, kein Anhänger, keine Fassung, kein
 * Gitterchip™, keine Iris, kein Logo. Der Grund ist einfach — sobald die
 * Fassung im Bild ist, liest der Kunde es als sein Stück.
 *
 * WARUM DIE BILDER AUF DEM SHOPIFY-CDN LIEGEN UND NICHT UNTER public/: das ist
 * GL-PRO-0015, und der Deploy-Gate setzt es durch — der erste Entwurf dieses
 * Baus legte beide webp nach public/qi-master/ und wurde mit
 * „BLOCK[binary] ... Medien aufs CDN, nicht ins Repo" abgewiesen. Richtig so:
 * ein Binary im Repo wächst in jede Kopie, in jeden Klon und in jede Historie.
 * Hochgeladen mit medien-hosting/bin/cdn-publish (inhaltsadressierter Name
 * qb-<bereich>--<slug>--<hash12>, Hash-Dedup gegen das Manifest, also
 * idempotent: derselbe Inhalt lädt nie zweimal hoch).
 *
 * WARUM BEIDE DASSELBE MASS UND DENSELBEN TON TRAGEN: „Gleiche Bildgröße und
 * gleicher Zuschnitt für beide. Zwei Diamanten nebeneinander, von denen einer
 * größer wirkt, erzählen eine Rangfolge, die nicht gemeint ist." Gemessen nach
 * der Erzeugung nahm der Brillant das 1,31-fache der Motivfläche des Rohsteins
 * ein, und die beiden Papiertöne wichen um bis zu 8 RGB-Punkte voneinander ab.
 * Beides ist deterministisch angeglichen (Zoom 1,1456 auf den Rohstein,
 * Kanal-Verstärkung beider auf den Mittelwert der Töne): danach Flächen-
 * verhältnis 1,017 und Papiertöne (237,231,216) gegen (238,231,217). Das
 * Skript dazu liegt beim Auftrag (bildaufbereitung.py) und ist Teil der
 * Herkunft, nicht ein stiller Nachgriff.
 */

export const QIMASTER_DIAMANTBILDER = [
  {
    id: 'rohdiamant',
    src:
      'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-qi-master--rohdiamant--77e1ff04e809.webp?v=1789595122',
    unterschrift: 'Rohdiamant',
    alt:
      'Rohdiamant: ein ungeschliffener, oktaedrischer Diamantkristall mit matten ' +
      'Naturflächen, liegend auf hellem Papier. Erzeugte Illustration.',
    herkunft:
      'erzeugt am 2026-09-16, fal.ai flux-2-pro (Text zu Bild), auf gleiche ' +
      'Motivfläche und einen Papierton normalisiert',
    breite: 1024,
    hoehe: 1024,
  },
  {
    id: 'brillant-schliff',
    src:
      'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-qi-master--brillant-schliff--57d0611c0241.webp?v=1789595131',
    unterschrift: 'Hochreiner Diamant in Brillantschliff',
    alt:
      'Hochreiner Diamant im Brillantschliff: ein geschliffener, farbloser Stein ' +
      'von oben, die Facetten zur Kamera, auf hellem Papier. Erzeugte Illustration.',
    herkunft:
      'erzeugt am 2026-09-16, fal.ai flux-2-pro (Text zu Bild), auf gleiche ' +
      'Motivfläche und einen Papierton normalisiert',
    breite: 1024,
    hoehe: 1024,
  },
];

/**
 * Die sichtbare Herkunfts-Zeile unter dem Paar. Ein Satz, ein Gedanke, Antwort
 * zuerst (Hausstimme). Sie sagt dem Kunden zwei Dinge, die er sonst nicht
 * wissen kann: dass die Bilder erzeugt sind, und dass sie nicht sein Stück
 * zeigen.
 */
export const QIMASTER_DIAMANTBILDER_HERKUNFT =
  'Beide Bilder sind erzeugte Illustrationen vom 16. September 2026 und zeigen nicht den Stein des Qi Master®.';
