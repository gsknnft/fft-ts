# @gsknnft/fft-ts

Modern FFT toolkit for TypeScript with a Float64-first implementation path.

This package is the public/stable FFT lane in SigilNet.

- `fft-ts`: optimized public implementation
- `fft-legacy`: private/internal lane with non-public extensions

## Install

```bash
pnpm add @gsknnft/fft-ts
```

## Usage

```ts
import { computeFFT, computeFFTSpectrum, fft } from "@gsknnft/fft-ts";

const samples = new Float64Array([0, 1, 0, -1, 0, 1, 0, -1]);

const bins = computeFFT(samples); // complex bins + magnitude/phase
const spectrum = computeFFTSpectrum(samples); // magnitude spectrum

const engine = new fft(samples); // low-level FFT engine
const out = engine.createComplexArray();
const input = engine.toComplexArray(samples);
engine.transform(out, input);
```

## API Highlights

- `computeFFT(samples: Float64Array): Complex[]`
- `computeFFTSpectrum(data: Float64Array): Float64Array`
- `fft` (default export alias of low-level FFT class)
- `FFTProcessor` for derived/magnitude workflows
- utility and core exports under package root

## Scripts

```bash
pnpm --filter @gsknnft/fft-ts typecheck
pnpm --filter @gsknnft/fft-ts test
pnpm --filter @gsknnft/fft-ts build
npm pack --dry-run --prefix packages/fft-ts
```

## Scope

- deterministic spectral utilities
- browser + Node build targets
- no runtime governance/control-plane logic

## License

MIT
