import FFT from '../fft-base/fft';
import {FourierTransform} from '../radix2';

function applyHann(buffer: Float64Array): void {
  const N = buffer.length;
  for (let i = 0; i < N; i++) {
    buffer[i] *= 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N - 1)));
  }
} 

export class FFTProcessor {
  public freq: number = 0;
  public fft: FFT;
  public ft: FourierTransform;
  public size: number;
  private _hop = 4; // e.g., half-overlap
  private _tick = 0;
  private _buffer = new Float64Array(8);
  private _index = 0;
 
  constructor(size: number[] | Float64Array) {
    const n = Array.isArray(size) ? size.length : size.length;
    if (n < 2) throw new Error("FFT needs at least 2 samples");
    if ((n & (n - 1)) !== 0) throw new Error("FFT size must be a power of two");
    this.size = n;
    this.fft = new FFT(size);
    this.ft = new FourierTransform(this.size, 1); // sampleRate = 1 by default
  }

  forward(realData: Float64Array): Float64Array {
    const out = this.fft.createComplexArray();
    const input = this.toComplexArray(realData);
    this.fft.transform(out, input);

    const magnitude = new Float64Array(this.size / 2);
    for (let i = 0; i < magnitude.length; i++) {
      const re = out[2 * i];
      const im = out[2 * i + 1];
      magnitude[i] = Math.sqrt(re ** 2 + im ** 2);
    }

    return magnitude;
  }
// In FFTProcessor

forwardWithPhase(realData: Float64Array): {
  magnitude: Float64Array,
  real: Float64Array,
  imag: Float64Array
} {
  const out = this.fft.createComplexArray();
  const input = this.toComplexArray(realData);
  this.fft.transform(out, input);

  const N = this.size / 2;
  const magnitude = new Float64Array(N);
  const real = new Float64Array(N);
  const imag = new Float64Array(N);

  for (let i = 0; i < N; i++) {
    const re = out[2 * i];
    const im = out[2 * i + 1];
    magnitude[i] = Math.sqrt(re ** 2 + im ** 2);
    real[i] = re;
    imag[i] = im;
  }
  
  return { magnitude, real, imag };
}
  /** Radix-2 FT spectrum (alternative view) */
  radix2(realData: Float64Array): Float64Array<ArrayBufferLike> {
    this.ft.real.set(realData);
    this.ft.transform();
    return this.ft.calculateSpectrum();
  }

  deriveCoherence(realData: Float64Array): number {
    const magnitude = this.forward(realData);
    const sum = magnitude.reduce((a, b) => a + (isFinite(b) ? b : 0), 0);
    return sum ? magnitude[0] / sum : 0;
  }

  realTransform(realData: Float64Array): Float64Array {
    // const complex = this.toComplexArray(realData);
    const out = this.fft.createComplexArray();
    this.fft.realTransform(out, realData);
    return this.toRealArray(out);
  }

  inverse(magnitude: Float64Array): Float64Array {
    const complex = this.fft.createComplexArray();
    for (let i = 0; i < magnitude.length; i++) {
      complex[2 * i] = magnitude[i];
      complex[2 * i + 1] = 0;
    }

    const out = new Float64Array(this.size);
    this.fft.inverseTransform(out, complex);
    return Float64Array.from(out);
  }

/* 
 */
toComplexArray(realData: Float64Array): Float64Array {
    const complex = this.fft.createComplexArray();
    for (let i = 0; i < realData.length; i++) {
      complex[2 * i] = realData[i]; // real part
      complex[2 * i + 1] = 0;       // imaginary part
    }
    return complex;
}

  toRealArray(complexData: Float64Array): Float64Array {
    const real = new Float64Array(this.size);
    for (let i = 0; i < this.size; i++) {
      real[i] = complexData[2 * i]; // discard imaginary
    }
    return real;
  }

  magnitude(complexData: any): Float64Array {
    const magnitude = new Float64Array(this.size / 2);
    for (let i = 0; i < magnitude.length; i++) {
      const re = complexData[2 * i];
      const im = complexData[2 * i + 1];
      magnitude[i] = Math.sqrt(re ** 2 + im ** 2);
    }
    return magnitude;
  }

public tickFFT(t: number): { magnitudes: Float64Array, mag: number } | number {
  // Fill buffer with new sample
  this._buffer[this._index] = Math.sin(this.freq * t);
  this._index = (this._index + 1) % this._buffer.length;
  this._tick++;

  // Run FFT when buffer is full
  if (this._tick % this._hop === 0 && this._index === 0) {  
    applyHann(this._buffer);
    const fftProcessor = new FFTProcessor(this._buffer);
    const spectrum = fftProcessor.forward(this._buffer);
    const re1 = spectrum[2]; // bin 1 real
    const im1 = spectrum[3]; // bin 1 imag
    const magnitudes = new Float64Array(spectrum.length >>> 1);
      for (let i = 0; i < magnitudes.length; i++) {
        const re_i = spectrum[i << 1];
        const im_i = spectrum[(i << 1) + 1];
        magnitudes[i] = Math.sqrt(re_i * re_i + im_i * im_i);
      }
    const mag = Math.sqrt(re1 * re1 + im1 * im1);
    if (!isFinite(mag)) {
      console.warn('FFT anomaly at tick', this._tick);
      console.table(this._buffer);
    }
    return {mag, magnitudes};
  }

  return 0; // or null, or skip until buffer is full
}

}