import {canonicalLink} from '~/lib/seo';
import {Rechtsseite} from '~/components/Rechtsseite';

export const meta = () => [
  {title: 'Impressum | Qi Blanco'},
  {name: 'description', content: 'Impressum der Qi Blanco UG (haftungsbeschränkt)'},
  canonicalLink('/pages/impressum'),
];

export function loader() {
  return {};
}

export default function ImpressumPage() {
  return (
    <Rechtsseite>
      <h1>Impressum</h1>

      <section>
        <h2>Angaben gemäß § 5 DDG</h2>
        <p>
          Qi Blanco UG (haftungsbeschränkt)<br />
          Brunnrangenstr. 25<br />
          97711 Maßbach<br />
          Deutschland
        </p>
      </section>

      <section>
        <h2>Vertreten durch</h2>
        <p>Geschäftsführer: Dipl.-Ing. Christian Bernd Bauer</p>
      </section>

      <section>
        <h2>Kontakt</h2>
        <p>
          E-Mail: <a href="mailto:info@qiblanco.com">info@qiblanco.com</a><br />
          Für eine schnelle Kontaktaufnahme steht Ihnen zusätzlich unser Support-Chat auf dieser
          Website zur Verfügung.
        </p>
      </section>

      <section>
        <h2>Registereintrag</h2>
        <p>
          Eintragung im Handelsregister.<br />
          Registergericht: Amtsgericht Schweinfurt<br />
          Registernummer: HRB 7306
        </p>
      </section>

      <section>
        <h2>Umsatzsteuer-ID</h2>
        <p>
          Umsatzsteuer-Identifikationsnummer gem. § 27a Umsatzsteuergesetz: DE306530406
        </p>
      </section>

      <section>
        <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p>Christian Bernd Bauer, Brunnrangenstr. 25, 97711 Maßbach</p>
      </section>

      <section>
        <h2>Haftungsausschluss</h2>

        <h3>1. Inhalt des Onlineangebotes</h3>
        <p>
          Der Autor übernimmt keinerlei Gewähr für die Aktualität, Korrektheit, Vollständigkeit oder Qualität der bereitgestellten Informationen. Haftungsansprüche gegen den Autor, welche sich auf Schäden materieller oder ideeller Art beziehen, die durch die Nutzung oder Nichtnutzung der dargebotenen Informationen bzw. durch die Nutzung fehlerhafter und unvollständiger Informationen verursacht wurden, sind grundsätzlich ausgeschlossen, sofern seitens des Autors kein nachweislich vorsätzliches oder grob fahrlässiges Verschulden vorliegt.
        </p>

        <h3>2. Verweise und Links</h3>
        <p>
          Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich. Bei direkten oder indirekten Verweisen auf fremde Webseiten, die außerhalb unseres Verantwortungsbereiches liegen, würde eine Haftungsverpflichtung ausschließlich in dem Fall in Kraft treten, in dem wir von den Inhalten Kenntnis haben und es uns technisch möglich und zumutbar wäre, die Nutzung im Falle rechtswidriger Inhalte zu verhindern.
        </p>

        <h3>3. Urheber- und Kennzeichenrecht</h3>
        <p>
          Der Autor ist bestrebt, in allen Publikationen die Urheberrechte der verwendeten Grafiken, Tondokumente, Videosequenzen und Texte zu beachten, von ihm selbst erstellte Grafiken, Tondokumente, Videosequenzen und Texte zu nutzen oder auf lizenzfreie Grafiken, Tondokumente, Videosequenzen und Texte zurückzugreifen. Alle innerhalb des Internetangebotes genannten und ggf. durch Dritte geschützten Marken- und Warenzeichen unterliegen uneingeschränkt den Bestimmungen des jeweils gültigen Kennzeichenrechts und den Besitzrechten der jeweiligen eingetragenen Eigentümer.
        </p>

        <h3>4. Datenschutz</h3>
        <p>
          Informationen zur Verarbeitung personenbezogener Daten finden Sie in unserer{' '}
          <a href="/pages/datenschutz">Datenschutzerklärung</a>. Sofern innerhalb des
          Internetangebotes die Möglichkeit zur Eingabe persönlicher oder geschäftlicher Daten
          (E-Mail-Adressen, Namen, Anschriften) besteht, so erfolgt die Preisgabe dieser Daten
          seitens des Nutzers auf ausdrücklich freiwilliger Basis.
        </p>

        <h3>5. Rechtswirksamkeit dieses Haftungsausschlusses</h3>
        <p>
          Dieser Haftungsausschluss ist als Teil des Internetangebotes zu betrachten, von dem aus auf diese Seite verwiesen wurde. Sofern Teile oder einzelne Formulierungen dieses Textes der geltenden Rechtslage nicht, nicht mehr oder nicht vollständig entsprechen sollten, bleiben die übrigen Teile des Dokumentes in ihrem Inhalt und ihrer Gültigkeit davon unberührt.
        </p>
      </section>

      <section>
        <h2>Urheberrecht und Nutzungsvorbehalt</h2>
        <p>
          Alle Inhalte dieser Website – insbesondere Texte, Bilder, Videos, Grafiken,
          Produktbeschreibungen und deren Anordnung – sind urheberrechtlich geschützt. Die
          Qi Blanco UG (haftungsbeschränkt) behält sich eine Nutzung ihrer Inhalte für
          kommerzielles Text- und Data-Mining im Sinne von § 44b UrhG ausdrücklich vor.
        </p>
        <p>
          Dieser Nutzungsvorbehalt wird zusätzlich in maschinenlesbarer Form erklärt,
          insbesondere über die Datei <code>/.well-known/tdmrep.json</code> (W3C TDM
          Reservation Protocol), den HTTP-Header <code>tdm-reservation: 1</code> sowie die
          Datei <a href="/robots.txt">/robots.txt</a>.
        </p>
      </section>

      <section>
        <h2>Verbraucherstreitbeilegung</h2>
        <p>
          Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen. Hinweis: Die von der Europäischen Kommission
          betriebene Plattform zur Online-Streitbeilegung (OS-Plattform) wurde zum 20. Juli 2025
          eingestellt und steht nicht mehr zur Verfügung.
        </p>
      </section>

      <section>
        <h2>Wissenschaftlicher Hinweis</h2>
        <p>
          Die von Qi Blanco vertriebene Technologie entspricht nicht dem konventionellen wissenschaftlichen Verständnis und ersetzt nicht die Konsultation eines Arztes oder Heilpraktikers.
        </p>
      </section>
    </Rechtsseite>
  );
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
