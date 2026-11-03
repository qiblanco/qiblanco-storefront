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
    if (gestempelt.current) return;
    gestempelt.current = true;
    meldeArm(arm, window);
  }, [arm]);
  return null;
}

/**
 * Setzt das Cookie und stempelt einmal. Wirft nie: der Test darf die Seite
 * nicht stören.
 * @param {'a' | 'b' | 'c'} arm
 * @param {Window} w
 */
export function meldeArm(arm, w) {
  if (!['a', 'b', 'c'].includes(arm)) return;
  try {
    w.document.cookie = `${THE_ALPHA_ARM_COOKIE}=${arm}; max-age=${COOKIE_TAGE * 86400}; path=/; SameSite=Lax`;
  } catch {
    // ohne Cookie fehlt nur das Bestellattribut; der Stempel geht trotzdem
  }
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

export default TheAlphaArm;
