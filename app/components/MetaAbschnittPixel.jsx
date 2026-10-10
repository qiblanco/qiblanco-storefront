import {useEffect} from 'react';
import {useLocation} from 'react-router';
import {hasMarketingConsent} from './MetaPixel';
import {
  META_ABSCHNITT_MODUS,
  META_ABSCHNITT_EREIGNIS,
  VERWEIL_MS,
  erstelleErfasser,
  istLpPfad,
  seiteAusPfad,
  sichtbarGenug,
} from '~/lib/meta-abschnitt';

/**
 * Meta-Pixel-Ereignis je LP-Abschnitt (GS-076). Logik, Einwilligung und
 * Schalter: app/lib/meta-abschnitt.js.
 *
 * Steht in root.jsx im selben Production/Preview-Gate wie MetaPixel. Sendet
 * nur über das schon gebootete fbq des MetaPixel; ist es nicht gebootet,
 * geht nichts raus.
 */
function sendeAnMeta(parameter) {
  if (!window._qiblancoMetaPixelBooted) return;
  if (typeof window.fbq !== 'function') return;
  try {
    window.fbq('trackCustom', META_ABSCHNITT_EREIGNIS, parameter);
  } catch {
    // Ein Tracking-Fehler darf nie den Shop brechen.
  }
}

function notiere(eintrag) {
  if (!Array.isArray(window.__qbMetaAbschnitt)) window.__qbMetaAbschnitt = [];
  window.__qbMetaAbschnitt.push(eintrag);
}

const SCHWELLEN = Array.from({length: 21}, (_, i) => i / 20);

export function MetaAbschnittPixel() {
  const {pathname} = useLocation();

  useEffect(() => {
    if (META_ABSCHNITT_MODUS === 'aus') return undefined;
    if (!istLpPfad(pathname)) return undefined;
    if (typeof window.IntersectionObserver !== 'function') return undefined;

    const seite = seiteAusPfad(pathname);
    const erfasser = erstelleErfasser({
      modus: META_ABSCHNITT_MODUS,
      einwilligung: hasMarketingConsent,
      senden: sendeAnMeta,
      notieren: notiere,
    });
    const uhren = new Map();
    const beobachtet = new WeakSet();

    const io = new window.IntersectionObserver(
      (eintraege) => {
        for (const en of eintraege) {
          const id = en.target.getAttribute('data-section');
          if (!id || erfasser.gesehen.has(id)) continue;
          if (sichtbarGenug(en, window.innerHeight)) {
            if (!uhren.has(en.target)) {
              uhren.set(
                en.target,
                window.setTimeout(() => {
                  uhren.delete(en.target);
                  erfasser.melde(id, seite);
                }, VERWEIL_MS),
              );
            }
          } else if (uhren.has(en.target)) {
            window.clearTimeout(uhren.get(en.target));
            uhren.delete(en.target);
          }
        }
      },
      {threshold: SCHWELLEN},
    );

    const scan = () => {
      document.querySelectorAll('[data-section]').forEach((el) => {
        if (beobachtet.has(el)) return;
        beobachtet.add(el);
        io.observe(el);
      });
    };
    scan();

    // Spät gerenderte Abschnitte (Client-Komponenten) nachziehen.
    let geplant = false;
    const mo =
      typeof window.MutationObserver === 'function'
        ? new window.MutationObserver(() => {
            if (geplant) return;
            geplant = true;
            window.requestAnimationFrame(() => {
              geplant = false;
              scan();
            });
          })
        : null;
    if (mo) mo.observe(document.body, {childList: true, subtree: true});

    return () => {
      io.disconnect();
      if (mo) mo.disconnect();
      uhren.forEach((t) => window.clearTimeout(t));
      uhren.clear();
    };
  }, [pathname]);

  return null;
}
