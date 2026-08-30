import {useEffect, useState} from 'react';
import {StarRating, SterneSprung} from '~/components/reusables/StarRating';

export function ReviewCount() {
  const [reviewCount, setReviewCount] = useState(4.7);

  useEffect(() => {
    let mounted = true;

    fetch('https://qiblanco-only-rating-serpapi.vercel.app/api/getLatestRun')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        return response.json();
      })
      .then((data) => {
        if (mounted && data.totalScore !== undefined) {
          setReviewCount(data.totalScore);
        }
      })
      .catch(() => {
        if (mounted) {
          setReviewCount(4.7);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Migration 2026-08-22 (Job 20260820-wurzel-sterne-klick-scroll, s03):
   * Diese Zeile war die live gemessene TOTE Sterne-Ansicht der Startseite
   * (HerobannerFeatured, top_doc=345) — Sterne ohne Link, ohne Klickziel.
   *
   * Zwei Aenderungen: die literalen ★-Glyphen weichen der geteilten
   * StarRating-Komponente (EIN Renderort), und die ganze Zeile wird über
   * SterneSprung zum bedienbaren Sprung-Ausloeser. Die Klasse `ReviewCount`
   * bleibt erhalten — sie trägt die Optik.
   */
  return (
    /*
     * MERGE 2026-08-30 (Job 20260830-sterne-s05-...): hier trafen zwei Baeume
     * aufeinander, die DASSELBE wollten. origin/main (e4f5e11, "Sterne-Farbe
     * aus EINER Quelle") wickelte die ★-Glyphen in <span class="qb-sterne">,
     * damit sie nicht mehr die Elternfarbe erben (#F2BF72/#856828/#eabb6e
     * liefen auseinander). Dieser Zweig ersetzt die Glyphen durch die geteilte
     * SVG-StarRating — und die trägt ihre Farbe bereits aus derselben Quelle
     * (app.css: .star-rating svg path { fill: var(--qb-sterne-gold) }).
     *
     * Die Farb-Absicht von main ist damit ERFUELLT, nicht uebergangen: der
     * Wrapper .qb-sterne ist ausschließlich für GLYPH-Sterne gebaut und
     * wäre hier wirkungslos (ein SVG erbt keine color). Mains zweite
     * Beobachtung gilt unveraendert und wird hier festgehalten: nur die
     * STERNE tragen die Sterne-Farbe, die ZAHL behaelt die Farbe ihres
     * Kontexts. Genau das leistet diese Form.
     */
    <SterneSprung className="ReviewCount">
      {reviewCount} <StarRating value={reviewCount} size={16} />
    </SterneSprung>
  );
}
