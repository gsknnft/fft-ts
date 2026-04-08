export type ComplexLike = {
  real: number;
  imag: number;
};

export type FFTDirection = "forward" | "inverse";

export type InterleavedComplexArray = ArrayLike<number>;

export type SpectrumBin = {
  index: number;
  frequency?: number;
  magnitude: number;
  phase?: number;
  real?: number;
  imag?: number;
};

export type FFTResult = {
  direction: FFTDirection;
  size: number;
  spectrum: Float64Array;
};

export type AmplitudeEvent = {
  amplitude: number;
};

export type SignalEvent = AmplitudeEvent & {
  timestamp?: number;
  frequency?: number;
  phase?: number;
};

export type AnyEvent = Record<string, unknown> & {
  amplitude: number;
};

export type DeinterleaveResult = {
  channels: Float64Array[];
  frames: number;
};
