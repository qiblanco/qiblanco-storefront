import {ANNA, BILD, STIMMEN, STUDIEN, ZIEL} from './lp-gemeinsam.js';

/*
 * APPLE-FASSUNG /pages/so-wirkt-kohaerentes-wasser (s07). Der Mechanismus in
 * vier Schritten, danach die Messung und die Grenze des Modells. Aussortiert
 * gegenüber C: Badge-Reihe mit Google-Note, Zeile „Über 14.000 zufriedene
 * Kunden“ (Preisanker), Funnel-Kacheln, Produktkacheln.
 */
export const MECHANISMUS_SEKTIONEN = Object.freeze([
  {
    art: 'hero',
    overline: 'Der Mechanismus, in Ruhe erklärt',
    titel: 'So wirkt kohärentes Wasser. Schritt für Schritt.',
    unter: 'Kein Wunder, kein Heilstrahl. Ein physikalisches Ordnungs-Modell, an Zellen im Labor untersucht.',
    bild: BILD.gitter,
    cta: ZIEL.qione,
  },
  {
    art: 'kapitel',
    etikett: 'Die Wirkkette',
    titel: 'Von der Gitterstruktur bis zur Zelle.',
    absaetze: [
      'Wasser ist strukturierbar. Wassermoleküle ordnen sich je nach Umgebung unterschiedlich an. Damit befasst sich die physikalische Chemie.',
      'Der Gitterchip® gibt die Vorlage. Ein präzises Gitter aus 750er Gold mit 22,61 mm³ Wirkvolumen. Benachbartes Wasser richtet sich daran geordneter aus, passiv und ohne Energie.',
      'Kohärenz heißt geordnete Anordnung. Die Moleküle im Kontaktbereich liegen regelmäßiger.',
      'Die Zelle hält Stress besser stand. Diesen Schutzeffekt haben vier Arbeiten an Zellkulturen untersucht.',
    ],
  },
  {
    art: 'band',
    etikett: 'Wo das Modell auf Messung trifft',
    titel: 'Was in Zellkulturen gemessen wurde.',
    text: [
      'Prof. Dr. Peter C. Dartsch hat menschliche Immunzellen im Labor vier Stunden lang mit Handystrahlung belastet.',
      'Ungeschützt fiel ihre Abwehrleistung auf 60,5 Prozent. Mit dem QiOne® 2 Pro hielt sie 84,7 Prozent.',
    ],
    bild: BILD.studie,
    cta: {text: 'Die Studien im Detail', href: '/pages/zellstudien-ehrlich'},
  },
  {
    art: 'kapitel',
    etikett: 'Die Grenze des Modells',
    titel: 'Was kohärentes Wasser nicht ist.',
    absaetze: [
      'Es lädt dich nicht auf und ersetzt keinen Schlaf.',
      'Es ist keine medizinische Diagnose und keine Therapie.',
      'Es wirkt nicht stärker, je mehr du daran glaubst.',
    ],
    quellen: STUDIEN.map((s) => `${s.titel}. ${s.quelle}.`),
  },
  {art: 'stimmen', titel: 'Das sagen Menschen, die ihn tragen.', stimmen: STIMMEN},
  {
    art: 'faq',
    titel: 'Fragen zum Mechanismus.',
    fragen: [
      {f: 'Ist kohärentes Wasser wissenschaftlich anerkannt?', a: 'Die Strukturierbarkeit von Wasser ist Gegenstand der physikalischen Chemie. Belegt sind bislang Effekte in Zellkulturen, nicht am Menschen.'},
      {f: 'Wie wirkt ein Chip ohne Strom?', a: 'Passiv. Die feste Gitterstruktur dient als Vorlage, an der sich benachbartes Wasser ausrichtet. Energie braucht das nicht.'},
      {f: 'Muss ich daran glauben?', a: 'Nein. Der beschriebene Effekt hängt nicht an Glauben oder Spüren.'},
      {f: 'Wo endet das Modell?', a: 'Bei allem, was über die gemessenen Effekte an Zellen hinausgeht.'},
    ],
  },
  {
    art: 'cta',
    titel: 'Verstehen ist der Anfang. Prüfen der Beweis.',
    text: '20 Tage tragen. Nicht überzeugt, Geld zurück.',
    cta: ZIEL.qione,
    cta2: {text: 'So läuft die Rückgabe', href: '/pages/das-20-tage-versprechen'},
  },
  ANNA,
]);
