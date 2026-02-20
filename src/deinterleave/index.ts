// import {benchDSPJS, benchFourierTransform, benchJensNockert, benchOurFFT} from '../../../../benchmark/bench'

// export async function deinterleave(args: {bufferSize: number, sampleRate: number}) {
// const {bufferSize, sampleRate} = args;
// let buffer1 = new Float32Array(bufferSize);
// let buffer2 = new Float32Array(bufferSize);
// let buffer3 = new Float32Array(bufferSize);
// let buffer4 = new Float32Array(bufferSize);

// for (let i = 0; i < bufferSize; i++) {
//   buffer1[i] = (i % 2 === 0) ? -Math.random() : Math.random();
// }

// for (let i = 0; i < bufferSize; i++) {
//   buffer2[i] = (i % 2 === 0) ? -Math.random() : Math.random();
// }

// for (let i = 0; i < bufferSize; i++) {
//   buffer3[i] = (i % 2 === 0) ? -Math.random() : Math.random();
// }

// for (let i = 0; i < bufferSize; i++) {
//   buffer4[i] = (i % 2 === 0) ? -Math.random() : Math.random();
// }

// let channel;
// let temp;
// const duration = benchFourierTransform(function() { 
//   channel = deinterleave({bufferSize, sampleRate});

//   // cycle buffers
//   temp = buffer1;
//   buffer1 = buffer2;
//   buffer2 = buffer3;
//   buffer3 = buffer4;
//   buffer4 = temp;
// }, 100000);

// console.log("Channel length: " + channel.length);
// console.log("100000 iterations: " + (duration) + " ms (" + ((duration) / 100000) + "ms per iter)\n");

// return {
//     temp
// }
// }