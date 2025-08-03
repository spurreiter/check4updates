export type ProgressBar = any;
export type Cli = import("./types.js").Cli;
export type Packages = import("./types.js").Packages;
export type NpmOptions = import("./types.js").NpmOptions;
export type Result = import("./types.js").Result;
/**
 * @param {Cli} [param0]
 * @returns {Promise} `{ results: object, type: string }`
 */
export function check(param0?: Cli): Promise<any>;
