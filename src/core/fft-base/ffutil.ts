
import { ComplexArray, multiply, add, subtract } from "../../complex";

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


function fftMag(fftBins: Float64Array): Float64Array {
  const half = fftBins.length >>> 1;
  const mags = new Float64Array(half >>> 1);
  for (let i = 0; i < half; i += 2) {
    mags[i >>> 1] = magnitude(fftBins[i], fftBins[i + 1]);
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
  const half = fftBins.length >>> 1;
  const freqs = new Float64Array(half >>> 1);
  const stepFreq = sampleRate / (fftBins.length >>> 1);
  for (let i = 0; i < freqs.length; i++) {
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
  const magnitudes = new Float64Array(values.length);
  for (let i = 0; i < values.length; i++) {
    const re = values[i].real;
    const im = values[i].imag;
    magnitudes[i] = Math.hypot(re, im);
  }
  return magnitudes;
}

// function bitReverse(i: number, bits: number): number {
//   let r = 0;
//   for (let b = 0; b < bits; b++) r = (r << 1) | ((i >>> b) & 1);
//   return r;
// }

function fftFunc(vector: Float64Array): ComplexArray {
  const N = vector.length;
  const X: ComplexArray = new ComplexArray(N);

  if (N === 1) {
    const val = vector[0];
    if (Array.isArray(val)) {
      // Assuming Complex is a class or factory function
      return new ComplexArray(val);
    } else {
      return new ComplexArray(val);
    }
  }

  const even = (_: unknown, ix: number) => ix % 2 === 0;
  const odd = (_: unknown, ix: number) => ix % 2 === 1;

  const X_evens = fftFunc(vector.filter(even));
  const X_odds = fftFunc(vector.filter(odd));

  for (let k = 0; k < N / 2; k++) {
    const t = X_evens[k];
    const e = multiply(exponent(k, N), X_odds[k]);

    X[k] = add(t, e);
    X[k + N / 2] = subtract(t, e);
  }

  return X;
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