import {createHash} from 'node:crypto';
import {readdirSync, readFileSync} from 'node:fs';
import {join} from 'node:path';

/**
 * Versionsangabe aus dem Inhalt für die eigenen Skripte in `public/`.
 *
 * Oxygen liefert `public/` mit `cache-control: public, max-age=31536000` aus,
 * unter festem Namen. Beim Deploy leert Cloudflare seinen Edge-Cache, den
 * Browser-Cache nicht: ein wiederkehrender Besucher führt bis zu ein Jahr die
 * alte Fassung aus (gemessen 2026-10-07, Job
 * 20261007-storefront-pixelskripte-ohne-version-jahrescache).
 *
 * Diese Tabelle (`/<datei>.js` -> erste 8 Hex-Zeichen des SHA-256 des Inhalts)
 * entsteht beim Build und geht über `vite.config.js` als
 * `__QB_PUBLIC_SKRIPT_V__` ins Bundle. Ändert sich eine Datei, ändert sich ihr
 * URL, ohne dass jemand eine Zahl von Hand nachzieht.
 *
 * Gelesen werden nur die `.js`-Dateien direkt in `public/`, Byte für Byte so,
 * wie Vite sie nach `dist/client` kopiert. Was hier nicht steht, bindet
 * `~/lib/public-skript` ohne Versionsangabe ein (Verhalten wie vorher).
 * Wache am Live-HTML: homepage-bauer/pruefungen/probe_public_skripte_version.py
 */
export function publicSkriptVersionen(publicDir) {
  const tabelle = {};
  for (const name of readdirSync(publicDir).sort()) {
    if (!name.endsWith('.js')) continue;
    const inhalt = readFileSync(join(publicDir, name));
    tabelle[`/${name}`] = createHash('sha256')
      .update(inhalt)
      .digest('hex')
      .slice(0, 8);
  }
  return tabelle;
}
