import {createContext, useContext, useEffect, useRef, useState} from 'react';
import {Link, useSearchParams} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {TheAlphaKauf} from '~/components/campaign/TheAlphaKauf';
import {kaufZiel, RESERVIERUNG_PARAM} from '~/lib/qi-alpha-reservierung';
import {TapTon, TapFilmTon, videoQuellen} from '~/components/campaign/TheAlphaTon';
import {tapStopper} from '~/components/campaign/the-alpha-stopper';
import {
  THE_ALPHA_KOPF,
  THE_ALPHA_SCHLUSS,
  THE_ALPHA_WOERTERBUCH,
  THE_ALPHA_MARKE,
  QI_ALPHA_LEISTE,
  THE_ALPHA_KAUF_ZIEL,
} from '~/components/campaign/the-alpha-daten';

/*
 * THE ALPHA PREMIUM: die geteilten Bausteine der gestalteten The-Alpha-Seiten
 * (Grossjob 20261026-prio1-the-alpha-variante-a-designmeister-premium-
 * gestaltung). Christian 26.10.2026: „diese Seit ist jetzt 1:1 das was ich
 * gesagt habe, aber das war nicht das Ziel, sondern der Desinger Meister
 * sollte das in eine umwandlen“. Seine Figma-Vorlage gibt Inhalt, Reihenfolge
 * und Aussage vor; die Gestaltung kommt vom Designmeister.
 *
 * LEITIDEE (Nachtrag Z24–Z57): die Seite ist ein Film. „Ich möchte eine
 * Geschichte erzählen und das soll wie ein Movie ausschauen“, „die ganze
 * Seite ist ja oben schwarz … und dann wird es eingeblendet in weißer
 * Schrift“, „Wir wollen hier Drama erzählen“. Darum: alles auf Schwarz,
 * Szene für Szene, vom Scrollen gesteuert, Bilder als Karten mit Etikett
 * (Figma-Ausschnitte christian-szene-1..4).
 *
 * DREHBUCH für A, B und C: Titelkarte „Kohärentes Licht“ → beim Scrollen
 * „- Ultra High Vibe Mode -“ → Wörterbuch (Pulp Fiction) → Video Luca →
 * Manifestation + RAW/DIAMANT → Protection + ENDLESS/POSSIBILITY → Longevity
 * → Seitenansicht mit Etikett → Schluss-Szene „Qi Alpha®“ → Limited 1st.
 * Edition → 111/111 → roter Balken „Jetzt Exklusiv Reservieren“ → Ende der
 * Seite (Christian 27.10., Z258–Z274: „Die Seite muss hier aufhören“). Die Varianten setzen diese
 * Bausteine verschieden zusammen (Bildwahl, Länge, Akzent), die Geschichte
 * bleibt gleich. Ton und Video (Segment s06, TheAlphaTon.jsx): TapSeite
 * bringt „Sound on“, Grundsound und Lautsprecher mit; die Szenen tragen ihren
 * Akzent als [data-tap-ton] (Gong am Titel, Klang am Wörterbuch, „bam“ an den
 * Kapiteln, Glanz an der DIAMANT-Karte, tiefer Schlag an THE ALPHA,
 * Schlussakkord an 111/111). Eine Variante bekommt den Ton, indem sie diese
 * Bausteine benutzt.
 *
 * Texte und Bilder kommen aus the-alpha-daten.js (Christians Wortlaut, EINE
 * Datenstelle). Stil: app/styles/the-alpha-premium.css, alle Regeln hängen an
 * .tap-seite. Ohne JavaScript ist alles sichtbar; Einblendungen und
 * Szenenwechsel schaltet erst useTapFilm() zu (Klasse tap-js an der Wurzel).
 */

/**
 * FASSUNG „SZENE“ (nur Variante A, Christian 28.10.2026, Z10–Z12; Grossjob
 * 20261028-qi-alpha-kopf-99-registered-hochgestellt-ohne-bewertungen-chat-
 * ratenzahlung, s07): „oben ist es ja gut gelöst, wie im Film … es wird erst
 * was Neues angezeigt, wenn man das Alte nicht mehr sehen kann“. TapSeite
 * film="szene" schaltet drei Dinge zu, B und C bleiben wie sie sind:
 * - [data-tap-ein] erscheint erst, wenn die Szene davor ([data-tap-szene],
 *   Reihenfolge im Dokument) mit ihrer Unterkante aus dem Bild ist (bottom
 *   <= 0) UND das Element ganz im Bild ist. Gemessen 29.10. vor dem Umbau:
 *   Karten, Band und Schluss kamen bis zu 430 px zu früh (s07/vorher).
 * - Kapitelzeilen kommen als ganze Zeile, Zeile für Zeile (Z10a), nicht
 *   Wort für Wort.
 * - Die Schluss-Szene ist eine Scroll-Bühne wie oben: „Qi Alpha®“, Limited
 *   1st. Edition, 111/111, Reservierungsknopf, je ein Schritt (Z12).
 * - KEIN SCHWARZ ZWISCHEN DEN BÜHNEN (Christian 30.10.2026, Z3: „die Bereiche,
 *   wo dann komplett schwarz sind, die könnte man noch mal verkürzen … wenn
 *   oben das Letzte, was man sieht, weg ist, dass man dann maximal noch
 *   einmal den Daumen so hoch schiebt“; Job 20261030-update-qi-alpha-seite-
 *   scrollstopper-video-schwarzraum-kuerzen-r2): die Anfangs-Schritte einer
 *   Bühne (data-tap-scrub-start) kommen, sobald die Szene davor aus dem Bild
 *   ist und sie selbst ganz im Bild stehen, nicht erst, wenn die Bühne oben
 *   anstößt. Vorher lag dazwischen ein halber Bildschirm Schwarz (gemessen
 *   390 x 844: 384 px nach dem Titel, 192 px vor „Manifestation“). Der Ton der
 *   Bühne kommt mit dem Bild (Ereignis tap-akzent, TheAlphaTon.jsx). Die
 *   Regel „Neues erst, wenn das Alte weg ist“ bleibt.
 * - SZENEN-KETTE (Christian 31.10.2026: „die Scrollbewegungen sind noch
 *   deutlich zu lang, damit was Neues kommt“; Job 20261031-prio1-qi-alpha-lp-
 *   scrollstrecken-deutlich-kuerzen). Gemessen 390 x 844 vor dem Umbau: 10
 *   Strecken über einen halben Bildschirm ohne Neues (bis 848 px), weil jede
 *   Szene erst ganz aus dem Bild geschoben werden musste, bevor die nächste
 *   kam. Jetzt WEICHT das Alte, statt weggeschoben zu werden: eine Bühne
 *   blendet einen Schritt nach ihrem letzten Schritt aus (tap-aus), einen
 *   halben Schritt später steht die nächste Bühne still (tap-nachruecken: sie liegt
 *   einen Bildschirm hoch unter der vorigen). Karten und Seitenband sind
 *   eigene kurze Bühnen (TapKarten, TapMarke). Das Video bleibt, wie es war
 *   (Start, Scrollstopper): es steht ganz im Bild, wenn die Bühne davor
 *   ausblendet, an derselben Stelle wie vorher (tap-nach-buehne), und weicht, sobald es oben an den
 *   Rand kommt und der Stopper es nicht hält; einen halben Schritt später
 *   steht die nächste Bühne (tap-nach-video). Abstand zwischen zwei Neuen
 *   damit höchstens anderthalb Bild-Schritte (Handy 300 px). Ohne Bewegung und im
 *   Standbild (tap-still) gibt es keine Kette.
 * - NAHTLOS (Christian 31.10.2026: „so gefühlt, wenn das Alte weg ist, dann
 *   kommt direkt das Neue. Das ist das Angenehmste.“; Job 20261031-prio1-qi-
 *   alpha-lp-alt-weg-neu-sofort-nahtlos). Gemessen 390 x 844 nach der Kette:
 *   zwischen „Altes weg“ und „Neues da“ lag an jedem Szenenwechsel noch ein
 *   halber Schritt Schwarz (bis 104 px), und vom letzten Neuen einer Szene bis
 *   zum ersten der nächsten anderthalb Schritte (bis 304 px). Jetzt steht die
 *   nächste Bühne in DEMSELBEN Moment still, in dem die vorige weicht (Bühne
 *   = Bildschirm + Schritte + 1, kein halber Schritt mehr; ebenso nach dem
 *   Video). Ihre Schritte kommen erst, wenn die vorige wirklich weicht
 *   (tap-aus): so liegt nie Neues über dem Alten, auch nicht, solange der
 *   Scrollstopper das Video hält (Desktop). Bild-Takt 160 px für jede
 *   Bildhöhe (keine Weiche nach der Fensterhöhe: die schaltete mit den
 *   Browserleisten um, und die Kaufleiste blinkte): jede Strecke bis zum
 *   nächsten Neuen bleibt am Handy unter einem Viertel Bildschirm.
 * - NIE ÜBEREINANDER (Christian 31.10.2026: „wenn man etwas hin und her scollt
 *   kann man überlappende zustände erzeugen … kürzungen waren gut“; Job
 *   20261031-prio2-qi-alpha-lp-ueberlappung-beheben-scrollstopper-robust).
 *   Gemessen live vorher: das Video blieb nach dem ersten Einblenden stehen,
 *   zurück ins Wörterbuch lagen beide übereinander; Alt und Neu blendeten
 *   gleichzeitig über- und durcheinander; am Desktop stand das Video nur 8 px
 *   allein im Bild und der Stopper hielt über dem Wörterbuch. Jetzt wartet
 *   jede Szene (tap-wartet), solange die davor zu sehen ist, als reine
 *   Funktion der Scrolllage in beide Richtungen; das Alte blendet aus, bevor
 *   das Neue einblendet (CSS); das Video steht auf jeder Bildhöhe einen
 *   Bild-Schritt allein, und der Stopper hält in genau diesem Fenster
 *   (figur.tapFenster, the-alpha-stopper.js). Die Kürzungen bleiben.
 */
const TapFassung = createContext({szene: false});

// Hysterese der Kaufleiste: weg, sobald der Abschluss die kleine
// Bildschirmhöhe erreicht; wieder da erst RUHE_PX darunter.
const RUHE_PX = 48;

/**
 * Schaltet den Film zu (Christian 27.10., Z280–Z295).
 * - [data-tap-ein]: erscheint erst, wenn es GANZ im Bild ist, dann auf einmal
 *   mit kurzem Fade (Z283–Z285: „nicht schon zur Hälfte“). Ist ein Element
 *   höher als der Bildschirm, reicht es, wenn es ihn füllt. Bleibt sichtbar.
 * - [data-tap-scrub]: Bühne, deren Inhalt sich mit dem Scrollen aufbaut
 *   (Z286/Z287, Z294: „die kommen und gehen mit dem Scrollen“). Die Bühne
 *   steht still (sticky), sobald sie den Bildschirm füllt; danach zeigt jeder
 *   Scrollschritt von --tap-schritt Pixeln das nächste [data-tap-schritt]
 *   (Wort, Absatz). Zurückscrollen nimmt sie wieder weg. data-tap-scrub-start
 *   = wie viele Schritte beim Stillstehen schon da sind.
 * - Kaufleiste: sichtbar, sobald die Titelkarte [data-tap-anfang] aus dem
 *   Bild ist, und wieder weg, solange der Abschluss [data-tap-ende] zu sehen
 *   ist (dort steht der große Knopf). Gemessen an Oberkanten gegen die kleine
 *   Bildschirmhöhe (100svh), mit RUHE_PX Hysterese: die Unterkante des
 *   Fensters wandert auf dem iPhone mit den Browserleisten. Bis 30.10. hing
 *   die Leiste an ihr (IntersectionObserver) und blendete sich in Annas
 *   Chrome beim Scrollen ein und aus (Christian 30.10.: „der rote Knopf wird
 *   ein- und ausgeblendet“; Samsung stand ruhig).
 * Bei prefers-reduced-motion steht alles sofort und still da, ebenso mit
 * ?film=still (Standbild: dieselbe Fassung, die ein Kunde mit „Bewegung
 * reduzieren“ sieht; für Prüfer, die nicht scrollen, z. B. das Shop-Tor).
 */
function useTapFilm(wurzel, szene) {
  const [leiste, setLeiste] = useState(false);
  useEffect(() => {
    const el = wurzel.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const beobachter = [];
    const aufraeumen = [];
    const still =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ||
      new URLSearchParams(window.location.search).get('film') === 'still';
    if (still) el.classList.add('tap-still');

    // Eingeblendet bleibt eingeblendet; das Ereignis weckt z. B. das Video.
    const zeige = (z) => {
      z.classList.add('tap-sichtbar');
      z.dispatchEvent(new Event('tap-sichtbar'));
    };

    // Szenen-Fassung: jedes [data-tap-ein] kennt die Szene davor.
    const szenen = szene ? [...el.querySelectorAll('[data-tap-szene]')] : [];
    const inhalt = (s) => {
      if (s.matches('.tap-scrub')) return [...s.querySelectorAll('.tap-scrub-bild > *')];
      if (s.matches('[data-tap-ein]')) return [s];
      return [...s.querySelectorAll('[data-tap-ein]')];
    };
    const unterkante = (s) =>
      inhalt(s).reduce((u, k) => {
        const r = k.getBoundingClientRect();
        return r.height > 0 ? Math.max(u, r.bottom) : u;
      }, -Infinity);
    let offen = szene
      ? [...el.querySelectorAll('[data-tap-ein]')].map((z) => {
          const eigene = szenen.findIndex((s) => s === z || s.contains(z));
          return {z, vor: eigene > 0 ? szenen[eigene - 1] : null};
        })
      : [];
    // Szenen-Kette (Kopfkommentar): wer an wen anschließt.
    const kette = szene && !still;
    const stufe = (x) => x.matches('[data-tap-scrub]');
    const filmNachBuehne = [];
    // Video in der Kette: Bühne davor, Bühne danach (Fenster des Stoppers).
    const filme = [];
    if (kette) {
      el.classList.add('tap-kette');
      szenen.forEach((s, i) => {
        const vor = szenen[i - 1];
        if (!vor) return;
        if (stufe(s) && stufe(vor)) s.classList.add('tap-nachruecken');
        else if (!stufe(s) && stufe(vor)) {
          s.classList.add('tap-nach-buehne');
          filmNachBuehne.push(s);
          const nach = szenen[i + 1] && stufe(szenen[i + 1]) ? szenen[i + 1] : null;
          filme.push({f: s, vor, nach, video: s.querySelector('video')});
        } else if (stufe(s) && !stufe(vor)) s.classList.add('tap-nach-video');
      });
      aufraeumen.push(() => {
        el.classList.remove('tap-kette');
        szenen.forEach((s) =>
          s.classList.remove('tap-nachruecken', 'tap-nach-buehne', 'tap-nach-video', 'tap-aus', 'tap-wartet'),
        );
        filme.forEach(({f}) => delete f.tapFenster);
      });
    }
    const pruefeEin = () => {
      if (!offen.length) return;
      const bild = window.innerHeight;
      offen = offen.filter(({z, vor}) => {
        const r = z.getBoundingClientRect();
        const drin = Math.min(r.bottom, bild) - Math.max(r.top, 0);
        const ganz = drin >= r.height * 0.98 || drin >= bild * 0.92;
        const frei = !vor || vor.classList.contains('tap-aus') || unterkante(vor) <= 0;
        if (still || (frei && (ganz || r.top < 0))) {
          zeige(z);
          return false;
        }
        return true;
      });
    };

    if (!szene) {
      const ein = new IntersectionObserver(
        (eintraege) => {
          for (const e of eintraege) {
            const bild = e.rootBounds?.height || window.innerHeight;
            const ganz = e.intersectionRatio >= 0.98 || e.intersectionRect.height >= bild * 0.92;
            if (still || (e.isIntersecting && ganz)) {
              zeige(e.target);
              ein.unobserve(e.target);
            }
          }
        },
        {threshold: [0, 0.25, 0.5, 0.75, 0.9, 0.98, 1]},
      );
      el.querySelectorAll('[data-tap-ein]').forEach((z) => ein.observe(z));
      beobachter.push(ein);
    }

    const buehnen = [...el.querySelectorAll('[data-tap-scrub]')].map((b) => {
      const eigene = szenen.indexOf(b);
      return {
        b,
        schritte: [...b.querySelectorAll('[data-tap-schritt]')],
        start: Number(b.dataset.tapScrubStart || 0),
        px: 48,
        an: -1,
        // Schritte nach den Anfangs-Schritten (inkl. Ruhe), wie --tap-schritte.
        zahl: Number(b.style.getPropertyValue('--tap-schritte')) || 0,
        aus: false,
        ende: b.hasAttribute('data-tap-ende'),
        vor: eigene > 0 ? szenen[eigene - 1] : null,
        ton: b.querySelector(':scope > .tap-buehne-marke[data-tap-ton]'),
      };
    });
    // Szenen-Fassung: die Anfangs-Schritte stehen schon vor dem Stillstand,
    // sobald die Szene davor weg ist und sie ganz im Bild sind (Kopfkommentar
    // „Kein Schwarz zwischen den Bühnen“).
    const frueh = (s) => {
      // In der Kette steht die Bühne von selbst still, wenn die vorige weicht.
      if (kette || !szene || !s.start || !s.vor || unterkante(s.vor) > 0) return false;
      const bild = window.innerHeight;
      return s.schritte.slice(0, s.start).every((w) => {
        const r = w.getBoundingClientRect();
        return r.height > 0 && r.top >= 0 && r.bottom <= bild;
      });
    };
    const masse = () => {
      for (const s of buehnen) {
        s.px = parseFloat(getComputedStyle(s.b).getPropertyValue('--tap-schritt')) || 48;
      }
      // Höhe des Videos für tap-nach-buehne / tap-nach-video (CSS).
      if (filmNachBuehne[0]) {
        el.style.setProperty('--tap-video-hoehe', `${filmNachBuehne[0].offsetHeight}px`);
      }
    };
    const zeichnen = () => {
      const bild = window.innerHeight;
      // 1. Bühnen weichen nach ihrer Lage: einen Schritt nach dem letzten
      // (Ruhe eingerechnet); die letzte Bühne (Schluss mit Knopf) bleibt.
      // Toleranz 1 px wie beim Stillstand (oben <= 1).
      for (const s of buehnen) {
        s.oben = s.b.getBoundingClientRect().top;
        if (kette && !s.ende) {
          const aus = s.oben <= 1 && Math.floor((1 - s.oben) / s.px) >= s.zahl + 1;
          if (aus !== s.aus) {
            s.b.classList.toggle('tap-aus', aus);
            s.aus = aus;
          }
        }
      }
      // 2. Das Video weicht, sobald die Bühne danach steht (CSS legt sie einen
      // Bild-Schritt hinter sein Erscheinen) und der Stopper es nicht hält.
      for (const {f, nach} of filme) {
        const steht = nach
          ? nach.getBoundingClientRect().top <= 1
          : f.getBoundingClientRect().top < bild * 0.1;
        f.classList.toggle(
          'tap-aus',
          f.classList.contains('tap-sichtbar') && steht && f.dataset.tapStopperStand !== 'hält',
        );
      }
      // 3. Jede Szene wartet, solange die davor noch zu sehen ist. Eine reine
      // Funktion der Lage: auch nach Hin und Her bleibt nichts übereinander.
      if (kette) {
        for (let i = 1; i < szenen.length; i += 1) {
          const vor = szenen[i - 1];
          szenen[i].classList.toggle(
            'tap-wartet',
            !vor.classList.contains('tap-aus') && unterkante(vor) > 0,
          );
        }
        for (const {f, video} of filme) {
          const wartet = f.classList.contains('tap-wartet');
          if (wartet === Boolean(f.dataset.tapWartete)) continue;
          if (wartet) {
            f.dataset.tapWartete = '1';
            if (video && !video.paused) video.pause();
          } else {
            delete f.dataset.tapWartete;
            // weckt das Video wieder (TheAlphaTon.jsx binde_videos)
            if (f.classList.contains('tap-sichtbar')) f.dispatchEvent(new Event('tap-sichtbar'));
          }
        }
      }
      // 4. Schritte der Bühnen.
      for (const s of buehnen) {
        const oben = s.oben;
        const vorab = !still && oben > 1 && oben < bild && frueh(s);
        // Gleiche 1-px-Toleranz wie beim Weichen: steht die Bühne, steht auch
        // ihr erster Schritt (sonst ein Pixel Schwarz zwischen Alt und Neu).
        let n = still
          ? s.schritte.length
          : oben > 1
            ? vorab
              ? s.start
              : 0
            : Math.min(s.schritte.length, s.start + Math.floor((1 - oben) / s.px));
        // Kette: Neues erst, wenn das Alte weicht oder aus dem Bild ist; hält
        // der Stopper das Video, wartet die Bühne.
        if (kette && n > 0 && s.b.classList.contains('tap-wartet')) n = 0;
        if (n === s.an) continue;
        s.schritte.forEach((w, i) => w.classList.toggle('tap-an', i < n));
        if (vorab && s.an <= 0 && s.ton) s.ton.dispatchEvent(new Event('tap-akzent'));
        s.an = n;
      }
    };
    // Fenster des Videos für den Scrollstopper (the-alpha-stopper.js), in
    // Scroll-Pixeln: von = die Bühne davor weicht, bis = die Bühne danach steht.
    for (const film of filme) {
      const vor = buehnen.find((s) => s.b === film.vor);
      const nach = film.nach;
      if (!vor || !nach) continue;
      film.f.tapFenster = () => {
        const y = window.scrollY;
        const von = Math.ceil(y + vor.b.getBoundingClientRect().top - 1 + (vor.zahl + 1) * vor.px);
        const bis = Math.floor(y + nach.getBoundingClientRect().top - 1);
        return {von, bis};
      };
    }
    let angefordert = false;
    const anfordern = () => {
      if (angefordert) return;
      angefordert = true;
      window.requestAnimationFrame(() => {
        angefordert = false;
        zeichnen();
        pruefeEin();
      });
    };
    const neu = () => {
      masse();
      anfordern();
    };
    masse();
    zeichnen();
    pruefeEin();
    if (!still && (buehnen.length || offen.length)) {
      window.addEventListener('scroll', anfordern, {passive: true});
      window.addEventListener('resize', neu);
      aufraeumen.push(() => {
        window.removeEventListener('scroll', anfordern);
        window.removeEventListener('resize', neu);
      });
    }
    // Die Höhe des Videos samt Text steht erst, wenn Schrift und Bild da sind.
    if (filmNachBuehne[0] && typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(neu);
      ro.observe(filmNachBuehne[0]);
      beobachter.push(ro);
    }

    // Kaufleiste (Kopfkommentar): Oberkanten gegen 100svh, nie gegen die
    // wandernde Unterkante des Fensters.
    const anfang = el.querySelector('[data-tap-anfang]');
    const ende = el.querySelector('[data-tap-ende]');
    const mass = document.createElement('div');
    mass.setAttribute('aria-hidden', 'true');
    mass.style.cssText =
      'position:fixed;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none';
    document.body.appendChild(mass);
    let kleinesBild = window.innerHeight;
    const messeBild = () => {
      kleinesBild = mass.getBoundingClientRect().height || window.innerHeight;
    };
    let leisteAn = false;
    let leisteAngefordert = false;
    const leisteRechnen = () => {
      leisteAngefordert = false;
      const weg = !anfang || anfang.getBoundingClientRect().bottom <= 0;
      // In der Kette liegt die Schluss-Bühne einen Bildschirm hoch unter dem
      // Band; ihr Bild beginnt erst, wenn sie oben anstößt.
      const versatz = ende?.classList.contains('tap-nachruecken') ? kleinesBild : 0;
      const oben = ende ? ende.getBoundingClientRect().top + versatz : Infinity;
      const an = weg && oben >= kleinesBild + (leisteAn ? 0 : RUHE_PX);
      if (an !== leisteAn) {
        leisteAn = an;
        setLeiste(an);
      }
    };
    const leisteTakt = () => {
      if (leisteAngefordert) return;
      leisteAngefordert = true;
      window.requestAnimationFrame(leisteRechnen);
    };
    const leisteNeu = () => {
      messeBild();
      leisteTakt();
    };
    messeBild();
    leisteRechnen();
    window.addEventListener('scroll', leisteTakt, {passive: true});
    window.addEventListener('resize', leisteNeu);
    aufraeumen.push(() => {
      window.removeEventListener('scroll', leisteTakt);
      window.removeEventListener('resize', leisteNeu);
      mass.remove();
    });

    el.classList.add('tap-js');
    return () => {
      beobachter.forEach((b) => b.disconnect());
      aufraeumen.forEach((f) => f());
    };
  }, [wurzel, szene]);
  return leiste;
}

/** Zerlegt einen Satz in Wörter für die Scroll-Bühne. Ein allein stehender
 * Strich hängt am Nachbarwort („- Ultra“, „Mode -“), damit kein Schritt nur
 * aus einem Strich besteht. */
export function tapWorte(text) {
  const roh = String(text).split(/\s+/).filter(Boolean);
  const worte = [];
  for (let i = 0; i < roh.length; i += 1) {
    if (roh[i] === '-' && i + 1 < roh.length && worte.length === 0) {
      roh[i + 1] = `- ${roh[i + 1]}`;
    } else if (roh[i] === '-' && worte.length) {
      worte[worte.length - 1] += ' -';
    } else {
      worte.push(roh[i]);
    }
  }
  return worte;
}

function Worte({text}) {
  return tapWorte(text).map((w, i) => (
    // eslint-disable-next-line react/no-array-index-key
    <span className="tap-wort" data-tap-schritt="" key={`${w}-${i}`}>
      {w}{' '}
    </span>
  ));
}

/** „Qi Alpha®“ mit hochgestelltem Zeichen (Titel-Typo). */
function MarkenName({marke}) {
  const [name, ...rest] = String(marke).split('®');
  if (!rest.length) return marke;
  return (
    <>
      {name}
      <sup className="tap-reg">®</sup>
    </>
  );
}

/** Wurzel jeder gestalteten The-Alpha-Seite, mit der dezenten Kaufleiste
 * (Z40: „Wer nicht scrollen will, findet den Kaufknopf“). Die Leiste sitzt
 * oben wie die Produktleiste auf Apple-Seiten: ein schmaler dunkler Streifen,
 * links der Name, rechts der Knopf; unten läge sie auf Bildern und Etiketten
 * (Challenger 26.10., Runde 4). */
/* `film="szene"`: Fassung „wie im Film“ (TapFassung oben). `ton="an"`: Ton
 * ist Standard, kein „Sound on“-Fenster, Schalter rechts unten (Christian
 * 28.10., Z6; TheAlphaTon.jsx). Beides nur für A; B und C behalten ihren
 * Stand vom 27.10. */
export function TapSeite({
  children,
  variante = 'a',
  kaufText = THE_ALPHA_SCHLUSS.knopf,
  film = 'standard',
  ton = 'fenster',
}) {
  const wurzel = useRef(null);
  const szene = film === 'szene';
  const leiste = useTapFilm(wurzel, szene);
  // Persönlicher Link (?reservierung=…): auch die Leiste führt in den
  // Premium-Bereich, wie der rote Knopf (TheAlphaKauf, kaufZiel).
  const [such] = useSearchParams();
  const kaufWohin = kaufZiel(THE_ALPHA_KAUF_ZIEL, such.get(RESERVIERUNG_PARAM));
  return (
    <div
      className="tap-seite"
      data-the-alpha-premium={variante}
      data-tap-fassung={szene ? 'szene' : undefined}
      data-tap-ton-standard={ton === 'an' ? 'an' : undefined}
      ref={wurzel}
    >
      <TapFassung.Provider value={{szene}}>{children}</TapFassung.Provider>
      <TapTon wurzel={wurzel} standard={ton === 'an' ? 'an' : 'fenster'} />
      <div className={`tap-leiste${leiste ? ' tap-leiste-an' : ''}`} aria-hidden={!leiste}>
        <span className="tap-leiste-marke">
          <MarkenName marke={QI_ALPHA_LEISTE} />
        </span>
        <Link
          className="tap-leiste-knopf"
          to={kaufWohin}
          prefetch="intent"
          tabIndex={leiste ? undefined : -1}
        >
          {kaufText}
        </Link>
      </div>
    </div>
  );
}

function Bild({bild, sizes, className, loading = 'lazy'}) {
  return (
    <Image
      className={className}
      data={{url: bild.url, altText: bild.alt, width: bild.width, height: bild.height}}
      sizes={sizes}
      loading={loading}
    />
  );
}

/** Szene 1 und 2: Titelkarte auf Schwarz. „Kohärentes Licht“ blendet beim
 * Laden ein und bleibt stehen; mit dem Scrollen baut sich darunter
 * „- Ultra High Vibe Mode -“ Wort für Wort auf (Z53, Z286/Z294).
 * Szenen-Fassung (A, Christian 29.10.2026: „zeile für zeile aufbauen nicht
 * wort für wort“): die Unterzeile kommt als ganze Zeile, ein Schritt. */
export function TapTitelkarte({titel = THE_ALPHA_KOPF.titel, untertitel = THE_ALPHA_KOPF.untertitel}) {
  const {szene: zeilenweise} = useContext(TapFassung);
  const worte = zeilenweise ? 1 : tapWorte(untertitel).length;
  return (
    <section
      className={`tap-titelkarte tap-scrub${zeilenweise ? ' tap-scrub-zeilen' : ''}`}
      data-tap-anfang=""
      data-tap-szene=""
      data-tap-scrub=""
      style={{'--tap-schritte': worte}}
    >
      <div className="tap-scrub-bild">
        <h1 className="tap-hero-titel" data-tap-ton="gong">
          <span className="tap-hero-zeile">{titel}</span>
          <span className="tap-hero-unter">
            {zeilenweise ? (
              <span className="tap-zeile" data-tap-schritt="">
                {untertitel}
              </span>
            ) : (
              <Worte text={untertitel} />
            )}
          </span>
        </h1>
      </div>
    </section>
  );
}

/** Szene 3: die Definition als Wörterbuch-Eintrag wie im Vorspann von Pulp
 * Fiction (cremeweiße Serifenschrift auf Schwarz, Quelle unten rechts).
 * Christian 27.10. (Z288/Z289, Z296–Z298): zuerst der Begriff, darunter die
 * Aussprache; beim Scrollen Punkt 1 als eigener Absatz, dann Punkt 2 mit
 * sichtbarem Abstand, dann die Quelle. Wichtige Wörter fett wie im Original. */
export function TapWoerterbuch({eintrag = THE_ALPHA_WOERTERBUCH}) {
  const teile = (b) =>
    (Array.isArray(b) ? b : [{text: b}]).map((t, i) =>
      // eslint-disable-next-line react/no-array-index-key
      t.fett ? <b key={i}>{t.text}</b> : <span key={i}>{t.text}</span>,
    );
  return (
    <section
      className="tap-woerterbuch tap-scrub"
      aria-label={eintrag.lemma}
      data-tap-szene=""
      data-tap-scrub=""
      data-tap-scrub-start="1"
      style={{'--tap-schritte': eintrag.bedeutungen.length + 1}}
    >
      <div className="tap-wb-bild tap-scrub-bild">
        <div className="tap-wb-blatt">
          <p className="tap-wb-kopf" data-tap-schritt="">
            <b className="tap-wb-lemma">{eintrag.lemma}</b>
            <span className="tap-wb-laut">
              {eintrag.laut} <i>{eintrag.wortart}</i>
            </span>
          </p>
          {eintrag.bedeutungen.map((b, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <p className="tap-wb-punkt" data-tap-schritt="" key={i}>
              <b>{i + 1}.</b> {teile(b)}
            </p>
          ))}
          <p className="tap-wb-quelle" data-tap-schritt="">
            {eintrag.quelle}
          </p>
        </div>
      </div>
      <span className="tap-buehne-marke" data-tap-marke="" data-tap-ton="klang" aria-hidden="true" />
    </section>
  );
}

/** Vollflächen-Bild auf Schwarz, randlos. */
export function TapVollbild({bild, format = 'hoch', loading = 'lazy'}) {
  return (
    <figure className={`tap-vollbild tap-format-${format}`} data-tap-ein="" data-tap-szene="">
      <Bild bild={bild} sizes="100vw" loading={loading} />
    </figure>
  );
}

/** Lucas Video. Solange es fehlt: das ruhige Standbild, nie ein schwarzes
 * Viereck. Mit Video: Poster nach dem Titel, Vorladen in Stufen, Abspielen beim
 * Erreichen der Szene, Pause beim Wegscrollen, inline (TheAlphaTon.jsx).
 * Felder in the-alpha-daten.js THE_ALPHA_VIDEO.video: src (MP4, Pflicht),
 * poster, optional hls (sonst aus der Shopify-CDN-Adresse abgeleitet),
 * untertitel (WebVTT, gezeigt solange der Video-Ton nicht zu hören ist),
 * ton (true/false; fehlt es, misst der Browser, ob Ton drin ist) und klein
 * (kleine MP4: am iPhone vorgeladen, ohne Poster, Standbild nur als Notfall;
 * the-alpha-video-ios.js, Christian 01.11.2026).
 *
 * TEXT UNTER DEM VIDEO (`film.texte`, nur A; Christian 29.10.2026: „der text
 * ist immer noch im Video zu sehen anstatt darunter“): die Sätze stehen als
 * echter, großer Text unter dem Bild, im Takt der Videozeit. Es steht immer
 * höchstens ein Satz da; der nächste kommt erst, wenn der vorige weg ist.
 * Alle Sätze liegen übereinander in einer Zelle, so springt nichts. Ohne
 * Bewegung (prefers-reduced-motion, ?film=still) und ohne JavaScript stehen
 * alle untereinander.
 *
 * `stopper`: einmal je Besuch hält die Seite an, wenn das laufende Video
 * mittig steht, bis 3 s Video gelaufen sind (the-alpha-stopper.js). */
export function TapFilm({film, stopper = false}) {
  const {video, videoStandbild, texte} = film;
  const filmRef = useRef(null);
  const figurRef = useRef(null);
  // Scrollstopper (nur wo bestellt, A: Christian 30.10., Z4/Z5):
  // the-alpha-stopper.js.
  useEffect(() => {
    if (!stopper) return undefined;
    return tapStopper(figurRef.current, filmRef.current, window);
  }, [stopper]);
  const [aktiv, setAktiv] = useState(-1);
  const mitTexten = Boolean(video?.src && texte?.length);
  useEffect(() => {
    const v = filmRef.current;
    if (!v || !mitTexten) return undefined;
    const takt = () => {
      const t = v.currentTime;
      setAktiv(texte.findIndex((s) => t >= s.von && t < s.bis));
    };
    const ereignisse = ['timeupdate', 'seeked', 'playing', 'pause', 'emptied'];
    ereignisse.forEach((e) => v.addEventListener(e, takt));
    takt();
    return () => ereignisse.forEach((e) => v.removeEventListener(e, takt));
  }, [mitTexten, texte]);
  if (video?.src) {
    const tonFeld = video.ton === true ? 'ja' : video.ton === false ? 'nein' : undefined;
    return (
      <figure
        ref={figurRef}
        className={`tap-vollbild tap-format-hoch tap-film${mitTexten ? ' tap-film-mit-text' : ''}`}
        data-tap-ein=""
        data-tap-film=""
        data-tap-szene=""
        data-tap-stopper={stopper ? '' : undefined}
      >
        <div className="tap-film-bild">
          <video
            ref={filmRef}
            data-tap-video=""
            data-tap-video-ton={tonFeld}
            data-tap-poster={video.poster || videoStandbild.url}
            data-tap-klein={video.klein}
            muted
            loop
            playsInline
            preload="none"
            aria-label={videoStandbild.alt}
          >
            {videoQuellen(video).map((q) => (
              <source key={q.src} src={q.src} type={q.type} />
            ))}
            {video.untertitel ? (
              <track kind="captions" src={video.untertitel} srcLang="de" label="Deutsch" default />
            ) : null}
          </video>
          <TapFilmTon />
        </div>
        {mitTexten ? (
          <figcaption className="tap-film-texte">
            {texte.map((s, i) => (
              <p
                key={s.text}
                className={`tap-film-text${i === aktiv ? ' tap-film-text-an' : ''}`}
                data-tap-film-text=""
              >
                <MarkeImText text={s.text} />
              </p>
            ))}
          </figcaption>
        ) : null}
      </figure>
    );
  }
  return <TapVollbild bild={videoStandbild} />;
}

/** Fließtext mit „®“ an beliebiger Stelle: jedes Zeichen hochgestellt
 * (MarkenName kennt nur das ® am Ende). */
function MarkeImText({text}) {
  const teile = String(text).split('®');
  return teile.map((t, i) => (
    // eslint-disable-next-line react/no-array-index-key
    <span key={i}>
      {t}
      {i < teile.length - 1 ? <sup className="tap-reg">®</sup> : null}
    </span>
  ));
}

/** Ein Kapitel: die Bühne steht still, sobald sie den Bildschirm füllt; die
 * englische Überschrift kommt mit Wucht („bam, bam, bam“), danach bauen sich
 * Christians drei Zeilen Wort für Wort mit dem Scrollen auf (Z294). Die
 * Karten folgen unter der Bühne. Der „bam“-Ton hängt an einer Marke, die
 * genau beim Stillstehen der Bühne auslöst. */
export function TapKapitel({abschnitt, akzent = null, children}) {
  // Szenen-Fassung (Z10a): jede Zeile ist EIN Schritt, als Ganzes.
  const {szene: zeilenweise} = useContext(TapFassung);
  const worte =
    (zeilenweise
      ? abschnitt.zeilen.length
      : abschnitt.zeilen.reduce((n, z) => n + tapWorte(z).length, 0)) + (akzent ? 1 : 0);
  return (
    <section
      className="tap-kapitel"
      id={abschnitt.id}
      aria-labelledby={`${abschnitt.id}-titel`}
    >
      <div
        className={`tap-kapitel-buehne tap-scrub${zeilenweise ? ' tap-scrub-zeilen' : ''}`}
        data-tap-szene=""
        data-tap-scrub=""
        data-tap-scrub-start="1"
        style={{'--tap-schritte': worte}}
      >
        <div className="tap-scrub-bild">
          <h2 className="tap-h2 tap-bam" id={`${abschnitt.id}-titel`} data-tap-schritt="">
            {abschnitt.titel}
          </h2>
          <ul className="tap-zeilen">
            {abschnitt.zeilen.map((z) =>
              zeilenweise ? (
                <li key={z} className="tap-zeile" data-tap-schritt="">
                  {z}
                </li>
              ) : (
                <li key={z}>
                  <Worte text={z} />
                </li>
              ),
            )}
          </ul>
          {akzent ? (
            <p className="tap-akzent" data-tap-schritt="">
              {akzent}
            </p>
          ) : null}
        </div>
        <span className="tap-buehne-marke" data-tap-marke="" data-tap-ton="bam" aria-hidden="true" />
      </div>
      {children}
    </section>
  );
}

/** Bildkarte mit schwarzem Etikett unten mittig (Figma-Stil). Die
 * DIAMANT-Karte klingt beim Erscheinen (Glanz-Ton, RAW → DIAMANT).
 * `schritt`: Karte ist ein Schritt einer Bühne (Szenen-Kette); ihren Ton
 * trägt dann eine Bühnen-Marke (TapKarten). */
const istGlanz = (bild) => /diamant/i.test(bild.etikett || '');

function Karte({bild, sizes, folge = 0, format = 'quadrat', schritt = false}) {
  const glanz = !schritt && istGlanz(bild);
  return (
    <figure
      className={`tap-karte tap-karte-${format}`}
      data-tap-ein={schritt ? undefined : ''}
      data-tap-schritt={schritt ? '' : undefined}
      data-tap-ton={glanz ? 'glanz' : undefined}
      data-tap-ton-verzug={glanz ? folge * 180 : undefined}
      style={{'--tap-folge': folge}}
    >
      <Bild bild={bild} sizes={sizes} />
      {bild.etikett ? (
        <figcaption className="tap-etikett">
          <MarkenName marke={bild.etikett} />
        </figcaption>
      ) : null}
    </figure>
  );
}

/** Zwei Karten: am Handy untereinander, ab 768 px nebeneinander; die zweite
 * kommt nach der ersten (RAW → DIAMANT, ENDLESS → POSSIBILITY).
 * Szenen-Fassung (Kette, 31.10.2026): die Karten sind eine eigene Bühne, die
 * erste steht mit dem Stillstand da, die zweite einen Schritt später, einen
 * Schritt danach weicht die Bühne; der Glanz-Ton hängt an einer Marke auf
 * Höhe ihres Schritts. */
export function TapKarten({bilder}) {
  const {szene} = useContext(TapFassung);
  if (szene) {
    return (
      <div
        className="tap-karten-buehne tap-scrub tap-scrub-bilder"
        data-tap-szene=""
        data-tap-scrub=""
        data-tap-scrub-start="1"
        style={{'--tap-schritte': bilder.length - 1}}
      >
        <div className="tap-scrub-bild">
          <div className="tap-karten">
            {bilder.map((b) => (
              <Karte key={b.url} bild={b} schritt sizes="(min-width: 768px) 560px, 90vw" />
            ))}
          </div>
        </div>
        {bilder.map((b, i) =>
          istGlanz(b) ? (
            <span
              key={`ton-${b.url}`}
              className="tap-buehne-marke"
              data-tap-marke=""
              data-tap-ton="glanz"
              aria-hidden="true"
              style={{top: `calc(55svh + ${i} * var(--tap-schritt))`}}
            />
          ) : null,
        )}
      </div>
    );
  }
  return (
    <div className="tap-karten" data-tap-szene="">
      {bilder.map((b, i) => (
        <Karte key={b.url} bild={b} folge={i * 3} sizes="(min-width: 768px) 560px, 90vw" />
      ))}
    </div>
  );
}

/** Seitenansicht als breite Karte mit Etikett. Der Name selbst steht seit
 * 27.10. in der Schluss-Szene (TapEdition), nicht mehr auf einem eigenen
 * Bildschirm (Z270–Z272). `etikett`: Text im schwarzen Kästchen, sonst der
 * Name (A trägt seit 28.10. „THE ALPHA“, Christian Z11). */
export function TapMarke({bild, marke = THE_ALPHA_MARKE, etikett = marke}) {
  const {szene} = useContext(TapFassung);
  if (szene) {
    // Kette (31.10.2026): das Band ist eine kurze Bühne, einen Schritt lang.
    return (
      <section className="tap-marke" aria-label={etikett}>
        <div
          className="tap-marke-buehne tap-scrub tap-scrub-bilder"
          data-tap-szene=""
          data-tap-scrub=""
          data-tap-scrub-start="1"
          style={{'--tap-schritte': 0}}
        >
          <div className="tap-scrub-bild">
            <div className="tap-band">
              <Karte
                bild={{...bild, etikett}}
                format="band"
                schritt
                sizes="(min-width: 1200px) 1152px, 100vw"
              />
            </div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="tap-marke" aria-label={etikett} data-tap-szene="">
      <div className="tap-band">
        <Karte bild={{...bild, etikett}} format="band" sizes="(min-width: 1200px) 1152px, 100vw" />
      </div>
    </section>
  );
}

/** Schluss-Szene, der letzte Bildschirm (Christians Skizze 27.10., Z268–Z274):
 * „Qi Alpha®“ groß in der Titel-Typo, Limited 1st. Edition, 111/111, der rote
 * Balken. Danach ist die Seite zu Ende (Z258–Z263). `children` (Preis und
 * ruhige Zeilen einer Variante) stehen zwischen 111/111 und dem Knopf. */
export function TapEdition({schluss = THE_ALPHA_SCHLUSS, marke = THE_ALPHA_MARKE, children}) {
  const {szene} = useContext(TapFassung);
  if (szene) {
    // Szenen-Fassung (Z12): eine Bühne wie oben. Sie steht still, sobald das
    // Band darüber aus dem Bild ist; dann je Scrollschritt eine Zeile, zuletzt
    // der Knopf, ein Schritt Ruhe, Ende der Seite. Die Töne hängen an Marken,
    // die mit „Qi Alpha®“ bzw. 111/111 auslösen.
    return (
      <section
        className="tap-edition tap-edition-szene tap-scrub tap-scrub-zeilen"
        aria-label={schluss.edition}
        data-tap-ende=""
        data-tap-szene=""
        data-tap-scrub=""
        data-tap-scrub-start="1"
        style={{'--tap-schritte': 3}}
      >
        <div className="tap-scrub-bild">
          <p className="tap-marke-name" data-tap-schritt="">
            <MarkenName marke={marke} />
          </p>
          <p className="tap-edition-titel" data-tap-schritt="">
            {schluss.edition}
          </p>
          <p className="tap-zahl" data-tap-schritt="">
            {schluss.auflage}
          </p>
          <div className="tap-schluss-knopf" data-tap-schritt="">
            <TheAlphaKauf className="tap-kauf" knopfText={schluss.knopf} />
          </div>
        </div>
        <span className="tap-buehne-marke" data-tap-marke="" data-tap-ton="tief" aria-hidden="true" />
        <span
          className="tap-buehne-marke tap-marke-schluss"
          data-tap-marke=""
          data-tap-ton="schluss"
          aria-hidden="true"
        />
      </section>
    );
  }
  return (
    <section className="tap-edition" aria-label={schluss.edition} data-tap-ende="">
      <p className="tap-marke-name" data-tap-ein="" data-tap-ton="tief">
        <MarkenName marke={marke} />
      </p>
      <p className="tap-edition-titel" data-tap-ein="" style={{'--tap-folge': 1}}>
        {schluss.edition}
      </p>
      <p
        className="tap-zahl"
        data-tap-ein=""
        data-tap-ton="schluss"
        data-tap-ton-verzug={360}
        style={{'--tap-folge': 2}}
      >
        {schluss.auflage}
      </p>
      {children}
      <div data-tap-ein="" style={{'--tap-folge': 3}}>
        <TheAlphaKauf className="tap-kauf" knopfText={schluss.knopf} />
      </div>
    </section>
  );
}

export default TapSeite;
