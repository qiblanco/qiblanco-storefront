/**
 * Geldbetrag für Kundentext: ganze Beträge ohne Nachkommastellen, echte Cents
 * bleiben centgenau (Brain-Regel ganze-betraege-ohne-nachkommastellen).
 *
 * EINE Funktion, EIN Ort: sie steht in campaign/the-alpha-kauf-laden.js (Qi-
 * Alpha-Kaufseite). Die Alpha-Vorlage der Produktseiten (Grossjob 20261027-
 * GROSSJOB-apple-konfigurator-qione-qihome-qibracelet-ab) liest sie über diese
 * neutrale Adresse. Die Qi-Alpha-Datei bleibt bis zum Qi-Alpha-Launch
 * (So 01.11.2026, Christian: nichts an /products/qi-alpha verändern) byte-gleich;
 * danach darf die Funktion hierher umziehen und dort weitergereicht werden.
 */
export {betragText} from '../components/campaign/the-alpha-kauf-laden.js';
