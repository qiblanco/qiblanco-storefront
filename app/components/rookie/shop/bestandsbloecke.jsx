import {InhaltswegNeuOderGebraucht} from '~/components/product-pages/InhaltswegNeuOderGebraucht';

/*
 * ZWEI BLOECKE DER CHAMPION-SEITE, WOERTLICH ZITIERT (Rookie /pages/qione-2-pro-b,
 * Experiment q2p-e1-gs080, Grossjob 20261006-GROSSJOB-rookie-15pct-qione-2-pro-
 * und-startseite s02).
 *
 * Die Quelle ist product-pages/QiOne2Pro.jsx. Dort sind beide Funktionen nicht
 * exportiert. Ein `export` dort wäre eine Änderung an einer geteilten Datei der
 * Champion-Seite A und der organischen PDP (Gate 9/12 messen dann beide neu).
 * Deshalb steht der Rumpf hier BYTE-GLEICH, und der Test
 * rookie-shop.test.mjs ("Bestandsblöcke sind byte-gleich zur Quelle") fällt
 * rot, sobald die Quelle sich ändert. Wer ihn rot sieht, zieht die Änderung
 * hierher nach: kein neuer Text in B, A und B zeigen denselben Wortlaut.
 */

export function RisikofreiErleben() {
  return (
    <div className="RisikofreiErleben NormalSectionSize">
      <h2>Erlebe den QiOne® 2 Pro - 20 Tage risikofrei!</h2>
      <p>
        Wir sind überzeugt von unserer Technologie – und möchten, dass du es
        auch bist. Deshalb kannst du den QiOne® 2 Pro 20 Tage lang entspannt in
        deinen Alltag integrieren und dich selbst von seinem Mehrwert
        überzeugen.
      </p>
      <p className="mt-1">
        So einfach geht's: <br />✅ Bestelle deinen QiOne® 2 Pro und integriere
        ihn in deinen Alltag. <br />✅ Erlebe, wie er dein Umfeld optimiert und
        dich täglich begleitet. <br />✅ Solltest du ihn wider Erwarten doch
        nicht behalten wollen, kannst du ihn innerhalb von 20 Tagen
        unkompliziert zurückgeben – und erhältst den vollen Kaufpreis zurück.
      </p>
      <InhaltswegNeuOderGebraucht />
      <p className="mt-1">
        Deine Vorteile: <br />✔ In Ruhe erleben: Erfahre den QiOne® 2 Pro in
        deinem eigenen Tempo. <br />
        ✔ Maximale Sicherheit: Wir stehen hinter unserer Technologie und geben
        dir die Zeit, dich selbst davon zu überzeugen. <br />✔ Sorgenfrei
        entscheiden: Sollte es doch nicht das Richtige für dich sein, bekommst
        du dein Geld zurück – ohne Risiko.
      </p>
      <p className="mt-1">
        <strong>
          Mach den ersten Schritt – spüre selbst, warum so viele den QiOne® 2
          Pro seit Jahren an ihrer Seite haben und nicht mehr hergeben wollen!
        </strong>
      </p>
    </div>
  );
}

export function MassgeschneiderteTechnologie() {
  return (
    <div className="MassgeschneiderteTechnologie NormalSectionSize">
      <h2 className="text-center">
        Maßgeschneiderte Technologie. Herstellung in Deutschland.
      </h2>
      <div className="MassgeschneidertWrapper">
        <div className="Column">
          <h3 className='mt-3'><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M19 17h3l-4 4l-4-4h3V3h2zM9 13H7c-1.1 0-2 .9-2 2v1a2 2 0 0 0 2 2h2v1H5v2h4c1.11 0 2-.89 2-2v-4a2 2 0 0 0-2-2m0 3H7v-1h2zM9 3H7c-1.1 0-2 .9-2 2v4a2 2 0 0 0 2 2h2c1.11 0 2-.89 2-2V5a2 2 0 0 0-2-2m0 6H7V5h2z"></path></svg> Einzigartige Seriennummer</h3>
          <p>Jeder QiOne® 2 Pro ist mit einer eigenen Seriennummer versehen</p>

          <h3 className='mt-3'><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M17.9 17.39c-.26-.8-1.01-1.39-1.9-1.39h-1v-3a1 1 0 0 0-1-1H8v-2h2a1 1 0 0 0 1-1V7h2a2 2 0 0 0 2-2v-.41a7.984 7.984 0 0 1 2.9 12.8M11 19.93c-3.95-.49-7-3.85-7-7.93c0-.62.08-1.22.21-1.79L9 15v1a2 2 0 0 0 2 2m1-16A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2"></path></svg> 100% in Bayern entwickelt & gefertigt</h3>
          <p>
            Hochpräzise Technik und Produktion, ausschließlich in Deutschland
            hergestellt
          </p>
        </div>
        <div className="Column">
          <h3 className='mt-3'><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="m1 22l1.5-5h7l1.5 5zm12 0l1.5-5h7l1.5 5zm-7-7l1.5-5h7l1.5 5zm17-8.95l-3.86 1.09L18.05 11l-1.09-3.86l-3.86-1.09l3.86-1.09l1.09-3.86l1.09 3.86z"></path></svg> Ethisch erzeugtes und zertifiziertes Gold</h3>
          <p>Wir beziehen nur RJC-zertifiziertes Gold mit höchstem Standard</p>

          <h3 className='mt-3'><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21L2 9l3-6h14l3 6zM9.625 8h4.75l-1.5-3h-1.75zM11 16.675V10H5.45zm2 0L18.55 10H13zM16.6 8h2.65l-1.5-3H15.1zM4.75 8H7.4l1.5-3H6.25z"></path></svg> Material höchster Qualität</h3>
          <p>Für unsere Produkte werden nur die besten Materialien verwendet</p>
        </div>
        <div className="Column">
          <img
            width={400}
            src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_03_transparent_1.webp?v=1676978032"
            alt=""
          />
        </div>
      </div>
    </div>
  );
}
