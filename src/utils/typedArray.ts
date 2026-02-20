// Setup arrays for platforms which do not support byte arrays
//@preserve
export function setupTypedArray(name: string, fallback: any) {
  const globalObj = globalThis as any;

  if (typeof globalObj[name] !== "function" && typeof globalObj[name] !== "object") {
    if (typeof globalObj[fallback] === "function" && typeof globalObj[fallback] !== "object") {
      globalObj[name] = globalObj[fallback];
    } else {
      globalObj[name] = function(obj: object) {
        if (Array.isArray(obj)) return obj;
        if (typeof obj === "number") return new Array(obj);
      };
    }
  }
}


setupTypedArray("Float64Array", "WebGLFloatArray");
setupTypedArray("Int32Array",   "WebGLIntArray");
setupTypedArray("Uint16Array",  "WebGLUnsignedShortArray");
setupTypedArray("Uint8Array",   "WebGLUnsignedByteArray");