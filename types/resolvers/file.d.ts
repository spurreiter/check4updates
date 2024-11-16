export type Result = import("../types.js").Result;
/**
 * test for file resolver
 * @param {string} range
 */
export function test(range: string): boolean;
/**
 * get versions from path obtained by dirname and range
 * @param {string} pckg - package name
 * @param {string} range - range value - needs to match `file: ... .tgz`
 * @param {object} param2
 * @param {object} param2.dirname - actual dirname of package.json
 * @returns {Promise<Result>}
 */
export function versions(pckg: string, range: string, { dirname }: {
    dirname: object;
}): Promise<Result>;
/**
 * return selected range
 * @param {object} versionO
 * @returns {string}
 */
export function range(versionO: object, type: any): string;
