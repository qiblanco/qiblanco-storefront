/*
 * B-FASSUNG DES UNTEREN BEREICHS /products/qihome-air (Christian Zx 29.10.2026;
 * Grossjob 20261027-GROSSJOB-apple-konfigurator-qione-qihome-qibracelet-ab, s12).
 * Hypothese „Raum zuerst“: dieselben Texte wie A in anderer Folge, kein neuer Satz.
 */
import {WISSEN} from './qihome-air-alpha-daten';

export * from './qihome-air-alpha-daten';

const kapitel = (etikett) => WISSEN.kapitel.filter((k) => k.etikett === etikett);

// In B steht „Erde“ direkt hinter „in dem Raum, in dem du am meisten Zeit verbringst“.
// Mit „Deshalb gehört …“ läse sich das als Widerspruch (PR-Chef s12).
const erdeImRaum = kapitel('Erde').map((k) => ({
  ...k,
  absaetze: k.absaetze.map((a) =>
    a.startsWith('Deshalb gehört')
      ? 'Am besten dort, wo du schläfst. Dort verbringst du viele Stunden am Stück.'
      : a,
  ),
}));

/** „Hinstellen. Fertig.“ und das, was unter dem Haus liegt: beides handelt vom Raum. */
export const RAUM = {kapitel: [...kapitel('Raum'), ...erdeImRaum], studien: null};

/** Das Labor direkt hinter dem Raum, die Studien darunter. */
export const BELEG = {kapitel: kapitel('Zelle'), studien: WISSEN.studien};
