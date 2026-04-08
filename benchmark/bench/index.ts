import {
  deinterleave,
  deinterleaveChannel,
} from "../../src/deinterleave";

export function createInterleavedInput(
  frameCount: number,
  channels = 2,
): Float32Array {
  const input = new Float32Array(frameCount * channels);

  for (let frame = 0; frame < frameCount; frame += 1) {
    for (let channel = 0; channel < channels; channel += 1) {
      input[frame * channels + channel] = Math.random() * 2 - 1;
    }
  }

  return input;
}

function bench(fn: () => void, iterations: number): number {
  const startedAt = performance.now();

  for (let i = 0; i < iterations; i += 1) {
    fn();
  }

  return performance.now() - startedAt;
}

export function benchDeinterleave(args: {
  frameCount: number;
  channels?: number;
  iterations?: number;
}) {
  const frameCount = Math.max(1, Math.floor(args.frameCount));
  const channels = Math.max(1, Math.floor(args.channels ?? 2));
  const iterations = Math.max(1, Math.floor(args.iterations ?? 10000));
  const input = createInterleavedInput(frameCount, channels);

  let result = deinterleave(input, { channels });
  const duration = bench(() => {
    result = deinterleave(input, { channels });
  }, iterations);

  return {
    durationMs: duration,
    iterations,
    channels,
    frameCount,
    outputFrames: result[0]?.length ?? 0,
    perIterationMs: duration / iterations,
  };
}

export function benchDeinterleaveChannel(args: {
  frameCount: number;
  channels?: number;
  channel?: number;
  iterations?: number;
}) {
  const frameCount = Math.max(1, Math.floor(args.frameCount));
  const channels = Math.max(1, Math.floor(args.channels ?? 2));
  const channel = Math.max(0, Math.floor(args.channel ?? 0));
  const iterations = Math.max(1, Math.floor(args.iterations ?? 10000));
  const input = createInterleavedInput(frameCount, channels);

  let result = deinterleaveChannel(input, { channels, channel });
  const duration = bench(() => {
    result = deinterleaveChannel(input, { channels, channel });
  }, iterations);

  return {
    durationMs: duration,
    iterations,
    channels,
    channel,
    frameCount,
    outputFrames: result.length,
    perIterationMs: duration / iterations,
  };
}
