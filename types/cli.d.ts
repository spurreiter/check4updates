export type Cli = {
    help?: boolean;
    version?: string;
    quiet?: boolean;
    dirname?: string;
    max?: boolean;
    latest?: boolean;
    major?: boolean;
    minor?: boolean;
    patch?: boolean;
    peer?: boolean;
    dev?: boolean;
    prod?: boolean;
    update?: boolean;
    filter?: RegExp;
    filterInv?: RegExp;
    info?: boolean;
    catalog?: boolean;
    _packages: string[] | [];
    include?: string[];
    exclude?: string[];
    progressBar?: (total: any) => any;
    ttyout?: ({ update, info }?: {
        update?: boolean;
        info?: boolean;
    }) => (param0: {
        results: Versions[];
        type?: string;
        name: string;
        version: string;
    }) => string;
};
/**
 * @typedef {{
 *  help?: boolean
 *  version?: string
 *  quiet?: boolean
 *  dirname?: string
 *  max?: boolean
 *  latest?: boolean
 *  major?: boolean
 *  minor?: boolean
 *  patch?: boolean
 *  peer?: boolean
 *  dev?: boolean
 *  prod?: boolean
 *  update?: boolean
 *  filter?: RegExp
 *  filterInv?: RegExp
 *  info?: boolean
 *  catalog?: boolean
 *  _packages: string[]|[]
 *  include?: string[]
 *  exclude?: string[]
 *  progressBar?: progressBar
 *  ttyout?: ttyout
 * }} Cli
 */
/**
 * @param {string[]} argv
 * @returns {Cli}
 */
export function cli(argv?: string[]): Cli;
export namespace cli {
    export { help };
}
declare function help(prgName: any): void;
export {};
