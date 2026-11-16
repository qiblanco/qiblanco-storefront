import {useCallback, useEffect, useRef, useState} from 'react';
import {mitMarkeR} from '~/components/reusables/MarkeR';
import {useElinaBewegung} from '~/components/reusables/useElinaBewegung';
import {GoogleBewertungsleiste} from '~/components/reusables/GoogleBewertungsleiste';
import {IgTestimonialSlideshow} from '~/components/reusables/IgTestimonialSlideshow';
import {trageBereich} from './trage-bereich-daten';

/*
 * TrageBereich — „So sieht es an dir aus“ (Christian 16.11.2026, Job
 * 20261116-prio2-produktseiten-tragebereich-swipe-echte-fotos-und-bewertungen-hoch-de-us).
 * Echte Fotos aus unseren Shootings, wie der QiOne 2 Pro an der Kette, das
 * QiBracelet am Handgelenk und der QiHome Air in Steckdose und Raum aussehen.
 * Fotos und Texte: app/components/reusables/trage-bereich-daten.js.
 *
 * Wischbahn wie „Modelle vergleichen“ der Alpha-Vorlage (.avv-raster): eine
 * Spalte je Foto, am Handy sieht man die Nachbarkarte. ABWEICHUNG mit Grund:
 * KEIN scroll-snap. Die Bahn läuft frei mit dem Finger aus (Elinas Regel „nie
 * einrasten“, Auftrag Teil A). Pfeile darunter blättern um eine Karte, nur auf
 * Klick, nie im Scroll-Zuhörer. Der Scroll-Zuhörer ist passiv und liest nur.
 *
 * Bewegung: nur Einblenden (Christians Seiten, --eb-weg 0), über den
 * Baukasten useElinaBewegung; bei „Bewegung reduzieren“ steht alles still.
 */
export function TrageBereich({handle}) {
  const b = trageBereich(handle);
  const wurzel = useRef(null);
  const bahn = useRef(null);
  const [rand, setRand] = useState({anfang: true, ende: false});
  useElinaBewegung(wurzel);

  const messe = useCallback(() => {
    const el = bahn.current;
    if (!el) return;
    const weg = el.scrollWidth - el.clientWidth;
    setRand({anfang: el.scrollLeft <= 2, ende: weg <= 2 || el.scrollLeft >= weg - 2});
  }, []);

  useEffect(() => {
    const el = bahn.current;
    if (!el) return undefined;
    messe();
    el.addEventListener('scroll', messe, {passive: true});
    window.addEventListener('resize', messe, {passive: true});
    return () => {
      el.removeEventListener('scroll', messe);
      window.removeEventListener('resize', messe);
    };
  }, [messe]);

  if (!b?.fotos?.length) return null;

  const blaettern = (richtung) => {
    const el = bahn.current;
    if (!el) return;
    const karte = el.querySelector('.trb-karte');
    const schritt = karte ? karte.getBoundingClientRect().width : el.clientWidth * 0.8;
    const ruhig = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({left: richtung * schritt, behavior: ruhig ? 'auto' : 'smooth'});
  };

  const titelId = `trb-titel-${handle}`;
  return (
    <section ref={wurzel} className="trb" data-trage-bereich={handle} aria-labelledby={titelId}>
      <header className="trb-kopf" data-eb="">
        <p className="trb-etikett">{mitMarkeR(b.etikett)}</p>
        <h2 id={titelId} className="trb-titel">
          {mitMarkeR(b.titel)}
        </h2>
      </header>
      <ul
        ref={bahn}
        className="trb-bahn qb-wischbahn"
        data-eb="gruppe"
        role="list"
        aria-label={b.bahnLabel}
        tabIndex={0}
      >
        {b.fotos.map((f, i) => (
          <li key={f.url} className="trb-karte">
            <figure className="trb-figur">
              <img
                className="trb-bild"
                src={`${f.url}&width=720`}
                srcSet={`${f.url}&width=480 480w, ${f.url}&width=720 720w, ${f.url}&width=1080 1080w`}
                sizes="(min-width: 750px) 33vw, 80vw"
                width="1080"
                height="1350"
                alt={f.alt}
                loading={i < 2 ? 'eager' : 'lazy'}
                decoding="async"
              />
              <figcaption className="trb-zeile">{mitMarkeR(f.zeile)}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <div className="trb-knoepfe">
        <button
          type="button"
          className="trb-knopf trb-knopf--zurueck"
          aria-label={b.zurueck}
          disabled={rand.anfang}
          onClick={() => blaettern(-1)}
        >
          <span aria-hidden="true">‹</span>
        </button>
        <button
          type="button"
          className="trb-knopf"
          aria-label={b.weiter}
          disabled={rand.ende}
          onClick={() => blaettern(1)}
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </section>
  );
}

/*
 * Google-Bewertungen hochgezogen (Christian 16.11.2026, 09:52: „danach muesste
 * aus meiner Sicht diese Google-Bewertungs-Slider kommen. Der muesste
 * hochgezogen werden, der ist zu tief.“): dieselbe Leiste wie in AlphaStimmen,
 * jetzt direkt nach Trage- und Zellvideo-Bereich. Damit sie nicht doppelt
 * steht, nutzen die drei Kaufseiten im Slot „stimmen“ StimmenOhneBewertungen
 * (Instagram-Reihe wie bisher). AlphaStimmen selbst bleibt unverändert für
 * alle anderen Aufrufer.
 */
export function BewertungenHoch() {
  return (
    <div className="trb-bewertungen" data-av-bewertungen-hoch="">
      <GoogleBewertungsleiste dataSection="av-bewertungsleiste" />
    </div>
  );
}

export function StimmenOhneBewertungen({daten, igProdukt = null}) {
  if (!igProdukt) return null;
  return (
    <div className="avs" data-av-stimmen="">
      <div className="avs-ig">
        <IgTestimonialSlideshow produkt={igProdukt} ueberschrift={daten?.instagram ?? undefined} />
      </div>
    </div>
  );
}
