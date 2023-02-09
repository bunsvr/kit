import { Route } from "../../..";

export default new Route("static", "/home")
    .handle(() => new Response("Hello"));