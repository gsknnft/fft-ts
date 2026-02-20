export * from "./dsp";
export * from "./covariance";
export * from "./router";
export * from "./core/fft-base/ffutil";
export {
  default as fft
} from "./core/fft-base/fft";
export {
  FFTProcessor
} from "./core/fft-processor";
export {
  FourierTransform
} from "./core/radix2";
export {
  fourriouoorAny
} from "./fouriouoor";
export * from "./core";
export * from "./compute-fft";
export * from "./utils";

export * from "./dsp";
export * from "./compute-fft";
export * from "./covariance";

export * from "./core/fft-base/ffutil";
export * as Router from "./router";
/*===========================================================================*\
 * Fast Fourier Transform (Cooley-Tukey Method)
 *
 * (c) Vail Systems. Joshua Jung and Ben Bryan. 2015
 *
 * This code is not designed to be highly optimized but as an educational
 * tool to understand the Fast Fourier Transform.
\*===========================================================================*/
//import fft from './core/fft-base/fft';
// import { FFTProcessor } from "./core/fft-processor";
// import * as fftutil from "./core/fft-base/ffutil";
// import { Command } from "commander";
// import * as fs from "fs-extra";
import { ComplexArray } from "./utils/complex";
import { Complex } from "./complex";
export { ComplexArray, Complex };

// const program = new Command();

// program
//   .version("0.0.6")
//   .usage("[options] [signal]")
//   .option("-s, --sample-rate [sampleRate]", "Set sample rate [1000]", "1000");

// program.parse(process.argv);

// const sampleRate = parseFloat(program.opts().sampleRate);

// if (isNaN(sampleRate)) {
//   console.log("Please pass a valid sample rate with the -s option!");
//   program.outputHelp();
//   process.exit(1);
// }

// if (program.args.length < 1) {
//   console.log("Please pass a valid signal file!");
//   program.outputHelp();
//   process.exit(1);
// }

// fs.readFile(program.args[0], "utf8", function (err, data) {
//   if (err) {
//     return console.log(err);
//   }

//   const signal = new Float64Array(data.toString().split(",").map(parseFloat));
//   console.log("Signal: ", signal);

//   const proc = new FFTProcessor(signal);
//   // If NodeFFT is not constructable, remove or replace with appropriate usage:
//   // const processor = new NodeFFT(signal.length);

//   const complexCoef = proc.forward(signal); //This includes coefficients for the negative frequencies, and the Nyquist frequency.
//   console.log("FFT: ", complexCoef);
//   const magnitudes = fftutil.fftMag(complexCoef);
//   console.log("FFT Magnitudes: ", magnitudes);

//   const frequencies = fftutil.fftFreq(complexCoef, sampleRate);
//   console.log("FFT Frequencies: ", frequencies);
// });

// export * from './core/fft-image';

// export * from './oscillator';
// export * from './envelope';
// export * from './biquad';
// export * from './filter';
// export * from './sampler';
