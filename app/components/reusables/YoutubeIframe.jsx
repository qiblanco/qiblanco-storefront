export function YoutubeIframe({link, dataSection}){
    return (
        <div className="YoutubeIframe" data-section={dataSection}>
            <iframe width="560" src={link} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
        </div>
    )
} 