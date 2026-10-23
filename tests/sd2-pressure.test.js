import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Analytical pressure estimate, NOT a game-engine combat simulation.
// All constants are extracted from the GitHub development-branch source at the time of authoring;
// source drift is checked below to prevent silent calibration changes.
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sd2source = readFileSync(new URL('../experimental/sd2.js', import.meta.url), 'utf8');
const enemy = {
  NORMAL: { hp: 80, speed: .045, breach: 8 },
  RUNNER: { hp: 60, speed: .080, breach: 10 },
  SPLITTER: { hp: 130, speed: .045, breach: 12 },
  TANK: { hp: 300, speed: .031, breach: 20 },
  SHIELDED: { hp: 220, speed: .036, breach: 16 },
};
const weights = [
  [85,15,0,0,0],[70,30,0,0,0],[55,45,0,0,0],
  [60,25,0,15,0],[45,25,0,30,0],[35,25,0,40,0],
  [35,20,25,20,0],[30,20,30,20,0],[25,20,35,20,0],
  [30,20,10,25,15],[25,20,15,20,20],[20,20,15,20,25],
  [20,20,20,20,20],[15,25,20,20,20],[15,20,20,20,25],
];
const types = Object.keys(enemy);
const costs = { NORMAL:1,RUNNER:1.5,SPLITTER:2.5,TANK:3,SHIELDED:4 };
const cfg = (() => {
  const sandbox = { window: {}, console };
  vm.runInNewContext(sd2source, sandbox);
  return sandbox.window.SD2;
})();
function estimate(level, profile='mid') {
  const upgrade = Math.min(6,Math.round(6*(level-1)/14*({new:.4,mid:.7,adv:1}[profile])));
  const dps = 18*Math.pow(1.10,upgrade)*2.8*Math.pow(1.10,upgrade)¶»§q«^