export async function loadCourseProducts(context) {
  const data = await context.storefront.query(COURSE_PRODUCTS_QUERY, {
    cache: context.storefront.CacheShort(),
  });

  return [data.qione, data.bracelet, data.qihome]
    .filter(Boolean)
    .map((product) => ({
      ...product,
      images: product.images?.nodes || [],
    }));
}

const COURSE_PRODUCTS_QUERY = `#graphql
  fragment CourseProduct on Product {
    handle
    title
    featuredImage {
      url
      altText
    }
    images(first: 1) {
      nodes {
        url
        altText
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 1) {
      nodes {
        compareAtPrice {
          amount
          currencyCode
        }
      }
    }
  }

  query CourseProducts {
    qione: product(handle: "qione-2-pro") {
      ...CourseProduct
    }
    bracelet: product(handle: "qibracelet") {
      ...CourseProduct
    }
    qihome: product(handle: "qihome-air") {
      ...CourseProduct
    }
  }
`;
