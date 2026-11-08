import {stimmenKachel} from './VideoGalerie';

/*
 * Kacheln der Video-Galerie (Elina, EL-20261108-a7401ffd). Jede Seite kann ihre
 * eigene Liste bauen; diese hier ist die erste, für die Vorschau-Seite.
 *
 * Name, Profil und Beitrag kommen über stimmenKachel() aus dem bestehenden
 * Stimmen-Bestand (app/data/ig-testimonials.js, dort auch die Rechte: Christian
 * am 12.09.2026, volle Rechte an allen dort geführten Reels).
 *
 * DIE CLIPS sind sechs Sekunden aus dem jeweiligen Video ab 0,4 s, 720 px breit,
 * ohne Tonspur geschnitten (ffmpeg -an, mit ffprobe nachgeprüft: nur eine
 * Videospur) und auf unserem Shopify-CDN abgelegt; 0,3 bis 1,1 MB je Clip statt
 * 3 bis 20 MB für das ganze Video. Deshalb steht bei jedem Eintrag ton 'stumm'.
 * Das Standbild ist das erste Bild des Clips, damit beim Start nichts springt.
 *
 * AUSWAHL: nur Videos mit 720 px Ausgangsbreite, weil das Standbild sonst am Handy
 * unscharf wäre (Kate, Verena: 360 px; Yves: 548 px). Kakao hat im Bestand genau
 * ein Video mit Rechten (Vanessa). Die Titel stehen nicht im Bestand; sie sind
 * kurz gefasst aus dem Bildtext der Person, wo es ging in ihren eigenen Worten.
 */
export const VORSCHAU_KOPF = 'Echte Stimmen auf Instagram';

export const VORSCHAU_KACHELN = [
  stimmenKachel('DUY4iOojqSh', {
    titel: 'Ein stiller Moment mit Kakao',
    clip: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-video-galerie-720--duy4ioojqsh--9c83dd1e7aa4.mp4?v=1794173123',
    poster: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-video-galerie-720--duy4ioojqsh--1dfa8a50d70b.jpg?v=1794173210',
    ton: 'stumm',
  }),
  stimmenKachel('DZPDuPBu_i-', {
    titel: 'Seit sechs Wochen jeden Tag dabei',
    clip: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-video-galerie-720--dzpdupbu-i---3db556a94432.mp4?v=1794173173',
    poster: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-video-galerie-720--dzpdupbu-i---9fdc60571abd.jpg?v=1794173248',
    ton: 'stumm',
  }),
  stimmenKachel('DXxEwcUM2tv', {
    titel: '„Das bleibt.“',
    clip: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-video-galerie-720--dxxewcum2tv--edfb58c79cfb.mp4?v=1794173162',
    poster: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-video-galerie-720--dxxewcum2tv--4b4add2a5309.jpg?v=1794173238',
    ton: 'stumm',
  }),
  stimmenKachel('DVJo5KcDepJ', {
    titel: 'Zurück zum eigenen Rhythmus',
    clip: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-video-galerie-720--dvjo5kcdepj--fea1c43dcaf9.mp4?v=1794173135',
    poster: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-video-galerie-720--dvjo5kcdepj--5f520f2c636b.jpg?v=1794173221',
    ton: 'stumm',
  }),
  stimmenKachel('DWRvSt1DfRD', {
    titel: 'Eleganz, die man fühlt',
    clip: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-video-galerie-720--dwrvst1dfrd--5dfe2ebce00b.mp4?v=1794173147',
    poster: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-video-galerie-720--dwrvst1dfrd--5059372d9273.jpg?v=1794173231',
    ton: 'stumm',
  }),
  stimmenKachel('CbfodD7O0tR', {
    titel: 'Joshuas erster Moment mit dem QiOne',
    clip: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-video-galerie-720--cbfodd7o0tr--e357ff263f19.mp4?v=1794173098',
    poster: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-video-galerie-720--cbfodd7o0tr--f628df2236c5.jpg?v=1794173191',
    ton: 'stumm',
  }),
  stimmenKachel('CbTJ_kChUQe', {
    titel: 'Andi Lew über den QiOne',
    clip: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-video-galerie-720--cbtj-kchuqe--965ff2f53a36.mp4?v=1794173111',
    poster: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-video-galerie-720--cbtj-kchuqe--553bc86865d0.jpg?v=1794173200',
    ton: 'stumm',
  }),
  stimmenKachel('C0cPj-uPKlx', {
    titel: 'Scotts erster Monat',
    clip: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-video-galerie-720--c0cpj-upklx--8bfb90e8b6d4.mp4?v=1794173085',
    poster: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-video-galerie-720--c0cpj-upklx--1ada9f1924b4.jpg?v=1794173183',
    ton: 'stumm',
  }),
].filter(Boolean);
