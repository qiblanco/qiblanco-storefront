import {Link} from 'react-router';
import {CdnBild} from '~/components/reusables/CdnBild';
import LazyImage from '~/components/reusables/LazyImage';

/*
 * KOPF DER ROOKIE-STARTSEITE (Rookie /pages/start-b, Experiment
 * start-e1-gs081, Hypothese GS-081, Bestandteile GS-064 und H-360).
 *
 * Abgeleitet aus dem Kopf von A (index-components/HerobannerFeatured.jsx).
 * A bleibt unverändert; dieser Baustein ist eine Abschrift mit drei
 * Unterschieden, und nur diese drei sind der Test:
 *
 * 1. STANDBILD STATT 360-GRAD-DREHUNG (H-360). Statt Produkt360Video steht das
 *    Produktbild, das bis zum 19.09.2026 an derselben Stelle stand
 *    (QiOne2Pro_mit-Siegel, 1080x1080, Stand vor PR #527), mit denselben
 *    Eigenschaften wie damals (LazyImage im Sofort-Modus: eager,
 *    fetchpriority high, feste Abmessungen gegen Layout-Sprünge). B zeigt
 *    damit genau den Kopf vor der Drehung, A den mit Drehung.
 * 2. EIN ZIEL IM KOPF (GS-064). Nur „Jetzt kaufen“. „Mehr erfahren“ steht in
 *    der Produktkarte weiter unten (featured-qione-2-pro, gleiches Ziel
 *    /pages/qione-2-pro-details). Der Sterne-Sprung entfällt im Kopf; die
 *    Sterne stehen im Bewertungsblock, auf den er sprang.
 * 3. DER KNOPF IM ERSTEN BILDSCHIRM (Evergreen EG-LP-02). Bei A liegt
 *    „Jetzt kaufen“ mobil bei 1,2 Bildschirmen. Hier folgt er direkt auf
 *    Produktname und Nutzerzahl; mobil zieht das Bild per CSS nach oben
 *    (rookie-start.css), danach Name, Nutzerzahl, Knopf.
 *    Gestrichen ist dafür die Zeile zur „kohärenten Wasserstruktur“
 *    (Kaufüberzeugungs-Kanon: mit dem Kundenwort einsteigen, der Fachbegriff
 *    kommt danach). Alle übrigen Zeilen stehen wortgleich wie in A.
 *
 * Klassen wie A (HerobannerFeatured, herobanner-seperator, text-content,
 * featured-image), damit app.css und startseite.css den Kopf genau so setzen.
 * NICHT übernommen ist featured-image--360: daran hängen in startseite.css
 * Deckel und Reihenfolge der Drehung.
 */
const ZIEL = '/products/qione-2-pro';

const KOPFBILD =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/' +
  'QiOne2Pro_mit-Siegel_2a003117-6b48-42ea-be23-c237a78215db.webp?v=1673788196';

export function RookieKopf({dataSection}) {
  return (
    <div className="HerobannerFeatured NormalSectionSize qb-rs-kopf" data-section={dataSection}>
      <h1 className="text-center">Tragbares Hightech <br /> mit messbaren Effekten auf Zellebene</h1>
      <div className="herobanner-seperator g-10p flex-container flex-row small--flex-column flex-align-start flex-justify-space-between">
        <div className="text-content">
          <h2>QiOne® 2 Pro</h2>
          <p><strong>Mehr als 14.000+ aktive Nutzer</strong></p>
          <div className="qb-rs-kopf__knopf">
            <Link prefetch="intent" to={ZIEL} className="btn--primary">Jetzt kaufen</Link>
          </div>
          <p className="micro-text mt-1"><strong> Jetzt 20 Tage nach Erhalt testen - mit 0 % Finanzierung & Käuferschutz - 100 % Geld-zurück-Garantie </strong></p>
          <p className="mt-1">
            <CdnBild className="inline-image" src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Person_ArmsUp_Icon_79524077-1a55-4f2e-9af6-d2a874f912f2.webp?v=1677002647"
              alt="" breite={17} hoehe={17} anzeigeBreite={17} />
            &nbsp; Persönliches Wachstum
          </p>
          <p>
            <CdnBild className="inline-image" src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/WIFI_ICON_09426b68-adde-48d2-8fa4-2e1d5e43591d.webp?v=1676668860"
              alt="" breite={17} hoehe={17} anzeigeBreite={17} />
            &nbsp; Schutz vor E-Smog & 5G
          </p>
          <p>
            <CdnBild className="inline-image" src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Molecule_Icon_1930bc3d-20ef-4d76-a729-d9b6a19cc772.webp?v=1676669033"
              alt="" breite={17} hoehe={17} anzeigeBreite={17} />
            &nbsp; Gesteigerte Anbindung zum Quantenfeld
          </p>
          <p className="mt-1 cellstudies-checkmark">
            <CdnBild className="inline-image" src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Green_Checkmark.webp?v=1676668861"
              alt="" breite={17} hoehe={17} anzeigeBreite={17} />
            <strong>&nbsp; Wirkung in Zellstudien bestätigt</strong>
          </p>
          {/* Zahlungslogos mit Markennamen als alt, wie in A (Begründung dort). */}
          <CdnBild style={{margin: '20px 20px 20px 0'}} breite={75} hoehe={42}
            loading="lazy" anzeigeBreite={75}
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/800px-Klarna_Payment_Badge.svg_7f45bfec-1ac3-4234-9914-98cf49b040f4.png?v=1671199816" alt="Klarna" />
          <CdnBild style={{margin: '20px 20px 20px 0'}} breite={75} hoehe={38}
            loading="lazy" anzeigeBreite={75}
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/paypal-784404_1280.webp?v=1708904082" alt="PayPal" />
        </div>
        <div className="featured-image qb-rs-kopf__bild">
          <LazyImage
            highQualityLink={KOPFBILD}
            sofort
            alt="QiOne® 2 Pro mit Siegel"
            breite={1080}
            hoehe={1080}
            anzeigeBreite={358}
            masterBreite={1080}
            sizes="(min-width: 1000px) 490px, 92vw"
          />
        </div>
      </div>
    </div>
  );
}
