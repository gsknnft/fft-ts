const assert = require("node:assert/strict");
const { FourierTransform } = require("../dist/index.cjs");

function approxEqual(a, b, eps = 1e-9) {
  return Math.abs(a - b) <= eps;
}

function maxIndex(arr) {
  let idx = 0;
  let best = arr[0];
  for (let i = 1; i < arr.length; i += 1) {
    if (arr[i] > best) {
      best = arr[i];
      idx = i;
    }
  }
  return idx;
}

function spectrum(input) {
  const ft = new FourierTransform(input.length, 1);
  ft.real.set(Float64Array.from(input));
  ft.transform();
  return Array.from(ft.calculateSpectrum());
}

describe("fft-ts golden vectors", () => {
  it("impulse signal produces flat magnitude spectrum", () => {
    const s = spectrum([1, 0, 0, 0, 0, 0, 0, 0]);
    for (let i = 1; i < s.length; i += 1) {
      assert.equal(approxEqual(s[i], s[0], 1e-9), true);
    }
  });

  it("constant signal concentrates energy at DC", () => {
    const s = spectrum([1, 1, 1, 1, 1, 1, 1, 1]);

    assert.equal(s[0] > 0, true);
    for (let i = 1; i < s.length; i += 1) {
      assert.equal(Math.abs(s[i]) < 1e-9, true);
    }
  });

  it("single-cycle sine wave peaks at bin 1", () => {
    const N = 8;
    const x = Array.from({ length: N }, (_, n) => Math.sin((2 * Math.PI * n) / N));
    const s = spectrum(x);
    const peak = maxIndex(s);
    assert.equal(peak, 1);
  });
});
