export function SingleImage({link, size, dataSection}){
    if (size === "fullscreen"){
        return (
            <>
            <img className="SingleImageCentered" src={link} alt="" />
            </>
        )
    }
    return (
        <div className="NormalSectionSize" data-section={dataSection}>
            <img className="SingleImageCentered" src={link} alt="" />
        </div>
    )
    
}