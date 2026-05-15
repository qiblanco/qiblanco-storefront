import { useState, useEffect } from "react";

export function InfoSlider(){
    const [progress, setProgress] = useState(0);
    const [placement, setPlacement] = useState(0);



    useEffect(() => {
        setProgress((-placement / 1680) * 100);
    }, [placement])


    const handlePlacementBehaviour = (direction) => {
        const offsideLimitRight = -1680;
        let slideMovementIndex = 420;

        if (window.innerWidth < 432) {
            slideMovementIndex = window.innerWidth - 12;
        }

        direction === "next" ?
            setPlacement(placement => placement > offsideLimitRight ? placement - slideMovementIndex : 0) :
            setPlacement(placement => placement !== 0 ? placement + slideMovementIndex : placement);

    }

    const [startLocation, setStartLocation] = useState(0);
    const [relativeLocation, setRelativeLocation] = useState(0);

    const handlePointerDown = (event) => {
        if (event.pointerId !== undefined) {
            event.currentTarget.setPointerCapture(event.pointerId);
        }

        setStartLocation(event.clientX);
    }

    const handlePointerUp = (event) => {
        if (event.pointerId !== undefined) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }

        setRelativeLocation(startLocation - event.clientX);
    }

    useEffect(() => {
        //When the relative position is bigger or equal to 150 move to show the next slide, when smaller or equal to -150 move to previous slide
        if(relativeLocation >= 150){
            handlePlacementBehaviour("next");
        }

        if(relativeLocation <= -150){
            handlePlacementBehaviour("previous");
        }

    }, [relativeLocation])

    return (
        <div className="NormalSectionSize">
            <div className="InfoSlider"
            role="region"
            aria-label="Qi Blanco Vorteile Slider"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            >
                <div className="InfoSliderTrack" style={{transform: `translateX(${placement}px)`}}>
                    <InfoSliderCard data-index="0"
                    title={<h3>Erholsame Nächte</h3>}
                    label={<p><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M160 136c0-30.62 4.51-61.61 16-88C99.57 81.27 48 159.32 48 248c0 119.29 96.71 216 216 216c88.68 0 166.73-51.57 200-128c-26.39 11.49-57.38 16-88 16c-119.29 0-216-96.71-216-216"></path></svg> Erholsame Nächte</p>}
                    description="Mit seinem einzigartigen Ansatz unterstützt der QiOne® 2 Pro die Bildung kohärenter Wasserstrukturen, die von vielen Anwendern als beruhigend und ausgleichend empfunden werden. So kannst du dein Wohlbefinden auf natürliche Weise fördern und dein Lebensumfeld optimieren."
                    background="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2024-06-qiblanco-bali-06825.webp?v=1737715386"
                    />
                    <InfoSliderCard data-index="1"
                    title={<h3>Vermeide Belastungen - stärke dein Wohlbefinden</h3>}
                    label={<p><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 28 28"><path fill="currentColor" d="M10.023 3a.75.75 0 0 1 .71.59l3.905 17.79l4.148-12.86a.75.75 0 0 1 1.438.033l1.349 4.947h3.677a.75.75 0 0 1 0 1.5H21a.75.75 0 0 1-.724-.553l-.836-3.067l-4.226 13.1a.75.75 0 0 1-1.447-.07L9.905 6.815L7.72 14.456A.75.75 0 0 1 7 15H2.75a.75.75 0 0 1 0-1.5h3.684L9.28 3.544A.75.75 0 0 1 10.023 3"></path></svg>Starkes Wohlbefinden</p>}
                    description="Viele Anwender berichten, dass sie sich mit dem QiOne® 2 Pro bewusster und ausgeglichener fühlen - ob zu Hause, am Arbeitsplatz oder unterwegs. Sein zeitloses Design und die innovative Technologie machen ihn zu einem Begleiter, der Stil und Funktion perfekt kombiniert."
                    background="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2023-03-01-qiblanco-milva-martin-1020791_1_0f03ee06-6ad1-4997-9182-3685335eb04c.webp?v=1738063344"
                    />
                    <InfoSliderCard data-index="2"
                    title={<h3>Mach deinen Kopf frei - und deine Ziele greifbar.</h3>}
                    label={<p><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m9.952 9.623l1.559-3.305a.535.535 0 0 1 .978 0l1.559 3.305l3.485.533c.447.068.625.644.302.974l-2.522 2.57l.595 3.631c.077.467-.391.822-.791.602L12 16.218l-3.117 1.715c-.4.22-.868-.135-.791-.602l.595-3.63l-2.522-2.571c-.323-.33-.145-.906.302-.974zM22 12h1M12 2V1m0 22v-1m8-2l-1-1m1-15l-1 1M4 20l1-1M4 4l1 1m-4 7h1"></path></svg>Klarer Kopf</p>}
                    description="Mit seinem einzigartigen GitterChip™ besitzt der QiOne® 2 Pro die Fähigkeit, um äußere Einflüsse wie E-Smog zu reduzieren. Viele Anwender schätzen ihn für seine Vielseitigkeit und das Gefühl, ihn bei jeder Aktivität an ihrer Seite zu haben."
                    background="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2024-06-qiblanco-bali-05984.webp?v=1738529250"
                    />
                    <InfoSliderCard data-index="3"
                    title={<h3>Mach Energie zur Grundlage deines Erfolgs</h3>}
                    label={<p><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeDasharray="32" strokeDashoffset="32" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c0 0 0 0 -0.76 -1c-0.88 -1.16 -2.18 -2 -3.74 -2c-2.49 0 -4.5 2.01 -4.5 4.5c0 0.93 0.28 1.79 0.76 2.5c0.81 1.21 8.24 9 8.24 9M12 8c0 0 0 0 0.76 -1c0.88 -1.16 2.18 -2 3.74 -2c2.49 0 4.5 2.01 4.5 4.5c0 0.93 -0.28 1.79 -0.76 2.5c-0.81 1.21 -8.24 9 -8.24 9"><animate fill="freeze" attributeName="strokeDashoffset" dur="0.7s" values="32;0"></animate></path></svg>Klarer Fokus</p>}
                    description="Durch die Erzeugung eines statischen Feldes unterstützt der QiBracelet® Wasser dabei, seine molekulare Struktur in kohärente Zustände zu überführen. Diese Technologie kann dir ermöglichen, Energie bewusster in deinen Alltag zu integrieren. Zahlreiche Nutzer berichten von einer gesteigerten Vitalität, einem klareren Fokus und einer harmonischeren Lebensweise."
                    background="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2023-06-qiblanco-kitzbuehel-10.webp?v=1738529579"
                    />
                    <InfoSliderCard data-index="4"
                    title={<h3>Energie, die deinen Alltag antreibt</h3>}
                    label={<p><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 1024 1024"><path fill="currentColor" d="M595.344 64.72h.176zm0 0l-72.207 379.377l261.584.88L428.657 959.28l72.208-417.376l-261.568-.912zm.049-63.999c-1.728 0-3.455.063-5.151.19c-11.296.913-18.785 4.689-27.664 10.657a64.3 64.3 0 0 0-13.392 11.936a57 57 0 0 0-3.297 4.288L187.281 502.4c-14.16 19.408-16.24 45.025-5.36 66.433c10.864 21.408 32.832 34.976 56.912 35.152l184.736 1.344l-58.08 342.192c-5.52 29.408 10.16 58.72 37.76 70.528a64.2 64.2 0 0 0 25.391 5.216c20.112 0 36.64-9.408 49.041-26.4L836.737 482.56c14.16-19.409 16.225-45.057 5.36-66.433c-10.864-21.408-32.832-34.977-56.912-35.152l-184.736-.32l57.456-300.88a62.5 62.5 0 0 0 1.825-15.056c0-34.624-27.569-62.848-62.065-63.968c-.767-.032-1.52-.032-2.271-.032z"></path></svg>Mehr Energie</p>}
                    description="Meditation ist eine der effektivsten Methoden, um innere Balance und Klarheit zu finden - und mit dem QiOne® 2 Pro kannst du deine Achtsamkeitsübungen auf eine neue Ebene heben. Dank seiner fortschrittlichen GitterChip™-Technologie fördert der QiOne® 2 Pro die Bildung kohärenter Wasserstrukturen, die dazu beitragen können, eine beruhigende und harmonisierende Atmosphäre zu schaffen."
                    background="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Shooting_-_2021-04-qiblanco-bali-11_1623305c-198d-4cea-9d20-12ba96d6a740.jpg?v=1738526957"
                    />
                </div>
            </div>
                <div className="ProgressWrapper">
                    <div className="ProgressTracker" style={{width: progress + '%' }}></div>
                </div>
                <div className="SliderButtonWrapper">
                    <button type="button" onClick={() => {
                        handlePlacementBehaviour("previous");
                        }} className="ButtonPrev SliderButton" aria-label="Vorheriger Slide"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><path fill="currentColor" d="M29.52 22.52L18 10.6L6.48 22.52a1.7 1.7 0 0 0 2.45 2.36L18 15.49l9.08 9.39a1.7 1.7 0 0 0 2.45-2.36Z" className="clr-i-outline clr-i-outline-path-1"/><path fill="none" d="M0 0h36v36H0z"/></svg></button>
                    <button type="button" onClick={() => {
                        handlePlacementBehaviour("next");
                        }} className="ButtonNext SliderButton" aria-label="Nächster Slide"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><path fill="currentColor" d="M29.52 22.52L18 10.6L6.48 22.52a1.7 1.7 0 0 0 2.45 2.36L18 15.49l9.08 9.39a1.7 1.7 0 0 0 2.45-2.36Z" className="clr-i-outline clr-i-outline-path-1"/><path fill="none" d="M0 0h36v36H0z"/></svg></button>
                </div>
        </div>
    )
}

/*
This component renders the Slider Items for <InfoSlider/>.
useState is being used for opening and colapsing the slider items dynamically
Use props.background in InfoSlider as a shopify cdn url to insert the background images
*/

function InfoSliderCard({title, label, description, background}){
    const [open, setOpen] = useState(false);
    const toggleOpen = () => setOpen((current) => !current);

    return (
        <div
            className={`InfoSliderCard${open ? " SliderCardOpened" : ""}`}
            style={{backgroundImage: `url(${background})`}}
            role="button"
            tabIndex={0}
            aria-expanded={open}
            onClick={toggleOpen}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggleOpen();
                }
            }}
        >
            <button
                type="button"
                className="CardCollapseButton"
                onClick={(event) => {
                    event.stopPropagation();
                    toggleOpen();
                }}
                aria-label={open ? 'Details schließen' : 'Details öffnen'}
                aria-expanded={open}
            ><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"></path>
              </svg></button>
            <div className="CardOverlay"></div>
            <div className="CardLabel">{label}</div>
            <div className="CardTextWrapper">
                <div className="CardTitle">{title}</div>
                <div className="CardDescription">{description}</div>
            </div>
        </div>
    )
}
