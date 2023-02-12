import { Route, URLParser } from "@stricjs/kit";

const fields = [{
    name: "Reve",
    id: 1
},
{
    name: "Stric",
    id: 2
}];

export default new Route("static", "/json")
    .on("GET", req => {
        const index = Number(
            new URLSearchParams(
                URLParser.query(req.url)
            )?.get("index") || 0
        );

        // If out of range returns 404
        if (index < 0 || index >= fields.length)
            return;

        // Return the object corresponds to the index
        return Response.json(fields[index]);
    });