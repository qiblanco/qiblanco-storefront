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
 * Der Träger des Loaders (qi-salesbot, Job 20261103-folge-anna-shop-verschiebt-
 * traeger-webkit): in WebKit mit Zuschnitt legt der Loader um die Hülle des
 * Rahmens ein div über das ganze Fenster. Ein verschobenes iframe malt in
 * WebKit keine clip-path, Annas Blasen über der Leiste blieben unsichtbar.
 * Darum verschiebt app.css dann den Träger statt des iframe. In Blink und
 * Gecko gibt es ihn nicht, dort gilt die Regel am iframe unverändert.
 */
export const TRAEGER_ID = 'qiblanco-salesbot-widget-traeger';

/**
 * Senkrechte Verschiebung über die Kette iframe › Träger: die Summe der
 * berechneten transforms. Zieht die Ruhelage nur die des iframe ab, hält sie
 * den verschobenen Träger für die Ruhe, rechnet Hub 0 und nimmt das Signal
 * zurück: Anna sinkt auf die Kaufleiste (gemessen 03.11.2026, WebKit,
 * qibracelet, Signal nach 3,5–6,6 s zurückgenommen).
 *
 * @param {Array<string|undefined>} transforms
 * @returns {number}
 */
export function verschiebungKetteY(transforms) {
  return (transforms || []).reduce((summe, t) => summe + verschiebungY(t), 0);
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

/* ═══════════════════════════════════════════════════════════════════════════
 * DAS GESICHT WEICHT AUCH KNÖPFEN IM SEITENINHALT AUS (Folgeauftrag
 * 20261101-anna-weicht-inhalts-kaufknoepfen-aus-statt-unsichtbar, Übergabe
 * #80 des Grossjobs vom 25.10.2026; dieselbe Christian-Zeile wie oben).
 *
 * Bis hier galt das Hochrutschen nur für die Kaufleiste. Deckte die Kugel
 * oder die Einladungsblase einen Kaufknopf IM SEITENINHALT, blendete
 * ueberdecktKaufknopf sie aus. Gemessen im Merge s05 (31.10.2026 ~23:50Z):
 * auf /pages/start-b bei 390x844 stand das iframe ab dem Laden auf
 * visibility:hidden, weil die Blase [85,649, 298x188] den Hero-Knopf deckte,
 * und blieb es auch nach dem Scrollen. Der Kunde sah Anna dort nie. Auf
 * /products/qione-2-pro-b bei 412 verschwand die hochgerutschte Kugel über
 * den Slider-Pfeilen.
 *
 * Die stehende Regel (design-meister web-soll.yaml overlay_ordnung, seit
 * 31.10.): das kleinere Element weicht per transform aus, es verschwindet
 * nicht. Deshalb rutscht das geschlossene Widget jetzt so weit hoch, bis
 * seine Ziellage keinen Kaufknopf (und hochgerutscht keinen Slider-Pfeil)
 * mehr deckt. Die Strecke ist die KLEINSTE, die frei ist: Kandidaten sind
 * der Hub der Leiste und je Hindernis „Unterkante ABSTAND_PX über seiner
 * Oberkante“. Nur nach oben, wie Christian es gesagt hat; nach unten ist
 * unter der Kugel kaum Platz (74 px bis zur Fensterkante, darunter die
 * Browserleiste).
 *
 * Ausblenden bleibt nur als letzter Rückfall: wenn keine Strecke frei ist,
 * ohne dass der Rahmen oben aus dem Fenster ragt (RAND_PX). Das braucht
 * einen Stapel von Knöpfen bis fast an den Seitenkopf.
 *
 * RÜCKWEG: AUSWEICHEN_AN = false. Dann gilt wieder chatHub allein (nur die
 * Leiste) und das Ausblenden über Inhalts-Knöpfen, Stand vor diesem Bau.
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Code-Schalter des Ausweichens vor Inhalts-Knöpfen. false = Stand vor #80. */
export const AUSWEICHEN_AN = true;

/** So nah darf der hochgerutschte Rahmen der Oberkante des Fensters kommen. */
export const RAND_PX = 8;

/** Überschneidet der Rahmen ein Hindernis (mit ABSTAND_PX Luft)? */
function deckt(rahmen, k) {
  return (
    k.right > k.left &&
    k.bottom > k.top &&
    k.left < rahmen.right + ABSTAND_PX &&
    k.right > rahmen.left - ABSTAND_PX &&
    k.top < rahmen.bottom + ABSTAND_PX &&
    k.bottom > rahmen.top - ABSTAND_PX
  );
}

/**
 * Wohin weicht das geschlossene Widget aus? Reine Entscheidung, ohne DOM.
 *
 * @param {{
 *   ruhe: {left:number, top:number, right:number, bottom:number} | null,
 *   leisten: Array<{left:number, top:number, right:number, bottom:number}>,
 *   knoepfe: Array<{left:number, top:number, right:number, bottom:number}>,
 *   pfeile?: Array<{left:number, top:number, right:number, bottom:number}>,
 *   fensterHoehe: number,
 *   angedockt: boolean,
 *   an?: boolean,
 *   ausweichen?: boolean,
 * }} lage
 * @returns {{hub: number, frei: boolean}} hub = px nach oben (0 = Ruhelage);
 *   frei = false heißt: keine Strecke ist frei, der Rückfall blendet aus.
 */
export function ausweichStrecke({
  ruhe,
  leisten,
  knoepfe,
  pfeile = [],
  fensterHoehe,
  angedockt,
  an = HOCHRUTSCHEN_AN,
  ausweichen = AUSWEICHEN_AN,
}) {
  const basis = chatHub({ruhe, leisten, fensterHoehe, angedockt, an});
  // Offen, angedockt oder ohne Rahmen: nichts zu entscheiden (ueberdecktKaufknopf
  // blendet dort ebenfalls nie aus).
  if (!ruhe || rahmenOffen({rahmen: ruhe, fensterHoehe, angedockt})) {
    return {hub: basis, frei: true};
  }
  if (!(ruhe.bottom > ruhe.top && ruhe.right > ruhe.left)) {
    return {hub: basis, frei: true};
  }
  const hindernisse = (hub) => (hub > 0 ? [...knoepfe, ...pfeile] : knoepfe);
  const frei = (hub) =>
    !hindernisse(hub).some((k) => deckt(verschoben(ruhe, hub), k));
  if (!an || !ausweichen) return {hub: basis, frei: frei(basis)};
  const hoechstens = Math.floor(ruhe.top - RAND_PX);
  const kandidaten = [basis];
  for (const k of [...knoepfe, ...pfeile]) {
    if (!(k.bottom > k.top && k.right > k.left)) continue;
    // Nur, was waagrecht unter dem Rahmen liegt, kann ihn verdrängen.
    if (k.right <= ruhe.left - ABSTAND_PX || k.left >= ruhe.right + ABSTAND_PX) continue;
    const hub = Math.ceil(ruhe.bottom - k.top + ABSTAND_PX);
    if (hub > basis && hub <= hoechstens) kandidaten.push(hub);
  }
  kandidaten.sort((a, b) => a - b);
  for (const hub of kandidaten) {
    if (frei(hub)) return {hub, frei: true};
  }
  return {hub: basis, frei: false};
}

/* ═══════════════════════════════════════════════════════════════════════════
 * DIE LEISTE BEWEGT SICH: SOFORT URTEILEN, NICHT IM NÄCHSTEN BILD (Job
 * 20261109-anna-weicht-gehobener-kaufleiste-erst-nach-2s).
 *
 * Seit #1425 hebt einwilligung.css jede Leiste mit data-qb-chat-weicht um
 * --qb-ew-hoehe, solange die Einwilligungsleiste offen ist. Live gemessen am
 * 09.11.2026 (WebKit 390x844, Erstbesucher, /pages/schlaf-zellen-schutz-b,
 * Stelle 0,3): nach dem Scroll wich Anna zuerst einem Knopf im Inhalt aus
 * (Hub 165, Rahmen 450–672). 250 ms später erschien die Leiste bei 432–518,
 * Knopf 441–510, also genau unter dem Rahmen. Den richtigen Hub (414) schrieb
 * das Signal erst 924 ms danach. Der Grund: Erscheinen und Hebung der Leiste
 * kamen nur über requestAnimationFrame an. Linux-WebKit malt direkt nach
 * einem Scroll 0,6–1,2 s lang kein Bild (rAF-Lücken gemessen 613 und
 * 1202 ms, Chromium höchstens 76 ms), und so lange stand Anna auf dem Knopf.
 * Die Probe probe_kaufleiste_frei.py urteilte in dieser Ruhe und fand
 * 3 von 3 Läufen den Knopf 0/5 frei.
 *
 * Darum urteilt das Signal bei allem, was eine Leiste bewegt, SOFORT im
 * Rückruf des MutationObservers. Der läuft nach dem Commit und vor dem
 * Zeichnen, unabhängig vom Bildtakt:
 *  - das Attribut data-qb-chat-weicht kommt oder geht (Leiste erscheint
 *    bzw. verschwindet);
 *  - der Inhalt einer Leiste ändert sich, oder ein Knoten mit Leiste wird
 *    eingehängt oder entfernt (Leisten, die nur sichtbar im DOM stehen);
 *  - data-qb-einwilligung-offen am <html> kommt oder geht (die Hebung);
 *  - --qb-ew-hoehe am <html> ändert ihren WERT (die Strecke der Hebung).
 *    Andere Stil-Schreiber am <html>, das Signal selbst eingeschlossen
 *    (--qb-chat-hub), lösen nichts aus: sonst urteilte es bei jedem eigenen
 *    Schreiben noch einmal.
 * Alles andere bleibt bei einem Urteil pro Bild. Gemessen wird damit nie pro
 * Scroll-Bild, nur je Ereignis an einer Leiste.
 *
 * RÜCKWEG: LEISTE_SOFORT_AN = false. Dann gilt wieder ein Urteil pro Bild
 * für jede Änderung, Stand vor diesem Bau.
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Code-Schalter des sofortigen Urteils an Leisten. false = Stand vor dem 09.11. */
export const LEISTE_SOFORT_AN = true;

/** Das Merkmal der Leisten (AUSWEICH_SELEKTOR ohne Klammern). */
export const AUSWEICH_ATTRIBUT = 'data-qb-chat-weicht';

/** Am <html>, solange die Einwilligungsleiste offen ist (public/qb-einwilligung.js). */
export const EINWILLIGUNG_OFFEN_ATTRIBUT = 'data-qb-einwilligung-offen';

/** Inline am <html>: die Höhe der offenen Einwilligungsleiste, um die die Leisten steigen. */
export const EINWILLIGUNG_HOEHE_VARIABLE = '--qb-ew-hoehe';

/**
 * Wann urteilt das Signal nach einer Folge von Änderungen? Reine Entscheidung
 * über Beschreibungen der MutationRecords, damit sie ohne Browser prüfbar ist.
 *
 * @param {Array<{attribut: string|null, leiste: boolean}>} aenderungen
 *   attribut: Name des geänderten Attributs, null bei childList;
 *   leiste: die Änderung betrifft eine Leiste (Ziel liegt in einer, oder ein
 *   ein- bzw. ausgehängter Knoten ist oder trägt eine).
 * @param {{ewVorher?: string, ewJetzt?: string, an?: boolean}} [hoehe]
 *   --qb-ew-hoehe vor und nach der Folge (nur für `style` am <html> gelesen).
 * @returns {'sofort'|'bild'|'nichts'}
 */
export function urteilsTakt(aenderungen, {ewVorher = '', ewJetzt = '', an = LEISTE_SOFORT_AN} = {}) {
  let takt = 'nichts';
  for (const a of aenderungen || []) {
    const attribut = a?.attribut ?? null;
    if (attribut === null) {
      if (an && a?.leiste) return 'sofort';
      takt = 'bild';
      continue;
    }
    // `class` am <html> (Docked-Klasse des Loaders): wie bisher ein Urteil pro Bild.
    if (attribut === 'class') {
      takt = 'bild';
      continue;
    }
    // Ohne Schalter beobachtet niemand die übrigen Attribute (Stand vor dem 09.11.).
    if (!an) continue;
    if (attribut === 'style') {
      // Nur die Höhe der Einwilligungsleiste zählt; das eigene Schreiben nicht.
      if (ewVorher !== ewJetzt) return 'sofort';
      continue;
    }
    if (attribut === AUSWEICH_ATTRIBUT || attribut === EINWILLIGUNG_OFFEN_ATTRIBUT) {
      return 'sofort';
    }
    takt = 'bild';
  }
  return takt;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * WÄHREND ANNA GLEITET, NIMMT IHR RAHMEN KEINEN TIPP AN (derselbe Job).
 *
 * Auch mit dem sofortigen Urteil oben beginnt das Gleiten erst im nächsten
 * gemalten Bild. Bis dahin, und während der 280 ms des Gleitens, steht der
 * Rahmen noch an der alten Stelle. Erscheint die Leiste unter ihm, liegt er
 * über ihrem Knopf. Auf dem Handy sind das wenige Bilder; Linux-WebKit malt
 * nach einem Scroll aber bis 1,2 s kein Bild, und so lange war der Knopf
 * gedeckt (live 09.11.: 1471 und 2576 ms auf /pages/schlaf-zellen-schutz-b).
 *
 * Darum setzt das Signal, sobald sich die Strecke des GESCHLOSSENEN Rahmens
 * ändert, GLEIT_ATTRIBUT am <html>. app.css nimmt dem Rahmen dann die
 * Treffer (pointer-events none): ein Tipp auf den Knopf unter der gleitenden
 * Blase landet im Knopf. Zu sehen ist Anna weiter, sie gleitet wie bisher.
 * Das Attribut fällt, sobald am Rahmen bzw. Träger keine Animation mehr läuft
 * (getAnimations). Ein Tipp auf Anna selbst während dieser 280 ms öffnet den
 * Chat nicht; danach wieder.
 *
 * Nie bei offenem Chat (der gleitet nie, und ein offenes Fenster ohne
 * Treffer wäre unbedienbar) und nie bei „Bewegung reduzieren“ (dann springt
 * der Rahmen, es gibt kein Gleiten).
 *
 * RÜCKWEG: GLEIT_DURCHLASS_AN = false (dann setzt niemand das Attribut).
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Code-Schalter des Durchlasses beim Gleiten. false = Stand vor dem 09.11. */
export const GLEIT_DURCHLASS_AN = true;

/** Am <html>: Annas geschlossener Rahmen gleitet gerade, er nimmt keinen Tipp an (app.css). */
export const GLEIT_ATTRIBUT = 'data-chat-gleitet';

/**
 * Beginnt mit dieser Änderung ein Gleiten, das den Durchlass braucht?
 *
 * @param {{hubVorher: number, hubJetzt: number, offen: boolean,
 *   bewegungReduziert: boolean, an?: boolean}} lage
 * @returns {boolean}
 */
export function gleitetJetzt({hubVorher, hubJetzt, offen, bewegungReduziert, an = GLEIT_DURCHLASS_AN}) {
  if (!an || offen || bewegungReduziert) return false;
  return (Number(hubVorher) || 0) !== (Number(hubJetzt) || 0);
}
