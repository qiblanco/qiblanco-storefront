import { Link } from "react-router";
import { useEffect, useRef } from "react";

export function Finanzierungsbanner({dataSection}) {
    const bannerRef = useRef(null);
    const bgRef = useRef(null);
    const infoRef = useRef(null);

    useEffect(() => {
        const banner = bannerRef.current;
        const bg = bgRef.current;
        const info = infoRef.current;

        const handleScroll = () => {
            if (!banner || !bg || !info) return;

            const rect = banner.getBoundingClientRect();
            const vh = window.innerHeight;

            // Compute how far banner is into the viewport (0–1)
            const progress = 1 - Math.abs(rect.top / vh);
            const clamped = Math.max(0, Math.min(1, progress));

            // Subtle parallax effect based on scroll position
            const bgMove = clamped * 100;   // px background shift
            const infoMove = clamped * 40; // px content shift

            bg.style.transform = `translate3d(0, ${bgMove}px, 0)`;
            info.style.transform = `translate3d(0, ${infoMove}px, 0)`;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleScroll);
        handleScroll(); // initial

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };
    }, []);

    return (
        <div className="Finanzierungsbanner" ref={bannerRef} data-section={dataSection}>
            <div className="FinanzierungsBG" ref={bgRef}></div>

            <div className="FinanzierungsInfos" ref={infoRef}>
                <div className="FinanzierungsLabel">20 Tage risikofrei</div>
                <h2>
                    Jetzt mit 0%<br />Finanzierung!
                </h2>
                <div>
                    <img
                        width={75}
                        src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/800px-Klarna_Payment_Badge.svg_7f45bfec-1ac3-4234-9914-98cf49b040f4.png?v=1671199816"
                        alt="Klarna"
                    />
                    &nbsp;&nbsp;&nbsp;
                    <img
                        width={75}
                        src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/paypal-784404_1280.webp?v=1708904082"
                        alt="PayPal"
                    />
                </div>
                {/*
                    Christian, 2026-09-22: „Das Sternchen am Anfang muss weg und
                    vom Design her muss es zu anderen Auftreten passen."

                    DAS STERNCHEN WAR EIN VERWEIS AUF EINE FUSSNOTE, DIE ES NICHT
                    GIBT — auf der ganzen Startseite stand kein zugehoeriger
                    Anmerkungstext. Direkt neben den Zahlungslogos und ueber dem
                    Kaufknopf las sich die Zeile dadurch wie ein Rest aus einer
                    frueheren Fassung, genau dort, wo Vertrauen entstehen soll.

                    DIE FORM IST KEINE NEUE: `p.micro-text` (reset.css) ist das
                    bestehende Schrift-Token der Mikro-Vertrauenszeile und traegt
                    das zweite Auftreten derselben Zusage schon — die Zeile unter
                    dem Kauf-Knopf im HerobannerFeatured („… mit 0 % Finanzierung
                    & Käuferschutz …"), dort ebenfalls mit <strong>. Damit stehen
                    beide Auftreten in EINER Form, statt in zweien.
                */}
                <p className="micro-text"><strong>Inklusive Käuferschutz</strong></p>
                <Link to="/products/qione-2-pro" className="btn--primary">
                    Hole dir deinen QiOne® 2 Pro
                </Link>
            </div>
        </div>
    );
}