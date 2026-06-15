import {useState} from 'react';
import {data} from '@shopify/remix-oxygen';
import {Form, useActionData, useNavigation} from 'react-router';

export const meta = () => [
  {title: 'Support & FAQ | Qi Blanco'},
  {name: 'description', content: 'Häufige Fragen und Antworten sowie Kontaktformular für Qi Blanco Kunden.'},
  {rel: 'canonical', href: '/pages/support'},
];

export function loader() {
  return {};
}

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60;
const memoryRateLimit = new Map();

async function checkRateLimit(kv, ip) {
  const key = `contact:${ip}`;
  const now = Math.floor(Date.now() / 1000);

  if (kv) {
    const raw = await kv.get(key);
    const count = raw ? Number(raw) : 0;
    if (count >= RATE_LIMIT_MAX) return false;
    await kv.put(key, String(count + 1), {expirationTtl: RATE_LIMIT_WINDOW_SECONDS});
    return true;
  }

  const entry = memoryRateLimit.get(ip);
  if (entry && entry.resetAt > now) {
    if (entry.count >= RATE_LIMIT_MAX) return false;
    entry.count += 1;
    return true;
  }
  memoryRateLimit.set(ip, {count: 1, resetAt: now + RATE_LIMIT_WINDOW_SECONDS});
  return true;
}

function sanitizeHeaderValue(s) {
  return s.replace(/[\r\n]+/g, ' ').trim();
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br>');
}

function normalizeFreshdeskDomain(rawDomain) {
  return rawDomain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @param {ActionFunctionArgs}
 */
export async function action({request, context}) {
  if (request.method !== 'POST') {
    return data({ok: false, error: 'Methode nicht erlaubt.'}, {status: 405});
  }

  const env = context.env || {};
  const formData = await request.formData();
  const honeypot = String(formData.get('company') || '');
  const name = sanitizeHeaderValue(String(formData.get('name') || ''));
  const email = sanitizeHeaderValue(String(formData.get('email') || '')).toLowerCase();
  const message = String(formData.get('message') || '').trim();

  if (honeypot) {
    return data({ok: true});
  }

  if (name.length < 1 || name.length > 100) {
    return data({ok: false, error: 'Bitte gib einen gültigen Namen an.'}, {status: 400});
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return data({ok: false, error: 'Bitte gib eine gültige E-Mail-Adresse an.'}, {status: 400});
  }
  if (message.length < 10 || message.length > 5000) {
    return data(
      {ok: false, error: 'Deine Nachricht muss zwischen 10 und 5000 Zeichen lang sein.'},
      {status: 400},
    );
  }

  const ip =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0].trim() ||
    'unknown';

  const allowed = await checkRateLimit(env.CONTACT_RATE_LIMIT, ip);
  if (!allowed) {
    return data(
      {ok: false, error: 'Zu viele Anfragen. Bitte versuche es später erneut.'},
      {status: 429},
    );
  }

  const freshdeskApiKey = env.FRESHDESK_API_KEY;
  const freshdeskDomain = normalizeFreshdeskDomain(
    env.FRESHDESK_DOMAIN || 'qiblanco.freshdesk.com',
  );

  if (!freshdeskApiKey) {
    console.error('Contact form is missing FRESHDESK_API_KEY');
    return data(
      {
        ok: false,
        error:
          'Das Kontaktformular ist aktuell nicht vollstaendig konfiguriert. Bitte schreibe uns direkt an service@qiblanco.com.',
      },
      {status: 503},
    );
  }

  const subject = `Kontaktanfrage von ${name}`;
  const description = [
    `<p>${escapeHtml(message)}</p>`,
    '<hr>',
    `<p><strong>Von:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;<br>`,
    `<strong>Quelle:</strong> QiBlanco Storefront Kontaktformular<br>`,
    `<strong>IP:</strong> ${escapeHtml(ip)}</p>`,
  ].join('');

  try {
    const res = await fetch(`https://${freshdeskDomain}/api/v2/tickets`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${freshdeskApiKey}:X`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description,
        email,
        name,
        priority: 1,
        source: 2,
        status: 2,
        subject,
        tags: ['storefront-contact'],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error('Freshdesk ticket creation failed', res.status, detail);
      return data(
        {ok: false, error: 'Versand fehlgeschlagen. Bitte versuche es später erneut.'},
        {status: 502},
      );
    }
  } catch (err) {
    console.error('Freshdesk request error', err);
    return data(
      {ok: false, error: 'Versand fehlgeschlagen. Bitte versuche es später erneut.'},
      {status: 502},
    );
  }

  return data({ok: true});
}

const FAQ_ITEMS = [
  {
    question: 'Wie funktioniert der QiOne®?',
    answer:
      'Der QiOne® enthält keinerlei elektronische Bauteile. Er nutzt einen proprietären Gitterchip, der durch die spezifische Positionierung von Goldatomen ein statisches Feld erzeugt. Dieses Feld fördert die Selbstorganisation von Wassermolekülen zu kohärenten Strukturen – ein Zustand, der die zelluläre Kommunikation im Körper verbessert.',
  },
  {
    question: 'Ist die kohärente Wasserstruktur messbar?',
    answer:
      'Ja. Die kohärente Struktur ist an hydrophoben Oberflächen mikroskopisch sichtbar. Kohärentes Wasser absorbiert Licht bei einer Wellenlänge von 270 nm. Indirekt lassen sich die Auswirkungen über HRV- oder EKG-Geräte messen.',
  },
  {
    question: 'Gibt es einen „Handy Chip" von Qi Blanco®?',
    answer:
      'Nein. Qi Blanco® stellt keine Handy-Chips her. Unsere Produkte passen sich dynamisch an verschiedene Situationen an und bieten durch ihre lange Lebensdauer einen dauerhaften Schutz – im Gegensatz zu herkömmlichen Abschirmprodukten, die nur für ein einzelnes Gerät konzipiert sind.',
  },
  {
    question: 'Gibt es ein Widerrufsrecht?',
    answer:
      'Ja. Es gilt das gesetzliche 14-tägige Widerrufsrecht. Deinen Widerruf kannst du online über den Link "Vertrag widerrufen" im Footer erklären. Für Warenrücksendungen empfehlen wir den versicherten Versand. Nach Eingang der Ware erstatten wir den Kaufpreis.',
  },
  {
    question: 'Darf der QiOne® nass werden oder in die Sauna?',
    answer:
      'Der QiOne® ist wasserresistent, sollte aber nicht dauerhaft Sonne, Sauna, Salzwasser oder Chlorwasser ausgesetzt werden. Der QiOne® 2 Pro bietet eine erhöhte Beständigkeit gegenüber diesen Einflüssen.',
  },
  {
    question: 'Kann ich den QiOne® an einer anderen Kette tragen?',
    answer:
      'Ja. Der Bohrdurchmesser beträgt 2,5 mm. Metallketten können Kratzer hinterlassen – eine Alternative aus Edelstahl ist erhältlich. Wichtig ist, dass die Kette durch die Öffnung passt.',
  },
  {
    question: 'Wie sollte ich den QiOne® tragen?',
    answer:
      'Du kannst ihn an jeder Körperstelle tragen. Hautkontakt verstärkt die Wirkung. Wenn die Wirkung anfangs zu intensiv ist, kann er anfänglich auch über der Kleidung getragen werden.',
  },
  {
    question: 'Lässt die Wirkung irgendwann nach?',
    answer:
      'Nein. Die Wirkung des QiOne® bleibt bestehen. Was nachlässt, ist das bewusste Spüren der Wirkung – dies ist ein natürlicher Gewöhnungseffekt des Körpers.',
  },
  {
    question: 'Hat der QiOne® einen Einfluss auf Trinkwasser?',
    answer:
      'Ja. Wasser, das in der Nähe des QiOne® aufbewahrt oder getrunken wird, nimmt durch den selbst propagierenden Kohärenzeffekt ebenfalls kohärente Strukturen an.',
  },
  {
    question: 'Wie entstand die Idee für Qi Blanco®?',
    answer:
      'Die Grundlage bilden die Hypothesen des französischen Physikers Jean Émile Charon zur komplexen Relativitätstheorie aus den 1970er und 1980er Jahren, die sich mit der Informationsspeicherung in Elektronen befassen.',
  },
];

function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div style={{marginTop: '1.5rem'}}>
      {FAQ_ITEMS.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            style={{
              borderBottom: '1px solid rgba(0,0,0,0.12)',
              overflow: 'hidden',
            }}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.1rem 0',
                textAlign: 'left',
                font: 'inherit',
                fontSize: '1rem',
                fontWeight: '600',
                color: 'var(--color-dark)',
                gap: '1rem',
              }}
            >
              <span>{item.question}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1.1em"
                height="1.1em"
                viewBox="0 0 15 15"
                style={{
                  flexShrink: 0,
                  transition: 'transform 0.2s',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                <path
                  fill="currentColor"
                  d="M7.5 9.95a.45.45 0 0 0 .319-.132l3-3a.45.45 0 0 0-.637-.637L7.5 8.863L4.82 6.181l-.07-.057a.451.451 0 0 0-.625.624l.058.07l3 3a.45.45 0 0 0 .318.132"
                />
              </svg>
            </button>
            <div
              style={{
                maxHeight: isOpen ? '600px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease',
              }}
            >
              <p style={{paddingBottom: '1.1rem', lineHeight: '1.8', color: 'var(--color-dark)', opacity: 0.85}}>
                {item.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function SupportPage() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const submitting = navigation.state !== 'idle';
  const success = actionData?.ok === true;

  return (
    <div className="NormalSectionSize" style={{padding: '3rem 1.5rem 5rem'}}>
      <div style={{maxWidth: '680px', margin: '0 auto'}}>
        <h1 style={{marginBottom: '0.5rem'}}>Kontaktiere uns!</h1>
        <p style={{marginBottom: '2.5rem', opacity: 0.7}}>
          Wir sind für dich da! Wenn du weitere Fragen hast oder über etwas anderes sprechen möchtest, nimm mit uns Kontakt auf.
        </p>

        {success ? (
          <div
            style={{
              background: 'rgba(57, 110, 37, 0.1)',
              border: '1px solid rgba(57, 110, 37, 0.3)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '3rem',
              color: 'var(--checkmark-color)',
            }}
          >
            <strong>Danke für deine Nachricht!</strong> Wir melden uns so schnell wie möglich bei dir.
          </div>
        ) : (
          <Form method="post" style={{marginBottom: '4rem'}} noValidate>
            {actionData?.error ? (
              <div
                style={{
                  background: 'rgba(180, 35, 24, 0.08)',
                  border: '1px solid rgba(180, 35, 24, 0.3)',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  marginBottom: '1.25rem',
                  color: '#b42318',
                  fontSize: '0.95rem',
                }}
                role="alert"
              >
                {actionData.error}
              </div>
            ) : null}
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {/* Honeypot field - hidden from users, bots fill it in */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  width: '1px',
                  height: '1px',
                  opacity: 0,
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                name="name"
                placeholder="Dein Name"
                required
                maxLength={100}
                style={inputStyle}
              />
              <input
                type="email"
                name="email"
                placeholder="Deine E-Mail"
                required
                maxLength={254}
                style={inputStyle}
              />
              <textarea
                name="message"
                placeholder="Deine Nachricht"
                required
                rows={5}
                minLength={10}
                maxLength={5000}
                style={{...inputStyle, resize: 'vertical'}}
              />
              <button
                type="submit"
                disabled={submitting}
                style={{
                  alignSelf: 'flex-start',
                  background: 'var(--color-dark)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50px',
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? 'Wird gesendet…' : 'Nachricht senden'}
              </button>
            </div>
          </Form>
        )}

        <h2>Häufige Fragen &amp; Antworten</h2>
        <FaqAccordion />
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  border: '1px solid rgba(0,0,0,0.2)',
  borderRadius: '8px',
  fontSize: '1rem',
  fontFamily: 'inherit',
  background: 'rgba(255,255,255,0.6)',
  outline: 'none',
};

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').ActionFunctionArgs} ActionFunctionArgs */
