import {getSitemap} from '@shopify/hydrogen';

const HIDDEN_PRODUCT_HANDLES = [
  'bundle-fundament',
  'bundle-unabhangig',
  'bundle-erholungs-residenz',
];

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({request, params, context: {storefront}}) {
  const response = await getSitemap({
    storefront,
    request,
    params,
    locales: ['EN-US', 'EN-CA', 'FR-CA'],
    getLink: ({type, baseUrl, handle, locale}) => {
      if (!locale) return `${baseUrl}/${type}/${handle}`;
      return `${baseUrl}/${locale}/${type}/${handle}`;
    },
  });

  if (params.type !== 'products') {
    response.headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);
    return response;
  }

  const body = (await response.text()).replace(
    /<url>[\s\S]*?<\/url>/g,
    (urlEntry) =>
      HIDDEN_PRODUCT_HANDLES.some((handle) =>
        urlEntry.includes(`/products/${handle}`),
      )
        ? ''
        : urlEntry,
  );

  const headers = new Headers(response.headers);
  headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);

  return new Response(body, {
    status: response.status,
    headers,
  });
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
