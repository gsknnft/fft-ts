import assert from "node:assert/strict";
import * as pkg from "../dist/index.js";

describe("fft-ts dist smoke", () => {
  it("exports computeFFTSpectrum", () => {
    assert.equal(typeof pkg.computeFFTSpectrum, "function");
  });

  it("exports computeFFT", () => {
    assert.equal(typeof pkg.computeFFT, "function");
  });

  it("exports high-level fft helpers", () => {
    assert.equal(typeof pkg.fft, "function");
    assert.equal(typeof pkg.fftMagnitude, "function");
  });

  it("exports low-level FFT class", () => {
    assert.equal(typeof pkg.FFT, "function");
  });
});
