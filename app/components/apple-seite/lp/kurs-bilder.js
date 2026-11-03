/*
 * SCHARFE LEKTIONSBILDER IN DER APPLE-KURSFASSUNG (Grossjob 20261029-GROSSJOB-
 * alle-shop-seiten-apple-niveau-ausser-seo-geo, s07-r13, jobmem-Flanke #279).
 *
 * Die Bilder stehen im Lektionstext aus Shopify (CourseLesson body). Der Text
 * bleibt Zeichen für Zeichen derselbe, die Anzeigebreite auch: Getauscht wird
 * nur die Datei hinter dem Bild, und nur für die Dateien in der Tabelle, deren
 * Ziel-URL gemessen 200 liefert. Unbekannte Bilder bleiben byte-gleich.
 *
 * Kein srcset "... 2x": ohne width-Attribut halbiert es die Anzeige auf
 * 2x-Bildschirmen (Vier-Augen-Prüfung r12: Porträt 232 -> 145 px).
 *
 *  datei        Name der schärferen Datei im selben Shopify-Ordner
 *  version      deren ?v=, sonst bleibt das ?v= des Lektionstexts
 *  dateiBreite  Dateibreite, wenn der Tag kein width-Attribut trägt
 *  attribute    Maße für diesen Fall: die neue Datei ist breiter als die alte,
 *               die Maße halten die Anzeige gleich und reservieren den Platz
 * Trägt der Tag ein width-Attribut W, kommt die Datei in 2 x W, und das
 * Attribut bleibt. Das QiOne-Bild füllt die Spalte (höchstens 616 CSS-px, also
 * 1120 px für 2x) und steht weit unter der ersten Ansicht: es lädt lazy, weil
 * die schärfere Datei 101 kB wiegt statt 47 kB.
 * Nur KursApple ruft das auf, die C-Fassung bleibt gleich.
 */
const BILDER = new Map([
  ['Christian_480x480.webp', {datei: 'Christian.webp'}],
  ['Kreislauf_Biohacking.png_1_480x480.webp', {datei: 'Kreislauf_Biohacking.png_1.webp', dateiBreite: 960, attribute: 'width="480" height="480"'}],
  ['qiblanco-com-qione-2-pro-transparent_1.webp', {datei: 'QiOne2Pro_01_transparent.png', version: '1683116991', dateiBreite: 1120, attribute: 'width="1120" height="1120" loading="lazy"'}],
]);

const SHOPIFY_DATEI = /^(?:https?:)?\/\/cdn\.shopify\.com\/s\/files\/.*\/files\/[^/]+$/i;
// Liest quote-bewusst: ein ">" oder ein ganzes <img> in einem alt- oder title-Wert gehört zum Wert.
const TAG = /<[a-z](?:[^>"']|"[^"]*"|'[^']*')*>/gi;
const IMG = /^<img(?=[\s/>])/i;
const ATTRIBUT = /([^\s=>/"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;

function attribute(rest) {
  const aus = new Map();
  for (const m of rest.matchAll(ATTRIBUT)) {
    const name = m[1].toLowerCase();
    if (!aus.has(name)) aus.set(name, m[2] ?? m[3] ?? m[4] ?? '');
  }
  return aus;
}

export function scharfesBild(tag) {
  const rest = tag.slice('<img'.length);
  const a = attribute(rest);
  if (!a.get('src') || a.has('srcset')) return tag;
  const [pfad, query = ''] = a.get('src').replace(/&amp;/g, '&').split('#')[0].split('?');
  if (!SHOPIFY_DATEI.test(pfad)) return tag;
  const name = pfad.slice(pfad.lastIndexOf('/') + 1);
  const bild = BILDER.get(name);
  if (!bild) return tag;
  // width="100%", width="0" und height ohne width: die Anzeigebreite ist unbekannt, also keine Aussage über die Datei.
  if (a.has('width') ? !/^[1-9]\d*$/.test(a.get('width').trim()) : a.has('height')) return tag;
  const w = a.has('width') ? Number(a.get('width')) : 0;
  const breite = w ? 2 * w : bild.dateiBreite;
  if (!breite) return tag;
  const version = bild.version ?? new URLSearchParams(query).get('v');
  const neu = `${pfad.slice(0, -name.length)}${bild.datei}?${version ? `v=${version}&amp;` : ''}width=${breite}`;
  let gesetzt = false;
  const aus = rest.replace(ATTRIBUT, (m, attr) => {
    if (gesetzt || attr.toLowerCase() !== 'src') return m;
    gesetzt = true;
    return `src="${neu}"`;
  });
  return `<img${w ? '' : ` ${bild.attribute}`}${aus}`;
}

export function scharfeLektionsbilder(body) {
  if (typeof body !== 'string' || !body) return body;
  return body.replace(TAG, (tag) => (IMG.test(tag) ? scharfesBild(tag) : tag));
}
