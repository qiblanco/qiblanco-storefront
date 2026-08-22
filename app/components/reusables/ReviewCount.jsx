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
    <SterneSprung className="ReviewCount">
      {reviewCount} <StarRating value={reviewCount} size={16} />
    </SterneSprung>
  );
}
