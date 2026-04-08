export type DeinterleaveSource =
  | ArrayLike<number>
  | Float32Array
  | Float64Array
  | Int16Array
  | Int32Array
  | Uint8Array
  | Uint16Array
  | Uint32Array;

export type DeinterleaveOptions = {
  channels?: number;
  channel?: number;
  frameCount?: number;
};

function resolveFrameCount(
  inputLength: number,
  channels: number,
  frameCount?: number,
): number {
  if (frameCount == null) {
    return Math.floor(inputLength / channels);
  }

  return Math.max(0, Math.min(frameCount, Math.floor(inputLength / channels)));
}

export function deinterleave(
  input: DeinterleaveSource,
  options: DeinterleaveOptions = {},
): Float64Array[] {
  const channels = Math.max(1, Math.floor(options.channels ?? 2));
  const frames = resolveFrameCount(input.length, channels, options.frameCount);
  const outputs = Array.from(
    { length: channels },
    () => new Float64Array(frames),
  );

  for (let frame = 0; frame < frames; frame += 1) {
    const offset = frame * channels;
    for (let channel = 0; channel < channels; channel += 1) {
      outputs[channel][frame] = input[offset + channel] ?? 0;
    }
  }

  return outputs;
}

export function deinterleaveChannel(
  input: DeinterleaveSource,
  options: DeinterleaveOptions = {},
): Float64Array {
  const channels = Math.max(1, Math.floor(options.channels ?? 2));
  const requestedChannel = Math.max(
    0,
    Math.min(channels - 1, Math.floor(options.channel ?? 0)),
  );
  const frames = resolveFrameCount(input.length, channels, options.frameCount);
  const output = new Float64Array(frames);

  for (let frame = 0; frame < frames; frame += 1) {
    output[frame] = input[frame * channels + requestedChannel] ?? 0;
  }

  return output;
}
