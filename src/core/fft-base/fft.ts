import { isPowerOfTwo, nextPowerOfTwo } from "./ffutil";

export default class FFT {
  public size: number;
  public vector: Float64Array;
  public table: Float64Array;        // twiddles: [cos, -sin, cos, -sin, ...]
  private _csize: number;            // complex stride (2 * size)
  private _width: number;
  private _bitrev: Int32Array;
  private _out: Float64Array | null = null;
  private _data: ArrayLike<number> | null = null;
  private _inv: number = 0;
  public data: Float64Array;         // interleaved complex working buffer
  public freq: number = 0;

  /**
   * @param size Transform length. Must be a power of two greater than 1.
   *             For arbitrary-length real input, use the high-level `fft()`
   *             helper or `padToPowerOfTwo` first.
   */
  constructor(size: number) {
    this.size = size | 0;
    if (this.size <= 1 || (this.size & (this.size - 1)) !== 0) {
      throw new Error("FFT size must be a power of two and bigger than 1");
    }
    this._csize = this.size << 1;

    // Twiddle factor table: [cos, -sin, cos, -sin, ...]
    this.table = new Float64Array(this.size * 2);
    for (let i = 0; i < this.table.length; i += 2) {
      const angle = (Math.PI * i) / this.size;
      this.table[i] = Math.cos(angle);
      this.table[i + 1] = -Math.sin(angle);
    }

    // Radix-2/4 width
    let power = 0;
    for (let t = 1; this.size > t; t <<= 1) power++;
    this._width = power % 2 === 0 ? power - 1 : power;

    // Bit-reversal permutation (base-4 packing)
    this._bitrev = new Int32Array(1 << this._width);
    for (let j = 0; j < this._bitrev.length; j++) {
      let r = 0;
      for (let shift = 0; shift < this._width; shift += 2) {
        const revShift = this._width - shift - 2;
        r |= ((j >>> shift) & 3) << revShift;
      }
      this._bitrev[j] = r;
    }

    // Back-compat working buffers
    this.data = new Float64Array(this._csize);
    this.vector = this.data;
  }

  setInverse(inv: boolean) {
    this._inv = inv ? 1 : 0;
  }

  /**
   * Extract real parts from complex array
   */
  fromComplexArray(complex: Float64Array, storage?: Float64Array): Float64Array {
    const res = storage || new Float64Array(complex.length >>> 1);
    for (let i = 0; i < complex.length; i += 2) {
      res[i >>> 1] = complex[i];
    }
    return res;
  }

  /**
   * Create a complex array (interleaved real and imaginary parts)
   */
  createComplexArray(): Float64Array {
    return new Float64Array(this._csize);
  }

  /**
   * Convert real array to complex array
   */
  toComplexArray(input: ArrayLike<number>, storage?: Float64Array): Float64Array {
    const res = storage || this.createComplexArray();
    for (let i = 0; i < res.length; i += 2) {
      res[i] = input[i >>> 1] ?? 0;
      res[i + 1] = 0;
    }
    return res;
  }


  public completeSpectrum(spectrum: Float64Array): Float64Array {
    const size = this._csize;
    const half = size >>> 1;
    for (let i = 2; i < half; i += 2) {
      spectrum[size - i] = spectrum[i];
      spectrum[size - i + 1] = -spectrum[i + 1];
    }
    return spectrum
  }


  /**
   * Forward FFT (complex to complex)
   */
  transform(out: Float64Array, data: Float64Array): void {
    if (out === data) {
      throw new Error('Input and output buffers must be different');
    }

    this._out = out;
    this._data = data;
    this._inv = 0;
    this._transform4();
    this._out = null;
    this._data = null;

    const scale = 1 / Math.sqrt(this.size);
    for (let i = 0; i < out.length; i++) out[i] *= scale;
  }



  /**
   * Real-valued FFT (optimized for real input)
   */
  realTransform(out: Float64Array, data: ArrayLike<number>): void {
    if (out === data as any) {
      throw new Error('Input and output buffers must be different');
    }

    this._out = out;
    this._data = data instanceof Float64Array ? data : Float64Array.from(data);
    this._inv = 0;
    this._realTransform4();
    this._out = null;
    this._data = null;

    const scale = 1 / Math.sqrt(this.size);
    for (let i = 0; i < out.length; i++) out[i] *= scale;
  }


  /**
   * Inverse FFT
   */
    inverseTransform(out: Float64Array, data: Float64Array): void {
      if (out === (data as any)) throw new Error('Input and output buffers must be different');

      this._out = out;
      this._data = data;
      this._inv = 1;
      this._transform4();

      const scale = 1 / Math.sqrt(this.size); // symmetric normalization
      for (let i = 0; i < out.length; i++) out[i] = this._out[i] * scale;

      this._out = null;
      this._data = null;
    }


  // radix-4 implementation
  //
  private _transform4() {
    const out = this._out;
    if (!out) {
      throw new Error("'out' buffer is null");
    }
    const size = this._csize;

    // Initial step (permute and transform)
    const width = this._width;
    let step = 1 << width;
    let len = (size / step) << 1;

    let outOff: number;
    let t: number;
    const bitrev = this._bitrev;
    if (len === 4) {
      for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
        const off = bitrev[t];
        this._singleTransform2(outOff, off, step);
      }
    } else {
      // len === 8
      for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
        const off = bitrev[t];
        this._singleTransform4(outOff, off, step);
      }
    }

    // Loop through steps in decreasing order
    const inv = this._inv ? -1 : 1;
    let table = this.table;
    for (step >>= 2; step >= 2; step >>= 2) {
      len = (size / step) << 1;
      const quarterLen = len >>> 2;

      // Loop through offsets in the data
      for (outOff = 0; outOff < size; outOff += len) {
        // Full case
        const limit = outOff + quarterLen;
        for (let i = outOff, k = 0; i < limit; i += 2, k += step) {
          const A = i;
          const B = A + quarterLen;
          const C = B + quarterLen;
          const D = C + quarterLen;

          // Original values
          const Ar = out[A];
          const Ai = out[A + 1];
          const Br = out[B];
          const Bi = out[B + 1];
          const Cr = out[C];
          const Ci = out[C + 1];
          const Dr = out[D];
          const Di = out[D + 1];

          // Middle values
          const MAr = Ar;
          const MAi = Ai;

          const tableBr = table[k];
          const tableBi = inv * table[k + 1];
          const MBr = Br * tableBr - Bi * tableBi;
          const MBi = Br * tableBi + Bi * tableBr;

          const tableCr = table[2 * k];
          const tableCi = inv * table[2 * k + 1];
          const MCr = Cr * tableCr - Ci * tableCi;
          const MCi = Cr * tableCi + Ci * tableCr;

          const tableDr = table[3 * k];
          const tableDi = inv * table[3 * k + 1];
          const MDr = Dr * tableDr - Di * tableDi;
          const MDi = Dr * tableDi + Di * tableDr;

          // Pre-Final values
          const T0r = MAr + MCr;
          const T0i = MAi + MCi;
          const T1r = MAr - MCr;
          const T1i = MAi - MCi;
          const T2r = MBr + MDr;
          const T2i = MBi + MDi;
          const T3r = inv * (MBr - MDr);
          const T3i = inv * (MBi - MDi);

          // Final values
          const FAr = T0r + T2r;
          const FAi = T0i + T2i;

          const FCr = T0r - T2r;
          const FCi = T0i - T2i;

          const FBr = T1r + T3i;
          const FBi = T1i - T3r;

          const FDr = T1r - T3i;
          const FDi = T1i + T3r;

          out[A] = FAr;
          out[A + 1] = FAi;
          out[B] = FBr;
          out[B + 1] = FBi;
          out[C] = FCr;
          out[C + 1] = FCi;
          out[D] = FDr;
          out[D + 1] = FDi;
        }
      }
    }
  }
  // radix-2 implementation
  //
  // NOTE: Only called for len=4
  private _singleTransform2(outOff: number, off: number,
    step: number) {
    const out = this._out;
    const data = this._data;
    if (!data || !out) {
      throw new Error("'data' buffer is null");
    }
    const evenR = data[off];
    const evenI = data[off + 1];
    const oddR = data[off + step];
    const oddI = data[off + step + 1];

    const leftR = evenR + oddR;
    const leftI = evenI + oddI;
    const rightR = evenR - oddR;
    const rightI = evenI - oddI;

    out[outOff] = leftR;
    out[outOff + 1] = leftI;
    out[outOff + 2] = rightR;
    out[outOff + 3] = rightI;
  }
  // radix-4
  //
  // NOTE: Only called for len=8
  private _singleTransform4(outOff: number, off: number,
    step: number) {
    const out = this._out;
    const data = this._data;
    if (!data || !out) {
      throw new Error("'data' buffer is null");
    }
    const inv = this._inv ? -1 : 1;
    const step2 = step * 2;
    const step3 = step * 3;

    // Original values
    const Ar = data[off];
    const Ai = data[off + 1];
    const Br = data[off + step];
    const Bi = data[off + step + 1];
    const Cr = data[off + step2];
    const Ci = data[off + step2 + 1];
    const Dr = data[off + step3];
    const Di = data[off + step3 + 1];

    // Pre-Final values
    const T0r = Ar + Cr;
    const T0i = Ai + Ci;
    const T1r = Ar - Cr;
    const T1i = Ai - Ci;
    const T2r = Br + Dr;
    const T2i = Bi + Di;
    const T3r = inv * (Br - Dr);
    const T3i = inv * (Bi - Di);

    // Final values
    const FAr = T0r + T2r;
    const FAi = T0i + T2i;

    const FBr = T1r + T3i;
    const FBi = T1i - T3r;

    const FCr = T0r - T2r;
    const FCi = T0i - T2i;

    const FDr = T1r - T3i;
    const FDi = T1i + T3r;

    out[outOff] = FAr;
    out[outOff + 1] = FAi;
    out[outOff + 2] = FBr;
    out[outOff + 3] = FBi;
    out[outOff + 4] = FCr;
    out[outOff + 5] = FCi;
    out[outOff + 6] = FDr;
    out[outOff + 7] = FDi;
  }
  // Real input radix-4 implementation
  private _realTransform4() {
    const out = this._out;
    if (!out) {
      throw new Error("'data' buffer is null");
    }
    const size = this._csize;

    // Initial step (permute and transform)
    const width = this._width;
    let step = 1 << width;
    let len = (size / step) << 1;

    let outOff: number;
    let t: number;
    const bitrev = this._bitrev;
    if (len === 4) {
      for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
        const off = bitrev[t];
        this._singleRealTransform2(outOff, off >>> 1, step >>> 1);
      }
    } else {
      // len === 8
      for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
        const off = bitrev[t];
        this._singleRealTransform4(outOff, off >>> 1, step >>> 1);
      }
    }

    // Loop through steps in decreasing order
    const inv = this._inv ? -1 : 1;
    const table = this.table;
    for (step >>= 2; step >= 2; step >>= 2) {
      len = (size / step) << 1;
      const halfLen = len >>> 1;
      const quarterLen = halfLen >>> 1;
      const hquarterLen = quarterLen >>> 1;

      // Loop through offsets in the data
      for (outOff = 0; outOff < size; outOff += len) {
        for (let i = 0, k = 0; i <= hquarterLen; i += 2, k += step) {
          const A = outOff + i;
          const B = A + quarterLen;
          const C = B + quarterLen;
          const D = C + quarterLen;

          // Original values
          const Ar = out[A];
          const Ai = out[A + 1];
          const Br = out[B];
          const Bi = out[B + 1];
          const Cr = out[C];
          const Ci = out[C + 1];
          const Dr = out[D];
          const Di = out[D + 1];

          // Middle values
          const MAr = Ar;
          const MAi = Ai;

          const tableBr = table[k];
          const tableBi = inv * table[k + 1];
          const MBr = Br * tableBr - Bi * tableBi;
          const MBi = Br * tableBi + Bi * tableBr;

          const tableCr = table[2 * k];
          const tableCi = inv * table[2 * k + 1];
          const MCr = Cr * tableCr - Ci * tableCi;
          const MCi = Cr * tableCi + Ci * tableCr;

          const tableDr = table[3 * k];
          const tableDi = inv * table[3 * k + 1];
          const MDr = Dr * tableDr - Di * tableDi;
          const MDi = Dr * tableDi + Di * tableDr;

          // Pre-Final values
          const T0r = MAr + MCr;
          const T0i = MAi + MCi;
          const T1r = MAr - MCr;
          const T1i = MAi - MCi;
          const T2r = MBr + MDr;
          const T2i = MBi + MDi;
          const T3r = inv * (MBr - MDr);
          const T3i = inv * (MBi - MDi);

          // Final values
          const FAr = T0r + T2r;
          const FAi = T0i + T2i;

          const FBr = T1r + T3i;
          const FBi = T1i - T3r;

          out[A] = FAr;
          out[A + 1] = FAi;
          out[B] = FBr;
          out[B + 1] = FBi;

          // Output final middle point
          if (i === 0) {
            const FCr = T0r - T2r;
            const FCi = T0i - T2i;
            out[C] = FCr;
            out[C + 1] = FCi;
            continue;
          }

          // Do not overwrite ourselves
          if (i === hquarterLen)
            continue;

          // In the flipped case:
          // MAi = -MAi
          // MBr=-MBi, MBi=-MBr
          // MCr=-MCr
          // MDr=MDi, MDi=MDr
          const ST0r = T1r;
          const ST0i = -T1i;
          const ST1r = T0r;
          const ST1i = -T0i;
          const ST2r = -inv * T3i;
          const ST2i = -inv * T3r;
          const ST3r = -inv * T2i;
          const ST3i = -inv * T2r;

          const SFAr = ST0r + ST2r;
          const SFAi = ST0i + ST2i;

          const SFBr = ST1r + ST3i;
          const SFBi = ST1i - ST3r;

          const SA = outOff + quarterLen - i;
          const SB = outOff + halfLen - i;

          out[SA] = SFAr;
          out[SA + 1] = SFAi;
          out[SB] = SFBr;
          out[SB + 1] = SFBi;
        }
      }
    }
  }
  // radix-2 implementation
  //
  // NOTE: Only called for len=4
  private _singleRealTransform2(outOff: number,
    off: number,
    step: number) {
    const out = this._out;
    const data = this._data;

    if (!data || !out) {
      throw new Error("'data' buffer is null");
    }

    const evenR = data[off];
    const oddR = data[off + step];

    const leftR = evenR + oddR;
    const rightR = evenR - oddR;

    out[outOff] = leftR;
    out[outOff + 1] = 0;
    out[outOff + 2] = rightR;
    out[outOff + 3] = 0;
  }
  // radix-4
  //
  // NOTE: Only called for len=8
  private _singleRealTransform4(outOff: number,
    off: number,
    step: number) {
    const out = this._out;
    const data = this._data;
    if (!data || !out) {
      throw new Error("'data' buffer is null");
    }
    const inv = this._inv ? -1 : 1;
    const step2 = step * 2;
    const step3 = step * 3;

    // Original values
    const Ar = data[off];
    const Br = data[off + step];
    const Cr = data[off + step2];
    const Dr = data[off + step3];

    // Pre-Final values
    const T0r = Ar + Cr;
    const T1r = Ar - Cr;
    const T2r = Br + Dr;
    const T3r = inv * (Br - Dr);

    // Final values
    const FAr = T0r + T2r;

    const FBr = T1r;
    const FBi = -T3r;

    const FCr = T0r - T2r;

    const FDr = T1r;
    const FDi = T3r;

    out[outOff] = FAr;
    out[outOff + 1] = 0;
    out[outOff + 2] = FBr;
    out[outOff + 3] = FBi;
    out[outOff + 4] = FCr;
    out[outOff + 5] = 0;
    out[outOff + 6] = FDr;
    out[outOff + 7] = FDi;
  }


}

// ── High-level helpers ─────────────────────────────────────────────────────────

/** Zero-pad a real signal to a fixed power-of-two length. */
function padReal(input: ArrayLike<number>, size: number): Float64Array {
  const padded = new Float64Array(size);
  const n = Math.min(input.length, size);
  for (let i = 0; i < n; i++) padded[i] = input[i] ?? 0;
  return padded;
}

/**
 * Forward FFT for real-valued input of arbitrary length.
 *
 * Pads to the next power of two and returns the full interleaved complex
 * spectrum `[re0, im0, re1, im1, ...]` of length `2 * paddedSize`.
 *
 * @example
 *   const spectrum = fft([0, 1, 0, -1]);   // Float64Array length 8
 */
export function fft(input: ArrayLike<number>): Float64Array {
  if (new.target) {
    throw new TypeError("fft() is a function helper; use new FFT(size) for the class API");
  }

  const inputLength = input.length;
  const size = isPowerOfTwo(inputLength) && inputLength > 1
    ? inputLength
    : nextPowerOfTwo(inputLength < 2 ? 2 : inputLength);
  const f = new FFT(size);
  const out = f.createComplexArray();
  const realInput = size === inputLength ? input : padReal(input, size);
  f.realTransform(out, realInput);
  f.completeSpectrum(out);
  return out;
}

/**
 * Magnitude spectrum of a real signal. Returns one magnitude per frequency bin
 * (length = paddedSize). Bin `k` maps to frequency `k * sampleRate / paddedSize`.
 *
 * @example
 *   const mags = fftMagnitude(signal); // peak bin reveals the dominant period
 */
export function fftMagnitude(input: ArrayLike<number>): Float64Array {
  const spectrum = fft(input);
  const bins = spectrum.length >>> 1;
  const mags = new Float64Array(bins);
  for (let k = 0; k < bins; k++) {
    mags[k] = Math.hypot(spectrum[2 * k], spectrum[2 * k + 1]);
  }
  return mags;
}
