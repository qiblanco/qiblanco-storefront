/**
 * Die vier Illustrationen zu den Literaturblöcken auf /products/qi-master —
 * Bild, Alternativtext und Herkunft an EINER Stelle.
 *
 * Christian am 2026-09-17: „Wir brauchen zu jedem der Literaturblöcke noch
 * ein aussagekräftiges Bild (vom AI-Server erstellt). Und jedem einen
 * Aufzählungspunkt geben, also von 1. bis 4."
 *
 * WARUM EIN EIGENES MODUL UND NICHT EIN FELD IN qi-master-texte.js: die
 * Texte der vier Blöcke sind unantastbar („Die Texte der vier Abschnitte
 * bleiben unverändert, ebenso die Zitate und Quellenangaben"). Ein Bildfeld
 * mitten in diese Sätze zu setzen hieße, die Datei anzufassen, in der laut
 * Auftrag nichts zu ändern ist außer einer Überschrift. Hier liegt, was
 * dazukommt; dort liegt, was bleibt. Dieselbe Trennung trägt schon
 * qi-master-diamantbilder.js für das Bildpaar darüber.
 *
 * DER SCHLÜSSEL IST DIE BLOCK-ID, NICHT DIE POSITION. `befunde[]` in
 * qi-master-texte.js trägt je Block ein `id`; danach wird hier gesucht. Eine
 * Zuordnung über den Index wäre still falsch, sobald jemand einen Block
 * einfügt oder umstellt — und „still falsch" heißt hier: das Bild zur
 * Kohärenz stünde unter der Zelle, und niemandem fiele ein Fehler auf.
 *
 * DIE NUMMERN STEHEN NICHT HIER, sondern entstehen beim Rendern aus der
 * Reihenfolge von `befunde[]` (QiMaster.jsx). Eine Nummer im Datenmodul wäre
 * eine zweite Buchführung derselben Reihenfolge: wer einen Block umstellt,
 * müsste zwei Stellen nachziehen, und die falsche gewinnt still.
 *
 * WAS DIE BILDER SIND UND WAS NICHT — das ist bei diesen vier die schärfste
 * Grenze, und sie ist inhaltlich, nicht vorsichtig: unter jedem dieser Blöcke
 * steht ein echtes, nachprüfbares Zitat von König, Del Giudice, Popp oder
 * Pollack. Ein erzeugtes Bild, das wie IHRE Messung aussieht, macht aus einem
 * echten Beleg einen scheinbaren. Christian wörtlich: „Der Grund ist nicht
 * Vorsicht, sondern Genauigkeit." Deshalb sind es Zeichnungen auf Papier —
 * kein Achsenkreuz, kein Zahlenwert, keine Legende, keine Bildunterschrift im
 * Stil einer Abbildungslegende, nichts, was nach Studienabbildung aussieht.
 * Gemessen wird das am Bild selbst, nicht behauptet: Arm `illustration` in
 * homepage-bauer/pruefungen/probe_literatur_nummern_und_bilder.py.
 *
 * KEIN PRODUKT IM BILD: kein Qi Master®, kein Anhänger, keine Fassung, kein
 * Gitterchip™, kein Logo. „Das sind Illustrationen zu fremden Forschungs-
 * gedanken, nicht Produktfotos."
 *
 * HERKUNFT IST DOKUMENTIERT, NICHT AUSGESTELLT. Christian: „Je Bild wird die
 * Herkunft geschrieben — erzeugt, Datum, Verfahren. Im Auftragsverzeichnis,
 * nicht auf der Seite. Vgl. den 16.09.: die Herkunftszeile stand auf der
 * Seite und musste wieder weg." Sie steht deshalb an zwei Orten, und keiner
 * davon ist der sichtbare Text: vollständig in
 * claude-jobs/20260917-vier-literaturbloecke-nummern-und-je-ein-bild/
 * HERKUNFT.md (samt Prompt, Modell, Kosten und Aufbereitungs-Messwerten), und
 * knapp als `data-herkunft` an jedem <img>, wo ein Prüfer sie ohne Umweg
 * findet. Die Probe misst BEIDES — dass das Attribut da ist, und dass auf der
 * Seite keine Herkunftsformel steht.
 *
 * WARUM DIE BYTES AUF DEM SHOPIFY-CDN LIEGEN UND NICHT UNTER app/assets/:
 * das ist GL-PRO-0015, und der hb-deploy-Gate setzt es durch
 * („BLOCK[binary] … Medien aufs CDN, nicht ins Repo"). Der Auftrag nennt als
 * Mutationsgebiet `app/assets/` — dort können diese Dateien baulich nicht
 * liegen; der Vorgängerbau vom 16.09. ist mit genau diesem Versuch abgewiesen
 * worden. Hochgeladen mit medien-hosting/bin/cdn-publish (inhaltsadressierter
 * Name qb-<bereich>--<slug>--<hash12>, Hash-Dedup gegen das Manifest, also
 * idempotent: derselbe Inhalt lädt nie zweimal hoch).
 *
 * WARUM ALLE VIER DASSELBE MASS UND DENSELBEN TON TRAGEN: „Gleiche Größe und
 * gleicher Zuschnitt für alle vier. Vier Bilder verschiedener Größe erzählen
 * eine Gewichtung, die nicht gemeint ist." Alle vier sind 1024×1024 und
 * werden im selben quadratischen Rahmen gerendert (`aspect-ratio: 1`); die
 * Papiertöne der Rohbilder wichen um bis zu 31 Punkte im Blaukanal ab und
 * sind deterministisch auf einen gemeinsamen Ton gezogen (Spanne danach 0/1/1
 * RGB-Punkte). Das Skript liegt beim Auftrag (bildaufbereitung4.py) und ist
 * Teil der Herkunft, nicht ein stiller Nachgriff.
 */

export const QIMASTER_LITERATURBILDER = {
  kohlenstoff: {
    src:
      'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-qi-master--kohlenstoff--855dcd099dc8.webp?v=1789677004',
    alt:
      'Zeichnung: ein Gitter aus Kugeln und Stäben, das sich nach rechts hin ' +
      'in die gewundene Kette eines biologischen Moleküls aus denselben ' +
      'Kugeln und Stäben verwandelt. Erzeugte Illustration.',
    herkunft:
      'erzeugt am 2026-09-17, fal.ai flux-2-pro (Text zu Bild), Papierton ' +
      'und Motivfläche mit den drei Schwesterbildern vereinheitlicht',
    breite: 1024,
    hoehe: 1024,
  },
  gitter: {
    src:
      'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-qi-master--gitter--acd91120bc10.webp?v=1789677007',
    alt:
      'Zeichnung: ein wirres Bündel Lichtfäden tritt von links in ein ' +
      'regelmäßiges Gitter aus Kugeln ein und verlässt es rechts als ruhige ' +
      'Schar paralleler Strahlen. Erzeugte Illustration.',
    herkunft:
      'erzeugt am 2026-09-17, fal.ai flux-2-pro (Text zu Bild), Papierton ' +
      'und Motivfläche mit den drei Schwesterbildern vereinheitlicht',
    breite: 1024,
    hoehe: 1024,
  },
  // Der Schlüssel trägt den Umlaut, weil die Block-ID in
  // qi-master-texte.js ihn trägt ('Kohärenz'). Ihn hier zu glätten hieße,
  // die Zuordnung auf eine Schreibweise zu stellen, die an einer Stelle
  // korrigiert werden kann und an der anderen nicht.
  'Kohärenz': {
    src:
      'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-qi-master--kohaerenz--7f010d28c0c5.webp?v=1789677010',
    alt:
      'Zeichnung: viele kleine, ungeordnet überlagerte Ringe auf einer ' +
      'Wasserfläche, die nach rechts hin in lange, gleichmäßig parallele ' +
      'Wellenkämme übergehen. Erzeugte Illustration.',
    herkunft:
      'erzeugt am 2026-09-17, fal.ai flux-2-pro (Text zu Bild), Papierton ' +
      'und Motivfläche mit den drei Schwesterbildern vereinheitlicht',
    breite: 1024,
    hoehe: 1024,
  },
  licht: {
    src:
      'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-qi-master--zelle--568bb3c4c88d.webp?v=1789677014',
    alt:
      'Zeichnung: eine einzelne Zelle mit Zellkern und gewellter Membran, ' +
      'von der ein sehr schwacher Lichtsaum nach außen strahlt. Erzeugte ' +
      'Illustration.',
    herkunft:
      'erzeugt am 2026-09-17, fal.ai flux-2-pro (Text zu Bild), Papierton ' +
      'und Motivfläche mit den drei Schwesterbildern vereinheitlicht',
    breite: 1024,
    hoehe: 1024,
  },
};
