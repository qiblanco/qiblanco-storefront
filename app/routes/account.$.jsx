import {redirect} from 'react-router';

// fallback wild card for all unauthenticated routes in account section
/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({context}) {
  await context.customerAccount.handleAuthStatus();

  return redirect('/account');
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('react-router').SerializeFrom<typeof loader>} LoaderReturnData */
