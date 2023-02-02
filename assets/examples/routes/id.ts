import { Route } from "../../..";

export default new Route("dynamic", "/user/:id")
    .on("GET", req => new Response(req.params[1]));
