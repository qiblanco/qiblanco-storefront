import { ActiveCampaignForm } from "../reusables/ActiveCampaignForm";

const IMG_HERO_BG =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qiblanco-com-in-5-stufen-zum-superhuman-hintergrund_1296x.png?v=1645178965';
const IMG_SHOWCASE =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qiblanco-com-in-5-stufen-zum-superhuman-masterclass-showcase-app-526x296_400x.png?v=1645756351';
const IMG_CHRISTIAN =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Christian.jpg?v=1668985845';

const videos = [
  {
    label: 'Video 1',
    title: 'Entgiftung',
    img: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/entgiftung_720x.png?v=1645197348',
    bullets: [
      'Warum Giftstoffe unsere Körperaktivitäten lähmen',
      'Wie du dich effektiv entgiftest und deine Zellen wieder vollfunktionsfähig machst',
    ],
  }, 
  {
    label: 'Video 2',
    title: 'Mentales Setting',
    img: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/mentaleeinstellung_720x.png?v=1645197348',
    bullets: [
      'Wie dein Gehirn deine physische Realität beeinflusst',
      'Wie du dein Gehirn neu programmieren kannst',
      'Wie du negative Verhaltensmuster löschen kannst',
    ],
  },
  {
    label: 'Video 3',
    title: 'Mineralien und Vitamine',
    img: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/MineralstVitamine_720x.png?v=1645197347',
    bullets: [
      'Dein Körper braucht den richtigen Treibstoff',
      'Was zu wenig in unseren Lebensmitteln enthalten ist',
      'Was dein Körper wirklich braucht',
    ],
  },
  {
    label: 'Video 4',
    title: 'E-Smog',
    img: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/E-Smog_720x.png?v=1645197348',
    bullets: [
      'Wie erhöhte elektromagnetische Strahlung deinen Körper blockiert',
      'Wie du dich effektiv gegen E-Smog schützen kannst',
    ],
  },
  {
    label: 'Video 5',
    title: 'Kohärente Wasserstruktur',
    img: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/KohaerentesWasser_720x.png?v=1645197347',
    bullets: [
      'Was der Superzustand des Wassers ist',
      'Welche positiven Effekte dieser Zustand hat',
      'Wie du diesen Zustand erzeugen kannst',
    ],
  },
];

function RegistrationSection() {
  return (
    <div className="NormalSectionSize py-[10vh]! ">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
        
        {/* Form placeholder */}
        <div>
        <h3 className="font-bold text-xl">HOL' DIR DEN KURS JETZT KOSTENFREI!</h3>
        
          <ActiveCampaignForm formId="13" /> 
          <p className="text-xs text-gray-500 mt-4">
            *Deine Eintragung ist absolut unverbindlich. Wenn dir der Kurs nicht gefällt,
            kannst du dich jederzeit mit nur einem Klick wieder austragen und du erhältst
            keine weiteren E-mails von uns.*
          </p>
        </div>
        {/* Showcase image */}
        <div>
          <img className="w-full rounded-xl" src={IMG_SHOWCASE} alt="Kurs Showcase" />
        </div>
      </div>
    </div>
  );
}

export function Superhuman() {
  return (
    <>
      {/* Hero banner */}
      <div
        className="relative w-full mt-[-75px]! flex items-center justify-center py-20! min-h-[40vh]! sm:py-24! bg-cover bg-center overflow-hidden"
        style={{backgroundImage: `url("${IMG_HERO_BG}")`}}
      >
        <div className="absolute inset-0! bg-black/40! rounded-xl" />
        <div className="relative z-1 text-center px-4!">
          <h1 className="text-white! text-4xl sm:text-5xl font-bold mb-3!">
            In 5 Stufen zum Superhuman
          </h1>
          <p className="text-white! text-lg sm:text-xl">
            Der kostenlose Videokurs von Gründer Christian Bernd Bauer
          </p>
        </div>
      </div>

      {/* First registration CTA */}
      <RegistrationSection />

      {/* Über mich */}
      <div className="NormalSectionSize my-[6vh] grid grid-cols-1 sm:grid-cols-3 gap-10 items-start">
        <div className="sm:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Über mich – Christian Bernd Bauer</h2>
          <div className="text-sm text-gray-800 leading-relaxed space-y-3">
            <p>Ich bin Christian Bernd Bauer.</p>
            <p>
              Meine persönliche Leidensgeschichte hat mich dazu gebracht, den menschlichen Körper
              aus Sicht eines Ingenieurs, Physikers und Biochemikers zu betrachten.
            </p>
            <p>
              Mit dem Wissen, das ich angewandt und hier in diesem kostenfreien Kurs
              zusammengeschrieben habe, gelang es mir mein Burnout zu überwinden, dauerhaft 10 kg
              abzunehmen und meinen Haarausfall aufzuhalten und diesen sogar langsam wieder
              umzukehren.
            </p>
            <p>
              Und auch du kannst Dinge wie diese und noch mehr erreichen, wenn du die Informationen
              aus diesem Kurs zu Herzen nimmst und konsistent anwendest.
            </p>
            <p>
              Ich habe mich dazu entschieden, diesen Kurs kostenlos anzubieten, weil ich glaube,
              dass jeder Mensch ein tieferes Verständnis von seinem Körper haben sollte, damit
              Leute wie du und ich in der Lage sind, unsere eigenen Entscheidungen zu treffen. Wenn
              man derart auf die Ratschläge anderer angewiesen ist, wie man es heutzutage auf
              dogmatische Ärzte ist, sind Gesundheitskrisen wie wir sie heute erleben,
              vorprogrammiert.
            </p>
            <p>
              Nimm deine Gesundheit jetzt in deine eigene Hand und erfahre, was tatsächlich möglich
              ist!
            </p>
          </div>
        </div>
        <div>
          <img className="w-full rounded-xl mt-1" src={IMG_CHRISTIAN} alt="Christian Bernd Bauer" />
        </div>
      </div>

      {/* Warum kostenlos + Was dich erwartet */}
      <div className="NormalSectionSize my-[10vh]! text-sm text-gray-800 leading-relaxed space-y-10!">
        <div>
          <h2 className="text-2xl font-bold mb-3">
            Warum ist dieser Kurs <span className="text-orange-500">kostenlos?</span>
          </h2>
          <p>
            Warum verschenke ich diese wertvollen Inhalte, die mein Leben verändert haben?
          </p>
          <p className="mt-2">
            Ich bin davon überzeugt, dass jeder Mensch ein tieferes Verständnis über seinen Körper
            haben sollte, damit Leute wie du und ich in der Lage sind, unsere eigenen
            Entscheidungen zu treffen. Wenn man derart auf die Ratschläge anderer angewiesen ist,
            sind Gesundheitskrisen, wie wir sie heute erleben vorprogrammiert.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-3">
            Was dich <span className="text-orange-500">erwartet</span>
          </h2>
          <p>
            In den nächsten Tagen erfährst du, wie du deinen Körper in 5 einfachen Schritten zu
            seiner natürlichen Höchstform bringen kannst!
          </p>
          <p className="mt-2">
            Du lernst, wie du dein Immunsystem stärkst, deinen Körper von abgelagerten Giftstoffen
            befreist, deine Leistungsfähigkeit mit den richtigen Mineralien und Vitaminen
            steigerst, dich auf natürliche Weise vor E-Smog schützt und dein ganzes Körpergefühl
            und damit dein Leben mit kohärentem Wasser veränderst.
          </p>
          <p className="mt-2">
            Wenn du dich für den Kurs anmeldest, erhältst du außerdem die neuesten
            Biohacking-Tipps und Informationen über Qi Blanco® in deinen Posteingang.
          </p>
          <p className="mt-2">
            Los geht's! Melde dich jetzt für den kostenlosen Videokurs an und mache den nächsten
            Schritt, um die beste Version von dir selbst zu werden.
          </p>
        </div>
      </div>

      {/* 5 Videos */}
      <div className="NormalSectionSize my-[6vh] flex flex-col gap-10 pb-4!">
        {videos.map((video) => (
          <div key={video.label} className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
            {/* Aspect-video image */}
            <div className="aspect-video overflow-hidden rounded-xl">
              <img className="w-full h-full object-cover" src={video.img} alt={video.title} />
            </div>
            {/* Text */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 mb-1">
                {video.label}
              </p>
              <h3 className="text-xl font-bold mb-3">{video.title}</h3>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {video.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom registration CTA */}
    </>
  );
}
