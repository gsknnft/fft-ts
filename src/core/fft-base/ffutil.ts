
import { ComplexArray } from "../../complex";

/*===========================================================================*\
 * Fast Fourier Transform Frequency/Magnitude passes
 *
 * (c) Vail Systems. Joshua Jung and Ben Bryan. 2015
 *
 * This code is not designed to be highly optimized but as an educational
 * tool to understand the Fast Fourier Transform.
\*===========================================================================*/

// import {ComplexArray} from "../../utils/complex-array";

//-------------------------------------------------
// The following code assumes a complex number is
// an array: [real, imaginary]
//-------------------------------------------------

//-------------------------------------------------
// By Eulers Formula:
//
// e^(i*x) = cos(x) + i*sin(x)
//
// and in DFT:
//
// x = -2*PI*(k/N)
//-------------------------------------------------
import { Complex } from "../../complex";

const mapExponent: Record<number, Record<number, Complex>> = {};

function exponent(k: number, N: number): Complex {
  const x = -2 * Math.PI * (k / N);
  mapExponent[N] ??= {};
  mapExponent[N][k] ??= new Complex(Math.cos(x), Math.sin(x));
  return mapExponent[N][k];
}



//-------------------------------------------------
// Calculate FFT Magnitude for complex numbers.
//-------------------------------------------------
// Magnitude of a complex pair
function magnitude(re: number, im: number): number {
  return Math.sqrt(re * re + im * im);
}


/**
 * Magnitude of every complex bin in an interleaved spectrum
 * `[re0, im0, re1, im1, …]`. Returns one magnitude per bin (length = bins/2... no:
 * input length L holds L/2 complex bins, so the result has L/2 entries).
 */
function fftMag(fftBins: Float64Array): Float64Array {
  const bins = fftBins.length >>> 1;
  const mags = new Float64Array(bins);
  for (let k = 0; k < bins; k++) {
    mags[k] = magnitude(fftBins[2 * k], fftBins[2 * k + 1]);
  }
  return mags;
}
//-------------------------------------------------
// Calculate Frequency Bins
// 
// Returns an array of the frequencies (in hertz) of
// each FFT bin provided, assuming the sampleRate is
// samples taken per second.
//-------------------------------------------------
// Frequency bins in Hz
function fftFreq(fftBins: Float64Array, sampleRate: number): Float64Array {
  const bins = fftBins.length >>> 1;            // number of complex bins
  const freqs = new Float64Array(bins);
  const stepFreq = sampleRate / bins;
  for (let i = 0; i < bins; i++) {
    freqs[i] = i * stepFreq;
  }
  return freqs;
}

/**
 * FFT Implementation - Pure TypeScript
 * Fast Fourier Transform using Cooley-Tukey radix-2 algorithm
 * Zero external dependencies
 */
function nextPowerOfTwo(n: number): number {
  if (n < 1) return 1;
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

function magnitudeFromComplex(values: ComplexArray): Float64Array {
  // ComplexArray is struct-of-arrays: separate .real / .imag buffers.
  const magnitudes = new Float64Array(values.length);
  for (let i = 0; i < values.length; i++) {
    magnitudes[i] = Math.hypot(values.real[i], values.imag[i]);
  }
  return magnitudes;
}

// function bitReverse(i: number, bits: number): number {
//   let r = 0;
//   for (let b = 0; b < bits; b++) r = (r << 1) | ((i >>> b) & 1);
//   return r;
// }

/**
 * In-place iterative radix-2 Cooley–Tukey FFT over separate real/imag buffers.
 * Length must be a power of two. Forward (unnormalized) transform.
 */
function fftRadix2InPlace(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  if (n <= 1) return;

  // Bit-reversal permutation
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const tr = re[i]; re[i] = re[j]; re[j] = tr;
      const ti = im[i]; im[i] = im[j]; im[j] = ti;
    }
  }

  // Butterflies
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wRe = Math.cos(ang);
    const wIm = Math.sin(ang);
    const half = len >> 1;
    for (let i = 0; i < n; i += len) {
      let cRe = 1;
      let cIm = 0;
      for (let k = 0; k < half; k++) {
        const a = i + k;
        const b = a + half;
        const tRe = re[b] * cRe - im[b] * cIm;
        const tIm = re[b] * cIm + im[b] * cRe;
        re[b] = re[a] - tRe;
        im[b] = im[a] - tIm;
        re[a] += tRe;
        im[a] += tIm;
        const nextCRe = cRe * wRe - cIm * wIm;
        cIm = cRe * wIm + cIm * wRe;
        cRe = nextCRe;
      }
    }
  }
}

/**
 * Forward FFT of a real signal. Pads to the next power of two and returns a
 * struct-of-arrays {@link ComplexArray} (`.real` / `.imag`) of that padded length.
 */
function fftFunc(vector: Float64Array): ComplexArray {
  const size = nextPowerOfTwo(vector.length < 1 ? 1 : vector.length);
  const re = new Float64Array(size);
  const im = new Float64Array(size);
  for (let i = 0; i < vector.length && i < size; i++) re[i] = vector[i];
  fftRadix2InPlace(re, im);
  const out = new ComplexArray(size);
  out.real = re;
  out.imag = im;
  return out;
}

function forwardMagnitudes(realData: Float64Array): Float64Array {
  const spectrum = fftFunc(realData);
  return magnitudeFromComplex(spectrum);
}

function deriveCoherence(realData: Float64Array): number {
  const magnitudes = forwardMagnitudes(realData);
  const sum = magnitudes.reduce(
    (acc, value) => acc + (Number.isFinite(value) ? value : 0),
    0,
  );
  return sum > 0 ? magnitudes[0] / sum : 0;
}


export {
    fftFunc,
    magnitudeFromComplex,
    magnitude,
    nextPowerOfTwo,
    deriveCoherence,
    forwardMagnitudes,
    fftFreq,
    fftMag,
    exponent
}