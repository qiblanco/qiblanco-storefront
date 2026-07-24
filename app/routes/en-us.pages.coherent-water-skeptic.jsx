import {Link} from 'react-router';
import {StarRating, GOOGLE_REVIEWS_URL} from '~/components/reusables/StarRating';
import usStyles from '~/styles/us.css?url';

/*
 * LP-US-1 /en-us/pages/coherent-water-skeptic — Skeptic-Frame (Vorab-
 * version, Job 20260720-usa-seite-auf-dach-basis-vorabversion s05, SOLL 8;
 * mp6-KONZEPT Kap. 3: Rang 1 "Mechanismus im Skeptic-Frame", P0-Scores
 * 100/93,8).
 *
 * CLAIMS-REGELN (mp6 Kap. 3.3, hart):
 * - "coherent water" NIE als Tatsachenbehauptung — Frame ist durchgehend
 *   "proprietaere Technologie + Studienlage + Nutzererfahrung".
 * - KEINE E-Smog-/EMF-Schutz-Claims (E-Smog-Perspektive zurueckgestellt,
 *   FTC-Risiko); Studien werden nur mit ihren publizierten Titeln/
 *   Endpunkten zitiert.
 * - Kein Disease-Claim; General-Wellness-Korridor (Schlaf/Stress/
 *   Wohlbefinden), Erwartungs-Disclosure statt Heilsversprechen.
 * - FORMAT-REGEL (heilig): KURZ-/MITTELFORMAT => KEIN Preis, KEINE harte
 *   Kauf-CTA — nur weiche CTA auf die QiOne-LP-Shopseite.
 */
export const handle = {htmlLang: 'en', layout: 'us'};

export function links() {
  return [{rel: 'stylesheet', href: usStyles}];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'I Thought This Was Woo-Woo — Then I Read the Studies | Qi Blanco'},
  {
    name: 'description',
    content:
      'A skeptic’s guide to the QiOne® 2 Pro: what the GitterChip™ technology is designed to do, what peer-reviewed cell studies measured, and what users report.',
  },
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

const pStyle = {lineHeight: '1.8'};

export default function UsSkepticLpPage() {
  return (
    <div className="home">
      <div className="NormalSectionSize" data-section="skeptic-hero">
        <h1 className="text-center">
          “I thought this was woo-woo.
          <br />
          Then I read the studies.”
        </h1>
        <p
          className="text-center"
          style={{...pStyle, maxWidth: '720px', margin: '1rem auto'}}
        >
          You are right to be skeptical. A gold pendant that is supposed to
          influence how you feel? We would not believe it either — which is
          why we spent six years putting the technology through controlled,
          peer-reviewed cell studies instead of asking you to take our word
          for it.
        </p>
      </div>

      <div className="NormalSectionSize" data-section="skeptic-questions">
        <h2 className="text-center">The three questions every skeptic asks</h2>
        <div className="flex-container flex-row small--flex-column flex-align-start flex-justify-space-between g-50p mt-3">
          <div>
            <h3>1. What is it, physically?</h3>
            <p style={pStyle}>
              The QiOne® 2 Pro is not an electronic device. Its core is the
              GitterChip™ — a proprietary lattice of gold atoms, engineered
              and manufactured in Germany. The specific atomic positioning
              creates a static field. No batteries, no charging, no app.
            </p>
          </div>
          <div>
            <h3>2. What is it designed to do?</h3>
            <p style={pStyle}>
              Water molecules can arrange in a more ordered,
              liquid-crystalline state. The GitterChip™ is designed to
              support this transition. Since water makes up a significant
              portion of your body, this is the lever the technology aims at
              — an approach we test on human cells, not just in marketing
              copy.
            </p>
          </div>
          <div>
            <h3>3. Where is the evidence?</h3>
            <p style={pStyle}>
              In peer-reviewed publications (2021–2024), controlled cell
              studies measured, among other endpoints, a 75.0% reduction in
              cell strain caused by oxidative stress and a 10-fold
              improvement of the cell barrier function (TEER value). Cell
              studies are not clinical outcome studies — we say so openly.
            </p>
          </div>
        </div>
      </div>

      <div className="NormalSectionSize text-center" data-section="skeptic-evidence">
        <h2>What we claim — and what we do not</h2>
        <div
          className="text-left"
          style={{maxWidth: '760px', margin: '1rem auto'}}
        >
          <p style={pStyle}>
            <b>We claim:</b> the GitterChip™ technology is studied in
            peer-reviewed cell research with measured endpoints, and many of
            our more than 14,000 users report better sleep, more energy, and
            a calmer daily baseline.
          </p>
          <p style={pStyle}>
            <b>We do not claim:</b> that it diagnoses, treats, cures, or
            prevents any disease — it does not. It is a wellness product.
            Individual experiences vary; some users feel a difference within
            days, others only notice it when they take it off.
          </p>
          <p style={pStyle}>
            <b>Your safety net:</b> a 14-day “no questions asked” return
            policy. If you do not notice anything, send it back — with a
            prepaid, insured return label.
          </p>
        </div>
      </div>

      <div className="NormalSectionSize" data-section="skeptic-voices">
        <h2 className="text-center">What skeptical users say</h2>
        <p className="text-center">
          <strong>
            4.7{' '}
            <a
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{textDecoration: 'none'}}
              aria-label="4.7 out of 5 stars — see Google reviews for Qi Blanco"
            >
              <StarRating value={4.7} />
            </a>
          </strong>
        </p>
        <div className="flex-container flex-row small--flex-column flex-align-start flex-justify-space-between g-50p mt-3">
          <div>
            <p style={pStyle}>
              “Of course, it’s all difficult to say with so many different
              influencing factors in everyday life. But in some indescribable
              way, something feels different. […] I sleep incredibly deeply
              and feel noticeably calm after waking up.”
            </p>
            <p className="micro-text mt-1">
              <strong>Melanie M.</strong>
            </p>
          </div>
          <div>
            <p style={pStyle}>
              “On my Garmin watch, I have noticed impressively that my oxygen
              saturation is higher than before. […] I dream a lot and can
              remember the content of my dreams better. And all this has
              already improved in the first few days.”
            </p>
            <p className="micro-text mt-1">
              <strong>Sandra J.</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="NormalSectionSize text-center" data-section="skeptic-cta">
        <h2>Still skeptical? Good. Look at the details.</h2>
        <p style={{...pStyle, maxWidth: '640px', margin: '0.75rem auto'}}>
          Read what the QiOne® 2 Pro is, what the studies measured, and what
          ordering risk-free looks like — then decide for yourself.
        </p>
        <Link
          className="btn--secondary m-center mt-2"
          prefetch="intent"
          to="/en-us/pages/qione-2-pro"
        >
          See the QiOne® 2 Pro
        </Link>
      </div>
    </div>
  );
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
