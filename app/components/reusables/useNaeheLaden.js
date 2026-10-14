import {useEffect, useState} from 'react';

/*
 * useNaeheLaden -- EIN Massstab fuer "das Video kommt in die Naehe".
 *
 * Grossjob 20261014-GROSSJOB-imgix-abloesung-videostandard-weltweit-ladezeit-
 * waechter, Segment s02. Christian 14.10.2026: "...und wirklich mal schauen, ob
 * dieses Slow Motion Laden ueberall eingesetzt ist".
 *
 * Ein Scroll-Video haengt seine Quelle erst an, wenn seine Oberkante hoechstens
 * eine halbe Fensterhoehe unter dem unteren Fensterrand liegt (rootMargin 50 %,
 * also 1,5 Fensterhoehen unter dem oberen Rand). Das ist dieselbe Grenze, an der
 * der taegliche Waechter (videostandard, LAZY_TIEFE_FAKTOR 1,5) "weit weg" von
 * "nah" trennt. Vorher galt bei ScrollScrubVideo 150 %: die Gitterchip-Seite
 * lud mobil 1,3 MB beim Seitenaufruf, weil das Video 1,8 Fensterhoehen tief
 * steht (Erstmessung 14.10.2026 07:01Z).
 *
 * Bis das Scrubben beginnt, bleiben danach noch anderthalb Fensterhoehen Weg:
 * die Strecke haengt am Containeranfang, der Fortschritt zaehlt erst, wenn er
 * den oberen Fensterrand erreicht. Ein lazy angehaengtes Scroll-Video zeigte sein
 * erstes Bild in der Erstmessung 73 ms (Desktop) bzw. 216-223 ms (Mobil, 4G)
 * nach dem Anhaengen.
 *
 * Schalter je Seite (Rueckweg, Gewinnerseiten nur schrittweise):
 *   sofort: true   -> haengt sofort an (Verhalten von ScrollMikroskopVideo bis 14.10.)
 *   rand           -> eigener Rand, z. B. NAEHE_RAND_BISHER (ScrollScrubVideo bis 14.10.)
 * Ohne IntersectionObserver (sehr alte Browser) wird sofort angehaengt: dort
 * soll das Video lieber laden als fehlen.
 */
export const NAEHE_RAND = '50% 0px 50% 0px';
export const NAEHE_RAND_BISHER = '150% 0px 150% 0px';

export function useNaeheLaden(ref, {rand = NAEHE_RAND, sofort = false} = {}) {
  const [nah, setNah] = useState(sofort);

  useEffect(() => {
    if (sofort) {
      setNah(true);
      return undefined;
    }
    const element = ref.current;
    if (!element) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setNah(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNah(true);
          io.disconnect();
        }
      },
      {rootMargin: rand},
    );
    io.observe(element);
    return () => io.disconnect();
  }, [ref, rand, sofort]);

  return nah;
}
