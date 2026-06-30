# Changelog

## 1.2.0 - 2026-06-29

### Fixed

- `computeFFT()` and `computeFFTSpectrum()` now allocate enough Bluestein scratch memory for non-power-of-two inputs, avoiding `NaN` results for arbitrary-length signals.
- `Router.scanWaveletRouting()` now sizes each FFT from the signal data instead of the number of signals.
- `FFTProcessor.tickFFT()` no longer mutates its rolling buffer while windowing and no longer logs from library code.
- High-level radix helpers now avoid zero-padding allocations when input length is already a power of two; event/router helpers pad only when `FFTProcessor` requires it.
- `new fft(...)` now throws with guidance to use `fft(input)` or `new FFT(size)`, keeping the helper and class APIs distinct.

### Changed

- Package output is ESM-only: `dist/index.js` plus declaration files. The package no longer publishes or documents a CommonJS entrypoint.
- Local release tests import the built ESM artifact and assert the stable public exports: `FFT`, `fft`, `fftMagnitude`, `computeFFT`, and `computeFFTSpectrum`.
- README examples now use `fft()` as a high-level function and `new FFT(size)` for the low-level class.
- Removed stale CommonJS build configs, generated examples, and unused webpack demo metadata from the release tree.
- Public helper tests now cover arbitrary-length inputs, exported ESM symbols, router analysis, constructor/function API boundaries, padding behavior, and finite helper output.`r`n`r`n## 1.1.0 - 2026-06-02

### Fixed (correctness - the core FFT was producing wrong/throwing results)

- **`FFT` constructor was broken.** It read `_csize` before assigning `size`
  (-> zero-length buffers -> `Invalid typed array length: -2147483648`) and built
  twiddle factors with half the correct angle (`Math.PI * (i>>1) / n` instead of
  `Math.PI * i / size`), so every transform returned garbage. Restored the canonical
  radix-4 constructor: `new FFT(size)` where `size` is a power of two > 1, with proper
  validation, twiddle table, and bit-reversal. Round-trip error is now ~1e-31.
- **`fft` export was the class, not a function** - `fft(data)` threw
  "class constructor cannot be invoked without new." `fft` is now a real function.
- **`fftMag` / `fftFreq` covered only a quarter of the spectrum** (wrong loop bound and
  output length). They now return one value per complex bin.
- **`FFTProcessor` passed a buffer where a numeric size was required** - fixed to the
  derived size.
- **`fftFunc` / `magnitudeFromComplex` / `forwardMagnitudes` / `deriveCoherence` all
  crashed** - they indexed a struct-of-arrays `ComplexArray` (`.real[i]` / `.imag[i]`)
  as if it were an array of `Complex` objects (`X[k].real`), so every call threw
  "Cannot read properties of undefined." Replaced the broken recursion with a correct
  in-place iterative radix-2 transform and fixed the magnitude readout.

### Added

- **`fft(input)`** - high-level forward FFT for arbitrary-length real input. Pads to the
  next power of two; returns the full interleaved complex spectrum.
- **`fftMagnitude(input)`** - magnitude spectrum of real input, one magnitude per bin.

### Changed (breaking, but the old behavior was non-functional)

- `new FFT(...)` now takes a **numeric size** (power of two), matching the documented
  `realTransform` / `completeSpectrum` workflow, instead of a data array. Use the new
  `fft()` / `fftMagnitude()` helpers (or `padToPowerOfTwo`) for raw signals.
- `main` pointed to the CommonJS bundle (`dist/index.cjs`); `module` stayed ESM. This was superseded by the ESM-only 1.2.0 release.
- Removed the dangling `./fftimage` subpath export (the bundle never emitted that file);
  `FFTImageDataRGBA` remains available from the package root.

## 1.0.3 - 2026-04-08

### Added

- exported public deinterleave helpers:
  - `deinterleave`
  - `deinterleaveChannel`
- exported additional event-oriented helpers:
  - `fourriouoorFreq`
  - `fourriouoorFreqInv`
  - `fourriouoorTick`
  - `padToPowerOfTwo`
- restored `fftimage` as a public runnable surface
- added shared public types under `src/types`

### Fixed

- replaced broken benchmark-shaped `deinterleave` placeholder with real channel-splitting utilities
- fixed `fftimage` to use the FFT-capable `ComplexArray`
- removed a stray invalid shared-type dependency in `fouriouoor`
- made top-level FFT helpers safer by cloning existing `ComplexArray` inputs instead of mutating caller-owned instances
- replaced fragile recursive twiddle-update logic with explicit temporaries

### Changed

- cleaned and hardened the package root export surface
- updated README to document the actual production-facing API
- tightened `prepublishOnly` checks to run typecheck, build, and pack-dry-run

