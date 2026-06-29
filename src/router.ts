import { EigenvalueDecomposition } from "ml-matrix";
import wt from "discrete-wavelets";
import { FFTProcessor } from "./core/fft-processor";

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

export function scanWaveletRouting(agentSignals: RouteSignal[]): {
  results: RouteResult[];
  eigen: EigenvalueDecomposition;
} {
  const results: RouteResult[] = [];

  for (const sig of agentSignals) {
    const data = Float64Array.from(Array.from(sig.data));
    const fft = new FFTProcessor(data);
    const wave = wt.wavedec(Array.from(data), "db2", "symmetric", 3);
    const energy = wt.energy(wave);
    const coherence = fft.deriveCoherence(data);
    results.push({ id: sig.id, wave, energy, coherence });
  }

  const eigen = new EigenvalueDecomposition(getFieldMatrix(agentSignals));
  return { results, eigen };
}
