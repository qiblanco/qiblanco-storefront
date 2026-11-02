/*
 * B-FASSUNG DES UNTEREN BEREICHS /products/qibracelet (Christian Zx 29.10.2026;
 * Grossjob 20261027-GROSSJOB-apple-konfigurator-qione-qihome-qibracelet-ab, s12).
 * Hypothese „Alltag zuerst“: Kacheln aus den Texten von A (WISSEN Erde, FAKTEN,
 * VARIANTE.anpassen), die Fakten-Kacheln und die Kapitel Gitterchip und Erde
 * entfallen. Technik steht weiter im Gerätevergleich und in der FAQ. Neu sind die
 * Kachel-Titel „Schlaf“ und „Deine Größe“; deren Satz sagt „den Reif“ statt „ihn“.
 */
import {WISSEN} from './qibracelet-alpha-daten';

export * from './qibracelet-alpha-daten';

export const ALLTAG = {
  ueberschrift: 'Das QiBracelet® trägst du Tag und Nacht.',
  zeilen: [
    {titel: 'Sauna · Meer · Pool', zeile: 'Es bleibt dran.'},
    {titel: 'Schlaf', zeile: 'Es ist immer an deiner Seite.'},
    {titel: 'Deine Größe', zeile: 'Mit beiden Händen drückst du den Reif enger oder dehnst ihn weiter.'},
  ],
};

export const BELEG = {
  kapitel: WISSEN.kapitel.filter((k) => k.etikett === 'Zelle'),
  studien: WISSEN.studien,
};
