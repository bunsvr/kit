import { Route } from "@stricjs/kit";

export default new Route("static", "/home")
    .handle(() => new Response("Hello"));