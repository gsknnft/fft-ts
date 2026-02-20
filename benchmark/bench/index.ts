import { Suite } from 'benchmark';
import { FFTProcessor } from '../../fft/src/core/fft-processor'; // Your own
import FFT from '../../fft/src/core/fft-base/fft';             // Jens Nockert's FFT (npm fft)
import fourierTransform from "fourier-transform"; // npm fourier-transform

export function createInput(size: number): number[] {
  // Float array in [-1,1]
  return Array.from({ length: size }, () => Math.random() * 2 - 1);
}

// ---- Your Implementation ----
export function benchOurFFT(size: number) {
  const fft = new FFTProcessor(size);
  const input = Float64Array.from(createInput(size));
  return () => fft.forward(input);
}

// ---- Jens Nockert's FFT ----
export function benchJensNockert(size: number) {
  const fftP = new FFTProcessor(size);
  const fft = fftP.fft.complex(size, false);
  const input = createInput(size * 2); // interleaved real/imag
  const output = new Array(size * 2);
  return () => fft.simple(output, input, 'complex');
}

// ---- DSP.js ----
export function benchDSPJS(size: number) {
  const fftP = new FFT(size);
  const input = createInput(size);
  return () => fftP.forward(input);
}

// ---- fourier-transform ----
export function benchFourierTransform(size: number) {
  const input = createInput(size);
  return () => fourierTransform(input);
}

export function addBenchmarks(suite: Suite, size: number) {
  suite.add('Our FFT', benchOurFFT(size));
  suite.add('Jens Nockert FFT', benchJensNockert(size));
  suite.add('DSP.js', benchDSPJS(size));
  suite.add('fourier-transform', benchFourierTransform(size));
}

const sizes = [2048, 4096, 8192, 16384];

sizes.forEach(size => {
  const suite = new Suite();
  addBenchmarks(suite, size);

  console.log(`===== FFT Benchmark: size=${size} =====`);
  suite.on('cycle', (event: any) => {
    console.log('   ' + String(event.target));
  }).on('complete', function () {
    // @ts-ignore
    console.log('  Fastest is ' + this.filter('fastest').map('name'));
  });
  suite.run();
});
