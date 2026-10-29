import {useId} from 'react';
import {mitMarkeR} from '~/components/reusables/MarkeR';
import {faqPageJsonLdString} from '~/lib/faq-schema';
import {absaetze, bandSeite, bildSrcSet, mitBreite} from './apple-seite-logik';

/*
 * SEKTIONEN DES APPLE-SEITENBAUKASTENS (Grossjob 20261029-GROSSJOB-alle-shop-
 * seiten-apple-niveau-ausser-seo-geo, s03). Extrahiert aus den live
 * Apple-Kaufseiten (/products/qione-2-pro, qihome-air, qibracelet: AlphaVorlage
 * + AlphaVorlageSlots + the-alpha-produkt.css), ohne Produktwissen und ohne
 * Kaufbox. Daten kommen von der Seite, Stil nur aus apple-seite.css (as-*).
 *
 *   AppleHero      großes Bild, Overline, H1, Kurzzeile, ein oder zwei Knöpfe
 *   AppleFakten    Faktenkacheln: Zahl, Titel, ein Satz
 *   AppleBildBand  Bild und Text nebeneinander, abwechselnd links/rechts
 *   AppleKapitel   Kapitel mit Gold-Etikett, Absätze, Quellen
 *   AppleStimmen   Kundenstimmen im Wortlaut (keine Sterne als Kaufargument)
 *   AppleFaq       Fragen als Klappen, Antworten im Server-HTML
 *   AppleCtaBand   dunkles Band mit einer Handlung
 *   AppleAnna      „Eine Frage? Frag Anna.“ (der Chat selbst läuft global
 *                  aus root.jsx; eine Seite mit Apple-Fassung trägt nie
 *                  handle.filmSeite, sonst fiele Anna weg)
 *
 * Bewusst NICHT im Baukasten (Christian 29.10.2026): Preisanker-Dreizeiler
 * (Google-Note, Nutzerzahl), Schild „Ultimate Power“/„Bestseller“.
 * Messung ohne eigenen Pixel: jede Sektion trägt data-section="as-<art>"
 * (cookielose Zählung public/qiblanco-qpx-basis.js zählt „gesehen“ und Klicks).
 */

/** Bild in fester Proportion; das LCP-Bild (Hero) lädt sofort. */
function AsBild({bild, sizes, sofort = false, klasse = 'as-bild'}) {
  if (!bild?.url) return null;
  const breite = bild.breite ?? 1500;
  const hoehe = bild.hoehe ?? Math.round((breite * 2) / 3);
  return (
    <img
      className={klasse}
      src={mitBreite(bild.url, 1500)}
      srcSet={bildSrcSet(bild.url)}
      sizes={sizes}
      alt={bild.alt ?? ''}
      width={breite}
      height={hoehe}
      loading={sofort ? 'eager' : 'lazy'}
      // React 18 kennt fetchPriority nicht: klein geschrieben geht das Attribut unverändert ins HTML.
      fetchpriority={sofort ? 'high' : undefined}
      decoding={sofort ? 'sync' : 'async'}
    />
  );
}

/** Ein Knopf des Hauses (.btn--primary / .btn--secondary), keine eigene Farbe. */
function AsKnopf({cta, art = 'primary'}) {
  if (!cta?.href || !cta?.text) return null;
  return (
    <a className={`btn btn--${art} as-knopf`} href={cta.href} data-as-cta={art}>
      {mitMarkeR(cta.text)}
    </a>
  );
}

/**
 * Knopfzeile. `preis` (optional, s04): der Shopify-Preis als Zeile unter dem
 * Kaufknopf, damit kein Kaufknopf ohne Preis steht (Sicht-Tor
 * kaufknopf_kontext). Ohne `preis` rendert die Zeile wie vorher.
 */
function AsKnoepfe({cta, cta2, preis}) {
  if (!cta && !cta2) return null;
  const knoepfe = (
    <div className="as-knoepfe">
      <AsKnopf cta={cta} />
      <AsKnopf cta={cta2} art="secondary" />
    </div>
  );
  if (!preis) return knoepfe;
  return (
    <>
      {knoepfe}
      <p className="as-preis">{preis}</p>
    </>
  );
}

/* ---- Hero ------------------------------------------------------------------ */

/**
 * @param {{overline?: string, titel: string, unter?: string, bild: {url: string,
 *   alt?: string, breite?: number, hoehe?: number}, cta?: {text: string, href: string},
 *   cta2?: {text: string, href: string}, dunkel?: boolean}} props
 */
export function AppleHero({overline, titel, unter, bild, cta, cta2, preis, dunkel = false}) {
  return (
    <section className={`as-hero${dunkel ? ' as-dunkel' : ''}`} data-section="as-hero">
      <div className="as-hero-text">
        {overline ? <p className="as-overline">{mitMarkeR(overline)}</p> : null}
        <h1 className="as-h1">{mitMarkeR(titel)}</h1>
        {unter ? <p className="as-unter">{mitMarkeR(unter)}</p> : null}
        <AsKnoepfe cta={cta} cta2={cta2} preis={preis} />
      </div>
      <figure className="as-hero-bild">
        <AsBild bild={bild} sizes="(min-width: 1200px) 1200px, 100vw" sofort />
      </figure>
    </section>
  );
}

/* ---- Fakten ---------------------------------------------------------------- */

/**
 * @param {{titel?: string, kacheln: Array<{zahl: string, titel?: string, satz: string}>}} props
 */
export function AppleFakten({titel, kacheln}) {
  if (!kacheln?.length) return null;
  return (
    <section className="as-sektion" data-section="as-fakten">
      {titel ? <h2 className="as-h2">{mitMarkeR(titel)}</h2> : null}
      <ul className="as-kacheln">
        {kacheln.map((k) => (
          <li key={`${k.zahl}-${k.satz}`} className="as-kachel">
            <span className="as-kachel-zahl">{mitMarkeR(k.zahl)}</span>
            {k.titel ? <span className="as-kachel-titel">{mitMarkeR(k.titel)}</span> : null}
            <span className="as-kachel-satz">{mitMarkeR(k.satz)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---- Bild-Text-Band -------------------------------------------------------- */

/**
 * @param {{etikett?: string, titel: string, text: string|string[], bild: object,
 *   seite?: 'links'|'rechts', cta?: {text: string, href: string}, index?: number}} props
 */
export function AppleBildBand({etikett, titel, text, bild, seite, cta, preis, index = 0}) {
  return (
    <section className="as-sektion as-band" data-band-seite={bandSeite(index, seite)} data-section="as-band">
      <figure className="as-band-bild">
        <AsBild bild={bild} sizes="(min-width: 750px) 50vw, 100vw" />
      </figure>
      <div className="as-band-text">
        {etikett ? <p className="as-etikett">{mitMarkeR(etikett)}</p> : null}
        <h2 className="as-h2">{mitMarkeR(titel)}</h2>
        {absaetze(text).map((p) => (
          <p key={p} className="as-absatz">
            {mitMarkeR(p)}
          </p>
        ))}
        <AsKnoepfe cta={cta} preis={preis} />
      </div>
    </section>
  );
}

/* ---- Kapitel --------------------------------------------------------------- */

/**
 * @param {{etikett: string, titel: string, absaetze: string[], quellen?: string[],
 *   bild?: object|null, link?: {text: string, href: string}}} props
 */
export function AppleKapitel({etikett, titel, absaetze: teile, quellen = [], bild = null, link = null}) {
  const id = useId();
  return (
    <section className="as-sektion as-kapitel" aria-labelledby={id} data-section="as-kapitel">
      <header className="as-kapitel-kopf">
        <p className="as-etikett">{mitMarkeR(etikett)}</p>
        <h2 id={id} className="as-h2">
          {mitMarkeR(titel)}
        </h2>
      </header>
      <div className={`as-kapitel-raster${bild?.url ? '' : ' as-kapitel-raster--text'}`}>
        {bild?.url ? (
          <figure className="as-kapitel-bild">
            <AsBild bild={bild} sizes="(min-width: 1024px) 560px, 100vw" />
          </figure>
        ) : null}
        <div className="as-kapitel-text">
          {absaetze(teile).map((p) => (
            <p key={p} className="as-absatz">
              {mitMarkeR(p)}
            </p>
          ))}
          {link?.href ? (
            <a className="as-link" href={link.href}>
              {mitMarkeR(link.text)}
            </a>
          ) : null}
          {quellen?.length ? (
            <ol className="as-quellen" aria-label="Quellen">
              {quellen.map((q) => (
                <li key={q}>{mitMarkeR(q)}</li>
              ))}
            </ol>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* ---- Stimmen --------------------------------------------------------------- */

/**
 * Kundenstimmen im Wortlaut mit Herkunft. Keine Sterne, keine Note: der
 * Beweis steht im Satz des Kunden, nicht in einer Zahl (kein Preisanker).
 * @param {{titel: string, stimmen: Array<{text: string, quelle: string}>, link?: {text: string, href: string}}} props
 */
export function AppleStimmen({titel, stimmen, link = null}) {
  if (!stimmen?.length) return null;
  return (
    <section className="as-sektion" data-section="as-stimmen">
      <h2 className="as-h2">{mitMarkeR(titel)}</h2>
      <ul className="as-stimmen">
        {stimmen.map((s) => (
          <li key={s.text} className="as-stimme">
            <blockquote className="as-stimme-text">
              <p>{mitMarkeR(s.text)}</p>
            </blockquote>
            <p className="as-stimme-quelle">{s.quelle}</p>
          </li>
        ))}
      </ul>
      {link?.href ? (
        <a className="as-link" href={link.href}>
          {mitMarkeR(link.text)}
        </a>
      ) : null}
    </section>
  );
}

/* ---- Fragen ---------------------------------------------------------------- */

/**
 * Klappen über <details>: Antworten stehen im Server-HTML (GEO R2), ohne JS
 * bedienbar, die erste Frage offen. FAQPage-JSON-LD nur mit `jsonLd`, dann
 * genau über das Sichtbare (R6/R7; höchstens eine FAQPage je Seite).
 * @param {{titel: string, fragen: Array<{f: string, a: string}>, jsonLd?: boolean}} props
 */
export function AppleFaq({titel, fragen, jsonLd = false}) {
  const id = useId();
  if (!fragen?.length) return null;
  const ld = jsonLd ? faqPageJsonLdString(fragen.map((x) => ({q: x.f, a: x.a}))) : null;
  return (
    <section className="as-sektion as-faq" aria-labelledby={id} data-section="as-faq">
      {ld ? <script type="application/ld+json" dangerouslySetInnerHTML={{__html: ld}} /> : null}
      <h2 id={id} className="as-h2">
        {mitMarkeR(titel)}
      </h2>
      <div className="as-faq-liste">
        {fragen.map((x, i) => (
          <details key={x.f} className="as-faq-eintrag" open={i === 0}>
            <summary className="as-faq-frage">
              <span>{mitMarkeR(x.f)}</span>
              <span className="as-faq-zeichen" aria-hidden="true" />
            </summary>
            <div className="as-faq-antwort">
              <p>{mitMarkeR(x.a)}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

/* ---- CTA-Band -------------------------------------------------------------- */

/**
 * @param {{titel: string, text?: string, cta: {text: string, href: string},
 *   cta2?: {text: string, href: string}, hell?: boolean}} props
 */
export function AppleCtaBand({titel, text, cta, cta2, preis, hell = false}) {
  return (
    <section className={`as-cta-band${hell ? '' : ' as-dunkel'}`} data-section="as-cta">
      <div className="as-cta-innen">
        <h2 className="as-h2">{mitMarkeR(titel)}</h2>
        {text ? <p className="as-unter">{mitMarkeR(text)}</p> : null}
        <AsKnoepfe cta={cta} cta2={cta2} preis={preis} />
      </div>
    </section>
  );
}

/* ---- Anna ------------------------------------------------------------------ */

/**
 * @param {{titel?: string, text?: string}} props
 */
export function AppleAnna({
  titel = 'Eine Frage? Frag Anna.',
  text = 'Anna antwortet dir sofort im Chat. Per E-Mail antwortet dir unser Team persönlich, werktags.',
}) {
  return (
    <section className="as-sektion as-anna" data-apple-anna="" data-section="as-anna">
      <span className="as-anna-zeichen" aria-hidden="true" />
      <div>
        <h3 className="as-anna-titel">{mitMarkeR(titel)}</h3>
        <p className="as-absatz">{mitMarkeR(text)}</p>
      </div>
    </section>
  );
}

/* ---- Datengetrieben -------------------------------------------------------- */

export const SEKTIONEN = Object.freeze({
  hero: AppleHero,
  fakten: AppleFakten,
  band: AppleBildBand,
  kapitel: AppleKapitel,
  stimmen: AppleStimmen,
  faq: AppleFaq,
  cta: AppleCtaBand,
  anna: AppleAnna,
});

/** Eine Sektion aus Daten: {art: 'hero'|'fakten'|…, …props}. Unbekannt -> nichts. */
export function Sektion({art, ...props}) {
  const Komponente = SEKTIONEN[art];
  return Komponente ? <Komponente {...props} /> : null;
}
