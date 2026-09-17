import {CdnBild} from '../reusables/CdnBild';
import { Link } from "react-router"

export function FeaturedProduct({title, label, linkDetailseite, linkKaufseite, bildLinks, bildRechts, dataSection}){
    return(
        <div className="FeaturedProduct" data-section={dataSection}>
            <h2>{title}</h2>
            <h3>{label}</h3>
            <div className="FeaturedProduct_Links">
                <Link prefetch="intent" to={linkDetailseite}>Mehr erfahren</Link>
                <Link prefetch="intent" to={linkKaufseite}>Jetzt kaufen</Link>
            </div>
            <div className="FeaturedProduct_ImageWrapper">
                {/* Bewusst OHNE breite/hoehe: dieser Baustein rendert sechs
                    verschiedene Produktbilder, und sie haben NICHT dasselbe
                    Verhältnis (gemessen 2026-09-17: QiOne2Pro_02 2160x2160
                    quadratisch, QiHome_side 800x868, QiHomeAir 1024x906). Ein
                    einheitlich gesetztes Verhältnis würde zwei von sechs
                    Bildern verzerren -- schlimmer als der Sprung, den es
                    verhindern soll. Die Stelle liegt bei ~18 000 px, trägt
                    also nichts zum gemessenen Lade-CLS bei. Die DEV-Warnung
                    von CdnBild ist hier bekannt, nicht uebersehen. */}
                <CdnBild src={bildLinks} alt={title} anzeigeBreite={720}
                    sizes="(min-width: 1000px) 720px, 50vw" loading="lazy" />
                <CdnBild src={bildRechts} alt={title} anzeigeBreite={720}
                    sizes="(min-width: 1000px) 720px, 50vw" loading="lazy" />
            </div>
        </div>
    )
}