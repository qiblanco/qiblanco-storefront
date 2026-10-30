import {useEffect, useState} from 'react';
import szsAppleStyles from '~/styles/szs-apple.css?url';
import {mitMarkeR} from '~/components/reusables/MarkeR';
import {Produkt360Video} from '~/components/reusables/Produkt360Video';
import {GitterchipMoleculesScrub} from '~/components/reusables/GitterchipMoleculesScrub';
import {ScrollScrubVideo} from '~/components/reusables/ScrollScrubVideo';
import {YoutubeTimestamp} from '~/components/reusables/YoutubeTimestamp';
import {BLOCK_LP, produktLink} from '~/components/reusables/blockLinks';
import {fallbackPreis} from '~/lib/campaign-fallback-prices';
import {useLpPreis} from '~/lib/lp-preis';
import {AppleSeite} from '../AppleSeite';
import {AppleAnna, AppleBildBand, AppleFakten, AppleKapitel, AppleStimmen} from '../AppleSektionen';
import {bildSrcSet, mitBreite} from '../apple-seite-logik';
import {
  EBENEN,
  GARANTIE,
  MODELLE,
  KOPF,
  LABOR,
  MIKROSKOP,
  SCHLUSS,
  SEITE_JE_VARIANTE,
  STIMMEN,
  VERTRAUEN,
  VIDEOS,
  WIRKPRINZIP,
  ZAHLWEGE,
  teileFuer,
} from './szs-daten';

/*
 * APPLE-FASSUNG /pages/schlaf-zellen-schutz und Testarme b2, k50, k25 (s06).
 * Welche Teile ein Arm trägt: szs-daten.js teileFuer(). Ziel und Wortlaut des
 * Kaufknopfs sind die von C (SchlafZellenSchutz.jsx QIONE_ZIEL/QIONE_CTA):
 * „Jetzt kaufen“ auf die Kampagnen-Kaufseite /pages/qione-2-pro (BLOCK_LP).
 * Ein Ziel, eine Formulierung (probe_lp_cta_einstimmig.py).
 *
 * MESSANKER: die Sektionen des Baukastens tragen data-section="as-<art>".
 * Die Knöpfe, an denen die laufenden Tests messen, behalten ihre Schlüssel aus
 * C (lp-a-weiter-1/2/6, lp-a-pricing, lp-a-final, lp-b-sticky-kaufknopf), damit
 * die Klicks je Knopf im selben Namen weiterlaufen. Der Umbau ist trotzdem ein
 * Epochenbruch je Test (Eintrag in heatmap-manager/config/experimente.yaml).
 */

const QIONE_ZIEL = produktLink('qione-2-pro', BLOCK_LP, 'kauf');
const QIONE_CTA = 'Jetzt kaufen';

/*
 * SCROLLSTRECKE DER BEIDEN VIDEOS: 200 Bildschirmhöhen statt 300/250 (Gitterchip®
 * in C) und 500/400 (Mikroskop, Vorgabe des Bausteins). Grund: design-rubrik
 * technisch, Sektions-Ausreisser max/median > 5 (web-soll.yaml) — gemessen
 * 4478 px Mikroskop bei Median 407 px auf der Vorschau 30.10. Christians
 * Anordnung (Video zuerst, dann Erklärung) bleibt.
 */
const SCROLL_VH = 200;

function usePreise(products) {
  const {preisLabelVon} = useLpPreis();
  const preis = (handle) => {
    const p = (products || []).find((x) => x?.handle === handle);
    if (p?.priceRange?.minVariantPrice?.amount) return preisLabelVon(p);
    return fallbackPreis(handle)?.label || null;
  };
  return preis;
}

function Zahlwege() {
  return (
    <span className="szs-zahlwege">
      {ZAHLWEGE.map((z) => (
        <img
          key={z.alt}
          src={mitBreite(z.src, 160)}
          alt={z.alt}
          width={z.breite}
          height={z.hoehe}
          loading="lazy"
          decoding="async"
        />
      ))}
    </span>
  );
}

function Kaufzeile({preis}) {
  return (
    <div className="szs-kauf">
      <a className="btn btn--primary as-knopf" href={QIONE_ZIEL} data-as-cta="primary">
        {QIONE_CTA}
      </a>
      {preis ? <p className="as-preis">{preis}</p> : null}
      <p className="szs-vertrauen">{VERTRAUEN}</p>
      <Zahlwege />
    </div>
  );
}

/*
 * KOPF. Christian 19./20.09.2026: mobil steht die 360-Grad-Drehung direkt
 * hinter „Innere Ruhe.“ und vor dem Absatz (Reihenfolge im HTML, Probe
 * probe_video_mobil_nach_innere_ruhe__20260920.py). Desktop: Text links,
 * Video rechts über benannte Rasterbereiche (szs-apple.css).
 */
function Kopf({preis}) {
  return (
    <section className="as-hero szs-kopf" data-section="as-hero">
      <div className="szs-kopf-oben">
        <p className="as-overline">{mitMarkeR(KOPF.overline)}</p>
        <h1 className="as-h1">{mitMarkeR(KOPF.titel)}</h1>
        <p className="szs-dreizeiler">
          {KOPF.dreizeiler.map((z) => (
            <span key={z}>{z}</span>
          ))}
        </p>
      </div>
      <figure className="szs-kopf-video">
        <Produkt360Video alt="QiOne® 2 Pro in der 360-Grad-Ansicht" />
      </figure>
      <div className="szs-kopf-unten">
        <p className="as-unter">{mitMarkeR(KOPF.absatz)}</p>
        <p className="szs-beleg">{KOPF.beleg}</p>
        <p className="szs-aufruf">{KOPF.aufruf}</p>
        <Kaufzeile preis={preis} />
      </div>
    </section>
  );
}

/** Weiter-Knopf zwischen den Abschnitten (Schlüssel lp-a-weiter-<nr> aus C). */
function Weiter({nr, preis, nurMobil = false}) {
  return (
    <section
      className={`as-sektion szs-weiter${nurMobil ? ' szs-nur-mobil' : ''}`}
      data-section={`lp-a-weiter-${nr}`}
    >
      <p className="szs-weiter-name">{mitMarkeR('QiOne® 2 Pro')}</p>
      <Kaufzeile preis={preis} />
    </section>
  );
}

function Labor() {
  return (
    <>
      <AppleFakten titel={LABOR.titel} kacheln={LABOR.kacheln} />
      <section className="as-sektion szs-labor-satz">
        <p className="as-absatz">{LABOR.satz}</p>
        <a className="as-link" href={LABOR.link.href}>
          {LABOR.link.text}
        </a>
      </section>
    </>
  );
}

function Videos() {
  return (
    <section className="as-sektion szs-videos" data-section="as-videos">
      <h2 className="as-h2">{mitMarkeR(VIDEOS.titel)}</h2>
      <ul className="szs-videos-liste">
        {VIDEOS.liste.map((v) => (
          <li key={v.id} className="szs-video">
            <YoutubeTimestamp
              videoId={v.id}
              titel={v.titel}
              className="szs-yt"
              sizes="(min-width: 750px) 33vw, 100vw"
            />
            <p className="as-etikett">{mitMarkeR(v.tag)}</p>
            <p className="szs-video-titel">{mitMarkeR(v.titel)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Modelle({products, preis}) {
  const bildVon = (handle) =>
    (products || []).find((x) => x?.handle === handle)?.featuredImage || null;
  return (
    <section className="as-sektion szs-modelle" data-section="lp-a-pricing" aria-labelledby="szs-modelle-titel">
      <h2 id="szs-modelle-titel" className="as-h2">
        {mitMarkeR(MODELLE.titel)}
      </h2>
      <ul className="szs-modelle-liste">
        {MODELLE.liste.map((g) => {
          const bild = bildVon(g.handle);
          return (
            <li key={g.handle} className="szs-modell">
              {bild?.url ? (
                <img
                  className="as-bild szs-modell-bild"
                  src={mitBreite(bild.url, 600)}
                  srcSet={bildSrcSet(bild.url, [300, 600])}
                  sizes="(min-width: 750px) 300px, 60vw"
                  alt={g.name.replace('®', '')}
                  width={600}
                  height={600}
                  loading="lazy"
                  decoding="async"
                />
              ) : null}
              <h3 className="szs-modell-name">{mitMarkeR(g.name)}</h3>
              <p className="szs-modell-zeile">{g.zeile}</p>
              {preis(g.handle) ? <p className="as-preis">{preis(g.handle)}</p> : null}
              <div className="szs-modell-wege">
                <a
                  className="btn btn--primary as-knopf"
                  href={produktLink(g.handle, BLOCK_LP, 'kauf')}
                  data-as-cta="primary"
                >
                  {QIONE_CTA}
                </a>
                <a className="as-link" href={produktLink(g.handle, BLOCK_LP, 'detail')}>
                  Mehr erfahren
                </a>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="szs-modelle-zeile">{MODELLE.zeile}</p>
    </section>
  );
}

function Schluss({preis}) {
  return (
    <section className="as-cta-band as-dunkel szs-schluss" data-section="lp-a-final">
      <div className="as-cta-innen">
        <h2 className="as-h2">{mitMarkeR(SCHLUSS.titel)}</h2>
        <p className="as-unter">{SCHLUSS.text}</p>
        <Kaufzeile preis={preis} />
      </div>
    </section>
  );
}

/*
 * FESTER KAUFKNOPF MOBIL (A, K50, K25; nicht B2). Dieselbe Regel wie C
 * (StickyKaufknopf): sichtbar, sobald der Kopf aus dem Bild ist, und nicht,
 * solange Geräte oder Schluss im Bild sind. Inhalt nur im sichtbaren Zustand
 * im DOM (KaufknopfChatSignal misst bei childList). Nur bis 749 px.
 */
function FesterKnopf({seite}) {
  const [sichtbar, setSichtbar] = useState(false);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const wurzel = document.querySelector(`[data-apple-seite='${seite}']`);
    const kopf = wurzel?.querySelector('[data-section="as-hero"]');
    if (!kopf) return undefined;
    const enden = Array.from(
      wurzel.querySelectorAll('[data-section="lp-a-pricing"], [data-section="lp-a-final"]'),
    );
    const lage = {kopfImBild: true, enden: new Set()};
    const beobachter = new IntersectionObserver((eintraege) => {
      for (const e of eintraege) {
        if (e.target === kopf) lage.kopfImBild = e.isIntersecting;
        else if (e.isIntersecting) lage.enden.add(e.target);
        else lage.enden.delete(e.target);
      }
      setSichtbar(!lage.kopfImBild && lage.enden.size === 0);
    });
    beobachter.observe(kopf);
    enden.forEach((el) => beobachter.observe(el));
    return () => beobachter.disconnect();
  }, [seite]);
  return (
    <div
      className={`szs-fest${sichtbar ? ' szs-fest--sichtbar' : ''}`}
      data-section="lp-b-sticky-kaufknopf"
      aria-hidden={sichtbar ? undefined : 'true'}
    >
      {sichtbar ? (
        <>
          <span className="szs-fest-name">{mitMarkeR('QiOne® 2 Pro')}</span>
          <a className="btn btn--primary as-knopf" href={QIONE_ZIEL}>
            {QIONE_CTA}
          </a>
        </>
      ) : null}
    </div>
  );
}

/**
 * @param {{products?: Array<any>, variante?: 'a'|'b2'|'k50'|'k25'}} props
 *   products: dieselbe Loader-Abfrage wie C (qione, bracelet, qihome).
 */
export function SchlafZellenSchutzApple({products = [], variante = 'a'}) {
  const t = teileFuer(variante);
  const seite = SEITE_JE_VARIANTE[t.variante];
  const preis = usePreise(products);
  const qionePreis = preis('qione-2-pro');
  return (
    <>
      <link rel="stylesheet" href={szsAppleStyles} />
      <AppleSeite seite={seite}>
        <Kopf preis={qionePreis} />
        {t.gitterchipVideo ? (
          <GitterchipMoleculesScrub dataSection="lp-a-gitterchip-video" heightVhDesktop={SCROLL_VH} heightVhMobile={SCROLL_VH} />
        ) : null}
        {t.wirkprinzip ? (
          <AppleKapitel etikett={WIRKPRINZIP.etikett} titel={WIRKPRINZIP.titel} absaetze={WIRKPRINZIP.absaetze} />
        ) : null}
        {t.ebenen ? EBENEN.map((e, i) => <AppleBildBand key={e.etikett} index={i} {...e} />) : null}
        {t.weiter1 ? <Weiter nr={1} preis={qionePreis} nurMobil={t.weiter1 === 'mobil'} /> : null}
        {t.mikroskopVideo ? <ScrollScrubVideo dataSection="lp-a-mikroskop-video" heightVhDesktop={SCROLL_VH} heightVhMobile={SCROLL_VH} {...MIKROSKOP} /> : null}
        {t.labor ? <Labor /> : null}
        {t.weiter6 ? <Weiter nr={6} preis={qionePreis} /> : null}
        <AppleStimmen titel={STIMMEN.titel} stimmen={STIMMEN.stimmen} link={STIMMEN.link} />
        {t.weiter2 ? <Weiter nr={2} preis={qionePreis} /> : null}
        {t.videos ? <Videos /> : null}
        <AppleFakten titel={GARANTIE.titel} kacheln={GARANTIE.kacheln} />
        <Modelle products={products} preis={preis} />
        {t.schluss ? <Schluss preis={qionePreis} /> : null}
        <AppleAnna />
        {t.sticky ? <FesterKnopf seite={seite} /> : null}
      </AppleSeite>
    </>
  );
}

export default SchlafZellenSchutzApple;
