import {CdnBild} from '../reusables/CdnBild';
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
/*
 * DAS `sizes`-ATTRIBUT BESCHREIBT DIE GEMESSENE FLAECHE, NICHT EINE GEWUENSCHTE
 * (Job 20260921-bildschuld-...-s02, 2026-09-21).
 *
 * HIER STAND: sizes="(min-width: 1000px) 659px, 92vw". Beide Zahlen waren zu
 * klein, und das ist der ganze Defekt: das `srcset` bietet zu diesem Bild
 * laengst die Sprossen 659w, 1318w und 1977w an — der Browser waehlte die
 * 659er nur deshalb, weil `sizes` ihm eine 659-px-Flaeche behauptete. Gemessen
 * am Kundenrand waren es 968 px. Gate 12 meldete daraufhin auf drei
 * Detailseiten "659px Quelle auf 968px*1x Flaeche". Es fehlte also kein Asset
 * und keine Leiter — es fehlte eine wahre Angabe.
 *
 * DIE FLAECHE, HERGELEITET UND DANN NACHGEMESSEN:
 *   .NormalSectionSize { max-width: 1350px; padding: 0 1rem }  (reset.css)
 *      -> Inhaltsbreite = min(1350px, 100vw) - 32px
 *   .CallToAction { display:flex; flex-wrap:wrap }
 *   .CallToAction img, .CallToActionTextContent { flex: 1 0 50% }  (app.css)
 *      -> zwei Spalten, solange beide in eine Zeile passen; sonst Umbruch,
 *         und dann fuellt JEDES Kind die volle Inhaltsbreite.
 *
 * WO DIE ZEILE UMBRICHT — UND WARUM NICHT AM TEXT: `flex: 1 0 50%` heisst
 * flex-shrink 0, das Bild kann also nicht kleiner werden als seine
 * automatische Mindestgroesse, und die ist das `width={500}` eine Zeile
 * darueber. Unterschreitet die halbe Inhaltsbreite diese 500 px, passt die
 * Zeile nicht mehr und bricht um:
 *      min(1350, 100vw) - 32 >= 2 * 500   <=>   Viewport >= 1032 px
 * Die naheliegende Vermutung "der Text ist zu breit" ist GEMESSEN falsch: die
 * min-content-Breite von .CallToActionTextContent liegt bei 206-222 px
 * (2026-09-21, drei Bausteine auf zwei Seiten). Das ist wichtig fuer die
 * Haltbarkeit dieser Zahl — 1032 haengt an einer BAULICHEN Groesse (dem
 * width-Attribut), nicht an einer redaktionellen. Ein Textwechsel veraltet sie
 * nicht; eine Aenderung an `width` oder am Innenabstand schon.
 *
 * GEGENPROBE, live gemessen (dpr 1, getBoundingClientRect, alle drei
 * Detailseiten): 360->328 | 414->382 | 600->568 | 1000->968 | 1024->992 ||
 * 1050->509 | 1100->534 | 1150->559 | 1200->584 | 1250->609 | 1279->623,5 |
 * 1300->634 | 1350->659 | 1400->659. Der neue Ausdruck trifft JEDEN dieser
 * Werte exakt; das alte "92vw" traf keinen einzigen (360: 91,1 % | 600:
 * 94,7 % | 1000: 96,8 %).
 *
 * WARUM `anzeigeBreite` BEI 659 BLEIBT, OBWOHL DIE FLAECHE GROESSER SEIN KANN:
 * sobald `sizes` mitgegeben wird, steuert `anzeigeBreite` NUR NOCH DIE LEITER
 * (shopifyBildQuellen.bildQuellen: `sizes: sizes || `${anzeigeBreite}px``).
 * 659 erzeugt die Sprossen 659/1318/1977, und die decken den ganzen gemessenen
 * Bereich: 992 px bei dpr 1 und 560 px bei dpr 2 verlangen beide die 1318er,
 * ein 360-px-Handy bei dpr 2 die 659er. Auf 992 gesetzt, waere die unterste
 * Sprosse 992 px — das Handy bekaeme unnoetig das Anderthalbfache. WER DIE
 * `sizes`-ANGABE HIER ENTFERNT, MUSS `anzeigeBreite` MITZIEHEN: ohne sie
 * schreibt bildQuellen wieder `sizes="659px"` und der Defekt ist zurueck.
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
            <CdnBild width={500}
            src={img}
            alt={imgAlt}
            anzeigeBreite={659}
            sizes="(min-width: 1350px) 659px, (min-width: 1032px) calc((100vw - 32px) / 2), calc(100vw - 32px)"
            loading="lazy" />
            <div className="CallToActionTextContent">
            {text}
            <Link to={link} className={`btn--${linkStyle} mt-2`}>{linkText}</Link>
            </div>
        </div>
    )
}
