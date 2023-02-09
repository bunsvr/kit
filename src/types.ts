import { BuildOptions } from "esbuild";

export interface Options {
    /**
     * The project root
     */
    root?: string;

    /**
     * Where all routes are located
     * @default "routes"
     */
    routes?: string;

    /**
     * Where all static files are located
     * @default "public"
     */
    static?: string;

    /**
     * Server listen options
     */
    listen?: ListenOptions;

    /**
     * All pages
     */
    page?: {
        /**
         * Pages root
         */
        src?: string;

        /**
         * Page list
         */
        list?: PageOptions[];

        /**
         * All build options
         */
        build?: BuildOptions;
    };

    /**
     * Development mode
     */
    dev?: boolean;
}

export interface PageOptions {
    /**
     * Path to handle
     */
    path: string | RegExp;

    /**
     * Relative path from page src
     */
    source: string;

    /**
     * Route type. Defaults to static
     */
    type?: "static" | "dynamic";

    /**
     * Enable server-side rendering
     */
    ssr?: boolean;
}

export interface ListenOptions {
    port?: number | string;
    hostname?: string;
    baseURI?: string;
}