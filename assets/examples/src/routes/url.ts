import { Route, URLParser } from "@stricjs/kit";

const url = new URLParser();

export default new Route("static", "/url")
    .handle(req => {
        url.update(req.url);

        return new Response([
            `Scheme: ${url.scheme}`,
            `Host: ${url.host}`,
            `Hostname: ${url.hostname}`,
            `Port: ${url.port}`,
            `Path: ${url.path}`,
            `Query: ${url.query}`,
            `Hash: ${url.hash}`
        ].join("\n"));
    });