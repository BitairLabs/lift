export declare class LiftError extends Error {
    code: number;
    constructor({ code, text }: {
        code: number;
        text: string;
    }, ...params: unknown[]);
}
