export type Result = import("../types.js").Result;
/**
 * test for file resolver
 * @param {string} range
 */
export function test(range: string): boolean;
/**
 * get versions from git obtained by range
 * @param {string} pckg - package name
 * @param {string} range - range value - needs to match `file: ... .tgz`
 * @returns {Promise<Result>}
 */
export function versions(pckg: string, range: string): Promise<Result>;
/**
 * return selected range
 * @param {object} versionO
 * @returns {string}
 */
export function range(versionO: object, type: any): string;
/**
 * @private
 */
export function hostedUrl(range: any): any;
export function getSemver(val: any): string;
