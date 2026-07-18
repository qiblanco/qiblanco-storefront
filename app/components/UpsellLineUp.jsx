import {Link} from 'react-router';
import {BLOCK_PUBLIC, produktLink} from '~/components/reusables/blockLinks';
import {ChevronRight} from 'lucide-react';
import {useState, useEffect, useRef, useCallback} from 'react';

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
    // Claim-Nachschaerfung 20260718 (Christian-Fakten): Differenzierung uebers
    // Leistungsvolumen — QiOne 2 Pro = QTA-T-333/333 (Dartsch 2024 ABBSR 7(3);
    // HARDWARE_ENTSCHEIDUNGSHILFE_V1 Update v1.1).
    description:
      'Sein Gitterchip™ QTA-T-333 (Leistungsvolumen 333) reduziert die Auswirkungen von E-Smog und unterstützt ein Umfeld, das Klarheit und Fokus ermöglicht – perfekt für unterwegs und im Büro.',
    produktId: 'qione-2-pro',
  },
  {
    image:
      'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiBracelet1.webp?v=1732874909',
    label: 'Eleganz und Schutz - dein Support.',
    title: 'QiBracelet®',
    // Claim-Nachschaerfung 20260718: QiBracelet = QTA-O-400/400 (Dartsch 2024).
    description:
      'Der elegant integrierte Gitterchip™ QTA-O-400 (Leistungsvolumen 400) reduziert die Auswirkungen von E-Smog und 5G und unterstützt ein Umfeld, das Wohlbefinden und Klarheit ermöglicht – für ein erfülltes Leben, zu Hause und unterwegs.',
    produktId: 'qibracelet',
  },
  {
    image:
      'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiHome1.webp?v=1732874979',
    label: 'Gesundes Zuhause, produktives Umfeld.',
    title: 'QiHome® Air',
    // Claim-Nachschaerfung 20260718 (Christian-Fakten, HARDWARE_ENTSCHEIDUNGS-
    // HILFE_V1 Update v1.1): hoechstes Leistungsvolumen QTA-U-5000 + Quarz-
    // oszillator aus Laserquarz, ~100x Systemleistung belegt (Dartsch 2026,
    // NDCR 6(1)); Wirkungsbereich 160 m Radius ≈ 8 ha = Herstellerangabe —
    // die alte 300-m²-Angabe war FALSCH.
    description:
      'Unser stärkstes System – für den ganzen Raum: Im QiHome® Air arbeitet der Gitterchip™ mit dem höchsten Leistungsvolumen (QTA-U-5000), gekoppelt an einen Quarzoszillator aus Laserquarz – zusammen rund die 100-fache Systemleistung eines QiOne® 2 Pro, mit einem Wirkungsbereich von bis zu 160 m Radius (rund 8 Hektar). So schafft es ein Umfeld, das dir helfen kann, dich wohler zu fühlen und fokussierter zu arbeiten.',
    produktId: 'qihome-air',
  },
];

export function UpsellLineUp({dataSection, block = BLOCK_PUBLIC}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const startX = useRef(0);
  const trackRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 750);
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

  const handlePointerDown = (e) => {
    startX.current = e.touches ? e.touches[0].clientX : e.clientX;
  };

  const handlePointerUp = (e) => {
    const endX = e.changedTouches
      ? e.changedTouches[0].clientX
      : e.clientX;
    const diff = startX.current - endX;
    if (diff > 60) goNext();
    else if (diff < -60) goPrev();
  };

  const progress = ((currentIndex + 1) / ITEMS.length) * 100;

  // On mobile, translate by one card width per index
  const translateX = isMobile
    ? `calc(-${currentIndex} * (100vw - 2rem + 20px))`
    : '0px';

  return (
    <div className="UpsellLineUp mt-2 NormalSectionSize" data-section={dataSection}>
      <h2 className="text-5xl! text-center">
        Über 300 neue Nutzer im Monat. <br />
        Werde Teil der Qi Blanco® Revolution!
      </h2>
      <div
        className="UpsellCarousel"
        onMouseDown={handlePointerDown}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchEnd={handlePointerUp}
      >
        <div
          className="UpsellTrack"
          ref={trackRef}
          style={{transform: `translateX(${translateX})`}}
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
