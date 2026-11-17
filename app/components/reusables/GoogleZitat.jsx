import {GoogleIcon} from '~/components/index-components/ReputonWidget';

/*
 * GoogleZitat — EIN Format, wann immer wir die Google-Bewertung zitieren.
 *
 * Christian 17.11.2026 ~09:10 Bangkok (Job 20261117-prio2-produktseiten-
 * feedback-r2-alle-nachtraege-seit-16-11-umsetzen), woertlich: „immer wenn wir
 * das so schreiben, da haette ich auch gerne 4,8 und dann 5 Sterne und dann das
 * Google-Zeichen und dann von mir aus den Pfeil. Also dass wir das mal
 * einheitlich machen."
 *
 * FORMAT (Standard, beide Shops): Note · fuenf Sterne · G-Zeichen [· Pfeil].
 * Nie das Wort „bei Google", nie nur ein einzelner Stern. Der Pfeil kommt vom
 * umgebenden Link (z. B. .avq-link::after), nicht von hier.
 * US-Gegenstueck: snippets/qb-google-zitat.liquid im Theme des Global
 * Englisch-Shops.
 *
 * Daten-Texte der Form „{sterne} ★ bei Google" (auch in fremden Datendateien,
 * z. B. BF26) rendern ueber istGoogleZitatText() automatisch in diesem Format,
 * ohne dass jemand die Datendatei anfassen muss.
 */
export const GOOGLE_ZITAT_MUSTER = /^\s*\{(sterne|bewertung)\}\s*★?\s*bei Google\s*›?\s*$/;

export function istGoogleZitatText(text) {
  return typeof text === 'string' && GOOGLE_ZITAT_MUSTER.test(text);
}

export function GoogleZitat({komma = '4,8', klasse = ''}) {
  return (
    <span
      className={`qb-gzitat ${klasse}`.trim()}
      data-google-zitat=""
      aria-label={`${komma} von 5 Sternen auf Google`}
      role="img"
    >
      <span className="qb-gzitat__note" aria-hidden="true">{komma}</span>
      <span className="qb-gzitat__sterne" aria-hidden="true">{'★'.repeat(5)}</span>
      <span className="qb-gzitat__g" aria-hidden="true">
        <GoogleIcon />
      </span>
    </span>
  );
}
