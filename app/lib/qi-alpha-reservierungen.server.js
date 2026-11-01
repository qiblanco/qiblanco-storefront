/*
 * DIE LISTE DER RESERVIERTEN QI-ALPHA®-NUMMERN — die eine Stelle (Christian
 * 01.11.2026: „88 reserviert für Lisa … 44 reserviert für Verena … 99
 * reserviert für Matthias, die Nummer 2 reserviert für Daniela. Und wichtig
 * ist mir aber, dass Nummer 2 und Nummer 99 ist zusammen.“).
 *
 * NUR SERVER (.server.js): die Schlüssel sind die persönlichen Links und
 * gelangen nie in das Browser-Paket. Der Browser bekommt je Aufruf nur die
 * eine Reservierung seines Links (Loader products.qi-alpha-reserviert.$schluessel).
 *
 * PFLEGE: homepage-bauer/bin/qi-alpha-reservierung (neu | liste | links |
 * entferne). Jede Reservierung = EIN Link; mehrere Nummern in einer
 * Reservierung = ein Link für mehrere Geräte. Jede Nummer hier steht auch in
 * THE_ALPHA_VERGEBEN (the-alpha-daten-serie-vergeben.js), damit der normale
 * Shop sie nie anbietet; der Test test/qi-alpha-reservierung.test.mjs hält das.
 * Die Sperre im Warenkorb (lib/qi-master-addons.server.js) nimmt eine
 * reservierte Nummer ohne den passenden Schlüssel wieder heraus.
 *
 * shop: 'deutsch' (qiblanco.com). 'englisch' ist vorbereitet, aber im
 * Global Englisch-Shop (qi-blanco.com, Liquid) gibt es diesen Bereich nicht;
 * das Werkzeug lehnt 'englisch' ab, bis er dort gebaut ist.
 */
export const RESERVIERUNGEN = [
  {
    schluessel: 'zrtdN1K39oTMjNu4gqfp7n',
    shop: 'deutsch',
    angelegt: '2026-11-01',
    nummern: [{n: 88, name: 'Lisa'}],
  },
  {
    schluessel: '90TDcbhtcWSZCCyM47GABe',
    shop: 'deutsch',
    angelegt: '2026-11-01',
    nummern: [{n: 44, name: 'Verena'}],
  },
  {
    schluessel: 'wSIMCnsmwwigXD36YlzcmS',
    shop: 'deutsch',
    angelegt: '2026-11-01',
    nummern: [
      {n: 2, name: 'Daniela'},
      {n: 99, name: 'Matthias'},
    ],
  },
];
