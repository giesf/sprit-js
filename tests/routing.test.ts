import { expect, test, describe } from "bun:test";
import { startHTTPServer } from "../src/http";
import { prepareFS } from "./fs-utils";

describe("FS routing works as expected", () => {
    test("Simple GET request is handled", async () => {
        const expectedText = "Hello, World!"
        const routesDir = prepareFS("routes", {
            "getRoute.ts": `
                export const get = (req)=>new Response("${expectedText}");
            `
        });
        console.log(routesDir)
        const port = 3333;
        const server = startHTTPServer({
            routesDir: routesDir,
            port: port
        });

        const res = await fetch(`http://localhost:${port}/getRoute`)
        const resContent = await res.text()

        expect(resContent).toBe(expectedText)
        server.stop()
    })

    test("Multiple GET routes, request is handled", async () => {
        const expectedText = "Hello, World!"
        const expectedText2 = "Hello, World XOXO!"

        const routesDir = prepareFS("routes", {
            "getRoute.ts": `
                export const get = (req)=>new Response("${expectedText}");
            `,
            "getAnotherRoute.ts": `
                export const get = (req)=>new Response("${expectedText2}");
            `
        });
        console.log(routesDir)
        const port = 3334;
        const server = startHTTPServer({
            routesDir: routesDir,
            port: port
        });

        const res = await fetch(`http://localhost:${port}/getRoute`)
        const resContent = await res.text()
        expect(resContent).toBe(expectedText)

        const res2 = await fetch(`http://localhost:${port}/getAnotherRoute`)
        const res2Content = await res2.text()
        expect(res2Content).toBe(expectedText2)


        server.stop()
    })

    test("GET request with params is handled", async () => {
        const bar = "miau"
        const routesDir = prepareFS("routes", {
            "foo/[bar].ts": `
                export const get = (req)=>new Response(req.params.bar);
            `
        });
        console.log(routesDir)
        const port = 3335;
        const server = startHTTPServer({
            routesDir: routesDir,
            port: port
        });

        const res = await fetch(`http://localhost:${port}/foo/${bar}`)
        const resContent = await res.text()

        expect(resContent).toBe(bar)
        server.stop()
    })

    test("GET request with query is handled", async () => {
        const bar = "miau"
        const foo = "woof"
        const routesDir = prepareFS("routes", {
            "query.ts": `
                export const get = (req)=>new Response(req.query.bar + req.query.foo);
            `
        });
        console.log(routesDir)
        const port = 3339;
        const server = startHTTPServer({
            routesDir: routesDir,
            port: port
        });

        const res = await fetch(`http://localhost:${port}/query?bar=${bar}&foo=${foo}`)
        const resContent = await res.text()

        expect(resContent).toBe(bar + foo)
        server.stop()
    })

    test("Simple POST request is handled", async () => {
        const expectedText = "Hello, World!"
        const routesDir = prepareFS("routes", {
            "postRoute.ts": `
                export const post = (req)=>new Response("${expectedText}");
            `
        });
        console.log(routesDir)
        const port = 3336;
        const server = startHTTPServer({
            routesDir: routesDir,
            port: port
        });

        const res = await fetch(`http://localhost:${port}/postRoute`, { method: "POST" })
        const resContent = await res.text()

        expect(resContent).toBe(expectedText)
        server.stop()
    })

    test("POST request with JSON Body is handled", async () => {
        const expectedText = "Hello, World!"
        const routesDir = prepareFS("routes", {
            "postRoute.ts": `
                export const post = (req)=>new Response(req.jsonBody.expectedText);
            `
        });
        console.log(routesDir)
        const port = 3337;
        const server = startHTTPServer({
            routesDir: routesDir,
            port: port
        });

        const res = await fetch(`http://localhost:${port}/postRoute`, {
            method: "POST",
            body: JSON.stringify({ expectedText }),
            headers: {
                "Content-Type": "application/json",
            }
        })
        const resContent = await res.text()

        expect(resContent).toBe(expectedText)
        server.stop()
    })

})




describe("Static routing works as expected", () => {
    test("Simple Text File request is handled", async () => {
        const expectedText = "Hello, World!"
        const staticDir = prepareFS("static", {
            "info.txt": expectedText
        });
        const port = 3344;
        const server = startHTTPServer({
            routesDir: staticDir,
            staticDir: staticDir,
            port: port
        });

        const res = await fetch(`http://localhost:${port}/static/info.txt`)
        const resContent = await res.text()

        expect(resContent).toBe(expectedText)
        server.stop()
    })
    test("Multiple Text File requests are handled", async () => {
        const expectedText = "Hello, World!"
        const expectedText2 = "Hello, World! XOXO"
        const staticDir = prepareFS("static", {
            "info.txt": expectedText,
            "info2.txt": expectedText2,
        });
        const port = 3345;
        const server = startHTTPServer({
            routesDir: staticDir,
            staticDir: staticDir,
            port: port
        });

        const res = await fetch(`http://localhost:${port}/static/info.txt`)
        const resContent = await res.text()

        expect(resContent).toBe(expectedText)


        const res2 = await fetch(`http://localhost:${port}/static/info2.txt`)
        const resContent2 = await res2.text()

        expect(resContent2).toBe(expectedText2)
        server.stop()
    })

    test("Alternate static url pathname works", async () => {
        const expectedText = "Hello, World!"
        const staticDir = prepareFS("static", {
            "info.txt": expectedText
        });
        const port = 3346;
        const server = startHTTPServer({
            routesDir: staticDir,
            staticDir: staticDir,
            staticRoutePrefix: '/public',
            port: port
        });

        const res = await fetch(`http://localhost:${port}/public/info.txt`)
        const resContent = await res.text()

        expect(resContent).toBe(expectedText)
        server.stop()
    })
})