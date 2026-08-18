/*
 * cartCrossSell — die REINE Entscheidung "welche Saeule fehlt im Warenkorb?"
 * (Doing pdf-cross-selling-zwei-saeulen-ein-fundament-nordstern-oekon#006,
 * Job nachhol-pdf-cross-selling-zwei-saeulen-ein-funda-006).
 *
 * WARUM EIGENE DATEI: Die Darstellung lebt in CartMain.jsx und ist ohne React
 * nicht pruefbar. Die Entscheidung ist der Teil, der falsch sein KANN — sie
 * liegt deshalb hier, frei von Imports, und wird von
 * selftest_cart_crosssell.mjs mit echten Warenkorb-Formen gefahren.
 *
 * BESITZ-BEWUSST (Prinzip aus dem postkauf-manager): vorgeschlagen wird immer
 * nur die Saeule, die NICHT schon im Warenkorb liegt. Liegen beide drin, ist
 * der Kunde bereits Beide-Kaeufer und bekommt nichts.
 *
 * CLAIM-KORRIDOR, zwei harte Auflagen — beide sind gemessen, nicht vermutet
 * (kontor claim-check --kanal crystal-cacao-de, 2026-08-18):
 *  - EU-S08: Kakao und Gerät dürfen NIE im selben Satz stehen
 *    (GL-DES-0009 Evidenz-Hygiene). Die Negativ-Kontrolle dazu steht in
 *    selftest_cart_crosssell.mjs und fällt dort erwartungsgemäß. Jeder
 *    Vorschlag nennt darum ausschließlich SEINE eigene Säule.
 *  - EU-S14: keine Verzehrfrequenz für Kakao ohne Cadmium-Analysenzertifikat.
 *    Die Formulierung der Konzept-Vorlage nannte eine Häufigkeit und fällt an
 *    genau dieser Sperre. Der Text nennt darum einen ANLASS, keine Häufigkeit.
 *
 * Die gesperrten Wortlaute stehen hier BEWUSST NICHT wörtlich: die Live-Probe
 * (probe_cart_crosssell_live.py) sucht sie im ausgelieferten Bundle. Ein Zitat
 * im Quelltext würde ihr die eigene Buchführung als Verstoß melden.
 * Wer die Texte anfasst, fährt beide Proben erneut.
 */

/* Schluessel = Shopify-Produkt-Handle (products.*-Routen, live gemessen 200). */
export const WELT_JE_HANDLE = {
  'qione-2-pro': 'geraet',
  qibracelet: 'geraet',
  'qihome-air': 'geraet',
  'qione-kette': 'geraet',
  'zeremonie-kakao': 'kakao',
  'crystal-cacao-create': 'kakao',
  'crystal-cacao-awake': 'kakao',
};

/* Ein Vorschlag je Richtung. Der Text nennt jeweils nur SEINE Saeule. */
export const VORSCHLAG = {
  // Geraet liegt drin, Kakao fehlt -> Volumenpfad (D1 des Konzepts).
  kakao: {
    titel: 'Dein Ritual dazu',
    text: 'Der Kristall-Kakao ist ein bewusster Moment für dich — in Ruhe zubereitet, ohne Eile getrunken.',
    linkText: 'Kristall-Kakao ansehen',
    ziel: '/products/zeremonie-kakao',
  },
  // Kakao liegt drin, Geraet fehlt -> Wertpfad (D2 des Konzepts).
  geraet: {
    titel: 'Dein Ritual, dauerhaft getragen',
    text: 'Das QiOne® 2 Pro begleitet dich durch den ganzen Tag — zu Hause, im Büro und unterwegs.',
    linkText: 'QiOne® 2 Pro ansehen',
    ziel: '/products/qione-2-pro',
  },
};

/**
 * Welche Saeule fehlt im Warenkorb?
 * @param {Array<{merchandise?: {product?: {handle?: string}}}>} lines
 * @returns {'kakao'|'geraet'|null} null = nichts vorschlagen
 */
export function fehlendeSaeule(lines) {
  const welten = new Set();
  for (const line of lines ?? []) {
    const welt = WELT_JE_HANDLE[line?.merchandise?.product?.handle];
    if (welt) welten.add(welt);
  }
  // Unbekannter Korb -> still. Beide Saeulen drin -> still (schon Beide-Kaeufer).
  if (welten.has('geraet') && welten.has('kakao')) return null;
  if (welten.has('geraet')) return 'kakao';
  if (welten.has('kakao')) return 'geraet';
  return null;
}

/**
 * Der fertige Vorschlag — oder null.
 * @param {Array<object>} lines Warenkorb-Zeilen (cart.lines.nodes)
 * @returns {null|{titel:string,text:string,linkText:string,ziel:string}}
 */
export function crossSellVorschlag(lines) {
  const fehlt = fehlendeSaeule(lines);
  return fehlt ? VORSCHLAG[fehlt] : null;
}
