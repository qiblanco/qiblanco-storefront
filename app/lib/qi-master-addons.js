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
 * HANDLE-TOLERANT (Christian 2026-10-17: „es heißt nun Qi Alpha", Grossjob
 * 20261017 zum neuen Namen).
 * Der Shopify-Handle wechselt erst in Segment s09 von qi-master* auf
 * qi-alpha*. Bis dahin und danach (Warenkörbe von vorher) zählt JEDER der
 * beiden Handles als Qi Alpha bzw. als dessen Add-on. Reihenfolge: der neue
 * zuerst. QM_HANDLE ist der neue Handle; Preis- und Steuerweg lesen ihn nur
 * für die Steuerklasse, die für beide Handles dieselbe ist.
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

/*
 * IN WELCHEN MÄRKTEN DIE ADD-ONS ERSCHEINEN: in jedem, in dem Shopify sie
 * verkauft (Christian 30.10.2026: alle Kauf-Optionen „für Besucher aus allen
 * Ländern, in denen wir verkaufen“; Job 20261030-repair-kaufweg-addons-
 * fremdwaehrung-fix-live). Bis 30.10. stand hier ADDON_WAEHRUNGEN =
 * ['EUR', 'CHF'] als Tor. Seit der Länder-Achse (PR #1105) bekommt fast jedes
 * Land seinen eigenen Markt in eigener Währung, und das Tor schloss still alle
 * Länder außer EUR/CHF aus (FEHLER-DB F-2755). Eine Währungsliste bricht bei
 * jeder Markt-Erweiterung wieder; entschieden wird deshalb an der Variante.
 */

/**
 * Die Add-ons, wie sie im Markt des Hauptprodukts kaufbar sind: je Produkt nur
 * die Varianten mit einem Preis in der Währung des Qi Alpha (dieselbe Kasse,
 * kein Mischbetrag). Ohne kaufbaren Qi Alpha gibt es keine Add-ons.
 * Verfügbarkeit (availableForSale) prüfen die Leser je Variante selbst
 * (nummernStand, kettenOptionen), vergebene Nummern bleiben so sichtbar.
 * @returns {{wunschnummer: object|null, kette: object|null}}
 */
export function addonsImMarkt(addons, haupt) {
  const waehrung = haupt?.price?.currencyCode;
  if (!haupt?.availableForSale || !waehrung) {
    return {wunschnummer: null, kette: null};
  }
  const imMarkt = (produkt) => {
    const nodes = (produkt?.variants?.nodes || []).filter(
      (v) =>
        v?.price?.currencyCode === waehrung &&
        Number.isFinite(Number.parseFloat(v.price.amount)),
    );
    return nodes.length ? {...produkt, variants: {nodes}} : null;
  };
  return {
    wunschnummer: imMarkt(addons?.wunschnummer),
    kette: imMarkt(addons?.kette),
  };
}

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

/*
 * NAME AN DER KASSE (Christian 27.10.2026, Job 20261027-qi-alpha-immer-mit-
 * registered-zeichen): „Qi Alpha immer mit R“, die Kette „Qi Blanco®
 * Goldkette – 750er ethisches Vollgold“ mit der Länge darunter.
 *
 * WUNSCHNUMMER (Christian 28.10.2026 Z14, Grossjob 20261028-qi-alpha-kopf-
 * 99-…, s06): „„Qi Alpha® 19/111“ änderen zu „Wunschnummer 19/111 - 1st.
 * Edition““. Am 01.11.2026 hat Christian die Warenkorbzeile neu gefasst
 * (unten, PR #1183); sein jüngeres Wort gilt für die Zeile. Aus Z14 bleibt
 * die Variante: die Shopify-Varianten von qi-alpha-wunschnummer heißen
 * „19/111 - 1st. Edition“ (Kasse, Bestellbestätigung, Rechnung). Vorher
 * hießen sie „19/111“, „Alpha 19/111“ und „Alpha 19/100“; jeder Leser hier
 * versteht alle vier Schreibweisen.
 */
export const QI_ALPHA_NAME = 'Qi Alpha®';

/*
 * DIE NUMMER IST NICHT DAS GERÄT (Christian 01.11.2026, Screenshot Warenkorb
 * „Qi Alpha® 69/111 · 2.000 €“): „muss noch „- Wunschnummer“ im Namen
 * hinzugefügt werden, damit klar ist, dass es kein Qi Alpha ist, sondern nur
 * die Wunschnummer die 2000€ kostet“. Zeile: „Qi Alpha® 69/111 – Wunschnummer“.
 */
export const WUNSCHNUMMER_ZUSATZ = 'Wunschnummer';

/**
 * „Alpha 19/100“, „Alpha 19/111“, „19/111“, „19/111 - 1st. Edition“ ->
 * „19/111“; sonst null.
 */
export function nummerKurz(titel) {
  const m = /^(?:Alpha\s*)?(\d{1,3})\s*\/\s*(100|111)(?:\s*-\s*1st\.\s*Edition)?$/.exec(
    String(titel ?? '').trim(),
  );
  return m ? `${Number(m[1])}/111` : null;
}

/**
 * Anzeige einer Add-on-Zeile im Warenkorb: Titel und Unterzeilen (nur die
 * Werte, ohne „Name:“), genau wie Shopify sie in der Kasse untereinander
 * setzt. Die Nummer steht in einer Zeile mit dem Namen: „Qi Alpha® 19/111 –
 * Wunschnummer“. null = keine Add-on-Zeile.
 */
export function addonZeile(line) {
  const merchandise = line?.merchandise;
  const art = addonArt(merchandise?.product?.handle);
  if (!art) return null;
  if (art === 'wunschnummer') {
    const nummer = nummerKurz(merchandise?.title);
    return {
      titel: nummer
        ? `${QI_ALPHA_NAME} ${nummer} – ${WUNSCHNUMMER_ZUSATZ}`
        : merchandise?.product?.title || QI_ALPHA_NAME,
      unterzeilen: [],
    };
  }
  return {
    titel: merchandise?.product?.title || '',
    unterzeilen: (merchandise?.selectedOptions ?? [])
      .map((o) => o?.value)
      .filter((v) => v && v !== 'Default Title'),
  };
}

/*
 * REIHENFOLGE IM WARENKORB UND IN DER KASSE (Christian 28.10.2026 Z14: „es
 * muss zuerst der qialpha stehen, dann die wunschnummer und dann die kette“,
 * unabhängig von der Reihenfolge des Hinzufügens).
 *
 * Gemessen 29.10.2026 (s06, mess-reihenfolge.json): Shopify führt die zuletzt
 * hinzugefügte Zeile zuerst, innerhalb EINES cartLinesAdd das letzte Element
 * zuerst, und die Kasse übernimmt genau diese Reihenfolge. Deshalb zwei Wege:
 *   - Anzeige (Seitenleiste, Warenkorbseite): sortiereWarenkorb sortiert
 *     beim Zeichnen, auch optimistische Zeilen.
 *   - Kasse: reihenfolgeKorrektur sagt der Warenkorb-Action, welche Zeilen
 *     sie entfernen und in EINEM Aufruf in umgekehrter Soll-Folge wieder
 *     hinzufügen muss (qi-master-addons.server.js).
 * Alle übrigen Produkte behalten ihre Reihenfolge und stehen danach.
 */
const RANG = {'qi-alpha': 0, wunschnummer: 1, kette: 2};

/** Rang einer Zeile nach Produkt-Handle: 0 Qi Alpha, 1 Nummer, 2 Kette, 3 sonst. */
export function warenkorbRang(handle) {
  if (istQiAlpha(handle)) return RANG['qi-alpha'];
  // Die inklusive Stahlkette (0 €, PR #1126) ist eine Kette und steht an
  // derselben Stelle wie die Goldkette.
  if (handle === QM_STAHLKETTE_HANDLE) return RANG.kette;
  const art = addonArt(handle);
  return art ? RANG[art] : 3;
}

/** Zeilen in Soll-Reihenfolge (stabil; Zeilen ohne Qi-Alpha-Bezug danach). */
export function sortiereWarenkorb(lines) {
  return (lines ?? [])
    .map((line, i) => ({line, i, r: warenkorbRang(line?.merchandise?.product?.handle)}))
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .map((x) => x.line);
}

/**
 * Rein (kein Netz). Eingabe: Warenkorbzeilen in Shopify-Reihenfolge mit
 * {id, quantity, handle, merchandiseId, attributes}. Ausgabe null, wenn
 * Qi Alpha, Nummer und Kette schon in Soll-Folge stehen, sonst
 * {entfernen: [ids], hinzufuegen: [CartLineInput]} — hinzufuegen ist
 * umgekehrt, weil Shopify das letzte Element eines Aufrufs zuerst führt.
 */
export function reihenfolgeKorrektur(zeilen) {
  const gruppe = (zeilen ?? []).filter((z) => warenkorbRang(z.handle) < 3);
  const raenge = gruppe.map((z) => warenkorbRang(z.handle));
  const geordnet = raenge.every((r, i) => i === 0 || raenge[i - 1] <= r);
  if (geordnet || gruppe.some((z) => !z.merchandiseId)) return null;
  const soll = sortiereWarenkorb(
    gruppe.map((z) => ({...z, merchandise: {product: {handle: z.handle}}})),
  );
  return {
    entfernen: gruppe.map((z) => z.id),
    hinzufuegen: soll.reverse().map((z) => {
      const eingabe = {merchandiseId: z.merchandiseId, quantity: z.quantity};
      const merkmale = (z.attributes ?? [])
        .filter((a) => a?.key)
        .map(({key, value}) => ({key, value}));
      if (merkmale.length) eingabe.attributes = merkmale;
      return eingabe;
    }),
  };
}

/** Welches Add-on ist dieser Handle? null = keines. */
export function addonArt(handle) {
  if (handle === QM_ADDON.wunschnummer || handle === QM_ADDON_ALT.wunschnummer)
    return 'wunschnummer';
  if (handle === QM_ADDON.kette || handle === QM_ADDON_ALT.kette) return 'kette';
  return null;
}

/*
 * Handle der inklusive Stahlkette (0 €, an den Qi Alpha gebunden wie eine
 * Goldkette). Derselbe Wert wie QM_STAHLKETTE in campaign/the-alpha-shop-
 * daten.js; hier eigens, damit der Warenkorb (auf jeder Seite geladen) die
 * Datenstelle der Kaufseite nicht mitzieht. Ein Test hält beide gleich.
 */
export const QM_STAHLKETTE_HANDLE = 'qi-alpha-stahlkette';

/*
 * MENGE FEST (Christian 01.11.2026: „die menge darf nicht veränderbar sein,
 * genau wie bei der Wunschnummer“): Wunschnummer, Goldkette und Stahlkette
 * hängen am Qi Alpha, je Gerät eine. Der Warenkorb zeigt bei ihnen keine
 * Mengen-Knöpfe, nur Entfernen. Durchgesetzt wird die Menge im Server
 * (bindungsKorrektur über qi-master-addons.server.js), nicht im Knopf.
 */
export function mengeFest(handle) {
  return Boolean(addonArt(handle)) || handle === QM_STAHLKETTE_HANDLE;
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
