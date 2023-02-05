import { Route } from "../../..";

export default new Route("static", "/")
    .handle(() => new Response("Hello"));