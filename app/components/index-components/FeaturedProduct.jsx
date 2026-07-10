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
                <img src={bildLinks} alt={title} />
                <img src={bildRechts} alt={title} />
            </div>
        </div>
    )
}