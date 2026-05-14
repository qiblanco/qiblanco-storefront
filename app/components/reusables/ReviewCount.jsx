import {useEffect, useState} from 'react';

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

  return (
    <span className="ReviewCount">
      {reviewCount} {'★'.repeat(5)}
    </span>
  );
}
