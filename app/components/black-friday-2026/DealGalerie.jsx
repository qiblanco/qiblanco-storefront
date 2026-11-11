import {createContext, useContext, useRef} from 'react';
import {useElinaBewegung} from '~/components/reusables/useElinaBewegung';
import elinaBewegungStyles from '~/styles/elina-bewegung.css?url';
import dealGalerieStyles from '~/styles/bf-deal-galerie.css?url';
import dealDunkelStyles from '~/styles/bf-deal-dunkel.css?url';
import {BfCountdownLeiste} from '~/components/black-friday-2026/BfCountdownLeiste';
import {andereDeals} from '~/components/black-friday-2026/bf-deals-daten';
import {betragText} from '~/lib/betrag-text';

/*
 * BF-DEAL-SEITEN DE (Elina EL-20261111-aff06215).
 *
 * BfDealKontext trägt die Deal-Seite ({handle, deal, basis, art, link?}) in den
 * Baum. Gelesen wird er an zwei Stellen:
 *   - AddToCartButton: auf einer Deal-Seite wird der Kaufknopf zum
 *     Warenkorb-Link mit BF-Code (bf-deals-daten.js bfDealLink).
 *   - DealGalerie: „Sieh dir unsere anderen Deals an“, gesetzt von AlphaVorlage
 *     unter die Zusammenfassung (über „What's in the Box“) und von der
 *     Standard-Produktseite unter die Kaufbox.
 * Ohne Kontext (jede andere Seite) rendern beide wie bisher bzw. nichts.
 */
export const BfDealKontext = createContext(null);

export function useBfDealSeite() {
  return useContext(BfDealKontext);
}

/** Stylesheets der Deal-Seite (Galerie, dunkler Look, Elinas Bewegungs-Baukasten). */
export function BfDealStile() {
  return (
    <>
      <link rel="stylesheet" href={elinaBewegungStyles} />
      <link rel="stylesheet" href={dealGalerieStyles} />
      <link rel="stylesheet" href={dealDunkelStyles} />
    </>
  );
}

/**
 * Rahmen jeder BF-Deal-Seite: Kontext, Stylesheets und ein Wurzel-Element
 * `.bf-deal-seite[data-bf-deal-seite=<handle>]`. Daran hängt der dunkle Look
 * (bf-deal-dunkel.css, Elina EL-20261111-a9af196f) für jede Fassung der
 * Deal-Seite, ohne die normalen Produktseiten zu berühren. Ganz oben steht die
 * rote Countdown-Leiste (EL-20261111-cfcd9c5d).
 */
export function BfDealRahmen({seite, children}) {
  return (
    <BfDealKontext.Provider value={seite}>
      <BfDealStile />
      <div className="bf-deal-seite bf-deal-seite--dunkel" data-bf-deal-seite={seite.handle}>
        <BfCountdownLeiste />
        {children}
      </div>
    </BfDealKontext.Provider>
  );
}

/**
 * Wiederverwendbare Section: alle anderen BF-Deals als wischbare Kacheln
 * (Bild, rote Rabatt-Plakette, Titel, Streichpreis, Preis, „Jetzt ansehen“).
 * Mobile first: am Handy eine Bahn mit ~1,3 Kacheln im Bild, wischbar, ohne
 * Einrasten; ab 960 px passen alle vier nebeneinander.
 */
export function DealGalerie({seite: seiteProp = null, titel = 'Sieh dir unsere anderen Deals an'}) {
  const ausKontext = useBfDealSeite();
  const seite = seiteProp ?? ausKontext;
  const wurzel = useRef(null);
  useElinaBewegung(wurzel);
  if (!seite) return null;
  const deals = andereDeals(seite);
  if (!deals.length) return null;
  return (
    <section
      ref={wurzel}
      className="bfg"
      aria-labelledby="bfg-titel"
      data-bf-deal-galerie={seite.deal}
      data-section="bf-deal-galerie"
    >
      <BfDealStile />
      <h2 id="bfg-titel" className="bfg__titel" data-eb="">
        {titel}
      </h2>
      <ul className="bfg__bahn" data-eb="gruppe">
        {deals.map((d) => (
          <li key={d.id} className="bfg__kachel" data-bf-deal-kachel={d.id}>
            <a className="bfg__bildlink" href={`/products/${d.seite}`} tabIndex={-1} aria-hidden="true">
              <figure className="bfg__bild">
                <img
                  src={`${d.bild}?width=600`}
                  srcSet={`${d.bild}?width=400 400w, ${d.bild}?width=600 600w, ${d.bild}?width=900 900w`}
                  sizes="(min-width: 960px) 16rem, 72vw"
                  width="600"
                  height="450"
                  alt={d.bildAlt}
                  loading="lazy"
                  decoding="async"
                />
                <span className="bfg__plakette">{d.rabatt}</span>
              </figure>
            </a>
            <div className="bfg__text">
              <h3 className="bfg__name">
                <a href={`/products/${d.seite}`}>{d.name}</a>
              </h3>
              <p className="bfg__preise">
                <s className="bfg__alt">{betragText(d.uvp, 'EUR')}</s>{' '}
                <span className="bfg__neu">{betragText(d.preis, 'EUR')}</span>
              </p>
              <a
                className="bfg__knopf"
                href={`/products/${d.seite}`}
                aria-label={`Jetzt ansehen: ${d.name}`}
              >
                Jetzt ansehen
              </a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
