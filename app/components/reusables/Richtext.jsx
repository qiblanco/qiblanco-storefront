export function Richtext({text, alignment, dataSection}){

const alignmentMap = {
    left: "text-left",
    center: "text-center",
    right: "text-right"
}

    return (
        <div className={`Richtext NormalSectionSize ${alignmentMap[alignment] || ""}`} data-section={dataSection}>
            {text}
        </div>
    )
}