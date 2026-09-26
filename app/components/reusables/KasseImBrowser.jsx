import {useEffect, useState} from 'react';
import {useAside} from '~/components/Aside';
import {WEBVIEW_META_MARKERS} from '~/lib/checkout-tracking';

/**
 * Hinweis im Warenkorb für Besucher im Instagram-/Facebook-Browser
 * (Großauftrag „Kasse im Instagram-Browser“ vom 26.09.2026, Segment s02).
 *
 * WARUM: 28.07.-26.09. begannen im In-App-Browser 32 Kassen, 2 wurden bestellt;
 * aus Meta-Anzeigen 24 -> 0. Ohne In-App-Browser 57 -> 20. Die Kasse lädt dort
 * und KANN abschließen, aber es fehlen Apple Pay (Shopify verlangt Safari),
 * Google Pay (in Android-WebViews aus) und die gespeicherten Karten. Gemessen:
 * der Kassen-Link öffnet in einem frischen Safari denselben Warenkorb. Wer IN
 * DER KASSE über das Menü der App in den Browser wechselt, nimmt ihn mit; wer
 * es schon hier auf /cart tut, landet mit LEEREM Warenkorb (getrennter
 * Cookie-Speicher). Deshalb steht die Reihenfolge vorn.
 *
 * Bewusst KEIN Sprung-Knopf: x-safari-https:// trägt in Metas Browsern seit
 * Mitte 2025 unzuverlässig, intent:// ist unbelegt. Bewusst KEINE
 * Positionsangabe für das Menü: Ort und Bezeichnung wechseln je App/Version.
 *
 * ERKENNUNG: dieselbe Markerliste wie classifyUserAgent (WEBVIEW_META_MARKERS),
 * keine zweite. classifyUserAgent selbst wird NICHT benutzt, weil es die Klasse
 * `intern` vorzieht — unsere stummen Proben tragen `QiBlancoInternal` im UA und
 * müssen den Block sehen, sonst ist er am Rand unmessbar.
 * Gelesen wird der UA erst nach der Hydration (useEffect): der Server rendert
 * nichts, Server- und Client-Markup bleiben identisch.
 *
 * Im Drawer erscheint der Block nur, solange der Drawer offen ist: der
 * geschlossene Drawer steht im DOM vor der Seite, und ein unsichtbares Duplikat
 * davor ließe jede Rand-Messung mit `[data-kasse-iab]` ins Leere greifen.
 *
 * Messmarker: data-kasse-iab, data-kasse-iab-app, data-kasse-iab-os — die
 * tägliche Messung (ads-manager/bin/kasse_in_app_browser.py) erkennt daran den
 * Fix-Zeitpunkt.
 *
 * RÜCKWEG: KASSE_IM_BROWSER_AN = false (ein Deploy) oder `hb-deploy revert`
 * des Merge-Commits.
 */
export const KASSE_IM_BROWSER_AN = true;

const APP = {instagram: 'Instagram', facebook: 'Facebook'};

// So groß wie die Lieferhinweise darüber, aber in voller Textfarbe (Kontrast).
const TEXT = {fontSize: '0.9rem', lineHeight: 1.45};

/**
 * App und Betriebssystem aus dem User-Agent — oder null, wenn der Hinweis
 * nicht passt (kein Meta-Browser, oder weder iOS noch Android: dort gibt es
 * weder Apple Pay noch Google Pay zuzusagen).
 *
 * @param {string | null | undefined} userAgent
 * @returns {{app: 'instagram' | 'facebook', os: 'ios' | 'android'} | null}
 */
export function kasseImBrowserKontext(userAgent) {
  const u = (userAgent || '').toLowerCase();
  if (!u || !WEBVIEW_META_MARKERS.some((m) => u.includes(m))) return null;
  let os = null;
  if (u.includes('iphone') || u.includes('ipad') || u.includes('ipod')) {
    os = 'ios';
  } else if (u.includes('android')) {
    os = 'android';
  }
  if (!os) return null;
  return {app: u.includes('instagram') ? 'instagram' : 'facebook', os};
}

/**
 * @param {{layout?: 'page' | 'aside'}}
 */
export function KasseImBrowser({layout}) {
  const [kontext, setKontext] = useState(null);
  // Wie CartMain: der Warenkorb steht immer im Aside-Provider (PageLayout).
  const drawerOffen = useAside().type === 'cart';
  useEffect(() => {
    if (!KASSE_IM_BROWSER_AN) return;
    setKontext(kasseImBrowserKontext(window.navigator?.userAgent));
  }, []);

  if (!kontext) return null;
  if (layout === 'aside' && !drawerOffen) return null;

  const app = APP[kontext.app];
  const ios = kontext.os === 'ios';
  const wallet = ios ? 'Apple Pay' : 'Google Pay';
  const menue = ios ? '„In Safari öffnen“' : '„In Chrome öffnen“';
  const ziel = ios ? 'in Safari' : 'im Browser';

  return (
    <div
      className="kasse-im-browser"
      data-kasse-iab=""
      data-kasse-iab-app={kontext.app}
      data-kasse-iab-os={kontext.os}
      style={{color: 'var(--color-dark)', padding: '8px 0 0'}}
    >
      {/* Schrift am <p> selbst: eine globale p-Regel schlägt das Erben. */}
      <p style={{...TEXT, margin: '0 0 4px', fontWeight: 600}}>
        Lieber mit {wallet} bezahlen?
      </p>
      <p style={{...TEXT, margin: 0}}>
        Tippe erst auf „Jetzt sicher zur Kasse“. Dann in der Kasse auf die
        drei Punkte (···) von {app} und auf {menue} oder „Im Browser öffnen“.
        Dein Warenkorb kommt mit, und {ziel} hast du {wallet} und deine
        gespeicherten Karten.
      </p>
    </div>
  );
}
