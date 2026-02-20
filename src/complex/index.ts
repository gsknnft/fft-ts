export type Phasors = Array<[number, number]>;

export class Complex {
  constructor(public real: number, public imag: number) {}
  get magnitude(): number { return Math.sqrt(this.real ** 2 + this.imag ** 2); }
  get phase(): number { return Math.atan2(this.imag, this.real); }
}

export class ComplexArray {
  real: Float64Array;
  imag: Float64Array;
  length: number;

  constructor(lengthOrArray: number | { real: number[]; imag: number[] }) {
    if (typeof lengthOrArray === "number") {
      this.length = lengthOrArray;
      this.real = new Float64Array(this.length);
      this.imag = new Float64Array(this.length);
    } else {
      this.length = lengthOrArray.real.length;
      this.real = new Float64Array(lengthOrArray.real);
      this.imag = new Float64Array(lengthOrArray.imag);
    }
  }

  FFT(inverse = false): ComplexArray {
    return fft(this, inverse);
  }
}

// Utility ops
export function add(a: Complex, b: Complex): Complex {
  return new Complex(a.real + b.real, a.imag + b.imag);
}
export function subtract(a: Complex, b: Complex): Complex {
  return new Complex(a.real - b.real, a.imag - b.imag);
}
export function multiply(a: Complex, b: Complex): Complex {
  return new Complex(a.real * b.real - a.imag * b.imag, a.real * b.imag + a.imag * b.real);
}
export function magnitude(c: Complex): number {
  return Math.sqrt(c.real ** 2 + c.imag ** 2);
}

// FFT core
const PI = Math.PI;
const SQRT1_2 = Math.SQRT1_2;

export function fft(input: ComplexArray, inverse = false): ComplexArray {
  const n = input.length;
  return (n & (n - 1)) ? FFT_Recursive(input, inverse) : FFT_Iterative(input, inverse);
}

function FFT_Recursive(input: ComplexArray, inverse: boolean): ComplexArray {
  const n = input.length;
  if (n === 1) return input;

  const output = new ComplexArray(n);
  const p = LowestOddFactor(n);
  const m = n / p;
  const recursive_result = new ComplexArray(m);

  for (let j = 0; j < p; j++) {
    for (let i = 0; i < m; i++) {
      recursive_result.real[i] = input.real[i * p + j];
      recursive_result.imag[i] = input.imag[i * p + j];
    }
    const sub = m > 1 ? FFT_Recursive(recursive_result, inverse) : recursive_result;

    const del_f_r = Math.cos((2 * PI * j) / n);
    const del_f_i = (inverse ? -1 : 1) * Math.sin((2 * PI * j) / n);
    let f_r = 1, f_i = 0;

    for (let i = 0; i < n; i++) {
      const _real = sub.real[i % m];
      const _imag = sub.imag[i % m];
      output.real[i] += f_r * _real - f_i * _imag;
      output.imag[i] += f_r * _imag + f_i * _real;

      const temp_f_r = f_r * del_f_r - f_i * del_f_i;
      f_i = f_r * del_f_i + f_i * del_f_r;
      f_r = temp_f_r;
    }
  }
  return output;
}

function FFT_Iterative(input: ComplexArray, inverse: boolean): ComplexArray {
  const n = input.length;
  const output = BitReverseComplexArray(input);
  const [output_r, output_i] = [output.real, output.imag];

  let width = 1;
  while (width < n) {
    const del_f_r = Math.cos(PI / width);
    const del_f_i = (inverse ? -1 : 1) * Math.sin(PI / width);
    for (let i = 0; i < n / (2 * width); ++i) {
      let f_r = 1, f_i = 0;
      for (let j = 0; j < width; j++) {
        const l_index = 2 * i * width + j;
        const r_index = l_index + width;

        const left_r = output_r[l_index];
        const left_i = output_i[l_index];
        const right_r = f_r * output_r[r_index] - f_i * output_i[r_index];
        const right_i = f_i * output_r[r_index] + f_r * output_i[r_index];

        output_r[l_index] = SQRT1_2 * (left_r + right_r);
        output_i[l_index] = SQRT1_2 * (left_i + right_i);
        output_r[r_index] = SQRT1_2 * (left_r - right_r);
        output_i[r_index] = SQRT1_2 * (left_i - right_i);

        const temp_f_r = f_r * del_f_r - f_i * del_f_i;
        f_i = f_r * del_f_i + f_i * del_f_r;
        f_r = temp_f_r;
      }
    }
    width <<= 1;
  }
  return output;
}

function BitReverseIndex(index: number, n: number): number {
  let bitreversed_index = 0;
  while (n > 1) {
    bitreversed_index <<= 1;
    bitreversed_index += index & 1;
    index >>= 1;
    n >>= 1;
  }
  return bitreversed_index;
}

function BitReverseComplexArray(array: ComplexArray): ComplexArray {
  const n = array.length;
  const flips = new Set<number>();
  for (let i = 0; i < n; i++) {
    const r_i = BitReverseIndex(i, n);
    if (flips.has(i)) continue;
    [array.real[i], array.real[r_i]] = [array.real[r_i], array.real[i]];
    [array.imag[i], array.imag[r_i]] = [array.imag[r_i], array.imag[i]];
    flips.add(r_i);
    flips.add(i);
  }
  return array;
}

function LowestOddFactor(n: number): number {
  const sqrt_n = Math.sqrt(n);
  let factor = 3;
  while (factor <= sqrt_n) {
    if (n % factor === 0) return factor;
    factor += 2;
  }
  return n;
}