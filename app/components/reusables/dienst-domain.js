/**
 * Eigene Dienste unter eigener Domain (*.dienst.qiblanco.com) statt *.sslip.io.
 * Job 20261030-folge-dienste-auf-eigene-domain-nach-dns (Eltern-Auftrag vom 30.10.
 * „Kaufweg ohne sslip.io“, Christian Z9:
 * „Die Page muss auf allen möglichen Varianten immer funktionieren, ohne dass
 * wir irgendwo gesperrt werden.“).
 *
 * Die Dienste laufen unverändert auf dem ai-server. Caddy führt seit
 * 2026-10-30 je Dienst den neuen Namen als ZWEITEN Namen im bestehenden Block;
 * der sslip-Name bleibt erreichbar (alte Mails, Rückweg).
 *
 * WARUM EINE ABBILDUNG UND NICHT NUR NEUE KONSTANTEN: der Basis-Beacon kommt
 * aus der Workflow-Env `PUBLIC_QPX_BASIS_ENDPOINT`, und `.github/` ist für
 * hb-deploy Hard-Deny (Workflow-Push nur unter Christians SSH-Schlüssel,
 * homepage-bauer devlog D-3694). Die Abbildung greift deshalb dort, wo der
 * Wert gelesen wird. Steht die Workflow-Zeile eines Tages selbst auf dem
 * neuen Namen, ist die Abbildung die Identität.
 *
 * ORT: liegt unter components/reusables/ statt lib/, weil die hb-deploy-Allowlist
 * (homepage-bauer/config/deploy.conf) lib/-Dateien einzeln freigibt und die Zeile
 * am 30.10./01.11. an einer fremden offenen Änderung der Datei scheiterte;
 * reusables/* ist als Ganzes freigegeben. Reiner Modul-Code ohne JSX.
 *
 * RÜCKWEG: hb-deploy revert --sha <merge-sha>. Für Anna allein zusätzlich
 * ohne Code: PUBLIC_SALESBOT_WIDGET_ORIGIN=https://salesbot.65-108-150-121.sslip.io.
 */

/** Alter sslip-Host -> neuer Host. Nur Dienste, die Caddy unter beiden Namen führt. */
export const DIENST_DOMAIN_UMZUG = {
  'salesbot.65-108-150-121.sslip.io': 'anna.dienst.qiblanco.com',
  'qpx.65-108-150-121.sslip.io': 'qpx.dienst.qiblanco.com',
  'termin.65-108-150-121.sslip.io': 'termin.dienst.qiblanco.com',
  'anmelden.65-108-150-121.sslip.io': 'anmelden.dienst.qiblanco.com',
};

/**
 * Absolute URL auf den eigenen Dienst-Namen umschreiben. Alles andere
 * (fremder Host, relativer Pfad, leer, kaputt) kommt unverändert zurück.
 *
 * @param {string | undefined | null} wert
 * @returns {string}
 */
export function aufDienstDomain(wert) {
  const roh = typeof wert === 'string' ? wert : '';
  if (!roh) return '';
  let url;
  try {
    url = new URL(roh);
  } catch {
    return roh;
  }
  const neu = DIENST_DOMAIN_UMZUG[url.hostname];
  if (!neu) return roh;
  url.hostname = neu;
  return url.toString();
}

/**
 * Der Basis-Beacon (/b), den der Browser direkt an qpx schickt.
 *
 * @param {Record<string, string | undefined>} [env]
 * @returns {string} '' wenn die Env fehlt (Previews bleiben dunkel)
 */
export function qpxBasisEndpoint(env) {
  return aufDienstDomain(env?.PUBLIC_QPX_BASIS_ENDPOINT || '');
}
