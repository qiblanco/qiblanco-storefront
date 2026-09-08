import { Link } from "react-router"

/*
 * CallToAction — Produktbild + Text + Knopf.
 *
 * DIE alt-ANGABE IST EIN PARAMETER MIT LEER-DEFAULT (Job 20260908-seo-rest-
 * repo-alttexte-und-ueberschriften). Vorher stand hier ein fest verdrahtetes
 * alt="" für JEDES Bild, das dieses Bauteil je zeigt. Das ist an manchen
 * Aufrufstellen richtig (rein schmückendes Bild neben einer Überschrift,
 * die dasselbe sagt) und an anderen falsch (das Produkt selbst, über das
 * daneben gesprochen wird) - ein Bauteil kann diese Frage nicht für seine
 * Aufrufer beantworten, also beantwortet sie jetzt der Aufrufer.
 *
 * DER DEFAULT IST BEWUSST '' UND NICHT PFLICHT: so ändert diese Änderung
 * an KEINER bestehenden Aufrufstelle das ausgelieferte HTML. Wer ein alt
 * braucht, gibt es an; wer keines angibt, bleibt exakt beim alten Zustand.
 * Ein Pflichtfeld haette hier acht Aufrufstellen auf einmal berührt und den
 * Änderungsumfang von einer alt-Frage zu einer Regressionsfrage gemacht.
 */
export function CallToAction({
    img,
    imgAlt = '',
    text,
    link,
    linkText,
    linkStyle,
    dataSection
}){
    return (
        <div className="CallToAction NormalSectionSize" data-section={dataSection}>
            <img width={500} 
            src={img} 
            alt={imgAlt} />
            <div className="CallToActionTextContent">
            {text}
            <Link to={link} className={`btn--${linkStyle} mt-2`}>{linkText}</Link>
            </div>
        </div>
    )
}
