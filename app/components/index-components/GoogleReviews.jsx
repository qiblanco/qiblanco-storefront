const reviews = [
  {
    name: 'Peter Puetz',
    initial: 'P',
    color: '#b5225a',
    rating: 5,
    text: 'Hallo, die erste Nacht nach dem Anlegen des QiOne 2 Pro war ungewöhnlich. Ich würde es am ehesten mit einem leichten Feuer, das durch den Körper läuft vergleichen. Seitdem fühlt es sich viel entspannter an. Nach dieser Erfahrung und dem Wohlbefinden in den Tagen danach, hat meine Frau nun ebenfalls einen bekommen. Aktueller Status von uns Beiden. Wir behalten den QiOne 2 Pro.',
  },
  {
    name: 'Jin C.',
    initial: 'J',
    color: '#4285f4',
    rating: 5,
    text: 'Diese kleine Kette hat mein Leben verändert. Meine Schlafergebnisse sind viel besser, ich bin ausgeglichener und meine Meditationen sind tiefer. Seit Jahren bin ich am Meditieren, aberr Qi Blanco hat mich nochmals auf ein ganz anderes Level gebracht.',
  },
  {
    name: 'Meike Fuhrmann',
    initial: 'M',
    color: '#34a853',
    rating: 5,
    text: 'Ich trage den QiOne jetzt seit einer Woche und hab bereits am ersten Tag beim Tragen gemerkt, dass ich mich sehr viel ruhiger und entspannter fühle. Trage ihn jetzt durchgehend und möchte ihn auch nicht mehr ablegen. Bin gespannt was noch kommt 🤩',
  },
];

function GoogleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function Stars({count}) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({length: count}).map((_, i) => (
        <svg key={i} width="18" height="18" viewBox="0 0 20 20" fill="#f59e0b">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export function GoogleReviews({dataSection}) {
  return (
    <div className="NormalSectionSize my-[6vh]!" data-section={dataSection}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {reviews.map((review) => (
          <div key={review.name} className="flex flex-col gap-5">
            {/* Speech bubble card */}
            <div className="relative p-4! bg-[#f3f6f9] rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
              {/* Top row: stars + checkmark, Google icon */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Stars count={review.rating} />
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#3b82f6">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </div>
                <GoogleIcon />
              </div>

              {/* Review text */}
              <p className="text-sm! text-gray-700 leading-relaxed">{review.text}</p>

              {/* Tail: rotated square peeking out at bottom-left */}
              <div
                className="absolute bg-[#f3f6f9] border-gray-100"
                style={{
                  width: 14,
                  height: 14,
                  bottom: -7,
                  left: 24,
                  transform: 'rotate(45deg)',
                  borderRight: '1px solid #f3f4f6',
                  borderBottom: '1px solid #f3f4f6',
                }}
              />
            </div>

            {/* Avatar row — below the bubble */}
            <div className="flex items-center gap-3 mt-4 ml-2">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0"
                style={{backgroundColor: review.color}}
              >
                {review.initial}
              </div>
              <span className="font-medium text-sm" style={{color: review.color}}>
                {review.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
