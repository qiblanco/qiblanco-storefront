import {ProductPrice} from '~/components/ProductPrice';
import {
  GOOGLE_REVIEWS_URL,
  StarRating,
  SterneSprung,
} from '~/components/reusables/StarRating';

/**
 * PREISANKER — Bewertung, Nutzerzahl und Preis als EIN Dreizeiler, dahinter
 * das goldene Banner.
 *
 * Christian, 25.10.2026 (Job 20261025-design-repair-qihome-air-animation-
 * schwarz-preisanker-ultimate-power), wörtlich:
 *   "das über 14.000 nutzer ist der Preisanker, d.h. es muss direkt über dem
 *    Preis stehen also müsste das ein 3 Zeiler sein
 *      4.8 XXXXX
 *      + 14.000 Nutzer
 *      4.983€"
 *   "hinter dem Preis muss wie früher ein Goldenes Banner ... Persönlich wäre
 *    ich für Ultimate Power"
 *   "das 14.000 Nutzer muss nicht viel kleiner sein als der Preis, damit es
 *    als preisanker wirken kann"
 *
 * Bis hierher standen auf /products/qihome-air zwei getrennte Zeilen: oben
 * die Sterne-Zeile mit "Über 14.000 Nutzer" in 16 px (Hover: Unterstreichung,
 * Zeigehand), weit darunter "Mehr als 14.000+ aktive Nutzer" in 16 px fett.
 * Der Preis hatte 32 px — die Nutzerzahl war halb so groß und stand nicht
 * am Preis.
 *
 * "WIE FRÜHER": das Banner stammt aus dem alten Liquid-Theme, im Theme des
 * Global Englisch-Shops noch zu sehen (us-qiblanco-2024,
 * snippets/new-price-copy.liquid: <span class="angebot-label">, Gold-Fläche,
 * kleiner Radius, rechts neben dem Preis). Übernommen sind Lage und Form; die
 * Farbe ist das EINE Haus-Gold (--qb-akzent-kauf), kein zweiter Goldton.
 *
 * Die Sterne-Zeile bleibt der Sprung zu den Bewertungen (SterneSprung,
 * Job 20260820-wurzel-sterne-klick-scroll) — sie springt beim Klick, aber
 * sie "poppt" nicht mehr: keine Unterstreichung, keine Zeigehand, nur ein
 * leichter Farbwechsel (styles/qb-preisanker.css).
 *
 * Reihenfolge am Bildschirm: der Wrapper trägt `.qb-preisanker`, das
 * Kauf-zuerst-Blatt (qb-pdp-kauf-zuerst.css) stellt ihn wie bisher den
 * Preis vor das Formular.
 *
 * EINHEITLICH UND RUHIG (Christian, 26.10.2026, Job 20261026-design-
 * preisanker-google-bewertungen-link-einheitlich-alle-produkte), wörtlich:
 *   "nach den sternen steht in gleicher schriftgröße Google Bewertungen und
 *    wenn man drüber fährt verändert sich die schriftfarbe, sodass man
 *    erkennt das es ein Link ist. das 4,8 soll auch in der gleichen
 *    schriftfarbe sein wie die nutzer und preis ... Nutzer und preis sind
 *    nicht die gleiche schriftart oder? das wirkt zu bunt"
 *   "Ultimate Power ... nicht umrandung sondern ausfüllen, also das was
 *    vorher goldfarben war wird nun das rot, und die schrift ändert sich
 *    von schwarz in weiß" (das Rot von Qi Alpha, --qb-pa-alpha-rot)
 * Daraus: Zeile 1 ist "4.8 ★★★★★ Google Bewertungen". Der Link steht NEBEN
 * dem Sprung-Knopf, nicht in ihm (ein <a> in einem <button> ist kein
 * gültiges HTML). Ziel ist GOOGLE_REVIEWS_URL, die eine Quelle in
 * StarRating.jsx; er öffnet einen neuen Tab, damit der Kaufweg offen bleibt.
 * 4.8, Nutzerzahl und Preis tragen EINE Farbe und EINE Schriftstärke
 * (qb-preisanker.css, --qb-pa-farbe / --qb-pa-gewicht), auch ein
 * Angebotspreis: der Verlauf von `.gradient-price` gilt hier nicht.
 *
 * `banner={null}` lässt das Banner weg (QiBracelet, Kette); QiOne 2 Pro
 * übergibt "Bestseller Angebot". Jedes Banner im Preisanker hat dieselbe
 * Form und Farbe.
 *
 * @param {{
 *   preis: {handle?: string, price?: object, compareAtPrice?: object},
 *   nutzer?: string,
 *   banner?: string | null,
 *   quelle?: string,
 * }} props
 */
export function Preisanker({
  preis,
  nutzer = '+ 14.000 Nutzer',
  banner = 'Ultimate Power',
  quelle = 'Google Bewertungen',
}) {
  return (
    <div className="qb-preisanker" data-qb-preisanker="">
      <div className="qb-preisanker__bewertungszeile">
        <SterneSprung className="qb-preisanker__bewertung">
          <span className="qb-preisanker__note">4.8</span>
          <StarRating value={4.8} size={16} />
        </SterneSprung>
        <a
          className="qb-preisanker__quelle"
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
        >{quelle}</a>
      </div>
      <p className="qb-preisanker__nutzer">{nutzer}</p>
      <div className="qb-preisanker__preiszeile">
        <ProductPrice
          handle={preis.handle}
          price={preis.price}
          compareAtPrice={preis.compareAtPrice}
        />
        {banner ? (
          <span className="qb-preisanker__banner">{banner}</span>
        ) : null}
      </div>
    </div>
  );
}
