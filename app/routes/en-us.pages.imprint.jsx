import {UsDraftNotice} from '~/components/us/UsDraftNotice';
import usStyles from '~/styles/us.css?url';

/*
 * US-Imprint /en-us/pages/imprint — Vorabversion (Job 20260720-usa-seite-
 * auf-dach-basis-vorabversion s05). Konzept 1a Kap. 1/E4: Imprint bleibt
 * auf der US-Seite (Live-Bestand qi-blanco.com/pages/imprint, DDG haengt
 * am deutschen ANBIETER, nicht am Zielmarkt). Firmendaten 1:1 aus dem
 * Live-Imprint (curl 2026-07-20); Rechtsgrundlagen-Nennungen modernisiert
 * auf den Stand des DACH-Impressums (DDG § 5 statt TMG; § 18 Abs. 2 MStV
 * statt § 55 RStV; OS-Plattform-Hinweis aktualisiert — die Plattform wurde
 * 2025 eingestellt). Oeffentlich-Block-Stil, aber noindex (Vorab-Phase).
 */
export const handle = {htmlLang: 'en', layout: 'us'};

export function links() {
  return [{rel: 'stylesheet', href: usStyles}];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'Imprint | Qi Blanco'},
  {
    name: 'description',
    content:
      'Imprint (legal notice) of Qi Blanco UG (haftungsbeschränkt), Germany.',
  },
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

export default function UsImprintPage() {
  return (
    <div
      className="NormalSectionSize"
      style={{maxWidth: '860px', padding: '3rem 1.5rem 5rem'}}
    >
      <UsDraftNotice />
      <h1 style={{margin: '2rem 0 2.5rem'}}>Imprint</h1>

      <section style={{marginBottom: '2rem'}}>
        <h2>Information pursuant to § 5 DDG (German Digital Services Act)</h2>
        <p style={{marginTop: '0.5rem', lineHeight: '1.8'}}>
          Qi Blanco UG (haftungsbeschränkt)
          <br />
          Brunnrangenstr. 25
          <br />
          97711 Maßbach
          <br />
          Germany
        </p>
      </section>

      <section style={{marginBottom: '2rem'}}>
        <h2>Represented by</h2>
        <p style={{marginTop: '0.5rem', lineHeight: '1.8'}}>
          Managing Director: Dipl.-Ing. (FH) Christian Bernd Bauer
        </p>
      </section>

      <section style={{marginBottom: '2rem'}}>
        <h2>Contact</h2>
        <p style={{marginTop: '0.5rem', lineHeight: '1.8'}}>
          Email: <a href="mailto:info@qiblanco.com">info@qiblanco.com</a>
          <br />
          For a quick response, you can also reach us via the support chat on
          this website.
        </p>
      </section>

      <section style={{marginBottom: '2rem'}}>
        <h2>Register entry</h2>
        <p style={{marginTop: '0.5rem', lineHeight: '1.8'}}>
          Registered in the German Commercial Register.
          <br />
          Register court: Local Court (Amtsgericht) Schweinfurt
          <br />
          Registration number: HRB 7306
        </p>
      </section>

      <section style={{marginBottom: '2rem'}}>
        <h2>VAT identification number</h2>
        <p style={{marginTop: '0.5rem', lineHeight: '1.8'}}>
          VAT identification number pursuant to § 27a of the German VAT Act
          (Umsatzsteuergesetz): DE306530406
        </p>
      </section>

      <section style={{marginBottom: '2rem'}}>
        <h2>Responsible for content pursuant to § 18 (2) MStV</h2>
        <p style={{marginTop: '0.5rem', lineHeight: '1.8'}}>
          Christian Bernd Bauer, Brunnrangenstr. 25, 97711 Maßbach, Germany
        </p>
      </section>

      <section style={{marginBottom: '2rem'}}>
        <h2>Disclaimer</h2>

        <h3 style={{marginTop: '1.25rem', marginBottom: '0.4rem'}}>
          1. Content of this website
        </h3>
        <p style={{lineHeight: '1.8'}}>
          The author accepts no responsibility for the topicality,
          correctness, completeness, or quality of the information provided.
          Liability claims against the author relating to material or
          non-material damage caused by the use or non-use of the information
          provided, or by the use of incorrect or incomplete information, are
          excluded in principle, unless there is demonstrable intentional or
          grossly negligent fault on the part of the author.
        </p>

        <h3 style={{marginTop: '1.25rem', marginBottom: '0.4rem'}}>
          2. References and links
        </h3>
        <p style={{lineHeight: '1.8'}}>
          Despite careful control of the contents, we do not assume any
          liability for the contents of external links. The operators of the
          linked pages are solely responsible for the content of their pages.
          In the case of direct or indirect references to external websites
          that are outside our area of responsibility, a liability obligation
          would only come into force if we were aware of the contents and it
          were technically possible and reasonable for us to prevent the use
          of illegal contents.
        </p>

        <h3 style={{marginTop: '1.25rem', marginBottom: '0.4rem'}}>
          3. Copyright and trademark law
        </h3>
        <p style={{lineHeight: '1.8'}}>
          The author endeavors to observe the copyrights of the graphics,
          audio documents, video sequences, and texts used in all
          publications, to use self-created materials, or to rely on
          license-free materials. All brand names and trademarks mentioned on
          this website, including those protected by third parties, are
          subject without restriction to the provisions of the applicable
          trademark law and the ownership rights of the respective registered
          owners.
        </p>

        <h3 style={{marginTop: '1.25rem', marginBottom: '0.4rem'}}>
          4. Data protection
        </h3>
        <p style={{lineHeight: '1.8'}}>
          Information on the processing of personal data can be found in our{' '}
          <a href="/en-us/pages/privacy-policy">Privacy Policy</a>. Where this
          website offers the possibility of entering personal or business
          data (email addresses, names, addresses), the disclosure of this
          data takes place on an expressly voluntary basis.
        </p>

        <h3 style={{marginTop: '1.25rem', marginBottom: '0.4rem'}}>
          5. Legal effect of this disclaimer
        </h3>
        <p style={{lineHeight: '1.8'}}>
          This disclaimer is to be regarded as part of the website from which
          reference was made to this page. If sections or individual terms of
          this statement are not, no longer, or not completely in accordance
          with the applicable legal situation, the remaining parts of the
          document remain unaffected in their content and validity.
        </p>
      </section>

      <section style={{marginBottom: '2rem'}}>
        <h2>Consumer dispute resolution</h2>
        <p style={{marginTop: '0.5rem', lineHeight: '1.8'}}>
          We are neither willing nor obliged to participate in dispute
          resolution proceedings before a consumer arbitration board. Note:
          the online dispute resolution (ODR) platform formerly operated by
          the European Commission was discontinued on July 20, 2025 and is no
          longer available.
        </p>
      </section>

      <section>
        <h2>Scientific note</h2>
        <p style={{marginTop: '0.5rem', lineHeight: '1.8'}}>
          The technology distributed by Qi Blanco does not correspond to
          conventional scientific understanding and does not replace
          consultation with a physician or health practitioner.
        </p>
      </section>
    </div>
  );
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
