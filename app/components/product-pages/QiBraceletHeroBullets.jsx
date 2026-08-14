/*
 * QiBraceletHeroBullets — unabhaengiger 1:1-Nachbau des Hero-Bullet-Blocks
 * der PDP /products/qibracelet fuer die LP-Shopseite /pages/qibracelet
 * (IA-Umbau Zwei-Block-Struktur, Job 20260717-storefront-ia-zweiblock-umbau;
 * Muster: QiOneHeroBulletsPages, D-046).
 *
 * WARUM: Die PDP rendert das Shopify-Feld descriptionHtml — eine Admin-
 * Aenderung traefe /pages UND /products zugleich. Diese Komponente ENTKOPPELT
 * die LP-Shopseite; /products rendert descriptionHtml unveraendert weiter.
 *
 * 1:1-VERTRAG: Struktur, Klassen (.qi-de/.p1), Icon-CDN-URLs (480x480-
 * Varianten!), Img-Masse (24/24, 19/24, 24/24; Checkmark 22/22) und die
 * NBSP-Quirks sind exakt vom Live-Stand 2026-07-17 uebernommen (Byte-Map:
 * belege/pdp_description_qibracelet.html im Job-Ordner). NUR die 3 Bullet-
 * Texte sind neu (Auftrag "Bullet-Updates", Wording = qione-2-pro-Praezedenz):
 *   "Persoenliches Wachstum"            -> "Tieferer Schlaf"
 *   "Schutz vor E-Smog & 5G"            -> "E-Smog Schutz"
 *   "Gesteigerte Anbindung z. Quantenf."-> "Zellgesundheit"
 *
 * BEWUSSTE, UNSICHTBARE ABWEICHUNGEN: data-mce-fragment wird NICHT gefaelscht
 * (RTE-Provenienz-Signatur, traegt kein CSS); Marker data-qi-hero-bullets=
 * "qibracelet-pages". Der versteckte Legacy-RTE-Block (display:none via
 * .new-not-visible: alte Preis-/Status-Zeilen + englische Varianten) ist als
 * Raw-HTML uebernommen (Struktur-Paritaet fuer :last-child-Selektoren).
 *
 * EDITIEREN: Bullet-Texte unten in BULLET_TEXTE aendern — sonst nichts.
 */

const NBSP = '\u00A0';

const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files';

/** Die 3 editierbaren Bullet-Texte der LP-Shopseite. */
export const BULLET_TEXTE = {
  schlaf: 'Tieferer Schlaf',
  esmog: 'E-Smog Schutz',
  zellen: 'Zellgesundheit',
};

/*
 * Versteckter Legacy-RTE-Rest (display:none via .new-not-visible), aus dem
 * Live-descriptionHtml uebernommen; data-mce-fragment-Attribute entfernt
 * (Provenienz ehrlich), Inhalt sonst unveraendert.
 */
const LEGACY_HIDDEN = `<p class="p1"><br></p>
<p class="qi-price qi-price_fundable"><meta charset="utf-8"><span>1.578</span><span>,-\u20AC</span></p>
<p class="p1">inkl. MwSt, weltweiter Versand<br>Versandkostenfrei innerhalb Deutschlands; nach \u00D6sterreich und in die Schweiz fallen Versandkosten laut Versandpolicy an (Zoll- und Importgeb\u00FChren sind im Preis enthalten)<br><br><br></p>
<p class="qi-status qi-available">In drei Gr\u00F6\u00DFen erh\u00E4ltlich: S, M und L<br></p>
<p style="color: #729f49;" class="qi-status qi-available"><span>Wirkung in Zellstudien best\u00E4tigt</span></p>
<p class="qi-status qi-shipping">In 2-7\u00A0Tagen nach Versand bei dir\u00B9\u00A0</p>
<br><meta charset="utf-8">
<div class="qi-en"><br></div>
<div class="qi-en"><br></div>
<div class="qi-en">
<br>
<p class="p1"><meta charset="utf-8"><meta charset="utf-8"><span>QiBracelet\u00AE helps you reach peak mental and physical performance.\u00A0Experience the benefits of coherent water as it flows through your body.</span></p>
<ul>
<li><strong>Personal\u00A0Growth</strong></li>
<li><strong>EMF &amp; 5G Protection</strong></li>
<li><strong>Enhanced Connection to the Quantum Field</strong></li>
</ul>
<meta charset="utf-8">
<p class="p1"><span><br>Connect your</span><span>\u00A0100 000 000 000 000\u00A0cells\u00A0now.</span><br></p>
<div class="qi-en">
<p class="qi-status qi-shipping"><span style="color: #e42610;"><strong></strong></span><br></p>
<p class="qi-price"><meta charset="utf-8"><span>1.599</span><span>,-\u20AC</span><br></p>
<p class="p1">For shipments to other European countries (e.g. Switzerland) additional customs duties apply. Your credit card will be charged in your currency at the most current exchange rate.</p>
<p class="p1">\u00A0<br></p>
<p class="qi-status qi-available" style="color: #000000;"><span>Available in three sizes: S, M and L</span></p>
<p class="qi-status qi-available" style="color: #729f49;"><span>Effect Confirmed In Cell Studies</span></p>
<p class="qi-status qi-shipping">International Shipping: 3 \u2013 9 Days</p>
<meta charset="utf-8"> <br>
</div>
</div>`;

export function QiBraceletHeroBullets() {
  return (
    <div className="ProductDescription" data-qi-hero-bullets="qibracelet-pages">
      <p>{NBSP}</p>
      <p>{'F\u00FCr Superhumans \u2013 dank zweiter Chip Generation und 8-facher St\u00E4rke.'}</p>
      <div className="qi-de">
        <ul>
          <li>
            <b>
              {' '}
              <img
                height="24"
                width="24"
                alt=""
                src={`${CDN}/Person_ArmsUp_Icon_79524077-1a55-4f2e-9af6-d2a874f912f2_480x480.webp?v=1677002647`}
              />
              {`${NBSP}${BULLET_TEXTE.schlaf}`}
            </b>
          </li>
          <li>
            <img
              height="19"
              width="24"
              alt=""
              src={`${CDN}/WIFI_ICON_09426b68-adde-48d2-8fa4-2e1d5e43591d_480x480.webp?v=1676668860`}
            />
            {NBSP}
            <b>{BULLET_TEXTE.esmog}</b>
          </li>
          <li>
            <img
              height="24"
              width="24"
              alt=""
              src={`${CDN}/Molecule_Icon_1930bc3d-20ef-4d76-a729-d9b6a19cc772_480x480.webp?v=1676669033`}
            />
            {NBSP}
            <b>{BULLET_TEXTE.zellen}</b>
            <b></b>
          </li>
        </ul>
        <p>{NBSP}</p>
      </div>
      <div className="qi-de">
        <p>
          {/* 1:1-Vertrag: Live-Original — Checkmark 22x22, alt="" vorhanden. */}
          <img
            src={`${CDN}/Green_Checkmark_480x480.webp?v=1676668861`}
            alt=""
            width="22"
            height="22"
          />{' '}
          <span>
            <strong style={{color: '#39682c'}}>
              {'Wirkung in Zellstudien best\u00E4tigt'}
            </strong>
          </span>
        </p>
      </div>
      <div className="qi-de">
        <p className="p1">
          <br />
        </p>
        <div
          className="new-not-visible"
          dangerouslySetInnerHTML={{__html: LEGACY_HIDDEN}}
        />
      </div>
    </div>
  );
}
