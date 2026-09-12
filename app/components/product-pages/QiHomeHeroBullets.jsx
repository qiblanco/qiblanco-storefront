/*
 * QiHomeHeroBullets — unabhängiger 1:1-Nachbau des Hero-Bullet-Blocks der
 * PDP /products/qihome-air für die LP-Shopseite /pages/qihome (IA-Umbau
 * Zwei-Block-Struktur, Job 20260717-storefront-ia-zweiblock-umbau;
 * Muster: QiOneHeroBulletsPages/QiBraceletHeroBullets, D-046).
 *
 * WARUM RAW-HTML STATT JSX: das Live-RTE-HTML trägt Inline-<meta charset>-
 * Tags IN <p>/<b> — React 19 hoisted JSX-<meta> in den <head> (Metadata-
 * Hoisting) und würde die Struktur umformen; dangerouslySetInnerHTML
 * rendert byte-treu (dasselbe Rezept wie die Legacy-Bloecke in
 * QiOneHeroBulletsPages). data-mce-fragment entfernt (Provenienz ehrlich),
 * NBSP-Quirks als \u00A0-Escapes erhalten (Byte-Map:
 * belege/pdp_description_qihome-air.html im Job-Ordner).
 *
 * ALT-ATTRIBUT (2026-09-12, s07 des Grossjobs 20260911-...-technische-
 * auffindbarkeit): drei der vier Icons kamen byte-treu OHNE alt aus dem
 * Live-RTE-HTML. Sie tragen jetzt alt="" -- dieselbe Begründung wie das
 * bereits hier weggelassene data-mce-fragment: der 1:1-Vertrag ist OPTISCH,
 * und alt trägt kein CSS (im ganzen Repo kein Attributselektor darauf, 2026-
 * 09-12 nachgemessen). Alle vier Icons sind dekorativ, ihre Bedeutung steht als
 * Text unmittelbar daneben -- alt="" ist die fachlich richtige Angabe, kein
 * erfundener Text. Das vierte Icon (Person_ArmsUp) trug es schon.
 *
 * BULLET-UPDATES (Auftrag, Wording = qione-2-pro-Praezedenz):
 *   "Schutz vor E-Smog & 5G"              -> "E-Smog Schutz"
 *   "Gesteigerte Anbindung zum Quantenfeld" -> "Zellgesundheit"
 *   "Wohlfuehlatmosphaere" bleibt (produkt-spezifisch, konkret).
 *
 * EDITIEREN: Texte unten in BULLET_TEXTE ändern — sonst nichts.
 */

export const BULLET_TEXTE = {
  wohlfuehl: 'Wohlf\u00FChlatmosph\u00E4re',
  esmog: 'E-Smog Schutz',
  zellen: 'Zellgesundheit',
};

const HTML = `<p>\u00A0</p>
<p class="p1"><meta charset="utf-8">Der ultimative Schutz f\u00FCr dich &amp; dein gesamtes Zuhause!</p>
<ul>
<li><b><img src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Person_ArmsUp_Icon_79524077-1a55-4f2e-9af6-d2a874f912f2_480x480.webp?v=1677002647" alt="" width="23" height="23">\u00A0 <meta charset="utf-8">${BULLET_TEXTE.wohlfuehl}</b></li>
<li><b><img style="float: none;" height="17" width="23" alt="" src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/WIFI_ICON_09426b68-adde-48d2-8fa4-2e1d5e43591d_16x16.webp?v=1676668860">\u00A0 ${BULLET_TEXTE.esmog}</b></li>
<li><b><img style="float: none;" height="23" width="23" alt="" src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Molecule_Icon_1930bc3d-20ef-4d76-a729-d9b6a19cc772_16x16.webp?v=1676669033">\u00A0 ${BULLET_TEXTE.zellen}</b></li>
</ul>
<p>\u00A0</p>
<p class="p1"><span style="color: #39682c;"><strong><img src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Green_Checkmark_480x480.webp?v=1676668861" alt="" width="21" height="21" style="float: none;">\u00A0Wirkung des verbauten Gitterchip\u2122 in Zellstudien best\u00E4tigt</strong></span></p>
<p>\u00A0</p>`;

export function QiHomeHeroBullets() {
  return (
    <div
      className="ProductDescription"
      data-qi-hero-bullets="qihome-pages"
      dangerouslySetInnerHTML={{__html: HTML}}
    />
  );
}
