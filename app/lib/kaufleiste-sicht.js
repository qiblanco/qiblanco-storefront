import {useEffect, useState} from 'react';

/*
 * IST EIN FESTER KAUFKNOPF GERADE SICHTBAR? Der EINE Haken für alle festen
 * Kaufknöpfe am unteren Rand (Grossjob 20261030-prio1-homepage-gesamt-pruefen-
 * alpha-befunde-alle-seiten-geraete-maerkte, s03).
 *
 * ANLASS (Christian 30.10.2026): „auf ihrem Handy geht immer noch nicht das
 * Video und der rote Balken unten hüpft noch“ (Anna, Chrome auf dem iPhone)
 * und „es muss überall auf der Homepage kontrolliert werden, was wir bei der
 * Alpha-Seite festgestellt haben“.
 *
 * DER FEHLER: jede Leiste hing an einem IntersectionObserver. Der misst gegen
 * die Unterkante des Fensters, und die wandert auf dem iPhone mit den
 * Browserleisten: Leisten ein = Fenster kürzer, Leisten aus = länger. Steht
 * ein Bezugspunkt (Kaufbox-Knopf, Preisblock, Schluss) genau in diesem
 * Streifen, klappt der Zustand mit jedem Ein- und Ausklappen um, ohne dass der
 * Kunde etwas tut. Der Knopf blendet sich ein und aus. Auf der Qi-Alpha-Seite
 * gemessen: Chrome iOS 8 Wackelstellen, Safari 4, Android 3 (Job
 * 20261030-prio3-repair-qi-alpha-video-sound-iphone-safari-echtgeraet-standard).
 *
 * DIE REGEL (dieselbe wie TheAlphaPremium.jsx, dort für Qi Alpha):
 *  - Gemessen wird gegen die KLEINE Bildschirmhöhe (100svh, Leisten ein). Sie
 *    ändert sich beim Ein- und Ausklappen nicht. Gemessen über ein
 *    unsichtbares Element mit height:100svh, gesetzt per style.cssText (so
 *    rechnet es auch die Geräteprobe echtgeraet_probe.py um).
 *  - Hysterese RUHE_PX: ein Bezugspunkt kommt ins Bild, sobald seine Oberkante
 *    über die kleine Bildschirmhöhe steigt; er gilt erst wieder als draußen,
 *    wenn er RUHE_PX darunter (oder darüber) steht. Ein Ruck von ein paar
 *    Pixeln schaltet nichts um.
 *  - Gerechnet im rAF-Takt beim Scrollen und bei Größenänderung, nie mitten
 *    in einem Bild.
 *
 * WER IHN BENUTZT: reusables/Kaufleiste.jsx (Kaufseiten), rookie/start/
 * StickyKaufknopf.jsx (/pages/start-b), apple-seite/schlaf-zellen-schutz/
 * SchlafZellenSchutzApple.jsx (FesterKnopf), campaign/SchlafZellenSchutz.jsx
 * (StickyKaufknopf). Jede Leiste behält ihre eigene Regel (wann sie steht),
 * der Haken liefert nur die ruhige Lage ihrer Bezugspunkte.
 *
 * Reine Teile (imBildRuhig, lageRuhig, lageZusammen) ohne Browser prüfbar:
 * kaufleiste-sicht.test.mjs.
 */

/** Hysterese in CSS-Pixeln (wie RUHE_PX in TheAlphaPremium.jsx). */
export const RUHE_PX = 48;

/**
 * Steht ein Bezugspunkt im Bild? Mit Hysterese: wer drin ist, bleibt drin, bis
 * er RUHE_PX über den Rand hinaus ist.
 * @param {{oben: number, unten: number}} kante Ober-/Unterkante (getBoundingClientRect)
 * @param {number} bild kleine Bildschirmhöhe (100svh) in Pixeln
 * @param {boolean} warImBild Zustand der letzten Rechnung
 * @param {number} [ruhe]
 * @returns {boolean}
 */
export function imBildRuhig({oben, unten}, bild, warImBild, ruhe = RUHE_PX) {
  if (warImBild) return oben < bild + ruhe && unten > -ruhe;
  return oben < bild && unten > 0;
}

/**
 * Lage eines Bezugspunkts: im Bild, darüber (nach oben weggescrollt) oder
 * darunter (noch nicht erreicht).
 * @returns {{imBild: boolean, darueber: boolean, darunter: boolean, unten: number}}
 */
export function lageRuhig(kante, bild, warImBild, ruhe = RUHE_PX) {
  const imBild = imBildRuhig(kante, bild, warImBild, ruhe);
  return {
    imBild,
    darueber: !imBild && kante.unten <= 0,
    darunter: !imBild && kante.oben >= bild,
    unten: kante.unten,
  };
}

/**
 * Mehrere Elemente unter einem Namen (z. B. Preisblock UND Schluss): im Bild,
 * sobald eines im Bild ist. Kein Element: da=false (die Regel der Leiste
 * entscheidet, was fehlende Messung heißt).
 * @param {Array<{imBild: boolean, darueber: boolean, darunter: boolean, unten: number}>} lagen
 */
export function lageZusammen(lagen) {
  if (!lagen.length) {
    return {da: false, imBild: false, darueber: false, darunter: false, unten: null};
  }
  return {
    da: true,
    imBild: lagen.some((l) => l.imBild),
    darueber: lagen.every((l) => l.darueber),
    darunter: lagen.every((l) => l.darunter),
    unten: lagen[0].unten,
  };
}

const alsListe = (z) => (Array.isArray(z) ? z.filter(Boolean) : z ? [z] : []);

/**
 * Beobachtet die Bezugspunkte und meldet ihre ruhige Lage.
 * @param {Record<string, Element|Element[]|null|undefined>} ziele
 * @param {(lage: Record<string, ReturnType<typeof lageZusammen>>) => void} aufLage
 * @param {{ruhe?: number}} [opt]
 * @returns {() => void} aufräumen
 */
export function beobachteLage(ziele, aufLage, {ruhe = RUHE_PX} = {}) {
  const mass = document.createElement('div');
  mass.setAttribute('aria-hidden', 'true');
  mass.setAttribute('data-kaufleiste-mass', '');
  mass.style.cssText =
    'position:fixed;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none';
  document.body.appendChild(mass);
  let bild = window.innerHeight;
  const messeBild = () => {
    bild = mass.getBoundingClientRect().height || window.innerHeight;
  };
  const war = new Map();
  let angefordert = false;
  const rechnen = () => {
    angefordert = false;
    const lage = {};
    for (const [name, z] of Object.entries(ziele)) {
      const lagen = alsListe(z).map((el) => {
        const r = el.getBoundingClientRect();
        const l = lageRuhig({oben: r.top, unten: r.bottom}, bild, war.get(el) === true, ruhe);
        war.set(el, l.imBild);
        return l;
      });
      lage[name] = lageZusammen(lagen);
    }
    aufLage(lage);
  };
  const takt = () => {
    if (angefordert) return;
    angefordert = true;
    window.requestAnimationFrame(rechnen);
  };
  const neu = () => {
    messeBild();
    takt();
  };
  messeBild();
  rechnen();
  window.addEventListener('scroll', takt, {passive: true});
  window.addEventListener('resize', neu);
  // Bilder und nachgeladene Teile verschieben die Bezugspunkte ohne Scrollen.
  const groesse =
    typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(takt);
  groesse?.observe(document.body);
  return () => {
    window.removeEventListener('scroll', takt);
    window.removeEventListener('resize', neu);
    groesse?.disconnect();
    mass.remove();
  };
}

/**
 * React-Haken: `sichtbar` der Leiste. `holeZiele` sucht die Bezugspunkte im
 * DOM (null = nichts zu beobachten, Leiste bleibt weg), `regel` entscheidet
 * aus ihrer Lage. Beide werden nur beim Einhängen bzw. bei Änderung von
 * `abh` neu gelesen; die Regel bekommt jede Lage.
 * @param {() => Record<string, Element|Element[]|null>|null} holeZiele
 * @param {(lage: Record<string, ReturnType<typeof lageZusammen>>) => boolean} regel
 * @param {Array<any>} abh
 */
export function useKaufleisteSicht(holeZiele, regel, abh) {
  const [sichtbar, setSichtbar] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !document.body) return undefined;
    const ziele = holeZiele();
    if (!ziele) return undefined;
    return beobachteLage(ziele, (lage) => setSichtbar(Boolean(regel(lage))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, abh);
  return sichtbar;
}
