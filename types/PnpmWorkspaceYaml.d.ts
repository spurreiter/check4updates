export type Packages = {} | Record<string, string>;
export class PnpmWorkspaceYaml {
    /**
     * @param {{
     *  dirname?: string
     *  basename?: string
     * }} param0
     */
    constructor({ dirname, basename }?: {
        dirname?: string;
        basename?: string;
    });
    dirname: string;
    basename: string;
    filename: string;
    content: any;
    _resolveFilename(): Promise<void>;
    /**
     * @private
     */
    private _extract;
    /**
     * @private
     */
    private _merge;
    /**
     * get all files under c4uIgnore
     * @returns {Record<string,string>|undefined}
     */
    getIgnored(): Record<string, string> | undefined;
    /**
     * @returns {Promise<Packages>}
     */
    read(): Promise<Packages>;
    fields: string[] | undefined;
    /**
     * @param {Record<string,string>} packages
     * @returns {Promise<void>}
     */
    write(packages?: Record<string, string>): Promise<void>;
}
