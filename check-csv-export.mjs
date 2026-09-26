import assert from 'node:assert/strict';
import { rowsToCsv, downloadCsv } from './src/lib/csv-export.ts';

assert.equal(rowsToCsv([]), '');
assert.equal(rowsToCsv([{name: 'Dawn, "Test"', note: 'first\nsecond'}, {name: 'Élodie', extra: 0}]),
  '\uFEFF"name","note","extra"\r\n"Dawn, ""Test""","first\nsecond",""\r\n"Élodie","","0"\r\n');
assert.equal(rowsToCsv([{formula: '=1+1', nested: {active: true}, empty: null}]),
  '\uFEFF"formula","nested","empty"\r\n"\'=1+1","{""active"":true}",""\r\n');
let clicked = false, removed = false, savedBlob;
const anchor = {click() {clicked = true;}, remove() {removed = true;}};
globalThis.document = {createElement: () => anchor, body: {appendChild() {}}};
URL.createObjectURL = (blob) => {savedBlob = blob; return 'blob:test';};
globalThis.setTimeout = () => 0;
downloadCsv([{name: 'Dawn'}], 'anewdawn-test.csv');
assert.equal(anchor.download, 'anewdawn-test.csv');
assert.equal(anchor.href, 'blob:test');
assert.ok(clicked && removed);
assert.equal(savedBlob.type, 'text/csv;charset=utf-8');
assert.equal(await savedBlob.text(), '"name"\r\n"Dawn"\r\n');
assert.throws(() => downloadCsv([], 'empty.csv'), /no records/);
console.log('PASS: CSV escaping, Unicode, multiline, mixed columns, nested data, formula protection, empty data and download wiring');
