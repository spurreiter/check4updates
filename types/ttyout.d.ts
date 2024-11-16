export type Versions = import("./types.js").Result;
/**
 * @typedef {import('./types.js').Result} Versions
 */
export function progressBar(total: any): any;
export function colorVersion(version: any, range: any, wildcard: string | undefined, ignore: any): string;
/**
 * @param {{update?: boolean, info?: boolean}} param0
 * @returns {(param0: { results: Versions[], type?: string, name: string, version: string }) => string}
 */
export function ttyout({ update, info }?: {
    update?: boolean;
    info?: boolean;
}): (param0: {
    results: Versions[];
    type?: string;
    name: string;
    version: string;
}) => string;
