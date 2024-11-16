export type Cli = import("./cli").Cli;
export type Packages = import("./PckgJson").Packages;
export type NpmOptions = object;
export type Result = {
    mode: string;
    package: string;
    range: string;
    _range: string;
    ignore?: boolean;
    wildcard?: string;
    latest?: string;
    max?: string;
    major?: string;
    minor?: string;
    patch?: string;
    final?: string;
    versions?: string[];
    error?: Error;
};
