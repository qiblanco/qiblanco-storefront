import {useCallback, useEffect, useRef, useState} from 'react';
import kakaoDealStyles from '~/styles/bf-kakao-deal.css?url';
import {DealGalerie} from '~/components/black-friday-2026/DealGalerie';
import {BfKakaoVergleich} from '~/components/black-friday-2026/BfKakaoVergleich';
import {
  BF_KAKAO_SETS,
  bfDeal,
  bfKakaoSet,
  bfKakaoZeilen,
} from '~/components/black-friday-2026/bf-deals-daten';
import {CartForm} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {KAUFLEISTE_AN} from '~/components/reusables/Kaufleiste';
import {kaufleisteSichtbar} from '~/components/reusables/kaufleiste-lage';
import {useKaufleisteSicht} from '~/lib/kaufleiste-sicht';
import {betragText} from '~/lib/betrag-text';

/*
 * KAKAO-DEAL-SEITE DE MIT SET-WAHL (Elina EL-20261111-fa47cfd9, GO 11.11.2026).
 * /products/j7hcyb802kn: EINE Seite für die drei Kakao-Sets. Bild, Preis und
 * Kaufknopf folgen dem gewählten Set. „In den Warenkorb“ legt das Set-Produkt
 * in den Qi-Blanco-Warenkorb (Elina EL-20261112-5c71f6ff: Warenkorb statt Kasse,
 * kombinierbar mit den anderen Deals); den Kakao-Code setzt der Server dazu.
 *
 * Erster Bildschirm (Bild, Preis, Set-Wahl, Kaufknopf) ohne Animation und
 * schon im Server-HTML richtig: der Loader liest ?set= und reicht `setId`
 * herein. Ein Tipp auf eine Pille tauscht nur den Zustand und schreibt ?set=
 * per history.replaceState in die Adresse (keine Navigation, kein Laden).
 *
 * Bildwechsel ohne Ruckeln und ohne Layout-Sprung: die Bildfläche hat ein festes
 * Seitenverhältnis (1:1), alle drei Bilder liegen darin übereinander und sind
 * von Anfang an geladen; gewechselt wird nur die Deckkraft. Bei „Bewegung
 * reduzieren“ ohne Überblendung (bf-kakao-deal.css).
 *
 * Kaufleiste am Handy: solange der Kaufknopf nicht im Bild ist, steht unten
 * dieselbe klebende Leiste wie auf den Kaufseiten (qb-kaufleiste.css, Lage aus
 * dem gemeinsamen Haken lib/kaufleiste-sicht.js, 100svh mit Hysterese), mit
 * Preis und „Jetzt kaufen“ des gewählten Sets. Desktop ohne Leiste wie dort.
 */

const MOBIL_MEDIA = '(max-width: 749px)';

function setInAdresse(id) {
  if (typeof window === 'undefined') return;
  try {
    const u = new URL(window.location.href);
    u.searchParams.set('set', id);
    window.history.replaceState(
      window.history.state,
      '',
      u.pathname + u.search + u.hash,
    );
  } catch {
    // Adresse bleibt, wie sie ist; Bild, Preis und Knopf stimmen trotzdem.
  }
}

export function BfKakaoDeal({setId}) {
  const deal = bfDeal('kakao');
  const [wahl, setWahl] = useState(() => bfKakaoSet(setId).id);
  const set = bfKakaoSet(wahl);
  const kaufbox = useRef(null);

  const waehle = useCallback((id) => {
    setWahl(id);
    setInAdresse(id);
  }, []);

  // Lädt der Loader mit anderem ?set= neu (Navigation innerhalb der Seite), folgt die Wahl.
  useEffect(() => {
    setWahl(bfKakaoSet(setId).id);
  }, [setId]);

  const sichtbar = useKaufleisteSicht(
    () => {
      const box = kaufbox.current;
      if (!box) return null;
      return {knopf: box.querySelector('[data-bkd-kaufen]')};
    },
    (lage) => {
      const medien =
        typeof window.matchMedia === 'function'
          ? window.matchMedia(MOBIL_MEDIA)
          : null;
      const geraetAn =
        medien && medien.matches ? KAUFLEISTE_AN.mobil : KAUFLEISTE_AN.desktop;
      return kaufleisteSichtbar({
        geraetAn,
        gemessen: lage.knopf.da,
        kaufknopfImBild: lage.knopf.imBild,
      });
    },
    [],
  );

  const preis = betragText(deal.preis, 'EUR');
  const uvp = betragText(deal.uvp, 'EUR');

  return (
    <>
      <link rel="stylesheet" href={kakaoDealStyles} />
      {BF_KAKAO_SETS.map((s) => (
        <link
          key={s.id}
          rel="preload"
          as="image"
          href={`${s.bild}?width=900`}
          imageSrcSet={`${s.bild}?width=600 600w, ${s.bild}?width=900 900w, ${s.bild}?width=1200 1200w`}
          imageSizes="(min-width: 960px) 34rem, 100vw"
        />
      ))}
      <section
        className="bkd"
        aria-labelledby="bkd-titel"
        data-section="pdp-buybox"
        data-bf-kakao-set={set.id}
        ref={kaufbox}
      >
        <div className="bkd__bild" data-section="pdp-gallery">
          {BF_KAKAO_SETS.map((s, i) => (
            <img
              key={s.id}
              className="bkd__bildlage"
              data-aktiv={s.id === set.id ? 'ja' : 'nein'}
              aria-hidden={s.id === set.id ? undefined : 'true'}
              src={`${s.bild}?width=900`}
              srcSet={`${s.bild}?width=600 600w, ${s.bild}?width=900 900w, ${s.bild}?width=1200 1200w`}
              sizes="(min-width: 960px) 34rem, 100vw"
              width="1200"
              height="1200"
              alt={s.id === set.id ? s.bildAlt : ''}
              loading="eager"
              decoding={i === 0 ? 'sync' : 'async'}
              fetchPriority={s.id === set.id ? 'high' : 'low'}
            />
          ))}
          <span className="bkd__plakette">{deal.rabatt}</span>
        </div>
        <div className="bkd__text">
          <p className="bkd__zeile">Black Friday 2026</p>
          <h1 id="bkd-titel" className="bkd__titel">
            Crystal Cacao · Kauf 2, zahl 1
          </h1>
          {/* Preis und Set-Wahl als ein Block mit data-qb-preis: die Chat-Einladung weicht ihm aus wie dem
              Kaufknopf (lib/kaufknopf-chat.js PREIS_SELEKTOR), sonst deckt sie am Handy die ersten Sekunden
              zwei Pillen, und ein Tipp öffnet den Chat statt das Set zu wählen. */}
          <div className="bkd__wahl" data-qb-preis="">
            <p className="bkd__preis">
              <s className="bkd__alt">{uvp}</s>{' '}
              <span className="bkd__neu">{preis}</span>
            </p>
            <div className="bkd__pillen" role="group" aria-label="Set wählen">
              {BF_KAKAO_SETS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="bkd__pille"
                  aria-pressed={s.id === set.id}
                  data-bkd-set={s.id}
                  onClick={() => waehle(s.id)}
                >
                  {s.pille}
                </button>
              ))}
            </div>
          </div>
          <KakaoWarenkorbKnopf
            setId={set.id}
            className="bkd__kaufen"
            label={`In den Warenkorb: ${set.name}, ${preis}`}
            daten={{'data-bkd-kaufen': ''}}
          />
        </div>
      </section>
      <DealGalerie />
      {/* Gegenüberstellung Awake vs. Create + „Für beide gilt“ statt der kompletten Crystal-Cacao-Sections
          (Elina EL-20261112-cb3c35ca); Schluss-Banner und FAQ folgen danach. */}
      <BfKakaoVergleich />
      <div
        className={`qb-kaufleiste${sichtbar ? ' qb-kaufleiste--sichtbar' : ''}`}
        data-section="pdp-kaufleiste"
        data-kaufleiste-desktop={KAUFLEISTE_AN.desktop ? 'an' : 'aus'}
        data-kaufleiste-mobil={KAUFLEISTE_AN.mobil ? 'an' : 'aus'}
        data-qb-chat-weicht={sichtbar ? '' : undefined}
        aria-hidden={sichtbar ? undefined : 'true'}
      >
        {sichtbar && (
          <>
            <div className="qb-kaufleiste__preis bkd__leistenpreis">
              <s className="bkd__alt">{uvp}</s>{' '}
              <span className="bkd__neu">{preis}</span>
            </div>
            <KakaoWarenkorbKnopf
              setId={set.id}
              className="btn--primary bkd__kaufen bkd__kaufen--leiste"
              label={`In den Warenkorb: ${set.name}, ${preis}`}
            />
          </>
        )}
      </div>
    </>
  );
}

/**
 * „In den Warenkorb“ für ein Kakao-Set (Elina EL-20261112-5c71f6ff): legt das
 * Set-Produkt mit Merkmal _bf_deal in den Warenkorb und öffnet ihn; den Code
 * setzt der Server (bfDeal = kakao), nie der Browser.
 */
function KakaoWarenkorbKnopf({setId, className, label, daten = {}}) {
  const {open} = useAside();
  const zeilen = bfKakaoZeilen(setId);
  return (
    <CartForm route="/cart" inputs={{lines: zeilen, bfDeal: 'kakao'}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher) => (
        <button
          type="submit"
          className={className}
          data-qb-kaufknopf=""
          data-bf-deal-warenkorb="kakao"
          aria-label={label}
          disabled={!zeilen.length || fetcher.state !== 'idle'}
          onClick={() => open('cart')}
          {...daten}
        >
          In den Warenkorb
        </button>
      )}
    </CartForm>
  );
}
