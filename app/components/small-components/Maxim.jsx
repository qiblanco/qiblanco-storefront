import {CdnBild} from '../reusables/CdnBild';
/*
 * Maxim — die Nennung in MAXIM Australia, auf ihren Beleg zurückgeführt.
 *
 * Job 20260911-grossjob-googles-ki-antwort-zitiert-null-eigene-que-vollzug-
 * ov588e9b1144-w1 (offener Vollzug ov588e9b1144, Entscheidung 1).
 *
 * WAS HIER VORHER STAND UND WARUM ES WEG IST. Der Text sagte „Ausgezeichnet von
 * Maxim: Das beste EMF-Tool", „als eines der heißesten Wellbeing-Gadgets
 * ausgezeichnet", „zu ihrem Favoriten erklärt" und führte „Das beste Produkt
 * zum Schutz vor EMF" als Titel in Anführungszeichen. Eine Fundstelle fehlte:
 * Ausgabe, Datum und Link standen nirgends, nur ein CDN-Bild.
 *
 * DIE FUNDSTELLE IST AM 2026-09-14 BESCHAFFT UND IM VOLLTEXT GELESEN:
 * MAXIM Australia, „Wellbeing 2022", Autorin Andi Lew, Ausgabe März 2022.
 * maxim.com.au/archives/17224 gibt heute HTTP 404 (die Domain ist 2026 geparkt);
 * lesbar ist der Archivstand
 * web.archive.org/web/20221029050232/https://www.maxim.com.au/archives/17224
 * (Kopie im Job: nachbau-audit/state/offene-vollzuege/belege-ov588e9b1144/).
 *
 * SIE TRÄGT DIE NENNUNG, NICHT DIE AUSZEICHNUNG — gemessen am Volltext:
 *   1. Der Artikel ist eine Trendvorhersage („her predictions for the hottest
 *      trends in wellness"). Punkt 4 der Liste ist der TREND „EMF", nicht das
 *      Produkt.
 *   2. „ausgezeichnet" / „award" kommt nicht vor.
 *   3. „best" kommt in Bezug auf uns nicht vor.
 *   4. Der bei uns zitierte Titel „Das beste Produkt zum Schutz vor EMF" steht
 *      nicht im Artikel.
 *   5. Genannt ist das „Qi One necklace", nicht das QiOne(R) 2 Pro.
 * Wörtlich: „However, German company Qi Blanco is changing the way we adapt to
 * this with a Qi One necklace."
 *
 * SUCHRAUM-GRENZE, ehrlich: die Online-Fassung endet mit „For the full article
 * grab the March 2022 issue of MAXIM Australia". Eine Print-Ausgabe kann mehr
 * enthalten; der EMF-Punkt selbst ist online vollständig und liest sich als
 * Nennung. Kommt eine Print-Fundstelle mit einer Auszeichnung nach, gehört sie
 * hierher — dann mit Ausgabe und Seite.
 *
 * WER DIESEN TEXT ÄNDERT, ÄNDERT ZWEI WEITERE STELLEN MIT: die Kartenkopie in
 * ExterneStimmen.jsx und das Hero-Abzeichen in campaign/QiOneZellschutz.jsx.
 * Der Claim steht seit dem 2026-09-14 auch im governten SSoT
 * (fakten-basis.yaml claims[] id WM-maxim-australia-nennung).
 */
export function Maxim({dataSection}){
    return (
        <div className="Maxim NormalSectionSize" data-section={dataSection}>
            <CdnBild width={500} anzeigeBreite={418} loading="lazy"
                sizes="(min-width: 1000px) 418px, 92vw"
                src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/image0-1-1024x1024.png_1_19394721-7ee7-4381-94db-07654ed59dd9.webp?v=1736281312" alt="Doppelseite aus MAXIM Australia mit dem Beitrag „Wellbeing 2022“ von Andi Lew" />
            <div className="MaximText">
                {/* Wortlaut Christian, 20.09.2026 — dieselbe Zeile wie die Kartenkopie
                    in ExterneStimmen.jsx (der Kopf oben sagt: wer eine ändert, ändert
                    beide). Diese Überschrift ist im einzigen Einsatzort UNSICHTBAR
                    (externe-stimmen.css:204 .MaximText{display:none}), steht aber im
                    ausgelieferten HTML und wird von den Textproben mitgelesen — ein
                    unveränderter h2 hielte sie dauerhaft rot, und man suchte den Grund
                    auf dem Bildschirm, wo er nicht zu sehen ist.
                    Der Absatz darunter samt Archiv-Link bleibt UNANGETASTET: er ist der
                    Beleg und verschwindet nicht, weil die Überschrift wechselt. */}
                <h2>MAXIM feiert den QiOne® 2 Pro</h2>
                <p>Die Wellness-Expertin und Autorin Andi Lew (@andi.lew) stellt in MAXIM Australia ihre Wellness-Trends für 2022 vor. Unter dem Punkt „EMF“ nennt sie das QiOne® von Qi Blanco als ihre Antwort auf elektromagnetische Strahlung.</p>
                <p className="MaximQuelle">Quelle: <a href="https://web.archive.org/web/20221029050232/https://www.maxim.com.au/archives/17224" rel="nofollow noopener" target="_blank">MAXIM Australia, „Wellbeing 2022“ von Andi Lew, Ausgabe März 2022</a></p>
            </div>
        </div>
    )
}
