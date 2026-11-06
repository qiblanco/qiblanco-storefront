/*
 * RATEN IM PREMIUM-BEREICH: Reservierungs-Schlüssel am Warenkorb-Permalink
 * (Job 20261101-prio10-qi-alpha-premium-checkout-raten). Nur Server: die
 * Liste der Schlüssel (qi-alpha-reservierungen.server.js) bleibt aus dem
 * Browser-Paket.
 *
 * DER WEG: Schritt 1 der geteilten Zahlung trägt den Schlüssel als Merkmal
 * _qa_reservierung an Bestellung 1 (lib/qi-alpha-teilzahlung.js,
 * merkmaleAusQuery). Der Wächter qi-alpha-teilzahlung hängt ihn als
 * `&reservierung=` an den Rest-Link, den nur dieser Kunde per E-Mail bekommt.
 * Hier setzt cart.$lines.jsx damit `_reservierung` und den Namen an die
 * Nummern-Zeile, bevor der Warenkorb entsteht; die Sperre in
 * qi-master-addons.server.js lässt die Nummer dann stehen.
 */
import {
  istSchluessel,
  nummerAusVariantenTitel,
  reservierungsMerkmale,
  reservierungZu,
} from '~/lib/qi-alpha-reservierung';
import {RESERVIERUNGEN} from '~/lib/qi-alpha-reservierungen.server';
import {RESERVIERUNGS_RABATTE} from '~/lib/qi-alpha-reservierung-rabatte.server';
import {addonArt} from '~/lib/qi-master-addons';

const KANONISCH_RX = /^gid:\/\/shopify\/ProductVariant\/[1-9]\d{0,19}$/;

const VARIANTEN_QUERY = `#graphql
  query QiAlphaReservierungVarianten($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on ProductVariant {
        id
        title
        product {
          handle
        }
      }
    }
  }
`;

/*
 * LINK MIT EIGENEM RABATT: KEINE RATEN (Job 20261101-prio10-qi-alpha-premium-
 * raten-deploy). Am Link 2+99 setzt der Server seit 02.11.2026 genau seinen
 * Code und wirft jeden anderen heraus (rabattCodeKorrektur, „kein weiterer
 * Rabatt kombinierbar“). Im Rest-Korb der Raten wäre das der Code QA-REST mit
 * der Anrechnung der 10.000 €. Deshalb gilt so ein Schlüssel hier als
 * unbekannt: kein Merkmal an Bestellung 1, kein Schlüssel am Rest-Link.
 */
const mitRabatt = (schluessel) => Boolean(RESERVIERUNGS_RABATTE?.[schluessel]);

/** Darf dieser Schlüssel die Raten tragen (bekannt, ohne eigenen Rabatt)? */
export function reservierungBekannt(schluessel) {
  return (
    Boolean(reservierungZu(RESERVIERUNGEN, schluessel)) && !mitRabatt(schluessel)
  );
}

/**
 * Permalink-Zeilen mit den Reservierungs-Merkmalen. Ohne gültigen, bekannten
 * Schlüssel unverändert. Scheitert das Nachlesen der Varianten, wirft es
 * (503): sonst nähme die Sperre die reservierte Nummer still heraus, und der
 * Kunde zahlte den Rest ohne seine Nummer.
 */
export async function reservierungAmPermalink({storefront, zeilen, schluessel}) {
  if (!istSchluessel(schluessel) || mitRabatt(schluessel)) return zeilen;
  const reservierung = reservierungZu(RESERVIERUNGEN, schluessel);
  if (!reservierung) return zeilen;
  const ids = [
    ...new Set(
      zeilen.map((z) => z.merchandiseId).filter((id) => KANONISCH_RX.test(id)),
    ),
  ];
  if (!ids.length) return zeilen;
  let knoten;
  try {
    knoten = (
      await storefront.query(VARIANTEN_QUERY, {
        variables: {ids},
        cache: storefront.CacheNone(),
      })
    )?.nodes;
  } catch {
    knoten = null;
  }
  if (!Array.isArray(knoten)) {
    throw new Response(
      'Dein Zahlungslink konnte gerade nicht geladen werden. Bitte öffne ihn gleich noch einmal.',
      {status: 503},
    );
  }
  const nummerJeVariante = new Map();
  for (const v of knoten) {
    if (v?.id && addonArt(v.product?.handle) === 'wunschnummer') {
      nummerJeVariante.set(v.id, nummerAusVariantenTitel(v.title));
    }
  }
  return permalinkReservierung(zeilen, nummerJeVariante, reservierung);
}

/**
 * RATEN IM PREMIUM-BEREICH (Job 20261101-prio10-qi-alpha-premium-checkout-
 * raten): der Rest-Link der geteilten Zahlung kommt als Warenkorb-Permalink
 * /cart/<qi>:1,<nummer>:1[,<kette>:1]?discount=<CODE>&reservierung=<schlüssel>
 * zurück. Hier bekommt jede Nummern-Zeile, deren Nummer zu GENAU dieser
 * Reservierung gehört, Schlüssel und Namen als Zeilen-Merkmal — dieselben
 * wie beim Kauf über die Kaufseite. Jede andere Zeile bleibt, wie sie ist;
 * eine fremde reservierte Nummer nimmt die Sperre danach heraus.
 * `nummerJeVariante`: Map Varianten-GID -> Nummer (nur Wunschnummern).
 * Hier und nicht in lib/qi-alpha-reservierung.js: jene Datei hängt über den
 * Warenkorb an jeder Seite, diese Regel braucht nur der Permalink.
 */
export function permalinkReservierung(zeilen, nummerJeVariante, reservierung) {
  const namen = new Map(
    (reservierung?.nummern || []).map((x) => [Number(x.n), x.name]),
  );
  return (zeilen || []).map((z) => {
    const n = nummerJeVariante?.get(z?.merchandiseId);
    if (!istSchluessel(reservierung?.schluessel) || !namen.has(n)) return z;
    return {
      ...z,
      attributes: [
        ...(z.attributes || []),
        ...reservierungsMerkmale(reservierung.schluessel, namen.get(n)),
      ],
    };
  });
}
