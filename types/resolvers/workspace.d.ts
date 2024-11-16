export type Result = import("../types.js").Result;
/**
 * test for file resolver
 * @param {string} range
 */
export function test(range: string): boolean;
/**
 * get versions by range
 *
 * @param {string} pckg - package name
 * @param {string} range - range value - needs to match `workspace:`
 * @returns {Promise<Result>}
 */
export function versions(pckg: string, range: string): Promise<Result>;
/**
 * return selected range
 * @param {object} versionO
 * @param {string} _type
 * @returns {string}
 */
export function range(versionO: object, _type: string): string;
