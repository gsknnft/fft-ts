import { FFTProcessor } from "../core/fft-processor";
import { isPowerOfTwo, nextPowerOfTwo } from "../core/fft-base/ffutil";

type AmplitudeEvent = {
  amplitude: number;
};

export function padToPowerOfTwo(arr: number[]): number[] {
  const n = arr.length;
  const targetLength = nextPowerOfTwo(n < 2 ? 2 : n);
  if (n === targetLength && isPowerOfTwo(n)) return arr;
  return [...arr, ...Array(targetLength - n).fill(0)];
}

export async function fourriouoorFreq(eventLogs: AmplitudeEvent[]) {
  const amplitudes = Float64Array.from(
    padToPowerOfTwo(eventLogs.map((e) => e.amplitude))
  );
  const fftProcessor = new FFTProcessor(amplitudes);
  const spectrum = fftProcessor.forward(amplitudes);
  const invSpectrum = fftProcessor.inverse(spectrum);

  const frequencies = Array.from({ length: spectrum.length }, (_, i) => i);
  const result = frequencies.map((f, i) => ({ f, mag: spectrum[i] }));
  const invResult = frequencies.map((f, i) => ({ f, mag: invSpectrum[i] }));

  return { result, invResult, mag: spectrum };
}

export function fourriouoorAny(
  eventLogs: AmplitudeEvent[],
): { f: number; mag: number }[] {
  const amplitudes = Float64Array.from(
    padToPowerOfTwo(eventLogs.map((e) => e.amplitude))
  );
  const fftProcessor = new FFTProcessor(amplitudes);
  const mags = fftProcessor.forward(amplitudes);

  return Array.from(mags).map((mag, i) => ({ f: i, mag }));
}

export async function fourriouoorFreqInv(eventLogs: AmplitudeEvent[]) {
  const amplitudes = Float64Array.from(
    padToPowerOfTwo(eventLogs.map((e) => e.amplitude))
  );
  const fftProcessor = new FFTProcessor(amplitudes);
  const invSpectrum = fftProcessor.inverse(amplitudes);

  const frequencies = Array.from({ length: invSpectrum.length }, (_, i) => i);
  const result = frequencies.map((f, i) => ({ f, mag: invSpectrum[i] }));

  return { result, mag: invSpectrum };
}

export async function fourriouoorTick(eventLogs: AmplitudeEvent[]) {
  const amplitudes = Float64Array.from(
    padToPowerOfTwo(eventLogs.map((e) => e.amplitude))
  );

  const fftProcessor = new FFTProcessor(amplitudes);
  const invSpectrumArrRaw = Array.from(amplitudes, (_, i) =>
    fftProcessor.tickFFT(i)
  );
  const invSpectrumArr = Float64Array.from(
    invSpectrumArrRaw.map((val) =>
      typeof val === "number" ? val : val.mag
    )
  );
  const mag = fftProcessor.realTransform(invSpectrumArr);

  const frequencies = Array.from(
    { length: invSpectrumArr.length },
    (_, i) => i
  );
  const result = frequencies.map((f, i) => ({ f, mag: invSpectrumArr[i] }));

  return { result, mag };
}
