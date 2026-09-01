import {CUSTOMER_UPDATE_MUTATION} from '~/graphql/customer-account/CustomerUpdateMutation';
import {data} from '@shopify/remix-oxygen';
import {
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router';
import {
  KontoAbschnitt,
  KontoErfolg,
  KontoFehler,
} from '~/components/konto/KontoUI';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: 'Profil | Qi Blanco'}];
};

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({context}) {
  await context.customerAccount.handleAuthStatus();

  return {};
}

/**
 * @param {ActionFunctionArgs}
 */
export async function action({request, context}) {
  const {customerAccount} = context;

  if (request.method !== 'PUT') {
    return data(
      {error: 'Das hat so nicht geklappt. Bitte versuch es noch einmal.'},
      {status: 405},
    );
  }

  const form = await request.formData();

  try {
    const customer = {};
    const validInputKeys = ['firstName', 'lastName'];
    for (const [key, value] of form.entries()) {
      if (!validInputKeys.includes(key)) {
        continue;
      }
      if (typeof value === 'string' && value.length) {
        customer[key] = value;
      }
    }

    // update customer and possibly password
    const {data, errors} = await customerAccount.mutate(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {
          customer,
        },
      },
    );

    if (errors?.length) {
      throw new Error(errors[0].message);
    }

    if (!data?.customerUpdate?.customer) {
      throw new Error(
        'Deine Änderung konnte gerade nicht gespeichert werden. Bitte versuch es in einem Moment noch einmal.',
      );
    }

    return {
      error: null,
      customer: data?.customerUpdate?.customer,
    };
  } catch (error) {
    return data(
      {error: error.message, customer: null},
      {
        status: 400,
      },
    );
  }
}

export default function AccountProfile() {
  const account = useOutletContext();
  const {state} = useNavigation();
  /** @type {ActionReturnData} */
  const action = useActionData();
  const customer = action?.customer ?? account?.customer;
  const gespeichert = Boolean(action && !action.error && action.customer);

  return (
    <KontoAbschnitt
      titel="Dein Profil"
      beschreibung="Dein Name steht auf Bestellbestätigungen und Lieferscheinen."
    >
      <div className="konto-karte">
        <Form className="konto-form" method="PUT">
          <div className="konto-form__paar">
            <label htmlFor="firstName">
              <span>Vorname</span>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Vorname"
                aria-label="Vorname"
                defaultValue={customer?.firstName ?? ''}
                minLength={2}
              />
            </label>

            <label htmlFor="lastName">
              <span>Nachname</span>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Nachname"
                aria-label="Nachname"
                defaultValue={customer?.lastName ?? ''}
                minLength={2}
              />
            </label>
          </div>

          <KontoFehler>{action?.error}</KontoFehler>
          {gespeichert ? (
            <KontoErfolg>Gespeichert.</KontoErfolg>
          ) : null}

          <div className="konto-form__knoepfe">
            <button
              className="konto-cta konto-cta--breit"
              type="submit"
              disabled={state !== 'idle'}
            >
              {state !== 'idle' ? 'Wird gespeichert …' : 'Speichern'}
            </button>
          </div>
        </Form>
      </div>
    </KontoAbschnitt>
  );
}

/**
 * @typedef {{
 *   error: string | null;
 *   customer: CustomerFragment | null;
 * }} ActionResponse
 */

/** @typedef {import('customer-accountapi.generated').CustomerFragment} CustomerFragment */
/** @typedef {import('@shopify/hydrogen/customer-account-api-types').CustomerUpdateInput} CustomerUpdateInput */
/** @typedef {import('@shopify/remix-oxygen').ActionFunctionArgs} ActionFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof action>} ActionReturnData */
