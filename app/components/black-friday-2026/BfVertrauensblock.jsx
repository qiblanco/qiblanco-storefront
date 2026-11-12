import {useRef} from 'react';
import {useElinaBewegung} from '~/components/reusables/useElinaBewegung';
import elinaBewegungStyles from '~/styles/elina-bewegung.css?url';
import vertrauensblockStyles from '~/styles/bf-vertrauensblock.css?url';

/*
 * VERTRAUENSBLOCK der Black-Friday-Seiten DE (Elina EL-20261111-63e02e46, 11.11.2026, GLOBAL):
 * drei Zeilen UNTEREINANDER, zentriert, über dem Deal.
 *   1) „4,8 ★★★★★“ in Gold (dunkel #F2BF72, hell #BF8E36)
 *   2) „über 14.000 zufriedene Anwender“ in Weiß (hell: dunkler Text)
 *   3) „✓ Wirkung in mehreren Zellstudien bestätigt“ in Grün (dunkel #4ADE80, hell #146C34)
 * Korrektur EL-20261111-1de56cd4: auf Crystal-Cacao-Seiten entfällt Zeile 3 (Prop ohneZellstudien).
 * Wortlaut und Farben wie in den BF-Mails (mail-manager/config/bf-serie-inhalte.json „vertrauensleiste“).
 * Zeichen ★ (U+2605) und ✓ (U+2713) als Textzeichen, kein Emoji.
 * Gesetzt auf /pages/bf-deals(-b) unter dem Kopf, /pages/pre-access(-b) über dem Formular und auf jeder
 * BF-Deal-Seite unter dem roten Countdown (BfDealRahmen). Rückbau: diese Datei, bf-vertrauensblock.css
 * und die drei Einbaustellen (Suche nach BfVertrauensblock) entfernen.
 */
export const VERTRAUEN_ZEILEN = {
  bewertung: '4,8',
  sterne: '★★★★★',
  anwender: 'über 14.000 zufriedene Anwender',
  zellstudien: 'Wirkung in mehreren Zellstudien bestätigt',
};

export function BfVertrauensblock({ohneZellstudien = false, hell = false, className = ''}) {
  const wurzel = useRef(null);
  useElinaBewegung(wurzel);
  const z = VERTRAUEN_ZEILEN;
  return (
    <div
      ref={wurzel}
      className={`qb-vb${hell ? ' qb-vb--hell' : ''}${className ? ' ' + className : ''}`}
      data-qb-vertrauensblock={ohneZellstudien ? '2' : '3'}
    >
      <link rel="stylesheet" href={elinaBewegungStyles} />
      <link rel="stylesheet" href={vertrauensblockStyles} />
      <ul className="qb-vb__zeilen" data-eb="gruppe">
        <li className="qb-vb__zeile qb-vb__bewertung">
          <span className="qb-vb__zahl">{z.bewertung}</span>{' '}
          <span className="qb-vb__sterne" role="img" aria-label="von 5 Sternen">
            {z.sterne}
          </span>
        </li>
        <li className="qb-vb__zeile qb-vb__anwender">{z.anwender}</li>
        {ohneZellstudien ? null : (
          <li className="qb-vb__zeile qb-vb__zellstudien">
            <span className="qb-vb__haken" aria-hidden="true">
              {'✓'}
            </span>
            {' '}
            {z.zellstudien}
          </li>
        )}
      </ul>
    </div>
  );
}
