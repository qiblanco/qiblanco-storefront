/*
 * B-FASSUNG DES UNTEREN BEREICHS /products/qihome-air (Christian Zx 29.10.2026;
 * Grossjob 20261027-GROSSJOB-apple-konfigurator-qione-qihome-qibracelet-ab, s12).
 * Hypothese „Raum zuerst“: dieselben Texte wie A in anderer Folge, kein neuer Satz.
 */
import {WISSEN} from './qihome-air-alpha-daten';

export * from './qihome-air-alpha-daten';

const kapitel = (etikett) => WISSEN.kapitel.filter((k) => k.etikett === etikett);

/** „Hinstellen. Fertig.“ und das, was unter dem Haus liegt: beides handelt vom Raum. */
export const RAUM = {kapitel: [...kapitel('Raum'), ...kapitel('Erde')], studien: null};

/** Das Labor nach dem Gerätevergleich, die Studien direkt darunter. */
export const BELEG = {kapitel: kapitel('Zelle'), studien: WISSEN.studien};
