import {useLoaderData} from 'react-router';
import {
  Money,
  getPaginationVariables,
  flattenConnection,
} from '@shopify/hydrogen';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {
  BestellKarte,
  KontoAbschnitt,
  KontoLeer,
} from '~/components/konto/KontoUI';
import {datumText, versandText, zahlungsText} from '~/lib/konto-texte';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: 'Bestellungen | Qi Blanco'}];
};

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({request, context}) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const {data, errors} = await context.customerAccount.query(
    CUSTOMER_ORDERS_QUERY,
    {
      variables: {
        ...paginationVariables,
      },
    },
  );

  if (errors?.length || !data?.customer) {
    throw Error('Bestellungen nicht gefunden');
  }

  return {customer: data.customer};
}

export default function Orders() {
  /** @type {LoaderReturnData} */
  const {customer} = useLoaderData();
  const {orders} = customer;
  const hatBestellungen = Boolean(orders?.nodes?.length);

  return (
    <KontoAbschnitt titel="Deine Bestellungen">
      {hatBestellungen ? (
        <div className="konto-bestellungen">
          <PaginatedResourceSection connection={orders}>
            {({node: order}) => <OrderItem key={order.id} order={order} />}
          </PaginatedResourceSection>
        </div>
      ) : (
        <KontoLeer
          text="Hier ist noch nichts. Sobald du bestellst, findest du jede Bestellung an dieser Stelle wieder — mit Status und Versandinfo."
          ctaText="Produkte ansehen"
          ctaZu="/collections"
        />
      )}
    </KontoAbschnitt>
  );
}

/**
 * @param {{order: OrderItemFragment}}
 */
function OrderItem({order}) {
  const versand = versandText(flattenConnection(order.fulfillments)[0]?.status);
  const zahlung = zahlungsText(order.financialStatus);

  return (
    <BestellKarte
      nummer={`#${order.number}`}
      datum={datumText(order.processedAt)}
      status={versand ?? zahlung}
      summe={<Money data={order.totalPrice} />}
      zu={`/account/orders/${btoa(order.id)}`}
    />
  );
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('customer-accountapi.generated').CustomerOrdersFragment} CustomerOrdersFragment */
/** @typedef {import('customer-accountapi.generated').OrderItemFragment} OrderItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
