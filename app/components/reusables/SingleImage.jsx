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
 *
 * `alt` (seit 2026-10-09, Job 20261009-update-alt-texte-produktbilder-alle-
 * shops s02): beschreibender Text des Bildes, am Bild abgelesen und am
 * Aufrufort gesetzt. Ohne Angabe bleibt alt="" wie bisher -- OHNE
 * role=presentation, denn ob ein Bild dekorativ ist, weiß nur der Aufrufort.
 * Ein erfundener Vorgabewert hier wäre schlechter als keiner.
 *
 * `auslauf` (seit 2026-10-27, Job 20261025-design-repair-qihome-air-animation-
 * schwarz-preisanker-ultimate-power-s05): lässt eine Bildkante weich in die
 * Fläche auslaufen, statt sie als Rechteck zu zeigen ("oben"). Setzt den Haken
 * data-qb-auslauf; die Maske steht in app/styles/qb-360-rand.css, die der
 * Aufrufort per links() lädt. Ohne Angabe kein Attribut, DOM wie bisher.
 */
export function SingleImage({link, size, dataSection, alt = '', auslauf}){
    const bild = (
        <CdnBild
            className="SingleImageCentered"
            src={link}
            alt={alt}
            anzeigeBreite={1318}
            sizes="(min-width: 1000px) 1318px, 92vw"
            loading="lazy"
            data-qb-auslauf={auslauf}
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
