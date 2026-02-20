// // src/fft/src/core/fourriouoor.ts
// //@preserve
// import { FFTProcessor } from "../core/fft-processor"; // or wherever you put your FFTProcessor
// // import FFT from "../core/fft-base/fft";
// import { AnyEvent, SignalEvent } from "types";

// export function padToPowerOfTwo(arr: number[]): number[] {
//   const n = arr.length;
//   const targetLength = Math.pow(2, Math.ceil(Math.log2(n)));
//   if (n === targetLength) return arr;
//   return [...arr, ...Array(targetLength - n).fill(0)];
// }

// export async function fourriouoorFreq(eventLogs: SignalEvent[]) {
//   const amplitudes = Float64Array.from(
//     padToPowerOfTwo(eventLogs.map((e) => e.amplitude))
//   );
//   const fftProcessor = new FFTProcessor(amplitudes);
//   const spectrum = fftProcessor.forward(amplitudes);
//   const mag = fftProcessor.magnitude(spectrum);
//   const invSpectrum = fftProcessor.inverse(spectrum);

//   // Example: frequencies are index-based because fft.js doesn't do freq labels
//   // then lets equate indexes to specific metrics
//   const frequencies = Array.from({ length: spectrum.length }, (_, i) => i);

//   const result = frequencies.map((f, i) => ({ f, mag: spectrum[i] }));
//   const invResult = frequencies.map((f, i) => ({ f, mag: invSpectrum[i] }));
//   console.table(result);
//   return { result, invResult, mag };
// }

// export function fourriouoorAny(eventLogs: any[]): { f: number; mag: number }[] {
//   const amplitudes = Float64Array.from(
//     padToPowerOfTwo(eventLogs.map((e) => e.amplitude))
//   );
//   const fftProcessor = new FFTProcessor(amplitudes);
//   const mags = fftProcessor.forward(amplitudes); // Float64Array

//   // TypeScript infers number[] from Float64Array, so this is fine
//   return Array.from(mags).map((mag, i) => ({ f: i, mag }));
// }

// export async function fourriouoorFreqInv(eventLogs: AnyEvent[] | any[]) {
//   const amplitudes = Float64Array.from(
//     padToPowerOfTwo(eventLogs.map((e) => e.amplitude))
//   );
//   const fftProcessor = new FFTProcessor(amplitudes);
//   const invSpectrum = fftProcessor.inverse(amplitudes);
//   const mag = fftProcessor.magnitude(invSpectrum);

//   // Example: frequencies are index-based because fft.js doesn't do freq labels
//   // then lets equate indexes to specific metrics
//   const frequencies = Array.from({ length: invSpectrum.length }, (_, i) => i);

//   const result = frequencies.map((f, i) => ({ f, mag: invSpectrum[i] }));

//   console.table(result);
//   return { result, mag };
// }

// export async function fourriouoorTick(eventLogs: SignalEvent[] | any[]) {
//   const amplitudes = Float64Array.from(
//     padToPowerOfTwo(eventLogs.map((e) => e.amplitude))
//   );

//   const fftProcessor = new FFTProcessor(amplitudes);
//   // Example: call tickFFT for each amplitude index
//   const invSpectrumArrRaw = Array.from(amplitudes, (_, i) =>
//     fftProcessor.tickFFT(i)
//   );
//   // Ensure invSpectrumArr is a Float64Array of numbers
//   const invSpectrumArr = Float64Array.from(
//     invSpectrumArrRaw.map(val =>
//       typeof val === "number" ? val : val.mag
//     )
//   );
//   const mag = fftProcessor.realTransform(
//     invSpectrumArr,
//     // Array.from(amplitudes)
//   );

//   // then lets equate indexes to specific metrics
//   const frequencies = Array.from(
//     { length: invSpectrumArr.length },
//     (_, i) => i
//   );

//   const result = frequencies.map((f, i) => ({ f, mag: invSpectrumArr[i] }));

//   console.table(result);
//   return { result, mag };
// }
