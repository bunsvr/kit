import { RequestMethod } from "@stricjs/utils";
import { Handler, Router } from "@stricjs/router";

export class Route<T = any> {
    private readonly handlers: {
        [method in RequestMethod | ""]?: Handler<T>
    }

    constructor(type: "static", path: string);
    constructor(type: "dynamic", path: string | RegExp);
    constructor(
        private readonly type: "static" | "dynamic",
        private readonly path: string | RegExp
    ) {
        this.handlers = {};
    };

    /**
     * *Set* a handler of a specific method
     * @param method The request method
     * @param handler The handler
     */
    on(method: RequestMethod | RequestMethod[], handler: Handler<T>) {
        if (!Array.isArray(method))
            method = [method];

        for (const m of method)
            this.handlers[m] = handler;

        return this;
    }

    /**
     * *Set* a handler for all method
     * @param handler 
     */
    handle(handler: Handler<T>) {
        this.handlers[""] = handler;

        return this;
    }

    /**
     * Bind the route with a Stric router
     * @param router 
     */
    bind(router: Router<T>) {
        for (const [key, val] of Object.entries(this.handlers))
            router[this.type](key, this.path as string, val);
    }
}
