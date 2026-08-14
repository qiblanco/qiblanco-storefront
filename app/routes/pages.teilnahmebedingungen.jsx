import {canonicalLink} from '~/lib/seo';

export const meta = () => [
  {title: 'Teilnahmebedingungen | Qi Blanco'},
  {
    name: 'description',
    content:
      'Teilnahmebedingungen für die Gewinnspiele der Qi Blanco UG (haftungsbeschränkt)',
  },
  canonicalLink('/pages/teilnahmebedingungen'),
];

export function loader() {
  return {};
}

const listItemStyle = {marginBottom: '1.5rem', lineHeight: '1.8'};
const absatzStyle = {marginTop: '0.75rem', lineHeight: '1.8'};

export default function TeilnahmebedingungenPage() {
  return (
    <div className="NormalSectionSize" style={{maxWidth: '860px', padding: '3rem 1.5rem 5rem'}}>
      <h1 style={{marginBottom: '2.5rem'}}>Teilnahmebedingungen</h1>

      <p style={{lineHeight: '1.8', marginBottom: '1.5rem'}}>
        Hier erfährst du, wie du an unseren Gewinnspielen teilnehmen und mit ein wenig Glück
        gewinnen kannst. Lies dir bitte unsere Teilnahmebedingungen und Hinweise zu den
        Datenschutzbestimmungen durch.
      </p>

      <p style={{lineHeight: '1.8', marginBottom: '1.5rem'}}>
        <strong>Teile deine Erfahrung und gewinne 200€ Cashback</strong>
      </p>

      <p style={{lineHeight: '1.8', marginBottom: '2rem'}}>Es gelten die folgenden Bedingungen:</p>

      <ol style={{paddingLeft: '1.25rem'}}>
        <li style={listItemStyle}>
          <strong>Veranstalter</strong>
          <br />
          Das Gewinnspiel wird durchgeführt von Qi Blanco UG (haftungsbeschränkt)
          <br />
          (nachfolgend: Qi Blanco).
        </li>

        <li style={listItemStyle}>
          <strong>Teilnehmer</strong>
          <p style={absatzStyle}>
            Teilnahmeberechtigt sind alle natürlichen Personen ab 18 Jahren, unabhängig vom
            Wohnsitz, sofern die Teilnahme nicht durch gesetzliche Regelungen ihres Wohnsitzlandes
            untersagt ist.
          </p>
          <p style={absatzStyle}>
            Die Teilnahme über Gewinnspielvereine oder Teilnahme- und Eintragungsdienste,
            automatisierte Teilnahmen, Mehrfachteilnahmen (bspw. mit unterschiedlichen
            E-Mail-Adressen) sowie die Teilnahme mit gefälschten Identitäten oder mit Identitäten
            von Drittpersonen sind nicht gestattet.
          </p>
          <p style={absatzStyle}>
            Die Teilnehmer müssen unter Umständen ihre Teilnahmeberechtigung an dem Gewinnspiel
            nachweisen.
          </p>
        </li>

        <li style={listItemStyle}>
          <strong>Gewinne und Einlösebedingungen</strong>
          <br />
          Bei den ausgeschriebenen Gewinnen handelt es sich um 4x 200 Euro Barauszahlung im Jahr.
          Dies ist eine wiederkehrende Verlosung und findet jedes Jahr 1x pro Quartal statt. Der
          Gewinner wird persönlich per Mail von uns benachrichtigt. Die Gewinnsumme wird nach
          Rücksprache auf das gewünschte Konto überwiesen.
        </li>

        <li style={listItemStyle}>
          <strong>Wie erfolgt die Teilnahme?</strong>
          <br />
          Das Gewinnspiel findet permanent statt.
          <p style={absatzStyle}>
            Um an dem Gewinnspiel teilnehmen zu können, muss der Teilnehmer eine Bewertung auf
            unserer Google-Review Seite hinterlassen und die Teilnahmebedingungen und
            Datenschutzhinweise akzeptieren.
          </p>
        </li>

        <li style={listItemStyle}>
          <strong>Gewinnerermittlung</strong>
          <br />
          Die Gewinner werden per Zufallsprinzip ermittelt.
        </li>

        <li style={listItemStyle}>
          <strong>Gewinnerbenachrichtigung</strong>
          <br />
          Die Gewinner werden nach Ablauf des Gewinnspiels per E-Mail benachrichtigt und
          aufgefordert, ihre Kontaktdaten (Vollständiger Name) per E-Mail anzugeben.
        </li>

        <li style={listItemStyle}>
          <strong>Gewinnübermittlung</strong>
          <br />
          Die Gewinnsumme wird nach Rücksprache auf das gewünschte Konto des Teilnehmenden
          überwiesen.
        </li>

        <li style={listItemStyle}>
          <strong>Ausschluss von Teilnehmern</strong>
          <p style={absatzStyle}>
            Qi Blanco behält sich das Recht vor, Teilnehmer, die falsche oder unvollständige
            Angaben machen, sich unerlaubter Hilfsmittel bedienen, bei denen der Verdacht auf
            Manipulation besteht oder die in sonstiger Weise gegen die Teilnahmebedingungen
            verstoßen, ohne Angabe von Gründen von der Teilnahme auszuschließen.
          </p>
          <p style={absatzStyle}>
            Liegen die Voraussetzungen für einen Ausschluss vor, können Gewinne nachträglich
            aberkannt oder bereits ausgelieferte Gewinne zurückgefordert werden.
          </p>
          <p style={absatzStyle}>
            Qi Blanco bleibt es vorbehalten, den Teilnehmer bei Verdacht eines Ausschlussgrundes
            zur Stellungnahme aufzufordern.
          </p>
        </li>

        <li style={listItemStyle}>
          <strong>Keine Gewinnübermittlung</strong>
          <br />
          Sollte eine Gewinnübermittlung an den Teilnehmer nicht möglich sein (z. B. da der
          Gewinnanspruch aufgrund der Teilnahmebedingungen entfallen ist oder der Gewinner den
          Gewinn nicht annimmt), bleibt es Qi Blanco nach eigenem Ermessen überlassen zu
          entscheiden, was mit dem Gewinn erfolgt (z. B. ob der Gewinn nach den vorliegenden
          Teilnahmebedingungen an die Teilnehmer, die nicht gewonnen haben, vergeben wird oder ob
          dieser nicht vergeben und z. B. für ein anderes Gewinnspiel genutzt wird).
        </li>

        <li style={listItemStyle}>
          <strong>Datenschutz</strong>
          <br />
          Siehe <a href="/pages/datenschutz">Datenschutzerklärung</a>.
        </li>

        <li style={listItemStyle}>
          <strong>Haftungsausschluss</strong>
          <p style={absatzStyle}>
            Qi Blanco übernimmt keine Verantwortung für Datenverluste, insbesondere solche, die auf
            dem Wege der Datenübertragung entstanden sind, technische Defekte sowie verloren
            gegangene, beschädigte oder verspätete Einsendungen, die auf Netzwerk-, Hardware- oder
            Softwareprobleme zurückzuführen sind.
          </p>
          <p style={absatzStyle}>
            Etwaige Gewährleistungsansprüche der Gewinner sind ausgeschlossen.
          </p>
        </li>

        <li style={listItemStyle}>
          <strong>Änderung/Einstellung des Gewinnspiels</strong>
          <p style={absatzStyle}>
            Qi Blanco behält sich das Recht vor, das Gewinnspiel im Fall unvorhergesehener Umstände
            zu ändern oder einzustellen.
          </p>
          <p style={absatzStyle}>
            Qi Blanco ist insbesondere berechtigt, das Gewinnspiel einzustellen, abzubrechen oder
            auszusetzen, wenn
            <br />
            - ein versuchter Missbrauch durch Manipulation festgestellt wird, oder
            <br />
            - eine ordnungsgemäße Durchführung nicht mehr sichergestellt ist, dies insbesondere
            beim Ausfall von Hard- oder Software, bei Programmfehlern, Computerviren oder bei nicht
            autorisierten Eingriffen von Dritten sowie mechanischen, technischen oder rechtlichen
            Problemen.
          </p>
        </li>

        <li style={listItemStyle}>
          <strong>Unwirksamkeit einzelner Klauseln</strong>
          <br />
          Sollte eine Klausel dieser Bedingungen unwirksam sein, gilt die entsprechende gesetzliche
          Regelung und die Wirksamkeit der übrigen Bedingungen bleibt hiervon unberührt.
        </li>

        <li style={listItemStyle}>
          <strong>Übertragung, Rechtsweg</strong>
          <br />
          Eventuelle Gewinnansprüche sind nicht übertragbar. Der Rechtsweg ist ausgeschlossen.
        </li>

        <li style={listItemStyle}>
          <strong>Verbraucherschlichtung</strong>
          <br />
          Hiermit informieren wir dich darüber, dass Qi Blanco nicht an Streitbeilegungsverfahren
          einer Verbraucherschlichtungsstelle teilnimmt und dazu auch nicht verpflichtet ist.
        </li>
      </ol>
    </div>
  );
}
