import { existsSync, readFileSync } from "fs";
import { Options } from "./types";
import { Server } from "bun";
import pathUtils from "path/posix";
import { importAll } from "./utils";
import { Route } from "./route";
import { Handler, Router } from "@stricjs/router";
import { App, Middleware } from "@stricjs/core";
import { stream } from "@stricjs/utils";
import { PageRouter } from "@stricjs/pages";
import { PageRouter as ReactRouter } from "@stricjs/jsx";

export default class Stric<T = any, Page extends PageRouter<T> = ReactRouter<T>> {
    /**
     * Page router
     */
    pages: Page;

    /**
     * The Stric app
     */
    readonly app: App<T>;

    /**
     * The Stric router
     */
    router: Router<T>;

    /**
     * All parsed options
     */
    readonly options: Options;

    /**
     * Initialize a router
     * @param page a page router
     */
    constructor(page?: Page);

    /**
     * Initialize an app
     * @param options a path to a config file
     * @param page a page router
     */
    constructor(options: string, page?: Page);

    /**
     * Initialize an app
     * @param options a config object
     */
    constructor(options: Options, page?: Page);

    constructor(options?: string | Options | Page, page?: Page) {
        // If option is a path
        if (typeof options === "string")
            this.options = JSON.parse(readFileSync(options).toString());
        else if (options instanceof PageRouter<T>)
            page = options;
        else if (options)
            this.options = options;

        // Set all options that are not set
        this.options ||= {};
        this.options.root ||= pathUtils.resolve(".");
        this.options.routes ||= "routes";
        this.options.listen ||= {};
        this.options.page ||= {};
        if (typeof this.options.dev === "undefined")
            this.options.dev = Bun.env.NODE_ENV !== "production";

        // Add options of default config file if found
        const defaultOptFile = pathUtils.join(this.options.root, "stric.config.json");
        if (existsSync(defaultOptFile))
            Object.assign(this.options, JSON.parse(
                readFileSync(defaultOptFile).toString()
            ));

        // Create the app and the routers
        this.app = new App<T>();
        this.router = new Router<T>();

        // Adding pages
        if (page instanceof PageRouter<T>) {
            this.pages = page
                .set("src", this.options.page.src || "pages")
                .set("dev", this.options.dev)
                .set("root", this.options.root);

            if (this.options.page.list?.length > 0) {
                this.hasPage = true;
                for (const page of this.options.page.list || [])
                    this.pages[page.type || "static"](page.path as string, page.source, page.ssr);
            }
        }

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
    static(path: string, fn: Handler<T>): this;

    /**
     * Register a handler for a static path of a specific method
     * @param method The target method
     * @param path The path
     * @param fn The handler
     */
    static(method: string, path: string, fn: Handler<T>): this;

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
    dynamic(path: string | RegExp, fn: Handler<T>): this;

    /**
     * Register a handler for a dynamic path of a specific method
     * @param method The target method
     * @param path The path
     * @param fn The handler
     */
    dynamic(method: string, path: string | RegExp, fn: Handler<T>): this;

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
     * Serve a static page
     * @param type 
     * @param path 
     * @param source 
     */
    page(type: "static", path: string, source: string, ssr?: boolean): this;

    /**
     * Serve a dynamic page
     * @param type 
     * @param path 
     * @param source 
     */
    page(type: "dynamic", path: string | RegExp, source: string, ssr?: boolean): this;
    page(...args: ["static", string, string, boolean?] | ["dynamic", string | RegExp, string, boolean?]) {
        if (!this.pages)
            throw new Error("Need a page router");

        /** @ts-ignore */
        this.pages[args[0]](args.slice(1));
        this.hasPage = true;

        return this;
    }

    /**
     * Load all the routes
     */
    async load() {
        // Setup router
        let routes = await importAll(
            pathUtils.join(this.options.root, this.options.routes)
        ) as Route[];

        // Remove router if not needed
        if (routes.length > 0)
            this.hasRoute = true;

        for (const route of routes)
            route.bind(this.router);

        // Setup page router
        await this.pages?.load();

        return this;
    }

    private hasRoute: boolean;
    private hasPage: boolean;

    /**
     * Start the app
     * @returns The server
     */
    boot(): Server {
        this.hasRoute && this.app.use(this.router.fetch());
        this.hasPage && this.app.use(this.pages.fetch());

        // Register the router as a middleware
        return Bun.serve(this.app);
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
export * from "./types";