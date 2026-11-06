import {useState} from 'react';
import {CartForm} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {mitMarkeR} from '~/components/reusables/MarkeR';
import {laengeCm} from '~/components/product-pages/alpha-vorlage-logik';
import {useKaufleisteSicht} from '~/lib/kaufleiste-sicht';
import {useMarktLand} from '~/lib/markt-land';
import {bruttoAnzeige} from '~/lib/markt-pricing';
import {
  bf2026NormalePfad,
  bf2026PreisStand,
  bf2026StartVariante,
  bf2026Varianten,
  bf2026Zeilen,
} from '~/data/black-friday-2026';
import {detailKaufleisteSichtbar} from '~/components/apple-seite/produkt-details/detail-kaufleiste-lage';
import {useBf2026Zeit} from './Bf2026Uhr';

/*
 * KAUFEN (Christian 03.11.2026: „es darf schon Bundles geben, aber eben nicht
 * mehr Bundles in Shopify“): ein Klick legt alle Einzelprodukte eines Angebots
 * in EINER LinesAdd-Aktion in den Warenkorb. Derselbe Weg wie AddToCartButton
 * (CartForm auf /cart, danach die Warenkorb-Schublade), hier mit eigenem <button>,
 * weil der Knopf data-bf-kaufen trägt (Messvertrag s04 Punkt 13) und die Datei des
 * Warenkorb-Wegs unverändert bleibt. Kein neuer Tracking-Key.
 *
 * Vorwahl Kette 60 cm: die meistverkaufte Länge seit 2024 (696 von 1946,
 * Grossjob 20261027 s13/mess/r3). Ausverkauftes ist sichtbar gesperrt.
 */
const KETTE_VORWAHL_CM = 60;

function vorwahl(handle) {
  return handle === 'qione-kette' ? (v) => laengeCm(v?.title) === KETTE_VORWAHL_CM : null;
}

export function bf2026StartWahl(angebot, produkte) {
  const wahl = {};
  for (const {produkt} of angebot.artikel) {
    wahl[produkt] = bf2026StartVariante(produkte?.[produkt], vorwahl(produkt));
  }
  return wahl;
}

/** Name einer Variante: Kette „60 cm“, Armband „M“ (aus „M – 19“). */
function variantenName(handle, variante) {
  const cm = laengeCm(variante?.title);
  if (handle === 'qione-kette' && cm) return `${cm} cm`;
  return String(variante?.title ?? '').split(/[–-]/)[0].trim();
}

const WAHL_TITEL = {qibracelet: 'Größe', 'qione-kette': 'Kettenlänge'};

function Variantenwahl({angebot, produkte, wahl, setWahl}) {
  return angebot.artikel.map(({produkt}) => {
    const varianten = bf2026Varianten(produkte?.[produkt]);
    if (!varianten.length) return null;
    return (
      <fieldset key={produkt} className="bf-wahl">
        <legend className="bf-wahl-titel">{WAHL_TITEL[produkt] ?? 'Auswahl'}</legend>
        <div className="bf-wahl-chips">
          {varianten.map((v) => (
            <label key={v.id} className="bf-chip" data-aus={v.availableForSale ? undefined : ''}>
              <input
                type="radio"
                name={`bf-${angebot.key}-${produkt}`}
                value={v.id}
                checked={wahl[produkt] === v.id}
                disabled={!v.availableForSale}
                onChange={() => setWahl({...wahl, [produkt]: v.id})}
              />
              <span className="bf-chip-text">{variantenName(produkt, v)}</span>
              {v.availableForSale ? null : <span className="bf-chip-aus">ausverkauft</span>}
            </label>
          ))}
        </div>
      </fieldset>
    );
  });
}

function Preis({stand}) {
  if (!stand.preis && !stand.zeile && !stand.zusatz) return null;
  return (
    <div className="bf-preis">
      {stand.preis ? (
        <p className="bf-preis-zeile">
          <strong className="bf-preis-bf">{stand.preis}</strong> <span className="bf-preis-statt">{stand.statt}</span>
        </p>
      ) : null}
      {stand.zeile ? <p className="bf-preis-zeile bf-preis-heute">{stand.zeile}</p> : null}
      {stand.zusatz ? <p className="bf-preis-zusatz">{stand.zusatz}</p> : null}
    </div>
  );
}

function istPreis(angebot, produkte, wahl, land) {
  let betrag = 0;
  let waehrung = null;
  for (const {produkt, menge} of angebot.artikel) {
    const v = produkte?.[produkt]?.variants?.nodes?.find((x) => x.id === wahl[produkt]);
    if (!v?.price) return null;
    waehrung = v.price.currencyCode;
    betrag += menge * bruttoAnzeige(v.price.amount, produkt, waehrung, land);
  }
  return {betrag, waehrung};
}

/**
 * Der Knopf eines Angebots. `marke` (Messvertrag s04): nur der eine Knopf im
 * Kaufblock trägt data-bf-kaufen, der Knopf im Schlussband teilt sich die Wahl.
 */
export function Bf2026Knopf({angebot, produkte, wahl, marke = true}) {
  const {open} = useAside();
  const zeilen = bf2026Zeilen(angebot, produkte, wahl);
  const geladen = angebot.artikel.every(({produkt}) => produkte?.[produkt]);
  const kaufbar = zeilen.length > 0;
  const knopf = kaufbar ? 'In den Warenkorb' : geladen ? 'Ausverkauft' : 'Gerade nicht verfügbar';
  return (
    <CartForm route="/cart" inputs={{lines: zeilen}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher) => (
        <button
          className="btn--primary as-knopf bf-knopf"
          data-qb-kaufknopf=""
          data-bf-kaufen={marke ? angebot.key : undefined}
          type="submit"
          onClick={() => open('cart')}
          disabled={!kaufbar || fetcher.state !== 'idle'}
        >
          {knopf}
        </button>
      )}
    </CartForm>
  );
}

/**
 * Preiszeile, Variantenwahl und Knopf eines Angebots. Die Wahl steht hier, außer
 * die Angebotsseite reicht ihre eigene herein (sie teilt sie mit dem Schlussband).
 */
export function Bf2026Kauf({angebot, produkte, normalerName, wahl: wahlAussen, setWahl: setWahlAussen}) {
  const {phase} = useBf2026Zeit();
  const land = useMarktLand();
  const [wahlInnen, setWahlInnen] = useState(() => bf2026StartWahl(angebot, produkte));
  const wahl = wahlAussen ?? wahlInnen;
  const setWahl = setWahlAussen ?? setWahlInnen;

  if (phase === 'vorbei') {
    return (
      <div className="bf-kauf">
        <a className="btn btn--primary as-knopf" href={bf2026NormalePfad(angebot)}>
          {mitMarkeR(`Zum ${normalerName}`)}
        </a>
      </div>
    );
  }

  const stand = bf2026PreisStand(angebot, phase, istPreis(angebot, produkte, wahl, land));
  return (
    <div className="bf-kauf">
      <Preis stand={stand} />
      <Variantenwahl angebot={angebot} produkte={produkte} wahl={wahl} setWahl={setWahl} />
      <Bf2026Knopf angebot={angebot} produkte={produkte} wahl={wahl} />
    </div>
  );
}

/**
 * KAUFLEISTE, nur Handy, von nach dem Kopf bis zum Seitenende (Geräteprobe: am
 * Ende steht mobil der lange Fuß, ohne Leiste kein Kaufknopf im Bild). Mechanik
 * wie DetailKaufleiste. Die wäre hier falsch: sie führt auf die Kaufseite und
 * zeigt keinen BF-Preis. Inhalt nur im sichtbaren Zustand im DOM, data-bf-kaufen
 * bleibt am einen Knopf des Kaufblocks.
 */
export function Bf2026Kaufleiste({angebot, produkte, wahl}) {
  const {phase} = useBf2026Zeit();
  const land = useMarktLand();
  const sichtbar = useKaufleisteSicht(
    () => {
      const kopf = document.querySelector("[data-apple-seite='bf-deals'] [data-section='as-hero']");
      if (!kopf) return null;
      return {kopf, knoepfe: Array.from(document.querySelectorAll('[data-bf-kaufen], [data-bf-schluss] [data-qb-kaufknopf]'))};
    },
    (lage) => {
      const mobil = typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 749px)').matches;
      return detailKaufleisteSichtbar({geraetAn: mobil, kopf: lage.kopf, knoepfe: lage.knoepfe});
    },
    [],
  );
  if (phase === 'vorbei') return null;
  const stand = bf2026PreisStand(angebot, phase, istPreis(angebot, produkte, wahl, land));
  const zeile = stand.preis ?? stand.zeile ?? null;
  return (
    <div
      className={`bf-leiste${sichtbar ? ' bf-leiste--sichtbar' : ''}`}
      data-section="bf-kaufleiste"
      data-qb-chat-weicht={sichtbar ? '' : undefined}
      aria-hidden={sichtbar ? undefined : 'true'}
    >
      {sichtbar && (
        <>
          <p className="bf-leiste-auswahl">
            <span className="bf-leiste-name">{mitMarkeR(angebot.titel)}</span>
            {zeile ? <span className="bf-leiste-preis">{zeile}</span> : null}
          </p>
          <Bf2026Knopf angebot={angebot} produkte={produkte} wahl={wahl} marke={false} />
        </>
      )}
    </div>
  );
}
