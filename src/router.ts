import { EigenvalueDecomposition } from "ml-matrix";
import wt from "discrete-wavelets";
import { FFTProcessor } from "./core/fft-processor";
import { isPowerOfTwo, nextPowerOfTwo } from "./core/fft-base/ffutil";

export type RouteSignal = {
  id: unknown;
  data: ArrayLike<number>;
  phase: number;
};

export type RouteResult = {
  id: unknown;
  wave: number[][];
  energy: number;
  coherence: number;
};

export function getFieldMatrix(signals: { phase: number }[]): number[][] {
  return signals.map((s1) =>
    signals.map((s2) => Math.cos(s1.phase - s2.phase))
  );
}

function toPowerOfTwoSamples(input: ArrayLike<number>): Float64Array {
  const size = input.length > 1 && isPowerOfTwo(input.length)
    ? input.length
    : nextPowerOfTwo(input.length < 2 ? 2 : input.length);
  const samples = new Float64Array(size);
  for (let i = 0; i < input.length && i < size; i++) samples[i] = input[i];
  return samples;
}

export function scanWaveletRouting(agentSignals: RouteSignal[]): {
  results: RouteResult[];
  eigen: EigenvalueDecomposition;
} {
  const results: RouteResult[] = [];

  for (const sig of agentSignals) {
    const data = toPowerOfTwoSamples(sig.data);
    const fft = new FFTProcessor(data);
    const wave = wt.wavedec(Array.from(data), "db2", "symmetric", 3);
    const energy = wt.energy(wave);
    const coherence = fft.deriveCoherence(data);
    results.push({ id: sig.id, wave, energy, coherence });
  }

  const eigen = new EigenvalueDecomposition(getFieldMatrix(agentSignals));
  return { results, eigen };
}
