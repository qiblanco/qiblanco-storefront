import {Link} from 'react-router';
import {EuGewaehrleistungsLink} from '~/components/EuGewaehrleistungsLabel';

/*
 * DIE RECHTSZEILE DER QI-ALPHA-SEITEN (Elina 30.10.2026, EL-20261030-ae569366,
 * Punkt 5): Landingpage /pages/Qi-Alpha und Kaufseite /products/qi-alpha
 * haben bewusst keinen Hausfuß (Christian 27.10. Z275–Z279: Film-Seite ohne
 * Kopf, Band und Fuß; 28.10. Z13/Z17: enge Funnel-Seite, „kein footer mehr“).
 * Damit fehlte das Impressum (Pflicht, abmahnfähig), auf der Landingpage auch
 * Datenschutz und Gewährleistung. Elinas zweite Wahl ist gebaut: eine
 * schlichte schwarze Zeile im Alpha-Stil mit genau ihren sechs Verweisen
 * (Impressum, Datenschutz, AGB, Widerruf, Gewährleistung, Kontakt), kein
 * Menü, keine Werbung, also kein Weg aus dem Funnel außer den Pflichtseiten.
 * Pfade wie im Hausfuß (Footer.jsx LEGAL_LINKS); Gewährleistung öffnet
 * denselben EU-Hinweis wie dort. Stil: styles/qi-alpha-rechtszeile.css.
 *
 * SEIT 31.10.2026 nur noch auf der Kaufseite: die Landingpage endet mit dem
 * letzten Bild und dem roten Knopf (Christian: Links-Leiste „muss weg auf der
 * LP“, „Nur die Links-Leiste“; Job 20261031-update-qi-alpha-lp-links-leiste-
 * seitenende-entfernen-r2). `seite="lp"` hat damit keinen Aufrufer mehr.
 *
 * ELEMENT <div>, NICHT <footer> (11.11.2026, Job 20261111-folge-qi-alpha-
 * designscore-97-typo-skala; Hausregel FEHLER-DB F-2584): app.css färbt mit
 * `footer * { color: … !important }` jedes <footer> im Dokument für den
 * Hausfuß. Der EU-Hinweis, der sich aus dieser Zeile öffnet, stand dadurch
 * weiß auf weißem Grund. role="navigation" trägt die Beschriftung.
 */
const VERWEISE = [
  {to: '/pages/impressum', label: 'Impressum'},
  {to: '/pages/datenschutz', label: 'Datenschutz'},
  {to: '/pages/agb', label: 'AGB'},
  {to: '/widerruf', label: 'Widerruf'},
  {gewaehrleistung: true},
  {to: '/pages/support', label: 'Kontakt'},
];

/** @param {{seite: 'lp' | 'kauf'}} props */
export function QiAlphaRechtsZeile({seite}) {
  return (
    <div
      className={`qar qar--${seite}`}
      data-qi-alpha-rechtszeile={seite}
      role="navigation"
      aria-label="Rechtliches"
    >
      <ul className="qar-liste">
        {VERWEISE.map((v) =>
          v.gewaehrleistung ? (
            <li key="gewaehrleistung" className="qar-gwl">
              <EuGewaehrleistungsLink />
            </li>
          ) : (
            <li key={v.to}>
              <Link to={v.to} prefetch="intent">
                {v.label}
              </Link>
            </li>
          ),
        )}
      </ul>
      <p className="qar-marke">© Qi Blanco</p>
    </div>
  );
}
