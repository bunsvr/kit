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
     * Development mode
     */
    dev?: boolean;
}

export interface ListenOptions {
    port?: number | string;
    hostname?: string;
    baseURI?: string;
}