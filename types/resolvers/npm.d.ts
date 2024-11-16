export type Result = import("../types.js").Result;
export function prepare(): Promise<any>;
/**
 * @param {string} pckg - package name
 * @returns {Promise<Result>}
 */
export function versions(pckg: string, range: any, opts: any): Promise<Result>;
/**
 * selected range
 * @param {object} versionO
 * @returns {string}
 */
export function range(versionO: object, type: any): string;
