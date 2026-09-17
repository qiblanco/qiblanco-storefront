import {CdnBild} from './CdnBild';
/*
 * LogoBar — die vier Presse-/Partner-Marken unter dem Herobanner.
 *
 * WARUM DIE alt-TEXTE DIE MARKENNAMEN TRAGEN (Job 20260908-seo-rest-repo-
 * alttexte-und-ueberschriften): die Leiste steht OHNE Überschrift und ohne
 * begleitenden Text — die vier Wortmarken sind der gesamte Inhalt. Mit
 * alt="" war dieser Inhalt für Screenreader und Suchmaschinen nicht
 * vorhanden; das ist der Fall, in dem alt="" falsch ist. Jeder Name wurde am
 * BILD abgelesen, nicht aus dem Dateinamen geraten (der Dateiname
 * "Design-ohne-Titel" im Nachbarbauteil zeigt, warum das nötig ist).
 * Bewusst NUR der Markenname: eine Einordnung wie "Bekannt aus" wäre eine
 * neue Aussage und damit eine inhaltliche Entscheidung.
 */
export function LogoBar({dataSection}){
    return(
        <div className="LogoBar" data-section={dataSection}>
            <div className="LogoBar-ImgWrapper">
                <CdnBild
                    src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qiblanco-com-braineffect-logo_4432a822-e091-4258-9b69-ef027d31ebd7.png?v=1681469353"
                    alt="BRAINEFFECT"
                    anzeigeBreite={232}
                    breite={232}
                    hoehe={40}
                    loading="lazy"
                />
                <CdnBild
                    src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Maxim-Australia-Watermark-Logo-Black_1.png?v=1710534688"
                    alt="MAXIM Australia"
                    anzeigeBreite={179}
                    breite={179}
                    hoehe={40}
                    loading="lazy"
                />
                <CdnBild
                    src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/find-your-flow-Logo-Weiss-schatten_png.webp?v=1730114606"
                    alt="find your flow!"
                    anzeigeBreite={175}
                    breite={175}
                    hoehe={40}
                    loading="lazy"
                />
                <CdnBild
                    src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/DNX_black.webp?v=1681469231"
                    alt="DNX"
                    anzeigeBreite={189}
                    breite={189}
                    hoehe={40}
                    loading="lazy"
                />
            </div>
        </div>
    )
}