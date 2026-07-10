import { Link } from "react-router"

export function CallToAction({
    img,
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
            alt="" />
            <div className="CallToActionTextContent">
            {text}
            <Link to={link} className={`btn--${linkStyle} mt-2`}>{linkText}</Link>
            </div>
        </div>
    )
}