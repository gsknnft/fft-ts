

////////////////////////////////////////////////////////////////////////////////
//                                  CONSTANTS                                 //
////////////////////////////////////////////////////////////////////////////////
/**
 * DSP is an object which contains general purpose utility functions and constants
 */
export const DSP = {
  // Channels
  LEFT: 0,
  RIGHT: 1,
  MIX: 2,

  // Waveforms
  SINE: 1,
  TRIANGLE: 2,
  SAW: 3,
  SQUARE: 4,

  // Filters
  LOWPASS: 0,
  HIGHPASS: 1,
  BANDPASS: 2,
  NOTCH: 3,

  // Window functions
  BARTLETT: 1,
  BARTLETTHANN: 2,
  BLACKMAN: 3,
  COSINE: 4,
  GAUSS: 5,
  HAMMING: 6,
  HANN: 7,
  LANCZOS: 8,
  RECTANGULAR: 9,
  TRIANGULAR: 10,

  // Loop modes
  OFF: 0,
  FW: 1,
  BW: 2,
  FWBW: 3,

  // Math
  TWO_PI: 2 * Math.PI,
};

export type DSPConst = typeof DSP;
