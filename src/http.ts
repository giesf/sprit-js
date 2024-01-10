import type { MatchedRoute } from "bun";
import { parse, safeParse } from 'valibot'
import { HTTPError } from "./res/HTTPError";
import { FancyErrorResponse } from "./res/ErrorResponse";
import { JSONResponse } from "./res/JSONResponse";
export type SimpleGetRequest = Request & { params: MatchedRoute["params"], query: MatchedRoute["query"] }
export type SimplePostRequest = SimpleGetRequest & { jsonBody: any }


export type HTTPServerStartOptions = {
    routesDir?: string,
    staticDir?: string,
    staticRoutePrefix?: string,
    port?: number,
    errorResponseFactory?: (err: HTTPError) => Response,
    inspectOrModifyIncomingRequest?: (req: Request) => Request,
    inspectOrModifyOutgoingResponse?: (res: Response) => Response
}

export const startHTTPServer = (options?: HTTPServerStartOptions) => {

    const router = new Bun.FileSystemRouter({
        style: "nextjs",
        dir: options?.routesDir || "./src/routes",
        origin: Bun.env.ORIGIN || "localhost",
        assetPrefix: Bun.env.ASSET_PREFIX || ""
    });

    const staticRoutePrefix = options?.staticRoutePrefix || "/static"
    const staticDir = options?.staticDir || './static'

    const modifyRequest = (req: Request) => {
        if (options?.inspectOrModifyIncomingRequest) return options.inspectOrModifyIncomingRequest(req)
        return req;
    }
    const modifyResponse = (res: Response) => {
        if (options?.inspectOrModifyOutgoingResponse) return options.inspectOrModifyOutgoingResponse(res);
        return res;
    }


    const server = Bun.serve({
        port: options?.port,
        error(err: any) {
            if (options?.errorResponseFactory) {
                return options.errorResponseFactory(err)
            }

            if (typeof err.statusCode == 'number') {
                return new FancyErrorResponse(err)
            }

            const internalError = new HTTPError(500, "Internal Server Error")
            return new FancyErrorResponse(internalError)
        },
        async fetch(incomingRequest: Request) {
            const req = modifyRequest(incomingRequest) as SimpleGetRequest;

            const url = new URL(req.url);

            if (url.pathname.startsWith(staticRoutePrefix)) {
                const path = staticDir + url.pathname.slice(staticRoutePrefix.length);
                const file = Bun.file(path)

                const isFileExistent = await file.exists()
                if (!isFileExistent) throw new HTTPError(404, "File not Found")


                return new Response(file);
            }


            const match = router.match(url.pathname + url.search)
            console.debug("Route Requested", { match, pathname: url.pathname })

            if (!match) {
                throw new HTTPError(404, "Route not Found")
            }

            const o = await import(match.filePath)

            const { params, query } = match
            console.debug("Query Exctracted", { query })

            req.params = params;
            req.query = query;
            if (req.method == "GET" && typeof o.get == "function") {
                const res = await o.get(req);
                return modifyResponse(res)
            }

            if (req.method == "POST" && typeof o.post == "function") {
                const jsonBody = req.headers.get('Content-Type') == 'application/json' ? await req.json() : {}
                const postReq = req as SimplePostRequest;
                postReq.jsonBody = jsonBody;
                const res = await o.post(req)
                return modifyResponse(res)
            }
            if (req.method == "POST" && typeof o.rpc == "function" && typeof o.params == "object") {
                const jsonBody = req.headers.get('Content-Type') == 'application/json' ? await req.json() : {}
                const rpcParams = parse(o.params, jsonBody)
                const res = new JSONResponse(await o.rpc(rpcParams))
                return modifyResponse(res)
            }

            throw new HTTPError(405, "Method Not Allowed")
        },
    });

    console.log("Server running on port " + (options?.port || Bun.env.PORT || 3000))
    return server;
}