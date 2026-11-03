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
 *  anzeige      CSS-Breite wie bisher (die alte Datei gab sie vor), wird als
 *               width-Attribut gesetzt, weil die neue Datei breiter ist
 *  dateiBreite  Dateibreite für Bilder, die die Spalte füllen (ohne width)
 * Sonst kommt die Datei in 2 x Anzeigebreite; das CDN gibt höchstens das
 * Original her. Nur KursApple ruft das auf, die C-Fassung bleibt gleich.
 */
const BILDER = new Map([
  ['Christian_480x480.webp', {datei: 'Christian.webp'}],
  ['Christian-Bauer-290x300_1_240x240.webp', {datei: 'Christian-Bauer-290x300_1.webp', anzeige: 232}],
  ['Kreislauf_Biohacking.png_1_480x480.webp', {datei: 'Kreislauf_Biohacking.png_1.webp', anzeige: 480}],
  ['qiblanco-com-qione-2-pro-transparent_1.webp', {datei: 'QiOne2Pro_01_transparent.png', version: '1683116991', dateiBreite: 1232}],
]);

const SHOPIFY_DATEI = /^(?:https?:)?\/\/cdn\.shopify\.com\/s\/files\/.*\/files\/[^/]+$/i;
// Liest Attribut für Attribut, ein "width=" in einem alt- oder title-Wert ist so kein Attribut.
const ATTRIBUT = /\s([^\s=>/"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;

function attribute(tag) {
  const aus = new Map();
  for (const m of tag.matchAll(ATTRIBUT)) {
    const name = m[1].toLowerCase();
    if (!aus.has(name)) aus.set(name, m[2] ?? m[3] ?? m[4] ?? '');
  }
  return aus;
}

export function scharfesBild(tag) {
  const a = attribute(tag);
  if (!a.get('src') || a.has('srcset')) return tag;
  const [pfad, query = ''] = a.get('src').replace(/&amp;/g, '&').split('#')[0].split('?');
  if (!SHOPIFY_DATEI.test(pfad)) return tag;
  const name = pfad.slice(pfad.lastIndexOf('/') + 1);
  const bild = BILDER.get(name);
  if (!bild) return tag;
  const roh = a.has('width') ? a.get('width').trim() : null;
  // width="100%" und Ähnliches: die Anzeigebreite ist unbekannt, also keine Aussage über die Datei.
  if (roh !== null && !/^\d+$/.test(roh)) return tag;
  const w = roh === null ? 0 : Number(roh);
  const breite = bild.dateiBreite ?? 2 * (w || bild.anzeige || 0);
  if (!breite) return tag;
  const version = bild.version ?? new URLSearchParams(query).get('v');
  const neu = `${pfad.slice(0, -name.length)}${bild.datei}?${version ? `v=${version}&amp;` : ''}width=${breite}`;
  let gesetzt = false;
  const aus = tag.replace(ATTRIBUT, (m, attr) => {
    if (gesetzt || attr.toLowerCase() !== 'src') return m;
    gesetzt = true;
    return ` src="${neu}"`;
  });
  return !w && bild.anzeige ? aus.replace(/^<img\b/i, `<img width="${bild.anzeige}"`) : aus;
}

export function scharfeLektionsbilder(body) {
  if (typeof body !== 'string' || !body) return body;
  return body.replace(/<img\b[^>]*>/gi, scharfesBild);
}
