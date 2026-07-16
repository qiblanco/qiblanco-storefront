/*
 * QiOneHeroBulletsPages — unabhängiger 1:1-Nachbau des Hero-Bullet-Blocks
 * der Campaign-PDP /pages/qione-2-pro (Job 20260716-bauer-homepage-
 * verstaendnis-hero-nachbau-qione).
 *
 * WARUM ES DIESE KOMPONENTE GIBT: Der Block („Für Superhumans …" + 3
 * iconisierte Bullets + Zellstudien-Zeile) kam bis dahin auf BEIDEN Seiten
 * aus demselben Shopify-Produktfeld descriptionHtml (live belegt:
 * .ProductDescription byte-identisch, sha256 f6a9e264…, data-mce-fragment-
 * RTE-Signatur). Eine Shopify-Admin-Änderung traf damit immer beide Seiten.
 * Diese Komponente ENTKOPPELT die Campaign-PDP: /pages rendert ab jetzt
 * diesen editierbaren Code-Block, /products weiter unverändert Shopify.
 *
 * 1:1-VERTRAG: Klassen (.ProductDescription/.qi-de/.p1/.mb-3), Inline-Styles,
 * Icon-CDN-URLs, Whitespace-Quirks (NBSP-Muster; führendes Leerzeichen im
 * <b> von Bullet 2+3; trailing NBSP in Bullet 1) sind exakt vom Live-Stand
 * 2026-07-16 übernommen — der Block darf sich optisch NICHT unterscheiden,
 * nur die 3 Bullet-Texte sind neu. Styling kommt weiter komplett aus den
 * globalen Shop-Stylesheets (.ProductDescription ul / ul li img in app.css).
 *
 * BEWUSSTE, UNSICHTBARE ABWEICHUNGEN: data-mce-fragment wird NICHT gefälscht
 * (RTE-Provenienz-Signatur, trägt kein CSS); stattdessen markiert
 * data-qi-hero-bullets="pages" den Block als Code-Eigenbau (Testbarkeit).
 * Die versteckten Legacy-RTE-Blöcke (display:none) sind byte-identisch als
 * Raw-HTML übernommen (Struktur-Parität, z. B. für :last-child-Selektoren).
 *
 * EDITIEREN: Bullet-Texte unten in HERO_BULLETS_PAGES ändern — sonst nichts.
 */

const NBSP = '\u00A0';

const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files';

/**
 * Die 3 Hero-Bullets der Campaign-PDP. `text` ist die editierbare Stelle.
 * img-Maße/float/lead/trail bilden die Live-Markup-Quirks 1:1 ab — beim
 * Editieren von Texten NICHT anfassen (visueller 1:1-Vertrag).
 */
export const HERO_BULLETS_PAGES = [
  {
    id: 'schlaf',
    text: 'Tieferer Schlaf',
    img: {
      src: `${CDN}/Person_ArmsUp_Icon_79524077-1a55-4f2e-9af6-d2a874f912f2_480x480.webp?v=1677002647`,
      alt: '',
      width: 23,
      height: 23,
      float: false,
    },
    leadSpace: false,
    trailNbsp: true,
  },
  {
    id: 'esmog',
    text: 'E-Smog Schutz',
    img: {
      src: `${CDN}/WIFI_ICON_09426b68-adde-48d2-8fa4-2e1d5e43591d_16x16.webp?v=1676668860`,
      alt: undefined,
      width: 23,
      height: 17,
      float: true,
    },
    leadSpace: true,
    trailNbsp: false,
  },
  {
    id: 'zellen',
    text: 'Zellgesundheit',
    img: {
      src: `${CDN}/Molecule_Icon_1930bc3d-20ef-4d76-a729-d9b6a19cc772_16x16.webp?v=1676669033`,
      alt: undefined,
      width: 23,
      height: 23,
      float: true,
    },
    leadSpace: true,
    trailNbsp: false,
  },
];

const CHECKMARK_ICON = `${CDN}/Green_Checkmark_480x480.webp?v=1676668861`;

/*
 * Versteckte Legacy-RTE-Reste, byte-identisch vom Live-descriptionHtml
 * übernommen (beide display:none via .new-not-visible). Als Raw-HTML statt
 * JSX, damit React-Serialisierung (z. B. <meta> im <p>) nichts umformt.
 */
const LEGACY_HIDDEN_QI_DE = `
<ul></ul>
<p class="qi-price qi-price_fundable">&nbsp;</p>
`.trim();

const LEGACY_HIDDEN_QI_EN = `
<div class="qi-en"><br></div>
<div class="qi-en">
<br>
<p class="p1"><meta charset="utf-8"><span>QiOne® helps you reach peak mental and physical performance.&nbsp;Experience the benefits of coherent water as it flows through your body.</span></p>
<ul>
<li><strong>Personal&nbsp;Growth</strong></li>
<li><strong>EMF &amp; 5G Protection</strong></li>
<li><strong>Enhanced Connection to the Quantum Field</strong></li>
</ul>
<meta charset="utf-8">
<p class="p1"><span><br>Connect your</span><span>&nbsp;100 000 000 000 000&nbsp;cells&nbsp;now.</span></p>
<div class="qi-en">
<p class="qi-price">&nbsp;</p>
</div>
</div>
`.trim();

export function QiOneHeroBulletsPages() {
  return (
    <div className="ProductDescription" data-qi-hero-bullets="pages">
      <p>{NBSP}</p>
      <div style={{textAlign: 'start'}} className="qi-de">
        <p className="p1">
          {`Für Superhumans – dank zweiter Chip Generation und${NBSP}8-facher Stärke.`}
        </p>
        <ul>
          {HERO_BULLETS_PAGES.map((b) => (
            <li key={b.id}>
              <b>
                {b.leadSpace ? ' ' : null}
                <img
                  src={b.img.src}
                  alt={b.img.alt}
                  width={b.img.width}
                  height={b.img.height}
                  style={b.img.float ? {float: 'none'} : undefined}
                />
                {`${NBSP} ${b.text}${b.trailNbsp ? NBSP : ''}`}
              </b>
            </li>
          ))}
        </ul>
        <p className="p1">{NBSP}</p>
        <p className="p1 mb-3">
          <span style={{color: '#39682c'}}>
            <strong>
              {/* 1:1-Vertrag: Live-Original traegt KEIN alt-Attribut — DOM-
                  Parität geht hier vor a11y-Regel (bewusst, siehe Kopf). */}
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <img
                src={CHECKMARK_ICON}
                width={21}
                height={21}
                style={{float: 'none'}}
              />
              {`${NBSP}Wirkung in Zellstudien bestätigt`}
            </strong>
          </span>
        </p>
        <div
          className="new-not-visible"
          dangerouslySetInnerHTML={{__html: LEGACY_HIDDEN_QI_DE}}
        />
      </div>
      <div
        className="new-not-visible"
        dangerouslySetInnerHTML={{__html: LEGACY_HIDDEN_QI_EN}}
      />
    </div>
  );
}
