/*
 * RABATT AM PERSÖNLICHEN LINK (Christian 02.11.2026, Job 20261102-prio1-qi-
 * alpha-link-daniela-matthias-1500-rabatt-wunschnummer-gratis): „Dass da ein
 * automatischer Rabatt pro Qi-Alpha von 1500 Euro ist. Und die Wunschnummer
 * auch rabattiert wird. Dass die auch umsonst ist.“ und „ist kein weiterer
 * Rabatt kombinierbar“.
 *
 * NUR SERVER: der Code ist das Geheimnis und gelangt nie in das Browser-Paket.
 * Der Browser bekommt je Aufruf nur die Beträge seines Links (rabattAngabe).
 * Der Server setzt den Code selbst, sobald eine Korbzeile den Schlüssel trägt
 * (lib/qi-master-addons.server.js), und nimmt ihn ohne Schlüssel wieder heraus.
 *
 * EIGENE DATEI, nicht in qi-alpha-reservierungen.server.js: das Pflegewerkzeug
 * homepage-bauer/bin/qi-alpha-reservierung schreibt jene Datei neu und würde
 * alles hinter der Liste verwerfen.
 *
 * IN SHOPIFY: Code nur auf dem Produkt Qi Alpha®, 1.500 € je Stück,
 * combinesWith alle false, höchstens 2 Bestellungen. Die Wunschnummer gratis
 * ist KEIN Rabatt (nur EIN Rabatt ist möglich, wenn nichts kombinierbar ist),
 * sondern der Variantenpreis 0 mit Vergleichspreis der Nummern 2 und 99; diese
 * Nummern kauft nur, wer den Schlüssel trägt (reservierungsSperre).
 */
export const RESERVIERUNGS_RABATTE = {
  wSIMCnsmwwigXD36YlzcmS: {
    code: 'DEIN-VORTEIL-7RKPKWDLYAGNYJGG27',
    jeAlphaEur: 1500,
    wunschnummerWertEur: 2000,
  },
};
