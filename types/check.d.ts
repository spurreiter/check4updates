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
/**
 * @private
 * @param {{ pckg: PckgJson|PnpmWorkspaceYaml, pnpmWorkspace: PnpmWorkspaceYaml|null, patch?: boolean, minor?: boolean, major?: boolean, max?: boolean }} param0
 * @returns {(results: Result[]) => { results: Result[], packages: Packages, type: 'patch'|'minor'|'major'|'max'|'latest' }}
 */
export function calcRange({ pckg, pnpmWorkspace, patch, minor, major, max }: {
    pckg: PckgJson | PnpmWorkspaceYaml;
    pnpmWorkspace: PnpmWorkspaceYaml | null;
    patch?: boolean;
    minor?: boolean;
    major?: boolean;
    max?: boolean;
}): (results: Result[]) => {
    results: Result[];
    packages: Packages;
    type: "patch" | "minor" | "major" | "max" | "latest";
};
import { PckgJson } from './PckgJson.js';
import { PnpmWorkspaceYaml } from './PnpmWorkspaceYaml.js';
