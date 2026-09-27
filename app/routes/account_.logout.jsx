import {redirect} from 'react-router';

// if we don't implement this, /account/logout will get caught by account.$.tsx to do login

export async function loader() {
  return redirect('/');
}

/**
 * @param {ActionFunctionArgs}
 */
export async function action({context}) {
  return context.customerAccount.logout();
}

/** @typedef {import('react-router').ActionFunctionArgs} ActionFunctionArgs */
/** @typedef {import('react-router').SerializeFrom<typeof loader>} LoaderReturnData */
/** @typedef {import('react-router').SerializeFrom<typeof action>} ActionReturnData */
