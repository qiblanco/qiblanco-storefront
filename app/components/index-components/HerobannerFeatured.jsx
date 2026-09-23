import { ReviewCount } from "../reusables/ReviewCount"
import { Link } from "react-router"
import {CdnBild} from '../reusables/CdnBild';
import {Produkt360Video} from "../reusables/Produkt360Video"
import {WasserstrukturErklaerung} from "../reusables/WasserstrukturErklaerung"
export function HerobannerFeatured({dataSection}){
    return(
        <div className="HerobannerFeatured NormalSectionSize" data-section={dataSection}>
            <h1 className="text-center">Tragbares Hightech <br /> mit messbaren Effekten auf Zellebene</h1>
            <div className="herobanner-seperator g-10p flex-container flex-row small--flex-column flex-align-start flex-justify-space-between">
                <div className="text-content">
                    <h2>QiOne® 2 Pro</h2>
                    <p className="color-accent-main"><strong><ReviewCount /></strong></p>
                    <p><strong>Mehr als 14.000+ aktive Nutzer</strong></p>
                    {/* „kohärenten Wasserstruktur" ist seit dem 22.09.2026 ein
                        Erklär-Knopf (Christian: „Sobald man drüber fährt oder
                        drauf klickt, geht ein Popup auf"). Der Baustein liegt
                        in reusables/, weil dieselbe Zeile auch im Kopf von
                        /pages/schlaf-zellen-schutz steht.

                        DIE WENDUNG BLEIBT EIN ZUSAMMENHÄNGENDER TEXTKNOTEN mit
                        echten Umlauten. Die Abnahme-Probe sucht sie so; in zwei
                        Elemente zerrissen oder auf ASCII umgeschrieben findet
                        sie die Probe nicht mehr und meldet Messausfall statt
                        eines Urteils. */}
                    <p class="mt-1"><strong>Erfahre jetzt die Vorteile der <WasserstrukturErklaerung /></strong></p>
                    {/* Bis 2026-09-17 trugen diese vier Symbole EINEN festen
                        &width=51 - die 3x-Sprosse für ein 17-px-Feld. Das ist auf
                        einem Telefon mit dpr 3 richtig und auf einem Rechner mit
                        dpr 1 dreimal zu viel; die Bildlast-Wache hat sie am
                        2026-09-17 auf dem Desktop-Profil mit 3,00x gemeldet. Mit
                        der Leiter wählt der Browser je Gerät: am CDN gemessen
                        936 B bei w=17 gegen 1458 B bei w=51 (Master 2262 B). */}
                    <p class="mt-1">
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
                    <p class="mt-1 cellstudies-checkmark">
                        <CdnBild className="inline-image" src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Green_Checkmark.webp?v=1676668861"
                            alt="" breite={17} hoehe={17} anzeigeBreite={17} />
                        <strong>&nbsp; Wirkung in Zellstudien bestätigt</strong>
                    </p>
                    <div className="flex-container flex-row small--flex-column flex-align-start flex-justify-start g-10p mt-2">
                        <Link prefetch="intent" to="/products/qione-2-pro" className="btn--primary">Jetzt kaufen</Link>
                        <Link prefetch="intent" to="/pages/qione-2-pro-details" className="btn--secondary">Mehr erfahren</Link>
                    </div>
                    <p className="micro-text mt-1"><strong> Jetzt 20 Tage nach Erhalt testen - mit 0 % Finanzierung & Käuferschutz - 100 % Geld-zurück-Garantie </strong></p>
                    {/* Markenname statt alt="": der Begleittext nennt nur "0 % Finanzierung",
                        WELCHE Zahlungsart gemeint ist steht nirgends als Text — die Logos sind
                        der einzige Träger dieser Auskunft. Dieselbe Begründung wie in
                        reusables/RatenzahlungHerobanner.jsx; bis 2026-09-12 waren diese zwei
                        die letzten Zahlungslogos des Ladens mit alt="" (22 mit Namen, 2 ohne),
                        gefunden von der unabhängigen Gegenprüfung zu s07. */}
                    <CdnBild style={{margin: "20px 20px 20px 0"}} breite={75} hoehe={42}
                        loading="lazy" anzeigeBreite={75}
                        src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/800px-Klarna_Payment_Badge.svg_7f45bfec-1ac3-4234-9914-98cf49b040f4.png?v=1671199816" alt="Klarna" />
                    <CdnBild style={{margin: "20px 20px 20px 0"}} breite={75} hoehe={38}
                        loading="lazy" anzeigeBreite={75}
                        src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/paypal-784404_1280.webp?v=1708904082" alt="PayPal" />
                </div>
                {/* Die 360-Grad-Drehung steht EINMAL im Dokument, nicht zweimal.
                    Bis 2026-09-19 lag dasselbe Produktfoto hier UND weiter oben als
                    `hide-desktop`-Kopie; bei einem Video wären das zwei Kaesten
                    gewesen, von denen einer immer unsichtbar lädt. Auf schmalen
                    Schirmen zieht `.featured-image` per `order: -1` an dieselbe
                    Stelle, an der vorher die mobile Kopie stand (direkt unter der
                    Ueberschrift) — CSS in app/styles/startseite.css, Abschnitt
                    „Der Kopfbereich zeigt die 360-Grad-Drehung". Bewusst NICHT
                    in app.css: die lädt auf jeder Route, und `.featured-image`
                    ist doppelt vergeben (siehe dort). */}
                <div className="featured-image featured-image--360">
                    <Produkt360Video alt="QiOne® 2 Pro in der 360-Grad-Ansicht" />
                </div> 
            </div>
        </div>
    )
}