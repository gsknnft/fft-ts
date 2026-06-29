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

  it("handles non-power-of-two public inputs without NaN", () => {
    const samples = Float64Array.from([1, 2, 3]);
    const bins = pkg.computeFFT(samples);
    const spectrum = pkg.computeFFTSpectrum(samples);
    const padded = pkg.fftMagnitude(samples);

    assert.equal(bins.length, 3);
    assert.equal(spectrum.length, 1);
    assert.equal(padded.length, 4);
    assert.equal(bins.every((bin) => Number.isFinite(bin.magnitude)), true);
    assert.equal(Array.from(spectrum).every(Number.isFinite), true);
    assert.equal(Array.from(padded).every(Number.isFinite), true);
  });

  it("keeps public analysis helpers finite and quiet", async () => {
    const events = [
      { amplitude: 1 },
      { amplitude: 0 },
      { amplitude: -1 },
    ];

    const any = pkg.fourriouoorAny(events);
    const freq = await pkg.fourriouoorFreq(events);
    const inv = await pkg.fourriouoorFreqInv(events);

    assert.equal(any.every((point) => Number.isFinite(point.mag)), true);
    assert.equal(freq.result.every((point) => Number.isFinite(point.mag)), true);
    assert.equal(inv.result.every((point) => Number.isFinite(point.mag)), true);
  });

  it("routes each signal with its own FFT sample length", () => {
    const routed = pkg.Router.scanWaveletRouting([
      { id: "a", phase: 0, data: [1, 2, 3, 4] },
      { id: "b", phase: Math.PI / 2, data: [4, 3, 2, 1] },
    ]);

    assert.equal(routed.results.length, 2);
    assert.equal(routed.results.every((entry) => Number.isFinite(entry.energy)), true);
    assert.equal(routed.results.every((entry) => Number.isFinite(entry.coherence)), true);
    assert.equal(routed.eigen.realEigenvalues.length, 2);
  });

});
