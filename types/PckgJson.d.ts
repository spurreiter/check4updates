export type Packages = {} | Record<string, string>;
/**
 * @typedef {{}|Record<string,string>} Packages
 */
export class PckgJson {
    /**
     * @param {{
     *  dirname?: string
     *  filename?: string
     * }} param0
     */
    constructor({ dirname, filename }?: {
        dirname?: string;
        filename?: string;
    });
    dirname: string;
    filename: string;
    content: any;
    /**
     * @private
     */
    private _setFields;
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
     * @param {{
     *  prod?: boolean
     *  dev?: boolean
     *  peer?: boolean
     * }} opts
     * @returns {Promise<Packages>}
     */
    read(opts?: {
        prod?: boolean;
        dev?: boolean;
        peer?: boolean;
    }): Promise<Packages>;
    fields: string[] | undefined;
    /**
     * @param {Record<string,string>} packages
     * @returns {Promise<void>}
     */
    write(packages?: Record<string, string>): Promise<void>;
}
