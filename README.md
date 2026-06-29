[![NPM Version](https://img.shields.io/npm/v/@gsknnft/fft-ts.svg?style=flat-square)](https://www.npmjs.com/package/@gsknnft/fft-ts)
[![NPM Downloads](https://img.shields.io/npm/dw/@gsknnft/fft-ts.svg?style=flat-square)](https://www.npmjs.com/package/@gsknnft/fft-ts)
[![License](https://img.shields.io/npm/l/@gsknnft/fft-ts.svg?style=flat-square)](https://www.npmjs.com/package/@gsknnft/fft-ts)
[![Socket Badge](https://badge.socket.dev/npm/package/@gsknnft/fft-ts)](https://socket.dev/npm/package/@gsknnft/fft-ts)

# `@gsknnft/fft-ts`

Production-facing FFT and spectral utility toolkit for TypeScript and Node.js.

`fft-ts` is the public FFT lane in SigilNet. It exposes:
- high-level FFT helpers
- lower-level transform engines
- image-frequency helpers
- deinterleave utilities for interleaved channel data
- event-oriented frequency helpers for quick signal inspection

## Install

```bash
pnpm add @gsknnft/fft-ts
```

## Public Surface

### Core transforms

```ts
import {
  computeFFT,
  computeFFTSpectrum,
  fft,
  fftMagnitude,
  FFT,
  FFTProcessor,
  FourierTransform,
} from "@gsknnft/fft-ts";

const samples = new Float64Array([0, 1, 0, -1, 0, 1, 0, -1]);

const bins = computeFFT(samples);
const spectrum = computeFFTSpectrum(samples);
const fullInterleavedSpectrum = fft(samples);
const magnitudes = fftMagnitude(samples);

const engine = new FFT(8);
const out = engine.createComplexArray();
engine.realTransform(out, samples);
engine.completeSpectrum(out);
```

### Deinterleave utilities

```ts
import { deinterleave, deinterleaveChannel } from "@gsknnft/fft-ts";

const interleaved = new Float32Array([
  0.1, 0.9,
  0.2, 0.8,
  0.3, 0.7,
]);

const [left, right] = deinterleave(interleaved, { channels: 2 });
const justLeft = deinterleaveChannel(interleaved, {
  channels: 2,
  channel: 0,
});
```

### Event / frequency helpers

```ts
import {
  fourriouoorAny,
  fourriouoorFreq,
  fourriouoorFreqInv,
  fourriouoorTick,
  padToPowerOfTwo,
} from "@gsknnft/fft-ts";

const events = [
  { amplitude: 0.2 },
  { amplitude: 0.5 },
  { amplitude: -0.1 },
];

const padded = padToPowerOfTwo(events.map((event) => event.amplitude));
const quickSpectrum = fourriouoorAny(events);
```

### Image-frequency helper

```ts
import { FFTImageDataRGBA } from "@gsknnft/fft-ts";

const complexImage = FFTImageDataRGBA(imageData.data, imageData.width, imageData.height);
```

This helper is useful for experimental image-analysis pipelines, QA metrics, and frequency-domain image inspection. It is not an image reconstruction engine by itself.

## Exported Types

The package also exports shared types such as:
- `ComplexLike`
- `FFTDirection`
- `FFTResult`
- `SpectrumBin`
- `AmplitudeEvent`
- `SignalEvent`
- `AnyEvent`
- `DeinterleaveResult`

It also exports utility aliases for the legacy complex-array helper path:
- `FFTUtility`
- `InvFFTUtility`
- `frequencyMapUtility`

## Notes

- The top-level helper APIs now avoid mutating caller-owned `ComplexArray` inputs unexpectedly.
- `fftimage` is exported as a real runnable surface.
- `deinterleave` is production-safe and no longer tied to benchmark-only code.

## Suggested Use In Media Pipelines

`fft-ts` is a good fit for:
- frequency fingerprints
- edge/detail scoring
- texture/noise analysis
- synthetic capture QA
- interleaved audio/signal channel splitting

It is not intended to replace domain-specific reconstruction or mesh-generation pipelines.

## Release Checks

```bash
pnpm --filter @gsknnft/fft-ts typecheck
pnpm --filter @gsknnft/fft-ts build
pnpm --filter @gsknnft/fft-ts test
pnpm --filter @gsknnft/fft-ts pack:check
```

## License

MIT
