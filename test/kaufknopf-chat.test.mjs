/**
 * Chat-Widget über dem Kaufknopf: die reine Entscheidung, hermetisch.
 *
 * Anlass: Job 20260926-chat-widget-verdeckt-kaufknopf-desktop. Live am
 * 2026-09-26 bei 1280x800 trafen 12 von 20 Punkten der Knopf-Mittellinie den
 * Kaufknopf, der Rest das geschlossene Widget. Die Lagen unten sind diese
 * gemessenen Rechtecke.
 *
 * Ein grüner Test hier ist KEIN Wirkungsnachweis. Ob der Knopf im gerenderten
 * Shop treffbar ist, misst der Hit-Test am Rand (Job-Ordner,
 * pruefungen/probe_kaufknopf_chat_frei.py).
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';

import {
  ABSTAND_PX,
  ueberdecktKaufknopf,
} from '../app/lib/kaufknopf-chat.js';

const r = (left, top, right, bottom) => ({left, top, right, bottom});

// Gemessen live 1280x800, Ruhelage: Knopf und geschlossenes Widget samt Blase.
const KNOPF_1280 = r(701, 715, 1101, 785);
const RAHMEN_1280 = r(926, 640, 1258, 793);

const lage = (ueber = {}) => ({
  rahmen: RAHMEN_1280,
  knoepfe: [KNOPF_1280],
  fensterHoehe: 800,
  angedockt: false,
  beruehrt: false,
  ...ueber,
});

test('der gemessene Befund: geschlossenes Widget über dem Knopf wird unterdrückt', () => {
  assert.equal(ueberdecktKaufknopf(lage()), true);
});

test('Knopf weit oberhalb des Widgets: Widget bleibt stehen', () => {
  assert.equal(ueberdecktKaufknopf(lage({knoepfe: [r(701, 365, 1101, 435)]})), false);
});

test('Knopf knapp neben dem Widget (innerhalb der Luft) zählt als Überdeckung', () => {
  const knapp = r(701, 715, RAHMEN_1280.left - ABSTAND_PX + 1, 785);
  assert.equal(ueberdecktKaufknopf(lage({knoepfe: [knapp]})), true);
  const frei = r(701, 715, RAHMEN_1280.left - ABSTAND_PX - 1, 785);
  assert.equal(ueberdecktKaufknopf(lage({knoepfe: [frei]})), false);
});

test('der offene Chat wird nie unterdrückt: angedockt', () => {
  assert.equal(ueberdecktKaufknopf(lage({angedockt: true})), false);
});

test('der offene Chat wird nie unterdrückt: höher als 60 % des Fensters', () => {
  // Offenes Overlay auf dem Handy: fast so hoch wie der Schirm.
  assert.equal(
    ueberdecktKaufknopf(lage({rahmen: r(8, 40, 406, 848), fensterHoehe: 896,
      knoepfe: [r(10, 700, 404, 770)]})),
    false,
  );
});

test('der offene Chat wird nie unterdrückt: der Kunde hat hineingeklickt', () => {
  assert.equal(ueberdecktKaufknopf(lage({beruehrt: true})), false);
});

test('ohne Rahmen, ohne Kasten oder ohne Knopf: keine Unterdrückung', () => {
  assert.equal(ueberdecktKaufknopf(lage({rahmen: null})), false);
  assert.equal(ueberdecktKaufknopf(lage({rahmen: r(0, 0, 0, 0)})), false);
  assert.equal(ueberdecktKaufknopf(lage({knoepfe: []})), false);
  assert.equal(ueberdecktKaufknopf(lage({knoepfe: [r(0, 0, 0, 0)]})), false);
});

test('ein zweiter Knopf, der überdeckt, genügt', () => {
  assert.equal(
    ueberdecktKaufknopf(lage({knoepfe: [r(701, 100, 1101, 170), KNOPF_1280]})),
    true,
  );
});
