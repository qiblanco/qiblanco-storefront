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
                         highQualityLink={"https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_mit-Siegel_2a003117-6b48-42ea-be23-c237a78215db.webp?v=1673788196"}
                         sofort
                         alt="QiOne® 2 Pro mit Siegel"
                         breite={1080}
                         hoehe={1080}
                         anzeigeBreite={358}
                         masterBreite={1080}
                         sizes="(min-width: 1000px) 654px, 92vw"
                         />
                    </div>
                    <h2>QiOne® 2 Pro</h2>
                    <p className="color-accent-main"><strong><ReviewCount /></strong></p>
                    <p><strong>Mehr als 14.000+ aktive Nutzer</strong></p>
                    <p class="mt-1"><strong>Erfahre jetzt die Vorteile der kohärenten Wasserstruktur</strong></p>
                    <p class="mt-1">
                        <img width="17" height="17" class="inline-image" src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Person_ArmsUp_Icon_79524077-1a55-4f2e-9af6-d2a874f912f2.webp?v=1677002647&width=51" alt="" />
                        &nbsp; Persönliches Wachstum
                    </p>
                    <p>
                        <img width="17" height="17" class="inline-image" src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/WIFI_ICON_09426b68-adde-48d2-8fa4-2e1d5e43591d.webp?v=1676668860&width=51" alt="" />
                        &nbsp; Schutz vor E-Smog & 5G
                    </p>
                    <p>
                        <img width="17" height="17" class="inline-image" src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Molecule_Icon_1930bc3d-20ef-4d76-a729-d9b6a19cc772.webp?v=1676669033&width=51" alt="" />
                        &nbsp; Gesteigerte Anbindung zum Quantenfeld
                    </p>
                    <p class="mt-1 cellstudies-checkmark">
                        <img width="17" height="17" class="inline-image" src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Green_Checkmark.webp?v=1676668861&width=51" alt="" />
                        <strong>&nbsp; Wirkung in Zellstudien bestätigt</strong>
                    </p>
                    <div className="flex-container flex-row small--flex-column flex-align-start flex-justify-start g-10p mt-2">
                        <Link prefetch="intent" to="/products/qione-2-pro" className="btn--primary">Jetzt kaufen</Link>
                        <Link prefetch="intent" to="/pages/qione-2-pro-details" className="btn--secondary">Mehr erfahren</Link>
                    </div>
                    <p className="micro-text mt-1"><strong> 20 Tage risikofrei - Jetzt mit 0% Finanzierung & Käuferschutz </strong></p>
                    {/* Markenname statt alt="": der Begleittext nennt nur "0 % Finanzierung",
                        WELCHE Zahlungsart gemeint ist steht nirgends als Text — die Logos sind
                        der einzige Träger dieser Auskunft. Dieselbe Begründung wie in
                        reusables/RatenzahlungHerobanner.jsx; bis 2026-09-12 waren diese zwei
                        die letzten Zahlungslogos des Ladens mit alt="" (22 mit Namen, 2 ohne),
                        gefunden von der unabhängigen Gegenprüfung zu s07. */}
                    <img style={{margin: "20px 20px 20px 0"}} width={75} height={42} loading="lazy" decoding="async" src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/800px-Klarna_Payment_Badge.svg_7f45bfec-1ac3-4234-9914-98cf49b040f4.png?v=1671199816&width=225" alt="Klarna" />
                    <img style={{margin: "20px 20px 20px 0"}} width={75} height={38} loading="lazy" decoding="async" src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/paypal-784404_1280.webp?v=1708904082&width=225" alt="PayPal" />
                </div>
                <div className="featured-image hide-mobile">
                    <LazyImage
                     highQualityLink={"https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_mit-Siegel_2a003117-6b48-42ea-be23-c237a78215db.webp?v=1673788196"}
                     sofort
                     alt="QiOne® 2 Pro mit Siegel"
                     breite={1080}
                     hoehe={1080}
                     anzeigeBreite={358}
                     masterBreite={1080}
                     sizes="(min-width: 1000px) 654px, 92vw"
                     />
                </div> 
            </div>
        </div>
    )
}