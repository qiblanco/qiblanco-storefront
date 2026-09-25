/**
 * Bild-Schicht: Größen-Parameter, srcset-Leiter und der Riegel für die
 * amtliche Grafik.
 *
 * Anlass: Job 20260908-REPAIR-eu-gewaehrleistungslabel-259-kb-auf-jeder-seite.
 * Gemessen am 2026-09-08 über `app/`: 347 fest verdrahtete CDN-Bildquellen,
 * davon 0 mit Größen-Parameter.
 *
 * STAND 2026-09-08 (UPDATE-Auftrag „Foto selbst wählen, Absatz
 * veröffentlichen"; die volle Job-Kennung steht in der Commit-Botschaft --
 * sie trägt einen ASCII-Digraphen und darf hier deshalb nicht in den Fließtext,
 * ohne den Umlaut-Gate auf einen BEZEICHNER auszulösen):
 * Dieser Zweig bringt von der Bild-Schicht NUR die
 * beiden wiederverwendbaren Bausteine mit (shopifyBildQuellen, CdnBild) --
 * genau das, was der Autorenkasten für sein Foto braucht. Die Seiten-Umbauten
 * am EU-Gewährleistungslabel und am Kopf gehören zum Schwester-Auftrag und
 * sind hier bewusst NICHT dabei.
 * DESHALB FEHLT HIER EIN ARM, UND ZWAR BENANNT: der Block 'amtliche Grafik'
 * prüfte den mindestBreite-Riegel an den Label-Assets und braucht dafür
 * app/lib/eu-gewaehrleistungslabel.js, das es auf diesem Zweig nicht gibt. Er
 * ist ENTFERNT, nicht auskommentiert und nicht stillgelegt -- er gehört zum
 * Label-Zweig und kommt mit ihm zurück. Der Riegel SELBST bleibt geprüft: der
 * mindestBreite-Arm in 'bildLeiterFuer' unten misst ihn ohne Label-Assets.
 *
 * WAS DIESE TESTS ABSICHERN UND WAS NICHT: sie prüfen die ERZEUGTEN URLs und
 * den Riegel. Ob eine Seite dadurch weniger Bytes zieht, ist eine Aussage
 * über die Auslieferung und wird von
 * homepage-bauer/pruefungen/probe_chrome_bildlast.py am echten Browser
 * gemessen -- nicht hier. Ein gruener Test hier ist KEIN Beleg für die
 * Wirkung.
 * DER PFAD STAND BIS ZUM 2026-09-21 FALSCH HIER, und das war kein Tippfehler,
 * sondern der Befund: die Probe lag ausschließlich in nie gepushten Commits
 * eines geteilten Werkbank-Klons und hat NIE gelaufen. Dieser Verweis zeigte
 * also auf einen Weg, den niemand gehen konnte -- ein Verweis ist aber eine
 * Zusage auf Gangbarkeit. Seither liegt die Probe in shared-state (also dort,
 * wo der ausgelieferte Stand sie nicht wieder verlieren kann) und läuft
 * täglich als rt-Task `storefront-bildlast-rand`.
 * IHR ERSTER LAUF MELDETE SOFORT BEFUND: alle drei bewachten Kennungen lagen
 * exakt auf dem Vorher-Wert, den ihre eigenen Schwellen zitieren. Die
 * Byte-Senkung, die diese Tests begleiten, ist am Kundenrand nie angekommen --
 * genau das, wovor der Absatz oben warnt.
 */
import {describe, it} from 'node:test';
import assert from 'node:assert/strict';

import {
  bildQuellen,
  bildLeiterFuer,
  bildSrcSet,
} from '../app/components/reusables/shopifyBildQuellen.js';

const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/x.png?v=1';

describe('bildLeiterFuer', () => {
  it('baut die dpr-Sprossen einer Anzeigebreite', () => {
    assert.deepEqual(bildLeiterFuer(150), [150, 300, 450]);
  });

  it('klemmt an der Masterbreite, statt sie zu ueberzeichnen', () => {
    // Master 129 (die Menue-Icons): 45*3 = 135 laege darueber.
    assert.deepEqual(bildLeiterFuer(45, {masterBreite: 129}), [45, 90, 129]);
  });

  it('hebt jede Sprosse über die Mindestbreite, ohne die hohen zu kappen', () => {
    // 480/960/1440 -> die 1x-Sprosse wird auf den Riegel gehoben, die
    // 2x-Sprosse liegt schon darueber und bleibt. Ein Riegel darf die
    // Aufloesung nur nach UNTEN begrenzen, nie nach oben.
    assert.deepEqual(bildLeiterFuer(480, {mindestBreite: 960}), [960, 1440]);
  });
});

describe('bildQuellen', () => {
  it('setzt einen Größen-Parameter AUCH auf den src', () => {
    // DAS ist die Regression, um die es geht: ohne width= liefert das CDN die
    // Masterdatei und wandelt ein PNG nicht einmal in WebP um.
    const q = bildQuellen(CDN, {anzeigeBreite: 150});
    assert.match(q.src, /[?&]width=150(&|$)/);
    assert.ok(!/width=\d+.*width=\d+/.test(q.src), 'nur EIN width-Parameter');
  });

  it('hängt die Leiter als w-Deskriptoren an', () => {
    const q = bildQuellen(CDN, {anzeigeBreite: 150});
    assert.equal(q.srcSet.split(', ').length, 3);
    assert.match(q.srcSet, /width=450 450w$/);
    assert.equal(q.sizes, '150px');
  });

  it('lässt eine Fremd-URL unangetastet (fail-soft)', () => {
    const q = bildQuellen('https://example.com/a.png', {anzeigeBreite: 150});
    assert.equal(q.src, 'https://example.com/a.png');
    assert.equal(q.srcSet, undefined);
    assert.equal(q.sizes, undefined);
  });

  it('faellt ohne Anzeigebreite auf die unveraenderte Quelle zurück', () => {
    const q = bildQuellen(CDN, {});
    assert.equal(q.src, CDN);
    assert.equal(q.srcSet, undefined);
  });

  it('nimmt gemessene Zusatz-Sprossen unter die dpr-Leiter auf', () => {
    // Mega-Menü (Job 20260924-header-menue-mobil-sprosse): 325er-Fläche,
    // Master 597 -> bisher [325, 597]; mit 240 darunter wird 240 der src.
    const q = bildQuellen(CDN, {anzeigeBreite: 325, masterBreite: 597, zusatzSprossen: [240]});
    assert.deepEqual(q.srcSet.split(', ').map((x) => Number(x.split(' ')[1].slice(0, -1))),
      [240, 325, 597]);
    assert.match(q.src, /[?&]width=240$/);
  });

  it('klemmt Zusatz-Sprossen an Master und Mindestbreite', () => {
    const q = bildQuellen(CDN, {anzeigeBreite: 100, masterBreite: 250, mindestBreite: 120,
      zusatzSprossen: [60, 160, 400]});
    assert.deepEqual(q.srcSet.split(', ').map((x) => Number(x.split(' ')[1].slice(0, -1))),
      [120, 160, 200, 250]);
  });

  it('lässt die Leiter ohne Zusatz-Sprossen byte-gleich', () => {
    const ohne = bildQuellen(CDN, {anzeigeBreite: 325, masterBreite: 668});
    const leer = bildQuellen(CDN, {anzeigeBreite: 325, masterBreite: 668, zusatzSprossen: []});
    assert.deepEqual(leer, ohne);
    assert.match(ohne.srcSet, /^\S+width=325 325w, \S+width=650 650w, \S+width=668 668w$/);
  });

  it('bleibt vertraeglich mit dem aelteren bildSrcSet', () => {
    assert.match(bildSrcSet(CDN), /width=320 320w/);
  });
});
