import { expect, test, describe } from "bun:test";
import { startHTTPServer } from "../src/http";
import { prepareFS } from "./fs-utils";
import { JSONResponse } from "../src/res/JSONResponse";

describe("RPC integration works as expected", () => {


    test("Simple RPC request is handled", async () => {
        const expectedText = "Hello, World!"
        const routesDir = prepareFS("routes", {
            "postRoute.ts": `
                import { Output, length, maxLength, minLength, startsWith, object, parse, string } from "../valibot";

                export const params = object({
                    message: string([minLength(3, "Message must be at least 3 characters long"), startsWith("Hello", "Message should start with Hello")])
                })
                
                export type Params = Output<typeof params>;

                export const rpc = (rpcParams: Params)=>{
                    const {message} = rpcParams;
                    return {message};
                }
                `
        });
        console.log(routesDir)
        const port = 3366;
        const server = startHTTPServer({
            routesDir: routesDir,
            port: port,
            errorResponseFactory: (err) => {
                return new JSONResponse({ err })
            }
        });

        const res = await fetch(`http://localhost:${port}/postRoute`, {
            method: "POST",
            body: JSON.stringify({ message: expectedText }),
            headers: {
                "Content-Type": "application/json",
            }
        })
        const resContent: any = await res.json()

        expect(resContent.message).toInclude(expectedText)


        const res2 = await fetch(`http://localhost:${port}/postRoute`, {
            method: "POST",
            body: JSON.stringify({ message: "" }),
            headers: {
                "Content-Type": "application/json",
            }
        })
        const res2Content: any = await res2.json()
        expect(res2Content.err).toBeDefined()
        server.stop()
    })

})
