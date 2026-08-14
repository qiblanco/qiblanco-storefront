export const meta = () => [
  {title: 'Wissenschaftliche Studien | Qi Blanco'},
  {
    name: 'description',
    content:
      'Wissenschaftlich getestet und in Fachpublikationen bestätigt. Zellstudien zur Wirkung des QiOne® 2 Pro auf Immunzellen, Darmzellen und oxidativen Stress.',
  },
  {rel: 'canonical', href: '/pages/studien'},
];

export function loader() {
  return {};
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '2rem',
  marginTop: '2rem',
};

const halfGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '2rem',
  marginTop: '2rem',
};

const thirdGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '1.5rem',
  marginTop: '1.5rem',
};

const sectionStyle = {
  padding: '3rem 1.5rem',
};

const h2Style = {marginTop: '2.5rem', marginBottom: '0.75rem'};
const h3Style = {marginTop: '1.75rem', marginBottom: '0.5rem'};
const pStyle = {lineHeight: '1.85', marginBottom: '1rem', opacity: 0.88};
const imgFullStyle = {width: '100%', height: 'auto', display: 'block', marginTop: '1rem', marginBottom: '1rem'};
const imgCenterStyle = {display: 'block', marginLeft: 'auto', marginRight: 'auto', maxWidth: '100%', marginTop: '1rem', marginBottom: '1rem'};
const captionStyle = {fontSize: '0.85rem', lineHeight: '1.6', opacity: 0.7, marginBottom: '1.5rem'};

export default function StudienPage() {
  return (
    <div>
      {/* Hero */}
      <div
        style={{
          padding: '5rem 1.5rem 4rem',
          textAlign: 'center',
        }}
      >
        <div className="NormalSectionSize" style={{maxWidth: '760px'}}>
          <h1 style={{marginBottom: '1rem'}}>Wissenschaftlich getestet und in Fachpublikationen bestätigt.</h1>
        </div>
      </div>

      {/* Publication preview grid */}
      <div className="NormalSectionSize" style={{...sectionStyle, maxWidth: '900px'}}>
        <div style={gridStyle}>
          <div style={{textAlign: 'center'}}>
            <h3 style={{marginBottom: '0.5rem'}}>Wissenschaftliche Publikation an Immunzellen</h3>
            <p style={{fontSize: '0.85rem', opacity: 0.65, marginBottom: '0.75rem'}}>
              veröffentlicht im Japan Journal of Medicine am April 30, 2021
            </p>
            <a href="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro-human-cell-study-publication-april-30-2021_1.pdf?v=1679586513" target="_blank" rel="noreferrer">
              <img
                src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Studienvorschau_hellblau-1-957x1024_2.png?v=1732276510"
                alt="Studie Immunzellen"
                style={{width: '100%', height: 'auto', borderRadius: '8px'}}
              />
            </a>
          </div>
          <div style={{textAlign: 'center'}}>
            <h3 style={{marginBottom: '0.5rem'}}>Wissenschaftliche Publikation an Darmzellen</h3>
            <p style={{fontSize: '0.85rem', opacity: 0.65, marginBottom: '0.75rem'}}>
              veröffentlicht im Applied Cell Biology Journal, 2021
            </p>
            <a href="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/protective-effect-of-qionereg-2-pro-on-cultured-intestinal-epithelial-358_1.pdf?v=1679586513" target="_blank" rel="noreferrer">
              <img
                src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Studienvorschau_hellblau-1-957x1024_1.png?v=1732276143"
                alt="Studie Darmzellen"
                style={{width: '100%', height: 'auto', borderRadius: '8px'}}
              />
            </a>
          </div>
          <div style={{textAlign: 'center'}}>
            <h3 style={{marginBottom: '0.5rem'}}>Wissenschaftliche Publikation zum oxidativen Stress</h3>
            <p style={{fontSize: '0.85rem', opacity: 0.65, marginBottom: '0.75rem'}}>
              veröffentlicht im Applied Cell Biology Journal am Januar 12, 2024
            </p>
            <a href="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Studie_-_Appl_Cell_Biol_12_1_2024_1-6_-_Protective_Effect_of_the_QiBracelet_Against_Oxidative_Stress.pdf?v=1709036505" target="_blank" rel="noreferrer">
              <img
                src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Cell_Biology_Cover_Remake_Seite_3.png?v=1710540229"
                alt="Studie Oxidativer Stress"
                style={{width: '100%', height: 'auto', borderRadius: '8px'}}
              />
            </a>
          </div>
          <div style={{textAlign: 'center'}}>
            <h3 style={{marginBottom: '0.5rem'}}>Wissenschaftliche Publikation zur Nutzererfahrung</h3>
            <p style={{fontSize: '0.85rem', opacity: 0.65, marginBottom: '0.75rem'}}>
              veröffentlicht im Advances in Bioengineering &amp; Biomedical Science Research am Mai 10, 2024
            </p>
            <a href="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/ABBSR-24_-31_3.pdf?v=1717500318" target="_blank" rel="noreferrer">
              <img
                src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Cell-Biology-Cover-Remake-Seite-4.webp?v=1717500844"
                alt="Studie Nutzererfahrung"
                style={{width: '100%', height: 'auto', borderRadius: '8px'}}
              />
            </a>
          </div>
        </div>
      </div>

      {/* ── IMMUNZELLEN ── */}
      <div className="NormalSectionSize" style={{...sectionStyle, maxWidth: '900px'}}>
        <h2 id="immunzellen" style={{textAlign: 'center', ...h2Style}}>Zellstudie an Immunzellen</h2>
        <p style={{textAlign: 'center', color: 'var(--checkmark-color)', fontWeight: 700, marginBottom: '1.5rem'}}>
          ✅ Zellbiologisch geprüft &amp; bestätigt
        </p>

        <a
          href="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro-human-cell-study-publication-april-30-2021_1.pdf?v=1667512705"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Immunzellenstudie_480x480.png?v=1657138817"
            alt="Immunzellenstudie"
            style={{...imgCenterStyle, maxWidth: '446px'}}
          />
        </a>

        <div style={{textAlign: 'center', margin: '1.25rem 0 2rem'}}>
          <a
            href="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro-human-cell-study-publication-april-30-2021_1.pdf?v=1667512705"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-block',
              background: 'var(--color-dark)',
              color: '#fff',
              padding: '0.7rem 2rem',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            Wissenschaftliche Publikation lesen
          </a>
        </div>

        <p style={pStyle}>
          Nachfolgend sind die Versuche des Dartsch Scientific GmbH an Neutrophilen des Blutes und dem QiOne® 2 Pro
          dargestellt. Den vollständigen Originalbericht kannst du{' '}
          <a href="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro-human-cell-study-publication-april-30-2021_1.pdf?v=1667512705" target="_blank" rel="noreferrer">
            hier anschauen.
          </a>
        </p>

        <div style={halfGridStyle}>
          <div>
            <h3 style={{textAlign: 'center', ...h3Style}}>Erhöhter Zellstoffwechsel</h3>
            <img
              src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Anstieg-vs.-Kontrollgruppe-Kopie-1024x602.jpg_1.webp?v=1667513059"
              alt="Erhöhter Zellstoffwechsel"
              style={imgFullStyle}
            />
          </div>
          <div>
            <h3 style={{textAlign: 'center', ...h3Style}}>Schutz vor E-Smog</h3>
            <img
              src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Superoxidanion_Radikalbildung-Kopie-1024x602.jpg_1.webp?v=1667513066"
              alt="Schutz vor E-Smog"
              style={imgFullStyle}
            />
          </div>
        </div>

        <h2 style={h2Style}>1. Hintergrund und Fragestellung der vorliegenden Studie</h2>
        <p style={pStyle}>
          Der QiOne® 2 Pro enthält laut Hersteller Qi Blanco® UG (haftungsbeschränkt) aus Deutschland einen Gitterchip,
          der ein statisches Feld bildet, das die Wassermoleküle zu einem Übergang in den kohärenten Zustand anregt. Da
          unser Körper zu etwa 70 bis 90 % aus Wasser besteht (je nach Alter), beeinflusst der kohärente Zustand der
          Wassermoleküle die Zellen unseres gesamten Körpers. In der vorliegenden In-vitro-Studie wurde mit gängigen
          zellbiologischen Methoden untersucht, ob sich durch die Anwendung von QiOne® 2 Pro positive Effekte ergeben,
          die durch wissenschaftlich anerkannte Bioassays nachgewiesen werden können.
        </p>

        <h2 style={h2Style}>2. Beschreibung der für diese Studie verwendeten Zellen</h2>
        <p style={pStyle}>
          Neutrophile sind die am häufigsten vorkommende Art von Granulozyten, die etwa 60 % aller weißen
          Blutkörperchen des Menschen ausmachen und sich normalerweise im Blutkreislauf befinden. Sie bilden einen
          wesentlichen Teil des angeborenen Immunsystems und spielen daher eine Schlüsselrolle in der vordersten
          Verteidigungslinie gegen eindringende mikrobielle Krankheitserreger. Sie gehören auch zu den ersten
          Ansprechpartnern bei Entzündungen. Sie sind in der Lage, im Rahmen eines sogenannten oxidativen oder
          respiratorischen Bursts hochreaktive Superoxid-Anion-Radikale zu erzeugen.
        </p>

        <h2 style={h2Style}>3. Grundlegender Versuchsaufbau</h2>
        <p style={pStyle}>
          Die hier vorgestellten Untersuchungen wurden mit humanen Promyelozyten (HL-60 Zelllinie; ACC-3; ECACC
          98070106; Leibniz Institut, DSMZ, Braunschweig, Deutschland) durchgeführt. Die Zellen wurden routinemäßig in
          RPMI 1640-Medium mit 10 % Wachstumsmischung und 0,5 % Gen-Tamycin gezüchtet und in einem Inkubator bei 37 °C
          in einer Atmosphäre von 5 % CO₂ und 95 % Luft bei 98 % Luftfeuchtigkeit kultiviert.
        </p>
        <p style={pStyle}>
          Die nicht-adhärenten Zellen wurden routinemäßig als Suspensionsmassenkulturen kultiviert und regelmäßig
          zweimal pro Woche mit frischem Kulturmedium subkultiviert. Durch Zugabe von 1,5 % Dimethylsulfoxid zum
          Kulturmedium wurden die Zellen über einen Zeitraum von 6 Tagen zu funktionellen Neutrophilen differenziert,
          die nach Zugabe eines Phorbolesters in der Lage sind, Superoxidanion-Radikale zu erzeugen. Die Radikale
          führen zu einer Spaltung des Tetrazolium-Farbstoffs WST-1 (Roche Diagnostics, Mannheim), der dem
          Reaktionsgemisch ebenfalls zugesetzt wurde. Die Menge der vorhandenen Sauerstoffradikale ist direkt
          proportional zur Spaltung des Farbstoffs, d.h. je höher die Menge der reaktiven Radikale, desto stärker ist
          die Spaltung des Farbstoffs und die Änderung der optischen Dichte im Reaktionsgemisch. Die optische Dichte
          (= Farbänderung) der Reaktion wurde durch eine Differenzmessung ∆OD = 450–690 nm zu bestimmten Zeitpunkten
          mit einem Elisareader gemessen. Außerdem wurde der basale Stoffwechsel der funktionellen Neutrophilen auf die
          gleiche Weise überprüft, jedoch ohne Phorbolester-Stimulation.
        </p>

        <h2 style={h2Style}>4. Langfristige Wirkung von QiOne® 2 Pro</h2>
        <p style={pStyle}>
          HL-60 Zellen, die wie oben beschrieben zu funktionellen Neutrophilen differenziert wurden, wurden während des
          Differenzierungsprozesses kontinuierlich mit QiOne® 2 Pro über einen Zeitraum von 6 Tagen ausgesetzt. Der
          Abstand zwischen der Zellsuspension in Kunststoff-Kulturflaschen und QiOne® 2 Pro betrug etwa 1 mm. Danach
          wurde der basale Zellstoffwechsel und die Superoxid-Anion-Radikal Generation berechnet. Es wurden vier
          unabhängige Experimente mit duplizierten Probengefäßen durchgeführt. Wie in Abb. 1 dargestellt, zeigten die
          Testergebnisse, dass der basale Zellstoffwechsel im Vergleich zur unbehandelten Kontrolle signifikant um
          12,5 ± 2,9 % erhöht war (p ≤ 0,05, zweiseitiger Wilcoxon-Mann-Whitney-Test). Die Generierung von Radikalen
          war im Vergleich zur unbehandelten Kontrolle sogar um 27,7 ± 7,7 % erhöht (p ≤ 0,01).
        </p>
        <p style={pStyle}>
          Beide Ergebnisse zeigen deutlich, dass die Langzeitanwendung von QiOne® 2 Pro die Effizienz des angeborenen
          Immunsystems in vivo erhöhen könnte, indem sie den Basalstoffwechsel und die Radikalgenerierung von
          Neutrophilen anregt.
        </p>
        <img
          src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Anstieg-vs.-Kontrollgruppe-1.png_1.webp?v=1667513443"
          alt="Abb. 1 Langzeitergebnisse"
          style={imgFullStyle}
        />
        <p style={captionStyle}>
          <strong>Abb. 1:</strong> Darstellung der Langzeitergebnisse mit QiOne® 2 Pro während des
          Differenzierungsprozesses von Promyelozyten zu funktionellen Neutrophilen über 6 Tage. Die Kontrollen sind
          als „0" gesetzt. Die Daten repräsentieren Mittelwerte ± Standardabweichungen von 4 unabhängigen Experimenten
          mit Duplikatvertiefungen. *p ≤ 0,05 vs. unbehandelte Kontrolle und **p ≤ 0,01 vs. unbehandelte Kontrolle;
          zweiseitiger Wilcoxon-Mann-Whitney-Test.
        </p>

        <h2 style={h2Style}>5. Inaktivierung von Handystrahlung durch QiOne® 2 Pro</h2>
        <p style={pStyle}>
          Promyelozyten, die 6 Tage lang zu funktionellen Neutrophilen differenziert wurden, wurden der Strahlung eines
          aktuellen und handelsüblichen Mobiltelefons eines führenden Markenherstellers mit einem SAR-Wert von
          0,76 W/kg ausgesetzt. Der Versuchsaufbau wurde so durchgeführt, dass zwei Kulturflaschen mit den Zellen auf
          dem Display des Mobiltelefons platziert wurden und zwei Kulturflaschen unter der Rückseite des Handys in der
          Nähe der Energiezellen und der Antenne platziert wurden. Es wurden drei unabhängige Experimente mit
          vierfachen Kulturflaschen durchgeführt. Die gesamte Einwirkungszeit des aktiv sendenden Mobiltelefons betrug
          4 Stunden bei 37 °C.
        </p>
        <img
          src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Abb.2-Kulturflaschen-1024x575.png_1.webp?v=1667513549"
          alt="Abb. 2 Versuchsaufbau Kulturflaschen"
          style={imgFullStyle}
        />
        <p style={captionStyle}>
          <strong>Abb. 2:</strong> Versuchsaufbau während der Belichtung mit vierfachen Proben, die auf dem Display des
          Mobiltelefons (= Strahlungsrichtung zum Benutzer hin) und unter der Rückabdeckung (= Strahlungsrichtung vom
          Benutzer weg) platziert werden. Die Positionen der Küvetten sind mit UL (oben links), UR (oben rechts), LL
          (unten links), LR (unten rechts) gekennzeichnet.
        </p>
        <p style={pStyle}>
          Wenn kein Schutz verwendet wurde, waren nur noch etwa 60,5 ± 3,9 % der Radikalbildung erhalten. Mit
          QiOne® 2 Pro geschützte Zellen zeigten eine deutlich geringere Reduktion der Superoxidanion-Radikalerzeugung
          an allen Positionen. Insgesamt wurde sie auf 84,7 ± 7,0 % reduziert, was fast 50 % besser als bei den
          ungeschützten Zellen ist. Der Unterschied war hoch signifikant (p ≤ 0,01).
        </p>
        <img
          src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Superoxidanion_Radikalbildung-Kopie-1024x602.jpg_1.webp?v=1667513066"
          alt="Abb. 3 Superoxidanion Radikalbildung"
          style={imgFullStyle}
        />
        <p style={captionStyle}>
          <strong>Abb. 3:</strong> Darstellung der Ergebnisse zur Superoxid-Anion-Radikalgenerierung durch funktionelle
          Neutrophile nach 4-stündiger Einwirkung der Strahlung eines aktiv sendenden Mobiltelefons ohne Schutz und
          nach Schutz durch QiOne® 2 Pro. Die unbehandelten Kontrollen sind als „100 %" eingestellt. **p ≤ 0,01 vs.
          unbehandelte Kontrolle; zweiseitiger Wilcoxon-Mann-Whitney-Test.
        </p>

        <h2 style={h2Style}>6. Zusammenfassung und Schlussfolgerungen</h2>
        <p style={pStyle}>
          Die vorliegende Studie mit kultivierten Zellen des angeborenen Immunsystems (sogenannte funktionelle
          Neutrophile) hat gezeigt, dass die Langzeitanwendung von QiOne® 2 Pro in der Lage ist, den basalen
          Zellstoffwechsel und die Superoxid-Anion-Radikalbildung dieser Zellen zu fördern. Dies könnte zu einer
          besseren Frontalabwehr gegen eindringende mikrobielle Krankheitserreger im Blutkreislauf führen. Darüber
          hinaus war QiOne® 2 Pro auch sehr effektiv bei der Inaktivierung von Handystrahlung. Aus unseren Ergebnissen
          kann der Einsatz von QiOne® 2 Pro sehr empfohlen werden.
        </p>
        <img
          src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Bildschirmfoto-2021-04-08-um-15_34_49-300x154_png.webp?v=1666946476"
          alt="Dartsch Scientific"
          style={imgCenterStyle}
        />
      </div>

      <hr style={{border: 'none', borderTop: '1px solid rgba(0,0,0,0.1)', margin: 0}} />

      {/* ── DARMZELLEN ── */}
      <div className="NormalSectionSize" style={{...sectionStyle, maxWidth: '900px',}}>
        <div style={{borderRadius: '16px', padding: '0'}}>
          <h2 id="darmzellen" style={{textAlign: 'center', ...h2Style}}>Zellstudie an Darmepithelzellen</h2>

          <a
            href="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/protective-effect-of-qionereg-2-pro-on-cultured-intestinal-epithelial-358_1.pdf?v=1679586513"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Studienvorschau_hellblau-1-957x1024_1.png?v=1732276143"
              alt="Studie Darmzellen"
              style={{...imgCenterStyle, maxWidth: '446px'}}
            />
          </a>

          <div style={{textAlign: 'center', margin: '1.25rem 0 2rem'}}>
            <a
              href="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/protective-effect-of-qionereg-2-pro-on-cultured-intestinal-epithelial-358_1.pdf?v=1667513844"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-block',
                background: 'var(--color-dark)',
                color: '#fff',
                padding: '0.7rem 2rem',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              Wissenschaftliche Publikation lesen
            </a>
          </div>

          <p style={pStyle}>
            Nachfolgend werden die Versuche an Darmzellen des Dartsch Scientific GmbH mit dem QiOne® 2 Pro dargestellt.
            Hier kannst du den{' '}
            <a
              href="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/protective-effect-of-qionereg-2-pro-on-cultured-intestinal-epithelial-358_1.pdf?v=1667513844"
              target="_blank"
              rel="noreferrer"
            >
              vollständigen Originalbericht
            </a>{' '}
            nachlesen.
          </p>

          <h3 style={h3Style}>Einführung</h3>
          <p style={pStyle}>
            <strong>Abkürzungen:</strong> TEER: Transepithelial Electrical Resistance (Transepithelialer elektrischer
            Widerstand)
          </p>
          <p style={pStyle}>
            Das Darmepithel mit einzelliger Schichtdicke hat zwei wesentliche Aufgaben. Die erste besteht darin, eine
            physische Barriere zu schaffen zwischen dem Inhalt des Darmlumens und dem Rest unseres Körpers. Die zweite
            ist die Sicherstellung einer effizienten Absorption von essentiellen Nährstoffen aus dem Darmlumen sowie
            die Produktion von Schleim, antimikrobiellen Peptiden und Zytokinen, die schützende und immunregulierende
            Eigenschaften besitzen. Daher kann eine verminderte Barrierefunktion weitreichende Folgen haben, nicht nur
            für den Darm, sondern auch für die systematische Gesundheit. Diese Barrierefunktion kann durch oxidativen
            Stress zerstört werden, wie beispielsweise durch Handystrahlung.
          </p>
          <p style={pStyle}>
            Es hat sich gezeigt, dass oxidativer Stress eine Schlüsselrolle bei den Ereignissen spielt, die zum Zelltod
            führen. Obwohl der Magen-Darm-Trakt in den Studien zur Mobilfunkstrahlung keine zentrale Rolle spielt, gibt
            es Artikel, die sich mit den Auswirkungen elektromagnetischer Strahlung auf den Darm befassen. Nach Angaben
            des Herstellers enthält das QiOne® 2 Pro Gerät einen Gitterchip, der ein statisches Feld bildet, das
            Wassermoleküle zum Übergang in den kohärenten Zustand anregt. In der vorliegenden In-vitro-Studie wurde
            untersucht, ob die Verwendung von QiOne® 2 Pro zu einer Schutzwirkung auf kultivierte Darmepithelzellen
            gegen Handystrahlung führen könnte.
          </p>

          <h3 style={h3Style}>Material und Methoden</h3>
          <p style={pStyle}>
            <strong>QiOne® 2 Pro Gerät:</strong> Das Gerät ist ein Gitterchip der zweiten Generation aus einer
            speziell entwickelten Goldlegierung mit achtfacher Stärke, der ein statisches Feld erzeugt, das
            Wassermoleküle dazu anregt, im Körper in einen kohärenten Zustand überzugehen.
          </p>
          <p style={pStyle}>
            <strong>Mobiltelefon:</strong> Es wurde ein aktuelles und handelsübliches Mobiltelefon mit einem SAR-Wert
            von 0,76 W/kg verwendet.
          </p>

          <h3 style={h3Style}>Kultivierung von Darmzellen</h3>
          <p style={pStyle}>
            Die hier vorgestellten Untersuchungen wurden mit IPEC-J2-Zellen (ACC-701; Leibniz Institut, DSMZ,
            Braunschweig, Deutschland) durchgeführt. Die Zellen wurden in Dulbecco's Modification of Eagles Medium
            (DMEM) mit 10 % Wachstumsmischung und 0,5 % Gentamycin gezüchtet und in einem Brutschrank bei 37 °C in
            einer Atmosphäre von 5 % CO₂ kultiviert. Für die Experimente wurden die Zellen aus 80–90 % konfluenten
            Massenkulturen entnommen.
          </p>

          <h3 style={h3Style}>Zellregeneration nach Handystrahlung</h3>
          <p style={pStyle}>
            Die Zellen wurden in einer Dichte von 100.000 Zellen/ml in die vier einzelnen Kompartimente eines
            4-Well-Kultureinsatzes aus Silikon ausgesät. Die einzelnen Kompartimente sind durch einen 500 µm dicken
            Silikonsteg getrennt, der einen ausgeprägten zellfreien Bereich (künstliche Wunde) bildet. Nach Erreichen
            der Konfluenz innerhalb von 48 Stunden wurden die Zellen der Strahlung eines aktiv sendenden Handys mit
            und ohne QiOne® 2 Pro für 4 Stunden bei 37 °C ausgesetzt. Nach 4 Stunden Bestrahlung wurden die Zellen
            weitere 8 Stunden im gleichen Kulturmedium inkubiert, dann mit Methanol fixiert und mit
            Giemsa-Azur-Eosin-Methylenblau-Lösung gefärbt und mit KI-Analyse (IKOSA AI Software) ausgewertet.
          </p>
          <img
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Bildschirmfoto-2021-12-07-um-20.08.19-1024x550.png_1.webp?v=1667542807"
            alt="Abb. 1 Versuchsaufbau Darmzellen"
            style={imgFullStyle}
          />
          <p style={captionStyle}>
            <strong>Abb. 1:</strong> Anordnung der Zellkulturschale, die auf dem Handydisplay platziert wurde
            (Strahlungsrichtung zum Benutzer), zusammen mit einem QiOne® 2 Pro Gerät auf der rechten Seite.
          </p>

          <h3 style={h3Style}>Transepithelialer elektrischer Widerstand (TEER) nach Handystrahlung</h3>
          <p style={pStyle}>
            IPEC-J2-Zellen wurden 5 Tage lang auf der Oberfläche einer 0,4 µm dicken porösen Membran (Transwell-Platte)
            gezüchtet. TEER wurde gemessen, indem eine Elektrode in das Kulturmedium des oberen Kompartiments und eine
            in das untere Kompartiment eingetaucht wurde. Für die Experimente wurden Epithelzellschichten mit einem
            elektrischen Widerstand von mindestens 2.000 Ω/cm² entnommen (intakte physikalische Barriere), und für
            4 Stunden bei 37 °C mit und ohne QiOne® 2 Pro der Mobilfunkstrahlung ausgesetzt. Als Referenz wurde der
            TEER der porösen Membranen ohne Zellbarriere mit 150 bis 180 Ω/cm² gemessen.
          </p>

          <img
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Bildschirmfoto-2021-12-07-um-20.15.51-888x1024.png_1.webp?v=1667542873"
            alt="Abb. 2 IPEC-J2 Zellen"
            style={imgFullStyle}
          />
          <p style={captionStyle}>
            <strong>Abb. 2:</strong> Originalaufnahmen sowie die Auswertung durch die IKOSA AI Software mit markierten
            berechneten Frontlinien der IPEC-J2 Zellen.{' '}
            <strong>(A)</strong> Unbehandelte Kontrolle.{' '}
            <strong>(B)</strong> Ungeschützte Zellen nach 4 Stunden Handystrahlung.{' '}
            <strong>(C)</strong> Durch QiOne® 2 Pro geschützte Zellen. Unbehandelte Kontrollzellen und mit QiOne® 2 Pro
            geschützte Zellen zeigen ein ähnliches Besiedlungsmuster.
          </p>

          <h2 style={{...h2Style, textAlign: 'center'}}>Ergebnisse</h2>

          <img
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Darmzellen_Abbildung_3.png_1.webp?v=1667543086"
            alt="Abb. 3 Zellregeneration"
            style={imgFullStyle}
          />
          <p style={captionStyle}>
            <strong>Abb. 3:</strong> Darstellung der Ergebnisse zur Zellregeneration nach 4-stündiger
            Mobiltelefon-Exposition. Unbehandelte Kontroll- und QiOne® 2 Pro-geschützte Zellen unterscheiden sich
            nicht voneinander, wohingegen ungeschützte Zellen einen signifikant höheren zellfreien Bereich aufweisen.
          </p>

          <h3 style={h3Style}>Regeneration der Zellen</h3>
          <p style={pStyle}>
            Wie in den Abbildungen 2 und 3 zu sehen ist, verursachte die Mobilfunkstrahlung eine Verringerung der
            Zellregenerationsaktivität, indem sie eine zellfreie Fläche hinterließ, die 43,7 ± 9,0 % im Vergleich zur
            gesamten kolonisierten Zellfläche betrug. Im Gegensatz dazu betrug die verbleibende zellfreie Fläche bei
            der unbehandelten Kontrolle nur 13,8 ± 2,6 % und bei den durch QiOne® 2 Pro geschützten Zellen
            14,5 ± 1,6 %. Der Unterschied zwischen den ungeschützten Zellen und den durch QiOne® 2 Pro geschützten
            Zellen war statistisch signifikant (p ≤ 0,01). Es gab keinen statistisch relevanten Unterschied zwischen
            den durch QiOne® 2 Pro geschützten Zellen und den Zellen, die überhaupt nicht der Mobilfunkstrahlung
            ausgesetzt waren.
          </p>

          <img
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Bildschirmfoto-2021-12-07-um-20.33.11-1024x733.png_1.webp?v=1667543097"
            alt="Abb. 4 Mikroskopische Aufnahmen"
            style={imgFullStyle}
          />
          <p style={captionStyle}>
            <strong>Abb. 4:</strong> Originalmikroskopische Aufnahmen von IPEC-J2-Zellen nach 4-stündiger Bestrahlung
            und 24-stündiger Kultivierung.{' '}
            <strong>(A)</strong> Unbehandelte Kontrolle.{' '}
            <strong>(B)</strong> Ungeschützte Zellen – Bruchstelle der Epithelbarriere sichtbar.{' '}
            <strong>(C)</strong> QiOne® 2 Pro geschützte Zellen – nahezu identisch mit der unbehandelten Kontrolle.
          </p>

          <h3 style={h3Style}>Transepithelialer elektrischer Widerstand (TEER)</h3>
          <p style={pStyle}>
            Für die ungeschützten Zellen wurde ein TEER-Wert von 152 ± 16 Ω/cm² gemessen, was den vollständigen
            Verlust der Barriere-Integrität belegt. Der TEER-Wert für die mit QiOne® 2 Pro geschützten Zellen betrug
            1.837 ± 349 Ω/cm² und für die unbehandelten Kontrollen 2.542 ± 389 Ω/cm². Der Unterschied zwischen
            geschützten und unbehandelten Zellen war statistisch nicht signifikant, während der Unterschied zu den
            ungeschützten Zellen hoch signifikant war (p ≤ 0,01).
          </p>

          <img
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Darmzellen_Abbildung_5.png_1.webp?v=1667543282"
            alt="Abb. 5 TEER Ergebnisse"
            style={imgFullStyle}
          />
          <p style={captionStyle}>
            <strong>Abb. 5:</strong> Darstellung der TEER-Ergebnisse nach 4-stündiger Mobiltelefon-Exposition. Unbehandelte
            Kontroll- und QiOne® 2 Pro-geschützte Zellen unterscheiden sich nicht voneinander, während ungeschützte
            Zellen einen signifikant verringerten TEER aufweisen.
          </p>

          <div style={{textAlign: 'center', marginTop: '2rem'}}>
            <a
              href="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/protective-effect-of-qionereg-2-pro-on-cultured-intestinal-epithelial-358_1.pdf?v=1667513844"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Bildschirmfoto-2021-04-08-um-15_34_49-300x154_png.webp?v=1666946476"
                alt="Dartsch Scientific"
                style={imgCenterStyle}
              />
            </a>
          </div>
        </div>
      </div>

      <hr style={{border: 'none', borderTop: '1px solid rgba(0,0,0,0.1)', margin: 0}} />

      {/* ── HRV-MESSUNGEN ── */}
      <div className="NormalSectionSize" style={{...sectionStyle, maxWidth: '900px'}}>
        <h2 id="hrv" style={h2Style}>HRV-Messungen</h2>
        <p style={pStyle}>
          Nachfolgend ist eine Versuchsreihe bzgl. der Einwirkungen von Qi Blanco Systemen auf Probanden dargestellt.
          Die Auswirkungen auf das vegetative Nervensystem sind durch die Herzratenvariabilitätsmessungen [HRV],
          ein hochauflösendes Elektrokardiogramm [EKG], dargestellt.
        </p>
        <p style={pStyle}>
          Die HRV-Messung gibt ein „biologisches HRV-Alter" aus, das das Alter des Körpers im Vergleich zum
          Durchschnittsmenschen widerspiegelt. Insgesamt wurden pro Proband 7 HRV-Messungen durchgeführt. Grafisch
          dargestellt sind folgende 3 Messungen:
        </p>
        <ul style={{lineHeight: '2', opacity: 0.88, marginBottom: '1.5rem', paddingLeft: '1.5rem'}}>
          <li>1. Messung: Verhalten des Körpers ohne zusätzlichen Stressor oder Qi Blanco Systemen</li>
          <li>2. Messung: Verhalten des Körpers mit einem zusätzlichen Stressor</li>
          <li>7. Messung: Verhalten des Körpers nach 1 Stunde Einwirkung durch den Stressor; Qi Blanco Systeme sind aktiv</li>
        </ul>

        <h3 style={h3Style}>1. Rangdiagramm</h3>
        <div style={thirdGridStyle}>
          <div>
            <p style={{fontSize: '0.9rem', opacity: 0.8}}>
              Messung 1 – Start<br />Stressor – inaktiv<br />Qi Blanco Systeme – inaktiv
            </p>
            <img src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/diagram_1-1-1024x883.jpg_1.webp?v=1667543752" alt="Rangdiagramm 1" style={imgFullStyle} />
            <p style={captionStyle}>biol. HRV-Alter (Kurzzeit-HRV): 56 Jahre</p>
          </div>
          <div>
            <p style={{fontSize: '0.9rem', opacity: 0.8}}>
              Messung 2 – nach 13 min<br />Stressor – aktiv<br />Qi Blanco Systeme – inaktiv
            </p>
            <img src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/diagram_2-1-1024x883.jpg_1.webp?v=1667543774" alt="Rangdiagramm 2" style={imgFullStyle} />
            <p style={captionStyle}>biol. HRV-Alter (Kurzzeit-HRV): 61 Jahre</p>
          </div>
          <div>
            <p style={{fontSize: '0.9rem', opacity: 0.8}}>
              Messung 7 – nach 60 min<br />Stressor – aktiv<br />Qi Blanco Systeme – aktiv
            </p>
            <img src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/diagram_3-1-1024x883.jpg_1.webp?v=1667543810" alt="Rangdiagramm 7" style={imgFullStyle} />
            <p style={captionStyle}>biol. HRV-Alter (Kurzzeit-HRV): 47 Jahre</p>
          </div>
        </div>
        <p style={pStyle}>
          Trotz WLAN-Signals (Stressor) aus einer Entfernung &lt; 1 m sank bei der Aktivierung der Qi Blanco Systeme
          das biol. HRV-Alter um 14 Jahre. Dies entspricht einer Reduktion um 23 % (Messung 2 / Messung 7).
        </p>

        <h3 style={h3Style}>2. Autonomes Nervensystem [ANS] Status</h3>
        <div style={thirdGridStyle}>
          <div>
            <p style={{fontSize: '0.9rem', opacity: 0.8}}>
              Messung 1 – Start<br />Stressor – inaktiv<br />Qi Blanco Systeme – inaktiv
            </p>
            <img src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/ANS_1.png_1.webp?v=1667543906" alt="ANS Status 1" style={imgFullStyle} />
          </div>
          <div>
            <p style={{fontSize: '0.9rem', opacity: 0.8}}>
              Messung 2 – nach 13 min<br />Stressor – aktiv<br />Qi Blanco Systeme – inaktiv
            </p>
            <img src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/ANS_2.png_1.webp?v=1667543930" alt="ANS Status 2" style={imgFullStyle} />
          </div>
          <div>
            <p style={{fontSize: '0.9rem', opacity: 0.8}}>
              Messung 7 – nach 60 min<br />Stressor – aktiv<br />Qi Blanco Systeme – aktiv
            </p>
            <img src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/ANS_3.png_1.webp?v=1667543973" alt="ANS Status 7" style={imgFullStyle} />
          </div>
        </div>
        <p style={pStyle}>
          Der ANS-Status verbessert sich im Vergleich zum Ausgangszustand, trotz Stressor, bei aktiven Qi Blanco
          Systemen um 20 %.
        </p>

        <h3 style={h3Style}>3. Versuchsaufbau</h3>
        <p style={{...pStyle, marginBottom: '0.5rem'}}><strong>3.1 Getestete Produkte:</strong></p>
        <p style={{...pStyle, marginBottom: '0.25rem'}}>3.1.1) Qi Blanco – QiOne endless</p>
        <p style={{...pStyle, marginBottom: '1rem'}}>3.1.2) Qi Blanco – QiOne Master Prototyp</p>

        <p style={{...pStyle, marginBottom: '0.5rem'}}><strong>3.2 Messequipment:</strong></p>
        <p style={{...pStyle, marginBottom: '0.25rem'}}>
          3.2.1) HF Hochfrequenz-Analyser: 59B-HF Analyser Gigahertz Solutions – 27 MHz – 25 000 MHz
        </p>
        <p style={{...pStyle, marginBottom: '1rem'}}>
          3.2.2) HRV-Messgerät: HRV-Scanner standard Professional – Software Version 3.02.05
        </p>

        <p style={{...pStyle, marginBottom: '0.5rem'}}><strong>3.3 Stressor:</strong></p>
        <p style={{...pStyle, marginBottom: '1rem'}}>
          WLAN-Router: NETGEAR WG602 – 54 Mbps / IEEE 802.11b/g / 2,412–2,472 GHz | Strahlungsintensität: &gt;20,00 µW/m² –
          befindet sich ca. 1 m Abstand auf Herzhöhe des Probanden.
        </p>

        <h3 style={h3Style}>4. Versuchsablauf</h3>
        <p style={pStyle}>Durchgeführt wurden insgesamt 7 Messungen. Testproband: männlich, 32 Jahre alt; Versuchsdauer: 1:11 h</p>
        <img
          src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Strahlung_Messung-1024x357.png_1_600x600.webp?v=1667544462"
          alt="Versuchsablauf HRV"
          style={imgCenterStyle}
        />
        <p style={pStyle}>
          Während der 1. Messung waren weder der Stressor noch die Qi Blanco Systeme im Einsatz. Der Stressor wurde ab
          der 2. Messung angeschaltet und kontinuierlich bis zur 7. Messung eingesetzt. Die Qi Blanco Systeme wurden
          während der 3., 4., 5. und 7. Messung eingesetzt.
        </p>

        <h3 style={h3Style}>5. Validierung</h3>
        <p style={pStyle}>Testproband: männlich, 43 Jahre alt; Versuchsdauer: 1:40 h</p>
        <img
          src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Strahlung_Messung_Validierung-1024x357.png_1_600x600.webp?v=1667544595"
          alt="Validierung HRV"
          style={imgCenterStyle}
        />
        <p style={pStyle}>
          <strong>Merkmale der Validierung:</strong>
        </p>
        <ol style={{lineHeight: '2', opacity: 0.88, marginBottom: '1.5rem', paddingLeft: '1.5rem'}}>
          <li>Die geringe HF-Band Funktion steigt kontinuierlich über die Versuchsdauer, bis sie ein Normalniveau von ca. 250 ms² erreicht.</li>
          <li>Die Deaktivierung der Qi Blanco Systeme in Versuchsreihe 6 zeigt in beiden Fällen einen sprungartigen Anstieg der Körperaktivitäten.</li>
          <li>Die Aktivierung des Stressors ist deutlich in den Aufzeichnungen zu erkennen. Der Körper wird stark beansprucht.</li>
          <li>Mit aktiven Qi Blanco Systemen verbessern sich die Körperfunktionen mit zunehmender Einwirkdauer.</li>
        </ol>
        <p style={pStyle}>Die Validierung ist somit erfolgreich.</p>

        <h3 style={h3Style}>6. Weiterführende Messungen</h3>
        <p style={pStyle}>Testproband: männlich, 32 Jahre alt; Versuchsdauer: 2:29 h</p>
        <img
          src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Strahlung_WeitereMessung-1024x319.png_1_600x600.webp?v=1667544753"
          alt="Weiterführende Messungen"
          style={imgCenterStyle}
        />

        <h3 style={h3Style}>Anmerkung zu den Versuchen</h3>
        <p style={pStyle}>
          Für weitere Fragen stehen wir unter{' '}
          <a href="mailto:info@qiblanco.com">info@qiblanco.com</a> zur Verfügung.
        </p>
        <p style={pStyle}>
          Wir möchten darauf hinweisen, dass es sich hierbei um Einzelnachweise handelt. Jeder Mensch ist
          unterschiedlich und die jeweiligen Auswirkungen dadurch individuell. Die hier dargestellten Versuche dienen
          der Möglichkeit, die Auswirkungen der Qi Blanco® Systeme auf den menschlichen Körper qualitativ einstufen
          zu können.
        </p>
      </div>

      {/* ── CTA ── */}
      <div
        style={{
          padding: '5rem 1.5rem',
        }}
      >
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
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qiblanco-com-qione-2-pro-transparent_1.webp?v=1666591476"
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
