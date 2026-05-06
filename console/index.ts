import {ComplexArray} from '../src';
type ComplexSample = { real: number; imag: number };

function drawToCanvas(element_id: string, data: ArrayLike<ComplexSample>) {
  const element = document.getElementById(element_id)!;
  const width = element.clientWidth;
  const height = element.clientHeight;
  const n = data.length;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  element.appendChild(canvas);

  const context = canvas.getContext('2d')!;
  context.strokeStyle = 'blue';
  context.beginPath();
  Array.from(data).forEach((c_value, i) => {
    context.lineTo((i * width) / n, (height / 2) * (1.5 - c_value.real));
  });
  context.stroke();
}

window.onload = function() {
  const complexData = new ComplexArray(128).map((value, i, n) => {
    value.real = i > n / 3 && i < (2 * n) / 3 ? 1 : 0;
  });

  drawToCanvas("original", data);

  data.FFT();
  drawToCanvas("fft", data);
  data.map((freq, i, n) => {
    if (i > n / 5 && i < (4 * n) / 5) {
      freq.real = 0;
      freq.imag = 0;
    }
  });
  drawToCanvas("fft_filtered", data);
  drawToCanvas("original_filtered", data.InvFFT());

  drawToCanvas(
    "all_in_one",
    data.frequencyMap(
      (freq: { real: number; imag: number }, i: number, n: number) => {
        if (i > n / 5 && i < (4 * n) / 5) {
          freq.real = 0;
          freq.imag = 0;
        }
      },
    ),
  );
}
