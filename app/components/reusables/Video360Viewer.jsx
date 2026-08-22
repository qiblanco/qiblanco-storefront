import {useState, useCallback} from 'react';

const VIMEO_VIDEOS = {
  'qihome-air': '761185626',
  'qibracelet': '753118518',
};

export function Video360Button({productHandle}) {
  const videoId = VIMEO_VIDEOS[productHandle];
  if (!videoId) return null;

  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <div className="video360-button-wrapper">
        <button className="video360-button" onClick={open} type="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13v2.5l3.5 3.5-3.5 3.5V19l6-6-6-6z"/>
          </svg>
          360° Ansicht
        </button>
      </div>
      {isOpen && <Video360Overlay videoId={videoId} onClose={close} />}
    </>
  );
}

function Video360Overlay({videoId, onClose}) {
  return (
    <div className="video360-overlay" onClick={onClose}>
      <div className="video360-content" onClick={(e) => e.stopPropagation()}>
        <div className="video360-iframe-wrapper">
          <iframe
            src={`https://player.vimeo.com/video/${videoId}?background=1&autopause=0&title=0&byline=0&controls=0`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
        <button className="video360-close" onClick={onClose} type="button" aria-label="360-Grad-Ansicht schließen">
          <svg viewBox="0 0 40 40" width="24" height="24" fill="currentColor">
            <path d="M23.868 20.015L39.117 4.78c1.11-1.108 1.11-2.77 0-3.877-1.109-1.108-2.773-1.108-3.882 0L19.986 16.137 4.737.904C3.628-.204 1.965-.204.856.904c-1.11 1.108-1.11 2.77 0 3.877l15.249 15.234L.855 35.248c-1.108 1.108-1.108 2.77 0 3.877.555.554 1.248.831 1.942.831s1.386-.277 1.94-.83l15.25-15.234 15.248 15.233c.555.554 1.248.831 1.941.831s1.387-.277 1.941-.83c1.11-1.109 1.11-2.77 0-3.878L23.868 20.015z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export function Video360Hero({productHandle}) {
  const videoId = VIMEO_VIDEOS[productHandle];
  if (!videoId) return null;

  return (
    <div className="video360-hero">
      <iframe
        src={`https://player.vimeo.com/video/${videoId}?background=1&autopause=0&title=0&byline=0&controls=0`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
