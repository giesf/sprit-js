import { JSONResponse } from "..";
import { html } from "../html";
import { HTMLResponse } from "./HTMLResponse";
import { HTTPError } from "./HTTPError";

export class FancyErrorResponse extends HTMLResponse {
    constructor(err: HTTPError) {
        const svgData = `data:image/svg+xml;utf8,<svg width="150" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="150" height="200" x="0" y="0" fill="yellow" /><polygon points="0,200 75,0 150,0 75,200" fill="black" stroke="none" /></svg>`
        const body = html`
        <style>

            .tape{
                background-image: url('$${svgData}');
                background-size: 32px auto;
                width: 100%;
                min-width: 100%;
                height: 32px;
                min-height: 32px;
            }
        </style>
        <div class="tape"></div>
        <marquee><h1>Error ${err.statusCode.toString()} - ${err.message}</h1></marquee>
        <div class="tape"></div>

        `
        super(body, { status: err.statusCode })
    }
}

export class JSONErrorResponse extends JSONResponse {
    constructor(err: HTTPError) {
        super(err, { status: err.statusCode })
    }
}