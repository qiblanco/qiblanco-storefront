/*
 * Qi Alpha Add-ons (bis 2026-10-17 Qi Master) — Wunschnummer und Goldkette (Christian 2026-09-24,
 * Job 20260924-GROSSJOB-qi-master-addons-wunschnummer-seriennummern-
 * register-und-goldkette, Konzept dort KONZEPT.md E1–E8).
 *
 * EINE Stelle für Handles, Zeilen-Merkmal und Bindungsregel. Gelesen von der
 * Produktseite (Auswahl -> Warenkorbzeilen) und von der Warenkorb-Action
 * (qi-master-addons.server.js), damit beide dieselben Regeln sprechen.
 *
 * WARUM DIE ADD-ONS EIGENE PRODUKTE SIND: die Wunschnummer hat je Nummer eine
 * Variante ("Alpha N/111", bis 25.10.2026 "Alpha N/100"). Shopify sperrt eine vergebene Nummer selbst
 * (inventoryPolicy DENY -> availableForSale false) — an Seite, Warenkorb und
 * Kasse, nicht nur in dieser Oberfläche. Das Register dahinter führt
 * shop-manager/bin/qm-seriennummern.
 */

/*
 * HANDLE-TOLERANT (Christian 2026-10-17: „es heisst nun Qi Alpha", Grossjob
 * 20261017-GROSSJOB-qi-master-heisst-qi-alpha-shop-produkt-seiten-serverweit).
 * Der Shopify-Handle wechselt erst in Segment s09 von qi-master* auf
 * qi-alpha*. Bis dahin und danach (Warenkoerbe von vorher) zaehlt JEDER der
 * beiden Handles als Qi Alpha bzw. als dessen Add-on. Reihenfolge: der neue
 * zuerst. QM_HANDLE ist der neue Handle; Preis- und Steuerweg lesen ihn nur
 * fuer die Steuerklasse, die fuer beide Handles dieselbe ist.
 */
export const QM_HANDLES = ['qi-alpha', 'qi-master'];
export const QM_HANDLE = QM_HANDLES[0];
export const QM_ADDON = {
  wunschnummer: 'qi-alpha-wunschnummer',
  kette: 'qi-alpha-goldkette',
};
/** Alte Handles der Add-ons (bis s09 die Shopify-Handles). */
export const QM_ADDON_ALT = {
  wunschnummer: 'qi-master-wunschnummer',
  kette: 'qi-master-goldkette',
};
export const QM_ADDON_HANDLES = [
  ...Object.values(QM_ADDON),
  ...Object.values(QM_ADDON_ALT),
];

/** Ist dieser Handle das Hauptprodukt (Qi Alpha, alter oder neuer Handle)? */
export function istQiAlpha(handle) {
  return QM_HANDLES.includes(handle);
}

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

/*
 * variants(first: 250) statt 100: die Alpha-Serie geht seit 25.10.2026 bis
 * 111 (Christian: „es geht nun bis 111.“). Mit 100 fehlten 101..111 still.
 *
 * product + selectedOptions je Variante: die Variante geht als selectedVariant
 * in die OPTIMISTISCHE Warenkorbzeile (addonLinien -> useOptimisticCart).
 * Ohne product las CartLineItem `product.handle` von undefined, und der
 * Warenkorb stürzte ab (Christian 25.10.2026: „Application Error … Cannot
 * read properties of undefined (reading 'handle')“).
 */
export const QM_ADDONS_QUERY = `#graphql
  query QiMasterAddons($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    wunschnummerNeu: product(handle: "qi-alpha-wunschnummer") {
      ...QiMasterAddon
    }
    wunschnummer: product(handle: "qi-master-wunschnummer") {
      ...QiMasterAddon
    }
    ketteNeu: product(handle: "qi-alpha-goldkette") {
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
    variants(first: 250) {
      nodes {
        id
        title
        product {
          id
          handle
          title
        }
        selectedOptions {
          name
          value
        }
        availableForSale
        price {
          amount
          currencyCode
        }
      }
    }
  }
`;

/**
 * Anzeige einer Wunschnummer: die Serie geht seit 25.10.2026 bis 111. Bis die
 * Shopify-Varianten umbenannt sind, heißen 1..100 noch "Alpha N/100"; die
 * Seite zeigt sie schon als "Alpha N/111". Andere Titel bleiben, wie sie sind.
 */
export function nummerAnzeige(titel) {
  return String(titel ?? '').replace(
    /^(Alpha\s*\d{1,3}\s*\/\s*)100$/,
    (_, kopf) => `${kopf}111`,
  );
}

/** Welches Add-on ist dieser Handle? null = keines. */
export function addonArt(handle) {
  if (handle === QM_ADDON.wunschnummer || handle === QM_ADDON_ALT.wunschnummer)
    return 'wunschnummer';
  if (handle === QM_ADDON.kette || handle === QM_ADDON_ALT.kette) return 'kette';
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
    .filter((z) => istQiAlpha(z.handle))
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
