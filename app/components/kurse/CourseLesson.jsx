import {Link} from 'react-router';
import {ChevronRight, ChevronLeft} from 'lucide-react';
import {QiOneProductPricing} from '~/components/campaign/QiOneZellschutz';

/**
 * Shared layout for course lesson pages.
 * Renders the Shopify CMS body content with course navigation.
 *
 * @param {{
 *   title: string;
 *   body: string;
 *   nextLesson?: { label: string; to: string };
 *   prevLesson?: { label: string; to: string };
 *   courseTitle: string;
 *   courseTo: string;
 *   videoEmbed?: string;
 *   products?: Array<unknown>;
 * }} props
 */
export function CourseLesson({
  title,
  body,
  nextLesson,
  prevLesson,
  courseTitle,
  courseTo,
  videoEmbed,
  products,
}) {
  const preparedBody = prepareCourseBody(body, Boolean(videoEmbed));
  const hasProducts = Boolean(products?.length);

  return (
    <>
      <div
        className={`NormalSectionSize course-lesson ${
          hasProducts ? 'course-lesson--with-products' : ''
        }`}
      >
        <p className="course-lesson__breadcrumb">
          <Link to={courseTo}>
            <ChevronLeft size={14} /> {courseTitle}
          </Link>
        </p>

        <h1>{title}</h1>

        {videoEmbed && (
          <div className="course-lesson__video">
            <iframe
              src={videoEmbed}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        )}

        <div
          className="course-lesson-body"
          dangerouslySetInnerHTML={{__html: preparedBody}}
        />

        <div
          className={`course-lesson__nav ${
            prevLesson ? 'course-lesson__nav--split' : ''
          }`}
        >
          {prevLesson && (
            <Link
              to={prevLesson.to}
              prefetch="intent"
              className="btn--secondary"
            >
              <ChevronLeft size={18} /> {prevLesson.label}
            </Link>
          )}
          {nextLesson && (
            <Link
              to={nextLesson.to}
              prefetch="intent"
              className="btn--primary"
            >
              {nextLesson.label} <ChevronRight size={18} />
            </Link>
          )}
        </div>
      </div>

      {hasProducts ? <QiOneProductPricing products={products} /> : null}
    </>
  );
}

function prepareCourseBody(body = '', hasManagedVideo) {
  let preparedBody = body;

  if (hasManagedVideo) {
    preparedBody = preparedBody
      .replace(LEGACY_VIMEO_WRAPPER_PATTERN, '')
      .replace(LEGACY_VIMEO_IFRAME_PATTERN, '');
  }

  return preparedBody
    .replace(LEGACY_COURSE_NAV_PATTERN, '')
    .replace(QUESTION_LIST_PATTERN, (_, intro, attrs = '', items) => {
      const normalizedAttrs = attrs.trim();
      return `${intro}<ul class="course-lesson-question-list"${
        normalizedAttrs ? ` ${normalizedAttrs}` : ''
      }>${items}</ul>`;
    });
}

const LEGACY_VIMEO_WRAPPER_PATTERN =
  /<div\b[^>]*style=["'][^"']*padding:\s*70%[^"']*position:\s*relative[^"']*["'][^>]*>\s*<iframe\b(?=[^>]*(?:src|data-src)=["']https?:\/\/player\.vimeo\.com\/video\/)[\s\S]*?<\/iframe>\s*<\/div>/gi;

const LEGACY_VIMEO_IFRAME_PATTERN =
  /<iframe\b(?=[^>]*(?:src|data-src)=["']https?:\/\/player\.vimeo\.com\/video\/)[\s\S]*?<\/iframe>/gi;

const LEGACY_COURSE_NAV_PATTERN =
  /<div\b[^>]*class=["'][^"']*\btext-center\b[^"']*\bmt-10vh\b[^"']*["'][^>]*>\s*<a\b[^>]*class=["'][^"']*\bbtn\b[^"']*["'][^>]*>[\s\S]*?<\/a>\s*<\/div>/gi;

const QUESTION_LIST_PATTERN =
  /(<p\b[^>]*>[\s\S]*?findest du Antworten auf folgende Fragen:[\s\S]*?<\/p>)\s*<ol\b([^>]*)>([\s\S]*?)<\/ol>/gi;
