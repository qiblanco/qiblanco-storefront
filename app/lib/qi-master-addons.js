/*
 * Qi Master® Add-ons — Wunschnummer und Goldkette (Christian 2026-09-24,
 * Job 20260924-GROSSJOB-qi-master-addons-wunschnummer-seriennummern-
 * register-und-goldkette, Konzept dort KONZEPT.md E1–E8).
 *
 * EINE Stelle für Handles, Zeilen-Merkmal und Bindungsregel. Gelesen von der
 * Produktseite (Auswahl -> Warenkorbzeilen) und von der Warenkorb-Action
 * (qi-master-addons.server.js), damit beide dieselben Regeln sprechen.
 *
 * WARUM DIE ADD-ONS EIGENE PRODUKTE SIND: die Wunschnummer hat je Nummer eine
 * Variante ("Alpha N/100"). Shopify sperrt eine vergebene Nummer selbst
 * (inventoryPolicy DENY -> availableForSale false) — an Seite, Warenkorb und
 * Kasse, nicht nur in dieser Oberfläche. Das Register dahinter führt
 * shop-manager/bin/qm-seriennummern.
 */

export const QM_HANDLE = 'qi-master';
export const QM_ADDON = {
  wunschnummer: 'qi-master-wunschnummer',
  kette: 'qi-master-goldkette',
};
export const QM_ADDON_HANDLES = Object.values(QM_ADDON);

/** Zeilen-Merkmal einer Add-on-Zeile. Unterstrich = in der Kasse unsichtbar. */
export const ADDON_ATTR = '_qm_addon';

/**
 * In welchen Währungen die Add-ons erscheinen. Christian hat EURO-Preise
 * genannt (2.000 € / 4.879 €); der Laden rechnet sie für die DACH-Märkte
 * (DE/AT in EUR, CH in CHF) über denselben Weg um wie den Qi Master selbst.
 * US-Preise hat er offen gelassen — sie liegen als Frage bei ihm (RESULT des
 * Auftrags). Bis zur Antwort erscheinen die Add-ons im US-Markt nicht.
 * Rückweg/Freischaltung: 'USD' hier ergänzen.
 */
export const ADDON_WAEHRUNGEN = ['EUR', 'CHF'];

/** Vorausgewählte Kettenlänge (Christian/Coworker A 2026-09-24). */
export const KETTE_VORWAHL = '60 cm';

export const QM_ADDONS_QUERY = `#graphql
  query QiMasterAddons($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    wunschnummer: product(handle: "qi-master-wunschnummer") {
      ...QiMasterAddon
    }
    kette: product(handle: "qi-master-goldkette") {
      ...QiMasterAddon
    }
  }
  fragment QiMasterAddon on Product {
    id
    handle
    title
    variants(first: 100) {
      nodes {
        id
        title
        availableForSale
        price {
          amount
          currencyCode
        }
      }
    }
  }
`;

/** Welches Add-on ist dieser Handle? null = keines. */
export function addonArt(handle) {
  if (handle === QM_ADDON.wunschnummer) return 'wunschnummer';
  if (handle === QM_ADDON.kette) return 'kette';
  return null;
}

/**
 * Die Warenkorbzeilen der gewählten Add-ons. Sie gehen im SELBEN Klick mit
 * dem Qi Master in den Warenkorb (ProductForm `zusatzLinien`).
 */
export function addonLinien({wunschnummer, kette}) {
  const linien = [];
  if (wunschnummer) {
    linien.push({
      merchandiseId: wunschnummer.id,
      quantity: 1,
      selectedVariant: wunschnummer,
      attributes: [{key: ADDON_ATTR, value: 'wunschnummer'}],
    });
  }
  if (kette) {
    linien.push({
      merchandiseId: kette.id,
      quantity: 1,
      selectedVariant: kette,
      attributes: [{key: ADDON_ATTR, value: 'kette'}],
    });
  }
  return linien;
}

/**
 * DIE BINDUNGSREGEL, rein (kein Netz). Eingabe: Warenkorbzeilen mit
 * {id, quantity, handle} und, wo bekannt, {variantId, attributes}. Ausgabe:
 * was entfernt bzw. geändert werden muss, damit gilt:
 *   1. ohne Qi Master kein Add-on,
 *   2. jede Wunschnummer-Zeile hat Menge 1, und jede Nummer steht in
 *      höchstens einer Zeile (eine Nummer gibt es einmal),
 *   3. je Add-on-Art höchstens so viele Stück wie Qi Master im Warenkorb,
 *   4. jede behaltene Add-on-Zeile trägt das Merkmal `_qm_addon` (nur wenn
 *      `attributes` mitgeliefert wird; fehlt das Feld, bleibt es unberührt).
 * Überzählige Zeilen fallen in der Reihenfolge weg, in der der Warenkorb sie
 * liefert: es bleiben die VORNE stehenden. Shopify liefert die zuletzt
 * hinzugefügte Zeile zuerst — bei zwei Ketten-Zeilen bleibt also die zuletzt
 * gewählte (gemessen 2026-09-25, K3-Widerleger s05, Versuch H9).
 */
export function bindungsKorrektur(zeilen) {
  const qm = zeilen
    .filter((z) => z.handle === QM_HANDLE)
    .reduce((s, z) => s + (z.quantity || 0), 0);
  const entfernen = [];
  const aendern = [];
  for (const art of ['wunschnummer', 'kette']) {
    let rest = qm;
    const gesehen = new Set();
    for (const z of zeilen.filter((x) => addonArt(x.handle) === art)) {
      const doppelt =
        art === 'wunschnummer' && z.variantId && gesehen.has(z.variantId);
      const soll = doppelt
        ? 0
        : Math.min(art === 'wunschnummer' ? 1 : z.quantity, rest);
      if (soll <= 0) {
        entfernen.push(z.id);
        continue;
      }
      if (z.variantId) gesehen.add(z.variantId);
      rest -= soll;
      const merkmalFehlt =
        Array.isArray(z.attributes) &&
        !z.attributes.some((a) => a?.key === ADDON_ATTR && a?.value === art);
      if (soll !== z.quantity || merkmalFehlt) {
        const aenderung = {id: z.id, quantity: soll};
        if (merkmalFehlt) {
          aenderung.attributes = [
            ...z.attributes
              .filter((a) => a?.key && a.key !== ADDON_ATTR)
              .map(({key, value}) => ({key, value})),
            {key: ADDON_ATTR, value: art},
          ];
        }
        aendern.push(aenderung);
      }
    }
  }
  return {entfernen, aendern};
}
