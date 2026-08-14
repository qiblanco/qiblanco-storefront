import {ScrollMikroskopVideo} from '~/components/index-components/ScrollMikroskopVideo';

export const meta = () => [
  {title: 'Technologie | Qi Blanco'},
  {
    name: 'description',
    content:
      'Die Technologie hinter den Qi Blanco® Systemen – kohärentes Wasser, Frequenzkommunikation und das Leiternetzwerk des Körpers.',
  },
  {rel: 'canonical', href: '/pages/technologie'},
];

export function loader() {
  return {};
}

const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/';

const pStyle = {lineHeight: '1.85', marginBottom: '1rem', opacity: 0.88};
const h2Style = {marginTop: '2.5rem', marginBottom: '0.75rem'};
const h3Style = {marginTop: '1.75rem', marginBottom: '0.5rem'};
const imgFullStyle = {width: '100%', height: 'auto', display: 'block', marginTop: '1rem'};
const captionStyle = {
  fontSize: '0.8rem',
  opacity: 0.6,
  lineHeight: '1.6',
  marginTop: '0.4rem',
  marginBottom: '1rem',
  textAlign: 'center',
  fontStyle: 'italic',
};

export default function TechnologiePage() {
  return (
    <div>
      {/* ── INTRO ── */}
      <section style={{padding: '4rem 1.5rem 2rem'}}>
        <div className="NormalSectionSize" style={{maxWidth: '860px'}}>
          <h1 style={{marginBottom: '1.25rem'}}>Die Technologie hinter den Qi Blanco® Systemen</h1>
          <p style={pStyle}>
            Der QiOne®, das QiHome® und QiBracelet® unterstützen die selbstoptimierende Eigenschaft von
            Wassermolekülen, kohärente Strukturen auszubauen.
          </p>
          <p style={pStyle}>
            In inkohärentem Wasser stoßen die Wassermoleküle aneinander und erzeugen Störfrequenzen. Dies wird als
            „Thermisches Rauschen" bezeichnet. Dadurch werden kleinste Frequenzen überlagert.
          </p>
          <p style={pStyle}>
            Durch die strenge Anordnung in kohärentem Wasser stoßen die Moleküle nicht mehr aneinander. Das thermische
            Rauschen wird auf ein Minimum reduziert. Dadurch können sich selbst kleinste Frequenzen ungehindert
            ausbreiten.
          </p>
        </div>
      </section>

      {/* ── MIKROSKOP VIDEO ── */}
      <ScrollMikroskopVideo />

      {/* ── INKOHÄRENTES / KOHÄRENTES WASSER ── */}
      <section style={{padding: '4rem 1.5rem'}}>
        <div
          className="NormalSectionSize"
          style={{
            maxWidth: '1000px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3rem',
            alignItems: 'start',
          }}
        >
          <div>
            <h2 style={{marginBottom: '0.75rem'}}>Inkohärentes Wasser</h2>
            <p style={pStyle}>
              <strong>
                Wenn Wassermoleküle unregelmäßig aufeinander stoßen, entsteht thermisches Rauschen.
              </strong>{' '}
              Diese unkontrollierten Bewegungen erzeugen Störfrequenzen, die die natürlichen Schwingungen des Körpers
              überlagern und dadurch die Zellkommunikation stören.
            </p>
            <img
              src={CDN + 'InkohaerentesWasser-2_transparent.png?v=1670949073'}
              alt="Inkohärentes Wasser"
              style={{...imgFullStyle, maxWidth: '260px'}}
            />
            <img
              src={CDN + 'qiblanco-com-knochen_jpg.webp?v=1666867432'}
              alt="Körperstruktur inkohärent"
              style={imgFullStyle}
            />
          </div>
          <div>
            <h2 style={{marginBottom: '0.75rem'}}>Kohärentes Wasser</h2>
            <p style={pStyle}>
              <strong>
                Zusätzliche Wasserstoffbrücken führen dazu, dass sich die Wassermoleküle in einer kristallinen Struktur
                anordnen und sich stoßfrei zueinander bewegen.
              </strong>{' '}
              Somit kommen alle Signale optimal am Ziel an.
            </p>
            <img
              src={CDN + 'KohaerentesWasser-2_transparent.png?v=1670949081'}
              alt="Kohärentes Wasser"
              style={{...imgFullStyle, maxWidth: '260px'}}
            />
            <img
              src={CDN + 'WhatsApp_Bild_2025-07-16_um_22.07.04_96093ac7.jpg?v=1752832087'}
              alt="Körperstruktur kohärent"
              style={imgFullStyle}
            />
          </div>
        </div>
      </section>

      {/* ── FREQUENZEN ── */}
      <section style={{padding: '4rem 1.5rem', background: '#f7f1e8'}}>
        <div className="NormalSectionSize" style={{maxWidth: '860px'}}>
          <h2 style={{textAlign: 'center', marginBottom: '1.5rem'}}>Frequenzen</h2>
          <h3 style={h3Style}>Die Sprache der Natur</h3>
          <p style={pStyle}>
            Frequenzen sind allgegenwärtig in der Natur. Sie entstehen aus der Eigenschwingung der Moleküle.
          </p>
          <p style={pStyle}>
            Jeder Gegenstand, jedes Molekül schwingt – außer es erreicht die tiefstmögliche Temperatur von −273,2 Grad
            Celsius (0 Grad Kelvin) – dem Temperaturnullpunkt. Hier befinden sich alle Moleküle in Ruhe.{' '}
            <em style={{opacity: 0.65}}>Max-Planck-Institut Göttingen</em>
          </p>
          <p style={pStyle}>
            Durch Schwingung entstehen Frequenzen. In der klassischen Elektronik ist dieser Effekt grundlegend.
            Antennen werden zum Schwingen gebracht, sodass diese Frequenzen aussenden. Ein anderes System kann diese
            Frequenzen durch Antennen aufnehmen und interpretieren. Ein Beispiel hierfür ist der WLAN-Router, der über
            seine Antennen das Signal aussendet, das Handy empfängt diese. Wird das Handy zum Sender und der
            WLAN-Router zum Empfänger, entsteht Kommunikation.
          </p>
          <p style={pStyle}>
            Die Natur hat es vorgemacht. Sie nutzt die Art der Frequenz-Kommunikation von Anbeginn der Zeit.
          </p>
          <p style={pStyle}>
            Im menschlichen Körper erzeugt jede Zelle Frequenzen. Der wichtigste Frequenzerzeuger ist das Gehirn.
            Jedoch erfolgt diese Kommunikation mit deutlich schwächeren Signalen als in der klassischen Elektronik.
            Das Gehirn erzeugt im Körper Frequenzen mit einer Flussdichte von ca. 10⁻⁹ Tesla. Im Vergleich dazu
            arbeitet ein moderner WLAN-Router mit einer Flussdichte von ca. 0,02 T – direkt gemessen an der Oberfläche
            der Antenne.
          </p>
        </div>

        {/* Frequenzentstehung im Gehirn */}
        <div
          className="NormalSectionSize"
          style={{
            maxWidth: '1000px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3rem',
            alignItems: 'start',
            marginTop: '2.5rem',
          }}
        >
          <img
            src={CDN + 'qiblanco-com-gehirn-frequenzen_jpg.webp?v=1666867432'}
            alt="Frequenzentstehung im Gehirn"
            style={{width: '100%', borderRadius: '12px'}}
          />
          <div>
            <h3 style={h3Style}>Frequenzentstehung im Gehirn</h3>
            <ul style={{lineHeight: '2.1', paddingLeft: '1.25rem', opacity: 0.88, marginBottom: '1rem'}}>
              <li>Delta-Wellen 0,1 bis 3,5 Hz</li>
              <li>Theta-Wellen 3,6 bis 7 Hz</li>
              <li>Alpha-Wellen 8 bis 13 Hz</li>
              <li>Beta-Wellen 14 bis 30 Hz</li>
              <li>Gamma-Wellen 31 bis 100 Hz</li>
            </ul>
            <p style={pStyle}>Eine Hirnwelle ist ca. 0,1 Sekunden lang.</p>
            <p style={pStyle}>
              Sie entstehen in der Hypophyse in den Milliarden von Gehirnzellen (Neuronen) und breiten sich durch das
              Gehirn im gesamten Nervensystem aus. Somit wird jeder Teil des Körpers erreicht.
            </p>
            <p style={pStyle}>
              Die Hirnwellen regulieren die Erregbarkeit und Aktivität des gesamten Nervensystems.
            </p>
            <p style={pStyle}>Die Steuerfrequenzen des Gehirns reichen von 0,1 – 100 Hz.</p>
          </div>
        </div>

        {/* Thalamus */}
        <div className="NormalSectionSize" style={{maxWidth: '860px', marginTop: '2rem'}}>
          <h3 style={h3Style}>Frequenzentstehung am Beispiel des Thalamus:</h3>
          <p style={pStyle}>
            Im Bereich des Thalamus sickern Kalziumionen in die Neuronen ein – Kalzium wird angereichert. Diese
            Neuronen schwingen nun 1,5 bis 28 Sekunden lang. Durch diese Schwingungen werden Hirnwellen ausgelöst,
            die sich aufwärts durch das Gehirn und im gesamten Nervensystem ausbreiten.
          </p>
          <p style={pStyle}>
            Sobald sich ein Kalziumüberschuss in den betroffenen Neuronen aufgebaut hat, hören die thalamischen
            Schwingungen schließlich auf. Es stellt sich eine Ruhephase zwischen 5 und 25 Sekunden ein.
          </p>
        </div>
      </section>

      {/* ── WIRKUNGSWEISE IN DEN ZELLEN ── */}
      <section style={{padding: '4rem 1.5rem'}}>
        <div className="NormalSectionSize" style={{maxWidth: '1000px'}}>
          <h2 style={{textAlign: 'center', marginBottom: '0.75rem'}}>Frequenzen</h2>
          <p style={{textAlign: 'center', marginBottom: '2rem', opacity: 0.7}}>
            Die Wirkungsweise in den Zellen
          </p>
          <p style={{...pStyle, textAlign: 'center', maxWidth: '700px', margin: '0 auto 2rem'}}>
            Der Körper besitzt maßgeblich zwei Möglichkeiten zur biologischen Regulierung, d.h. „Steuerung" der Zelle.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2.5rem',
              alignItems: 'start',
            }}
          >
            <div>
              <h3 style={h3Style}>1) Zellaktivierung durch Signalmoleküle</h3>
              <p style={pStyle}>
                Signalmoleküle können Hormone, Antigene oder Ionen (z.B. Magnesiumionen aus der Nahrung) sein. Hier
                wird die Zelle aktiviert, indem das Signalmolekül an den Rezeptor andockt.
              </p>
              <img
                src={CDN + 'zelle_png.webp?v=1666867432'}
                alt="Zellaktivierung durch Signalmoleküle"
                style={imgFullStyle}
              />
            </div>
            <div>
              <h3 style={h3Style}>2) Zellaktivierung durch Frequenzen</h3>
              <p style={pStyle}>
                Frequenzen, die z.B. vom Gehirn oder Muskel erzeugt werden, gelangen durch den Körper in die Zellen.
                Entsteht z.B. durch die Kontraktion eines Muskels ein elektromagnetischer Impuls, so breiten sich die
                dadurch entstandenen Extrem Niedrigen Frequenzen durch den Körper aus. Die Muskelzellen bekommen z.B.
                die Anweisung, sich zu lockern, um die Dehnung der Muskulatur zu ermöglichen.
              </p>
              <img
                src={CDN + 'zellaktivierung_png.webp?v=1666867432'}
                alt="Zellaktivierung durch Frequenzen"
                style={imgFullStyle}
              />
            </div>
          </div>

          <div style={{marginTop: '3rem', textAlign: 'center'}}>
            <p style={{...pStyle, marginBottom: '0.75rem'}}>
              Jede Zelle reagiert auf einen gewissen „Frequenzschlüssel". Dieser ist ähnlich einem herkömmlichen
              Schlüssel. Die Zacken des Schlüssels entsprechen dem Frequenzband des Signals.
            </p>
            <img
              src={CDN + 'Frequenzschluessel_png.webp?v=1666867432'}
              alt="Vergleich Schlüssel mit einem Frequenzschlüssel"
              style={{...imgFullStyle, maxWidth: '600px', margin: '0 auto 0.5rem'}}
            />
            <p style={captionStyle}>Vergleich Schlüssel mit einem „Frequenzschlüssel"</p>

            <blockquote
              style={{
                background: '#f7f1e8',
                borderLeft: '4px solid var(--color-accent-primary)',
                borderRadius: '8px',
                padding: '1.25rem 1.5rem',
                margin: '2rem 0 0',
                fontStyle: 'italic',
                lineHeight: '1.8',
                opacity: 0.88,
                textAlign: 'left',
              }}
            >
              „Medizinische Forscher halten Frequenzen von 0–30 Hz für therapeutisch wirksam, weil sie zellsteuernde
              Daten auf ein Gewebe übertragen. Dadurch wird eine Kaskade von Aktivitäten in den Zellen ausgelöst – von
              der Zellmembran, zum Kern, bis hin zu den Genen – in denen spezifische Veränderungen stattfinden."
              <footer style={{marginTop: '0.5rem', fontSize: '0.85rem', fontStyle: 'normal', opacity: 0.65}}>
                — Bassett, 1995
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* ── LEITERNETZWERK ── */}
      <section style={{padding: '4rem 1.5rem', background: '#f7f1e8'}}>
        <div
          className="NormalSectionSize"
          style={{
            maxWidth: '1000px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3rem',
            alignItems: 'center',
          }}
        >
          <img
            src={CDN + 'qiblanco-com-leiternetzwerk_jpg.webp?v=1666867432'}
            alt="Leiternetzwerk des Körpers"
            style={{width: '100%', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)'}}
          />
          <div>
            <h2 style={{marginBottom: '1rem'}}>Leiternetzwerk des Körpers</h2>
            <p style={pStyle}>
              Die moderne Zellbiologie erweitert das ursprüngliche Bild, in dem die Zelle als „ein Sack voller
              flüssiger Lösungen" beschrieben wird. Die Zellen bestehen aus einem Netzwerk aus Röhrchen (Tubuli),
              Fasern und Bälkchen (Trabekeln), die zusammen als Zytoskelett oder zytoplasmatische Grundsubstanz
              (lebende Matrix) bezeichnet werden.
            </p>
            <p style={pStyle}>
              <em>
                „Die lebende Matrix ist ein ununterbrochenes und dynamisches, supramolekulares Netzwerk, das sich bis
                in die kleinsten Ecken und Winkel des Körpers erstreckt. Eine Kernmatrix innerhalb einer Zellmatrix
                innerhalb einer Bindegewebematrix."
              </em>{' '}
              <span style={{opacity: 0.65}}>[Oschmann 2000]</span>
            </p>
            <p style={pStyle}>
              In diesem unlösbaren Netzwerk, in dem praktisch alle Moleküle des Körpers eingebunden sind, werden
              Einwirkungen, die einen Teil des Systems betreffen, an alle anderen Teile des Systems weitergeleitet.
            </p>
            <p style={pStyle}>
              Dieses Körpernetzwerk entspricht einem biologischen Computer: Das Gehirn als Prozessor, das Herz als
              Netzteil, das vegetative Nervensystem als Mainboard.
            </p>
            <p style={pStyle}>
              Somit wird leicht verständlich, was Toxine, Muskelverspannungen, Narbengewebe, verklebte Faszien oder
              eine Schiefstellung für den Körper bedeuten: Die lebende Matrix ist teilweise geschwächt, blockiert oder
              unterbrochen – die Kommunikation im Körper eingeschränkt.
            </p>
          </div>
        </div>
      </section>

      {/* ── AUFBAU DES SYSTEMS ── */}
      <section style={{padding: '4rem 1.5rem'}}>
        <div className="NormalSectionSize" style={{maxWidth: '1000px'}}>
          <h2 style={{textAlign: 'center', marginBottom: '1.25rem'}}>Aufbau des Systems</h2>
          <p style={{...pStyle, textAlign: 'center', maxWidth: '700px', margin: '0 auto 2.5rem'}}>
            Die Funktionsweise der Qi Blanco® Systeme beruht auf der Fähigkeit, mit modifizierten kristallinen
            Materialien maßgeblich Einfluss auf die Kohärenzbildung von Wassermolekülen zu nehmen.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2.5rem',
              alignItems: 'start',
            }}
          >
            <div>
              <h3 style={h3Style}>Kristalline Strukturen</h3>
              <p style={pStyle}>
                Zu den „klassischen" kristallinen Strukturen gehören die allseits bekannten Haushaltsprodukte wie Salz
                und Zucker. Weit weniger bekannt ist, dass auch Metalle beim Erstarrungszustand aus der Schmelze ihre
                Moleküle in kristalline Strukturen anordnen. Qi Blanco verwendet eine eigens entwickelte Legierung,
                die maßgeblich auf Feingold, Kupfer und Kohlenstoff beruht.
              </p>
              <img
                src={CDN + 'KristallineStrukturSalz_png.webp?v=1666867432'}
                alt="Kristalline Struktur Salz"
                style={imgFullStyle}
              />
              <p style={captionStyle}>
                Kristalline Struktur von Kochsalz (Natriumchlorid) – schematische Darstellung
              </p>
            </div>
            <div>
              <h3 style={h3Style}>Kristalline Strukturen und deren Möglichkeiten</h3>
              <p style={pStyle}>
                Generell ist es möglich, mit kristallinen Materialien Frequenzen direkt zu beeinflussen.
                Eindrucksvoll hat dies ein Forscherteam der Max-Planck-Gesellschaft in Mainz schon 2006 unter Beweis
                gestellt. Es wurden sogenannte Kolloidkristalle hergestellt. Diese sind nicht nur in der Lage, mit
                Hyperschallwellen (Schall mit Frequenzen oberhalb etwa 1.000 MHz) sondern auch mit Lichtwellen in
                Wechselwirkung zu treten.
              </p>
              <p style={pStyle}>
                Somit ist es möglich, z.B. Fensterscheiben herzustellen, die für Motorengeräusche undurchlässig, für
                Vogelgezwitscher aber durchlässig sind. Damit bieten sich für diese Technik revolutionäre
                Möglichkeiten im Bereich des Lärmschutzes.
              </p>
              <img
                src={CDN + 'Kolloidkristalle_png.webp?v=1666867432'}
                alt="Kolloidkristalle"
                style={imgFullStyle}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── LITERATUR ── */}
      <section style={{padding: '3rem 1.5rem 2rem', background: '#f7f1e8'}}>
        <div className="NormalSectionSize" style={{maxWidth: '860px'}}>
          <h2 style={{marginBottom: '1.5rem'}}>Literatur</h2>
          <ol style={{lineHeight: '2.2', opacity: 0.8, paddingLeft: '1.25rem', fontSize: '0.9rem'}}>
            <li>
              Seto A., Kusaka C., Nakazato S. et al. 1992 Detection of extraordinary large bio-magnetic field strength
              from human hand.{' '}
              <em>Acupuncture and Electro-Therapeutics Research International Journal</em> 17:75–94
            </li>
            <li>Sandyk R. 1995 Treatment of neurological and mental disorders. Patent No. 5,470,846</li>
            <li>
              Jaffe L.F. 1981 The role of ionic currents in establishing developmental pattern.{' '}
              <em>Philosophical Transactions of the Royal Society of London</em> B 295:553–566
            </li>
            <li>
              Bassett C.A.L. 1995 Bioelectromagnetics in the service of medicine.{' '}
              <em>American Chemical Society</em>, Washington DC
            </li>
            <li>
              Oschman J.L. 2000: <em>Energy Medicine. The Scientific Basis.</em> Churchill Livingstone
            </li>
          </ol>
        </div>
      </section>

      {/* ── GLOSSAR ── */}
      <section style={{padding: '3rem 1.5rem', background: '#fff'}}>
        <div className="NormalSectionSize" style={{maxWidth: '860px'}}>
          <h2 style={{marginBottom: '1.5rem'}}>Glossar</h2>
          {[
            {
              term: 'Amplitude (= Schwingungsweite)',
              def: 'Auslenkung einer Schwingung aus ihrer Ruhelage (der Lage des arithmetischen Mittels) bis zum Maximalwert.',
            },
            {
              term: 'Frequenz',
              def: '(von lateinisch: frequentia = Häufigkeit): Anzahl der Schwingungen pro Zeiteinheit. Kehrwert der Periodendauer. Maß für die Geschwindigkeit, mit der bei einem periodischen Vorgang Wiederholungen aufeinander folgen. Einheit: Hz.',
            },
            {
              term: 'Eigenfrequenz',
              def: 'Eine Frequenz, mit der ein System nach einmaliger Anregung schwingt.',
            },
            {
              term: 'Resonanz',
              def: '(von Lateinisch: resonare = widerhallen, ertönen): Allgemein: Widerhall, das Echo, das einer Aktion folgt. Physik: Mitschwingvorgang, den ein schwingungsfähiges System zeigt, wenn es von außen periodisch angeregt wird. Voraussetzungen: Die Erregerfrequenz ist gleich oder nahezu gleich der Eigenfrequenz des angeregten Systems.',
            },
            {
              term: 'Resonanzfrequenz',
              def: 'Eine Frequenz, bei der ein System bei periodischer Anregung besonders stark, also mit besonders großer Amplitude schwingt.',
            },
            {
              term: 'Schwingung (= Oszillation)',
              def: 'Sinusförmige Wechselgröße, sich wiederholende Schwankung einer Größe um einen Mittelwert. Findet neben der Mechanik, Akustik und Elektrotechnik auch beispielsweise Anwendung in der Biologie und Wirtschaft (Aktienkurse).',
            },
            {
              term: 'Oszillator',
              def: '(von lateinisch oszillare = schaukeln): ist ein schwingungsfähiges System. Er kann aus mehreren Bauteilen bestehen, die zu einer Oszillatorschaltung zusammengefügt werden.',
            },
          ].map(({term, def}) => (
            <div
              key={term}
              style={{
                borderBottom: '1px solid rgba(0,0,0,0.09)',
                padding: '1rem 0',
              }}
            >
              <strong style={{display: 'block', marginBottom: '0.25rem'}}>{term}</strong>
              <p style={{...pStyle, marginBottom: 0}}>{def}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHO / EMF RESEARCH ── */}
      <section style={{padding: '3rem 1.5rem', background: '#f7f1e8'}}>
        <div className="NormalSectionSize" style={{maxWidth: '860px'}}>
          <h2 style={{marginBottom: '1.25rem'}}>
            Das „International EMF Project" der Weltgesundheitsorganisation [WHO]:
          </h2>
          <blockquote
            style={{
              borderLeft: '4px solid var(--color-accent-primary)',
              paddingLeft: '1.25rem',
              fontStyle: 'italic',
              lineHeight: '1.8',
              opacity: 0.85,
              marginBottom: '1.5rem',
            }}
          >
            „Mögliche gesundheitliche Auswirkungen der Exposition gegenüber statischen und zeitveränderlichen
            elektrischen und magnetischen Feldern müssen wissenschaftlich geklärt werden. Elektromagnetische Felder
            aller Frequenzen stellen eine der häufigsten und am schnellsten wachsenden Umwelteinflüsse dar, über die
            sich Befürchtungen und Spekulationen verbreiten. Alle Bevölkerungsgruppen der Welt sind heute in
            unterschiedlichem Maße EMF-Exposition ausgesetzt, und die Werte werden mit fortschreitender Technologie
            weiter zunehmen. Daher könnte selbst eine kleine gesundheitliche Folge einer EMF-Exposition große
            Auswirkungen auf die öffentliche Gesundheit haben."
          </blockquote>
          <p style={{...pStyle, marginBottom: '2.5rem'}}>
            Erfahre mehr über die Initiative{' '}
            <a href="https://www.who.int/initiatives/the-international-emf-project" target="_blank" rel="noreferrer">
              hier
            </a>
            .
          </p>

          <h3 style={{...h3Style, marginBottom: '1rem'}}>Studien zu den Auswirkungen von EMF:</h3>

          {[
            {
              title:
                'Study 1: Functional brain MRI in patients complaining of electrohypersensitivity',
              body: 'Die Studie "Functional brain MRI in patients complaining of electrohypersensitivity after long term exposure to electromagnetic fields" untersuchte die Auswirkungen einer Langzeit-Exposition bei elektromagnetischen Feldern (EMF) auf die Gehirnaktivität von Personen, die über Symptome einer Elektrosensibilität berichten. Messfaktor war die funktionelle Magnetresonanztomographie (fMRT), um Veränderungen der Gehirnaktivität als Reaktion auf EMF-Exposition zu untersuchen.',
              citation:
                '© 2017 by De Gruyter, Heuser, Gunnar and Heuser, Sylvia A.. "Functional brain MRI in patients complaining of electrohypersensitivity after long term exposure to electromagnetic fields" Reviews on Environmental Health, vol. 32, no. 3, 2017, pp. 291-299.',
            },
            {
              title:
                'Study 2: Possible Effects of Radiofrequency Electromagnetic Field Exposure on Central Nerve System',
              body: '"Possible Effects of Radiofrequency Electromagnetic Field Exposure on Central Nerve System" untersucht die Auswirkungen elektronischer Geräte und drahtloser Kommunikationstechnologien auf die Gesellschaft und die wachsende Besorgnis über die potenziellen biologischen Auswirkungen elektromagnetischer Felder (EMFs). Die Internationale Agentur für Krebsforschung (IARC) hat HF-EMFs als potenziell krebserregend eingestuft, und es liegen Berichte über neurologische Wirkungen wie Kopfschmerzen und Schlafstörungen aufgrund einer HF-EMF-Exposition vor.',
              citation:
                '© 2019, The Korean Society of Applied Pharmacology, Kim JH, Lee JK, Kim HG, Kim KB, Kim HR. Possible Effects of Radiofrequency Electromagnetic Field Exposure on Central Nerve System. Biomol Ther (Seoul). 2019 May 1;27(3):265-275.',
            },
            {
              title: 'Study 3: Health effects of electromagnetic fields on children',
              body: 'Die meisten Kinder sind heutzutage künstlichen elektromagnetischen Feldern (EMFs) ausgesetzt. Die Anfälligkeit eines sich entwickelnden Gehirns gegenüber elektromagnetischen Feldern hat zu wachsender Besorgnis bei Pflegekräften geführt. Ein Hauptanliegen ist die Karzinogenität beim Menschen, wobei ELFs und RFs von der Internationalen Agentur für Krebsforschung als mögliche Humankarzinogene (Gruppe 2B) bewertet wurden. Bis die potenziellen gesundheitlichen Auswirkungen bestätigt sind, wird ein Vorsichtsansatz empfohlen.',
              citation:
                '© 2020 by The Korean Pediatric Society, Moon JH. Health effects of electromagnetic fields on children. Clin Exp Pediatr. 2020 Nov;63(11):422-428.',
            },
          ].map(({title, body, citation}) => (
            <div
              key={title}
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.25rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              <h4 style={{marginBottom: '0.75rem', fontSize: '1rem'}}>{title}</h4>
              <p style={{...pStyle, marginBottom: '0.75rem'}}>{body}</p>
              <p style={{fontSize: '0.8rem', opacity: 0.6, lineHeight: '1.6', marginBottom: 0}}>
                {citation}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DISCLAIMER ── */}
      <section style={{padding: '2.5rem 1.5rem', background: '#fff'}}>
        <div className="NormalSectionSize" style={{maxWidth: '860px'}}>
          <p
            style={{
              fontSize: '0.875rem',
              opacity: 0.65,
              lineHeight: '1.75',
              borderLeft: '3px solid rgba(0,0,0,0.15)',
              paddingLeft: '1rem',
            }}
          >
            Die hier vorgestellte Technologie entspricht (wie beispielsweise die Homöopathie, die Bioresonanz,
            Bereiche der Akupunktur) nicht der schulwissenschaftlichen Auffassung und Lehrmeinung. Der Einsatz der
            Qi Blanco® Produkte beinhaltet keine Therapie und ersetzt nicht die Konsultation eines Arztes oder
            Heilpraktikers. Alle erwähnten Aussagen oder Produkte sollen das allgemeine Wohlbefinden unterstützen und
            beabsichtigen nicht, einen Zustand oder eine Krankheit zu behandeln, zu diagnostizieren, zu lindern, zu
            verhindern oder zu heilen.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <div style={{padding: '5rem 1.5rem'}}>
        <div
          className="NormalSectionSize"
          style={{
            maxWidth: '900px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3rem',
            alignItems: 'center',
          }}
        >
          <img
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/ezgif-5-b78604ff40_500x500.webp?v=1682415134"
            alt="QiOne 2 Pro"
            style={{width: '100%', height: 'auto'}}
          />
          <div>
            <h2 style={{marginBottom: '1.25rem'}}>
              Lass deinen QiOne® 2 Pro kohärentes Wasser für dich produzieren
            </h2>
            <p style={{opacity: 0.85, lineHeight: '2', marginBottom: '1.75rem'}}>
              ✅ 100 % deutsche Produktion<br />
              ✅ Hochwertigste Materialien<br />
              ✅ Weltweiter Versand
            </p>
            <a
              href="/products/qione-2-pro"
              style={{
                display: 'inline-block',
                background: 'var(--color-accent-primary)',
                color: 'var(--color-dark)',
                padding: '0.85rem 2.25rem',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '1rem',
              }}
            >
              Hole dir jetzt deinen QiOne® 2 Pro
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
