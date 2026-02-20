import { FourierTransform } from "../core/radix2";

export interface Complex {
  real: number;
  imag: number;
  magnitude: number;
  phase: number;
}

/**
 * Simplified FFT implementation
 * In production, replace with optimized FFT library (FFTW, KissFFT, etc.)
 */
export function computeFFT(samples: Float64Array): Complex[] {
  const n = samples.length;
  const ft = new FourierTransform(n, 1);
  ft.real.set(samples);
  ft.imag.fill(0);
  ft.transform();

  const result: Complex[] = [];
  for (let i = 0; i < n; i++) {
    const re = ft.real[i];
    const im = ft.imag[i];
    result.push({
      real: re,
      imag: im,
      magnitude: Math.sqrt(re * re + im * im),
      phase: Math.atan2(im, re),
    });
  }

  return result;
}


export function computeFFTSpectrum(data: Float64Array): Float64Array {
  const ft = new FourierTransform(data.length, 1);
  ft.real.set(data);
  ft.imag.fill(0);
  ft.transform();
  return ft.calculateSpectrum();
}
