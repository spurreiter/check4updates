export type Packages = import("../types.js").Packages;
export type NpmOptions = import("../types.js").NpmOptions;
export type Result = import("../types.js").Result;
/**
 * @param {NpmOptions} [npmOpts]
 * @returns
 */
export function resolverPrepare(npmOpts?: NpmOptions): Promise<{
    npmOpts: any;
}>;
/**
 * @param {string} pckg
 * @param {string} range
 * @param {{dirname: string, npmOpts: NpmOptions}} param
 * @returns {Promise<Result>}
 */
export function resolver(pckg: string, range: string, { dirname, npmOpts }: {
    dirname: string;
    npmOpts: NpmOptions;
}): Promise<Result>;
/**
 * @param {Result[]} foundPckgVersions
 * @param {string} type
 * @returns {Record<string,Result>}
 */
export function resolverRange(foundPckgVersions: Result[], type: string): Record<string, Result>;
