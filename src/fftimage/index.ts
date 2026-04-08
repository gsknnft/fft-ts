import { ComplexArray } from "../utils/utils";

export function FFTImageDataRGBA(
  data: Uint8ClampedArray,
  nx: number,
  ny: number
): ComplexArray {
  const rgb: Array<Uint8ClampedArray> = splitRGB(data);

  return mergeRGB(
    FFT2D(new ComplexArray(rgb[0], Float32Array), nx, ny),
    FFT2D(new ComplexArray(rgb[1], Float32Array), nx, ny),
    FFT2D(new ComplexArray(rgb[2], Float32Array), nx, ny)
  );
}

function splitRGB(data: Uint8ClampedArray): Array<Uint8ClampedArray> {
  const n: number = data.length / 4;
  const r = new Uint8ClampedArray(n);
  const g = new Uint8ClampedArray(n);
  const b = new Uint8ClampedArray(n);

  for (let i = 0; i < n; i++) {
    r[i] = data[4 * i];
    g[i] = data[4 * i + 1];
    b[i] = data[4 * i + 2];
  }

  return [r, g, b];
}

function mergeRGB(
  r: ComplexArray,
  g: ComplexArray,
  b: ComplexArray
): ComplexArray {
  const n = r.length;
  const output = new ComplexArray(n * 4, Float32Array);
  const outputReal = output.real as Float32Array;
  const outputImag = output.imag as Float32Array;
  const rReal = r.real as Float32Array | Float64Array | Uint8ClampedArray | number[];
  const rImag = r.imag as Float32Array | Float64Array | Uint8ClampedArray | number[];
  const gReal = g.real as Float32Array | Float64Array | Uint8ClampedArray | number[];
  const gImag = g.imag as Float32Array | Float64Array | Uint8ClampedArray | number[];
  const bReal = b.real as Float32Array | Float64Array | Uint8ClampedArray | number[];
  const bImag = b.imag as Float32Array | Float64Array | Uint8ClampedArray | number[];

  for (let i = 0; i < n; i++) {
    outputReal[4 * i] = Number(rReal[i] ?? 0);
    outputImag[4 * i] = Number(rImag[i] ?? 0);
    outputReal[4 * i + 1] = Number(gReal[i] ?? 0);
    outputImag[4 * i + 1] = Number(gImag[i] ?? 0);
    outputReal[4 * i + 2] = Number(bReal[i] ?? 0);
    outputImag[4 * i + 2] = Number(bImag[i] ?? 0);
    outputReal[4 * i + 3] = 0;
    outputImag[4 * i + 3] = 0;
  }

  return output;
}

function FFT2D(
  input: ComplexArray,
  nx: number,
  ny: number,
  inverse: boolean = false
): ComplexArray {
  const transform = inverse ? "InvFFT" : "FFT";
  const output = new ComplexArray(input.length, input.ArrayType);
  const row = new ComplexArray(nx, input.ArrayType);
  const col = new ComplexArray(ny, input.ArrayType);
  const inputReal = input.real as Float32Array | Float64Array | Uint8ClampedArray | number[];
  const inputImag = input.imag as Float32Array | Float64Array | Uint8ClampedArray | number[];
  const outputReal = output.real as Float32Array | Float64Array | Uint8ClampedArray | number[];
  const outputImag = output.imag as Float32Array | Float64Array | Uint8ClampedArray | number[];

  for (let j = 0; j < ny; j++) {
    row.map((v, i) => {
      v.real = Number(inputReal[i + j * nx] ?? 0);
      v.imag = Number(inputImag[i + j * nx] ?? 0);
    });
    row[transform]().forEach((v, i) => {
      outputReal[i + j * nx] = v.real;
      outputImag[i + j * nx] = v.imag;
    });
  }

  for (let i = 0; i < nx; i++) {
    col.map((v, j) => {
      v.real = Number(outputReal[i + j * nx] ?? 0);
      v.imag = Number(outputImag[i + j * nx] ?? 0);
    });
    col[transform]().forEach((v, j) => {
      outputReal[i + j * nx] = v.real;
      outputImag[i + j * nx] = v.imag;
    });
  }

  return output;
}
