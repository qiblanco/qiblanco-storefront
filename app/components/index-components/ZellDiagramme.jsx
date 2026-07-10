export function ZellDiagramme({dataSection}){
    return (
        <div className="ZellDiagramme NormalSectionSize" data-section={dataSection}>
            <div className="flex-container flex-row small--flex-column flex-align-start flex-justify-space-between g-50p">
                <div className="ZellDiagramm text-center">
                    <h3>Zellregeneration<br />unter E-Smog Stress</h3>
                    <img src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Diagram_Website_1.webp?v=1741513920" alt="Zelldiagramm" />
                    <p className="micro-text text-left">
                        Studie zu QiOne® 2 Pro mit Darmepithelzellen. <br />
                        "Protective Effect of QiOne® 2 Pro on Cultured Intestinal <br />
                        Epithelial Cells after Mobile Phone Radiation."
                    </p>
                </div>
                <div className="ZellDiagramm text-center">
                    <h3>Barrierefunktion der Zelle<br />unter E-Smog Stress</h3>
                    <img src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Diagram_Website_2.webp?v=1741513920" alt="Zelldiagramm" />
                    <p className="micro-text text-left">
                        Studie zu QiOne® 2 Pro mit Darmepithelzellen. <br />
                        "Protective Effect of QiOne® 2 Pro on Cultured Intestinal <br />
                        Epithelial Cells after Mobile Phone Radiation."
                    </p>
                </div>
                <div className="ZellDiagramm text-center">
                    <h3>Zellviabilität<br />unter Oxidativen Stress</h3>
                    <img src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Diagram_Website_3.webp?v=1741513921" alt="Zelldiagramm" />
                    <p className="micro-text text-left">
                        Studie zu QiBracelet® mit Leberzellen. <br />
                        "Protective Effect o the QiBracelet® Against Oxidative Stress."
                    </p>
                </div>
            </div>    
        </div>
    )
}