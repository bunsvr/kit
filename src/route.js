var Route = /** @class */ (function () {
    function Route(type, path) {
        this.type = type;
        this.path = path;
        this.handlers = {};
    }
    ;
    /**
     * *Set* a handler of a specific method
     * @param method The request method
     * @param handler The handler
     */
    Route.prototype.on = function (method, handler) {
        if (!Array.isArray(method))
            method = [method];
        for (var _i = 0, method_1 = method; _i < method_1.length; _i++) {
            var m = method_1[_i];
            this.handlers[m] = handler;
        }
        return this;
    };
    /**
     * *Set* a handler for all method
     * @param handler
     */
    Route.prototype.handle = function (handler) {
        this.handlers[""] = handler;
        return this;
    };
    /**
     * Bind the route with a Stric router
     * @param router
     */
    Route.prototype.bind = function (router) {
        for (var _i = 0, _a = Object.entries(this.handlers); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], val = _b[1];
            router[this.type](key, this.path, val);
        }
    };
    return Route;
}());
export { Route };
