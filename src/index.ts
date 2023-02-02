import { existsSync, readFileSync } from "fs";
import { Options } from "./types";
import Bun from "bun";
import pathUtils from "path/posix";
import { importAll } from "./utils";
import { Route } from "./route";
import { Handler, Router } from "@stricjs/router";
import { App, Middleware } from "@stricjs/core";
import { stream } from "@stricjs/utils";

export default class Stric<T = any> {
    /**
     * The Stric app
     */
    readonly app: App<T>;

    /**
     * The Stric router
     */
    readonly router: Router<T>;

    /**
     * All parsed options
     */
    readonly options: Options;

    /**
     * Initialize an app
     * @param options a path to a config file
     */
    constructor(options?: string);

    /**
     * Initialize an app
     * @param options a config object
     */
    constructor(options?: Options);

    constructor(options?: string | Options) {
        // If option is a path
        if (typeof options === "string")
            this.options = JSON.parse(readFileSync(options).toString());
        else if (options)
            this.options = options;

        // Validate all options that are not set
        this.options ||= {};
        this.options.root ||= pathUtils.resolve(".");
        this.options.routes ||= "routes";
        this.options.listen ||= {};
        if (typeof this.options.dev === "undefined")
            this.options.dev = Bun.env.NODE_ENV !== "production";

        // Add options of default config file if found
        const defaultOptFile = pathUtils.join(this.options.root, "stric.config.json");
        if (existsSync(defaultOptFile))
            Object.assign(this.options, JSON.parse(
                readFileSync(defaultOptFile).toString()
            ));

        // Create the app and the router
        this.app = new App<T>();
        this.router = new Router<T>();

        // Check for static serve
        const pubDir = this.options.static && pathUtils.join(
            this.options.root,
            this.options.static
        );
        if (pubDir && existsSync(pubDir))
            this.app.use(stream(pathUtils.join(
                this.options.root,
                this.options.static
            )));

        // Set app options options
        Object.assign(this.app, this.options.listen);
        this.app.development = this.options.dev;
    }

    /**
     * Register a handler for a static path
     * @param path The path
     * @param fn The handler
     */
    static(path: string, fn: Handler<T>): Stric<T>;

    /**
     * Register a handler for a static path of a specific method
     * @param method The target method
     * @param path The path
     * @param fn The handler
     */
    static(method: string, path: string, fn: Handler<T>): Stric<T>;

    static(...args: any[]) {
        /** @ts-ignore */
        this.router.static(...args);
        return this;
    }

    /**
     * Register a handler for a dynamic path
     * @param path The path 
     * @param fn The handler
     */
    dynamic(path: string | RegExp, fn: Handler<T>): Stric<T>;

    /**
     * Register a handler for a dynamic path of a specific method
     * @param method The target method
     * @param path The path
     * @param fn The handler
     */
    dynamic(method: string, path: string | RegExp, fn: Handler<T>): Stric<T>;

    dynamic(...args: any[]) {
        /** @ts-ignore */
        this.router.dynamic(...args);
        return this;
    }

    /**
     * Use some middlewares
     * @param mds 
     */
    use(...mds: Middleware<T>[]) {
        for (const m of mds)
            this.app.use(m);
        return this;
    }

    /**
     * Load all the routes
     */
    async load() {
        // Setup router
        const routes = await importAll(
            pathUtils.join(this.options.root, this.options.routes)
        ) as Route[];
        for (const route of routes)
            route.bind(this.router);

        return this;
    }

    /**
     * Start the app
     * @returns The server
     */
    boot() {
        // Register the router as a middleware
        return Bun.serve(this.app.use(
            this.router.fetch()));
    }

    /**
     * Create and start an app
     * @param options a config object or a path to the config file
     * @returns The server
     */
    static async boot(options?: string | Options) {
        /** @ts-ignore */
        const app = await new Stric(options).load();

        return app.boot();
    }
}

export { Route };
export * from "@stricjs/core";
export * from "@stricjs/router";
export * from "@stricjs/utils";
export * from "./parser";
export * from "./types";