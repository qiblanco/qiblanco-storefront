import {
  TapSeite,
  TapTitelkarte,
  TapWoerterbuch,
  TapFilm,
  TapKapitel,
  TapKarten,
  TapVollbild,
  TapMarke,
  TapEdition,
} from '~/components/campaign/TheAlphaPremium';
import {THE_ALPHA_VIDEO, THE_ALPHA_ABSCHNITTE} from '~/components/campaign/the-alpha-daten';
import {
  TAB_AKZENT,
  TAB_UNTERSEITE,
  TAB_SEITENBAND,
} from '~/components/campaign/the-alpha-variante-b-daten';

/*
 * THE ALPHA, Variante B (Server/Designmeister), Adresse /pages/The-Alpha-C.
 * Seit 26.10.2026 auf Christians Film-Geschichte (Grossjob 20261026-prio1-
 * the-alpha-variante-a-designmeister-premium-gestaltung, s02); die Fassung
 * vom 25.10. begann mit einem eigenen Nutzen-Block und hatte Christians
 * Konzept verlassen (Z6).
 *
 * GESCHICHTE WIE A (Z7/Z8, Drehbuch Z24–Z98): Titelkarte „Kohärentes Licht“
 * → „- Ultra High Vibe Mode -“ → Wörterbuch (Pulp Fiction, Quelle Google AI)
 * → Lucas Video → Manifestation (RAW/DIAMANT) → Protection
 * (ENDLESS/POSSIBILITY) → Longevity → THE ALPHA → Limited 1st. Edition
 * 111/111 → roter Knopf (TheAlphaKauf, Ziel aus the-alpha-daten.js).
 *
 * WAS B ANDERS MACHT (Z9, Feinheiten, nicht Geschichte):
 *  - unter Christians drei Zeilen je Kapitel ein Nutzen-Akzent (TAB_AKZENT),
 *  - Longevity mit eigenem Bild: die Unterseite „Made in Germany“ randlos,
 * Seit 27.10. endet B wie A und C mit dem roten Knopf (Christian Z258–Z263:
 * „Die Seite muss hier aufhören“); Live-Anmeldung und Fragen stehen nicht
 * mehr auf der Landingpage, die Fragen gehören auf die Shopseite (Z262/Z267).
 * Seit dem Nachtrag 27.10. (~21:40 Bangkok) trägt die Schluss-Szene weder
 * Preis noch Detailzeile: Qi Alpha® / Limited 1st. Edition / 111/111 / roter
 * Knopf / Ende. Preis und Details zeigt die Shopseite.
 *
 * Bausteine und Tokens: TheAlphaPremium.jsx / the-alpha-premium.css (geteilt,
 * hier nicht geändert). Eigenes nur im Scope
 * .tap-seite[data-the-alpha-premium='b'] in app/styles/the-alpha-variante-b.css.
 * Ton und Video-Ton kommen über TapSeite/TapFilm aus dem Gerüst.
 *
 * ÜBERSCHRIFTEN: h2 tragen nur die drei Kapitel (EIN H2-Stil je Seite, die
 * Rubrik zählt Größe x Gewicht).
 *
 * Probe: claude-jobs/<grossjob>/nachher/variante-b/probe_b_film.py.
 */

const [MANIFESTATION, PROTECTION, LONGEVITY] = THE_ALPHA_ABSCHNITTE;

export default function TheAlphaVarianteB() {
  return (
    <TapSeite variante="b">
      <TapTitelkarte />
      <TapWoerterbuch />
      <div className="tab-film">
        <TapFilm film={THE_ALPHA_VIDEO} />
      </div>
      <TapKapitel abschnitt={MANIFESTATION} akzent={TAB_AKZENT.manifestation}>
        <TapKarten bilder={MANIFESTATION.bilder} />
      </TapKapitel>
      <TapKapitel abschnitt={PROTECTION} akzent={TAB_AKZENT.protection}>
        <TapKarten bilder={PROTECTION.bilder} />
      </TapKapitel>
      <TapKapitel abschnitt={LONGEVITY} akzent={TAB_AKZENT.longevity} />
      <div className="tab-unterseite">
        <TapVollbild bild={TAB_UNTERSEITE} />
      </div>
      <TapMarke bild={TAB_SEITENBAND} />
      <TapEdition />
    </TapSeite>
  );
}
