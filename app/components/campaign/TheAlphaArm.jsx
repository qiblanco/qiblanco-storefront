import {useEffect, useRef} from 'react';
import {THE_ALPHA_ARM_COOKIE} from '~/lib/checkout-tracking';

/*
 * ARM-STEMPEL DES A/B/C-TESTS the-alpha-abc-e1 (Grossjob 20261025-prio1-the-
 * alpha-landingpage-figma-vorlage-a-server-b-ki-c, s07; Christian Z5: „A/B/C
 * Test wie bei den Ads"). Jede der drei Seiten rendert diesen Baustein mit
 * ihrem Buchstaben: A /pages/Qi-Alpha, B /pages/Qi-Alpha-C, C /pages/Qi-Alpha-B.
 * Zugeteilt wird im Loader von A (lib/experiment-weiche.server.js); hier wird
 * der Arm nur GEMELDET und für die Bestellung GEMERKT. Er rendert nichts.
 *
 * ZWEI WEGE, beide Bestand:
 *  1. Stempel `ab_zuteilung` {test, arm, erzwungen} über qpx — dieselbe Tür wie
 *     snippets/qb-ab.liquid im Englisch-Shop. Der Receiver schreibt ihn in die
 *     eigene Tabelle events.db:ab_zuteilung (nie in event), mit session_id und
 *     anon_id; die Auswertung verbindet darüber Warenkorb und Kassenstart der
 *     Sitzung mit dem Arm. qpx lädt nur mit Einwilligung; bis dahin wartet der
 *     Stempel im Puffer (window.qpx.q), ohne Einwilligung wird nie gesendet.
 *  2. Cookie qb_ab_the_alpha_abc=<a|b|c> (30 Tage, nur dieser Buchstabe, keine
 *     Kennung). checkout-tracking.js buildOriginCartAttributes liest ihn und
 *     schreibt das Warenkorb-Attribut _the_alpha_variante; der Unterstrich
 *     hält es in der Kasse unsichtbar, die Bestellung trägt es als
 *     note_attribute. Es überquert keine Domaingrenze (cart.updateAttributes).
 *     Das Cookie dient der Auswertung, das Register führt es als Statistik
 *     (einwilligung-scanner/register/cookies.yaml). Es entsteht deshalb nur mit
 *     Statistik-Einwilligung: window.Cookiebot.consent.statistics === true
 *     (Attrappe des eigenen Motors /qb-einwilligung.js oder Cookiebot selbst).
 *     Ohne sie wartet merkeArm auf die Wahl (CookiebotOnConsentReady/OnAccept
 *     am window, qb:einwilligung am document; DACH lädt nach der ersten Wahl
 *     nicht neu) und schreibt dann. Fehlt das Cookie, entsteht kein
 *     Bestellattribut, kein Ersatzwert. Lehnt der Besucher Statistik ab, wird
 *     ein Cookie aus der Zeit vor dieser Regel entfernt.
 *     Gemessen 17.11.2026 (Grossjob einwilligung-scanner-20261117T015551Z, s01):
 *     vorher stand das Cookie vor jeder Wahl auf /pages/Qi-Alpha, -B und -C.
 *
 * MESSUNG BLEIBT ERKENNBAR (Brain nachgestellter-kundenweg-muss-unterscheidbar-
 * sein): ein Pin-Besuch (?shop_exp=…) oder ein Automat (navigator.webdriver)
 * stempelt erzwungen=1; die Auswertung zählt nur erzwungen=0.
 */

export const THE_ALPHA_TEST = 'the_alpha_abc';
const COOKIE_TAGE = 30;
const PUFFER_MAX = 50;

/** @param {{arm: 'a' | 'b' | 'c'}} props */
export function TheAlphaArm({arm}) {
  const gestempelt = useRef(false);
  useEffect(() => {
    const abmelden = merkeArm(arm, window);
    if (!gestempelt.current) {
      gestempelt.current = true;
      stempleArm(arm, window);
    }
    return abmelden;
  }, [arm]);
  return null;
}

const WAHL_EREIGNISSE_WINDOW = ['CookiebotOnConsentReady', 'CookiebotOnAccept', 'CookiebotOnDecline'];
const WAHL_EREIGNISSE_DOKUMENT = ['qb:einwilligung'];
const OHNE_ABMELDEN = () => {};

/** Statistik erlaubt? Nur ein ausdrückliches true des Motors zählt. */
export function statistikErlaubt(w) {
  try {
    const cb = w && w.Cookiebot;
    return Boolean(cb && cb.consent && cb.consent.statistics === true);
  } catch {
    return false;
  }
}

/** Hat der Besucher gewählt und Statistik abgelehnt? */
function statistikAbgelehnt(w) {
  try {
    const cb = w && w.Cookiebot;
    return Boolean(cb && cb.hasResponse === true && cb.consent && cb.consent.statistics !== true);
  } catch {
    return false;
  }
}

function schreibeCookie(arm, w) {
  try {
    w.document.cookie = `${THE_ALPHA_ARM_COOKIE}=${arm}; max-age=${COOKIE_TAGE * 86400}; path=/; SameSite=Lax`;
  } catch {
    // ohne Cookie fehlt nur das Bestellattribut
  }
}

function entferneCookie(w) {
  try {
    if (!String(w.document.cookie || '').includes(`${THE_ALPHA_ARM_COOKIE}=`)) return;
    w.document.cookie = `${THE_ALPHA_ARM_COOKIE}=; max-age=0; path=/; SameSite=Lax`;
  } catch {
    // nichts zu tun
  }
}

/**
 * Merkt den Arm im Cookie, sobald Statistik erlaubt ist. Mit Einwilligung sofort,
 * sonst nach der Wahl. Gibt eine Abmeldung zurück (React-Aufräumen). Wirft nie.
 * @param {'a' | 'b' | 'c'} arm
 * @param {Window} w
 * @returns {() => void}
 */
export function merkeArm(arm, w) {
  if (!['a', 'b', 'c'].includes(arm)) return OHNE_ABMELDEN;
  if (statistikErlaubt(w)) {
    schreibeCookie(arm, w);
    return OHNE_ABMELDEN;
  }
  if (statistikAbgelehnt(w)) entferneCookie(w);
  let aktiv = true;
  const abmelden = () => {
    if (!aktiv) return;
    aktiv = false;
    try {
      WAHL_EREIGNISSE_WINDOW.forEach((n) => w.removeEventListener(n, pruefe));
      WAHL_EREIGNISSE_DOKUMENT.forEach((n) => w.document.removeEventListener(n, pruefe));
    } catch {
      // nichts zu tun
    }
  };
  function pruefe() {
    if (!aktiv) return;
    if (statistikErlaubt(w)) {
      schreibeCookie(arm, w);
      abmelden();
    } else if (statistikAbgelehnt(w)) {
      entferneCookie(w);
    }
  }
  try {
    WAHL_EREIGNISSE_WINDOW.forEach((n) => w.addEventListener(n, pruefe));
    WAHL_EREIGNISSE_DOKUMENT.forEach((n) => w.document.addEventListener(n, pruefe));
  } catch {
    return OHNE_ABMELDEN;
  }
  return abmelden;
}

/**
 * Stempelt einmal über qpx (Puffer bis zur Einwilligung, siehe Kopf). Wirft nie:
 * der Test darf die Seite nicht stören.
 * @param {'a' | 'b' | 'c'} arm
 * @param {Window} w
 */
export function stempleArm(arm, w) {
  if (!['a', 'b', 'c'].includes(arm)) return;
  try {
    const such = new URLSearchParams(w.location?.search || '');
    const erzwungen = such.has('shop_exp') || w.navigator?.webdriver === true ? 1 : 0;
    if (typeof w.qpx !== 'function') {
      const puffer = function () {
        puffer.q = puffer.q || [];
        if (puffer.q.length < PUFFER_MAX) puffer.q.push(arguments);
      };
      puffer.q = [];
      w.qpx = puffer;
    }
    w.qpx('track', 'ab_zuteilung', {test: THE_ALPHA_TEST, arm, erzwungen});
  } catch {
    // Stempel ist Messung, kein Kaufweg
  }
}

/**
 * Cookie (mit Einwilligung) und Stempel in einem Aufruf.
 * @param {'a' | 'b' | 'c'} arm
 * @param {Window} w
 * @returns {() => void} Abmeldung des Wartens auf die Wahl
 */
export function meldeArm(arm, w) {
  const abmelden = merkeArm(arm, w);
  stempleArm(arm, w);
  return abmelden;
}

export default TheAlphaArm;
