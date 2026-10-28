/**
 * Die reine Entscheidung hinter KaufknopfChatSignal (components/), ohne DOM
 * und ohne React, damit test/kaufknopf-chat.test.mjs sie ohne Browser prüft.
 * Begründung, Messung und Rückweg stehen in der Komponente.
 */

import {
  lpKaufZiele,
  oeffentlicheDetailZiele,
} from '../components/reusables/blockLinks.js';

/**
 * Die Kaufknöpfe, als EIGENSCHAFT und nicht als Ort: das Attribut sitzt am
 * <button> in AddToCartButton.jsx und damit an jedem Kaufknopf, der über
 * diese Komponente gerendert wird, egal auf welcher Seite. Dazu der einzige
 * Ausgang der Landingpage /pages/qi-master-vorverkauf („Zum Qi Master®"),
 * die keinen Warenkorb trägt und am nächsten Klick gemessen wird.
 */
export const KAUFKNOPF_SELEKTOR = '[data-qb-kaufknopf]';

/**
 * Die Landingpage-Knöpfe, ebenfalls als EIGENSCHAFT: jeder Link im
 * Seiteninhalt, dessen Ziel ein Kaufziel des LP-Blocks ist (blockLinks.js,
 * lpKaufZiele: /pages/qione-2-pro, /pages/qibracelet, /pages/qihome-air).
 * Er trägt den nächsten Klick der Landingpage, ob er aus einer Campaign-LP,
 * einer Mm-Seite oder einer Produktkarte kommt.
 *
 * Anlass: Job 20261001-lp-kaufknoepfe-chatblase-verdeckt. Live auf
 * /pages/E-Smog-Schutz (390x844, Zustimmung gesetzt) trafen 5 von 8
 * Hit-Tests auf Knöpfe nach /pages/qione-2-pro das iframe des Chats, darunter
 * der Hero-Knopf. Keiner dieser Knöpfe trug [data-qb-kaufknopf].
 *
 * Der Selektor ist nur der Vorfilter (er trifft auch /pages/qione-2-pro-details
 * und -2x); entschieden wird am Pfad in istLpKaufausgang.
 */
export const LP_KAUFZIELE = lpKaufZiele();
export const LP_KAUFAUSGANG_VORFILTER = LP_KAUFZIELE.map(
  (pfad) => `main a[href*="${pfad}"]`,
).join(', ');

/**
 * @param {string} pfad pathname des Links (a.pathname)
 * @returns {boolean} true = der Link führt auf ein LP-Kaufziel
 */
export function istLpKaufausgang(pfad) {
  if (typeof pfad !== 'string' || !pfad) return false;
  const ohneSchraegstrich = pfad.length > 1 ? pfad.replace(/\/+$/, '') : pfad;
  return LP_KAUFZIELE.includes(ohneSchraegstrich);
}

/**
 * Die Knöpfe des ÖFFENTLICHEN Blocks zur Produkt- bzw. Kaufseite, ebenfalls
 * als EIGENSCHAFT und zwar als zwei: das ZIEL (jede /products/<handle> und
 * die Detailseiten aus blockLinks.js, oeffentlicheDetailZiele) und die
 * KNOPF-OPTIK (hatKnopfOptik unten). Ein Klassenname taugt dafür nicht: die
 * 50 Knöpfe, die der Zensus fand, tragen fünf Klassenfamilien (btn--primary,
 * btn--secondary, lp-vp-btn, bew__cta, erf__weiter), zwei tragen gar keine,
 * und die nächste Seite bringt eine sechste mit. Umgekehrt heißt btn--text
 * Knopf und ist optisch ein Textlink (Rahmen und Fläche durchsichtig).
 *
 * Anlass: Job 20261001-oeffentlicher-block-chatblase-verdeckt-produktknoepfe.
 * Zensus am 2026-10-01 über 102 öffentliche URLs (390x844, Zustimmung
 * gesetzt): 25 Seiten tragen 50 solche Knöpfe. Unter der Einladungsblase
 * (298x225, die ersten Sekunden nach dem Laden) trafen 35 von 38 Hit-Tests
 * in der Knopfmitte das iframe des Chats, Belegfall „Den QiOne® 2 Pro
 * ansehen“ auf /pages/erfahrungen. Unter der Pille (86x86, Dauerzustand) lag
 * bei 45 der 50 Knöpfe an mindestens einer Scrollposition der rechte
 * Knopfrand.
 *
 * DER SCHNITT, und warum nicht mehr: Produktkarten und Textlinks bleiben
 * draußen. Mit ihnen wäre der Chat an 1,05 % der Scrollpositionen
 * ausgeblendet, mit allen Knöpfen gleich welchen Ziels an 1,43 %; mit diesem
 * Schnitt sind es 0,71 % (vorher 0,20 %). Der Chat ist Annas Einstieg und
 * soll nur dort weichen, wo er einen Knopf zum Kauf verdeckt.
 *
 * Der Selektor ist nur der Vorfilter; entschieden wird am Pfad
 * (istOeffentlichesProduktziel) und an der Optik.
 */
export const OEFFENTLICHE_DETAILZIELE = oeffentlicheDetailZiele();
export const OEFFENTLICH_KNOPF_VORFILTER = [
  'main a[href*="/products/"]',
  ...OEFFENTLICHE_DETAILZIELE.map((pfad) => `main a[href*="${pfad}"]`),
].join(', ');

/**
 * @param {string} pfad pathname des Links (a.pathname)
 * @returns {boolean} true = der Link führt auf eine Produkt- bzw. Kaufseite
 *   des öffentlichen Blocks
 */
export function istOeffentlichesProduktziel(pfad) {
  if (typeof pfad !== 'string' || !pfad) return false;
  const ohneSchraegstrich = pfad.length > 1 ? pfad.replace(/\/+$/, '') : pfad;
  return (
    /^\/products\/[^/]+$/.test(ohneSchraegstrich) ||
    OEFFENTLICHE_DETAILZIELE.includes(ohneSchraegstrich)
  );
}

/** Höher ist kein Knopf mehr, sondern eine Karte mit Fläche. */
export const KNOPF_MAX_HOEHE_PX = 120;

/**
 * Deckt eine berechnete Farbe (getComputedStyle) sichtbar? `transparent` und
 * ein Alpha bis 0,05 decken nicht. Gelesen werden beide Schreibweisen:
 * `rgba(0, 0, 0, 0)` und `rgb(0 0 0 / 0)`.
 *
 * @param {string} farbe
 * @returns {boolean}
 */
export function farbeDeckt(farbe) {
  if (typeof farbe !== 'string' || !farbe || farbe === 'transparent') {
    return false;
  }
  const innen = /\(([^)]*)\)/.exec(farbe)?.[1];
  if (innen == null) return true;
  let alpha = '1';
  if (innen.includes('/')) alpha = innen.split('/').pop();
  else if (innen.split(',').length > 3) alpha = innen.split(',')[3];
  const zahl = parseFloat(alpha);
  if (Number.isNaN(zahl)) return true;
  return (alpha.trim().endsWith('%') ? zahl / 100 : zahl) > 0.05;
}

/**
 * Sieht der Link wie ein Knopf aus? Reine Entscheidung über berechnete
 * Werte, damit sie ohne Browser prüfbar ist: ein Knopf hat eine eigene
 * Fläche oder einen Rahmen an allen vier Seiten, steht nicht im Textfluss,
 * trägt kein Bild und ist höchstens KNOPF_MAX_HOEHE_PX hoch. Ein Textlink
 * („Mehr erfahren“ in der Produktkarte) hat weder Fläche noch Rahmen, eine
 * Produktkarte trägt ein Bild oder ist höher.
 *
 * @param {{
 *   display: string,
 *   flaeche: boolean,
 *   raender: number[],
 *   hoehe: number,
 *   hatBild: boolean,
 * }} optik
 * @returns {boolean}
 */
export function hatKnopfOptik({display, flaeche, raender, hoehe, hatBild}) {
  if (display === 'inline' || hatBild) return false;
  if (!(hoehe > 0) || hoehe > KNOPF_MAX_HOEHE_PX) return false;
  if (flaeche) return true;
  return (
    Array.isArray(raender) && raender.length === 4 && raender.every((b) => b > 0)
  );
}

/** Das Attribut am <html>, auf das die Unterdrückungs-Regel in app.css hängt. */
export const UEBERDECKUNG_ATTRIBUT = 'data-chat-deckt-kaufknopf';

/**
 * Das Attribut am <html>, das die Signal-Komponente nach ihrer ersten
 * Messung setzt. Bis dahin hält app.css das Widget unsichtbar: der Loader
 * läuft vor der Hydration, das Signal erst danach.
 */
export const BEREIT_ATTRIBUT = 'data-chat-signal-bereit';

/** Die id, die der Loader seinem iframe gibt (wie SalesbotWidget.jsx). */
export const RAHMEN_ID = 'qiblanco-salesbot-widget-frame';

/** Die Klasse, die der Loader am <html> setzt, solange der Chat angedockt ist. */
export const DOCK_KLASSE = 'qb-chat-docked';

/** Der Deckel des Loaders für geschlossene Flächen (Anteil der Fensterhöhe). */
export const GESCHLOSSEN_MAX_ANTEIL = 0.6;

/**
 * Luft zwischen Widget und Knopf. Ein Widget, das den Knopf um 2 px
 * verfehlt, klebt optisch trotzdem daran, und der Kunde zielt nicht auf den
 * Pixel genau.
 */
export const ABSTAND_PX = 8;

/**
 * Reine Entscheidung, ohne DOM — damit sie ohne Browser prüfbar ist.
 *
 * @param {{
 *   rahmen: {left:number, top:number, right:number, bottom:number} | null,
 *   knoepfe: Array<{left:number, top:number, right:number, bottom:number}>,
 *   fensterHoehe: number,
 *   angedockt: boolean,
 *   beruehrt: boolean,
 * }} lage
 * @returns {boolean} true = Widget unterdrücken
 */
export function ueberdecktKaufknopf({
  rahmen,
  knoepfe,
  fensterHoehe,
  angedockt,
  beruehrt,
}) {
  if (!rahmen || angedockt || beruehrt) return false;
  const hoehe = rahmen.bottom - rahmen.top;
  const breite = rahmen.right - rahmen.left;
  if (!(hoehe > 0 && breite > 0)) return false;
  if (hoehe > fensterHoehe * GESCHLOSSEN_MAX_ANTEIL + 1) return false;
  return knoepfe.some(
    (k) =>
      k.right > k.left &&
      k.bottom > k.top &&
      k.left < rahmen.right + ABSTAND_PX &&
      k.right > rahmen.left - ABSTAND_PX &&
      k.top < rahmen.bottom + ABSTAND_PX &&
      k.bottom > rahmen.top - ABSTAND_PX,
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * DAS GESICHT RUTSCHT ÜBER DIE KAUFLEISTE (Grossjob 20261025-design-ai-anna-
 * fenster-wie-apple-handy-hochrutschen-ab-jetzt-kaufen, s03; Christian
 * 25.10.2026: „wenn dieser jetzt Kauf button mit Preis kommt ist cool, aber
 * dann sollte das gesicht nicht verschweinden sondern hochrutschen“).
 *
 * Bis hier deckte die geschlossene Kugel auf dem Handy den Knopf der
 * Kaufleiste, und ueberdecktKaufknopf blendete sie aus, solange die Leiste
 * stand (gemessen 25.10.2026 auf /products/qione-2-pro, 390x844: Rahmen
 * [309,763,74,74], Leiste ab y=781, visibility hidden). Jetzt weicht sie
 * nach OBEN aus: um so viel, dass die Unterkante des Rahmens ABSTAND_PX über
 * der Oberkante der Leiste liegt. Die Strecke folgt aus beiden Rechtecken,
 * nicht aus einer Konstante: Kugel, Blase und Leiste dürfen ihre Größe
 * ändern (s02 hat die Pille zur Kugel verkleinert, parallel zu diesem Bau).
 *
 * Die Leisten, über die er ausweicht, als EIGENSCHAFT: jedes Element mit
 * data-qb-chat-weicht, das gerade im Fenster steht. Kaufleiste.jsx setzt es
 * nur im sichtbaren Zustand.
 *
 * DIE FALLE, um die das hier gebaut ist: getBoundingClientRect() enthält die
 * Transformation. Mitten im Hochrutschen deckt der Rahmen den Knopf der
 * Leiste noch, und ueberdecktKaufknopf hätte ihn ausgeblendet (Flackern).
 * Gemessen wird deshalb gegen die RUHELAGE (Rechteck minus aktuelle
 * Verschiebung, ruhelage) und geurteilt gegen die ZIELLAGE (ruhelage minus
 * Hub, verschoben). Beide bewegen sich während des Übergangs nicht.
 *
 * Der offene Chat wird nie verschoben: höher als GESCHLOSSEN_MAX_ANTEIL des
 * Fensters oder angedockt heißt offen (dieselben Merkmale wie oben).
 *
 * RÜCKWEG: HOCHRUTSCHEN_AN = false. Dann ist der Hub immer 0 und es gilt
 * wieder das Ausblenden über dem Knopf der Leiste, Stand vor s03.
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Code-Schalter des Hochrutschens. false = Stand vor s03 (Ausblenden). */
export const HOCHRUTSCHEN_AN = true;

/** Die Leisten, über die das geschlossene Widget ausweicht (Eigenschaft). */
export const AUSWEICH_SELEKTOR = '[data-qb-chat-weicht]';

/** Am <html>: das Widget steht verschoben. Die Strecke trägt HUB_VARIABLE. */
export const HUB_ATTRIBUT = 'data-chat-rutscht';
export const HUB_VARIABLE = '--qb-chat-hub';

/**
 * Was die HOCHGERUTSCHTE Kugel außer Kaufknöpfen nicht decken darf: die
 * Pfeile der Slider (Auftrag s03: „nach dem Hochrutschen nichts anderes
 * decken (Galerie-/Slider-Pfeile, Cookie-Hinweis, andere Kaufknöpfe)“).
 * Als EIGENSCHAFT des Hausbausteins: reusables/StandardSlider.jsx und
 * UpsellLineUp.jsx geben jedem Pfeil die Klasse SliderButton, und jeder
 * Slider der Kaufseiten kommt aus ihnen. Gemessen im Preview 25.10.2026 auf
 * /products/qione-2-pro: an einer von 11 Scrollstellen lagen „Vorheriger
 * Slide“ und „Nächster Slide“ unter der hochgerutschten Kugel. Die
 * Produktgalerie hat mobil keine Pfeile (Vorschaubilder). Der Cookie-Hinweis
 * liegt über dem Widget (eigene Ebene), er wird nie gedeckt.
 *
 * Nur bei Hub > 0: in der Ruhelage am unteren Rand gilt der Schnitt von
 * OEFFENTLICH_KNOPF_VORFILTER unverändert (der Chat weicht nur Kaufknöpfen).
 */
export const PFEIL_SELEKTOR = 'button.SliderButton';

/** Am <html>: der Chat ist offen, er gleitet nicht (app.css). */
export const OFFEN_ATTRIBUT = 'data-chat-offen';

/**
 * Senkrechte Verschiebung aus einem berechneten `transform`
 * (getComputedStyle): `none`, `matrix(a,b,c,d,tx,ty)` oder
 * `matrix3d(... 16 Werte)`. Während eines Übergangs ist das der aktuelle
 * Zwischenwert. Unlesbar heißt 0.
 *
 * @param {string} transform
 * @returns {number}
 */
export function verschiebungY(transform) {
  if (typeof transform !== 'string' || !transform || transform === 'none') {
    return 0;
  }
  const innen = /\(([^)]*)\)/.exec(transform)?.[1];
  if (!innen) return 0;
  const werte = innen.split(',').map((w) => parseFloat(w));
  const ty = transform.startsWith('matrix3d') ? werte[13] : werte[5];
  return Number.isFinite(ty) ? ty : 0;
}

/**
 * @param {{left:number, top:number, right:number, bottom:number}} rect
 * @param {number} dy Verschiebung nach oben in px (positiv = höher)
 */
export function verschoben(rect, dy) {
  if (!rect || !dy) return rect;
  return {left: rect.left, right: rect.right, top: rect.top - dy, bottom: rect.bottom - dy};
}

/**
 * Ruhelage des Rahmens: gemessenes Rechteck ohne die aktuelle Verschiebung.
 *
 * @param {{left:number, top:number, right:number, bottom:number}|null} rect
 * @param {number} ty aktuelle senkrechte Verschiebung (verschiebungY)
 */
export function ruhelage(rect, ty) {
  if (!rect) return null;
  return {left: rect.left, right: rect.right, top: rect.top - ty, bottom: rect.bottom - ty};
}

/**
 * Wie weit rutscht das geschlossene Widget nach oben? Reine Entscheidung.
 *
 * @param {{
 *   ruhe: {left:number, top:number, right:number, bottom:number} | null,
 *   leisten: Array<{left:number, top:number, right:number, bottom:number}>,
 *   fensterHoehe: number,
 *   angedockt: boolean,
 *   an?: boolean,
 * }} lage
 * @returns {number} px nach oben, 0 = nicht verschieben
 */
export function chatHub({ruhe, leisten, fensterHoehe, angedockt, an = HOCHRUTSCHEN_AN}) {
  if (!an || !ruhe || angedockt) return 0;
  const hoehe = ruhe.bottom - ruhe.top;
  const breite = ruhe.right - ruhe.left;
  if (!(hoehe > 0 && breite > 0)) return 0;
  if (hoehe > fensterHoehe * GESCHLOSSEN_MAX_ANTEIL + 1) return 0;
  let oben = Infinity;
  for (const l of leisten || []) {
    if (!(l.bottom > l.top && l.right > l.left)) continue;
    if (l.top >= fensterHoehe || l.bottom <= 0) continue;
    // Nur eine Leiste, die waagrecht unter dem Rahmen liegt.
    if (l.right <= ruhe.left || l.left >= ruhe.right) continue;
    oben = Math.min(oben, l.top);
  }
  if (!Number.isFinite(oben)) return 0;
  const hub = Math.ceil(ruhe.bottom - oben + ABSTAND_PX);
  return hub > 0 ? hub : 0;
}

/**
 * Ist der Rahmen offen (nicht verschieben, nicht gleiten)? Dieselben
 * Merkmale wie ueberdecktKaufknopf: angedockt oder höher als der Deckel
 * geschlossener Flächen.
 */
export function rahmenOffen({rahmen, fensterHoehe, angedockt}) {
  if (angedockt) return true;
  if (!rahmen) return false;
  return rahmen.bottom - rahmen.top > fensterHoehe * GESCHLOSSEN_MAX_ANTEIL + 1;
}
