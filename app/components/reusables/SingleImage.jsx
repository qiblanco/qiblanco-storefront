import {CdnBild} from './CdnBild';

/**
 * SingleImage — ein einzelnes, über die Sektionsbreite laufendes Bild.
 *
 * Bis 2026-09-17 ein nacktes <img>: keine Größenangabe, keine Leiter, kein
 * loading. Gemessen auf der Startseite (mobil 390x844 DPR2): der Einsatzort
 * `chip-vergleich` liefert GitterChips_Vergleich-min.webp mit 5047 px Master
 * in eine Fläche von 358 CSS-px -- 363 900 B für ein Bild, das bei
 * t = 17 422 px erst nach Scrollen sichtbar wird. Mit der Leiter sind es
 * 62 998 B (-82 %, am CDN nachgemessen).
 *
 * `anzeigeBreite` folgt der DESKTOP-Breite (1318 px gemessen), weil die Leiter
 * die größte vorkommende Fläche decken muss; `sizes` sagt dem Telefon,
 * dass es dort nur 92vw sind, und lässt es eine kleinere Sprosse wählen.
 */
export function SingleImage({link, size, dataSection}){
    const bild = (
        <CdnBild
            className="SingleImageCentered"
            src={link}
            alt=""
            anzeigeBreite={1318}
            sizes="(min-width: 1000px) 1318px, 92vw"
            loading="lazy"
        />
    );
    if (size === "fullscreen"){
        return (
            <>
            {bild}
            </>
        )
    }
    return (
        <div className="NormalSectionSize" data-section={dataSection}>
            {bild}
        </div>
    )
}
