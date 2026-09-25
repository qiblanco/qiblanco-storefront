import {Link} from 'react-router';

/**
 * EIN SATZ IM RÜCKGABE-ABSCHNITT DER PRODUKTSEITEN, der auf
 * /pages/neu-oder-gebraucht zeigt.
 *
 * WARUM (Grossjob 20260925-GROSSJOB-neue-seiten-kommen-bei-google-nicht-an-
 * indexierung-und-soll, Segment s03, gemessen 2026-09-25): Google kannte die
 * Seite nur aus der Sitemap und hatte sie nach 12 Tagen nicht gelesen. Aus dem
 * Inhalt verlinkte sie allein die FAQ. Die Produktseite QiOne 2 Pro steht im
 * Index (301 Impressionen in 28 Tagen); der Rückgabe-Abschnitt ist die Stelle,
 * an der die Frage „was bekomme ich beim Kauf bei euch" schon gestellt ist.
 *
 * EIN BAUSTEIN FÜR ZWEI TRÄGER (QiOne2Pro.jsx, QiBracelet.jsx), damit der Satz
 * nicht zweimal auseinanderläuft. Er sitzt UNTER der Kaufbox, der Kaufweg bleibt
 * unberührt. Linkstil `withdrawal-text-link` aus app.css (Bestand): fett und
 * unterstrichen, weil reset.css jedem <a> die Unterstreichung nimmt.
 * Wache: homepage-bauer/pruefungen/probe_neue_seiten_inhaltslinks__20260925.py
 */
export function InhaltswegNeuOderGebraucht() {
  return (
    <p className="mt-1" data-qb-weg="neu-oder-gebraucht">
      Was du beim Kauf bei uns bekommst, von beiden Rückgabefristen bis zur
      Gewährleistung, steht in{' '}
      <Link className="withdrawal-text-link" to="/pages/neu-oder-gebraucht">
        Neu oder gebraucht
      </Link>
      .
    </p>
  );
}
