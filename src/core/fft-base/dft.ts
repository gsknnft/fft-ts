declare function FFT(size: Float64Array): void;

declare class FFT implements FFT{
    constructor(size: Float64Array);
    size: number;
    table: any[];
    fromComplexArray(complex: any, storage: any): any;
    createComplexArray(): any[];
    toComplexArray(input: any, storage: any): any;
    completeSpectrum(spectrum: any): void;
    transform(out: any, data: any): void;
    realTransform(out: any, data: any): void;
    inverseTransform(out: any, data: any): void;
    transformInverse(out: Float64Array, data: Float64Array): void
}
