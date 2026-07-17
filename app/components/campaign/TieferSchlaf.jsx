import {createContext, useContext, useState} from 'react';
import {GoogleReviews as LpGoogleReviews} from '~/components/index-components/GoogleReviews';
import {Studien as LpStudien} from '~/components/reusables/Studien';
import {PodcastStimmen} from '~/components/redesign/PodcastStimmen';
import {ProduktTrio} from '~/components/redesign/ProduktTrio';
import {ScrollScrubVideo} from '~/components/reusables/ScrollScrubVideo';
import {VIDEOS} from '~/lib/redesign3themen';

/*
 * Landingpage /pages/tiefer-schlaf — DESIGN v3 „Die ruhige Nacht" + C-REFOKUS
 * (2026-07-14, Grossjob landingpage-4lp-abcd-bau Segment s07, GATED-Vorbereitung).
 *
 * C-REFOKUS (Konzept 4lp-abcd Kap. 3.3 Skizze C / 3.4 staged): die Drei-Themen-/
 * Allrounder-Anteile wandern nach LP A (/pages/schlaf-zellen-schutz, seit s02 LIVE)
 * und werden HIER entfernt — diese Seite ist jetzt reines TIEFER-SCHLAF-Thema.
 *   RAUS:  DreiThemenBand (Struktur-Anker der Allrounder-Botschaft) + EbenenSection
 *          (Themen-Akkordeon „Dein Schlaf ist erst der Anfang", Cross-Thema).
 *   NEU:   RitualSection (Einschlaf-Ritual — Schlaf-Dramaturgie geschaerft).
 *   BLEIBT als Message-Match-Anker der Schlaf-Ads: ExperienceSection (171 Berichte,
 *          C3) + SchlafraumSection (QiHome® Air, C5) + Garantie (Welle-B).
 * URL und Ad-Links bleiben unveraendert (kein Redirect, kein Ad-Edit).
 *
 * v3-Basis = DARSTELLUNGS-Neubau ueber den verdrahteten Design-Meister-Pfad
 * (design-meister web-brief -> Token-Bau tiefer-schlaf.css -> design-rubrik
 * iterieren >= 80). Inhalte (Texte/Claims/Beweise) sind unveraendert v2;
 * geaendert ist NUR die Praesentation: ein Token-System, ruhige Akte,
 * stille YouTube-Poster statt Iframe-Chrome, EIN Review-Block
 * (Reputon-Duplikat raus). NACHTRAG 2026-07-17: der v3-Entscheid „kein
 * Scroll-Jacking" (Mikroskop-Video -> typografische Karte) wurde per
 * explizitem Auftrag zurueckgenommen — der Mikroskop-Beweis laeuft wieder
 * als Scroll-Scrub-Video (ScrollScrubVideo, Texte der Karte 1:1).
 *
 * Vorheriger Stand (v2-Kommentar, Historie):
 *
 * Redesign auf Basis des PR-#33-Wissens (Drei-Themen-Botschaft) + Christians
 * Anmerkungen: harmonisch + lebendig statt Roboter-Vibe, ECHTE Fotos statt
 * offensichtlicher KI-Bilder, Podcast-Snippets mit wortlaut-belegten
 * Überschriften, conversion-stark, QB-Marke (du-Anrede).
 *
 * Was v2 gegenüber v1 ändert (Varianten-DB design-varianten, Slug
 * tiefer-schlaf-v2):
 *   - Hero: editorial, ECHTES Shooting-Foto (Mann schläft mit QiOne),
 *     typografische Trust-Row, EIN goldener CTA.
 *   - „Lebendig" = Storytelling (Nacht-Dramaturgie 22:47/03:12/06:30),
 *     echte Menschen (Shooting-Fotos, Podcast, Testimonials), dosierte
 *     Interaktion (Themen-Akkordeon) — KEINE Effekte/Sättigung.
 *   - Emojis raus aus allen Info-Sektionen (typografische Marker).
 *   - DreiThemenBand + ThemenAkkordeon + PodcastStimmen + ProduktTrio-Closer
 *     aus dem geparkten Redesign-Wissen (homepage-3themen-redesign-geparkt).
 *
 * Claim-Disziplin unverändert (v1-Erbe): Zellstudien in-vitro/präklinisch
 * gelabelt; Erfahrungsberichte deskriptiv; Geld-zurück an Zeitraum +
 * Überzeugung gebunden, NIE ans Spüren (Spür-Regel #7); HWG grundsätzlich
 * aus (weltweite Ads), Fakten-Treue absolut. Message-Match zu den Schlaf-Ads
 * (C3 „171 Berichte" / C5 QiHome-Schlafraum / Welle-B Garantie+Raten) bleibt.
 */

const LiveDataCtx = createContext({data: {products: []}});
const useLp = () => useContext(LiveDataCtx);
const findLp = (data, handle) =>
  data?.products?.find((product) => product?.handle === handle) || null;

const VAT = 1.19;
const brutto = (a) => parseFloat(a || 0) * VAT;
const fmtBrutto = (a) => {
  if (!a) return null;
  const n = Math.round(brutto(a));
  return n.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};
const fmtRaw = (a) => {
  if (!a) return null;
  const n = Math.round(parseFloat(a));
  return n.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};
const getCompareAt = (p) => {
  const v = p?.variants?.nodes?.[0] || p?.variants?.[0];
  return v?.compareAtPrice?.amount;
};

/* ECHTE Shooting-Fotos (Shopify-CDN, kein Repo-Binary — GL-PRO-0015;
   Christian-Regel: echte statt offensichtlicher KI-Bilder). */
const FOTO_SCHLAF_MANN =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2024-06-qiblanco-bali-06825.webp?v=1737715386';
const FOTO_MORGEN_FRAU =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2022-07-26-qiblanco-berlin-1001190-Kopie-1024x589_jpg.webp?v=1666617198';

/* ───────── Hero v2: editorial, echtes Foto, EIN goldener CTA ───────── */
function Hero() {
  const {data} = useLp();
  const product = findLp(data, 'qione-2-pro');
  const priceAmount = product?.priceRange?.minVariantPrice?.amount;
  const priceNum = priceAmount ? brutto(priceAmount) : 1087;
  const priceLabel = fmtBrutto(priceAmount) || '1.087,00 €';
  const compareLabel = fmtRaw(getCompareAt(product));
  const monthly = Math.ceil(priceNum / 12);
  const trust = [
    '14.000+ Träger',
    'Zellstudien, peer-reviewed',
    'Made in Germany',
    '20 Nächte risikofrei',
  ];
  return (
    <section
      className="lp-ts2-hero"
      aria-labelledby="lp-ts-hero-title"
      data-section="lp-ts-hero"
    >
      <div className="lp-ts2-hero__inner">
        <div className="lp-ts2-hero__copy">
          <span className="lp-ts2-hero__eyebrow">
            Für alle, die nachts nicht abschalten können
          </span>
          <h1 id="lp-ts-hero-title" className="lp-ts2-hero__title">
            Endlich wieder
            <br />
            tief schlafen.
          </h1>
          <p className="lp-ts2-hero__subline">
            Dein Körper besteht zu über 70&nbsp;% aus Wasser. Der QiOne<sup>®</sup>&nbsp;2
            Pro bringt es in kohärente Ordnung — dorthin, wo Erholung entsteht: auf
            Zellebene. In Zellstudien gemessen, von 14.000+ Trägern Nacht für Nacht
            getragen.
          </p>
          <div className="lp-ts2-hero__cta-row">
            <a className="lp-vp-btn lp-vp-btn--primary" href="/products/qione-2-pro">
              Jetzt 20 Nächte risikofrei testen
            </a>
            <span className="lp-ts2-hero__price">
              {compareLabel && <s>{compareLabel}</s>} {priceLabel} · oder 12 Raten à{' '}
              {monthly}&nbsp;€
            </span>
          </div>
          <ul className="lp-ts2-hero__trust">
            {trust.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <figure className="lp-ts2-hero__visual">
          <img
            src={FOTO_SCHLAF_MANN}
            alt="Mann liegt schlafend im Bett und trägt den QiOne® 2 Pro"
            loading="eager"
          />
          <figcaption>
            QiOne<sup>®</sup>&nbsp;2 Pro — getragen, während du schläfst.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/* ───────── Nacht-Dramaturgie (Empathie, editorial statt Icon-Grid) ───────── */
function NachtSection() {
  const momente = [
    {
      zeit: '22:47',
      titel: 'Du bist müde. Und trotzdem wach.',
      text: 'Das Licht ist aus, der Tag war lang — aber dein Kopf macht weiter. Das Handy liegt griffbereit neben dem Kissen.',
    },
    {
      zeit: '03:12',
      titel: 'Wach. Ohne Grund.',
      text: 'Kein Lärm, kein Stress — und doch bist du hellwach. Dein Nervensystem hat den Alarmmodus nie ganz verlassen.',
    },
    {
      zeit: '06:30',
      titel: 'Der Wecker klingelt. Du bist gerädert.',
      text: 'Geschlafen ja — erholt nein. Der Schlaf war da, aber flach. Und der Tag beginnt schon im Minus.',
    },
  ];
  return (
    <section className="lp-ts2-nacht" data-section="lp-ts-nacht">
      <span className="eyebrow">Kennst du diese Nacht?</span>
      <h2>Drei Momente, die du nicht vermissen wirst.</h2>
      <div className="lp-ts2-nacht__momente">
        {momente.map((m) => (
          <article className="lp-ts2-moment" key={m.zeit}>
            <span className="lp-ts2-moment__zeit">{m.zeit}</span>
            <h3 className="lp-ts2-moment__titel">{m.titel}</h3>
            <p className="lp-ts2-moment__text">{m.text}</p>
          </article>
        ))}
      </div>
      <p className="lp-ts2-nacht__bridge">
        Es liegt selten an dir. Es liegt an deiner Umgebung: WLAN, 5G und
        Dauerstress halten Zellen und Nervensystem in Habachtstellung — auch
        nachts. Genau hier setzt kohärentes Wasser an.
      </p>
    </section>
  );
}

/* ───────── Mechanismus als Reise-Timeline (Nordstern: konkret erklären) ───────── */
function MechanismSection() {
  const steps = [
    {
      num: '01',
      title: 'Das Feld ordnet das Wasser an deinen Zellen',
      body: 'Der GitterChip™ im QiOne® 2 Pro erzeugt ein statisches Feld — ganz ohne Batterie oder Magnet. Es hilft Wassermolekülen, an biologischen Grenzflächen in den kohärenten, geordneten Zustand überzugehen (Pollacks „EZ-Wasser").',
    },
    {
      num: '02',
      title: 'Deine Zellen bekommen ihren Schutzraum zurück',
      body: 'Die kohärente Grenzschicht puffert eingestrahlten E-Smog ab, stabilisiert die Zellmembran und senkt oxidativen Stress. Ein Körper, der weniger im Abwehrmodus ist, kann nachts leichter herunterfahren.',
    },
    {
      num: '03',
      title: 'In rund 20 Nächten stellt sich ein neues Gleichgewicht ein',
      body: 'Zellen brauchen Zeit, um sich an ein verändertes Wasserumfeld anzupassen — Membranen bauen ihre EZ-Schicht auf, das Nervensystem verlässt Schritt für Schritt den Daueralarm. Deshalb berichten die meisten Träger von Veränderungen in den ersten drei Wochen.',
    },
  ];
  return (
    <section
      className="lp-vp-section lp-vp-section--white lp-ts-mechanism"
      data-section="lp-ts-mechanismus"
    >
      <span className="eyebrow">Was nachts in deinem Körper passiert</span>
      <h2>Kein Wunder. Biophysik.</h2>
      <p className="lp-vp-section__lede">
        Wir verkaufen dir keine Traum-Stimmung, sondern eine nachvollziehbare Wirkkette.
        99 von 100 Molekülen in deinem Körper sind Wassermoleküle — kohärentes Wasser ist
        die Schnittstelle, an der Erholung beginnt.
      </p>
      <ol className="lp-ts2-timeline">
        {steps.map((s) => (
          <li className="lp-ts2-timeline__step" key={s.num}>
            <span className="lp-ts2-timeline__num" aria-hidden="true">
              {s.num}
            </span>
            <div className="lp-ts2-timeline__text">
              <h3 className="lp-ts2-timeline__title">{s.title}</h3>
              <p className="lp-ts2-timeline__body">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="lp-ts-note">
        Kohärentes Wasser ist Grenzforschung, keine etablierte Medizin. Die folgenden Zell-
        studien sind in vitro (an Zellkulturen) durchgeführt — sie erklären den Mechanismus,
        sie sind keine Heilaussage.
      </p>
    </section>
  );
}

/* ───────── Einschlaf-Ritual (C-Refokus: Schlaf-Dramaturgie geschaerft) ─────────
 * Ersetzt die Allrounder-Ebenen (Cross-Thema wandert nach LP A). Reine Schlaf-
 * Strecke: der Abend-Ablauf, in den sich der QiOne fuegt. Deskriptiv, Nordstern
 * (Mechanismus konkret, Erlebnis = Wert), KEINE gefuehlte Wirkzusage (Spuer-Regel). */
function RitualSection() {
  const schritte = [
    {
      zeit: '21:30',
      titel: 'Der Tag darf enden.',
      text: 'Du legst den QiOne® 2 Pro an — so, wie andere die Zähne putzen. Kein Knopf, keine App, keine Einstellung. Ein kleiner fester Punkt, an dem der Abend beginnt.',
    },
    {
      zeit: '21:45',
      titel: 'Das Feld arbeitet — leise, ohne dass du etwas tust.',
      text: 'Der GitterChip™ ordnet Wasser an deinen Zellen in den kohärenten Zustand. Du musst nichts spüren, nichts kontrollieren. Es läuft im Hintergrund, während du das Licht dimmst und das Handy weglegst.',
    },
    {
      zeit: '22:30',
      titel: 'Du gleitest hinüber, statt zu kämpfen.',
      text: 'Ein Körper, der tagsüber weniger im Abwehrmodus war, muss abends nicht erst herunterfahren. Aus „ich sollte jetzt schlafen" wird wieder ein Übergang, den du nicht erzwingen musst.',
    },
  ];
  return (
    <section
      className="lp-vp-section lp-vp-section--cream lp-ts-ritual"
      data-section="lp-ts-ritual"
    >
      <span className="eyebrow">Dein Abend, ab heute</span>
      <h2>Ein Ritual, kein Kraftakt.</h2>
      <p className="lp-vp-section__lede">
        Besser schlafen beginnt nicht um Mitternacht, sondern beim Anlegen. Der QiOne®
        fügt sich in deinen Abend ein — ein Handgriff, der Nacht für Nacht dieselbe
        Wirkkette in Gang setzt.
      </p>
      <ol className="lp-ts2-timeline lp-ts-ritual__timeline">
        {schritte.map((s) => (
          <li className="lp-ts2-timeline__step" key={s.zeit}>
            <span className="lp-ts2-timeline__num" aria-hidden="true">
              {s.zeit}
            </span>
            <div className="lp-ts2-timeline__text">
              <h3 className="lp-ts2-timeline__title">{s.titel}</h3>
              <p className="lp-ts2-timeline__body">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ───────── Wissenschaft (messbar, in-vitro gelabelt) ───────── */
function ScienceSection() {
  const stats = [
    {
      value: '84,7%',
      label: 'Immunzell-Aktivität',
      desc: 'Radikalbildung der Immunzellen bleibt unter Handystrahlung nahezu erhalten (ohne Schutz: 60,5 %).',
      cite: 'Japan Journal of Medicine, 2021 · in vitro',
    },
    {
      value: '10×',
      label: 'Zell-Barrierefunktion',
      desc: 'Bessere Barriere-Integrität gestresster Zellen (TEER-Messung) unter E-Smog-Belastung.',
      cite: 'Applied Cell Biology, 2021 · in vitro',
    },
    {
      value: '5 / 5',
      label: 'Zelltypen geschützt',
      desc: 'Weniger oxidativer Stress in fünf verschiedenen Zelltypen — von Leber bis Lunge.',
      cite: 'Applied Cell Biology, 2024 · in vitro',
    },
  ];
  return (
    <section
      className="lp-vp-section lp-vp-section--white"
      data-section="lp-ts-wissenschaft"
    >
      <span className="eyebrow">Wissenschaft</span>
      <h2>Nicht nur gefühlt — an Zellen gemessen.</h2>
      <p className="lp-vp-section__lede">
        Vier peer-review-publizierte Zellstudien (Dartsch Scientific, unabhängiges Labor)
        belegen die Wirkung der Qi-Blanco-Technologie experimentell. Alle Studien in vitro —
        messbare, reproduzierbare Effekte auf lebende Zellen.
      </p>
      <div className="lp-vp-peer-stats">
        {stats.map((s) => (
          <div className="lp-vp-peer-stat" key={s.label}>
            <div className="lp-vp-peer-stat__value">{s.value}</div>
            <div className="lp-vp-peer-stat__label">{s.label}</div>
            {s.desc && <div className="lp-vp-peer-stat__desc">{s.desc}</div>}
            {s.cite && <div className="lp-vp-peer-stat__cite">{s.cite}</div>}
          </div>
        ))}
      </div>
      {/* Mikroskop-Beweis als Scroll-Scrub-Video: ersetzt die typografische
          MikroskopKarte (v3-Entscheid „kein Scroll-Jacking" bewusst durch
          expliziten Auftrag ueberschrieben, Job 20260716-bauer-scroll-down-
          animationen-capability — Texte der Karte 1:1 uebernommen). */}
      <ScrollScrubVideo
        dataSection="lp-ts-mikroskop-video"
        srcDesktop="https://cdn.shopify.com/videos/c/o/v/940d16da99a2452d9aadd57b9711b037.mov"
        srcMobile="https://cdn.shopify.com/videos/c/o/v/d9d52d90d536415bbb6342ebadb2fe97.mov"
        overlayStart={{
          titel: 'Zellbiologisch geprüft',
          text: 'Entdecke die Effekte auf Zellebene.',
        }}
        overlayEnd={[
          {
            titel: 'Ohne Schutz',
            text: 'Zellkulturen unter E-Smog-Belastung: sichtbar reduzierte Regeneration.',
          },
          {
            titel: 'Gitterchip™',
            text: 'Deutlich gesteigerte Zellregeneration, trotz starkem E-Smog Einfluss.',
          },
        ]}
        fussnote="Zellbiologisch geprüft — die Effekte auf Zellebene, unter dem Mikroskop dokumentiert (in vitro)."
      />
      <LpStudien headline="" />
    </section>
  );
}

/* ───────── 171 Berichte + echtes Morgen-Foto (Message-Match C3) ───────── */
function ExperienceSection() {
  return (
    <section
      className="lp-vp-section lp-vp-section--cream lp-ts-experience"
      data-section="lp-ts-erfahrungen"
    >
      <div className="lp-ts3-experience__kopf">
        <span className="eyebrow">171 dokumentierte Erfahrungsberichte</span>
        <h2>171 ehrliche Berichte — und ein Muster, das sich wiederholt.</h2>
        <p className="lp-vp-section__lede lp-ts2-experience__lede">
          In einer ausgewerteten Sammlung von 171 unabhängigen Nutzer-Berichten war ein
          Thema mit Abstand am häufigsten: ruhigere, tiefere Nächte. Das sind
          Erfahrungsberichte — deskriptiv, ohne Kontrollgruppe. Aber das Muster ist
          deutlich.
        </p>
      </div>
      <div className="lp-ts2-experience__inner">
        <div className="lp-ts2-experience__copy">
          <div className="lp-vp-stats-row lp-ts2-experience__stats">
            <div className="lp-vp-stat-item">
              <span className="lp-vp-stat-item__value">~20%</span>
              <span className="lp-vp-stat-item__label">
                nennen Ruhe &amp; besseren Schlaf — das häufigste Thema
              </span>
            </div>
            <div className="lp-vp-stat-item">
              <span className="lp-vp-stat-item__value">~17%</span>
              <span className="lp-vp-stat-item__label">
                berichten von mehr Energie &amp; Vitalität am Tag
              </span>
            </div>
            <div className="lp-vp-stat-item">
              <span className="lp-vp-stat-item__value">171</span>
              <span className="lp-vp-stat-item__label">
                verifizierte Berichte, Fachpublikation 2024
              </span>
            </div>
          </div>
          <blockquote className="lp-ts-quotes">
            <span>„Ich schlafe tiefer.“</span>
            <span>„Ich bin klarer im Kopf.“</span>
            <span>„Ich fühle mich geerdet.“</span>
          </blockquote>
          <p className="lp-ts-experience__src">
            Quelle: Advances in Bioengineering &amp; Biomedical Science Research, 10.05.2024
            (171 verifizierte Berichte, deskriptiv).
          </p>
        </div>
        <figure className="lp-ts2-experience__foto">
          <img
            src={FOTO_MORGEN_FRAU}
            alt="Frau sitzt morgens entspannt mit einer Tasse am Fenster"
            loading="lazy"
          />
          <figcaption>Erholt aufwachen — darum geht es.</figcaption>
        </figure>
      </div>
    </section>
  );
}

/* ───────── Video-Erfahrungen ─────────
   CONTENT-MATCH (Christian-Regel 2026-07-11): Überschrift/Tag/Quote MÜSSEN das
   tatsächlich Gesagte im Video treffen (Transkript-belegt, Register:
   homepage-bauer data/medien/<id>.json). Gate vor jeder Änderung:
   codemeister content-match check <diese Datei>. Zitate sinngemäß aus dem
   jeweiligen Transkript — keine erfundenen Themen (Brain-Fog-Falle F-003). */
/* Stilles YouTube-Poster: laedt den Player erst beim Klick (kein rotes
   Iframe-Chrome in der ruhigen Flaeche; Poster leicht entsaettigt via CSS). */
function LiteYt({id, title}) {
  const [laueft, setLaueft] = useState(false);
  if (laueft) {
    return (
      <div className="lp-ts3-yt">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <button
      type="button"
      className="lp-ts3-yt"
      onClick={() => setLaueft(true)}
      aria-label={`Video abspielen: ${title}`}
    >
      <img
        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        alt=""
        loading="lazy"
      />
      <span className="lp-ts3-yt__play" aria-hidden="true">
        <span>▶</span>
      </span>
    </button>
  );
}

function VideoSection() {
  const videos = [
    {
      tag: 'Deutscher Leichtathletik-Meister',
      title: 'Constantin Preis — getrackter Tiefschlaf',
      quote: 'Meine Tiefschlafphase hat sich deutlich verbessert — das habe ich getrackt.',
      id: 'jyLyXZqHxaw',
    },
    {
      tag: 'Nada & Kurt Tepperwein',
      title: 'Spürbar stabiler im Alltag',
      quote: 'So wie ich es trage und erlebe: Es stabilisiert.',
      id: 'aG36zJKxDzg',
    },
    {
      tag: 'Erste Tage mit dem QiOne®',
      title: 'Michelle Christin Guse — „wie ein kleines Wunder"',
      quote: 'Was für eine Energie — als würde sich mein Körper einmal neu strukturieren.',
      id: 'zIfDQ1N60fI',
    },
  ];
  return (
    <section
      className="lp-vp-section lp-vp-section--white"
      data-section="lp-ts-videos"
    >
      <span className="eyebrow">Video-Erfahrungen</span>
      <h2>Echte Menschen. Echte Erfahrungen.</h2>
      <p className="lp-vp-section__lede">
        Drei Träger, drei Geschichten — vom getrackten Tiefschlaf des Leistungssportlers
        bis zur spürbaren Veränderung im Alltag. Berichte einzelner Nutzer, deskriptiv.
      </p>
      <div className="lp-vp-videos-grid">
        {videos.map((v) => (
          <article className="lp-vp-video" key={v.id}>
            <LiteYt id={v.id} title={v.title} />
            <span className="lp-vp-video__tag">{v.tag}</span>
            <h3 className="lp-vp-video__title">{v.title}</h3>
            <p className="lp-vp-video__quote">{v.quote}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ───────── Schlafraum (Message-Match C5 / QiHome Air) ───────── */
function SchlafraumSection() {
  const {data} = useLp();
  const qihome = findLp(data, 'qihome-air');
  const priceOf = (p) => fmtBrutto(p?.priceRange?.minVariantPrice?.amount);
  const img =
    qihome?.featuredImage?.url ||
    'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiHomeAir-Front-Alpha-Web2_1024x1024_741c3ad5-b5f7-49bf-89d4-c9b4a961545b.webp?v=1669000329';
  return (
    <section
      className="lp-vp-section lp-vp-section--stone lp-ts-room"
      data-section="lp-ts-schlafraum"
    >
      <div className="lp-ts3-room__kopf">
        <span className="eyebrow">Der Raum, in dem du schläfst</span>
        <h2>Nicht nur du. Dein ganzes Schlafzimmer.</h2>
      </div>
      <div className="lp-ts-room__inner">
        <div className="lp-ts-room__media">
          <img src={img} alt="QiHome® Air" loading="lazy" />
        </div>
        <div className="lp-ts-room__copy">
          <p>
            Der QiOne<sup>®</sup> begleitet dich am Körper. Das QiHome<sup>®</sup> Air bringt
            kohärentes Wasser in den ganzen Raum — dorthin, wo du ein Drittel deines Lebens
            verbringst. Eine neue Zellstudie zeigt, dass sich Nervenzellen in diesem Umfeld
            messbar besser regenerieren (präklinisch, in vitro).
          </p>
          <a
            className="lp-vp-btn lp-vp-btn--secondary"
            href="/products/qihome-air"
          >
            QiHome® Air entdecken{priceOf(qihome) ? ` — ab ${priceOf(qihome)}` : ''}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ───────── Einwand-Abbau / Garantie (typografisch, Spür-Regel #7) ───────── */
function GuaranteeSection() {
  const items = [
    {
      num: '01',
      title: '20 Nächte, dein Bett',
      body: 'Teste den QiOne® 2 Pro 20 Nächte lang in deinem echten Alltag. Bist du nicht überzeugt, bekommst du den vollen Kaufpreis zurück — ohne Wenn und Aber.',
    },
    {
      num: '02',
      title: 'In Raten, wenn du willst',
      body: 'Über Klarna oder PayPal in bequemen Monatsraten — 0 % Finanzierung. Du entscheidest, wie du zahlst.',
    },
    {
      num: '03',
      title: 'Made in Germany',
      body: '100 % in Deutschland entwickelt und gefertigt, aus hochwertigsten Materialien. Inkl. Käuferschutz und kostenlosem Versand.',
    },
  ];
  return (
    <section
      className="lp-vp-section lp-vp-section--white"
      data-section="lp-ts-garantie"
    >
      <span className="eyebrow">Dein Risiko: keins</span>
      <h2>Überzeugt dich deine Nachtruhe — oder du bekommst dein Geld zurück.</h2>
      <p className="lp-vp-section__lede">
        Ob eine Veränderung eintritt, hängt nicht davon ab, ob du sie sofort bewusst
        wahrnimmst. Deshalb bindest du dein Urteil nicht an ein Gefühl, sondern an den
        Zeitraum: 20 Nächte, dann entscheidest du.
      </p>
      <div className="lp-vp-benefits-grid lp-vp-benefits-grid--row">
        {items.map((b) => (
          <article className="lp-vp-benefit lp-ts2-benefit" key={b.title}>
            <span className="lp-ts2-benefit__num" aria-hidden="true">
              {b.num}
            </span>
            <h3 className="lp-vp-benefit__title">{b.title}</h3>
            <p className="lp-vp-benefit__body">{b.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ───────── Produkt-Trio-Closer (kanonisches LP-Muster, Live-Preise) ───────── */
function ProdukteSection() {
  const {data} = useLp();
  return (
    <div className="lp-ts2-produkte">
      <ProduktTrio dataSection="lp-ts-produkte" products={data.products} />
      <p className="lp-vp-pricing__fineprint">
        Alle Produkte: 20 Tage risikofrei testen · 0 % Finanzierung über Klarna ·
        kostenloser Versand · Käuferschutz
      </p>
    </div>
  );
}

/* ───────── QB-Sichtweise / Signatur (du-Anrede, Marke) ───────── */
function SignatureSection() {
  return (
    <section
      className="lp-vp-section lp-vp-section--dark lp-ts-signature"
      data-section="lp-ts-signatur"
    >
      <span className="eyebrow">Unsere Sichtweise</span>
      <h2>Wir verkaufen dir keinen Schmuck.</h2>
      <p className="lp-ts-signature__body">
        Der QiOne<sup>®</sup> ist schön — aber das ist nicht der Punkt. Der eigentliche Wert
        ist unsichtbar: kohärentes Wasser in deinem Körper, Zellen, die besser geschützt
        sind, ein Nervensystem, das nachts endlich herunterfahren darf. Der Schmuck ist nur
        das Vehikel. Was du wirklich mitnimmst, ist die Ruhe.
      </p>
      <p className="lp-ts-signature__sign">— Dein Qi Blanco® Team</p>
    </section>
  );
}

/* ───────── Final CTA (Zeitraum + Überzeugung, NICHT Spüren) ───────── */
function FinalCTA() {
  const {data} = useLp();
  const product = findLp(data, 'qione-2-pro');
  const priceAmount = product?.priceRange?.minVariantPrice?.amount;
  const price = fmtBrutto(priceAmount);
  const compare = fmtRaw(getCompareAt(product));
  const image = product?.featuredImage?.url || product?.images?.[0]?.url;
  return (
    <section className="lp-vp-final-cta" data-section="lp-ts-final-cta">
      <div className="lp-vp-final-cta__inner">
        <div className="lp-vp-final-cta__media">
          {image && <img src={image} alt="QiOne® 2 Pro" loading="lazy" />}
          <div className="lp-vp-final-cta__stamp" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <defs>
                <path
                  id="lp-ts-cta-arc"
                  d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"
                />
              </defs>
              <text className="lp-vp-final-cta__stamp-text">
                <textPath href="#lp-ts-cta-arc" startOffset="0">
                  20 NÄCHTE RISIKOFREI · GELD ZURÜCK ·{' '}
                </textPath>
              </text>
            </svg>
            <div className="lp-vp-final-cta__stamp-core">
              <span className="lp-vp-final-cta__stamp-num">20</span>
              <span className="lp-vp-final-cta__stamp-unit">Nächte</span>
            </div>
          </div>
        </div>
        <div className="lp-vp-final-cta__body">
          <span className="eyebrow">Bereit für ruhigere Nächte?</span>
          <h2>Gib deinem Schlaf 20 Nächte. Den Rest entscheidest du.</h2>
          <p className="lp-vp-final-cta__lede">
            Trage den QiOne® 2 Pro 20 Nächte lang. Bist du danach nicht überzeugt, erstatten
            wir dir den vollen Kaufpreis. Ohne Wenn und Aber.
          </p>
          {price && (
            <div className="lp-vp-final-cta__price">
              <span className="lp-vp-final-cta__users">+ 14.000 aktive Nutzer</span>
              <div className="lp-vp-final-cta__price-row">
                <span className="lp-vp-final-cta__price-value">{price}</span>
                {compare && <sup className="lp-vp-final-cta__compare">{compare}</sup>}
              </div>
              <span className="lp-vp-final-cta__price-meta">einmalig · inkl. MwSt.</span>
              <div className="lp-vp-final-cta__pay">
                <img
                  src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/800px-Klarna_Payment_Badge.svg_7f45bfec-1ac3-4234-9914-98cf49b040f4.png?v=1671199816"
                  alt="Klarna"
                />
                <img
                  src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/paypal-784404_1280.webp?v=1708904082"
                  alt="PayPal"
                />
              </div>
            </div>
          )}
          <a
            className="lp-vp-btn lp-vp-btn--primary lp-vp-btn--lg"
            href="/products/qione-2-pro"
          >
            Jetzt QiOne® 2 Pro sichern
          </a>
          <ul className="lp-vp-final-cta__trust">
            <li>0 % Finanzierung über Klarna und PayPal</li>
            <li>Kostenloser Versand</li>
            <li>Käuferschutz</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ───────── Root (C-Refokus: reine Schlaf-Dramaturgie, Allrounder raus) ───────── */
export function TieferSchlaf({products}) {
  const data = {products: products || []};

  return (
    <LiveDataCtx.Provider value={{data}}>
      <div className="lp-vp lp-ts lp-ts3">
        <Hero />
        <NachtSection />
        <MechanismSection />
        <RitualSection />
        <ScienceSection />
        <ExperienceSection />
        <div data-section="lp-ts-google-reviews">
          <LpGoogleReviews />
        </div>
        <PodcastStimmen
          dataSection="lp-ts-podcast"
          clips={VIDEOS.filter((v) => v.thema === 'schlaf')}
        />
        <VideoSection />
        <SchlafraumSection />
        <GuaranteeSection />
        <ProdukteSection />
        <SignatureSection />
        <FinalCTA />
      </div>
    </LiveDataCtx.Provider>
  );
}
