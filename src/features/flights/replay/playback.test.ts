import assert from "node:assert/strict";
import test from "node:test";
import { createPlayback } from "./playback.ts";

test("it starts paused at zero and does not move until played", () => {
  const playback = createPlayback(100);
  playback.advance(5);
  assert.equal(playback.getState().time, 0);
  playback.play();
  playback.advance(5);
  assert.equal(playback.getState().time, 5 * playback.getState().speed);
});

test("the speed multiplies the time that passes", () => {
  const playback = createPlayback(1000);
  playback.setSpeed(8);
  playback.play();
  playback.advance(2);
  assert.equal(playback.getState().time, 16);
});

test("it stops at the end, and playing again starts over", () => {
  const playback = createPlayback(10);
  playback.setSpeed(1);
  playback.play();
  playback.advance(20);
  assert.equal(playback.getState().time, 10);
  assert.equal(playback.getState().playing, false);
  assert.equal(playback.getState().ended, true);
  playback.play();
  assert.equal(playback.getState().time, 0);
  assert.equal(playback.getState().playing, true);
  assert.equal(playback.getState().ended, false);
});

test("seeking stays inside the flight and marks the end", () => {
  const playback = createPlayback(10);
  playback.seek(-3);
  assert.equal(playback.getState().time, 0);
  playback.seek(99);
  assert.equal(playback.getState().time, 10);
  assert.equal(playback.getState().ended, true);
  playback.seek(4);
  assert.equal(playback.getState().ended, false);
});

test("frames hear every change of time, the interface only hears now and then while playing", () => {
  let clock = 0;
  const playback = createPlayback(1000, () => clock);
  let frames = 0;
  let announcements = 0;
  playback.onFrame(() => (frames += 1));
  playback.subscribe(() => (announcements += 1));
  playback.play();
  const afterPlay = announcements;
  for (let i = 0; i < 10; i += 1) {
    clock += 16;
    playback.advance(0.016);
  }
  assert.equal(frames, 10);
  assert.ok(
    announcements - afterPlay < 4,
    "the slider is not redrawn on every frame",
  );
  playback.pause();
  assert.ok(announcements > afterPlay, "pausing is announced at once");
});

test("unsubscribing stops the notifications", () => {
  const playback = createPlayback(10);
  let heard = 0;
  const stop = playback.subscribe(() => (heard += 1));
  playback.setSpeed(2);
  stop();
  playback.setSpeed(8);
  assert.equal(heard, 1);
});
