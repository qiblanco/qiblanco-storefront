import {Link, useLoaderData} from 'react-router';
import {KAKAO_KENNZAHLEN} from '~/lib/kakao-zone';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {ProductImageList} from '~/components/ProductImageList';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {Kakao} from '~/components/product-pages/Kakao';
import {SingleImage} from '~/components/reusables/SingleImage';
import { KursInhalteKakao } from '~/components/reusables/KursinhalteKakao';
import { UpsellLineUp } from '~/components/UpsellLineUp';

import {canonicalLink} from '~/lib/seo';
import {StarRating, SterneSprung} from '~/components/reusables/StarRating';

/*
 * MERGE 2026-08-30 (Job 20260830-sterne-s05-...): die Sterne-ZAHL wird aus der
 * Kennzahl-Konstante ABGELEITET, nie daneben geschrieben. Dieser Zweig trug an
 * vier Stellen hartkodiert 5.0 bzw. 4.8 — den Stand VOR origin/main a75fd47
 * ("Kakao-Kennzahlen: 4,9 Sterne und 1.000 Nutzer"). StarRating braucht eine
 * Zahl (es rechnet value - i), KAKAO_KENNZAHLEN.bewertung ist ein String mit
 * Dezimalkomma — genau hier entstuende sonst die zweite Wahrheit.
 */
const KAKAO_BEWERTUNG_ZAHL = Number(
  KAKAO_KENNZAHLEN.bewertung.replace(',', '.'),
);

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [
    {title: `${data?.product.title ?? ''} | Qi Blanco UG (haftungsbeschränkt)`},
    canonicalLink('/products/zeremonie-kakao'),
  ];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args, 'zeremonie-kakao'); // ✅ pass hardcoded handle

  return {...deferredData, ...criticalData};
}

/**
 * Load critical data (above-the-fold content)
 * @param {LoaderFunctionArgs} args
 * @param {string} handle
 */
async function loadCriticalData({context, request}, handle) {
  const {storefront} = context;

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {
        handle, // ✅ use the static handle
        selectedOptions: getSelectedProductOptions(request),
      },
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {product};
}

/**
 * Load deferred (non-critical) data
 */
function loadDeferredData({context, params}) {
  return {};
}

export default function Product() {
  /** @type {LoaderReturnData} */
  const {product} = useLoaderData();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;

  return (
    <>
      <div className="NormalSectionSize mt-2">
        <h2 className="text-center">Crystal Cacao®</h2>
        <h3 className="text-center">
          Kristall Kakao – <br />
          dein Wachmacher ohne Crash
        </h3>
        <p className="text-center">
          <b>
            Erlebe ein Getränk, das jahrhundertealte Tradition mit moderner
            Veredelung vereint – <br /> und eine Wirkung entfaltet, die weltweit
            einzigartig ist.
          </b>
        </p>
      </div>

      <div className="KakaoHero NormalSectionSize mt-2">
        <div className="Featured">
          <img
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2025-05-qiblanco-canggu-06712-cropped.webp?v=1759177848"
            alt=""
          />
        </div>
        <div className="KakaoHero-imgText">
          <h2>Kristall Kakao®</h2>
          <SterneSprung className="ReviewCount">
            {KAKAO_KENNZAHLEN.bewertung}{' '}
            <StarRating value={KAKAO_BEWERTUNG_ZAHL} size={16} />
          </SterneSprung>
          <img
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2022-07-26-qiblanco-berlin-1001273-v2b-min.jpg_1.webp?v=1669001851"
            alt=""
          />
          <Link className="btn--primary mt-2" to="#product">
            Jetzt bestellen & den Unterschied spüren
          </Link>
        </div>
      </div>

      <div className="NormalSectionSize" style={{margin: '100px auto'}}>
        <h2>Kakao, der Gedanken in Ideen verwandelt</h2>
        <p className="mt-2">
          Kristall Kakao® ist unsere Premium-Variante von Zeremonie Kakao –
          speziell ausgewählt für Menschen, die im Alltag mehr Fokus,
          Inspiration und kreative Energie erleben möchten.
        </p>
        <p className="mt-2">
          Seit Jahrhunderten wurde Kakao in Ritualen genutzt, um Herz und Geist
          zu öffnen. Heute ist <b>Crystal Cacao®</b> dein Wachmacher ohne
          Crash: Anders als Kaffee oder Energy Drinks schenkt er dir
          <b>
            wache Klarheit und kreative Energie – ohne Nervosität und den
            späteren Einbruch.
          </b>
        </p>
      </div>

      <WarumKakao />
      <Kundenstimmen />

      {/* id="product" NUR hier (erste Buy-Box): Anker-Ziel der "#product"-CTAs;
          die zweite Buy-Box unten bleibt ohne id (keine Doppel-id). */}
      <div className="product" id="product">
        <div className="ProductImages">
          <ProductImage image={selectedVariant?.image} />
          <ProductImageList images={product?.images} />
        </div>
        <div className="product-main">
          <h1>{title}</h1>
          <SterneSprung className="product-rating mt-2">
            <span>{KAKAO_KENNZAHLEN.bewertung}</span>{' '}
            <StarRating value={KAKAO_BEWERTUNG_ZAHL} />{' '}
            <span>Über {KAKAO_KENNZAHLEN.nutzer} Nutzer</span>
          </SterneSprung>
          <div
            className="ProductDescription mt-2 mb-2"
            dangerouslySetInnerHTML={{__html: descriptionHtml}}
          />

          <p className='mt-2 mb-2'>Premium - Kristall Kakao® in 420 g Blöcken, genug für 28 Tage. <br />
6.300 Jahre alte Kakaolinie aus Peru.</p>

          <ProductPrice
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
          />
          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
          />
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

      <div className="UnserVersprechen NormalSectionSize">
        <div className="mt-2">
          <h2>✅ Unser Versprechen:</h2>
          <h3>
            Kristall Kakao® wird dein Leben bereichern – oder du zahlst keinen
            Cent.
          </h3>
          <p className="mt-2">Trink ihn. Teile ihn. Erlebe ihn.</p>
          <p className="mt-2">
            Du hast 20 Tage Zeit für deine Transformation – ohne
            Kleingedrucktes, ohne Haken. Nur reines Vertrauen in die Kraft des
            authentischsten Zeremonienkakaos.
          </p>
          <p className="mt-2">
            Spürst du nicht, dass dies der außergewöhnlichste Kakao ist, den du
            je probiert hast? Dann sende ihn einfach zurück – selbst eine
            angebrochene Packung erstatten wir dir zu 100%.
          </p>
        </div>
        <div className="mt-2">
          <img
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/DSC00308_Kopie.webp?v=175917902"
            alt=""
          />
        </div>
      </div>

      <div className="UnserVersprechen NormalSectionSize">
        <div className="mt-2">
          <h2>
            Nutze die Kraft des Kristall Kakao® regelmäßig – und spare dabei:
          </h2>
          <p className="mt-2">
            ✅ 2 Stück kaufen → 20 % Rabatt + gratis Versand innerhalb Deutschlands <br /> 👉
            Beliebteste Wahl – perfekt für deine tägliche Zeremonie
          </p>
          <p className="mt-2">
            ✅ 3 Stück kaufen → 30 % Rabatt + gratis Versand innerhalb Deutschlands <br />
            🌟 Beste Wahl – teilen, verschenken & selbst genießen
          </p>
          <p className="mt-2">
            Ob für dich allein oder zum Teilen: <br />
            Jetzt ist der ideale Moment, dich einzudecken
          </p>
        </div>
        <div className="mt-2">
          <img
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/kakao-image.webp?v=1759153567"
            alt=""
          />
        </div>
      </div>

      <SingleImage
        size={'fullscreen'}
        link={
          'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/DSC01061.webp?v=1759152958'
        }
      />

      <div className="UnserVersprechen NormalSectionSize">
        <div className="mt-2">
          <h2>
            So erkennst du echten Kristall Kakao® – und spürst den Unterschied
          </h2>
          <p>
            Echter Zeremonien-Kakao wirkt nicht nur auf den Körper – er
            verändert, wie du dich fühlst. Damit diese Wirkung entstehen kann,
            braucht es mehr als Bio-Qualität: Es braucht Ursprünglichkeit und
            Reinheit.
            <br />
            Durch das bewusste Weglassen des Temperierens entsteht eine
            einzigartige Kristallstruktur – sichtbar im charakteristischen
            Leopardenmuster. Sie steht für das, was du mit jeder Tasse erlebst:
            mehr Fokus, Klarheit und tiefe Präsenz.
          </p>
          <ul>
            <li>
              <strong>Naturbelassen &amp; schonend verarbeitet </strong>–
              bioaktive Pflanzenstoffe wie Theobromin, Polyphenole und
              Tryptophan bleiben erhalten
            </li>
            <li>
              <strong>Unverfälschter Geschmack </strong>– voll, erdig und warm,
              mit der Tiefe ursprünglicher Kakaokultur
            </li>
            <li>
              <strong>Kraftvolle Struktur</strong> – sichtbar einzigartig,
              fühlbar intensiv
            </li>
          </ul>
          <p>
            <strong>Der Unterschied liegt in der Wirkung.</strong> Du wirst ihn
            schmecken. Und spüren.
            <br />
            <br />
          </p>
        </div>
        <div className="mt-2">
          <img
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/kakao-muster.webp?v=1759179332"
            alt=""
          />
        </div>
      </div>

      <div className="UnserVersprechen NormalSectionSize">
        <div className="mt-2">
          <h2>Herkunft: Spüre die Kraft des Amazonas</h2>
          <p>
            Aus dem geheimnisvollen Amazonas bringen wir dir eine heilige
            Pflanze in ihrer reinsten Form: unseren bio-zertifizierten
            <strong> Kristall Kakao®.</strong> Diese besonderen Kakaobohnen
            stammen aus nachhaltigem Anbau in den
            <strong> Bergwäldern des peruanischen Departamento Amazonas</strong>
            . Sie werden behutsam bei niedriger Temperatur vermahlen und
            anschließend in eine elegante, quadratische 420 g-Tafel gegossen –
            ein purer Block Bio <strong> Kristall Kakao®.</strong>
          </p>
          <p className="mt-2">
            Nach der Formung geben wir dem Kakao die Zeit, die er braucht: In
            Ruhe kristallisiert er langsam und entwickelt dabei sein
            charakteristisches Kristallmuster – Sinnbild für naturbelassene
            Qualität, aromatische Tiefe und unsere tiefe Achtung vor dem
            Ursprung. Während dieser Reifephase setzen wir das
            <strong> QiHome® Air</strong> ein: Es schafft eine besondere
            Atmosphäre, die die Kristallisation begleitet und den Kakao auf
            seinem Weg zu seiner einzigartigen Struktur unterstützt.
          </p>
          <p className="mt-2">
            So entsteht unser unverwechselbarer
            <strong> Kristall Kakao®</strong> – mit feiner Struktur, voller
            Kraft und lebendigem Geschmack. Versiegelt im Aroma-Schutzpack
            bleiben das volle Bouquet tropischer Früchte, feiner Kokosnoten und
            Zitrusnuancen sowie alle wertvollen Bestandteile optimal bewahrt.
          </p>
          <p className="mt-2">
            <strong>
              Brich dir ein Stück ab, bereite ein warmes Elixier zu und tauche
              ein in dein persönliches Ritual – voller Achtsamkeit, Herzöffnung
              und tiefer Verbundenheit.
            </strong>
          </p>
        </div>
        <div className="mt-2">
          <img
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/DSC01491_Kopie.webp?v=1759179615"
            alt=""
          />
        </div>
      </div>
      <div className="NormalSectionSize">
        <h2>🛡️ Unsere Garantie: </h2>
        <p className="mt-2">
          <strong>
            Einer der besten Zeremonie-Kakaos – oder 100 % Geld zurück.
          </strong>
          <br />
        </p>
        <p className="mt-1">
          Wir stehen für Transparenz, Qualität und echten Mehrwert. Unser Ziel:
          Dir einen Kakao zu bieten, der wirkt – und hält, was er verspricht.
          <br />
        </p>
        <ul className="mt-2">
          <li>
            <strong>✅ 6.300 Jahre alte Kakaolinie</strong>
          </li>
          <li>
            Aus einer der ältesten genetisch bestätigten Kakaopflanzenlinien
            der Welt.
            <br />
          </li>
        </ul>
        <p></p>
        <ul>
          <li className="mt-2">
            <strong>✅ Bio-zertifizierte Herstellung &amp; Bohnen</strong>
          </li>
          <li>
            Schonend verarbeitet bei niedriger Temperatur – für maximalen Erhalt
            der natürlichen Wirkstoffe: Theobromin, Polyphenole &amp;
            Tryptophan.
            <br />
          </li>
        </ul>
        <p></p>
        <ul>
          <li className="mt-2">
            <strong>✅ Aromaschutz-Verpackung</strong>
          </li>
          <li>
            Erhält Geschmack, Duft und bioaktive Inhaltsstoffe – von der
            Produktion bis zur letzten Tasse.
            <br />
            <br />
          </li>
          <li>
            <strong>✅ Rückgabe-Garantie</strong>
          </li>
          <li>
            Du bist nicht überzeugt? Dann schick den Kakao innerhalb von 20
            Tagen zurück. 📦 Gilt für max. eine geöffnete Packung pro
            Bestellung – du erhältst den vollen Kaufpreis zurück.
          </li>
        </ul>
        <p></p>
        <ul className="mt-2">
          <li>
            <strong>Maximale Qualität. </strong>
          </li>
          <li>
            <strong>Spürbare Wirkung. </strong>
          </li>
          <li>
            <strong>Null Risiko für dich.</strong>
          </li>
        </ul>
      </div>
      <div className="NormalSectionSize Achtsamkeits-Kur">
        <h2>28-Tage Achtsamkeits-Kur<br />Dein Ritual für Klarheit & innere Balance</h2>
        <p>Eine Packung Kristall Kakao® (420 g) reicht für eine <b>28-tägige Achtsamkeits-Kur</b>. Dabei wird der Kakao zu deinem täglichen Begleiter und festen Anker im Alltag.</p>
        <h3 className="mt-2">So funktioniert die Kur:</h3>
        <ul>
          <li><b>Jeden Tag ein Ritual</b> – bereite dir 15 g Kristall Kakao® zu und genieße ihn bewusst.</li>
          <li><b>Achtsamkeit leben</b> – verbinde den Moment mit Meditation, Atemübungen oder Journaling.</li>
          <li><b>Veränderung spüren</b> – schon nach wenigen Tagen wirst du ruhiger, klarer und präsenter.</li>
        </ul>
        <h3 className="mt-2">Warum 28 Tage?</h3>
        <p>Studien zeigen: Nach 28 Tagen haben sich neue Routinen fest etabliert. So wird aus einem Getränk ein Weg zu mehr Gelassenheit, Fokus und innerer Stärke.</p>
        <p className="mt-2"><b>Kristall Kakao® ist mehr als ein Wachmacher – er ist dein Schlüssel zu 28 Tagen voller Achtsamkeit und bewusster Veränderung.</b></p>
        <Link className='btn--primary mt-2' to={"#product"}>Jetzt Dein Ritual für 28 Tage sichern</Link>
      </div>

      <KursInhalteKakao />

      <div style={{margin: "100px 0"}}>
        <div className="product">
          <div className="ProductImages">
            <ProductImage image={selectedVariant?.image} />
            <ProductImageList images={product?.images} />
          </div>
          <div className="product-main">
            <h1>{title}</h1>
            <SterneSprung className="product-rating mt-2">
              <span>{KAKAO_KENNZAHLEN.bewertung}</span>{' '}
              <StarRating value={KAKAO_BEWERTUNG_ZAHL} />{' '}
              <span>Über {KAKAO_KENNZAHLEN.nutzer} Nutzer</span>
            </SterneSprung>
            <div
              className="ProductDescription"
              dangerouslySetInnerHTML={{__html: descriptionHtml}}
            />
            <p className="mt-2">
              <b>Mehr als {KAKAO_KENNZAHLEN.nutzer}+ aktive Nutzer</b>
            </p>
            <ProductPrice
              price={selectedVariant?.price}
              compareAtPrice={selectedVariant?.compareAtPrice}
            />
            <ProductForm
              productOptions={productOptions}
              selectedVariant={selectedVariant}
            />
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
      </div>

      <div className="NormalSectionSize BioZeremonie">
        <h2>Warum Bio-Zeremonie-Kakao mit Kristallstrukur?</h2>
        <p className='mt-2'>BIO Zeremonie-Kakao wird seit Jahrhunderten in indigenen Kulturen für rituelle Momente geschätzt – als kraftvoller Begleiter für innere Klarheit, Verbindung und bewusste Präsenz.Unser BIO Zeremonie-Kakao wird schonend verarbeitet, um seinen ursprünglichen Charakter zu bewahren. </p>
        <p className='mt-2'>Durch die bewusste De-Temperierung entsteht seine natürliche Kristallstruktur – sichtbar im charakteristischen Leoparden-Muster.</p>
        <p className='mt-2'>Das macht den Unterschied: </p>
        <ul className='mt-2'>
          <li><b>Rein & naturbelassen</b> – 100 % Bio, frei von Zusätzen, direkt aus dem Amazonasgebiet</li>
          <li><b>Aromatisch & kraftvoll</b> – traditionell verwendete Bohnen mit vollmundigem Geschmack</li>
          <li><b>Wertvolle Inhaltsstoffe</b> – reich an natürlichen Polyphenolen und Mineralstoffen wie Magnesium</li>
        </ul>
        <p className="mt-2">Zeremonie-Kakao ist mehr als ein Getränk – er ist <b>ein Ritual</b>. Ideal für <b>Achtsamkeit, Meditation</b> oder als <b>bewusste Alternative</b> im Alltag.</p>
      </div>
      <UpsellLineUp />
      <SingleImage size={"fullscreen"} link={"https://cdn.shopify.com/s/files/1/0279/3095/1750/files/kakaohero_1_4ebdaf6e-683a-40c5-bbfe-d5d83e6b3b4f.webp?v=1680818117"} />
    </>
  );
}

function WarumKakao() {
  return (
    <div className="WarumKakao NormalSectionSize">
      <div className="TextContent">
        <h2>Warum Crystal Cacao®</h2>
        <p className="mt-2">
          ✅ Wachmacher ohne Crash – natürliche Energie ohne Nervosität <br />
          ✅ Unterstützt Klarheit & kreativen Fokus <br />✅ Rein,
          bio-zertifiziert & slow-crafted bei niedriger Temperatur <br />✅ Sehr
          ergiebig – reich an sekundären Pflanzenstoffen wie Polyphenolen &
          Flavonoiden
        </p>

        <h2 className="mt-2">So nutzt du Crystal Cacao® für deinen Flow</h2>
        <p className="mt-2">
          1. 15g in heißem Wasser oder Milch auflösen <br />
          2. Mixen, bis er cremig wird In Ruhe genießen – und deinen Ideen
          freien Lauf lassen
        </p>
        <p className="mt-2 mb-2">
          <b>
            Ideal für: <br />
            ✍️ Studium & Arbeit <br />
            🧘 Kreative Sessions <br />
            🌙 Schlaf & Entspannung
          </b>
        </p>
      </div>
      <div className="ImageSlider">
        <img
          src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/DSC01510_Kopie.webp?v=1759179020"
          alt=""
        />
      </div>
    </div>
  );
}

function Kundenstimmen() {
  return (
    <>
      <div
        className="NormalSectionSize text-center"
        style={{margin: '100px auto 0 auto'}}
      >
        <h2 className="text-center">Kundenstimmen</h2>
        <SterneSprung className="ReviewCount">
          {KAKAO_KENNZAHLEN.bewertung}{' '}
          <StarRating value={KAKAO_BEWERTUNG_ZAHL} size={16} />
        </SterneSprung>
      </div>
      <div className="Kundenstimmen-Slider NormalSectionSize mt-2">
        <div className="Kundenstimme">
          <div className="Kundenstimmen-Image">
            <img
              src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/IMG_0938-1024x1008_jpg.webp?v=1666617198"
              alt=""
            />
          </div>
          <div className="Kundenstimmen-Text">
            “Zeremonieller Kakao ist mittlerweile Teil mein Morgenroutine
            geworden. Ich trinke diesen, wenn ich morgens anfange zu lesen und
            mit der Arbeit starte. Der Kakao hilft mir dabei, mehr bei mir zu
            sein und in einen tieferen Fokus zu kommen. Ich wusste vorher
            garnicht, dass Kakao so eine positive Auswirkung auf den Körper
            haben kann (die man auch direkt spüren kann!) Ich trinke den Kakao
            bevor ich frühstücke und konsumiere daher auch keinen Kaffee mehr.
            Ohne Zucker und richtig vollmundig intensiv im Geschmack. Ich bin
            wirklich rundum begeistert! Danke für dieses tolle Produkt, man
            schmeckt die Qualität wirklich mit jeder Tasse.” <br />
            <div className="mt-2">
              <b>Adrian</b>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    images(first: 10) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
