import {useState} from 'react';
import {
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {useNavigate} from 'react-router';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductImageList} from '~/components/ProductImageList';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';

/*
 * EN-BuyBox der US-Vorabversion — additive EN-Variante der geteilten
 * QiOneBuyBox (deren DOM-Struktur ist der Traeger; die DACH-Komponente
 * bleibt byte-unangetastet, weil ihr ProductForm den deutschen CTA
 * hartkodiert). Varianten-TOLERANT (Konzept 1a Kap. 5): die generische
 * Options-/Varianten-Logik ist 1:1 uebernommen — eine kuenftige
 * "Condition"-Option (M4) erschiene hier ohne Codeaenderung.
 *
 * PREIS: ausschliesslich dynamisch via ProductPrice -> formatPreis
 * (M3-Kanon; USD = Endbetrag, $1,383-Format). KEIN hartkodierter Preis
 * (D-056-Lehre). KEIN Pixel-Code (D-006) — ViewContent kommt aus
 * <Analytics.ProductView>, R1/R2/R3 haengen im root-Layout.
 */
export function UsBuyBox({
  product,
  socialProof = null,
  description = null,
  topBadge = null,
  priceLabel = null,
  benefitList = null,
}) {
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title} = product;
  const [featuredImage, setFeaturedImage] = useState(product?.images.nodes[0]);
  return (
    <div className="product">
      <div className="ProductImages">
        <div className="ProductImageWrapperSticky">
          <ProductImage image={featuredImage} />
          <ProductImageList
            images={product?.images}
            onSelectImage={(image) => setFeaturedImage(image)}
          />
        </div>
      </div>
      <div className="product-main">
        <h1>{title}</h1>
        {socialProof}
        {description}

        {topBadge}

        <div className="Bestseller-Price">
          <ProductPrice
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
          />
          {priceLabel}
        </div>

        <UsProductForm
          productOptions={productOptions}
          selectedVariant={selectedVariant}
        />
        {benefitList}
      </div>
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

/*
 * EN-Variante des ProductForm (Traeger: app/components/ProductForm.jsx) —
 * identische varianten-generische Options-Logik, EN-CTA-Texte.
 */
function UsProductForm({productOptions, selectedVariant}) {
  const navigate = useNavigate();
  const {open} = useAside();
  return (
    <div className="product-form">
      {productOptions.map((option) => {
        if (option.optionValues.length === 1) return null;

        return (
          <div className="product-options" key={option.name}>
            <h5>{option.name}</h5>
            <div className="product-options-grid">
              {option.optionValues.map((value) => {
                const {name, variantUriQuery, selected, available, exists} =
                  value;

                return (
                  <button
                    type="button"
                    className={`product-options-item${
                      exists && !selected ? ' link' : ''
                    }`}
                    key={option.name + name}
                    style={{
                      border: selected
                        ? '1px solid black'
                        : '1px solid transparent',
                      opacity: available ? 1 : 0.3,
                    }}
                    disabled={!exists}
                    onClick={() => {
                      if (!selected) {
                        navigate(`?${variantUriQuery}`, {
                          replace: true,
                          preventScrollReset: true,
                        });
                      }
                    }}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
            <br />
          </div>
        );
      })}
      <div className="AddToCartButtonWrapper">
        <AddToCartButton
          disabled={!selectedVariant || !selectedVariant.availableForSale}
          onClick={() => {
            open('cart');
          }}
          lines={
            selectedVariant
              ? [
                  {
                    merchandiseId: selectedVariant.id,
                    quantity: 1,
                    selectedVariant,
                  },
                ]
              : []
          }
        >
          {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
        </AddToCartButton>
      </div>
    </div>
  );
}

/*
 * EN-BenefitList (Traeger: QiOneBenefitList; Inhalte = US-Trust-Signale der
 * Live-US-Seite: free & insured shipping from Germany, duties included,
 * customs-ehrliche Lieferzeit).
 */
export function UsBenefitList() {
  return (
    <div className="BenefitList">
      <ul>
        <li>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1.23em"
            height="1em"
            viewBox="0 0 1728 1408"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M576 1152q0-52-38-90t-90-38t-90 38t-38 90t38 90t90 38t90-38t38-90M192 640h384V384H418q-13 0-22 9L201 588q-9 9-9 22zm1280 512q0-52-38-90t-90-38t-90 38t-38 90t38 90t90 38t90-38t38-90M1728 64v1024q0 15-4 26.5t-13.5 18.5t-16.5 11.5t-23.5 6t-22.5 2t-25.5 0t-22.5-.5q0 106-75 181t-181 75t-181-75t-75-181H704q0 106-75 181t-181 75t-181-75t-75-181h-64q-3 0-22.5.5t-25.5 0t-22.5-2t-23.5-6t-16.5-11.5T4 1114.5T0 1088q0-26 19-45t45-19V704q0-8-.5-35t0-38t2.5-34.5t6.5-37t14-30.5t22.5-30l198-198q19-19 50.5-32t58.5-13h160V64q0-26 19-45t45-19h1024q26 0 45 19t19 45"
            ></path>
          </svg>
          <b>Free shipping</b>&nbsp;— directly from Germany
        </li>
        <li>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M12 20a8 8 0 0 0 8-8a8 8 0 0 0-8-8a8 8 0 0 0-8 8a8 8 0 0 0 8 8m0-18a10 10 0 0 1 10 10a10 10 0 0 1-10 10C6.47 22 2 17.5 2 12A10 10 0 0 1 12 2m.5 5v5.25l4.5 2.67l-.75 1.23L11 13V7z"
            ></path>
          </svg>
          Ships within 2–5 days; U.S. customs clearance usually under a week
        </li>
        <li>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1.15em"
            height="1em"
            viewBox="0 0 2048 1792"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M1811 1555q19-19 45-19t45 19l128 128l-90 90l-83-83l-83 83q-18 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19L19 1645l90-90l83 83l83-83q19-19 45-19t45 19l83 83l83-83q19-19 45-19t45 19l83 83l83-83q19-19 45-19t45 19l83 83l83-83q19-19 45-19t45 19l83 83l83-83q19-19 45-19t45 19l83 83l83-83q19-19 45-19t45 19l83 83zm-1574-38q-19 19-45 19t-45-19L19 1389l90-90l83 82l83-82q19-19 45-19t45 19l83 82l64-64v-293L302 710q-17-26-7-56.5t40-40.5l177-58V256h128V128h256V0h256v128h256v128h128v299l177 58q30 10 40 40.5t-7 56.5l-210 314v293l19-18q19-19 45-19t45 19l83 82l83-82q19-19 45-19t45 19l128 128l-90 90l-83-83l-83 83q-18 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83l-83 83q-19 19-45 19t-45-19l-83-83zM640 384v128l384-128l384 128V384h-128V256H768v128z"
            ></path>
          </svg>
          100% insured shipping — all duties and taxes included
        </li>
        <li>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 1728 1728"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M1728 864q0 176-68.5 336t-184 275.5t-275.5 184t-336 68.5t-336-68.5t-275.5-184t-184-275.5T0 864q0-213 97-398.5T362 160T736 9v228q-221 45-366.5 221T224 864q0 130 51 248.5t136.5 204t204 136.5t248.5 51t248.5-51t204-136.5t136.5-204t51-248.5q0-230-145.5-406T992 237V9q206 31 374 151t265 305.5t97 398.5"
            ></path>
          </svg>
          Cotton-ribbon necklace included — wear it right away
        </li>
      </ul>
    </div>
  );
}
