import {redirect} from '@shopify/remix-oxygen';
import {useLoaderData} from 'react-router';
import {Money, Image, flattenConnection} from '@shopify/hydrogen';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';
import {
  AdressLese,
  BestellPosten,
  BestellSummen,
  KontoAbschnitt,
} from '~/components/konto/KontoUI';
import {datumText, versandText} from '~/lib/konto-texte';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [{title: `Bestellung ${data?.order?.name ?? ''} | Qi Blanco`}];
};

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({params, context}) {
  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const {data, errors} = await context.customerAccount.query(
    CUSTOMER_ORDER_QUERY,
    {
      variables: {orderId},
    },
  );

  if (errors?.length || !data?.order) {
    throw new Error('Bestellung nicht gefunden');
  }

  const {order} = data;

  const lineItems = flattenConnection(order.lineItems);
  const discountApplications = flattenConnection(order.discountApplications);

  const fulfillmentStatus =
    flattenConnection(order.fulfillments)[0]?.status ?? null;

  const firstDiscount = discountApplications[0]?.value;

  const discountValue =
    firstDiscount?.__typename === 'MoneyV2' && firstDiscount;

  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue' &&
    firstDiscount?.percentage;

  return {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  };
}

export default function OrderRoute() {
  /** @type {LoaderReturnData} */
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  } = useLoaderData();

  const versand = versandText(fulfillmentStatus);

  // Summenzeilen als Daten statt als Markup — dadurch verschwindet die
  // doppelte <th>-Zeile des Scaffolds, die jede Summe zweimal beschriftete
  // ("Rabatte Rabatte", "Zwischensumme Zwischensumme").
  const summen = [];
  if (discountPercentage) {
    summen.push({text: 'Rabatt', wert: `−${discountPercentage} %`});
  } else if (discountValue && discountValue.amount) {
    summen.push({text: 'Rabatt', wert: <Money data={discountValue} />});
  }
  summen.push({text: 'Zwischensumme', wert: <Money data={order.subtotal} />});
  summen.push({text: 'Enthaltene Steuer', wert: <Money data={order.totalTax} />});
  summen.push({
    text: 'Gesamt',
    wert: <Money data={order.totalPrice} />,
    gesamt: true,
  });

  const adresse = order?.shippingAddress;

  return (
    <KontoAbschnitt
      titel={`Bestellung ${order.name}`}
      beschreibung={`Bestellt am ${datumText(order.processedAt)}`}
    >
      <div className="konto-karte">
        <h3 className="konto-karte__titel">Das hast du bestellt</h3>
        <div>
          {lineItems.map((lineItem, lineItemIndex) => (
            <BestellPosten
              // eslint-disable-next-line react/no-array-index-key
              key={lineItemIndex}
              titel={lineItem.title}
              variante={lineItem.variantTitle}
              menge={lineItem.quantity}
              preis={<Money data={lineItem.price} />}
              bild={
                lineItem?.image ? (
                  <Image
                    className="konto-posten__bild"
                    data={lineItem.image}
                    width={64}
                    height={64}
                  />
                ) : null
              }
            />
          ))}
        </div>
        <BestellSummen zeilen={summen} />
      </div>

      <div className="konto-raster konto-raster--zwei konto-raster--luft">
        <div className="konto-karte">
          <h3 className="konto-karte__titel">Lieferadresse</h3>
          {adresse ? (
            <AdressLese
              name={adresse.name}
              zeilen={[adresse.formatted, adresse.formattedArea]
                .flat()
                .filter(Boolean)}
            />
          ) : (
            <p className="konto-meta">Zu dieser Bestellung ist keine Lieferadresse hinterlegt.</p>
          )}
        </div>

        <div className="konto-karte">
          <h3 className="konto-karte__titel">Status</h3>
          <p className="konto-meta">
            {versand ?? 'Wir bereiten deine Bestellung vor.'}
          </p>
          {order.statusPageUrl ? (
            <div className="konto-form__knoepfe">
              <a
                className="konto-cta konto-cta--sekundaer"
                target="_blank"
                href={order.statusPageUrl}
                rel="noreferrer"
              >
                Sendung verfolgen
              </a>
            </div>
          ) : null}
        </div>
      </div>

      <div className="konto-form__knoepfe konto-form__knoepfe--luft">
        <a className="konto-cta konto-cta--sekundaer" href="/account/orders">
          Zurück zu deinen Bestellungen
        </a>
      </div>
    </KontoAbschnitt>
  );
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('customer-accountapi.generated').OrderLineItemFullFragment} OrderLineItemFullFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
