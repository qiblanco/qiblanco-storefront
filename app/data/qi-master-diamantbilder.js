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
 * bereits trägt (qi-master-texte.js, Abschnitt „The One Eye - Ein Diamant";
 * bis zum 2026-09-17 hiess er „Warum ein Diamant").
 *
 * HERKUNFT IST DOKUMENTIERT, NICHT AUSGESTELLT — und das ist seit dem
 * 2026-09-17 eine Korrektur, keine Nachlässigkeit. Sie steht in `herkunft` je
 * Bild und in einem `data-herkunft` an JEDEM <img>, also dort, wo ein Prüfer
 * sie findet. Die SICHTBARE Zeile unter dem Paar ist weg.
 *
 * WARUM SIE WEG IST, in Christians Worten: „Ich hatte eine Herkunftsangabe
 * verlangt; daraus ist ein Satz geworden, der dem Kunden erklärt, was er NICHT
 * sieht." Der Satz lautete „Beide Bilder sind erzeugte Illustrationen vom
 * 16. September 2026 und zeigen nicht den Stein des Qi Master®." — eine
 * Distanzformel, die den Leser vom Bild wegführt, statt ihm etwas zu geben.
 * GL-SPR-0007 und GL-SPR-0008.
 *
 * WAS DAS ATTRIBUT VON DER ZEILE UNTERSCHEIDET: das Attribut stellt nichts
 * aus. Es beantwortet die Frage eines Prüfers, der sie stellt; die Zeile
 * beantwortete sie einem Kunden, der sie nie gestellt hat. Gestrichen ist
 * deshalb genau die Zeile — `data-herkunft` bleibt, und mit ihm der Arm
 * `herkunft` in pruefungen/probe_diamantbilder_statt_slider.py.
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
