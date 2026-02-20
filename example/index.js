"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = exports.FFTProcessor = exports.FFT = void 0;
__exportStar(require("./constants"), exports);
__exportStar(require("./core/fft-base"), exports);
__exportStar(require("./utils"), exports);
__exportStar(require("./compute-fft"), exports);
/*===========================================================================*\
 * Fast Fourier Transform (Cooley-Tukey Method)
 *
 * (c) Vail Systems. Joshua Jung and Ben Bryan. 2015
 *
 * This code is not designed to be highly optimized but as an educational
 * tool to understand the Fast Fourier Transform.
\*===========================================================================*/
//import fft from './core/fft-base/fft';
const fft_processor_1 = require("./core/fft-processor");
const fftutil = __importStar(require("./core/fft-base/ffutil"));
const commander_1 = require("commander");
const fs = __importStar(require("fs-extra"));
const program = new commander_1.Command();
program
    .version("0.0.6")
    .usage("[options] [signal]")
    .option("-s, --sample-rate [sampleRate]", "Set sample rate [1000]", "1000");
program.parse(process.argv);
const sampleRate = parseFloat(program.opts().sampleRate);
if (isNaN(sampleRate)) {
    console.log("Please pass a valid sample rate with the -s option!");
    program.outputHelp();
    process.exit(1);
}
if (program.args.length < 1) {
    console.log("Please pass a valid signal file!");
    program.outputHelp();
    process.exit(1);
}
fs.readFile(program.args[0], "utf8", function (err, data) {
    if (err) {
        return console.log(err);
    }
    const signal = new Float64Array(data.toString().split(",").map(parseFloat));
    console.log("Signal: ", signal);
    const proc = new fft_processor_1.FFTProcessor(signal.length);
    // If NodeFFT is not constructable, remove or replace with appropriate usage:
    // const processor = new NodeFFT(signal.length);
    const complexCoef = proc.forward(signal); //This includes coefficients for the negative frequencies, and the Nyquist frequency.
    console.log("FFT: ", complexCoef);
    const magnitudes = fftutil.fftMag(complexCoef);
    console.log("FFT Magnitudes: ", magnitudes);
    const frequencies = fftutil.fftFreq(complexCoef, sampleRate);
    console.log("FFT Frequencies: ", frequencies);
});
var fft_1 = require("./core/fft-base/fft");
Object.defineProperty(exports, "FFT", { enumerable: true, get: function () { return __importDefault(fft_1).default; } });
var fft_processor_2 = require("./core/fft-processor");
Object.defineProperty(exports, "FFTProcessor", { enumerable: true, get: function () { return fft_processor_2.FFTProcessor; } });
__exportStar(require("./constants"), exports);
__exportStar(require("./utils"), exports);
__exportStar(require("./compute-fft"), exports);
__exportStar(require("./core/fft-base/fft"), exports);
__exportStar(require("./utils"), exports);
__exportStar(require("./covariance"), exports);
__exportStar(require("./core/fft-base/ffutil"), exports);
exports.Router = __importStar(require("./router"));
// export * from './core/fft-image';
// export * from './oscillator';
// export * from './envelope';
// export * from './biquad';
// export * from './filter';
// export * from './sampler';
//# sourceMappingURL=index.js.map