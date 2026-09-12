import { Link } from "react-router"

/*
 * WARUM DIE BEIDEN LOGOS EINEN TEXT TRAGEN UND KEIN alt="" (2026-09-12, s07 des
 * Grossjobs 20260911-...-technische-auffindbarkeit):
 * Die Regel des Hauses ist "dekoratives Icon, dessen Bedeutung als Text
 * unmittelbar daneben steht -> alt=''". Sie greift hier NICHT. Der Begleittext
 * aller drei Aufrufstellen (QiOne2Pro, QiHome, QiBracelet) nennt ausschließlich
 * "0 % Finanzierung" -- WELCHE Zahlungsart gemeint ist, steht nirgends als Text.
 * Die Logos sind damit der einzige Träger dieser Auskunft und informativ.
 * Der Text ist nicht erfunden, sondern der Markenname der Bildquelle (Klarna-
 * Logo.png / paypal-*.webp) und deckt sich mit dem Bestand (QiOneZellschutz.jsx
 * führt alt="PayPal" seit je).
 *
 * ABGRENZUNG ZU D-2335 ("alt als Parameter statt als Wert"): dort war das Bild
 * ein PROP, und ein Bauteil kann die alt-Frage nicht für seine Aufrufer
 * beantworten. Hier sind beide Bildquellen im Bauteil FEST verdrahtet -- es
 * kennt sein Motiv und darf es deshalb selbst benennen. Ein imgAlt-Prop wäre
 * hier eine Stellschraube ohne Fall.
 */

export function RatenzahlungHerobanner({link, linkText, img, text, paypal=true, klarna=true}){
    return (
        <div className="RatenzahlungHerobanner" style={{backgroundImage: `url(https://cdn.shopify.com/s/files/1/0279/3095/1750/files/${img})`}}>
            <div className="RatenzahlungTextContent">
                {text}
                {link !== "" && (
                    <Link className="btn--primary" to={link}>{linkText}</Link>                    
                )}
            </div>
            <div className="RatenzahlungImages">
                { klarna && (
                    <img className="klarna" width={250} alt="Klarna" src={"https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Klarna-Logo.png?v=1708904084"} />
                )}
                { paypal && (
                    <img className="paypal" width={250} alt="PayPal" src={"https://cdn.shopify.com/s/files/1/0279/3095/1750/files/paypal-784404_1280.webp?v=1708904082"} />
                )}
            </div>
        </div>
    )
}