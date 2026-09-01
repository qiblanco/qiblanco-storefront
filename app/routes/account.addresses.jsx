import {data} from '@shopify/remix-oxygen';
import {
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router';
import {
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  CREATE_ADDRESS_MUTATION,
} from '~/graphql/customer-account/CustomerAddressMutations';
import {
  AdressLese,
  KontoAbschnitt,
  KontoFehler,
  KontoLeer,
} from '~/components/konto/KontoUI';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: 'Adressen | Qi Blanco'}];
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

  try {
    const form = await request.formData();

    const addressId = form.has('addressId')
      ? String(form.get('addressId'))
      : null;
    if (!addressId) {
      throw new Error('Wir konnten die Adresse nicht zuordnen. Bitte lade die Seite neu.');
    }

    // this will ensure redirecting to login never happen for mutatation
    const isLoggedIn = await customerAccount.isLoggedIn();
    if (!isLoggedIn) {
      return data(
        {error: {[addressId]: 'Deine Sitzung ist abgelaufen. Bitte melde dich neu an.'}},
        {
          status: 401,
        },
      );
    }

    const defaultAddress = form.has('defaultAddress')
      ? String(form.get('defaultAddress')) === 'on'
      : false;
    const address = {};
    const keys = [
      'address1',
      'address2',
      'city',
      'company',
      'territoryCode',
      'firstName',
      'lastName',
      'phoneNumber',
      'zoneCode',
      'zip',
    ];

    for (const key of keys) {
      const value = form.get(key);
      if (typeof value === 'string') {
        address[key] = value;
      }
    }

    switch (request.method) {
      case 'POST': {
        // handle new address creation
        try {
          const {data, errors} = await customerAccount.mutate(
            CREATE_ADDRESS_MUTATION,
            {
              variables: {address, defaultAddress},
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressCreate?.userErrors?.length) {
            throw new Error(data?.customerAddressCreate?.userErrors[0].message);
          }

          if (!data?.customerAddressCreate?.customerAddress) {
            throw new Error('Die Adresse konnte gerade nicht gespeichert werden. Bitte versuch es in einem Moment noch einmal.');
          }

          return {
            error: null,
            createdAddress: data?.customerAddressCreate?.customerAddress,
            defaultAddress,
          };
        } catch (error) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      case 'PUT': {
        // handle address updates
        try {
          const {data, errors} = await customerAccount.mutate(
            UPDATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                addressId: decodeURIComponent(addressId),
                defaultAddress,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressUpdate?.userErrors?.length) {
            throw new Error(data?.customerAddressUpdate?.userErrors[0].message);
          }

          if (!data?.customerAddressUpdate?.customerAddress) {
            throw new Error('Deine Änderung konnte gerade nicht gespeichert werden. Bitte versuch es in einem Moment noch einmal.');
          }

          return {
            error: null,
            updatedAddress: address,
            defaultAddress,
          };
        } catch (error) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      case 'DELETE': {
        // handles address deletion
        try {
          const {data, errors} = await customerAccount.mutate(
            DELETE_ADDRESS_MUTATION,
            {
              variables: {addressId: decodeURIComponent(addressId)},
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressDelete?.userErrors?.length) {
            throw new Error(data?.customerAddressDelete?.userErrors[0].message);
          }

          if (!data?.customerAddressDelete?.deletedAddressId) {
            throw new Error('Die Adresse konnte gerade nicht gelöscht werden. Bitte versuch es in einem Moment noch einmal.');
          }

          return {error: null, deletedAddress: addressId};
        } catch (error) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      default: {
        return data(
          {error: {[addressId]: 'Das hat so nicht geklappt. Bitte versuch es noch einmal.'}},
          {
            status: 405,
          },
        );
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      return data(
        {error: error.message},
        {
          status: 400,
        },
      );
    }
    return data(
      {error},
      {
        status: 400,
      },
    );
  }
}

export default function Addresses() {
  const {customer} = useOutletContext();
  const {defaultAddress, addresses} = customer;
  const hatAdressen = Boolean(addresses?.nodes?.length);

  // DEFEKT DES SCAFFOLDS, hier behoben: das Anlege-Formular lag im ELSE-Zweig
  // von `!addresses.nodes.length`. Wer noch keine Adresse gespeichert hatte,
  // sah also NUR den Satz "Du hast noch keine Adresse gespeichert." und hatte
  // keine Möglichkeit, seine erste anzulegen — genau der Kunde, der das
  // Formular am dringendsten braucht, kam nie daran. Das Anlegen steht jetzt
  // in BEIDEN Fällen zur Verfügung.
  return (
    <KontoAbschnitt
      titel="Deine Adressen"
      beschreibung="An diese Adressen liefern wir. Du kannst eine davon als Standard festlegen."
    >
      {hatAdressen ? (
        <ExistingAddresses
          addresses={addresses}
          defaultAddress={defaultAddress}
        />
      ) : (
        <KontoLeer text="Du hast noch keine Adresse gespeichert. Leg unten deine erste an — dann geht die nächste Bestellung schneller." />
      )}

      <details className="konto-aufklappen">
        <summary>Neue Adresse hinzufügen</summary>
        <div className="konto-aufklappen__inhalt">
          <div className="konto-karte">
            <NewAddressForm />
          </div>
        </div>
      </details>
    </KontoAbschnitt>
  );
}

function NewAddressForm() {
  const newAddress = {
    address1: '',
    address2: '',
    city: '',
    company: '',
    territoryCode: '',
    firstName: '',
    id: 'new',
    lastName: '',
    phoneNumber: '',
    zoneCode: '',
    zip: '',
  };

  return (
    <AddressForm
      addressId={'NEW_ADDRESS_ID'}
      address={newAddress}
      defaultAddress={null}
    >
      {({stateForMethod}) => (
        <div className="konto-form__knoepfe">
          <button
            className="konto-cta konto-cta--breit"
            disabled={stateForMethod('POST') !== 'idle'}
            formMethod="POST"
            type="submit"
          >
            {stateForMethod('POST') !== 'idle'
              ? 'Wird angelegt …'
              : 'Adresse speichern'}
          </button>
        </div>
      )}
    </AddressForm>
  );
}

/**
 * @param {Pick<CustomerFragment, 'addresses' | 'defaultAddress'>}
 */
function ExistingAddresses({addresses, defaultAddress}) {
  return (
    <div>
      {addresses.nodes.map((address) => (
        <div className="konto-karte" key={address.id}>
          <AdressLese
            name={[address.firstName, address.lastName]
              .filter(Boolean)
              .join(' ')}
            zeilen={[
              address.company,
              [address.address1, address.address2].filter(Boolean).join(', '),
              [address.zip, address.city].filter(Boolean).join(' '),
              address.territoryCode,
            ]}
            istStandard={defaultAddress?.id === address.id}
          />

          <details className="konto-aufklappen">
            <summary>Adresse bearbeiten</summary>
            <div className="konto-aufklappen__inhalt">
              <AddressForm
                addressId={address.id}
                address={address}
                defaultAddress={defaultAddress}
              >
                {({stateForMethod}) => (
                  <div className="konto-form__knoepfe">
                    <button
                      className="konto-cta"
                      disabled={stateForMethod('PUT') !== 'idle'}
                      formMethod="PUT"
                      type="submit"
                    >
                      {stateForMethod('PUT') !== 'idle'
                        ? 'Wird gespeichert …'
                        : 'Speichern'}
                    </button>
                    <button
                      className="konto-cta konto-cta--gefahr"
                      disabled={stateForMethod('DELETE') !== 'idle'}
                      formMethod="DELETE"
                      type="submit"
                    >
                      {stateForMethod('DELETE') !== 'idle'
                        ? 'Wird gelöscht …'
                        : 'Löschen'}
                    </button>
                  </div>
                )}
              </AddressForm>
            </div>
          </details>
        </div>
      ))}
    </div>
  );
}

/**
 * @param {{
 *   addressId: AddressFragment['id'];
 *   address: CustomerAddressInput;
 *   defaultAddress: CustomerFragment['defaultAddress'];
 *   children: (props: {
 *     stateForMethod: (method: 'PUT' | 'POST' | 'DELETE') => Fetcher['state'];
 *   }) => React.ReactNode;
 * }}
 */
export function AddressForm({addressId, address, defaultAddress, children}) {
  const {state, formMethod} = useNavigation();
  /** @type {ActionReturnData} */
  const action = useActionData();
  const error = action?.error?.[addressId];
  const isDefaultAddress = defaultAddress?.id === addressId;
  // Die Formularschlüssel (name=, id=, htmlFor=, autoComplete=, pattern=)
  // bleiben bytegleich zum Bestand — sie sind der Vertrag mit der Customer
  // Account API und mit der Autofill-Erkennung des Browsers. Geändert ist
  // ausschließlich die Hülle: label>span statt label-neben-input, damit
  // Beschriftung und Feld ein Paar bilden (Muster app.css .withdrawal-form).
  return (
    <Form className="konto-form" id={addressId}>
      <input type="hidden" name="addressId" defaultValue={addressId} />

      <div className="konto-form__paar">
        <label htmlFor="firstName">
          <span>Vorname</span>
          <input
            aria-label="Vorname"
            autoComplete="given-name"
            defaultValue={address?.firstName ?? ''}
            id="firstName"
            name="firstName"
            placeholder="Vorname"
            required
            type="text"
          />
        </label>

        <label htmlFor="lastName">
          <span>Nachname</span>
          <input
            aria-label="Nachname"
            autoComplete="family-name"
            defaultValue={address?.lastName ?? ''}
            id="lastName"
            name="lastName"
            placeholder="Nachname"
            required
            type="text"
          />
        </label>
      </div>

      <label htmlFor="company">
        <span>Firma (optional)</span>
        <input
          aria-label="Firma"
          autoComplete="organization"
          defaultValue={address?.company ?? ''}
          id="company"
          name="company"
          placeholder="Firma"
          type="text"
        />
      </label>

      <label htmlFor="address1">
        <span>Straße und Hausnummer</span>
        <input
          aria-label="Straße und Hausnummer"
          autoComplete="address-line1"
          defaultValue={address?.address1 ?? ''}
          id="address1"
          name="address1"
          placeholder="Musterstraße 1"
          required
          type="text"
        />
      </label>

      <label htmlFor="address2">
        <span>Adresszusatz (optional)</span>
        <input
          aria-label="Adresszusatz"
          autoComplete="address-line2"
          defaultValue={address?.address2 ?? ''}
          id="address2"
          name="address2"
          placeholder="Wohnung, Etage, c/o"
          type="text"
        />
      </label>

      <div className="konto-form__paar">
        <label htmlFor="zip">
          <span>Postleitzahl</span>
          <input
            aria-label="Postleitzahl"
            autoComplete="postal-code"
            defaultValue={address?.zip ?? ''}
            id="zip"
            name="zip"
            placeholder="10115"
            required
            type="text"
          />
        </label>

        <label htmlFor="city">
          <span>Stadt</span>
          <input
            aria-label="Stadt"
            autoComplete="address-level2"
            defaultValue={address?.city ?? ''}
            id="city"
            name="city"
            placeholder="Berlin"
            required
            type="text"
          />
        </label>
      </div>

      <div className="konto-form__paar">
        <label htmlFor="zoneCode">
          <span>Bundesland</span>
          <input
            aria-label="Bundesland / Provinz"
            autoComplete="address-level1"
            defaultValue={address?.zoneCode ?? ''}
            id="zoneCode"
            name="zoneCode"
            placeholder="Berlin"
            required
            type="text"
          />
        </label>

        <label htmlFor="territoryCode">
          <span>Länderkürzel</span>
          <input
            aria-label="Länderkürzel"
            autoComplete="country"
            defaultValue={address?.territoryCode ?? ''}
            id="territoryCode"
            name="territoryCode"
            placeholder="DE"
            required
            type="text"
            maxLength={2}
          />
        </label>
      </div>

      <label htmlFor="phoneNumber">
        <span>Telefon (optional, für Rückfragen zur Lieferung)</span>
        <input
          aria-label="Telefonnummer"
          autoComplete="tel"
          defaultValue={address?.phoneNumber ?? ''}
          id="phoneNumber"
          name="phoneNumber"
          placeholder="+49 30 1234567"
          pattern="^\+?[1-9]\d{3,14}$"
          type="tel"
        />
      </label>

      <div className="konto-form__schalter">
        <input
          defaultChecked={isDefaultAddress}
          id="defaultAddress"
          name="defaultAddress"
          type="checkbox"
        />
        <label htmlFor="defaultAddress">Als Standardadresse verwenden</label>
      </div>

      <KontoFehler>{error}</KontoFehler>

      {children({
        stateForMethod: (method) => (formMethod === method ? state : 'idle'),
      })}
    </Form>
  );
}

/**
 * @typedef {{
 *   addressId?: string | null;
 *   createdAddress?: AddressFragment;
 *   defaultAddress?: string | null;
 *   deletedAddress?: string | null;
 *   error: Record<AddressFragment['id'], string> | null;
 *   updatedAddress?: AddressFragment;
 * }} ActionResponse
 */

/** @typedef {import('@shopify/hydrogen/customer-account-api-types').CustomerAddressInput} CustomerAddressInput */
/** @typedef {import('customer-accountapi.generated').AddressFragment} AddressFragment */
/** @typedef {import('customer-accountapi.generated').CustomerFragment} CustomerFragment */
/** @typedef {import('@shopify/remix-oxygen').ActionFunctionArgs} ActionFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @template T @typedef {import('react-router').Fetcher<T>} Fetcher */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof action>} ActionReturnData */
