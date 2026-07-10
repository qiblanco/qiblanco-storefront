import {HeroBannerParallax} from '~/components/reusables/HeroBannerParallaxButton';
import {LogoBar} from '~/components/reusables/LogoBar';
import {Richtext} from '~/components/reusables/Richtext';
import {Studien} from '~/components/reusables/Studien';
import {ReviewCount} from '~/components/reusables/ReviewCount';
import {CallToAction} from '~/components/index-components/CallToAction';
import {ProductFAQ} from '~/components/ProductFAQ';
import {LP_FAQ} from '~/data/lp-builderflow-pilot';

export function LpBuilderflowPilot() {
  return (
    <div className="Lp LpBuilderflowPilot">
      <HeroBannerParallax backgroundImage='https://cdn.shopify.com/s/files/1/0279/3095/1750/files/beispiel-hero.jpg' headline='BEISPIEL Statement-Headline' subheadline='Beweis-nahe Subheadline' parallax height={600} link='/products/qione-2-pro' linkText='Jetzt entdecken' />
      <LogoBar />
      <Richtext text='BEISPIEL: Ein ruhiger Wissens-Absatz, der zeigt statt behauptet.' alignment='center' />
      <Studien headline='Was die Forschung zeigt' />
      <ReviewCount />
      <CallToAction img='https://cdn.shopify.com/s/files/1/0279/3095/1750/files/beispiel-cta.jpg' text='Bereit fuer den naechsten Schritt?' link='/products/qione-2-pro' linkText='Jetzt entdecken' />
      <ProductFAQ items={LP_FAQ} />
    </div>
  );
}
