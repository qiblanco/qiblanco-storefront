import {ANNA, BILD, STIMMEN, ZIEL} from './lp-gemeinsam.js';

/*
 * APPLE-FASSUNG /pages/kette-oder-armband (s07). Entscheidungshilfe kurz vor
 * der Bestellung: derselbe Gitterchip®, zwei Trageformen. Aussortiert
 * gegenüber C: Badge-Reihe mit Google-Note, Zahlenband mit Google-Note,
 * Bewertungs-Widget mit Sternen, Funnel-Kacheln.
 */
export const TRAGEFORM_SEKTIONEN = Object.freeze([
  {
    art: 'hero',
    overline: 'Entscheidungshilfe',
    titel: 'Kette oder Armband? Gleiche Technik. Deine Trageform.',
    unter: 'Beide tragen denselben Gitterchip® aus 750er Gold. Du entscheidest nur, wie du ihn trägst.',
    bild: BILD.hand,
    cta: ZIEL.qione,
    cta2: ZIEL.qibracelet,
  },
  {
    art: 'band',
    etikett: 'Die Kette',
    titel: 'QiOne® 2 Pro. Unsichtbar unter der Kleidung.',
    text: ['Nah am Körper, am Tag und in der Nacht.', 'Für alle, die ihn diskret tragen.'],
    bild: BILD.qione,
    cta: ZIEL.qione,
  },
  {
    art: 'band',
    etikett: 'Das Armband',
    titel: 'QiBracelet®. Sichtbar am Handgelenk.',
    text: ['Offen getragen, immer im Blick.', 'Für alle, die ihn zeigen.'],
    bild: BILD.qibracelet,
    cta: ZIEL.qibracelet,
  },
  {
    art: 'fakten',
    titel: 'Bei beiden gleich.',
    kacheln: [
      {zahl: '1', titel: 'Chip-Technik', satz: 'Derselbe Gitterchip®, dieselbe Wirkung.'},
      {zahl: '0', titel: 'Akku', satz: 'Passiv. Kein Laden, keine App.'},
      {zahl: '20', titel: 'Tage testen', satz: 'Umtausch zwischen Kette und Armband inklusive.'},
    ],
  },
  {art: 'stimmen', titel: 'Das sagen Menschen, die ihn tragen.', stimmen: STIMMEN},
  {
    art: 'faq',
    titel: 'Kette oder Armband: die häufigsten Fragen.',
    fragen: [
      {f: 'Wirkt die Kette stärker als das Armband?', a: 'Nein. Beide enthalten denselben Gitterchip® aus 750er Gold. Der Unterschied liegt nur in der Trageweise.'},
      {f: 'Wann ist die Kette die bessere Wahl?', a: 'Wenn du ihn unsichtbar unter der Kleidung tragen willst, durchgehend.'},
      {f: 'Wann ist das Armband die bessere Wahl?', a: 'Wenn du ihn offen am Handgelenk tragen und sehen willst.'},
      {f: 'Kann ich beide gleichzeitig tragen?', a: 'Ja. Nötig ist es nicht. Ein Chip genügt.'},
      {f: 'Was, wenn ich mich falsch entscheide?', a: 'Dann tauschst du innerhalb von 20 Tagen oder bekommst dein Geld zurück.'},
    ],
  },
  {
    art: 'cta',
    titel: 'Du kannst nichts falsch machen.',
    text: '20 Tage testen. Tauschen oder Geld zurück, ohne Grund.',
    cta: ZIEL.qione,
    cta2: ZIEL.qibracelet,
  },
  ANNA,
]);
