/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as StorefrontAPI from '@shopify/hydrogen/storefront-api-types';

export type StartseitePreisFragment = Pick<StorefrontAPI.Product, 'handle'> & {
  priceRange: {
    minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  };
};

export type StartseitePreiseQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type StartseitePreiseQuery = {
  qione?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle'> & {
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
    }
  >;
  bracelet?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle'> & {
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
    }
  >;
  qihome?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle'> & {
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
    }
  >;
};

export type MmProductFragment = Pick<
  StorefrontAPI.Product,
  'handle' | 'title'
> & {
  featuredImage?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'url' | 'altText'>
  >;
  images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
  priceRange: {
    minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  };
  variants: {
    nodes: Array<{
      compareAtPrice?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
    }>;
  };
};

export type MmCampaignProductsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type MmCampaignProductsQuery = {
  qione?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
  bracelet?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
  qihome?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
};

export type QiAlphaStahlketteQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type QiAlphaStahlketteQuery = {
  stahlkette?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'id' | 'handle' | 'title'> & {
      variants: {
        nodes: Array<
          Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'title' | 'availableForSale'
          > & {
            product: Pick<StorefrontAPI.Product, 'id' | 'handle' | 'title'>;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
          }
        >;
      };
    }
  >;
};

export type AlphaVorlageKettenQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  stahl: StorefrontAPI.Scalars['String']['input'];
}>;

export type AlphaVorlageKettenQuery = {
  stahl?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'id' | 'handle' | 'title'> & {
      variants: {
        nodes: Array<
          Pick<
            StorefrontAPI.ProductVariant,
            'availableForSale' | 'id' | 'sku' | 'title'
          > & {
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
            image?: StorefrontAPI.Maybe<
              {__typename: 'Image'} & Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            unitPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
          }
        >;
      };
    }
  >;
};

export type AlphaVorlageKetteFragment = Pick<
  StorefrontAPI.Product,
  'id' | 'handle' | 'title'
> & {
  variants: {
    nodes: Array<
      Pick<
        StorefrontAPI.ProductVariant,
        'availableForSale' | 'id' | 'sku' | 'title'
      > & {
        compareAtPrice?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
        >;
        image?: StorefrontAPI.Maybe<
          {__typename: 'Image'} & Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
        product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
        selectedOptions: Array<
          Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
        >;
        unitPrice?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
        >;
      }
    >;
  };
};

export type ProductVariantFragment = Pick<
  StorefrontAPI.ProductVariant,
  'availableForSale' | 'id' | 'sku' | 'title'
> & {
  compareAtPrice?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
  image?: StorefrontAPI.Maybe<
    {__typename: 'Image'} & Pick<
      StorefrontAPI.Image,
      'id' | 'url' | 'altText' | 'width' | 'height'
    >
  >;
  price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
  selectedOptions: Array<Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>>;
  unitPrice?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
};

export type ProductFragment = Pick<
  StorefrontAPI.Product,
  | 'id'
  | 'title'
  | 'vendor'
  | 'handle'
  | 'descriptionHtml'
  | 'description'
  | 'encodedVariantExistence'
  | 'encodedVariantAvailability'
> & {
  images: {
    nodes: Array<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
  };
  options: Array<
    Pick<StorefrontAPI.ProductOption, 'name'> & {
      optionValues: Array<
        Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
          firstSelectableVariant?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.ProductVariant,
              'availableForSale' | 'id' | 'sku' | 'title'
            > & {
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              image?: StorefrontAPI.Maybe<
                {__typename: 'Image'} & Pick<
                  StorefrontAPI.Image,
                  'id' | 'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
              unitPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
            }
          >;
          swatch?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
              image?: StorefrontAPI.Maybe<{
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              }>;
            }
          >;
        }
      >;
    }
  >;
  selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.ProductVariant,
      'availableForSale' | 'id' | 'sku' | 'title'
    > & {
      compareAtPrice?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
      image?: StorefrontAPI.Maybe<
        {__typename: 'Image'} & Pick<
          StorefrontAPI.Image,
          'id' | 'url' | 'altText' | 'width' | 'height'
        >
      >;
      price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
      selectedOptions: Array<
        Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
      >;
      unitPrice?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
    }
  >;
  adjacentVariants: Array<
    Pick<
      StorefrontAPI.ProductVariant,
      'availableForSale' | 'id' | 'sku' | 'title'
    > & {
      compareAtPrice?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
      image?: StorefrontAPI.Maybe<
        {__typename: 'Image'} & Pick<
          StorefrontAPI.Image,
          'id' | 'url' | 'altText' | 'width' | 'height'
        >
      >;
      price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
      selectedOptions: Array<
        Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
      >;
      unitPrice?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
    }
  >;
  seo: Pick<StorefrontAPI.Seo, 'description' | 'title'>;
};

export type ProductQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  handle: StorefrontAPI.Scalars['String']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  selectedOptions:
    | Array<StorefrontAPI.SelectedOptionInput>
    | StorefrontAPI.SelectedOptionInput;
}>;

export type ProductQuery = {
  product?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Product,
      | 'id'
      | 'title'
      | 'vendor'
      | 'handle'
      | 'descriptionHtml'
      | 'description'
      | 'encodedVariantExistence'
      | 'encodedVariantAvailability'
    > & {
      images: {
        nodes: Array<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
      };
      options: Array<
        Pick<StorefrontAPI.ProductOption, 'name'> & {
          optionValues: Array<
            Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
              firstSelectableVariant?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.ProductVariant,
                  'availableForSale' | 'id' | 'sku' | 'title'
                > & {
                  compareAtPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                  >;
                  image?: StorefrontAPI.Maybe<
                    {__typename: 'Image'} & Pick<
                      StorefrontAPI.Image,
                      'id' | 'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                  price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
                  product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
                  selectedOptions: Array<
                    Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                  >;
                  unitPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                  >;
                }
              >;
              swatch?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                  image?: StorefrontAPI.Maybe<{
                    previewImage?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.Image, 'url'>
                    >;
                  }>;
                }
              >;
            }
          >;
        }
      >;
      selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
        Pick<
          StorefrontAPI.ProductVariant,
          'availableForSale' | 'id' | 'sku' | 'title'
        > & {
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
          image?: StorefrontAPI.Maybe<
            {__typename: 'Image'} & Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
          price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
          product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
          selectedOptions: Array<
            Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
          >;
          unitPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }
      >;
      adjacentVariants: Array<
        Pick<
          StorefrontAPI.ProductVariant,
          'availableForSale' | 'id' | 'sku' | 'title'
        > & {
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
          image?: StorefrontAPI.Maybe<
            {__typename: 'Image'} & Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
          price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
          product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
          selectedOptions: Array<
            Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
          >;
          unitPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }
      >;
      seo: Pick<StorefrontAPI.Seo, 'description' | 'title'>;
    }
  >;
};

export type VergleichPreisFragment = Pick<StorefrontAPI.Product, 'handle'> & {
  selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<{
    price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  }>;
};

export type GeraeteVergleichPreiseQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type GeraeteVergleichPreiseQuery = {
  qione?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle'> & {
      selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<{
        price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      }>;
    }
  >;
  bracelet?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle'> & {
      selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<{
        price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      }>;
    }
  >;
  qihome?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle'> & {
      selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<{
        price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      }>;
    }
  >;
};

export type KakaoSortenPreiseQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type KakaoSortenPreiseQuery = {
  awake?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle'> & {
      selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<{
        price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      }>;
    }
  >;
  create?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle'> & {
      selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<{
        price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      }>;
    }
  >;
};

export type SortenPreisFragment = Pick<StorefrontAPI.Product, 'handle'> & {
  selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<{
    price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  }>;
};

export type CrystalSpiegelFeaturedCollectionFragment = Pick<
  StorefrontAPI.Collection,
  'id' | 'title' | 'handle'
> & {
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
  >;
};

export type CrystalSpiegelFeaturedCollectionQueryVariables =
  StorefrontAPI.Exact<{
    country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
    language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
    handle: StorefrontAPI.Scalars['String']['input'];
  }>;

export type CrystalSpiegelFeaturedCollectionQuery = {
  collection?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'> & {
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
      >;
    }
  >;
};

export type SortenProduktFragment = Pick<
  StorefrontAPI.Product,
  'id' | 'title' | 'handle'
> & {
  selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.ProductVariant, 'id'> & {
      price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
    }
  >;
  priceRange: {
    minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  };
  featuredImage?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
  >;
};

export type SortenQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  awake: StorefrontAPI.Scalars['String']['input'];
  create: StorefrontAPI.Scalars['String']['input'];
}>;

export type SortenQuery = {
  awake?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'> & {
      selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.ProductVariant, 'id'> & {
          price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
        }
      >;
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
      >;
    }
  >;
  create?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'> & {
      selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.ProductVariant, 'id'> & {
          price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
        }
      >;
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
      >;
    }
  >;
};

export type BlogArtikelPfadFragment = Pick<StorefrontAPI.Blog, 'handle'> & {
  artikel: {
    nodes: Array<Pick<StorefrontAPI.Article, 'handle'>>;
    pageInfo: Pick<StorefrontAPI.PageInfo, 'hasNextPage'>;
  };
};

export type BlogBestandFragment = {
  bestand: {nodes: Array<Pick<StorefrontAPI.Article, 'id'>>};
};

export type StaffelKasseMutationVariables = StorefrontAPI.Exact<{
  lines: Array<StorefrontAPI.CartLineInput> | StorefrontAPI.CartLineInput;
  land: StorefrontAPI.CountryCode;
}>;

export type StaffelKasseMutation = {
  cartCreate?: StorefrontAPI.Maybe<{
    cart?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Cart, 'totalQuantity'> & {
        lines: {
          nodes: Array<
            | (Pick<StorefrontAPI.CartLine, 'quantity'> & {
                cost: {
                  totalAmount: Pick<
                    StorefrontAPI.MoneyV2,
                    'amount' | 'currencyCode'
                  >;
                };
              })
            | (Pick<StorefrontAPI.ComponentizableCartLine, 'quantity'> & {
                cost: {
                  totalAmount: Pick<
                    StorefrontAPI.MoneyV2,
                    'amount' | 'currencyCode'
                  >;
                };
              })
          >;
        };
      }
    >;
    userErrors: Array<Pick<StorefrontAPI.CartUserError, 'field' | 'message'>>;
  }>;
};

export type ComingHomeLiveQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  blogHandle: StorefrontAPI.Scalars['String']['input'];
}>;

export type ComingHomeLiveQuery = {
  blog?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Blog, 'handle'> & {
      articles: {
        nodes: Array<
          Pick<
            StorefrontAPI.Article,
            | 'handle'
            | 'title'
            | 'excerpt'
            | 'contentHtml'
            | 'tags'
            | 'publishedAt'
          >
        >;
      };
    }
  >;
};

export type CourseProductFragment = Pick<
  StorefrontAPI.Product,
  'handle' | 'title'
> & {
  featuredImage?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'url' | 'altText'>
  >;
  images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
  priceRange: {
    minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  };
  variants: {
    nodes: Array<{
      compareAtPrice?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
    }>;
  };
};

export type CourseProductsQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type CourseProductsQuery = {
  qione?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
  bracelet?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
  qihome?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
};

export type MoneyFragment = Pick<
  StorefrontAPI.MoneyV2,
  'currencyCode' | 'amount'
>;

export type CartLineFragment = Pick<
  StorefrontAPI.CartLine,
  'id' | 'quantity'
> & {
  attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
  cost: {
    totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    amountPerQuantity: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
  };
  discountAllocations: Array<{
    discountedAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
  }>;
  merchandise: Pick<
    StorefrontAPI.ProductVariant,
    'id' | 'availableForSale' | 'requiresShipping' | 'title'
  > & {
    compareAtPrice?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
    price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
    product: Pick<StorefrontAPI.Product, 'handle' | 'title' | 'id' | 'vendor'>;
    selectedOptions: Array<
      Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
    >;
  };
};

export type CartLineComponentFragment = Pick<
  StorefrontAPI.ComponentizableCartLine,
  'id' | 'quantity'
> & {
  attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
  cost: {
    totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    amountPerQuantity: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
  };
  discountAllocations: Array<{
    discountedAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
  }>;
  merchandise: Pick<
    StorefrontAPI.ProductVariant,
    'id' | 'availableForSale' | 'requiresShipping' | 'title'
  > & {
    compareAtPrice?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
    price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
    product: Pick<StorefrontAPI.Product, 'handle' | 'title' | 'id' | 'vendor'>;
    selectedOptions: Array<
      Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
    >;
  };
};

export type CartApiQueryFragment = Pick<
  StorefrontAPI.Cart,
  'updatedAt' | 'id' | 'checkoutUrl' | 'totalQuantity' | 'note'
> & {
  appliedGiftCards: Array<
    Pick<StorefrontAPI.AppliedGiftCard, 'lastCharacters'> & {
      amountUsed: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    }
  >;
  buyerIdentity: Pick<
    StorefrontAPI.CartBuyerIdentity,
    'countryCode' | 'email' | 'phone'
  > & {
    customer?: StorefrontAPI.Maybe<
      Pick<
        StorefrontAPI.Customer,
        'id' | 'email' | 'firstName' | 'lastName' | 'displayName'
      >
    >;
  };
  lines: {
    nodes: Array<
      | (Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
          attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
          cost: {
            totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            amountPerQuantity: Pick<
              StorefrontAPI.MoneyV2,
              'currencyCode' | 'amount'
            >;
            compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
          };
          discountAllocations: Array<{
            discountedAmount: Pick<
              StorefrontAPI.MoneyV2,
              'currencyCode' | 'amount'
            >;
          }>;
          merchandise: Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'availableForSale' | 'requiresShipping' | 'title'
          > & {
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            product: Pick<
              StorefrontAPI.Product,
              'handle' | 'title' | 'id' | 'vendor'
            >;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
          };
        })
      | (Pick<StorefrontAPI.ComponentizableCartLine, 'id' | 'quantity'> & {
          attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
          cost: {
            totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            amountPerQuantity: Pick<
              StorefrontAPI.MoneyV2,
              'currencyCode' | 'amount'
            >;
            compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
          };
          discountAllocations: Array<{
            discountedAmount: Pick<
              StorefrontAPI.MoneyV2,
              'currencyCode' | 'amount'
            >;
          }>;
          merchandise: Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'availableForSale' | 'requiresShipping' | 'title'
          > & {
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            product: Pick<
              StorefrontAPI.Product,
              'handle' | 'title' | 'id' | 'vendor'
            >;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
          };
        })
    >;
  };
  cost: {
    subtotalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    totalDutyAmount?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
    totalTaxAmount?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
  };
  attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
  discountCodes: Array<
    Pick<StorefrontAPI.CartDiscountCode, 'code' | 'applicable'>
  >;
};

export type MenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
>;

export type ChildMenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
> & {
  items: Array<
    Pick<
      StorefrontAPI.MenuItem,
      'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
    >
  >;
};

export type ParentMenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
> & {
  items: Array<
    Pick<
      StorefrontAPI.MenuItem,
      'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
    > & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        >
      >;
    }
  >;
};

export type MenuFragment = Pick<StorefrontAPI.Menu, 'id'> & {
  items: Array<
    Pick<
      StorefrontAPI.MenuItem,
      'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
    > & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        > & {
          items: Array<
            Pick<
              StorefrontAPI.MenuItem,
              'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
            >
          >;
        }
      >;
    }
  >;
};

export type ShopFragment = Pick<StorefrontAPI.Shop, 'id' | 'name'> & {
  primaryDomain: Pick<StorefrontAPI.Domain, 'url'>;
  brand?: StorefrontAPI.Maybe<{
    logo?: StorefrontAPI.Maybe<{
      image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
    }>;
    squareLogo?: StorefrontAPI.Maybe<{
      image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
    }>;
  }>;
};

export type HeaderQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  headerMenuHandle: StorefrontAPI.Scalars['String']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HeaderQuery = {
  shop: Pick<StorefrontAPI.Shop, 'id' | 'name'> & {
    primaryDomain: Pick<StorefrontAPI.Domain, 'url'>;
    brand?: StorefrontAPI.Maybe<{
      logo?: StorefrontAPI.Maybe<{
        image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
      }>;
      squareLogo?: StorefrontAPI.Maybe<{
        image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
      }>;
    }>;
  };
  menu?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id'> & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        > & {
          items: Array<
            Pick<
              StorefrontAPI.MenuItem,
              'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
            > & {
              items: Array<
                Pick<
                  StorefrontAPI.MenuItem,
                  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
                >
              >;
            }
          >;
        }
      >;
    }
  >;
};

export type FooterQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  footerMenuHandle: StorefrontAPI.Scalars['String']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type FooterQuery = {
  menu?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id'> & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        > & {
          items: Array<
            Pick<
              StorefrontAPI.MenuItem,
              'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
            > & {
              items: Array<
                Pick<
                  StorefrontAPI.MenuItem,
                  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
                >
              >;
            }
          >;
        }
      >;
    }
  >;
};

export type CartApiMutationFragment = Pick<
  StorefrontAPI.Cart,
  'id' | 'totalQuantity' | 'checkoutUrl'
> & {attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>};

export type HwGeschenkKorbQueryVariables = StorefrontAPI.Exact<{
  cartId: StorefrontAPI.Scalars['ID']['input'];
}>;

export type HwGeschenkKorbQuery = {
  cart?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Cart, 'id'> & {
      discountCodes: Array<Pick<StorefrontAPI.CartDiscountCode, 'code'>>;
      discountAllocations: Array<
        Pick<StorefrontAPI.CartCodeDiscountAllocation, 'code'>
      >;
      lines: {
        nodes: Array<
          | (Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
              merchandise: {product: Pick<StorefrontAPI.Product, 'handle'>};
              discountAllocations: Array<
                Pick<StorefrontAPI.CartCodeDiscountAllocation, 'code'>
              >;
            })
          | (Pick<StorefrontAPI.ComponentizableCartLine, 'id' | 'quantity'> & {
              merchandise: {product: Pick<StorefrontAPI.Product, 'handle'>};
              discountAllocations: Array<
                Pick<StorefrontAPI.CartCodeDiscountAllocation, 'code'>
              >;
            })
        >;
      };
    }
  >;
};

export type KakaoLadenWeicheQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type KakaoLadenWeicheQuery = {
  shop: {
    metafield?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  };
};

export type PreismodusQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type PreismodusQuery = {
  shop: {
    metafield?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  };
};

export type KopfleisteStartseiteQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type KopfleisteStartseiteQuery = {
  shop: {
    metafield?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
    appleSeiten?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  };
};

export type QiAlphaReservierungVariantenQueryVariables = StorefrontAPI.Exact<{
  ids:
    | Array<StorefrontAPI.Scalars['ID']['input']>
    | StorefrontAPI.Scalars['ID']['input'];
}>;

export type QiAlphaReservierungVariantenQuery = {
  nodes: Array<
    StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ProductVariant, 'id' | 'title'> & {
        product: Pick<StorefrontAPI.Product, 'handle'>;
      }
    >
  >;
};

export type QiMasterAddonsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type QiMasterAddonsQuery = {
  wunschnummerNeu?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'id' | 'handle' | 'title'> & {
      variants: {
        nodes: Array<
          Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'title' | 'availableForSale'
          > & {
            product: Pick<StorefrontAPI.Product, 'id' | 'handle' | 'title'>;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
          }
        >;
      };
    }
  >;
  wunschnummer?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'id' | 'handle' | 'title'> & {
      variants: {
        nodes: Array<
          Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'title' | 'availableForSale'
          > & {
            product: Pick<StorefrontAPI.Product, 'id' | 'handle' | 'title'>;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
          }
        >;
      };
    }
  >;
  ketteNeu?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'id' | 'handle' | 'title'> & {
      variants: {
        nodes: Array<
          Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'title' | 'availableForSale'
          > & {
            product: Pick<StorefrontAPI.Product, 'id' | 'handle' | 'title'>;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
          }
        >;
      };
    }
  >;
  kette?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'id' | 'handle' | 'title'> & {
      variants: {
        nodes: Array<
          Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'title' | 'availableForSale'
          > & {
            product: Pick<StorefrontAPI.Product, 'id' | 'handle' | 'title'>;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
          }
        >;
      };
    }
  >;
};

export type QiMasterAddonFragment = Pick<
  StorefrontAPI.Product,
  'id' | 'handle' | 'title'
> & {
  variants: {
    nodes: Array<
      Pick<
        StorefrontAPI.ProductVariant,
        'id' | 'title' | 'availableForSale'
      > & {
        product: Pick<StorefrontAPI.Product, 'id' | 'handle' | 'title'>;
        selectedOptions: Array<
          Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
        >;
        price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      }
    >;
  };
};

export type SitemapBlogBestandQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type SitemapBlogBestandQuery = {
  blogs: {
    pageInfo: Pick<StorefrontAPI.PageInfo, 'hasNextPage'>;
    nodes: Array<
      Pick<StorefrontAPI.Blog, 'handle'> & {
        bestand: {nodes: Array<Pick<StorefrontAPI.Article, 'id'>>};
      }
    >;
  };
};

export type SitemapArtikelPfadeQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type SitemapArtikelPfadeQuery = {
  blogs: {
    pageInfo: Pick<StorefrontAPI.PageInfo, 'hasNextPage'>;
    nodes: Array<
      Pick<StorefrontAPI.Blog, 'handle'> & {
        artikel: {
          nodes: Array<Pick<StorefrontAPI.Article, 'handle'>>;
          pageInfo: Pick<StorefrontAPI.PageInfo, 'hasNextPage'>;
        };
      }
    >;
  };
};

export type StoreRobotsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type StoreRobotsQuery = {shop: Pick<StorefrontAPI.Shop, 'id'>};

export type FeaturedCollectionFragment = Pick<
  StorefrontAPI.Collection,
  'id' | 'title' | 'handle'
> & {
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
  >;
};

export type FeaturedCollectionQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type FeaturedCollectionQuery = {
  collections: {
    nodes: Array<
      Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'> & {
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
      }
    >;
  };
};

export type RecommendedProductFragment = Pick<
  StorefrontAPI.Product,
  'id' | 'title' | 'handle'
> & {
  priceRange: {
    minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  };
  featuredImage?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
  >;
};

export type RecommendedProductsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type RecommendedProductsQuery = {
  products: {
    nodes: Array<
      Pick<StorefrontAPI.Product, 'id' | 'title' | 'handle'> & {
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        featuredImage?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
      }
    >;
  };
};

export type ArticleQueryVariables = StorefrontAPI.Exact<{
  articleHandle: StorefrontAPI.Scalars['String']['input'];
  blogHandle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type ArticleQuery = {
  blog?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Blog, 'handle' | 'title'> & {
      articles: {nodes: Array<Pick<StorefrontAPI.Article, 'handle' | 'title'>>};
      articleByHandle?: StorefrontAPI.Maybe<
        Pick<
          StorefrontAPI.Article,
          'handle' | 'title' | 'contentHtml' | 'publishedAt' | 'excerpt'
        > & {
          author?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.ArticleAuthor, 'name'>
          >;
          image?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.Image,
              'id' | 'altText' | 'url' | 'width' | 'height'
            >
          >;
          seo?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Seo, 'description' | 'title'>
          >;
          hreflangEn?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Metafield, 'value'>
          >;
        }
      >;
    }
  >;
};

export type BlogQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  blogHandle: StorefrontAPI.Scalars['String']['input'];
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type BlogQuery = {
  blog?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Blog, 'title' | 'handle'> & {
      seo?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Seo, 'title' | 'description'>
      >;
      articles: {
        nodes: Array<
          Pick<
            StorefrontAPI.Article,
            'excerpt' | 'handle' | 'id' | 'publishedAt' | 'title'
          > & {
            author?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.ArticleAuthor, 'name'>
            >;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'altText' | 'url' | 'width' | 'height'
              >
            >;
            blog: Pick<StorefrontAPI.Blog, 'handle'>;
          }
        >;
        pageInfo: Pick<
          StorefrontAPI.PageInfo,
          'hasPreviousPage' | 'hasNextPage' | 'endCursor' | 'startCursor'
        >;
      };
      bestand: {nodes: Array<Pick<StorefrontAPI.Article, 'id'>>};
    }
  >;
};

export type ArticleItemFragment = Pick<
  StorefrontAPI.Article,
  'excerpt' | 'handle' | 'id' | 'publishedAt' | 'title'
> & {
  author?: StorefrontAPI.Maybe<Pick<StorefrontAPI.ArticleAuthor, 'name'>>;
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'altText' | 'url' | 'width' | 'height'>
  >;
  blog: Pick<StorefrontAPI.Blog, 'handle'>;
};

export type BlogsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type BlogsQuery = {
  blogs: {
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'hasNextPage' | 'hasPreviousPage' | 'startCursor' | 'endCursor'
    >;
    nodes: Array<
      Pick<StorefrontAPI.Blog, 'title' | 'handle'> & {
        seo?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Seo, 'title' | 'description'>
        >;
        bestand: {nodes: Array<Pick<StorefrontAPI.Article, 'id'>>};
      }
    >;
  };
};

export type MoneyProductItemFragment = Pick<
  StorefrontAPI.MoneyV2,
  'amount' | 'currencyCode'
>;

export type ProductItemFragment = Pick<
  StorefrontAPI.Product,
  'id' | 'handle' | 'title' | 'tags'
> & {
  featuredImage?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'altText' | 'url' | 'width' | 'height'>
  >;
  priceRange: {
    minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
    maxVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  };
};

export type CollectionQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type CollectionQuery = {
  collection?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Collection,
      'id' | 'handle' | 'title' | 'description'
    > & {
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
      >;
      seo: Pick<StorefrontAPI.Seo, 'description'>;
      products: {
        nodes: Array<
          Pick<StorefrontAPI.Product, 'id' | 'handle' | 'title' | 'tags'> & {
            featuredImage?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'altText' | 'url' | 'width' | 'height'
              >
            >;
            priceRange: {
              minVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
              maxVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
            };
          }
        >;
        pageInfo: Pick<
          StorefrontAPI.PageInfo,
          'hasPreviousPage' | 'hasNextPage' | 'endCursor' | 'startCursor'
        >;
      };
    }
  >;
};

export type CollectionFragment = Pick<
  StorefrontAPI.Collection,
  'id' | 'title' | 'handle'
> & {
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
  >;
};

export type StoreCollectionsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type StoreCollectionsQuery = {
  collections: {
    nodes: Array<
      Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'> & {
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
      }
    >;
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'hasNextPage' | 'hasPreviousPage' | 'startCursor' | 'endCursor'
    >;
  };
};

export type MoneyCollectionItemFragment = Pick<
  StorefrontAPI.MoneyV2,
  'amount' | 'currencyCode'
>;

export type CollectionItemFragment = Pick<
  StorefrontAPI.Product,
  'id' | 'handle' | 'title'
> & {
  featuredImage?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'altText' | 'url' | 'width' | 'height'>
  >;
  priceRange: {
    minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
    maxVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  };
};

export type CatalogQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type CatalogQuery = {
  products: {
    nodes: Array<
      Pick<StorefrontAPI.Product, 'id' | 'handle' | 'title'> & {
        featuredImage?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'altText' | 'url' | 'width' | 'height'
          >
        >;
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          maxVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
      }
    >;
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'hasPreviousPage' | 'hasNextPage' | 'startCursor' | 'endCursor'
    >;
  };
};

export type PageQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  handle: StorefrontAPI.Scalars['String']['input'];
}>;

export type PageQuery = {
  page?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Page, 'handle' | 'id' | 'title' | 'body'> & {
      seo?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Seo, 'description' | 'title'>
      >;
    }
  >;
};

export type CampaignProductFragment = Pick<
  StorefrontAPI.Product,
  'handle' | 'title'
> & {
  featuredImage?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'url' | 'altText'>
  >;
  images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
  priceRange: {
    minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  };
  variants: {
    nodes: Array<{
      compareAtPrice?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
    }>;
  };
};

export type CampaignProductsESmogSchutzQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type CampaignProductsESmogSchutzQuery = {
  qione?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
  bracelet?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
  qihome?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
};

export type GuideProduktFragment = Pick<StorefrontAPI.Product, 'handle'> & {
  featuredImage?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
  >;
};

export type LongevityGuideProdukteQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type LongevityGuideProdukteQuery = {
  qione?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
      >;
    }
  >;
  bracelet?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
      >;
    }
  >;
  kette?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
      >;
    }
  >;
  alpha?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
      >;
    }
  >;
};

export type ExclusiveProductVariantFragment = Pick<
  StorefrontAPI.ProductVariant,
  'id' | 'title' | 'availableForSale'
> & {
  selectedOptions: Array<Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>>;
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
  >;
  price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  product: Pick<StorefrontAPI.Product, 'handle' | 'title'>;
};

export type ExclusiveProductFragment = Pick<
  StorefrontAPI.Product,
  'handle' | 'title'
> & {
  featuredImage?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
  >;
  variants: {
    nodes: Array<
      Pick<
        StorefrontAPI.ProductVariant,
        'id' | 'title' | 'availableForSale'
      > & {
        selectedOptions: Array<
          Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
        >;
        image?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
        >;
        price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
        product: Pick<StorefrontAPI.Product, 'handle' | 'title'>;
      }
    >;
  };
};

export type ExclusiveProductsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type ExclusiveProductsQuery = {
  qihomeAir?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
      >;
      variants: {
        nodes: Array<
          Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'title' | 'availableForSale'
          > & {
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            product: Pick<StorefrontAPI.Product, 'handle' | 'title'>;
          }
        >;
      };
    }
  >;
  qione2Pro?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
      >;
      variants: {
        nodes: Array<
          Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'title' | 'availableForSale'
          > & {
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            product: Pick<StorefrontAPI.Product, 'handle' | 'title'>;
          }
        >;
      };
    }
  >;
  qibracelet?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
      >;
      variants: {
        nodes: Array<
          Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'title' | 'availableForSale'
          > & {
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            product: Pick<StorefrontAPI.Product, 'handle' | 'title'>;
          }
        >;
      };
    }
  >;
  qioneKette?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
      >;
      variants: {
        nodes: Array<
          Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'title' | 'availableForSale'
          > & {
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            product: Pick<StorefrontAPI.Product, 'handle' | 'title'>;
          }
        >;
      };
    }
  >;
};

export type CampaignProductsMenschenAlltagQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type CampaignProductsMenschenAlltagQuery = {
  qione?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
  bracelet?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
  qihome?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
};

export type PartnerProductFragment = Pick<
  StorefrontAPI.Product,
  'handle' | 'title'
> & {
  featuredImage?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'url' | 'altText'>
  >;
  images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
  priceRange: {
    minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  };
  variants: {
    nodes: Array<{
      compareAtPrice?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
    }>;
  };
};

export type CampaignProductsPartnerQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type CampaignProductsPartnerQuery = {
  qione?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
  bracelet?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
  qihome?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
};

export type CampaignProductsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type CampaignProductsQuery = {
  qione?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
  bracelet?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
  qihome?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
};

export type CampaignProductsSchlafZellenSchutzBQueryVariables =
  StorefrontAPI.Exact<{
    country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
    language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  }>;

export type CampaignProductsSchlafZellenSchutzBQuery = {
  qione?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
  bracelet?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
  qihome?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
};

export type CampaignProductsSchlafZellenSchutzB2QueryVariables =
  StorefrontAPI.Exact<{
    country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
    language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  }>;

export type CampaignProductsSchlafZellenSchutzB2Query = {
  qione?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
  bracelet?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
  qihome?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
};

export type CampaignProductsSchlafZellenSchutzK25QueryVariables =
  StorefrontAPI.Exact<{
    country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
    language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  }>;

export type CampaignProductsSchlafZellenSchutzK25Query = {
  qione?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
  bracelet?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
  qihome?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
};

export type CampaignProductsSchlafZellenSchutzK50QueryVariables =
  StorefrontAPI.Exact<{
    country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
    language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  }>;

export type CampaignProductsSchlafZellenSchutzK50Query = {
  qione?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
  bracelet?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
  qihome?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
};

export type CampaignProductV2Fragment = Pick<
  StorefrontAPI.Product,
  'handle' | 'title'
> & {
  featuredImage?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'url' | 'altText'>
  >;
  images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
  priceRange: {
    minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  };
  variants: {
    nodes: Array<{
      compareAtPrice?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
    }>;
  };
};

export type CampaignProductsSchlafZellenSchutzV2QueryVariables =
  StorefrontAPI.Exact<{
    country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
    language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  }>;

export type CampaignProductsSchlafZellenSchutzV2Query = {
  qione?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
  bracelet?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
  qihome?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
};

export type CampaignProductV3Fragment = Pick<
  StorefrontAPI.Product,
  'handle' | 'title'
> & {
  featuredImage?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'url' | 'altText'>
  >;
  images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
  priceRange: {
    minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  };
  variants: {
    nodes: Array<{
      compareAtPrice?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
    }>;
  };
};

export type CampaignProductsSchlafZellenSchutzV3QueryVariables =
  StorefrontAPI.Exact<{
    country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
    language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  }>;

export type CampaignProductsSchlafZellenSchutzV3Query = {
  qione?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
  bracelet?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
  qihome?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
};

export type CampaignProductsSchlafZellenSchutzQueryVariables =
  StorefrontAPI.Exact<{
    country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
    language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  }>;

export type CampaignProductsSchlafZellenSchutzQuery = {
  qione?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
  bracelet?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
  qihome?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
};

export type CampaignProductsTieferSchlafQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type CampaignProductsTieferSchlafQuery = {
  qione?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
  bracelet?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
  qihome?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
};

export type CampaignProductsZellSchutzQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type CampaignProductsZellSchutzQuery = {
  qione?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
  bracelet?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
  qihome?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Product, 'handle' | 'title'> & {
      featuredImage?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'url' | 'altText'>
      >;
      images: {nodes: Array<Pick<StorefrontAPI.Image, 'url' | 'altText'>>};
      priceRange: {
        minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      };
      variants: {
        nodes: Array<{
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }>;
      };
    }
  >;
};

export type PolicyFragment = Pick<
  StorefrontAPI.ShopPolicy,
  'body' | 'handle' | 'id' | 'title' | 'url'
>;

export type PolicyQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  privacyPolicy: StorefrontAPI.Scalars['Boolean']['input'];
  refundPolicy: StorefrontAPI.Scalars['Boolean']['input'];
  shippingPolicy: StorefrontAPI.Scalars['Boolean']['input'];
  termsOfService: StorefrontAPI.Scalars['Boolean']['input'];
}>;

export type PolicyQuery = {
  shop: {
    privacyPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
    shippingPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
    termsOfService?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
    refundPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
  };
};

export type PolicyItemFragment = Pick<
  StorefrontAPI.ShopPolicy,
  'id' | 'title' | 'handle'
>;

export type PoliciesQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type PoliciesQuery = {
  shop: {
    privacyPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    shippingPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    termsOfService?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    refundPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    subscriptionPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicyWithDefault, 'id' | 'title' | 'handle'>
    >;
  };
};

export type Necklace2VarianteFragment = Pick<
  StorefrontAPI.ProductVariant,
  'availableForSale' | 'id' | 'sku' | 'title'
> & {
  compareAtPrice?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
  image?: StorefrontAPI.Maybe<
    {__typename: 'Image'} & Pick<
      StorefrontAPI.Image,
      'id' | 'url' | 'altText' | 'width' | 'height'
    >
  >;
  price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
  selectedOptions: Array<Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>>;
  unitPrice?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
};

export type Necklace2QueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  handle: StorefrontAPI.Scalars['String']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  selectedOptions:
    | Array<StorefrontAPI.SelectedOptionInput>
    | StorefrontAPI.SelectedOptionInput;
}>;

export type Necklace2Query = {
  product?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Product,
      'id' | 'title' | 'vendor' | 'handle' | 'descriptionHtml' | 'description'
    > & {
      images: {
        nodes: Array<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
      };
      options: Array<
        Pick<StorefrontAPI.ProductOption, 'name'> & {
          optionValues: Array<
            Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
              firstSelectableVariant?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.ProductVariant,
                  'availableForSale' | 'id' | 'sku' | 'title'
                > & {
                  compareAtPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                  >;
                  image?: StorefrontAPI.Maybe<
                    {__typename: 'Image'} & Pick<
                      StorefrontAPI.Image,
                      'id' | 'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                  price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
                  product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
                  selectedOptions: Array<
                    Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                  >;
                  unitPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                  >;
                }
              >;
            }
          >;
        }
      >;
      selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
        Pick<
          StorefrontAPI.ProductVariant,
          'availableForSale' | 'id' | 'sku' | 'title'
        > & {
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
          image?: StorefrontAPI.Maybe<
            {__typename: 'Image'} & Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
          price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
          product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
          selectedOptions: Array<
            Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
          >;
          unitPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }
      >;
      adjacentVariants: Array<
        Pick<
          StorefrontAPI.ProductVariant,
          'availableForSale' | 'id' | 'sku' | 'title'
        > & {
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
          image?: StorefrontAPI.Maybe<
            {__typename: 'Image'} & Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
          price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
          product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
          selectedOptions: Array<
            Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
          >;
          unitPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }
      >;
      variants: {
        nodes: Array<
          Pick<
            StorefrontAPI.ProductVariant,
            'availableForSale' | 'id' | 'sku' | 'title'
          > & {
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
            image?: StorefrontAPI.Maybe<
              {__typename: 'Image'} & Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
            unitPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
          }
        >;
      };
      seo: Pick<StorefrontAPI.Seo, 'description' | 'title'>;
    }
  >;
};

export type SearchProductFragment = {__typename: 'Product'} & Pick<
  StorefrontAPI.Product,
  | 'handle'
  | 'id'
  | 'publishedAt'
  | 'tags'
  | 'title'
  | 'trackingParameters'
  | 'vendor'
> & {
    selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ProductVariant, 'id'> & {
        image?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
        >;
        price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
        compareAtPrice?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
        >;
        selectedOptions: Array<
          Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
        >;
        product: Pick<StorefrontAPI.Product, 'handle' | 'title'>;
      }
    >;
  };

export type SearchPageFragment = {__typename: 'Page'} & Pick<
  StorefrontAPI.Page,
  'handle' | 'id' | 'title' | 'trackingParameters'
>;

export type SearchArticleFragment = {__typename: 'Article'} & Pick<
  StorefrontAPI.Article,
  'handle' | 'id' | 'title' | 'trackingParameters'
>;

export type PageInfoFragmentFragment = Pick<
  StorefrontAPI.PageInfo,
  'hasNextPage' | 'hasPreviousPage' | 'startCursor' | 'endCursor'
>;

export type RegularSearchQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  term: StorefrontAPI.Scalars['String']['input'];
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type RegularSearchQuery = {
  articles: {
    nodes: Array<
      {__typename: 'Article'} & Pick<
        StorefrontAPI.Article,
        'handle' | 'id' | 'title' | 'trackingParameters'
      >
    >;
  };
  pages: {
    nodes: Array<
      {__typename: 'Page'} & Pick<
        StorefrontAPI.Page,
        'handle' | 'id' | 'title' | 'trackingParameters'
      >
    >;
  };
  products: {
    nodes: Array<
      {__typename: 'Product'} & Pick<
        StorefrontAPI.Product,
        | 'handle'
        | 'id'
        | 'publishedAt'
        | 'tags'
        | 'title'
        | 'trackingParameters'
        | 'vendor'
      > & {
          selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.ProductVariant, 'id'> & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
              product: Pick<StorefrontAPI.Product, 'handle' | 'title'>;
            }
          >;
        }
    >;
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'hasNextPage' | 'hasPreviousPage' | 'startCursor' | 'endCursor'
    >;
  };
};

export type PredictiveArticleFragment = {__typename: 'Article'} & Pick<
  StorefrontAPI.Article,
  'id' | 'title' | 'handle' | 'trackingParameters'
> & {
    blog: Pick<StorefrontAPI.Blog, 'handle'>;
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
    >;
  };

export type PredictiveCollectionFragment = {__typename: 'Collection'} & Pick<
  StorefrontAPI.Collection,
  'id' | 'title' | 'handle' | 'trackingParameters'
> & {
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
    >;
  };

export type PredictivePageFragment = {__typename: 'Page'} & Pick<
  StorefrontAPI.Page,
  'id' | 'title' | 'handle' | 'trackingParameters'
>;

export type PredictiveProductFragment = {__typename: 'Product'} & Pick<
  StorefrontAPI.Product,
  'id' | 'title' | 'handle' | 'tags' | 'trackingParameters'
> & {
    selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ProductVariant, 'id'> & {
        image?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
        >;
        price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      }
    >;
  };

export type PredictiveQueryFragment = {
  __typename: 'SearchQuerySuggestion';
} & Pick<
  StorefrontAPI.SearchQuerySuggestion,
  'text' | 'styledText' | 'trackingParameters'
>;

export type PredictiveSearchQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  limit: StorefrontAPI.Scalars['Int']['input'];
  limitScope: StorefrontAPI.PredictiveSearchLimitScope;
  term: StorefrontAPI.Scalars['String']['input'];
  types?: StorefrontAPI.InputMaybe<
    | Array<StorefrontAPI.PredictiveSearchType>
    | StorefrontAPI.PredictiveSearchType
  >;
}>;

export type PredictiveSearchQuery = {
  predictiveSearch?: StorefrontAPI.Maybe<{
    articles: Array<
      {__typename: 'Article'} & Pick<
        StorefrontAPI.Article,
        'id' | 'title' | 'handle' | 'trackingParameters'
      > & {
          blog: Pick<StorefrontAPI.Blog, 'handle'>;
          image?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
          >;
        }
    >;
    collections: Array<
      {__typename: 'Collection'} & Pick<
        StorefrontAPI.Collection,
        'id' | 'title' | 'handle' | 'trackingParameters'
      > & {
          image?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
          >;
        }
    >;
    pages: Array<
      {__typename: 'Page'} & Pick<
        StorefrontAPI.Page,
        'id' | 'title' | 'handle' | 'trackingParameters'
      >
    >;
    products: Array<
      {__typename: 'Product'} & Pick<
        StorefrontAPI.Product,
        'id' | 'title' | 'handle' | 'tags' | 'trackingParameters'
      > & {
          selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.ProductVariant, 'id'> & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            }
          >;
        }
    >;
    queries: Array<
      {__typename: 'SearchQuerySuggestion'} & Pick<
        StorefrontAPI.SearchQuerySuggestion,
        'text' | 'styledText' | 'trackingParameters'
      >
    >;
  }>;
};

interface GeneratedQueryTypes {
  '#graphql\n  fragment StartseitePreis on Product {\n    handle\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n  }\n\n  query StartseitePreise($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    qione: product(handle: "qione-2-pro") {\n      ...StartseitePreis\n    }\n    bracelet: product(handle: "qibracelet") {\n      ...StartseitePreis\n    }\n    qihome: product(handle: "qihome-air") {\n      ...StartseitePreis\n    }\n  }\n': {
    return: StartseitePreiseQuery;
    variables: StartseitePreiseQueryVariables;
  };
  '#graphql\n  fragment MmProduct on Product {\n    handle\n    title\n    featuredImage {\n      url\n      altText\n    }\n    images(first: 1) {\n      nodes {\n        url\n        altText\n      }\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    variants(first: 1) {\n      nodes {\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n      }\n    }\n  }\n\n  query MmCampaignProducts($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    qione: product(handle: "qione-2-pro") { ...MmProduct }\n    bracelet: product(handle: "qibracelet") { ...MmProduct }\n    qihome: product(handle: "qihome-air") { ...MmProduct }\n  }\n': {
    return: MmCampaignProductsQuery;
    variables: MmCampaignProductsQueryVariables;
  };
  '#graphql\n  query QiAlphaStahlkette($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    stahlkette: product(handle: "qi-alpha-stahlkette") {\n      id\n      handle\n      title\n      variants(first: 10) {\n        nodes {\n          id\n          title\n          product {\n            id\n            handle\n            title\n          }\n          selectedOptions {\n            name\n            value\n          }\n          availableForSale\n          price {\n            amount\n            currencyCode\n          }\n        }\n      }\n    }\n  }\n': {
    return: QiAlphaStahlketteQuery;
    variables: QiAlphaStahlketteQueryVariables;
  };
  "#graphql\n  query AlphaVorlageKetten(\n    $country: CountryCode\n    $language: LanguageCode\n    $stahl: String!\n    #REQUIRED_VAR=gold ? '$gold: String!' : ''\n  ) @inContext(country: $country, language: $language) {\n    stahl: product(handle: $stahl) { ...AlphaVorlageKette }\n    #REQUIRED_VAR=gold ? 'gold: product(handle: $gold) { ...AlphaVorlageKette ' : ''}\n  }\n  fragment AlphaVorlageKette on Product {\n    id\n    handle\n    title\n    variants(first: 50) {\n      nodes {\n        ...ProductVariant\n      }\n    }\n  }\n  #graphql\n  fragment ProductVariant on ProductVariant {\n    availableForSale\n    compareAtPrice {\n      amount\n      currencyCode\n    }\n    id\n    image {\n      __typename\n      id\n      url\n      altText\n      width\n      height\n    }\n    price {\n      amount\n      currencyCode\n    }\n    product {\n      title\n      handle\n    }\n    selectedOptions {\n      name\n      value\n    }\n    sku\n    title\n    unitPrice {\n      amount\n      currencyCode\n    }\n  }\n\n": {
    return: AlphaVorlageKettenQuery;
    variables: AlphaVorlageKettenQueryVariables;
  };
  '#graphql\n  query Product(\n    $country: CountryCode\n    $handle: String!\n    $language: LanguageCode\n    $selectedOptions: [SelectedOptionInput!]!\n  ) @inContext(country: $country, language: $language) {\n    product(handle: $handle) {\n      ...Product\n    }\n  }\n  #graphql\n  fragment Product on Product {\n    id\n    title\n    vendor\n    handle\n    descriptionHtml\n    description\n    encodedVariantExistence\n    encodedVariantAvailability\n    images(first: 10) {\n      nodes {\n        id\n        url\n        altText\n        width\n        height\n      }\n    }\n    options {\n      name\n      optionValues {\n        name\n        firstSelectableVariant {\n          ...ProductVariant\n        }\n        swatch {\n          color\n          image {\n            previewImage {\n              url\n            }\n          }\n        }\n      }\n    }\n    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {\n      ...ProductVariant\n    }\n    adjacentVariants (selectedOptions: $selectedOptions) {\n      ...ProductVariant\n    }\n    seo {\n      description\n      title\n    }\n  }\n  #graphql\n  fragment ProductVariant on ProductVariant {\n    availableForSale\n    compareAtPrice {\n      amount\n      currencyCode\n    }\n    id\n    image {\n      __typename\n      id\n      url\n      altText\n      width\n      height\n    }\n    price {\n      amount\n      currencyCode\n    }\n    product {\n      title\n      handle\n    }\n    selectedOptions {\n      name\n      value\n    }\n    sku\n    title\n    unitPrice {\n      amount\n      currencyCode\n    }\n  }\n\n\n': {
    return: ProductQuery;
    variables: ProductQueryVariables;
  };
  '#graphql\n  fragment VergleichPreis on Product {\n    handle\n    selectedOrFirstAvailableVariant(\n      selectedOptions: []\n      ignoreUnknownOptions: true\n      caseInsensitiveMatch: true\n    ) {\n      price {\n        amount\n        currencyCode\n      }\n    }\n  }\n  query GeraeteVergleichPreise($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    qione: product(handle: "qione-2-pro") {\n      ...VergleichPreis\n    }\n    bracelet: product(handle: "qibracelet") {\n      ...VergleichPreis\n    }\n    qihome: product(handle: "qihome-air") {\n      ...VergleichPreis\n    }\n  }\n': {
    return: GeraeteVergleichPreiseQuery;
    variables: GeraeteVergleichPreiseQueryVariables;
  };
  '#graphql\n  query KakaoSortenPreise($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    awake: product(handle: "crystal-cacao-awake") {\n      ...SortenPreis\n    }\n    create: product(handle: "crystal-cacao-create") {\n      ...SortenPreis\n    }\n  }\n  fragment SortenPreis on Product {\n    handle\n    selectedOrFirstAvailableVariant(\n      selectedOptions: []\n      ignoreUnknownOptions: true\n      caseInsensitiveMatch: true\n    ) {\n      price {\n        amount\n        currencyCode\n      }\n    }\n  }\n': {
    return: KakaoSortenPreiseQuery;
    variables: KakaoSortenPreiseQueryVariables;
  };
  '#graphql\n  fragment CrystalSpiegelFeaturedCollection on Collection {\n    id\n    title\n    image {\n      id\n      url\n      altText\n      width\n      height\n    }\n    handle\n  }\n  query CrystalSpiegelFeaturedCollection($country: CountryCode, $language: LanguageCode, $handle: String!)\n    @inContext(country: $country, language: $language) {\n    collection(handle: $handle) {\n      ...CrystalSpiegelFeaturedCollection\n    }\n  }\n': {
    return: CrystalSpiegelFeaturedCollectionQuery;
    variables: CrystalSpiegelFeaturedCollectionQueryVariables;
  };
  '#graphql\n  fragment SortenProdukt on Product {\n    id\n    title\n    handle\n    # Fuer den Kassenbetrag der Kachel (app/lib/kachel-kasse.js): dieselbe\n    # Variante, die die Kaufseite an ladeStaffelKasse gibt.\n    selectedOrFirstAvailableVariant {\n      id\n      price {\n        amount\n        currencyCode\n      }\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    featuredImage {\n      id\n      url\n      altText\n      width\n      height\n    }\n  }\n  query Sorten ($country: CountryCode, $language: LanguageCode, $awake: String!, $create: String!)\n    @inContext(country: $country, language: $language) {\n    awake: product(handle: $awake) {\n      ...SortenProdukt\n    }\n    create: product(handle: $create) {\n      ...SortenProdukt\n    }\n  }\n': {
    return: SortenQuery;
    variables: SortenQueryVariables;
  };
  '#graphql\n  query ComingHomeLive($language: LanguageCode, $blogHandle: String!)\n  @inContext(language: $language) {\n    blog(handle: $blogHandle) {\n      handle\n      # 250 = Hoechstwert je Seite; sortiert wird danach nach ch-datum.\n      articles(first: 250, sortKey: PUBLISHED_AT, reverse: true) {\n        nodes {\n          handle\n          title\n          excerpt\n          contentHtml\n          tags\n          publishedAt\n        }\n      }\n    }\n  }\n': {
    return: ComingHomeLiveQuery;
    variables: ComingHomeLiveQueryVariables;
  };
  '#graphql\n  fragment CourseProduct on Product {\n    handle\n    title\n    featuredImage {\n      url\n      altText\n    }\n    images(first: 1) {\n      nodes {\n        url\n        altText\n      }\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    variants(first: 1) {\n      nodes {\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n      }\n    }\n  }\n\n  query CourseProducts {\n    qione: product(handle: "qione-2-pro") {\n      ...CourseProduct\n    }\n    bracelet: product(handle: "qibracelet") {\n      ...CourseProduct\n    }\n    qihome: product(handle: "qihome-air") {\n      ...CourseProduct\n    }\n  }\n': {
    return: CourseProductsQuery;
    variables: CourseProductsQueryVariables;
  };
  '#graphql\n  fragment Shop on Shop {\n    id\n    name\n    # Kein description (03.11.2026): der Storefront liest shop.description\n    # nirgends. Shopify hat für das Feld keine Admin-Mutation, deshalb wird\n    # der alte Shoptext nicht mehr in jedes Seiten-JSON geladen.\n    primaryDomain {\n      url\n    }\n    brand {\n      logo {\n        image {\n          url\n        }\n      }\n      squareLogo {\n        image {\n          url\n        }\n      }\n    }\n  }\n  query Header(\n    $country: CountryCode\n    $headerMenuHandle: String!\n    $language: LanguageCode\n  ) @inContext(language: $language, country: $country) {\n    shop {\n      ...Shop\n    }\n    menu(handle: $headerMenuHandle) {\n      ...Menu\n    }\n  }\n  #graphql\n  fragment MenuItem on MenuItem {\n    id\n    resourceId\n    tags\n    title\n    type\n    url\n  }\n  # Ebene 3 für Gruppen wie Online-Kurse unter Mehr, Naht-Probe probe_menue_tiefe in website-navigation\n  fragment ChildMenuItem on MenuItem {\n    ...MenuItem\n    items {\n      ...MenuItem\n    }\n  }\n  fragment ParentMenuItem on MenuItem {\n    ...MenuItem\n    items {\n      ...ChildMenuItem\n    }\n  }\n  fragment Menu on Menu {\n    id\n    items {\n      ...ParentMenuItem\n    }\n  }\n\n': {
    return: HeaderQuery;
    variables: HeaderQueryVariables;
  };
  '#graphql\n  query Footer(\n    $country: CountryCode\n    $footerMenuHandle: String!\n    $language: LanguageCode\n  ) @inContext(language: $language, country: $country) {\n    menu(handle: $footerMenuHandle) {\n      ...Menu\n    }\n  }\n  #graphql\n  fragment MenuItem on MenuItem {\n    id\n    resourceId\n    tags\n    title\n    type\n    url\n  }\n  # Ebene 3 für Gruppen wie Online-Kurse unter Mehr, Naht-Probe probe_menue_tiefe in website-navigation\n  fragment ChildMenuItem on MenuItem {\n    ...MenuItem\n    items {\n      ...MenuItem\n    }\n  }\n  fragment ParentMenuItem on MenuItem {\n    ...MenuItem\n    items {\n      ...ChildMenuItem\n    }\n  }\n  fragment Menu on Menu {\n    id\n    items {\n      ...ParentMenuItem\n    }\n  }\n\n': {
    return: FooterQuery;
    variables: FooterQueryVariables;
  };
  '#graphql\n  query HwGeschenkKorb($cartId: ID!) {\n    cart(id: $cartId) {\n      id\n      discountCodes {\n        code\n      }\n      discountAllocations {\n        ... on CartCodeDiscountAllocation {\n          code\n        }\n      }\n      lines(first: 100) {\n        nodes {\n          id\n          quantity\n          merchandise {\n            ... on ProductVariant {\n              product {\n                handle\n              }\n            }\n          }\n          discountAllocations {\n            ... on CartCodeDiscountAllocation {\n              code\n            }\n          }\n        }\n      }\n    }\n  }\n': {
    return: HwGeschenkKorbQuery;
    variables: HwGeschenkKorbQueryVariables;
  };
  '#graphql\n  query KakaoLadenWeiche {\n    shop {\n      metafield(namespace: "qb_routing", key: "kakao_laden") {\n        value\n      }\n    }\n  }\n': {
    return: KakaoLadenWeicheQuery;
    variables: KakaoLadenWeicheQueryVariables;
  };
  '#graphql\n  query Preismodus {\n    shop {\n      metafield(namespace: "qb_preis", key: "modus") {\n        value\n      }\n    }\n  }\n': {
    return: PreismodusQuery;
    variables: PreismodusQueryVariables;
  };
  '#graphql\n  query KopfleisteStartseite {\n    shop {\n      metafield(namespace: "qb_kopfleiste", key: "startseite") {\n        value\n      }\n      appleSeiten: metafield(namespace: "qb_kopfleiste", key: "apple_seiten") {\n        value\n      }\n    }\n  }\n': {
    return: KopfleisteStartseiteQuery;
    variables: KopfleisteStartseiteQueryVariables;
  };
  '#graphql\n  query QiAlphaReservierungVarianten($ids: [ID!]!) {\n    nodes(ids: $ids) {\n      ... on ProductVariant {\n        id\n        title\n        product {\n          handle\n        }\n      }\n    }\n  }\n': {
    return: QiAlphaReservierungVariantenQuery;
    variables: QiAlphaReservierungVariantenQueryVariables;
  };
  '#graphql\n  query QiMasterAddons($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    wunschnummerNeu: product(handle: "qi-alpha-wunschnummer") {\n      ...QiMasterAddon\n    }\n    wunschnummer: product(handle: "qi-master-wunschnummer") {\n      ...QiMasterAddon\n    }\n    ketteNeu: product(handle: "qi-alpha-goldkette") {\n      ...QiMasterAddon\n    }\n    kette: product(handle: "qi-master-goldkette") {\n      ...QiMasterAddon\n    }\n  }\n  fragment QiMasterAddon on Product {\n    id\n    handle\n    title\n    variants(first: 250) {\n      nodes {\n        id\n        title\n        product {\n          id\n          handle\n          title\n        }\n        selectedOptions {\n          name\n          value\n        }\n        availableForSale\n        price {\n          amount\n          currencyCode\n        }\n      }\n    }\n  }\n': {
    return: QiMasterAddonsQuery;
    variables: QiMasterAddonsQueryVariables;
  };
  '#graphql\n  query SitemapBlogBestand($language: LanguageCode) @inContext(language: $language) {\n    blogs(first: 50) {\n      pageInfo {\n        hasNextPage\n      }\n      nodes {\n        handle\n        ...BlogBestand\n      }\n    }\n  }\n  #graphql\n  fragment BlogBestand on Blog {\n    bestand: articles(first: 1) {\n      nodes {\n        id\n      }\n    }\n  }\n\n': {
    return: SitemapBlogBestandQuery;
    variables: SitemapBlogBestandQueryVariables;
  };
  '#graphql\n  query SitemapArtikelPfade($language: LanguageCode) @inContext(language: $language) {\n    blogs(first: 50) {\n      pageInfo {\n        hasNextPage\n      }\n      nodes {\n        ...BlogArtikelPfad\n      }\n    }\n  }\n  #graphql\n  fragment BlogArtikelPfad on Blog {\n    handle\n    artikel: articles(first: 250) {\n      nodes {\n        handle\n      }\n      pageInfo {\n        hasNextPage\n      }\n    }\n  }\n\n': {
    return: SitemapArtikelPfadeQuery;
    variables: SitemapArtikelPfadeQueryVariables;
  };
  '#graphql\n  query StoreRobots($country: CountryCode, $language: LanguageCode)\n   @inContext(country: $country, language: $language) {\n    shop {\n      id\n    }\n  }\n': {
    return: StoreRobotsQuery;
    variables: StoreRobotsQueryVariables;
  };
  '#graphql\n  fragment FeaturedCollection on Collection {\n    id\n    title\n    image {\n      id\n      url\n      altText\n      width\n      height\n    }\n    handle\n  }\n  query FeaturedCollection($country: CountryCode, $language: LanguageCode)\n    @inContext(country: $country, language: $language) {\n    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {\n      nodes {\n        ...FeaturedCollection\n      }\n    }\n  }\n': {
    return: FeaturedCollectionQuery;
    variables: FeaturedCollectionQueryVariables;
  };
  '#graphql\n  fragment RecommendedProduct on Product {\n    id\n    title\n    handle\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    featuredImage {\n      id\n      url\n      altText\n      width\n      height\n    }\n  }\n  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)\n    @inContext(country: $country, language: $language) {\n    products(first: 4, sortKey: UPDATED_AT, reverse: true) {\n      nodes {\n        ...RecommendedProduct\n      }\n    }\n  }\n': {
    return: RecommendedProductsQuery;
    variables: RecommendedProductsQueryVariables;
  };
  '#graphql\n  query Article(\n    $articleHandle: String!\n    $blogHandle: String!\n    $country: CountryCode\n    $language: LanguageCode\n  ) @inContext(language: $language, country: $country) {\n    blog(handle: $blogHandle) {\n      handle\n      # title: Name der mittleren Brotkrumen-Stufe, derselbe wie auf dem\n      # Blogindex (blog-schema.js, GEO M2).\n      title\n      # NUR handle und title, bewusst KEIN contentHtml und kein Bild:\n      # der Abschluss-Block braucht Namen, keine Inhalte. Ein zweites Mal\n      # Artikeltext im Payload war 2026-09-03 der Grund, warum die Uebersicht\n      # 183 KB wog.\n      # Neueste zuerst und alle (bis 100), damit weiterlesenNachbarn die\n      # Stelle des aktuellen Beitrags in der Reihe kennt.\n      articles(first: 100, sortKey: PUBLISHED_AT, reverse: true) {\n        nodes {\n          handle\n          title\n        }\n      }\n      articleByHandle(handle: $articleHandle) {\n        handle\n        title\n        contentHtml\n        publishedAt\n        author: authorV2 {\n          name\n        }\n        image {\n          id\n          altText\n          url\n          width\n          height\n        }\n        excerpt\n        seo {\n          description\n          title\n        }\n        # DER ARTIKEL trägt SEINEN hreflang-PARTNER SELBST (2026-09-08).\n        # Namensraum \'custom\' und nicht \'qb\': Shopify lehnt \'qb\' hart ab\n        # ("Namespace is too short (minimum is 3 characters)", live gemessen\n        # auf articleUpdate UND metafieldsSet). Sichtbar ist das Feld hier nur,\n        # weil es eine Definition mit access.storefront=PUBLIC_READ hat\n        # (MetafieldDefinition/167767179532) — ohne Definition gibt die\n        # Storefront-API null zurück, obwohl der Wert im Admin steht.\n        # Geschrieben von blog-redaktion/src/publizier.py, und zwar erst, wenn\n        # BEIDE Fassungen veroeffentlicht sind: hreflang wirkt nur reziprok.\n        hreflangEn: metafield(namespace: "custom", key: "hreflang_en") {\n          value\n        }\n      }\n    }\n  }\n': {
    return: ArticleQuery;
    variables: ArticleQueryVariables;
  };
  '#graphql\n  query Blog(\n    $language: LanguageCode\n    $blogHandle: String!\n    $first: Int\n    $last: Int\n    $startCursor: String\n    $endCursor: String\n  ) @inContext(language: $language) {\n    blog(handle: $blogHandle) {\n      title\n      handle\n      seo {\n        title\n        description\n      }\n      ...BlogBestand\n      articles(\n        first: $first,\n        last: $last,\n        before: $startCursor,\n        after: $endCursor,\n        sortKey: PUBLISHED_AT,\n        reverse: true\n      ) {\n        nodes {\n          ...ArticleItem\n        }\n        pageInfo {\n          hasPreviousPage\n          hasNextPage\n          hasNextPage\n          endCursor\n          startCursor\n        }\n\n      }\n    }\n  }\n  #graphql\n  fragment BlogBestand on Blog {\n    bestand: articles(first: 1) {\n      nodes {\n        id\n      }\n    }\n  }\n\n  fragment ArticleItem on Article {\n    author: authorV2 {\n      name\n    }\n    excerpt\n    handle\n    id\n    image {\n      id\n      altText\n      url\n      width\n      height\n    }\n    publishedAt\n    title\n    blog {\n      handle\n    }\n  }\n': {
    return: BlogQuery;
    variables: BlogQueryVariables;
  };
  '#graphql\n  query Blogs(\n    $country: CountryCode\n    $endCursor: String\n    $first: Int\n    $language: LanguageCode\n    $last: Int\n    $startCursor: String\n  ) @inContext(country: $country, language: $language) {\n    blogs(\n      first: $first,\n      last: $last,\n      before: $startCursor,\n      after: $endCursor\n    ) {\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n      nodes {\n        title\n        handle\n        seo {\n          title\n          description\n        }\n        ...BlogBestand\n      }\n    }\n  }\n  #graphql\n  fragment BlogBestand on Blog {\n    bestand: articles(first: 1) {\n      nodes {\n        id\n      }\n    }\n  }\n\n': {
    return: BlogsQuery;
    variables: BlogsQueryVariables;
  };
  '#graphql\n  #graphql\n  fragment MoneyProductItem on MoneyV2 {\n    amount\n    currencyCode\n  }\n  fragment ProductItem on Product {\n    id\n    handle\n    title\n    # tags: für den Tag-Weg von ~/lib/such-ausschluss (qb-nicht-suchbar).\n    tags\n    featuredImage {\n      id\n      altText\n      url\n      width\n      height\n    }\n    priceRange {\n      minVariantPrice {\n        ...MoneyProductItem\n      }\n      maxVariantPrice {\n        ...MoneyProductItem\n      }\n    }\n  }\n\n  query Collection(\n    $handle: String!\n    $country: CountryCode\n    $language: LanguageCode\n    $first: Int\n    $last: Int\n    $startCursor: String\n    $endCursor: String\n  ) @inContext(country: $country, language: $language) {\n    collection(handle: $handle) {\n      id\n      handle\n      title\n      description\n      # BEWUSST GEHOLT, OBWOHL ES HEUTE IMMER null IST: am 2026-09-12 über die\n      # Storefront-API gemessen führt KEINE der neun Kollektionen ein eigenes\n      # Bild. Ohne dieses Feld bliebe die erste Stufe von teilbild() dauerhaft\n      # tot; mit ihm wirkt ein in Shopify hinterlegtes Kollektionsbild ohne\n      # Code-Aenderung.\n      image {\n        id\n        url\n        altText\n        width\n        height\n      }\n      seo {\n        description\n      }\n      products(\n        first: $first,\n        last: $last,\n        before: $startCursor,\n        after: $endCursor\n      ) {\n        nodes {\n          ...ProductItem\n        }\n        pageInfo {\n          hasPreviousPage\n          hasNextPage\n          endCursor\n          startCursor\n        }\n      }\n    }\n  }\n': {
    return: CollectionQuery;
    variables: CollectionQueryVariables;
  };
  '#graphql\n  fragment Collection on Collection {\n    id\n    title\n    handle\n    image {\n      id\n      url\n      altText\n      width\n      height\n    }\n  }\n  query StoreCollections(\n    $country: CountryCode\n    $endCursor: String\n    $first: Int\n    $language: LanguageCode\n    $last: Int\n    $startCursor: String\n  ) @inContext(country: $country, language: $language) {\n    collections(\n      first: $first,\n      last: $last,\n      before: $startCursor,\n      after: $endCursor\n    ) {\n      nodes {\n        ...Collection\n      }\n      pageInfo {\n        hasNextPage\n        hasPreviousPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n': {
    return: StoreCollectionsQuery;
    variables: StoreCollectionsQueryVariables;
  };
  '#graphql\n  query Catalog(\n    $country: CountryCode\n    $language: LanguageCode\n    $first: Int\n    $last: Int\n    $startCursor: String\n    $endCursor: String\n  ) @inContext(country: $country, language: $language) {\n    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {\n      nodes {\n        ...CollectionItem\n      }\n      pageInfo {\n        hasPreviousPage\n        hasNextPage\n        startCursor\n        endCursor\n      }\n    }\n  }\n  #graphql\n  fragment MoneyCollectionItem on MoneyV2 {\n    amount\n    currencyCode\n  }\n  fragment CollectionItem on Product {\n    id\n    handle\n    title\n    featuredImage {\n      id\n      altText\n      url\n      width\n      height\n    }\n    priceRange {\n      minVariantPrice {\n        ...MoneyCollectionItem\n      }\n      maxVariantPrice {\n        ...MoneyCollectionItem\n      }\n    }\n  }\n\n': {
    return: CatalogQuery;
    variables: CatalogQueryVariables;
  };
  '#graphql\n  query Page(\n    $language: LanguageCode,\n    $country: CountryCode,\n    $handle: String!\n  )\n  @inContext(language: $language, country: $country) {\n    page(handle: $handle) {\n      handle\n      id\n      title\n      body\n      seo {\n        description\n        title\n      }\n    }\n  }\n': {
    return: PageQuery;
    variables: PageQueryVariables;
  };
  '#graphql\n  fragment CampaignProduct on Product {\n    handle\n    title\n    featuredImage {\n      url\n      altText\n    }\n    images(first: 1) {\n      nodes {\n        url\n        altText\n      }\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    variants(first: 1) {\n      nodes {\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n      }\n    }\n  }\n\n  query CampaignProductsESmogSchutz($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    qione: product(handle: "qione-2-pro") {\n      ...CampaignProduct\n    }\n    bracelet: product(handle: "qibracelet") {\n      ...CampaignProduct\n    }\n    qihome: product(handle: "qihome-air") {\n      ...CampaignProduct\n    }\n  }\n': {
    return: CampaignProductsESmogSchutzQuery;
    variables: CampaignProductsESmogSchutzQueryVariables;
  };
  '#graphql\n  fragment GuideProdukt on Product {\n    handle\n    featuredImage {\n      url(transform: {maxWidth: 720, maxHeight: 720})\n      altText\n      width\n      height\n    }\n  }\n\n  query LongevityGuideProdukte($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    qione: product(handle: "qione-2-pro") {\n      ...GuideProdukt\n    }\n    bracelet: product(handle: "qibracelet") {\n      ...GuideProdukt\n    }\n    kette: product(handle: "qione-kette") {\n      ...GuideProdukt\n    }\n    alpha: product(handle: "qi-alpha") {\n      ...GuideProdukt\n    }\n  }\n': {
    return: LongevityGuideProdukteQuery;
    variables: LongevityGuideProdukteQueryVariables;
  };
  '#graphql\n  query Page(\n    $language: LanguageCode,\n    $country: CountryCode,\n    $handle: String!\n  ) @inContext(language: $language, country: $country) {\n    page(handle: $handle) {\n      handle\n      id\n      title\n      body\n      seo { description title }\n    }\n  }\n': {
    return: PageQuery;
    variables: PageQueryVariables;
  };
  '#graphql\n  fragment ExclusiveProductVariant on ProductVariant {\n    id\n    title\n    availableForSale\n    selectedOptions {\n      name\n      value\n    }\n    image {\n      url\n      altText\n      width\n      height\n    }\n    price {\n      amount\n      currencyCode\n    }\n    product {\n      handle\n      title\n    }\n  }\n\n  fragment ExclusiveProduct on Product {\n    handle\n    title\n    featuredImage {\n      url\n      altText\n      width\n      height\n    }\n    variants(first: 50) {\n      nodes {\n        ...ExclusiveProductVariant\n      }\n    }\n  }\n\n  query ExclusiveProducts($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    qihomeAir: product(handle: "qihome-air") {\n      ...ExclusiveProduct\n    }\n    qione2Pro: product(handle: "qione-2-pro") {\n      ...ExclusiveProduct\n    }\n    qibracelet: product(handle: "qibracelet") {\n      ...ExclusiveProduct\n    }\n    qioneKette: product(handle: "qione-kette") {\n      ...ExclusiveProduct\n    }\n  }\n': {
    return: ExclusiveProductsQuery;
    variables: ExclusiveProductsQueryVariables;
  };
  '#graphql\n  fragment CampaignProduct on Product {\n    handle\n    title\n    featuredImage {\n      url\n      altText\n    }\n    images(first: 1) {\n      nodes {\n        url\n        altText\n      }\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    variants(first: 1) {\n      nodes {\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n      }\n    }\n  }\n\n  query CampaignProductsMenschenAlltag($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    qione: product(handle: "qione-2-pro") {\n      ...CampaignProduct\n    }\n    bracelet: product(handle: "qibracelet") {\n      ...CampaignProduct\n    }\n    qihome: product(handle: "qihome-air") {\n      ...CampaignProduct\n    }\n  }\n': {
    return: CampaignProductsMenschenAlltagQuery;
    variables: CampaignProductsMenschenAlltagQueryVariables;
  };
  '#graphql\n  fragment PartnerProduct on Product {\n    handle\n    title\n    featuredImage {\n      url\n      altText\n    }\n    images(first: 1) {\n      nodes {\n        url\n        altText\n      }\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    variants(first: 1) {\n      nodes {\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n      }\n    }\n  }\n\n  query CampaignProductsPartner($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    qione: product(handle: "qione-2-pro") {\n      ...PartnerProduct\n    }\n    bracelet: product(handle: "qibracelet") {\n      ...PartnerProduct\n    }\n    qihome: product(handle: "qihome-air") {\n      ...PartnerProduct\n    }\n  }\n': {
    return: CampaignProductsPartnerQuery;
    variables: CampaignProductsPartnerQueryVariables;
  };
  '#graphql\n  fragment CampaignProduct on Product {\n    handle\n    title\n    featuredImage {\n      url\n      altText\n    }\n    images(first: 1) {\n      nodes {\n        url\n        altText\n      }\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    variants(first: 1) {\n      nodes {\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n      }\n    }\n  }\n\n  query CampaignProducts($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    qione: product(handle: "qione-2-pro") {\n      ...CampaignProduct\n    }\n    bracelet: product(handle: "qibracelet") {\n      ...CampaignProduct\n    }\n    qihome: product(handle: "qihome-air") {\n      ...CampaignProduct\n    }\n  }\n': {
    return: CampaignProductsQuery;
    variables: CampaignProductsQueryVariables;
  };
  '#graphql\n  fragment CampaignProduct on Product {\n    handle\n    title\n    featuredImage {\n      url\n      altText\n    }\n    images(first: 1) {\n      nodes {\n        url\n        altText\n      }\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    variants(first: 1) {\n      nodes {\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n      }\n    }\n  }\n\n  query CampaignProductsSchlafZellenSchutzB($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    qione: product(handle: "qione-2-pro") {\n      ...CampaignProduct\n    }\n    bracelet: product(handle: "qibracelet") {\n      ...CampaignProduct\n    }\n    qihome: product(handle: "qihome-air") {\n      ...CampaignProduct\n    }\n  }\n': {
    return: CampaignProductsSchlafZellenSchutzBQuery;
    variables: CampaignProductsSchlafZellenSchutzBQueryVariables;
  };
  '#graphql\n  fragment CampaignProduct on Product {\n    handle\n    title\n    featuredImage {\n      url\n      altText\n    }\n    images(first: 1) {\n      nodes {\n        url\n        altText\n      }\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    variants(first: 1) {\n      nodes {\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n      }\n    }\n  }\n\n  query CampaignProductsSchlafZellenSchutzB2($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    qione: product(handle: "qione-2-pro") {\n      ...CampaignProduct\n    }\n    bracelet: product(handle: "qibracelet") {\n      ...CampaignProduct\n    }\n    qihome: product(handle: "qihome-air") {\n      ...CampaignProduct\n    }\n  }\n': {
    return: CampaignProductsSchlafZellenSchutzB2Query;
    variables: CampaignProductsSchlafZellenSchutzB2QueryVariables;
  };
  '#graphql\n  fragment CampaignProduct on Product {\n    handle\n    title\n    featuredImage {\n      url\n      altText\n    }\n    images(first: 1) {\n      nodes {\n        url\n        altText\n      }\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    variants(first: 1) {\n      nodes {\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n      }\n    }\n  }\n\n  query CampaignProductsSchlafZellenSchutzK25($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    qione: product(handle: "qione-2-pro") {\n      ...CampaignProduct\n    }\n    bracelet: product(handle: "qibracelet") {\n      ...CampaignProduct\n    }\n    qihome: product(handle: "qihome-air") {\n      ...CampaignProduct\n    }\n  }\n': {
    return: CampaignProductsSchlafZellenSchutzK25Query;
    variables: CampaignProductsSchlafZellenSchutzK25QueryVariables;
  };
  '#graphql\n  fragment CampaignProduct on Product {\n    handle\n    title\n    featuredImage {\n      url\n      altText\n    }\n    images(first: 1) {\n      nodes {\n        url\n        altText\n      }\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    variants(first: 1) {\n      nodes {\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n      }\n    }\n  }\n\n  query CampaignProductsSchlafZellenSchutzK50($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    qione: product(handle: "qione-2-pro") {\n      ...CampaignProduct\n    }\n    bracelet: product(handle: "qibracelet") {\n      ...CampaignProduct\n    }\n    qihome: product(handle: "qihome-air") {\n      ...CampaignProduct\n    }\n  }\n': {
    return: CampaignProductsSchlafZellenSchutzK50Query;
    variables: CampaignProductsSchlafZellenSchutzK50QueryVariables;
  };
  '#graphql\n  fragment CampaignProductV2 on Product {\n    handle\n    title\n    featuredImage {\n      url\n      altText\n    }\n    images(first: 1) {\n      nodes {\n        url\n        altText\n      }\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    variants(first: 1) {\n      nodes {\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n      }\n    }\n  }\n\n  query CampaignProductsSchlafZellenSchutzV2($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    qione: product(handle: "qione-2-pro") {\n      ...CampaignProductV2\n    }\n    bracelet: product(handle: "qibracelet") {\n      ...CampaignProductV2\n    }\n    qihome: product(handle: "qihome-air") {\n      ...CampaignProductV2\n    }\n  }\n': {
    return: CampaignProductsSchlafZellenSchutzV2Query;
    variables: CampaignProductsSchlafZellenSchutzV2QueryVariables;
  };
  '#graphql\n  fragment CampaignProductV3 on Product {\n    handle\n    title\n    featuredImage {\n      url\n      altText\n    }\n    images(first: 1) {\n      nodes {\n        url\n        altText\n      }\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    variants(first: 1) {\n      nodes {\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n      }\n    }\n  }\n\n  query CampaignProductsSchlafZellenSchutzV3($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    qione: product(handle: "qione-2-pro") {\n      ...CampaignProductV3\n    }\n    bracelet: product(handle: "qibracelet") {\n      ...CampaignProductV3\n    }\n    qihome: product(handle: "qihome-air") {\n      ...CampaignProductV3\n    }\n  }\n': {
    return: CampaignProductsSchlafZellenSchutzV3Query;
    variables: CampaignProductsSchlafZellenSchutzV3QueryVariables;
  };
  '#graphql\n  fragment CampaignProduct on Product {\n    handle\n    title\n    featuredImage {\n      url\n      altText\n    }\n    images(first: 1) {\n      nodes {\n        url\n        altText\n      }\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    variants(first: 1) {\n      nodes {\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n      }\n    }\n  }\n\n  query CampaignProductsSchlafZellenSchutz($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    qione: product(handle: "qione-2-pro") {\n      ...CampaignProduct\n    }\n    bracelet: product(handle: "qibracelet") {\n      ...CampaignProduct\n    }\n    qihome: product(handle: "qihome-air") {\n      ...CampaignProduct\n    }\n  }\n': {
    return: CampaignProductsSchlafZellenSchutzQuery;
    variables: CampaignProductsSchlafZellenSchutzQueryVariables;
  };
  '#graphql\n  fragment CampaignProduct on Product {\n    handle\n    title\n    featuredImage {\n      url\n      altText\n    }\n    images(first: 1) {\n      nodes {\n        url\n        altText\n      }\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    variants(first: 1) {\n      nodes {\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n      }\n    }\n  }\n\n  query CampaignProductsTieferSchlaf($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    qione: product(handle: "qione-2-pro") {\n      ...CampaignProduct\n    }\n    bracelet: product(handle: "qibracelet") {\n      ...CampaignProduct\n    }\n    qihome: product(handle: "qihome-air") {\n      ...CampaignProduct\n    }\n  }\n': {
    return: CampaignProductsTieferSchlafQuery;
    variables: CampaignProductsTieferSchlafQueryVariables;
  };
  '#graphql\n  fragment CampaignProduct on Product {\n    handle\n    title\n    featuredImage {\n      url\n      altText\n    }\n    images(first: 1) {\n      nodes {\n        url\n        altText\n      }\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    variants(first: 1) {\n      nodes {\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n      }\n    }\n  }\n\n  query CampaignProductsZellSchutz($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    qione: product(handle: "qione-2-pro") {\n      ...CampaignProduct\n    }\n    bracelet: product(handle: "qibracelet") {\n      ...CampaignProduct\n    }\n    qihome: product(handle: "qihome-air") {\n      ...CampaignProduct\n    }\n  }\n': {
    return: CampaignProductsZellSchutzQuery;
    variables: CampaignProductsZellSchutzQueryVariables;
  };
  '#graphql\n  fragment Policy on ShopPolicy {\n    body\n    handle\n    id\n    title\n    url\n  }\n  query Policy(\n    $country: CountryCode\n    $language: LanguageCode\n    $privacyPolicy: Boolean!\n    $refundPolicy: Boolean!\n    $shippingPolicy: Boolean!\n    $termsOfService: Boolean!\n  ) @inContext(language: $language, country: $country) {\n    shop {\n      privacyPolicy @include(if: $privacyPolicy) {\n        ...Policy\n      }\n      shippingPolicy @include(if: $shippingPolicy) {\n        ...Policy\n      }\n      termsOfService @include(if: $termsOfService) {\n        ...Policy\n      }\n      refundPolicy @include(if: $refundPolicy) {\n        ...Policy\n      }\n    }\n  }\n': {
    return: PolicyQuery;
    variables: PolicyQueryVariables;
  };
  '#graphql\n  fragment PolicyItem on ShopPolicy {\n    id\n    title\n    handle\n  }\n  query Policies ($country: CountryCode, $language: LanguageCode)\n    @inContext(country: $country, language: $language) {\n    shop {\n      privacyPolicy {\n        ...PolicyItem\n      }\n      shippingPolicy {\n        ...PolicyItem\n      }\n      termsOfService {\n        ...PolicyItem\n      }\n      refundPolicy {\n        ...PolicyItem\n      }\n      subscriptionPolicy {\n        id\n        title\n        handle\n      }\n    }\n  }\n': {
    return: PoliciesQuery;
    variables: PoliciesQueryVariables;
  };
  '#graphql\n  query Necklace2(\n    $country: CountryCode\n    $handle: String!\n    $language: LanguageCode\n    $selectedOptions: [SelectedOptionInput!]!\n  ) @inContext(country: $country, language: $language) {\n    product(handle: $handle) {\n      id\n      title\n      vendor\n      handle\n      descriptionHtml\n      description\n      images(first: 10) { nodes { id url altText width height } }\n      options { name optionValues { name firstSelectableVariant { ...Necklace2Variante } } }\n      selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {\n        ...Necklace2Variante\n      }\n      adjacentVariants(selectedOptions: $selectedOptions) { ...Necklace2Variante }\n      variants(first: 20) { nodes { ...Necklace2Variante } }\n      seo { description title }\n    }\n  }\n  #graphql\n  fragment Necklace2Variante on ProductVariant {\n    availableForSale\n    compareAtPrice { amount currencyCode }\n    id\n    image { __typename id url altText width height }\n    price { amount currencyCode }\n    product { title handle }\n    selectedOptions { name value }\n    sku\n    title\n    unitPrice { amount currencyCode }\n  }\n\n': {
    return: Necklace2Query;
    variables: Necklace2QueryVariables;
  };
  '#graphql\n  query RegularSearch(\n    $country: CountryCode\n    $endCursor: String\n    $first: Int\n    $language: LanguageCode\n    $last: Int\n    $term: String!\n    $startCursor: String\n  ) @inContext(country: $country, language: $language) {\n    articles: search(\n      query: $term,\n      types: [ARTICLE],\n      first: $first,\n    ) {\n      nodes {\n        ...on Article {\n          ...SearchArticle\n        }\n      }\n    }\n    pages: search(\n      query: $term,\n      types: [PAGE],\n      first: $first,\n    ) {\n      nodes {\n        ...on Page {\n          ...SearchPage\n        }\n      }\n    }\n    products: search(\n      after: $endCursor,\n      before: $startCursor,\n      first: $first,\n      last: $last,\n      query: $term,\n      sortKey: RELEVANCE,\n      types: [PRODUCT],\n      unavailableProducts: HIDE,\n    ) {\n      nodes {\n        ...on Product {\n          ...SearchProduct\n        }\n      }\n      pageInfo {\n        ...PageInfoFragment\n      }\n    }\n  }\n  #graphql\n  fragment SearchProduct on Product {\n    __typename\n    handle\n    id\n    publishedAt\n    tags\n    title\n    trackingParameters\n    vendor\n    selectedOrFirstAvailableVariant(\n      selectedOptions: []\n      ignoreUnknownOptions: true\n      caseInsensitiveMatch: true\n    ) {\n      id\n      image {\n        url\n        altText\n        width\n        height\n      }\n      price {\n        amount\n        currencyCode\n      }\n      compareAtPrice {\n        amount\n        currencyCode\n      }\n      selectedOptions {\n        name\n        value\n      }\n      product {\n        handle\n        title\n      }\n    }\n  }\n\n  #graphql\n  fragment SearchPage on Page {\n     __typename\n     handle\n    id\n    title\n    trackingParameters\n  }\n\n  #graphql\n  fragment SearchArticle on Article {\n    __typename\n    handle\n    id\n    title\n    trackingParameters\n  }\n\n  #graphql\n  fragment PageInfoFragment on PageInfo {\n    hasNextPage\n    hasPreviousPage\n    startCursor\n    endCursor\n  }\n\n': {
    return: RegularSearchQuery;
    variables: RegularSearchQueryVariables;
  };
  '#graphql\n  query PredictiveSearch(\n    $country: CountryCode\n    $language: LanguageCode\n    $limit: Int!\n    $limitScope: PredictiveSearchLimitScope!\n    $term: String!\n    $types: [PredictiveSearchType!]\n  ) @inContext(country: $country, language: $language) {\n    predictiveSearch(\n      limit: $limit,\n      limitScope: $limitScope,\n      query: $term,\n      types: $types,\n    ) {\n      articles {\n        ...PredictiveArticle\n      }\n      collections {\n        ...PredictiveCollection\n      }\n      pages {\n        ...PredictivePage\n      }\n      products {\n        ...PredictiveProduct\n      }\n      queries {\n        ...PredictiveQuery\n      }\n    }\n  }\n  #graphql\n  fragment PredictiveArticle on Article {\n    __typename\n    id\n    title\n    handle\n    blog {\n      handle\n    }\n    image {\n      url\n      altText\n      width\n      height\n    }\n    trackingParameters\n  }\n\n  #graphql\n  fragment PredictiveCollection on Collection {\n    __typename\n    id\n    title\n    handle\n    image {\n      url\n      altText\n      width\n      height\n    }\n    trackingParameters\n  }\n\n  #graphql\n  fragment PredictivePage on Page {\n    __typename\n    id\n    title\n    handle\n    trackingParameters\n  }\n\n  #graphql\n  fragment PredictiveProduct on Product {\n    __typename\n    id\n    title\n    handle\n    tags\n    trackingParameters\n    selectedOrFirstAvailableVariant(\n      selectedOptions: []\n      ignoreUnknownOptions: true\n      caseInsensitiveMatch: true\n    ) {\n      id\n      image {\n        url\n        altText\n        width\n        height\n      }\n      price {\n        amount\n        currencyCode\n      }\n    }\n  }\n\n  #graphql\n  fragment PredictiveQuery on SearchQuerySuggestion {\n    __typename\n    text\n    styledText\n    trackingParameters\n  }\n\n': {
    return: PredictiveSearchQuery;
    variables: PredictiveSearchQueryVariables;
  };
}

interface GeneratedMutationTypes {
  '#graphql\n  mutation StaffelKasse($lines: [CartLineInput!]!, $land: CountryCode!) {\n    cartCreate(input: {lines: $lines, buyerIdentity: {countryCode: $land}}) {\n      cart {\n        totalQuantity\n        lines(first: 2) {\n          nodes {\n            quantity\n            cost {\n              totalAmount {\n                amount\n                currencyCode\n              }\n            }\n          }\n        }\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n': {
    return: StaffelKasseMutation;
    variables: StaffelKasseMutationVariables;
  };
}

declare module '@shopify/hydrogen' {
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
