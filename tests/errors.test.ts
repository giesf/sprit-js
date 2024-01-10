import { describe, expect, test } from 'bun:test';
import { prepareFS } from './fs-utils';
import { startHTTPServer } from '../src/http';
describe("Error communication works as expected", () => {

    test("Internal Error messages are not leaked", async () => {
        const expectedErrorMessage = "This is an error message"
        const routesDir = prepareFS("routes", {
            "throwError.ts": `
                export const get = (req)=>{
                    throw new Error("${expectedErrorMessage}")
                }
            `
        });
        console.log(routesDir)
        const port = 3353;
        const server = startHTTPServer({
            routesDir: routesDir,
            port: port
        });

        const res = await fetch(`http://localhost:${port}/throwError`)
        const resContent = await res.text()

        expect(resContent).not.toContain(expectedErrorMessage)
        expect(resContent).toContain("Internal Server Error")
        expect(resContent).toContain("500")
        server.stop()
    })

    test("Error messages from errors with specific status codes are shared", async () => {
        const expectedErrorMessage = "This is an error message"
        const expectedStatusCode = "401"

        const routesDir = prepareFS("routes", {
            "throwError.ts": `
                export const get = (req)=>{
                    const err = new Error("${expectedErrorMessage}")
                    err.statusCode = ${expectedStatusCode};
                    throw err;
                }
            `
        });

        console.log(routesDir)
        const port = 3354;
        const server = startHTTPServer({
            routesDir: routesDir,
            port: port
        });

        const res = await fetch(`http://localhost:${port}/throwError`)
        const resContent = await res.text()

        expect(resContent).toContain(expectedErrorMessage)
        expect(resContent).toContain(expectedStatusCode)
        server.stop()
    })

});