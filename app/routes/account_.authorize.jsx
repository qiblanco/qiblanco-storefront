/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({context}) {
  return context.customerAccount.authorize();
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('react-router').SerializeFrom<typeof loader>} LoaderReturnData */
