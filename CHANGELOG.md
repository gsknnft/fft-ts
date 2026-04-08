# Changelog

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
