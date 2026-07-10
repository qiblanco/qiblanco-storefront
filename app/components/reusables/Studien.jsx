import { Link } from "react-router"

export function Studien({headline, dataSection}) {
    return (
        <div className="Studien NormalSectionSize" data-section={dataSection}>
            <h2 className="text-center">{headline}</h2>
            <div className="FlexContainer text-center">
                <div className="Row mt-3">
                    <div className="Column">
                        <h3>Wissenschaftliche Publikation an Immunzellen</h3>
                        <p>veröffentlicht im Japan Journal of Medicine am April 30, 2021</p>
                        <a href="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro-human-cell-study-publication-april-30-2021_1.pdf?v=1667512705" target="_blank"><img src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Studienvorschau_hellblau-1-957x1024_2.png?v=1732276510" alt="" /></a>
                    </div>
                    <div className="Column">
                        <h3>Wissenschaftliche Publikation an Darmzellen</h3>
                        <p>veröffentlicht im Applied Cell Biology Journal, 2021</p>
                        <a target="_blank" href="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/protective-effect-of-qionereg-2-pro-on-cultured-intestinal-epithelial-358_1.pdf?v=1667513844"><img src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Studienvorschau_hellblau-1-957x1024_1.png?v=1732276143" alt="" /></a>
                    </div>
                </div>
                <div className="Row mt-3">
                    <div className="Column">
                        <h3>Wissenschaftliche Publikation zum oxidativen Stress</h3>
                        <p>veröffentlicht im Applied Cell Biology Journal am Januar 12, 2024</p>
                        <a target="_blank" href="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Studie_-_Appl_Cell_Biol_12_1_2024_1-6_-_Protective_Effect_of_the_QiBracelet_Against_Oxidative_Stress.pdf?v=1709036505"><img src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Cell_Biology_Cover_Remake_Seite_3.png?v=1710540229" alt="" /></a>
                    </div>
                    <div className="Column">
                        <h3>Forschungsartikel zur Nutzererfahrung</h3>
                        <p>veröffentlicht im Advances in Bioengineering & Biomedical Science Research am Mai 10, 2024</p>
                        <a target="_blank" href="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/ABBSR-24_-31_3.pdf?v=1717500318"><img src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Cell-Biology-Cover-Remake-Seite-4.webp?v=1717500844" alt="" /></a>
                    </div>
                </div>
            </div>
            <p className="text-center mt-2 mb-2"><strong>Wissenschaftlich getestet und in internationalen Fachpublikationen bestätigt.</strong></p>
            <Link prefetch="intent" to="/pages/studien" className="btn--secondary m-center">Zelluntersuchungen ansehen</Link>
        </div>
    )
}