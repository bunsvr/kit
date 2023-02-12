import { Route } from "@stricjs/kit";

export default new Route("dynamic", "/user/:id")
    .on("GET", req => new Response(req.params.groups.id));
