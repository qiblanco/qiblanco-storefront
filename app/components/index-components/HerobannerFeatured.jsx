import { ReviewCount } from "../reusables/ReviewCount"
import { Link } from "react-router"
import LazyImage from "../reusables/LazyImage"
export function HerobannerFeatured({dataSection}){
    return(
        <div className="HerobannerFeatured NormalSectionSize" data-section={dataSection}>
            <h1 className="text-center">Tragbares Hightech <br /> mit messbaren Effekten auf Zellebene</h1>
            <div className="herobanner-seperator g-10p flex-container flex-row small--flex-column flex-align-start flex-justify-space-between">
                <div className="text-content">
                    <div className="hide-desktop">
                        <LazyImage
                         compressedLink={"https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_mit-Siegel_2a003117-6b48-42ea-be23-c237a78215db_small.webp?v=1673788196"}
                         highQualityLink={"https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_mit-Siegel_2a003117-6b48-42ea-be23-c237a78215db.webp?v=1673788196"}
                         />
                    </div>
                    <h2>QiOne® 2 Pro</h2>
                    <p className="color-accent-main"><strong><ReviewCount /></strong></p>
                    <p><strong>Mehr als 14.000+ aktive Nutzer</strong></p>
                    <p class="mt-1"><strong>Erfahre jetzt die Vorteile der kohärenten Wasserstruktur</strong></p>
                    <p class="mt-1">
                        <img width="17" height="17" class="inline-image" src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Person_ArmsUp_Icon_79524077-1a55-4f2e-9af6-d2a874f912f2.webp?v=1677002647" alt="Persönliches Wachstum" />
                        &nbsp; Persönliches Wachstum
                    </p>
                    <p>
                        <img width="17" height="17" class="inline-image" src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/WIFI_ICON_09426b68-adde-48d2-8fa4-2e1d5e43591d.webp?v=1676668860" alt="Persönliches Wachstum" />
                        &nbsp; Schutz vor E-Smog & 5G
                    </p>
                    <p>
                        <img width="17" height="17" class="inline-image" src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Molecule_Icon_1930bc3d-20ef-4d76-a729-d9b6a19cc772.webp?v=1676669033" alt="Persönliches Wachstum" />
                        &nbsp; Gesteigerte Anbindung zum Quantenfeld
                    </p>
                    <p class="mt-1 cellstudies-checkmark">
                        <img width="17" height="17" class="inline-image" src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Green_Checkmark.webp?v=1676668861" alt="Persönliches Wachstum" />
                        <strong>&nbsp; Wirkung in Zellstudien bestätigt</strong>
                    </p>
                    <div className="flex-container flex-row small--flex-column flex-align-start flex-justify-start g-10p mt-2">
                        <Link prefetch="intent" to="/products/qione-2-pro" className="btn--primary">Jetzt kaufen</Link>
                        <Link prefetch="intent" to="/pages/qione" className="btn--secondary">Mehr erfahren</Link>
                    </div>
                    <p className="micro-text mt-1"><strong> 20 Tage risikofrei - Jetzt mit 0% Finanzierung & Käuferschutz </strong></p>
                    <img style={{margin: "20px 20px 20px 0"}} width={75} src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/800px-Klarna_Payment_Badge.svg_7f45bfec-1ac3-4234-9914-98cf49b040f4.png?v=1671199816" alt="" />
                    <img style={{margin: "20px 20px 20px 0"}} width={75} src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/paypal-784404_1280.webp?v=1708904082" alt="" />
                </div>
                <div className="featured-image hide-mobile">
                    <LazyImage 
                     compressedLink={"https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_mit-Siegel_2a003117-6b48-42ea-be23-c237a78215db_small.webp?v=1673788196"}
                     highQualityLink={"https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_mit-Siegel_2a003117-6b48-42ea-be23-c237a78215db.webp?v=1673788196"}
                     />
                </div> 
            </div>
        </div>
    )
}