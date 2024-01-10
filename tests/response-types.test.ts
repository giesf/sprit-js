import { describe, expect, test } from "bun:test";
import { HTMLResponse } from "../src/res/HTMLResponse";
import { JSONResponse } from "../src/res/JSONResponse";

describe("The response types work like expected", () => {

    test("HTMLResponse sets headers correctly", async () => {
        const htmlContent = `<h1>Hello, world</h1>`
        const res = new HTMLResponse(htmlContent)

        expect(await res.text()).toBe(htmlContent)
        expect(res.headers.get('Content-Type')).toBe("text/html")
    })

    test("JSONResponse sets headers correctly", async () => {
        const jsonObj = { foo: 'bar' }
        const res = new JSONResponse(jsonObj)

        expect(await res.text()).toBe(JSON.stringify(jsonObj))
        expect(res.headers.get('Content-Type')).toBe("application/json")
    })
})