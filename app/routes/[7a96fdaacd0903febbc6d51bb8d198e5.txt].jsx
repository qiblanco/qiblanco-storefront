/**
 * /7a96fdaacd0903febbc6d51bb8d198e5.txt — IndexNow-Schlüsseldatei für qiblanco.com
 *
 * Job 20261007-ep-indexnow-qiblanco-und-crystal (Christian 07.10.2026).
 *
 * IndexNow (api.indexnow.org) meldet neue und geänderte Seiten an Bing; über
 * den Bing-Index lesen ChatGPT-Suche und Copilot. Ein Webmaster-Konto braucht
 * es dafür nicht: der Endpunkt prüft nur, ob unter https://<host>/<schlüssel>.txt
 * genau der Schlüssel steht.
 *
 * WARUM EINE ROUTE UND KEINE DATEI IN public/: Oxygen liefert public/ über das
 * Shopify-CDN aus, nicht unter qiblanco.com. Die Datei muss aber im
 * Wurzelpfad der Domain liegen.
 *
 * DREI STELLEN MÜSSEN ZUSAMMENPASSEN — der Schlüssel hier, HOSTS in
 * shared-state/seo-manager/bin/indexnow_ping.py und der Dateiname dieser
 * Route. `indexnow_ping.py pruefe` misst das am Kundenrand.
 *
 * Rückweg: diese Datei entfernen (der Melder meldet dann BEFUND
 * "Schlüssel nicht live" und sendet nichts mehr für qiblanco.com).
 */
const SCHLUESSEL = '7a96fdaacd0903febbc6d51bb8d198e5';

export async function loader() {
  return new Response(SCHLUESSEL, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
