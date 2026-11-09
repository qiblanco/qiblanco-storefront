import {useCallback, useEffect, useId, useRef, useState} from 'react';
import {IG_TESTIMONIALS} from '~/data/ig-testimonials';
import {useElinaBewegung} from '~/components/reusables/useElinaBewegung';

/*
 * VideoGalerie — die wiederverwendbare Sektion „Video-Galerie / Stimmen-Karussell“
 * (Elina, EL-20261108-a7401ffd). Überschrift mittig, darunter eine waagrechte Bahn
 * hoher Hochformat-Kacheln (9:16). Jede Kachel spielt einen kurzen Clip stumm in
 * Schleife wie ein GIF, trägt oben links den verlinkten @Namen und unten einen
 * kurzen Titel; die ganze Kachel führt zum Instagram-Beitrag.
 *
 * EINSTELLUNGEN je Seite (alles über Props, nichts fest verdrahtet):
 *   kopf      Überschrift der Sektion
 *   ebene     'h2' (Vorgabe) oder 'h1', wenn die Galerie der Hauptinhalt der Seite ist
 *   kacheln   [{clip, poster, titel, name, profilUrl, beitragUrl, ton}]
 *             clip    kurze mp4 auf unserem CDN (stumm, wenige Sekunden)
 *             poster  Standbild auf unserem CDN, erstes Bild des Clips
 *             ton     'stumm' NUR, wenn der Clip nachweislich keine Tonspur hat
 * Kacheln aus dem bestehenden Stimmen-Bestand baut `stimmenKachel()` unten: Name,
 * Profil und Beitrag kommen dann aus derselben Datenschicht wie bei der Reihe der
 * Produktseiten (IgTestimonialSlideshow), nicht aus einer zweiten Liste.
 *
 * WARUM EINE EIGENE DARSTELLUNG NEBEN IgTestimonialSlideshow: die Reihe der
 * Produktseiten zeigt das ganze Video mit Ton hinter einer Vorschau und läuft live
 * auf vier Kaufseiten. Elina wollte Clips, die von selbst laufen, und ausdrücklich
 * keine Änderung an bestehenden Live-Seiten. Gemeinsam bleiben der Bestand, die
 * Rechte (siehe Kopf von app/data/ig-testimonials.js) und die Mess-Naht
 * data-qb-video-zustand mit denselben Werten vorschau / wartet / spielt.
 *
 * DAS WISCHEN AM HANDY ist bewusst NATIVES Scrollen mit CSS-Einrasten
 * (scroll-snap-type: x mandatory, scroll-snap-stop: always). Damit rechnet der
 * Browser selbst: flüssig auf dem iPhone, ein schneller Wisch hält an der
 * nächsten Kachel, und senkrechtes Scrollen der Seite bleibt frei, weil hier kein
 * Touch-Ereignis abgefangen wird. JavaScript kommt nur für drei Dinge dazu:
 * Parallax, Pfeile und das Ziehen mit der Maus.
 *
 * PARALLAX: das Video liegt um PARALLAX der Kachelbreite links und rechts über
 * die Kachel hinaus und läuft beim Wischen leicht gegen die Bewegung. Gerechnet
 * wird aus gespeicherten Maßen (offsetLeft), je Bild nur scrollLeft lesen und
 * transform schreiben, kein Layout im Bildtakt. Bei „Bewegung reduzieren“ aus.
 *
 * VIDEOS: das Video trägt dasselbe Standbild zusätzlich als poster: im
 * Stromsparmodus spielt iOS nichts von selbst, und die Medien-Prüfung des Deploys
 * (medien_format.py) wertet nur das poster-Attribut als Standbild.
 * Ohne src ausgeliefert; die Adresse wird erst gesetzt, wenn die Kachel
 * sichtbar wird, und das Video pausiert, sobald sie den Blick verlässt oder der
 * Tab im Hintergrund ist. Bis das Video wirklich läuft, steht das Standbild.
 *
 * EINBLENDEN BEIM SCROLLEN nach Elinas Design-Dauerregel (EL-20261108-5bf00bf2) über
 * den geprüften Baukasten (app/components/reusables/elina-bewegung.js): die Überschrift blendet ein
 * und gleitet 20 px hoch, die Kacheln folgen leicht versetzt. Steht die Galerie
 * beim Laden schon im Bild, ist sie sofort da. Bei „Bewegung reduzieren“ steht
 * alles still, ohne JavaScript ist alles sichtbar.
 *
 * EINBAU AUF EINER SEITE: <VideoGalerie kopf="…" kacheln={…} /> und in links()
 * beide Stylesheets laden, ~/styles/video-galerie.css und ~/styles/elina-bewegung.css
 * (Muster: pages.video-galerie-vorschau.jsx).
 *
 * Rückbau: diese Datei, app/styles/video-galerie.css, app/components/reusables/video-galerie-daten.js
 * und die Vorschau-Route pages.video-galerie-vorschau.jsx löschen.
 */

/* Anteil der Kachelbreite, um den das Video höchstens gegenläuft. Muss zum
 * Überstand von .vg__medien im CSS passen (dort 8 % je Seite). */
const PARALLAX = 0.08;
/* Unter dieser Strecke in px ist ein Maus-Ziehen ein Klick. */
const ZIEH_SCHWELLE_PX = 6;
/* Ab diesem Anteil der Kachelbreite blättert ein Maus-Ziehen eine Kachel weiter. */
const WECHSEL_ANTEIL = 0.15;
/* Ab dieser Geschwindigkeit (px/ms) blättert auch ein kurzer Ruck weiter. */
const RUCK_PX_MS = 0.35;
/* Spätestens dann gilt die Fahrt zur Zielkachel als angekommen. */
const ANKUNFT_MS = 700;

function bewegungReduziert() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/* Shopify-CDN liefert Bilder in der verlangten Breite aus. */
function bildBreite(url, breite) {
  if (!url) return url;
  return `${url}${url.includes('?') ? '&' : '?'}width=${breite}`;
}

/**
 * Eine Kachel aus dem bestehenden Stimmen-Bestand. Fail-closed: steht der Code
 * dort nicht, nicht in der Reihe oder ohne Profil, gibt es keine Kachel.
 */
export function stimmenKachel(code, {clip, poster, titel, ton}) {
  const s = IG_TESTIMONIALS.find(
    (e) => e.code === code && e.inDerReihe === true && e.profil,
  );
  if (!s || !clip) return null;
  return {
    code: s.code,
    clip,
    poster,
    titel,
    ton,
    name: s.profil,
    profilUrl: s.profilUrl,
    beitragUrl: `https://www.instagram.com/${s.typ === 'p' ? 'p' : 'reel'}/${s.code}/`,
  };
}

export function VideoGalerie({kopf, kacheln, kennung, ebene = 'h2'}) {
  const Kopf = ebene === 'h1' ? 'h1' : 'h2';
  const liste = (kacheln || []).filter((k) => k && k.clip && k.beitragUrl);
  const kopfId = useId();
  const wurzelRef = useRef(null);
  const bahnRef = useRef(null);
  const masse = useRef({kacheln: [], breite: 0});
  const ziehen = useRef(null);
  const klickSperre = useRef(false);
  const [rand, setRand] = useState({links: true, rechts: false});
  useElinaBewegung(wurzelRef, [liste.length]);

  const vermessen = useCallback(() => {
    const bahn = bahnRef.current;
    if (!bahn) return;
    const els = Array.from(bahn.querySelectorAll('[data-vg-kachel]'));
    const start = els.length ? els[0].offsetLeft : 0;
    const breite = bahn.clientWidth;
    /* Am Handy rastet die Kachel mittig ein, sonst links (siehe CSS). */
    const mittig =
      els.length > 0 &&
      String(window.getComputedStyle(els[0]).scrollSnapAlign).includes('center');
    masse.current = {
      breite,
      kacheln: els.map((el) => ({
        el,
        medien: el.querySelector('[data-vg-medien]'),
        links: el.offsetLeft,
        ziel: mittig
          ? Math.max(0, el.offsetLeft + el.offsetWidth / 2 - breite / 2)
          : el.offsetLeft - start,
        w: el.offsetWidth,
      })),
    };
  }, []);

  const zeichnen = useCallback(() => {
    const bahn = bahnRef.current;
    if (!bahn) return;
    const x = bahn.scrollLeft;
    const max = bahn.scrollWidth - bahn.clientWidth;
    const neu = {links: x <= 2, rechts: x >= max - 2};
    setRand((alt) =>
      alt.links === neu.links && alt.rechts === neu.rechts ? alt : neu,
    );
    if (bewegungReduziert()) return;
    const {kacheln: ks, breite} = masse.current;
    const mitte = breite / 2;
    for (const k of ks) {
      if (!k.medien) continue;
      const abstand = k.links + k.w / 2 - x - mitte;
      let d = abstand / (mitte + k.w / 2);
      if (d > 1) d = 1;
      else if (d < -1) d = -1;
      k.medien.style.transform = `translate3d(${(-d * PARALLAX * k.w).toFixed(2)}px,0,0)`;
    }
  }, []);

  /* Maße, Parallax und Pfeil-Zustand: beim Scrollen höchstens einmal je Bild. */
  useEffect(() => {
    const bahn = bahnRef.current;
    if (!bahn) return undefined;
    let raf = 0;
    const takt = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        zeichnen();
      });
    };
    vermessen();
    zeichnen();
    bahn.addEventListener('scroll', takt, {passive: true});
    let ro = null;
    if (typeof ResizeObserver === 'function') {
      ro = new ResizeObserver(() => {
        vermessen();
        takt();
      });
      ro.observe(bahn);
    } else {
      window.addEventListener('resize', vermessen);
    }
    return () => {
      bahn.removeEventListener('scroll', takt);
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', vermessen);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [vermessen, zeichnen, liste.length]);

  /* Videos: erst laden, wenn sichtbar; nur abspielen, solange sichtbar. */
  useEffect(() => {
    const bahn = bahnRef.current;
    if (!bahn || typeof IntersectionObserver !== 'function') return undefined;
    const sichtbar = new Set();
    const spielen = (v) => {
      /* Stumm als Eigenschaft setzen: React schreibt `muted` nicht verlässlich
       * als Attribut, und ohne stumm verweigert iOS das Abspielen. */
      v.muted = true;
      v.defaultMuted = true;
      if (!v.getAttribute('src')) {
        v.setAttribute('src', v.dataset.clip);
        v.load();
      }
      const p = v.play();
      if (p && typeof p.catch === 'function') {
        p.catch((fehler) => {
          /* Stromsparmodus am iPhone: Abspielen ohne Geste abgelehnt. Die
           * Kachel merkt es sich, der erste Tipp startet das Video (onClickCapture). */
          const kachel = v.closest('[data-vg-kachel]');
          if (kachel && fehler && fehler.name === 'NotAllowedError') {
            kachel.dataset.vgAbgelehnt = '';
          }
        });
      }
    };
    const io = new IntersectionObserver(
      (befunde) => {
        for (const e of befunde) {
          const v = e.target.querySelector('video');
          if (!v) continue;
          if (e.isIntersecting) {
            sichtbar.add(v);
            if (!document.hidden) spielen(v);
          } else {
            sichtbar.delete(v);
            v.pause();
          }
        }
      },
      {threshold: 0.2},
    );
    const kachelEls = bahn.querySelectorAll('[data-vg-kachel]');
    kachelEls.forEach((el) => io.observe(el));
    const sichtWechsel = () => {
      sichtbar.forEach((v) => (document.hidden ? v.pause() : spielen(v)));
    };
    document.addEventListener('visibilitychange', sichtWechsel);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', sichtWechsel);
    };
  }, [liste.length]);

  const indexJetzt = useCallback(() => {
    const bahn = bahnRef.current;
    const ks = masse.current.kacheln;
    if (!bahn || !ks.length) return 0;
    const x = bahn.scrollLeft;
    let bester = 0;
    for (let i = 1; i < ks.length; i++) {
      if (Math.abs(ks[i].ziel - x) < Math.abs(ks[bester].ziel - x)) bester = i;
    }
    return bester;
  }, []);

  const fahreZu = useCallback((i) => {
    const bahn = bahnRef.current;
    const ks = masse.current.kacheln;
    if (!bahn || !ks.length) return;
    const ziel = Math.max(0, Math.min(i, ks.length - 1));
    bahn.scrollTo({
      left: ks[ziel].ziel,
      behavior: bewegungReduziert() ? 'auto' : 'smooth',
    });
  }, []);

  /* Pfeile: genau eine Kachel je Klick. Am rechten Rand steht die Bahn schon am
   * Ende, auch wenn die letzte Kachel nicht links anliegt. */
  const schieben = useCallback(
    (richtung) => {
      const bahn = bahnRef.current;
      if (!bahn) return;
      vermessen();
      const max = bahn.scrollWidth - bahn.clientWidth;
      let i = indexJetzt() + richtung;
      const ks = masse.current.kacheln;
      if (richtung < 0 && bahn.scrollLeft >= max - 2) {
        while (i > 0 && ks[i] && ks[i].ziel >= max - 2) i -= 1;
      }
      fahreZu(i);
    },
    [fahreZu, indexJetzt, vermessen],
  );

  /* HÖCHSTENS EINE KACHEL JE WISCH, auch wenn der Finger weiter zieht.
   * scroll-snap-stop hält nur den Schwung nach dem Loslassen an der nächsten
   * Kachel an. Zieht der Finger selbst über mehr als eine Kachel, rastete die
   * Bahn im Test zwei Kacheln weiter ein (350 px Wisch auf 390 px Breite), und
   * ein Zurückführen per scrollTo kämpfte mit dem Schwung des Browsers.
   * Deshalb sind während eines Wischs NUR die aktuelle Kachel und ihre beiden
   * Nachbarn Rastpunkte (data-vg-nah, CSS nimmt den übrigen scroll-snap-align).
   * Der Browser rastet dann selbst und ohne Gegenbewegung höchstens eine Kachel
   * weiter. Steht die Bahn wieder still, gelten alle Rastpunkte wieder.
   * Nur passive Lauscher: das senkrechte Scrollen der Seite bleibt unberührt. */
  useEffect(() => {
    const bahn = bahnRef.current;
    if (!bahn) return undefined;
    let ruhe = 0;
    let gefasst = false;
    const freigeben = () => {
      window.clearTimeout(ruhe);
      gefasst = false;
      delete bahn.dataset.wisch;
      bahn.querySelectorAll('[data-vg-nah]').forEach((el) => {
        delete el.dataset.vgNah;
      });
    };
    const baldFrei = () => {
      window.clearTimeout(ruhe);
      ruhe = window.setTimeout(freigeben, 250);
    };
    const start = (e) => {
      if (e.touches && e.touches.length > 1) return;
      vermessen();
      const ks = masse.current.kacheln;
      if (!ks.length) return;
      window.clearTimeout(ruhe);
      const i0 = indexJetzt();
      ks.forEach((k, i) => {
        if (Math.abs(i - i0) <= 1) k.el.dataset.vgNah = '';
        else delete k.el.dataset.vgNah;
      });
      bahn.dataset.wisch = '';
      gefasst = true;
    };
    const ende = () => {
      if (gefasst) baldFrei();
    };
    const bewegt = () => {
      if (gefasst && !bahn.dataset.ziehtFinger) baldFrei();
    };
    const fingerDran = () => {
      bahn.dataset.ziehtFinger = '1';
    };
    const fingerWeg = () => {
      delete bahn.dataset.ziehtFinger;
      ende();
    };
    bahn.addEventListener('touchstart', start, {passive: true});
    bahn.addEventListener('touchstart', fingerDran, {passive: true});
    bahn.addEventListener('touchend', fingerWeg, {passive: true});
    bahn.addEventListener('touchcancel', fingerWeg, {passive: true});
    bahn.addEventListener('scroll', bewegt, {passive: true});
    bahn.addEventListener('scrollend', ende);
    return () => {
      freigeben();
      bahn.removeEventListener('touchstart', start);
      bahn.removeEventListener('touchstart', fingerDran);
      bahn.removeEventListener('touchend', fingerWeg);
      bahn.removeEventListener('touchcancel', fingerWeg);
      bahn.removeEventListener('scroll', bewegt);
      bahn.removeEventListener('scrollend', ende);
    };
  }, [indexJetzt, vermessen, liste.length]);

  /* Ziehen mit der Maus. Finger und Trackpad scrollen nativ, hier nur pointerType
   * mouse. Wie am Handy höchstens eine Kachel je Geste. */
  const snapWieder = useCallback(() => {
    const bahn = bahnRef.current;
    if (!bahn) return;
    let fertig = false;
    const los = () => {
      if (fertig) return;
      fertig = true;
      bahn.style.scrollSnapType = '';
      bahn.removeEventListener('scrollend', los);
    };
    bahn.addEventListener('scrollend', los);
    window.setTimeout(los, ANKUNFT_MS);
  }, []);

  const onPointerDown = useCallback(
    (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      const bahn = bahnRef.current;
      if (!bahn) return;
      vermessen();
      ziehen.current = {
        id: e.pointerId,
        x0: e.clientX,
        s0: bahn.scrollLeft,
        i0: indexJetzt(),
        aktiv: false,
        punkte: [{t: performance.now(), x: e.clientX}],
      };
    },
    [indexJetzt, vermessen],
  );

  const onPointerMove = useCallback((e) => {
    const z = ziehen.current;
    const bahn = bahnRef.current;
    if (!z || !bahn || e.pointerId !== z.id) return;
    const dx = e.clientX - z.x0;
    if (!z.aktiv) {
      if (Math.abs(dx) < ZIEH_SCHWELLE_PX) return;
      z.aktiv = true;
      bahn.style.scrollSnapType = 'none';
      bahn.dataset.zieht = '1';
      try {
        bahn.setPointerCapture(z.id);
      } catch {
        /* ohne Capture zieht es trotzdem, nur nicht über den Rand hinaus */
      }
    }
    z.punkte.push({t: performance.now(), x: e.clientX});
    if (z.punkte.length > 8) z.punkte.shift();
    bahn.scrollLeft = z.s0 - dx;
    e.preventDefault();
  }, []);

  const ziehenEnde = useCallback(
    (e, abgebrochen) => {
      const z = ziehen.current;
      const bahn = bahnRef.current;
      if (!z || e.pointerId !== z.id) return;
      ziehen.current = null;
      if (!z.aktiv || !bahn) return;
      delete bahn.dataset.zieht;
      klickSperre.current = true;
      window.setTimeout(() => {
        klickSperre.current = false;
      }, 120);
      const dx = e.clientX - z.x0;
      const jetzt = performance.now();
      const frisch = z.punkte.filter((p) => jetzt - p.t <= 100);
      let v = 0;
      if (frisch.length > 1) {
        const a = frisch[0];
        const b = frisch[frisch.length - 1];
        v = b.t > a.t ? (b.x - a.x) / (b.t - a.t) : 0;
      }
      const w = masse.current.kacheln[z.i0]?.w || bahn.clientWidth;
      let schritt = 0;
      if (!abgebrochen) {
        if (dx < -w * WECHSEL_ANTEIL || v < -RUCK_PX_MS) schritt = 1;
        else if (dx > w * WECHSEL_ANTEIL || v > RUCK_PX_MS) schritt = -1;
      }
      fahreZu(z.i0 + schritt);
      snapWieder();
    },
    [fahreZu, snapWieder],
  );

  const onPointerUp = useCallback((e) => ziehenEnde(e, false), [ziehenEnde]);
  const onPointerCancel = useCallback((e) => ziehenEnde(e, true), [ziehenEnde]);

  /* ERSTER TIPP STARTET DAS VIDEO, wenn das Abspielen abgelehnt wurde (Stromsparmodus
   * am iPhone; Hausregel aus dem Handy-Prüfstand, „Annas Video“ 30.10.). Dieser Tipp
   * öffnet Instagram noch nicht, erst der nächste. Gestartet werden alle abgelehnten
   * Videos der Bahn, solange der Tipp als Geste gilt. */
  const onClickCapture = useCallback((e) => {
    if (klickSperre.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    const kachel = e.target.closest && e.target.closest('[data-vg-kachel]');
    if (!kachel || kachel.dataset.vgAbgelehnt === undefined) return;
    if (!e.target.closest('.vg__link')) return;
    e.preventDefault();
    const bahn = bahnRef.current;
    if (!bahn) return;
    bahn.querySelectorAll('[data-vg-abgelehnt]').forEach((k) => {
      const v = k.querySelector('video');
      if (!v) return;
      if (!v.getAttribute('src')) v.setAttribute('src', v.dataset.clip);
      v.muted = true;
      const p = v.play();
      const fertig = () => {
        delete k.dataset.vgAbgelehnt;
      };
      if (p && typeof p.then === 'function') p.then(fertig, () => {});
      else fertig();
    });
  }, []);

  if (!liste.length) return null;

  return (
    <section
      className="vg"
      ref={wurzelRef}
      aria-labelledby={kopf ? kopfId : undefined}
      data-section="video-galerie"
      id={kennung}
    >
      {kopf ? (
        <Kopf className="vg__kopf" id={kopfId} data-eb="">
          {kopf}
        </Kopf>
      ) : null}
      <div className="vg__rahmen">
        <button
          type="button"
          className="vg__pfeil vg__pfeil--links"
          aria-label="Vorherige Kachel"
          onClick={() => schieben(-1)}
          disabled={rand.links}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <ul
          className="vg__bahn vg-slider"
          data-slider="video-galerie"
          data-eb="gruppe"
          ref={bahnRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onClickCapture={onClickCapture}
          onDragStart={(e) => e.preventDefault()}
        >
          {liste.map((k, i) => (
            <li
              className="vg__kachel"
              key={k.code || k.clip}
              data-vg-kachel=""
              data-qb-video-zustand="vorschau"
            >
              <div className="vg__medien" data-vg-medien="">
                {k.poster ? (
                  <img
                    className="vg__bild"
                    src={bildBreite(k.poster, 540)}
                    srcSet={[360, 540, 720]
                      .map((b) => `${bildBreite(k.poster, b)} ${b}w`)
                      .join(', ')}
                    sizes="(min-width: 1280px) 210px, (min-width: 1024px) 22vw, (min-width: 750px) 29vw, (min-width: 600px) 42vw, 80vw"
                    alt={`Standbild aus dem Video von @${k.name}`}
                    width="720"
                    height="1280"
                    loading={i < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                    draggable={false}
                  />
                ) : null}
                <video
                  className="vg__video"
                  data-clip={k.clip}
                  poster={k.poster ? bildBreite(k.poster, 540) : undefined}
                  data-video-ton={k.ton === 'stumm' ? 'stumm' : undefined}
                  muted
                  loop
                  playsInline
                  preload="none"
                  aria-hidden="true"
                  tabIndex={-1}
                  onPlaying={(e) => {
                    e.currentTarget.parentElement.parentElement.dataset.qbVideoZustand = 'spielt';
                  }}
                  onWaiting={(e) => {
                    e.currentTarget.parentElement.parentElement.dataset.qbVideoZustand = 'wartet';
                  }}
                />
              </div>
              <div className="vg__verlauf" aria-hidden="true" />
              <a
                className="vg__link"
                href={k.beitragUrl}
                target="_blank"
                rel="noopener noreferrer"
                draggable={false}
                aria-label={`${k.titel ? `${k.titel}: ` : ''}Beitrag von @${k.name} auf Instagram ansehen`}
              />
              <a
                className="vg__name"
                href={k.profilUrl}
                target="_blank"
                rel="noopener noreferrer"
                draggable={false}
              >
                @{k.name}
              </a>
              {k.titel ? (
                <p className="vg__titel" aria-hidden="true">
                  {k.titel}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="vg__pfeil vg__pfeil--rechts"
          aria-label="Nächste Kachel"
          onClick={() => schieben(1)}
          disabled={rand.rechts}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </section>
  );
}
