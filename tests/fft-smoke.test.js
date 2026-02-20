const assert = require("node:assert/strict");
const pkg = require("../dist/index.cjs");

describe("fft-ts dist smoke", () => {
  it("exports computeFFTSpectrum", () => {
    assert.equal(typeof pkg.computeFFTSpectrum, "function");
  });

  it("exports computeFFT", () => {
    assert.equal(typeof pkg.computeFFT, "function");
  });

  it("exports low-level fft class alias", () => {
    assert.equal(typeof pkg.fft, "function");
  });
});
