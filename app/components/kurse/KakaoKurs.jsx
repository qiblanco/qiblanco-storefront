import {ActiveCampaignForm} from '../reusables/ActiveCampaignForm';

const IMG_HERO_BG =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/kakaohero_1_4ebdaf6e-683a-40c5-bbfe-d5d83e6b3b4f_1296x.webp?v=1680818117';
const IMG_MOCKUP =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Mockup-Kakao-Zeremonie-Kurs-v2-2x-1024x599.jpg_1.webp?v=1670867359';
const IMG_COUPLE =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2022-07-26-qiblanco-berlin-1001088.png?v=1679327456';

const videos = [
  {
    title: 'Video 1: Intuition erfahren. Raus aus dem Kopf, rein ins Herz! (9 min)',
    img: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2022-07-26-qiblanco-berlin-1001190-Kopie-1024x589_jpg.webp?v=1666617198',
    bullets: [
      'Was ist Intuition?',
      'Welchen Vorteil bringt dir das im Alltag?',
      'Was hat Zeremonie-Kakao damit zu tun?',
    ],
  },
  {
    title: 'Video 2: Zeremonie-Kakao. Was ist das?! (8 min)',
    img: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/2022-07-26-qiblanco-berlin-1001239-Kopie-1024x591.jpg_1_cf7bfbf2-2e9f-4654-a51a-e0f2b618501f.webp?v=1679327538',
    bullets: [
      'Warum enthält er so viele Inhaltsstoffe?',
      'Wo kommt er her?',
      'Wie wird er hergestellt?',
    ],
  },
  {
    title: 'Video 3: Die Zeremonie-Kakao-Kur in der Anwendung (8 min)',
    img: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/kakao-ad-01_2.1.1-min.jpg_1_2b439bb6-ccde-4801-a43f-d36eb669cee5.webp?v=1679327670',
    bullets: [
      'Wie erwärmt man ihn richtig?',
      'Wie schont man die Inhaltsstoffe?',
      'Wie konsumiert man ihn?',
    ],
  },
  {
    title: 'Video 4: Einen Schritt tiefer, mit Zeremonie-Kakao meditieren (4 min)',
    img: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/kakao-ad-03_4.2.1-min.jpg_1_329aa829-10d5-4d95-a779-1dd0a92d0397.webp?v=1679328304',
    bullets: [
      'Warum überhaupt meditieren?',
      'Wie und wie lange?',
      'Welche Effekte bringt es mit sich?',
    ],
  },
];

const DISCLAIMER =
  '*Deine Eintragung ist absolut unverbindlich. Wenn dir der Kurs nicht gefällt, kannst du dich jederzeit mit nur einem Klick wieder austragen und du erhältst keine weiteren E-Mails von uns. Wenn du dich für den Kurs anmeldest, erhältst du außerdem die neuesten Biohacking-Tipps und Informationen über Qi Blanco® in deinen Posteingang.';

function RegistrationSection() {
  return (
    <div className="NormalSectionSize py-[10vh]!">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
        <div>
          <h3 className="font-bold text-xl mb-4">HOL' DIR DEN KURS JETZT KOSTENFREI!</h3>
          <ActiveCampaignForm formId="21" />
          <p className="text-xs text-gray-500 mt-4">{DISCLAIMER}</p>
        </div>
        <div>
          <img className="w-full rounded-xl" src={IMG_MOCKUP} alt="Kurs Kakao Zeremonie" />
        </div>
      </div>
    </div>
  );
}

export function KakaoKurs() {
  return (
    <>
      {/* Hero — left-aligned text over background */}
      <div
        className="relative w-full flex items-center mt-[10vh]! py-16! sm:py-24! bg-cover bg-center overflow-hidden"
        style={{backgroundImage: `url("${IMG_HERO_BG}")`}}
      >
        <div className="absolute inset-0! bg-black/30" />
        <div className="NormalSectionSize relative z-1">
          <h1 className="text-white! text-4xl sm:text-5xl font-bold mb-2!">
            Dein Kakao-Ritual für Zuhause.
          </h1>
          <p className="text-white! text-xl font-medium mb-2!">
            Raus aus dem Kopf und rein ins Herz.
          </p>
          <p className="text-white! text-sm! max-w-md">
            Erfahre mehr über Intuition, Meditation und die Vorteile des Zeremonie-Kakaos in
            unserem kostenfreien Online-Kurs.
          </p>
        </div>
      </div>

      {/* First registration CTA */}
      <RegistrationSection />

      {/* Präsentiert von Anna und Christian */}
      <div className="NormalSectionSize my-[10vh]! grid grid-cols-1 sm:grid-cols-3 gap-10 items-start">
        <div className="sm:col-span-2">
          <h2 className="text-2xl font-bold mb-4">
            Präsentiert von Anna und Christian Bernd Bauer.
          </h2>
          <div className="text-sm text-gray-800 leading-relaxed space-y-3">
            <p>
              Wir sind Anna und Christian, und zusammen haben wir uns dazu entschieden, unser
              Wissen und unsere Erfahrungen in einem Kurs zu teilen. Christian, als Ingenieur,
              Physiker und Biochemiker betrachtet den menschlichen Körper aus einer einzigartigen
              Perspektive, die ihm geholfen hat, seine eigene persönliche Leidensgeschichte zu
              überwinden. Anna hat ein besonderes Gespür und Händchen, wenn es um die Entfaltung
              der Intuition und der Wiedervereinigung mit unserer Urkraft geht.
            </p>
            <p>
              Durch den Kurs wirst du lernen, wie du deine Intuition stärken und dich mit deinem
              Körper und deiner Seele verbinden kannst. Wir werden dir auch beibringen, wie du die
              Kraft von Zeremonie-Kakao nutzen kannst, um dein ganzes Körpergefühl zu verändern
              und deine Selbstheilungskräfte zu aktivieren.
            </p>
            <p>
              Unser Ziel ist es, dir zu zeigen, dass du dein Wohlbefinden in die Hand nehmen
              kannst und keine Angst haben musst, dich von dogmatischen Ansichten zu befreien. Wir
              haben selbst erfahren, wie befreiend es ist, eine Verbindung zu sich selbst
              aufzubauen und sich von der Natur inspirieren zu lassen.
            </p>
            <p>
              <b>
                Melde dich jetzt für unseren kostenlosen Kurs an und entdecke die Möglichkeiten,
                die in dir stecken!
              </b>
            </p>
          </div>
        </div>
        <div>
          <img
            className="w-full rounded-xl"
            src={IMG_COUPLE}
            alt="Anna und Christian Bernd Bauer"
          />
        </div>
      </div>

      {/* Warum kostenlos + Was dich erwartet */}
      <div className="NormalSectionSize my-[6vh] text-sm text-gray-800 leading-relaxed space-y-10!">
        <div>
          <h2 className="text-2xl font-bold mb-3">
            Warum ist dieser Kurs <span className="text-orange-500">kostenlos?</span>
          </h2>
          <p>
            Wir teilen unsere wertvollen Erfahrungen in einem Zeremonie-Kakao-Kurs, weil wir davon
            überzeugt sind, dass jeder Mensch von den Vorteilen des Konsums von zeremoniellem Kakao
            profitieren kann. Dieser Kakao kann helfen, Stress abzubauen, die Konzentration zu
            verbessern und die Stimmung zu heben. Außerdem kann er zu einem tieferen Verständnis
            des eigenen Selbst beitragen und so zu selbstbestimmten Entscheidungen führen. Durch
            die rituelle Verwendung von Kakao in Zeremonien kann man außerdem eine tiefere
            Verbindung zu sich selbst und anderen Menschen aufbauen und geistiges Wachstum fördern.
            Wenn wir uns auf diese Weise mit uns selbst und unserer Umgebung verbinden, können wir
            auch dazu beitragen, eine nachhaltigere Welt zu schaffen.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-3">
            Was dich <span className="text-orange-500">erwartet</span>
          </h2>
          <p>
            In den nächsten Tagen wirst du entdecken, wie du mit Zeremonie-Kakao und ein paar
            einfachen Schritten eine tiefere Verbindung zu deiner Intuition aufbaust und dein Leben
            veränderst! Du lernst, wie du durch Meditation und den bewussten Konsum von
            psychoaktivem Kakao deine Sinne schärfst und eine tiefere Verbindung zu dir selbst
            aufbaust. Du erfährst, wie Zeremonie-Kakao dir helfen kann, Stress abzubauen, Ängste
            zu lindern und ein Gefühl von innerer Ruhe zu erlangen. Außerdem wirst du erfahren, wie
            du mit diesem fast schon magischen Kakao deine geistige Praxis vertiefen und dein
            Bewusstsein erweitern kannst.
          </p>
          <p className="mt-2">
            Im Kurs lernst du, wie du Zeremonie-Kakao in deinem Leben nutzen kannst. Außerdem
            zeigen wir dir, wie du dein ganzes Wohlergehen und damit dein Leben mit kohärentem
            Wasser verändern kannst. Du wirst
            erfahren, wie du dich mit deiner Intuition und deinem Körper verbindest und so zu einem
            tieferen Verständnis deiner selbst gelangst.
          </p>
          <p className="mt-2">
            Und das Beste daran? Wenn du dich für den Kurs anmeldest, erhältst du auch die
            neuesten Tipps und Informationen über den bewussten Konsum von Zeremonie-Kakao und wie
            du ihn in deinen Alltag integrieren kannst. Los geht's! Melde dich jetzt für diesen
            kostenlosen Videokurs an und mache den nächsten Schritt, um die beste Version von dir
            selbst zu werden.
          </p>
        </div>
      </div>

      {/* Kursinhalt – 4 videos */}
      <div className="NormalSectionSize my-[10vh]!">
        <h2 className="text-2xl font-bold mb-1!">Kursinhalt</h2>
        <p className="text-sm text-gray-500 mb-8!">Videolektionen</p>
        <div className="flex flex-col gap-10">
          {videos.map((video, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
              <div className="aspect-video overflow-hidden rounded-xl">
                <img className="w-full h-full object-cover" src={video.img} alt={video.title} />
              </div>
              <div>
                <h3 className="text-base font-bold mb-3! text-orange-600">{video.title}</h3>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {video.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom registration CTA */}
    </>
  );
}
