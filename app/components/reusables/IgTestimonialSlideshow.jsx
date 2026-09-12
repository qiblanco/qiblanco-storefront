import {useEffect, useId, useMemo, useRef, useState} from 'react';
import {useDragSwipe} from './useDragSwipe';
import {IG_TESTIMONIALS} from '~/data/ig-testimonials';

/*
 * IgTestimonialSlideshow — die Instagram-Stimmen eines Produkts als
 * horizontale Bahn (Job 20260911-GROSSJOB-ig-testimonial-slideshow-…, s03).
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ DAS FASSADEN-REGIME — und warum es hier NICHT neu erfunden wird          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Christian am 2026-09-11 über die YouTube-Einbettungen: „wenn man auf Play
 * drückt, verschwindet zuerst alles Sichtbare, dann kommt was Schwarzes, und
 * dann wird das Video geladen. Das war nicht die Idee hinter Fast Loading."
 *
 * Der Zwillingsjob 20260911-BAU-videoumschaltung hat das für YouTube gelöst
 * (Commit 1dc1c3a, Bauform von lite-youtube-embed): die Vorschau wird beim
 * Play NICHT entfernt, sie bleibt als unterste Schicht liegen, der Player legt
 * sich darüber und wird erst eingeblendet, wenn er zeigt. GEOMETRIE gehört der
 * Komponente, AUSSEHEN dem Seiten-CSS.
 *
 * Diese Komponente übernimmt genau dieses Regime — KEIN zweites. Der Grund ist
 * derselbe, aus dem der Zwillingsjob überhaupt nötig war: „fünf Einbettungen
 * mit fünf Verhaltensweisen" ist der Zustand, der repariert wurde. Eine sechste
 * wäre der Rückfall.
 *
 * EIN UNTERSCHIED, UND ER IST GEMESSEN, NICHT ÜBERSEHEN: die YouTube-Fassade
 * kennt DREI Auslöser zum Umblenden — (1) der Player MELDET „spielt"
 * (postMessage, playerState 1), (2) onLoad + Gnadenfrist, (3) harte Frist.
 * Auslöser 1 gibt es hier NICHT: die Instagram-Einbettung hat kein
 * postMessage-Protokoll, das einen Abspielzustand meldet. Es bleiben (2) und
 * (3) — also genau die beiden, die im YouTube-Bau als Rückfallebene gebaut
 * wurden. Das ist eine ABWEICHUNG, keine Nachlässigkeit: sie steht hier, damit
 * niemand später die fehlende Meldung für einen Defekt hält und einen
 * Handshake sucht, den es nicht gibt.
 *
 * DIE FEHLERRICHTUNG IST DIESELBE WIE DORT: bliebe die Vorschau liegen, WEIL
 * die Auskunft nie kommt, stünde ein Standbild über einem laufenden Video —
 * schlimmer als der Zustand, der behoben wird. Die harte Frist kann deshalb
 * nicht ausfallen. Im schlechtesten Fall ist das Verhalten das von vorher.
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ DIE MESS-NAHT: data-qb-video-zustand                                    ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Jede Kachel trägt `data-qb-video-zustand` in genau den Werten, die der
 * Zwillingsbau verwendet: `vorschau` → `wartet` → `spielt`. Dazu ein vierter,
 * den es dort nicht gibt: `kein-video`.
 *
 * DER MITTLERE WERT WAR BIS ZUM 2026-09-11 DIE ASCII-SCHREIBWEISE VON `lädt`
 * -- und das war KEIN Wert des Zwillingsbaus, obwohl der Satz darüber es
 * behauptete. Am Bestand nachgelesen (YoutubeTimestamp.jsx, Zeile 554:
 * `'spielt' : 'wartet'` bzw. `'vorschau'`) heißt der mittlere Zustand dort
 * `wartet`. Aufgefallen ist die Abweichung erst, als das Umlaut-Gate des
 * Deploys die ASCII-Schreibweise blockte: der naheliegende Griff wäre der
 * echte Umlaut gewesen -- also ein Umlaut mitten in einem DOM-Attributwert,
 * den zwei fremde Messgeräte lesen. Statt den Wert schöner zu schreiben, ist
 * er jetzt der, den die Naht ohnehin versprochen hat. Keine Probe vergleicht
 * den mittleren Wert literal (geprüft: probe_ig_facade.py liest nur `spielt`
 * und `kein-video`, mess_videoumschaltung.py nur `spielt` und `vorschau`).
 *
 * `kein-video` ist keine Verlegenheitslösung, sondern die einzige ehrliche
 * Antwort für drei Einträge des Korpus (CYHc4RClQLb, DRK-x7OjATx,
 * DW59RV8Db8k): das sind Bild-/Karussell-Posts, kein Video. Ein Play-Knopf
 * darauf wäre eine Lüge, und das Attribut wegzulassen wäre eine zweite — die
 * Kachel gäbe sich dann als etwas aus, das nicht gemessen werden will.
 *
 * WAS DAS ATTRIBUT NICHT LEISTET, gemessen am Quelltext des fremden Messgeräts
 * (homepage-bauer/bin/mess_videoumschaltung.py, Stand 2026-09-11): Segment s01
 * hatte festgehalten, das autoritative Gerät messe unsere Fläche damit
 * „automatisch mit — ohne Nachbau". Das stimmt so NICHT. Sein Wahl-Schritt
 * sammelt zwar alle `[data-qb-video-zustand]` (Zeile 207), wirft aber in der
 * gemeinsamen Schlussschleife (Zeile 225) jeden Kasten wieder weg, dessen
 * Vorschau kein YouTube-Bild ist: `posterVon = (e) => e.querySelector(
 * 'img[src*="ytimg"], img[srcset*="ytimg"]')`. Unsere Poster liegen auf
 * cdn.shopify.com — genau das war der Zweck von s02, weil `video.poster` bei
 * Instagram signiert ist und verfällt. Unsere Kacheln werden also gefunden und
 * sofort wieder verworfen.
 *
 * Das Attribut bleibt trotzdem, aus zwei Gründen: es kostet nichts, und es ist
 * die richtige Naht — sobald der ytimg-Riegel beim Eigentümer fällt, misst das
 * Gerät hier ohne eine einzige Änderung mit. Bis dahin misst die eigene Probe
 * `pruefungen/probe_ig_facade.py` dieselbe Zusage im selben Regime. Der Befund
 * am fremden Gerät ist an dessen Eigentümer gemeldet, nicht hier repariert:
 * `bin/` ist Nachbargebiet.
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ DIE ORDNUNG: Christians Stufen, darunter die Sprache                     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Die Datenschicht liefert je Produkt bereits Christians Ordnung: T1 (fremdes
 * Konto) vor T2 (unser Post, Person per @handle genannt) vor T3 (unser Post
 * ohne Person), innerhalb der Stufe das jüngste zuerst.
 *
 * Diese Komponente sortiert NUR NOCH INNERHALB DER STUFE nach, nie über
 * Stufengrenzen hinweg — die Stufen-Ordnung ist Christians Weisung, die
 * Sprache ist die Feinsortierung darunter. Sie wäre sonst in der Lage, einen
 * eigenen Post vor ein fremdes Konto zu schieben, und genau das ist die eine
 * Sache, die die Fläche nicht tun darf.
 *
 * Der Sortierschlüssel ist deshalb (stufe, sprache) und NICHT (sprache, …).
 * `Array.prototype.sort` ist seit ES2019 stabil — die Datums-Ordnung der
 * Datenschicht bleibt innerhalb jeder (Stufe, Sprache)-Gruppe erhalten, ohne
 * dass sie hier noch einmal nachgebaut werden müsste. Zwei Stellen, die
 * dieselbe Ordnung führen, wären eine zu viel.
 */

/* Die Stufen-Ordnung. Sie steht hier NUR, um sie zu ERHALTEN — die
 * Datenschicht hat bereits danach sortiert. Ein eigener Rang wäre eine zweite
 * Wahrheit; dieser hier ist die Kopie, gegen die stabil nachsortiert wird. */
const STUFEN_RANG = {T1: 0, T2: 1, T3: 2};

/*
 * Sprach-Rang für die DEUTSCHE Seite. `beide` trägt deutschen Text und steht
 * deshalb direkt hinter `de`. `keine` (ein Post ohne nennenswerten Text) steht
 * VOR `en`: er stößt einen deutschen Leser nicht ab, eine fremde Sprache tut
 * es. Das ist eine Design-Entscheidung mit Begründung, keine Naturkonstante —
 * eine englische Seite bekäme ihren eigenen Rang über die Prop `sprachRang`.
 */
const SPRACH_RANG_DE = {de: 0, beide: 1, keine: 2, en: 3};

/* Wie lange nach `onLoad` noch gewartet wird, bevor der Player eingeblendet
 * wird. Dieselbe Zahl wie im YouTube-Bau — dort begründet als „kurz genug,
 * dass niemand ein Standbild über einem laufenden Video sieht; lang genug,
 * dass die Auskunft im Normalfall zuerst da ist". Hier gibt es die Auskunft
 * gar nicht, die Frist trägt also allein. */
const GNADENFRIST_MS = 900;
/* Die Frist, die NICHT ausfallen kann: greift, wenn `onLoad` nie feuert
 * (Netzfehler, blockierter Drittinhalt). Ein Beschleuniger, der im Fehlerfall
 * den normalen Weg kaputt macht, ist schlimmer als keiner. */
const HARTE_FRIST_MS = 4000;

/*
 * Das Seitenverhältnis der Bühne. EIN Wert für alle Kacheln, bewusst:
 * verschieden hohe Kacheln in einer Bahn erzeugen eine unruhige Kante, und die
 * Designsprache verlangt für Reihen gleichartiger Bilder eine gemeinsame Bühne
 * mit festem Seitenverhältnis. 4:5 ist der Kompromiss, der beide Quellen
 * erträgt: Reels sind 9:16, Bild-Posts meist 1:1 oder 4:5.
 *
 * ABGRENZUNG zur Flächen-Harmonie-Regel der Designsprache („kein object-fit
 * cover auf einem Beleg"): die gilt für BELEGBILDER (Studien-Cover,
 * Zertifikate), deren Inhalt vollständig sichtbar bleiben muss. Ein
 * Video-Standbild ist kein Beleg, sondern eine Vorschau — dort ist der
 * Bildausschnitt gewollt und `cover` richtig.
 */
const BUEHNE = '4 / 5';

/*
 * DER STAPEL — wörtlich die Bauform des Zwillings, mit derselben Begründung:
 * in der Flussrichtung (kein `position: absolute` auf dem Stapel selbst),
 * damit er in jeder Umgebung dieselbe Höhe ergibt, und `maxWidth: none`,
 * damit eine Zeilenlängen-Regel des Seiten-CSS ihn nicht schrumpft (gemessener
 * Fall im Zwillingsbau: eine `max-width: 65ch`-Regel für Fließtext traf dort
 * jedes <span> und machte das Video um 175 px schmaler).
 */
const STAPEL_STYLE = {
  position: 'relative',
  display: 'block',
  width: '100%',
  maxWidth: 'none',
  overflow: 'hidden',
  aspectRatio: BUEHNE,
};
/* Die Schichten sitzen deckungsgleich aufeinander — das ist der ganze Trick. */
const SCHICHT_STYLE = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  border: 0,
  margin: 0,
  display: 'block',
};

/** Einbettungs-URL. `typ` unterscheidet /reel/ von /p/ — EIN Eintrag ist /p/. */
function einbettung(t) {
  return `https://www.instagram.com/${t.typ}/${t.code}/embed/`;
}

/**
 * Eine Kachel. Eigene Komponente, weil jede ihren EIGENEN Zustand hat: in
 * einer Bahn mit 45 Kacheln wäre ein gemeinsamer Zustand im Elternteil ein
 * Neuaufbau aller Geschwister bei jedem Klick.
 */
function Kachel({t}) {
  const [laueft, setLaueft] = useState(false);
  /* `zeigt` ist NICHT „der Player existiert", sondern „der Player hat Bild".
   * Der Unterschied zwischen den beiden ist genau das Schwarz, um das es in
   * diesem Bau geht. */
  const [zeigt, setZeigt] = useState(false);
  const fristen = useRef([]);
  /* Beim Aushaengen alle offenen Fristen loeschen: sonst setzt ein Timer
   * Zustand auf einer Kachel, die es nicht mehr gibt (Routenwechsel). */
  useEffect(() => () => fristen.current.forEach(clearTimeout), []);

  const hatVideo = t.video !== false;
  const zustand = !hatVideo
    ? 'kein-video'
    : laueft
      ? zeigt
        ? 'spielt'
        : 'wartet'
      : 'vorschau';

  const starte = () => {
    if (laueft) return;
    setLaueft(true);
    /* Die Frist, die nicht ausfallen kann — sie hängt an NICHTS ausser der
     * Uhr. Hinge sie an `onLoad`, wäre sie bei blockiertem Drittinhalt
     * genauso weg wie die Auskunft, auf die sie antworten soll. */
    fristen.current.push(
      setTimeout(() => setZeigt(true), HARTE_FRIST_MS),
    );
  };

  /* Der sichtbare Teil der Kachel — in BEIDEN Zuständen derselbe Bauplan.
   * Vorher-Nachher-Tausch von Teilbäumen war der Defekt, den der Zwillingsjob
   * behoben hat; hier entsteht er gar nicht erst. */
  const stapel = (
    <span className="qb-igt__buehne" style={STAPEL_STYLE}>
      {/* SCHICHT 1 — die Vorschau. Wird NIE entfernt. Sie bleibt auch nach dem
          Umblenden liegen: ein Player, der später neu puffert, fällt damit auf
          ein Bild zurück statt auf Schwarz. */}
      <img
        className="qb-igt__poster"
        src={t.posterPfad}
        alt={
          t.stufe === 'T3'
            ? 'Standbild eines Instagram-Beitrags von Qi Blanco'
            : `Standbild des Instagram-Beitrags von @${t.profil}`
        }
        loading="lazy"
        /* Läuft der Player, ist die Vorschau nur noch Unterlage und trägt
           keine eigene Aussage mehr. */
        aria-hidden={laueft ? 'true' : undefined}
        style={SCHICHT_STYLE}
      />

      {/* SCHICHT 2 — die Einbettung. Erst ab dem Klick im Dokument (das ist
          die Ladeweise, die bleibt: 45 Kacheln eager zu laden wäre die
          Ladezeit, die dieser Bau gerade nicht kosten darf), und sichtbar
          erst, wenn sie Bild haben KANN. */}
      {laueft ? (
        <iframe
          className="qb-igt__player"
          src={einbettung(t)}
          title={
            t.stufe === 'T3'
              ? 'Instagram-Beitrag von Qi Blanco'
              : `Instagram-Beitrag von @${t.profil}`
          }
          style={{
            ...SCHICHT_STYLE,
            opacity: zeigt ? 1 : 0,
            /* Kurz, und nur in EINE Richtung. `prefers-reduced-motion`
               schaltet sie im CSS ab — eine Deckkraft-Animation ist Bewegung
               im Sinne der Einstellung. */
            transition: 'opacity 240ms ease-out',
          }}
          onLoad={() => {
            fristen.current.push(
              setTimeout(() => setZeigt(true), GNADENFRIST_MS),
            );
          }}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          scrolling="no"
        />
      ) : null}

      {/* SCHICHT 3 — das Zeichen. Vor dem Klick Play, während des Ladens ein
          Ladezeichen („wer klickt und eine Sekunde nichts sieht, klickt
          nochmal" — Christian). Nach dem Umblenden weg.
          AUF EINEM BILD-POST GIBT ES GAR KEINS: ein Play-Knopf auf einem
          Karussell verspricht ein Video, das es nicht gibt. */}
      {hatVideo && !zeigt ? (
        <span className="qb-igt__zeichen" aria-hidden="true">
          <span className="qb-igt__abzeichen">
            {laueft ? <span className="qb-igt__spinner" /> : '▶'}
          </span>
        </span>
      ) : null}
    </span>
  );

  /*
   * DIE HÜLLE. Vor dem Klick ein <button>, danach ein <div> — ein <iframe> ist
   * interaktiver Inhalt und darf baulich nicht in einem <button> stehen. Das
   * ist derselbe (und einzige) Element-Wechsel wie im Zwillingsbau, und er ist
   * folgenlos: Klasse, Stil und Inhalt sind in beiden Zuständen dieselben, die
   * Geometrie kommt aus dem Stapel darin.
   *
   * `display: block; width: 100%` steht hier und nicht im CSS: ein <button>
   * ist von Haus aus inline-block und schrumpft auf seinen Inhalt — der Stapel
   * darin hat `width: 100%`, was in einem schrumpfenden Elternteil NULL ergibt
   * und die Kachel verschwinden lässt. Im Zwillingsbau live gemessen
   * („Kasten hat keine messbare Größe").
   */
  const huelle = {
    className: 'qb-igt__flaeche',
    style: {display: 'block', width: '100%'},
  };

  /* Ein Bild-Post bekommt keinen Play-Knopf und deshalb auch keine Bühne, die
   * sich bedienen lässt — er ist reine Anschauung. Der Weg zum Beitrag führt
   * über die Profil-Zeile darunter (T1/T2) bzw. gar nicht (T3). */
  const buehne = !hatVideo ? (
    <span {...huelle}>{stapel}</span>
  ) : laueft ? (
    <div {...huelle}>{stapel}</div>
  ) : (
    <button
      type="button"
      {...huelle}
      onClick={starte}
      aria-label={
        t.stufe === 'T3'
          ? 'Instagram-Beitrag von Qi Blanco abspielen'
          : `Instagram-Beitrag von @${t.profil} abspielen`
      }
    >
      {stapel}
    </button>
  );

  return (
    <article
      className="qb-igt__kachel"
      data-ig-reel={t.code}
      data-ig-profil={t.profil}
      data-qb-video-zustand={zustand}
    >
      {buehne}
      {/*
        DIE NAMENSZEILE — und die eine Grenze, die Christians Nachtrag
        ausdrücklich stehen lässt: KEINE BEI T3.

        „Wo keine Person dahintersteht, steht keine da. Ein Reel ohne Namen ist
        erlaubt, ein Reel mit falschem Namen nicht."

        T3 sind unsere eigenen Posts ohne jede Personennennung. Sie stehen
        bewusst auf der Fläche (Christian: „Trotzdem einen tollen Slider machen
        mit dem ganzen Material"), aber sie bekommen keinen Namen geliehen —
        auch nicht unseren eigenen, denn eine Zeile „@qiblanco" unter einem
        Testimonial liest sich wie eine Quellenangabe für eine fremde Stimme.
        Das Konto steht trotzdem maschinenlesbar in `data-ig-profil`: kaschiert
        wird hier nichts, es wird nur nichts behauptet.
      */}
      {t.stufe === 'T3' ? null : (
        <a
          className="qb-igt__profil"
          href={t.profilUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          <span className="qb-igt__handle">@{t.profil}</span>
          <span className="qb-igt__aufig">auf Instagram</span>
        </a>
      )}
    </article>
  );
}

/**
 * @param {{
 *   produkt: string,
 *   ueberschrift?: string,
 *   unterzeile?: string,
 *   eintraege?: Array<object>,
 *   sprachRang?: Record<string, number>,
 *   dataSection?: string,
 * }} props
 */
export function IgTestimonialSlideshow({
  produkt,
  ueberschrift = 'Echte Stimmen auf Instagram',
  unterzeile,
  eintraege = IG_TESTIMONIALS,
  sprachRang = SPRACH_RANG_DE,
  dataSection,
}) {
  const titelId = useId();
  const bahnRef = useRef(null);
  const {handlers, isDragging} = useDragSwipe({mode: 'scroll', trackRef: bahnRef});

  const liste = useMemo(() => {
    const meine = eintraege.filter((t) => t.produkt === produkt);
    /* Stabil nach (Stufe, Sprache) — die Datums-Ordnung der Datenschicht
     * bleibt innerhalb jeder Gruppe erhalten (ES2019: sort ist stabil). */
    return [...meine].sort((a, b) => {
      const s = (STUFEN_RANG[a.stufe] ?? 9) - (STUFEN_RANG[b.stufe] ?? 9);
      if (s !== 0) return s;
      return (sprachRang[a.sprache] ?? 9) - (sprachRang[b.sprache] ?? 9);
    });
  }, [eintraege, produkt, sprachRang]);

  if (liste.length === 0) return null;

  const blaettere = (richtung) => {
    const bahn = bahnRef.current;
    if (!bahn) return;
    const kachel = bahn.querySelector('.qb-igt__kachel');
    const schritt = kachel ? kachel.offsetWidth + 16 : 280;
    bahn.scrollBy({left: richtung * schritt, behavior: 'smooth'});
  };

  const beiTaste = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      blaettere(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      blaettere(-1);
    }
  };

  return (
    <section
      className="qb-igt"
      data-ig-testimonials={produkt}
      data-section={dataSection}
      aria-labelledby={titelId}
    >
      <div className="qb-igt__kopf">
        <h2 className="qb-igt__titel" id={titelId}>
          {ueberschrift}
        </h2>
        {unterzeile ? <p className="qb-igt__unter">{unterzeile}</p> : null}
      </div>

      <div
        className={`qb-igt__bahn${isDragging ? ' is-dragging' : ''}`}
        ref={bahnRef}
        role="group"
        aria-label={`Instagram-Beiträge zu ${produkt} — horizontal scrollbar`}
        tabIndex={0}
        onKeyDown={beiTaste}
        {...handlers}
      >
        {liste.map((t) => (
          <Kachel key={`${t.produkt}-${t.code}`} t={t} />
        ))}
      </div>

      <div className="qb-igt__nav">
        <button
          type="button"
          className="qb-igt__pfeil"
          onClick={() => blaettere(-1)}
          aria-label="Vorheriger Beitrag"
        >
          {'←'}
        </button>
        <span className="qb-igt__wisch" aria-hidden="true">
          weiterwischen {'→'}
        </span>
        <button
          type="button"
          className="qb-igt__pfeil"
          onClick={() => blaettere(1)}
          aria-label="Nächster Beitrag"
        >
          {'→'}
        </button>
      </div>
    </section>
  );
}

export default IgTestimonialSlideshow;
