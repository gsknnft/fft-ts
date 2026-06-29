import FFT from "../fft-base/fft";
import { FourierTransform } from "../radix2";

function applyHann(buffer: Float64Array): void {
  const n = buffer.length;
  for (let i = 0; i < n; i++) {
    buffer[i] *= 0.5 * (1 - Math.cos((2 * Math.PI * i) / (n - 1)));
  }
}

function resolveSize(input: number | ArrayLike<number>): number {
  return typeof input === "number" ? input : input.length;
}

function assertPowerOfTwoSize(size: number): void {
  if (!Number.isInteger(size)) throw new Error("FFT size must be an integer");
  if (size < 2) throw new Error("FFT needs at least 2 samples");
  if ((size & (size - 1)) !== 0) throw new Error("FFT size must be a power of two");
}

export class FFTProcessor {
  public freq = 0;
  public fft: FFT;
  public ft: FourierTransform;
  public size: number;
  private _hop = 4;
  private _tick = 0;
  private _buffer = new Float64Array(8);
  private _index = 0;

  constructor(size: number | ArrayLike<number>) {
    const n = resolveSize(size);
    assertPowerOfTwoSize(n);
    this.size = n;
    this.fft = new FFT(this.size);
    this.ft = new FourierTransform(this.size, 1);
  }

  forward(realData: ArrayLike<number>): Float64Array {
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

  forwardWithPhase(realData: ArrayLike<number>): {
    magnitude: Float64Array;
    real: Float64Array;
    imag: Float64Array;
  } {
    const out = this.fft.createComplexArray();
    const input = this.toComplexArray(realData);
    this.fft.transform(out, input);

    const n = this.size / 2;
    const magnitude = new Float64Array(n);
    const real = new Float64Array(n);
    const imag = new Float64Array(n);

    for (let i = 0; i < n; i++) {
      const re = out[2 * i];
      const im = out[2 * i + 1];
      magnitude[i] = Math.sqrt(re ** 2 + im ** 2);
      real[i] = re;
      imag[i] = im;
    }

    return { magnitude, real, imag };
  }

  radix2(realData: ArrayLike<number>): Float64Array {
    this.ft.real.set(Float64Array.from(Array.from(realData)));
    this.ft.transform();
    return this.ft.calculateSpectrum();
  }

  deriveCoherence(realData: ArrayLike<number>): number {
    const magnitude = this.forward(realData);
    const sum = magnitude.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
    return sum ? magnitude[0] / sum : 0;
  }

  realTransform(realData: ArrayLike<number>): Float64Array {
    const out = this.fft.createComplexArray();
    this.fft.realTransform(out, Float64Array.from(Array.from(realData)));
    return this.toRealArray(out);
  }

  inverse(magnitude: ArrayLike<number>): Float64Array {
    const complex = this.fft.createComplexArray();
    const limit = Math.min(magnitude.length, this.size / 2);
    for (let i = 0; i < limit; i++) {
      complex[2 * i] = magnitude[i];
      complex[2 * i + 1] = 0;
    }

    const out = new Float64Array(this.size);
    this.fft.inverseTransform(out, complex);
    return Float64Array.from(out);
  }

  toComplexArray(realData: ArrayLike<number>): Float64Array {
    const complex = this.fft.createComplexArray();
    const limit = Math.min(realData.length, this.size);
    for (let i = 0; i < limit; i++) {
      complex[2 * i] = realData[i];
      complex[2 * i + 1] = 0;
    }
    return complex;
  }

  toRealArray(complexData: ArrayLike<number>): Float64Array {
    const real = new Float64Array(this.size);
    for (let i = 0; i < this.size; i++) {
      real[i] = complexData[2 * i];
    }
    return real;
  }

  magnitude(complexData: ArrayLike<number>): Float64Array {
    const magnitude = new Float64Array(this.size / 2);
    for (let i = 0; i < magnitude.length; i++) {
      const re = complexData[2 * i];
      const im = complexData[2 * i + 1];
      magnitude[i] = Math.sqrt(re ** 2 + im ** 2);
    }
    return magnitude;
  }

  tickFFT(t: number): { magnitudes: Float64Array; mag: number } | number {
    this._buffer[this._index] = Math.sin(this.freq * t);
    this._index = (this._index + 1) % this._buffer.length;
    this._tick++;

    if (this._tick % this._hop === 0 && this._index === 0) {
      const windowed = Float64Array.from(this._buffer);
      applyHann(windowed);
      const magnitudes = new FFTProcessor(windowed).forward(windowed);
      return { mag: magnitudes[1] ?? 0, magnitudes };
    }

    return 0;
  }
}
