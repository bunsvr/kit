import { existsSync, readFileSync } from "fs";
import { Options } from "./types";
import Bun, { ServeOptions } from "bun";
import pathUtils from "path/posix";
import { importAll } from "./utils";
import { Route } from "./route";
import { Router } from "@stricjs/router";
import { App as CoreApp } from "@stricjs/core";
import { stream } from "@stricjs/utils";

export class App {
    /**
     * All parsed options
     */
    readonly options: Options;

    /**
     * Initialize an app
     * @param options a path to a config file
     */
    constructor(options?: string)

    /**
     * Initialize an app
     * @param options a config object
     */
    constructor(options?: Options)

    constructor(options?: string | Options) {
        if (typeof options === "string")
            this.options = JSON.parse(readFileSync(options).toString());
        else if (options)
            this.options = options;

        this.options ||= {};
        this.options.root ||= pathUtils.resolve(".");
        this.options.routes ||= "routes";
        this.options.listen ||= {};

        if (typeof this.options.dev === "undefined")
            this.options.dev = Bun.env.NODE_ENV !== "production";

        const defaultOptFile = pathUtils.join(this.options.root, "stric.config.json");
        if (existsSync(defaultOptFile))
            Object.assign(this.options, JSON.parse(
                readFileSync(defaultOptFile).toString()
            ));
    }

    /**
     * Start the app
     * @returns The server
     */
    async boot() {
        const router = new Router();
        const routes = await importAll(
            pathUtils.join(this.options.root, this.options.routes)
        ) as Route[];

        for (const route of routes)
            route.bind(router);

        const pubDir = this.options.static && pathUtils.join(
            this.options.root,
            this.options.static
        );
        if (!pubDir || !existsSync(pubDir)) {
            const serve: ServeOptions = {
                ...this.options.listen,
                fetch: router.fetch(),
                development: this.options.dev
            }
            return Bun.serve(serve);
        }

        const app = new CoreApp();
        Object.assign(app, this.options.listen);
        app.development = this.options.dev;

        return Bun.serve(
            app
                .use(
                    stream(pathUtils.join(
                        this.options.root,
                        this.options.static
                    ))
                )
                .use(router.fetch())
        );
    }

    /**
     * Create and start an app
     * @param options a config object or a path to the config file
     * @returns The server
     */
    static async boot(options?: string | Options) {
        /** @ts-ignore */
        return new App(options).boot();
    }
}

export { CoreApp, Route };
export { Middleware } from "@stricjs/core";
export * from "@stricjs/router";
export * from "@stricjs/utils";
export * from "./parser";
export * from "./types";