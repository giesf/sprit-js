import { describe, expect, test } from 'bun:test';
import { prepareFS } from './fs-utils';
import { startHTTPServer } from '../src/http';
describe("Middleware works as expected", () => {

    test("Request middleware works", async () => {
        const expectedMessage = "This is a message"
        const routesDir = prepareFS("routes", {
            "testMW.ts": `
                export const get = (req)=>{
                    return new Response(req.msg)
                }
            `
        });
        console.log(routesDir)

        const port = 3363;
        const server = startHTTPServer({
            routesDir: routesDir,
            port: port,
            inspectOrModifyIncomingRequest: (req: any) => {
                req.msg = expectedMessage
                return req
            }
        });

        const res = await fetch(`http://localhost:${port}/testMW`)
        const resContent = await res.text()

        expect(resContent).toContain(expectedMessage)

        server.stop()
    })

    test("Response middleware works", async () => {
        const expectedMessage = "This is a message"
        const routesDir = prepareFS("routes", {
            "testMW.ts": `
                export const get = (req)=>{
                    return new Response("Hello, World")
                }
            `
        });
        console.log(routesDir)

        const port = 3364;
        const server = startHTTPServer({
            routesDir: routesDir,
            port: port,
            inspectOrModifyOutgoingResponse: (res) => {
                return new Response(expectedMessage)
            }
        });

        const res = await fetch(`http://localhost:${port}/testMW`)
        const resContent = await res.text()

        expect(resContent).toContain(expectedMessage)

        server.stop()
    })
});