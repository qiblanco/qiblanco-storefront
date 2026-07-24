import {Link} from 'react-router';
import {BLOCK_PUBLIC, produktLink} from '~/components/reusables/blockLinks';
import {ChevronRight} from 'lucide-react';
import {useState, useEffect, useRef, useCallback} from 'react';
import {useDragSwipe} from '~/components/reusables/useDragSwipe';

/*
 * Zwei-Block-IA (Job 20260717-storefront-ia-zweiblock-umbau): Die Karte
 * rendert in BEIDEN Welten (PDPs/Homepage/Detailseiten = public,
 * LP-Shopseiten via QiOne2Pro/Shops = lp). Link-Ziele kommen deshalb
 * block-abhaengig aus der Kontext-Link-Map (reusables/blockLinks.js);
 * produktId ist der Map-Schluessel. Default BLOCK_PUBLIC = fail-safe.
 */
const ITEMS = [
  {
    image:
      'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne1.webp?v=1732874828',
    label: 'Kompakt. Innovativ. Stark',
    title: 'QiOne® 2 Pro',
    // Grammatik-Fix 20260718: „Gitterchip™ -Technologie" (Leerzeichen) +
    // „für unterwegs und dem Büro" (Kasus) korrigiert.
    description:
      'Die effiziente Gitterchip™-Technologie reduziert die Auswirkungen von E-Smog und unterstützt ein Umfeld, das Klarheit und Fokus ermöglicht – perfekt für unterwegs und im Büro.',
    produktId: 'qione-2-pro',
  },
  {
    image:
      'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiBracelet1.webp?v=1732874909',
    label: 'Eleganz und Schutz - dein Support.',
    title: 'QiBracelet®',
    // Grammatik-Fix 20260718: haengender Relativsatz („..., das Wohlbefinden
    // und Klarheit ermöglicht") sauber angebunden.
    description:
      'Der elegant integrierte Gitterchip™ reduziert die Auswirkungen von E-Smog und 5G und unterstützt ein Umfeld, das Wohlbefinden und Klarheit ermöglicht – für ein erfülltes Leben, zu Hause und unterwegs.',
    produktId: 'qibracelet',
  },
  {
    image:
      'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiHome1.webp?v=1732874979',
    label: 'Gesundes Zuhause, produktives Umfeld.',
    title: 'QiHome® Air',
    // Claim-Fix 20260718: „Der leistungsstärkste Gitterchip im Sortiment" ist
    // unbelegt (alle Produkte tragen denselben Gitterchip; Stärke-Ranking =
    // Christian/Legal-Gate, HARDWARE_ENTSCHEIDUNGSHILFE_V1) — ersetzt durch
    // das belegte Flächen-Merkmal (bis zu 300 m²).
    description:
      'Ein Gitterchip™ für den ganzen Raum: Das QiHome® Air deckt bis zu 300 m² ab und schafft ein Umfeld, das dir helfen kann, dich wohler zu fühlen und in einer harmonischen Atmosphäre fokussierter zu arbeiten.',
    produktId: 'qihome-air',
  },
];

export function UpsellLineUp({dataSection, block = BLOCK_PUBLIC}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const trackRef = useRef(null);
  const [slideStep, setSlideStep] = useState(400);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 750);
      const first = trackRef.current?.children?.[0];
      if (first) setSlideStep(first.getBoundingClientRect().width + 20);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const maxIndex = ITEMS.length - 1;

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, maxIndex));
  }, [maxIndex]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  // Slider existiert nur mobil (Desktop zeigt alle Karten nebeneinander),
  // deshalb enabled: isMobile. Schwellen/Velocity kommen aus dem Hook (GL-DES-0012).
  const {handlers, isDragging, dragOffset} = useDragSwipe({
    mode: 'transform',
    enabled: isMobile,
    slideStep,
    onNext: goNext,
    onPrev: goPrev,
    canNext: () => currentIndex < maxIndex,
    canPrev: () => currentIndex > 0,
  });

  const progress = ((currentIndex + 1) / ITEMS.length) * 100;

  // On mobile, translate by one card width per index; waehrend des Drags
  // folgt der Track dem Finger 1:1 (dragOffset in px).
  const translateX = isMobile
    ? `calc(-${currentIndex} * (100vw - 2rem + 20px) + ${dragOffset}px)`
    : '0px';

  return (
    <div className="UpsellLineUp mt-2 NormalSectionSize" data-section={dataSection}>
      <h2 className="text-5xl! text-center">
        Über 300 neue Nutzer im Monat. <br />
        Werde Teil der Qi Blanco® Revolution!
      </h2>
      <div
        className={`UpsellCarousel${isDragging ? ' is-dragging' : ''}`}
        {...handlers}
      >
        <div
          className="UpsellTrack"
          ref={trackRef}
          style={{
            transform: `translateX(${translateX})`,
            transition: isDragging ? 'none' : undefined,
          }}
        >
          {ITEMS.map((item, i) => (
            <div className="UpsellItem" key={i}>
              <div className="UpsellImage">
                <img src={item.image} alt={item.title} />
              </div>
              <div className="UpsellLabel mt-3 mb-1">{item.label}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <Link
                prefetch="render"
                className="mt-1 UpsellLink"
                to={produktLink(item.produktId, block, 'detail')}
              >
                Mehr erfahren <ChevronRight size={20} />
              </Link>
              <Link
                prefetch="render"
                className="mt-1 UpsellLink"
                to={produktLink(item.produktId, block, 'kauf')}
              >
                Jetzt kaufen <ChevronRight size={20} />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {isMobile && (
        <>
          <div className="ProgressWrapper">
            <div
              className="ProgressTracker"
              style={{width: `${progress}%`}}
            />
          </div>
          <div className="SliderButtonWrapper">
            <div
              className="ButtonPrev SliderButton"
              onClick={goPrev}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 36 36"
              >
                <path
                  fill="currentColor"
                  d="M29.52 22.52L18 10.6L6.48 22.52a1.7 1.7 0 0 0 2.45 2.36L18 15.49l9.08 9.39a1.7 1.7 0 0 0 2.45-2.36Z"
                />
              </svg>
            </div>
            <div
              className="ButtonNext SliderButton"
              onClick={goNext}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 36 36"
              >
                <path
                  fill="currentColor"
                  d="M29.52 22.52L18 10.6L6.48 22.52a1.7 1.7 0 0 0 2.45 2.36L18 15.49l9.08 9.39a1.7 1.7 0 0 0 2.45-2.36Z"
                />
              </svg>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
