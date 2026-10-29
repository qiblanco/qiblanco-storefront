import {useId, useState} from 'react';
import {MarkeR, mitMarkeR} from '~/components/reusables/MarkeR';
import {CdnBild} from '~/components/reusables/CdnBild';
import {produktLink, BLOCK_PUBLIC} from '~/components/reusables/blockLinks';
import {vergleichSpalten} from '~/components/reusables/amazonstil-daten';
import {faqPageJsonLdString} from '~/lib/faq-schema';
import {GOOGLE_REVIEWS_URL} from '~/lib/googleRating';
import {StarRating} from '~/components/reusables/StarRating';
import {useMarktLand} from '~/lib/markt-land';
import {IgTestimonialSlideshow} from '~/components/reusables/IgTestimonialSlideshow';
import {bruttoAnzeige} from '~/lib/markt-pricing';
import {faqSichtbar, mitBreite, ratenAngebot} from './alpha-vorlage-logik';

/*
 * SLOTS DES KONFIGURATORS IM QI-ALPHA-STIL (Grossjob 20261027-GROSSJOB-apple-
 * konfigurator-qione-qihome-qibracelet-ab, s08; Schnittstelle s05/SCHNITTSTELLE.md
 * „Neuer Block ohne JSX-Änderung: als Slot“). Datengetrieben und ohne
 * Produktwissen: jede A-Fassung (QiOne® 2 Pro, QiHome® Air, QiBracelet®) gibt
 * ihre Texte aus <handle>-alpha-daten.js hinein.
 *
 *   AlphaVergleich  „Modelle vergleichen“ nach Apple: der Gewinner-Kandidat
 *                   Gerätevergleich (AmazonStil, s02 Z40) mit seinen Daten
 *                   (amazonstil-daten.js vergleichSpalten, Preise aus Shopify),
 *                   in klaren Spalten, Zeichen statt Listenpunkten, Gold nur
 *                   auf Handlung. Anker data-qb-geraetevergleich bleibt (Messung).
 *   AlphaWissen     Wissens-Kapitel im Muster TheAlphaWissen (taw-*, Etikett
 *                   in Gold statt Qi-Alpha-Rot), Quellen am Kapitel.
 *   AlphaStimmen    Google-Note mit Link + echte Google-Bewertungen (Wortlaut).
 *   AlphaFaq        Akkordeon im Muster TheAlphaFaq (taf-*), eine Frage offen,
 *                   Antworten im Server-HTML (GEO R2), {rate}/{rate12} live aus
 *                   dem Preis; ohne Ratenangebot entfällt die Raten-Frage.
 *                   FAQPage-JSON-LD genau über das, was sichtbar steht (R6/R7).
 */

/* ---- Modelle vergleichen --------------------------------------------------- */

/**
 * @param {{handle: string, daten: {ueberschrift: string, intro?: string,
 *   zeilen?: Record<string,string>, merkmale?: Record<string,string>},
 *   preise?: object, eigenerPreis?: object, block?: string}} props
 */
export function AlphaVergleich({handle, daten, preise = null, eigenerPreis = null, block = BLOCK_PUBLIC}) {
  const land = useMarktLand();
  const spalten = vergleichSpalten(handle, {preise: preise || {}, eigenerPreis, land});
  if (!daten || spalten.length < 2) return null;
  const m = {
    einsatz: 'Wo du es trägst',
    material: 'Material',
    wasser: 'Wasser und Sauna',
    studie: 'Zellstudie',
    ...(daten.merkmale ?? {}),
  };
  return (
    <div className="avv" data-qb-geraetevergleich="" data-av-vergleich="">
      <header className="avv-kopf">
        <h2 className="tas-box-titel">{mitMarkeR(daten.ueberschrift)}</h2>
        {daten.intro ? <p className="avv-intro">{mitMarkeR(daten.intro)}</p> : null}
      </header>
      <div className="avv-raster" role="list">
        {spalten.map((s) => {
          const ziel = produktLink(s.handle, block, 'kauf');
          return (
            <article
              key={s.handle}
              role="listitem"
              className={`avv-modell${s.eigenes ? ' avv-modell--hier' : ''}`}
              data-qb-vergleich-produkt={s.handle}
              aria-current={s.eigenes ? 'page' : undefined}
            >
              <div className="avv-bild">
                <CdnBild
                  src={s.bild}
                  alt={s.alt || ''}
                  anzeigeBreite={200}
                  breite={200}
                  hoehe={200}
                  sizes="200px"
                  loading="lazy"
                />
              </div>
              <h3 className="avv-name">
                <MarkeR text={s.name} />
              </h3>
              {daten.zeilen?.[s.handle] ? (
                <p className="avv-ort">{mitMarkeR(daten.zeilen[s.handle])}</p>
              ) : null}
              {s.preis ? (
                <p className="avv-preis" data-qb-vergleich-preis="">
                  {s.preis}
                </p>
              ) : null}
              {s.eigenes ? (
                <p className="avv-hier">Du bist hier</p>
              ) : (
                <a className="avv-link" href={ziel}>
                  Ansehen
                </a>
              )}
              <dl className="avv-merkmale">
                <Merkmal zeichen="ort" etikett={m.einsatz}>
                  {s.einsatz}
                </Merkmal>
                <Merkmal zeichen="material" etikett={m.material}>
                  {s.material}
                </Merkmal>
                <Merkmal zeichen={s.wasser === 'Ja' ? 'ja' : 'nein'} etikett={m.wasser}>
                  {s.wasser}
                </Merkmal>
                <Merkmal zeichen="studie" etikett={m.studie}>
                  {(s.studien ?? []).map((st, i) => (
                    <span key={st.href}>
                      {i ? ', ' : null}
                      <a href={st.href}>{st.text}</a>
                    </span>
                  ))}
                </Merkmal>
              </dl>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Merkmal({zeichen, etikett, children}) {
  return (
    <div className="avv-merkmal">
      <VergleichZeichen art={zeichen} />
      <dt>{etikett}</dt>
      <dd>{children}</dd>
    </div>
  );
}

const VZ_PFADE = {
  ort: ['M16 28s-8-7-8-14a8 8 0 0 1 16 0c0 7-8 14-8 14Z', 'M16 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'],
  material: ['M16 4 27 10v12l-11 6-11-6V10z', 'M5 10l11 6 11-6', 'M16 16v12'],
  ja: ['M16 28a12 12 0 1 0 0-24 12 12 0 0 0 0 24Z', 'm10.5 16.5 3.6 3.6 7.4-8.1'],
  nein: ['M16 28a12 12 0 1 0 0-24 12 12 0 0 0 0 24Z', 'M11 16h10'],
  studie: ['M12 4h8', 'M13.5 4v8L7 25a2 2 0 0 0 1.8 3h14.4a2 2 0 0 0 1.8-3l-6.5-13V4', 'M10 20h12'],
};

function VergleichZeichen({art}) {
  return (
    <svg
      className={`avv-zeichen avv-zeichen--${art}`}
      viewBox="0 0 32 32"
      width="32"
      height="32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {(VZ_PFADE[art] ?? []).map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

/* ---- Wissen ------------------------------------------------------------------ */

/**
 * @param {{kapitel: Array<{etikett: string, titel: string, absaetze: string[],
 *   quellen?: string[], bild?: number|null}>, bilder?: Array<{url: string, altText?: string}>,
 *   studien?: {ueberschrift: string, link_text: string, href: string}|null}} props
 */
export function AlphaWissen({kapitel, bilder = [], studien = null}) {
  if (!kapitel?.length) return null;
  return (
    <div className="taw avw" data-the-alpha-wissen="" data-av-wissen="">
      {kapitel.map((a, i) => {
        const bild = Number.isInteger(a.bild) ? bilder[a.bild] : null;
        const id = `avw-${i}`;
        return (
          <section
            key={a.titel}
            className={`taw-abschnitt${bild ? '' : ' taw-abschnitt--text'}`}
            data-taw-seite={i % 2 ? 'rechts' : 'links'}
            aria-labelledby={id}
          >
            <header className="taw-kopf">
              <p className="taw-etikett">{mitMarkeR(a.etikett)}</p>
              <h2 id={id} className="taw-titel">
                {mitMarkeR(a.titel)}
              </h2>
            </header>
            <div className="taw-raster">
              {bild ? (
                <figure className="taw-bild">
                  <img
                    src={mitBreite(bild.url, 1024)}
                    srcSet={`${mitBreite(bild.url, 512)} 512w, ${mitBreite(bild.url, 1024)} 1024w`}
                    sizes="(min-width: 1024px) 512px, calc(100vw - 32px)"
                    alt={bild.altText || ''}
                    width={1024}
                    height={1024}
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
              ) : null}
              <div className="taw-text">
                {a.absaetze.map((p) => (
                  <p key={p}>{mitMarkeR(p)}</p>
                ))}
                {a.quellen?.length ? (
                  <ol className="taw-quellen" aria-label="Quellen">
                    {a.quellen.map((q) => (
                      <li key={q}>{mitMarkeR(q)}</li>
                    ))}
                  </ol>
                ) : null}
              </div>
            </div>
          </section>
        );
      })}
      {studien?.href ? (
        <p className="avw-studien" data-av-studien="">
          <span className="avw-studien-titel">{mitMarkeR(studien.ueberschrift)}</span>
          <a className="avw-studien-link" href={studien.href}>
            {studien.link_text}
          </a>
        </p>
      ) : null}
    </div>
  );
}

/* ---- Stimmen ------------------------------------------------------------------ */

/**
 * @param {{daten: {ueberschrift: string, note?: string, link_text?: string,
 *   stimmen: Array<{text: string, quelle: string}>}}} props
 */
export function AlphaStimmen({daten, igProdukt = null}) {
  if (!daten?.stimmen?.length) return null;
  const titel = daten.ueberschrift.replace('{bewertung}', daten.note ?? '4,8');
  return (
    <div className="avs" data-av-stimmen="">
      {/* Die Überschrift ist der Weg zu Google (Sterne-Klick wie im Preisanker). */}
      <h2 className="tas-box-titel">
        <a className="avs-titel-link" href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer">
          {mitMarkeR(titel)}
        </a>
      </h2>
      <ul className="avs-liste">
        {daten.stimmen.map((s) => (
          <li key={s.text} className="avs-stimme">
            <span className="avs-sterne">
              <StarRating value={5} size={16} />
            </span>
            <blockquote className="avs-text">
              <p>{mitMarkeR(s.text)}</p>
            </blockquote>
            <p className="avs-quelle">{s.quelle}</p>
          </li>
        ))}
      </ul>
      {igProdukt ? (
        <div className="avs-ig">
          <IgTestimonialSlideshow produkt={igProdukt} ueberschrift={daten.instagram ?? undefined} />
        </div>
      ) : null}
    </div>
  );
}

/* ---- Fragen ------------------------------------------------------------------- */

/**
 * @param {{daten: {ueberschrift: string, fragen: Array<{f: string, a: string}>},
 *   angebot?: object|null}} props
 */
export function AlphaFaq({daten, angebot = null}) {
  const fragen = faqSichtbar(daten?.fragen, angebot);
  const [offen, setOffen] = useState(0);
  const basis = useId();
  if (!fragen.length) return null;
  const jsonLd = faqPageJsonLdString(fragen.map((x) => ({q: x.f, a: x.a})));
  return (
    <section className="taf taf--hell" aria-labelledby={`${basis}-titel`} data-av-faq="">
      {jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: jsonLd}} />
      ) : null}
      <div className="taf-innen">
        <h2 id={`${basis}-titel`} className="taf-titel">
          {mitMarkeR(daten.ueberschrift)}
        </h2>
        <ul className="taf-liste">
          {fragen.map((x, i) => {
            const istOffen = offen === i;
            const kopf = `${basis}-${i}-frage`;
            const rumpf = `${basis}-${i}-antwort`;
            return (
              <li key={x.f} className="taf-eintrag" data-offen={istOffen ? 'ja' : 'nein'}>
                <h3 className="taf-kopf">
                  <button
                    type="button"
                    id={kopf}
                    className="taf-frage"
                    aria-expanded={istOffen}
                    aria-controls={rumpf}
                    data-faq-frage={i}
                    onClick={() => setOffen(istOffen ? null : i)}
                  >
                    <span>{mitMarkeR(x.f)}</span>
                    <span className="taf-zeichen" aria-hidden="true" />
                  </button>
                </h3>
                <div id={rumpf} role="region" aria-labelledby={kopf} className="taf-antwort">
                  <div className="taf-antwort-innen">
                    <p>{mitMarkeR(x.a)}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/**
 * FAQ mit live berechneter Rate aus dem Preis der Kaufseite (Markt, Währung,
 * Bruttoanzeige wie der Konfigurator).
 * @param {{daten: object, product: object}} props
 */
export function AlphaFaqMitRate({daten, product}) {
  const land = useMarktLand();
  const money = product?.selectedOrFirstAvailableVariant?.price;
  const brutto = money ? bruttoAnzeige(money.amount, product.handle, money.currencyCode, land) : 0;
  const angebot = ratenAngebot({brutto, waehrung: money?.currencyCode || 'EUR', land});
  return <AlphaFaq daten={daten} angebot={angebot} />;
}
