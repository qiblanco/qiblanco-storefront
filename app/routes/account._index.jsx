import {redirect} from 'react-router';

export async function loader() {
  return redirect('/account/orders');
}

/** @typedef {import('react-router').SerializeFrom<typeof loader>} LoaderReturnData */
