var path = /(?:\w+:)?\/\/[^\/]+([^?]+)/;
var query = /\?(.*)/;
var URLParser = /** @class */ (function () {
    function URLParser() {
    }
    /**
     * Get path from url
     * @param url
     */
    URLParser.path = function (url) {
        return path.exec(url)[1];
    };
    /**
     * Get query from url
     * @param url
     */
    URLParser.query = function (url) {
        var q = query.exec(url);
        return q && new URLSearchParams(q[1]);
    };
    return URLParser;
}());
export { URLParser };
