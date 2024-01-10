export class HTMLResponse extends Response {
    constructor(
        body?:
            | ReadableStream
            | BlobPart
            | BlobPart[]
            | FormData
            | URLSearchParams
            | null,
        options?: ResponseInit,
    ) {
        super(body, { ...options, headers: { ...options?.headers, 'Content-Type': 'text/html' } })
    }
}