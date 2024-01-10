export class JSONResponse extends Response {
    constructor(
        body: Object,
        options?: ResponseInit,
    ) {
        super(JSON.stringify(body), { ...options, headers: { ...options?.headers, 'Content-Type': 'application/json' } })
    }
}