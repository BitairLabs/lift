import { formatString } from '../common/util.js';
export class LiftError extends Error {
    code;
    constructor({ code, text }, ...params) {
        const message = formatString(`[Lift Error]: ${text}`, ...params);
        super(message);
        this.code = code;
    }
}
