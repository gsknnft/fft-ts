import { EigenvalueDecomposition } from "ml-matrix";
import wt from "discrete-wavelets";
import {FFTProcessor} from "./core/fft-processor";

export type RouteResult = {
    id: any;
    wave: number[][];
    energy: number;
    coherence: any;
}

// Example: fieldMatrix is NxN array of cross-phase correlations
export function getFieldMatrix(signals: { phase: number }[]): number[][] {
  return signals.map((s1) =>
    signals.map((s2) => Math.cos(s1.phase - s2.phase))
  );
}

export function scanWaveletRouting(agentSignals: any): {results: RouteResult[]; eigen: EigenvalueDecomposition} {
  const results: {
    id: any;
    wave: number[][];
    energy: number;
    coherence: any;
  }[] = [];
  const fft = new FFTProcessor(agentSignals);
  for (let sig of agentSignals) {
    const wave = wt.wavedec(sig.data, "db2", "symmetric", 3);
    const energy = wt.energy(wave);
    const coherence = fft.deriveCoherence(sig.data);
    results.push({ id: sig.id, wave, energy, coherence });
  }
  const eigen = new EigenvalueDecomposition(getFieldMatrix(agentSignals));
  console.log("Eigenvalues:", eigen.realEigenvalues);
  console.log("Eigenvectors:", eigen.eigenvectorMatrix.to2DArray());
  return {results, eigen};
}


// Eigen decomposition: reveal "principal field directions"
// const fieldMatrix = getFieldMatrix([
//   { phase: 0 },
//   { phase: Math.PI / 4 },
//   { phase: Math.PI / 2 },
//   { phase: (3 * Math.PI) / 4 },
//   { phase: Math.PI },
// ]);

